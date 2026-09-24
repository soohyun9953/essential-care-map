// 필수의료 3대 취약지 진단 및 공문서 개조식 사업계획서 생성 핵심 엔진

import {
  취약도_등급,
  취약도_메타정보,
  시군구_원천_데이터,
  필수의료_진단_결과,
  지역_평균_통계,
  사업계획서_서술문_패키지,
} from './필수의료_타입';

/**
 * 취약도 등급별 메타정보 상수 매핑
 */
export const 취약도_등급_정보: Record<취약도_등급, 취약도_메타정보> = {
  정상: {
    등급: '정상',
    라벨: '정상 (Safe)',
    색상코드: '#34c759',
    배경색상_클래스: 'bg-[#34c759]/10 text-[#248a3d] border-[#34c759]/25',
    텍스트색상_클래스: 'text-[#34c759]',
    설명: '3대 필수의료 인프라 및 자체충족률 양호',
  },
  관찰: {
    등급: '관찰',
    라벨: '관찰 (Caution)',
    색상코드: '#ff9500',
    배경색상_클래스: 'bg-[#ff9500]/10 text-[#b26800] border-[#ff9500]/25',
    텍스트색상_클래스: 'text-[#ff9500]',
    설명: '1개 분야 법정 취약 기준 충족 또는 주의 필요',
  },
  취약: {
    등급: '취약',
    라벨: '취약 (Vulnerable)',
    색상코드: '#ff6934',
    배경색상_클래스: 'bg-[#ff6934]/10 text-[#c84618] border-[#ff6934]/25',
    텍스트색상_클래스: 'text-[#ff6934]',
    설명: '2개 분야 법정 취약 기준 충족 (중점 관리 필요)',
  },
  심각: {
    등급: '심각',
    라벨: '심각 (Critical)',
    색상코드: '#ff3b30',
    배경색상_클래스: 'bg-[#ff3b30]/10 text-[#d70015] border-[#ff3b30]/25',
    텍스트색상_클래스: 'text-[#ff3b30]',
    설명: '3개 분야 전면 취약 또는 중증의료 공백 심각',
  },
};

/**
 * 필수의료 취약지 종합 진단 및 통계 연산 클래스
 */
