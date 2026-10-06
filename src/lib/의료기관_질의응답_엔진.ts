import {
  전체_공공의료기관_상세목록,
  공공의료기관_상세_프로필,
} from './의료서비스_검색_엔진';
import { format_number_comma } from './유틸리티';
import { get_all_corpus, 지침_문서_청크 } from './공공의료_지침_코퍼스';

export type 의료기관_질의_카테고리 =
  | '병상규모_순위'
  | '의사인력_순위'
  | '필수의료_서비스'
  | '지방의료원_현황'
  | '지역별_기관'
  | '병상가동률_순위'
  | '특정기관_상세'
  | '복합조건_필터'
  | '지침_RAG_연계'
  | '일반_분석';

export interface 의료기관_질의_응답_결과 {
  query: string;
  category: 의료기관_질의_카테고리;
  title: string;
  summary: string;
  insights: string[];
  total_count: number;
  table_columns: { key: string; label: string; align?: 'left' | 'right' | 'center' }[];
  table_rows: Record<string, any>[];
  chart_data?: { name: string; value1: number; value2?: number; label1: string; label2?: string }[];
  hospitals: 공공의료기관_상세_프로필[];
  rag_evidences?: 지침_문서_청크[]; // RAG 코퍼스에서 검색된 관련 법령/지침
}

/**
 * 쿼리에서 상위 N개 제한 숫자 추출 (예: Top 10, 상위 5곳 등)
 */
function parse_query_limit(query: string, default_val: number = 10, max_val: number = 100): number {
  const match =
    query.match(/(?:top|상위|하위)\s*(\d+)/i) ||
    query.match(/(\d+)\s*(?:개|곳|개소|기관|병원|위)/i);
  if (match && match[1]) {
    const val = parseInt(match[1], 10);
    if (!isNaN(val) && val > 0) {
      return Math.min(val, max_val);
    }
  }
  return default_val;
}

/**
 * 질문 키워드를 기반으로 공공의료 법령·지침 RAG 코퍼스에서 가장 연관도 높은 지침 검색
 */
function search_rag_guidelines(query: string, max_results: number = 2): 지침_문서_청크[] {
  try {
    const corpus = get_all_corpus();
    const tokens = query
      .toLowerCase()
      .split(/[\s,?.!~()]+/g)
      .filter((t) => t.length >= 2);

    if (tokens.length === 0) return [];

    const scored = corpus.map((chunk) => {
      let score = 0;
      const title_lower = chunk.문서명.toLowerCase();
      const content_lower = chunk.본문.toLowerCase();
      const keywords_lower = chunk.핵심키워드.map((k) => k.toLowerCase());
      const criteria_lower = chunk.기준수치.toLowerCase();

      for (const token of tokens) {
        // 핵심키워드 직접 일치
        if (keywords_lower.some((k) => k.includes(token))) score += 5;
        // 문서명 일치
        if (title_lower.includes(token)) score += 4;
        // 기준수치 일치
        if (criteria_lower.includes(token)) score += 3;
        // 본문 일치
        if (content_lower.includes(token)) score += 1;
      }

      return { chunk, score };
    });

    return scored
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, max_results)
      .map((item) => item.chunk);
  } catch (err) {
    console.error('RAG 코퍼스 검색 실패:', err);
    return [];
  }
}

/**
 * 214개 공공병원 전수 데이터 및 RAG 지침 코퍼스를 결합한 실시간 자연어 질의응답 분석 엔진
 */
