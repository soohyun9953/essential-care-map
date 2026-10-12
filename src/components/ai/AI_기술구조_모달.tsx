'use client';

// Essential Care Map - AI 작동 원리 및 시스템 아키텍처 상세 모달
// [개편] 고객 이해 중심 아키텍처:
// 1. Step 0: 사전 구축 데이터 & 인프라 기반 (공공의료정보시스템, DW, RAG Vector DB, MCP)
// 2. Step 1: 사용자 질문 인입 & AI Orchestrator 작업 분배
// 3. Step 2: 3대 전문 멀티에이전트 동시 병렬 실행 (데이터 수집 / 통계·수요분석 / 법령·지침)
// 4. Step 3: 에이전트 산출물 통합 전달 → LLM 종합 추론 (Cloud AI / Local sLLM)
// 5. Step 4: 근거 검증 (XAI / 환각 방지)
// 6. Step 5: 최종 산출물 (AI 정책대안 3옵션 & 보건복지부 표준 사업계획서)

import React, { useState } from 'react';
import {
  X,
  Cpu,
  User,
  Workflow,
  Network,
  Database,
  Brain,
  Sparkles,
  FileText,
  ArrowDown,
  ArrowRight,
  Info,
  ShieldCheck,
  CheckCircle2,
  Layers,
  Plug,
  BookOpen,
  BarChart3,
  Search,
  Zap,
} from 'lucide-react';

interface AI_기술구조_모달_속성 {
  is_open: boolean;
  on_close: () => void;
}

