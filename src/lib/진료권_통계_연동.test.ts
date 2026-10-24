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

describe('1-3 거점·NICU 질문 (답변 오류 수정 2026-10-24)', () => {
  it('「동대구역 근처의 NICU 가능 한곳?」은 대구 동구 기준 가까운 응급의료센터와 실시간 확인 대상을 돌려준다', () => {
    const a = 공개정보_안내('동대구역 근처의 NICU 가능 한곳?');
    expect(a.유형).toBe('기관찾기');
    expect(a.제목).toContain('동대구역');
    expect(a.내용.join(' ')).toMatch(/대구|경북대|계명|영남|칠곡/);
    expect(a.실시간_확인?.length).toBeGreaterThan(0);
    expect(a.출처[0].자료).toContain('E-Gen');
    expect(a.내용.join(' ')).not.toContain('지표정의');
  });
  it('거점 기준 응급실은 가까운 순으로 보여준다', () => {
    const a = 공개정보_안내('서울역 근처 응급실');
    expect(a.제목).toContain('서울역');
    expect(a.내용[1]).toMatch(/직선 \d/);
  });
  it('같은 이름의 구는 질문의 시도로 구분한다 (대구 동구 ≠ 부산 동구)', () => {
    expect(질문_지역_찾기('대구 동구 응급실')?.시도명).toBe('대구광역시');
  });
  it('제도 질문 답에는 검증 상태가 있는 지침만 쓰고 지표정의서는 쓰지 않는다', () => {
    const a = 공개정보_안내('신생아 중환자실이 뭐야?');
    for (const s of a.출처) expect(s.자료).not.toContain('지표정의서');
  });
});


describe('1-4 제도 안내: 무관한 질문 거르기 (2026-10-24)', () => {
  it('날씨·맛집 같은 무관한 질문에는 지침 문서를 답으로 내지 않는다', () => {
    expect(공개정보_안내('오늘 날씨 어때?').유형).toBe('찾지못함');
    expect(공개정보_안내('맛집 추천해줘').유형).toBe('찾지못함');
  });
  it('제도 질문은 계속 지침 문서로 답한다', () => {
    expect(공개정보_안내('분만취약지 지원사업이 뭐야?').유형).toBe('제도안내');
  });
});

describe('1-4 거리 기준점·출처 (2026-10-24)', () => {
  it('시군구 질문은 시군구 대표 좌표 기준이라 응급실이 1곳인 군도 0.0km가 되지 않고, 거리는 플랫폼 계산으로 출처에 밝힌다', () => {
    const a = 공개정보_안내('영월군 응급실 어디 있어?');
    expect(a.내용[1]).not.toContain('직선 0.0km');
    expect(a.출처.some((s) => s.자료.includes('플랫폼 계산') && s.상세.includes('영월군 대표 좌표'))).toBe(true);
  });
  it('"대구 중구"처럼 시와 구가 함께 있으면 시 전체가 아니라 구를 기준으로 찾는다', () => {
    expect(공개정보_안내('대구 중구 응급실').제목).toBe('대구광역시 중구');
  });
});
