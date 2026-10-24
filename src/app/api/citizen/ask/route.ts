import { NextRequest, NextResponse } from 'next/server';
import { 공개정보_안내 } from '@/lib/대국민_공개정보_안내_엔진';
import { Gemini_키_정리, Gemini_키_형식, 실시간_줄_정리, 요약_프롬프트, 요청_허용, 질문_최대_길이 } from '@/lib/대국민_AI_요약';
import { Gemini_순차_호출 } from '@/lib/Gemini_모델_탐색';

export const dynamic = 'force-dynamic';
// 모델 목록 조회 + 여러 모델 순차 시도를 고려한 최대 실행 시간 (초)
export const maxDuration = 60;

// ① 대국민 › 1-4 AI 안내 도우미: 사이트 자료 근거 + Gemini 요약
// - 로그인 사용자만 (proxy가 /api 전체를 보호), IP별 요청 제한
// - 서버 환경변수 GEMINI_API_KEY는 이 경로에서만 쓴다 (다른 Gemini 경로는 ALLOW_SERVER_GEMINI_KEY 설정을 따름)
// - 모델은 /api/llm/compare와 같은 방식: 이 키로 쓸 수 있는 모델 목록을 조회해 flash부터 성공할 때까지 순차 시도

export interface 대국민_AI_요약_응답 {
  상태: '성공' | '근거없음' | '미연결' | '제한' | '실패';
  요약?: string;
  모델?: string;
  사유?: string;
  근거_수?: number;
}


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

  const key = Gemini_키_정리(process.env.GEMINI_API_KEY);
  if (!key) return NextResponse.json<대국민_AI_요약_응답>({ 상태: '미연결', 사유: '서버 Gemini 키 미등록' });

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown';
  if (!요청_허용(ip)) {
    return NextResponse.json<대국민_AI_요약_응답>({ 상태: '제한', 사유: '요청이 많아 잠시 후 다시 시도해 주세요 (1분 10회 · 1시간 60회)' }, { status: 429 });
  }

  const 프롬프트 = 요약_프롬프트(질문, 답변, 실시간_줄_정리(body.실시간));
  const 결과 = await Gemini_순차_호출(key, 프롬프트, { temperature: 0.2, maxOutputTokens: 1024, 시간제한_ms: 15000, 최대_시도: 5 });
  if (결과.성공) {
    return NextResponse.json<대국민_AI_요약_응답>({ 상태: '성공', 요약: 결과.본문, 모델: 결과.모델.name, 근거_수: 답변.출처.length });
  }
  const 마지막 = 결과.시도[결과.시도.length - 1];
  const 마지막_사유 = 마지막
    ? `${결과.키_오류 ? '' : `${결과.시도.length}개 모델 시도 · `}Gemini HTTP ${마지막.status} · ${마지막.error.slice(0, 140)}${결과.키_오류 ? ` (${Gemini_키_형식(key)})` : ''}`
    : '가용 모델 없음';
  console.warn(`[1-4 Gemini 요약] 실패: ${마지막_사유}`);
  return NextResponse.json<대국민_AI_요약_응답>({ 상태: '실패', 사유: 마지막_사유 });
}
