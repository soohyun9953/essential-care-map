'use client';

// Essential Care Map - 1:1 비교 대시보드 (Section 12 & 13 표준 구현)
// 국립중앙의료원 매뉴얼 기반 1:1 지역 및 기관 비교 벤치마킹 대시보드
// - Section 12: 지역 1:1 대조 (응급, 분만, 소아, 접근성, 인력, 병상)
// - Section 13: 주요 격차 자동 분석 (객관적 통계 기반 차이점 자동 도출)
// - Journey Flow: 하단 이전/다음 단계 CTA 제공

import React, { useState, useMemo } from 'react';
import { 필수의료_진단_결과 } from '@/lib/필수의료_타입';
import {
  일대일_비교_엔진,
  전국_지역거점_공공병원_데이터셋,
  기관_비교_결과,
  지역_비교_결과,
} from '@/lib/일대일_비교_엔진';
import { format_number_comma } from '@/lib/유틸리티';
import {
  GitCompare,
  Building2,
  MapPin,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  Activity,
  ShieldAlert,
  ArrowRightLeft,
} from 'lucide-react';

interface 일대일_비교_대시보드_속성 {
  selected_region: 필수의료_진단_결과 | null;
  diagnosed_list: 필수의료_진단_결과[];
  on_navigate_step?: (tab: 'forecast' | 'regional_diagnosis' | 'policy_ai') => void;
}

