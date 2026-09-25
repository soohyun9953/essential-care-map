import { describe, it, expect } from 'vitest';
import { 분만가능_의료기관_목록, 분만가능_의료기관_출처 } from './분만가능_의료기관_데이터셋';
import { 민간_분만기관_목록, 전체_공공의료기관_상세목록, 분만가능_기관_조회 } from './의료서비스_검색_엔진';

const 거리_km = (a: [number, number], b: [number, number]) => {
  const R = 6371;
  const dLat = ((b[0] - a[0]) * Math.PI) / 180;
  const dLon = ((b[1] - a[1]) * Math.PI) / 180;
  const x = Math.sin(dLat / 2) ** 2 + Math.cos((a[0] * Math.PI) / 180) * Math.cos((b[0] * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
};

describe('분만가능 의료기관 좌표', () => {
  it('좌표가 있는 기관은 모두 대한민국 범위 안에 있고 정밀도가 기록되어 있다', () => {
    for (const h of 분만가능_의료기관_목록.filter((h) => h.위도 !== null)) {
      expect(h.위도!, h.기관명).toBeGreaterThan(33);
      expect(h.위도!, h.기관명).toBeLessThan(38.7);
      expect(h.경도!, h.기관명).toBeGreaterThan(124.5);
      expect(h.경도!, h.기관명).toBeLessThan(131);
      expect(['주소', '시군구']).toContain(h.좌표_정밀도);
    }
  });

  it('대부분(90% 이상)의 기관이 좌표를 갖고, 좌표 출처(OSM)를 표기한다', () => {
    const 좌표있음 = 분만가능_의료기관_목록.filter((h) => h.위도 !== null).length;
    expect(좌표있음 / 분만가능_의료기관_목록.length).toBeGreaterThan(0.9);
    expect(분만가능_의료기관_출처.좌표_출처).toContain('OpenStreetMap');
  });

  it('주소 기반 좌표는 공공병원 내장 좌표와 대체로 일치한다 (대응 기관 기준 중앙값 3km 이내)', () => {
    const 차이: number[] = [];
    for (const p of 전체_공공의료기관_상세목록) {
      const h = 분만가능_기관_조회(p.기관명);
      if (h && h.좌표_정밀도 === '주소') 차이.push(거리_km([p.위도, p.경도], [h.위도!, h.경도!]));
    }
    expect(차이.length).toBeGreaterThan(10);
    차이.sort((a, b) => a - b);
    expect(차이[Math.floor(차이.length / 2)]).toBeLessThan(3);
    // 10km 이상 차이는 어느 한쪽 좌표 오류 (속초의료원 내장 좌표 위도 1도 오기를 이 검사로 발견·정정)
    expect(차이[차이.length - 1]).toBeLessThan(10);
  });
});

describe('민간 분만기관 목록', () => {
  it('공공병원과 대응되는 33곳을 뺀 나머지 기관이다', () => {
    expect(민간_분만기관_목록.length).toBe(분만가능_의료기관_목록.length - 33);
    const 공공_이름 = new Set(전체_공공의료기관_상세목록.map((h) => h.기관명));
    for (const h of 민간_분만기관_목록) expect(공공_이름.has(h.기관명), h.기관명).toBe(false);
  });
});
