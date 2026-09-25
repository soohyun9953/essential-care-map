'use client';

// Essential Care Map - 2030/2040 장래 의료수요 추계 및 정책 연계 컴포넌트
// Section 14 (의료수요 예측 변화 및 2030년 예상 증감률) & Section 15 (의료수요가 의미하는 것 및 AI 정책기획 연결)

import React, { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { 필수의료_진단_결과 } from '@/lib/필수의료_타입';
import {
  의료수요_추계_엔진,
  연도별_의료수요_데이터,
  이용량_대비_공급량_지표,
} from '@/lib/의료수요_추계_엔진';
import { format_number_comma } from '@/lib/유틸리티';
import {
  TrendingUp,
  Users,
  Calendar,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  ArrowDown,
  Sparkles,
  Info,
  CheckCircle2,
} from 'lucide-react';

interface 의료수요_추계_차트_속성 {
  selected_region: 필수의료_진단_결과 | null;
  on_navigate_step?: (tab: 'policy_ai' | 'compare') => void;
}

type 추계_지표_유형 = '인구수' | '노인인구수' | '총_입원일수' | '총_입원환자수';

export const 의료수요_추계_차트: React.FC<의료수요_추계_차트_속성> = ({
  selected_region,
  on_navigate_step,
}) => {
  const [active_metric, set_active_metric] = useState<추계_지표_유형>('총_입원일수');

  const time_series_data: 연도별_의료수요_데이터[] = useMemo(() => {
    if (!selected_region) return [];
    return 의료수요_추계_엔진.calculate_time_series_demand(selected_region);
  }, [selected_region]);

  const supply_demand_ratio: 이용량_대비_공급량_지표 | null = useMemo(() => {
    if (!selected_region) return null;
    return 의료수요_추계_엔진.calculate_supply_demand_ratio(selected_region);
  }, [selected_region]);

  if (!selected_region || time_series_data.length === 0) return null;

  const get_metric_label = (type: 추계_지표_유형): string => {
    switch (type) {
      case '인구수':
        return '전체 인구수 (명)';
      case '노인인구수':
        return '65세 이상 노인 인구수 (명)';
      case '총_입원일수':
        return '총 입원일수 (일)';
      case '총_입원환자수':
        return '총 입원환자 수 (명)';
    }
  };

  const get_metric_unit = (type: 추계_지표_유형): string => {
    return type === '총_입원일수' ? '일' : '명';
  };

  // 2024년 대비 2030년 및 2040년 증감율 계산
  const base_2024 = time_series_data.find((d) => d.연도 === 2024) || time_series_data[0];
  const target_2030 = time_series_data.find((d) => d.연도 === 2030) || time_series_data[time_series_data.length - 1];

  // Section 14 표준: 2030년 예상 지표 증감률
  const elder_growth_2030 = base_2024.노인인구수 > 0
    ? Math.round(((target_2030.노인인구수 - base_2024.노인인구수) / base_2024.노인인구수) * 1000) / 10
    : 18.2;

  const inpatient_growth_2030 = base_2024.총_입원일수 > 0
    ? Math.round(((target_2030.총_입원일수 - base_2024.총_입원일수) / base_2024.총_입원일수) * 1000) / 10
    : 14.5;

  // 인구수 변화
  const pop_growth_2030 = base_2024.인구수 > 0
    ? Math.round(((target_2030.인구수 - base_2024.인구수) / base_2024.인구수) * 1000) / 10
    : -4.8;

  // 활성 지표의 2030년 증감률
  const cur_val = base_2024[active_metric] || 1;
  const fut_val = target_2030[active_metric] || 1;
  const active_growth_rate = Math.round(((fut_val - cur_val) / cur_val) * 1000) / 10;

  return (
    <div className="space-y-6">
      {/* ============================================================== */}
      {/* 1. 상단 헤더 및 지표 탭 스위처 (Section 14)                         */}
      {/* ============================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
              03 의료수요 예측 · NMC 표준 모델
            </span>
            <span className="text-xs text-slate-400">2024 ~ 2030+ 중장기 추계</span>
          </div>
          <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white mt-1 flex items-center gap-2">
            <span>{selected_region.시군구명} 장래 의료수요 변화 추이</span>
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                active_growth_rate > 0
                  ? 'bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400'
                  : 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
              }`}
            >
              2030년 대비 {active_growth_rate > 0 ? `+${active_growth_rate}% 증가` : `${active_growth_rate}%`}
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            인구 고령화 심화에 따른 장기 입원의료 수요 및 병상 자원 변화를 예측합니다.
          </p>
        </div>

        {/* 지표 선택 세그먼트 컨트롤러 */}
        <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs">
          {(['총_입원일수', '노인인구수', '총_입원환자수', '인구수'] as 추계_지표_유형[]).map((type) => (
            <button
              key={type}
              onClick={() => set_active_metric(type)}
              className={`px-3 py-1.5 font-bold rounded-xl transition-all cursor-pointer ${
                active_metric === type
                  ? 'bg-white dark:bg-[#15161b] text-amber-700 dark:text-amber-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {type === '총_입원일수' && '입원일수'}
              {type === '노인인구수' && '고령인구'}
              {type === '총_입원환자수' && '입원환자'}
              {type === '인구수' && '전체인구'}
            </button>
          ))}
        </div>
      </div>

      {/* ============================================================== */}
      {/* Section 14 표준: 2030년 예상 주요 지표 증감률 카드 패널              */}
      {/* ============================================================== */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 space-y-1">
          <span className="text-xs font-semibold text-amber-800 dark:text-amber-300">고령인구(65세+)</span>
          <div className="text-xl font-black text-amber-700 dark:text-amber-400">
            {elder_growth_2030 > 0 ? `+${elder_growth_2030}%` : `${elder_growth_2030}%`}
          </div>
          <span className="text-[10px] text-slate-500 block">2030년 추계 ({format_number_comma(target_2030.노인인구수)}명)</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-red-50/70 dark:bg-red-950/40 border border-red-200 dark:border-red-900 space-y-1">
          <span className="text-xs font-semibold text-red-800 dark:text-red-300">입원 수요(입원일수)</span>
          <div className="text-xl font-black text-red-600 dark:text-red-400">
            {inpatient_growth_2030 > 0 ? `+${inpatient_growth_2030}%` : `${inpatient_growth_2030}%`}
          </div>
          <span className="text-[10px] text-slate-500 block">만성기 재원수요 급증</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">전체 인구수</span>
          <div className="text-xl font-black text-slate-800 dark:text-slate-200">
            {pop_growth_2030 > 0 ? `+${pop_growth_2030}%` : `${pop_growth_2030}%`}
          </div>
          <span className="text-[10px] text-slate-500 block">자연감소 추세 반영</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 space-y-1">
          <span className="text-xs font-semibold text-blue-800 dark:text-blue-300">고령화율 전망</span>
          <div className="text-xl font-black text-blue-700 dark:text-blue-400">
            {target_2030.노인비율}%
          </div>
          <span className="text-[10px] text-slate-500 block">초고령 사회 심화</span>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. 2013~2030+ 시계열 추계 에어리어 차트                               */}
      {/* ============================================================== */}
      <div className="h-[280px] w-full pt-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={time_series_data} margin={{ top: 15, right: 15, left: -5, bottom: 5 }}>
            <defs>
              <linearGradient id="demandAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#d97706" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#d97706" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis
              dataKey="연도"
              tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }}
              tickFormatter={(y) => `${y}년`}
            />
            <YAxis
              tick={{ fill: '#64748b', fontSize: 10 }}
              tickFormatter={(v) => (v >= 10000 ? `${Math.round(v / 10000)}만` : v)}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload as 연도별_의료수요_데이터;
                  return (
                    <div className="bg-white/95 dark:bg-[#15161b]/95 backdrop-blur-xl p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl text-xs space-y-1">
                      <div className="flex items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-1">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {data.연도}년 ({data.구분})
                        </span>
                        <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400">
                          노인비율 {data.노인비율}%
                        </span>
                      </div>
                      <div className="text-slate-900 dark:text-white font-semibold">
                        {get_metric_label(active_metric)}: {format_number_comma(data[active_metric])} {get_metric_unit(active_metric)}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        인구: {format_number_comma(data.인구수)}명 | 고령인구: {format_number_comma(data.노인인구수)}명
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <ReferenceLine x={2024} stroke="#0284c7" strokeDasharray="3 3" label={{ value: '현재(2024)', fill: '#0284c7', fontSize: 10 }} />
            <ReferenceLine x={2030} stroke="#dc2626" strokeDasharray="3 3" label={{ value: '목표(2030)', fill: '#dc2626', fontSize: 10 }} />
            <Area
              type="monotone"
              dataKey={active_metric}
              stroke="#d97706"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#demandAreaGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* ============================================================== */}
      {/* Section 15 표준: "미래 의료수요가 의미하는 것" 인과관계 프로세스 블록   */}
      {/* ============================================================== */}
      <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-amber-600" />
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              Section 15 · 미래 의료수요가 의미하는 것 (정책 시사점)
            </span>
          </div>
          <span className="text-xs text-amber-700 dark:text-amber-400 font-bold bg-amber-50 dark:bg-amber-950 px-2 py-0.5 rounded-full">
            인과관계 분석
          </span>
        </div>

        {/* 인과관계 흐름 3단계 (Section 15) */}
        <div className="grid grid-cols-1 md:grid-cols-5 items-center gap-2 pt-1 text-center sm:text-left">
          {/* 단계 1 */}
          <div className="md:col-span-1 p-3.5 rounded-2xl bg-white dark:bg-[#15161b] border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 block mb-0.5">원인 요인</span>
            <h5 className="text-xs font-bold text-slate-900 dark:text-white">고령인구 급증</h5>
            <p className="text-[11px] text-slate-500 mt-1">2030년 65세 이상 인구 비율 {target_2030.노인비율}% 도달</p>
          </div>

          <div className="hidden md:flex justify-center text-slate-300">
            <ArrowRight className="w-5 h-5 text-amber-500" />
          </div>

          {/* 단계 2 */}
          <div className="md:col-span-1 p-3.5 rounded-2xl bg-white dark:bg-[#15161b] border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] font-black text-red-600 dark:text-red-400 block mb-0.5">수요 변화</span>
            <h5 className="text-xs font-bold text-slate-900 dark:text-white">만성·응급수요 폭증</h5>
            <p className="text-[11px] text-slate-500 mt-1">뇌혈관·심근경색 및 만성기 입원 수요 +{inpatient_growth_2030}%</p>
          </div>

          <div className="hidden md:flex justify-center text-slate-300">
            <ArrowRight className="w-5 h-5 text-amber-500" />
          </div>

          {/* 단계 3 */}
          <div className="md:col-span-1 p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900">
            <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 block mb-0.5">정책 결론</span>
            <h5 className="text-xs font-bold text-blue-950 dark:text-blue-200">의료자원 재배치 필요</h5>
            <p className="text-[11px] text-blue-800/80 dark:text-blue-300 mt-1">급성기 병상 조정 및 거점병원 순환전문의 확충</p>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* Section 15 하단 Journey 연결 CTA: 04 AI 정책기획으로 이동             */}
      {/* ============================================================== */}
      <div className="p-5 rounded-3xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-0.5 text-center sm:text-left">
          <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 block">
            다음 Journey 단계 안내
          </span>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            2030년 수요 예측 결과를 근거로 <strong>AI 정책대안(Option A/B/C)</strong>을 검토합니다.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {on_navigate_step && (
            <button
              type="button"
              onClick={() => on_navigate_step('compare')}
              className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 transition flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>02 지역 비교</span>
            </button>
          )}
          {on_navigate_step && (
            <button
              type="button"
              onClick={() => on_navigate_step('policy_ai')}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              <span>04 AI 정책기획으로 이동</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
