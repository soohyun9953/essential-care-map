import { describe, it, expect } from 'vitest';
import { 공공의료_지침_코퍼스 } from './공공의료_지침_코퍼스';

describe('지침 코퍼스 원문 대조 표기 (2026-09-24 대조)', () => {
  it('모든 기본 청크에 검증상태가 기록되어 있다', () => {
    for (const c of 공공의료_지침_코퍼스) expect(c.검증상태, c.id).toBeDefined();
  });

  it('원문 미확인 청크는 문서명과 본문에 미확인임을 명시한다 (RAG 답변에 그대로 노출됨)', () => {
    const 미확인 = 공공의료_지침_코퍼스.filter((c) => c.검증상태 === '원문 미확인');
    expect(미확인.length).toBeGreaterThan(0);
    for (const c of 미확인) {
      expect(c.문서명, c.id).toContain('[원문 미확인]');
      expect(c.본문, c.id).toContain('원문 미확인');
    }
  });

  it('원문 확인·일부 확인 청크는 검증 근거를 기록한다', () => {
    for (const c of 공공의료_지침_코퍼스.filter((c) => c.검증상태 !== '원문 미확인')) {
      expect(c.검증_근거, c.id).toBeTruthy();
    }
  });

  it('실제로 존재하지 않는 것으로 확인된 문서명·조항을 쓰지 않는다', () => {
    const 전체 = JSON.stringify(공공의료_지침_코퍼스);
    expect(전체).not.toContain('의료취약지 지정 및 운용 등에 관한 고시');
    expect(전체).not.toContain('제3조(응급의료취약지의 기준)');
    expect(전체).not.toContain('2억 5천만원');
  });

  it('2026-10-09 원문 대조 결과: 받은자료 근거로 확인된 청크와 남은 미확인(플랫폼 자체 기준)', () => {
    const 청크 = (id: string) => 공공의료_지침_코퍼스.find((c) => c.id === id)!;
    expect(청크('CHUNK-MATERN-02').검증상태).toBe('원문 확인');
    expect(청크('CHUNK-MATERN-02').본문).toContain('외래산부인과 시설·장비비 1억원과 운영비 2억원');
    expect(청크('CHUNK-PEDI-03').본문).toContain('운영비 3억원');
    expect(청크('CHUNK-EVAL-01').검증상태).toBe('일부 확인');
    expect(청크('CHUNK-EVAL-01').기준수치).not.toContain('정성 70 + 정량 30');
    expect(청크('CHUNK-FACIL-01').본문).toContain('1,230억원');
    const 미확인 = 공공의료_지침_코퍼스.filter((c) => c.검증상태 === '원문 미확인').map((c) => c.id).sort();
    expect(미확인).toEqual(['CHUNK-EMERG-02', 'CHUNK-PEDI-01']);
  });
});
