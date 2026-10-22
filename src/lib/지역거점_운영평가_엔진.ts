// 2025년 지역거점 공공병원 운영평가 B-set 점수종합 및 시뮬레이션 엔진
// 근거: 국립중앙의료원 / 보건복지부 결과보고서 부록 3 (평가기준의 구조 및 결과 종합방법)

import {
  운영평가_4대영역_목록,
  전국_41개_지역거점_공공병원_운영평가_목록,
  공공병원_운영평가_기관_데이터,
  평가_등급,
  평가_영역_코드,
} from './지역거점_공공병원_운영평가_데이터셋';

/**
 * 1. B-set 특정 개수 (Critical Numbers) 산출 함수
 * N개의 하위요소를 종합할 때 N/2를 반올림한 정수값
 * 단, N=2인 경우 예외적으로 2개 적용
 */
export function get_b_set_critical_number(n: number): number {
  if (n <= 1) return 1;
  if (n === 2) return 2; // 표 10-7 예외 규정
  return Math.round(n / 2);
}

/**
 * 2. B-set 점수 종합 알고리즘 (부록 3 표 10-5, 표 10-7)
 * - N개가 모두 4점이면 4점
 * - 특정개수 이상이 0점 이하이면 0점
 * - 특정개수 이상이 1점 이하이면 1점
 * - 특정개수 이상이 2점 이하이면 2점
 * - 그 외는 모두 3점
 */
export function calculate_b_set_score(scores: number[]): number {
  if (!scores || scores.length === 0) return 0;
  const n = scores.length;
  if (n === 1) return Math.min(4, Math.max(0, scores[0]));

  const critical = get_b_set_critical_number(n);

  // 1) 0점 판정: 특정 개수 이상이 0점 이하
  const count_0 = scores.filter((s) => s <= 0).length;
  if (count_0 >= critical) return 0;

  // 2) 1점 판정: 특정 개수 이상이 1점 이하
  const count_1 = scores.filter((s) => s <= 1).length;
  if (count_1 >= critical) return 1;

  // 3) 2점 판정: 특정 개수 이상이 2점 이하
  const count_2 = scores.filter((s) => s <= 2).length;
  if (count_2 >= critical) return 2;

  // 4) 4점 판정: N개가 모두 4점일 때
  const count_4 = scores.filter((s) => s >= 4).length;
  if (count_4 === n) return 4;

  // 5) 나머지 기본값: 3점
  return 3;
}

/**
 * 3. 평가분야(Grid) 충족률 및 점수화 (부록 3 2.3절 표 10-9)
 * 충족률(%) = (실제 점수 합 / (기준개수 N * 4)) * 100
 * - 90% 이상: 4점
 * - 70% 이상 ~ 90% 미만: 3점
 * - 50% 이상 ~ 70% 미만: 2점
 * - 30% 이상 ~ 50% 미만: 1점
 * - 30% 미만: 0점
 */
export function calculate_grid_fulfillment(standard_scores: number[]): {
  충족률: number;
  점수: number;
} {
  if (!standard_scores || standard_scores.length === 0) {
    return { 충족률: 0, 점수: 0 };
  }
  const sum = standard_scores.reduce((a, b) => a + b, 0);
  const max_possible = standard_scores.length * 4;
  const fulfillment = Math.round((sum / max_possible) * 1000) / 10; // 소수점 1자리

  let score = 0;
  if (fulfillment >= 90) score = 4;
  else if (fulfillment >= 70) score = 3;
  else if (fulfillment >= 50) score = 2;
  else if (fulfillment >= 30) score = 1;
  else score = 0;

  return { 충족률: fulfillment, 점수: score };
}

/**
 * 4. 등급 판정 함수 (보고서 74p)
 */
export function determine_evaluation_grade(total_score: number): 평가_등급 {
  if (total_score >= 80.0) return 'A';
  if (total_score >= 70.0) return 'B';
  if (total_score >= 60.0) return 'C';
  return 'D';
}

/**
 * 5. 종합 평가 결과 계산 (100점 만점)
 */
export interface 병원_평가_시뮬레이션_입력 {
  양질의_의료_일반진료: number; // 0~100 (부문 가중치 70%)
  양질의_의료_환자만족: number; // 0~100 (부문 가중치 30%)
  공익적_의료지원체계: number; // 0~100 (부문 가중치 30%)
  공익적_포용적의료: number;   // 0~100 (부문 가중치 20%)
  공익적_특화서비스: number;   // 0~100 (부문 가중치 50%)
  합리적_경영관리: number;     // 0~100 (부문 가중치 50%)
  합리적_경영성과: number;     // 0~100 (부문 가중치 50%)
  책임_거버넌스: number;       // 0~100 (부문 가중치 20%)
  책임_리더십: number;         // 0~100 (부문 가중치 30%)
  책임_윤리경영: number;       // 0~100 (부문 가중치 30%)
  책임_작업환경: number;       // 0~100 (부문 가중치 20%)
}

