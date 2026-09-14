'use client';

// 애플 지도(Apple Maps) 감성의 시·군·구 및 중진료권 GIS 인터랙티브 Choropleth 지도 컴포넌트

import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Polygon, CircleMarker, Tooltip, useMap } from 'react-leaflet';
import {
  필수의료_진단_결과,
  지도_시각화_모드,
  취약도_등급,
  지역_구분_단위,
} from '@/lib/필수의료_타입';
import { 취약도_등급_정보 } from '@/lib/필수의료_엔진';
import { get_region_location } from '@/lib/시군구_경계_데이터';
import { 중진료권_매퍼 } from '@/lib/중진료권_데이터셋';
import { format_number_comma } from '@/lib/유틸리티';

interface 시군구_지도_컴포넌트_속성 {
  diagnosed_list: 필수의료_진단_결과[];
  selected_region: 필수의료_진단_결과 | null;
  on_select_region: (region: 필수의료_진단_결과) => void;
  view_mode: 지도_시각화_모드;
  on_change_view_mode: (mode: 지도_시각화_모드) => void;
  region_unit: 지역_구분_단위;
  on_change_region_unit: (unit: 지역_구분_단위) => void;
}

const MapCenterController: React.FC<{ target_lat?: number; target_lng?: number; zoom?: number }> = ({
  target_lat,
  target_lng,
  zoom = 10,
}) => {
  const map = useMap();
  useEffect(() => {
    if (target_lat && target_lng) {
      map.flyTo([target_lat, target_lng], zoom, { duration: 1.0 });
    }
  }, [target_lat, target_lng, zoom, map]);
  return null;
};

