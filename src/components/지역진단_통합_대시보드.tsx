'use client';

// Essential Care Map - 지역진단 통합 대시보드
// Section 6, 7, 8, 9, 10 표준 구현 (35:65 진단지도, 7대 Layer, 6단계 지역 상세정보 및 정책 연계 체인)

import React, { useState, useMemo } from 'react';
import {
  Activity,
  AlertTriangle,
  ShieldAlert,
  Baby,
  Users,
  Bed,
  ArrowRight,
  TrendingUp,
  FileText,
  Search,
  CheckCircle2,
  Building2,
  Sparkles,
  MapPin,
  ExternalLink,
  ChevronRight,
  Filter,
  Info,
} from 'lucide-react';

import {
  필수의료_진단_결과,
  지도_시각화_모드,
  지역_구분_단위,
} from '@/lib/필수의료_타입';
import { 취약도_등급_정보 } from '@/lib/필수의료_엔진';
import { format_number_comma } from '@/lib/유틸리티';
import { 지역_의료자원_집계 } from '@/lib/지역_의료자원_집계';
import { 지도_래퍼 } from './지도_래퍼';

interface 지역진단_통합_대시보드_속성 {
  diagnosed_list: 필수의료_진단_결과[];
  selected_region: 필수의료_진단_결과 | null;
  on_select_region: (region: 필수의료_진단_결과) => void;
  on_navigate_policy: (feature: 'compare' | 'forecast' | 'policy_ai' | 'report') => void;
}