export interface 병원_평가_시뮬레이션_결과 {
  종합점수: number;
  등급: 평가_등급;
  영역별_점수: {
    양질의_의료: number;     // 가중치 30%
    공익적_보건의료: number; // 가중치 30%
    합리적_운영: number;     // 가중치 20%
    책임_운영: number;       // 가중치 20%
  };
  부문별_점수: Record<string, number>;
  A등급_달성_차이: number; // 80점 도달까지 필요한 점수 (0이면 이미 A)
  개선_우선순위_제안: {
    부문명: string;
    현재점수: number;
    전국평균: number;
    영역가중치_기여도: number;
    권고사항: string;
  }[];
}

export function simulate_hospital_evaluation(
  input: 병원_평가_시뮬레이션_입력
): 병원_평가_시뮬레이션_결과 {
  // 1. 영역별 100점 만점 산출
  const score_quality =
    input.양질의_의료_일반진료 * 0.7 + input.양질의_의료_환자만족 * 0.3;
  const score_public =
    input.공익적_의료지원체계 * 0.3 +
    input.공익적_포용적의료 * 0.2 +
    input.공익적_특화서비스 * 0.5;
  const score_rational =
    input.합리적_경영관리 * 0.5 + input.합리적_경영성과 * 0.5;
  const score_responsibility =
    input.책임_거버넌스 * 0.2 +
    input.책임_리더십 * 0.3 +
    input.책임_윤리경영 * 0.3 +
    input.책임_작업환경 * 0.2;

  // 2. 최종 100점 만점 종합점수 (가중치 30 : 30 : 20 : 20)
  const total =
    score_quality * 0.3 +
    score_public * 0.3 +
    score_rational * 0.2 +
    score_responsibility * 0.2;
  const rounded_total = Math.round(total * 10) / 10;
  const grade = determine_evaluation_grade(rounded_total);

  // 3. 전국 평균과의 갭 및 개선 우선순위 산출
  const benchmark_gaps = [
    {
      부문명: '양질의 의료 - 일반진료서비스',
      현재점수: input.양질의_의료_일반진료,
      전국평균: 69.9,
      가중기여: 0.3 * 0.7, // 0.21
      권고사항: '필수진료과 전문의 인력 충원 및 CP 모니터링 관리율 제고',
    },
    {
      부문명: '양질의 의료 - 환자만족도',
      현재점수: input.양질의_의료_환자만족,
      전국평균: 90.7,
      가중기여: 0.3 * 0.3, // 0.09
      권고사항: '의사 진료서비스 경청·설명력 향상 및 예약 대기시간 안내 개선',
    },
    {
      부문명: '공익적 보건의료 - 의료지원 체계 및 연계',
      현재점수: input.공익적_의료지원체계,
      전국평균: 79.3,
      가중기여: 0.3 * 0.3, // 0.09
      권고사항: '공공의료 전담인력 확보 및 지역사회 유관기관 정기 회의 실적 확대',
    },
    {
      부문명: '공익적 보건의료 - 포용적 의료이용',
      현재점수: input.공익적_포용적의료,
      전국평균: 75.9,
      가중기여: 0.3 * 0.2, // 0.06
      권고사항: '간호간병통합서비스 및 호스피스·연명의료결정제도 참여 요건 완비',
    },
    {
      부문명: '공익적 보건의료 - 병원별 특화서비스',
      현재점수: input.공익적_특화서비스,
      전국평균: 87.6,
      가중기여: 0.3 * 0.5, // 0.15
      권고사항: '공공보건의료계획 1분야 필수의료제공 사업 실적 및 모니터링 고도화',
    },
    {
      부문명: '합리적 운영 - 경영관리',
      현재점수: input.합리적_경영관리,
      전국평균: 80.8,
      가중기여: 0.2 * 0.5, // 0.10
      권고사항: '공동구매 품목 8대 전 영역 확대 및 의사 성과관리 다각화',
    },
    {
      부문명: '합리적 운영 - 경영성과',
      현재점수: input.합리적_경영성과,
      전국평균: 70.1,
      가중기여: 0.2 * 0.5, // 0.10
      권고사항: '병상이용률 회복(60% 이상) 및 전문의 1인당 조정환자수 증대',
    },
    {
      부문명: '책임 운영 - 거버넌스',
      현재점수: input.책임_거버넌스,
      전국평균: 82.6,
      가중기여: 0.2 * 0.2, // 0.04
      권고사항: '주민참여위원회 정기 개최 및 안건 발의·결과 공유 이행',
    },
    {
      부문명: '책임 운영 - 리더십',
      현재점수: input.책임_리더십,
      전국평균: 53.7,
      가중기여: 0.2 * 0.3, // 0.06
      권고사항: '내부고객 직원·리더십 만족도 제고 및 조직관리·동기부여 개선',
    },
    {
      부문명: '책임 운영 - 윤리경영',
      현재점수: input.책임_윤리경영,
      전국평균: 88.4,
      가중기여: 0.2 * 0.3, // 0.06
      권고사항: '원내 자체감사 시스템 연 2회 이상 정기 운영 및 청렴 노력 강화',
    },
    {
      부문명: '책임 운영 - 작업환경',
      현재점수: input.책임_작업환경,
      전국평균: 80.9,
      가중기여: 0.2 * 0.2, // 0.04
      권고사항: '장애인 의무고용률(3.8%) 준수 및 안전보건관리체계 정착',
    },
  ];

  // 개선 효과가 가장 큰(가중기여 * 평균 대비 부족분) 순서로 정렬
  const recommendations = benchmark_gaps
    .map((item) => ({
      ...item,
      개선효과: Math.max(0, item.전국평균 - item.현재점수) * item.가중기여,
    }))
    .sort((a, b) => b.개선효과 - a.개선효과)
    .slice(0, 4)
    .map(({ 부문명, 현재점수, 전국평균, 가중기여, 권고사항 }) => ({
      부문명,
      현재점수,
      전국평균,
      영역가중치_기여도: Math.round(가중기여 * 100),
      권고사항,
    }));

  return {
    종합점수: Number(total.toFixed(1)),
    등급: grade,
    영역별_점수: {
      양질의_의료: Number(score_quality.toFixed(1)),
      공익적_보건의료: Number(score_public.toFixed(1)),
      합리적_운영: Number(score_rational.toFixed(1)),
      책임_운영: Number(score_responsibility.toFixed(1)),
    },
    부문별_점수: {
      '1.1': input.양질의_의료_일반진료,
      '1.2': input.양질의_의료_환자만족,
      '2.1': input.공익적_의료지원체계,
      '2.2': input.공익적_포용적의료,
      '2.3': input.공익적_특화서비스,
      '3.1': input.합리적_경영관리,
      '3.2': input.합리적_경영성과,
      '4.1': input.책임_거버넌스,
      '4.2': input.책임_리더십,
      '4.3': input.책임_윤리경영,
      '4.4': input.책임_작업환경,
    },
    A등급_달성_차이: Math.max(0, Math.round((80.0 - rounded_total) * 10) / 10),
    개선_우선순위_제안: recommendations,
  };
}

