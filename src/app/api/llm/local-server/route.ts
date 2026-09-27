import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';
import { 로컬_LLM_허용 } from '@/lib/서버_환경설정';

export const dynamic = 'force-dynamic';

const 비활성_응답 = () =>
  NextResponse.json(
    {
      is_running: false,
      disabled: true,
      message: '로컬 sLLM 기능은 로컬 개발 환경에서만 사용할 수 있습니다. (LOCAL_LLM_ENABLED 미설정)',
    },
    { status: 403 }
  );

// 1. 로컬 sLLM 서버 헬스체크 (GET)
export async function GET() {
  if (!로컬_LLM_허용()) return 비활성_응답();

  try {
    const controller = new AbortController();
    const timeout_id = setTimeout(() => controller.abort(), 1500);

    const res = await fetch('http://127.0.0.1:8000/health', {
      signal: controller.signal,
    });
    clearTimeout(timeout_id);

    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      return NextResponse.json({
        is_running: true,
        model: data.model || 'Qwen/Qwen2.5-3B-Instruct',
        device: data.device || 'cpu',
        is_loaded: data.is_loaded ?? true,
        available_models: data.available_models || [
          { id: 'Qwen/Qwen2.5-0.5B-Instruct', name: 'Qwen 2.5 0.5B (초경량 초고속)', size: '0.5B' },
          { id: 'Qwen/Qwen2.5-1.5B-Instruct', name: 'Qwen 2.5 1.5B (속도·품질 균형)', size: '1.5B' },
          { id: 'Qwen/Qwen2.5-3B-Instruct', name: 'Qwen 2.5 3B (고성능 심층분석 추천 ⭐)', size: '3B' },
        ],
        message: '로컬 sLLM 서버가 정상 가동 중입니다.',
      });
    }
  } catch {
    // 미실행 상태
  }

  return NextResponse.json({
    is_running: false,
    available_models: [
      { id: 'Qwen/Qwen2.5-0.5B-Instruct', name: 'Qwen 2.5 0.5B (초경량 초고속)', size: '0.5B' },
      { id: 'Qwen/Qwen2.5-1.5B-Instruct', name: 'Qwen 2.5 1.5B (속도·품질 균형)', size: '1.5B' },
      { id: 'Qwen/Qwen2.5-3B-Instruct', name: 'Qwen 2.5 3B (고성능 심층분석 추천 ⭐)', size: '3B' },
    ],
    message: '로컬 sLLM 서버가 대기 상태(미실행)입니다.',
  });
}

// 2. 브라우저 버튼 클릭을 통한 로컬 sLLM 서버 시작/모델 전환/종료 (POST)
export async function POST(req: NextRequest) {
  if (!로컬_LLM_허용()) return 비활성_응답();

  try {
    const body = await req.json().catch(() => ({}));
    const action = body.action || 'start';
    const target_model = body.model || 'Qwen/Qwen2.5-3B-Instruct';

    // 1) 모델 동적 전환 요청인 경우
    if (action === 'switch') {
      try {
        const switch_res = await fetch('http://127.0.0.1:8000/switch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ model: target_model }),
          signal: AbortSignal.timeout(60000), // 가중치 로드 대기 (최대 60초)
        });
        if (switch_res.ok) {
          const switch_data = await switch_res.json();
          return NextResponse.json({
            is_running: true,
            model: switch_data.current_model || target_model,
            message: `성공적으로 '${target_model}' 모델로 전환되었습니다!`,
          });
        }
      } catch (err: any) {
        return NextResponse.json(
          { is_running: false, error: `모델 전환 실패: ${err.message}` },
          { status: 500 }
        );
      }
    }

    // 2) 서버 시작 요청인 경우
    let is_already_running = false;
    try {
      const ping = await fetch('http://127.0.0.1:8000/health', {
        signal: AbortSignal.timeout(1000),
      });
      if (ping.ok) {
        is_already_running = true;
        const ping_data = await ping.json().catch(() => ({}));
        // 이미 켜져 있다면 요청된 모델로 전환 시도
        if (ping_data.model !== target_model) {
          await fetch('http://127.0.0.1:8000/switch', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ model: target_model }),
            signal: AbortSignal.timeout(60000),
          }).catch(() => {});
        }
        return NextResponse.json({
          is_running: true,
          model: target_model,
          message: `로컬 sLLM 서버가 이미 가동 중입니다. (활성 모델: ${target_model})`,
        });
      }
    } catch {
      // 꺼져 있음
    }

    if (action === 'start') {
      const script_path = path.join(process.cwd(), 'scripts', 'local_sllm_server.py');

      // 윈도우 백그라운드 프로세스로 파이썬 sLLM 서버 구동 (--model 인자 전달)
      const child = spawn('python', [script_path, '--model', target_model], {
        detached: true,
        stdio: 'ignore',
        cwd: process.cwd(),
      });

      child.unref();

      // 서버 초기 구동 대기 (최대 4초간 폴링)
      let started = false;
      for (let i = 0; i < 8; i++) {
        await new Promise((r) => setTimeout(r, 500));
        try {
          const check = await fetch('http://127.0.0.1:8000/health', {
            signal: AbortSignal.timeout(600),
          });
          if (check.ok) {
            started = true;
            break;
          }
        } catch {}
      }

      return NextResponse.json({
        is_running: started,
        model: target_model,
        message: started
          ? `로컬 sLLM 서버(8000 포트)가 성공적으로 시작되었습니다! (선택 모델: ${target_model})`
          : `로컬 sLLM 서버 시작 프로세스를 실행했습니다. 모델 가중치 로드에 몇 초 정도 소요될 수 있습니다.`,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { is_running: false, error: error.message || '서버 제어 실패' },
      { status: 500 }
    );
  }
}
