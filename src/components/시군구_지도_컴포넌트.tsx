'use client';

// Leaflet 기반 대한민국 시·군·구 GIS 인터랙티브 Choropleth 지도 컴포넌트

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Polygon, CircleMarker, Tooltip, useMap } from 'react-leaflet';
import {
  필수의료_진단_결과,
  지도_시각화_모드,
  취약도_등급,
} from '@/lib/필수의료_타입';
import { 취약도_등급_정보 } from '@/lib/필수의료_엔진';
import { 전국_시군구_위치_데이터, get_region_location } from '@/lib/시군구_경계_데이터';
import { format_number_comma } from '@/lib/유틸리티';

interface 시군구_지도_컴포넌트_속성 {
  diagnosed_list: 필수의료_진단_결과[];
  selected_region: 필수의료_진단_결과 | null;
  on_select_region: (region: 필수의료_진단_결과) => void;
  view_mode: 지도_시각화_모드;
  on_change_view_mode: (mode: 지도_시각화_모드) => void;
}

/**
 * 선택된 지역으로 지도의 중심과 줌을 부드럽게 이동시키는 보조 컴포넌트
 */
const MapCenterController: React.FC<{ target_lat?: number; target_lng?: number }> = ({
  target_lat,
  target_lng,
}) => {
  const map = useMap();
  useEffect(() => {
    if (target_lat && target_lng) {
      map.flyTo([target_lat, target_lng], 10, { duration: 1.2 });
    }
  }, [target_lat, target_lng, map]);
  return null;
};

