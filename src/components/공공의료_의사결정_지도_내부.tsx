'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { 공공의료기관_상세_프로필 } from '@/lib/의료서비스_검색_엔진';

interface 공공의료_의사결정_지도_내부_속성 {
  hospitals: 공공의료기관_상세_프로필[];
  active_hospital: 공공의료기관_상세_프로필 | null;
  on_select_marker?: (hospital: 공공의료기관_상세_프로필) => void;
  on_select_hospital?: (hospital: 공공의료기관_상세_프로필) => void;
}

const MapCameraController: React.FC<{ target_lat?: number; target_lng?: number; zoom?: number }> = ({
  target_lat,
  target_lng,
  zoom = 12,
}) => {
  const map = useMap();
  useEffect(() => {
    if (target_lat && target_lng) {
      map.flyTo([target_lat, target_lng], zoom, { duration: 1.0 });
    }
  }, [target_lat, target_lng, zoom, map]);
  return null;
};

export const 공공의료_의사결정_지도_내부: React.FC<공공의료_의사결정_지도_내부_속성> = ({
  hospitals,
  active_hospital,
  on_select_marker,
  on_select_hospital,
}) => {
  const handle_select = on_select_hospital || on_select_marker || (() => {});
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
                      병상 <strong>{h.의료자원.병상.총병상}</strong>석 (가용 {h.의료자원.병상.가용병상}석)
                    </div>
                    <div className="text-[10px] text-emerald-600 font-semibold">
                      응급실: {h.의료자원.응급실.가용병상}석 가용 ({h.의료자원.응급실.상태})
                    </div>
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
