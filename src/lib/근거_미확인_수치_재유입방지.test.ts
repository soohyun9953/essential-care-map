import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { 전국_41개_지역거점공공병원_공시검증_목록 } from './지역거점_공공병원_공시검증_데이터셋';
import { analyze_patient_flow_query } from './환자_유출입_분석_엔진';
import { 정책_근거_생성 } from '@/components/ai/AI_판단_근거_모달';
import { 필수의료_진단_엔진 } from './필수의료_엔진';
import { 전국_시군구_진단_데이터 } from './시군구_데이터셋';

const 소스 = (p: string) => readFileSync(join(process.cwd(), p), 'utf-8');

describe('근거 미확인 수치 재유입 방지 (2026-10-09 정리)', () => {
  it('공시검증: 원문(업무보고 붙임 2)에 없는 기관별 품질등급·주요 오류 유형이 없다', () => {
    for (const h of 전국_41개_지역거점공공병원_공시검증_목록) {
      expect(h).not.toHaveProperty('품질등급');
      expect(h).not.toHaveProperty('주요_오류_유형');
    }
    expect(전국_41개_지역거점공공병원_공시검증_목록.find((h) => h.기관명 === '진안군의료원')?.오류의심_건수).toBe(9);
  });

  it('유출입 분석: 인구×유출률로 만든 "추정 유출 인구수"를 출력하지 않는다', () => {
    for (const q of ['중진료권별 유출 Top10과 유출 재원일수 보여줘', '전국 17개 시도별 환자 유출률 순위 알려줘', '시군구 유출률 순위']) {
      const r = JSON.stringify(analyze_patient_flow_query(q));
      expect(r, q).not.toContain('추정 유출');
      expect(r, q).not.toContain('50% 이상을 흡수');
    }
  });

  it('정책 판단 근거: 선택 지역의 헬스맵 값을 쓰고 영월 고정값(54.2%·42.1%·국비 70%)을 쓰지 않는다', () => {
    const 지역 = 필수의료_진단_엔진.diagnose_region(전국_시군구_진단_데이터.find((r) => r.시군구명 === '종로구')!);
    for (const id of ['A', 'B', 'C'] as const) {
      const s = JSON.stringify(정책_근거_생성(id, 지역));
      for (const v of ['54.2%', '42.1%', '76.8%', '국비 70%', '100% 충족', '원주']) expect(s, `${id}:${v}`).not.toContain(v);
    }
    expect(JSON.stringify(정책_근거_생성('A', 지역))).toContain(`${지역.관내_응급_의료이용률}%`);
  });

  it('화면 소스에 영월 고정 서술·근거 없는 성과 수치가 다시 들어오지 않는다', () => {
    const 대상 = [
      'src/components/정책기획_통합_워크스페이스.tsx',
      'src/components/AsIs_비교_배너.tsx',
      'src/data/ispTasks.ts',
      'src/components/ai/AI_활용_데이터_모달.tsx',
      'src/data/mock/ai/analysisResults.ts',
    ];
    const 금지 = ['54.2%', '42.1%', '76.8%', '17.5억', '12.6억', '22.5억', '반려율 38%', '승인율 98%', '오류율 0%', '정확도 100%', '120분', '국비 70%', '28.4%', '38.7%'];
    for (const p of 대상) {
      const s = 소스(p);
      for (const v of 금지) expect(s, `${p}: ${v}`).not.toContain(v);
    }
  });

  it('AI 병원진단은 가상 시연 데이터임을 화면에 표시한다', () => {
    expect(소스('src/components/AI_병원진단_통합_워크스페이스.tsx')).toContain('AI진단_가상데이터_안내');
    expect(소스('src/lib/공공병원_AI진단_데이터셋.ts')).not.toContain("사용데이터: 'NMC 공공병원 운영평가 2025 공시결과'");
  });
});