export const 시군구_지도_컴포넌트: React.FC<시군구_지도_컴포넌트_속성> = ({
  diagnosed_list,
  selected_region,
  on_select_region,
  view_mode,
  on_change_view_mode,
}) => {
  // 모드별 색상 추출 함수
  const get_fill_color_by_mode = (item: 필수의료_진단_결과): string => {
    if (view_mode === '종합취약도') {
      return 취약도_등급_정보[item.종합_취약도_등급].색상코드;
    } else if (view_mode === '응급의료') {
      return item.응급취약지역_여부 ? '#ef4444' : '#22c55e';
    } else if (view_mode === '분만모자') {
      return item.분만취약지역_여부 ? '#f97316' : '#22c55e';
    } else if (view_mode === '소아중증') {
      return item.소아취약지역_여부 ? '#eab308' : '#22c55e';
    }
    return '#22c55e';
  };

  const selected_location = selected_region
    ? get_region_location(selected_region.시군구명, selected_region.시도명)
    : null;

  return (
    <div className="relative w-full h-full min-h-[580px] bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 shadow-sm flex flex-col">
      {/* 지도 상단 모드 선택 툴바 */}
      <div className="absolute top-4 left-4 z-[400] bg-white/90 backdrop-blur-md px-3 py-2 rounded-xl shadow-lg border border-slate-200 flex flex-wrap items-center gap-1.5">
        <span className="text-xs font-bold text-slate-700 mr-1.5">시각화 레이어:</span>
        {(['종합취약도', '응급의료', '분만모자', '소아중증'] as 지도_시각화_모드[]).map((mode) => (
          <button
            key={mode}
            onClick={() => on_change_view_mode(mode)}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition ${
              view_mode === mode
                ? 'bg-slate-900 text-white shadow'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {mode}
          </button>
        ))}
      </div>

      {/* 지도 우측 하단 범례 (Legend) */}
      <div className="absolute bottom-4 right-4 z-[400] bg-white/95 backdrop-blur-md p-3 rounded-xl shadow-lg border border-slate-200 text-xs">
        <p className="font-bold text-slate-800 mb-2">
          {view_mode === '종합취약도' ? '종합 취약도 등급' : `${view_mode} 취약 여부`}
        </p>
        {view_mode === '종합취약도' ? (
          <div className="space-y-1.5">
            {(['심각', '취약', '관찰', '정상'] as 취약도_등급[]).map((grade) => (
              <div key={grade} className="flex items-center space-x-2">
                <span
                  className="w-3.5 h-3.5 rounded-full shadow-sm"
                  style={{ backgroundColor: 취약도_등급_정보[grade].색상코드 }}
                />
                <span className="text-slate-700 font-medium">{취약도_등급_정보[grade].라벨}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <span className="w-3.5 h-3.5 rounded-full bg-rose-500 shadow-sm" />
              <span className="text-slate-700 font-medium">취약지역 (기준 미달)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 shadow-sm" />
              <span className="text-slate-700 font-medium">적정지역 (기준 충족)</span>
            </div>
          </div>
        )}
      </div>

      {/* React-Leaflet 맵 컨테이너 */}
      <div className="flex-1 w-full h-full relative" id="gis-map-canvas-container">
        <MapContainer
          center={[36.0, 127.8]}
          zoom={7}
          scrollWheelZoom={true}
          className="w-full h-full"
        >
          {/* 오픈스트리트맵 타일 레이어 */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* 중심 이동 컨트롤러 */}
          {selected_location && (
            <MapCenterController
              target_lat={selected_location.위도}
              target_lng={selected_location.경도}
            />
          )}

          {/* 시군구 단위 폴리곤 및 마커 렌더링 */}
          {diagnosed_list.map((item) => {
            const loc = get_region_location(item.시군구명, item.시도명);
            const is_selected =
              selected_region?.시군구코드 === item.시군구코드 ||
              (selected_region?.시도명 === item.시도명 && selected_region?.시군구명 === item.시군구명);
            const color = get_fill_color_by_mode(item);

            if (!loc) return null;

            return (
              <React.Fragment key={`${item.시도코드}-${item.시군구코드}-${item.시군구명}`}>
                {/* 시군구 다각형 폴리곤 (Choropleth Polygon) */}
                {loc.폴리곤_좌표 && loc.폴리곤_좌표.length > 0 && (
                  <Polygon
                    positions={loc.폴리곤_좌표}
                    pathOptions={{
                      color: is_selected ? '#1e293b' : color,
                      weight: is_selected ? 3.5 : 1.5,
                      fillColor: color,
                      fillOpacity: is_selected ? 0.85 : 0.65,
                    }}
                    eventHandlers={{
                      click: () => on_select_region(item),
                    }}
                  >
                    <Tooltip direction="top" offset={[0, -10]} opacity={0.95} className="leaflet-tooltip-custom">
                      <div className="text-xs space-y-1">
                        <div className="font-bold text-sky-300 text-sm border-b border-slate-600 pb-0.5">
                          {item.시도명} {item.시군구명}
                        </div>
                        <div className="text-slate-300">
                          인구수: <span className="text-white font-semibold">{format_number_comma(item.인구수)}명</span>
                        </div>
                        <div className="flex items-center gap-1.5 pt-0.5">
                          <span
                            className="px-1.5 py-0.5 rounded text-[10px] font-bold text-white"
                            style={{ backgroundColor: 취약도_등급_정보[item.종합_취약도_등급].색상코드 }}
                          >
                            종합: {item.종합_취약도_등급}
                          </span>
                          <span className="text-[11px] text-slate-300">
                            취약분야: {item.취약분야_수}/3
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-300">
                          응급 RI: {item.관내_응급_의료이용률}% | 분만 60분 미도달: {item.분만_60분_미도달_인구비율}%
                        </div>
                      </div>
                    </Tooltip>
                  </Polygon>
                )}

                {/* 중심점 서클 마커 */}
                <CircleMarker
                  center={[loc.위도, loc.경도]}
                  radius={is_selected ? 9 : 6}
                  pathOptions={{
                    color: '#ffffff',
                    weight: 2,
                    fillColor: color,
                    fillOpacity: 1,
                  }}
                  eventHandlers={{
                    click: () => on_select_region(item),
                  }}
                />
              </React.Fragment>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
};
