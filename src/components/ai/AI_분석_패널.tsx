'use client';

// Essential Care Map - AI 분석 프로세스 시각화 패널
// 기존 UI/UX를 100% 유지하면서 AI Pipeline 시각화를 Modal로 제공합니다.
// [MOCK] 이 컴포넌트는 실제 AI API를 호출하지 않고 Mock 파이프라인을 시뮬레이션합니다.

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { AI_질의_입력창 } from '@/components/ai/AI_질의_입력창';
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
  Sparkles,
} from 'lucide-react';
import type { 파이프라인_단계_상태, 파이프라인_단계, 데이터_소스, AI_분석_결과, 분석_지표, 정책대안 } from '@/types/ai';
import { AI_파이프라인_단계_목록 } from '@/data/mock/ai/aiPipeline';
import { AI_데이터_소스_목록, AI_데이터_검색_결과_영월 } from '@/data/mock/ai/dataSources';
import { RAG_문서_목록 } from '@/data/mock/ai/ragDocuments';
import { 영월군_AI_분석_결과, 영월군_분석_지표 } from '@/data/mock/ai/analysisResults';
import {
  시군구_AI_분석_실행,
  시군구_AI_분석_Gemini_결과_반영,
  type 시군구_AI_분석_패키지,
} from '@/lib/시군구_AI_분석_엔진';
import { API키_불러오기 } from '@/lib/API키_저장소';

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

