'use client';

import React, { useEffect, useState } from 'react';
import { PLATFORM_VERSION } from '@/lib/버전_정보';
import { 조각_로드_오류인가, 한번만_새로고침 } from '@/lib/배포_갱신';

const 확인_주기_ms = 5 * 60 * 1000;

// 새 버전이 배포되면 안내 배너를 띄우고, 이전 조각 파일 로드 오류는 한 번만 자동 새로고침한다.
export function 배포_갱신_감지() {
  const [새_버전, set_새_버전] = useState<string | null>(null);

  useEffect(() => {
    // 1) 이전 빌드 조각을 못 불러온 오류 → 자동 새로고침
    const on_error = (e: ErrorEvent) => {
      if (조각_로드_오류인가(e.error ?? e.message)) 한번만_새로고침();
    };
    const on_rejection = (e: PromiseRejectionEvent) => {
      if (조각_로드_오류인가(e.reason)) 한번만_새로고침();
    };
    window.addEventListener('error', on_error);
    window.addEventListener('unhandledrejection', on_rejection);

    // 2) 서버 버전 확인 → 다르면 안내 배너
    let 중지 = false;
    const 확인 = async () => {
      try {
        const res = await fetch('/api/version', { cache: 'no-store' });
        if (!res.ok) return;
        const data = (await res.json()) as { version?: string; label?: string };
        if (!중지 && data.version && data.version !== PLATFORM_VERSION.packageVersion) {
          set_새_버전(data.label ?? data.version);
        }
      } catch {
        // 네트워크 오류는 무시하고 다음 주기에 다시 확인
      }
    };
    const on_visible = () => {
      if (document.visibilityState === 'visible') 확인();
    };
    const timer = window.setInterval(확인, 확인_주기_ms);
    document.addEventListener('visibilitychange', on_visible);

    return () => {
      중지 = true;
      window.removeEventListener('error', on_error);
      window.removeEventListener('unhandledrejection', on_rejection);
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', on_visible);
    };
  }, []);

  if (!새_버전) return null;
  return (
    <div
      role="status"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-900 text-white text-xs shadow-2xl"
    >
      <span>
        새 버전(<strong>{새_버전}</strong>)이 배포되었습니다. 새로고침하면 적용됩니다.
      </span>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="px-3 py-1.5 rounded-xl bg-blue-500 hover:bg-blue-600 font-bold cursor-pointer"
      >
        새로고침
      </button>
      <button type="button" onClick={() => set_새_버전(null)} className="text-slate-400 hover:text-white cursor-pointer" aria-label="닫기">
        ✕
      </button>
    </div>
  );
}
