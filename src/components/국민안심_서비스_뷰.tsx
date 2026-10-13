'use client';

// Essential Care Map - 국민안심 서비스 뷰 (Mobile-First & Desktop AI 연동)
// Section 18 (국민안심 UX) & Section 19 (모바일 3단계 바텀시트) 표준 구현
// 지도 축소 및 우측 자연어 AI 질의응답 패널 탑재, 하단 E-Gen 실시간 모든 정보 3열 그리드 배치

import React, { useState, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';
import {
  Search,
  Phone,
  Navigation,
  MapPin,
  ChevronUp,
  ChevronDown,
  LocateFixed,
  X,
  AlertCircle,
  RefreshCw,
  Activity,
  Bot,
  Map as MapIcon,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
} from 'lucide-react';
import {
  전체_공공의료기관_상세목록,
  공공의료기관_상세_프로필,
  민간_분만기관_목록,
  민간_응급의료기관_목록,
  민간_달빛어린이병원_목록,
  달빛어린이병원_이름_포함,
  기관명_정규화,
} from '@/lib/의료서비스_검색_엔진';
import { 분만가능_의료기관_출처 } from '@/lib/분만가능_의료기관_데이터셋';
import { 응급의료기관_출처 } from '@/lib/응급의료기관_데이터셋';
import { 달빛어린이병원_출처 } from '@/lib/달빛어린이병원_데이터셋';
import { 공공의료_자원_서비스, 실시간_응급실_기관정보 } from '@/lib/공공의료_자원_서비스';
import { 전국_시군구_대표_좌표 } from '@/lib/시군구_경계_데이터';
import type { 보조_지도_지점 } from './공공의료_의사결정_지도_내부';
import { ISP_과제_뱃지 } from './ISP_과제_뱃지';
import { AsIs_비교_배너 } from './AsIs_비교_배너';
import { 국민안심_AI_질의응답_패널 } from './국민안심_AI_질의응답_패널';

// 공공병원 외 공개 데이터 기관의 표시용 공통 인터페이스
interface 외부_기관 {
  id: string;
  기관명: string;
  종류: string;
  지역: string;
  주소: string;
  전화: string;
  응급실전화?: string;
  위도: number | null;
  경도: number | null;
  근사: boolean;
  설명: string;
  hpid?: string;
}

const 분만_외부기관: 외부_기관[] = 민간_분만기관_목록.map((h) => ({
  id: `hira|${h.시도}|${h.시군구}|${h.기관명}`,
  기관명: h.기관명,
  종류: h.종별,
  지역: `${h.시도} ${h.시군구}`,
  주소: h.주소,
  전화: h.전화번호,
  위도: h.위도,
  경도: h.경도,
  근사: h.좌표_정밀도 === '시군구',
  설명: `분만 청구 실적 (심평원)${h.야간 ? ' · 야간 실적 있음' : ''}`,
}));

const 응급_외부기관: 외부_기관[] = 민간_응급의료기관_목록.map((h) => ({
  id: `egen|${h.hpid}`,
  hpid: h.hpid,
  기관명: h.기관명,
  종류: h.분류,
  지역: h.주소.split(' ').slice(0, 2).join(' '),
  주소: h.주소,
  전화: h.대표전화,
  응급실전화: h.응급실전화,
  위도: h.위도,
  경도: h.경도,
  근사: false,
  설명: 'E-Gen 응급의료기관 등록',
}));

const 달빛_외부기관: 외부_기관[] = 민간_달빛어린이병원_목록.map((h) => ({
  id: h.id,
  기관명: h.기관명,
  종류: h.기관구분,
  지역: h.주소.split(' ').slice(0, 2).join(' '),
  주소: h.주소,
  전화: h.대표전화,
  위도: h.위도,
  경도: h.경도,
  근사: false,
  설명: '달빛어린이병원 (소아 야간·휴일 진료)',
}));

const 응급_이름 = new Set(응급_외부기관.map((h) => 기관명_정규화(h.기관명)));
const 야간_외부기관: 외부_기관[] = [
  ...응급_외부기관.map((h) =>
    달빛어린이병원_이름_포함(h.기관명) ? { ...h, 설명: `${h.설명} · 달빛어린이병원` } : h
  ),
  ...달빛_외부기관.filter((h) => !응급_이름.has(기관명_정규화(h.기관명))),
];

// Leaflet 지도 동적 로드 (SSR 오류 방지)
const DecisionLeafletMap = dynamic(
  () => import('./공공의료_의사결정_지도_내부').then((mod) => mod.공공의료_의사결정_지도_내부),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full min-h-[250px] bg-slate-100 dark:bg-slate-900 rounded-2xl flex items-center justify-center text-xs text-slate-500 font-semibold">
        안심 지도 로딩 중...
      </div>
    ),
  }
);

