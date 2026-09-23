'use client';

import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownLeft,
  Building2,
  AlertTriangle,
  CheckCircle2,
  Info,
  Sparkles,
  Stethoscope,
  Activity,
  Baby,
  FileText,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  PieChart,
  BarChart3,
  MapPin,
  RefreshCw,
} from 'lucide-react';
import {
  시군구_환자_유출입_데이터,
  환자_유출입_2024_데이터,
  환자_유출입_시군구_목록,
  get_patient_flow_data,
} from '@/lib/환자_유출입_데이터셋';
import { 필수의료_진단_결과 } from '@/lib/필수의료_타입';
import 환자_이동_네트워크_플로우맵 from './환자_이동_네트워크_플로우맵';

interface 환자_의료이용_유출입_대시보드_속성 {
  selected_region?: 필수의료_진단_결과 | null;
  on_navigate?: (menu_id: string) => void;
}

export default function 환자_의료이용_유출입_대시보드({
  selected_region,
  on_navigate,
}: 환자_의료이용_유출입_대시보드_속성) {
  // 기본 선택 지자체는 영월군 또는 부모 컴포넌트의 selected_region
  const [selected_sgg, set_selected_sgg] = useState<string>(
    selected_region?.시군구명 || '영월군'
  );

  // 시도 목록 및 시도 필터
  const [selected_sido_filter, set_selected_sido_filter] = useState<string>('전체');

  // 활성 탭: 'summary' (종합 유출입), 'essential' (필수의료별), 'departments' (진료과별), 'flowmap' (GIS 플로우맵 & 생키)
  const [active_tab, set_active_tab] = useState<'summary' | 'essential' | 'departments' | 'flowmap'>('summary');

  // 데이터 조회
  const flow_data = useMemo(() => {
    return get_patient_flow_data(selected_sgg) || 환자_유출입_2024_데이터['영월군'];
  }, [selected_sgg]);

  // 시도 목록 추출
  const sido_list = useMemo(() => {
    const set = new Set<string>();
    환자_유출입_시군구_목록.forEach((item) => set.add(item.sido));
    return Array.from(set);
  }, []);

  // 필터된 시군구 목록
  const filtered_sgg_list = useMemo(() => {
    if (selected_sido_filter === '전체') {
      return 환자_유출입_시군구_목록;
    }
    return 환자_유출입_시군구_목록.filter((item) => item.sido === selected_sido_filter);
  }, [selected_sido_filter]);

  if (!flow_data) {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800">
        <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
        <p className="text-slate-600 dark:text-slate-300">데이터를 불러오는 중입니다...</p>
      </div>
    );
  }

  // 핵심 계산값
  const is_high_outflow = flow_data.outflow_rate >= 70;
  const is_safe_ri = flow_data.ri >= 50;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* ============================================================== */}
      {/* 1. 상단 타이틀 & 지자체 선택 컨트롤러 */}
      {/* ============================================================== */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50">
                복지부·국립중앙의료원 공식 실데이터 (2024)
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                전국 228개 시군구 OD 매트릭스 전수 분석
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              환자 의료이용 유출입 분석 <span className="text-blue-600 dark:text-blue-400 font-medium text-lg sm:text-xl">(OD Matrix)</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1.5">
              관내 환자의 외부 유출지(Outflow)와 타지역 환자의 유입(Inflow), 투석·응급 등 4대 필수의료 자급 현황을 정밀 진단합니다.
            </p>
          </div>

          {/* 지역 선택 필터 */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 p-2 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80">
            {/* 시도 선택 */}
            <select
              value={selected_sido_filter}
              onChange={(e) => set_selected_sido_filter(e.target.value)}
              className="px-3 py-2 text-sm font-medium rounded-xl bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="전체">전국 (전체 시도)</option>
              {sido_list.map((sido) => (
                <option key={sido} value={sido}>
                  {sido}
                </option>
              ))}
            </select>

            {/* 시군구 선택 */}
            <select
              value={flow_data.sgg}
              onChange={(e) => set_selected_sgg(e.target.value)}
              className="px-3.5 py-2 text-sm font-semibold rounded-xl bg-blue-600 text-white border border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/40 shadow-sm cursor-pointer"
            >
              {filtered_sgg_list.map((item) => (
                <option key={item.code} value={item.sgg} className="bg-white text-slate-800 dark:bg-slate-900 dark:text-slate-200">
                  {item.sido} {item.sgg} (자체충족: {item.ri}%)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 탭 네비게이션 */}
        <div className="flex items-center gap-2 mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={() => set_active_tab('summary')}
            className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all ${
              active_tab === 'summary'
                ? 'bg-blue-500 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            📊 관외 유출 vs 타지역 유입 (총괄)
          </button>
          <button
            onClick={() => set_active_tab('essential')}
            className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all ${
              active_tab === 'essential'
                ? 'bg-blue-500 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            🚨 4대 필수의료 취약도 (투석·응급·분만·중환자)
          </button>
          <button
            onClick={() => set_active_tab('departments')}
            className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all ${
              active_tab === 'departments'
                ? 'bg-blue-500 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            🩺 5대 진료과목 & 종별 유출 분석
          </button>
          <button
            onClick={() => set_active_tab('flowmap')}
            className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all flex items-center gap-1.5 ${
              active_tab === 'flowmap'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/60'
            }`}
          >
            🗺️ GIS 이동 플로우맵 & 생키 다이어그램
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. 핵심 4대 KPI 카드 그리드 */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: 총 의료이용량 */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              총 입원 의료이용량
            </span>
            <span className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              <Activity className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {flow_data.total_days.toLocaleString()}
              <span className="text-sm font-normal text-slate-500 dark:text-slate-400 ml-1">일(재원)</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {flow_data.sido} {flow_data.sgg} 거주 주민 기준
            </p>
          </div>
        </div>

        {/* KPI 2: 자체충족률 (RI) */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              관내 자체충족률 (RI)
            </span>
            <span
              className={`p-2 rounded-xl ${
                is_safe_ri
                  ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
                  : 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400'
              }`}
            >
              {is_safe_ri ? <ShieldCheck className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
            </span>
          </div>
          <div className="mt-3">
            <div
              className={`text-2xl font-bold ${
                is_safe_ri
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {flow_data.ri}%
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 ml-1.5">
                ({flow_data.self_days.toLocaleString()}일)
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-2.5 overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  is_safe_ri ? 'bg-emerald-500' : 'bg-rose-500'
                }`}
                style={{ width: `${Math.min(flow_data.ri, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* KPI 3: 관외 유출률 */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              관외 환자 유출률
            </span>
            <span
              className={`p-2 rounded-xl ${
                is_high_outflow
                  ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400'
                  : 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <div
              className={`text-2xl font-bold ${
                is_high_outflow
                  ? 'text-rose-600 dark:text-rose-400'
                  : 'text-amber-600 dark:text-amber-400'
              }`}
            >
              {flow_data.outflow_rate}%
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 ml-1.5">
                ({(flow_data.total_days - flow_data.self_days).toLocaleString()}일)
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">
              최다 유출: {flow_data.outflow_top.find((x) => !x.is_self)?.dest_sido}{' '}
              {flow_data.outflow_top.find((x) => !x.is_self)?.dest_sgg} (
              {flow_data.outflow_top.find((x) => !x.is_self)?.pct}%)
            </p>
          </div>
        </div>

        {/* KPI 4: 타지역 환자 유입 */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              관외 타지역 환자 유입
            </span>
            <span className="p-2 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
              <ArrowDownLeft className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {flow_data.outsider_inflow_rate}%
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 ml-1.5">
                ({flow_data.outsider_inflow_days.toLocaleString()}일)
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">
              최다 유입: {flow_data.inflow_top.find((x) => !x.is_self)?.orig_sido}{' '}
              {flow_data.inflow_top.find((x) => !x.is_self)?.orig_sgg} (
              {flow_data.inflow_top.find((x) => !x.is_self)?.pct}%)
            </p>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. 메인 콘텐츠 탭별 뷰 */}
      {/* ============================================================== */}
      {active_tab === 'summary' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          {/* [좌측] 관외 유출 (Outflow) 분석 */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
                    <ArrowUpRight className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {flow_data.sgg} 주민의 주요 이동/유출지 TOP 6
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      관내 자급을 제외하고 환자가 실제로 어느 지역 의료기관을 방문하는가?
                    </p>
                  </div>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 font-semibold border border-rose-100 dark:border-rose-900/40">
                  유출률 {flow_data.outflow_rate}%
                </span>
              </div>

              {/* 유출지 프로그레스 리스트 */}
              <div className="space-y-3.5 mt-5">
                {flow_data.outflow_top.slice(0, 6).map((dest, idx) => (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      dest.is_self
                        ? 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/60'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/70 dark:border-slate-700/70'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                            dest.is_self
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {idx + 1}
                        </span>
                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                          {dest.dest_sido} {dest.dest_sgg}
                        </span>
                        {dest.is_self && (
                          <span className="text-2xs font-semibold px-2 py-0.5 rounded-full bg-blue-500 text-white">
                            관내 자체충족
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                          {dest.pct}%
                        </span>
                        <span className="text-xs text-slate-400 ml-1.5">
                          ({dest.days.toLocaleString()}일)
                        </span>
                      </div>
                    </div>

                    {/* 프로그레스 바 */}
                    <div className="w-full bg-slate-200/80 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          dest.is_self ? 'bg-blue-500' : 'bg-rose-500'
                        }`}
                        style={{ width: `${Math.min(dest.pct * 2, 100)}%` }}
                      ></div>
                    </div>

                    {/* 세부 종별 / 필수의료 태그 */}
                    <div className="flex flex-wrap items-center gap-2 mt-2 pt-2 border-t border-slate-200/50 dark:border-slate-700/50 text-2xs text-slate-500 dark:text-slate-400">
                      {dest.tertiary_days > 0 && (
                        <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300">
                          상급종합 {dest.tertiary_days.toLocaleString()}일
                        </span>
                      )}
                      {dest.general_days > 0 && (
                        <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                          종합병원 {dest.general_days.toLocaleString()}일
                        </span>
                      )}
                      {dest.dialysis_days > 0 && (
                        <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                          투석 {dest.dialysis_days.toLocaleString()}일
                        </span>
                      )}
                      {dest.er_days > 0 && (
                        <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
                          응급 {dest.er_days.toLocaleString()}일
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 text-xs text-amber-800 dark:text-amber-300">
              <span className="font-bold flex items-center gap-1.5 mb-1">
                <Info className="w-3.5 h-3.5" /> 유출 진단 포인트
              </span>
              {flow_data.sgg} 주민의 경우 인근 종합/상급종합병원이 위치한{' '}
              <strong>
                {flow_data.outflow_top.find((x) => !x.is_self)?.dest_sgg} (
                {flow_data.outflow_top.find((x) => !x.is_self)?.pct}%)
              </strong>
              로의 쏠림이 뚜렷하며, 이로 인해 관내 필수의료 인프라(응급/투석) 확충이 시급합니다.
            </div>
          </div>

          {/* [우측] 타지역 유입 (Inflow) 분석 */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
                    <ArrowDownLeft className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {flow_data.sgg} 의료기관 이용 환자 출처 TOP 6
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {flow_data.sgg} 소재 병원(공공의료원 등)을 실제로 이용하는 환자는 어디서 오는가?
                    </p>
                  </div>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 font-semibold border border-blue-100 dark:border-blue-900/40">
                  외부 유입 {flow_data.outsider_inflow_rate}%
                </span>
              </div>

              {/* 유입지 프로그레스 리스트 */}
              <div className="space-y-3.5 mt-5">
                {flow_data.inflow_top.slice(0, 6).map((orig, idx) => (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      orig.is_self
                        ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/60'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/70 dark:border-slate-700/70'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                            orig.is_self
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {idx + 1}
                        </span>
                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                          {orig.orig_sido} {orig.orig_sgg}
                        </span>
                        {orig.is_self ? (
                          <span className="text-2xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500 text-white">
                            관내 주민 이용
                          </span>
                        ) : (
                          <span className="text-2xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300">
                            타지역 유입
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                          {orig.pct}%
                        </span>
                        <span className="text-xs text-slate-400 ml-1.5">
                          ({orig.days.toLocaleString()}일)
                        </span>
                      </div>
                    </div>

                    {/* 프로그레스 바 */}
                    <div className="w-full bg-slate-200/80 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          orig.is_self ? 'bg-emerald-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${Math.min(orig.pct * 2, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40 text-xs text-blue-800 dark:text-blue-300">
              <span className="font-bold flex items-center gap-1.5 mb-1">
                <ShieldCheck className="w-3.5 h-3.5" /> 지역책임의료기관 역할 입증
              </span>
              {flow_data.sgg} 소재 의료기관은 관내 주민뿐 아니라,{' '}
              {flow_data.inflow_top
                .filter((x) => !x.is_self)
                .slice(0, 2)
                .map((x) => `${x.orig_sgg}(${x.pct}%)`)
                .join(', ')}{' '}
              등 인근 취약지 주민의 입원 치료를 분담하는 핵심 앵커(Anchor) 역할을 실질적으로 담당하고 있습니다.
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. 필수의료 4대 영역 심층 유출 분석 (Essential Tab) */}
      {/* ============================================================== */}
      {active_tab === 'essential' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* 1) 인공신장실 (투석) */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="p-2.5 rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
                    <Activity className="w-5 h-5" />
                  </span>
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                      flow_data.essential_care.dialysis.ri >= 40
                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
                        : 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400'
                    }`}
                  >
                    자급률 {flow_data.essential_care.dialysis.ri}%
                  </span>
                </div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">인공신장실 (혈액투석)</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  만성신부전 투석 환자 이용량
                </p>

                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">총 이용일수</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {flow_data.essential_care.dialysis.total.toLocaleString()}일
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">관내 충족일수</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      {flow_data.essential_care.dialysis.self.toLocaleString()}일
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-1">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${flow_data.essential_care.dialysis.ri}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 text-2xs text-slate-500">
                {flow_data.essential_care.dialysis.top_outflow_sgg ? (
                  <div>
                    주요 유출지:{' '}
                    <strong className="text-rose-600 dark:text-rose-400">
                      {flow_data.essential_care.dialysis.top_outflow_sgg}
                    </strong>{' '}
                    ({flow_data.essential_care.dialysis.top_outflow_days?.toLocaleString()}일 유출)
                  </div>
                ) : (
                  <div>관외 유출 없음</div>
                )}
              </div>
            </div>

            {/* 2) 응급실 진료 */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="p-2.5 rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
                    <ShieldAlert className="w-5 h-5" />
                  </span>
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                      flow_data.essential_care.er.ri >= 50
                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
                        : 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400'
                    }`}
                  >
                    자급률 {flow_data.essential_care.er.ri}%
                  </span>
                </div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">응급실 (응급의료)</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  응급환자 내원 및 입원 연계
                </p>

                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">총 이용일수</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {flow_data.essential_care.er.total.toLocaleString()}일
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">관내 충족일수</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      {flow_data.essential_care.er.self.toLocaleString()}일
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-1">
                    <div
                      className="h-full bg-amber-500 rounded-full"
                      style={{ width: `${flow_data.essential_care.er.ri}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 text-2xs text-slate-500">
                {flow_data.essential_care.er.top_outflow_sgg ? (
                  <div>
                    주요 유출지:{' '}
                    <strong className="text-rose-600 dark:text-rose-400">
                      {flow_data.essential_care.er.top_outflow_sgg}
                    </strong>{' '}
                    ({flow_data.essential_care.er.top_outflow_days?.toLocaleString()}일 유출)
                  </div>
                ) : (
                  <div>관외 유출 없음</div>
                )}
              </div>
            </div>

            {/* 3) 분만실 */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="p-2.5 rounded-2xl bg-pink-50 text-pink-600 dark:bg-pink-950/60 dark:text-pink-400">
                    <Baby className="w-5 h-5" />
                  </span>
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                      flow_data.essential_care.delivery.ri >= 40
                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
                        : 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400'
                    }`}
                  >
                    자급률 {flow_data.essential_care.delivery.ri}%
                  </span>
                </div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">분만실 (모자의료)</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  임산부 분만 및 산과 입원
                </p>

                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">총 이용일수</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {flow_data.essential_care.delivery.total.toLocaleString()}일
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">관내 충족일수</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      {flow_data.essential_care.delivery.self.toLocaleString()}일
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-1">
                    <div
                      className="h-full bg-pink-500 rounded-full"
                      style={{ width: `${flow_data.essential_care.delivery.ri}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 text-2xs text-slate-500">
                {flow_data.essential_care.delivery.ri === 0 ? (
                  <span className="text-rose-600 dark:text-rose-400 font-medium">
                    관내 분만시설 부재 (전량 관외 유출)
                  </span>
                ) : (
                  <span>관내 분만 시설 운영 중</span>
                )}
              </div>
            </div>

            {/* 4) 중환자실 (ICU) */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="p-2.5 rounded-2xl bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400">
                    <Stethoscope className="w-5 h-5" />
                  </span>
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                      flow_data.essential_care.icu.ri >= 40
                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
                        : 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400'
                    }`}
                  >
                    자급률 {flow_data.essential_care.icu.ri}%
                  </span>
                </div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">중환자실 (ICU)</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  중증 및 급성기 집중치료
                </p>

                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">총 이용일수</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {flow_data.essential_care.icu.total.toLocaleString()}일
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">관내 충족일수</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      {flow_data.essential_care.icu.self.toLocaleString()}일
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-1">
                    <div
                      className="h-full bg-purple-500 rounded-full"
                      style={{ width: `${flow_data.essential_care.icu.ri}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 text-2xs text-slate-500">
                {flow_data.essential_care.icu.ri === 0 ? (
                  <span className="text-rose-600 dark:text-rose-400 font-medium">
                    중환자실 부재로 인근 권역센터 전원
                  </span>
                ) : (
                  <span>중환자실 치료 자체 수행</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 5. 진료과목별 & 의료기관 종별 분석 (Departments Tab) */}
      {/* ============================================================== */}
      {active_tab === 'departments' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          {/* [좌측] 5대 주요 진료과목별 관내 자체충족률(RI) */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              5대 주요 진료과목별 관내 자체충족률 (RI)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              진료과목별로 환자가 관내에 머무르는 비율과 총 이용량을 비교합니다.
            </p>

            <div className="space-y-4">
              {[
                { label: '내과', data: flow_data.specialties.internal, color: 'bg-blue-500' },
                { label: '외과', data: flow_data.specialties.surgery, color: 'bg-indigo-500' },
                { label: '정형외과', data: flow_data.specialties.ortho, color: 'bg-emerald-500' },
                { label: '소아청소년과', data: flow_data.specialties.pediatrics, color: 'bg-amber-500' },
                { label: '산부인과', data: flow_data.specialties.obgyn, color: 'bg-pink-500' },
              ].map((item, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      {item.label}
                    </span>
                    <div className="text-right">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        {item.data.ri}%
                      </span>
                      <span className="text-xs text-slate-400 ml-2">
                        ({item.data.self.toLocaleString()} / {item.data.total.toLocaleString()}일)
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.color} rounded-full`}
                      style={{ width: `${Math.min(item.data.ri, 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* [우측] 의료기관 종별 환자 유출 비중 */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                환자가 이용한 의료기관 종별 비중
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                상급종합병원, 종합병원, 병원급, 의원급 이용 분포 (재원일수 기준)
              </p>

              <div className="space-y-4">
                {/* 상급종합 */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      상급종합병원 (3차 대학병원)
                    </span>
                    <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                      {flow_data.hospital_types.tertiary_pct}% ({flow_data.hospital_types.tertiary_days.toLocaleString()}일)
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-500 rounded-full"
                      style={{ width: `${flow_data.hospital_types.tertiary_pct}%` }}
                    ></div>
                  </div>
                </div>

                {/* 종합병원 */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      종합병원 (지역거점 공공/민간)
                    </span>
                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                      {flow_data.hospital_types.general_pct}% ({flow_data.hospital_types.general_days.toLocaleString()}일)
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${flow_data.hospital_types.general_pct}%` }}
                    ></div>
                  </div>
                </div>

                {/* 병원급 */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      일반병원 (요양·전문병원 등)
                    </span>
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      {flow_data.hospital_types.hospital_pct}% ({flow_data.hospital_types.hospital_days.toLocaleString()}일)
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-slate-400 rounded-full"
                      style={{ width: `${flow_data.hospital_types.hospital_pct}%` }}
                    ></div>
                  </div>
                </div>

                {/* 의원급 */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      의원급 (동네 1차 의료기관)
                    </span>
                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      {flow_data.hospital_types.clinic_pct}% ({flow_data.hospital_types.clinic_days.toLocaleString()}일)
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${flow_data.hospital_types.clinic_pct}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300">
              💡 <strong>상급종합병원 유출 비중이 높을수록</strong>, 지역 내 중증 치료 인프라 및 전문의 부족으로 인한 타 시도 대형병원 원정 진료 부담이 가중되고 있음을 의미합니다.
            </div>
          </div>
        </div>
      )}

      {/* 4번째 탭: GIS 이동 플로우맵 & 생키 다이어그램 */}
      {active_tab === 'flowmap' && (
        <환자_이동_네트워크_플로우맵
          flow_data={flow_data}
          on_select_sgg={(sgg) => set_selected_sgg(sgg)}
        />
      )}

      {/* ============================================================== */}
      {/* 6. AI 데이터 기반 정책 브리핑 & 퀵 액션 연계 카드 */}
      {/* ============================================================== */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm text-xs font-semibold text-blue-100 border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              AI 정책 연계 인사이트 브리핑
            </div>
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
              {flow_data.sido} {flow_data.sgg} 환자 이동 진단 결론
            </h3>
            <p className="text-sm text-blue-100/90 leading-relaxed">
              2024년 기준 <strong>{flow_data.sgg}</strong>은 전체 입원 재원일수의 <strong>{flow_data.outflow_rate}%</strong>가 관외로 유출되고 있으며, 최다 유출지는{' '}
              <strong>
                {flow_data.outflow_top.find((x) => !x.is_self)?.dest_sido}{' '}
                {flow_data.outflow_top.find((x) => !x.is_self)?.dest_sgg} (
                {flow_data.outflow_top.find((x) => !x.is_self)?.pct}%)
              </strong>
              입니다. 반면 관내 의료기관은 인근 취약지인{' '}
              <strong>
                {flow_data.inflow_top.find((x) => !x.is_self)?.orig_sgg}
              </strong>
              ({flow_data.inflow_top.find((x) => !x.is_self)?.pct}%) 환자를 실질적으로 분담하고 있어,{' '}
              <strong>지역책임의료기관 기능 보강 지원 타당성이 매우 높습니다.</strong>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0">
            <button
              onClick={() => on_navigate && on_navigate('report_generator')}
              className="px-5 py-3 rounded-2xl bg-white text-blue-700 font-bold text-sm hover:bg-blue-50 transition-all shadow-sm flex items-center justify-center gap-2 group cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              사업계획서 자동생성기 연계
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
            <button
              onClick={() => on_navigate && on_navigate('my_hospital')}
              className="px-5 py-3 rounded-2xl bg-blue-500/40 hover:bg-blue-500/60 text-white font-semibold text-sm border border-white/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Building2 className="w-4 h-4" />
              MY 의료기관 대시보드로 이동
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