/** STEP 01: 질문 이해 & 입력 가드레일 (AI Orchestrator) */
function Step1_질문이해({ region_name, query }: { region_name: string; query: string }) {
  const extracted_region = region_name || '영월군';
  const is_emergency = query.includes('응급');
  return (
    <div className="space-y-3">
      <div className="p-3 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-950 dark:text-indigo-200 leading-relaxed">
        <strong>01 질문 이해 & 입력 가드레일:</strong> 자연어 질문에서 분석 대상과 목적을 추출하고 분석 계획을 수립합니다.
        입력 가드레일이 민감정보와 프롬프트 인젝션을 사전 차단하며, 첨부파일은 임시 컨텍스트로 격리합니다.
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {[
          { 항목: '대상 지자체', 값: extracted_region },
          { 항목: '분석 중점 분야', 값: is_emergency ? '응급의료 취약지표' : '필수의료 전반' },
          { 항목: '분석 계획', 값: '정량(DW) · 정성(Vector) 병렬 분기' },
        ].map((item) => (
          <div key={item.항목} className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-900/60">
            <div className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 mb-0.5">{item.항목}</div>
            <div className="text-xs font-black text-slate-900 dark:text-white">{item.값}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** STEP 02: [정량 갈래] 데이터 검색 (Data Lake / DW · MCP) */
function Step2_데이터검색({ 데이터 }: { 데이터: Record<string, string> }) {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500">
          Data Lake / DW 적재 정형 데이터(SQL) 및 MCP Gateway 실시간 연계 데이터를 조회했습니다.
        </p>
        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-full border border-blue-200">
          정량 갈래 02단계
        </span>
      </div>
      <div className="space-y-1.5">
        {Object.entries(데이터).map(([key, value]) => (
          <div key={key} className="flex items-center gap-2 p-2 rounded-xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** STEP 03: [정성 갈래] 지식 검색 (Vector DB) */
function Step3_지식검색({ show_detail, on_toggle }: { show_detail: boolean; on_toggle: () => void }) {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500">
          Vector DB에서 질문과 관련된 법령, 기본계획, 취약지 지정 기준, 사업 지침을 의미 기반으로 검색했습니다.
        </p>
        <span className="text-[10px] font-bold text-purple-600 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded-full border border-purple-200">
          정성 갈래 03단계
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
            <div className="text-[10px] font-black text-purple-600 bg-purple-50 dark:bg-purple-950/50 px-2 py-0.5 rounded-full shrink-0 ml-2">
              유사도 {doc.관련도_퍼센트}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** STEP 04: [정량 갈래] 데이터 분석 (분석 엔진 - 계산과 해석의 분리) */
function Step4_데이터분석({ 지표_목록 }: { 지표_목록: 분석_지표[] }) {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500">
          <strong>계산과 해석의 분리:</strong> 수치 계산을 LLM이 아닌 분석 엔진이 SQL·통계·GIS로 직접 계산하여 정확성을 보장합니다.
        </p>
        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-full border border-blue-200">
          분석 엔진 전담
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {지표_목록.map((지표) => (
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

/** STEP 05: LLM 종합 분석 (정량+정성 합류 지점) */
function Step5_LLM종합분석({
  is_running,
  종합_진단_텍스트 = '영월군은 60분 내 응급의료 미도달 인구비율이 85.9%에 달하고, 관내 응급의료 이용률(RI)이 4.6%에 불과하여 자체 완결성이 극히 취약한 상태입니다.',
  ri_rate = '4.6',
  emergency_rate = '85.9',
  used_model,
  is_gemini_live,
  elapsed_ms,
}: {
  is_running: boolean;
  종합_진단_텍스트?: string;
  ri_rate?: string | number;
  emergency_rate?: string | number;
  used_model?: string;
  is_gemini_live?: boolean;
  elapsed_ms?: number;
}) {
  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-500 leading-relaxed">
        정량 분석 결과(04)와 정책 지식(03)이 합류하여, LLM이 어떤 기준에 비추어 무엇이 취약하고 그 원인이 무엇인지 인과관계를 진단합니다.
      </p>

      {/* 정량 + 정성 합류 시각화 */}
      <div className="p-4 rounded-2xl bg-slate-900 dark:bg-black border border-purple-900/50 text-xs text-center space-y-2.5">
        <div className="grid grid-cols-2 gap-2 text-[10px]">
          <div className="p-2 rounded-lg bg-blue-950/80 border border-blue-700/60 text-blue-200 font-bold">
            📊 정량 분석 결과 (04 분석엔진)<br/><span className="text-slate-400 font-normal">RI {ri_rate}% · 골든타임 미도달 {emergency_rate}%</span>
          </div>
          <div className="p-2 rounded-lg bg-purple-950/80 border border-purple-700/60 text-purple-200 font-bold">
            📚 정성 정책 지식 (03 Vector DB)<br/><span className="text-slate-400 font-normal">복지부 취약지 고시 제2024-261호</span>
          </div>
        </div>

        <div className="text-purple-400 font-bold text-[11px]">
          ▼ 정량 수치 + 정책 지식 종합 합류 (내부 sLLM / 외부 비식별화) ▼
        </div>

        <div className="p-2.5 rounded-xl bg-purple-950/90 border border-purple-600 text-purple-100 flex items-center justify-center gap-2">
          {is_gemini_live ? (
            <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
          ) : (
            <Brain className="w-4 h-4 text-purple-400 animate-pulse" />
          )}
          <span className="font-bold text-xs">
            {is_running
              ? is_gemini_live
                ? 'Google Gemini 모델 실시간 추론 진행 중...'
                : '취약 원인 및 인과관계 종합 진단 중...'
              : '원인 진단 및 해석 완료'}
          </span>
        </div>

        {!is_running && is_gemini_live && (
          <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-purple-900/60 border border-purple-500/50 text-[10px] text-purple-200">
            <span className="flex items-center gap-1 font-bold">
              <Sparkles className="w-3 h-3 text-purple-300" />
              {used_model || 'Google Gemini 2.5 Flash 실시간 추론'}
            </span>
            {elapsed_ms && (
              <span className="text-purple-300 opacity-80">
                (응답 소요: {(elapsed_ms / 1000).toFixed(1)}초)
              </span>
            )}
          </div>
        )}

        {!is_running && (
          <p className="text-[11px] text-purple-200 text-left bg-purple-950/40 p-2.5 rounded-xl border border-purple-800/50 leading-relaxed whitespace-pre-line">
            {종합_진단_텍스트}
          </p>
        )}
      </div>
    </div>
  );
}

/** STEP 06: 정책대안 생성 (정책대안 Agent) */
function Step6_정책대안생성({ 대안_목록 = 영월군_AI_분석_결과.정책대안_목록 }: { 대안_목록?: 정책대안[] }) {
  return (
    <div className="space-y-2.5">
      <p className="text-xs text-slate-500 leading-relaxed">
        진단 결과를 바탕으로 정책대안 Agent가 효과·비용·난이도 우선순위를 평가하고 실행 방안을 구성합니다.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {대안_목록.map((대안, i) => (
          <div key={대안.id} className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-800 dark:text-white">Option {String.fromCharCode(65 + i)}</span>
              {대안.우선순위 === '높음' && (
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-red-100 text-red-600">★ 1순위</span>
              )}
            </div>
            <div className="text-[11px] font-bold text-slate-900 dark:text-slate-200 truncate">{대안.제목}</div>
            <div className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold">{대안.기대효과}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** STEP 07: 근거 검증 & 출력 가드레일 (롤백 루프) */
function Step7_근거검증({ 검증_항목_목록 = [
  '데이터 출처 및 기준연도(2024) 일치',
  '본문 수치와 분석 엔진 결과 일치',
  '정책자료 근거 및 지침 부합성 확인',
  '논리적 비약 및 편향 검증 통과',
] }: { 검증_항목_목록?: string[] }) {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500 leading-relaxed">
          가장 영향력이 큰 정책대안을 반드시 검증하며, 불통 시 종합 분석 또는 대안 생성으로 롤백합니다.
        </p>
        <span className="text-[10px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-full border border-rose-200">
          검증 & 롤백 가드레일
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
        {검증_항목_목록.map((item) => (
          <div key={item} className="flex items-center gap-2 p-2 rounded-xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50">
            <CheckCircle2 className="w-3.5 h-3.5 text-rose-600 shrink-0" />
            <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** STEP 08: 결과 제공 & 피드백 환류 */
function Step8_결과제공({ region_name = '강원 영월군' }: { region_name?: string }) {
  return (
    <div className="space-y-2.5">
      <p className="text-xs text-slate-500 leading-relaxed">
        검증을 통과한 분석 요약, 주요 지표, 정책대안을 제공하고 활용한 데이터와 참고 문서를 근거로 제시합니다.
      </p>
      <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
        <div className="text-xs font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{region_name} 맞춤형 정책계획서 및 의사결정 지표 산출 완료</span>
        </div>
        <span className="text-[10px] font-bold text-emerald-700 bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-emerald-300">
          LLMOps 피드백 환류 대기
        </span>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────
// 최종 결과 화면
// ──────────────────────────────────────────────────
function AI_최종_결과({
  결과 = 영월군_AI_분석_결과,
  region_name = '강원 영월군',
  생성_모델,
  is_gemini_live,
  소요시간_ms,
  on_restart,
  on_show_arch,
}: {
  결과?: AI_분석_결과;
  region_name?: string;
  생성_모델?: string;
  is_gemini_live?: boolean;
  소요시간_ms?: number;
  on_restart: () => void;
  on_show_arch: () => void;
}) {
  const [copied, set_copied] = useState(false);

  const handle_copy = () => {
    const text = [
      `■ [${region_name}] AI 분석 요약\n${결과.분석_요약}`,
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
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-black text-emerald-700 dark:text-emerald-300">
              {region_name} AI 분석 완료
            </span>
            {is_gemini_live ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-950/60 px-2 py-0.5 rounded-full border border-purple-300">
                <Sparkles className="w-2.5 h-2.5" />
                {생성_모델 || 'Google Gemini'} 실시간 추론 연동
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-950/60 px-2 py-0.5 rounded-full border border-blue-300">
                공공의료 지능형 진단 엔진
              </span>
            )}
          </div>
          <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
            {is_gemini_live
              ? `Gemini 클라우드 연동 (${소요시간_ms ? (소요시간_ms / 1000).toFixed(1) : '1.2'}초 소요)`
              : '실시간 진단 엔진 연계'} · 참고 문서 {결과.참고_문서_수}건 (2024 헬스맵·공공의료 통계 실데이터 반영)
          </div>
        </div>
      </div>

      {/* 분석 요약 */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#15161b] border border-slate-200 dark:border-slate-800 space-y-2">
        <div className="text-xs font-black text-slate-400 uppercase tracking-wider">분석 요약</div>
        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">{결과.분석_요약}</p>
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
          <h3 className="text-base font-black text-slate-900 dark:text-white">공공의료 AI 분석 시스템 아키텍처</h3>
          <p className="text-xs text-slate-500 mt-0.5">질의 처리 8단계(분기·합류 & 계산/해석 분리) 및 지식 구축 흐름 명세</p>
        </div>
        <button type="button" onClick={on_close} className="text-slate-400 hover:text-slate-600 cursor-pointer">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* 아키텍처 다이어그램 */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 dark:bg-black border border-slate-700 shadow-xl text-xs space-y-3 font-sans text-center">
        {/* 01. 질문 이해 & 입력 가드레일 */}
        <div className="p-3 rounded-xl bg-indigo-950/80 border-2 border-indigo-400 text-left text-indigo-100 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-indigo-500 text-white">01</span>
            <div>
              <div className="text-xs font-bold text-white">질문 이해 & 입력 가드레일 (AI Orchestrator)</div>
              <div className="text-[10px] text-indigo-300">자연어 의도 파악, 분석 계획 수립, 민감정보/인젝션 차단, 파일 임시 격리</div>
            </div>
          </div>
          <span className="text-[9px] font-bold text-indigo-300 bg-indigo-900/60 px-2 py-0.5 rounded border border-indigo-700">
            두 갈래 병렬 분기 ➔
          </span>
        </div>

        <div className="text-slate-400 font-bold text-xs">▼ 두 갈래 병렬 분기 (정량 갈래 vs 정성 갈래) ▼</div>

        {/* 정량 갈래 vs 정성 갈래 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
          {/* 정량 갈래: 02 데이터검색 -> 04 데이터분석 (분석엔진) */}
          <div className="p-3 rounded-xl bg-blue-950/70 border-2 border-blue-400 space-y-2">
            <div className="flex items-center justify-between border-b border-blue-800 pb-1">
              <span className="text-xs font-black text-blue-200">정량 갈래 (수치 산출)</span>
              <span className="text-[9px] font-bold text-blue-300">계산과 해석의 분리</span>
            </div>
            <div className="p-2 rounded-lg bg-blue-900/60 border border-blue-700/60 text-[11px] text-blue-100">
              <strong>02. 데이터 검색 (DW · MCP):</strong> DW 병상·인력 SQL 조회 및 MCP 실시간 가용병상 연계
            </div>
            <div className="text-center text-blue-400 font-bold text-[10px]">↓</div>
            <div className="p-2 rounded-lg bg-blue-900/90 border border-blue-400 text-[11px] text-blue-100 font-medium">
              <strong>04. 데이터 분석 (분석 엔진):</strong> 골든타임 도달 인구비율, 지역 격차 등 정확한 수치를 SQL·GIS로 직접 계산
            </div>
          </div>

          {/* 정성 갈래: 03 지식검색 (Vector DB) */}
          <div className="p-3 rounded-xl bg-purple-950/70 border-2 border-purple-400 space-y-2 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-purple-800 pb-1 mb-2">
                <span className="text-xs font-black text-purple-200">정성 갈래 (정책 지식)</span>
                <span className="text-[9px] font-bold text-purple-300">의미 기반 RAG</span>
              </div>
              <div className="p-2.5 rounded-lg bg-purple-900/60 border border-purple-700/60 text-[11px] text-purple-100">
                <strong>03. 지식 검색 (Vector DB):</strong> 법령, 기본계획, 취약지 지정 기준, 사업 지침, 유사 사례 문서 검색
              </div>
            </div>
            <div className="text-[10px] text-purple-300 bg-purple-900/40 p-2 rounded-lg border border-purple-800">
              ※ 통계 가공 없이 05 LLM 종합 분석으로 즉시 전달
            </div>
          </div>
        </div>

        <div className="text-purple-400 font-bold text-xs">▼ 두 갈래 합류 (정량 분석 수치 + 정책 지식) ▼</div>

        {/* 05. LLM 종합 분석 */}
        <div className="p-3 rounded-xl bg-purple-950/90 border-2 border-purple-400 text-left text-purple-100 shadow-md space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black flex items-center gap-1.5">
              <span className="px-1.5 py-0.2 rounded bg-purple-600 text-white text-[9px]">05</span>
              <span>LLM 종합 분석 (LLM 레이어 - 해석 전담)</span>
            </span>
            <span className="text-[9px] font-bold text-purple-300 bg-purple-900/60 px-2 py-0.5 rounded border border-purple-700">
              내부망 sLLM vs 외부 LLM 비식별화 분기
            </span>
          </div>
          <p className="text-[11px] text-purple-200">
            정량 분석 결과(04)와 정책 지식(03)을 함께 받아 취약 원인 및 인과관계를 진단합니다.
          </p>
        </div>

        <div className="text-slate-400 font-bold text-xs">↓</div>

        {/* 06 & 07: 대안 생성 후 근거 검증 (롤백 루프) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
          <div className="p-3 rounded-xl bg-amber-950/70 border-2 border-amber-400 text-amber-100 space-y-1">
            <div className="text-xs font-bold flex items-center gap-1.5">
              <span className="px-1.5 py-0.2 rounded bg-amber-600 text-white text-[9px]">06</span>
              <span>정책대안 생성 (정책대안 Agent)</span>
            </div>
            <div className="text-[10px] text-amber-200">
              효과·비용·난이도 우선순위 평가 및 단계별 실행 방안(Option A·B·C) 도출
            </div>
          </div>

          <div className="p-3 rounded-xl bg-rose-950/70 border-2 border-rose-400 text-rose-100 space-y-1">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold flex items-center gap-1.5">
                <span className="px-1.5 py-0.2 rounded bg-rose-600 text-white text-[9px]">07</span>
                <span>근거 검증 · 출력 가드레일</span>
              </div>
              <span className="text-[9px] font-black text-rose-300">롤백 루프</span>
            </div>
            <div className="text-[10px] text-rose-200">
              출처·수치·정책근거 점검 (불통 시 05 또는 06 단계로 되돌려 재생성)
            </div>
          </div>
        </div>

        <div className="text-slate-400 font-bold text-xs">↓ 검증 통과</div>

        {/* 08. 결과 제공 */}
        <div className="p-2.5 rounded-xl bg-emerald-950/80 border-2 border-emerald-400 text-emerald-100 text-left flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-1.5 py-0.2 rounded bg-emerald-600 text-white text-[9px] font-black">08</span>
            <div className="text-xs font-bold">결과 제공 & 피드백 환류 (차트·대시보드·사업계획서 + LLMOps 환류)</div>
          </div>
          <span className="text-[9px] font-bold text-emerald-300 bg-emerald-900/60 px-2 py-0.5 rounded border border-emerald-700">
            최종 산출물
          </span>
        </div>

        {/* 3대 저장소 안내 바 */}
        <div className="pt-2 border-t border-slate-700 text-left grid grid-cols-3 gap-2 text-[10px]">
          <div className="p-2 rounded-lg bg-slate-800 text-slate-300">
            <strong className="text-blue-400 block mb-0.5">DW (정형)</strong>
            의료기관·인구통계 정기 배치 적재
          </div>
          <div className="p-2 rounded-lg bg-slate-800 text-slate-300">
            <strong className="text-purple-400 block mb-0.5">Vector DB (비정형)</strong>
            법령·지침 제개정 시 재임베딩
          </div>
          <div className="p-2 rounded-lg bg-slate-800 text-slate-300">
            <strong className="text-teal-400 block mb-0.5">MCP Gateway (최신)</strong>
            실시간 응급실 병상 API 도구 호출
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
  // 상태 관리
  // 질문은 빈 칸에서 시작: 회색 예시(initial_query)를 Tab으로 채우고 오른쪽 실행으로 분석
  const [query, set_query] = useState('');
  const [phase, set_phase] = useState<'input' | 'pipeline' | 'result'>('input');
  const [current_step_idx, set_current_step_idx] = useState(-1);
  const [done_steps, set_done_steps] = useState<Set<number>>(new Set());
  const [expanded_steps, set_expanded_steps] = useState<Set<number>>(new Set());
  const [pipeline_all_done, set_pipeline_all_done] = useState(false); // 파이프라인 전체 완료 여부
  const [show_rag_detail, set_show_rag_detail] = useState(false);
  const [show_arch, set_show_arch] = useState(false);
  const [has_gemini_key, set_has_gemini_key] = useState(false);
  const [live_gemini_pack, set_live_gemini_pack] = useState<시군구_AI_분석_패키지 | null>(null);
  const timer_ref = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Gemini API 키 등록 여부 감지
  useEffect(() => {
    if (is_open) {
      const key = API키_불러오기('google_gemini_api_key');
      set_has_gemini_key(!!key);
    }
  }, [is_open]);

  // initial_query 및 region_name 변경 시 동기화
  useEffect(() => {
    set_query('');
  }, [initial_query]);

  // 전국 229개 시군구 실데이터 동적 AI 분석 패키지 산출 (2024 헬스맵 & 진단 엔진 연계)
  const analysis_pack = useMemo(() => {
    return 시군구_AI_분석_실행(region_name, query);
  }, [region_name, query]);

  // 실시간 Gemini 결과가 있으면 우선 사용, 없으면 엔진 내장 패키지 사용
  const current_pack = live_gemini_pack || analysis_pack;

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

  // 파이프라인 순차 실행 함수 (Google Gemini 실시간 호출 병렬 트리거)
  const run_pipeline = useCallback(() => {
    set_phase('pipeline');
    set_current_step_idx(0);
    set_done_steps(new Set());
    set_expanded_steps(new Set([0]));
    set_pipeline_all_done(false);
    set_live_gemini_pack(null);

    // Google Gemini API 키가 등록된 경우 백그라운드 실시간 호출
    const gemini_key = API키_불러오기('google_gemini_api_key');
    if (gemini_key) {
      fetch('/api/llm/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          google_api_key: gemini_key,
          region_name: analysis_pack.지역_표시명,
          region_stats: {
            emergency_rate: analysis_pack.시군구.응급_60분_미도달_인구비율,
            ri_rate: analysis_pack.시군구.관내_응급_의료이용률,
            maternity_rate: analysis_pack.시군구.관내_분만율,
            vulnerability_grade:
              (analysis_pack.시군구.응급_60분_미도달_인구비율 ?? 0) >= 30 ? '심각' : '관찰',
          },
          rag_context: '보건복지부 취약지 고시 제2024-261호, 공공보건의료에 관한 법률 제12조',
          mode: 'general_qa',
        }),
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.google_gemini?.response) {
            const updated = 시군구_AI_분석_Gemini_결과_반영(
              analysis_pack,
              data.google_gemini.response,
              data.google_gemini.model || 'Google Gemini 2.5 Flash',
              data.google_gemini.elapsed_ms || 1200
            );
            set_live_gemini_pack(updated);
          }
        })
        .catch((err) => {
          console.warn('[Gemini 연동] 실시간 호출 실패, 엔진 기본 결과 유지:', err);
        });
    }

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
  }, [STEPS, analysis_pack, query]);

  // 재분석 핸들러
  const handle_restart = () => {
    if (timer_ref.current) clearTimeout(timer_ref.current);
    set_phase('input');
    set_current_step_idx(-1);
    set_done_steps(new Set());
    set_expanded_steps(new Set());
    set_pipeline_all_done(false);
    set_show_arch(false);
    set_live_gemini_pack(null);
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
                <AI_질의_입력창 value={query} onChange={set_query} onSubmit={() => run_pipeline()} 예시={initial_query} 실행_라벨="분석 실행" aria_label="분석 질문" />
                <p className="text-[11px] text-slate-400">회색 예시 질문은 Tab 키로 입력하고, 오른쪽 실행 버튼으로 분석합니다.</p>
              </div>

              {/* 실데이터 연동 안내 */}
              <div className="flex items-start gap-2 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs text-blue-900 dark:text-blue-200">
                <Info className="w-4 h-4 shrink-0 mt-0.5 text-blue-600 dark:text-blue-400" />
                <span>
                  전국 229개 시군구 실데이터 연동 모드입니다. 선택하신 <strong>{region_name}</strong>의 2024 헬스맵 통계(응급·분만 미도달율, 관내이용률)와 필수의료 진단 엔진, 관내 의료자원이 8단계 파이프라인에 실시간 연계됩니다.
                </span>
              </div>

              {/* Gemini 연동 상태 배너 */}
              {has_gemini_key ? (
                <div className="flex items-center justify-between p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-xs text-purple-900 dark:text-purple-200">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 animate-pulse" />
                    <span>
                      <strong>Google Gemini 실시간 추론 연동됨:</strong> 05단계 종합 분석 시 등록된 API 키를 통해 실시간 클라우드 LLM 추론이 수행됩니다.
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-purple-700 bg-purple-100 dark:bg-purple-900/60 px-2 py-0.5 rounded-full shrink-0">
                    Active
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400">
                  <Brain className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>
                    <strong>공공의료 지능형 분석 엔진 모드:</strong> 상단 헤더에서 Gemini API 키를 등록하면 대형 LLM 실시간 추론이 활성화됩니다. (미등록 시에도 229개 시군구 실데이터 정밀 분석)
                  </span>
                </div>
              )}

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
                  공공의료 AI 8단계 질의 처리 흐름 (01~08단계 분기·합류 구조)
                </div>

                {/* 색상 범례: 시스템 구성요소 기준 */}
                <div className="flex flex-wrap gap-2 mb-3 pb-2.5 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 font-semibold self-center">구성요소:</span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800">
                    🧭 AI Orchestrator
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border bg-teal-100 text-teal-800 border-teal-300 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-800">
                    🗄️ DW / Vector DB
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800">
                    📊 분석 엔진 (계산)
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800">
                    🤖 LLM 레이어 (해석)
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800">
                    💡 정책대안 Agent
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800">
                    🛡️ 검증 · 가드레일
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
                          {idx === 0 && <Step1_질문이해 region_name={region_name} query={query} />}
                          {idx === 1 && <Step2_데이터검색 데이터={current_pack.데이터_검색_결과} />}
                          {idx === 2 && <Step3_지식검색 show_detail={show_rag_detail} on_toggle={() => set_show_rag_detail((v) => !v)} />}
                          {idx === 3 && <Step4_데이터분석 지표_목록={current_pack.분석_지표_목록} />}
                          {idx === 4 && (
                            <Step5_LLM종합분석
                              is_running={is_running}
                              종합_진단_텍스트={current_pack.종합_진단_텍스트}
                              ri_rate={current_pack.시군구.관내_응급_의료이용률 ?? undefined}
                              emergency_rate={current_pack.시군구.응급_60분_미도달_인구비율 ?? undefined}
                              used_model={current_pack.생성_모델}
                              is_gemini_live={current_pack.is_gemini_live}
                              elapsed_ms={current_pack.소요시간_ms}
                            />
                          )}
                          {idx === 5 && <Step6_정책대안생성 대안_목록={current_pack.정책대안_목록} />}
                          {idx === 6 && <Step7_근거검증 검증_항목_목록={current_pack.검증_항목_목록} />}
                          {idx === 7 && <Step8_결과제공 region_name={current_pack.지역_표시명} />}
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
              결과={current_pack.최종_분석_결과}
              region_name={current_pack.지역_표시명}
              생성_모델={current_pack.생성_모델}
              is_gemini_live={current_pack.is_gemini_live}
              소요시간_ms={current_pack.소요시간_ms}
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
