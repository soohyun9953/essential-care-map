'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  Polyline,
  CircleMarker,
  Tooltip,
  useMap,
} from 'react-leaflet';
import { 시군구_환자_유출입_데이터 } from '@/lib/환자_유출입_데이터셋';
import {
  build_patient_flow_arcs,
  get_sgg_coordinates,
  환자_이동_아크,
} from '@/lib/환자_이동_경로_도우미';

interface 플로우맵_내부_속성 {
  flow_data: 시군구_환자_유출입_데이터;
  flow_mode: 'all' | 'outflow' | 'inflow';
  highlighted_arc_id: string | null;
  on_hover_arc: (arc_id: string | null) => void;
}

// 맵 중심 자동 이동 컨트롤러
function MapCenterController({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.flyTo(center, 9, { duration: 1.2 });
    }
  }, [center, map]);
  return null;
}

export default function 환자_이동_네트워크_플로우맵_내부({
  flow_data,
  flow_mode,
  highlighted_arc_id,
  on_hover_arc,
}: 플로우맵_내부_속성) {
  const origin_coords = useMemo(
    () => get_sgg_coordinates(flow_data.sgg, flow_data.sido),
    [flow_data.sgg, flow_data.sido]
  );

  // 아크 데이터 빌드
  const arcs = useMemo(() => {
    return build_patient_flow_arcs(flow_data, flow_mode);
  }, [flow_data, flow_mode]);

  // 대상지 고유 노드 추출 (중복 제거)
  const target_nodes = useMemo(() => {
    const map = new Map<
      string,
      {
        name: string;
        sido: string;
        coords: [number, number];
        type: 'dest' | 'orig';
        days: number;
        pct: number;
        color: string;
      }
    >();

    arcs.forEach((arc) => {
      const is_out = arc.type === 'outflow';
      const key = is_out ? arc.dest_name : arc.origin_name;
      const coords = is_out ? arc.end_coords : arc.start_coords;
      const sido = is_out ? arc.dest_sido : arc.origin_sido;

      if (!map.has(key)) {
        map.set(key, {
          name: key,
          sido: sido,
          coords: coords,
          type: is_out ? 'dest' : 'orig',
          days: arc.days,
          pct: arc.pct,
          color: arc.color,
        });
      }
    });

    return Array.from(map.values());
  }, [arcs]);

  return (
    <div className="relative w-full h-[540px] rounded-2xl overflow-hidden shadow-inner border border-slate-200 dark:border-slate-800">
      <MapContainer
        center={origin_coords}
        zoom={9}
        scrollWheelZoom={true}
        className="w-full h-full z-0 bg-[#f8fafc]"
        style={{ minHeight: '100%', minWidth: '100%' }}
      >
        {/* 고대비 미니멀 타일 레이어 */}
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          maxZoom={18}
        />

        {/* 맵 중심 자동 이동 */}
        <MapCenterController center={origin_coords} />

        {/* 1. 환자 이동 베지에 아크(Arc Polyline) 렌더링 */}
        {arcs.map((arc) => {
          const is_highlighted = highlighted_arc_id === arc.id;
          const is_active_or_none =
            !highlighted_arc_id || highlighted_arc_id === arc.id;

          const opacity = is_highlighted ? 1.0 : is_active_or_none ? 0.82 : 0.25;
          const stroke_weight = is_highlighted
            ? arc.weight + 2.5
            : arc.weight;

          return (
            <React.Fragment key={arc.id}>
              {/* 외곽 발광/글로우 라인 */}
              {is_highlighted && (
                <Polyline
                  positions={arc.arc_path}
                  pathOptions={{
                    color: arc.color,
                    weight: stroke_weight + 5,
                    opacity: 0.35,
                    lineCap: 'round',
                  }}
                />
              )}

              {/* 메인 베지에 곡선 */}
              <Polyline
                positions={arc.arc_path}
                pathOptions={{
                  color: arc.color,
                  weight: stroke_weight,
                  opacity: opacity,
                  dashArray: arc.is_primary ? undefined : '5, 6',
                  lineCap: 'round',
                  lineJoin: 'round',
                }}
                eventHandlers={{
                  mouseover: () => on_hover_arc(arc.id),
                  mouseout: () => on_hover_arc(null),
                }}
              >
                <Tooltip sticky direction="top" opacity={0.96}>
                  <div className="p-2 text-xs space-y-1 bg-white dark:bg-slate-900 rounded-lg shadow-md border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-1.5 font-bold">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: arc.color }}
                      />
                      <span className="text-slate-900 dark:text-white">
                        {arc.type === 'outflow' ? '관외 유출 경로' : '타지역 유입 경로'}
                      </span>
                    </div>
                    <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                      {arc.origin_name} ➔ {arc.dest_name}
                    </div>
                    <div className="text-slate-600 dark:text-slate-300">
                      재원일수: <strong>{arc.days.toLocaleString()}일</strong> ({arc.pct}%)
                    </div>
                    {arc.type === 'outflow' && arc.detail_info.tertiary_days !== undefined && (
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-1 mt-1 space-y-0.5">
                        <div>상급종합: {(arc.detail_info.tertiary_days || 0).toLocaleString()}일</div>
                        <div>종합병원: {(arc.detail_info.general_days || 0).toLocaleString()}일</div>
                        {(arc.detail_info.dialysis_days || 0) > 0 && (
                          <div className="text-amber-600 font-medium">
                            투석 유출: {arc.detail_info.dialysis_days?.toLocaleString()}일
                          </div>
                        )}
                        {(arc.detail_info.er_days || 0) > 0 && (
                          <div className="text-rose-600 font-medium">
                            응급 유출: {arc.detail_info.er_days?.toLocaleString()}일
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </Tooltip>
              </Polyline>
            </React.Fragment>
          );
        })}

        {/* 2. 대상지(유출 목적지 / 유입 출처지) 원형 마커 */}
        {target_nodes.map((node) => {
          const is_out = node.type === 'dest';
          return (
            <CircleMarker
              key={`${node.type}-${node.name}`}
              center={node.coords}
              radius={Math.min(Math.max(node.pct / 2, 7), 16)}
              pathOptions={{
                color: node.color,
                weight: 2,
                fillColor: node.color,
                fillOpacity: 0.65,
              }}
            >
              <Tooltip direction="bottom" offset={[0, 8]} opacity={0.96}>
                <div className="p-1.5 text-xs">
                  <div className="font-bold text-slate-800">
                    {node.sido} {node.name}
                  </div>
                  <div className="text-slate-600">
                    {is_out ? '유출 재원일수' : '유입 재원일수'}: {node.days.toLocaleString()}일 ({node.pct}%)
                  </div>
                </div>
              </Tooltip>
            </CircleMarker>
          );
        })}

        {/* 3. 분석 중심 지자체(출발지) 대표 펄스 마커 */}
        {/* 외곽 펄스 링 */}
        <CircleMarker
          center={origin_coords}
          radius={24}
          pathOptions={{
            color: '#3b82f6',
            weight: 2,
            fillColor: '#60a5fa',
            fillOpacity: 0.22,
          }}
        />
        {/* 중심 코어 마커 */}
        <CircleMarker
          center={origin_coords}
          radius={12}
          pathOptions={{
            color: '#ffffff',
            weight: 3,
            fillColor: '#2563eb',
            fillOpacity: 1.0,
          }}
        >
          <Tooltip permanent direction="top" offset={[0, -14]} opacity={0.98}>
            <div className="px-2 py-1 bg-blue-600 text-white font-bold text-xs rounded-lg shadow-lg flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{flow_data.sgg}</span>
              <span className="text-[10px] font-normal opacity-90">
                (자체 {flow_data.ri}%)
              </span>
            </div>
          </Tooltip>
        </CircleMarker>
      </MapContainer>

      {/* 우측 하단 애플 스타일 플로팅 범례 (Legend) */}
      <div className="absolute bottom-4 right-4 z-[400] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-3.5 rounded-2xl shadow-apple-card border border-black/[0.06] dark:border-white/10 text-xs space-y-2">
        <div className="font-bold text-slate-800 dark:text-white flex items-center gap-1.5 pb-1.5 border-b border-slate-100 dark:border-slate-800">
          <span>네트워크 범례</span>
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-600 border-2 border-white shadow-sm" />
            <span className="text-slate-700 dark:text-slate-300 font-medium">
              기준 지자체 ({flow_data.sgg})
            </span>
          </div>
          {(flow_mode === 'all' || flow_mode === 'outflow') && (
            <div className="flex items-center gap-2">
              <span className="w-4 h-1.5 rounded-full bg-rose-500" />
              <span className="text-slate-700 dark:text-slate-300">
                관외 유출 경로 (상위 6개지)
              </span>
            </div>
          )}
          {(flow_mode === 'all' || flow_mode === 'inflow') && (
            <div className="flex items-center gap-2">
              <span className="w-4 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-slate-700 dark:text-slate-300">
                타지역 유입 경로 (상위 5개지)
              </span>
            </div>
          )}
          <div className="text-[10px] text-slate-400 dark:text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800">
            * 선 굵기는 환자 이동 재원일수(이용량)에 비례
          </div>
        </div>
      </div>
    </div>
  );
}
