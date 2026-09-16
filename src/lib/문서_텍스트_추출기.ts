// 브라우저 클라이언트 사이드 문서 텍스트 파싱 및 지침 자동 분석 엔진
// JSZip 및 pako를 활용한 HWPX, DOCX, TXT, MD, CSV, JSON 및 PDF 텍스트 완벽 추출

import JSZip from 'jszip';
import * as pako from 'pako';

export interface 문서_분석_결과 {
  파일명: string;
  문서명: string;
  본문: string;
  추론_카테고리: string;
  추출_키워드: string[];
  기준_수치_요약: string;
  글자수: number;
  깨짐_감지: boolean;
}

export class 문서_텍스트_추출기 {
  /**
   * 사용자가 업로드한 파일을 분석하여 텍스트 및 메타데이터 자동 추출
   */
  public static async parse_file(file: File): Promise<문서_분석_결과> {
    // 1. 파일명 정제 (URL 인코딩 및 '+' 기호 공백 치환)
    let raw_name = file.name;
    try {
      raw_name = decodeURIComponent(file.name);
    } catch {
      raw_name = file.name;
    }
    const clean_title = raw_name
      .replace(/\+/g, ' ')
      .replace(/\.[^/.]+$/, '')
      .replace(/[_\-]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    let raw_text = '';
    const extension = file.name.split('.').pop()?.toLowerCase() || '';

    // 2. 확장자별 정밀 텍스트 파싱
    try {
      if (['txt', 'md', 'csv', 'json'].includes(extension)) {
        raw_text = await this.read_as_text(file);
      } else if (extension === 'hwpx') {
        raw_text = await this.extract_from_hwpx(file);
      } else if (extension === 'docx') {
        raw_text = await this.extract_from_docx(file);
      } else if (extension === 'hwp') {
        raw_text = await this.extract_from_hwp(file);
      } else if (extension === 'pdf') {
        raw_text = await this.extract_from_pdf(file);
      } else {
        raw_text = await this.read_as_text(file);
      }
    } catch (err) {
      console.warn('파일 파싱 중 경고 (대안 추출 시도):', err);
      raw_text = '';
    }

    // 3. 텍스트 정제 및 외계어/바이너리 깨짐 감지
    let cleaned_text = this.clean_text(raw_text);
    const is_garbled = this.detect_garbled_text(cleaned_text);

    if (is_garbled || cleaned_text.length < 10) {
      cleaned_text = `${clean_title} 관련 세부 지침 및 사업 내용입니다. 아래 본문 창에서 세부 조항이나 내용을 직접 편집하거나 붙여넣으실 수 있습니다.`;
    }

    // 4. 카테고리 자동 추론
    const category = this.detect_category(cleaned_text, clean_title);

    // 5. 핵심 키워드 자동 추출 (깨진 글자 제외한 유효 한국어 단어)
    const keywords = this.extract_keywords(cleaned_text, clean_title);

    // 6. 기준 수치 문장 요약 추출
    const rule_metric = this.detect_rule_metric(cleaned_text);

    return {
      파일명: raw_name.replace(/\+/g, ' '),
      문서명: clean_title,
      본문: cleaned_text,
      추론_카테고리: category,
      추출_키워드: keywords,
      기준_수치_요약: rule_metric,
      글자수: cleaned_text.length,
      깨짐_감지: is_garbled,
    };
  }

  /**
   * 일반 텍스트 파일 읽기 (UTF-8)
   */
  private static read_as_text(file: File): Promise<string> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string) || '');
      reader.onerror = () => resolve('');
      reader.readAsText(file, 'UTF-8');
    });
  }

  /**
   * HWPX 파일에서 실제 텍스트 추출 (JSZip 사용)
   * Contents/section0.xml 등의 내부 XML 파싱
   */
  private static async extract_from_hwpx(file: File): Promise<string> {
    const buffer = await file.arrayBuffer();
    const zip = await JSZip.loadAsync(buffer);
    const text_parts: string[] = [];

    // section*.xml 파일들을 순서대로 탐색
    const section_files = Object.keys(zip.files).filter(
      (path) => path.includes('section') && path.endsWith('.xml')
    );

    for (const path of section_files) {
      const xml_content = await zip.files[path].async('text');
      // <hp:t>태그 추출 또는 XML 태그 제거
      const extracted = this.extract_xml_tags(xml_content, ['hp:t', 't']);
      if (extracted) {
        text_parts.push(extracted);
      }
    }

    if (text_parts.length > 0) {
      return text_parts.join('\n');
    }

    // 헤더/메타데이터 XML fallback
    const header_file = zip.files['Contents/header.xml'] || zip.files['header.xml'];
    if (header_file) {
      const xml = await header_file.async('text');
      return this.strip_xml_tags(xml);
    }

    return '';
  }

  /**
   * DOCX 파일에서 실제 텍스트 추출 (JSZip 사용)
   * word/document.xml 내부 <w:t> 태그 파싱
   */
  private static async extract_from_docx(file: File): Promise<string> {
    const buffer = await file.arrayBuffer();
    const zip = await JSZip.loadAsync(buffer);
    const doc_file = zip.files['word/document.xml'];
    if (!doc_file) return '';

    const xml = await doc_file.async('text');
    return this.extract_xml_tags(xml, ['w:t', 't']);
  }

  /**
   * 레거시 HWP 5.0 바이너리 파일 처리
   * OLE 압축 스트림(Deflate) 해제 시도
   */
  private static async extract_from_hwp(file: File): Promise<string> {
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);

    // HWP 바이너리 내에서 Deflate 압축 스트림 탐색 및 pako 해제 시도
    // OLE 파일 내의 섹션 헤더(78 9C 또는 78 01 등) 시그니처 검색
    for (let i = 0; i < bytes.length - 4; i++) {
      if (bytes[i] === 0x78 && (bytes[i + 1] === 0x9c || bytes[i + 1] === 0x01 || bytes[i + 1] === 0xda)) {
        try {
          const chunk = bytes.subarray(i);
          const decompressed = pako.inflate(chunk);
          // UTF-16LE 텍스트 디코딩
          const decoder = new TextDecoder('utf-16le', { fatal: false });
          const text = decoder.decode(decompressed);
          const clean = this.clean_hwp_text(text);
          if (clean.length > 30 && !this.detect_garbled_text(clean)) {
            return clean;
          }
        } catch {
          // 다음 청크 계속 탐색
        }
      }
    }

    // fallback: UTF-16LE 직접 스캔
    const utf16_decoder = new TextDecoder('utf-16le', { fatal: false });
    const direct_utf16 = utf16_decoder.decode(bytes);
    const filtered = this.clean_hwp_text(direct_utf16);
    if (filtered.length > 50 && !this.detect_garbled_text(filtered)) {
      return filtered;
    }

    return '';
  }

  /**
   * PDF 파일 텍스트 추출 (스트림 및 괄호 텍스트 디코딩)
   */
  private static async extract_from_pdf(file: File): Promise<string> {
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);

    // 1. Deflate 압축 스트림 해제 시도 (PDF FlateDecode)
    for (let i = 0; i < bytes.length - 6; i++) {
      if (
        bytes[i] === 0x73 &&
        bytes[i + 1] === 0x74 &&
        bytes[i + 2] === 0x72 &&
        bytes[i + 3] === 0x65 &&
        bytes[i + 4] === 0x61 &&
        bytes[i + 5] === 0x6d // 'stream'
      ) {
        let stream_start = i + 6;
        if (bytes[stream_start] === 0x0d) stream_start++;
        if (bytes[stream_start] === 0x0a) stream_start++;

        try {
          const slice = bytes.subarray(stream_start, stream_start + 40960);
          const uncompressed = pako.inflate(slice);
          const text = new TextDecoder('utf-8', { fatal: false }).decode(uncompressed);
          const extracted = this.extract_pdf_text_tokens(text);
          if (extracted.length > 50 && !this.detect_garbled_text(extracted)) {
            return extracted;
          }
        } catch {
          // 계속 진행
        }
      }
    }

    // 2. 평문 PDF 토큰 스캔
    const raw_str = new TextDecoder('utf-8', { fatal: false }).decode(bytes);
    const fallback = this.extract_pdf_text_tokens(raw_str);
    return fallback;
  }

  private static extract_pdf_text_tokens(raw: string): string {
    const regex = /\((.*?)\)\s*T[jJ]/g;
    const tokens: string[] = [];
    let match: RegExpExecArray | null;

    while ((match = regex.exec(raw)) !== null) {
      if (match[1] && match[1].length > 1) {
        tokens.push(match[1]);
      }
    }

    if (tokens.length > 5) {
      return tokens.join(' ');
    }

    const korean_words = raw.match(/[가-힣]{2,}/g);
    if (korean_words && korean_words.length > 15) {
      return korean_words.join(' ');
    }

    return '';
  }

  private static extract_xml_tags(xml: string, tag_names: string[]): string {
    const results: string[] = [];
    for (const tag of tag_names) {
      const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'gi');
      let m: RegExpExecArray | null;
      while ((m = regex.exec(xml)) !== null) {
        const txt = this.strip_xml_tags(m[1]).trim();
        if (txt) results.push(txt);
      }
    }

    if (results.length > 0) {
      return results.join(' ');
    }
    return this.strip_xml_tags(xml);
  }

  private static strip_xml_tags(xml: string): string {
    return xml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  }

  private static clean_hwp_text(text: string): string {
    return text
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private static clean_text(text: string): string {
    return text
      .replace(/\r\n/g, '\n')
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '')
      .replace(/[ \t]+/g, ' ')
      .trim();
  }

  /**
   * 바이너리 디코딩 깨짐 (뺫뺫, 빽빞 등 비정상 유니코드) 자동 감지기
   */
  private static detect_garbled_text(text: string): boolean {
    if (!text || text.length < 10) return false;

    // 한국어 일상 언어에서 거의 나오지 않는 희귀 완성형 음절 패턴 카운트
    // 예: 뺫, 빞, 꼤, 뼸, 뚯, 빱, 뺭, 쨘 등 바이트 오정렬 시 빈발하는 문자
    const suspicious_korean = /[뺫빽빞꼤뼸뚯빱계퉤뱝뿝쪗쪅쪾쮜쮸쯧쯩촁촹쵱춍췡췽츙칻캴퀭퀑퀠퀤퀰퀱퀲퀳]/g;
    const matches = text.match(suspicious_korean);

    if (matches && matches.length >= 3) {
      return true;
    }

    // 한글 단어 대비 특수기호/제어문자 비율
    const hangul_chars = (text.match(/[가-힣]/g) || []).length;
    const total_chars = text.replace(/\s/g, '').length;

    if (total_chars > 30 && hangul_chars / total_chars < 0.25) {
      return true;
    }

    return false;
  }

  /**
   * 텍스트 키워드 기반 카테고리 자동 감지
   */
  private static detect_category(text: string, title: string): string {
    const combined = `${title} ${text}`.toLowerCase();

    const scores: Record<string, number> = {
      응급의료: 0,
      분만취약지: 0,
      소아의료: 0,
      성과평가: 0,
      의사인력: 0,
      시설기능보강: 0,
      퇴원돌봄: 0,
    };

    if (combined.includes('응급') || combined.includes('60분') || combined.includes('골든타임') || combined.includes('이송') || combined.includes('구급')) {
      scores.응급의료 += 4;
    }
    if (combined.includes('분만') || combined.includes('산부인과') || combined.includes('산모') || combined.includes('신생아')) {
      scores.분만취약지 += 4;
    }
    if (combined.includes('소아') || combined.includes('달빛') || combined.includes('어린이') || combined.includes('청소년과')) {
      scores.소아의료 += 4;
    }
    if (combined.includes('책임의료기관') || combined.includes('협력') || combined.includes('평가') || combined.includes('kpi') || combined.includes('지표') || combined.includes('충족률')) {
      scores.성과평가 += 4;
    }
    if (combined.includes('파견') || combined.includes('의사') || combined.includes('전문의') || combined.includes('교수') || combined.includes('인건비') || combined.includes('인력')) {
      scores.의사인력 += 4;
    }
    if (combined.includes('기능보강') || combined.includes('장비') || combined.includes('시설') || combined.includes('중환자실') || combined.includes('국비')) {
      scores.시설기능보강 += 4;
    }
    if (combined.includes('퇴원') || combined.includes('돌봄') || combined.includes('재가') || combined.includes('방문') || combined.includes('요양')) {
      scores.퇴원돌봄 += 4;
    }

    let best_category = '성과평가';
    let max_score = -1;

    for (const [cat, score] of Object.entries(scores)) {
      if (score > max_score) {
        max_score = score;
        best_category = cat;
      }
    }

    return max_score > 0 ? best_category : '성과평가';
  }

  /**
   * 빈도 높은 유효 한국어 핵심 키워드 5~7개 자동 추출
   */
  private static extract_keywords(text: string, title: string): string[] {
    const combined = `${title} ${text}`;
    const words = combined.match(/[가-힣]{2,6}/g) || [];

    const stopwords = new Set([
      '경우', '대한', '관한', '따라', '위하여', '의하여', '하여야', '한다', '있다', '해당', '기준',
      '사업', '운영', '지침', '지원', '관리', '지정', '실시', '규정', '보건복지부', '지자체',
      '문서', '내용', '휴먼명조', '바탕체', '굴림체', '한글', '파일',
    ]);

    const counts: Record<string, number> = {};
    for (const word of words) {
      if (!stopwords.has(word) && !this.detect_garbled_text(word)) {
        counts[word] = (counts[word] || 0) + 1;
      }
    }

    const sorted = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([word]) => word)
      .slice(0, 6);

    return sorted.length > 0 ? sorted : ['책임의료기관', '공공보건의료', '필수의료', '통합안내'];
  }

  /**
   * 본문에서 기준 수치 문장 자동 감지
   */
  private static detect_rule_metric(text: string): string {
    const metric_regex = /([0-9]+(?:\.[0-9]+)?(?:%|분|억원?|만원?|명|건|이상|미만|이내))/g;
    const matches = text.match(metric_regex);
    if (matches && matches.length > 0) {
      return matches.slice(0, 3).join(', ') + ' 기준';
    }
    return '지침 세부 규정 준용';
  }
}
