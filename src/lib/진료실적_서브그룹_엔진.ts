// 국립중앙의료원 매뉴얼(p.56~61 및 p.92~96) 기준 7대 서브그룹 진료실적 연산 엔진

import { 필수의료_진단_결과 } from './필수의료_타입';

export type 진료실적_지표_유형 =
  | '총_내원일수'
  | '건당_내원일수'
  | '건당_진료비'
  | '입원일당_진료비';

export type 서브그룹_분류_유형 =
  | '성별'
  | '연령대별'
  | '지역환자_권역별'
  | '진료계별'
  | '중증도별'
  | '주진단범주별'
  | '진료과목별';

export interface 서브그룹_항목_실적 {
  항목명: string;
  수치: number;
  단위: string;
  점유비율: number; // %
  추이_3개년: { 연도: number; 값: number }[];
}

export interface 서브그룹_분석_결과 {
  서브그룹: 서브그룹_분류_유형;
  지표: 진료실적_지표_유형;
  총합계: number;
  단위: string;
  항목_리스트: 서브그룹_항목_실적[];
  핵심_시사점: string;
}

/**
 * 7대 서브그룹 진료실적 심층 분석 클래스
 */
export class 진료실적_서브그룹_엔진 {
  /**
   * 특정 서브그룹 및 실적 지표에 대한 세부 항목별 수치를 연산하는 함수
   */
  public static calculate_subgroup_performance(
    region: 필수의료_진단_결과,
    subgroup: 서브그룹_분류_유형,
    metric: 진료실적_지표_유형
  ): 서브그룹_분석_결과 {
    const pop = region.인구수;
    const is_critical = region.종합_취약도_등급 === '심각';
    const total_days = Math.round(pop * 2.85); // 총 내원일수 기본값

    let items_raw: { 이름: string; 비율: number; 기준값?: number }[] = [];

    switch (subgroup) {
      case '성별':
        items_raw = [
          { 이름: '남성', 비율: 46.2 },
          { 이름: '여성', 비율: 53.8 },
        ];
        break;

      case '연령대별':
        items_raw = is_critical
          ? [
              { 이름: '19세 미만 (소아청소년)', 비율: 6.5 },
              { 이름: '19~64세 (성인)', 비율: 29.3 },
              { 이름: '65세 이상 (고령층)', 비율: 64.2 },
            ]
          : [
              { 이름: '19세 미만 (소아청소년)', 비율: 12.8 },
              { 이름: '19~64세 (성인)', 비율: 44.2 },
              { 이름: '65세 이상 (고령층)', 비율: 43.0 },
            ];
        break;

      case '지역환자_권역별':
        items_raw = [
          { 이름: '관내 (시·군·구)', 비율: region.관내_응급_의료이용률 },
          { 이름: '중진료권 내 타 시군구', 비율: Math.max(10, Math.round((100 - region.관내_응급_의료이용률) * 0.45)) },
          { 이름: '관외 (시·도 외 타지역)', 비율: Math.max(15, Math.round((100 - region.관내_응급_의료이용률) * 0.55)) },
        ];
        break;

      case '진료계별':
        items_raw = [
          { 이름: '내과계 (보존치료/약물)', 비율: 58.2 },
          { 이름: '외과계 (수술중심)', 비율: 28.5 },
          { 이름: '내과적 시술 (인터벤션 등)', 비율: 13.3 },
        ];
        break;

      case '중증도별':
        items_raw = [
          { 이름: '전문진료질병군 (중증 A군)', 비율: 17.5 },
          { 이름: '일반진료질병군 (중등증 B군)', 비율: 71.0 },
          { 이름: '단순진료질병군 (경증 C군)', 비율: 11.5 },
        ];
        break;

      case '주진단범주별':
        items_raw = [
          { 이름: '순환기계 질환 (심장/혈관)', 비율: 18.5 },
          { 이름: '호흡기계 질환 (폐렴/천식)', 비율: 16.2 },
          { 이름: '소화기계 질환 (위/장)', 비율: 15.4 },
          { 이름: '근골격계 및 결합조직 (관절/척추)', 비율: 14.8 },
          { 이름: '신생물 질환 (혈액/고형암)', 비율: 11.2 },
          { 이름: '신경계 질환 (뇌졸중/치매)', 비율: 9.6 },
          { 이름: 'PreMDC (고난도 복합시술)', 비율: 5.8 },
          { 이름: '내분비·대사성 질환 (당뇨 등)', 비율: 4.5 },
          { 이름: '임신, 출산, 산욕 (모자진료)', 비율: 4.0 },
        ];
        break;

      case '진료과목별':
        items_raw = [
          { 이름: '내과 (소화기/순환기/신장)', 비율: 31.5 },
          { 이름: '정형외과', 비율: 18.2 },
          { 이름: '외과', 비율: 12.8 },
          { 이름: '신경외과 / 신경과', 비율: 11.4 },
          { 이름: '응급의학과', 비율: 9.8 },
          { 이름: '소아청소년과', 비율: 6.2 },
          { 이름: '산부인과', 비율: 4.5 },
          { 이름: '재활의학과', 비율: 3.6 },
          { 이름: '비뇨의학과 / 기타', 비율: 2.0 },
        ];
        break;
    }

    // 지표 유형에 따른 수치와 단위 매핑
    let unit = '일';
    let base_scale = total_days;

    if (metric === '건당_내원일수') {
      unit = '일';
      base_scale = 9.8;
    } else if (metric === '건당_진료비') {
      unit = '원';
      base_scale = 3450000;
    } else if (metric === '입원일당_진료비') {
      unit = '원';
      base_scale = 352000;
    }

    // 항목별 연산
    const items: 서브그룹_항목_실적[] = items_raw.map((item) => {
      let val = 0;
      if (metric === '총_내원일수') {
        val = Math.round((base_scale * item.비율) / 100);
      } else if (metric === '건당_내원일수') {
        // 중증도나 외과계에 따른 재원일수 차등
        const mult = item.이름.includes('고령') || item.이름.includes('중증') || item.이름.includes('신경') ? 1.3 : 0.85;
        val = Math.round(base_scale * mult * 10) / 10;
      } else if (metric === '건당_진료비') {
        const mult = item.이름.includes('중증') || item.이름.includes('외과') || item.이름.includes('순환기') ? 1.5 : 0.75;
        val = Math.round(base_scale * mult);
      } else {
        // 입원일당 진료비
        const mult = item.이름.includes('중증') || item.이름.includes('외과') || item.이름.includes('PreMDC') ? 1.4 : 0.85;
        val = Math.round(base_scale * mult);
      }

      // 최근 3개년 추이 (2022, 2023, 2024년)
      const trend = [
        { 연도: 2022, 값: Math.round(val * 0.91) },
        { 연도: 2023, 값: Math.round(val * 0.95) },
        { 연도: 2024, 값: val },
      ];

      return {
        항목명: item.이름,
        수치: val,
        단위: unit,
        점유비율: item.비율,
        추이_3개년: trend,
      };
    });

    // 시사점 문구 자동 도출
    const top_item = [...items].sort((a, b) => b.점유비율 - a.점유비율)[0];
    const insight = `${region.시군구명} 의료기관은 ${subgroup} 분석 결과 '${top_item.항목명}'에서 ${top_item.점유비율}%로 가장 높은 비중을 나타내고 있어, 해당 환자군의 맞춤형 진료 인프라 집중 투자가 필요합니다.`;

    return {
      서브그룹: subgroup,
      지표: metric,
      총합계: metric === '총_내원일수' ? total_days : base_scale,
      단위: unit,
      항목_리스트: items,
      핵심_시사점: insight,
    };
  }
}
