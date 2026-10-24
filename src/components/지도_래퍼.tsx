'use client';

// Next.js dynamic import (ssr: false) 구조를 적용한 하이브리드 지도 래퍼 컴포넌트
// - 카카오 지도 Web API (kakao.maps) 단일 엔진 (오픈스트리트맵 전환은 2026-10-24 삭제)
// - 카카오 JavaScript API 키 설정 모달 통합: 키를 저장하면 지도를 다시 불러온다

import dynamic from 'next/dynamic';
import React, { useState } from 'react';
import { 필수의료_진단_결과, 지도_시각화_모드, 지역_구분_단위 } from '@/lib/필수의료_타입';
import { 카카오_api키_설정_모달 } from './카카오_api키_설정_모달';

interface 지도_래퍼_속성 {
  diagnosed_list: 필수의료_진단_결과[];
  selected_region: 필수의료_진단_결과 | null;
  on_select_region: (region: 필수의료_진단_결과) => void;
  view_mode: 지도_시각화_모드;
  on_change_view_mode: (mode: 지도_시각화_모드) => void;
  region_unit: 지역_구분_단위;
  on_change_region_unit: (unit: 지역_구분_단위) => void;
}

// 1. 카카오 지도 컴포넌트 클라이언트 전용 로딩
const KakaoMap = dynamic(
  () => import('./카카오_시군구_지도_컴포넌트').then((mod) => mod.카카오_시군구_지도_컴포넌트),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full min-h-[580px] bg-slate-100 dark:bg-slate-900 rounded-3xl flex flex-col items-center justify-center border border-slate-200 dark:border-slate-800">
        <div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">카카오맵 GIS 지도 로딩 중...</p>
      </div>
    ),
  }
);

export const 지도_래퍼: React.FC<지도_래퍼_속성> = (props) => {
  const [is_key_modal_open, set_is_key_modal_open] = useState<boolean>(false);
  const [재연결, set_재연결] = useState(0);

  // 키 저장 후 지도를 새로 마운트해 새 키로 다시 연결
  const handle_key_saved = (_newKey: string) => {
    set_is_key_modal_open(false);
    set_재연결((n) => n + 1);
  };

  return (
    <>
      <KakaoMap key={재연결} {...props} on_open_key_modal={() => set_is_key_modal_open(true)} />

      {/* 카카오 API 키 설정 모달 */}
      <카카오_api키_설정_모달
        is_open={is_key_modal_open}
        on_close={() => set_is_key_modal_open(false)}
        on_key_saved={handle_key_saved}
      />
    </>
  );
};
