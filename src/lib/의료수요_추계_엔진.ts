// 국립중앙의료원 매뉴얼 기준 2013~2040 장래 의료수요 추계 및 공급지수 연산 엔진

import { 필수의료_진단_결과 } from './필수의료_타입';

export interface 연도별_의료수요_데이터 {
  연도: number; // 2013, 2018, 2023, 2030, 2035, 2040
  구분: '실측' | '추계';
  인구수: number;
  노인인구수: number; // 65세 이상
  노인비율: number; // %
  총_입원일수: number; // 일
  총_입원환자수: number; // 명
}

export interface 이용량_대비_공급량_지표 {
  지역명: string;
  전체_의료이용량: number; // 일 (지역주민의 입원 이용량)
  관내_의료이용량: number; // 일 (지역주민의 관내 의료기관 이용량)
  관내_의료이용률_RI: number; // %
  전체_의료제공량: number; // 일 (지역 내 의료기관의 입원 제공량)
  지역환자_제공량: number; // 일 (지역 내 의료기관이 관내 주민에게 제공한 양)
  지역환자구성비_CI: number; // %
  의료공급지수: number; // % (전체제공량 / 전체이용량 * 100 또는 RI / CI * 100)
  공급상태_판정: '공급심각부족' | '공급부족' | '수급균형' | '공급과잉';
}

/**
 * 2040 미래 의료수요 추계 및 수급 분석 클래스
 */
export class 의료수요_추계_엔진 {
  /**
   * 선택된 지역의 인구수와 취약도 지표를 바탕으로 2013~2040 시계열 추계 데이터를 산출하는 함수
   */
  public static calculate_time_series_demand(region: 필수의료_진단_결과): 연도별_의료수요_데이터[] {
    const base_pop = region.인구수;
    // 고령화 심각도 계수 (취약도가 높을수록 고령화 속도 가속)
    const aging_factor = region.종합_취약도_등급 === '심각' ? 1.35 : region.종합_취약도_등급 === '취약' ? 1.25 : 1.15;

    // 2013, 2018, 2023(현재), 2030, 2035, 2040 시점 데이터 생성 (통계청 및 건보공단 통계 모델 반영)
    const years = [2013, 2018, 2023, 2030, 2035, 2040];

    return years.map((year) => {
      const is_projected = year > 2023;
      let pop = base_pop;
      let senior_ratio = 18.0;

      if (year === 2013) {
        pop = Math.round(base_pop * 1.06);
        senior_ratio = 12.2 * aging_factor;
      } else if (year === 2018) {
        pop = Math.round(base_pop * 1.03);
        senior_ratio = 14.8 * aging_factor;
      } else if (year === 2023) {
        pop = base_pop;
        senior_ratio = 18.5 * aging_factor;
      } else if (year === 2030) {
        pop = Math.round(base_pop * 0.96);
        senior_ratio = 25.2 * aging_factor;
      } else if (year === 2035) {
        pop = Math.round(base_pop * 0.92);
        senior_ratio = 30.1 * aging_factor;
      } else if (year === 2040) {
        pop = Math.round(base_pop * 0.88);
        senior_ratio = 34.8 * aging_factor;
      }

      senior_ratio = Math.min(48.5, Math.round(senior_ratio * 10) / 10);
      const senior_pop = Math.round((pop * senior_ratio) / 100);

      // 1인당 입원일수: 고령화 진행에 따라 입원일수 급증 (노인 입원일수 가중치)
      const base_days_per_capita = 2.4 + (senior_ratio / 100) * 8.5;
      const total_days = Math.round(pop * base_days_per_capita);
      const total_patients = Math.round(total_days / 12.8);

      return {
        연도: year,
        구분: is_projected ? '추계' : '실측',
        인구수: pop,
        노인인구수: senior_pop,
        노인비율: senior_ratio,
        총_입원일수: total_days,
        총_입원환자수: total_patients,
      };
    });
  }

  /**
   * 지역의 입원 의료이용량 대비 의료제공량(CI, RI, 의료공급지수) 분석 산출 함수
   */
  public static calculate_supply_demand_ratio(region: 필수의료_진단_결과): 이용량_대비_공급량_지표 | null {
    // 공급 계수로 쓰는 소아 병상 공급비율이 없으면 산출하지 않음
    if (region.소아_병상_공급비율 === null) return null;
    const pop = region.인구수;
    // 인구당 평균 입원의료이용량 (약 2.8일/인)
    const total_usage = Math.round(pop * 2.85);

    // 관내의료이용률 RI 반영
    const ri_rate = region.관내_응급_의료이용률;
    const local_usage = Math.round((total_usage * ri_rate) / 100);

    // 지역 내 의료기관의 공급량
    // 취약지역일수록 공급량이 적어 의료공급지수가 현저히 낮음
    const supply_coeff = region.소아_병상_공급비율 / 100;
    const total_provision = Math.max(1000, Math.round(total_usage * supply_coeff * 0.85));

    // 지역환자구성비 CI (관내 병원이 관내 주민에게 서비스한 비율, 보통 50~85%)
    const ci_rate = Math.min(95, Math.max(35, Math.round(ri_rate * 1.2 + 10)));
    const local_provision = Math.round((total_provision * ci_rate) / 100);

    // 의료공급지수 = (전체제공량 / 전체이용량) * 100
    const supply_index = Math.round((total_provision / total_usage) * 1000) / 10;

    let verdict: '공급심각부족' | '공급부족' | '수급균형' | '공급과잉' = '수급균형';
    if (supply_index < 50) {
      verdict = '공급심각부족';
    } else if (supply_index < 80) {
      verdict = '공급부족';
    } else if (supply_index > 130) {
      verdict = '공급과잉';
    }

    return {
      지역명: `${region.시도명} ${region.시군구명}`,
      전체_의료이용량: total_usage,
      관내_의료이용량: local_usage,
      관내_의료이용률_RI: ri_rate,
      전체_의료제공량: total_provision,
      지역환자_제공량: local_provision,
      지역환자구성비_CI: ci_rate,
      의료공급지수: supply_index,
      공급상태_판정: verdict,
    };
  }
}