export const 지역진단_통합_대시보드: React.FC<지역진단_통합_대시보드_속성> = ({
  diagnosed_list,
  selected_region,
  on_select_region,
  on_navigate_policy,
}) => {
  // 지도 시각화 모드 (기본: 종합취약도)
  const [view_mode, set_view_mode] = useState<지도_시각화_모드>('종합취약도');
  const [region_unit, set_region_unit] = useState<지역_구분_단위>('시군구');

  // 좌측 목록 필터 상태
  const [search_query, set_search_query] = useState('');
  const [filter_grade, set_filter_grade] = useState<string>('전체');
  const [filter_sido, set_filter_sido] = useState<string>('전체');

  // Section 10: '왜?' 취약요인 클릭 시 상세 분석 팝오버 상태
  const [selected_factor, setSelected_factor] = useState<'응급' | '분만' | '소아' | null>(null);

  // Section 20: KPI 산출 기준 ⓘ 팝오버 상태
  const [active_kpi_tooltip, setActive_kpi_tooltip] = useState<string | null>(null);



  // 시도 목록 추출
  const sido_list = useMemo(() => {
    const set = new Set(diagnosed_list.map((d) => d.시도명));
    return ['전체', ...Array.from(set)];
  }, [diagnosed_list]);

  // 필터링된 시군구 목록
  const filtered_regions = useMemo(() => {
    return diagnosed_list.filter((item) => {
      const match_name =
        item.시군구명.includes(search_query) || item.시도명.includes(search_query);
      const match_grade =
        filter_grade === '전체' || item.종합_취약도_등급 === filter_grade;
      const match_sido =
        filter_sido === '전체' || item.시도명 === filter_sido;
      return match_name && match_grade && match_sido;
    });
  }, [diagnosed_list, search_query, filter_grade, filter_sido]);

  // 선택 지역 기준 유사 지자체 (동일 취약도 등급 & 인구수 유사 지자체 3곳)
  const similar_regions = useMemo(() => {
    if (!selected_region) return [];
    return diagnosed_list
      .filter(
        (r) =>
          r.종합_취약도_등급 === selected_region.종합_취약도_등급 &&
          r.시군구코드 !== selected_region.시군구코드
      )
      .sort(
        (a, b) =>
          Math.abs(a.인구수 - selected_region.인구수) -
          Math.abs(b.인구수 - selected_region.인구수)
      )
      .slice(0, 3);
  }, [diagnosed_list, selected_region]);

  const active_region = selected_region || diagnosed_list[0] || null;
  const region_resources = useMemo(
    () => (active_region ? 지역_의료자원_집계(active_region.시도명, active_region.시군구명, active_region.시군구코드) : null),
    [active_region]
  );

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* ============================================================== */}
      {/* 0. Journey 진행 배너 (현재: 01 지역 진단)                          */}
      {/* ============================================================== */}
      <div className="bg-white dark:bg-[#15161b] rounded-2xl p-4 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* 좌측: 현재 단계 표시 */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-7 h-7 rounded-full bg-blue-700 text-white flex items-center justify-center text-xs font-black shrink-0">
              01
            </div>
            <div>
              <div className="text-xs font-black text-blue-700 dark:text-blue-400">지역 진단 (현재 단계)</div>
              <div className="text-[10px] text-slate-500 leading-tight">필수의료 취약도 분석 및 GIS 시각화</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-300 shrink-0 hidden sm:block" />
          <div className="hidden sm:flex items-center gap-1.5 text-slate-400">
            <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 flex items-center justify-center text-[10px] font-black">02</div>
            <div className="text-[10px] font-semibold">지역 비교</div>
          </div>
          <ChevronRight className="w-3 h-3 text-slate-200 hidden sm:block" />
          <div className="hidden sm:flex items-center gap-1 text-slate-300">
            <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 flex items-center justify-center text-[10px] font-black">03</div>
            <div className="text-[10px] font-semibold text-slate-400">수요 예측</div>
          </div>
          <ChevronRight className="w-3 h-3 text-slate-200 hidden sm:block" />
          <div className="hidden sm:flex items-center gap-1 text-slate-300">
            <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 flex items-center justify-center text-[10px] font-black">04</div>
            <div className="text-[10px] font-semibold text-slate-400">AI 정책기획</div>
          </div>
        </div>

        {/* 우측: 다음 단계 CTA */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] text-slate-400 hidden sm:block">진단 후 다음 단계:</span>
          <button
            type="button"
            onClick={() => on_navigate_policy('compare')}
            className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-bold text-xs hover:bg-indigo-100 transition flex items-center gap-1 cursor-pointer border border-indigo-200 dark:border-indigo-800"
          >
            <span>02 지역 비교</span>
            <ArrowRight className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={() => on_navigate_policy('policy_ai')}
            className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-bold text-xs hover:bg-emerald-100 transition flex items-center gap-1 cursor-pointer border border-emerald-200 dark:border-emerald-800"
          >
            <span>04 AI 정책기획</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 1. 상단 핵심 종합 진단 바 (Section 6) */}
      {/* ============================================================== */}

      {active_region && (
        <div className="bg-white dark:bg-[#15161b] rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 rounded-full">
                  {active_region.시도명}
                </span>
                <span className="text-xs text-slate-400">코드: {active_region.시군구코드}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white mt-1">
                {active_region.시군구명} 필수의료 진단
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                관내 인구: <strong>{format_number_comma(active_region.인구수)}</strong>명 • 
                법정 취약 분야 <strong>{active_region.취약분야_수}</strong>/{active_region.소아_판정_가능 ? 3 : 2}개 판정
                {!active_region.소아_판정_가능 && <span className="text-slate-400"> (소아 자료 없음)</span>}
              </p>
            </div>

            {/* 4대 분야별 취약도 신호등 캡슐 바 (Section 6 & Section 20 KPI ⓘ 툴팁 지원) */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3">
              {/* 종합 취약도 */}
              <div className="relative p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex flex-col justify-center">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-500">종합 취약도</span>
                  <button
                    type="button"
                    onClick={() => setActive_kpi_tooltip(active_kpi_tooltip === '종합' ? null : '종합')}
                    className="text-slate-400 hover:text-blue-600 cursor-pointer p-0.5"
                    title="산출 기준 보기"
                  >
                    <Info className="w-3 h-3" />
                  </button>
                </div>
                <span className={`text-sm sm:text-base font-black flex items-center gap-1 mt-0.5 ${
                  { 심각: 'text-red-600 dark:text-red-400', 취약: 'text-orange-600 dark:text-orange-400', 관찰: 'text-amber-600 dark:text-amber-400', 정상: 'text-emerald-600 dark:text-emerald-400' }[active_region.종합_취약도_등급]
                }`}>
                  <span>{{ 심각: '🔴', 취약: '🟠', 관찰: '🟡', 정상: '🟢' }[active_region.종합_취약도_등급]}</span>
                  <span>{active_region.종합_취약도_등급}</span>
                </span>
                {active_kpi_tooltip === '종합' && (
                  <div className="absolute top-full left-0 mt-1 w-48 p-2.5 bg-slate-900 text-white rounded-xl text-[10px] z-50 shadow-xl space-y-1">
                    <p className="font-bold text-amber-300">■ 종합 취약도 산출 기준</p>
                    <p className="text-slate-300 leading-tight">응급·분만·소아 3대 법정 분야 중 2개 이상 취약 시 &apos;심각&apos;, 1개 취약 시 &apos;주의/취약&apos; 판정.</p>
                  </div>
                )}
              </div>

              {/* 응급 */}
              <div className="relative p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex flex-col justify-center">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-500">응급 의료</span>
                  <button
                    type="button"
                    onClick={() => setActive_kpi_tooltip(active_kpi_tooltip === '응급' ? null : '응급')}
                    className="text-slate-400 hover:text-blue-600 cursor-pointer p-0.5"
                    title="산출 기준 보기"
                  >
                    <Info className="w-3 h-3" />
                  </button>
                </div>
                <span className={`text-sm sm:text-base font-black flex items-center gap-1 mt-0.5 ${
                  active_region.응급취약지역_여부 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'
                }`}>
                  <span>{active_region.응급취약지역_여부 ? '🔴' : '🟢'}</span>
                  <span>{active_region.응급취약지역_여부 ? '취약' : '양호'}</span>
                </span>
                {active_kpi_tooltip === '응급' && (
                  <div className="absolute top-full left-0 mt-1 w-48 p-2.5 bg-slate-900 text-white rounded-xl text-[10px] z-50 shadow-xl space-y-1">
                    <p className="font-bold text-red-300">■ 응급의료 취약지 기준</p>
                    <p className="text-slate-300 leading-tight">권역응급센터 60분 미도달 인구비율 30% 이상 및 관내 응급이용률(RI) 30% 미만.</p>
                  </div>
                )}
              </div>

              {/* 분만 */}
              <div className="relative p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex flex-col justify-center">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-500">분만 인프라</span>
                  <button
                    type="button"
                    onClick={() => setActive_kpi_tooltip(active_kpi_tooltip === '분만' ? null : '분만')}
                    className="text-slate-400 hover:text-blue-600 cursor-pointer p-0.5"
                    title="산출 기준 보기"
                  >
                    <Info className="w-3 h-3" />
                  </button>
                </div>
                <span className={`text-sm sm:text-base font-black flex items-center gap-1 mt-0.5 ${
                  active_region.분만취약지역_여부 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'
                }`}>
                  <span>{active_region.분만취약지역_여부 ? '🔴' : '🟢'}</span>
                  <span>{active_region.분만취약지역_여부 ? '취약' : '양호'}</span>
                </span>
                {active_kpi_tooltip === '분만' && (
                  <div className="absolute top-full left-0 mt-1 w-48 p-2.5 bg-slate-900 text-white rounded-xl text-[10px] z-50 shadow-xl space-y-1">
                    <p className="font-bold text-orange-300">■ 분만취약지 고시 기준</p>
                    <p className="text-slate-300 leading-tight">분만산부인과 60분 미도달 인구비율 30% 이상 및 관내분만율 30% 미만.</p>
                  </div>
                )}
              </div>

              {/* 소아 */}
              <div className="relative p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex flex-col justify-center">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-500">소아 진료</span>
                  <button
                    type="button"
                    onClick={() => setActive_kpi_tooltip(active_kpi_tooltip === '소아' ? null : '소아')}
                    className="text-slate-400 hover:text-blue-600 cursor-pointer p-0.5"
                    title="산출 기준 보기"
                  >
                    <Info className="w-3 h-3" />
                  </button>
                </div>
                {active_region.소아_판정_가능 ? (
                  <span className={`text-sm sm:text-base font-black flex items-center gap-1 mt-0.5 ${
                    active_region.소아취약지역_여부 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'
                  }`}>
                    <span>{active_region.소아취약지역_여부 ? '🟠' : '🟢'}</span>
                    <span>{active_region.소아취약지역_여부 ? '주의' : '양호'}</span>
                  </span>
                ) : (
                  <span className="text-sm sm:text-base font-black flex items-center gap-1 mt-0.5 text-slate-400">
                    <span>⚪</span>
                    <span>자료 없음</span>
                  </span>
                )}
                {active_kpi_tooltip === '소아' && (
                  <div className="absolute top-full right-0 mt-1 w-48 p-2.5 bg-slate-900 text-white rounded-xl text-[10px] z-50 shadow-xl space-y-1">
                    <p className="font-bold text-amber-300">■ 소아 진료 취약 기준</p>
                    <p className="text-slate-300 leading-tight">소아청소년과 야간·휴일 진료기관 접근성지표 및 달빛어린이병원 접근도 기준.</p>
                  </div>
                )}
              </div>

              {/* 의료인력 */}
              <div className="relative p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex flex-col justify-center">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-500">의료 인력</span>
                  <button
                    type="button"
                    onClick={() => setActive_kpi_tooltip(active_kpi_tooltip === '인력' ? null : '인력')}
                    className="text-slate-400 hover:text-blue-600 cursor-pointer p-0.5"
                    title="산출 기준 보기"
                  >
                    <Info className="w-3 h-3" />
                  </button>
                </div>
                <span className="text-sm sm:text-base font-black flex items-center gap-1 mt-0.5 text-slate-400">
                  <span>⚪</span>
                  <span>자료 없음</span>
                </span>
                {active_kpi_tooltip === '인력' && (
                  <div className="absolute top-full right-0 mt-1 w-48 p-2.5 bg-slate-900 text-white rounded-xl text-[10px] z-50 shadow-xl space-y-1">
                    <p className="font-bold text-slate-300">■ 의료인력 기준</p>
                    <p className="text-slate-300 leading-tight">시·군·구 단위 활동의사수 및 전문의 수 (지자체별 공식 통계 확보 시 제공).</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 20 표준: 데이터 기준 공식 명시 배너 */}
          <div className="p-3.5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-blue-900 dark:text-blue-300">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="font-bold">데이터 기준 고지:</span>
              <span>기준년도 <strong>2024년</strong> • 대상 <strong>전국 250개 시·군·구</strong> • 출처 <strong>공공보건의료통계 / 헬스맵 2024</strong></span>
            </div>
            <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">최종 갱신: 2026-09-26 (v1.1.2)</span>
          </div>
        </div>
      )}


      {/* ============================================================== */}
      {/* 2. 35:65 양방향 진단 지도 및 시군구 목록 패널 (Section 7, 8, 9) */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
        {/* 좌측 35%: 필터 및 시군구 목록 */}
        <div className="xl:col-span-5 flex flex-col bg-white dark:bg-[#15161b] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden h-[620px]">
          {/* 목록 헤더 및 검색 */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-blue-600" />
                <span>시·군·구 취약지 목록 (헬스맵 2024)</span>
              </span>
              <span className="text-[11px] text-slate-400 font-semibold">
                총 {filtered_regions.length}개소
              </span>
            </div>

            {/* 검색창 */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search_query}
                onChange={(e) => set_search_query(e.target.value)}
                placeholder="시·군·구 검색..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-blue-600"
              />
            </div>

            {/* 필터 칩 */}
            <div className="flex items-center gap-2">
              <select
                value={filter_sido}
                onChange={(e) => set_filter_sido(e.target.value)}
                className="text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1 text-slate-700 dark:text-slate-300 focus:outline-none"
              >
                {sido_list.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>

              <select
                value={filter_grade}
                onChange={(e) => set_filter_grade(e.target.value)}
                className="text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1 text-slate-700 dark:text-slate-300 focus:outline-none"
              >
                <option value="전체">모든 등급</option>
                <option value="심각">🔴 심각</option>
                <option value="취약">🟠 취약</option>
                <option value="관찰">🟡 관찰</option>
                <option value="정상">🟢 정상</option>
              </select>
            </div>
          </div>

          {/* 시군구 목록 스크롤 영역 */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {filtered_regions.map((item) => {
              const is_selected = active_region?.시군구코드 === item.시군구코드;
              return (
                <div
                  key={item.시군구코드}
                  onClick={() => on_select_region(item)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    is_selected
                      ? 'border-blue-600 dark:border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 shadow-xs ring-1 ring-blue-500/30'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold text-slate-400">
                        {item.시도명}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {item.시군구명}
                      </h4>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-slate-500">
                      <span>응급 {item.응급_60분_미도달_인구비율}%</span>
                      <span>•</span>
                      <span>RI {item.관내_응급_의료이용률}%</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-bold text-white shadow-xs"
                      style={{
                        backgroundColor:
                          취약도_등급_정보[item.종합_취약도_등급].색상코드,
                      }}
                    >
                      {item.종합_취약도_등급}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 우측 65%: GIS 진단 지도 */}
        <div className="xl:col-span-7 h-[620px] rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xs">
          <지도_래퍼
            diagnosed_list={diagnosed_list}
            selected_region={active_region}
            on_select_region={on_select_region}
            view_mode={view_mode}
            on_change_view_mode={set_view_mode}
            region_unit={region_unit}
            on_change_region_unit={set_region_unit}
          />
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. 6단계 지역 상세정보 및 정책대안 연계 체인 (Section 6 & 10) */}
      {/* ============================================================== */}
      {active_region && (
        <div className="space-y-6 pt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600" />
              <span>{active_region.시군구명} 6단계 필수의료 심층 진단 보고서</span>
            </h3>
            <span className="text-xs text-slate-400">기준: 2026.09 보건복지부 법정 고시</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* ① 현재 상태 */}
            <div className="p-5 rounded-3xl bg-white dark:bg-[#15161b] border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white">① 현재 상태</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300">
                  종합: {active_region.종합_취약도_등급}
                </span>
              </div>
              <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5">
                <li className="flex justify-between">
                  <span>응급 60분 미도달 인구비율:</span>
                  <strong className="text-red-600">{active_region.응급_60분_미도달_인구비율}%</strong>
                </li>
                <li className="flex justify-between">
                  <span>관내 응급 의료이용률 (RI):</span>
                  <strong className="text-slate-900 dark:text-white">{active_region.관내_응급_의료이용률}%</strong>
                </li>
                <li className="flex justify-between">
                  <span>분만 60분 미도달 인구비율:</span>
                  <strong className="text-red-600">{active_region.분만_60분_미도달_인구비율}%</strong>
                </li>
                <li className="flex justify-between">
                  <span>소아 야간휴일 접근성지수:</span>
                  <strong className="text-amber-600">{active_region.소아_야간휴일_접근성지수 === null ? '자료 없음' : `${active_region.소아_야간휴일_접근성지수}점`}</strong>
                </li>
              </ul>
            </div>

            {/* ② Section 10 표준: 주요 취약요인 ("왜?" 분석 - 클릭 시 상세분석) */}
            <div className="p-5 rounded-3xl bg-white dark:bg-[#15161b] border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">② 주요 취약요인 (&apos;왜?&apos; 분석)</span>
                  <span className="text-[10px] text-slate-400 block">항목을 클릭하면 원인 상세 분석이 펼쳐집니다</span>
                </div>
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded-full">
                  3대 요인
                </span>
              </div>
              <div className="space-y-2">
                {[
                  {
                    id: '응급' as const,
                    rank: '①',
                    title: '응급의료 접근성',
                    summary: '응급의료기관까지 평균 이동시간 및 60분 미도달율 높음',
                    detail: active_region.응급_판정근거,
                    metric: `60분 미도달 ${active_region.응급_60분_미도달_인구비율}%, 관내이용률 ${active_region.관내_응급_의료이용률}%`,
                    isWeak: active_region.응급취약지역_여부,
                  },
                  {
                    id: '분만' as const,
                    rank: '②',
                    title: '분만 의료공백',
                    summary: '분만 가능 의료기관 부족으로 산모 관외유출 심화',
                    detail: active_region.분만_판정근거,
                    metric: `60분 미도달 ${active_region.분만_60분_미도달_인구비율}%, 관내분만율 ${active_region.관내_분만율}%`,
                    isWeak: active_region.분만취약지역_여부,
                  },
                  {
                    id: '소아' as const,
                    rank: '③',
                    title: '소아 및 전문인력',
                    summary: '지역 내 야간·휴일 소아진료 및 전문의 공급 부족',
                    detail: active_region.소아_판정근거,
                    metric: active_region.소아_야간휴일_접근성지수 !== null ? `접근성지수 ${active_region.소아_야간휴일_접근성지수}점` : '자료 없음 (소아 실데이터 미확보)',
                    isWeak: active_region.소아취약지역_여부,
                  },
                ].map((factor) => {
                  const isOpened = selected_factor === factor.id;
                  return (
                    <div
                      key={factor.id}
                      onClick={() => setSelected_factor(isOpened ? null : factor.id)}
                      className={`p-2.5 rounded-2xl border transition-all cursor-pointer ${
                        isOpened
                          ? 'border-blue-500 bg-blue-50/40 dark:bg-blue-950/30 ring-1 ring-blue-500/20'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-blue-700 dark:text-blue-400 text-xs">{factor.rank}</span>
                          <span className="font-bold text-xs text-slate-800 dark:text-slate-200">{factor.title}</span>
                          {factor.isWeak && (
                            <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300">취약</span>
                          )}
                        </div>
                        <span className="text-[10px] text-blue-600 font-semibold">{isOpened ? '접기 ▲' : '상세 ▼'}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 pl-4 leading-tight">
                        {factor.summary}
                      </div>

                      {/* 클릭 시 상세 분석 펼침 */}
                      {isOpened && (
                        <div className="mt-2.5 pt-2 border-t border-blue-200/50 dark:border-blue-900/50 pl-4 space-y-1 text-[11px] text-slate-700 dark:text-slate-300 animate-in fade-in">
                          <div className="font-semibold text-blue-900 dark:text-blue-300">
                            • 주요 지표: <span className="font-normal text-slate-600 dark:text-slate-400">{factor.metric}</span>
                          </div>
                          <div>
                            • 판정 근거: <span className="text-slate-600 dark:text-slate-400">{factor.detail}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ③ 의료자원 현황 */}
            {region_resources && (
            <div className="p-5 rounded-3xl bg-white dark:bg-[#15161b] border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white">③ 보유 의료자원</span>
                <span className="text-[10px] font-semibold text-slate-400">기관 목록 집계</span>
              </div>
              <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5">
                <li className="flex justify-between gap-2">
                  <span className="shrink-0">공공의료기관:</span>
                  <strong className="text-right">
                    {region_resources.공공의료기관_수 > 0
                      ? `${region_resources.공공의료기관_수}곳 · ${format_number_comma(region_resources.공공의료기관_병상)}병상`
                      : '없음'}
                  </strong>
                </li>
                <li className="flex justify-between gap-2">
                  <span className="shrink-0">응급의료기관:</span>
                  <strong className={`text-right ${region_resources.응급의료기관.length === 0 ? 'text-red-600' : ''}`}>
                    {region_resources.응급의료기관.length > 0
                      ? `${region_resources.응급의료기관.length}곳 (${Array.from(new Set(region_resources.응급의료기관.map((h) => h.분류))).join(', ')})`
                      : '없음'}
                  </strong>
                </li>
                <li className="flex justify-between gap-2">
                  <span className="shrink-0">분만 가능 기관:</span>
                  <strong className={`text-right ${region_resources.분만기관_수 === 0 ? 'text-red-600' : ''}`}>
                    {region_resources.분만기관_수 > 0
                      ? `${region_resources.분만기관_수}곳 (야간 ${region_resources.야간분만기관_수}곳)`
                      : '없음'}
                  </strong>
                </li>
                <li className="flex justify-between gap-2">
                  <span className="shrink-0">달빛어린이병원:</span>
                  <strong className="text-right">
                    {region_resources.달빛어린이병원_수 > 0 ? `${region_resources.달빛어린이병원_수}곳` : '없음'}
                  </strong>
                </li>
              </ul>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                출처: 공공의료기관 데이터셋, E-Gen 응급의료기관 목록, 심평원 분만가능 의료기관 목록(청구 실적), 국립중앙의료원 달빛어린이병원 목록. 2026년 행정구역 개편 지역(인천 중·동·서구 등)은 새 구역이 겹쳐 집계될 수 있습니다. 중환자실·소아 병상은 시군구 단위 자료가 없어 표시하지 않습니다.
              </p>
            </div>
            )}

            {/* ④ 유사 지역 비교 */}
            <div className="p-5 rounded-3xl bg-white dark:bg-[#15161b] border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white">④ 유사 지자체 비교</span>
                <span className="text-[10px] font-semibold text-blue-600">동급 취약권역</span>
              </div>
              <div className="space-y-2">
                {similar_regions.map((sim) => (
                  <div
                    key={sim.시군구코드}
                    onClick={() => on_select_region(sim)}
                    className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between cursor-pointer transition text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {sim.시도명} {sim.시군구명}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        인구 {format_number_comma(sim.인구수)}명
                      </span>
                    </div>
                    <span className="text-xs font-bold text-red-600">
                      응급 {sim.응급_60분_미도달_인구비율}%
                    </span>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => on_navigate_policy('compare')}
                className="w-full py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-bold text-xs hover:bg-indigo-100 transition flex items-center justify-center gap-1"
              >
                <span>1:1 정밀 비교 대시보드 열기</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* ⑤ 2030 미래 수요 전망 */}
            <div className="p-5 rounded-3xl bg-white dark:bg-[#15161b] border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white">⑤ 2030 미래 수요 전망</span>
                <span className="text-[10px] font-semibold text-amber-600">고령화 가속</span>
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-300 space-y-2">
                <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900">
                  <p className="font-bold text-amber-800 dark:text-amber-300">
                    2030년 고령인구 비율 42.8% 도달 예상
                  </p>
                  <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-0.5">
                    뇌졸중·심근경색 및 만성기 입원 수요 28.5% 급증 전망
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => on_navigate_policy('forecast')}
                  className="w-full py-1.5 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold text-xs hover:bg-amber-200 transition flex items-center justify-center gap-1"
                >
                  <span>2030 의료수요 추계 차트 보기</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* ⑥ AI 정책대안 & 사업계획서 생성 */}
            <div className="p-5 rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-200 dark:border-blue-900 shadow-xs space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-blue-200 dark:border-blue-900 pb-2">
                  <span className="text-xs font-bold text-blue-950 dark:text-blue-200">
                    ⑥ AI 정책 분석 및 사업화
                  </span>
                  <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                </div>
                <p className="text-xs text-blue-900 dark:text-blue-300 mt-2 leading-relaxed">
                  진단된 응급·분만·소아 취약 데이터와 복지부 5대 사업 가이드를 결합하여
                  <strong> 3대 정책대안(Option A/B/C)</strong>과 <strong>표준 사업계획서</strong>를 자동 도출합니다.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => on_navigate_policy('policy_ai')}
                  className="py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shadow-xs flex items-center justify-center gap-1"
                >
                  <span>정책대안 생성</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => on_navigate_policy('report')}
                  className="py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition shadow-xs flex items-center justify-center gap-1"
                >
                  <span>사업계획서 생성</span>
                  <FileText className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {/* ============================================================== */}
          {/* Section 11 표준: 지역 진단 ➔ 지역 비교 연결 대형 CTA 배너           */}
          {/* ============================================================== */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#15161b] border-2 border-indigo-200 dark:border-indigo-900/60 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs font-bold">
                <span>다음 단계 Journey · 02 지역 비교</span>
              </div>
              <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                {active_region.시군구명}의 취약 원인을 유사 지자체와 1:1로 정밀 비교하시겠습니까?
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                동일 취약 등급 및 인구 규모의 유사 권역과 인프라 격차 및 의료인력·병상 공급을 대조 분석합니다.
              </p>
            </div>
            <button
              type="button"
              onClick={() => on_navigate_policy('compare')}
              className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md transition active:scale-95 cursor-pointer flex items-center gap-2 shrink-0"
            >
              <span>유사 지역과 비교하기</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

