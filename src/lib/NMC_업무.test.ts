import { describe, it, expect } from 'vitest';
import { 알리미_공시_조회 } from './알리미_경영지표';
import { 교차검증, 원천값, 공시_이상치, 평가_환류, 심사보고서_초안 } from './NMC_평가_모니터링';
import { 취약지_요약, 자연어_질의, 정책_요구자료_초안 } from './NMC_정책통계_DW';
import { 투자_후보_목록, 투자_우선순위, 입력_경과분 } from './NMC_투자배분_모자관제';
import { 에이전트_평가, 에이전트_템플릿, 정보등급_판정, 미이수_탐지, 시연_이수_명단, 이상접근_탐지, 시연_접근_로그 } from './NMC_에이전트_LLMOps';

describe('3-1 평가·공시심사', () => {
  const 영월 = 알리미_공시_조회('영월의료원')!;
  it('제출값이 원천과 같으면 일치, 다르면 불일치, CP·연계망은 원천 없음', () => {
    const 같음 = 교차검증(영월, { 의사직_현원: 원천값(영월, '의사직_현원') });
    expect(같음.find((x) => x.항목 === '의사직_현원')!.판정).toBe('일치');
    const 다름 = 교차검증(영월, { 의사직_현원: (원천값(영월, '의사직_현원') ?? 0) + 3 });
    expect(다름.find((x) => x.항목 === '의사직_현원')!.판정).toBe('불일치');
    expect(다름.filter((x) => x.판정 === '원천 없음').length).toBeGreaterThanOrEqual(2);
  });
  it('공시 이상치는 |z| > 3.5만 포함한다', () => {
    const r = 공시_이상치();
    expect(r.length).toBeGreaterThan(0);
    for (const x of r) expect(Math.abs(x.z)).toBeGreaterThan(3.5);
  });
  it('환류는 백분위 30 미만 지표만, 심사보고서에 4개 장이 있다', () => {
    const h = 알리미_공시_조회('인천적십자병원')!;
    for (const x of 평가_환류(h)) expect(x.백분위).toBeLessThan(30);
    const 보고서 = 심사보고서_초안(h, 교차검증(h, {}));
    for (const 장 of ['## 1.', '## 2.', '## 3.', '## 4.']) expect(보고서).toContain(장);
  });
});

describe('3-2 정책통계·DW', () => {
  it('250개 시군구 취약지 요약과 시도별 합계가 맞다', () => {
    const s = 취약지_요약();
    expect(s.전체).toBe(250);
    expect(s.시도별.reduce((a, b) => a + b.시군구, 0)).toBe(250);
    expect(s.시도별.reduce((a, b) => a + b.응급취약, 0)).toBe(s.응급취약);
  });
  it('Text-to-SQL은 지원 질문에 SQL과 결과를, 미지원 질문에 오류를 돌려준다', () => {
    const r = 자연어_질의('강원특별자치도 응급취약 시군구');
    expect('sql' in r && r.sql).toContain("시도명 = '강원특별자치도'");
    const 하위 = 자연어_질의('의료이익률 하위 5개 지방의료원');
    expect('행' in 하위 && 하위.행.length).toBe(5);
    expect('오류' in 자연어_질의('오늘 날씨 어때')).toBe(true);
  });
  it('요구자료 초안에 실제 취약지 수가 들어간다', () => {
    expect(정책_요구자료_초안('국회', 'x')).toContain(`${취약지_요약().응급취약}개`);
  });
});

describe('3-3 투자배분·모자관제', () => {
  it('경상운영비 0원 공시 기관은 점수를 산정하지 않는다', () => {
    const r = 투자_우선순위(투자_후보_목록(), { 수요: 1, 활용: 1, 유지비: 1 });
    for (const x of r) if (x.유지비부담 === null) expect(x.점수).toBeNull();
    expect(r[0].점수).not.toBeNull();
  });
  it('E-Gen 입력일시 경과 분을 한국시간으로 계산한다', () => {
    expect(입력_경과분('20261024090000', new Date('2026-10-24T00:30:00Z'))).toBe(30);
    expect(입력_경과분(undefined)).toBeNull();
  });
});

describe('3-4 에이전트·LLMOps', () => {
  it('4개 템플릿 Evals가 실제 함수로 모두 통과한다', () => {
    for (const t of 에이전트_템플릿) expect(에이전트_평가(t, []).every((r) => r.통과), t).toBe(true);
  });
  it('정보등급: 개인정보 → S, 기밀 → C, 일반 → O', () => {
    expect(정보등급_판정('환자 연락처 010-1234-5678').등급).toBe('S');
    expect(정보등급_판정('대외비 예산안').등급).toBe('C');
    expect(정보등급_판정('영월군 응급실 현황').등급).toBe('O');
  });
  it('법정교육 미이수·이상접근 규칙이 시연 데이터에 적용된다', () => {
    expect(미이수_탐지(시연_이수_명단).length).toBe(5);
    expect(이상접근_탐지(시연_접근_로그).some((x) => x.사용자 === '사용자 A' && x.수준 === '경고')).toBe(true);
  });
});
