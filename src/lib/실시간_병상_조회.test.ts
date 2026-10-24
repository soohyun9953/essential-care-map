import { afterEach, describe, expect, it, vi } from 'vitest';
import { 실시간_병상_조회, 주소_시군구 } from './실시간_병상_조회';

const 대상 = [{ 시도명: '대구광역시', 시군구명: '동구', 기관명: '대구파티마병원' }];

describe('E-Gen 실시간 병상 조회', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('실시간 연동이 아니면 병상 정보를 돌려주지 않는다 (내장 기준 데이터 숫자 미사용)', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, json: async () => ({ is_live_api: false, all_hospitals: [{ 기관명: '대구파티마병원', 응급실_가용병상: 3 }] }) })));
    const r = await 실시간_병상_조회(대상);
    expect(r.연동됨).toBe(false);
    expect(r.기관별.size).toBe(0);
  });

  it('실시간 연동이면 공백·부분 일치로 기관을 맞춘다', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, json: async () => ({ is_live_api: true, all_hospitals: [{ 기관명: '대구 파티마병원', 응급실_가용병상: 3 }] }) })));
    const r = await 실시간_병상_조회([...대상, { 시도명: '대구광역시', 시군구명: '동구', 기관명: '없는병원' }]);
    expect(r.연동됨).toBe(true);
    expect(r.기관별.get('대구파티마병원')?.응급실_가용병상).toBe(3);
    expect(r.기관별.get('없는병원')).toBeNull();
  });

  it('주소에서 시도·시군구를 찾는다', () => {
    expect(주소_시군구('대구광역시 동구 아양로 99')).toEqual({ 시도명: '대구광역시', 시군구명: '동구' });
  });
});
