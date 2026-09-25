import { describe, it, expect } from 'vitest';
import { 달빛어린이병원_목록, 달빛어린이병원_출처 } from './달빛어린이병원_데이터셋';
import { 전체_공공의료기관_상세목록, 민간_달빛어린이병원_목록 } from './의료서비스_검색_엔진';

describe('달빛어린이병원 데이터셋', () => {
  it('수집된 114곳은 식별자가 유일하고 필수 항목과 대한민국 범위 좌표를 갖는다', () => {
    expect(달빛어린이병원_목록.length).toBe(114);
    expect(new Set(달빛어린이병원_목록.map((h) => h.id)).size).toBe(114);
    for (const h of 달빛어린이병원_목록) {
      expect(h.기관명 && h.기관구분 && h.주소 && h.대표전화, h.id).toBeTruthy();
      expect(h.위도).toBeGreaterThan(33);
      expect(h.위도).toBeLessThan(38.7);
      expect(h.경도).toBeGreaterThan(124.5);
      expect(h.경도).toBeLessThan(131);
    }
    expect(달빛어린이병원_출처.URL).toContain('nmc.or.kr');
  });

  it('공공병원 중 달빛어린이병원 2곳은 소아 진료를 지정 현황으로 표시하고, 나머지는 추정으로 남긴다', () => {
    const 지정 = 전체_공공의료기관_상세목록.filter(
      (h) => h.서비스_상세.find((s) => s.코드 === 'pediatric')?.근거 === '지정현황'
    );
    expect(지정.map((h) => h.기관명).sort()).toEqual(['경기도의료원 안성병원', '전북특별자치도 남원의료원'].sort());
    for (const h of 지정) {
      expect(h.서비스_상세.find((s) => s.코드 === 'pediatric')!.상태).toBe('운영');
      expect(h.주요_의료서비스).toContain('달빛어린이병원');
    }
    expect(민간_달빛어린이병원_목록.length).toBe(114 - 2);
  });
});