export const 일대일_비교_대시보드: React.FC<일대일_비교_대시보드_속성> = ({
  selected_region,
  diagnosed_list,
  on_navigate_step,
}) => {
  // 기본 모드를 'region'(지역 비교)로 설정하여 정책 의사결정 Journey에 부합하게 함
  const [compare_mode, set_compare_mode] = useState<'region' | 'hospital'>('region');

  // 1) 지역비교 상태
  const default_region_b = useMemo(() => {
    if (!selected_region) return diagnosed_list[1] || diagnosed_list[0];
    // 영월군인 경우 평창군 우선 매칭 (Section 12 레퍼런스)
    if (selected_region.시군구명 === '영월군') {
      const pyeongchang = diagnosed_list.find((r) => r.시군구명 === '평창군');
      if (pyeongchang) return pyeongchang;
    }
    // 인근 시도 또는 유사 취약도 지자체
    return (
      diagnosed_list.find(
        (r) =>
          r.시군구코드 !== selected_region.시군구코드 &&
          (r.시도명 === selected_region.시도명 || r.종합_취약도_등급 === selected_region.종합_취약도_등급)
      ) || diagnosed_list[1]
    );
  }, [diagnosed_list, selected_region]);

  const [region_b_sgg, set_region_b_sgg] = useState<string>(default_region_b?.시군구명 || '');

  const region_b = useMemo(() => {
    return diagnosed_list.find((r) => r.시군구명 === region_b_sgg) || default_region_b;
  }, [region_b_sgg, diagnosed_list, default_region_b]);

  const region_comparison: 지역_비교_결과 | null = useMemo(() => {
    if (!selected_region || !region_b) return null;
    return 일대일_비교_엔진.compare_regions(selected_region, region_b);
  }, [selected_region, region_b]);

  // 2) 기관비교 상태
  const default_hospital_a = useMemo(() => {
    if (!selected_region) return 전국_지역거점_공공병원_데이터셋[0];
    return (
      전국_지역거점_공공병원_데이터셋.find((h) => h.시군구명 === selected_region.시군구명) ||
      전국_지역거점_공공병원_데이터셋[0]
    );
  }, [selected_region]);

  const [hospital_a_code, set_hospital_a_code] = useState<string>(default_hospital_a.병원코드);
  const [hospital_b_code, set_hospital_b_code] = useState<string>('GW-02'); // 기본: 원주의료원

  const hospital_a = useMemo(() => {
    return 전국_지역거점_공공병원_데이터셋.find((h) => h.병원코드 === hospital_a_code) || default_hospital_a;
  }, [hospital_a_code, default_hospital_a]);

  const hospital_b = useMemo(() => {
    return 전국_지역거점_공공병원_데이터셋.find((h) => h.병원코드 === hospital_b_code) || 전국_지역거점_공공병원_데이터셋[1];
  }, [hospital_b_code]);

  const hospital_comparison: 기관_비교_결과 = useMemo(() => {
    return 일대일_비교_엔진.compare_hospitals(hospital_a, hospital_b);
  }, [hospital_a, hospital_b]);

  if (!selected_region) return null;

  return (
    <div className="space-y-6">
      {/* ============================================================== */}
      {/* 1. 상단 타이틀 및 모드 전환 세그먼트 (Section 12)                    */}
      {/* ============================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
              02 지역 비교 · 1:1 벤치마킹
            </span>
            <span className="text-xs text-slate-400">Section 12 &amp; 13 표준 대시보드</span>
          </div>
          <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white mt-1 flex items-center gap-1.5">
            <GitCompare className="w-5 h-5 text-indigo-600" />
            <span>실시간 1:1 심층 비교 대시보드</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            비교 대상 지역과의 필수의료 인프라 및 핵심 지표 격차를 정밀 분석합니다.
          </p>
        </div>

        {/* 세그먼트 컨트롤러: 지역별 vs 기관별 */}
        <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs">
          <button
            onClick={() => set_compare_mode('region')}
            className={`px-3.5 py-1.5 font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              compare_mode === 'region'
                ? 'bg-white dark:bg-[#15161b] text-indigo-700 dark:text-indigo-300 shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>지자체 1:1 비교 (핵심)</span>
          </button>
          <button
            onClick={() => set_compare_mode('hospital')}
            className={`px-3.5 py-1.5 font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              compare_mode === 'hospital'
                ? 'bg-white dark:bg-[#15161b] text-indigo-700 dark:text-indigo-300 shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>거점 공공병원 비교</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. 지역별 1:1 비교 모드 (Section 12 & Section 13)                         */}
      {/* ========================================================================= */}
      {compare_mode === 'region' && region_comparison && (
        <div className="space-y-6">
          {/* 비교 지역 선택 패널 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/70 dark:bg-slate-900/60 p-4 rounded-3xl border border-slate-200 dark:border-slate-800">
            {/* 좌측: 기준 지역 */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                <span>기준 지역 (진단 지자체)</span>
              </label>
              <div className="p-3 bg-white dark:bg-[#15161b] rounded-2xl border border-blue-200 dark:border-blue-900/60 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-sm font-black text-slate-900 dark:text-white">
                    {selected_region.시도명} {selected_region.시군구명}
                  </span>
                  <span className="text-xs text-slate-400 block">
                    인구 {format_number_comma(selected_region.인구수)}명 • 취약도 {selected_region.종합_취약도_등급}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-md text-xs font-black bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  기준 지역
                </span>
              </div>
            </div>

            {/* 우측: 비교 대상 지역 선택 */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>비교 대상 지역 (지자체 변경 가능)</span>
              </label>
              <div className="relative">
                <select
                  value={region_b_sgg}
                  onChange={(e) => set_region_b_sgg(e.target.value)}
                  className="w-full text-xs font-bold bg-white dark:bg-[#15161b] p-3 rounded-2xl border-2 border-amber-300 dark:border-amber-700 text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-amber-500/10 cursor-pointer shadow-xs"
                >
                  {diagnosed_list.map((r) => (
                    <option key={`rb-${r.시도코드}-${r.시군구코드}`} value={r.시군구명}>
                      {r.시도명} {r.시군구명} ({r.종합_취약도_등급}, 인구 {format_number_comma(r.인구수)}명)
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 12 표준: 6대 핵심 필수의료 지표 대조 테이블/카드 그리드 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Section 12 · 6대 핵심 지표 1:1 정밀 대조
              </span>
              <span className="text-[11px] text-slate-400">헬스맵 2024 실데이터 기준</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {/* 1. 응급의료 미도달율 */}
              <div className="p-4 rounded-2.5xl bg-white dark:bg-[#15161b] border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300">① 응급 60분 미도달율</span>
                  <span className="text-[10px] text-slate-400">낮을수록 양호</span>
                </div>
                <div className="flex items-baseline justify-between pt-1">
                  <div>
                    <span className="text-[10px] text-blue-600 dark:text-blue-400 block font-semibold">{selected_region.시군구명}</span>
                    <span className="text-lg font-black text-blue-700 dark:text-blue-400">{selected_region.응급_60분_미도달_인구비율}%</span>
                  </div>
                  <span className="text-xs text-slate-400 font-bold">vs</span>
                  <div className="text-right">
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 block font-semibold">{region_comparison.지역B.시군구명}</span>
                    <span className="text-lg font-black text-amber-600 dark:text-amber-400">{region_comparison.지역B.응급_60분_미도달_인구비율}%</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 flex justify-between">
                  <span>미도달 격차:</span>
                  <strong className={region_comparison.응급_미도달_격차 > 0 ? 'text-red-600' : 'text-emerald-600'}>
                    {region_comparison.응급_미도달_격차 > 0 ? `+${region_comparison.응급_미도달_격차}%p (불리)` : `${region_comparison.응급_미도달_격차}%p (양호)`}
                  </strong>
                </div>
              </div>

              {/* 2. 관내 응급이용률 (RI) */}
              <div className="p-4 rounded-2.5xl bg-white dark:bg-[#15161b] border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300">② 관내 응급이용률 (RI)</span>
                  <span className="text-[10px] text-slate-400">높을수록 자립</span>
                </div>
                <div className="flex items-baseline justify-between pt-1">
                  <div>
                    <span className="text-[10px] text-blue-600 dark:text-blue-400 block font-semibold">{selected_region.시군구명}</span>
                    <span className="text-lg font-black text-blue-700 dark:text-blue-400">{selected_region.관내_응급_의료이용률}%</span>
                  </div>
                  <span className="text-xs text-slate-400 font-bold">vs</span>
                  <div className="text-right">
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 block font-semibold">{region_comparison.지역B.시군구명}</span>
                    <span className="text-lg font-black text-amber-600 dark:text-amber-400">{region_comparison.지역B.관내_응급_의료이용률}%</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 flex justify-between">
                  <span>자립도(RI) 격차:</span>
                  <strong className={region_comparison.응급_RI_격차 >= 0 ? 'text-emerald-600' : 'text-red-600'}>
                    {region_comparison.응급_RI_격차 > 0 ? `+${region_comparison.응급_RI_격차}%p (우세)` : `${region_comparison.응급_RI_격차}%p (열세)`}
                  </strong>
                </div>
              </div>

              {/* 3. 분만 60분 미도달율 */}
              <div className="p-4 rounded-2.5xl bg-white dark:bg-[#15161b] border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300">③ 분만 60분 미도달율</span>
                  <span className="text-[10px] text-slate-400">모자보건 취약도</span>
                </div>
                <div className="flex items-baseline justify-between pt-1">
                  <div>
                    <span className="text-[10px] text-blue-600 dark:text-blue-400 block font-semibold">{selected_region.시군구명}</span>
                    <span className="text-lg font-black text-blue-700 dark:text-blue-400">{selected_region.분만_60분_미도달_인구비율}%</span>
                  </div>
                  <span className="text-xs text-slate-400 font-bold">vs</span>
                  <div className="text-right">
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 block font-semibold">{region_comparison.지역B.시군구명}</span>
                    <span className="text-lg font-black text-amber-600 dark:text-amber-400">{region_comparison.지역B.분만_60분_미도달_인구비율}%</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 flex justify-between">
                  <span>분만 취약 격차:</span>
                  <strong className={selected_region.분만_60분_미도달_인구비율 > region_comparison.지역B.분만_60분_미도달_인구비율 ? 'text-red-600' : 'text-emerald-600'}>
                    {(selected_region.분만_60분_미도달_인구비율 - region_comparison.지역B.분만_60분_미도달_인구비율).toFixed(1)}%p
                  </strong>
                </div>
              </div>

              {/* 4. 관내 분만율 */}
              <div className="p-4 rounded-2.5xl bg-white dark:bg-[#15161b] border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300">④ 관내 분만율 (RI)</span>
                  <span className="text-[10px] text-slate-400">관내 출산 자립도</span>
                </div>
                <div className="flex items-baseline justify-between pt-1">
                  <div>
                    <span className="text-[10px] text-blue-600 dark:text-blue-400 block font-semibold">{selected_region.시군구명}</span>
                    <span className="text-lg font-black text-blue-700 dark:text-blue-400">{selected_region.관내_분만율}%</span>
                  </div>
                  <span className="text-xs text-slate-400 font-bold">vs</span>
                  <div className="text-right">
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 block font-semibold">{region_comparison.지역B.시군구명}</span>
                    <span className="text-lg font-black text-amber-600 dark:text-amber-400">{region_comparison.지역B.관내_분만율}%</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 flex justify-between">
                  <span>관내 분만 격차:</span>
                  <strong className={selected_region.관내_분만율 >= region_comparison.지역B.관내_분만율 ? 'text-emerald-600' : 'text-red-600'}>
                    {(selected_region.관내_분만율 - region_comparison.지역B.관내_분만율).toFixed(1)}%p
                  </strong>
                </div>
              </div>

              {/* 5. 소아 병상 공급비율 */}
              <div className="p-4 rounded-2.5xl bg-white dark:bg-[#15161b] border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300">⑤ 소아 병상 공급비율</span>
                  <span className="text-[10px] text-slate-400">소아 중증인프라</span>
                </div>
                <div className="flex items-baseline justify-between pt-1">
                  <div>
                    <span className="text-[10px] text-blue-600 dark:text-blue-400 block font-semibold">{selected_region.시군구명}</span>
                    <span className="text-lg font-black text-blue-700 dark:text-blue-400">
                      {selected_region.소아_병상_공급비율 === null ? '자료 없음' : `${selected_region.소아_병상_공급비율}%`}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 font-bold">vs</span>
                  <div className="text-right">
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 block font-semibold">{region_comparison.지역B.시군구명}</span>
                    <span className="text-lg font-black text-amber-600 dark:text-amber-400">
                      {region_comparison.지역B.소아_병상_공급비율 === null ? '자료 없음' : `${region_comparison.지역B.소아_병상_공급비율}%`}
                    </span>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 flex justify-between">
                  <span>공급 격차:</span>
                  <strong className="text-slate-600 dark:text-slate-300">
                    {region_comparison.소아_병상_격차 === null ? '자료 미확보' : `${region_comparison.소아_병상_격차}%p`}
                  </strong>
                </div>
              </div>

              {/* 6. 종합 취약도 등급 */}
              <div className="p-4 rounded-2.5xl bg-white dark:bg-[#15161b] border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300">⑥ 종합 취약도 등급</span>
                  <span className="text-[10px] text-slate-400">보건복지부 고시</span>
                </div>
                <div className="flex items-baseline justify-between pt-1">
                  <div>
                    <span className="text-[10px] text-blue-600 dark:text-blue-400 block font-semibold">{selected_region.시군구명}</span>
                    <span className="text-lg font-black text-red-600">{selected_region.종합_취약도_등급}</span>
                  </div>
                  <span className="text-xs text-slate-400 font-bold">vs</span>
                  <div className="text-right">
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 block font-semibold">{region_comparison.지역B.시군구명}</span>
                    <span className="text-lg font-black text-amber-600">{region_comparison.지역B.종합_취약도_등급}</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 flex justify-between">
                  <span>취약 분야 수:</span>
                  <strong>
                    {selected_region.취약분야_수}개소 vs {region_comparison.지역B.취약분야_수}개소
                  </strong>
                </div>
              </div>
            </div>
          </div>

          {/* ============================================================== */}
          {/* Section 13 표준: 차이점 자동 분석 ("주요 격차" 자동 패널)           */}
          {/* ============================================================== */}
          <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  Section 13 · 주요 격차 자동 분석 (객관적 통계 기반)
                </span>
              </div>
              <span className="text-xs text-indigo-700 dark:text-indigo-400 font-semibold bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded-full">
                자동 요약
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
              {/* 격차 요인 1: 응급의료 접근성 */}
              <div className="p-3.5 rounded-2xl bg-white dark:bg-[#15161b] border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  1. 응급의료 접근성 격차
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {selected_region.응급_60분_미도달_인구비율 > region_comparison.지역B.응급_60분_미도달_인구비율
                    ? `${selected_region.시군구명}이 ${region_comparison.지역B.시군구명} 대비 응급 60분 미도달율이 ${Math.abs(region_comparison.응급_미도달_격차)}%p 높아 상대적으로 취약합니다.`
                    : `${selected_region.시군구명}이 ${region_comparison.지역B.시군구명} 대비 응급 60분 도달율이 양호한 수준입니다.`}
                </p>
              </div>

              {/* 격차 요인 2: 분만의료 공백 */}
              <div className="p-3.5 rounded-2xl bg-white dark:bg-[#15161b] border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  2. 분만 의료공백 수준
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {selected_region.관내_분만율 < region_comparison.지역B.관내_분만율
                    ? `${selected_region.시군구명}의 관내 분만율(${selected_region.관내_분만율}%)이 ${region_comparison.지역B.시군구명}(${region_comparison.지역B.관내_분만율}%)보다 낮아 원정 분만 유출이 더 큽니다.`
                    : `${selected_region.시군구명}의 관내 분만 이용률이 비교 지역 대비 안정적으로 유지되고 있습니다.`}
                </p>
              </div>

              {/* 격차 요인 3: 종합 시사점 */}
              <div className="p-3.5 rounded-2xl bg-white dark:bg-[#15161b] border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  3. 정책적 시사점
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {region_comparison.종합_비교_시사점}
                </p>
              </div>
            </div>
          </div>

          {/* ============================================================== */}
          {/* Section 13 하단 Journey 연결 CTA: 03 수요예측으로 이동                */}
          {/* ============================================================== */}
          <div className="p-5 rounded-3xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-0.5 text-center sm:text-left">
              <span className="text-xs font-bold text-amber-800 dark:text-amber-300 block">
                다음 Journey 단계 안내
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                지역 격차 확인 후, 인구 고령화에 따른 <strong>2030년 장래 의료수요 변화 추이</strong>를 분석합니다.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {on_navigate_step && (
                <button
                  type="button"
                  onClick={() => on_navigate_step('regional_diagnosis')}
                  className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 transition flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>01 지역 진단</span>
                </button>
              )}
              {on_navigate_step && (
                <button
                  type="button"
                  onClick={() => on_navigate_step('forecast')}
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm transition active:scale-95 flex items-center gap-1.5 cursor-pointer"
                >
                  <span>03 수요 예측으로 이동</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. 거점 공공병원 1:1 비교 모드                                             */}
      {/* ========================================================================= */}
      {compare_mode === 'hospital' && (
        <div className="space-y-5">
          {/* 셀렉터 영역 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/70 dark:bg-slate-900/60 p-4 rounded-3xl border border-slate-200 dark:border-slate-800">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                <span>기준 병원 (선택 기관)</span>
              </label>
              <select
                value={hospital_a_code}
                onChange={(e) => set_hospital_a_code(e.target.value)}
                className="w-full text-xs font-bold bg-white dark:bg-[#15161b] p-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              >
                {전국_지역거점_공공병원_데이터셋.map((h) => (
                  <option key={`a-${h.병원코드}`} value={h.병원코드}>
                    {h.병원명} ({h.시군구명}, {h.허가병상수}병상)
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                <span>비교 대상 병원 (벤치마킹)</span>
              </label>
              <select
                value={hospital_b_code}
                onChange={(e) => set_hospital_b_code(e.target.value)}
                className="w-full text-xs font-bold bg-white dark:bg-[#15161b] p-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              >
                {전국_지역거점_공공병원_데이터셋.map((h) => (
                  <option key={`b-${h.병원코드}`} value={h.병원코드}>
                    {h.병원명} ({h.시군구명}, {h.허가병상수}병상)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 4대 진료실적 좌우 비교 지표 카드 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-white dark:bg-[#15161b] p-4 rounded-2.5xl border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-slate-500 text-xs">연간 총 내원일수</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-sm font-bold text-blue-600">{format_number_comma(hospital_a.전체_내원일수)}일</span>
                <span className="text-xs text-slate-400">vs</span>
                <span className="text-sm font-bold text-indigo-600">{format_number_comma(hospital_b.전체_내원일수)}일</span>
              </div>
              <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                격차: {hospital_comparison.내원일수_격차 > 0 ? `+${format_number_comma(hospital_comparison.내원일수_격차)}일` : `${format_number_comma(hospital_comparison.내원일수_격차)}일`}
              </div>
            </div>

            <div className="bg-white dark:bg-[#15161b] p-4 rounded-2.5xl border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-slate-500 text-xs">평균 재원일수</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-sm font-bold text-blue-600">{hospital_a.건당_내원일수}일</span>
                <span className="text-xs text-slate-400">vs</span>
                <span className="text-sm font-bold text-indigo-600">{hospital_b.건당_내원일수}일</span>
              </div>
              <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                격차: {(hospital_a.건당_내원일수 - hospital_b.건당_내원일수).toFixed(1)}일
              </div>
            </div>

            <div className="bg-white dark:bg-[#15161b] p-4 rounded-2.5xl border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-slate-500 text-xs">건당 진료비</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-sm font-bold text-blue-600">{Math.round(hospital_a.건당_진료비 / 10000)}만원</span>
                <span className="text-xs text-slate-400">vs</span>
                <span className="text-sm font-bold text-indigo-600">{Math.round(hospital_b.건당_진료비 / 10000)}만원</span>
              </div>
              <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                격차: {Math.round(hospital_comparison.진료비_격차 / 10000)}만원
              </div>
            </div>

            <div className="bg-white dark:bg-[#15161b] p-4 rounded-2.5xl border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-slate-500 text-xs">입원일당 진료비</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-sm font-bold text-blue-600">{format_number_comma(hospital_a.입원일당_진료비)}원</span>
                <span className="text-xs text-slate-400">vs</span>
                <span className="text-sm font-bold text-indigo-600">{format_number_comma(hospital_b.입원일당_진료비)}원</span>
              </div>
              <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                격차: {format_number_comma(hospital_comparison.입원일당_격차)}원
              </div>
            </div>
          </div>

          {/* 종합 시사점 카드 */}
          <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2.5xl border border-slate-200 dark:border-slate-800 text-xs space-y-1.5">
            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>1:1 벤치마킹 종합 평가 및 사업 당위성 시사점</span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed pl-5">
              {hospital_comparison.종합_비교_평가}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
