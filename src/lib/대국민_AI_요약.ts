// ① 대국민 › 1-4 AI 안내 도우미의 Gemini 요약 (2026-10-24)
// - 서버가 질문으로 사이트 자료(공개정보_안내 엔진)를 다시 찾아, 그 근거만 Gemini에 넘긴다
//   (클라이언트가 보낸 임의 문맥으로 Gemini를 범용 챗봇처럼 쓰지 못하게)
// - 근거를 찾지 못한 질문은 Gemini를 부르지 않는다
// - 클라이언트에서 받는 것은 E-Gen 실시간 확인 결과 몇 줄뿐 (개수·길이 제한)

import type { 안내_답변 } from './대국민_공개정보_안내_엔진';

export const 질문_최대_길이 = 300;
export const 실시간_최대_줄 = 8;
export const 실시간_줄_최대_길이 = 160;

/** 클라이언트가 보낸 실시간 확인 줄을 정리 (문자열만, 개수·길이 제한) */
export function 실시간_줄_정리(값: unknown): string[] {
  if (!Array.isArray(값)) return [];
  return 값
    .filter((x): x is string => typeof x === 'string')
    .slice(0, 실시간_최대_줄)
    .map((x) => x.replace(/[\r\n]+/g, ' ').slice(0, 실시간_줄_최대_길이));
}

/** Gemini에 보낼 프롬프트. 근거 자료·출처 번호는 화면의 출처 번호와 같다 */
export function 요약_프롬프트(질문: string, 답변: 안내_답변, 실시간: string[]): string {
  const 출처 = 답변.출처.map((s, i) => `[${i + 1}] ${s.자료} — ${s.상세}`).join('\n');
  return [
    '당신은 국민에게 공공의료 정보를 안내하는 도우미입니다. 아래 [근거 자료]와 [실시간 확인]에 있는 내용만 사용해 [질문]에 답하세요.',
    '',
    '규칙:',
    '1. 근거 자료에 없는 병원명·숫자·전화번호·제도 내용을 만들지 마세요. 근거로 답할 수 없는 부분은 "공개 자료에서 확인되지 않습니다"라고 쓰세요.',
    '2. 각 문장 끝에 근거가 된 [출처 목록] 번호를 [1]처럼 붙이세요.',
    '3. 쉬운 말로 5문장 이내로 답하세요. 목록이 필요하면 최대 5개 항목으로 쓰세요.',
    '4. 의식 저하, 호흡곤란, 대량 출혈, 심한 가슴 통증 등 위급한 상황이 의심되면 첫 문장에서 119 신고를 안내하세요.',
    '5. 병상 수는 [실시간 확인]에 있는 값만 쓰고, 수시로 바뀌니 출발 전 전화로 확인하라고 덧붙이세요.',
    '6. 진단이나 처방은 하지 말고, 필요하면 의료기관 상담을 권하세요.',
    '7. 마크다운 표나 제목(#)은 쓰지 말고 평문으로 쓰세요.',
    '',
    `[질문] ${질문}`,
    '',
    `[근거 자료 — ${답변.제목}]`,
    ...답변.내용.map((c) => `- ${c}`),
    '',
    '[실시간 확인]',
    ...(실시간.length ? 실시간.map((c) => `- ${c}`) : ['- 없음']),
    '',
    '[출처 목록]',
    출처 || '- 없음',
  ].join('\n');
}

// ---------- 요청 제한 (IP별, 서버 메모리. 인스턴스마다 따로 센다)
export const 분당_최대 = 10;
export const 시간당_최대 = 60;
const 요청_기록 = new Map<string, number[]>();

/** 허용되면 기록하고 true. 1분 10회·1시간 60회를 넘으면 false */
export function 요청_허용(key: string, now: number = Date.now()): boolean {
  const 시각들 = (요청_기록.get(key) ?? []).filter((t) => now - t < 60 * 60 * 1000);
  const 최근_1분 = 시각들.filter((t) => now - t < 60 * 1000).length;
  if (최근_1분 >= 분당_최대 || 시각들.length >= 시간당_최대) {
    요청_기록.set(key, 시각들);
    return false;
  }
  시각들.push(now);
  요청_기록.set(key, 시각들);
  if (요청_기록.size > 10_000) {
    const 첫키 = 요청_기록.keys().next().value;
    if (첫키 !== undefined) 요청_기록.delete(첫키);
  }
  return true;
}

/** Gemini generateContent 응답에서 본문 텍스트만 꺼낸다 */
export function Gemini_본문(응답: unknown): string {
  const parts = (응답 as { candidates?: { content?: { parts?: { text?: string }[] } }[] })?.candidates?.[0]?.content?.parts ?? [];
  return parts
    .map((p) => p.text ?? '')
    .join('')
    .trim();
}
