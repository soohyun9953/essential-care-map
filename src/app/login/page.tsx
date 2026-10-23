'use client';

import React from 'react';
import { 보안_로그인_모달 } from '@/components/보안_로그인_모달';

// 로그인 전용 화면 (화면은 공개이므로 강제 이동되지 않음). 로그인하거나 닫으면 메인 화면으로 이동.
export default function 로그인_페이지() {
  return (
    <main className="min-h-screen bg-slate-100 dark:bg-[#0f1013]">
      <보안_로그인_모달
        isOpen
        onClose={() => window.location.replace('/')}
        isAuthenticated={false}
        onAuthSuccess={() => window.location.replace('/')}
        onLogout={() => {}}
      />
    </main>
  );
}
