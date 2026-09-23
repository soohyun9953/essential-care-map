/**
 * 공공보건의료 인프라 확충 효과 시뮬레이션 연산 엔진
 * 
 * - 병상 증설(일반/ICU/투석/응급), 전문의 충원, 첨단장비 도입에 따른
 *   관내 자체충족률(RI) 상승, 관외 유출 환자 흡수량, 군민 경제적 편익 정밀 추계
 * - 보건복지부 병상수급 기본시책 및 국립중앙의료원 공공병원 진료역량 수식 준용
 */

import { 시군구_환자_유출입_데이터, get_patient_flow_data } from './환자_유출입_데이터셋';
import { get_nearest_public_hospital, 공공의료기관_정보 } from './공공의료기관_데이터셋';
import { 필수의료_진단_결과 } from './필수의료_타입';

export interface 시뮬레이션_입력_파라미터 {
  sgg_name: string;
  sido_name: string;
  add_general_beds: number;      // 일반/급성기 병상 (0 ~ 150)
  add_icu_beds: number;          // 중환자실(ICU) 병상 (0 ~ 20)
  add_dialysis_beds: number;     // 인공신장실(투석) 병상 (0 ~ 25)
  add_er_beds: number;           // 응급실 관찰병상 (0 ~ 15)
  add_specialists: number;       // 필수의료 전문의 충원 (0 ~ 10명)
  bed_occupancy_rate: number;    // 목표 병상가동률 (60 ~ 95%, 기본 82)
  has_mri: boolean;              // 고해상도 MRI 도입
  has_ct: boolean;               // 128채널 이상 CT 도입
  has_angio: boolean;            // 심뇌혈관 조영장비(Angio) 도입
}

export interface 유출지별_흡수_예측 {
  dest_sgg: string;
  dest_sido: string;
  original_days: number;
  original_pct: number;
  absorbed_days: number;
  remaining_days: number;
  new_pct: number;
}

export interface 시뮬레이션_예측_결과 {
  sgg_name: string;
  sido_name: string;
  public_hospital: 공공의료기관_정보 | null;
  
  // 병상 및 인력 요약
  current_beds: number;
  new_total_beds: number;
  total_added_beds: number;
  added_specialists: number;

  // 자체충족률(RI) 변화
  original_ri: number;
  simulated_ri: number;
  ri_gain_pct_point: number;

  // 관외 유출률 변화
  original_outflow_rate: number;
  simulated_outflow_rate: number;
  outflow_reduction_pct_point: number;

  // 환자 재원일수 변화
  total_patient_days: number;
  original_self_days: number;
  simulated_self_days: number;
  total_absorbed_days: number;

  // 상위 유출지별 흡수 내역
  dest_absorptions: 유출지별_흡수_예측[];

  // 경제적·사회적 편익
  resident_economic_benefit: number;  // 군민 원정진료비/교통비 절감 (원)
  hospital_annual_revenue: number;    // 의료원 연간 진료수익 증분 (원)
  golden_hour_coverage_pct: number;  // 60분 골든타임 도달률 예측 (%)

  // AI 정책 제언 및 요약 총평
  summary_narrative: string;
}

export interface 시뮬레이션_프리셋 {
  id: 'small' | 'medium' | 'large';
  title: string;
  desc: string;
  params: Partial<시뮬레이션_입력_파라미터>;
}

export const 시뮬레이션_기본_프리셋: 시뮬레이션_프리셋[] = [
  {
    id: 'small',
    title: '단기 기능보강 (+30병상)',
    desc: '인공신장실 10병상 + 급성기 20병상 + 전문의 2명 충원',
    params: {
      add_general_beds: 20,
      add_icu_beds: 0,
      add_dialysis_beds: 10,
      add_er_beds: 0,
      add_specialists: 2,
      bed_occupancy_rate: 80,
      has_mri: false,
      has_ct: true,
      has_angio: false,
    },
  },
  {
    id: 'medium',
    title: '중규모 병동 확충 (+70병상)',
    desc: '중환자실 6병상 + 투석실 14병상 + 일반 40병상 + 응급 10병상 + 전문의 4명',
    params: {
      add_general_beds: 40,
      add_icu_beds: 6,
      add_dialysis_beds: 14,
      add_er_beds: 10,
      add_specialists: 4,
      bed_occupancy_rate: 82,
      has_mri: true,
      has_ct: true,
      has_angio: false,
    },
  },
  {
    id: 'large',
    title: '거점의료원 이전신축 (+130병상)',
    desc: '심뇌혈관센터 + ICU 12병상 + 투석 20병상 + 일반 85병상 + 전문의 8명 + 첨단장비 풀세트',
    params: {
      add_general_beds: 85,
      add_icu_beds: 12,
      add_dialysis_beds: 20,
      add_er_beds: 13,
      add_specialists: 8,
      bed_occupancy_rate: 85,
      has_mri: true,
      has_ct: true,
      has_angio: true,
    },
  },
];

/**
 * 시뮬레이션 예측 연산 실행기
 */
