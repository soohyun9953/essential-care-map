import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

export const dynamic = 'force-dynamic';

// 1. 로컬 sLLM 서버 헬스체크 (GET)
export async function GET() {
  try {
    const controller = new AbortController();
    const timeout_id = setTimeout(() => controller.abort(), 1200);

    const res = await fetch('http://127.0.0.1:8000/health', {
      signal: controller.signal,
    });
    clearTimeout(timeout_id);

    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      return NextResponse.json({
        is_running: true,
        model: data.model || 'Qwen/Qwen2.5-0.5B-Instruct',
        device: data.device || 'cpu',
        message: '로컬 sLLM 서버가 정상 가동 중입니다.',
      });
    }
  } catch {
    // 미실행 상태
  }

  return NextResponse.json({
    is_running: false,
    message: '로컬 sLLM 서버가 대기 상태(미실행)입니다.',
  });
}

// 2. 브라우저 버튼 클릭을 통한 로컬 sLLM 서버 시작/종료 (POST)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const action = body.action || 'start';

    // 이미 실행 중인지 확인
    try {
      const ping = await fetch('http://127.0.0.1:8000/health', {
        signal: AbortSignal.timeout(1000),
      });
      if (ping.ok) {
        if (action === 'start') {
          return NextResponse.json({
            is_running: true,
            message: '로컬 sLLM 서버가 이미 8000번 포트에서 가동 중입니다.',
          });
        }
      }
    } catch {
      // 꺼져 있음
    }

    if (action === 'start') {
      const script_path = path.join(process.cwd(), 'scripts', 'local_sllm_server.py');

      // 윈도우 백그라운드 프로세스로 파이썬 sLLM 서버 구동
      const child = spawn('python', [script_path], {
        detached: true,
        stdio: 'ignore',
        cwd: process.cwd(),
        shell: true,
      });

      child.unref();

      // 서버 초기 구동 대기 (최대 3초간 폴링)
      let started = false;
      for (let i = 0; i < 6; i++) {
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
        message: started
          ? '로컬 sLLM 서버(8000 포트)가 성공적으로 시작되었습니다!'
          : '로컬 sLLM 서버 시작 프로세스를 실행했습니다. 모델 가중치 로드에 몇 초 정도 소요될 수 있습니다.',
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
