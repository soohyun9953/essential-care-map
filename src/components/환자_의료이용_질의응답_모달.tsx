'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Search,
  Sparkles,
  Bot,
  TrendingUp,
  Download,
  Copy,
  Check,
  Building2,
  Users,
  MapPin,
  ArrowRight,
  HelpCircle,
  BarChart3,
  Table as TableIcon,
  RefreshCw,
} from 'lucide-react';
import {
  analyze_patient_flow_query,
  질의_응답_결과,
} from '@/lib/환자_유출입_분석_엔진';
import { copy_text_to_clipboard, format_number_comma } from '@/lib/유틸리티';

interface 환자_의료이용_질의응답_모달_속성 {
  is_open: boolean;
  on_close: () => void;
  initial_query?: string;
  selected_sgg_name?: string;
}

const PRESET_QUERIES = [
  '중진료권별 유출 Top10과 유출 인구수 보여줘.',
  '타지역 환자가 가장 많이 유입되는 중진료권 Top10 보여줘.',
  '전국 17개 시도별 환자 유출률 및 유출 인구수 순위 알려줘.',
  '전국 시군구 중 환자 관외 유출률이 가장 높은 Top10 보여줘.',
  '서울특별시 종로구 환자 의료이용 유출입 현황 분석해줘.',
];

