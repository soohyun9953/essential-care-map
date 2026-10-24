// Google Gemini 공통 호출: 가용 모델 자동 탐색 + 순차 시도 (2026-10-24, /api/llm/compare 방식을 공용화)
// 1) ListModels(v1beta → v1)로 이 키가 쓸 수 있는 generateContent 모델을 조회 (특수 목적 모델 제외)
//    조회가 안 되면 정적 후보(gemini-flash-latest, 2.5 flash 등)를 쓴다. 목록은 키별로 10분 캐시
// 2) flash 계열을 앞에 두고, 성공할 때까지 300ms 간격으로 하나씩 시도
// 3) 2.x 모델은 thinkingBudget 0으로 요청하고, 지원하지 않아 400이면 thinkingConfig 없이 다시 요청
// 4) 키 자체가 잘못된 오류(API_KEY_INVALID 등)는 모든 모델이 같으므로 바로 멈춘다

import { createHash } from 'crypto';

export interface Gemini_모델 {
  id: string;
  name: string;
  api_ver: 'v1beta' | 'v1';
}

export interface Gemini_시도 {
  model: string;
  error: string;
  status: number;
}

export type Gemini_결과 =
  | { 성공: true; 모델: Gemini_모델; 본문: string; 시도_순번: number; 토큰?: number }
  | { 성공: false; 시도: Gemini_시도[]; 키_오류: boolean };

export const 정적_후보: Gemini_모델[] = [
  { id: 'gemini-flash-latest', name: 'Google Gemini Flash (Latest)', api_ver: 'v1beta' },
  { id: 'gemini-2.5-flash', name: 'Google Gemini 2.5 Flash', api_ver: 'v1beta' },
  { id: 'gemini-2.5-flash-lite', name: 'Google Gemini 2.5 Flash-Lite', api_ver: 'v1beta' },
  { id: 'gemini-2.5-pro', name: 'Google Gemini 2.5 Pro', api_ver: 'v1beta' },
];

const 목록_캐시 = new Map<string, { 모델: Gemini_모델[]; 만료: number }>();
const 캐시_ms = 10 * 60 * 1000;
const 키_지문 = (key: string) => createHash('sha256').update(key).digest('hex').slice(0, 16);

/** flash 계열을 앞으로 (응답 속도·비용) */
export function 모델_정렬(목록: Gemini_모델[]): Gemini_모델[] {
  return [...목록].sort((a, b) => (a.id.toLowerCase().includes('flash') ? 0 : 1) - (b.id.toLowerCase().includes('flash') ? 0 : 1));
}

/** ListModels 응답에서 텍스트 생성용 모델만 고른다 */
export function 모델_목록_해석(응답: unknown, api_ver: 'v1beta' | 'v1'): Gemini_모델[] {
  const models = (응답 as { models?: { name: string; displayName?: string; supportedGenerationMethods?: string[] }[] })?.models ?? [];
  return models
    .filter((m) => m.supportedGenerationMethods?.includes('generateContent'))
    .filter((m) => !/(tts|image|embedding|audio|live|aqa|robotics|computer-use)/i.test(m.name))
    .map((m) => ({ id: m.name.replace(/^models\//, ''), name: m.displayName || m.name.replace(/^models\//, ''), api_ver }));
}

/** 이 키로 쓸 수 있는 모델 목록 (flash 우선 정렬, 10분 캐시) */
export async function Gemini_가용_모델(key: string, now: number = Date.now()): Promise<Gemini_모델[]> {
  const 지문 = 키_지문(key);
  const 캐시 = 목록_캐시.get(지문);
  if (캐시 && 캐시.만료 > now) return 캐시.모델;

  let 모델: Gemini_모델[] = [];
  for (const api_ver of ['v1beta', 'v1'] as const) {
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/${api_ver}/models`, {
        headers: { 'x-goog-api-key': key },
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) continue;
      모델 = 모델_목록_해석(await res.json(), api_ver);
      if (모델.length > 0) break;
    } catch {
      // 다음 버전 시도
    }
  }
  const 결과 = 모델_정렬(모델.length > 0 ? 모델 : 정적_후보);
  if (모델.length > 0) 목록_캐시.set(지문, { 모델: 결과, 만료: now + 캐시_ms });
  return 결과;
}

/** generateContent 응답 본문 (thinking 파트 제외, 모두 걸러지면 전체) */
export function Gemini_응답_본문(data: unknown): string {
  const parts = ((data as { candidates?: { content?: { parts?: { text?: string; thought?: boolean }[] } }[] })?.candidates?.[0]?.content?.parts ?? []);
  const 본문 = parts.filter((p) => !p.thought).map((p) => p.text ?? '').join('');
  return (본문.trim() ? 본문 : parts.map((p) => p.text ?? '').join('')).trim();
}

const 키_오류_여부 = (status: number, 메시지: string, 이유: string) =>
  /API_KEY|PERMISSION_DENIED|SERVICE_DISABLED/.test(이유) || (status === 400 && /api key not valid/i.test(메시지));

/** 가용 모델을 성공할 때까지 순차 시도 */
export async function Gemini_순차_호출(
  key: string,
  프롬프트: string,
  옵션: { temperature?: number; maxOutputTokens?: number; 시간제한_ms?: number; 최대_시도?: number } = {}
): Promise<Gemini_결과> {
  const { temperature = 0.4, maxOutputTokens = 8192, 시간제한_ms = 30000, 최대_시도 = Infinity } = 옵션;
  const 후보 = (await Gemini_가용_모델(key)).slice(0, 최대_시도);
  const 시도: Gemini_시도[] = [];

  for (let i = 0; i < 후보.length; i++) {
    const m = 후보[i];
    if (i > 0) await new Promise((r) => setTimeout(r, 300));
    try {
      const url = `https://generativelanguage.googleapis.com/${m.api_ver}/models/${m.id}:generateContent`;
      const config: Record<string, unknown> = { temperature, maxOutputTokens };
      if (m.id.includes('2.5') || m.id.includes('2.0')) config.thinkingConfig = { thinkingBudget: 0 };
      const 요청 = () =>
        fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
          body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: 프롬프트 }] }], generationConfig: config }),
          signal: AbortSignal.timeout(시간제한_ms),
        });
      let res = await 요청();
      if (res.status === 400 && config.thinkingConfig) {
        delete config.thinkingConfig;
        res = await 요청();
      }
      if (res.ok) {
        const data = (await res.json()) as { usageMetadata?: { totalTokenCount?: number } };
        const 본문 = Gemini_응답_본문(data);
        if (본문) return { 성공: true, 모델: m, 본문, 시도_순번: i + 1, 토큰: data.usageMetadata?.totalTokenCount };
        시도.push({ model: `${m.name} (${m.api_ver})`, error: '빈 응답', status: res.status });
        continue;
      }
      const err = ((await res.json().catch(() => ({}))) as { error?: { message?: string; status?: string; details?: { reason?: string }[] } }).error;
      const 메시지 = err?.message || `HTTP ${res.status}`;
      const 이유 = err?.details?.find((d) => d.reason)?.reason ?? err?.status ?? '';
      시도.push({ model: `${m.name} (${m.api_ver})`, error: [이유, 메시지].filter(Boolean).join(' · '), status: res.status });
      if (키_오류_여부(res.status, 메시지, 이유)) return { 성공: false, 시도, 키_오류: true };
    } catch (e) {
      시도.push({ model: m.name, error: e instanceof Error && e.name === 'TimeoutError' ? '응답 시간 초과' : e instanceof Error ? e.message : '네트워크 오류', status: 0 });
    }
  }
  return { 성공: false, 시도, 키_오류: false };
}