export class 필수의료_진단_엔진 {
  /**
   * 단일 시군구 데이터를 평가하여 3대 취약 여부 및 4단계 등급을 판정하는 함수
   */
  public static diagnose_region(raw_data: 시군구_원천_데이터): 필수의료_진단_결과 {
    // 1. 응급의료 취약지 판정: 60분 미도달 인구 > 30% 또는 RI(의료이용률) < 30%
    // 응급의료취약지 선정 기준: 도달 불가 인구 30% '이상' (보건복지부 기준, 2026-09-24 원문 대조)
    const is_emergency_unreachable = raw_data.응급_60분_미도달_인구비율 >= 30;
    const is_emergency_low_ri = raw_data.관내_응급_의료이용률 < 30;
    const is_emergency_vulnerable = is_emergency_unreachable || is_emergency_low_ri;

    let emergency_reason = '기준 충족 (정상)';
    if (is_emergency_unreachable && is_emergency_low_ri) {
      emergency_reason = `60분 미도달(${raw_data.응급_60분_미도달_인구비율.toFixed(1)}% ≥ 30%) 및 관내이용률(${raw_data.관내_응급_의료이용률.toFixed(1)}% < 30%) 동시 취약`;
    } else if (is_emergency_unreachable) {
      emergency_reason = `60분 미도달 인구(${raw_data.응급_60분_미도달_인구비율.toFixed(1)}% ≥ 30%) 기준 해당`;
    } else if (is_emergency_low_ri) {
      emergency_reason = `관내 의료이용률(${raw_data.관내_응급_의료이용률.toFixed(1)}% < 30%) 기준치 미달`;
    }

    // 2. 분만·모자의료 취약지 판정: 60분 미도달 인구 > 30% 또는 분만율 < 40%
    // 분만취약지 선정 기준: 60분 내 분만기관 접근 불가 인구 30% '이상' (보건복지부 분만취약지 지원사업)
    const is_delivery_unreachable = raw_data.분만_60분_미도달_인구비율 >= 30;
    const is_delivery_low_rate = raw_data.관내_분만율 < 40;
    const is_delivery_vulnerable = is_delivery_unreachable || is_delivery_low_rate;

    let delivery_reason = '기준 충족 (정상)';
    if (is_delivery_unreachable && is_delivery_low_rate) {
      delivery_reason = `60분 미도달(${raw_data.분만_60분_미도달_인구비율.toFixed(1)}% ≥ 30%) 및 관내분만율(${raw_data.관내_분만율.toFixed(1)}% < 40%) 동시 취약`;
    } else if (is_delivery_unreachable) {
      delivery_reason = `60분 미도달 인구(${raw_data.분만_60분_미도달_인구비율.toFixed(1)}% ≥ 30%) 기준 해당`;
    } else if (is_delivery_low_rate) {
      delivery_reason = `관내 분만율(${raw_data.관내_분만율.toFixed(1)}% < 40%) 기준치 미달`;
    }

    // 3. 소아·중증진료 취약지 판정: 병상 공급 비율 < 60%
    const is_pediatric_vulnerable = raw_data.소아_병상_공급비율 < 60;
    let pediatric_reason = '기준 충족 (정상)';
    if (is_pediatric_vulnerable) {
      pediatric_reason = `기준 병상 대비 공급 비율(${raw_data.소아_병상_공급비율.toFixed(1)}% < 60%) 심각 미달`;
    }

    // 4. 취약분야 개수 산정
    let vulnerable_count = 0;
    if (is_emergency_vulnerable) vulnerable_count += 1;
    if (is_delivery_vulnerable) vulnerable_count += 1;
    if (is_pediatric_vulnerable) vulnerable_count += 1;

    // 5. 종합 취약도 점수 계산 (0~100점, 높을수록 취약)
    const emergency_score = Math.min(100, Math.max(0, raw_data.응급_60분_미도달_인구비율 * 0.7 + (100 - raw_data.관내_응급_의료이용률) * 0.3));
    const delivery_score = Math.min(100, Math.max(0, raw_data.분만_60분_미도달_인구비율 * 0.6 + (100 - raw_data.관내_분만율) * 0.4));
    const pediatric_score = Math.min(100, Math.max(0, (100 - raw_data.소아_병상_공급비율) * 0.7 + (100 - raw_data.소아_야간휴일_접근성지수) * 0.3));
    const total_vulnerability_score = Math.round((emergency_score * 0.4 + delivery_score * 0.35 + pediatric_score * 0.25) * 10) / 10;

    // 6. 종합 취약도 4단계 등급 결정
    let final_grade: 취약도_등급 = '정상';
    if (vulnerable_count >= 3 || total_vulnerability_score >= 65) {
      final_grade = '심각';
    } else if (vulnerable_count === 2 || total_vulnerability_score >= 45) {
      final_grade = '취약';
    } else if (vulnerable_count === 1 || total_vulnerability_score >= 25) {
      final_grade = '관찰';
    } else {
      final_grade = '정상';
    }

    return {
      시도코드: raw_data.시도코드,
      시도명: raw_data.시도명,
      시군구코드: raw_data.시군구코드,
      시군구명: raw_data.시군구명,
      인구수: raw_data.인구수,

      응급_60분_미도달_인구비율: raw_data.응급_60분_미도달_인구비율,
      관내_응급_의료이용률: raw_data.관내_응급_의료이용률,
      분만_60분_미도달_인구비율: raw_data.분만_60분_미도달_인구비율,
      관내_분만율: raw_data.관내_분만율,
      소아_병상_공급비율: raw_data.소아_병상_공급비율,
      소아_야간휴일_접근성지수: raw_data.소아_야간휴일_접근성지수,

      응급취약지역_여부: is_emergency_vulnerable,
      분만취약지역_여부: is_delivery_vulnerable,
      소아취약지역_여부: is_pediatric_vulnerable,

      취약분야_수: vulnerable_count,
      종합_취약도_등급: final_grade,
      종합_취약도_점수: total_vulnerability_score,

      응급_판정근거: emergency_reason,
      분만_판정근거: delivery_reason,
      소아_판정근거: pediatric_reason,
    };
  }

  /**
   * 다수 시군구 리스트 전체를 일괄 진단하는 함수
   */
  public static batch_diagnose(data_list: 시군구_원천_데이터[]): 필수의료_진단_결과[] {
    return data_list.map((item) => this.diagnose_region(item));
  }

