/**
 * 보건복지부 / 국립중앙의료원 공모 표준 AI 사업계획서 생성 엔진
 * 1~4단계 전수 실데이터(214개 공공병원, 24개 지표 6개년 추이, 2024 환자 유출입 OD, 331개 지표정의 RAG) 통합
 */

import { 필수의료_진단_결과, 지역_평균_통계 } from './필수의료_타입';
import { get_patient_flow_data, 시군구_환자_유출입_데이터 } from './환자_유출입_데이터셋';
import { get_nearest_public_hospital, 공공의료기관_정보 } from './공공의료기관_데이터셋';
import { get_indicator_by_code, search_indicators, 헬스맵_지표_정의 } from './헬스맵_지표정의_코퍼스';
import { 경량_RAG_엔진, RAG_검색_결과 } from './경량_rag_엔진';

export type 공모_분야_타입 = 'emergency' | 'delivery' | 'dialysis' | 'pediatric' | 'general';

export interface 공모_분야_정보 {
  id: 공모_분야_타입;
  label: string;
  badge: string;
  icon_name: string;
  primary_indicator_code: string; // 주요 지표코드 (지표정의서 연계)
  desc: string;
  default_budget: string;
}

export const 공모_분야_목록: 공모_분야_정보[] = [
  {
    id: 'emergency',
    label: '🚨 응급의료 기능보강 사업',
    badge: '응급의료 취약지 대상',
    icon_name: 'ShieldAlert',
    primary_indicator_code: 'CAB01B',
    desc: '권역/지역응급의료센터 60분 골든타임 확보 및 응급실 전담의 인건비·장비 확충',
    default_budget: '직접 입력 필요 (해당 연도 공모 지침에서 확인, 플랫폼에 산출 근거 없음)',
  },
  {
    id: 'dialysis',
    label: '💉 인공신장실(혈액투석) 확충 사업',
    badge: '취약지 필수의료 특화',
    icon_name: 'Activity',
    primary_indicator_code: 'CBD06',
    desc: '만성신부전 관외 원정투석 해소, 인공신장실 설치 및 신장내과 전문의 파견 유치',
    default_budget: '직접 입력 필요 (해당 연도 공모 지침에서 확인, 플랫폼에 산출 근거 없음)',
  },
  {
    id: 'delivery',
    label: '🤰 분만취약지 지원 사업',
    badge: 'A·B등급 연속 지원',
    icon_name: 'Baby',
    primary_indicator_code: 'ABA08',
    desc: '분만산부인과 신설, 외래 진료실 운영비 지원 및 닥터헬기·모자의료센터 핫라인 연계',
    // 보건복지부 분만취약지 지원사업 (지침 코퍼스 CHUNK-MATERN-01 원문 확인, 외래산부인과는 정책브리핑·보도 확인)
    default_budget: '분만산부인과: 시설·장비비 10억원(첫해) + 운영비 연 5억원 / 외래산부인과: 운영비 연 2억원 (국비·지방비 각 50%)',
  },
  {
    id: 'pediatric',
    label: '👶 소아청소년 야간휴일 진료체계 구축',
    badge: '소아응급 안전망',
    icon_name: 'Stethoscope',
    primary_indicator_code: 'BAE13',
    desc: '달빛어린이병원 지정, 소아 입원병상 기능보강 및 24시간 소아응급 전담의 확충',
    // 달빛어린이병원 운영지침 (지침 코퍼스 CHUNK-PEDI-02 원문 확인)
    default_budget: '달빛어린이병원 운영비 연 3,000만원~4억 3,200만원 (운영시간 비례, 소아 인구 3만 명 미만 지역 20% 가산 포함). 시설·인력 보강비는 직접 입력',
  },
  {
    id: 'general',
    label: '🏥 지역책임의료기관 포괄 기능보강',
    badge: '공공병원 경영·시설 현대화',
    icon_name: 'Building2',
    primary_indicator_code: 'CBA02',
    desc: '지방의료원 필수의료센터 증축, 최신 의료장비 도입 및 퇴원환자 지역사회 연계',
    default_budget: '직접 입력 필요 (해당 연도 공모 지침에서 확인, 플랫폼에 산출 근거 없음)',
  },
];

