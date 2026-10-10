'use client';

import React, { useEffect } from 'react';
import { 조각_로드_오류인가, 한번만_새로고침 } from '@/lib/배포_갱신';

// 루트 레이아웃까지 실패한 경우의 마지막 오류 경계
export default function 전체_오류({ error }: { error: Error & { digest?: string } }) {
  const 배포_오류 = 조각_로드_오류인가(error);
  useEffect(() => {
    if (배포_오류) 한번만_새로고침();
  }, [배포_오류]);

  return (
    <html lang="ko">
      <body style={{ fontFamily: 'sans-serif', display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: '#f5f5f7' }}>
        <div style={{ textAlign: 'center', padding: 24 }}>
          <h2>{배포_오류 ? '새 버전이 배포되었습니다' : '문제가 발생했습니다'}</h2>
          <p>새로고침하면 최신 화면으로 열립니다.</p>
          <button type="button" onClick={() => window.location.reload()} style={{ padding: '8px 16px', cursor: 'pointer' }}>
            새로고침
          </button>
        </div>
      </body>
    </html>
  );
}
