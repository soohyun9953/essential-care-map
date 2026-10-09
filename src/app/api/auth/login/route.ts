import { NextRequest, NextResponse } from 'next/server';
import { 비밀번호_검증, 비밀번호_설정됨, 인증_쿠키_이름, 인증_유효기간_초, 인증_토큰_생성 } from '@/lib/사이트_인증';

export async function POST(req: NextRequest) {
  if (!비밀번호_설정됨()) {
    return NextResponse.json(
      { ok: false, message: '서버에 접속 비밀번호(SITE_PASSWORD)가 설정되지 않아 로그인할 수 없습니다. 관리자에게 문의하세요.' },
      { status: 503 }
    );
  }

  let password = '';
  try {
    const body = await req.json();
    password = typeof body?.password === 'string' ? body.password : '';
  } catch {
    // 잘못된 요청 본문은 실패로 처리
  }

  if (!(await 비밀번호_검증(password))) {
    // 무차별 대입 속도를 늦추기 위한 지연
    await new Promise((r) => setTimeout(r, 600));
    return NextResponse.json({ ok: false, message: '패스워드가 일치하지 않습니다. 다시 확인해주세요.' }, { status: 401 });
  }

  const token = await 인증_토큰_생성();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(인증_쿠키_이름, token!, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 인증_유효기간_초,
  });
  return res;
}
