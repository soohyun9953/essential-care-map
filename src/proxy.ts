import { NextRequest, NextResponse } from 'next/server';
import { 인증_쿠키_이름, 인증_토큰_검증 } from '@/lib/사이트_인증';

// 서버 측 접근 제어: 유효한 인증 쿠키가 없으면 페이지는 /login 으로, API는 401로 막는다.
// (Next 16부터 middleware → proxy 로 이름이 바뀜)
export async function proxy(req: NextRequest) {
  if (await 인증_토큰_검증(req.cookies.get(인증_쿠키_이름)?.value)) {
    return NextResponse.next();
  }
  if (req.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.json({ ok: false, message: '인증이 필요합니다.' }, { status: 401 });
  }
  const login = req.nextUrl.clone();
  login.pathname = '/login';
  login.search = '';
  return NextResponse.redirect(login);
}

export const config = {
  // 로그인 화면·인증 API·정적 자산은 제외
  matcher: ['/((?!login|api/auth|_next/static|_next/image|favicon.ico).*)'],
};
