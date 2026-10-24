'use client';

import React, { useState, useEffect, useRef } from 'react';
import { AI_질의_입력창 } from '@/components/ai/AI_질의_입력창';
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
import { API키_불러오기 } from '@/lib/API키_저장소';

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
  const [is_gemini_loading, set_is_gemini_loading] = useState(false);
  const [has_gemini_key, set_has_gemini_key] = useState(false);
  const [copied, set_copied] = useState(false);
  const input_ref = useRef<HTMLInputElement>(null);

  // Gemini API 키 등록 여부 감지
  useEffect(() => {
    if (is_open) {
      const key = API키_불러오기('google_gemini_api_key');
      set_has_gemini_key(!!key);
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
    set_is_gemini_loading(false);

    setTimeout(() => {
      try {
        const res = analyze_hospital_query(query_text);
        set_result(res);

        // Google Gemini 온라인 실시간 질의응답 비동기 연동
        const gemini_key = API키_불러오기('google_gemini_api_key');
        if (gemini_key) {
          set_is_gemini_loading(true);

          // 상위 공공병원 추출 요약 생성
          const top_hospitals_summary = res.hospitals.slice(0, 5).map((h, i) =>
            `${i + 1}. ${h.기관명}(${h.시도명} ${h.시군구명}) - ${h.기관유형}, 총병상 ${h.의료자원.병상.총병상}개, 전문의 ${h.의료자원.의료인력.전문의수}명, 주요서비스: ${h.주요_의료서비스.join('/')}`
          ).join('\n');

          const rag_text = (res.rag_evidences || []).map((r) => `[${r.문서명}] ${r.본문} (기준: ${r.기준수치})`).join('\n');

          fetch('/api/llm/compare', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              query: `[전국 214개 공공병원 데이터 자연어 질의]\n질문: ${query_text}\n\n[검색된 공공병원 정형 데이터 요약 (총 ${res.total_count}건 중 상위)]:\n${top_hospitals_summary}\n\n[관련 보건복지부 법령 및 지침]:\n${rag_text}`,
              google_api_key: gemini_key,
              region_name: '전국 214개 공공의료기관 데이터 관제',
              region_stats: {
                emergency_rate: 0,
                ri_rate: 0,
                maternity_rate: 0,
                vulnerability_grade: '의료기관 자원 분석',
              },
              mode: 'general_qa',
            }),
          })
            .then((r) => (r.ok ? r.json() : null))
            .then((data) => {
              if (data?.google_gemini?.response) {
                const clean_text = data.google_gemini.response
                  .replace(/^\[✓ 호출 성공 모델: [^\]]+\]\s*/i, '')
                  .trim();
                set_result((prev) => (prev ? {
                  ...prev,
                  gemini_analysis: clean_text,
                  gemini_model: data.google_gemini.model || 'Google Gemini 2.5 Flash',
                  gemini_elapsed_ms: data.google_gemini.elapsed_ms || 1200,
                  is_gemini_live: true,
                } : null));
              }
            })
            .catch((err) => {
              console.warn('[의료기관 QA Gemini 호출 실패]:', err);
            })
            .finally(() => {
              set_is_gemini_loading(false);
            });
        }
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

  // 추천 질문은 입력창에 채우기만 하고, 질의는 오른쪽 실행 버튼으로
  const handle_preset_click = (preset: string) => {
    set_query_input(preset);
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
                {has_gemini_key ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-950/80 px-2 py-0.5 rounded-full border border-purple-300 dark:border-purple-800">
                    <Sparkles className="w-2.5 h-2.5 text-purple-600 animate-pulse" />
                    Google Gemini 온라인 연동
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-900">
                    전국 214개 공공병원 전수 연동 (로컬 엔진)
                  </span>
                )}
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
          <AI_질의_입력창
            value={query_input}
            onChange={set_query_input}
            onSubmit={(v) => execute_query(v)}
            예시="병상수가 가장 많은 공공병원 Top10 보여줘."
            실행_라벨="질의 실행"
            실행중={is_searching}
            버튼_색="bg-emerald-600 hover:bg-emerald-700"
          />

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
            <div key={`${result.query}-${result.title}-${result.table_rows.length}`} className="space-y-5 animate-in fade-in duration-300">
              {/* Google Gemini 온라인 실시간 심층 소견 카드 */}
              {(is_gemini_loading || result.gemini_analysis) && (
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-purple-50/90 via-indigo-50/40 to-white dark:from-purple-950/40 dark:via-slate-900 dark:to-slate-900 border border-purple-200 dark:border-purple-800 shadow-xs space-y-3 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-xs">
                        <Sparkles className="w-4 h-4 animate-pulse" />
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>Google Gemini 온라인 AI 심층 소견</span>
                        <span className="text-[9px] font-bold text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-950 px-1.5 py-0.2 rounded border border-purple-300 dark:border-purple-800">
                          LIVE
                        </span>
                      </h3>
                    </div>
                    {result.gemini_model && !is_gemini_loading && (
                      <span className="text-[10px] font-bold text-purple-700 dark:text-purple-300 bg-purple-100/80 dark:bg-purple-900/50 px-2.5 py-0.5 rounded-full border border-purple-300 dark:border-purple-700">
                        {result.gemini_model} · {result.gemini_elapsed_ms ? `${(result.gemini_elapsed_ms / 1000).toFixed(1)}초` : '완료'}
                      </span>
                    )}
                  </div>

                  {is_gemini_loading ? (
                    <div className="p-3.5 rounded-xl bg-purple-950/5 dark:bg-purple-900/20 border border-purple-200/50 dark:border-purple-800/40 flex items-center gap-2.5 text-xs text-purple-800 dark:text-purple-300">
                      <RefreshCw className="w-4 h-4 text-purple-600 animate-spin shrink-0" />
                      <span>전국 214개 공공병원 통계 데이터를 바탕으로 Google Gemini 모델이 실시간 정책 분석 소견을 작성하고 있습니다...</span>
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-purple-100 dark:border-purple-900/40 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-normal whitespace-pre-line shadow-2xs">
                      {result.gemini_analysis}
                    </div>
                  )}
                </div>
              )}

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
                  <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-white dark:bg-slate-800 px-2.5 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-900 shadow-2xs">
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
                      <span className="text-emerald-600">•</span>
                      <span>{insight}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 1-1. RAG 법령·지침 근거 카드 (질문 연계 법정 기준 및 사업 고시) */}
              {result.rag_evidences && result.rag_evidences.length > 0 && (
                <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-900/60 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900 dark:text-indigo-200">
                      <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      <span>연계 정부 법령·지침 근거 (RAG 벡터 검색 매칭)</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-900/80 dark:text-indigo-300 font-bold">
                      {result.rag_evidences.length}건 지침 연계
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-0.5">
                    {result.rag_evidences.map((chunk) => (
                      <div
                        key={chunk.id}
                        className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900/40 text-xs space-y-1.5 shadow-2xs"
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-bold text-slate-900 dark:text-white line-clamp-1">
                            {chunk.문서명}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 shrink-0">
                            {chunk.분류}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
                          {chunk.본문}
                        </p>
                        <div className="flex items-center gap-1 text-[10px] text-indigo-700 dark:text-indigo-300 font-semibold pt-0.5">
                          <span>📌 법정 기준:</span>
                          <span className="line-clamp-1">{chunk.기준수치}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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
                              {col.key === '기관명' && row.raw_hospital && on_select_hospital ? (
                                <button
                                  type="button"
                                  onClick={() => on_select_hospital(row.raw_hospital)}
                                  className="font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer text-left"
                                  title="클릭 시 기관 상세 프로필 보기"
                                >
                                  {row.기관명}
                                </button>
                              ) : row[col.key] !== undefined ? (
                                row[col.key]
                              ) : (
                                '-'
                              )}
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
