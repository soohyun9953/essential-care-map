'use client';

// Next.js dynamic import (ssr: false) 구조를 적용한 하이브리드 지도 래퍼 컴포넌트
// - 카카오 지도 Web API (kakao.maps) 및 기본 지도(Leaflet OpenStreetMap) 듀얼 엔진 지원
// - 원클릭 엔진 스위칭 및 카카오 JavaScript API 키 설정 모달 통합

import dynamic from 'next/dynamic';
import React, { useState, useEffect } from 'react';
import { 필수의료_진단_결과, 지도_시각화_모드, 지역_구분_단위 } from '@/lib/필수의료_타입';
import { 카카오_지도_API키_불러오기 } from '@/lib/API키_저장소';
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

// 2. Leaflet 기본 지도 컴포넌트 클라이언트 전용 로딩
const LeafletMap = dynamic(
  () => import('./시군구_지도_컴포넌트').then((mod) => mod.시군구_지도_컴포넌트),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full min-h-[580px] bg-slate-100 dark:bg-slate-900 rounded-3xl flex flex-col items-center justify-center border border-slate-200 dark:border-slate-800">
        <div className="w-8 h-8 border-4 border-sky-600 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">기본 GIS 행정구역 지도 로딩 중...</p>
      </div>
    ),
  }
);

export const 지도_래퍼: React.FC<지도_래퍼_속성> = (props) => {
  // 선호 지도 엔진 ('kakao' | 'leaflet')
  const [map_engine, set_map_engine] = useState<'kakao' | 'leaflet'>('kakao');
  const [is_key_modal_open, set_is_key_modal_open] = useState<boolean>(false);
  const [engine_initialized, set_engine_initialized] = useState<boolean>(false);

  useEffect(() => {
    // 1) 사용자가 이전에 명시적으로 선택한 엔진이 있는지 확인
    const savedEngine = localStorage.getItem('preferred_map_engine') as 'kakao' | 'leaflet' | null;
    const kakaoKey = 카카오_지도_API키_불러오기();

    if (savedEngine === 'leaflet') {
      set_map_engine('leaflet');
    } else {
      // 카카오맵을 기본 지도(Default)로 항시 지정
      set_map_engine('kakao');
    }
    set_engine_initialized(true);
  }, []);

  const switch_to_kakao = () => {
    set_map_engine('kakao');
    try {
      localStorage.setItem('preferred_map_engine', 'kakao');
    } catch {}
  };

  const switch_to_leaflet = () => {
    set_map_engine('leaflet');
    try {
      localStorage.setItem('preferred_map_engine', 'leaflet');
    } catch {}
  };

  const handle_key_saved = (_newKey: string) => {
    // 키 저장 완료 시 카카오 지도로 전환
    switch_to_kakao();
  };

  if (!engine_initialized) {
    return (
      <div className="w-full h-full min-h-[580px] bg-slate-100 dark:bg-slate-900 rounded-3xl flex flex-col items-center justify-center border border-slate-200 dark:border-slate-800">
        <div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">GIS 지도 엔진 초기화 중...</p>
      </div>
    );
  }

  return (
    <>
      {map_engine === 'kakao' ? (
        <KakaoMap
          {...props}
          on_switch_to_leaflet={switch_to_leaflet}
          on_open_key_modal={() => set_is_key_modal_open(true)}
        />
      ) : (
        <LeafletMap
          {...props}
          on_switch_to_kakao={switch_to_kakao}
          on_open_key_modal={() => set_is_key_modal_open(true)}
        />
      )}

      {/* 카카오 API 키 설정 모달 */}
      <카카오_api키_설정_모달
        is_open={is_key_modal_open}
        on_close={() => set_is_key_modal_open(false)}
        on_key_saved={handle_key_saved}
      />
    </>
  );
};
