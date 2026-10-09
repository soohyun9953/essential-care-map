'use client';

import React, { useState, useMemo } from 'react';
import {
  ArrowUpRight,
  ArrowDownLeft,
  Building2,
  TrendingUp,
  MapPin,
  Layers,
  HelpCircle,
  Sparkles,
  ChevronRight,
  Activity,
  HeartPulse,
} from 'lucide-react';
import {
  get_sgg_flow_rankings,
  유출입_구분,
  분석_단위,
  유출입_순위_항목,
} from '@/lib/환자_유출입_분석_엔진';
import { 환자_유출입_2024_데이터 } from '@/lib/환자_유출입_데이터셋';
import { format_number_comma } from '@/lib/유틸리티';

interface 환자_유출입_상세분석_카드_속성 {
  sgg_name: string;
  sido_name?: string;
  on_open_qa_modal?: (initial_query?: string) => void;
}

export const 환자_유출입_상세분석_카드: React.FC<환자_유출입_상세분석_카드_속성> = ({
  sgg_name,
  sido_name,
  on_open_qa_modal,
}) => {
  const [direction, set_direction] = useState<유출입_구분>('유출');
  const [unit, set_unit] = useState<분석_단위>('시군구');

  // 원천 시군구 유출입 데이터
  const flow_meta = useMemo(() => {
    return 환자_유출입_2024_데이터[sgg_name] || null;
  }, [sgg_name]);

  // 순위 목록 집계
  const ranking_list: 유출입_순위_항목[] = useMemo(() => {
    return get_sgg_flow_rankings(sgg_name, direction, unit, 5);
  }, [sgg_name, direction, unit]);

  // 최대 점유율 (프로그레스 바 비율 산출용)
  const max_pct = useMemo(() => {
    if (ranking_list.length === 0) return 100;
    return Math.max(...ranking_list.map((r) => r.pct), 10);
  }, [ranking_list]);

  if (!flow_meta) {
    return (
      <div className="bg-white dark:bg-[#15161b] rounded-2xl p-5 border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500">
        선택된 지자체({sgg_name})의 환자 의료이용 실데이터셋을 집계 중입니다.
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#15161b] rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
      {/* 상단 헤더: 타이틀 & AI 질의응답 진입 버튼 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <TrendingUp className="w-4 h-4" />
            </span>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              환자 의료이용 유출입 네트워크 Top 5
            </h3>
            <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
              2024 실데이터
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {sido_name || flow_meta.sido} {sgg_name} 환자의 거주지 이동 및 타지역 유입 실태 분석
          </p>
        </div>

        {/* AI 질의응답 모달 호출 버튼 */}
        {on_open_qa_modal && (
          <button
            type="button"
            onClick={() => on_open_qa_modal(`중진료권별 유출 Top10과 유출 재원일수 보여줘.`)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-xs hover:shadow transition-all shrink-0 cursor-pointer"
            title="자연어 질의로 전국 권역·시도·시군구 의료이용 유출입 분석"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>의료이용 AI 질의응답</span>
          </button>
        )}
      </div>

      {/* 핵심 요약 지표 카드 4종 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">자체충족률(RI)</div>
          <div className="text-base font-bold text-blue-600 dark:text-blue-400 mt-0.5">
            {flow_meta.ri}%
          </div>
        </div>
        <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">관외 유출률</div>
          <div className="text-base font-bold text-rose-500 dark:text-rose-400 mt-0.5">
            {flow_meta.outflow_rate}%
          </div>
        </div>
        <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">총 재원일수</div>
          <div className="text-base font-bold text-slate-800 dark:text-slate-200 mt-0.5">
            {format_number_comma(flow_meta.total_days)}일
          </div>
        </div>
        <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">타지역 유입일수</div>
          <div className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
            {format_number_comma(flow_meta.outsider_inflow_days)}일
          </div>
        </div>
      </div>

      {/* 필터 탭 바: 1) 유출/유입 선택, 2) 시군구/중진료권/시도 단위 선택 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1">
        {/* 방향 토글: 유출 vs 유입 */}
        <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-xs font-semibold">
          <button
            type="button"
            onClick={() => set_direction('유출')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              direction === '유출'
                ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>관외 유출(Outflow)</span>
          </button>
          <button
            type="button"
            onClick={() => set_direction('유입')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              direction === '유입'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <ArrowDownLeft className="w-3.5 h-3.5" />
            <span>타지역 유입(Inflow)</span>
          </button>
        </div>

        {/* 집계 단위 토글: 시군구 | 중진료권 | 시도 */}
        <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-xs font-medium">
          <button
            type="button"
            onClick={() => set_unit('시군구')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              unit === '시군구'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-bold shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
            }`}
          >
            시·군·구 Top 5
          </button>
          <button
            type="button"
            onClick={() => set_unit('중진료권')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              unit === '중진료권'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-bold shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
            }`}
          >
            중진료권 Top 5
          </button>
          <button
            type="button"
            onClick={() => set_unit('시도')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              unit === '시도'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-bold shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
            }`}
          >
            시·도 Top 5
          </button>
        </div>
      </div>

      {/* Top 5 랭킹 리스트 */}
      <div className="space-y-2 pt-1">
        {ranking_list.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400">
            해당 조건의 유출입 집계 내역이 없습니다.
          </div>
        ) : (
          ranking_list.map((item) => {
            const bar_width = Math.min(100, Math.max(8, (item.pct / max_pct) * 100));
            const is_outflow = direction === '유출';

            return (
              <div
                key={`${item.rank}-${item.name}`}
                className="group p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 hover:bg-slate-100/80 dark:hover:bg-slate-800/70 border border-slate-100 dark:border-slate-800 transition-all"
              >
                <div className="flex items-center justify-between gap-3 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-5 h-5 rounded-md flex items-center justify-center text-[11px] font-bold shrink-0 ${
                        item.rank === 1
                          ? is_outflow
                            ? 'bg-rose-500 text-white'
                            : 'bg-blue-600 text-white'
                          : item.rank === 2
                          ? 'bg-slate-300 dark:bg-slate-700 text-slate-800 dark:text-slate-200'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {item.rank}
                    </span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {item.name}
                    </span>
                    {item.sido && item.sido !== item.name && (
                      <span className="text-[10px] text-slate-500 bg-slate-200/60 dark:bg-slate-700/60 px-1.5 py-0.5 rounded">
                        {item.sido}
                      </span>
                    )}
                  </div>

                  <div className="flex items-baseline gap-2 shrink-0">
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                      {format_number_comma(item.days)}일
                    </span>
                    <span
                      className={`text-xs font-bold ${
                        is_outflow ? 'text-rose-600 dark:text-rose-400' : 'text-blue-600 dark:text-blue-400'
                      }`}
                    >
                      {item.pct}%
                    </span>
                  </div>
                </div>

                {/* 프로그레스 바 */}
                <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700/60 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      is_outflow
                        ? 'bg-gradient-to-r from-rose-400 to-rose-600'
                        : 'bg-gradient-to-r from-blue-400 to-blue-600'
                    }`}
                    style={{ width: `${bar_width}%` }}
                  />
                </div>

                {/* 유출 탭일 경우 세부 의료이용 칩 (상급종합, 종합, 투석, 응급) */}
                {is_outflow && unit === '시군구' && (item.tertiary_days || item.er_days) ? (
                  <div className="flex flex-wrap items-center gap-1.5 mt-2 pt-1.5 border-t border-slate-200/50 dark:border-slate-700/40 text-[10px] text-slate-500 dark:text-slate-400">
                    {item.tertiary_days ? (
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300">
                        <Building2 className="w-2.5 h-2.5" /> 3차병원 {format_number_comma(item.tertiary_days)}일
                      </span>
                    ) : null}
                    {item.general_days ? (
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300">
                        종합병원 {format_number_comma(item.general_days)}일
                      </span>
                    ) : null}
                    {item.dialysis_days ? (
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300">
                        <Activity className="w-2.5 h-2.5" /> 투석 {format_number_comma(item.dialysis_days)}일
                      </span>
                    ) : null}
                    {item.er_days ? (
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300">
                        <HeartPulse className="w-2.5 h-2.5" /> 응급 {format_number_comma(item.er_days)}일
                      </span>
                    ) : null}
                  </div>
                ) : null}
              </div>
            );
          })
        )}
      </div>

      {/* 하단 인사이트 풋터 */}
      <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 flex items-start gap-2 text-xs text-blue-900 dark:text-blue-200">
        <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-bold">분석 인사이트:</span>
          <p className="text-[11px] text-blue-800 dark:text-blue-300 leading-relaxed">
            {direction === '유출'
              ? `${sgg_name} 환자의 ${flow_meta.outflow_rate}%가 관외로 유출되며, ${
                  ranking_list[0] ? `최대 유출지는 ${ranking_list[0].name}(${ranking_list[0].pct}%)입니다.` : ''
                }`
              : `${sgg_name} 의료기관에 연간 ${format_number_comma(
                  flow_meta.outsider_inflow_days
                )}일의 타지역 환자가 유입되며, ${
                  ranking_list[0] ? `주요 유입지는 ${ranking_list[0].name}(${ranking_list[0].pct}%)입니다.` : ''
                }`}
          </p>
        </div>
      </div>
    </div>
  );
};
