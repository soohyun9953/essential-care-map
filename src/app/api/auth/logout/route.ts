import { NextResponse } from 'next/server';
import { 인증_쿠키_이름 } from '@/lib/사이트_인증';

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(인증_쿠키_이름, '', { httpOnly: true, path: '/', maxAge: 0 });
  return res;
}
