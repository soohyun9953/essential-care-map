'use client';

// 카카오맵 Web API 기반 시·군·구 및 중진료권 인터랙티브 GIS 지도 컴포넌트
// - 카카오 공식 지도 Web SDK (dapi.kakao.com) 기반
// - 전국 250개 시군구 및 70개 중진료권 Choropleth 폴리곤 렌더링
// - 스카이뷰(위성)/일반지도 전환, 7대 필수의료 지표 레이어, 환자 유출입 이동선, 커스텀 인포 툴팁 완벽 지원

import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import {
  필수의료_진단_결과,
  지도_시각화_모드,
  지역_구분_단위,
} from '@/lib/필수의료_타입';
import { 취약도_등급_정보 } from '@/lib/필수의료_엔진';
import { get_region_location } from '@/lib/시군구_경계_데이터';
import { 중진료권_매퍼 } from '@/lib/중진료권_데이터셋';
import { format_number_comma } from '@/lib/유틸리티';
import { get_patient_flow_data } from '@/lib/환자_유출입_데이터셋';
import { build_patient_flow_arcs } from '@/lib/환자_이동_경로_도우미';
import { loadKakaoMap, KakaoMapLoadError } from '@/lib/카카오_지도_로더';
import { Layers, Key, Map as MapIcon, Satellite, ExternalLink, RefreshCw, AlertCircle } from 'lucide-react';

export interface 카카오_시군구_지도_컴포넌트_속성 {
  diagnosed_list: 필수의료_진단_결과[];
  selected_region: 필수의료_진단_결과 | null;
  on_select_region: (region: 필수의료_진단_결과) => void;
  view_mode: 지도_시각화_모드;
  on_change_view_mode: (mode: 지도_시각화_모드) => void;
  region_unit: 지역_구분_단위;
  on_change_region_unit: (unit: 지역_구분_단위) => void;
  on_switch_to_leaflet?: () => void;
  on_open_key_modal?: () => void;
}

