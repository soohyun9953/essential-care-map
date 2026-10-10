'use client';

import React, { useEffect, useState } from 'react';
import { 조각_로드_오류인가, 한번만_새로고침 } from '@/lib/배포_갱신';

// 화면 오류 경계: 'Application error' 대신 안내를 보여주고, 배포 교체로 인한 오류는 자동 새로고침
export default function 화면_오류({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const 배포_오류 = 조각_로드_오류인가(error);
  const [자동_새로고침_중, set_자동_새로고침_중] = useState(false);

  useEffect(() => {
    if (배포_오류) set_자동_새로고침_중(한번만_새로고침());
  }, [배포_오류]);

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-[#f5f5f7]">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-xl p-6 space-y-3 text-center">
        <h2 className="text-lg font-bold text-slate-900">
          {배포_오류 ? '새 버전이 배포되었습니다' : '화면을 표시하는 중 문제가 발생했습니다'}
        </h2>
        <p className="text-sm text-slate-600">
          {배포_오류
            ? 자동_새로고침_중
              ? '최신 버전으로 새로고침하는 중입니다…'
              : '이전 화면의 파일을 불러오지 못했습니다. 새로고침하면 최신 버전으로 열립니다.'
            : '잠시 후 다시 시도하거나 새로고침해 주세요.'}
        </p>
        <div className="flex justify-center gap-2 pt-1">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold cursor-pointer"
          >
            새로고침
          </button>
          {!배포_오류 && (
            <button
              type="button"
              onClick={() => reset()}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold cursor-pointer"
            >
              다시 시도
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
