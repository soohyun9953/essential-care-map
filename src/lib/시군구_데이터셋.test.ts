import { describe, it, expect } from 'vitest';
import { 전국_시군구_진단_데이터 } from './시군구_데이터셋';
import { 시군구_지표_시계열 } from './헬스맵_주제도_지표_데이터셋';

describe('시군구 진단 데이터셋 (헬스맵 2024)', () => {
  it('250개 시군구, 시군구코드 중복 없음, 시도코드 = 코드 앞 2자리', () => {
    expect(전국_시군구_진단_데이터).toHaveLength(250);
    expect(new Set(전국_시군구_진단_데이터.map((r) => r.시군구코드)).size).toBe(250);
    for (const r of 전국_시군구_진단_데이터) expect(r.시군구코드.slice(0, 2)).toBe(r.시도코드);
  });

  it('응급·분만 값이 헬스맵 원자료(2024)와 일치한다', () => {
    const hm = Object.values(시군구_지표_시계열 as Record<string, any>);
    const 영월 = hm.find((v) => v.sigungu === '영월군');
    const r = 전국_시군구_진단_데이터.find((x) => x.시군구명 === '영월군')!;
    expect(r.시군구코드).toBe('51750');
    expect(r.응급_60분_미도달_인구비율).toBeCloseTo(영월.indicators.BBB01.values['2024'], 2);
    expect(r.관내_응급_의료이용률).toBeCloseTo(영월.indicators.CBB04.values['2024'], 2);
    expect(r.분만_60분_미도달_인구비율).toBeCloseTo(영월.indicators.BBD01.values['2024'], 2);
    expect(r.관내_분만율).toBeCloseTo(영월.indicators.CBD01.values['2024'], 2);
  });

  it('소아 지표는 실데이터가 없어 모두 null', () => {
    expect(전국_시군구_진단_데이터.every((r) => r.소아_병상_공급비율 === null && r.소아_야간휴일_접근성지수 === null)).toBe(true);
  });
});