export function calculate_simulation(
  params: 시뮬레이션_입력_파라미터,
  target_region?: 필수의료_진단_결과 | null
): 시뮬레이션_예측_결과 {
  const flow_data = get_patient_flow_data(params.sgg_name);
  const hospital_res = get_nearest_public_hospital(params.sido_name, params.sgg_name);
  const public_hosp = hospital_res ? hospital_res.hospital : null;

  const current_beds = public_hosp?.병상수 || 200;
  const total_added_beds =
    params.add_general_beds +
    params.add_icu_beds +
    params.add_dialysis_beds +
    params.add_er_beds;
  const new_total_beds = current_beds + total_added_beds;

  // 원천 재원일수
  const total_patient_days = flow_data?.total_days || 150000;
  const original_self_days = flow_data?.self_days || Math.round(total_patient_days * 0.25);
  const original_ri = flow_data?.ri ?? 25.0;
  const original_outflow_rate = flow_data?.outflow_rate ?? 75.0;
  const total_outflow_days = total_patient_days - original_self_days;

  // 1. 진료역량 승수 (전문의 충원 및 첨단장비 가중치)
  const equipment_bonus =
    (params.has_mri ? 0.06 : 0) +
    (params.has_ct ? 0.04 : 0) +
    (params.has_angio ? 0.08 : 0);
  const doctor_multiplier = 1 + params.add_specialists * 0.05 + equipment_bonus;

  // 2. 신규 공급 수용능력 (Capacity, 일/년)
  // 병상수 * 365 * 가동률 * 역량승수
  const annual_new_capacity =
    total_added_beds *
    365 *
    (params.bed_occupancy_rate / 100) *
    Math.min(doctor_multiplier, 1.55);

  // 3. 실제 관외 유출 흡수 가능량 (상한: 전체 유출량의 65%)
  const max_absorbable = total_outflow_days * 0.65;
  const total_absorbed_days = Math.min(
    Math.round(annual_new_capacity * 0.88),
    Math.round(max_absorbable)
  );

  // 4. 새로운 자체충족률(RI) 계산
  const simulated_self_days = original_self_days + total_absorbed_days;
  const simulated_ri = Math.min(
    Number(((simulated_self_days / total_patient_days) * 100).toFixed(1)),
    85.0
  );
  const ri_gain_pct_point = Number((simulated_ri - original_ri).toFixed(1));

  // 5. 새로운 관외 유출률
  const simulated_outflow_rate = Number((100 - simulated_ri).toFixed(1));
  const outflow_reduction_pct_point = Number(
    (original_outflow_rate - simulated_outflow_rate).toFixed(1)
  );

  // 6. 상위 유출지별 환자 흡수량 분배
  const dest_absorptions: 유출지별_흡수_예측[] = [];
  const non_self_outflows = flow_data?.outflow_top.filter((x) => !x.is_self) || [];
  const total_non_self_days = non_self_outflows.reduce((acc, c) => acc + c.days, 0) || 1;

  non_self_outflows.slice(0, 5).forEach((dest) => {
    // 유출 비중에 비례하여 흡수
    const share = dest.days / total_non_self_days;
    const dest_absorbed = Math.min(Math.round(total_absorbed_days * share), dest.days);
    const remaining_days = Math.max(dest.days - dest_absorbed, 0);
    const new_pct = Number(((remaining_days / total_patient_days) * 100).toFixed(1));

    dest_absorptions.push({
      dest_sgg: dest.dest_sgg,
      dest_sido: dest.dest_sido,
      original_days: dest.days,
      original_pct: dest.pct,
      absorbed_days: dest_absorbed,
      remaining_days: remaining_days,
      new_pct: new_pct,
    });
  });

  // 7. 군민 원정진료 경제적 편익 (교통비 4.5만 + 간병숙박비 4.0만 = 1일당 8.5만원 절감)
  const resident_economic_benefit = total_absorbed_days * 85000;

  // 8. 의료원 연간 진료수익 증분 (1일당 평균 입원진료비 28만원 기준)
  const hospital_annual_revenue = total_absorbed_days * 280000;

  // 9. 60분 골든타임 도달률 예측 (기존 대비 최대 30%p 개선)
  const base_golden = target_region ? 100 - target_region.응급_60분_미도달_인구비율 : 47.6;
  const golden_bonus = Math.min((params.add_er_beds * 1.2) + (params.add_icu_beds * 1.5) + (params.has_angio ? 6 : 0), 32);
  const golden_hour_coverage_pct = Math.min(Number((base_golden + golden_bonus).toFixed(1)), 88.5);

  // 10. AI 시뮬레이션 정책 진단 브리핑 문안
  const top_target = dest_absorptions[0];
  const summary_narrative = `
[시뮬레이션 종합 결론] ${params.sido_name} ${params.sgg_name}에 총 ${total_added_beds}병상(일반 ${params.add_general_beds}, 투석 ${params.add_dialysis_beds}, ICU ${params.add_icu_beds}, 응급 ${params.add_er_beds}) 확충 및 전문의 ${params.add_specialists}명 충원 시,
관내 자체충족률(RI)은 현행 ${original_ri}%에서 ${simulated_ri}%로 +${ri_gain_pct_point}%p 비약적으로 상승합니다.
특히 최다 유출지인 ${top_target ? `${top_target.dest_sido} ${top_target.dest_sgg}` : '인접 대도시'}로 빠져나가던 환자 중 연간 ${total_absorbed_days.toLocaleString()}일의 재원일수를 관내에서 흡수하여,
군민들의 원정진료 교통·간병비 부담을 연간 약 ${(resident_economic_benefit / 100000000).toFixed(1)}억 원 절감하고 지방의료원의 경영 수지를 크게 개선할 수 있습니다.
  `.trim();

  return {
    sgg_name: params.sgg_name,
    sido_name: params.sido_name,
    public_hospital: public_hosp,
    current_beds,
    new_total_beds,
    total_added_beds,
    added_specialists: params.add_specialists,
    original_ri,
    simulated_ri,
    ri_gain_pct_point,
    original_outflow_rate,
    simulated_outflow_rate,
    outflow_reduction_pct_point,
    total_patient_days,
    original_self_days,
    simulated_self_days,
    total_absorbed_days,
    dest_absorptions,
    resident_economic_benefit,
    hospital_annual_revenue,
    golden_hour_coverage_pct,
    summary_narrative,
  };
}
