/**
 * HWPX 생성기 (클라이언트사이드 JSZip 기반)
 * ============================================================
 * JSZip을 사용하여 브라우저에서 직접 .hwpx 파일을 생성합니다.
 * HWPX = ZIP 구조의 XML 문서 집합 (한컴오피스 한글 2014+ 지원)
 *
 * 지원 기능:
 *  - A4 용지 설정 (세로, 210×297mm)
 *  - 맑은 고딕 / KoPub돋움체 폰트 지정
 *  - 제목, 소제목, 본문 단락 스타일 적용
 *  - 다운로드(Blob) 트리거
 * ============================================================
 */

// JSZip은 동적 import로 사용 (SSR 안전)
export interface HwpxSection {
  type: 'title' | 'heading1' | 'heading2' | 'body' | 'separator';
  text?: string;
}

/**
 * HWPX 파일에 들어갈 최소 XML 구조 생성
 */
function buildContentXml(sections: HwpxSection[]): string {
  // 각 단락을 HWPXML 형식의 <p> 요소로 변환
  const paragraphs = sections
    .map((sec) => {
      if (sec.type === 'separator') {
        return buildParagraph('', 'Normal');
      }
      const styleId =
        sec.type === 'title'
          ? 'Title'
          : sec.type === 'heading1'
          ? 'Heading1'
          : sec.type === 'heading2'
          ? 'Heading2'
          : 'Normal';
      return buildParagraph(sec.text ?? '', styleId);
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<hsp:HWPMLEditorPublicData xmlns:hsp="urn:schemas-hwpml-com:hwp-schema-private"
  xmlns:hp="urn:schemas-hwpml-com:hwp-schema"
  version="1.2">
<hp:Body>
<hp:SectionList>
<hp:Section>
<hp:PageDef>
  <hp:PaperSize hp:width="59528" hp:height="84188"/>
  <hp:PageMargin hp:left="8500" hp:right="8500" hp:top="5000" hp:bottom="4300" hp:header="4000" hp:footer="3500" hp:gutter="0"/>
</hp:PageDef>
${paragraphs}
</hp:Section>
</hp:SectionList>
</hp:Body>
</hsp:HWPMLEditorPublicData>`;
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function buildParagraph(text: string, styleId: string): string {
  const fontSize =
    styleId === 'Title' ? 2600 : styleId === 'Heading1' ? 2000 : styleId === 'Heading2' ? 1600 : 1000;
  const bold = styleId === 'Title' || styleId === 'Heading1' || styleId === 'Heading2';
  const color = styleId === 'Title' ? '003399' : styleId === 'Heading1' ? '1a3a6b' : styleId === 'Heading2' ? '2c5282' : '1a202c';

  return `<hp:Para>
  <hp:ParaShape hp:align="Justify" hp:lineSpacing="160" hp:spaceBefore="${styleId === 'Title' ? 400 : styleId === 'Heading1' ? 300 : 100}" hp:spaceAfter="${styleId === 'Title' ? 200 : 50}"/>
  <hp:Run>
    <hp:RunShape>
      <hp:Font hp:langId="1042" hp:hcrRepFont="맑은 고딕" hp:type="HcrRep"/>
      <hp:CharShape hp:height="${fontSize}" hp:bold="${bold}" hp:color="${color}"/>
    </hp:RunShape>
    <hp:String>${escapeXml(text)}</hp:String>
  </hp:Run>
</hp:Para>`;
}

function buildContainerXml(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<container xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="Contents/content.hpf" media-type="application/haansofthwp+xml"/>
  </rootfiles>
</container>`;
}

function buildHpfXml(title: string): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<opf:package xmlns:opf="http://www.idpf.org/2007/opf" unique-identifier="uid" version="2.0">
  <opf:metadata>
    <dc:title xmlns:dc="http://purl.org/dc/elements/1.1/">${escapeXml(title)}</dc:title>
    <dc:creator xmlns:dc="http://purl.org/dc/elements/1.1/">공공의료 AI 분석 시스템</dc:creator>
    <dc:date xmlns:dc="http://purl.org/dc/elements/1.1/">${new Date().toISOString()}</dc:date>
  </opf:metadata>
  <opf:spine>
    <opf:itemref idref="section0"/>
  </opf:spine>
  <opf:manifest>
    <opf:item id="section0" href="section0.xml" media-type="application/haansofthwp+xml"/>
  </opf:manifest>
</opf:package>`;
}

function buildVersionXml(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<hh:HWPMLEditorCorePublicData xmlns:hh="urn:schemas-hwpml-com:hwp-schema-private" version="1.2"/>`;
}

/**
 * HWPX 파일 생성 및 다운로드
 * @param title  문서 제목 (파일명 및 본문 타이틀로 사용)
 * @param sections  섹션 목록
 * @param fileName  저장될 파일명 (확장자 포함: *.hwpx)
 */
export async function downloadHwpx(
  title: string,
  sections: HwpxSection[],
  fileName: string
): Promise<void> {
  // 동적 import (클라이언트 전용)
  const JSZip = (await import('jszip')).default;

  const zip = new JSZip();

  // mimetype (압축 없이 저장해야 HWPX 규격 준수)
  zip.file('mimetype', 'application/haansofthwp', { compression: 'STORE' });

  // META-INF/container.xml
  zip.file('META-INF/container.xml', buildContainerXml());

  // Contents/content.hpf
  zip.file('Contents/content.hpf', buildHpfXml(title));

  // Contents/section0.xml (본문)
  zip.file('Contents/section0.xml', buildContentXml(sections));

  // version.xml
  zip.file('version.xml', buildVersionXml());

  // Blob 생성 및 다운로드 트리거
  const blob = await zip.generateAsync({ type: 'blob', mimeType: 'application/haansofthwp' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 3000);
}

/**
 * 보고서 DOM 텍스트를 HWPX 섹션 배열로 변환하는 헬퍼
 * (보고서 캔버스 innerText를 줄별로 파싱)
 */
export function parseReportTextToSections(
  rawText: string,
  docTitle: string
): HwpxSection[] {
  const lines = rawText.split('\n').map((l) => l.trim()).filter(Boolean);
  const sections: HwpxSection[] = [
    { type: 'title', text: docTitle },
    { type: 'separator' },
  ];

  for (const line of lines) {
    if (line.startsWith('■') || line.startsWith('●') || line.startsWith('▶')) {
      sections.push({ type: 'heading1', text: line });
    } else if (line.startsWith('◆') || line.startsWith('▷') || line.startsWith('⊙')) {
      sections.push({ type: 'heading2', text: line });
    } else if (line.length > 100) {
      // 긴 텍스트는 본문으로
      sections.push({ type: 'body', text: line });
    } else if (line.length > 30) {
      sections.push({ type: 'body', text: line });
    } else {
      sections.push({ type: 'body', text: line });
    }
  }

  return sections;
}
