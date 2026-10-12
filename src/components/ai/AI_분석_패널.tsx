'use client';

// Essential Care Map - AI 분석 프로세스 시각화 패널
// 기존 UI/UX를 100% 유지하면서 AI Pipeline 시각화를 Modal로 제공합니다.
// [MOCK] 이 컴포넌트는 실제 AI API를 호출하지 않고 Mock 파이프라인을 시뮬레이션합니다.

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X,
  Play,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Loader2,
  Clock,
  Search,
  Database,
  BookOpen,
  BarChart3,
  Brain,
  ShieldCheck,
  FileText,
  Copy,
  Download,
  Info,
  Cpu,
  Network,
  ArrowRight,
} from 'lucide-react';
import type { 파이프라인_단계_상태, 파이프라인_단계, 데이터_소스, AI_분석_결과 } from '@/types/ai';
import { AI_파이프라인_단계_목록 } from '@/data/mock/ai/aiPipeline';
import { AI_데이터_소스_목록, AI_데이터_검색_결과_영월 } from '@/data/mock/ai/dataSources';
import { RAG_문서_목록 } from '@/data/mock/ai/ragDocuments';
import { 영월군_AI_분석_결과, 영월군_분석_지표 } from '@/data/mock/ai/analysisResults';

// ──────────────────────────────────────────────────
// 유틸리티: 단계 아이콘 매핑
// ──────────────────────────────────────────────────
const STEP_ICON_MAP: Record<string, React.ReactNode> = {
  step_understand:   <Search className="w-4 h-4" />,
  step_data_confirm: <Database className="w-4 h-4" />,
  step_data_search:  <Database className="w-4 h-4" />,
  step_rag:          <BookOpen className="w-4 h-4" />,
  step_analysis:     <BarChart3 className="w-4 h-4" />,
  step_llm:          <Brain className="w-4 h-4" />,
  step_validate:     <ShieldCheck className="w-4 h-4" />,
  step_policy:       <FileText className="w-4 h-4" />,
};

function get_step_color(상태: 파이프라인_단계_상태) {
  switch (상태) {
    case 'done':    return 'bg-emerald-600 text-white border-emerald-600';
    case 'running': return 'bg-blue-600 text-white border-blue-600 animate-pulse';
    case 'error':   return 'bg-red-500 text-white border-red-500';
    default:        return 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700';
  }
}

// ──────────────────────────────────────────────────
// 단계별 상세 내용 컴포넌트들
// ──────────────────────────────────────────────────