/**
 * 6. 기관별 운영평가 프로필 검색 및 벤치마크 조회
 */
export function get_hospital_evaluation_data(
  hospital_name: string
): 공공병원_운영평가_기관_데이터 | undefined {
  return 전국_41개_지역거점_공공병원_운영평가_목록.find(
    (h) =>
      h.기관명 === hospital_name ||
      h.기관명.includes(hospital_name) ||
      hospital_name.includes(h.기관명)
  );
}

/**
 * 7. 전국 41개 병원 종합 통계 요약
 */
export function get_national_evaluation_summary() {
  const list = 전국_41개_지역거점_공공병원_운영평가_목록;
  const count = list.length;
  const avg_total = Math.round((list.reduce((acc, h) => acc + h.종합점수, 0) / count) * 10) / 10;
  const avg_quality = Math.round((list.reduce((acc, h) => acc + h.양질의_의료_점수, 0) / count) * 10) / 10;
  const avg_public = Math.round((list.reduce((acc, h) => acc + h.공익적_보건의료_점수, 0) / count) * 10) / 10;
  const avg_rational = Math.round((list.reduce((acc, h) => acc + h.합리적_운영_점수, 0) / count) * 10) / 10;
  const avg_responsibility = Math.round((list.reduce((acc, h) => acc + h.책임_운영_점수, 0) / count) * 10) / 10;

  const count_a = list.filter((h) => h.등급 === 'A').length;
  const count_b = list.filter((h) => h.등급 === 'B').length;
  const count_c = list.filter((h) => h.등급 === 'C').length;
  const count_d = list.filter((h) => h.등급 === 'D').length;

  return {
    총기관수: count,
    종합점수_평균: avg_total,
    양질의_의료_평균: avg_quality,
    공익적_보건의료_평균: avg_public,
    합리적_운영_평균: avg_rational,
    책임_운영_평균: avg_responsibility,
    등급별_분포: {
      A: count_a,
      B: count_b,
      C: count_c,
      D: count_d,
    },
  };
}
