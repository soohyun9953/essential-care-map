'use client';

// 국민안심 서비스 전용 하이브리드 의사결정 지도 컴포넌트
// - 카카오 지도 Web API (kakao.maps) 및 Leaflet(오픈스트리트맵) 듀얼 엔진 지원
// - 실시간 공공병원(214개소) 및 보조 의료기관(민간 분만/소아/응급) 위치 핀 렌더링
// - 스카이뷰(위성사진)/일반지도 전환 및 병원 선택 시 부드러운 카메라 이동(panTo) 지원
// - 카카오 도메인 미등록 시 명확한 에러 안내 및 원클릭 도메인 복사 제공

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { 공공의료기관_상세_프로필 } from '@/lib/의료서비스_검색_엔진';
import { loadKakaoMap, KakaoMapLoadError } from '@/lib/카카오_지도_로더';
import { 카카오_지도_API키_불러오기 } from '@/lib/API키_저장소';
import { Map as MapIcon, Satellite, AlertCircle, Copy, Check, ExternalLink } from 'lucide-react';

// 공공병원 외 보조 지점 (예: 심평원 분만가능 민간 의료기관)
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

// ==============================================================
// Leaflet 전용 카메라 컨트롤러 및 리사이저
// ==============================================================
const MapCameraController: React.FC<{ target_lat?: number; target_lng?: number; zoom?: number }> = ({
  target_lat,
  target_lng,
  zoom = 12,
}) => {
  const map = useMap();
  useEffect(() => {
    if (!Number.isFinite(target_lat) || !Number.isFinite(target_lng)) return;
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

const MapResizeHandler: React.FC = () => {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        map.invalidateSize();
      } catch {}
    }, 150);

    const handleResize = () => {
      try {
        map.invalidateSize();
      } catch {}
    };
    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, [map]);
  return null;
};

