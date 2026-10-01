'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Search,
  Sparkles,
  Bot,
  Building2,
  Users,
  Bed,
  Phone,
  BarChart3,
  Table as TableIcon,
  Copy,
  Check,
  RefreshCw,
  HelpCircle,
  Activity,
  ShieldCheck,
} from 'lucide-react';
import {
  analyze_hospital_query,
  의료기관_질의_응답_결과,
} from '@/lib/의료기관_질의응답_엔진';
import { 공공의료기관_상세_프로필 } from '@/lib/의료서비스_검색_엔진';
import { copy_text_to_clipboard, format_number_comma } from '@/lib/유틸리티';

interface 의료기관_질의응답_모달_속성 {
  is_open: boolean;
  on_close: () => void;
  initial_query?: string;
  on_select_hospital?: (hospital: 공공의료기관_상세_프로필) => void;
}

const PRESET_HOSPITAL_QUERIES = [
  '병상수가 가장 많은 공공병원 Top10 보여줘.',
  '전국 35개 지방의료원 병상과 의사인력 현황 알려줘.',
  '분만과 소아청소년과 진료가 모두 가능한 공공병원 어디야?',
  '응급실과 중환자실을 동시에 가동하는 공공병원 보여줘.',
  '전문의 수가 가장 많은 공공의료기관 Top10 알려줘.',
  '강원도 소재 공공의료기관 현황 분석해줘.',
];

export const 의료기관_질의응답_모달: React.FC<의료기관_질의응답_모달_속성> = ({
  is_open,
  on_close,
  initial_query = '병상수가 가장 많은 공공병원 Top10 보여줘.',
  on_select_hospital,
}) => {
  const [query_input, set_query_input] = useState(initial_query);
  const [result, set_result] = useState<의료기관_질의_응답_결과 | null>(null);
  const [is_searching, set_is_searching] = useState(false);
  const [copied, set_copied] = useState(false);
  const input_ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (is_open) {
      const q = initial_query || '병상수가 가장 많은 공공병원 Top10 보여줘.';
      set_query_input(q);
      execute_query(q);
      setTimeout(() => input_ref.current?.focus(), 100);
    }
  }, [is_open, initial_query]);

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

    setTimeout(() => {
      try {
        const res = analyze_hospital_query(query_text);
        set_result(res);
      } catch (err) {
        console.error('의료기관 질의 분석 오류:', err);
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

  const handle_copy_table = () => {
    if (!result) return;
    const header = result.table_columns.map((col) => col.label).join('\t');
    const rows = result.table_rows.map((row) =>
      result.table_columns.map((col) => row[col.key] ?? '').join('\t')
    );
    const text_to_copy = `[${result.title}]\n\n${header}\n${rows.join('\n')}\n\n출처: 국립중앙의료원/보건복지부 전국 214개 공공의료기관 전수 DB`;
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
            <div className="p-2 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white shadow-xs">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  의료기관 데이터 AI 자연어 질의응답
                </h2>
                <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-900">
                  전국 214개 공공병원 전수 연동
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                병상 규모, 전문의·의사인력, 응급/분만/소아 필수의료 가동 현황을 자연어로 즉시 질의합니다.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={on_close}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 메인 바디 */}
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
                placeholder="질문을 입력하세요 (예: 병상수가 가장 많은 공공병원 Top10 보여줘.)"
                className="w-full pl-12 pr-28 py-3.5 bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white dark:focus:bg-slate-900 transition-all shadow-inner"
              />
              <button
                type="submit"
                disabled={is_searching}
                className="absolute right-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer disabled:opacity-50"
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
            {PRESET_HOSPITAL_QUERIES.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => handle_preset_click(preset)}
                className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all text-left cursor-pointer ${
                  query_input === preset
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-semibold'
                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>

          {/* 질의 분석 결과 영역 */}
          {result && (
            <div className="space-y-5 animate-in fade-in duration-300">
              {/* 1. AI 종합 분석 브리핑 카드 */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-50/80 via-teal-50/40 to-white dark:from-emerald-950/30 dark:via-slate-900 dark:to-slate-900 border border-emerald-100 dark:border-emerald-900/60 shadow-xs space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-emerald-600 text-white">
                      <Bot className="w-4 h-4" />
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {result.title}
                    </h3>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-900">
                    분석 완료 ({result.total_count}건)
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                  {result.summary}
                </p>

                <div className="pt-2 border-t border-emerald-100/80 dark:border-emerald-900/40 space-y-1.5">
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

              {/* 2. 시각적 막대 차트 */}
              {result.chart_data && result.chart_data.length > 0 && (
                <div className="bg-slate-50 dark:bg-slate-800/40 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {result.chart_data[0].label1} 시각화 비교
                      </h4>
                    </div>
                    <span className="text-[11px] text-slate-500">
                      상위 {result.chart_data.length}개 기관
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
                            <div className="flex items-center gap-2 font-bold text-emerald-600 dark:text-emerald-400">
                              <span>
                                {format_number_comma(item.value1)}
                                {item.label1.includes('병상') ? '병상' : item.label1.includes('인력') || item.label1.includes('의사') ? '명' : ''}
                              </span>
                              {item.value2 !== undefined && (
                                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                                  ({item.label2}: {format_number_comma(item.value2)})
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-600 transition-all duration-500"
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
                    <TableIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      의료기관 정밀 통계 데이터 ({result.total_count}건)
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
                                  : col.key === '기관명'
                                  ? 'font-bold text-blue-600 dark:text-blue-400'
                                  : col.key.includes('총병상') || col.key.includes('전문의')
                                  ? 'font-semibold text-slate-900 dark:text-slate-100'
                                  : 'text-slate-700 dark:text-slate-300'
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
            <span>출처: 국립중앙의료원 공공보건의료지원센터 전국 공공의료기관 전수 DB (2024년)</span>
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
