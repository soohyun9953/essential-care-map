import { describe, it, expect } from 'vitest';
import {
  calculate_b_set_score,
  get_b_set_critical_number,
  calculate_grid_fulfillment,
  determine_evaluation_grade,
  simulate_hospital_evaluation,
  get_national_evaluation_summary,
  get_hospital_evaluation_data,
} from './지역거점_운영평가_엔진';
import {
  전국_41개_지역거점_공공병원_운영평가_목록,
  운영평가_4대영역_목록,
  연도별_운영평가_종합점수_추이,
  환자만족도_통계_2025,
} from './지역거점_공공병원_운영평가_데이터셋';

describe('2025년 지역거점 공공병원 운영평가 데이터셋 검증', () => {
  it('전국 평가대상 기관은 총 41개소(지방의료원 35개 + 적십자병원 6개)이다', () => {
    expect(전국_41개_지역거점_공공병원_운영평가_목록.length).toBe(41);
    const 지방의료원 = 전국_41개_지역거점_공공병원_운영평가_목록.filter(
      (h) => !h.기관명.includes('적십자')
    );
    const 적십자병원 = 전국_41개_지역거점_공공병원_운영평가_목록.filter(
      (h) => h.기관명.includes('적십자')
    );
    expect(지방의료원.length).toBe(35);
    expect(적십자병원.length).toBe(6);
  });

  it('4대 영역의 가중치 합계는 100%이다', () => {
    const sum = 운영평가_4대영역_목록.reduce((acc, d) => acc + d.가중치, 0);
    expect(sum).toBe(100);
    expect(운영평가_4대영역_목록.find((d) => d.코드 === 'quality')?.가중치).toBe(30);
    expect(운영평가_4대영역_목록.find((d) => d.코드 === 'public')?.가중치).toBe(30);
    expect(운영평가_4대영역_목록.find((d) => d.코드 === 'rational')?.가중치).toBe(20);
    expect(운영평가_4대영역_목록.find((d) => d.코드 === 'responsibility')?.가중치).toBe(20);
  });

  it('2025년 전국 종합점수 공식 평균은 77.9점이다', () => {
    const summary = get_national_evaluation_summary();
    expect(summary.종합점수_평균).toBe(77.9);
  });

  it('2025년 A등급 획득 기관은 15개소이다', () => {
    const summary = get_national_evaluation_summary();
    expect(summary.등급별_분포.A).toBe(15);
  });

  it('2025년 환자 종합만족도는 90.7점(외래 88.8점, 입원 92.5점)이다', () => {
    expect(환자만족도_통계_2025.종합만족도).toBe(90.7);
    expect(환자만족도_통계_2025.외래.종합).toBe(88.8);
    expect(환자만족도_통계_2025.입원.종합).toBe(92.5);
  });

  it('2006년부터 2025년까지 20개년 시계열 추이 데이터가 완비되어 있다', () => {
    expect(연도별_운영평가_종합점수_추이.length).toBe(20);
    expect(연도별_운영평가_종합점수_추이[0].전체_종합점수).toBe(61.3);
    expect(연도별_운영평가_종합점수_추이[연도별_운영평가_종합점수_추이.length - 1].전체_종합점수).toBe(77.9);
  });
});

