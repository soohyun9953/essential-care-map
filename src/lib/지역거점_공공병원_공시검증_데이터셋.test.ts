import { describe, it, expect } from 'vitest';
import {
  전국_41개_지역거점공공병원_공시검증_목록,
  통합공시_3대영역_통계,
  통합공시_14대_회계산출식,
} from './지역거점_공공병원_공시검증_데이터셋';

describe('지역거점 공공병원 알리미 통합공시 검증 데이터셋 테스트', () => {
  it('42개 기관 목록의 오류의심 건수 총합이 216건이어야 한다', () => {
    const total_suspect = 전국_41개_지역거점공공병원_공시검증_목록.reduce(
      (acc, cur) => acc + cur.오류의심_건수,
      0
    );
    expect(total_suspect).toBe(216);
  });

  it('42개 기관 목록의 검토요청 건수 총합이 1,877건이어야 한다', () => {
    const total_review = 전국_41개_지역거점공공병원_공시검증_목록.reduce(
      (acc, cur) => acc + cur.검토요청_건수,
      0
    );
    expect(total_review).toBe(1877);
  });

  it('전체 점검 건수 합계가 2,093건이어야 한다', () => {
    const total = 전국_41개_지역거점공공병원_공시검증_목록.reduce(
      (acc, cur) => acc + cur.총_점검_건수,
      0
    );
    expect(total).toBe(2093);
  });

  it('14대 법정 회계산출식이 정확히 14개 등록되어 있어야 한다', () => {
    expect(통합공시_14대_회계산출식.length).toBe(14);
  });

  it('3대 영역 통계의 오류의심 합계가 216건이어야 한다', () => {
    const sum_suspect = 통합공시_3대영역_통계.reduce((acc, cur) => acc + cur.오류의심, 0);
    expect(sum_suspect).toBe(216);
  });
});
