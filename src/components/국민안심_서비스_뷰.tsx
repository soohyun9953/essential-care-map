'use client';

// Essential Care Map - 국민안심 서비스 뷰 (Mobile-First)
// Section 18 (국민안심 UX) & Section 19 (모바일 3단계 바텀시트) 표준 구현
// 정책 용어 전면 배제, "지금 필요한 공공의료기관을 즉시 찾는다"에 집중

import React, { useState, useMemo } from 'react';
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
} from 'lucide-react';
import {
  전체_공공의료기관_상세목록,
  공공의료기관_상세_프로필,
} from '@/lib/의료서비스_검색_엔진';

// Leaflet 지도 동적 로드 (SSR 오류 방지)
const DecisionLeafletMap = dynamic(
  () => import('./공공의료_의사결정_지도_내부').then((mod) => mod.공공의료_의사결정_지도_내부),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full min-h-[300px] bg-slate-100 dark:bg-slate-900 rounded-3xl flex items-center justify-center text-xs text-slate-500 font-semibold">
        안심 지도 로딩 중...
      </div>
    ),
  }
);

export const 국민안심_서비스_뷰: React.FC = () => {
  // 5대 필수 서비스 선택기 (Section 18: [전체] [응급] [소아] [분만] [야간] [입원])
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

  // 모바일 바텀시트 상태: 'min' | 'half' | 'full'
  const [sheet_state, set_sheet_state] = useState<'min' | 'half' | 'full'>('half');

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

  // 거리 계산 (Haversine formula)
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

        // 서비스 운영 여부는 추정값이므로 '운영(추정)'인 기관만 포함하고, '확인필요'는 제외
        const 운영_추정 = (code: string) => h.서비스_상세.some((s) => s.코드 === code && s.상태 === '운영');

        if (selected_service === 'emergency') return 운영_추정('emergency');
        if (selected_service === 'pediatric') return 운영_추정('pediatric');
        if (selected_service === 'delivery') return 운영_추정('delivery');
        // 야간·휴일 진료는 24시간 응급실 운영(추정) 기관 기준
        if (selected_service === 'night') return 운영_추정('emergency');
        if (selected_service === 'inpatient') return 운영_추정('inpatient');

        return true;
      })
      .sort((a, b) => parseFloat(a.거리) - parseFloat(b.거리));
  }, [user_location, selected_service, search_text]);

  const active_target = selected_hospital || hospital_list[0] || null;

  return (
    <div className="w-full h-[calc(100vh-4.5rem)] flex flex-col relative overflow-hidden bg-slate-100 dark:bg-[#0c0d10]">
      {/* ============================================================== */}
      {/* 1. 상단: 국민 친화적 빠른 탐색 바 (Section 18) */}
      {/* ============================================================== */}
      <div className="p-4 bg-white/95 dark:bg-[#15161b]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 z-20 space-y-3 shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span>지금 필요한 공공의료기관 찾기</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                직선거리순
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              응급실·소아·분만 진료가 가능할 것으로 추정되는 가까운 공공병원을 직선거리 기준으로 안내합니다. (기준: {user_location.lat === 37.5665 ? '서울시청 중심' : '현재 확인된 사용자 위치'})
            </p>
          </div>

          {/* 현재 위치 사용 버튼 */}
          <button
            type="button"
            onClick={handle_get_location}
            disabled={is_locating}
            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 text-xs font-bold transition flex items-center gap-1.5 shrink-0 self-start sm:self-center cursor-pointer active:scale-95"
          >
            <LocateFixed className="w-3.5 h-3.5 text-blue-600" />
            <span>{is_locating ? '위치 확인 중...' : '현재 위치 기준 재검색'}</span>
          </button>
        </div>

        {/* 검색 인풋 & 5대 빠른 서비스 선택 버튼 */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {/* 빠른 검색창 */}
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

          {/* 5대 빠른 서비스 선택 버튼 (Section 18: [전체] [응급] [소아] [분만] [야간] [입원]) */}
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
                  if (sheet_state === 'min') {
                    set_sheet_state('half');
                  }
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
      {/* 2. 지도 영역 (Desktop & Mobile) */}
      {/* ============================================================== */}
      <div className="flex-1 w-full relative">
        <DecisionLeafletMap
          hospitals={hospital_list}
          active_hospital={active_target}
          on_select_hospital={(h) => {
            setSelected_hospital(h);
            set_sheet_state('half');
          }}
        />
      </div>

      {/* ============================================================== */}
      {/* 3. Section 19 3단계 모바일/데스크톱 바텀시트 */}
      {/* ============================================================== */}
      <div
        className={`bg-white dark:bg-[#15161b] rounded-t-3xl border-t border-slate-200 dark:border-slate-800 shadow-xl transition-all duration-300 flex flex-col z-30 ${
          sheet_state === 'min'
            ? 'h-16'
            : sheet_state === 'half'
            ? 'h-[48%] sm:h-[42%]'
            : 'h-[85%]'
        }`}
      >
        {/* 바텀시트 드래그 핸들 & 토글 */}
        <div
          onClick={() => {
            if (sheet_state === 'min') set_sheet_state('half');
            else if (sheet_state === 'half') set_sheet_state('full');
            else set_sheet_state('half');
          }}
          className="p-2.5 flex flex-col items-center justify-center cursor-pointer select-none border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition"
        >
          <div className="w-10 h-1 bg-slate-300 dark:bg-slate-700 rounded-full mb-1" />
          <div className="flex items-center justify-between w-full px-4 text-xs">
            <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <span>내 주변 공공의료기관 <strong>{hospital_list.length}</strong>개소</span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-normal">(거리순)</span>
            </span>
            <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
              {sheet_state === 'min' ? '목록 펼치기' : sheet_state === 'half' ? '전체 보기' : '축소'}
              {sheet_state === 'full' ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
            </span>
          </div>
        </div>

        {/* 바텀시트 스크롤 카드 목록 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* 병상·진료 가능 여부는 실시간 정보가 아님을 안내 (공개 화면 안전 문구) */}
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-start gap-2 text-[11px] text-amber-800 dark:text-amber-300">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <p>
              병상 수는 <strong>실시간 현황이 아닌 기준 데이터</strong>입니다. 분만은 <strong>건강보험심사평가원 분만가능 의료기관 목록</strong>(2025.1~2026.4 청구 실적, 공공누리 제1유형)으로, 응급실·소아 등은 <strong>기관 유형·규모로 추정</strong>해 표시합니다. 방문 전 반드시 전화로 진료 가능 여부를 확인하세요.
              응급 상황에서는 <strong>119</strong>에 연락하세요.
            </p>
          </div>
          {hospital_list.length === 0 ? (
            <div className="py-12 px-4 text-center space-y-3">
              <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                선택하신 조건에 부합하는 공공의료기관이 없습니다.
              </p>
              <p className="text-xs text-slate-500">
                검색어 또는 필터 조건을 변경해 보세요.
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
                <span>전체 공공의료기관 보기</span>
              </button>
            </div>
          ) : (
            hospital_list.slice(0, sheet_state === 'full' ? 50 : 15).map((h) => {
              const is_selected = active_target?.id === h.id;
              return (
                <div
                  key={h.id}
                  onClick={() => setSelected_hospital(h)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2.5 ${
                    is_selected
                      ? 'border-emerald-600 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-sm ring-1 ring-emerald-500/20'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
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
                      <h4 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                        {h.기관명}
                      </h4>
                    </div>

                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800">
                    <span>
                      총 병상: <strong className="text-slate-900 dark:text-white">{h.의료자원.병상.총병상}석</strong>
                    </span>
                    <span className="text-[11px]">
                      {h.주요_의료서비스.slice(0, 3).map((s) => `#${s}`).join(' ')}
                    </span>
                  </div>

                  {/* Section 18 표준 버튼: [전화] [길찾기] */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <a
                      href={`tel:${h.전화번호}`}
                      onClick={(e) => e.stopPropagation()}
                      className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs text-center transition flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>전화 걸기 ({h.전화번호})</span>
                    </a>

                    <a
                      href={`https://map.kakao.com/link/to/${encodeURIComponent(h.기관명)},${h.위도},${h.경도}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold text-xs text-center transition flex items-center justify-center gap-1.5"
                    >
                      <Navigation className="w-3.5 h-3.5 text-blue-600" />
                      <span>길찾기</span>
                    </a>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