export const 시군구_지도_컴포넌트: React.FC<시군구_지도_컴포넌트_속성> = ({
  diagnosed_list,
  selected_region,
  on_select_region,
  view_mode,
  on_change_view_mode,
  region_unit,
  on_change_region_unit,
}) => {
  // 70개 중진료권별 진단 데이터 집계
  const aggregated_zones = useMemo(() => {
    return 중진료권_매퍼.aggregate_zone_diagnostics(diagnosed_list);
  }, [diagnosed_list]);

  // 시군구 모드별 색상 추출 함수
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

  // 중진료권 모드별 색상 추출 함수
  const get_zone_fill_color = (zone: (typeof aggregated_zones)[0]): string => {
    if (view_mode === '종합취약도') {
      return 취약도_등급_정보[zone.종합_취약도_등급].색상코드;
    } else if (view_mode === '응급의료') {
      return zone.응급취약_여부 ? '#ff3b30' : '#34c759';
    } else if (view_mode === '분만모자') {
      return zone.분만취약_여부 ? '#ff6934' : '#34c759';
    } else if (view_mode === '소아중증') {
      return zone.소아취약_여부 ? '#ff9500' : '#34c759';
    }
    return '#34c759';
  };

  const selected_location = selected_region
    ? get_region_location(selected_region.시군구명, selected_region.시도명)
    : null;

  return (
    <div className="relative w-full h-full min-h-[580px] bg-[#eef0f3] rounded-3xl overflow-hidden border border-black/[0.05] shadow-apple-card flex flex-col">
      {/* 애플 스타일 플로팅 컨트롤러 (지역 단위 및 시각화 모드) */}
      <div className="absolute top-4 left-4 z-[400] flex flex-wrap items-center gap-2">
        {/* 단위 스위처: 시군구 vs 중진료권 */}
        <div className="bg-white/90 backdrop-blur-xl p-1 rounded-full shadow-apple-glass border border-black/[0.06] flex items-center space-x-1">
          <button
            onClick={() => on_change_region_unit('시군구')}
            className={`px-3 py-1 text-xs font-semibold rounded-full transition-all duration-200 ${
              region_unit === '시군구'
                ? 'bg-[#0071e3] text-white shadow-apple-sm'
                : 'text-[#86868b] hover:text-[#1d1d1f]'
            }`}
          >
            시·군·구 (250)
          </button>
          <button
            onClick={() => on_change_region_unit('중진료권')}
            className={`px-3 py-1 text-xs font-semibold rounded-full transition-all duration-200 ${
              region_unit === '중진료권'
                ? 'bg-[#0071e3] text-white shadow-apple-sm'
                : 'text-[#86868b] hover:text-[#1d1d1f]'
            }`}
          >
            중진료권 (70)
          </button>
        </div>

        {/* 지표 레이어 스위처 */}
        <div className="bg-white/90 backdrop-blur-xl p-1 rounded-full shadow-apple-glass border border-black/[0.06] flex items-center space-x-1">
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
      </div>

      {/* 우측 하단 미니멀 범례 (Apple Glass Badge) */}
      <div className="absolute bottom-4 right-4 z-[400] bg-white/90 backdrop-blur-xl p-3.5 rounded-2xl shadow-apple-glass border border-black/[0.06] text-xs">
        <div className="flex items-center justify-between gap-2 mb-2">
          <p className="font-semibold text-[#1d1d1f] text-[11px] tracking-tight">
            {view_mode === '종합취약도' ? '취약도 등급' : `${view_mode} 판정`}
          </p>
          <span className="text-[10px] font-medium text-[#0071e3] bg-[#0071e3]/10 px-1.5 py-0.2 rounded-full">
            {region_unit === '중진료권' ? '70개 권역 기준' : '250개 시군구 기준'}
          </span>
        </div>
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
              <span className="text-[#1d1d1f] text-[11px] font-medium">취약 권역/지역 (기준 미달)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#34c759] shadow-sm" />
              <span className="text-[#1d1d1f] text-[11px] font-medium">적정 권역/지역 (기준 충족)</span>
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
          {/* Esri World Light Gray Base 무료 타일 (API 키 불필요, 데이터 시각화에 최적화) */}
          <TileLayer
            attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}"
          />

          {selected_location && (
            <MapCenterController
              target_lat={selected_location.위도}
              target_lng={selected_location.경도}
            />
          )}

          {/* ======================= 1. 시·군·구 단위 모드 ======================= */}
          {region_unit === '시군구' &&
            diagnosed_list.map((item) => {
              const loc = get_region_location(item.시군구명, item.시도명);
              const is_selected =
                selected_region?.시군구코드 === item.시군구코드 ||
                (selected_region?.시도명 === item.시도명 && selected_region?.시군구명 === item.시군구명);
              const color = get_fill_color_by_mode(item);

              if (!loc) return null;

              return (
                <React.Fragment key={`sgg-${item.시도코드}-${item.시군구코드}-${item.시군구명}`}>
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
                            <div className="flex items-center gap-1.5">
                              <span>{item.시도명} {item.시군구명}</span>
                              <span className="text-[10px] text-[#0071e3] bg-[#0071e3]/10 px-1.5 py-0.2 rounded-full font-medium">
                                {중진료권_매퍼.find_zone_by_sgg(item.시군구명)}
                              </span>
                            </div>
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

          {/* ======================= 2. 중진료권 단위 모드 (70개 진료권) ======================= */}
          {region_unit === '중진료권' &&
            aggregated_zones.map((zone) => {
              const color = get_zone_fill_color(zone);
              const is_zone_selected =
                selected_region && zone.포함_시군구.includes(selected_region.시군구명);

              return (
                <React.Fragment key={`zone-${zone.시도명}-${zone.중진료권명}`}>
                  {/* 소속 시군구 폴리곤을 중진료권 테마 색상으로 통합 음영 처리 */}
                  {zone.소속_지역목록.map((r) => {
                    const r_loc = get_region_location(r.시군구명, r.시도명);
                    if (!r_loc || !r_loc.폴리곤_좌표 || r_loc.폴리곤_좌표.length === 0) return null;

                    return (
                      <Polygon
                        key={`zone-poly-${zone.중진료권명}-${r.시군구명}`}
                        positions={r_loc.폴리곤_좌표}
                        pathOptions={{
                          color: is_zone_selected ? '#0071e3' : '#cbd5e1',
                          weight: is_zone_selected ? 2 : 0.8,
                          fillColor: color,
                          fillOpacity: is_zone_selected ? 0.65 : 0.4,
                        }}
                        eventHandlers={{
                          click: () => {
                            if (zone.소속_지역목록.length > 0) {
                              on_select_region(zone.소속_지역목록[0]);
                            }
                          },
                        }}
                      />
                    );
                  })}

                  {/* 중진료권 대표 중심점 외곽 펄스 링 */}
                  <CircleMarker
                    center={[zone.위도, zone.경도]}
                    radius={is_zone_selected ? 19 : 14}
                    pathOptions={{
                      color: color,
                      weight: is_zone_selected ? 3 : 1.5,
                      fillColor: color,
                      fillOpacity: is_zone_selected ? 0.35 : 0.2,
                    }}
                  />

                  {/* 중진료권 중심 코어 마커 */}
                  <CircleMarker
                    center={[zone.위도, zone.경도]}
                    radius={is_zone_selected ? 11 : 8}
                    pathOptions={{
                      color: '#ffffff',
                      weight: 2,
                      fillColor: is_zone_selected ? '#0071e3' : color,
                      fillOpacity: 1,
                    }}
                    eventHandlers={{
                      click: () => {
                        if (zone.소속_지역목록.length > 0) {
                          on_select_region(zone.소속_지역목록[0]);
                        }
                      },
                    }}
                  >
                    <Tooltip direction="top" offset={[0, -12]} opacity={0.98} className="leaflet-tooltip-custom">
                      <div className="space-y-1.5 min-w-[210px]">
                        {/* 헤더 */}
                        <div className="font-bold text-[#1d1d1f] text-xs flex items-center justify-between gap-2 border-b border-black/[0.06] pb-1.5">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-white bg-[#0071e3] px-1.5 py-0.2 rounded-md font-semibold">
                              중진료권
                            </span>
                            <span className="text-sm font-bold text-[#1d1d1f]">{zone.중진료권명}</span>
                            <span className="text-[10px] text-[#86868b]">({zone.시도명})</span>
                          </div>
                          <span
                            className="px-1.5 py-0.2 rounded-full text-[10px] text-white font-semibold"
                            style={{ backgroundColor: 취약도_등급_정보[zone.종합_취약도_등급].색상코드 }}
                          >
                            {zone.종합_취약도_등급}
                          </span>
                        </div>

                        {/* 포함 시군구 태그 */}
                        <div className="text-[11px] text-[#1d1d1f] flex flex-wrap items-center gap-1">
                          <span className="text-[#86868b] font-medium">포함 지자체 ({zone.포함_시군구.length}개):</span>
                          <span className="font-medium text-[#0071e3]">
                            {zone.포함_시군구.join(', ')}
                          </span>
                        </div>

                        {/* 통계 요약 */}
                        <div className="text-[11px] text-[#86868b] bg-slate-50 p-1.5 rounded-lg space-y-0.5">
                          <div>권역 총 인구: <strong className="text-[#1d1d1f]">{format_number_comma(zone.총인구수)}명</strong></div>
                          <div>취약도 종합점수: <strong className="text-[#1d1d1f]">{zone.종합_취약도_점수}점</strong></div>
                          <div className="text-[10px] text-slate-500 pt-0.5 border-t border-slate-200/60 mt-1">
                            응급 미도달 {zone.평균_응급_60분_미도달.toFixed(1)}% | RI {zone.평균_응급_RI.toFixed(1)}% | 분만율 {zone.평균_분만율.toFixed(1)}%
                          </div>
                        </div>

                        <p className="text-[9px] text-[#86868b] text-center italic">
                          클릭 시 권역 상세 데이터로 대시보드 전환
                        </p>
                      </div>
                    </Tooltip>
                  </CircleMarker>
                </React.Fragment>
              );
            })}
        </MapContainer>
      </div>
    </div>
  );
};