// ==============================================================
// 메인 컴포넌트: 카카오맵 우선 / Leaflet fallback 듀얼 엔진
// ==============================================================
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

  // 지도 엔진 및 상태
  const [engine, set_engine] = useState<'kakao' | 'leaflet'>('kakao');
  const [kakao_ready, set_kakao_ready] = useState<boolean>(false);
  const [map_type, set_map_type] = useState<'roadmap' | 'skyview'>('roadmap');
  const [load_error, set_load_error] = useState<string | null>(null);
  const [copied_domain, set_copied_domain] = useState<boolean>(false);

  // API 키 변경 트리거 (이벤트 수신 시 재렌더링)
  const [key_trigger, set_key_trigger] = useState<number>(0);

  const kakaoContainerRef = useRef<HTMLDivElement>(null);
  const kakaoMapRef = useRef<kakao.maps.Map | null>(null);
  const kakaoOverlaysRef = useRef<kakao.maps.CustomOverlay[]>([]);
  const tooltipOverlayRef = useRef<kakao.maps.CustomOverlay | null>(null);

  // 전역 API 키 저장/갱신 이벤트 리스닝
  useEffect(() => {
    const handleKeyUpdated = () => {
      set_key_trigger((prev) => prev + 1);
    };
    window.addEventListener('app_api_key_updated', handleKeyUpdated);
    window.addEventListener('storage', handleKeyUpdated);
    return () => {
      window.removeEventListener('app_api_key_updated', handleKeyUpdated);
      window.removeEventListener('storage', handleKeyUpdated);
    };
  }, []);

  // 초기 엔진 판별 및 카카오맵 로드
  useEffect(() => {
    const key = 카카오_지도_API키_불러오기();
    if (!key) {
      set_engine('leaflet');
      set_kakao_ready(false);
      set_load_error(null);
      return;
    }

    let is_mounted = true;
    set_load_error(null);

    loadKakaoMap(key)
      .then((kakaoMaps) => {
        if (!is_mounted || !kakaoContainerRef.current) return;

        if (!kakaoMapRef.current) {
          const defaultLat = active_hospital ? active_hospital.위도 : 37.5665;
          const defaultLng = active_hospital ? active_hospital.경도 : 126.9780;

          const options: kakao.maps.MapOptions = {
            center: new kakaoMaps.LatLng(defaultLat, defaultLng),
            level: active_hospital ? 5 : 8,
          };
          const map = new kakaoMaps.Map(kakaoContainerRef.current, options);
          const zoomControl = new kakaoMaps.ZoomControl();
          map.addControl(zoomControl, kakaoMaps.ControlPosition.RIGHT);
          kakaoMapRef.current = map;
        } else {
          kakaoMapRef.current.relayout();
        }

        set_kakao_ready(true);
        set_engine('kakao');
      })
      .catch((err: any) => {
        console.warn('카카오 지도 로드 실패:', err);
        if (is_mounted) {
          const msg =
            err instanceof KakaoMapLoadError
              ? err.message
              : err?.message || '카카오 지도 SDK를 불러오지 못했습니다.';
          set_load_error(msg);
          // 실패 시 Leaflet으로 fallback하되, 사용자에게 에러 안내 배너를 제공
          set_engine('leaflet');
        }
      });

    return () => {
      is_mounted = false;
    };
  }, [active_hospital, key_trigger]);

  // 창 크기 변경 시 카카오 지도 relayout
  useEffect(() => {
    const handleResize = () => {
      if (kakaoMapRef.current) {
        kakaoMapRef.current.relayout();
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 스카이뷰/일반지도 토글
  const toggle_map_type = (type: 'roadmap' | 'skyview') => {
    if (!kakaoMapRef.current || !window.kakao?.maps) return;
    set_map_type(type);
    if (type === 'skyview') {
      kakaoMapRef.current.setMapTypeId(window.kakao.maps.MapTypeId.SKYVIEW);
    } else {
      kakaoMapRef.current.setMapTypeId(window.kakao.maps.MapTypeId.ROADMAP);
    }
  };

  // 선택된 병원/보조지점으로 카카오 지도 이동
  useEffect(() => {
    if (!kakaoMapRef.current || !window.kakao?.maps || engine !== 'kakao') return;
    const target = active_hospital || active_extra;
    if (!target) return;

    try {
      const latlng = new window.kakao.maps.LatLng(target.위도, target.경도);
      kakaoMapRef.current.panTo(latlng);
      if (kakaoMapRef.current.getLevel() > 6) {
        kakaoMapRef.current.setLevel(5, { animate: { duration: 400 } });
      }
    } catch (e) {
      console.warn('카카오 지도 이동 실패:', e);
    }
  }, [active_hospital, active_extra, engine]);

  // 툴팁 CustomOverlay 헬퍼
  const show_kakao_tooltip = useCallback((lat: number, lng: number, htmlContent: string) => {
    if (!kakaoMapRef.current || !window.kakao?.maps) return;
    const kakaoMaps = window.kakao.maps;

    if (!tooltipOverlayRef.current) {
      tooltipOverlayRef.current = new kakaoMaps.CustomOverlay({
        position: new kakaoMaps.LatLng(lat, lng),
        content: '',
        yAnchor: 1.3,
        zIndex: 100,
      });
    }

    const overlay = tooltipOverlayRef.current;
    overlay.setPosition(new kakaoMaps.LatLng(lat, lng));
    overlay.setContent(`
      <div class="pointer-events-none bg-white/95 dark:bg-[#15161b]/95 backdrop-blur-md p-2 rounded-xl shadow-xl border border-black/10 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 min-w-[190px] animate-in fade-in zoom-in-95">
        ${htmlContent}
      </div>
    `);
    overlay.setMap(kakaoMapRef.current);
  }, []);

  const hide_kakao_tooltip = useCallback(() => {
    if (tooltipOverlayRef.current) {
      tooltipOverlayRef.current.setMap(null);
    }
  }, []);

  // 카카오 지도 위에 병원 및 보조 지점 마커 렌더링
  useEffect(() => {
    if (!kakaoMapRef.current || !window.kakao?.maps || !kakao_ready || engine !== 'kakao') return;
    const kakaoMaps = window.kakao.maps;
    const map = kakaoMapRef.current;

    kakaoOverlaysRef.current.forEach((o) => o.setMap(null));
    kakaoOverlaysRef.current = [];

    const newOverlays: kakao.maps.CustomOverlay[] = [];

    // 1. 공공의료기관 마커 (214개소)
    hospitals.forEach((h) => {
      const is_active = active_hospital?.id === h.id;
      const is_regional = h.기관유형.includes('권역');
      const is_local = h.기관유형.includes('지역');

      const base_color = is_regional ? '#0071e3' : is_local ? '#10b981' : '#8b5cf6';
      const fill_color = is_active ? '#ff3b30' : base_color;

      const markerEl = document.createElement('div');
      markerEl.className = 'cursor-pointer group flex items-center justify-center transition-transform hover:scale-125';

      markerEl.innerHTML = `
        <div style="position: relative; display: flex; align-items: center; justify-content: center;">
          ${
            is_active
              ? '<div style="position: absolute; width: 34px; height: 34px; border-radius: 9999px; background-color: #ff3b30; opacity: 0.35; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>'
              : ''
          }
          <div style="width: ${is_active ? '20px' : '14px'}; height: ${
        is_active ? '20px' : '14px'
      }; border-radius: 9999px; background-color: ${fill_color}; border: 2.5px solid #ffffff; box-shadow: 0 2px 6px rgba(0,0,0,0.35);"></div>
        </div>
      `;

      markerEl.onclick = () => handle_select(h);

      markerEl.onmouseenter = () => {
        show_kakao_tooltip(
          h.위도,
          h.경도,
          `
          <div class="space-y-1 text-left">
            <div class="flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-0.5">
              <span class="text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                ${h.기관유형}
              </span>
              <strong class="text-xs font-bold text-slate-900 dark:text-white">${h.기관명}</strong>
            </div>
            <div class="text-[11px] text-slate-600 dark:text-slate-300">
              총 병상 <strong>${h.의료자원.병상.총병상}</strong>병상 · ${h.의료자원.응급실.구분}
            </div>
            <div class="text-[10px] text-blue-600 dark:text-blue-400 font-medium">
              클릭 시 상세 정보 및 길찾기 연결
            </div>
          </div>
          `
        );
      };

      markerEl.onmouseleave = () => {
        hide_kakao_tooltip();
      };

      const overlay = new kakaoMaps.CustomOverlay({
        position: new kakaoMaps.LatLng(h.위도, h.경도),
        content: markerEl,
        zIndex: is_active ? 35 : 15,
      });

      overlay.setMap(map);
      newOverlays.push(overlay);
    });

    // 2. 보조 지점 (민간 분만/소아/응급)
    extra_points.forEach((p) => {
      const is_active = p.id === active_extra_id;
      const markerEl = document.createElement('div');
      markerEl.className = 'cursor-pointer hover:scale-125 transition-transform';
      markerEl.innerHTML = `
        <div style="width: ${is_active ? '18px' : '11px'}; height: ${
        is_active ? '18px' : '11px'
      }; border-radius: 9999px; background-color: ${
        is_active ? '#ff3b30' : '#ec4899'
      }; border: 2px solid #ffffff; box-shadow: 0 1px 5px rgba(0,0,0,0.3);"></div>
      `;

      markerEl.onclick = () => on_select_extra?.(p);

      markerEl.onmouseenter = () => {
        show_kakao_tooltip(
          p.위도,
          p.경도,
          `
          <div class="space-y-0.5 text-left">
            <strong class="text-xs font-bold text-slate-900 dark:text-white">${p.기관명}</strong>
            <div class="text-[11px] text-slate-600 dark:text-slate-300">${p.종별} · ${p.설명}</div>
          </div>
          `
        );
      };

      markerEl.onmouseleave = () => {
        hide_kakao_tooltip();
      };

      const overlay = new kakaoMaps.CustomOverlay({
        position: new kakaoMaps.LatLng(p.위도, p.경도),
        content: markerEl,
        zIndex: is_active ? 30 : 12,
      });
      overlay.setMap(map);
      newOverlays.push(overlay);
    });

    kakaoOverlaysRef.current = newOverlays;
  }, [
    hospitals,
    extra_points,
    active_hospital,
    active_extra_id,
    kakao_ready,
    engine,
    handle_select,
    on_select_extra,
    show_kakao_tooltip,
    hide_kakao_tooltip,
  ]);

  const default_center: [number, number] = active_hospital
    ? [active_hospital.위도, active_hospital.경도]
    : [37.5665, 126.9780];

  const currentOrigin =
    typeof window !== 'undefined'
      ? `${window.location.protocol}//${window.location.host}`
      : 'https://...vercel.app';

  const copy_current_domain = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(currentOrigin);
      set_copied_domain(true);
      setTimeout(() => set_copied_domain(false), 2000);
    }
  };

  return (
    <div className="w-full h-full relative min-h-[300px] overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800" id="decision-map-canvas-container">
      {/* 상단 컨트롤러: E-Gen 실시간 뱃지와 겹치지 않도록 [우측 상단 (top-3 right-3)]에 배치 */}
      <div className="absolute top-3 right-3 z-[1100] flex items-center gap-1.5 pointer-events-auto">
        <div className="bg-white/95 dark:bg-[#15161b]/95 backdrop-blur-md p-1 rounded-full shadow-apple-glass border border-black/[0.06] dark:border-slate-800 flex items-center space-x-1 text-xs">
          <button
            type="button"
            onClick={() => {
              set_engine('kakao');
              set_load_error(null);
            }}
            className={`px-2.5 py-1 text-xs font-bold rounded-full transition flex items-center gap-1 cursor-pointer ${
              engine === 'kakao'
                ? 'bg-amber-400 text-slate-900 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-slate-900" />
            <span>카카오맵</span>
          </button>
          <button
            type="button"
            onClick={() => set_engine('leaflet')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-full transition cursor-pointer ${
              engine === 'leaflet'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            기본지도
          </button>
        </div>

        {engine === 'kakao' && (
          <div className="bg-white/90 dark:bg-[#15161b]/90 backdrop-blur-md p-1 rounded-full shadow-apple-glass border border-black/[0.06] dark:border-slate-800 flex items-center space-x-1 text-xs">
            <button
              type="button"
              onClick={() => toggle_map_type('roadmap')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-full transition flex items-center gap-1 cursor-pointer ${
                map_type === 'roadmap'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <MapIcon className="w-3 h-3" />
              <span>일반</span>
            </button>
            <button
              type="button"
              onClick={() => toggle_map_type('skyview')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-full transition flex items-center gap-1 cursor-pointer ${
                map_type === 'skyview'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Satellite className="w-3 h-3" />
              <span>위성</span>
            </button>
          </div>
        )}
      </div>

      {/* 도메인 미등록 또는 로드 에러 알림 바 (발생 시 상단에 표시) */}
      {load_error && (
        <div className="absolute top-14 left-3 right-3 z-[1150] p-3 rounded-2xl bg-amber-50/95 dark:bg-amber-950/95 backdrop-blur-md border-2 border-amber-400 shadow-xl text-xs space-y-1.5 animate-in fade-in">
          <div className="flex items-center justify-between text-amber-900 dark:text-amber-200 font-bold">
            <span className="flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>카카오 개발자 콘솔에 현재 사이트 도메인 등록이 필요합니다</span>
            </span>
            <button
              onClick={() => set_load_error(null)}
              className="text-slate-400 hover:text-slate-600 text-[11px] font-normal"
            >
              닫기 ✕
            </button>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
            카카오 지도는 등록된 사이트 도메인에서만 지도를 표시합니다. 아래 도메인을 카카오 콘솔의 <strong>[앱 설정] &gt; [플랫폼] &gt; [Web]</strong>에 추가해 주세요:
          </p>
          <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-2.5 py-1.5 rounded-xl border border-amber-300 dark:border-amber-800">
            <code className="text-blue-600 dark:text-blue-400 font-mono font-bold flex-1 break-all">
              {currentOrigin}
            </code>
            <button
              type="button"
              onClick={copy_current_domain}
              className="px-2 py-1 rounded bg-amber-100 dark:bg-amber-900 text-amber-900 dark:text-amber-200 text-[10px] font-bold flex items-center gap-1 shrink-0 cursor-pointer"
            >
              {copied_domain ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              <span>{copied_domain ? '복사됨' : '도메인 복사'}</span>
            </button>
            <a
              href="https://developers.kakao.com/console/app"
              target="_blank"
              rel="noreferrer"
              className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold flex items-center gap-1 shrink-0 hover:bg-slate-200"
            >
              <span>콘솔 바로가기</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}

      {/* 1. 카카오 지도 Canvas (engine === 'kakao') */}
      <div
        ref={kakaoContainerRef}
        className={`w-full h-full min-h-[300px] ${engine === 'kakao' ? 'block' : 'hidden'}`}
      />

      {/* 2. Leaflet 지도 Canvas (engine === 'leaflet') */}
      {engine === 'leaflet' && (
        <MapContainer
          center={default_center}
          zoom={active_hospital ? 11 : 8}
          scrollWheelZoom={true}
          className="w-full h-full min-h-[300px]"
          style={{ width: '100%', height: '100%', minHeight: '300px' }}
        >
          <MapResizeHandler />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
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

          {/* 보조 지점 마커 */}
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

          {/* 공공의료기관 마커 */}
          {hospitals.map((h) => {
            const is_active = active_hospital?.id === h.id;
            const is_regional = h.기관유형.includes('권역');
            const is_local = h.기관유형.includes('지역');

            const base_color = is_regional ? '#0071e3' : is_local ? '#10b981' : '#8b5cf6';
            const fill_color = is_active ? '#ff3b30' : base_color;
            const radius = is_active ? 10 : is_regional ? 8 : 6;

            return (
              <React.Fragment key={`marker-${h.id}`}>
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
                        총 병상 <strong>{h.의료자원.병상.총병상}</strong>병상 · {h.의료자원.응급실.구분}
                      </div>
                      <div className="text-[10px] text-slate-400">기준 데이터 (실시간 병상 현황 아님)</div>
                    </div>
                  </Tooltip>
                </CircleMarker>
              </React.Fragment>
            );
          })}
        </MapContainer>
      )}
    </div>
  );
};
