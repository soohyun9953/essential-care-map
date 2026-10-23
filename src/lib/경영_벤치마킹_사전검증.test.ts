import { describe, it, expect } from 'vitest';
import { 알리미_공시_조회, 최근_결산연도, 알리미_병상수 } from './알리미_경영지표';
import { 경영_벤치마킹, 동일규모_비교군, 공시_사전검증, 장비_노후도_진단, 시연_장비_대장 } from './경영_벤치마킹_사전검증';
import { 중증도_점수, 수용기관_매칭, 기관_좌표, 수용확률 } from './고위험_모자_전원매칭';

describe('2-3 경영 벤치마킹', () => {
  const 영월 = 알리미_공시_조회('영월의료원')!;
  it('비교군은 자기 자신을 뺀 150~250병상 지방의료원이다', () => {
    const 군 = 동일규모_비교군(영월, 2025);
    expect(군.length).toBeGreaterThan(5);
    const b = 경영_벤치마킹(영월)!;
    expect(b.비교군_수).toBe(군.length);
    expect(b.행.find((r) => r.지표 === '재료비율')!.우리).toBeNull(); // 공시 항목 아님
    expect(b.행.find((r) => r.지표 === '의료이익률')!.우리).toBe(-38.7);
  });
});

describe('2-3 공시 사전검증', () => {
  const r = 최근_결산연도(알리미_공시_조회('영월의료원')!)!;
  const 같은값 = Object.fromEntries((['정부_출연금', '정부_보조금', '지자체_출연금', '지자체_보조금', '의료수익', '의료비용', '인건비'] as const).map((k) => [k, r[k]]));
  it('영월 2025 공시의 정부·지자체 출연금 동일 금액을 이중기재·혼입 의심으로 탐지한다 (실제 공시값)', () => {
    expect(r.정부_출연금).toBe(r.지자체_출연금);
    const v = 공시_사전검증(r, 같은값);
    expect(v.map((x) => x.규칙)).toContain('출연금 이중기재·혼입');
    expect(v.some((x) => x.규칙 === 'ERP 대조 불일치')).toBe(false);
  });
  it('ERP에서 출연금·보조금이 바뀌어 있으면 계정 혼입으로 탐지한다', () => {
    const v = 공시_사전검증(r, { ...같은값, 정부_출연금: r.정부_보조금, 정부_보조금: r.정부_출연금 });
    expect(v.map((x) => x.규칙)).toContain('출연금·보조금 계정 혼입');
  });
});

describe('2-3 장비 노후도', () => {
  it('내용연수 초과·고가동·필수의료 장비가 1순위다 (심뇌혈관 CT +3년)', () => {
    const d = 장비_노후도_진단(시연_장비_대장, 2026);
    expect(d[0].장비명).toContain('심뇌혈관 CT');
    expect(d[0].초과연수).toBe(3);
    expect(d[0].권고).toContain('교체 신청');
  });
});

describe('2-4 고위험 산모 전원 매칭', () => {
  it('31주 조기진통은 중증도 85점이다', () => {
    expect(중증도_점수({ 재태주수: 31, 조기진통: true, 조기양막파수: false, 전자간증: false, 다태아: false })).toBe(85);
  });
  it('수용기관 3곳 좌표가 E-Gen 목록에 있고, NICU 가용이 많을수록 수용확률이 높다', () => {
    const 출발 = 기관_좌표('강원특별자치도영월의료원')!;
    expect(출발).not.toBeNull();
    const 결과 = 수용기관_매칭(출발, 85, {});
    expect(결과).toHaveLength(3);
    for (const x of 결과) expect(Number.isFinite(x.이송_분)).toBe(true);
    expect(수용확률(3).값).toBeGreaterThan(수용확률(1).값);
    expect(수용확률(null).설명).toContain('전화 확인');
  });
  it('실시간 NICU가 0인 기관은 가까워도 순위가 내려간다', () => {
    const 출발 = 기관_좌표('강원특별자치도영월의료원')!;
    const 기본 = 수용기관_매칭(출발, 85, {});
    const 일위 = 기본[0].기관명;
    const 바뀜 = 수용기관_매칭(출발, 85, { [일위]: 0, ...Object.fromEntries(기본.slice(1).map((x) => [x.기관명, 3])) });
    expect(바뀜[0].기관명).not.toBe(일위);
  });
});

it('알리미 병상 연결 (비교군 구성 전제)', () => {
  expect(알리미_병상수(알리미_공시_조회('영월의료원')!)).toBe(188);
});
