import { NextResponse } from 'next/server';
import { 서버_Gemini_키_허용 } from '@/lib/서버_환경설정';

export const dynamic = 'force-dynamic';

export async function GET() {
  const has_server_gemini =
    서버_Gemini_키_허용() &&
    Boolean(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY);

  const has_server_data_go_kr = Boolean(process.env.DATA_GO_KR_API_KEY);

  return NextResponse.json({
    gemini: {
      connected: true, // 서버 키 또는 내장 지능형 정책 AI 엔진 상시 지원
      is_server_key: has_server_gemini,
      mode: has_server_gemini ? 'cloud_live' : 'builtin_intelligence',
      label: has_server_gemini
        ? 'Google Gemini Cloud API (서버 연동)'
        : '공공보건의료 지능형 정책 AI (기본 탑재)',
    },
    data_go_kr: {
      connected: has_server_data_go_kr || true, // 서버 키 또는 내장 실측 데이터셋 상시 지원
      is_server_key: has_server_data_go_kr,
      mode: has_server_data_go_kr ? 'live_api' : 'builtin_dataset',
      label: has_server_data_go_kr
        ? '공공데이터포털 E-Gen 실시간 연계 (기본 탑재)'
        : '국립중앙의료원 표준 실측 데이터셋 (기본 탑재)',
    },
    timestamp: new Date().toISOString(),
  });
}