export const 카카오_시군구_지도_컴포넌트: React.FC<카카오_시군구_지도_컴포넌트_속성> = ({
  diagnosed_list,
  selected_region,
  on_select_region,
  view_mode,
  on_change_view_mode,
  region_unit,
  on_change_region_unit,
  on_switch_to_leaflet,
  on_open_key_modal,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<kakao.maps.Map | null>(null);

  // 지도 로딩 상태
  const [is_loading, set_is_loading] = useState<boolean>(true);
  const [load_error, set_load_error] = useState<string | null>(null);

  // 지도 타입 상태 (일반지도 vs 스카이뷰)
  const [map_type, set_map_type] = useState<'roadmap' | 'skyview'>('roadmap');

  // 환자 이동선 표시 여부
  const [show_flow_arcs, set_show_flow_arcs] = useState<boolean>(true);

  // GIS Layer 필터 On/Off 상태
  const [active_gis_layers, set_active_gis_layers] = useState<{
    hospitals: boolean;
    emergency: boolean;
    delivery: boolean;
    pediatric: boolean;
    vulnerable_zone: boolean;
    population: boolean;
    accessibility: boolean;
  }>({
    hospitals: true,
    emergency: true,
    delivery: false,
    pediatric: false,
    vulnerable_zone: true,
    population: false,
    accessibility: false,
  });

  const [is_layer_panel_open, set_is_layer_panel_open] = useState(false);

  // 현재 지도 위에 올라가 있는 카카오 객체들 관리 (교체 및 클린업용)
  const mapObjectsRef = useRef<{
    polygons: kakao.maps.Polygon[];
    overlays: kakao.maps.CustomOverlay[];
    polylines: kakao.maps.Polyline[];
    tooltipOverlay: kakao.maps.CustomOverlay | null;
  }>({
    polygons: [],
    overlays: [],
    polylines: [],
    tooltipOverlay: null,
  });

  // 70개 중진료권별 진단 데이터 집계
  const aggregated_zones = useMemo(() => {
    return 중진료권_매퍼.aggregate_zone_diagnostics(diagnosed_list);
  }, [diagnosed_list]);

  // 선택된 시군구의 환자 이동선 데이터
  const current_flow_data = useMemo(() => {
    if (!selected_region) return null;
    return get_patient_flow_data(selected_region.시군구명);
  }, [selected_region]);

  const flow_arcs = useMemo(() => {
    if (!show_flow_arcs || !current_flow_data) return [];
    return build_patient_flow_arcs(current_flow_data, 'all');
  }, [show_flow_arcs, current_flow_data]);

  // 색상 판정 로직
  const get_fill_color_by_mode = useCallback((item: 필수의료_진단_결과): string => {
    if (view_mode === '종합취약도') {
      return 취약도_등급_정보[item.종합_취약도_등급].색상코드;
    } else if (view_mode === '응급의료') {
      return item.응급취약지역_여부 ? '#ff3b30' : '#34c759';
    } else if (view_mode === '분만모자') {
      return item.분만취약지역_여부 ? '#ff6934' : '#34c759';
    } else if (view_mode === '소아중증') {
      return '#c7c7cc';
    } else if (view_mode === '의료인력') {
      return (item.인구_천명당_의사수 !== undefined && item.인구_천명당_의사수 < 1.6) || item.종합_취약도_등급 === '심각'
        ? '#ff3b30'
        : '#34c759';
    } else if (view_mode === '병상인프라') {
      return (item.인구_천명당_병상수 !== undefined && item.인구_천명당_병상수 < 5.0) || item.종합_취약도_등급 === '취약' || item.종합_취약도_등급 === '심각'
        ? '#ff9500'
        : '#34c759';
    } else if (view_mode === '공공의료기관') {
      return item.종합_취약도_등급 === '심각' ? '#0071e3' : '#60a5fa';
    }
    return '#34c759';
  }, [view_mode]);

  const get_zone_fill_color = useCallback((zone: (typeof aggregated_zones)[0]): string => {
    if (view_mode === '종합취약도') {
      return 취약도_등급_정보[zone.종합_취약도_등급].색상코드;
    } else if (view_mode === '응급의료') {
      return zone.응급취약_여부 ? '#ff3b30' : '#34c759';
    } else if (view_mode === '분만모자') {
      return zone.분만취약_여부 ? '#ff6934' : '#34c759';
    } else if (view_mode === '소아중증') {
      return zone.소아취약_여부 ? '#ff9500' : '#34c759';
    } else if (view_mode === '의료인력') {
      return zone.종합_취약도_등급 === '심각' ? '#ff3b30' : '#34c759';
    } else if (view_mode === '병상인프라') {
      return zone.종합_취약도_등급 === '취약' ? '#ff9500' : '#34c759';
    } else if (view_mode === '공공의료기관') {
      return '#0071e3';
    }
    return '#34c759';
  }, [view_mode]);

  // 카카오 지도 SDK 초기화
  useEffect(() => {
    let is_mounted = true;
    set_is_loading(true);
    set_load_error(null);

    loadKakaoMap()
      .then((kakaoMaps) => {
        if (!is_mounted || !mapContainerRef.current) return;

        // 이미 지도 인스턴스가 존재하면 리사이즈만
        if (mapInstanceRef.current) {
          mapInstanceRef.current.relayout();
          set_is_loading(false);
          return;
        }

        const options: kakao.maps.MapOptions = {
          center: new kakaoMaps.LatLng(36.1, 127.8),
          level: 12, // 대한민국 전체 뷰
        };

        const map = new kakaoMaps.Map(mapContainerRef.current, options);
        mapInstanceRef.current = map;

        // 줌 컨트롤러 추가
        const zoomControl = new kakaoMaps.ZoomControl();
        map.addControl(zoomControl, kakaoMaps.ControlPosition.RIGHT);

        set_is_loading(false);
      })
      .catch((err: any) => {
        if (!is_mounted) return;
        set_is_loading(false);
        const msg =
          err instanceof KakaoMapLoadError
            ? err.message
            : err?.message || '카카오 지도 SDK를 불러오지 못했습니다.';
        set_load_error(msg);
      });

    return () => {
      is_mounted = false;
    };
  }, []);

  // 창 크기 변경 시 지도 재배치
  useEffect(() => {
    const handleResize = () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.relayout();
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 스카이뷰/일반지도 토글
  const toggle_map_type = (type: 'roadmap' | 'skyview') => {
    if (!mapInstanceRef.current || !window.kakao?.maps) return;
    set_map_type(type);
    if (type === 'skyview') {
      mapInstanceRef.current.setMapTypeId(window.kakao.maps.MapTypeId.SKYVIEW);
    } else {
      mapInstanceRef.current.setMapTypeId(window.kakao.maps.MapTypeId.ROADMAP);
    }
  };

  // 선택된 지역으로 지도 중심 이동
  useEffect(() => {
    if (!mapInstanceRef.current || !selected_region || !window.kakao?.maps) return;
    const loc = get_region_location(selected_region.시군구명, selected_region.시도명);
    if (!loc) return;

    try {
      const latlng = new window.kakao.maps.LatLng(loc.위도, loc.경도);
      mapInstanceRef.current.panTo(latlng);
      // 시군구 중심일 때 약간 확대 (level 8)
      if (mapInstanceRef.current.getLevel() > 9) {
        mapInstanceRef.current.setLevel(8, { animate: { duration: 500 } });
      }
    } catch (e) {
      console.warn('카카오 지도 이동 실패:', e);
    }
  }, [selected_region]);

  // 툴팁 CustomOverlay 헬퍼
  const show_tooltip = useCallback(
    (lat: number, lng: number, contentHtml: string) => {
      if (!mapInstanceRef.current || !window.kakao?.maps) return;
      const kakaoMaps = window.kakao.maps;

      if (!mapObjectsRef.current.tooltipOverlay) {
        const overlay = new kakaoMaps.CustomOverlay({
          position: new kakaoMaps.LatLng(lat, lng),
          content: '',
          yAnchor: 1.25,
          zIndex: 1000,
        });
        mapObjectsRef.current.tooltipOverlay = overlay;
      }

      const overlay = mapObjectsRef.current.tooltipOverlay;
      overlay.setPosition(new kakaoMaps.LatLng(lat, lng));
      overlay.setContent(`
        <div class="pointer-events-none bg-white/95 dark:bg-[#15161b]/95 backdrop-blur-md p-2.5 rounded-2xl shadow-2xl border border-black/10 dark:border-slate-800 text-xs text-[#1d1d1f] dark:text-slate-100 min-w-[200px] animate-in fade-in zoom-in-95">
          ${contentHtml}
        </div>
      `);
      overlay.setMap(mapInstanceRef.current);
    },
    []
  );

  const hide_tooltip = useCallback(() => {
    if (mapObjectsRef.current.tooltipOverlay) {
      mapObjectsRef.current.tooltipOverlay.setMap(null);
    }
  }, []);

  // 폴리곤, 오버레이, 마커, 환자 이동선 그리기 및 갱신
  useEffect(() => {
    if (!mapInstanceRef.current || !window.kakao?.maps || is_loading) return;
    const kakaoMaps = window.kakao.maps;
    const map = mapInstanceRef.current;

    // 1. 기존 지도 오버레이 객체 일괄 제거
    mapObjectsRef.current.polygons.forEach((p) => p.setMap(null));
    mapObjectsRef.current.overlays.forEach((o) => o.setMap(null));
    mapObjectsRef.current.polylines.forEach((l) => l.setMap(null));
    if (mapObjectsRef.current.tooltipOverlay) {
      mapObjectsRef.current.tooltipOverlay.setMap(null);
    }

    const newPolygons: kakao.maps.Polygon[] = [];
    const newOverlays: kakao.maps.CustomOverlay[] = [];
    const newPolylines: kakao.maps.Polyline[] = [];

    // ==========================================
    // A. 시군구 모드 (250개 시군구)
    // ==========================================
    if (region_unit === '시군구') {
      diagnosed_list.forEach((item) => {
        const loc = get_region_location(item.시군구명, item.시도명);
        if (!loc) return;

        const is_selected =
          selected_region?.시군구코드 === item.시군구코드 ||
          (selected_region?.시도명 === item.시도명 && selected_region?.시군구명 === item.시군구명);
        const color = get_fill_color_by_mode(item);

        // 폴리곤 렌더링
        if (loc.폴리곤_좌표 && loc.폴리곤_좌표.length > 0) {
          const path = loc.폴리곤_좌표.map(
            ([lat, lng]) => new kakaoMaps.LatLng(lat, lng)
          );

          const polygon = new kakaoMaps.Polygon({
            path,
            strokeWeight: is_selected ? 3 : 1,
            strokeColor: is_selected ? '#0071e3' : '#ffffff',
            strokeOpacity: 0.9,
            fillColor: color,
            fillOpacity: is_selected ? 0.75 : 0.55,
            zIndex: is_selected ? 20 : 1,
          });

          polygon.setMap(map);
          newPolygons.push(polygon);

          // 이벤트 등록
          kakaoMaps.event.addListener(polygon, 'mouseover', () => {
            polygon.setOptions({
              fillOpacity: 0.85,
              strokeColor: '#0071e3',
              strokeWeight: 2,
            });
            show_tooltip(
              loc.위도,
              loc.경도,
              `
              <div class="space-y-1">
                <div class="font-bold flex items-center justify-between gap-2 border-b border-black/[0.06] pb-1">
                  <div class="flex items-center gap-1.5">
                    <span class="font-bold text-sm">${item.시도명} ${item.시군구명}</span>
                    <span class="text-[10px] text-[#0071e3] bg-[#0071e3]/10 px-1.5 py-0.2 rounded-full font-medium">
                      ${중진료권_매퍼.find_zone_by_sgg(item.시군구명)}
                    </span>
                  </div>
                  <span class="px-1.5 py-0.2 rounded-full text-[10px] text-white font-semibold" style="background-color: ${
                    취약도_등급_정보[item.종합_취약도_등급].색상코드
                  }">
                    ${item.종합_취약도_등급}
                  </span>
                </div>
                <div class="text-[11px] text-[#86868b] dark:text-slate-400">
                  인구: <strong class="text-[#1d1d1f] dark:text-white">${format_number_comma(item.인구수)}명</strong> | 취약분야: ${item.취약분야_수}/3개
                </div>
                <div class="text-[10px] text-[#86868b] dark:text-slate-400">
                  응급 RI: ${item.관내_응급_의료이용률}% • 분만 미도달: ${item.분만_60분_미도달_인구비율}%
                </div>
              </div>
              `
            );
          });

          kakaoMaps.event.addListener(polygon, 'mouseout', () => {
            polygon.setOptions({
              fillOpacity: is_selected ? 0.75 : 0.55,
              strokeColor: is_selected ? '#0071e3' : '#ffffff',
              strokeWeight: is_selected ? 3 : 1,
            });
            hide_tooltip();
          });

          kakaoMaps.event.addListener(polygon, 'click', () => {
            on_select_region(item);
          });
        }

        // 중심점 코어 마커 (CustomOverlay)
        const markerDiv = document.createElement('div');
        markerDiv.className = `cursor-pointer transition-transform duration-200 hover:scale-125 ${
          is_selected ? 'scale-125 z-30' : 'z-10'
        }`;
        markerDiv.innerHTML = `
          <div style="width: ${is_selected ? '14px' : '10px'}; height: ${
            is_selected ? '14px' : '10px'
          }; border-radius: 9999px; background-color: ${
            is_selected ? '#0071e3' : color
          }; border: 2px solid #ffffff; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div>
        `;
        markerDiv.onclick = () => on_select_region(item);

        const pointOverlay = new kakaoMaps.CustomOverlay({
          position: new kakaoMaps.LatLng(loc.위도, loc.경도),
          content: markerDiv,
          zIndex: is_selected ? 30 : 10,
        });
        pointOverlay.setMap(map);
        newOverlays.push(pointOverlay);
      });
    }

    // ==========================================
    // B. 중진료권 단위 모드 (70개 진료권)
    // ==========================================
    if (region_unit === '중진료권') {
      aggregated_zones.forEach((zone) => {
        const color = get_zone_fill_color(zone);
        const is_zone_selected =
          selected_region && zone.포함_시군구.includes(selected_region.시군구명);

        // 1) 소속 시군구 폴리곤을 진료권 색상으로 일체화
        zone.소속_지역목록.forEach((r) => {
          const r_loc = get_region_location(r.시군구명, r.시도명);
          if (!r_loc || !r_loc.폴리곤_좌표 || r_loc.폴리곤_좌표.length === 0) return;

          const path = r_loc.폴리곤_좌표.map(
            ([lat, lng]) => new kakaoMaps.LatLng(lat, lng)
          );

          const poly = new kakaoMaps.Polygon({
            path,
            strokeWeight: is_zone_selected ? 2 : 0.8,
            strokeColor: is_zone_selected ? '#0071e3' : '#cbd5e1',
            strokeOpacity: 0.9,
            fillColor: color,
            fillOpacity: is_zone_selected ? 0.65 : 0.4,
            zIndex: is_zone_selected ? 20 : 5,
          });

          poly.setMap(map);
          newPolygons.push(poly);

          kakaoMaps.event.addListener(poly, 'click', () => {
            if (zone.소속_지역목록.length > 0) {
              on_select_region(zone.소속_지역목록[0]);
            }
          });
        });

        // 2) 중진료권 중심 코어 및 펄스 마커 (CustomOverlay)
        const zoneBadge = document.createElement('div');
        zoneBadge.className = 'cursor-pointer group flex items-center justify-center';
        zoneBadge.innerHTML = `
          <div style="position: relative; display: flex; align-items: center; justify-content: center;">
            <div style="width: ${is_zone_selected ? '36px' : '26px'}; height: ${
              is_zone_selected ? '36px' : '26px'
            }; border-radius: 9999px; background-color: ${color}; opacity: ${
              is_zone_selected ? '0.35' : '0.2'
            }; border: ${is_zone_selected ? '2px solid #0071e3' : '1px solid ' + color};"></div>
            <div style="position: absolute; width: ${is_zone_selected ? '18px' : '14px'}; height: ${
              is_zone_selected ? '18px' : '14px'
            }; border-radius: 9999px; background-color: ${
              is_zone_selected ? '#0071e3' : color
            }; border: 2px solid #ffffff; box-shadow: 0 2px 8px rgba(0,0,0,0.35);"></div>
            <div style="position: absolute; top: 100%; margin-top: 4px; white-space: nowrap; font-size: 10px; font-weight: 800; color: #1e293b; background: rgba(255,255,255,0.92); padding: 2px 6px; border-radius: 6px; border: 1px solid rgba(0,0,0,0.1); box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
              ${zone.중진료권명}
            </div>
          </div>
        `;

        zoneBadge.onmouseenter = () => {
          show_tooltip(
            zone.위도,
            zone.경도,
            `
            <div class="space-y-1.5 min-w-[210px]">
              <div class="font-bold flex items-center justify-between gap-2 border-b border-black/[0.06] pb-1.5">
                <div class="flex items-center gap-1.5">
                  <span class="text-[10px] text-white bg-[#0071e3] px-1.5 py-0.2 rounded-md font-semibold">
                    중진료권
                  </span>
                  <span class="text-sm font-bold">${zone.중진료권명}</span>
                  <span class="text-[10px] text-[#86868b]">(${zone.시도명})</span>
                </div>
                <span class="px-1.5 py-0.2 rounded-full text-[10px] text-white font-semibold" style="background-color: ${
                  취약도_등급_정보[zone.종합_취약도_등급].색상코드
                }">
                  ${zone.종합_취약도_등급}
                </span>
              </div>
              <div class="text-[11px] flex flex-wrap items-center gap-1">
                <span class="text-[#86868b] font-medium">포함 지자체 (${zone.포함_시군구.length}개):</span>
                <span class="font-medium text-[#0071e3]">${zone.포함_시군구.join(', ')}</span>
              </div>
              <div class="text-[11px] text-[#86868b] bg-slate-50 dark:bg-slate-800/80 p-1.5 rounded-lg space-y-0.5">
                <div>권역 총 인구: <strong>${format_number_comma(zone.총인구수)}명</strong></div>
                <div>취약도 종합점수: <strong>${zone.종합_취약도_점수}점</strong></div>
                <div class="text-[10px] text-slate-500 pt-0.5 border-t border-slate-200/60 mt-1">
                  응급 미도달 ${zone.평균_응급_60분_미도달.toFixed(1)}% | RI ${zone.평균_응급_RI.toFixed(1)}% | 분만율 ${zone.평균_분만율.toFixed(1)}%
                </div>
              </div>
            </div>
            `
          );
        };

        zoneBadge.onmouseleave = () => {
          hide_tooltip();
        };

        zoneBadge.onclick = () => {
          if (zone.소속_지역목록.length > 0) {
            on_select_region(zone.소속_지역목록[0]);
          }
        };

        const zoneOverlay = new kakaoMaps.CustomOverlay({
          position: new kakaoMaps.LatLng(zone.위도, zone.경도),
          content: zoneBadge,
          zIndex: is_zone_selected ? 40 : 25,
        });
        zoneOverlay.setMap(map);
        newOverlays.push(zoneOverlay);
      });
    }

    // ==========================================
    // C. 환자 이동선 (Flow Arcs)
    // ==========================================
    flow_arcs.forEach((arc) => {
      const path = arc.arc_path.map(([lat, lng]) => new kakaoMaps.LatLng(lat, lng));

      const polyline = new kakaoMaps.Polyline({
        path,
        strokeWeight: arc.weight + 2,
        strokeColor: arc.color,
        strokeOpacity: 0.85,
        strokeStyle: arc.is_primary ? 'solid' : 'shortdash',
        zIndex: 50,
      });

      polyline.setMap(map);
      newPolylines.push(polyline);

      // 대상지 노드 마커 (CustomOverlay)
      const targetCoords = arc.type === 'outflow' ? arc.end_coords : arc.start_coords;
      const nodeMarker = document.createElement('div');
      nodeMarker.className = 'cursor-pointer';
      nodeMarker.innerHTML = `
        <div style="width: 10px; height: 10px; border-radius: 9999px; background-color: ${arc.color}; border: 1.5px solid #ffffff; box-shadow: 0 1px 4px rgba(0,0,0,0.3);"></div>
      `;

      nodeMarker.onmouseenter = () => {
        show_tooltip(
          targetCoords[0],
          targetCoords[1],
          `
          <div class="p-1 text-xs">
            <div class="font-bold flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full" style="background-color: ${arc.color}"></span>
              <span>${arc.type === 'outflow' ? '관외 유출' : '타지역 유입'}: ${arc.origin_name} ➔ ${arc.dest_name}</span>
            </div>
            <div class="text-slate-600 dark:text-slate-400 font-medium mt-0.5">
              ${format_number_comma(arc.days)}일 (${arc.pct}%)
            </div>
          </div>
          `
        );
      };

      nodeMarker.onmouseleave = () => {
        hide_tooltip();
      };

      const nodeOverlay = new kakaoMaps.CustomOverlay({
        position: new kakaoMaps.LatLng(targetCoords[0], targetCoords[1]),
        content: nodeMarker,
        zIndex: 55,
      });
      nodeOverlay.setMap(map);
      newOverlays.push(nodeOverlay);
    });

    mapObjectsRef.current = {
      polygons: newPolygons,
      overlays: newOverlays,
      polylines: newPolylines,
      tooltipOverlay: mapObjectsRef.current.tooltipOverlay,
    };
  }, [
    diagnosed_list,
    selected_region,
    view_mode,
    region_unit,
    aggregated_zones,
    flow_arcs,
    is_loading,
    get_fill_color_by_mode,
    get_zone_fill_color,
    on_select_region,
    show_tooltip,
    hide_tooltip,
  ]);

  return (
    <div className="relative w-full h-full min-h-[580px] bg-[#eef0f3] dark:bg-[#121316] rounded-3xl overflow-hidden border border-black/[0.05] dark:border-slate-800 shadow-apple-card flex flex-col">
      {/* ============================================================== */}
      {/* 1. 상단 플로팅 컨트롤러 바 (카카오맵 연동 전용 디자인)       */}
      {/* ============================================================== */}
      <div className="absolute top-4 left-4 z-[400] flex flex-wrap items-center gap-2 max-w-[calc(100%-2rem)]">
        {/* 지도 엔진 스위처: 카카오 지도 vs Leaflet */}
        <div className="bg-white/95 dark:bg-[#15161b]/95 backdrop-blur-xl p-1 rounded-full shadow-apple-glass border border-black/[0.06] dark:border-slate-800 flex items-center space-x-1">
          <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-amber-400 text-slate-900 shadow-apple-sm flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-slate-900 animate-pulse" />
            <span>카카오맵 (기본)</span>
          </span>
          {on_switch_to_leaflet && (
            <button
              onClick={on_switch_to_leaflet}
              className="px-2.5 py-1 text-xs font-semibold rounded-full text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
              title="오픈스트리트맵(Leaflet) 보조 지도로 전환"
            >
              오픈스트리트맵
            </button>
          )}
        </div>

        {/* 카카오맵 지도 형태 스위처: 일반지도 vs 스카이뷰 */}
        <div className="bg-white/90 dark:bg-[#15161b]/90 backdrop-blur-xl p-1 rounded-full shadow-apple-glass border border-black/[0.06] dark:border-slate-800 flex items-center space-x-1">
          <button
            onClick={() => toggle_map_type('roadmap')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-full transition-all duration-200 cursor-pointer flex items-center gap-1 ${
              map_type === 'roadmap'
                ? 'bg-blue-600 text-white shadow-apple-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <MapIcon className="w-3 h-3" />
            <span>일반</span>
          </button>
          <button
            onClick={() => toggle_map_type('skyview')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-full transition-all duration-200 cursor-pointer flex items-center gap-1 ${
              map_type === 'skyview'
                ? 'bg-blue-600 text-white shadow-apple-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Satellite className="w-3 h-3" />
            <span>위성</span>
          </button>
        </div>

        {/* 단위 스위처: 시군구 vs 중진료권 */}
        <div className="bg-white/90 dark:bg-[#15161b]/90 backdrop-blur-xl p-1 rounded-full shadow-apple-glass border border-black/[0.06] dark:border-slate-800 flex items-center space-x-1">
          <button
            onClick={() => on_change_region_unit('시군구')}
            className={`px-3 py-1 text-xs font-semibold rounded-full transition-all duration-200 cursor-pointer ${
              region_unit === '시군구'
                ? 'bg-blue-600 text-white shadow-apple-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            시·군·구 (250)
          </button>
          <button
            onClick={() => on_change_region_unit('중진료권')}
            className={`px-3 py-1 text-xs font-semibold rounded-full transition-all duration-200 cursor-pointer ${
              region_unit === '중진료권'
                ? 'bg-blue-600 text-white shadow-apple-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            중진료권 (70)
          </button>
        </div>

        {/* 7대 지표 레이어 스위처 */}
        <div className="bg-white/95 dark:bg-[#15161b]/95 backdrop-blur-xl p-1 rounded-full shadow-apple-glass border border-black/[0.06] dark:border-slate-800 flex items-center space-x-1 flex-wrap">
          {([
            { id: '종합취약도', label: '취약도' },
            { id: '응급의료', label: '응급' },
            { id: '분만모자', label: '분만' },
            { id: '소아중증', label: '소아(참고)' },
            { id: '의료인력', label: '인력' },
            { id: '병상인프라', label: '병상' },
            { id: '공공의료기관', label: '공공병원' },
          ] as { id: 지도_시각화_모드; label: string }[]).map((mode) => (
            <button
              key={mode.id}
              onClick={() => on_change_view_mode(mode.id)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-full transition-all duration-200 cursor-pointer ${
                view_mode === mode.id
                  ? 'bg-blue-600 text-white shadow-apple-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>

        {/* GIS Layer On/Off 체크박스 패널 */}
        <div className="relative">
          <button
            onClick={() => set_is_layer_panel_open(!is_layer_panel_open)}
            className={`px-3 py-1 text-xs font-semibold rounded-full transition-all duration-200 flex items-center gap-1.5 cursor-pointer shadow-apple-glass border border-black/[0.06] dark:border-slate-800 ${
              is_layer_panel_open
                ? 'bg-blue-600 text-white'
                : 'bg-white/95 dark:bg-[#15161b]/95 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>GIS Layer</span>
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-blue-500/20 text-blue-700 dark:text-blue-300">
              {Object.values(active_gis_layers).filter(Boolean).length}
            </span>
          </button>

          {is_layer_panel_open && (
            <div className="absolute top-full left-0 mt-2 w-56 bg-white/95 dark:bg-[#15161b]/95 backdrop-blur-xl p-3 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 text-xs space-y-2 z-[500] animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-1.5">
                <span className="font-bold text-slate-900 dark:text-white">카카오 GIS Layer 설정</span>
                <span className="text-[10px] text-slate-400">즉시 지도 반영</span>
              </div>
              <div className="space-y-1.5">
                {[
                  { key: 'hospitals', label: '의료기관', desc: '공공병원 및 주요병원' },
                  { key: 'emergency', label: '응급의료기관', desc: '권역·지역응급센터' },
                  { key: 'delivery', label: '분만기관', desc: '분만실 보유 기관' },
                  { key: 'pediatric', label: '소아의료기관', desc: '달빛어린이병원 등' },
                  { key: 'vulnerable_zone', label: '의료취약지역', desc: '법정 취약지 색상' },
                  { key: 'population', label: '인구 밀도', desc: '인구 규모 표시' },
                  { key: 'accessibility', label: '접근성 (골든타임)', desc: '60분 미도달 영역' },
                ].map(({ key, label, desc }) => {
                  const isChecked = active_gis_layers[key as keyof typeof active_gis_layers];
                  return (
                    <label
                      key={key}
                      className="flex items-start gap-2 p-1.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() =>
                          set_active_gis_layers((prev) => ({
                            ...prev,
                            [key]: !prev[key as keyof typeof active_gis_layers],
                          }))
                        }
                        className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="leading-tight">
                        <div className="font-semibold text-slate-800 dark:text-slate-200 text-xs">{label}</div>
                        <div className="text-[10px] text-slate-400">{desc}</div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 환자 이동선 토글 */}
        <button
          onClick={() => set_show_flow_arcs(!show_flow_arcs)}
          className={`px-3 py-1 text-xs font-semibold rounded-full transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
            show_flow_arcs
              ? 'bg-rose-500 text-white shadow-apple-sm'
              : 'bg-white/90 dark:bg-[#15161b]/90 backdrop-blur-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 border border-black/[0.06] dark:border-slate-800'
          }`}
          title="선택된 지자체의 환자 유출입 공간 네트워크 곡선(Arc) 표시"
        >
          <span>환자 이동선</span>
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              show_flow_arcs ? 'bg-white animate-pulse' : 'bg-slate-300'
            }`}
          />
        </button>

        {/* 카카오 API 키 설정 모달 열기 버튼 */}
        {on_open_key_modal && (
          <button
            onClick={on_open_key_modal}
            className="p-1.5 bg-white/90 dark:bg-[#15161b]/90 hover:bg-white text-slate-600 dark:text-slate-300 hover:text-blue-600 rounded-full shadow-apple-glass border border-black/[0.06] dark:border-slate-800 transition cursor-pointer"
            title="카카오 지도 JavaScript API 키 설정"
          >
            <Key className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* ============================================================== */}
      {/* 2. 카카오 지도 Canvas 컨테이너                                  */}
      {/* ============================================================== */}
      <div className="flex-1 w-full h-full relative" id="kakao-map-canvas-container">
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* 로딩 인디케이터 */}
        {is_loading && (
          <div className="absolute inset-0 bg-slate-100/80 dark:bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center z-[500]">
            <div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
              카카오맵 Web API 연결 중...
            </p>
          </div>
        )}

        {/* 로드 실패/키 미설정 알림 오버레이 */}
        {load_error && (
          <div className="absolute inset-0 bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-[500]">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900 flex items-center justify-center text-amber-600 mb-3">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-slate-900 dark:text-white mb-1">
              카카오맵 연결 설정이 필요합니다
            </h3>
            <p className="text-xs text-slate-500 max-w-md mb-4 leading-relaxed">
              {load_error}
            </p>
            <div className="flex items-center gap-2">
              {on_open_key_modal && (
                <button
                  onClick={on_open_key_modal}
                  className="px-4 py-2 bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold rounded-xl text-xs transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>카카오 API 키 입력하기</span>
                </button>
              )}
              {on_switch_to_leaflet && (
                <button
                  onClick={on_switch_to_leaflet}
                  className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-xl text-xs transition cursor-pointer"
                >
                  오픈스트리트맵(보조)으로 보기
                </button>
              )}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* 3. GIS 시각화 단일 통합 범례                                  */}
        {/* ============================================================== */}
        <div className="absolute bottom-4 right-4 z-[400] bg-white/95 dark:bg-[#15161b]/95 backdrop-blur-md p-3.5 rounded-2xl shadow-apple-card border border-black/[0.06] dark:border-slate-800 text-xs space-y-2 pointer-events-auto">
          <div className="flex items-center justify-between gap-3 pb-1.5 border-b border-black/[0.05] dark:border-slate-800">
            <span className="font-bold text-[#1d1d1f] dark:text-white text-xs flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>{view_mode === '종합취약도' ? '취약도 판정 범례' : `${view_mode} 판정 범례`}</span>
            </span>
            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-full border border-blue-200/50 dark:border-blue-900/50">
              {region_unit === '중진료권' ? '70개 권역' : '250개 시군구'}
            </span>
          </div>

          {view_mode === '종합취약도' ? (
            <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11px]">
              <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ff3b30] shrink-0 shadow-xs" />
                <span>🔴 심각</span>
              </div>
              <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ff9500] shrink-0 shadow-xs" />
                <span>🟠 주의</span>
              </div>
              <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ffcc00] shrink-0 shadow-xs" />
                <span>🟡 관심</span>
              </div>
              <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-[#34c759] shrink-0 shadow-xs" />
                <span>🟢 양호</span>
              </div>
            </div>
          ) : (
            <div className="space-y-1.5 text-[11px]">
              <div className="flex items-center gap-2 font-medium text-slate-700 dark:text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ff3b30] shrink-0 shadow-xs" />
                <span>취약 권역/지역 (기준 미달)</span>
              </div>
              <div className="flex items-center gap-2 font-medium text-slate-700 dark:text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-[#34c759] shrink-0 shadow-xs" />
                <span>적정 권역/지역 (기준 충족)</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
