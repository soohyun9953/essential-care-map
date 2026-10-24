import { describe, expect, it } from 'vitest';
import { analyze_hospital_query, 질문_관련성 } from './의료기관_질의응답_엔진';

describe('의료기관 데이터 AI 자연어 질의응답: 관련 없는 질문 거르기 (2026-10-24)', () => {
  it('날씨·맛집 같은 질문은 관련 없음으로 보고 표·지침 없이 안내만 돌려준다', () => {
    for (const q of ['오늘 날씨?', '맛집 추천해줘']) {
      expect(질문_관련성(q)).toBe(false);
      const r = analyze_hospital_query(q);
      expect(r.관련_질문).toBe(false);
      expect(r.table_rows).toHaveLength(0);
      expect(r.rag_evidences).toHaveLength(0);
    }
  });

  it('병상·인력·필수의료·지역 질문은 계속 분석한다', () => {
    for (const q of ['병상수가 가장 많은 공공병원 Top10 보여줘.', '강원도 소재 공공의료기관 현황 분석해줘.', '영월의료원', '응급실과 중환자실을 동시에 가동하는 공공병원 보여줘.']) {
      const r = analyze_hospital_query(q);
      expect(r.관련_질문, q).toBe(true);
      expect(r.table_rows.length, q).toBeGreaterThan(0);
    }
  });
});
