import { describe, it, expect } from 'vitest';
import { 응급의료기관_목록 } from './응급의료기관_데이터셋';
import { 전체_공공의료기관_상세목록 } from './의료서비스_검색_엔진';

const 거리_km = (a: [number, number], b: [number, number]) => {
  const R = 6371;
  const dLat = ((b[0] - a[0]) * Math.PI) / 180;
  const dLon = ((b[1] - a[1]) * Math.PI) / 180;
  const x = Math.sin(dLat / 2) ** 2 + Math.cos((a[0] * Math.PI) / 180) * Math.cos((b[0] * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
};

const 이름_정규화 = (n: string) => n.replace(/\(.*?\)|의료법인|재단법인|학교법인|한국보훈복지의료공단|근로복지공단|\s/g, '');

describe('공공의료기관 좌표 (E-Gen 대조)', () => {
  it('응급의료기관과 이름이 같은 공공병원은 E-Gen 기관 좌표와 300m 이내다', () => {
    const egen = new Map<string, (typeof 응급의료기관_목록)[number][]>();
    for (const e of 응급의료기관_목록) {
      const k = 이름_정규화(e.기관명);
      egen.set(k, [...(egen.get(k) ?? []), e]);
    }

    const 어긋남: string[] = [];
    let 대응 = 0;
    for (const p of 전체_공공의료기관_상세목록) {
      const 후보 = egen.get(이름_정규화(p.기관명));
      if (!후보 || 후보.length !== 1) continue;
      대응 += 1;
      const e = 후보[0];
      if (e.위도 === null || e.경도 === null) continue;
      const km = 거리_km([p.위도, p.경도], [e.위도, e.경도]);
      if (km > 0.3) 어긋남.push(`${p.기관명} ${km.toFixed(2)}km`);
    }
    expect(대응).toBeGreaterThan(60);
    expect(어긋남).toEqual([]);
  });
});
