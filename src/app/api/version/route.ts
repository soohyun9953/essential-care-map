import { NextResponse } from 'next/server';
import { PLATFORM_VERSION } from '@/lib/버전_정보';

// 현재 서버에 배포된 버전 (열려 있는 화면이 새 배포를 알아채는 데 사용)
export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(
    { version: PLATFORM_VERSION.packageVersion, label: PLATFORM_VERSION.fullLabel },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}