export const AI_기술구조_모달: React.FC<AI_기술구조_모달_속성> = ({
  is_open,
  on_close,
}) => {
  const [activeTab, setActiveTab] = useState<'diagram' | 'detail'>('diagram');

  if (!is_open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#15161b] rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        {/* ── 1. 모달 헤더 ── */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-4 bg-slate-50/70 dark:bg-slate-900/50">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                AI 시스템 아키텍처
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                기구축 인프라 기반
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-100 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800">
                3대 멀티에이전트 병렬 협업
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Cpu className="w-5 h-5 text-blue-600" />
              <span>AI 기반 공공의료 의사결정 파이프라인 작동 원리</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              사전에 기구축된 공공의료 데이터 인프라(DW·RAG·MCP) 위에서, AI 오케스트레이터가 3개의 전문 에이전트를 동시에 가동하여 LLM으로 종합 전달하는 구조입니다.
            </p>
          </div>
          <button
            type="button"
            onClick={on_close}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── 2. 탭 전환 바 ── */}
        <div className="px-6 pt-3 border-b border-slate-100 dark:border-slate-800 flex gap-2 bg-white dark:bg-[#15161b]">
          <button
            type="button"
            onClick={() => setActiveTab('diagram')}
            className={`pb-2.5 px-3 text-xs font-black transition border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'diagram'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            <span>아키텍처 플로우 다이어그램 (추천)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('detail')}
            className={`pb-2.5 px-3 text-xs font-black transition border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'detail'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>단계별 상세 설명 명세</span>
          </button>
        </div>

        {/* ── 3. 본문 스크롤 영역 ── */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* 고객 친화적 핵심 안내 배너 */}
          <div className="p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/50 flex items-start gap-2.5 text-xs text-blue-950 dark:text-blue-200 leading-relaxed">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold">고객 이해를 돕는 핵심 요약:</strong> 사용자가 질문을 입력하면 데이터베이스를 처음부터 구축하는 것이 아니라,
              <strong> 사전에 이미 완비된 Step 0 인프라</strong>에서 <strong>3개의 특화 에이전트가 동시에 정보를 수집·분석</strong>하여 LLM에 전달하므로, 
              수초 내에 신뢰성 높은 정책대안과 사업계획서가 완성됩니다.
            </div>
          </div>

          {activeTab === 'diagram' ? (
            /* ═══════════════════════════════════════════════
               TAB 1: 직관적 아키텍처 다이어그램 뷰
               ═══════════════════════════════════════════════ */
            <div className="space-y-4">
              {/* 🟢 [STEP 0] 사전 구축 인프라 기반 (Enterprise Foundation Layer) */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50/60 dark:from-emerald-950/40 dark:to-teal-950/20 border-2 border-emerald-300 dark:border-emerald-800 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-600 text-white">
                      STEP 0
                    </span>
                    <h4 className="text-sm font-black text-emerald-950 dark:text-emerald-200 flex items-center gap-1.5">
                      <Database className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>사전 구축 기반 인프라 (Enterprise Foundation Layer)</span>
                    </h4>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-white/80 dark:bg-emerald-900/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-700">
                    상시 가동 · 사전 완비
                  </span>
                </div>
                <p className="text-[11px] text-emerald-800 dark:text-emerald-300/90 mb-3 leading-relaxed">
                  ※ 질문 분석 시점에 매번 생성하는 것이 아니며, 플랫폼 도입 시 <strong>사전에 영구 구축되어 실시간 조회를 대기하는 국가 공공의료 데이터 기반</strong>입니다.
                </p>

                {/* 4대 기구축 기반 그리드 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                  <div className="p-3 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-emerald-200 dark:border-emerald-800/60 shadow-2xs">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 dark:text-emerald-300 mb-1">
                      <span>🏥</span>
                      <span>공공의료정보시스템</span>
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">HIS / EMR 연계</div>
                    <div className="text-[11px] text-slate-700 dark:text-slate-300 mt-1">214개 공공병원 병상·인력 실시간 원내 시스템</div>
                  </div>

                  <div className="p-3 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-emerald-200 dark:border-emerald-800/60 shadow-2xs">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 dark:text-emerald-300 mb-1">
                      <span>🗄️</span>
                      <span>보건의료 DW / CDW</span>
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">데이터 웨어하우스</div>
                    <div className="text-[11px] text-slate-700 dark:text-slate-300 mt-1">헬스맵 7대 지표, 심평원 청구, E-Gen 응급실 마트</div>
                  </div>

                  <div className="p-3 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-emerald-200 dark:border-emerald-800/60 shadow-2xs">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 dark:text-emerald-300 mb-1">
                      <span>📚</span>
                      <span>RAG Vector DB</span>
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">고시·지침 벡터 저장소</div>
                    <div className="text-[11px] text-slate-700 dark:text-slate-300 mt-1">복지부 취약지 고시, 책임의료기관 사업안내 코퍼스</div>
                  </div>

                  <div className="p-3 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-emerald-200 dark:border-emerald-800/60 shadow-2xs">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 dark:text-emerald-300 mb-1">
                      <span>🔌</span>
                      <span>MCP 프로토콜</span>
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">Model Context Protocol</div>
                    <div className="text-[11px] text-slate-700 dark:text-slate-300 mt-1">이종 DB 및 공공데이터포털 실시간 도구 표준 인터페이스</div>
                  </div>
                </div>
              </div>

              {/* 화살표: Step 0 상시 제공 */}
              <div className="flex items-center justify-center gap-2 py-0.5 text-xs text-slate-400 font-semibold">
                <span>▲ 기구축 데이터 인프라 실시간 참조 (고속 쿼리) ▲</span>
              </div>

              {/* 👤 [STEP 1] 사용자 인입 & AI 오케스트레이터 */}
              <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-600 text-white">
                          STEP 1
                        </span>
                        <span className="text-xs font-black text-indigo-950 dark:text-indigo-200">
                          사용자 질문 인입 & AI Orchestrator
                        </span>
                      </div>
                      <div className="text-[11px] text-indigo-700 dark:text-indigo-300 font-medium mt-0.5">
                        지자체 보건소장 / 공공의료 기획관의 정책 질의 의도(Intent) 파악 및 파라미터 추출
                      </div>
                    </div>
                  </div>
                  <div className="sm:text-right shrink-0">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-200 text-xs font-bold border border-indigo-300 dark:border-indigo-700">
                      <Workflow className="w-3.5 h-3.5" />
                      <span>3개 전문 에이전트로 작업 동시 분배</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* 분기 화살표 */}
              <div className="flex justify-center items-center gap-4 py-0.5">
                <div className="text-cyan-600 dark:text-cyan-400 font-bold text-xs flex items-center gap-1 bg-cyan-50 dark:bg-cyan-950/50 px-3 py-1 rounded-full border border-cyan-200 dark:border-cyan-800">
                  <Zap className="w-3.5 h-3.5" />
                  <span>3대 멀티에이전트 동시 병렬 실행 (Parallel Execution)</span>
                </div>
              </div>

              {/* 🔷 [STEP 2] 3대 멀티에이전트 동시 병렬 실행 그리드 */}
              <div className="p-4 sm:p-5 rounded-2xl bg-cyan-50/40 dark:bg-cyan-950/20 border-2 border-cyan-300 dark:border-cyan-800 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-cyan-600 text-white">
                      STEP 2
                    </span>
                    <h4 className="text-sm font-black text-cyan-950 dark:text-cyan-200 flex items-center gap-1.5">
                      <Network className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                      <span>Multi-Agent 협업 계층 (3개 에이전트 동시 작업)</span>
                    </h4>
                  </div>
                  <span className="text-[10px] font-bold text-cyan-700 dark:text-cyan-300 bg-white dark:bg-cyan-900/60 px-2 py-0.5 rounded-md border border-cyan-200 dark:border-cyan-700">
                    병렬 처리 (동시 실행)
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* 에이전트 1 */}
                  <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-cyan-200 dark:border-cyan-800/80 shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-lg">📡</span>
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200">Agent 1</span>
                      </div>
                      <div className="text-xs font-black text-slate-900 dark:text-white">데이터 수집 에이전트</div>
                      <div className="text-[10px] text-cyan-600 dark:text-cyan-400 font-semibold mb-2">Data Extraction Agent</div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                        MCP를 통해 <strong>기구축 DW 및 공공데이터포털</strong>에서 해당 지역 병상, 응급실 가용현황, 인력 실데이터를 실시간 조회 및 전처리합니다.
                      </p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400">
                      연동: 보건의료 DW · MCP Tool
                    </div>
                  </div>

                  {/* 에이전트 2 */}
                  <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-cyan-200 dark:border-cyan-800/80 shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-lg">📊</span>
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200">Agent 2</span>
                      </div>
                      <div className="text-xs font-black text-slate-900 dark:text-white">통계·수요분석 에이전트</div>
                      <div className="text-[10px] text-cyan-600 dark:text-cyan-400 font-semibold mb-2">Analytics Agent</div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                        관내이용률(RI), 환자 유출입 OD 매트릭스, <strong>유사 지자체 1:1 비교 격차 및 2030 장래 의료수요</strong>를 고속 통계 연산합니다.
                      </p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400">
                      연동: 헬스맵 알고리즘 · ML 추계
                    </div>
                  </div>

                  {/* 에이전트 3 */}
                  <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-cyan-200 dark:border-cyan-800/80 shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-lg">📚</span>
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200">Agent 3</span>
                      </div>
                      <div className="text-xs font-black text-slate-900 dark:text-white">법령·지침 정책 에이전트</div>
                      <div className="text-[10px] text-cyan-600 dark:text-cyan-400 font-semibold mb-2">Policy Guidelines Agent</div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                        기구축된 <strong>RAG Vector DB</strong>에서 보건복지부 취약지 고시, 국비 50% 매칭 조건, 공모 평가 배점 기준을 정확히 검색·발췌합니다.
                      </p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400">
                      연동: RAG Vector DB · 지침 코퍼스
                    </div>
                  </div>
                </div>
              </div>

              {/* 수렴 화살표 */}
              <div className="flex justify-center items-center py-0.5">
                <span className="text-[11px] font-extrabold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/50 px-3 py-1 rounded-full border border-purple-200 dark:border-purple-800 flex items-center gap-1">
                  <ArrowDown className="w-3.5 h-3.5" />
                  <span>3개 에이전트 산출물(팩트데이터 + 분석통계 + 법령근거) 통합 전달</span>
                </span>
              </div>

              {/* 🟠 [STEP 3] LLM 종합 추론 엔진 */}
              <div className="p-4 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border-2 border-purple-300 dark:border-purple-800 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Brain className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-600 text-white">
                          STEP 3
                        </span>
                        <span className="text-xs font-black text-purple-950 dark:text-purple-200">
                          LLM 종합 추론 엔진 (Reasoning Engine)
                        </span>
                        <span className="text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.2 rounded border border-amber-200 dark:border-amber-800">
                          듀얼 LLM 지원
                        </span>
                      </div>
                      <div className="text-[11px] text-purple-700 dark:text-purple-300 font-medium mt-0.5">
                        Google Gemini Cloud AI (대규모 모델) 또는 원내 폐쇄망 On-Device 로컬 sLLM (보안 모델)
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-2.5 leading-relaxed bg-white/70 dark:bg-slate-900/70 p-2.5 rounded-xl border border-purple-100 dark:border-purple-900/50">
                  데이터 에이전트의 실측치, 통계 에이전트의 수요 예측, 정책 에이전트의 법령 조항을 종합 컨텍스트로 합성하여 <strong>지역 맞춤형 인과관계와 기대효과를 심층 추론</strong>합니다.
                </p>
              </div>

              {/* 연결 화살표 */}
              <div className="flex justify-center py-0.5">
                <ArrowDown className="w-4 h-4 text-slate-400" />
              </div>

              {/* 🛡️ [STEP 4] 근거 검증 및 설명가능성 (XAI) */}
              <div className="p-3.5 rounded-2xl bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-900 shadow-xs flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-teal-600 text-white">
                        STEP 4
                      </span>
                      <span className="text-xs font-black text-teal-950 dark:text-teal-200">
                        근거 검증 및 설명가능성 (Validator / XAI)
                      </span>
                    </div>
                    <div className="text-[11px] text-teal-700 dark:text-teal-300 mt-0.5">
                      추론된 결과가 실제 법령 조항과 공공데이터 수치에 정확히 부합하는지 교차 검증 (환각 0% 보장)
                    </div>
                  </div>
                </div>
              </div>

              {/* 연결 화살표 */}
              <div className="flex justify-center py-0.5">
                <ArrowDown className="w-4 h-4 text-slate-400" />
              </div>

              {/* 📝 [STEP 5] 최종 산출물 완성 (Deliverable) */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/20 border-2 border-amber-300 dark:border-amber-800 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-600 text-white">
                      STEP 5
                    </span>
                    <h4 className="text-sm font-black text-amber-950 dark:text-amber-200 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      <span>최종 산출물 (Customer Deliverables)</span>
                    </h4>
                  </div>
                  <span className="text-[10px] font-bold text-amber-800 dark:text-amber-200 bg-white/80 dark:bg-amber-900/60 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-700">
                    원클릭 공문서 완성
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800/60 shadow-xs">
                    <div className="text-xs font-black text-amber-900 dark:text-amber-300 mb-1 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>AI 정책대안 3옵션 (Option A·B·C)</span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300">
                      • A안: 핵심인력 긴급 증원형<br/>
                      • B안: 필수의료 종합 역량 강화형<br/>
                      • C안: 권역 스마트 원격협진형 (예산·효과 비교)
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800/60 shadow-xs">
                    <div className="text-xs font-black text-amber-900 dark:text-amber-300 mb-1 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5" />
                      <span>보건복지부 표준 사업계획서</span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300">
                      • 법정 12대 항목(사업목적, 추진체계, 예산계획, KPI 등) 완비<br/>
                      • 정부 표준 .hwpx 및 원클릭 복사 출력 지원
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* ═══════════════════════════════════════════════
               TAB 2: 단계별 상세 설명 명세 (고객 열람용)
               ═══════════════════════════════════════════════ */
            <div className="space-y-3">
              {[
                {
                  step: 'STEP 0',
                  title: '사전 구축 기반 인프라 (Enterprise Foundation)',
                  subtitle: '공공의료정보시스템(HIS) · 보건의료 DW · RAG Vector DB · MCP',
                  desc: '실시간 분석 전 사전에 구축 완료된 국가 공공의료 데이터 인프라입니다. 심평원 청구실적, 헬스맵 7대 지표, 복지부 고시 지침, 병원 EMR 시스템과 MCP 표준 도구 인터페이스로 상시 연결되어 대기합니다.',
                  color: 'border-emerald-300 bg-emerald-50/50 dark:border-emerald-800 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-200',
                  badge: '기구축 상시 대기',
                },
                {
                  step: 'STEP 1',
                  title: '사용자 질문 이해 & 오케스트레이션 (AI Orchestrator)',
                  subtitle: '자연어 인터페이스 & 작업 지능형 분배',
                  desc: '보건소장, 기획관의 비정형 질의를 해석하여 분석 대상 지역과 핵심 정책 목적을 도출하고, 3개의 전문 에이전트에게 동시 작업을 분배합니다.',
                  color: 'border-indigo-200 bg-indigo-50/50 dark:border-indigo-900 dark:bg-indigo-950/20 text-indigo-900 dark:text-indigo-200',
                  badge: 'Workflow Controller',
                },
                {
                  step: 'STEP 2-1',
                  title: '멀티에이전트 ①: 데이터 수집 에이전트 (Data Extraction Agent)',
                  subtitle: '원천 DW 및 실시간 병원 시스템 쿼리',
                  desc: '기구축된 DW 및 MCP를 호출하여 해당 지자체의 병상 수, 관내 의료기관 현황, 응급실 가용 병상 등 팩트 데이터를 실시간 추출합니다.',
                  color: 'border-cyan-200 bg-cyan-50/50 dark:border-cyan-900 dark:bg-cyan-950/20 text-cyan-900 dark:text-cyan-200',
                  badge: '병렬 실행 1',
                },
                {
                  step: 'STEP 2-2',
                  title: '멀티에이전트 ②: 통계·수요분석 에이전트 (Analytics Agent)',
                  subtitle: '취약도 평가 및 2030 시계열 미래 수요 추계',
                  desc: '관내이용률(RI), 환자 유출입(OD), 유사 규모 지자체 1:1 비교 격차, 2030 고령화 시계열 의료수요를 동시에 계산합니다.',
                  color: 'border-cyan-200 bg-cyan-50/50 dark:border-cyan-900 dark:bg-cyan-950/20 text-cyan-900 dark:text-cyan-200',
                  badge: '병렬 실행 2',
                },
                {
                  step: 'STEP 2-3',
                  title: '멀티에이전트 ③: 법령·지침 정책 에이전트 (Policy Agent)',
                  subtitle: 'RAG Vector DB 고시 및 평가 배점 발췌',
                  desc: '사전 구축된 RAG Vector DB에서 보건복지부 취약지 고시 기준(30% 미도달), 국비 지원 비율(50%), 책임의료기관 사업지침 조항을 동시 검색합니다.',
                  color: 'border-cyan-200 bg-cyan-50/50 dark:border-cyan-900 dark:bg-cyan-950/20 text-cyan-900 dark:text-cyan-200',
                  badge: '병렬 실행 3',
                },
                {
                  step: 'STEP 3',
                  title: '에이전트 결과 통합 → LLM 종합 추론 (Reasoning Engine)',
                  subtitle: '데이터 + 통계 + 법령 합성 심층 추론',
                  desc: '동시에 실행된 3개 에이전트의 산출물을 종합하여 LLM이 지역 맞춤형 정책 인과관계와 기대효과를 종합 추론합니다. (Cloud Gemini vs 원내 폐쇄망 sLLM 지원)',
                  color: 'border-purple-200 bg-purple-50/50 dark:border-purple-900 dark:bg-purple-950/20 text-purple-900 dark:text-purple-200',
                  badge: 'Dual LLM Reasoning',
                },
                {
                  step: 'STEP 4',
                  title: '근거 검증 및 설명가능성 (Evidence Validator / XAI)',
                  subtitle: '환각 방지 및 법정 기준치 교차 검증',
                  desc: 'AI 생성 결과가 실제 법령과 공공데이터 수치에 일치하는지 자동 검증하여 행정 신뢰성을 확보합니다.',
                  color: 'border-teal-200 bg-teal-50/50 dark:border-teal-900 dark:bg-teal-950/20 text-teal-900 dark:text-teal-200',
                  badge: 'Hallucination Zero',
                },
                {
                  step: 'STEP 5',
                  title: '최종 산출물 완성 (Deliverable Generation)',
                  subtitle: 'AI 정책대안 3옵션 및 표준 사업계획서 자동 생성',
                  desc: '검증된 결과를 조합하여 실현 가능한 3대 정책 시나리오(Option A·B·C)와 정부 제출용 표준 사업계획서 공문서를 자동 출력합니다.',
                  color: 'border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20 text-amber-900 dark:text-amber-200',
                  badge: 'Final Deliverable',
                },
              ].map((item, idx) => (
                <div key={idx} className={`p-4 rounded-2xl border ${item.color}`}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black">{item.step}</span>
                      <span className="text-xs font-bold">{item.title}</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/80 dark:bg-black/40 border border-current">
                      {item.badge}
                    </span>
                  </div>
                  <div className="text-[11px] font-semibold opacity-80 mb-1">{item.subtitle}</div>
                  <p className="text-xs opacity-90 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── 4. 모달 푸터 ── */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-[#121318] flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>기구축 엔터프라이즈 인프라 및 3대 멀티에이전트 병렬 설계 준수</span>
          </div>
          <button
            type="button"
            onClick={on_close}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition cursor-pointer shadow-xs active:scale-95"
          >
            확인 및 닫기
          </button>
        </div>
      </div>
    </div>
  );
};
