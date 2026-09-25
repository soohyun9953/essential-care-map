'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { 공공의료기관_상세_프로필 } from '@/lib/의료서비스_검색_엔진';

// 공공병원 외 보조 지점 (예: 심평원 분만가능 민간 의료기관). 병상 등 상세 정보 없이 위치와 기본 정보만 표시
export interface 보조_지도_지점 {
  id: string;
  기관명: string;
  종별: string;
  위도: number;
  경도: number;
  좌표_정밀도: '주소' | '시군구';
  설명: string;
}

interface 공공의료_의사결정_지도_내부_속성 {
  hospitals: 공공의료기관_상세_프로필[];
  active_hospital: 공공의료기관_상세_프로필 | null;
  on_select_marker?: (hospital: 공공의료기관_상세_프로필) => void;
  on_select_hospital?: (hospital: 공공의료기관_상세_프로필) => void;
  extra_points?: 보조_지도_지점[];
  active_extra_id?: string | null;
  on_select_extra?: (point: 보조_지도_지점) => void;
}

const MapCameraController: React.FC<{ target_lat?: number; target_lng?: number; zoom?: number }> = ({
  target_lat,
  target_lng,
  zoom = 12,
}) => {
  const map = useMap();
  useEffect(() => {
    if (!Number.isFinite(target_lat) || !Number.isFinite(target_lng)) return;
    // 지도 영역 크기가 0(숨김·레이아웃 전)일 때 flyTo 애니메이션은 NaN 좌표 오류로 앱 전체를 중단시키므로
    // 크기가 있을 때만 애니메이션하고, 그 외에는 위치만 이동
    try {
      const size = map.getSize();
      if (size.x > 0 && size.y > 0) {
        map.flyTo([target_lat as number, target_lng as number], zoom, { duration: 1.0 });
      } else {
        map.setView([target_lat as number, target_lng as number], zoom, { animate: false });
      }
    } catch (err) {
      console.warn('지도 이동 실패:', err);
    }
  }, [target_lat, target_lng, zoom, map]);
  return null;
};

export const 공공의료_의사결정_지도_내부: React.FC<공공의료_의사결정_지도_내부_속성> = ({
  hospitals,
  active_hospital,
  on_select_marker,
  on_select_hospital,
  extra_points = [],
  active_extra_id = null,
  on_select_extra,
}) => {
  const handle_select = on_select_hospital || on_select_marker || (() => {});
  const active_extra = extra_points.find((p) => p.id === active_extra_id) || null;
  const default_center: [number, number] = active_hospital
    ? [active_hospital.위도, active_hospital.경도]
    : [36.3, 127.8];

  return (
    <div className="w-full h-full relative" id="decision-map-canvas-container">
      <MapContainer
        center={default_center}
        zoom={active_hospital ? 11 : 7}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        {/* Esri World Light Gray Base 무료 타일 */}
        <TileLayer
          attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}"
        />

        {active_hospital && (
          <MapCameraController
            target_lat={active_hospital.위도}
            target_lng={active_hospital.경도}
            zoom={13}
          />
        )}
        {active_extra && (
          <MapCameraController target_lat={active_extra.위도} target_lng={active_extra.경도} zoom={13} />
        )}

        {/* 보조 지점 (민간 분만기관 등): 분홍색, 시군구 중심 근사 좌표는 점선 테두리 */}
        {extra_points.map((p) => {
          const is_active = p.id === active_extra_id;
          const 근사 = p.좌표_정밀도 === '시군구';
          return (
            <CircleMarker
              key={`extra-${p.id}`}
              center={[p.위도, p.경도]}
              radius={is_active ? 9 : 5}
              pathOptions={{
                color: is_active ? '#ff3b30' : '#ffffff',
                weight: 2,
                dashArray: 근사 ? '3 3' : undefined,
                fillColor: is_active ? '#ff3b30' : '#ec4899',
                fillOpacity: 근사 ? 0.55 : 0.9,
              }}
              eventHandlers={{ click: () => on_select_extra?.(p) }}
            >
              <Tooltip direction="top" offset={[0, -8]} opacity={0.98}>
                <div className="p-1 space-y-0.5 text-left">
                  <strong className="text-xs text-slate-900">{p.기관명}</strong>
                  <div className="text-[11px] text-slate-600">{p.종별} · {p.설명}</div>
                  {근사 && <div className="text-[10px] text-amber-600">위치: 시군구 중심 근사 (정확한 위치 아님)</div>}
                </div>
              </Tooltip>
            </CircleMarker>
          );
        })}

        {/* 214개 공공의료기관 마커 렌더링 */}
        {hospitals.map((h) => {
          const is_active = active_hospital?.id === h.id;
          const is_regional = h.기관유형.includes('권역');
          const is_local = h.기관유형.includes('지역');

          const base_color = is_regional ? '#0071e3' : is_local ? '#10b981' : '#8b5cf6';
          const fill_color = is_active ? '#ff3b30' : base_color;
          const radius = is_active ? 10 : is_regional ? 8 : 6;

          return (
            <React.Fragment key={`marker-${h.id}`}>
              {/* 활성 선택 시 하이라이트 펄스 링 */}
              {is_active && (
                <CircleMarker
                  center={[h.위도, h.경도]}
                  radius={18}
                  pathOptions={{
                    color: '#ff3b30',
                    weight: 2,
                    fillColor: '#ff3b30',
                    fillOpacity: 0.25,
                  }}
                />
              )}

              <CircleMarker
                center={[h.위도, h.경도]}
                radius={radius}
                pathOptions={{
                  color: '#ffffff',
                  weight: 2,
                  fillColor: fill_color,
                  fillOpacity: 0.95,
                }}
                eventHandlers={{
                  click: () => handle_select(h),
                }}
              >
                <Tooltip direction="top" offset={[0, -10]} opacity={0.98}>
                  <div className="p-1 space-y-1 text-left">
                    <div className="flex items-center gap-1.5 border-b border-slate-100 pb-0.5">
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-100 text-blue-800">
                        {h.기관유형}
                      </span>
                      <strong className="text-xs text-slate-900">{h.기관명}</strong>
                    </div>
                    <div className="text-[11px] text-slate-600">
                      총 병상 <strong>{h.의료자원.병상.총병상}</strong>석 · {h.의료자원.응급실.구분}
                    </div>
                    <div className="text-[10px] text-slate-400">기준 데이터 (실시간 병상 현황 아님)</div>
                  </div>
                </Tooltip>
              </CircleMarker>
            </React.Fragment>
          );
        })}
      </MapContainer>
    </div>
  );
};