export const 환자_의료이용_질의응답_모달: React.FC<환자_의료이용_질의응답_모달_속성> = ({
  is_open,
  on_close,
  initial_query = '중진료권별 유출 Top10과 유출 인구수 보여줘.',
  selected_sgg_name,
}) => {
  const [query_input, set_query_input] = useState(initial_query);
  const [result, set_result] = useState<질의_응답_결과 | null>(null);
  const [is_searching, set_is_searching] = useState(false);
  const [copied, set_copied] = useState(false);
  const input_ref = useRef<HTMLInputElement>(null);

  // 모달 열릴 때 초기 질의 실행
  useEffect(() => {
    if (is_open) {
      const q = initial_query || '중진료권별 유출 Top10과 유출 인구수 보여줘.';
      set_query_input(q);
      execute_query(q);
      setTimeout(() => input_ref.current?.focus(), 100);
    }
  }, [is_open, initial_query]);

  // ESC 닫기
  useEffect(() => {
    const handle_keydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && is_open) {
        on_close();
      }
    };
    window.addEventListener('keydown', handle_keydown);
    return () => window.removeEventListener('keydown', handle_keydown);
  }, [is_open, on_close]);

  const execute_query = (query_text: string) => {
    if (!query_text.trim()) return;
    set_is_searching(true);

    // 즉시 실데이터 엔진 분석 실행
    setTimeout(() => {
      try {
        const res = analyze_patient_flow_query(query_text);
        set_result(res);
      } catch (err) {
        console.error('질의 분석 오류:', err);
      } finally {
        set_is_searching(false);
      }
    }, 150);
  };

  const handle_submit = (e: React.FormEvent) => {
    e.preventDefault();
    execute_query(query_input);
  };

  const handle_preset_click = (preset: string) => {
    set_query_input(preset);
    execute_query(preset);
  };

  // 테이블 데이터 TSV/텍스트 복사
  const handle_copy_table = () => {
    if (!result) return;
    const header = result.table_columns.map((col) => col.label).join('\t');
    const rows = result.table_rows.map((row) =>
      result.table_columns.map((col) => row[col.key] ?? '').join('\t')
    );
    const text_to_copy = `[${result.title}]\n\n${header}\n${rows.join('\n')}\n\n출처: 국립중앙의료원/보건복지부 환자 의료이용 실데이터셋 (2024년)`;
    copy_text_to_clipboard(text_to_copy);
    set_copied(true);
    setTimeout(() => set_copied(false), 2000);
  };

  if (!is_open) return null;

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#15161b] w-full max-w-4xl max-h-[92vh] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  환자 의료이용 및 유출입 AI 데이터 질의응답
                </h2>
                <span className="text-[10px] font-semibold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-950/80 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-900">
                  72.6MB 2024 전수 매트릭스 연동
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                자연어로 질문하면 전국 70개 중진료권·17개 시도·228개 시군구 환자 이동 데이터를 즉시 분석합니다.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={on_close}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 메인 바디 (스크롤 영역) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* 질의 입력창 */}
          <form onSubmit={handle_submit} className="relative">
            <div className="relative flex items-center">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
              <input
                ref={input_ref}
                type="text"
                value={query_input}
                onChange={(e) => set_query_input(e.target.value)}
                placeholder="질문을 입력하세요 (예: 중진료권별 유출 Top10과 유출 인구수 보여줘.)"
                className="w-full pl-12 pr-28 py-3.5 bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-900 transition-all shadow-inner"
              />
              <button
                type="submit"
                disabled={is_searching}
                className="absolute right-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer disabled:opacity-50"
              >
                {is_searching ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                <span>질의 실행</span>
              </button>
            </div>
          </form>

          {/* 추천 퀵 질의 버튼 바 */}
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 mr-1 flex items-center gap-1">
              <HelpCircle className="w-3 h-3" /> 추천 질문:
            </span>
            {PRESET_QUERIES.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => handle_preset_click(preset)}
                className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all text-left ${
                  query_input === preset
                    ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-300 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-semibold'
                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {preset}
              </button>
            ))}
            {selected_sgg_name && (
              <button
                type="button"
                onClick={() =>
                  handle_preset_click(`${selected_sgg_name} 환자 의료이용 유출입 현황 분석해줘.`)
                }
                className="text-[11px] px-2.5 py-1 rounded-lg border bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-300 hover:bg-amber-100 transition-all font-semibold"
              >
                📍 현재 선택 지역({selected_sgg_name}) 분석
              </button>
            )}
          </div>

          {/* 질의 분석 결과 영역 */}
          {result && (
            <div key={`${result.query}-${result.title}-${result.table_rows.length}`} className="space-y-5 animate-in fade-in duration-300">
              {/* 1. AI 종합 분석 브리핑 카드 */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-blue-50/80 via-indigo-50/40 to-white dark:from-blue-950/30 dark:via-slate-900 dark:to-slate-900 border border-blue-100 dark:border-blue-900/60 shadow-xs space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-blue-600 text-white">
                      <Bot className="w-4 h-4" />
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {result.title}
                    </h3>
                  </div>
                  <span className="text-[10px] font-semibold text-blue-700 dark:text-blue-300 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-full border border-blue-200/60 dark:border-blue-900">
                    분석 완료
                  </span>
                </div>

                {/* 요약문 */}
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                  {result.summary}
                </p>

                {/* 핵심 인사이트 불릿 목록 */}
                <div className="pt-2 border-t border-blue-100/80 dark:border-blue-900/40 space-y-1.5">
                  {result.insights.map((insight, idx) => (
                    <div
                      key={idx}
                      className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed flex items-start gap-1.5"
                    >
                      <span>•</span>
                      <span>{insight}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. 시각적 막대 차트 (Top 10 지표 비교) */}
              {result.chart_data && result.chart_data.length > 0 && (
                <div className="bg-slate-50 dark:bg-slate-800/40 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {result.chart_data[0].label1} 시각화 비교
                      </h4>
                    </div>
                    <span className="text-[11px] text-slate-500">
                      상위 {result.chart_data.length}개 지역
                    </span>
                  </div>

                  <div className="space-y-2 pt-1">
                    {result.chart_data.map((item, idx) => {
                      const max_val = Math.max(...result.chart_data!.map((c) => c.value1), 1);
                      const width_pct = Math.min(100, Math.max(10, (item.value1 / max_val) * 100));

                      return (
                        <div key={item.name} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                              <span className="w-4 text-[11px] text-slate-400 text-center font-bold">
                                {idx + 1}
                              </span>
                              <span>{item.name}</span>
                            </span>
                            <div className="flex items-center gap-2 font-bold text-rose-600 dark:text-rose-400">
                              <span>
                                {item.value1}
                                {item.label1.includes('%') ? '%' : ''}
                              </span>
                              {item.value2 !== undefined && (
                                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                                  ({format_number_comma(item.value2)}천명)
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-rose-500 transition-all duration-500"
                              style={{ width: `${width_pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 3. 정밀 통계 데이터 테이블 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TableIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      전수 통계 데이터 테이블
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={handle_copy_table}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-emerald-600 font-bold">복사 완료!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>표 복사하기</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 font-semibold">
                      <tr>
                        {result.table_columns.map((col) => (
                          <th
                            key={col.key}
                            className={`py-2.5 px-3 whitespace-nowrap text-${col.align || 'left'}`}
                          >
                            {col.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-[#15161b]">
                      {result.table_rows.map((row, idx) => (
                        <tr
                          key={idx}
                          className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                        >
                          {result.table_columns.map((col) => (
                            <td
                              key={col.key}
                              className={`py-2 px-3 whitespace-nowrap text-${
                                col.align || 'left'
                              } ${
                                col.key === 'rank'
                                  ? 'font-bold text-slate-400'
                                  : col.key.includes('유출률')
                                  ? 'font-bold text-rose-600 dark:text-rose-400'
                                  : col.key.includes('인구') || col.key.includes('일수')
                                  ? 'font-medium text-slate-700 dark:text-slate-300'
                                  : 'text-slate-800 dark:text-slate-200'
                              }`}
                            >
                              {row[col.key] !== undefined ? row[col.key] : '-'}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 풋터 */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5 text-[11px]">
            <span>출처: 2024년 국민건강보험공단/심평원 의료이용 유출입 데이터 (72.6MB)</span>
          </div>
          <button
            type="button"
            onClick={on_close}
            className="px-4 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold transition-all cursor-pointer"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
