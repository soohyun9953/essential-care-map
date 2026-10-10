import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { 알리미_기관_공시_목록, 알리미_공시_출처 } from './알리미_경영공시_데이터셋';
import {
  알리미_공시_조회,
  최근_결산연도,
  경영지표_계산,
  재무건전성_평가,
  지표_분포_계산,
  알리미_병상수,
} from './알리미_경영지표';
import { 전국_41개_공공병원_AI_프로필, get_공공병원_ai_프로필 } from './공공병원_AI진단_데이터셋';

describe('지역거점공공병원 알리미 공시 데이터셋', () => {
  it('공시기관 42곳(지방의료원 35·분원 1·적십자 6), 2021~2025년', () => {
    expect(알리미_기관_공시_목록).toHaveLength(42);
    const 유형수 = (t: string) => 알리미_기관_공시_목록.filter((h) => h.유형 === t).length;
    expect([유형수('지방의료원'), 유형수('분원'), 유형수('적십자병원')]).toEqual([35, 1, 6]);
    expect(알리미_공시_출처.공시연도).toBe('2021~2025년');
  });

  it('영월의료원 2025 결산 공시값 (원문 대조)', () => {
    const 영월 = 알리미_공시_조회('영월의료원')!;
    const r = 영월.연도별.find((x) => x.연도 === 2025)!;
    expect(r.의료수익).toBe(22272739);
    expect(r.의료이익).toBe(-8622817);
    expect(r.당기순이익).toBe(-433041);
    expect(r.인건비).toBe(19890433);
    expect(r.의사직_현원).toBe(23);
    expect(r.간호직_현원).toBe(153);
    const m = 경영지표_계산(r);
    expect(m.의료이익률).toBe(-38.7);
    expect(m.인건비율).toBe(89.3);
    expect(m.자본잠식).toBe(true);
  });

  it('회계 항등식: 의료이익 = 의료수익 − 의료비용은 모두 성립, 자산 ≠ 부채 + 자본은 2021년 3곳뿐 (공시 원문 불일치)', () => {
    const 불일치: string[] = [];
    for (const h of 알리미_기관_공시_목록) {
      for (const r of h.연도별) {
        if (r.자산총계 !== null && r.부채총계 !== null && r.자본총계 !== null && Math.abs(r.자산총계 - r.부채총계 - r.자본총계) > 2)
          불일치.push(`${h.기관명} ${r.연도}`);
        if (r.의료수익 !== null && r.의료비용 !== null && r.의료이익 !== null)
          expect(Math.abs(r.의료수익 - r.의료비용 - r.의료이익), `${h.기관명} ${r.연도}`).toBeLessThanOrEqual(2);
      }
    }
    expect(불일치).toEqual(['부산의료원 2021', '서산의료원 2021', '서귀포의료원 2021']);
  });

  it('42곳 모두 2025년 결산이 공시되어 있고, 백령병원(공공의료기관 데이터셋에 없음)을 뺀 41곳은 허가병상과 연결된다', () => {
    for (const h of 알리미_기관_공시_목록) {
      expect(최근_결산연도(h)?.연도, h.기관명).toBe(2025);
      if (h.기관명 !== '인천의료원 백령병원') expect(알리미_병상수(h), h.기관명).not.toBeNull();
    }
  });

  it('인건비가 0으로 공시된 연도는 비율을 계산하지 않는다', () => {
    const r = { ...알리미_기관_공시_목록[0].연도별[4], 인건비: 0 };
    expect(경영지표_계산(r).인건비율).toBeNull();
  });

  it('분포·재무건전성 점수는 0~100 범위이고 상위 25%는 좋은 쪽 경계다', () => {
    const 이익률 = 지표_분포_계산('의료이익률', 2025)!;
    expect(이익률.기관수).toBe(42);
    expect(이익률.상위25).toBeGreaterThan(이익률.중앙값);
    const 인건비 = 지표_분포_계산('인건비율', 2025)!;
    expect(인건비.상위25).toBeLessThan(인건비.중앙값);
    for (const h of 알리미_기관_공시_목록) {
      const 평가 = 재무건전성_평가(h);
      expect(평가, h.기관명).not.toBeNull();
      expect(평가!.점수).toBeGreaterThanOrEqual(0);
      expect(평가!.점수).toBeLessThanOrEqual(100);
    }
  });

  it('수집 스냅샷에 담당자·임원 개인정보가 없다', () => {
    const snap = readFileSync('data/alimi/지역거점공공병원_공시.json', 'utf-8');
    expect(snap).not.toMatch(/담당자|성명|전화번호|주요 경력/);
  });
});

describe('AI 병원진단 ↔ 알리미 공시 연결', () => {
  it('41개 진단 대상이 모두 알리미 공시와 연결되고, 재무건전성 근거가 공시값이다', () => {
    for (const p of 전국_41개_공공병원_AI_프로필) {
      expect(p.경영공시, p.기관명).not.toBeNull();
      const 근거 = p.산출근거목록.find((e) => e.지표명 === '재무건전성')!;
      expect(근거.사용데이터, p.기관명).toContain('알리미');
      expect(p.진단지표.재무건전성).toBe(p.경영공시!.재무건전성!.점수);
      expect(p.인력_출처).toContain('알리미');
    }
  });

  it('비교지표 중 실데이터 행은 「알리미 공시」, 나머지는 「가상 시연값」으로 표시된다', () => {
    const 영월 = get_공공병원_ai_프로필('영월의료원');
    const 공시행 = 영월.벤치마킹데이터.filter((b) => b.출처 === '알리미 공시').map((b) => b.지표명);
    expect(공시행).toContain('의료이익률 (2025)');
    expect(공시행).toContain('100병상당 의사직 현원 (2025)');
    expect(영월.벤치마킹데이터.find((b) => b.지표명 === '병상가동률')?.출처).toBe('가상 시연값');
    expect(영월.전문의수).toBe(23);
  });
});
