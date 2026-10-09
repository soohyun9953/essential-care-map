'use client';

import React from 'react';
import { 보안_로그인_모달 } from '@/components/보안_로그인_모달';

// 미인증 사용자는 미들웨어가 이 화면으로 보낸다. 로그인하면 메인 화면으로 이동.
export default function 로그인_페이지() {
  return (
    <main className="min-h-screen bg-slate-100 dark:bg-[#0f1013]">
      <보안_로그인_모달
        isOpen
        onClose={() => {}}
        isAuthenticated={false}
        onAuthSuccess={() => window.location.replace('/')}
        onLogout={() => {}}
      />
    </main>
  );
}
