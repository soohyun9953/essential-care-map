'use client';

// 애플 지도(Apple Maps) 감성의 시·군·구 GIS 인터랙티브 Choropleth 지도 컴포넌트

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

const MapCenterController: React.FC<{ target_lat?: number; target_lng?: number }> = ({
  target_lat,
  target_lng,
}) => {
  const map = useMap();
  useEffect(() => {
    if (target_lat && target_lng) {
      map.flyTo([target_lat, target_lng], 10, { duration: 1.0 });
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
      return item.응급취약지역_여부 ? '#ff3b30' : '#34c759';
    } else if (view_mode === '분만모자') {
      return item.분만취약지역_여부 ? '#ff6934' : '#34c759';
    } else if (view_mode === '소아중증') {
      return item.소아취약지역_여부 ? '#ff9500' : '#34c759';
    }
    return '#34c759';
  };

  const selected_location = selected_region
    ? get_region_location(selected_region.시군구명, selected_region.시도명)
    : null;

  return (
    <div className="relative w-full h-full min-h-[580px] bg-[#eef0f3] rounded-3xl overflow-hidden border border-black/[0.05] shadow-apple-card flex flex-col">
      {/* 애플 스타일 플로팅 세그먼트 컨트롤러 (Segmented Control) */}
      <div className="absolute top-4 left-4 z-[400] bg-white/80 backdrop-blur-xl p-1 rounded-full shadow-apple-glass border border-black/[0.06] flex items-center space-x-1">
        {(['종합취약도', '응급의료', '분만모자', '소아중증'] as 지도_시각화_모드[]).map((mode) => (
          <button
            key={mode}
            onClick={() => on_change_view_mode(mode)}
            className={`px-3 py-1 text-xs font-semibold rounded-full transition-all duration-200 ${
              view_mode === mode
                ? 'bg-[#1d1d1f] text-white shadow-apple-sm'
                : 'text-[#86868b] hover:text-[#1d1d1f]'
            }`}
          >
            {mode}
          </button>
        ))}
      </div>

      {/* 우측 하단 미니멀 범례 (Apple Glass Badge) */}
      <div className="absolute bottom-4 right-4 z-[400] bg-white/85 backdrop-blur-xl p-3.5 rounded-2xl shadow-apple-glass border border-black/[0.06] text-xs">
        <p className="font-semibold text-[#1d1d1f] mb-2 text-[11px] tracking-tight">
          {view_mode === '종합취약도' ? '취약도 등급' : `${view_mode} 판정`}
        </p>
        {view_mode === '종합취약도' ? (
          <div className="space-y-1.5">
            {(['심각', '취약', '관찰', '정상'] as 취약도_등급[]).map((grade) => (
              <div key={grade} className="flex items-center space-x-2">
                <span
                  className="w-2.5 h-2.5 rounded-full shadow-sm"
                  style={{ backgroundColor: 취약도_등급_정보[grade].색상코드 }}
                />
                <span className="text-[#1d1d1f] text-[11px] font-medium">{취약도_등급_정보[grade].라벨}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ff3b30] shadow-sm" />
              <span className="text-[#1d1d1f] text-[11px] font-medium">취약지역 (기준 미달)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#34c759] shadow-sm" />
              <span className="text-[#1d1d1f] text-[11px] font-medium">적정지역 (기준 충족)</span>
            </div>
          </div>
        )}
      </div>

      {/* React-Leaflet 지도 컨테이너 */}
      <div className="flex-1 w-full h-full relative" id="gis-map-canvas-container">
        <MapContainer
          center={[36.0, 127.8]}
          zoom={7}
          scrollWheelZoom={true}
          className="w-full h-full"
        >
          {/* 밝고 정갈한 카토그래피 타일 */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />

          {selected_location && (
            <MapCenterController
              target_lat={selected_location.위도}
              target_lng={selected_location.경도}
            />
          )}

          {diagnosed_list.map((item) => {
            const loc = get_region_location(item.시군구명, item.시도명);
            const is_selected =
              selected_region?.시군구코드 === item.시군구코드 ||
              (selected_region?.시도명 === item.시도명 && selected_region?.시군구명 === item.시군구명);
            const color = get_fill_color_by_mode(item);

            if (!loc) return null;

            return (
              <React.Fragment key={`${item.시도코드}-${item.시군구코드}-${item.시군구명}`}>
                {loc.폴리곤_좌표 && loc.폴리곤_좌표.length > 0 && (
                  <Polygon
                    positions={loc.폴리곤_좌표}
                    pathOptions={{
                      color: is_selected ? '#0071e3' : '#ffffff',
                      weight: is_selected ? 3 : 1,
                      fillColor: color,
                      fillOpacity: is_selected ? 0.75 : 0.55,
                    }}
                    eventHandlers={{
                      click: () => on_select_region(item),
                    }}
                  >
                    <Tooltip direction="top" offset={[0, -10]} opacity={0.98} className="leaflet-tooltip-custom">
                      <div className="space-y-1">
                        <div className="font-bold text-[#1d1d1f] text-xs flex items-center justify-between gap-2 border-b border-black/[0.06] pb-1">
                          <span>{item.시도명} {item.시군구명}</span>
                          <span
                            className="px-1.5 py-0.2 rounded-full text-[10px] text-white font-semibold"
                            style={{ backgroundColor: 취약도_등급_정보[item.종합_취약도_등급].색상코드 }}
                          >
                            {item.종합_취약도_등급}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#86868b]">
                          인구: <strong className="text-[#1d1d1f]">{format_number_comma(item.인구수)}명</strong> | 취약분야: {item.취약분야_수}/3개
                        </div>
                        <div className="text-[10px] text-[#86868b]">
                          응급 RI: {item.관내_응급_의료이용률}% • 분만 미도달: {item.분만_60분_미도달_인구비율}%
                        </div>
                      </div>
                    </Tooltip>
                  </Polygon>
                )}

                <CircleMarker
                  center={[loc.위도, loc.경도]}
                  radius={is_selected ? 8 : 5}
                  pathOptions={{
                    color: '#ffffff',
                    weight: 2,
                    fillColor: is_selected ? '#0071e3' : color,
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
