'use client';

// Essential Care Map - 공공의료 AI 분석 시스템 아키텍처 상세 모달
// [문서 준수] 공공의료 AI 분석 시스템 아키텍처 공식 명세서 완전 구현:
// 1. A 질의 처리 흐름 (01~08단계 분기·합류, 계산과 해석의 분리)
// 2. B & C 시스템 구성요소 및 3대 저장소(DW vs Vector DB vs MCP Gateway) & 지식 구축 흐름
// 3. D 공통 운영 기반 및 LLMOps 지속 개선 체계 (2단계 비식별화, 평가셋, 검증 롤백)
// 4. 5대 핵심 설계 원칙 완비

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
  RotateCcw,
  Lock,
  Eye,
  Activity,
  GitBranch,
  Settings,
  AlertTriangle,
} from 'lucide-react';

interface AI_기술구조_모달_속성 {
  is_open: boolean;
  on_close: () => void;
}

export const AI_기술구조_모달: React.FC<AI_기술구조_모달_속성> = ({
  is_open,
  on_close,
}) => {
  const [activeTab, setActiveTab] = useState<'runtime' | 'storage_build' | 'llmops'>('runtime');

  if (!is_open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#15161b] rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        {/* ── 1. 모달 헤더 ── */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-4 bg-slate-50/80 dark:bg-slate-900/50">
          <div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Cpu className="w-5 h-5 text-blue-600" />
              <span>공공의료 AI 분석 시스템 표준 아키텍처 명세</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              정량 분석(분석 엔진)과 정성 지식(Vector DB)의 병렬 분기·합류, 계산과 해석의 분리, 대안 생성 후 근거 검증 및 LLMOps 환류 체계로 구성됩니다.
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
        <div className="px-6 pt-3 border-b border-slate-100 dark:border-slate-800 flex gap-2 bg-white dark:bg-[#15161b] overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('runtime')}
            className={`pb-2.5 px-3 text-xs font-black transition border-b-2 cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'runtime'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>질의 처리 흐름 (01~08단계 분기·합류)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('storage_build')}
            className={`pb-2.5 px-3 text-xs font-black transition border-b-2 cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'storage_build'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>3대 저장소 및 지식 구축 흐름</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('llmops')}
            className={`pb-2.5 px-3 text-xs font-black transition border-b-2 cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'llmops'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>공통 운영 기반 & LLMOps 지속 개선</span>
          </button>
        </div>

        {/* ── 3. 본문 스크롤 영역 ── */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* ═══════════════════════════════════════════════
             TAB 1: A. 질의 처리 흐름 (01~08단계 분기·합류)
             ═══════════════════════════════════════════════ */}
          {activeTab === 'runtime' && (
            <div className="space-y-4">
              {/* 핵심 원칙 알림 배너 */}
              <div className="p-3.5 rounded-2xl bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 flex items-start gap-2.5 text-xs text-blue-950 dark:text-blue-200 leading-relaxed">
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold">계산과 해석의 분리 & 분기·합류 구조:</strong> 정확한 수치 계산은 LLM이 아닌 <strong>분석 엔진(SQL/GIS)</strong>이 수행하여 정확성을 보장합니다.
                  정량 분석과 정성 지식 검색이 병렬로 실행된 뒤 <strong>05 LLM 종합 분석에서 합류</strong>하고, <strong>06 정책대안 생성 후 07 근거 검증</strong>을 통과해야 최종 제공됩니다.
                </div>
              </div>

              {/* [01. 질문 이해] */}
              <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border-2 border-indigo-200 dark:border-indigo-900 shadow-xs">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-600 text-white">01</span>
                    <h4 className="text-sm font-black text-indigo-950 dark:text-indigo-200">
                      질문 이해 & 입력 가드레일 (AI Orchestrator)
                    </h4>
                  </div>
                  <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 bg-white dark:bg-indigo-900/60 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-700">
                    보안 입력 가드레일 가동
                  </span>
                </div>
                <p className="text-xs text-indigo-900/90 dark:text-indigo-300 leading-relaxed">
                  자연어 질문에서 대상 지역·분석 분야·목적을 추출하고 분석 계획을 수립합니다. 민감정보와 프롬프트 인젝션을 사전 차단하며, 첨부파일은 해당 질의의 임시 컨텍스트로 격리 처리합니다.
                </p>
              </div>

              {/* 분기 화살표 */}
              <div className="flex items-center justify-center gap-2 py-0.5 text-xs font-bold text-slate-500">
                <span>▼ 두 갈래 병렬 분기 (상호 비의존 고속 처리) ▼</span>
              </div>

              {/* [병렬 처리 영역: 정량 갈래 vs 정성 갈래] */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* 🔵 좌측: 정량 갈래 (현재 상태 수치 파악) */}
                <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border-2 border-blue-300 dark:border-blue-800 shadow-xs space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-blue-200 dark:border-blue-800/60">
                    <span className="text-xs font-black text-blue-900 dark:text-blue-200 flex items-center gap-1">
                      <BarChart3 className="w-4 h-4 text-blue-600" />
                      <span>정량 갈래 (수치 산출)</span>
                    </span>
                    <span className="text-[10px] font-bold text-blue-700 bg-white dark:bg-blue-900/60 px-1.5 py-0.5 rounded border border-blue-200">
                      정확성 보장
                    </span>
                  </div>

                  {/* 02. 데이터 검색 */}
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-900/60 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                      <span className="px-1.5 py-0.2 rounded bg-blue-600 text-white text-[9px] font-black">02</span>
                      <span>데이터 검색 (Data Lake / DW · MCP)</span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                      의료기관 병상·인력, 응급실 내원, 119 이송시간, 인구통계 정형 데이터를 SQL로 조회하고, <strong>MCP Gateway</strong>를 통해 실시간 가용 병상 등 외부 연계 최신 데이터를 도구(Tool)로 실시간 조회합니다.
                    </p>
                  </div>

                  <div className="text-center text-blue-400 font-bold text-xs">↓</div>

                  {/* 04. 데이터 분석 */}
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border-2 border-blue-400 dark:border-blue-700 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-black text-blue-700 dark:text-blue-400">
                        <span className="px-1.5 py-0.2 rounded bg-blue-600 text-white text-[9px]">04</span>
                        <span>데이터 분석 (분석 엔진)</span>
                      </div>
                      <span className="text-[9px] font-black text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                        계산 전담
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                      <strong>수치 계산을 LLM이 아닌 분석 엔진이 수행:</strong> 골든타임 도달 인구비율, 지역 간 격차, GIS 공간 분석을 확정 수치로 계산합니다.
                    </p>
                  </div>
                </div>

                {/* 🟣 우측: 정성 갈래 (판단 기준 및 정책 수단 탐색) */}
                <div className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border-2 border-purple-300 dark:border-purple-800 shadow-xs space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-2 border-b border-purple-200 dark:border-purple-800/60 mb-3">
                      <span className="text-xs font-black text-purple-900 dark:text-purple-200 flex items-center gap-1">
                        <BookOpen className="w-4 h-4 text-purple-600" />
                        <span>정성 갈래 (정책 지식)</span>
                      </span>
                      <span className="text-[10px] font-bold text-purple-700 bg-white dark:bg-purple-900/60 px-1.5 py-0.5 rounded border border-purple-200">
                        의미 기반 RAG
                      </span>
                    </div>

                    {/* 03. 지식 검색 */}
                    <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-900/60 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                        <span className="px-1.5 py-0.2 rounded bg-purple-600 text-white text-[9px] font-black">03</span>
                        <span>지식 검색 (Vector DB)</span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                        Vector DB에 저장된 보건의료 법령, 기본계획, 취약지 지정 기준, 사업 지침, 과거 유사 사례 문서를 시맨틱 검색합니다.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-purple-100/70 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-900 text-[11px] text-purple-900 dark:text-purple-300">
                    ※ 별도의 통계 가공을 거치지 않고, 05단계 LLM 종합 분석으로 즉시 전달되어 원인 진단의 근거로 결합됩니다.
                  </div>
                </div>
              </div>

              {/* 합류 화살표 */}
              <div className="flex items-center justify-center gap-2 py-0.5 text-xs font-bold text-purple-700 dark:text-purple-300">
                <span>▼ 두 갈래 합류 (정량 수치 + 정책 지식 융합) ▼</span>
              </div>

              {/* [05. LLM 종합 분석] */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/40 dark:to-indigo-950/30 border-2 border-purple-400 dark:border-purple-700 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-600 text-white">05</span>
                    <h4 className="text-sm font-black text-purple-950 dark:text-purple-200 flex items-center gap-1.5">
                      <Brain className="w-4 h-4 text-purple-600" />
                      <span>LLM 종합 분석 (LLM 레이어 - 해석 전담)</span>
                    </h4>
                  </div>
                  <span className="text-[10px] font-bold text-purple-700 bg-white dark:bg-purple-900/60 px-2 py-0.5 rounded border border-purple-200">
                    내부망 sLLM vs 외부 LLM 비식별화
                  </span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  분석 엔진의 정확한 계산 수치와 Vector DB의 지침을 결합하여, <strong>어떤 기준에 비추어 무엇이 취약하고 그 원인이 무엇인지 인과관계를 진단</strong>합니다.
                  민감 데이터는 원내 폐쇄망 sLLM이 처리하고, 외부 LLM에는 비식별화된 데이터만 전달합니다.
                </p>
              </div>

              {/* 연결 화살표 */}
              <div className="flex justify-center py-0.5">
                <ArrowDown className="w-4 h-4 text-slate-400" />
              </div>

              {/* [06. 정책대안 생성 & 07. 근거 검증 (롤백 루프)] */}
              <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border-2 border-amber-300 dark:border-amber-800 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-600 text-white">06 ➔ 07</span>
                    <h4 className="text-sm font-black text-amber-950 dark:text-amber-200">
                      정책대안 생성 ➔ 근거 검증 및 롤백 가드레일
                    </h4>
                  </div>
                  <span className="text-[10px] font-black text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                    검증 불통 시 재생성 롤백 루프
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* 06. 정책대안 생성 */}
                  <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                      <span className="px-1.5 py-0.2 rounded bg-amber-600 text-white text-[9px] font-black">06</span>
                      <span>정책대안 생성 (정책대안 Agent)</span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                      진단 결과를 바탕으로 효과·비용·난이도 우선순위를 평가하고 단계별 실행 방안(Option A·B·C)을 구성합니다. 필요 시 Vector DB에서 유사 사례를 추가 검색합니다.
                    </p>
                  </div>

                  {/* 07. 근거 검증 */}
                  <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border-2 border-rose-300 dark:border-rose-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-rose-700 dark:text-rose-400">
                        <span className="px-1.5 py-0.2 rounded bg-rose-600 text-white text-[9px] font-black">07</span>
                        <span>근거 검증 · 출력 가드레일</span>
                      </div>
                      <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                      출처·수치 일치 여부, 정책 근거, 논리 편향을 점검합니다. <strong>검증 불통 시 05(종합분석) 또는 06(대안생성) 단계로 되돌려 다시 생성</strong>합니다.
                    </p>
                  </div>
                </div>
              </div>

              {/* 연결 화살표 */}
              <div className="flex justify-center py-0.5">
                <ArrowDown className="w-4 h-4 text-slate-400" />
              </div>

              {/* [08. 결과 제공 & 피드백 환류] */}
              <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border-2 border-emerald-300 dark:border-emerald-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-600 text-white">08</span>
                    <h4 className="text-sm font-black text-emerald-950 dark:text-emerald-200 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-emerald-600" />
                      <span>결과 제공 & 피드백 환류 (Delivery & Feedback)</span>
                    </h4>
                  </div>
                  <p className="text-xs text-emerald-900/90 dark:text-emerald-300 leading-relaxed">
                    검증을 통과한 분석 요약, 주요 지표, 정책대안(Option A·B·C), 근거 문서를 대시보드와 공문서 보고서로 제공하며, 사용자 평가는 LLMOps 품질 개선셋으로 환류됩니다.
                  </p>
                </div>
                <div className="shrink-0 flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-white dark:bg-emerald-900/60 px-3 py-2 rounded-xl border border-emerald-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>검증 완료 보고서 도출</span>
                </div>
              </div>

              {/* 5대 설계상 특징 태그 */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">
                  공공의료 AI 5대 핵심 설계 원칙 준수
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    ① 두 흐름의 분리 (질의 처리 vs 지식 구축)
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[11px] font-bold text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    ② 계산과 해석의 분리 (수치=분석엔진, 서술=LLM)
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-[11px] font-bold text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                    ③ 분기·합류 구조 (정량+정성 병렬 ➔ LLM 합류)
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-[11px] font-bold text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                    ④ 검증 단계의 배치 (대안 생성 후 검증 & 롤백)
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    ⑤ 지속 개선 체계 (LLMOps 평가셋 환류)
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════
             TAB 2: B & C. 3대 저장소 및 지식 구축 파이프라인
             ═══════════════════════════════════════════════ */}
          {activeTab === 'storage_build' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-900/50 text-xs text-teal-950 dark:text-teal-200 leading-relaxed">
                <strong>지식 구축 흐름 원칙:</strong> 사용자 질의와 무관하게 사전·주기적으로 데이터를 수집·정제하여 저장소에 적재합니다.
                저장소는 담는 데이터의 성격에 따라 <strong>DW, Vector DB, MCP Gateway</strong> 3가지로 엄격히 구분됩니다.
              </div>

              {/* 3대 저장소 비교 표 */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700">
                      <th className="p-3 font-black text-slate-800 dark:text-slate-200 w-24">구분</th>
                      <th className="p-3 font-black text-blue-700 dark:text-blue-400">Data Lake / DW</th>
                      <th className="p-3 font-black text-purple-700 dark:text-purple-400">Vector DB</th>
                      <th className="p-3 font-black text-teal-700 dark:text-teal-400">MCP Gateway</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                    <tr>
                      <td className="p-3 font-bold text-slate-500 bg-slate-50/50 dark:bg-slate-800/40">대상</td>
                      <td className="p-3 text-slate-700 dark:text-slate-300 font-semibold">계산·집계 대상인 정형 데이터</td>
                      <td className="p-3 text-slate-700 dark:text-slate-300 font-semibold">의미를 따라 찾아 읽는 비정형 문서</td>
                      <td className="p-3 text-slate-700 dark:text-slate-300 font-semibold">적재하면 금방 낡는 최신 현황</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-slate-500 bg-slate-50/50 dark:bg-slate-800/40">데이터 예시</td>
                      <td className="p-3 text-slate-600 dark:text-slate-400">병상·인력, 응급실 내원, 119 이송시간, 인구·고령화율, 의료이용, 시설 좌표</td>
                      <td className="p-3 text-slate-600 dark:text-slate-400">응급의료 법령, 기본계획, 취약지 지정 기준, 사업 지침, 정책 보고서, 유사 사례</td>
                      <td className="p-3 text-slate-600 dark:text-slate-400">실시간 응급실 가용 병상, 외부 기관 시스템 현황 실시간 조회</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-slate-500 bg-slate-50/50 dark:bg-slate-800/40">활용 방식</td>
                      <td className="p-3 text-slate-600 dark:text-slate-400">분석 엔진이 SQL·통계·GIS로 정확한 값 산출</td>
                      <td className="p-3 text-slate-600 dark:text-slate-400">질문과 관련된 문서 조각을 검색해 LLM에 제공</td>
                      <td className="p-3 text-slate-600 dark:text-slate-400">외부 시스템 API를 도구(Tool)로 실시간 호출</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-slate-500 bg-slate-50/50 dark:bg-slate-800/40">갱신 주기</td>
                      <td className="p-3 font-bold text-blue-600">정기 배치 적재 (ETL)</td>
                      <td className="p-3 font-bold text-purple-600">문서 제·개정 시 재임베딩 (검수 승인)</td>
                      <td className="p-3 font-bold text-teal-600">적재하지 않음 (실시간 호출)</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* 지식 구축 흐름 3갈래 상세 카드 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-black text-blue-700 dark:text-blue-400">
                    <Database className="w-4 h-4" />
                    <span>정형 데이터 파이프라인</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                    공공데이터포털 및 행정정보시스템에서 API/ETL로 수집 ➔ 비식별화 및 품질검사, 표준화 ➔ DW 정기 적재 (개인단위는 비식별·집계 수준 유지).
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-black text-purple-700 dark:text-purple-400">
                    <BookOpen className="w-4 h-4" />
                    <span>비정형 지식 파이프라인</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                    정책 PDF 및 웹문서 수집 ➔ 파싱, 청킹 및 메타데이터(출처·기준일) 부여 ➔ Vector DB 적재 (담당자 직접 등록 문서는 <strong>검수와 승인</strong> 후 공용 반영).
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-black text-teal-700 dark:text-teal-400">
                    <Plug className="w-4 h-4" />
                    <span>외부 연계 (MCP 도구 등록)</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                    의료기관 실시간 시스템 데이터를 적재하지 않고 MCP Gateway에 도구로 등록 ➔ API 명세, 접근 권한, 호출 빈도 제한 정책 관리.
                  </p>
                </div>
              </div>

              {/* 경계 데이터 처리 원칙 */}
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-xs text-amber-900 dark:text-amber-200 space-y-1">
                <div className="font-bold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>경계 데이터 처리 원칙</span>
                </div>
                <div className="text-[11px] leading-relaxed text-amber-800 dark:text-amber-300">
                  • <strong>표가 포함된 문서 (통계연보 등):</strong> 표의 수치는 추출하여 DW에 적재하고, 해설 문장만 Vector DB에 저장합니다.<br/>
                  • <strong>지표 정의서 & 데이터 사전:</strong> Vector DB에 두고, 오케스트레이터가 정량 분석 질의(SQL)를 생성할 때 참조합니다.
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════
             TAB 3: D. 공통 운영 기반 & LLMOps 지속 개선 체계
             ═══════════════════════════════════════════════ */}
          {activeTab === 'llmops' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/50 text-xs text-purple-950 dark:text-purple-200 leading-relaxed">
                <strong>LLMOps의 핵심:</strong> 모델 직접 재학습 대신, 프롬프트·청킹·모델 버전 변경 시 <strong>대표 평가셋을 통해 품질을 검증한 후 안전하게 배포</strong>하며,
                근거 검증(07)에서 탈락한 사례를 개선 재료로 환류하는 공공 특화 거버넌스입니다.
              </div>

              {/* LLMOps 7대 기능 그리드 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {[
                  {
                    title: '모델 관리 (Model Hub)',
                    target: 'LLM 레이어 (내부 sLLM / 외부 LLM)',
                    desc: '모델 버전 등록, 원내 sLLM 서빙, 질의 유형별 라우팅 규칙 및 문제 시 롤백',
                    icon: Brain,
                  },
                  {
                    title: '프롬프트 관리',
                    target: '오케스트레이터 · LLM · 정책대안 Agent',
                    desc: '템플릿 버전 관리, 변경 승인, 신·구 버전 A/B 비교 시험',
                    icon: FileText,
                  },
                  {
                    title: 'RAG 파이프라인 운영',
                    target: '비정형 지식 갈래 & Vector DB',
                    desc: '임베딩 모델 및 청킹 정책 버전 관리, 지침 개정 시 재색인, 검색 품질 측정',
                    icon: Search,
                  },
                  {
                    title: '평가셋 운영 (핵심)',
                    target: '05~07단계 전체',
                    desc: '대표 표준 질의셋(수십~수백 개) 기반 정기 평가 (수치 일치율, 근거 인용 정확도)',
                    icon: CheckCircle2,
                  },
                  {
                    title: '관측성 (Observability)',
                    target: '01~08 전 과정 & 감사추적 로그',
                    desc: '질의별 실행 경로 추적, 지연시간·토큰 비용 집계 및 공공 감사 로그 일원화',
                    icon: Eye,
                  },
                  {
                    title: '가드레일 & 검증 환류',
                    target: '입·출력 가드레일 & 07 근거 검증',
                    desc: '인젝션 차단 룰 갱신, 검증 실패 사례를 프롬프트 수정 및 지식베이스 보완으로 환류',
                    icon: RotateCcw,
                  },
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div key={idx} className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-black text-slate-900 dark:text-white">
                        <Icon className="w-3.5 h-3.5 text-purple-600" />
                        <span>{item.title}</span>
                      </div>
                      <div className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold truncate">
                        대상: {item.target}
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* 공통 보안 및 개인정보 비식별화 2단계 */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-emerald-600" />
                  <span>공통 운영 기반 보안 및 개인정보 2단계 비식별화</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <strong className="text-emerald-700 dark:text-emerald-400 block mb-0.5">1단계: 저장소 적재 전 비식별화</strong>
                    <span className="text-[11px] text-slate-600 dark:text-slate-300">
                      공공데이터·행정정보 수집 후 Data Lake 및 DW 적재 시점에 개인 식별자를 마스킹하고 집계 처리합니다.
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <strong className="text-emerald-700 dark:text-emerald-400 block mb-0.5">2단계: LLM 전달 전 비식별화</strong>
                    <span className="text-[11px] text-slate-600 dark:text-slate-300">
                      외부 클라우드 LLM(Gemini) 호출 전 재차 가명정보를 검사하며, 민감 의료데이터는 내부망 sLLM으로만 라우팅합니다.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── 4. 모달 푸터 ── */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-[#121318] flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>국가 공공의료 AI 분석 시스템 아키텍처 공식 명세(01~08단계 & 3대 저장소) 준수</span>
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