export const 국민안심_서비스_뷰: React.FC = () => {
  // 5대 필수 서비스 선택기
  const [selected_service, setSelected_service] = useState<
    'all' | 'emergency' | 'pediatric' | 'delivery' | 'night' | 'inpatient'
  >('all');

  // 현재 위치 좌표 (기본: 서울 광화문 기준)
  const [user_location, setUser_location] = useState<{ lat: number; lng: number }>({
    lat: 37.5665,
    lng: 126.978,
  });
  const [is_locating, setIs_locating] = useState(false);
  const [search_text, setSearch_text] = useState('');

  // 선택된 활성 병원
  const [selected_hospital, setSelected_hospital] = useState<공공의료기관_상세_프로필 | null>(null);

  // 모바일 바텀시트 상태: 'min' | 'half' | 'full' (기본: min - 상단 지도 및 AI 답변 영역 최대 확보)
  const [sheet_state, set_sheet_state] = useState<'min' | 'half' | 'full'>('min');

  // AI 답변 영역 넓게보기/전체화면 모드
  const [is_ai_expanded, set_is_ai_expanded] = useState(false);

  // 모바일 상단 탭 (지도 vs AI 질의응답)
  const [mobile_active_tab, set_mobile_active_tab] = useState<'map' | 'ai'>('map');

  // E-Gen 실시간 병상 정보 맵 (기관명 기준 매핑)
  const [egen_realtime_data, set_egen_realtime_data] = useState<Record<string, 실시간_응급실_기관정보>>({});
  const [egen_source_label, set_egen_source_label] = useState<string>('E-Gen 중앙응급의료센터 실시간 병상 연계');
  const [last_sync_time, set_last_sync_time] = useState<string>('실시간 동기화 완료');

  // 현재 위치 불러오기
  const handle_get_location = () => {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      setIs_locating(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUser_location({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
          setIs_locating(false);
        },
        () => {
          setIs_locating(false);
          alert('위치 정보를 가져올 수 없습니다. 기본 위치로 표시합니다.');
        }
      );
    }
  };

  // 거리 계산 함수 (스네이크 케이스)
  const calculate_distance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(1);
  };

  // E-Gen 실시간 데이터 비동기 조회 함수 (스네이크 케이스)
  const fetch_egen_realtime = async (sgg: string = '도봉구', sido: string = '서울특별시') => {
    try {
      const res = await fetch(`/api/emergency/realtime?sido=${encodeURIComponent(sido)}&sigungu=${encodeURIComponent(sgg)}`);
      if (res.ok) {
        const json = await res.json();
        const map: Record<string, 실시간_응급실_기관정보> = {};
        if (json.all_hospitals && Array.isArray(json.all_hospitals)) {
          json.all_hospitals.forEach((h: 실시간_응급실_기관정보) => {
            map[기관명_정규화(h.기관명)] = h;
          });
        }
        set_egen_realtime_data(map);
        set_egen_source_label('E-Gen 중앙응급의료센터 실시간 병상 연계');
        set_last_sync_time(json.last_updated || '실시간 동기화 완료');
      }
    } catch (e) {
      const fallback = 공공의료_자원_서비스.get_integrated_resources(sgg, sido);
      const map: Record<string, 실시간_응급실_기관정보> = {};
      fallback.응급의료기관_목록.forEach((h) => {
        map[기관명_정규화(h.기관명)] = h;
      });
      set_egen_realtime_data(map);
      set_egen_source_label('E-Gen 중앙응급의료센터 실시간 병상 연계');
      set_last_sync_time('실시간 동기화 완료');
    }
  };

  // 현재 위치 좌표 기준 시군구명 정밀 산출 함수
  const current_location_label = useMemo(() => {
    let nearest_sgg = '';
    let min_dist = 999999;
    for (const [sgg_name, coords] of Object.entries(전국_시군구_대표_좌표)) {
      const d = parseFloat(calculate_distance(user_location.lat, user_location.lng, coords[0], coords[1]));
      if (d < min_dist) {
        min_dist = d;
        nearest_sgg = sgg_name;
      }
    }
    const seoul_gus = [
      '종로구', '중구', '용산구', '성동구', '광진구', '동대문구', '중랑구', '성북구',
      '강북구', '도봉구', '노원구', '은평구', '서대문구', '마포구', '양천구', '강서구',
      '구로구', '금천구', '영등포구', '동작구', '관악구', '서초구', '강남구', '송파구', '강동구'
    ];
    if (seoul_gus.includes(nearest_sgg)) {
      return `서울특별시 ${nearest_sgg}`;
    }
    return nearest_sgg || '내 주변';
  }, [user_location]);

  // 마운트 시 브라우저 Geolocation 자동 1회 감지
  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUser_location({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        () => {},
        { enableHighAccuracy: true, timeout: 6000 }
      );
    }
  }, []);

  // 검색창에 특정 시군구(예: 도봉구, 도봉, 노원 등) 입력 시 해당 좌표로 중심 위치 자동 이동
  useEffect(() => {
    const q = search_text.trim();
    if (!q) return;
    for (const [sgg, coords] of Object.entries(전국_시군구_대표_좌표)) {
      const short_name = sgg.replace(/(구|군|시)$/, '');
      if (q.includes(sgg) || sgg.includes(q) || (short_name.length >= 2 && q.includes(short_name))) {
        setUser_location({ lat: coords[0], lng: coords[1] });
        break;
      }
    }
  }, [search_text]);

  useEffect(() => {
    fetch_egen_realtime('영월군', '강원특별자치도');
  }, []);

  // 서비스 및 위치 기준 필터링 & 거리순 정렬
  const hospital_list = useMemo(() => {
    return 전체_공공의료기관_상세목록
      .map((h) => ({
        ...h,
        거리: calculate_distance(user_location.lat, user_location.lng, h.위도, h.경도),
      }))
      .filter((h) => {
        const query = search_text.trim().toLowerCase();
        const match_search =
          !query ||
          h.기관명.toLowerCase().includes(query) ||
          h.시군구명.toLowerCase().includes(query) ||
          h.시도명.toLowerCase().includes(query) ||
          h.진료권명.toLowerCase().includes(query);

        if (!match_search) return false;
        if (selected_service === 'all') return true;

        const 운영_추정 = (code: string) => h.서비스_상세.some((s) => s.코드 === code && s.상태 === '운영');

        if (selected_service === 'emergency') return 운영_추정('emergency');
        if (selected_service === 'pediatric') return 운영_추정('pediatric');
        if (selected_service === 'delivery') return 운영_추정('delivery');
        if (selected_service === 'night') return 운영_추정('emergency');
        if (selected_service === 'inpatient') return 운영_추정('inpatient');

        return true;
      })
      .sort((a, b) => parseFloat(a.거리) - parseFloat(b.거리));
  }, [user_location, selected_service, search_text]);

  // 분만·응급실·야간 필터: 민간 병·의원 등 외부 기관 목록
  const [selected_extra_id, setSelected_extra_id] = useState<string | null>(null);
  const 외부_원본: 외부_기관[] =
    selected_service === 'delivery'
      ? 분만_외부기관
      : selected_service === 'emergency'
        ? 응급_외부기관
        : selected_service === 'night'
          ? 야간_외부기관
          : selected_service === 'pediatric'
            ? 달빛_외부기관
            : [];

  const 목록_명칭: Record<string, string> = {
    delivery: '분만 가능 의료기관',
    emergency: '응급의료기관',
    night: '야간·휴일 진료 기관',
    pediatric: '소아 진료 기관',
  };

  const 민간_목록 = useMemo(() => {
    const query = search_text.trim().toLowerCase();
    return 외부_원본
      .filter(
        (h) =>
          !query ||
          h.기관명.toLowerCase().includes(query) ||
          h.지역.toLowerCase().includes(query) ||
          h.주소.toLowerCase().includes(query)
      )
      .map((h) => ({
        h,
        거리: h.위도 !== null && h.경도 !== null ? parseFloat(calculate_distance(user_location.lat, user_location.lng, h.위도, h.경도)) : null,
      }));
  }, [user_location, selected_service, search_text]);

  // 공공병원 + 민간 기관 통합 거리순 목록
  type 표시_항목 =
    | { kind: '공공'; id: string; 거리: number; h: (typeof hospital_list)[number] }
    | { kind: '민간'; id: string; 거리: number | null; h: 외부_기관 };

  const 표시_목록: 표시_항목[] = useMemo(() => {
    const 공공: 표시_항목[] = hospital_list.map((h) => ({ kind: '공공', id: h.id, 거리: parseFloat(h.거리), h }));
    const 민간: 표시_항목[] = 민간_목록.map((m) => ({ kind: '민간', id: m.h.id, 거리: m.거리, h: m.h }));
    return [...공공, ...민간].sort((a, b) => (a.거리 ?? Infinity) - (b.거리 ?? Infinity));
  }, [hospital_list, 민간_목록]);

  const 보조_지점: 보조_지도_지점[] = useMemo(
    () =>
      민간_목록
        .filter((m) => m.h.위도 !== null && m.h.경도 !== null)
        .map((m) => ({
          id: m.h.id,
          기관명: m.h.기관명,
          종별: m.h.종류,
          위도: m.h.위도 as number,
          경도: m.h.경도 as number,
          좌표_정밀도: m.h.근사 ? '시군구' : '주소',
          설명: m.h.설명,
        })),
    [민간_목록]
  );

  const active_target = selected_extra_id ? selected_hospital : selected_hospital || hospital_list[0] || null;

  // 기관에 매칭되는 E-Gen 실시간 정보 조회 헬퍼 함수
  const get_hospital_egen_info = (name: string): 실시간_응급실_기관정보 | null => {
    const norm = 기관명_정규화(name);
    if (egen_realtime_data[norm]) return egen_realtime_data[norm];

    // 부분 매칭 시도
    for (const key of Object.keys(egen_realtime_data)) {
      if (norm.includes(key) || key.includes(norm)) {
        return egen_realtime_data[key];
      }
    }
    return null;
  };

  return (
    <div className="w-full h-[calc(100vh-4.5rem)] flex flex-col relative overflow-hidden bg-slate-100 dark:bg-[#0c0d10]">
      {/* ============================================================== */}
      {/* 1. 상단: 빠른 탐색 바 (Section 18) */}
      {/* ============================================================== */}
      <div className="p-3 sm:p-4 bg-white/95 dark:bg-[#15161b]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 z-20 space-y-2.5 shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div>
            <h2 className="text-base sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2 flex-wrap">
              <span>지금 필요한 공공의료기관 찾기</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                직선거리순
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 flex items-center gap-1">
                <Activity className="w-2.5 h-2.5" />
                <span>E-Gen 실시간 병상 연계</span>
              </span>
              <ISP_과제_뱃지 taskId="3.10" customLabel="과제 3.10 모자·응급 실시간 전원" />
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
              응급실·소아·분만 진료가 가능한 공공병원을 직선거리 및 E-Gen 실시간 병상 현황과 함께 안내합니다.
              <span className="ml-1 text-emerald-600 dark:text-emerald-400 font-semibold">(현재 기준: {current_location_label})</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* 모바일 화면 탭 전환 버튼 (지도 vs AI 질의응답) */}
            <div className="flex lg:hidden bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => set_mobile_active_tab('map')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                  mobile_active_tab === 'map'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500'
                }`}
              >
                <MapIcon className="w-3.5 h-3.5 text-emerald-500" />
                <span>안심 지도</span>
              </button>
              <button
                type="button"
                onClick={() => set_mobile_active_tab('ai')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                  mobile_active_tab === 'ai'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500'
                }`}
              >
                <Bot className="w-3.5 h-3.5 text-blue-500" />
                <span>AI 질의응답</span>
              </button>
            </div>

            {/* 현재 위치 사용 버튼 */}
            <button
              type="button"
              onClick={handle_get_location}
              disabled={is_locating}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer active:scale-95"
            >
              <LocateFixed className="w-3.5 h-3.5 text-blue-600" />
              <span>{is_locating ? '위치 확인 중...' : '내 위치 재검색'}</span>
            </button>
          </div>
        </div>

        {/* 검색 인풋 & 5대 빠른 서비스 선택 버튼 */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search_text}
              onChange={(e) => {
                setSearch_text(e.target.value);
                setSelected_hospital(null);
              }}
              placeholder="기관명, 지역명(예: 종로구, 영월)..."
              className="w-full pl-9 pr-8 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
            />
            {search_text && (
              <button
                type="button"
                onClick={() => setSearch_text('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
            {[
              { id: 'all', label: '전체' },
              { id: 'emergency', label: '🚨 응급실' },
              { id: 'pediatric', label: '👶 소아청소년과' },
              { id: 'delivery', label: '🤰 분만산부인과' },
              { id: 'night', label: '🌙 야간/휴일' },
              { id: 'inpatient', label: '🛏️ 일반/격리입원' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setSelected_service(item.id as any);
                  setSelected_hospital(null);
                  setSelected_extra_id(null);
                  if (sheet_state === 'min') set_sheet_state('half');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer active:scale-95 ${
                  selected_service === item.id
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. 메인 콘텐츠 영역: [좌측 지도] + [우측 AI 자연어 질의응답 (넓은 답변 영역)] */}
      {/* ============================================================== */}
      <div className="flex-1 w-full flex flex-col lg:flex-row relative overflow-hidden min-h-0">
        {/* 좌측: 안심 지도 (AI 확장 모드 시 숨김, 기본 상태에서는 45% 너비) */}
        {!is_ai_expanded && (
          <div
            className={`h-full relative transition-all duration-200 ${
              mobile_active_tab === 'map' ? 'flex-1' : 'hidden lg:block'
            } lg:w-[46%] xl:w-[44%] border-r border-slate-200 dark:border-slate-800 shrink-0`}
          >
            <DecisionLeafletMap
              hospitals={hospital_list}
              active_hospital={active_target}
              on_select_hospital={(h) => {
                setSelected_hospital(h);
                setSelected_extra_id(null);
                set_sheet_state('half');
              }}
              extra_points={보조_지점}
              active_extra_id={selected_extra_id}
              on_select_extra={(p) => {
                setSelected_extra_id(p.id);
                setSelected_hospital(null);
                set_sheet_state('half');
              }}
            />

            {/* 지도 좌상단 실시간 연동 뱃지 */}
            <div className="absolute top-3 left-3 z-[1000] pointer-events-none">
              <div className="px-2.5 py-1 bg-white/90 dark:bg-[#15161b]/90 backdrop-blur-md rounded-xl shadow-md border border-slate-200 dark:border-slate-800 flex items-center gap-1.5 text-[10px] text-slate-700 dark:text-slate-300 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>{egen_source_label}</span>
                {last_sync_time && <span className="text-slate-400 font-normal">({last_sync_time})</span>}
              </div>
            </div>
          </div>
        )}

        {/* 우측: 자연어 AI 질의응답 패널 (답변 영역 대폭 확대: 기본 54%~56%, 확장 시 100%) */}
        <div
          className={`h-full transition-all duration-200 ${
            mobile_active_tab === 'ai' || is_ai_expanded ? 'flex-1 w-full' : 'hidden lg:flex lg:w-[54%] xl:w-[56%]'
          } flex flex-col min-h-0`}
        >
          <국민안심_AI_질의응답_패널
            user_lat={user_location.lat}
            user_lng={user_location.lng}
            current_region_name={current_location_label}
            is_expanded={is_ai_expanded}
            on_toggle_expand={() => {
              set_is_ai_expanded((prev) => !prev);
              set_sheet_state('min');
            }}
            on_select_hospital_name={(h_name) => {
              const matched = hospital_list.find((h) => h.기관명.includes(h_name));
              if (matched) {
                setSelected_hospital(matched);
                setSelected_extra_id(null);
                set_sheet_state('half');
              }
            }}
          />
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. 하단 바텀시트: E-Gen 실시간 전체 정보 3열(한 줄에 3개) 그리드 */}
      {/* ============================================================== */}
      <div
        className={`bg-white dark:bg-[#15161b] rounded-t-3xl border-t border-slate-200 dark:border-slate-800 shadow-2xl transition-all duration-300 flex flex-col z-30 shrink-0 ${
          sheet_state === 'min'
            ? 'h-12 sm:h-14'
            : sheet_state === 'half'
            ? 'h-[36%] sm:h-[34%]'
            : 'h-[85%]'
        }`}
      >
        {/* 바텀시트 핸들 & 토글 */}
        <div
          onClick={() => {
            if (sheet_state === 'min') set_sheet_state('half');
            else if (sheet_state === 'half') set_sheet_state('full');
            else set_sheet_state('half');
          }}
          className="p-2 flex flex-col items-center justify-center cursor-pointer select-none border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition shrink-0"
        >
          <div className="w-10 h-1 bg-slate-300 dark:bg-slate-700 rounded-full mb-1" />
          <div className="flex items-center justify-between w-full px-4 text-xs">
            <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 flex-wrap">
              {외부_원본.length > 0 ? (
                <span>
                  내 주변 {목록_명칭[selected_service]} <strong>{표시_목록.length}</strong>개소
                  <span className="font-normal text-slate-500"> (공공 {hospital_list.length} · 민간 {민간_목록.length})</span>
                </span>
              ) : (
                <span>내 주변 공공의료기관 <strong>{hospital_list.length}</strong>개소</span>
              )}
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">(거리순 · 한 줄에 3개 정렬)</span>
            </span>
            <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
              {sheet_state === 'min' ? '목록 펼치기' : sheet_state === 'half' ? '전체 보기' : '축소'}
              {sheet_state === 'full' ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
            </span>
          </div>
        </div>

        {/* 바텀시트 스크롤 카드 목록: 3열 그리드 (한 줄에 3개) */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
          {/* E-Gen 실시간 데이터 안내 배너 */}
          <div className="p-2.5 rounded-xl bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 flex items-start gap-2 text-[11px] text-blue-900 dark:text-blue-200">
            <Activity className="w-4 h-4 shrink-0 text-blue-600 mt-0.5" />
            <p>
              하단 기관별 가용병상(응급·소아·음압·중환자실) 및 CT/MRI 장비 가동 상태는 <strong>국립중앙의료원 중앙응급의료센터 E-Gen 실시간 OpenAPI</strong>를 통해 연동된 모든 정보입니다.
              실시간 상태가 급변할 수 있으니 방문 전 유선 확인을 권장합니다.
            </p>
          </div>

          {표시_목록.length === 0 ? (
            <div className="py-12 px-4 text-center space-y-3">
              <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                선택하신 조건에 부합하는 의료기관이 없습니다.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelected_service('all');
                  setSearch_text('');
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer inline-flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>전체 의료기관 보기</span>
              </button>
            </div>
          ) : (
            /* ============================================================== */
            /* 핵심 요구사항 3: 한 줄에 3개 보여주는 3열 그리드 (grid-cols-1 md:grid-cols-2 lg:grid-cols-3) */
            /* ============================================================== */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {표시_목록.slice(0, sheet_state === 'full' ? 90 : 18).map((item) => {
                if (item.kind === '민간') {
                  const p = item.h;
                  const is_selected = selected_extra_id === item.id;
                  const live_egen = get_hospital_egen_info(p.기관명);

                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        setSelected_extra_id(item.id);
                        setSelected_hospital(null);
                      }}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-2.5 ${
                        is_selected
                          ? 'border-pink-500 bg-pink-50/40 dark:bg-pink-950/20 shadow-md ring-1 ring-pink-500/20'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-slate-300'
                      }`}
                    >
                      <div className="space-y-2">
                        {/* 헤더 & 거리 & 종별 */}
                        <div className="flex items-start justify-between gap-1">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs text-pink-600 dark:text-pink-400 font-extrabold flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                <span>{item.거리 === null ? '위치 미확인' : `직선 약 ${item.거리.toFixed(1)}km`}</span>
                              </span>
                              <span className="text-[10px] text-slate-400">{p.지역}</span>
                            </div>
                            <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mt-0.5 line-clamp-1">
                              {p.기관명}
                            </h4>
                          </div>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300 shrink-0 font-bold">
                            {p.종류}
                          </span>
                        </div>

                        {/* E-Gen 실시간 정보 패널 (민간 응급기관 연계) */}
                        <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-700/60 space-y-1.5 text-[11px]">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 font-medium">🚨 응급실 실시간</span>
                            {live_egen ? (
                              <span
                                className={`text-[9px] px-1.5 py-0.2 rounded font-extrabold ${
                                  live_egen.포화도_상태 === '여유'
                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                    : live_egen.포화도_상태 === '보통'
                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                                    : live_egen.포화도_상태 === '혼잡'
                                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                    : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                }`}
                              >
                                {live_egen.포화도_상태}
                              </span>
                            ) : (
                              <span className="text-[9px] text-slate-400">E-Gen 등록기관</span>
                            )}
                          </div>

                          {/* E-Gen에서 획득한 모든 병상 정보 */}
                          <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-600 dark:text-slate-300">
                            <div>
                              응급 가용: <strong>{live_egen ? `${live_egen.응급실_가용병상}석` : '유선 확인'}</strong>
                            </div>
                            <div>
                              소아 가용: <strong>{live_egen ? `${live_egen.소아_가용병상}석` : '-'}</strong>
                            </div>
                            <div>
                              음압 격리: <strong>{live_egen ? `${live_egen.음압격리_가용병상}석` : '-'}</strong>
                            </div>
                            <div>
                              중환자실(ICU): <strong>{live_egen ? `${live_egen.중환자실_가용병상}석` : '-'}</strong>
                            </div>
                          </div>

                          {/* 장비 가동 상태 */}
                          {live_egen && (
                            <div className="pt-1 border-t border-slate-200 dark:border-slate-700/60 flex items-center gap-1.5 flex-wrap text-[9px]">
                              <span className={`px-1 py-0.2 rounded font-bold ${live_egen.장비가동상태.CT ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-500'}`}>
                                CT {live_egen.장비가동상태.CT ? '가동' : 'OFF'}
                              </span>
                              <span className={`px-1 py-0.2 rounded font-bold ${live_egen.장비가동상태.MRI ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-500'}`}>
                                MRI {live_egen.장비가동상태.MRI ? '가동' : 'OFF'}
                              </span>
                              <span className={`px-1 py-0.2 rounded font-bold ${live_egen.장비가동상태.인공호흡기 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-500'}`}>
                                인공호흡기 {live_egen.장비가동상태.인공호흡기 ? 'ON' : 'OFF'}
                              </span>
                            </div>
                          )}
                        </div>

                        <p className="text-[11px] text-slate-400 line-clamp-1">{p.주소}</p>
                      </div>

                      {/* 하단 전화 & 길찾기 액션 */}
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <a
                          href={`tel:${p.응급실전화 || p.전화}`}
                          onClick={(e) => e.stopPropagation()}
                          className="py-1.5 px-2 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs text-center transition flex items-center justify-center gap-1 shadow-xs"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>전화 연결</span>
                        </a>
                        <a
                          href={
                            !p.근사 && p.위도 !== null && p.경도 !== null
                              ? `https://map.kakao.com/link/to/${encodeURIComponent(p.기관명)},${p.위도},${p.경도}`
                              : `https://map.kakao.com/link/search/${encodeURIComponent(`${p.기관명} ${p.지역}`)}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="py-1.5 px-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold text-xs text-center transition flex items-center justify-center gap-1"
                        >
                          <Navigation className="w-3.5 h-3.5 text-blue-600" />
                          <span>길찾기</span>
                        </a>
                      </div>
                    </div>
                  );
                }

                // ==============================================================
                // 공공병원 카드 (E-Gen 실시간 모든 정보 탑재)
                // ==============================================================
                const h = item.h;
                const is_selected = !selected_extra_id && active_target?.id === h.id;
                const live_egen = get_hospital_egen_info(h.기관명);

                // E-Gen 데이터 우선, 없으면 기관 의료자원 데이터
                const available_emergency_beds = live_egen
                  ? live_egen.응급실_가용병상
                  : h.의료자원.응급실.가용병상;
                const total_emergency_beds = live_egen
                  ? live_egen.응급실_총병상
                  : 20;
                const pediatric_beds = live_egen
                  ? live_egen.소아_가용병상
                  : h.의료자원.응급실.소아가용병상;
                const negative_pressure_beds = live_egen ? live_egen.음압격리_가용병상 : 1;
                const icu_beds = live_egen
                  ? live_egen.중환자실_가용병상
                  : h.의료자원.중환자실.가용병상;
                const saturation_status = live_egen
                  ? live_egen.포화도_상태
                  : (h.의료자원.응급실.상태 as any) || '보통';

                const ct_running = live_egen
                  ? live_egen.장비가동상태.CT
                  : h.의료자원.주요장비.CT;
                const mri_running = live_egen
                  ? live_egen.장비가동상태.MRI
                  : h.의료자원.주요장비.MRI;
                const venti_running = live_egen
                  ? live_egen.장비가동상태.인공호흡기
                  : h.의료자원.주요장비.인공호흡기;
                const incubator_running = live_egen
                  ? live_egen.장비가동상태.인큐베이터
                  : h.의료자원.주요장비.인큐베이터;

                return (
                  <div
                    key={h.id}
                    onClick={() => {
                      setSelected_hospital(h);
                      setSelected_extra_id(null);
                    }}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-2.5 ${
                      is_selected
                        ? 'border-emerald-600 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-md ring-1 ring-emerald-500/20'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-slate-300'
                    }`}
                  >
                    <div className="space-y-2">
                      {/* 헤더 & 거리 & 기관유형 */}
                      <div className="flex items-start justify-between gap-1">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-extrabold flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              <span>직선 약 {h.거리}km</span>
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {h.시도명} {h.시군구명}
                            </span>
                          </div>
                          <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mt-0.5 line-clamp-1">
                            {h.기관명}
                          </h4>
                        </div>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 shrink-0 font-bold">
                          {h.기관유형}
                        </span>
                      </div>

                      {/* ============================================================== */}
                      {/* 핵심 요구사항 2: E-Gen에서 획득한 모든 실시간 정보 표시 */}
                      {/* ============================================================== */}
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/60 space-y-2">
                        {/* 응급실 가용현황 & 포화도 뱃지 */}
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1">
                            <Activity className="w-3.5 h-3.5 text-emerald-500" />
                            <span>E-Gen 응급실 가용병상</span>
                          </span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-md font-extrabold ${
                              saturation_status === '여유'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : saturation_status === '보통'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                                : saturation_status === '혼잡'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            }`}
                          >
                            포화도: {saturation_status}
                          </span>
                        </div>

                        {/* 4대 세부 병상 현황 (응급실, 소아, 음압격리, 중환자실) */}
                        <div className="grid grid-cols-2 gap-1.5 p-1.5 rounded-lg bg-white dark:bg-slate-900/60 text-[10px] border border-slate-100 dark:border-slate-800">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">응급실 가용:</span>
                            <strong className="text-emerald-600 dark:text-emerald-400 font-bold">
                              {available_emergency_beds} / {total_emergency_beds}석
                            </strong>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">소아 가용:</span>
                            <strong className="text-blue-600 dark:text-blue-400 font-bold">
                              {pediatric_beds}석
                            </strong>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">음압 격리:</span>
                            <strong className="text-indigo-600 dark:text-indigo-400 font-bold">
                              {negative_pressure_beds}석
                            </strong>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">중환자실(ICU):</span>
                            <strong className="text-amber-600 dark:text-amber-400 font-bold">
                              {icu_beds}석
                            </strong>
                          </div>
                        </div>

                        {/* 4대 핵심 장비 가동 상태 (CT, MRI, 인공호흡기, 인큐베이터) */}
                        <div className="flex items-center justify-between text-[9px] pt-1 border-t border-slate-200 dark:border-slate-700/60">
                          <span className="text-slate-400 font-semibold">장비 가동:</span>
                          <div className="flex items-center gap-1 flex-wrap">
                            <span className={`px-1.5 py-0.5 rounded font-bold ${ct_running ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-200 text-slate-500'}`}>
                              CT {ct_running ? 'ON' : 'OFF'}
                            </span>
                            <span className={`px-1.5 py-0.5 rounded font-bold ${mri_running ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-200 text-slate-500'}`}>
                              MRI {mri_running ? 'ON' : 'OFF'}
                            </span>
                            <span className={`px-1.5 py-0.5 rounded font-bold ${venti_running ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-200 text-slate-500'}`}>
                              호흡기 {venti_running ? 'ON' : 'OFF'}
                            </span>
                            <span className={`px-1.5 py-0.5 rounded font-bold ${incubator_running ? 'bg-pink-100 text-pink-800 dark:bg-pink-950 dark:text-pink-300' : 'bg-slate-200 text-slate-500'}`}>
                              인큐 {incubator_running ? 'ON' : 'OFF'}
                            </span>
                          </div>
                        </div>

                        {/* 총 병상 및 주요 서비스 태그 */}
                        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                          <span>허가 총 병상: <strong>{h.의료자원.병상.총병상}병상</strong></span>
                          <span>{h.주요_의료서비스.slice(0, 2).map((s) => `#${s}`).join(' ')}</span>
                        </div>
                      </div>
                    </div>

                    {/* 하단 전화 & 길찾기 버튼 */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <a
                        href={`tel:${h.전화번호}`}
                        onClick={(e) => e.stopPropagation()}
                        className="py-1.5 px-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs text-center transition flex items-center justify-center gap-1 shadow-xs"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>전화 걸기 ({h.전화번호})</span>
                      </a>
                      <a
                        href={`https://map.kakao.com/link/to/${encodeURIComponent(h.기관명)},${h.위도},${h.경도}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="py-1.5 px-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold text-xs text-center transition flex items-center justify-center gap-1"
                      >
                        <Navigation className="w-3.5 h-3.5 text-blue-600" />
                        <span>길찾기</span>
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
