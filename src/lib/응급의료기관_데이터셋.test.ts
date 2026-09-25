import { describe, it, expect } from 'vitest';
import { 응급의료기관_목록, 응급의료기관_출처 } from './응급의료기관_데이터셋';
import { 민간_응급의료기관_목록, 전체_공공의료기관_상세목록, 응급의료기관_조회 } from './의료서비스_검색_엔진';

describe('E-Gen 응급의료기관 데이터셋', () => {
  it('전국 528개 기관, 필수 항목과 대한민국 범위 좌표를 갖는다', () => {
    expect(응급의료기관_목록.length).toBe(528);
    expect(new Set(응급의료기관_목록.map((h) => h.hpid)).size).toBe(528);
    for (const h of 응급의료기관_목록) {
      expect(h.기관명 && h.분류 && h.주소, h.hpid).toBeTruthy();
      expect(h.위도!, h.기관명).toBeGreaterThan(33);
      expect(h.위도!, h.기관명).toBeLessThan(38.7);
      expect(h.경도!, h.기관명).toBeGreaterThan(124.5);
      expect(h.경도!, h.기관명).toBeLessThan(131);
    }
    expect(응급의료기관_출처.URL).toContain('15000563');
  });

  it('응급의료기관 분류는 법정 분류 체계를 따른다', () => {
    const 분류 = new Set(응급의료기관_목록.map((h) => h.분류));
    for (const c of ['권역응급의료센터', '지역응급의료센터', '지역응급의료기관']) expect(분류.has(c), c).toBe(true);
  });

  it('민간 목록은 공공병원과 대응되는 78곳을 뺀 나머지다', () => {
    const 대응 = 전체_공공의료기관_상세목록.filter((h) => 응급의료기관_조회(h.기관명)).length;
    expect(대응).toBe(78);
    expect(민간_응급의료기관_목록.length).toBe(528 - 대응);
  });
});
