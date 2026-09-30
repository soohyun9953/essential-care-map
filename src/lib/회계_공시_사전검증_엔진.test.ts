import { describe, it, expect } from 'vitest';
import {
  validate_public_hospital_accounting,
  검증_시뮬레이션_샘플_목록,
  공시_회계_입력_데이터,
} from './회계_공시_사전검증_엔진';

describe('14대 법정 회계산식 및 이상치 사전검증 엔진 테스트', () => {
  it('정상 모범병원(통영적십자병원) 샘플은 산식 오류 0건, 이상치 0건으로 적합(100점) 판정을 받아야 함', () => {
    const result = validate_public_hospital_accounting(검증_시뮬레이션_샘플_목록.정상_모범병원);

    expect(result.기관명).toContain('통영적십자병원');
    expect(result.산식_오류수).toBe(0);
    expect(result.산식_통과수).toBe(result.총_산식수);
    expect(result.이상치_탐지수).toBe(0);
    expect(result.종합판정).toBe('적합 (제출가능)');
    expect(result.품질점수).toBe(100);
    expect(result.핵심_권고사항[0]).toContain('완벽하게 통과');
  });

  it('영월의료원 실증 사례는 전문의 현원 불일치(산식오류 1건) 및 인건비 전년대비 급변동 이상치를 정확히 검출해야 함', () => {
    const result = validate_public_hospital_accounting(검증_시뮬레이션_샘플_목록.영월의료원_실제사례);

    expect(result.기관명).toContain('영월의료원');
    // 산식 오류 1건 (전문의 현원 합계 검증)
    expect(result.산식_오류수).toBe(1);
    const doctorRule = result.산식_검증목록.find((s) => s.산식명 === '전문의 현원 합계 검증');
    expect(doctorRule?.통과여부).toBe(false);
    expect(doctorRule?.오차).toBe(1); // 18명 vs 19명으로 1명 오차

    // 이상치 1건 이상 (전년대비 +23.2% 인건비 급변동)
    const anomalyWage = result.이상치_검증목록.find((a) => a.항목명.includes('인건비 총액 전년대비 급변동'));
    expect(anomalyWage).toBeDefined();
    expect(anomalyWage?.검사유형).toBe('급변동(+-15%)');

    // 종합 판정은 제출불가(오류의심) - 산식오류가 존재하므로
    expect(result.종합판정).toBe('제출불가 (오류의심)');
    expect(result.품질점수).toBeLessThan(100);
  });

  it('오류다발 가상병원 샘플은 대차불일치, 0원 등록, 허용범위 초과 등 복합 오류를 검출해야 함', () => {
    const result = validate_public_hospital_accounting(검증_시뮬레이션_샘플_목록.오류다발_가상병원);

    // 산식 오류 다수 (자산총계 일치, 대차평형, 보조금, 전문의 등)
    expect(result.산식_오류수).toBeGreaterThanOrEqual(3);

    // 0원 등록 이상치 (인건비 0원)
    const zeroAnomaly = result.이상치_검증목록.find((a) => a.검사유형 === '0원 등록');
    expect(zeroAnomaly).toBeDefined();

    // 임원연봉 3.8억(3억 초과) 이상치
    const execSalaryAnomaly = result.이상치_검증목록.find((a) => a.항목명.includes('임원연봉'));
    expect(execSalaryAnomaly).toBeDefined();

    // 종합 판정
    expect(result.종합판정).toBe('제출불가 (오류의심)');
    expect(result.품질점수).toBeLessThan(60);
  });

  it('수정 z-score 이상치(|z| >= 3) 검증이 정상 동작해야 함', () => {
    const sampleData: 공시_회계_입력_데이터 = {
      ...검증_시뮬레이션_샘플_목록.정상_모범병원,
      인건비: 50000000000, // 통상 150억인데 500억으로 대폭 폭증
      과거5개년_인건비_목록: [14000000000, 14200000000, 14500000000, 15000000000],
    };

    const result = validate_public_hospital_accounting(sampleData);
    const zAnomaly = result.이상치_검증목록.find((a) => a.검사유형 === '수정 z-score');
    expect(zAnomaly).toBeDefined();
    expect(zAnomaly?.심각도).toBe('오류의심');
  });

  it('음수(-) 값 입력 시 즉시 음수값 오류 이상치로 감지해야 함', () => {
    const sampleData: 공시_회계_입력_데이터 = {
      ...검증_시뮬레이션_샘플_목록.정상_모범병원,
      임원연봉: -50000000, // 음수 연봉
    };

    const result = validate_public_hospital_accounting(sampleData);
    const negAnomaly = result.이상치_검증목록.find((a) => a.검사유형 === '음수값 오류');
    expect(negAnomaly).toBeDefined();
  });
});
