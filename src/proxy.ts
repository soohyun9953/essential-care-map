import { NextRequest, NextResponse } from 'next/server';
import { 인증_쿠키_이름, 인증_토큰_검증 } from '@/lib/사이트_인증';

// 서버 측 접근 제어 (2026-10-24 결정: 화면은 로그인 없이 공개, 서버 키로 비용이 드는 API만 보호)
// - 보호: AI API(/api/llm: Gemini·로컬 sLLM), 문서 변환 API(/api/report: HWPX 생성)
// - 공개: 모든 화면, 응급실 실시간 병상(/api/emergency, 대국민 지도용), 시스템·버전 상태
// - 보호 API는 유효한 인증 쿠키가 없으면 401 (헤더 「로그인」 버튼)
// (Next 16부터 middleware → proxy 로 이름이 바뀜)
export const 보호_API_경로 = ['/api/llm', '/api/report'];

export function 보호_대상인가(pathname: string): boolean {
  return 보호_API_경로.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export async function proxy(req: NextRequest) {
  if (!보호_대상인가(req.nextUrl.pathname)) return NextResponse.next();
  if (await 인증_토큰_검증(req.cookies.get(인증_쿠키_이름)?.value)) {
    return NextResponse.next();
  }
  return NextResponse.json(
    { ok: false, message: '로그인이 필요한 기능입니다. 화면 오른쪽 위 「로그인」 버튼으로 로그인한 뒤 다시 시도해주세요.' },
    { status: 401 }
  );
}

export const config = {
  matcher: ['/api/llm/:path*', '/api/report/:path*'],
};