describe('B-set 점수종합 알고리즘 검증 (부록 3 표 10-5, 10-6, 10-7)', () => {
  it('N=2인 경우 예외 규정(특정개수 2)에 따라 B-set 표 10-7 종합결과와 정확히 일치한다', () => {
    expect(get_b_set_critical_number(2)).toBe(2);
    expect(calculate_b_set_score([4, 4])).toBe(4);
    expect(calculate_b_set_score([4, 3])).toBe(3);
    expect(calculate_b_set_score([4, 2])).toBe(3);
    expect(calculate_b_set_score([4, 1])).toBe(3);
    expect(calculate_b_set_score([4, 0])).toBe(3);
    expect(calculate_b_set_score([3, 3])).toBe(3);
    expect(calculate_b_set_score([3, 2])).toBe(3);
    expect(calculate_b_set_score([2, 2])).toBe(2);
    expect(calculate_b_set_score([2, 1])).toBe(2);
    expect(calculate_b_set_score([2, 0])).toBe(2);
    expect(calculate_b_set_score([1, 1])).toBe(1);
    expect(calculate_b_set_score([1, 0])).toBe(1);
    expect(calculate_b_set_score([0, 0])).toBe(0);
  });

  it('N=8인 응급실 세부조사항목 예시(표 10-6)에서 올바른 결과를 도출한다', () => {
    // critical number = 4
    expect(get_b_set_critical_number(8)).toBe(4);

    // A병원: [4,4,4,4,4,4,4,4] -> 4점
    expect(calculate_b_set_score([4, 4, 4, 4, 4, 4, 4, 4])).toBe(4);

    // B병원: [4,2,4,4,2,4,4,4] -> 2점 이하 2개(<4), 모두4점 아님 -> 3점
    expect(calculate_b_set_score([4, 2, 4, 4, 2, 4, 4, 4])).toBe(3);

    // C병원: [4,1,4,4,2,2,4,4] -> 2점 이하 3개(<4) -> 3점
    expect(calculate_b_set_score([4, 1, 4, 4, 2, 2, 4, 4])).toBe(3);

    // E병원: [4,4,0,2,2,0,4,1] -> 2점 이하가 [0,2,2,0,1] 5개(>=4) -> 2점!
    expect(calculate_b_set_score([4, 4, 0, 2, 2, 0, 4, 1])).toBe(2);
  });

  it('충족률 기반 평가분야 점수화가 올바르게 작동한다', () => {
    // 4개 기준 모두 4점 (16 / 16 = 100%) -> 4점
    expect(calculate_grid_fulfillment([4, 4, 4, 4])).toEqual({ 충족률: 100, 점수: 4 });
    // 충족률 80% (13 / 16 = 81.25%) -> 3점
    expect(calculate_grid_fulfillment([4, 3, 3, 3]).점수).toBe(3);
    // 충족률 60% (10 / 16 = 62.5%) -> 2점
    expect(calculate_grid_fulfillment([3, 3, 2, 2]).점수).toBe(2);
  });
});

describe('운영평가 자가진단 시뮬레이션 및 벤치마킹 검증', () => {
  it('2025년 전국 평균값 입력 시 정확히 종합점수 77.8점(반올림)과 B등급이 산출된다', () => {
    const result = simulate_hospital_evaluation({
      양질의_의료_일반진료: 69.9,
      양질의_의료_환자만족: 90.7,
      공익적_의료지원체계: 79.3,
      공익적_포용적의료: 75.9,
      공익적_특화서비스: 87.6,
      합리적_경영관리: 80.8,
      합리적_경영성과: 70.1,
      책임_거버넌스: 82.6,
      책임_리더십: 53.7,
      책임_윤리경영: 88.4,
      책임_작업환경: 80.9,
    });

    expect(result.종합점수).toBe(77.8);
    expect(result.등급).toBe('B');
    expect(result.영역별_점수.양질의_의료).toBe(76.1);
    expect(result.영역별_점수.공익적_보건의료).toBe(82.8);
    expect(result.영역별_점수.합리적_운영).toBeCloseTo(75.5, 0);
    expect(result.영역별_점수.책임_운영).toBe(75.3);
    expect(result.A등급_달성_차이).toBe(2.2);
  });

  it('김천의료원, 서귀포의료원 등 우수 기관 조회가 정상 동작한다', () => {
    const 김천 = get_hospital_evaluation_data('김천의료원');
    expect(김천).toBeDefined();
    expect(김천?.종합점수).toBeGreaterThanOrEqual(88);
    expect(김천?.등급).toBe('A');
    expect(김천?.우수_사례_선정).toBe(true);

    const 서귀포 = get_hospital_evaluation_data('서귀포의료원');
    expect(서귀포).toBeDefined();
    expect(서귀포?.등급).toBe('A');
    expect(서귀포?.우수_사례_선정).toBe(true);
  });
});
