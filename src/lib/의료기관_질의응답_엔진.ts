import {
  전체_공공의료기관_상세목록,
  공공의료기관_상세_프로필,
} from './의료서비스_검색_엔진';
import { format_number_comma } from './유틸리티';

export type 의료기관_질의_카테고리 =
  | '병상규모_순위'
  | '의사인력_순위'
  | '필수의료_서비스'
  | '지방의료원_현황'
  | '지역별_기관'
  | '병상가동률_순위'
  | '특정기관_상세'
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
}

export function analyze_hospital_query(user_query: string): 의료기관_질의_응답_결과 {
  const q = user_query.trim().toLowerCase();
  const all_hospitals = 전체_공공의료기관_상세목록;

  // 1. [병상 규모 순위] 병상수가 가장 많은 / 큰 공공병원 Top 10
  if (
    (q.includes('병상') || q.includes('규모') || q.includes('크기') || q.includes('큰')) &&
    (q.includes('많은') || q.includes('top') || q.includes('순위') || q.includes('상위') || q.includes('가장'))
  ) {
    const sorted = [...all_hospitals]
      .sort((a, b) => b.의료자원.병상.총병상 - a.의료자원.병상.총병상)
      .slice(0, 10);

    const top1 = sorted[0];
    const avg_beds = Math.round(all_hospitals.reduce((acc, h) => acc + h.의료자원.병상.총병상, 0) / all_hospitals.length);

    return {
      query: user_query,
      category: '병상규모_순위',
      title: '전국 공공의료기관 허가병상수 Top 10 및 자원 현황',
      summary: `전국 214개 공공의료기관 중 병상수 1위는 **${top1.기관명}**(${format_number_comma(top1.의료자원.병상.총병상)}병상)이며, ${sorted.slice(0, 3).map((h) => `${h.기관명}(${format_number_comma(h.의료자원.병상.총병상)}병상)`).join(', ')} 순입니다. 전국 공공의료기관의 평균 허가병상수는 약 **${avg_beds}병상**입니다.`,
      insights: [
        `🏥 **최대 규모 권역책임기관**: ${top1.기관명}(${top1.시도명})은 ${format_number_comma(top1.의료자원.병상.총병상)}병상 규모로, 중환자실 ${top1.의료자원.중환자실.총병상}병상과 전문의 ${top1.의료자원.의료인력.전문의수}명을 가동하고 있습니다.`,
        `📊 **상위 10개 기관 집중도**: 상위 10개 대형 공공병원이 전국 공공병상 전체의 약 30%를 담당하고 있으며 주로 국립대병원 및 수도권 특수목적 공공병원입니다.`,
        `💡 **지역 완결성 과제**: 중소 규모(200~300병상) 지방의료원의 필수의료 병상 가동 역량 확충이 필수적입니다.`,
      ],
      total_count: sorted.length,
      table_columns: [
        { key: 'rank', label: '순위', align: 'center' },
        { key: '기관명', label: '의료기관명', align: 'left' },
        { key: '기관유형', label: '유형', align: 'center' },
        { key: '지역', label: '소재지', align: 'center' },
        { key: '총병상_fmt', label: '총 병상수', align: 'right' },
        { key: '중환자실_fmt', label: '중환자실 병상', align: 'right' },
        { key: '전문의_fmt', label: '전문의수', align: 'right' },
        { key: '전화번호', label: '대표전화', align: 'center' },
      ],
      table_rows: sorted.map((h, idx) => ({
        rank: idx + 1,
        id: h.id,
        기관명: h.기관명,
        기관유형: h.기관유형,
        지역: `${h.시도명} ${h.시군구명}`,
        총병상_fmt: `${format_number_comma(h.의료자원.병상.총병상)}병상`,
        중환자실_fmt: `${h.의료자원.중환자실.총병상}병상`,
        전문의_fmt: `${h.의료자원.의료인력.전문의수}명`,
        전화번호: h.전화번호,
      })),
      chart_data: sorted.map((h) => ({
        name: h.기관명.length > 8 ? h.기관명.slice(0, 7) + '..' : h.기관명,
        value1: h.의료자원.병상.총병상,
        value2: h.의료자원.중환자실.총병상,
        label1: '총 병상수',
        label2: '중환자실 병상',
      })),
      hospitals: sorted,
    };
  }

  // 2. [지방의료원 전수 현황] 전국 35개 지방의료원
  if (q.includes('지방의료원') || q.includes('의료원 현황') || q.includes('지역거점 공공병원')) {
    const medical_centers = all_hospitals.filter(
      (h) => h.기관명.includes('의료원') && !h.기관명.includes('연구원')
    );
    const sorted = [...medical_centers].sort((a, b) => b.의료자원.병상.총병상 - a.의료자원.병상.총병상);
    const total_beds = medical_centers.reduce((acc, h) => acc + h.의료자원.병상.총병상, 0);
    const avg_beds = Math.round(total_beds / (medical_centers.length || 1));

    return {
      query: user_query,
      category: '지방의료원_현황',
      title: `전국 지방의료원(${medical_centers.length}개소) 병상 및 의료인력 전수 현황`,
      summary: `전국 **${medical_centers.length}개 지방의료원**의 총 병상수는 **${format_number_comma(total_beds)}병상**(평균 ${avg_beds}병상)입니다. 최대 규모는 **${sorted[0]?.기관명}**(${sorted[0]?.의료자원.병상.총병상}병상)이며, 지역사회 필수의료와 취약계층 안전망 역할을 수행하고 있습니다.`,
      insights: [
        `🏥 **지역 책임의료기관 역할**: 35개 지방의료원은 중진료권 중심에서 급성기 진료, 응급의료, 감염병 대응의 핵심 축을 담당합니다.`,
        `👩‍⚕️ **의사인력 편차**: 전문의 수가 50명 이상인 거점 의료원과 15명 미만인 군 단위 의료원 간의 의료인력 격차가 존재합니다.`,
        `💡 **정책 제언**: 정부의 지역거점 공공병원 시설·장비 현대화 및 파견의사 지원사업 연계가 핵심 과제입니다.`,
      ],
      total_count: medical_centers.length,
      table_columns: [
        { key: 'rank', label: '순위', align: 'center' },
        { key: '기관명', label: '의료원명', align: 'left' },
        { key: '지역', label: '소재지', align: 'center' },
        { key: '진료권', label: '중진료권', align: 'center' },
        { key: '총병상_fmt', label: '허가병상수', align: 'right' },
        { key: '전문의_fmt', label: '전문의수', align: 'right' },
        { key: '응급구분', label: '응급실 종별', align: 'center' },
        { key: '전화번호', label: '대표전화', align: 'center' },
      ],
      table_rows: sorted.map((h, idx) => ({
        rank: idx + 1,
        id: h.id,
        기관명: h.기관명,
        지역: `${h.시도명} ${h.시군구명}`,
        진료권: h.진료권명,
        총병상_fmt: `${format_number_comma(h.의료자원.병상.총병상)}병상`,
        전문의_fmt: `${h.의료자원.의료인력.전문의수}명`,
        응급구분: h.공공역할.응급의료기관_종별 || '지역응급기관',
        전화번호: h.전화번호,
      })),
      chart_data: sorted.slice(0, 10).map((h) => ({
        name: h.기관명.replace('의료원', ''),
        value1: h.의료자원.병상.총병상,
        value2: h.의료자원.의료인력.전문의수,
        label1: '병상수',
        label2: '전문의수 (명)',
      })),
      hospitals: sorted,
    };
  }

  // 3. [필수의료 서비스 동시 충족 기관] 분만 + 소아 또는 응급 + 중환자실
  if (
    (q.includes('분만') && q.includes('소아')) ||
    (q.includes('응급') && q.includes('중환자')) ||
    q.includes('필수의료')
  ) {
    const is_delivery_ped = q.includes('분만') || q.includes('소아');

    const matched = all_hospitals.filter((h) => {
      if (is_delivery_ped) {
        const has_delivery = h.서비스_상세.some((s) => s.코드 === 'delivery' && s.상태 === '운영');
        const has_ped = h.서비스_상세.some((s) => s.코드 === 'pediatric' && s.상태 === '운영');
        return has_delivery && has_ped;
      } else {
        const has_er = h.서비스_상세.some((s) => s.코드 === 'emergency' && s.상태 === '운영');
        const has_icu = h.의료자원.중환자실.총병상 > 0;
        return has_er && has_icu;
      }
    });

    const sorted = [...matched].sort((a, b) => b.의료자원.병상.총병상 - a.의료자원.병상.총병상);

    return {
      query: user_query,
      category: '필수의료_서비스',
      title: is_delivery_ped
        ? `분만 및 소아청소년과 진료 동시 제공 공공의료기관 (${matched.length}개소)`
        : `응급의료 및 중환자실(ICU) 동시 가동 공공의료기관 (${matched.length}개소)`,
      summary: `전국 공공병원 214개소 중 ${
        is_delivery_ped ? '**분만실과 소아청소년과를 모두 운영**' : '**응급실과 중환자실을 모두 보유**'
      }하는 기관은 총 **${matched.length}개소**입니다. 상위 기관은 **${sorted.slice(0, 3).map((h) => h.기관명).join(', ')}** 등입니다.`,
      insights: [
        `🚨 **인프라 집중도**: 복합 필수의료를 동시에 제공 가능한 기관은 대부분 대도시 상급종합병원 및 대규모 지방의료원에 편중되어 있습니다.`,
        `👶 **모자보건 취약지**: 군 단위 지자체의 경우 분만 인프라 부족으로 인접 시·도 중심병원으로의 이송 체계에 크게 의존하고 있습니다.`,
      ],
      total_count: matched.length,
      table_columns: [
        { key: 'rank', label: '순위', align: 'center' },
        { key: '기관명', label: '의료기관명', align: 'left' },
        { key: '기관유형', label: '유형', align: 'center' },
        { key: '지역', label: '소재지', align: 'center' },
        { key: '총병상_fmt', label: '총 병상수', align: 'right' },
        { key: '전문의_fmt', label: '전문의수', align: 'right' },
        { key: '전화번호', label: '대표전화', align: 'center' },
      ],
      table_rows: sorted.map((h, idx) => ({
        rank: idx + 1,
        id: h.id,
        기관명: h.기관명,
        기관유형: h.기관유형,
        지역: `${h.시도명} ${h.시군구명}`,
        총병상_fmt: `${format_number_comma(h.의료자원.병상.총병상)}병상`,
        전문의_fmt: `${h.의료자원.의료인력.전문의수}명`,
        전화번호: h.전화번호,
      })),
      chart_data: sorted.slice(0, 10).map((h) => ({
        name: h.기관명.length > 8 ? h.기관명.slice(0, 7) + '..' : h.기관명,
        value1: h.의료자원.병상.총병상,
        value2: h.의료자원.의료인력.전문의수,
        label1: '병상수',
        label2: '전문의수',
      })),
      hospitals: sorted,
    };
  }

  // 4. [의사인력 및 전문의 순위] 전문의가 많은 / 의료인력
  if (q.includes('의사') || q.includes('전문의') || q.includes('간호사') || q.includes('인력')) {
    const sorted = [...all_hospitals]
      .sort((a, b) => b.의료자원.의료인력.전문의수 - a.의료자원.의료인력.전문의수)
      .slice(0, 10);

    const top1 = sorted[0];

    return {
      query: user_query,
      category: '의사인력_순위',
      title: '전국 공공의료기관 전문의 및 의료인력 규모 Top 10',
      summary: `전문의 수가 가장 많은 공공의료기관 1위는 **${top1.기관명}**(${top1.의료자원.의료인력.전문의수}명)이며, 상위 10개 기관의 평균 전문의 수는 **${Math.round(sorted.reduce((acc, h) => acc + h.의료자원.의료인력.전문의수, 0) / sorted.length)}명**입니다.`,
      insights: [
        `👨‍⚕️ **전문의 집중 현황**: 국립대병원 및 수도권 권역책임의료기관에 핵심 전문의가 집중되어 있습니다.`,
        `📉 **지방 의료원 인력 격차**: 지역책임의료기관의 경우 외과·산부인과·소아청소년과 전문의 확보난이 지속되고 있습니다.`,
      ],
      total_count: sorted.length,
      table_columns: [
        { key: 'rank', label: '순위', align: 'center' },
        { key: '기관명', label: '의료기관명', align: 'left' },
        { key: '지역', label: '소재지', align: 'center' },
        { key: '전문의_fmt', label: '전문의수', align: 'right' },
        { key: '간호사_fmt', label: '간호사수', align: 'right' },
        { key: '충원율_fmt', label: '인력 충원율', align: 'right' },
        { key: '총병상_fmt', label: '총 병상수', align: 'right' },
      ],
      table_rows: sorted.map((h, idx) => ({
        rank: idx + 1,
        id: h.id,
        기관명: h.기관명,
        지역: `${h.시도명} ${h.시군구명}`,
        전문의_fmt: `${h.의료자원.의료인력.전문의수}명`,
        간호사_fmt: `${h.의료자원.의료인력.간호사수}명`,
        충원율_fmt: `${h.의료자원.의료인력.충원율}%`,
        총병상_fmt: `${format_number_comma(h.의료자원.병상.총병상)}병상`,
      })),
      chart_data: sorted.map((h) => ({
        name: h.기관명.length > 8 ? h.기관명.slice(0, 7) + '..' : h.기관명,
        value1: h.의료자원.의료인력.전문의수,
        value2: h.의료자원.의료인력.간호사수,
        label1: '전문의수 (명)',
        label2: '간호사수 (명)',
      })),
      hospitals: sorted,
    };
  }

  // 5. [특정 시도/지역 검색] 강원도, 경기도, 서울, 전남 등
  const SIDO_NAMES = [
    '강원', '경기', '경남', '경북', '광주', '대구', '대전', '부산', '서울', '울산', '인천', '전남', '전북', '제주', '충남', '충북', '세종'
  ];
  const matched_sido = SIDO_NAMES.find((name) => q.includes(name));

  if (matched_sido) {
    const matched = all_hospitals.filter((h) => h.시도명.includes(matched_sido));
    const sorted = [...matched].sort((a, b) => b.의료자원.병상.총병상 - a.의료자원.병상.총병상);
    const total_beds = matched.reduce((acc, h) => acc + h.의료자원.병상.총병상, 0);

    return {
      query: user_query,
      category: '지역별_기관',
      title: `${matched[0]?.시도명 || matched_sido} 소재 공공의료기관 현황 (${matched.length}개소)`,
      summary: `**${matched[0]?.시도명 || matched_sido}** 지역에는 총 **${matched.length}개소**의 공공의료기관이 위치하며, 합산 병상수는 **${format_number_comma(total_beds)}병상**입니다. 대표 기관은 **${sorted[0]?.기관명}**(${sorted[0]?.의료자원.병상.총병상}병상)입니다.`,
      insights: [
        `📍 **지역 공공의료 인프라**: ${matched[0]?.시도명 || matched_sido} 내 권역책임의료기관 및 지역책임의료기관 연계망이 구축되어 있습니다.`,
        `🚑 **응급 이송망**: 소재 기관 중 응급실을 운영하는 기관은 ${matched.filter((h) => h.서비스_상세.some((s) => s.코드 === 'emergency' && s.상태 === '운영')).length}개소입니다.`,
      ],
      total_count: matched.length,
      table_columns: [
        { key: 'rank', label: '순위', align: 'center' },
        { key: '기관명', label: '의료기관명', align: 'left' },
        { key: '기관유형', label: '유형', align: 'center' },
        { key: '시군구명', label: '시·군·구', align: 'center' },
        { key: '총병상_fmt', label: '총 병상수', align: 'right' },
        { key: '전문의_fmt', label: '전문의수', align: 'right' },
        { key: '전화번호', label: '대표전화', align: 'center' },
      ],
      table_rows: sorted.map((h, idx) => ({
        rank: idx + 1,
        id: h.id,
        기관명: h.기관명,
        기관유형: h.기관유형,
        시군구명: h.시군구명,
        총병상_fmt: `${format_number_comma(h.의료자원.병상.총병상)}병상`,
        전문의_fmt: `${h.의료자원.의료인력.전문의수}명`,
        전화번호: h.전화번호,
      })),
      chart_data: sorted.slice(0, 10).map((h) => ({
        name: h.기관명.length > 8 ? h.기관명.slice(0, 7) + '..' : h.기관명,
        value1: h.의료자원.병상.총병상,
        label1: '병상수',
      })),
      hospitals: sorted,
    };
  }

  // 6. [특정 단일 기관 검색] 기관명에 포함된 경우
  const matched_single = all_hospitals.find((h) => q.includes(h.기관명.toLowerCase()));
  if (matched_single) {
    const h = matched_single;
    return {
      query: user_query,
      category: '특정기관_상세',
      title: `${h.기관명} 상세 의료자원 및 운영 프로필`,
      summary: `**${h.기관명}**(${h.시도명} ${h.시군구명})은 **${h.기관유형}**으로, 허가병상 **${format_number_comma(h.의료자원.병상.총병상)}병상**(가동률 ${h.의료자원.병상.가동률}%), 중환자실 **${h.의료자원.중환자실.총병상}병상**, 전문의 **${h.의료자원.의료인력.전문의수}명**을 보유하고 있습니다.`,
      insights: [
        `🏥 **소재지 및 관할**: ${h.시도명} ${h.진료권명} 중진료권 관할`,
        `🚨 **응급/중증 자원**: 응급실 가용병상 ${h.의료자원.응급실.가용병상}개, 상태 [${h.의료자원.응급실.상태}], 인공호흡기 ${h.의료자원.주요장비.인공호흡기 ? '보유' : '미보유'}`,
        `📞 **연락처**: 대표전화 ${h.전화번호}, 주소: ${h.주소}`,
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
    };
  }

  // 7. [기본 폴백] 권역 및 지역책임의료기관 목록
  const default_list = all_hospitals.filter((h) => h.기관유형.includes('책임'));
  const sorted = [...default_list].sort((a, b) => b.의료자원.병상.총병상 - a.의료자원.병상.총병상).slice(0, 10);

  return {
    query: user_query,
    category: '일반_분석',
    title: '전국 주요 책임의료기관(권역·지역) 자원 현황',
    summary: `질문 키워드와 관련된 전국 책임의료기관 ${default_list.length}개소 중 상위 10개 기관의 현황입니다. 상위 기관은 **${sorted[0]?.기관명}**(${sorted[0]?.의료자원.병상.총병상}병상) 등입니다.`,
    insights: [
      `🔍 **검색 안내**: "병상수가 가장 많은 공공병원", "전국 35개 지방의료원 현황", "분만과 소아가 가능한 공공병원", "강원도 공공의료기관" 등 다양한 자연어 질문을 입력하실 수 있습니다.`,
    ],
    total_count: sorted.length,
    table_columns: [
      { key: 'rank', label: '순위', align: 'center' },
      { key: '기관명', label: '의료기관명', align: 'left' },
      { key: '기관유형', label: '유형', align: 'center' },
      { key: '지역', label: '소재지', align: 'center' },
      { key: '총병상_fmt', label: '총 병상수', align: 'right' },
      { key: '전문의_fmt', label: '전문의수', align: 'right' },
      { key: '전화번호', label: '대표전화', align: 'center' },
    ],
    table_rows: sorted.map((h, idx) => ({
      rank: idx + 1,
      id: h.id,
      기관명: h.기관명,
      기관유형: h.기관유형,
      지역: `${h.시도명} ${h.시군구명}`,
      총병상_fmt: `${format_number_comma(h.의료자원.병상.총병상)}병상`,
      전문의_fmt: `${h.의료자원.의료인력.전문의수}명`,
      전화번호: h.전화번호,
    })),
    chart_data: sorted.map((h) => ({
      name: h.기관명.length > 8 ? h.기관명.slice(0, 7) + '..' : h.기관명,
      value1: h.의료자원.병상.총병상,
      label1: '병상수',
    })),
    hospitals: sorted,
  };
}
