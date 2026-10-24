// ③ NMC › 3-1 통합 평가·공시심사·성과 모니터링 AI (AP-03)
// - 교차검증(AIS-03-01): 평가 제출 증빙값 ↔ 원천데이터(알리미 공시). CP·연계망 원천은 미연계로 표시
// - 공시 이상치(AIS-03-03): 42곳 전년 대비 증감률의 수정 z-score(|z| > 3.5) + 알리미 자동점검 규칙
// - 심사보고서 초안(AIS-03-06): 위 결과를 모은 규칙 기반 초안 (내부 sLLM 연계 전)
// - 환류: 평가 취약영역(공시기관 내 하위 30%) → 운영진단·멘토링 → LMS 직무교육 배정

import { 알리미_기관_공시_목록, type 알리미_기관_공시, type 알리미_연도별_공시 } from './알리미_경영공시_데이터셋';
import { 경영지표_계산, 지표_백분위, 알리미_병상수, 최근_결산연도, 재무건전성_평가, type 비교_지표 } from './알리미_경영지표';
import { 알리미_공시_자동점검 } from './알리미_공시_품질점검';

export const 평가_모듈 = [
  { id: '시도계획', 이름: '시·도 공공보건의료 시행계획 평가', 원천: '시행계획·추진실적 제출본 (기존 평가 화면)' },
  { id: '운영평가', 이름: '지방의료원 운영평가·운영진단', 원천: '알리미 공시 (결산·인력·감면)' },
  { id: '책임의료', 이름: '책임의료기관 평가', 원천: '연계망 퇴원연계 실적 (미연계)' },
] as const;

// ---------------- 교차검증 ----------------
export const 교차검증_항목 = ['의료수익', '당기순이익', '의사직_현원', '간호직_현원', '취약계층_감면총액_원'] as const;
export type 교차검증_항목_키 = (typeof 교차검증_항목)[number];

export function 원천값(h: 알리미_기관_공시, k: 교차검증_항목_키): number | null {
  if (k === '취약계층_감면총액_원') return h.감면액?.취약계층_감면총액_원 ?? null;
  const r = 최근_결산연도(h);
  return r ? r[k] : null;
}

export interface 교차검증_결과 {
  항목: string;
  제출: number | null;
  원천: number | null;
  판정: '일치' | '불일치' | '원천 없음' | '미제출';
}

export function 교차검증(h: 알리미_기관_공시, 제출: Partial<Record<교차검증_항목_키, number | null>>): 교차검증_결과[] {
  const 결과: 교차검증_결과[] = 교차검증_항목.map((k) => {
    const 원 = 원천값(h, k);
    const 제 = 제출[k] ?? null;
    const 판정 = 제 === null ? '미제출' : 원 === null ? '원천 없음' : Math.abs(제 - 원) <= 2 ? '일치' : '불일치';
    return { 항목: k, 제출: 제, 원천: 원, 판정 };
  });
  결과.push({ 항목: 'CP 적용률 (원천: CP 운영자료)', 제출: null, 원천: null, 판정: '원천 없음' });
  결과.push({ 항목: '퇴원연계 실적 (원천: 공공의료 연계망)', 제출: null, 원천: null, 판정: '원천 없음' });
  return 결과;
}

// ---------------- 공시 이상치 ----------------
export interface 이상치 {
  기관명: string;
  항목: string;
  연도: number;
  증감률_pct: number;
  z: number;
}

const 증감률 = (a: number | null, b: number | null) => (a === null || b === null || b === 0 ? null : ((a - b) / Math.abs(b)) * 100);

/** 수정 z-score = 0.6745 × (x − 중앙값) ÷ MAD, |z| > 3.5면 이상치 (Iglewicz–Hoaglin) */
export function 공시_이상치(연도 = 2025): 이상치[] {
  const 항목: (keyof 알리미_연도별_공시)[] = ['의료수익', '인건비', '정부지원금', '지자체지원금', '의사직_현원', '간호직_현원'];
  const out: 이상치[] = [];
  for (const k of 항목) {
    const 값 = 알리미_기관_공시_목록
      .map((h) => {
        const 올해 = h.연도별.find((r) => r.연도 === 연도);
        const 작년 = h.연도별.find((r) => r.연도 === 연도 - 1);
        const v = 증감률((올해?.[k] as number | null) ?? null, (작년?.[k] as number | null) ?? null);
        return v === null ? null : { 기관명: h.기관명, v };
      })
      .filter((x): x is { 기관명: string; v: number } => x !== null);
    if (값.length < 5) continue;
    const s = 값.map((x) => x.v).sort((a, b) => a - b);
    const med = s[Math.floor(s.length / 2)];
    const dev = s.map((x) => Math.abs(x - med)).sort((a, b) => a - b);
    const mad = dev[Math.floor(dev.length / 2)] || 1e-9;
    for (const x of 값) {
      const z = (0.6745 * (x.v - med)) / mad;
      if (Math.abs(z) > 3.5) out.push({ 기관명: x.기관명, 항목: String(k), 연도, 증감률_pct: Math.round(x.v * 10) / 10, z: Math.round(z * 10) / 10 });
    }
  }
  return out.sort((a, b) => Math.abs(b.z) - Math.abs(a.z));
}