export function analyze_hospital_query(user_query: string): 의료기관_질의_응답_결과 {
  const q = user_query.trim().toLowerCase();
  const limit = parse_query_limit(user_query, 10, 100);
  const all_hospitals = 전체_공공의료기관_상세목록;

  // 1. RAG 코퍼스에서 관련 법령/지침 검색
  const rag_evidences = search_rag_guidelines(user_query, 2);

  // 2. 자연어 다차원 필터링 조건 파싱
  const conditions = {
    needs_emergency: q.includes('응급') || q.includes('er') || q.includes('응급실'),
    needs_icu: q.includes('중환자') || q.includes('icu') || q.includes('중환자실'),
    needs_delivery: q.includes('분만') || q.includes('산부인과') || q.includes('출산') || q.includes('모자'),
    needs_pediatric: q.includes('소아') || q.includes('어린이') || q.includes('달빛') || q.includes('소아청소년'),
    needs_dialysis: q.includes('투석') || q.includes('인공신장'),
    needs_inpatient: q.includes('입원'),
    is_medical_center_only: q.includes('지방의료원') || q.includes('의료원'),
    is_university_only: q.includes('대학병원') || q.includes('국립대'),
    is_redcross_only: q.includes('적십자'),
    is_regional_leader: q.includes('권역책임'),
    is_local_leader: q.includes('지역책임'),
  };

  // 시도 지역 파싱
  const SIDO_MAP: Record<string, string> = {
    강원: '강원',
    경기: '경기',
    경남: '경남',
    경북: '경북',
    광주: '광주',
    대구: '대구',
    대전: '대전',
    부산: '부산',
    서울: '서울',
    울산: '울산',
    인천: '인천',
    전남: '전남',
    전북: '전북',
    제주: '제주',
    충남: '충남',
    충북: '충북',
    세종: '세종',
  };
  const matched_sido_key = Object.keys(SIDO_MAP).find((s) => q.includes(s));
  const matched_sido = matched_sido_key ? SIDO_MAP[matched_sido_key] : null;

  // 특정 시군구 파싱 (예: 영월, 원주, 춘천, 강릉, 성남, 수원, 안성 등)
  const SIGUNGU_KEYWORDS = [
    '영월', '원주', '춘천', '강릉', '속초', '삼척', '태백', '정선',
    '성남', '수원', '안성', '의정부', '파주', '포천', '이천',
    '청주', '충주', '천안', '공주', '서산', '홍성',
    '군산', '남원', '목포', '순천', '강진',
    '포항', '김천', '안동', '울진',
    '마산', '진주', '통영', '거창',
    '서귀포', '제주',
  ];
  const matched_sigungu = SIGUNGU_KEYWORDS.find((sg) => q.includes(sg));

  // 특정 단일 기관명 직접 검색 (예: 영월의료원, 서울대학교병원 등)
  const single_hospital = all_hospitals.find(
    (h) => q.includes(h.기관명.toLowerCase()) || (h.기관명.replace(/\s+/g, '') === q.replace(/\s+/g, ''))
  );

  // 수치 필터 파싱 (예: 500병상 이상, 전문의 30명 이상 등)
  const bed_min_match = q.match(/(?:병상|병상수)\s*(\d+)\s*(?:개|병상)?\s*(?:이상|초과|넘는)/);
  const min_beds = bed_min_match ? parseInt(bed_min_match[1], 10) : 0;

  const doc_min_match = q.match(/(?:전문의|의사)\s*(\d+)\s*(?:명)?\s*(?:이상|초과|넘는)/);
  const min_docs = doc_min_match ? parseInt(doc_min_match[1], 10) : 0;

  // 3. 필터링 수행
  let filtered = all_hospitals.filter((h) => {
    // 단일 기관 검색인 경우 우선 일치
    if (single_hospital && h.id === single_hospital.id) return true;

    // 시도 필터
    if (matched_sido && !h.시도명.includes(matched_sido)) return false;

    // 시군구 필터
    if (matched_sigungu && !h.시군구명.includes(matched_sigungu) && !h.기관명.includes(matched_sigungu)) {
      return false;
    }

    // 기관 유형 필터
    if (conditions.is_medical_center_only && (!h.기관명.includes('의료원') || h.기관명.includes('연구원'))) {
      return false;
    }
    if (conditions.is_university_only && !h.기관명.includes('대학교')) return false;
    if (conditions.is_redcross_only && !h.기관명.includes('적십자')) return false;
    if (conditions.is_regional_leader && !h.기관유형.includes('권역책임')) return false;
    if (conditions.is_local_leader && !h.기관유형.includes('지역책임')) return false;

    // 수치 필터
    if (min_beds > 0 && h.의료자원.병상.총병상 < min_beds) return false;
    if (min_docs > 0 && h.의료자원.의료인력.전문의수 < min_docs) return false;

    // 필수의료 서비스 필터
    if (conditions.needs_emergency) {
      const has_er = h.서비스_상세.some((s) => s.코드 === 'emergency' && s.상태 === '운영');
      if (!has_er) return false;
    }
    if (conditions.needs_icu) {
      const has_icu = h.의료자원.중환자실.총병상 > 0;
      if (!has_icu) return false;
    }
    if (conditions.needs_delivery) {
      const has_delivery = h.서비스_상세.some((s) => s.코드 === 'delivery' && s.상태 === '운영');
      if (!has_delivery) return false;
    }
    if (conditions.needs_pediatric) {
      const has_ped = h.서비스_상세.some((s) => s.코드 === 'pediatric' && s.상태 === '운영');
      if (!has_ped) return false;
    }
    if (conditions.needs_dialysis) {
      const has_dial = h.서비스_상세.some((s) => s.코드 === 'dialysis' && s.상태 === '운영');
      if (!has_dial) return false;
    }
    if (conditions.needs_inpatient) {
      const has_inp = h.서비스_상세.some((s) => s.코드 === 'inpatient' && s.상태 === '운영');
      if (!has_inp) return false;
    }

    return true;
  });

  // 조건이 없어서 전체가 매칭된 경우이면서, 특정 정렬 키워드가 있는 경우
  const is_doc_focused = q.includes('의사') || q.includes('전문의') || q.includes('인력');
  const is_icu_focused = q.includes('중환자') || q.includes('icu');
  const is_util_focused = q.includes('가동률') || q.includes('회전율');

  // 정렬 로직
  let sorted = [...filtered].sort((a, b) => {
    if (is_doc_focused) {
      return b.의료자원.의료인력.전문의수 - a.의료자원.의료인력.전문의수;
    }
    if (is_icu_focused) {
      return b.의료자원.중환자실.총병상 - a.의료자원.중환자실.총병상;
    }
    if (is_util_focused) {
      return b.의료자원.병상.가동률 - a.의료자원.병상.가동률;
    }
    // 기본 병상수 순
    return b.의료자원.병상.총병상 - a.의료자원.병상.총병상;
  });

  // 단일 기관 검색인 경우
  if (single_hospital && sorted.length === 1) {
    const h = single_hospital;
    return {
      query: user_query,
      category: '특정기관_상세',
      title: `${h.기관명} 상세 의료자원 및 운영 프로필`,
      summary: `**${h.기관명}**(${h.시도명} ${h.시군구명})은 **${h.기관유형}**으로, 허가병상 **${format_number_comma(h.의료자원.병상.총병상)}병상**(가동률 ${h.의료자원.병상.가동률}%), 중환자실 **${h.의료자원.중환자실.총병상}병상**, 전문의 **${h.의료자원.의료인력.전문의수}명**(충원율 ${h.의료자원.의료인력.충원율}%)을 보유하고 있습니다.`,
      insights: [
        `🏥 **소재지 및 관할 진료권**: ${h.시도명} ${h.시군구명} (${h.진료권명} 중진료권 책임의료기관)`,
        `🚨 **응급/중환자 자원**: 응급실 가용병상 ${h.의료자원.응급실.가용병상}개, 상태 [${h.의료자원.응급실.상태}], 인공호흡기 ${h.의료자원.주요장비.인공호흡기 ? '보유' : '미보유'}`,
        `👶 **필수의료 가동**: ${h.서비스_상세.filter((s) => s.상태 === '운영').map((s) => s.서비스명).join(', ') || '내과/외과 기본 진료'}`,
      ],
      total_count: 1,
      table_columns: [
        { key: '항목', label: '자원 구분', align: 'left' },
        { key: '내용', label: '상세 정보', align: 'left' },
      ],
      table_rows: [
        { 항목: '기관명 / 유형', 내용: `${h.기관명} (${h.기관유형})` },
        { 항목: '소재지 / 진료권', 내용: `${h.시도명} ${h.시군구명} (${h.진료권명} 중진료권)` },
        { 항목: '병상 규모', 내용: `총 ${format_number_comma(h.의료자원.병상.총병상)}병상 (가동률 ${h.의료자원.병상.가동률}%)` },
        { 항목: '중환자실 / 수술실', 내용: `중환자실 ${h.의료자원.중환자실.총병상}병상, 수술실 ${h.의료자원.수술실.총실}실` },
        { 항목: '의료인력', 내용: `전문의 ${h.의료자원.의료인력.전문의수}명, 간호사 ${h.의료자원.의료인력.간호사수}명 (충원율 ${h.의료자원.의료인력.충원율}%)` },
        { 항목: '필수의료 운영', 내용: h.서비스_상세.filter((s) => s.상태 === '운영').map((s) => s.서비스명).join(', ') },
        { 항목: '대표전화 / 주소', 내용: `${h.전화번호} / ${h.주소}` },
      ],
      hospitals: [h],
      rag_evidences,
    };
  }

  // 검색 결과가 전혀 없는 경우
  if (sorted.length === 0) {
    const fallback_list = all_hospitals.slice(0, 10);
    return {
      query: user_query,
      category: '일반_분석',
      title: `"${user_query}" 조건에 부합하는 기관을 찾지 못했습니다`,
      summary: `입력하신 조건(지역: ${matched_sido || '전체'}, 필수의료 조건 등)을 모두 만족하는 공공병원이 검색되지 않아 전국 대표 책임의료기관 현황을 대신 안내합니다.`,
      insights: [
        `💡 **검색 추천**: "응급실과 중환자실을 동시에 가동하는 공공병원", "강원도 공공의료기관 현황", "전문의 수가 가장 많은 공공병원 Top10" 등으로 질의해 보세요.`,
      ],
      total_count: 0,
      table_columns: [
        { key: 'rank', label: '순위', align: 'center' },
        { key: '기관명', label: '의료기관명', align: 'left' },
        { key: '지역', label: '소재지', align: 'center' },
        { key: '총병상_fmt', label: '총 병상수', align: 'right' },
        { key: '전문의_fmt', label: '전문의수', align: 'right' },
      ],
      table_rows: fallback_list.map((h, idx) => ({
        rank: idx + 1,
        id: h.id,
        기관명: h.기관명,
        지역: `${h.시도명} ${h.시군구명}`,
        총병상_fmt: `${format_number_comma(h.의료자원.병상.총병상)}병상`,
        전문의_fmt: `${h.의료자원.의료인력.전문의수}명`,
      })),
      hospitals: fallback_list,
      rag_evidences,
    };
  }

  // 상위 N개 기관 슬라이싱 (질의에 특정 제한이 있거나 기본 10개)
  const sliced = sorted.slice(0, limit);
  const total_beds_sum = sorted.reduce((acc, h) => acc + h.의료자원.병상.총병상, 0);
  const total_docs_sum = sorted.reduce((acc, h) => acc + h.의료자원.의료인력.전문의수, 0);
  const avg_beds = Math.round(total_beds_sum / (sorted.length || 1));
  const avg_docs = Math.round(total_docs_sum / (sorted.length || 1));

  // 동적 타이틀 및 요약 생성
  let condition_labels: string[] = [];
  if (matched_sido) condition_labels.push(`${matched_sido} 지역`);
  if (matched_sigungu) condition_labels.push(`${matched_sigungu} 관내`);
  if (conditions.is_medical_center_only) condition_labels.push('지방의료원');
  if (conditions.is_university_only) condition_labels.push('국립대병원');
  if (conditions.needs_emergency && conditions.needs_icu) condition_labels.push('응급의료 및 중환자실(ICU) 동시 가동');
  else {
    if (conditions.needs_emergency) condition_labels.push('응급의료기관');
    if (conditions.needs_icu) condition_labels.push('중환자실 보유');
  }
  if (conditions.needs_delivery && conditions.needs_pediatric) condition_labels.push('분만실 및 소아청소년과 동시 가동');
  else {
    if (conditions.needs_delivery) condition_labels.push('분만실 운영');
    if (conditions.needs_pediatric) condition_labels.push('소아청소년과 운영');
  }
  if (conditions.needs_dialysis) condition_labels.push('인공신장실(혈액투석) 운영');
  if (min_beds > 0) condition_labels.push(`${min_beds}병상 이상`);
  if (min_docs > 0) condition_labels.push(`전문의 ${min_docs}명 이상`);

  const condition_title = condition_labels.length > 0 ? condition_labels.join(' ') : '전국 공공의료기관';
  const display_title = `${condition_title} 현황 분석 (${sorted.length}개소)`;

  const top3_names = sorted.slice(0, 3).map((h) => `${h.기관명}(${format_number_comma(h.의료자원.병상.총병상)}병상)`).join(', ');

  const summary_text = `전국 214개 공공병원 중 **${condition_title}** 조건을 충족하는 기관은 총 **${sorted.length}개소**(전체 공공병원의 ${Math.round((sorted.length / all_hospitals.length) * 100)}%)입니다. 총 합산 병상수는 **${format_number_comma(total_beds_sum)}병상**(기관당 평균 ${avg_beds}병상), 전문의 수는 **${format_number_comma(total_docs_sum)}명**(기관당 평균 ${avg_docs}명)입니다. 상위 주요 기관은 **${top3_names}** 등입니다.`;

  // 핵심 인사이트 도출
  const insights: string[] = [];
  if (sorted.length > 0) {
    const top1 = sorted[0];
    insights.push(
      `🏥 **최대 규모 거점 기관**: **${top1.기관명}**(${top1.시도명} ${top1.시군구명})이 허가병상 ${format_number_comma(top1.의료자원.병상.총병상)}병상, 중환자실 ${top1.의료자원.중환자실.총병상}병상, 전문의 ${top1.의료자원.의료인력.전문의수}명으로 가장 큰 역량을 보유하고 있습니다.`
    );
  }

  if (conditions.needs_emergency || conditions.needs_icu || conditions.needs_delivery) {
    insights.push(
      `🚨 **필수의료 안전망 집중도**: 복합 필수의료(응급·중환자·분만)를 제공하는 공공병원은 대도시 상급종합병원 및 대형 지방의료원에 편중되어 있으며, 군 단위 지자체는 인접 대도시 병원으로의 골든타임 이송망 구축이 필수적입니다.`
    );
  } else {
    insights.push(
      `📊 **지역 균형 및 인력 편차**: 상위 권역책임의료기관과 군 단위 지역책임의료기관 간에 병상 규모 및 전문의 인력 격차가 약 ${(sorted[0]?.의료자원.의료인력.전문의수 || 1) / (sorted[sorted.length - 1]?.의료자원.의료인력.전문의수 || 1 > 0 ? sorted[sorted.length - 1]?.의료자원.의료인력.전문의수 : 1)}배 이상 관찰됩니다.`
    );
  }

  if (rag_evidences.length > 0) {
    insights.push(
      `📜 **법정 지침 및 정책 연계**: 본 질의는 보건복지부 관련 고시(「${rag_evidences[0].문서명}」)의 법정 기준 및 재정 지원 조항과 연계되어 있습니다.`
    );
  } else {
    insights.push(
      `💡 **정책 의사결정 제언**: 지역책임의료기관의 필수의료 가동률 유지를 위해 국고 기능보강 및 공공임상교수 파견 연계가 필요합니다.`
    );
  }

  // 테이블 컬럼 정의
  const table_columns = [
    { key: 'rank', label: '순위', align: 'center' as const },
    { key: '기관명', label: '의료기관명', align: 'left' as const },
    { key: '기관유형', label: '기관유형', align: 'center' as const },
    { key: '지역', label: '소재지', align: 'center' as const },
    { key: '총병상_fmt', label: '총 병상수', align: 'right' as const },
    { key: '중환자실_fmt', label: '중환자실', align: 'right' as const },
    { key: '전문의_fmt', label: '전문의수', align: 'right' as const },
    { key: '전화번호', label: '대표전화', align: 'center' as const },
  ];

  // 테이블 행 데이터 생성
  const table_rows = sorted.map((h, idx) => ({
    rank: idx + 1,
    id: h.id,
    기관명: h.기관명,
    기관유형: h.기관유형,
    지역: `${h.시도명} ${h.시군구명}`,
    총병상_fmt: `${format_number_comma(h.의료자원.병상.총병상)}병상`,
    중환자실_fmt: `${h.의료자원.중환자실.총병상}병상`,
    전문의_fmt: `${h.의료자원.의료인력.전문의수}명`,
    전화번호: h.전화번호,
    raw_hospital: h,
  }));

  // 차트 데이터 (상위 10개)
  const chart_data = sliced.map((h) => ({
    name: h.기관명.length > 8 ? h.기관명.slice(0, 7) + '..' : h.기관명,
    value1: is_doc_focused ? h.의료자원.의료인력.전문의수 : h.의료자원.병상.총병상,
    value2: is_doc_focused ? h.의료자원.의료인력.간호사수 : h.의료자원.중환자실.총병상,
    label1: is_doc_focused ? '전문의수' : '총 병상수',
    label2: is_doc_focused ? '간호사수' : '중환자실',
  }));

  return {
    query: user_query,
    category:
      conditions.needs_emergency || conditions.needs_delivery
        ? '필수의료_서비스'
        : conditions.is_medical_center_only
        ? '지방의료원_현황'
        : is_doc_focused
        ? '의사인력_순위'
        : matched_sido
        ? '지역별_기관'
        : '복합조건_필터',
    title: display_title,
    summary: summary_text,
    insights,
    total_count: sorted.length,
    table_columns,
    table_rows,
    chart_data,
    hospitals: sorted,
    rag_evidences,
  };
}