  /**
   * 시도별 및 전국 단위의 평균 통계를 계산하는 함수
   */
  public static calculate_region_statistics(
    diagnosed_list: 필수의료_진단_결과[],
    target_sido_name?: string
  ): 지역_평균_통계 {
    const filtered_list = target_sido_name
      ? diagnosed_list.filter((item) => item.시도명 === target_sido_name)
      : diagnosed_list;

    const total_count = filtered_list.length;
    if (total_count === 0) {
      return {
        구분명: target_sido_name || '전국',
        지역수: 0,
        총인구수: 0,
        평균_응급_60분_미도달_인구비율: 0,
        평균_관내_응급_의료이용률: 0,
        평균_분만_60분_미도달_인구비율: 0,
        평균_관내_분만율: 0,
        평균_소아_병상_공급비율: 0,
        평균_소아_야간휴일_접근성지수: 0,
        응급취약지역_비율: 0,
        분만취약지역_비율: 0,
        소아취약지역_비율: 0,
      };
    }

    const sum_population = filtered_list.reduce((acc, cur) => acc + cur.인구수, 0);
    const sum_emergency_unreach = filtered_list.reduce((acc, cur) => acc + cur.응급_60분_미도달_인구비율, 0);
    const sum_emergency_ri = filtered_list.reduce((acc, cur) => acc + cur.관내_응급_의료이용률, 0);
    const sum_delivery_unreach = filtered_list.reduce((acc, cur) => acc + cur.분만_60분_미도달_인구비율, 0);
    const sum_delivery_rate = filtered_list.reduce((acc, cur) => acc + cur.관내_분만율, 0);
    const sum_pediatric_bed = filtered_list.reduce((acc, cur) => acc + cur.소아_병상_공급비율, 0);
    const sum_pediatric_access = filtered_list.reduce((acc, cur) => acc + cur.소아_야간휴일_접근성지수, 0);

    const emergency_vulnerable_count = filtered_list.filter((item) => item.응급취약지역_여부).length;
    const delivery_vulnerable_count = filtered_list.filter((item) => item.분만취약지역_여부).length;
    const pediatric_vulnerable_count = filtered_list.filter((item) => item.소아취약지역_여부).length;

    return {
      구분명: target_sido_name || '전국',
      지역수: total_count,
      총인구수: sum_population,
      평균_응급_60분_미도달_인구비율: Number((sum_emergency_unreach / total_count).toFixed(1)),
      평균_관내_응급_의료이용률: Number((sum_emergency_ri / total_count).toFixed(1)),
      평균_분만_60분_미도달_인구비율: Number((sum_delivery_unreach / total_count).toFixed(1)),
      평균_관내_분만율: Number((sum_delivery_rate / total_count).toFixed(1)),
      평균_소아_병상_공급비율: Number((sum_pediatric_bed / total_count).toFixed(1)),
      평균_소아_야간휴일_접근성지수: Number((sum_pediatric_access / total_count).toFixed(1)),
      응급취약지역_비율: Number(((emergency_vulnerable_count / total_count) * 100).toFixed(1)),
      분만취약지역_비율: Number(((delivery_vulnerable_count / total_count) * 100).toFixed(1)),
      소아취약지역_비율: Number(((pediatric_vulnerable_count / total_count) * 100).toFixed(1)),
    };
  }
}

/**
 * 공문서 개조식 사업계획서 서술문 자동 생성기 클래스
 */