// ---------------- 환류 ----------------
const 환류_매핑: Record<string, { 진단: string; 과정: string }> = {
  의료이익률: { 진단: '수익구조 운영진단 (진료과별 원가 분석)', 과정: '지방의료원 결산·알리미 공시 실무 (예시)' },
  당기순이익률: { 진단: '재무건전성 운영진단 (지원금 의존도 점검)', 과정: '지방의료원 결산·알리미 공시 실무 (예시)' },
  인건비율: { 진단: '인력운영 효율화 멘토링', 과정: '공공보건의료계획 수립 실무 (예시)' },
  병상당_의사직: { 진단: '의사인력 확보 멘토링 (파견·공공임상교수 활용)', 과정: '응급·중증 초기대응 시뮬레이션 (예시)' },
  병상당_간호직: { 진단: '간호인력 운영 멘토링', 과정: '중환자 간호 심화 (예시)' },
};

export interface 환류_항목 {
  취약영역: 비교_지표;
  값: number;
  백분위: number;
  운영진단: string;
  LMS_과정: string;
}

/** 공시기관 내 백분위 30 미만인 지표를 취약영역으로 보고 운영진단·교육을 배정 */
export function 평가_환류(h: 알리미_기관_공시): 환류_항목[] {
  const r = 최근_결산연도(h);
  if (!r) return [];
  const m = 경영지표_계산(r, 알리미_병상수(h));
  const 지표들: 비교_지표[] = ['의료이익률', '당기순이익률', '인건비율', '병상당_의사직', '병상당_간호직'];
  return 지표들
    .map((k) => {
      const 값 = m[k];
      const 백분위 = 값 === null ? null : 지표_백분위(k, r.연도, 값);
      return 값 === null || 백분위 === null || 백분위 >= 30 ? null : { 취약영역: k, 값, 백분위, 운영진단: 환류_매핑[k].진단, LMS_과정: 환류_매핑[k].과정 };
    })
    .filter((x): x is 환류_항목 => x !== null)
    .sort((a, b) => a.백분위 - b.백분위);
}

// ---------------- 심사보고서 초안 ----------------
export function 심사보고서_초안(h: 알리미_기관_공시, 교차: 교차검증_결과[]): string {
  const 재무 = 재무건전성_평가(h);
  const 점검 = 알리미_공시_자동점검().filter((x) => x.기관명 === h.기관명);
  const 이상 = 공시_이상치().filter((x) => x.기관명 === h.기관명);
  const 환류 = 평가_환류(h);
  const 불일치 = 교차.filter((x) => x.판정 === '불일치');
  return [
    `# ${h.기관명} 운영평가 종합 심사보고서 (초안)`,
    '※ 규칙 기반 초안입니다. 내부 sLLM(S등급) 연계 후 문장을 고도화하며, 최종 판단은 평가위원이 합니다.',
    '',
    '## 1. 재무건전성',
    재무 ? `- ${재무.연도}년 재무건전성 ${재무.점수}점 (공시기관 내 백분위 평균): ${재무.구성.map((c) => `${c.지표} ${c.값}%(백분위 ${c.백분위})`).join(', ')}` : '- 결산 공시 없음',
    '',
    '## 2. 제출증빙 교차검증',
    불일치.length ? 불일치.map((x) => `- [불일치] ${x.항목}: 제출 ${x.제출?.toLocaleString()} / 원천 ${x.원천?.toLocaleString()}`).join('\n') : '- 알리미 원천과 불일치 없음',
    '- CP 적용률·퇴원연계 실적은 원천 미연계로 검증하지 못함',
    '',
    '## 3. 공시 품질',
    점검.length ? 점검.map((x) => `- ${x.연도} ${x.내용}`).join('\n') : '- 자동점검 규칙 위반 없음',
    이상.length ? 이상.map((x) => `- [이상치] ${x.연도} ${x.항목} 전년 대비 ${x.증감률_pct}% (z ${x.z})`).join('\n') : '- 전년 대비 증감 이상치 없음',
    '',
    '## 4. 취약영역 및 환류',
    환류.length ? 환류.map((x) => `- ${x.취약영역}(백분위 ${x.백분위}) → ${x.운영진단} → 교육: ${x.LMS_과정}`).join('\n') : '- 공시기관 하위 30% 지표 없음',
  ].join('\n');
}
