'use client';

// Next.js dynamic import (ssr: false) 구조를 적용한 Leaflet 지도 안전 래퍼 컴포넌트

import dynamic from 'next/dynamic';
import React from 'react';
import { 필수의료_진단_결과, 지도_시각화_모드 } from '@/lib/필수의료_타입';

interface 지도_래퍼_속성 {
  diagnosed_list: 필수의료_진단_결과[];
  selected_region: 필수의료_진단_결과 | null;
  on_select_region: (region: 필수의료_진단_결과) => void;
  view_mode: 지도_시각화_모드;
  on_change_view_mode: (mode: 지도_시각화_모드) => void;
}

// ssr: false 적용을 통한 클라이언트 사이드 전용 로딩
const LeafletMap = dynamic(
  () => import('./시군구_지도_컴포넌트').then((mod) => mod.시군구_지도_컴포넌트),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full min-h-[580px] bg-slate-100 rounded-2xl flex flex-col items-center justify-center border border-slate-200">
        <div className="w-8 h-8 border-4 border-sky-600 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-sm font-semibold text-slate-600">대한민국 GIS 행정구역 지도 로딩 중...</p>
      </div>
    ),
  }
);

export const 지도_래퍼: React.FC<지도_래퍼_속성> = (props) => {
  return <LeafletMap {...props} />;
};