/** STEP 0: 사전 구축 기반 인프라 확인 (Enterprise Foundation) */
function Step0_사전구축인프라({ is_done }: { is_done: boolean }) {
  return (
    <div className="space-y-3">
      <div className="p-3 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 text-xs text-emerald-950 dark:text-emerald-200 leading-relaxed">
        <strong>💡 사전 구축 인프라 (기구축 완료):</strong> 분석 시점에 DB를 생성하지 않고, 사전에 완비된
        <strong> 공공의료 HIS · 보건의료 DW · RAG Vector DB · MCP</strong>가 상시 고속 조회를 지원합니다.
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { icon: '🏥', title: '공공의료정보(HIS)', desc: '214개 공공병원 병상·인력' },
          { icon: '🗄️', title: '보건의료 DW / CDW', desc: '헬스맵 7대 지표·심평원 마트' },
          { icon: '📚', title: 'RAG Vector DB', desc: '복지부 고시·지침 벡터 임베딩' },
          { icon: '🔌', title: 'MCP 인터페이스', desc: '표준 도구 호출 통신 계층' },
        ].map((item, i) => (
          <div key={i} className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-1">
            <div className="text-base">{item.icon}</div>
            <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight">{item.title}</div>
            <div className="text-[10px] text-slate-500">{item.desc}</div>
            <div className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300">
              ● 연결 완비
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** STEP 1: 질문 이해 & 작업 분배 (AI Orchestrator) */
function Step1_오케스트레이션({ region_name, query }: { region_name: string; query: string }) {
  const extracted_region = region_name || '영월군';
  const is_emergency = query.includes('응급');
  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-500 leading-relaxed">
        AI 오케스트레이터가 질문을 해석하여 3대 전문 멀티에이전트에게 작업을 동시 분배합니다.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {[
          { 항목: '대상 지자체', 값: extracted_region },
          { 항목: '분석 중점 분야', 값: is_emergency ? '응급의료 취약지표' : '필수의료 전반' },
          { 항목: '오케스트레이터 배분', 값: '3대 멀티에이전트 동시 가동' },
        ].map((item) => (
          <div key={item.항목} className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/50">
            <div className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 mb-0.5">{item.항목}</div>
            <div className="text-xs font-black text-slate-900 dark:text-white">{item.값}</div>
          </div>
        ))}
      </div>
      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 flex items-center justify-between">
        <span className="font-semibold text-[11px]">작업 분배 흐름:</span>
        <span className="text-[11px] text-blue-600 dark:text-blue-400 font-bold">
          자연어 질의 ➔ 의도 파악 ➔ [데이터 / 분석 / 정책] 3개 에이전트로 동시 전송 ➔
        </span>
      </div>
    </div>
  );
}

/** STEP 2: [동시 실행 1/3] 데이터 수집 에이전트 */
function Step2_데이터에이전트() {
  const 결과 = AI_데이터_검색_결과_영월;
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500">
          MCP를 통해 <strong>기구축 보건의료 DW</strong>에서 실시간 팩트 데이터를 쿼리했습니다.
        </p>
        <span className="text-[10px] font-bold text-cyan-600 bg-cyan-50 dark:bg-cyan-950/60 px-2 py-0.5 rounded-full border border-cyan-200">
          Multi-Agent 1 동시 실행
        </span>
      </div>
      <div className="space-y-1.5">
        {Object.entries(결과).map(([key, value]) => (
          <div key={key} className="flex items-center gap-2 p-2 rounded-xl bg-cyan-50/60 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-900/50">
            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
            <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** STEP 3: [동시 실행 2/3] 통계·수요분석 에이전트 */
function Step3_분석에이전트() {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500">
          지역 취약도 지표, 1:1 비교 격차 및 <strong>2030 시계열 장래인구 의료수요</strong>를 동시 연산했습니다.
        </p>
        <span className="text-[10px] font-bold text-cyan-600 bg-cyan-50 dark:bg-cyan-950/60 px-2 py-0.5 rounded-full border border-cyan-200">
          Multi-Agent 2 동시 실행
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {영월군_분석_지표.map((지표) => (
          <div key={지표.id} className={`p-2.5 rounded-xl border ${
            지표.강조
              ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900/50'
              : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700'
          }`}>
            <div className="text-[10px] text-slate-500 mb-0.5">{지표.항목}</div>
            <div className={`text-base font-black ${지표.강조 ? 'text-red-600 dark:text-red-400' : 'text-slate-800 dark:text-slate-200'}`}>
              {지표.값}<span className="text-xs font-semibold ml-0.5">{지표.단위}</span>
            </div>
            <div className="text-[9px] text-slate-400 mt-0.5 truncate">{지표.설명}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** STEP 4: [동시 실행 3/3] 정책·지침 에이전트 */
function Step4_정책에이전트({ show_detail, on_toggle }: { show_detail: boolean; on_toggle: () => void }) {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500">
          사전 구축된 <strong>RAG Vector DB</strong>에서 복지부 취약지 고시 및 국비 50% 매칭 규정을 동시 발췌했습니다.
        </p>
        <span className="text-[10px] font-bold text-cyan-600 bg-cyan-50 dark:bg-cyan-950/60 px-2 py-0.5 rounded-full border border-cyan-200">
          Multi-Agent 3 동시 실행
        </span>
      </div>
      <div className="space-y-1.5">
        {RAG_문서_목록.slice(0, 3).map((doc) => (
          <div key={doc.id} className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-sm shrink-0">{doc.아이콘}</span>
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{doc.제목}</div>
                <div className="text-[9px] text-slate-400">{doc.유형}</div>
              </div>
            </div>
            <div className="text-[10px] font-black text-blue-600 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded-full shrink-0 ml-2">
              유사도 {doc.관련도_퍼센트}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** STEP 5: 에이전트 결과 통합 → LLM 종합 추론 */
function Step5_LLM추론({ is_running }: { is_running: boolean }) {
  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-500 leading-relaxed">
        3대 에이전트의 산출물(팩트데이터 + 분석통계 + 법령지침)을 통합 전달받아 LLM이 지역 맞춤형 정책 인과관계를 종합 추론합니다.
      </p>

      {/* 3개 에이전트 → LLM 전달 시각화 */}
      <div className="p-4 rounded-2xl bg-slate-900 dark:bg-black border border-purple-900/50 text-xs text-center space-y-3">
        <div className="grid grid-cols-3 gap-2">
          <div className="p-2 rounded-lg bg-slate-800 text-cyan-300 text-[10px] font-bold">
            📡 Data Agent<br/><span className="text-[9px] text-slate-400">병상·자원 데이터</span>
          </div>
          <div className="p-2 rounded-lg bg-slate-800 text-cyan-300 text-[10px] font-bold">
            📊 Analytics Agent<br/><span className="text-[9px] text-slate-400">RI 31.2%·취약 99%</span>
          </div>
          <div className="p-2 rounded-lg bg-slate-800 text-cyan-300 text-[10px] font-bold">
            📚 Policy Agent<br/><span className="text-[9px] text-slate-400">고시 제2024-261호</span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 text-purple-400 font-bold text-[11px]">
          <span>▼ 3대 에이전트 산출물 통합 컨텍스트 전달 ▼</span>
        </div>

        <div className="p-2.5 rounded-xl bg-purple-950/80 border border-purple-700/60 text-purple-100 flex items-center justify-center gap-2">
          <Brain className="w-4 h-4 text-purple-400 animate-pulse" />
          <span className="font-bold text-xs">
            {is_running ? 'LLM(Gemini / 로컬 sLLM) 종합 추론 연산 중...' : 'LLM 종합 정책 추론 완료'}
          </span>
        </div>
      </div>
    </div>
  );
}

/** STEP 6: 분석 근거 검증 (XAI) */
function Step6_검증() {
  return (
    <div className="space-y-2.5">
      <p className="text-xs text-slate-500 leading-relaxed">
        AI가 생성한 분석 결과가 실제 법령 조항 및 공공데이터 수치에 근거하고 있는지 교차 검증합니다.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
        {[
          '기구축 DW 원천 데이터 대조 일치',
          '보건복지부 취약지 법령 기준 적합',
          '지자체 배후인구 및 RI 수치 일치',
          '환각(Hallucination) 방지 필터 통과',
        ].map((item) => (
          <div key={item} className="flex items-center gap-2 p-2 rounded-xl bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-900/50">
            <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** STEP 7: 정책대안 및 사업계획서 도출 */
function Step7_정책대안() {
  const { 정책대안_목록 } = 영월군_AI_분석_결과;
  return (
    <div className="space-y-2.5">
      <p className="text-xs text-slate-500 leading-relaxed">
        검증된 결과를 바탕으로 3대 실행 정책대안과 표준 사업계획서가 생성되었습니다.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {정책대안_목록.map((대안, i) => (
          <div key={대안.id} className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-800 dark:text-white">Option {String.fromCharCode(65 + i)}</span>
              {대안.우선순위 === '높음' && (
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-red-100 text-red-600">★ 권장</span>
              )}
            </div>
            <div className="text-[11px] font-bold text-slate-900 dark:text-slate-200 truncate">{대안.제목}</div>
            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">{대안.기대효과}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────
// 최종 결과 화면
// ──────────────────────────────────────────────────
function AI_최종_결과({ on_restart, on_show_arch }: { on_restart: () => void; on_show_arch: () => void }) {
  const 결과 = 영월군_AI_분석_결과;
  const [copied, set_copied] = useState(false);

  const handle_copy = () => {
    const text = [
      `■ AI 분석 요약\n${결과.분석_요약}`,
      `\n■ 주요 결과\n${결과.주요_결과.map((v, i) => `${i + 1}. ${v}`).join('\n')}`,
      `\n■ 정책대안\n${결과.정책대안_목록.map((v, i) => `대안 ${String.fromCharCode(65 + i)}: ${v.제목}\n기대효과: ${v.기대효과}`).join('\n\n')}`,
      `\n■ 데이터 출처\n${결과.데이터_출처.join('\n')}`,
    ].join('');
    navigator.clipboard?.writeText(text).catch(() => {});
    set_copied(true);
    setTimeout(() => set_copied(false), 2000);
  };

  return (
    <div className="space-y-5">
      {/* 분석 완료 배너 */}
      <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-lg shrink-0">✓</div>
        <div>
          <div className="text-sm font-black text-emerald-700 dark:text-emerald-300">AI 분석 완료</div>
          <div className="text-xs text-emerald-600 dark:text-emerald-400">
            시연 시나리오 · 참고 문서 {결과.참고_문서_수}건 (영월군 예시, 실제 AI 호출 아님)
          </div>
        </div>
      </div>

      {/* 분석 요약 */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#15161b] border border-slate-200 dark:border-slate-800 space-y-2">
        <div className="text-xs font-black text-slate-400 uppercase tracking-wider">분석 요약</div>
        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{결과.분석_요약}</p>
      </div>

      {/* 주요 결과 */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#15161b] border border-slate-200 dark:border-slate-800 space-y-2">
        <div className="text-xs font-black text-slate-400 uppercase tracking-wider">주요 결과</div>
        <div className="space-y-1.5">
          {결과.주요_결과.map((v, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
              <span className="text-blue-600 font-black shrink-0">{i + 1}.</span>
              <span>{v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 정책대안 */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#15161b] border border-slate-200 dark:border-slate-800 space-y-3">
        <div className="text-xs font-black text-slate-400 uppercase tracking-wider">AI 제안 정책대안</div>
        {결과.정책대안_목록.map((대안, i) => (
          <div key={대안.id} className={`p-3 rounded-xl border space-y-1.5 ${
            i === 0
              ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-300 dark:border-blue-800'
              : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700'
          }`}>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-white bg-blue-600 px-2 py-0.5 rounded-full">
                대안 {String.fromCharCode(65 + i)}
              </span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{대안.제목}</span>
              {대안.우선순위 === '높음' && (
                <span className="text-[10px] font-bold text-red-600 bg-red-100 dark:bg-red-950/50 px-1.5 py-0.5 rounded-full ml-auto">★ 권장</span>
              )}
            </div>
            <ul className="list-none space-y-0.5 pl-2">
              {대안.내용.map((c, ci) => (
                <li key={ci} className="text-[11px] text-slate-600 dark:text-slate-400 flex items-start gap-1.5">
                  <span className="text-slate-300 shrink-0 mt-0.5">·</span>
                  <span>{c}</span>
                </li>
              ))}
            </ul>
            <div className="flex items-center gap-4 text-[11px]">
              <span className="text-slate-500">예산: <strong className="text-slate-700 dark:text-slate-300">{대안.예산_규모}</strong></span>
              <span className="text-emerald-600 dark:text-emerald-400">{대안.기대효과}</span>
            </div>
          </div>
        ))}
      </div>

      {/* 데이터 출처 */}
      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700">
        <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">데이터 출처</div>
        <div className="space-y-0.5">
          {결과.데이터_출처.map((v, i) => (
            <div key={i} className="text-[11px] text-slate-500">· {v}</div>
          ))}
        </div>
      </div>

      {/* 버튼 그룹 */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handle_copy}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer border border-slate-200 dark:border-slate-700"
        >
          <Copy className="w-3.5 h-3.5" />
          {copied ? '복사됨!' : '결과 복사'}
        </button>
        <button
          type="button"
          onClick={on_show_arch}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-xs font-bold text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition cursor-pointer border border-blue-200 dark:border-blue-800"
        >
          <Network className="w-3.5 h-3.5" />
          AI 시스템 구조 보기
        </button>
        <button
          type="button"
          onClick={on_restart}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer border border-slate-200 dark:border-slate-700"
        >
          <Play className="w-3.5 h-3.5" />
          다시 분석
        </button>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────
// AI 처리구조 다이어그램 (아키텍처 뷰)
// ──────────────────────────────────────────────────
function AI_처리구조_뷰({ on_close }: { on_close: () => void }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-black text-slate-900 dark:text-white">AI 시스템 아키텍처</h3>
          <p className="text-xs text-slate-500 mt-0.5">기구축 인프라(Step 0) 기반 3대 멀티에이전트 병렬 협업 구조</p>
        </div>
        <button type="button" onClick={on_close} className="text-slate-400 hover:text-slate-600 cursor-pointer">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* 아키텍처 다이어그램 */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 dark:bg-black border border-slate-700 shadow-xl text-xs space-y-3 font-sans text-center">
        {/* 🟢 Step 0: 사전 구축 기반 인프라 */}
        <div className="p-3.5 rounded-xl bg-emerald-950/80 border-2 border-emerald-500 text-left text-emerald-100 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950">
              STEP 0 · 상시 가동 기구축 인프라
            </span>
            <span className="text-[10px] text-emerald-300 font-semibold">Enterprise Foundation Layer</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-center">
            <div className="p-2 rounded-lg bg-emerald-900/60 border border-emerald-700/60 text-[11px] font-bold">
              🏥 공공의료 HIS/EMR
            </div>
            <div className="p-2 rounded-lg bg-emerald-900/60 border border-emerald-700/60 text-[11px] font-bold">
              🗄️ 보건의료 DW/CDW
            </div>
            <div className="p-2 rounded-lg bg-emerald-900/60 border border-emerald-700/60 text-[11px] font-bold">
              📚 RAG Vector DB
            </div>
            <div className="p-2 rounded-lg bg-emerald-900/60 border border-emerald-700/60 text-[11px] font-bold">
              🔌 MCP 프로토콜
            </div>
          </div>
          <div className="text-[10px] text-emerald-300/80 text-center">
            ※ 실시간 분석 전 사전에 구축 완료된 국가 공공의료 데이터 인프라로, 분석 요청 시 즉각적인 고속 조회를 지원합니다.
          </div>
        </div>

        <div className="text-emerald-400 font-bold text-xs">▲ 기구축 데이터 인프라 실시간 쿼리 ▲</div>

        {/* 👤 Step 1: 사용자 질문 & 오케스트레이터 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
          <div className="p-3 rounded-xl bg-blue-500/20 border border-blue-400 text-blue-100 font-bold text-xs flex items-center gap-2">
            <span className="text-base">👤</span>
            <div>
              <div className="text-[10px] text-blue-300">사용자 인입</div>
              <div>지자체 현황 질문 및 사업계획 지시</div>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-indigo-500/25 border border-indigo-400 text-indigo-100 font-bold text-xs flex items-center gap-2">
            <span className="text-base">🧭</span>
            <div>
              <div className="text-[10px] text-indigo-300">Step 1. AI 오케스트레이터</div>
              <div>의도 파악 ➔ 3대 에이전트에 동시 분배</div>
            </div>
          </div>
        </div>

        <div className="text-cyan-400 font-bold text-xs">▼ 3대 멀티에이전트 동시 병렬 실행 (Parallel Multi-Agents) ▼</div>

        {/* 🔷 Step 2: 3대 멀티에이전트 병렬 처리 영역 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div className="p-3 rounded-xl bg-cyan-950/80 border-2 border-cyan-400 text-cyan-100 text-left shadow-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-sm">📡</span>
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-cyan-500 text-slate-950">Agent 1</span>
            </div>
            <div className="font-black text-xs text-white">데이터 수집 에이전트</div>
            <div className="text-[10px] text-cyan-300 leading-tight">
              MCP로 기구축 DW 및 병원시스템 팩트 데이터 실시간 쿼리
            </div>
          </div>

          <div className="p-3 rounded-xl bg-cyan-950/80 border-2 border-cyan-400 text-cyan-100 text-left shadow-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-sm">📊</span>
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-cyan-500 text-slate-950">Agent 2</span>
            </div>
            <div className="font-black text-xs text-white">통계·수요분석 에이전트</div>
            <div className="text-[10px] text-cyan-300 leading-tight">
              RI·유출입 격차 및 2030 시계열 미래 의료수요 연산
            </div>
          </div>

          <div className="p-3 rounded-xl bg-cyan-950/80 border-2 border-cyan-400 text-cyan-100 text-left shadow-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-sm">📚</span>
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-cyan-500 text-slate-950">Agent 3</span>
            </div>
            <div className="font-black text-xs text-white">법령·지침 정책 에이전트</div>
            <div className="text-[10px] text-cyan-300 leading-tight">
              Vector DB에서 복지부 고시·국비 50% 매칭 기준 발췌
            </div>
          </div>
        </div>

        <div className="py-0.5">
          <span className="inline-block px-3 py-1 rounded-full bg-purple-900/60 text-purple-200 font-extrabold text-[11px] border border-purple-500">
            ▼ 3개 에이전트 산출물(데이터+통계+법령) 통합 전달 ▼
          </span>
        </div>

        {/* 🟠 Step 3: LLM 종합 분석 */}
        <div className="px-4 py-3 rounded-xl bg-purple-950/80 border-2 border-purple-400 text-purple-50 font-black shadow-md">
          <Brain className="w-5 h-5 mx-auto mb-1 text-purple-300 inline-block" />
          <div className="text-sm font-black text-purple-200">Step 3. LLM 종합 추론 엔진</div>
          <div className="text-xs font-bold text-purple-100 mt-0.5">
            Google Gemini Cloud AI 또는 원내 폐쇄망 On-Device 로컬 sLLM 듀얼 추론
          </div>
        </div>

        <div className="text-slate-400 font-bold text-xs">↓</div>

        {/* 🛡️ Step 4 & 📝 Step 5 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
          <div className="p-2.5 rounded-xl bg-teal-500/20 border border-teal-400 text-teal-100 font-bold text-xs flex items-center gap-2">
            <span className="text-base">🛡️</span>
            <div>
              <div className="text-[10px] text-teal-300">Step 4. 근거 검증 (XAI)</div>
              <div>법령 원문 대조 & 환각(Hallucination) 방지</div>
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-400 text-amber-100 font-bold text-xs flex items-center gap-2">
            <span className="text-base">📝</span>
            <div>
              <div className="text-[10px] text-amber-300">Step 5. 최종 산출물</div>
              <div>정책대안 Option A·B·C & 표준 사업계획서</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────
// 메인 AI 분석 패널 컴포넌트
// ──────────────────────────────────────────────────

interface AI_분석_패널_속성 {
  is_open: boolean;
  on_close: () => void;
  region_name?: string;
  initial_query?: string;
}

export const AI_분석_패널: React.FC<AI_분석_패널_속성> = ({
  is_open,
  on_close,
  region_name = '강원 영월군',
  initial_query = '영월군의 응급의료 취약 원인과 개선방안을 분석해줘.',
}) => {
  const DEFAULT_QUERY = initial_query;

  // 상태 관리
  const [query, set_query] = useState(DEFAULT_QUERY);
  const [phase, set_phase] = useState<'input' | 'pipeline' | 'result'>('input');
  const [current_step_idx, set_current_step_idx] = useState(-1);
  const [done_steps, set_done_steps] = useState<Set<number>>(new Set());
  const [expanded_steps, set_expanded_steps] = useState<Set<number>>(new Set());
  const [pipeline_all_done, set_pipeline_all_done] = useState(false); // 파이프라인 전체 완료 여부
  const [show_rag_detail, set_show_rag_detail] = useState(false);
  const [show_arch, set_show_arch] = useState(false);
  const timer_ref = useRef<ReturnType<typeof setTimeout> | null>(null);

  const STEPS = AI_파이프라인_단계_목록;

  // 모달 외부 클릭 처리 및 ESC 키
  useEffect(() => {
    if (!is_open) return;
    const handle_key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') on_close();
    };
    window.addEventListener('keydown', handle_key);
    return () => window.removeEventListener('keydown', handle_key);
  }, [is_open, on_close]);

  // 파이프라인 순차 실행 함수
  const run_pipeline = useCallback(() => {
    set_phase('pipeline');
    set_current_step_idx(0);
    set_done_steps(new Set());
    set_expanded_steps(new Set([0]));
    set_pipeline_all_done(false);

    const run_next = (step_index: number) => {
      if (step_index >= STEPS.length) {
        set_current_step_idx(STEPS.length);
        // 완료 시: 자동으로 결과 화면 전환 대신 모든 단계를 펼쳐서 보여줌
        timer_ref.current = setTimeout(() => {
          set_expanded_steps(new Set(STEPS.map((_, i) => i)));
          set_pipeline_all_done(true);
        }, 400);
        return;
      }

      set_current_step_idx(step_index);
      set_expanded_steps(new Set([step_index]));

      const duration = STEPS[step_index].처리_시간_ms;

      timer_ref.current = setTimeout(() => {
        set_done_steps((prev) => new Set(Array.from(prev).concat(step_index)));
        run_next(step_index + 1);
      }, duration);
    };

    run_next(0);
  }, [STEPS]);

  // 재분석 핸들러
  const handle_restart = () => {
    if (timer_ref.current) clearTimeout(timer_ref.current);
    set_phase('input');
    set_current_step_idx(-1);
    set_done_steps(new Set());
    set_expanded_steps(new Set());
    set_pipeline_all_done(false);
    set_show_arch(false);
  };

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (timer_ref.current) clearTimeout(timer_ref.current);
    };
  }, []);

  // 단계 상태 결정
  const get_step_status = (idx: number): 파이프라인_단계_상태 => {
    if (done_steps.has(idx)) return 'done';
    if (idx === current_step_idx) return 'running';
    return 'waiting';
  };

  if (!is_open) return null;

  return (
    // 모달 오버레이
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) on_close(); }}
    >
      <div className="w-full max-w-2xl max-h-[90vh] flex flex-col bg-white dark:bg-[#15161b] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">

        {/* ─── 헤더 ─── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-blue-600" />
              <h2 className="text-sm font-black text-slate-900 dark:text-white">AI 처리 8단계</h2>
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                시연
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              AI가 공공의료 데이터를 분석하고 정책대안을 만드는 과정을 확인할 수 있습니다.
            </p>
          </div>
          <button
            type="button"
            onClick={on_close}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ─── 본문 스크롤 영역 ─── */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">

          {/* ═══════════════════════════════════
              PHASE: INPUT (분석 시작 전)
          ═══════════════════════════════════ */}
          {phase === 'input' && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700 dark:text-slate-300">분석 질문</label>
                <textarea
                  value={query}
                  onChange={(e) => set_query(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition"
                  placeholder="분석할 질문을 입력하세요."
                />
                <p className="text-[11px] text-slate-400">기본 질문을 그대로 사용하거나, 직접 수정하여 분석할 수 있습니다.</p>
              </div>

              {/* 시연 안내 */}
              <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-xs font-bold text-amber-900 dark:text-amber-200">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  시연용 화면입니다. 실제 AI를 호출하지 않으며, 선택 지역과 관계없이 영월군 예시 결과(헬스맵 2024·E-Gen 실제 값)를 보여줍니다.
                  관련도 점수와 처리 단계는 예시입니다.
                </span>
              </div>

              {/* 분석 대상 지역 표시 */}
              <div className="flex items-center gap-2 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                <Info className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="text-xs text-blue-700 dark:text-blue-300">
                  분석 대상 지역: <strong>{region_name}</strong>
                </span>
              </div>

              {/* 전체 파이프라인 미리보기 */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">
                  AI 시스템 8단계 파이프라인 (Step 0 기반 + 3대 멀티에이전트)
                </div>

                {/* 색상 범례: 기구축 인프라 및 실행 주체 기준 */}
                <div className="flex flex-wrap gap-2 mb-3 pb-2.5 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 font-semibold self-center">시스템 분류:</span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800">
                    🟢 Step 0 기구축 인프라
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800">
                    🔵 AI Orchestrator
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border bg-cyan-100 text-cyan-800 border-cyan-300 dark:bg-cyan-950/60 dark:text-cyan-300 dark:border-cyan-800">
                    🔷 멀티에이전트 3종
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800">
                    🟠 LLM 추론 엔진
                  </span>
                </div>

                <div className="space-y-1.5">
                  {STEPS.map((step) => (
                    <div key={step.id} className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold text-slate-500 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700 shrink-0">
                        {step.아이콘} {step.번호}. {step.제목}
                      </span>
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${step.실행_주체.색상_클래스}`}>
                        <span>{step.실행_주체.아이콘}</span>
                        <span>{step.실행_주체.이름}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={run_pipeline}
                disabled={!query.trim()}
                className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-black text-sm transition active:scale-95 flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                <Play className="w-4 h-4" />
                AI 분석 시작
              </button>
            </div>
          )}

          {/* ═══════════════════════════════════
              PHASE: PIPELINE (실행 중)
          ═══════════════════════════════════ */}
          {phase === 'pipeline' && (
            <div className="space-y-3">
              {/* 진행 질문 표시 */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700">
                <div className="text-[10px] font-bold text-slate-400 mb-0.5">분석 질문</div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{query}</p>
              </div>

              {/* 단계 목록 */}
              {STEPS.map((step, idx) => {
                const status = get_step_status(idx);
                const is_expanded = expanded_steps.has(idx);
                const is_done = status === 'done';
                const is_running = status === 'running';

                return (
                  <div
                    key={step.id}
                    className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                      is_running
                        ? 'border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-950/20'
                        : is_done
                          ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/10'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#15161b]'
                    }`}
                  >
                    {/* 단계 헤더 */}
                    <button
                      type="button"
                      onClick={() => {
                        if (is_done) {
                          set_expanded_steps((prev) => {
                            const next = new Set(prev);
                            if (next.has(idx)) next.delete(idx);
                            else next.add(idx);
                            return next;
                          });
                        }
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left ${is_done ? 'cursor-pointer' : 'cursor-default'}`}
                    >
                      {/* 상태 아이콘 */}
                      <div className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 text-sm transition ${get_step_color(status)}`}>
                        {is_done ? <CheckCircle2 className="w-4 h-4" /> :
                         is_running ? <Loader2 className="w-4 h-4 animate-spin" /> :
                         <span className="text-xs font-bold">{step.번호}</span>}
                      </div>

                      {/* 제목 + 실행 주체 */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-xs font-black ${
                            is_running ? 'text-blue-700 dark:text-blue-300' :
                            is_done ? 'text-emerald-700 dark:text-emerald-300' :
                            'text-slate-400'
                          }`}>
                            {step.아이콘} {step.번호}. {step.제목}
                          </span>

                          {/* ── 실행 주체 뱃지 ── */}
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border transition-all ${
                            is_running
                              ? `${step.실행_주체.색상_클래스} animate-pulse`
                              : is_done
                                ? step.실행_주체.색상_클래스
                                : 'bg-slate-100 text-slate-400 border-slate-200 dark:bg-slate-800 dark:text-slate-500 dark:border-slate-700'
                          }`}>
                            <span>{step.실행_주체.아이콘}</span>
                            <span>{step.실행_주체.이름}</span>
                            {(is_running || is_done) && (
                              <span className="opacity-60">· {step.실행_주체.영문}</span>
                            )}
                          </span>

                          {is_running && (
                            <span className="text-[10px] font-bold text-blue-600 bg-blue-100 dark:bg-blue-950/50 px-1.5 py-0.5 rounded-full animate-pulse">
                              처리 중...
                            </span>
                          )}
                          {is_done && (
                            <span className="text-[10px] font-bold text-emerald-600">완료</span>
                          )}
                        </div>
                        {(is_running || is_expanded) && (
                          <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">{step.부제목}</p>
                        )}
                      </div>

                      {is_done && (
                        <span className="text-slate-400 shrink-0">
                          {is_expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </span>
                      )}
                    </button>

                    {/* 단계별 상세 내용 */}
                    {(is_running || (is_done && is_expanded)) && (
                      <div className="px-4 pb-4 pt-0">
                        <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
                          {idx === 0 && <Step0_사전구축인프라 is_done={is_done} />}
                          {idx === 1 && <Step1_오케스트레이션 region_name={region_name} query={query} />}
                          {idx === 2 && <Step2_데이터에이전트 />}
                          {idx === 3 && <Step3_분석에이전트 />}
                          {idx === 4 && <Step4_정책에이전트 show_detail={show_rag_detail} on_toggle={() => set_show_rag_detail((v) => !v)} />}
                          {idx === 5 && <Step5_LLM추론 is_running={is_running} />}
                          {idx === 6 && <Step6_검증 />}
                          {idx === 7 && <Step7_정책대안 />}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* ═══════════════════════════════════
              PHASE: RESULT (최종 결과)
          ═══════════════════════════════════ */}
          {phase === 'result' && !show_arch && (
            <AI_최종_결과
              on_restart={handle_restart}
              on_show_arch={() => set_show_arch(true)}
            />
          )}

          {/* ═══════════════════════════════════
              AI 처리구조 다이어그램 (결과 위에 오버레이)
          ═══════════════════════════════════ */}
          {phase === 'result' && show_arch && (
            <AI_처리구조_뷰 on_close={() => set_show_arch(false)} />
          )}

        </div>

        {/* ─── 하단 푸터 (파이프라인 실행 중 진행률 / 완료 후 CTA) ─── */}
        {phase === 'pipeline' && (
          <div className="shrink-0 px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
            {!pipeline_all_done ? (
              <>
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                  <span>진행 상황</span>
                  <span>{done_steps.size} / {STEPS.length} 단계 완료</span>
                </div>
                <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all duration-500"
                    style={{ width: `${(done_steps.size / STEPS.length) * 100}%` }}
                  />
                </div>
              </>
            ) : (
              /* 파이프라인 완료 상태: 단계별 결과 확인 + 최종 결과 이동 버튼 */
              <div className="space-y-2.5">
                {/* 완료 진행 바 */}
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span className="text-emerald-600 font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    분석 완료 — 단계별 결과를 확인하세요
                  </span>
                  <span className="text-emerald-600 font-bold">{STEPS.length} / {STEPS.length} 단계 완료</span>
                </div>
                <div className="w-full h-1.5 bg-emerald-100 dark:bg-emerald-900/50 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full w-full" />
                </div>
                {/* 버튼 그룹 */}
                <div className="flex items-center gap-2">
                  {/* 모두 접기 / 펼치기 토글 */}
                  <button
                    type="button"
                    onClick={() => {
                      if (expanded_steps.size === STEPS.length) {
                        set_expanded_steps(new Set());
                      } else {
                        set_expanded_steps(new Set(STEPS.map((_, i) => i)));
                      }
                    }}
                    className="flex-1 py-2 rounded-xl bg-white dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer border border-slate-200 dark:border-slate-700"
                  >
                    {expanded_steps.size === STEPS.length ? '모두 접기 ▲' : '모두 펼치기 ▼'}
                  </button>
                  {/* 최종 결과 보기 */}
                  <button
                    type="button"
                    onClick={() => set_phase('result')}
                    className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-black text-white transition active:scale-95 cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                    최종 결과 보기
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
