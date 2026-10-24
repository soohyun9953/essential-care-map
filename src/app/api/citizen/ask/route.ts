import { NextRequest, NextResponse } from 'next/server';
import { 공개정보_안내 } from '@/lib/대국민_공개정보_안내_엔진';
import { Gemini_본문, 실시간_줄_정리, 요약_프롬프트, 요청_허용, 질문_최대_길이 } from '@/lib/대국민_AI_요약';

export const dynamic = 'force-dynamic';

// ① 대국민 › 1-4 AI 안내 도우미: 사이트 자료 근거 + Gemini 요약
// - 로그인 사용자만 (proxy가 /api 전체를 보호), IP별 요청 제한
// - 서버 환경변수 GEMINI_API_KEY는 이 경로에서만 쓴다 (다른 Gemini 경로는 ALLOW_SERVER_GEMINI_KEY 설정을 따름)

export interface 대국민_AI_요약_응답 {
  상태: '성공' | '근거없음' | '미연결' | '제한' | '실패';
  요약?: string;
  모델?: string;
  사유?: string;
  근거_수?: number;
}

const 모델_후보 = ['gemini-flash-latest', 'gemini-2.5-flash'];

export async function POST(req: NextRequest) {
  let body: { 질문?: unknown; 실시간?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json<대국민_AI_요약_응답>({ 상태: '실패', 사유: '요청 형식 오류' }, { status: 400 });
  }
  const 질문 = typeof body.질문 === 'string' ? body.질문.trim().slice(0, 질문_최대_길이) : '';
  if (!질문) return NextResponse.json<대국민_AI_요약_응답>({ 상태: '실패', 사유: '질문 없음' }, { status: 400 });

  // 근거는 서버에서 다시 찾는다
  const 답변 = 공개정보_안내(질문);
  if (답변.유형 === '찾지못함' || 답변.내용.length === 0) {
    return NextResponse.json<대국민_AI_요약_응답>({ 상태: '근거없음', 근거_수: 0 });
  }

  const key = process.env.GEMINI_API_KEY?.trim().replace(/^["']|["']$/g, '') ?? '';
  if (!key) return NextResponse.json<대국민_AI_요약_응답>({ 상태: '미연결', 사유: '서버 Gemini 키 미등록' });

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown';
  if (!요청_허용(ip)) {
    return NextResponse.json<대국민_AI_요약_응답>({ 상태: '제한', 사유: '요청이 많아 잠시 후 다시 시도해 주세요 (1분 10회 · 1시간 60회)' }, { status: 429 });
  }

  const 프롬프트 = 요약_프롬프트(질문, 답변, 실시간_줄_정리(body.실시간));
  let 마지막_사유 = '';
  for (const 모델 of 모델_후보) {
    try {
      const generationConfig: Record<string, unknown> = { temperature: 0.2, maxOutputTokens: 1024 };
      if (모델.includes('2.5')) generationConfig.thinkingConfig = { thinkingBudget: 0 };
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${모델}:generateContent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
        body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: 프롬프트 }] }], generationConfig }),
        signal: AbortSignal.timeout(20000),
      });
      if (!res.ok) {
        마지막_사유 = `Gemini HTTP ${res.status}`;
        continue;
      }
      const 요약 = Gemini_본문(await res.json());
      if (!요약) {
        마지막_사유 = 'Gemini 빈 응답';
        continue;
      }
      return NextResponse.json<대국민_AI_요약_응답>({ 상태: '성공', 요약, 모델, 근거_수: 답변.출처.length });
    } catch (e) {
      마지막_사유 = e instanceof Error && e.name === 'TimeoutError' ? 'Gemini 응답 시간 초과' : 'Gemini 호출 오류';
    }
  }
  console.warn(`[1-4 Gemini 요약] 실패: ${마지막_사유}`);
  return NextResponse.json<대국민_AI_요약_응답>({ 상태: '실패', 사유: 마지막_사유 });
}
