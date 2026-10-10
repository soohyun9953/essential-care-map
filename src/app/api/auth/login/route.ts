import { NextRequest, NextResponse } from 'next/server';
import { 비밀번호_검증, 비밀번호_설정됨, 인증_쿠키_이름, 인증_유효기간_초, 인증_토큰_생성 } from '@/lib/사이트_인증';
import { 남은_시도_횟수, 성공_기록, 시도_상태_확인, 실패_기록, 접속_IP, 차단_안내 } from '@/lib/로그인_시도_제한';

function 차단_응답(남은_초: number) {
  return NextResponse.json(
    { ok: false, message: 차단_안내(남은_초) },
    { status: 429, headers: { 'Retry-After': String(남은_초) } }
  );
}

export async function POST(req: NextRequest) {
  if (!비밀번호_설정됨()) {
    return NextResponse.json(
      { ok: false, message: '서버에 접속 비밀번호(SITE_PASSWORD)가 설정되지 않아 로그인할 수 없습니다. 관리자에게 문의하세요.' },
      { status: 503 }
    );
  }

  // 차단 중인 IP는 비밀번호를 확인하지 않고 거절
  const ip = 접속_IP(req.headers);
  const 상태 = 시도_상태_확인(ip);
  if (상태.차단됨) return 차단_응답(상태.남은_초);

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
    const 결과 = 실패_기록(ip);
    if (결과.차단됨) return 차단_응답(결과.남은_초);
    const 남은 = 남은_시도_횟수(ip);
    return NextResponse.json(
      { ok: false, message: `패스워드가 일치하지 않습니다. 다시 확인해주세요. (남은 시도 ${남은}회)` },
      { status: 401 }
    );
  }

  성공_기록(ip);
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
