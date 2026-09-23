'use client';

import React, { useState, useMemo } from 'react';
import {
  Sliders,
  Building2,
  TrendingUp,
  ShieldCheck,
  Activity,
  ArrowUpRight,
  ArrowDownLeft,
  DollarSign,
  HeartPulse,
  Sparkles,
  FileText,
  Share2,
  CheckCircle2,
  Clock,
  Stethoscope,
  Maximize2,
  RefreshCw,
  Info,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from 'recharts';
import {
  시뮬레이션_입력_파라미터,
  시뮬레이션_예측_결과,
  시뮬레이션_기본_프리셋,
  calculate_simulation,
} from '@/lib/공공의료_시뮬레이션_엔진';
import { 환자_유출입_시군구_목록 } from '@/lib/환자_유출입_데이터셋';
import { 필수의료_진단_결과 } from '@/lib/필수의료_타입';
import { format_number_comma } from '@/lib/유틸리티';

interface 인프라_확충_시뮬레이터_속성 {
  selected_region?: 필수의료_진단_결과 | null;
  on_navigate?: (menu_id: string) => void;
}

export default function 인프라_확충_시뮬레이터({
  selected_region,
  on_navigate,
}: 인프라_확충_시뮬레이터_속성) {
  // 기본 지자체: 영월군 또는 부모 컴포넌트의 selected_region
  const [selected_sgg, set_selected_sgg] = useState<string>(
    selected_region?.시군구명 || '영월군'
  );
  const [selected_sido, set_selected_sido] = useState<string>(
    selected_region?.시도명 || '강원특별자치도'
  );

  // 시뮬레이션 파라미터 상태
  const [params, set_params] = useState<시뮬레이션_입력_파라미터>({
    sgg_name: selected_region?.시군구명 || '영월군',
    sido_name: selected_region?.시도명 || '강원특별자치도',
    add_general_beds: 40,
    add_icu_beds: 6,
    add_dialysis_beds: 14,
    add_er_beds: 10,
    add_specialists: 4,
    bed_occupancy_rate: 82,
    has_mri: true,
    has_ct: true,
    has_angio: false,
  });

  // 활성 프리셋
  const [active_preset, set_active_preset] = useState<string>('medium');

  // 지자체 변경 핸들러
  const handle_change_region = (sgg_name: string) => {
    const item = 환자_유출입_시군구_목록.find((x) => x.sgg === sgg_name);
    if (!item) return;
    set_selected_sgg(item.sgg);
    set_selected_sido(item.sido);
    set_params((prev) => ({
      ...prev,
      sgg_name: item.sgg,
      sido_name: item.sido,
    }));
  };

  // 프리셋 적용 핸들러
  const handle_apply_preset = (preset_id: 'small' | 'medium' | 'large') => {
    const preset = 시뮬레이션_기본_프리셋.find((p) => p.id === preset_id);
    if (!preset) return;
    set_active_preset(preset_id);
    set_params((prev) => ({
      ...prev,
      ...preset.params,
    }));
  };

  // 시뮬레이션 결과 실시간 연산
  const sim_result: 시뮬레이션_예측_결과 = useMemo(() => {
    return calculate_simulation(params, selected_region);
  }, [params, selected_region]);

  // 자체충족률 Before / After 차트 데이터
  const ri_chart_data = useMemo(() => {
    return [
      {
        name: '자체충족률 (RI)',
        기존: sim_result.original_ri,
        시뮬레이션후: sim_result.simulated_ri,
      },
      {
        name: '관외 유출률',
        기존: sim_result.original_outflow_rate,
        시뮬레이션후: sim_result.simulated_outflow_rate,
      },
      {
        name: '골든타임 도달률',
        기존: Number((100 - (selected_region?.응급_60분_미도달_인구비율 || 52.4)).toFixed(1)),
        시뮬레이션후: sim_result.golden_hour_coverage_pct,
      },
    ];
  }, [sim_result, selected_region]);

  // 상위 유출지별 흡수량 스택 차트 데이터
  const outflow_dest_chart_data = useMemo(() => {
    return sim_result.dest_absorptions.map((d) => ({
      name: `${d.dest_sgg}`,
      관내흡수: d.absorbed_days,
      잔여유출: d.remaining_days,
      기존유출: d.original_days,
    }));
  }, [sim_result]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* ============================================================== */}
      {/* 1. 상단 타이틀 & 지자체 선택 & 프리셋 바 */}
      {/* ============================================================== */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                국립중앙의료원 표준 산식 기반 실시간 정책 시뮬레이터
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium hidden sm:inline-block">
                OD 실데이터 6.2만건 & 공공병원 214개 DB 연동
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              공공의료 인프라 확충 효과 시뮬레이터
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">
              지방의료원 병상 증설, 전문의 충원, 첨단장비 도입에 따른 <strong>자체충족률(RI) 상승</strong>과 <strong>관외 유출 환자 흡수량</strong>, <strong>군민 의료비 절감 편익</strong>을 실시간 예측합니다.
            </p>
          </div>

          {/* 지자체 선택 드롭다운 */}
          <div className="flex items-center gap-2.5 bg-slate-50 dark:bg-slate-800/80 p-2 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shrink-0">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300 pl-2">
              분석 대상:
            </span>
            <select
              value={selected_sgg}
              onChange={(e) => handle_change_region(e.target.value)}
              className="px-3 py-2 text-sm font-semibold rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              {환자_유출입_시군구_목록.map((item) => (
                <option key={item.sgg} value={item.sgg}>
                  [{item.sido.substring(0, 2)}] {item.sgg}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 원클릭 시나리오 프리셋 선택 바 */}
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-3">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Sliders className="w-3.5 h-3.5" />
            시나리오 프리셋:
          </span>
          {시뮬레이션_기본_프리셋.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handle_apply_preset(preset.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                active_preset === preset.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <span>{preset.title}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                  active_preset === preset.id ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                {preset.desc.split('+')[1] ? `+${preset.desc.split('+')[1]}` : ''}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. 핵심 예측 KPI 4종 카드 */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: 자체충족률(RI) 상승 */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              예측 자체충족률 (RI)
            </span>
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 flex items-baseline gap-1.5">
              {sim_result.simulated_ri}%
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-100/70 dark:bg-emerald-900/60 px-1.5 py-0.5 rounded-md">
                +{sim_result.ri_gain_pct_point}%p 상승
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              기존 {sim_result.original_ri}% ➔ {sim_result.simulated_ri}% 달성
            </p>
          </div>
        </div>

        {/* KPI 2: 관외 유출 감소율 */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              관외 환자 유출률 감소
            </span>
            <span className="p-2 rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
              <ArrowDownLeft className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 dark:text-white flex items-baseline gap-1.5">
              {sim_result.simulated_outflow_rate}%
              <span className="text-xs font-semibold text-rose-700 dark:text-rose-300 bg-rose-100/70 dark:bg-rose-900/60 px-1.5 py-0.5 rounded-md">
                -{sim_result.outflow_reduction_pct_point}%p 개선
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              기존 {sim_result.original_outflow_rate}% ➔ {sim_result.simulated_outflow_rate}%로 축소
            </p>
          </div>
        </div>

        {/* KPI 3: 관내 환자 흡수 재원일수 */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              연간 관내 흡수 재원일수
            </span>
            <span className="p-2 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
              <Activity className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              +{format_number_comma(sim_result.total_absorbed_days)}
              <span className="text-sm font-normal text-slate-500 dark:text-slate-400 ml-1">일/년</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              기존 {format_number_comma(sim_result.original_self_days)}일 ➔ {format_number_comma(sim_result.simulated_self_days)}일
            </p>
          </div>
        </div>

        {/* KPI 4: 군민 원정진료비 절감액 */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              군민 경제적 편익 (교통·간병비)
            </span>
            <span className="p-2 rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              약 {(sim_result.resident_economic_benefit / 100000000).toFixed(1)}
              <span className="text-sm font-normal text-slate-500 dark:text-slate-400 ml-1">억 원/년</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              병원 연간 진료수익: 약 +{(sim_result.hospital_annual_revenue / 100000000).toFixed(1)}억 원
            </p>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. 메인 그리드 (좌: 슬라이더 컨트롤러, 우: Recharts 비교 차트) */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 좌측 5칸: 인터랙티브 인프라 확충 컨트롤러 */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-500" />
              인프라 확충 시나리오 변수 설정
            </h3>
            <span className="text-xs text-slate-400 font-medium">
              총 +{sim_result.total_added_beds}병상 증설
            </span>
          </div>

          {/* 대상 의료원 현황 정보 */}
          <div className="p-3.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 text-xs space-y-1">
            <div className="font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-indigo-600" />
              {sim_result.public_hospital ? sim_result.public_hospital.기관명 : `${selected_sgg} 공공병원`}
            </div>
            <div className="text-indigo-700/80 dark:text-indigo-300/80">
              현재 운영 병상: <strong>{sim_result.current_beds}병상</strong> ➔ 시뮬레이션 후 <strong>{sim_result.new_total_beds}병상</strong>
            </div>
          </div>

          {/* 슬라이더 1: 일반/급성기 병상 */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                일반·급성기 병상 증설
              </span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400">
                +{params.add_general_beds}병상
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="120"
              step="5"
              value={params.add_general_beds}
              onChange={(e) => {
                set_active_preset('custom');
                set_params({ ...params, add_general_beds: Number(e.target.value) });
              }}
              className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
            />
          </div>

          {/* 슬라이더 2: 중환자실(ICU) 병상 */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                중환자실 (ICU) 병상 증설
              </span>
              <span className="font-bold text-rose-600 dark:text-rose-400">
                +{params.add_icu_beds}병상
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="20"
              step="2"
              value={params.add_icu_beds}
              onChange={(e) => {
                set_active_preset('custom');
                set_params({ ...params, add_icu_beds: Number(e.target.value) });
              }}
              className="w-full accent-rose-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
            />
          </div>

          {/* 슬라이더 3: 인공신장실(혈액투석) 병상 */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                인공신장실 (혈액투석) 병상 확충
              </span>
              <span className="font-bold text-amber-600 dark:text-amber-400">
                +{params.add_dialysis_beds}병상
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="25"
              step="1"
              value={params.add_dialysis_beds}
              onChange={(e) => {
                set_active_preset('custom');
                set_params({ ...params, add_dialysis_beds: Number(e.target.value) });
              }}
              className="w-full accent-amber-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
            />
          </div>

          {/* 슬라이더 4: 응급실 관찰병상 */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                응급실 관찰·격리병상
              </span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                +{params.add_er_beds}병상
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="15"
              step="1"
              value={params.add_er_beds}
              onChange={(e) => {
                set_active_preset('custom');
                set_params({ ...params, add_er_beds: Number(e.target.value) });
              }}
              className="w-full accent-emerald-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
            />
          </div>

          {/* 슬라이더 5: 필수의료 전문의 충원 */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                필수의료 전문의 충원 (내/외/신장/응급)
              </span>
              <span className="font-bold text-purple-600 dark:text-purple-400">
                +{params.add_specialists}명 충원
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              step="1"
              value={params.add_specialists}
              onChange={(e) => {
                set_active_preset('custom');
                set_params({ ...params, add_specialists: Number(e.target.value) });
              }}
              className="w-full accent-purple-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
            />
          </div>

          {/* 슬라이더 6: 목표 병상가동률 */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                목표 병상가동률
              </span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {params.bed_occupancy_rate}%
              </span>
            </div>
            <input
              type="range"
              min="65"
              max="95"
              step="1"
              value={params.bed_occupancy_rate}
              onChange={(e) => {
                set_active_preset('custom');
                set_params({ ...params, bed_occupancy_rate: Number(e.target.value) });
              }}
              className="w-full accent-slate-700 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
            />
          </div>

          {/* 첨단 진단장비 도입 옵션 */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
              첨단 진단장비 도입 여부 (진료역량 가중치 부여):
            </span>
            <div className="grid grid-cols-3 gap-2">
              <label className="flex items-center gap-1.5 p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">
                <input
                  type="checkbox"
                  checked={params.has_mri}
                  onChange={(e) => {
                    set_active_preset('custom');
                    set_params({ ...params, has_mri: e.target.checked });
                  }}
                  className="rounded text-indigo-600"
                />
                <span className="text-slate-700 dark:text-slate-300 font-medium">3.0T MRI</span>
              </label>

              <label className="flex items-center gap-1.5 p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">
                <input
                  type="checkbox"
                  checked={params.has_ct}
                  onChange={(e) => {
                    set_active_preset('custom');
                    set_params({ ...params, has_ct: e.target.checked });
                  }}
                  className="rounded text-indigo-600"
                />
                <span className="text-slate-700 dark:text-slate-300 font-medium">128ch CT</span>
              </label>

              <label className="flex items-center gap-1.5 p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">
                <input
                  type="checkbox"
                  checked={params.has_angio}
                  onChange={(e) => {
                    set_active_preset('custom');
                    set_params({ ...params, has_angio: e.target.checked });
                  }}
                  className="rounded text-indigo-600"
                />
                <span className="text-slate-700 dark:text-slate-300 font-medium">혈관조영기</span>
              </label>
            </div>
          </div>
        </div>

        {/* 우측 7칸: Recharts 시각화 및 정책 진단 브리핑 */}
        <div className="lg:col-span-7 space-y-6">
          {/* 차트 1: 자체충족률(RI) Before vs After 비교 바 차트 */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-500" />
                  핵심 지표 Before ➔ After 시뮬레이션 비교 (%)
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  인프라 확충에 따른 지표 개선 효과를 실시간으로 비교 분석합니다.
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                RI +{sim_result.ri_gain_pct_point}%p 개선
              </span>
            </div>

            <div className="w-full h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ri_chart_data} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <RechartsTooltip
                    formatter={(val: number) => [`${val}%`, '']}
                    contentStyle={{ borderRadius: '12px', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                  <Bar dataKey="기존" fill="#94a3b8" radius={[4, 4, 0, 0]} barSize={26} />
                  <Bar dataKey="시뮬레이션후" fill="#10b981" radius={[4, 4, 0, 0]} barSize={26} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 차트 2: 상위 유출지별 환자 흡수량(일) 스택 차트 */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-blue-500" />
                  상위 유출지별 환자 관내 흡수량 및 잔여 유출 (재원일수)
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  인접 거점도시(제천·원주 등)로 빠져나가던 환자의 흡수 규모
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
                총 {format_number_comma(sim_result.total_absorbed_days)}일 흡수
              </span>
            </div>

            <div className="w-full h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={outflow_dest_chart_data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <RechartsTooltip
                    formatter={(val: number) => [`${format_number_comma(val)}일`, '']}
                    contentStyle={{ borderRadius: '12px', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                  <Bar dataKey="관내흡수" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} barSize={32} />
                  <Bar dataKey="잔여유출" stackId="a" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 4. AI 정책 진단 브리핑 및 사업계획서 자동 연계 액션 카드 */}
      {/* ============================================================== */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-700 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm text-xs font-semibold text-indigo-100 border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              AI 시뮬레이션 정책 진단 브리핑 (단체장·의회 보고용)
            </div>
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
              {sim_result.sido_name} {sim_result.sgg_name} 인프라 확충 타당성 결론
            </h3>
            <p className="text-sm text-indigo-100/90 leading-relaxed">
              총 <strong>{sim_result.total_added_beds}병상</strong> 확충 및 전문의 <strong>{sim_result.added_specialists}명</strong> 충원 시,
              관내 자체충족률(RI)은 기존 <strong>{sim_result.original_ri}%</strong>에서 <strong>{sim_result.simulated_ri}%</strong>로{' '}
              <strong>+{sim_result.ri_gain_pct_point}%p</strong> 대폭 상승하며,
              연간 <strong>{format_number_comma(sim_result.total_absorbed_days)}일</strong>의 관외 유출 재원일수를 관내로 흡수합니다.
              이를 통해 <strong>군민 원정진료비 연간 약 {(sim_result.resident_economic_benefit / 100000000).toFixed(1)}억 원 절감</strong> 및
              공공병원 진료수익 약 <strong>+{(sim_result.hospital_annual_revenue / 100000000).toFixed(1)}억 원</strong>의 경영개선 효과가 입증됩니다.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0">
            <button
              onClick={() => on_navigate && on_navigate('report_generator')}
              className="px-5 py-3 rounded-2xl bg-white text-indigo-700 font-bold text-sm hover:bg-indigo-50 transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              이 시뮬레이션으로 사업계획서 생성
            </button>
            <button
              onClick={() => on_navigate && on_navigate('patient_flow')}
              className="px-5 py-3 rounded-2xl bg-indigo-500/40 hover:bg-indigo-500/60 text-white font-semibold text-sm border border-white/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              환자 이동 플로우맵으로 확인
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