export interface AI_사업계획서_생성_결과 {
  제목: string;
  선택지역: string;
  공모분야: 공모_분야_정보;
  책임공공병원: 공공의료기관_정보 | null;
  환자유출입: 시군구_환자_유출입_데이터 | null;
  핵심지표정의: 헬스맵_지표_정의 | null;
  RAG_참조청크: RAG_검색_결과[];
  생성전문: string;
  생성모델: string;
  소요시간_ms: number;
}

export class 사업계획서_AI_엔진 {
  /**
   * 1~4단계 실데이터를 결합하여 Gemini API 또는 지능형 합성 엔진으로 고품질 사업계획서 생성
   */
  public static async generate_plan(params: {
    target_region: 필수의료_진단_결과;
    sido_stat: 지역_평균_통계;
    national_stat: 지역_평균_통계;
    domain_type: 공모_분야_타입;
    google_api_key?: string;
  }): Promise<AI_사업계획서_생성_결과> {
    const start_t = Date.now();
    const { target_region, sido_stat, national_stat, domain_type, google_api_key } = params;
    const region_name = `${target_region.시도명} ${target_region.시군구명}`;

    // 1단계 실데이터: 책임공공병원 매핑
    const hospital_res = get_nearest_public_hospital(target_region.시도명, target_region.시군구명, target_region.시군구코드);
    const hospital_info = hospital_res ? hospital_res.hospital : null;

    // 3단계 실데이터: 환자 유출입 OD 데이터
    const flow_info = get_patient_flow_data(target_region.시군구명) || null;

    // 공모분야 정보
    const domain_info = 공모_분야_목록.find((d) => d.id === domain_type) || 공모_분야_목록[0];

    // 4단계 실데이터: 지표정의서 RAG 검색
    const indicator_def = get_indicator_by_code(domain_info.primary_indicator_code) || null;
    const rag_query = `${domain_info.label} ${domain_info.desc} ${target_region.시군구명} 취약지 기준 산출식 수가코드`;
    const rag_results = 경량_RAG_엔진.retrieve(rag_query, 4);

    // RAG 컨텍스트 문자열화
    const rag_context_str = rag_results
      .map((r, i) => `[참조 ${i + 1}: ${r.청크.문서명} (${r.청크.조항_페이지})]\n${r.청크.본문}`)
      .join('\n\n');

    // 최다 유출지 및 유입지 문자열
    const top_outflow_str = flow_info?.outflow_top
      ?.filter((x) => !x.is_self)
      ?.slice(0, 2)
      ?.map((x) => `${x.dest_sido} ${x.dest_sgg}(${x.pct}%, ${x.days.toLocaleString()}일)`)
      ?.join(', ') || '자료 없음';

    const top_inflow_str = flow_info?.inflow_top
      ?.filter((x) => !x.is_self)
      ?.slice(0, 2)
      ?.map((x) => `${x.orig_sgg}(${x.pct}%)`)
      ?.join(', ') || '자료 없음';

    // API 호출 시도 (Google Gemini API)
    let generated_text = '';
    let used_model = 'Google Gemini 2.5 Flash (지능형 RAG 실데이터 결합)';

    try {
      const api_res = await fetch('/api/llm/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `${new Date().getFullYear()}년 보건복지부 [${domain_info.label}] 공모 신청을 위한 표준 공문서 개조식 사업계획서를 작성하라. 대상 지역: ${region_name}. 관내 책임병원: ${hospital_info?.기관명 || '관내 공공의료원'}.`,
          google_api_key: google_api_key || '',
          region_name,
          region_stats: {
            emergency_rate: target_region.응급_60분_미도달_인구비율,
            ri_rate: target_region.관내_응급_의료이용률,
            maternity_rate: target_region.관내_분만율,
            vulnerability_grade: target_region.종합_취약도_등급,
          },
          flow_stats: {
            total_days: flow_info?.total_days || 0,
            self_days: flow_info?.self_days || 0,
            ri_rate: flow_info?.ri || target_region.관내_응급_의료이용률,
            outflow_rate: flow_info?.outflow_rate || 0,
            top_outflow: top_outflow_str,
            top_inflow: top_inflow_str,
            dialysis_ri: flow_info?.essential_care?.dialysis?.ri || 0,
            er_ri: flow_info?.essential_care?.er?.ri || 0,
          },
          hospital_name: hospital_info?.기관명 || '지역책임의료기관',
          rag_context: rag_context_str,
          mode: 'business_plan',
        }),
      });

      if (api_res.ok) {
        const api_data = await api_res.json();
        if (api_data.gemini?.response && !api_data.gemini?.response.includes('[안내: 구글 API 키 미입력 상태]')) {
          generated_text = api_data.gemini.response;
          used_model = api_data.gemini.model;
        }
      }
    } catch {
      // API 실패 시 아래 지능형 폴백 생성기 동작
    }

    // Gemini API 미사용 또는 시뮬레이션 상태일 때 실데이터 기반의 초정밀 공문서 자동 조판
    if (!generated_text) {
      generated_text = 사업계획서_AI_엔진.build_perfect_plan_document({
        region_name,
        target_region,
        sido_stat,
        national_stat,
        domain_info,
        hospital_info,
        flow_info,
        indicator_def,
        top_outflow_str,
        top_inflow_str,
      });
      used_model = '규칙 기반 템플릿 (AI 미사용, 실데이터 조합)';
    }

    return {
      제목: `[${new Date().getFullYear()}년도 보건복지부 공모] ${region_name} ${domain_info.label} 추진계획서`,
      선택지역: region_name,
      공모분야: domain_info,
      책임공공병원: hospital_info,
      환자유출입: flow_info,
      핵심지표정의: indicator_def,
      RAG_참조청크: rag_results,
      생성전문: generated_text,
      생성모델: used_model,
      소요시간_ms: Date.now() - start_t,
    };
  }

  /**
   * 1~4단계 실데이터를 정밀 조합하여 완벽한 공문서 개조식 사업계획서를 조판하는 함수
   */
  private static build_perfect_plan_document(ctx: {
    region_name: string;
    target_region: 필수의료_진단_결과;
    sido_stat: 지역_평균_통계;
    national_stat: 지역_평균_통계;
    domain_info: 공모_분야_정보;
    hospital_info: 공공의료기관_정보 | null;
    flow_info: 시군구_환자_유출입_데이터 | null;
    indicator_def: 헬스맵_지표_정의 | null;
    top_outflow_str: string;
    top_inflow_str: string;
  }): string {
    const {
      region_name,
      target_region,
      sido_stat,
      national_stat,
      domain_info,
      hospital_info,
      flow_info,
      indicator_def,
      top_outflow_str,
      top_inflow_str,
    } = ctx;

    const today_str = new Date().toISOString().split('T')[0];
    const 올해 = new Date().getFullYear();
    // 응급 60분 미도달 30% 이상 여부에 따라 문장을 달리함 (선정 기준: 보건복지부 고시 제2024-261호 관련 기준)
    const 응급_기준_해당 = target_region.응급_60분_미도달_인구비율 >= 30;
    const 응급_기준_문장 = 응급_기준_해당
      ? `(선정 기준 30% 이상에 해당)`
      : `(선정 기준 30% 미만 — 응급의료취약지 기준에는 해당하지 않음)`;
    const hospital_name = hospital_info?.기관명 || `${region_name} 관내 공공의료원`;
    // 유출입 자료가 없는 지역은 다른 지역 수치로 대체하지 않고 '자료 없음'으로 명시
    const 유출입_현황_문단 = flow_info
      ? `    - 2024년 기준 ${region_name} 거주 주민의 총 입원 의료이용량은 ${flow_info.total_days.toLocaleString()}일(재원일수)에 달함.
    - 그러나 관내 의료기관에서 자체 충족되는 재원일수는 ${flow_info.self_days.toLocaleString()}일로, 관내자체충족률(RI)이 ${flow_info.ri}%에 불과하며, 전체 환자의 ${flow_info.outflow_rate}%가 관외로 유출되고 있음.`
      : `    - ${region_name}의 2024년 환자 유출입(재원일수) 자료가 내장 데이터에 없어 정량 분석을 생략함. (자료 확보 후 보완 필요)
    - 참고: 시군구 필수의료 지표 기준 관내 응급 의료이용률(RI)은 ${target_region.관내_응급_의료이용률}%임.`;
    const 현행_RI_문구 = flow_info ? `현행 ${flow_info.ri}%에서` : '현행값 확인 후(유출입 자료 없음)';
    const 주요_유출지_문구 = flow_info?.outflow_top
      ?.filter((x) => !x.is_self)
      ?.slice(0, 2)
      ?.map((x) => x.dest_sgg)
      ?.join(', ');
    const 유입_현황_문장 = flow_info
      ? `    - ${hospital_name} 등 관내 의료기관의 환자 유입(Inflow) 분석 결과, 외부 유입 환자 비중이 ${flow_info.outsider_inflow_rate}%에 달함.`
      : `    - 환자 유입 자료가 없어 인근 지역 환자 흡수 실적은 확인되지 않음. (자료 확보 후 보완 필요)`;

    return `【 ${올해}년도 공공보건의료 취약지 기능보강 공모사업 신청서 】

■ 사업명: ${region_name} 필수공공의료 안전망 확충을 위한 「${domain_info.label}」
■ 주관 지자체: ${region_name} (보건소) / 총괄 책임기관: ${hospital_name}
■ 사업 기간: (공모 지침에 따라 기재)
■ 총 사업예산: ${domain_info.default_budget}
■ 작성 일자: ${today_str}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Ⅰ. 사업 추진 배경 및 필요성 (정량 실데이터 기반 현황 진단)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1.1. 지역 내 필수의료 이용 및 환자 관외 유출 실태
  ○ (총 의료이용량 및 자체충족률 한계)
${유출입_현황_문단}
  ○ (인접 대도시로의 심각한 환자 유출 현상)
    - 유출 목적지 전수 분석 결과, 최다 유출지는 [${top_outflow_str}] 등으로 나타남.
    - 특히 3차 상급종합병원 및 대형 종합병원으로의 원정 진료로 인해 관내 주민의 교통비·체류비 부담이 가중되고 응급 골든타임 확보가 저해됨.

1.2. 지역책임의료기관의 광역 거점 공공보건의료 앵커 역할
  ○ (인근 취약지 환자 흡수 실적 실증)
${유입_현황_문장}
    - 특히 [${top_inflow_str}] 등 인근 의료취약지 주민이 ${hospital_name}의 필수진료를 실질적으로 이용하고 있어, 본 사업 지원 시 인접 군 지역까지 파급되는 광역 공공보건의료 편익이 지대함.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Ⅱ. 법적 근거 및 보건복지부 헬스맵 지표 산출 기준
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

2.1. 관련 법령 및 고시 기준 충족 여부
  ○ 「공공보건의료에 관한 법률」 제12조 (의료취약지 지정 근거)
  ○ 보건복지부 고시 「응급의료분야 의료취약지 지정」 (제2024-261호) — 실제 지정 여부는 고시 첨부 지역 목록으로 확인
    - 권역응급 60분 미도달 인구 비율 (헬스맵 2024): ${target_region.응급_60분_미도달_인구비율.toFixed(1)}% ${응급_기준_문장}
    - 전국 평균(${national_stat.평균_응급_60분_미도달_인구비율.toFixed(1)}%) 대비 약 ${(target_region.응급_60분_미도달_인구비율 / (national_stat.평균_응급_60분_미도달_인구비율 || 1)).toFixed(1)}배 수준.

2.2. 국립중앙의료원 헬스맵 공식 지표정의서 산출식 및 코드 매핑
  ○ 핵심 연계 지표: [${indicator_def?.code || domain_info.primary_indicator_code}] ${indicator_def?.name || domain_info.label}
    - 지표 정의: ${indicator_def?.definition || domain_info.desc}
    - 산출식 분자: ${indicator_def?.formula_numerator || '해당 지역 거주자의 관내 의료이용량 합계'}
    - 산출식 분모: ${indicator_def?.formula_denominator || '해당 지역 거주자의 전국 전체 의료이용량 합계'}
    - 공식 출처: ${indicator_def?.source || '국민건강보험공단 HANA DB 및 심사평가원 청구데이터'}
    ${indicator_def?.procedure_codes ? `- 관련 수가코드(EDI): ${indicator_def.procedure_codes}` : '- 관련 수가코드: 진료과목별 행위수가 및 응급/투석 가산 수가 일체'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Ⅲ. 세부 사업 추진 계획 (3대 핵심 전략 — 작성 예시, 사업 내용에 맞게 수정)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

3.1. [전략 1] ${hospital_name} 전담 인프라 및 최신 의료장비 기능보강
  ○ 시설 확충: ${domain_info.label} 수행에 필요한 진료공간·병상 보강 (규모: ○○병상, 직접 기재)
  ○ 장비 도입: 사업 목적에 맞는 필수 의료장비 도입 (품목·수량 직접 기재)
  ○ 운영 체계: 24시간(또는 지침상 운영시간) 진료가 가능한 운영 체계 마련

3.2. [전략 2] 필수의료 전문의료인력 확보 및 대학병원 파견 연계
  ○ 전문의 수급: 공공임상교수제 및 파견의사 인건비 지원 제도 활용 (진료과·인원 직접 기재)
  ○ 간호인력 배치: 사업 분야 전담 간호인력 배치 및 교육훈련
  ○ 인센티브 체계: 취약지 의료인력 특수근무수당 지급 및 정주여건 지원 조례 개정

3.3. [전략 3] 권역책임의료기관과의 핫라인 및 퇴원환자 통합돌봄 연계망 구축
  ○ 광역 이송 핫라인: 권역책임의료기관(상급종합병원)과 24시간 실시간 영상협진망 및 닥터헬기 긴급 연계체계 확립
  ○ 지역사회 안심 퇴원: 퇴원환자가 관내 보건소 및 재가요양센터로 원스톱 연계되는 통합돌봄 케어플랜 가동

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Ⅳ. 소요 예산 및 재원 조달 계획
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  ○ 총 소요예산: ${domain_info.default_budget}
    - 세부 편성(시설비·장비비·인건비·운영비): 공모 지침의 비목 기준에 따라 직접 작성
  ○ 재원 매칭: 국비·지방비 분담 비율은 해당 연도 공모 지침에서 확인하여 기재

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Ⅴ. 정량적 성과 목표치 및 기대효과 (목표치는 직접 설정)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  ○ (자체충족률 향상) 관내 필수의료 이용률(RI)을 ${현행_RI_문구} 사업 기간 내 ○○% 이상으로 개선
  ○ (관외 유출 억제) ${주요_유출지_문구 ? `관외(${주요_유출지_문구} 등)` : '관외'}로의 환자 유출 비율 ○○%p 감축
  ○ (골든타임 확보) 응급 중증환자 이송시간 ○○분 이내로 단축
  ○ (인접 취약지 안전망) ${top_inflow_str && top_inflow_str !== '자료 없음' ? `${top_inflow_str} 등 ` : ''}인접 지역 환자 포용 확대를 통한 지역 의료안전망 강화에 기여.`;
  }
}
