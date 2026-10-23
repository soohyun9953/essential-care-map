import { describe, it, expect } from 'vitest';
import { 진료권_통계_조회, 작성도우미_대상_병원, 공공보건의료계획_초안, 기능보강_사업계획서_초안 } from './진료권_통계_연동';
import { 공개정보_안내, 질문_지역_찾기 } from './대국민_공개정보_안내_엔진';

describe('2-1 진료권 통계 연동', () => {
  it('영월의료원·태백병원·정선군립병원 모두 소재 시군구 통계와 연결된다', () => {
    const 기대 = { 강원특별자치도영월의료원: '영월군', '근로복지공단 태백병원': '태백시', 정선군립병원: '정선군' } as const;
    for (const h of 작성도우미_대상_병원) {
      const t = 진료권_통계_조회(h)!;
      expect(t.시군구명, h).toBe(기대[h]);
      expect(t.자체충족률_pct, h).not.toBeNull();
      expect(t.유출률_pct, h).not.toBeNull();
      expect(t.주요_유출지.every((o) => !o.지역.endsWith(t.시군구명)), h).toBe(true); // 자기 지역은 유출지가 아님
      expect(t.진단, h).not.toBeNull();
    }
  });

  it('초안의 자동 연동 항목에 실제 통계값이 들어가고, 예산 등은 직접 입력으로 남는다', () => {
    const t = 진료권_통계_조회('강원특별자치도영월의료원')!;
    const 계획 = 공공보건의료계획_초안(t);
    const 현황 = 계획.find((s) => s.제목.startsWith('2.'))!;
    expect(현황.자동연동).toBe(true);
    expect(현황.내용).toContain(`${t.자체충족률_pct!.toFixed(1)}%`);
    expect(현황.내용).toContain('플랫폼 추정');
    const 사업 = 기능보강_사업계획서_초안(t);
    expect(사업).toHaveLength(12);
    expect(사업.find((s) => s.제목.startsWith('⑨'))!.내용).toContain('직접 입력 필요');
  });
});

describe('1-3 대국민 공개정보 안내 (AIS-02-02)', () => {
  it('지역 + 응급실 질문은 E-Gen 목록과 출처로 답한다', () => {
    const a = 공개정보_안내('영월군 응급실 어디 있어?');
    expect(a.유형).toBe('기관찾기');
    expect(a.내용.join(' ')).toContain('영월의료원');
    expect(a.출처[0].자료).toContain('E-Gen');
  });
  it('공공병원 이름은 알리미 공시 요약과 출처로 답한다', () => {
    const a = 공개정보_안내('삼척의료원 정보 알려줘');
    expect(a.유형).toBe('공공병원');
    expect(a.출처[0].URL).toContain('rhs.mohw.go.kr');
  });
  it('제도 질문은 원문 확인된 지침 문서만 출처로 쓴다', () => {
    const a = 공개정보_안내('달빛어린이병원이 뭐야?');
    expect(a.유형).toBe('제도안내');
    expect(a.출처.length).toBeGreaterThan(0);
    for (const s of a.출처) expect(s.상세).not.toContain('원문 미확인');
  });
  it('시군구 어간(영월)으로도 지역을 찾는다', () => {
    expect(질문_지역_찾기('영월 분만 병원')?.시군구명).toBe('영월군');
  });
});
