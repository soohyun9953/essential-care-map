import { NextRequest, NextResponse } from 'next/server';
import { 지침_검색, 지침_요약_프롬프트, 지침_문서명 } from '@/lib/책임의료기관_지침_검색';
import { Gemini_키_정리, Gemini_키_형식, 요청_허용, 질문_최대_길이 } from '@/lib/대국민_AI_요약';
import { Gemini_순차_호출 } from '@/lib/Gemini_모델_탐색';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// ② 의료기관 담당자 › 2-5 「2026년 책임의료기관 통합 사업 안내」 질의응답
// - 서버가 원문(331쪽)에서 근거 쪽을 찾고, 그 발췌만 Gemini에 넘겨 요약 (근거 없으면 Gemini 미호출)
// - 원문 발췌는 응답에 담아 화면에 쪽수와 함께 보여준다 (화면 번들에는 원문을 싣지 않음)
// - 로그인 사용자만(proxy), IP별 요청 제한, 서버 GEMINI_API_KEY 사용 (1-4와 같은 방식)

export interface 지침_질의_응답 {
  상태: '성공' | '근거없음' | '미연결' | '제한' | '실패';
  문서명: string;
  근거: { 번호: number; 쪽_표시: string; 구분: string; 발췌: string }[];
  요약?: string;
  모델?: string;
  사유?: string;
}

export async function POST(req: NextRequest) {
  let body: { 질문?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json<지침_질의_응답>({ 상태: '실패', 문서명: 지침_문서명, 근거: [], 사유: '요청 형식 오류' }, { status: 400 });
  }
  const 질문 = typeof body.질문 === 'string' ? body.질문.trim().slice(0, 질문_최대_길이) : '';
  if (!질문) return NextResponse.json<지침_질의_응답>({ 상태: '실패', 문서명: 지침_문서명, 근거: [], 사유: '질문 없음' }, { status: 400 });

  const 찾은 = 지침_검색(질문);
  const 근거 = 찾은.map(({ 번호, 쪽_표시, 구분, 발췌 }) => ({ 번호, 쪽_표시, 구분, 발췌 }));
  if (!찾은.length) return NextResponse.json<지침_질의_응답>({ 상태: '근거없음', 문서명: 지침_문서명, 근거 });

  const key = Gemini_키_정리(process.env.GEMINI_API_KEY);
  if (!key) return NextResponse.json<지침_질의_응답>({ 상태: '미연결', 문서명: 지침_문서명, 근거, 사유: '서버 Gemini 키 미등록' });

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown';
  if (!요청_허용(ip)) {
    return NextResponse.json<지침_질의_응답>(
      { 상태: '제한', 문서명: 지침_문서명, 근거, 사유: '요청이 많아 잠시 후 다시 시도해 주세요 (1분 10회 · 1시간 60회)' },
      { status: 429 }
    );
  }

  const 결과 = await Gemini_순차_호출(key, 지침_요약_프롬프트(질문, 찾은), { temperature: 0.2, maxOutputTokens: 1200, 시간제한_ms: 20000, 최대_시도: 5 });
  if (결과.성공) {
    return NextResponse.json<지침_질의_응답>({ 상태: '성공', 문서명: 지침_문서명, 근거, 요약: 결과.본문, 모델: 결과.모델.name });
  }
  const 마지막 = 결과.시도[결과.시도.length - 1];
  const 사유 = 마지막
    ? `Gemini HTTP ${마지막.status} · ${마지막.error.slice(0, 140)}${결과.키_오류 ? ` (${Gemini_키_형식(key)})` : ''}`
    : '가용 모델 없음';
  console.warn(`[2-5 책임의료기관 지침 질의] 실패: ${사유}`);
  return NextResponse.json<지침_질의_응답>({ 상태: '실패', 문서명: 지침_문서명, 근거, 사유 });
}