export class 사업계획서_문안_생성기 {
  /**
   * 지역 진단 결과와 전국/시도 평균 통계를 기반으로 보건복지부/국립중앙의료원 공모사업 양식 서술문을 생성하는 함수
   */
  public static generate_narrative(
    target_region: 필수의료_진단_결과,
    sido_stat: 지역_평균_통계,
    national_stat: 지역_평균_통계
  ): 사업계획서_서술문_패키지 {
    const full_region_name = `${target_region.시도명} ${target_region.시군구명}`;
    const today_str = new Date().toISOString().split('T')[0];

    // 응급의료 미도달 비율 전국 대비 배수 계산
    const emergency_ratio_vs_nat = national_stat.평균_응급_60분_미도달_인구비율 > 0
      ? (target_region.응급_60분_미도달_인구비율 / national_stat.평균_응급_60분_미도달_인구비율).toFixed(1)
      : '1.0';

    // 1. 추진 배경 및 필요성 (필수의료 인프라 분석)
    const background_text = `  ○ (지역 내 의료접근성 한계) ${full_region_name}은 권역응급의료센터 60분 이내 미도달 인구 비율이 ${target_region.응급_60분_미도달_인구비율.toFixed(1)}%에 달하여 전국 평균(${national_stat.평균_응급_60분_미도달_인구비율.toFixed(1)}%) 대비 ${emergency_ratio_vs_nat}배 높은 수준을 보이고 있으며, 골든타임 확보가 심각하게 위협받고 있음.
  ○ (취약지 지표 심각성) 관내 중증응급환자 자체 충족률(RI)은 ${target_region.관내_응급_의료이용률.toFixed(1)}%로 시·도 평균(${sido_stat.평균_관내_응급_의료이용률.toFixed(1)}%) 및 전국 평균(${national_stat.평균_관내_응급_의료이용률.toFixed(1)}%)을 현저히 하회하여, 중증 응급환자의 타 지역 유출 및 전원 지연 위험이 상존함.`;

    // 2. 법정 기준 충족 여부
    let legal_status_name = '필수의료 일반 관리지역';
    if (target_region.취약분야_수 >= 3) {
      legal_status_name = '필수의료 전면 취약지역 (최우선 지원 대상)';
    } else if (target_region.취약분야_수 === 2) {
      legal_status_name = '필수의료 복합 취약지역 (중점 지원 대상)';
    } else if (target_region.취약분야_수 === 1) {
      legal_status_name = '필수의료 부분 취약지역 (집중 관리 대상)';
    }

    const legal_text = `  ○ (법정 기준 충족 여부) 보건복지부 필수의료 취약지 고시 기준에 의거, 관내 의료이용률(RI)이 ${target_region.관내_응급_의료이용률.toFixed(1)}%로 법정 기준치(30%)를 하회하고 응급 미도달 인구가 ${target_region.응급_60분_미도달_인구비율.toFixed(1)}%에 달하여 [${legal_status_name}]으로 분류됨.
  ○ (3대 필수의료 취약 영역)
    - 응급의료: ${target_region.응급취약지역_여부 ? '【취약】 ' + target_region.응급_판정근거 : '【적정】 법정 기준 충족'}
    - 분만·모자: ${target_region.분만취약지역_여부 ? '【취약】 ' + target_region.분만_판정근거 : '【적정】 법정 기준 충족'}
    - 소아·중증: ${target_region.소아취약지역_여부 ? '【취약】 ' + target_region.소아_판정근거 : '【적정】 법정 기준 충족'}`;

    // 3. 모자·소아 인프라 결핍
    const delivery_reach_gap = (target_region.분만_60분_미도달_인구비율 - national_stat.평균_분만_60분_미도달_인구비율).toFixed(1);
    const pediatric_bed_ratio = sido_stat.평균_소아_병상_공급비율 > 0
      ? Math.round((target_region.소아_병상_공급비율 / sido_stat.평균_소아_병상_공급비율) * 100)
      : 100;

    const maternal_child_text = `  ○ (모자·분만 인프라 붕괴 위기) 관내 분만실 60분 내 미도달 인구 비율이 ${target_region.분만_60분_미도달_인구비율.toFixed(1)}%로 전국 평균 대비 +${delivery_reach_gap}%p 격차를 보이며, 관내 자체 분만율은 ${target_region.관내_분만율.toFixed(1)}%에 불과하여 원정 출산에 따른 산모·신생아 안전사고 위험 가중.
  ○ (소아 야간·휴일 진료 공백) 기준 병상 대비 소아 병상 공급 비율이 ${target_region.소아_병상_공급비율.toFixed(1)}% (시·도 평균 대비 ${pediatric_bed_ratio}%), 야간/휴일 진료 접근성 지수가 ${target_region.소아_야간휴일_접근성지수.toFixed(1)}점에 그쳐 심야 소아 응급 진료체계의 전면적인 공공 인프라 보강이 불가피함.`;

    // 4. 종합 건의 및 사업 추진 당위성
    const conclusion_text = `  ○ (공공보건의료 지원체계 구축 당위성) 상기 분석 결과, ${full_region_name}은 3대 필수의료 영역 중 ${target_region.취약분야_수}개 분야에서 기준치를 심각하게 미달하는 취약지로 공식 진단됨.
  ○ (기대 효과 및 정책 제언) 본 공모사업을 통한 권역-지역 책임의료기관 간 원격 협진 인프라 확충, 당직의료 인건비 지원, 공공 필수의료 전문 인력 유치 지원을 통해 관내 응급 골든타임 내 도달률 20%p 이상 향상 및 필수의료 자체 충족률 제고를 달성하고자 함.`;

    // 전체 통합 문서 빌드
    const full_narrative = `[${full_region_name} 필수의료 취약지 개선 사업계획서]
작성일자: ${today_str}
대상지역: ${full_region_name} (종합 취약도 등급: ${target_region.종합_취약도_등급} / 취약분야: ${target_region.취약분야_수}개)

□ 추진 배경 및 필요성 (필수의료 인프라 분석)
${background_text}

□ 법정 기준 충족 여부 및 취약 분야 진단
${legal_text}

□ 모자·소아 필수의료 인프라 결핍 현황
${maternal_child_text}

□ 종합 의견 및 사업 추진 당위성
${conclusion_text}`;

    return {
      지역명_풀네임: full_region_name,
      생성일시: today_str,
      제목: `[${full_region_name}] 필수의료 취약지 개선 공모사업 계획서 요약`,
      추진배경_필요성: background_text,
      법정기준_충족현황: legal_text,
      모자_소아_인프라결핍: maternal_child_text,
      종합_건의_문안: conclusion_text,
      전체_통합_문안: full_narrative,
    };
  }
}
