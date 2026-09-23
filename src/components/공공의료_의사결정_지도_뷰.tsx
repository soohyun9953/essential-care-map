'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import {
  Search,
  Filter,
  MapPin,
  Building2,
  Phone,
  Navigation,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  Layers,
  ArrowUpDown,
  Sparkles,
  ExternalLink,
  ChevronUp,
  X,
  Compass,
} from 'lucide-react';
import {
  공공의료기관_상세_프로필,
  의료서비스_코드,
  검색_필터_옵션,
  의료서비스_검색_엔진,
  전체_공공의료기관_상세목록,
  주요_9대_퀵필터_목록,
} from '@/lib/의료서비스_검색_엔진';
import { 의료기관_상세_정보_모달 } from './의료기관_상세_정보_모달';

// React-Leaflet 동적 로딩 (SSR 오류 방지)
const DecisionLeafletMap = dynamic(
  () => import('./공공의료_의사결정_지도_내부').then((mod) => mod.공공의료_의사결정_지도_내부),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full min-h-[500px] bg-slate-100 dark:bg-slate-900 rounded-3xl flex flex-col items-center justify-center border border-slate-200 dark:border-slate-800">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
          공공의료 의사결정 지도 렌더링 중...
        </p>
      </div>
    ),
  }
);

interface 공공의료_의사결정_지도_뷰_속성 {
  initial_keyword?: string;
  initial_services?: 의료서비스_코드[];
}

