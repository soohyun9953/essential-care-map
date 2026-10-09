import { NextRequest, NextResponse } from 'next/server';
import { 인증_쿠키_이름, 인증_토큰_검증 } from '@/lib/사이트_인증';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const authenticated = await 인증_토큰_검증(req.cookies.get(인증_쿠키_이름)?.value);
  return NextResponse.json({ authenticated });
}