export const 공공의료_의사결정_지도_뷰: React.FC<공공의료_의사결정_지도_뷰_속성> = ({
  initial_keyword = '',
  initial_services = [],
}) => {
  // 필터 상태
  const [keyword, setKeyword] = useState(initial_keyword);
  const [selected_services, setSelected_services] = useState<의료서비스_코드[]>(initial_services);
  const [selected_sido, setSelected_sido] = useState<string>('전체');
  const [selected_type, setSelected_type] = useState<'전체' | '권역책임' | '지역책임' | '특수공공'>('전체');
  const [sort_by, setSort_by] = useState<'추천순' | '거리순' | '병상순' | '이름순'>('추천순');

  // 선택된 활성 의료기관 (강조 및 상세 모달)
  const [active_hospital, setActive_hospital] = useState<공공의료기관_상세_프로필 | null>(
    전체_공공의료기관_상세목록[0] || null
  );
  const [detail_modal_hospital, set_detail_modal_hospital] = useState<공공의료기관_상세_프로필 | null>(null);

  // 모바일 Bottom Sheet 상태: 'min' | 'half' | 'full'
  const [bottom_sheet_state, set_bottom_sheet_state] = useState<'min' | 'half' | 'full'>('half');

  // 카드 목록 스크롤 컨테이너 참조
  const list_container_ref = useRef<HTMLDivElement>(null);

  // 검색 옵션 번들
  const search_options: 검색_필터_옵션 = useMemo(() => {
    return {
      키워드: keyword,
      시도명: selected_sido,
      선택된_서비스: selected_services,
      기관유형: selected_type,
      정렬: sort_by,
      기준_위도: 37.5665, // 서울 시청 기본 기준
      기준_경도: 126.978,
    };
  }, [keyword, selected_sido, selected_services, selected_type, sort_by]);

  // 검색 결과 목록
  const search_results = useMemo(() => {
    return 의료서비스_검색_엔진.search_hospitals(search_options);
  }, [search_options]);

  // 서비스 태그 토글 핸들러
  const toggle_service_tag = (code: 의료서비스_코드) => {
    setSelected_services((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  // 지도 마커 클릭 시 호출 (목록 카드 강조 & 자동 스크롤)
  const handle_marker_click = (hospital: 공공의료기관_상세_프로필) => {
    setActive_hospital(hospital);
    // 모바일에서는 카드가 보이도록 half로 확장
    set_bottom_sheet_state('half');

    // 좌측 목록에서 해당 카드로 부드럽게 스크롤
    const el = document.getElementById(`hospital-card-${hospital.id}`);
    if (el && list_container_ref.current) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  // 목록 카드 클릭 시 호출 (지도 포커스)
  const handle_card_click = (hospital: 공공의료기관_상세_프로필) => {
    setActive_hospital(hospital);
  };

  return (
    <div className="w-full h-[calc(100vh-4rem)] flex flex-col lg:flex-row overflow-hidden bg-slate-50 dark:bg-[#0c0d10] relative">
      {/* ============================================================== */}
      {/* 좌측 35% 패널 (Desktop): 필터 + 결과 목록 카드 */}
      {/* ============================================================== */}
      <div
        className={`w-full lg:w-[38%] xl:w-[35%] h-full flex flex-col bg-white dark:bg-[#12141a] border-r border-slate-200 dark:border-slate-800 z-10 shadow-sm ${
          // 모바일에서는 화면 하단 플로팅/바텀시트로 동작
          'hidden lg:flex'
        }`}
      >
        {/* 상단 검색 & 필터 헤더 */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800/80 space-y-3 shrink-0 bg-white/95 dark:bg-[#12141a]/95 backdrop-blur-md">
          {/* 검색창 */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="기관명, 지역(시군구) 검색..."
              className="w-full pl-9 pr-8 py-2 rounded-xl text-xs bg-slate-100 dark:bg-slate-900 border border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-slate-950 focus:outline-none transition text-slate-800 dark:text-slate-200 font-medium"
            />
            {keyword && (
              <button
                onClick={() => setKeyword('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* 9대 서비스 퀵 필터 칩 */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {주요_9대_퀵필터_목록.map((f) => {
              const is_active = selected_services.includes(f.id);
              return (
                <button
                  key={f.id}
                  onClick={() => toggle_service_tag(f.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1 ${
                    is_active
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <span>{f.라벨}</span>
                </button>
              );
            })}
          </div>

          {/* 지역 & 유형 & 정렬 드롭다운 툴바 */}
          <div className="flex items-center justify-between gap-2 pt-1 text-xs">
            <div className="flex items-center gap-1.5 flex-wrap">
              {/* 시도 선택 */}
              <select
                value={selected_sido}
                onChange={(e) => setSelected_sido(e.target.value)}
                className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border-none text-slate-700 dark:text-slate-300 font-semibold focus:ring-1 focus:ring-blue-500"
              >
                <option value="전체">전국 시·도</option>
                {['서울특별시', '부산광역시', '대구광역시', '인천광역시', '광주광역시', '대전광역시', '울산광역시', '세종특별자치시', '경기도', '강원특별자치도', '충청북도', '충청남도', '전북특별자치도', '전라남도', '경상북도', '경상남도', '제주특별자치도'].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>

              {/* 기관 유형 */}
              <select
                value={selected_type}
                onChange={(e) => setSelected_type(e.target.value as any)}
                className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border-none text-slate-700 dark:text-slate-300 font-semibold focus:ring-1 focus:ring-blue-500"
              >
                <option value="전체">기관유형 전체</option>
                <option value="권역책임">권역책임병원</option>
                <option value="지역책임">지방의료원(지역책임)</option>
                <option value="특수공공">특수공공(노인/정신/재활)</option>
              </select>
            </div>

            {/* 결과 카운트 & 정렬 */}
            <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
              <span>총 <strong>{search_results.length}</strong>개소</span>
              <select
                value={sort_by}
                onChange={(e) => setSort_by(e.target.value as any)}
                className="bg-transparent border-none text-slate-700 dark:text-slate-300 font-bold focus:outline-none"
              >
                <option value="추천순">추천순</option>
                <option value="거리순">거리순</option>
                <option value="병상순">병상수순</option>
                <option value="이름순">가나다순</option>
              </select>
            </div>
          </div>
        </div>

        {/* 결과 카드 목록 (스크롤 영역) */}
        <div ref={list_container_ref} className="flex-1 overflow-y-auto p-3 space-y-2.5">
          {search_results.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <Building2 className="w-10 h-10 mb-2 stroke-1 text-slate-300" />
              <p className="text-sm font-semibold">선택하신 조건에 일치하는 기관이 없습니다.</p>
              <p className="text-xs text-slate-400 mt-1">필터를 초기화하거나 다른 검색어를 입력해 보세요.</p>
            </div>
          ) : (
            search_results.map((h) => {
              const is_active = active_hospital?.id === h.id;
              return (
                <div
                  key={h.id}
                  id={`hospital-card-${h.id}`}
                  onClick={() => handle_card_click(h)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2.5 ${
                    is_active
                      ? 'border-blue-600 dark:border-blue-500 bg-blue-50/40 dark:bg-blue-950/20 shadow-md ring-2 ring-blue-500/20'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs'
                  }`}
                >
                  {/* 카드 헤더: 기관명 & 유형 */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                          {h.기관유형}
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500">
                          {h.시도명} {h.시군구명}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                        {h.기관명}
                      </h4>
                    </div>

                    {/* 운영 상태 뱃지 */}
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 shrink-0">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{h.운영_상태}</span>
                    </span>
                  </div>

                  {/* 주요 서비스 태그 */}
                  <div className="flex flex-wrap gap-1">
                    {h.주요_의료서비스.slice(0, 4).map((s) => (
                      <span
                        key={s}
                        className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                      >
                        #{s}
                      </span>
                    ))}
                    {h.주요_의료서비스.length > 4 && (
                      <span className="text-[10px] text-slate-400 py-0.5">
                        +{h.주요_의료서비스.length - 4}
                      </span>
                    )}
                  </div>

                  {/* 핵심 자원 요약 & 거리 & 데이터 기준시점 */}
                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                    <span>
                      병상 <strong>{h.의료자원.병상.총병상}</strong>석 (가용 {h.의료자원.병상.가용병상}석)
                    </span>
                    <span className="text-[10px] text-slate-400">
                      기준: {h.데이터_신뢰성.기준시점}
                    </span>
                  </div>

                  {/* 하단 3대 액션 버튼: [상세보기] [길찾기] [전화] */}
                  <div className="grid grid-cols-3 gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        set_detail_modal_hospital(h);
                      }}
                      className="py-1.5 px-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs text-center transition shadow-xs"
                    >
                      상세보기
                    </button>
                    <a
                      href={`https://map.kakao.com/link/search/${encodeURIComponent(h.기관명)}`}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="py-1.5 px-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs text-center transition flex items-center justify-center gap-1"
                    >
                      <Navigation className="w-3 h-3 text-emerald-600" />
                      <span>길찾기</span>
                    </a>
                    <a
                      href={`tel:${h.전화번호}`}
                      onClick={(e) => e.stopPropagation()}
                      className="py-1.5 px-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs text-center transition flex items-center justify-center gap-1"
                    >
                      <Phone className="w-3 h-3 text-blue-600" />
                      <span>전화</span>
                    </a>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ============================================================== */}
      {/* 우측 65% 패널 (Desktop): Leaflet 인터랙티브 지도 */}
      {/* ============================================================== */}
      <div className="flex-1 h-full relative overflow-hidden">
        {/* 모바일 상단 미니 검색 칩 */}
        <div className="lg:hidden absolute top-3 left-3 right-3 z-[400] flex items-center gap-2 bg-white/95 dark:bg-slate-900/95 p-2 rounded-2xl shadow-md border border-slate-200 dark:border-slate-800">
          <Search className="w-4 h-4 text-slate-400 ml-1" />
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="지역, 의료기관 검색..."
            className="w-full text-xs bg-transparent focus:outline-none text-slate-800 dark:text-slate-200"
          />
        </div>

        <DecisionLeafletMap
          hospitals={search_results}
          active_hospital={active_hospital}
          on_select_marker={handle_marker_click}
        />
      </div>

      {/* ============================================================== */}
      {/* 모바일 전용 Bottom Sheet UI */}
      {/* ============================================================== */}
      <div
        className={`lg:hidden fixed bottom-0 left-0 right-0 z-[500] bg-white dark:bg-[#12141a] rounded-t-3xl shadow-2xl border-t border-slate-200 dark:border-slate-800 transition-all duration-300 flex flex-col ${
          bottom_sheet_state === 'min'
            ? 'h-24'
            : bottom_sheet_state === 'half'
            ? 'h-[50vh]'
            : 'h-[85vh]'
        }`}
      >
        {/* 바텀시트 핸들바 */}
        <div
          onClick={() => {
            if (bottom_sheet_state === 'min') set_bottom_sheet_state('half');
            else if (bottom_sheet_state === 'half') set_bottom_sheet_state('full');
            else set_bottom_sheet_state('min');
          }}
          className="w-full py-2.5 flex flex-col items-center justify-center cursor-pointer shrink-0"
        >
          <div className="w-12 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
          <div className="flex items-center justify-between w-full px-5 pt-1.5 text-xs text-slate-500">
            <span className="font-bold text-slate-800 dark:text-slate-200">
              검색결과 {search_results.length}개소
            </span>
            <span className="text-[11px] text-blue-600 font-semibold flex items-center">
              {bottom_sheet_state === 'full' ? '접기' : '전체보기'}
              {bottom_sheet_state === 'full' ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
            </span>
          </div>
        </div>

        {/* 바텀시트 목록 스크롤 */}
        <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-2">
          {search_results.slice(0, bottom_sheet_state === 'min' ? 1 : 50).map((h) => (
            <div
              key={`m-${h.id}`}
              onClick={() => handle_card_click(h)}
              className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-900 dark:text-white">{h.기관명}</span>
                <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                  {h.운영_상태}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>{h.시도명} {h.시군구명}</span>
                <span>병상 {h.의료자원.병상.총병상}석</span>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    set_detail_modal_hospital(h);
                  }}
                  className="py-1 px-2 rounded-lg bg-blue-600 text-white font-bold text-xs text-center"
                >
                  상세보기
                </button>
                <a
                  href={`tel:${h.전화번호}`}
                  className="py-1 px-2 rounded-lg bg-slate-100 text-slate-800 font-bold text-xs text-center flex items-center justify-center gap-1"
                >
                  <Phone className="w-3 h-3 text-blue-600" />
                  전화
                </a>
                <a
                  href={`https://map.kakao.com/link/search/${encodeURIComponent(h.기관명)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="py-1 px-2 rounded-lg bg-slate-100 text-slate-800 font-bold text-xs text-center flex items-center justify-center gap-1"
                >
                  <Navigation className="w-3 h-3 text-emerald-600" />
                  길찾기
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ============================================================== */}
      {/* 5개 탭 기관 상세 정보 모달 */}
      {/* ============================================================== */}
      <의료기관_상세_정보_모달
        hospital={detail_modal_hospital}
        is_open={!!detail_modal_hospital}
        on_close={() => set_detail_modal_hospital(null)}
        on_open_directions={(h) => {
          setActive_hospital(h);
          set_detail_modal_hospital(null);
        }}
      />
    </div>
  );
};
