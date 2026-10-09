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

/** STEP 1: 질문 이해 - 분석 결과 카드 */
function Step1_질문이해({ region_name, query }: { region_name: string; query: string }) {
  // 지역명 추출 (간단한 정규식)
  const extracted_region = region_name || '영월군';
  const is_emergency = query.includes('응급');
  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-500 leading-relaxed">
        AI가 사용자의 질문에서 분석 대상 지역과 분석 목적을 파악했습니다.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {[
          { 항목: '대상 지역', 값: extracted_region },
          { 항목: '분석 분야', 값: is_emergency ? '응급의료' : '필수의료' },
          { 항목: '분석 목적', 값: '취약 원인 분석 및 개선방안 도출' },
        ].map((item) => (
          <div key={item.항목} className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50">
            <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mb-0.5">{item.항목}</div>
            <div className="text-xs font-black text-slate-900 dark:text-white">{item.값}</div>
          </div>
        ))}
      </div>
      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">처리 흐름</div>
        <div className="flex items-center gap-1 flex-wrap text-xs text-slate-600 dark:text-slate-400">
          {['사용자 질문', '→', '질문 분석', '→', '지역 추출', '→', '분석 분야 추출', '→', '분석 목적 추출'].map((item, i) => (
            <span key={i} className={item === '→' ? 'text-slate-300' : 'font-semibold'}>{item}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

/** STEP 2: 필요한 데이터 확인 - 데이터 소스 카드 */
function Step2_데이터확인({ is_done }: { is_done: boolean }) {
  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-500 leading-relaxed">
        AI가 질문에 답하기 위해 필요한 데이터 항목을 확인합니다.
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {AI_데이터_소스_목록.map((src, i) => (
          <div key={src.id} className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-1.5">
            <div className="text-lg">{src.아이콘}</div>
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200">{src.제목}</div>
            <div className="text-[10px] text-slate-500">{src.설명}</div>
            <div className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
              is_done
                ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600'
                : i < 2
                  ? 'bg-blue-100 dark:bg-blue-950/50 text-blue-600'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
            }`}>
              <span>{is_done ? '● 확인 완료' : i < 2 ? '● 확인 중' : '● 대기'}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** STEP 3: 데이터 검색 결과 */
function Step3_데이터검색() {
  const 결과 = AI_데이터_검색_결과_영월;
  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-500 leading-relaxed">
        공공의료 데이터베이스에서 영월군 관련 데이터를 검색했습니다.
      </p>
      <div className="space-y-1.5">
        {Object.entries(결과).map(([key, value]) => (
          <div key={key} className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">{value}</span>
          </div>
        ))}
      </div>
      <p className="text-[11px] text-slate-400 italic">
        AI는 질문에 필요한 데이터만 선별하여 분석에 활용합니다.
      </p>
    </div>
  );
}

/** STEP 4: RAG 지식 검색 */
function Step4_RAG({ show_detail, on_toggle }: { show_detail: boolean; on_toggle: () => void }) {
  return (
    <div className="space-y-3">
      {/* RAG 개념 설명 (고객용) */}
      <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 text-xs text-blue-800 dark:text-blue-200 leading-relaxed">
        <strong>관련 자료 검색(RAG)</strong>이란, AI가 기억하고 있는 정보만 사용하는 것이 아니라,
        관련 자료를 먼저 검색한 후 그 내용을 바탕으로 답변하도록 하는 방식입니다.
      </div>

      {/* 문서 카드 목록 */}
      <div className="space-y-2">
        {RAG_문서_목록.map((doc) => (
          <div key={doc.id} className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-base shrink-0">{doc.아이콘}</span>
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{doc.제목}</div>
                <div className="text-[10px] text-slate-400">{doc.유형}</div>
              </div>
            </div>
            <div className="text-xs font-black text-blue-600 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded-full shrink-0 ml-2">
              관련도 {doc.관련도_퍼센트}% (예시)
            </div>
          </div>
        ))}
      </div>

      {/* 기술 상세 토글 */}
      <button
        type="button"
        onClick={on_toggle}
        className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
      >
        <span>기술 구조 보기 (개발자용)</span>
        {show_detail ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>

      {show_detail && (
        <div className="p-3 rounded-xl bg-slate-900 dark:bg-black text-emerald-400 font-mono text-[11px] space-y-1.5">
          <div className="text-slate-500 mb-2">{'/* RAG 처리 흐름 (기술 상세) */'}</div>
          {[
            { step: '사용자 질문', tip: '자연어 입력' },
            { step: 'Embedding', tip: '질문의 의미를 AI가 검색 가능한 형태로 변환합니다.' },
            { step: 'Vector DB', tip: '정책자료와 업무문서를 AI가 빠르게 검색할 수 있도록 저장한 공간입니다.' },
            { step: '관련 문서 검색', tip: '질문과 관련성이 높은 자료를 찾아줍니다.' },
            { step: 'Context 전달', tip: '검색된 자료를 LLM이 참고할 수 있도록 전달합니다.' },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="text-blue-400 shrink-0">{i < 4 ? '↓' : '→'}</span>
              <span className="text-emerald-300">{item.step}</span>
              <span className="text-slate-500 text-[10px]">{'// '}{item.tip}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/** STEP 5: 데이터 분석 결과 */
function Step5_데이터분석() {
  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-500 leading-relaxed">
        검색된 공공의료 데이터를 분석하여 지역의 특성과 문제점을 파악합니다.
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {영월군_분석_지표.map((지표) => (
          <div key={지표.id} className={`p-3 rounded-xl border ${
            지표.강조
              ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900/50'
              : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700'
          }`}>
            <div className="text-[10px] text-slate-500 mb-0.5">{지표.항목}</div>
            <div className={`text-xl font-black ${지표.강조 ? 'text-red-600 dark:text-red-400' : 'text-slate-800 dark:text-slate-200'}`}>
              {지표.값}<span className="text-xs font-semibold ml-0.5">{지표.단위}</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5 leading-tight">{지표.설명}</div>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-slate-400 italic">
        ※ 위 수치는 국립중앙의료원 공공의료 플랫폼 탑재 데이터 기준입니다.
      </p>
    </div>
  );
}

/** STEP 6: LLM 종합 분석 */
function Step6_LLM({ is_running }: { is_running: boolean }) {
  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-500 leading-relaxed">
        AI가 질문, 데이터, 관련 지식을 종합하여 문제의 원인과 의미를 분석합니다.
      </p>

      {/* LLM 입출력 시각화 */}
      <div className="p-4 rounded-2xl bg-slate-900 dark:bg-black border border-blue-900/50 text-xs text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Brain className="w-5 h-5 text-blue-400" />
          <span className="font-black text-blue-300 text-sm">AI 언어모델 (LLM)</span>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-slate-400">
          <div className="space-y-1">
            <div className="px-3 py-1 rounded-lg bg-slate-800 text-emerald-300 text-[11px]">질문</div>
            <div className="px-3 py-1 rounded-lg bg-slate-800 text-emerald-300 text-[11px]">공공의료 데이터</div>
            <div className="px-3 py-1 rounded-lg bg-slate-800 text-emerald-300 text-[11px]">관련 지식 (RAG)</div>
          </div>
          <ArrowRight className="w-5 h-5 text-blue-500 rotate-90 sm:rotate-0" />
          <div className={`px-4 py-2 rounded-xl bg-blue-900/50 border border-blue-700/50 text-blue-200 text-[11px] font-bold ${is_running ? 'animate-pulse' : ''}`}>
            {is_running ? '종합 분석 중...' : '종합 분석 완료'}
          </div>
        </div>
      </div>

      {/* 처리 상태 체크리스트 */}
      <div className="space-y-1.5">
        {[
          { 항목: '질문 이해', 완료: true },
          { 항목: '데이터 확보', 완료: true },
          { 항목: '관련 지식 확보', 완료: true },
          { 항목: '종합 분석', 완료: !is_running },
        ].map((item) => (
          <div key={item.항목} className="flex items-center gap-2 text-xs">
            {item.완료
              ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              : <Loader2 className="w-4 h-4 text-blue-600 animate-spin shrink-0" />
            }
            <span className={item.완료 ? 'text-slate-700 dark:text-slate-300' : 'text-blue-600 font-bold'}>
              {item.항목}
              {!item.완료 && ' 처리 중...'}
              {item.완료 && ' ✓'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** STEP 7: 근거 검증 */
function Step7_검증() {
  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-500 leading-relaxed">
        AI가 생성한 분석 결과가 실제 데이터와 관련 자료에 근거하고 있는지 확인합니다.
      </p>
      <div className="space-y-1.5">
        {[
          '데이터 출처 확인 완료',
          '기준연도 (2023~2024) 확인 완료',
          '수치 일치 여부 확인 완료',
          '정책 적용 범위 검토 완료',
          '논리 일관성 검증 완료',
        ].map((item) => (
          <div key={item} className="flex items-center gap-2 p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="text-xs text-slate-700 dark:text-slate-300">{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** STEP 8: 정책대안 생성 */
function Step8_정책대안() {
  const { 정책대안_목록 } = 영월군_AI_분석_결과;
  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-500 leading-relaxed">
        분석 결과를 바탕으로 실행 가능한 정책대안 {정책대안_목록.length}개가 생성되었습니다.
      </p>
      {정책대안_목록.map((대안, i) => (
        <div key={대안.id} className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-800 dark:text-white">대안 {String.fromCharCode(65 + i)}. {대안.제목}</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              대안.우선순위 === '높음'
                ? 'bg-red-100 dark:bg-red-950/50 text-red-600'
                : 'bg-amber-100 dark:bg-amber-950/50 text-amber-600'
            }`}>
              우선순위 {대안.우선순위}
            </span>
          </div>
          <div className="text-[10px] text-slate-500">예산 규모: <span className="font-semibold">{대안.예산_규모}</span></div>
          <div className="text-[10px] text-emerald-700 dark:text-emerald-300">기대효과: {대안.기대효과}</div>
        </div>
      ))}
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
          AI 처리구조 보기
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
          <h3 className="text-base font-black text-slate-900 dark:text-white">AI 처리 구조</h3>
          <p className="text-xs text-slate-500 mt-0.5">AI 기반 공공의료 정보시스템 아키텍처</p>
        </div>
        <button type="button" onClick={on_close} className="text-slate-400 hover:text-slate-600 cursor-pointer">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* 아키텍처 다이어그램 */}
      <div className="p-5 rounded-2xl bg-slate-900/90 dark:bg-slate-950 border border-slate-700 shadow-lg text-xs space-y-3 font-sans text-center">
        {/* 사용자 질문 */}
        <div className="px-4 py-2.5 rounded-xl bg-blue-500/20 border-2 border-blue-400 text-blue-100 font-black text-sm shadow-xs">
          👤 사용자 질문
        </div>
        <div className="text-slate-300 font-black text-base leading-none">↓</div>

        {/* 질문 분석 */}
        <div className="px-4 py-2.5 rounded-xl bg-indigo-500/25 border-2 border-indigo-400 text-indigo-100 font-black text-sm shadow-xs">
          🔍 질문 이해 · 의도 파악 엔진
        </div>
        <div className="text-slate-300 font-black text-base leading-none">↓</div>

        {/* 병렬 처리 영역 */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-emerald-500/25 border-2 border-emerald-400 text-emerald-100 font-black text-xs sm:text-sm shadow-xs leading-relaxed">
            🗄️ 공공의료<br/>데이터 검색
          </div>
          <div className="p-3 rounded-xl bg-purple-500/25 border-2 border-purple-400 text-purple-100 font-black text-xs sm:text-sm shadow-xs leading-relaxed">
            📚 Vector DB<br/>RAG 검색
          </div>
        </div>

        <div className="py-1">
          <span className="inline-block px-3.5 py-1 rounded-full bg-slate-800 text-slate-200 font-extrabold text-[11px] border border-slate-600 shadow-xs">
            ↓ 병렬 처리 결과 통합
          </span>
        </div>

        {/* LLM 종합 분석 */}
        <div className="px-4 py-3.5 rounded-xl bg-amber-500/30 border-2 border-amber-400 text-amber-50 font-black shadow-md ring-2 ring-amber-400/30">
          <Brain className="w-5 h-5 mx-auto mb-1 text-amber-300 inline-block" />
          <div className="text-sm sm:text-base font-black text-amber-200">LLM 종합 분석</div>
          <div className="text-xs font-bold text-amber-100 mt-1">
            데이터 + RAG Context + 질문 → 추론
          </div>
        </div>
        <div className="text-slate-300 font-black text-base leading-none">↓</div>

        {/* 근거 검증 */}
        <div className="px-4 py-2.5 rounded-xl bg-teal-500/25 border-2 border-teal-400 text-teal-100 font-black text-sm shadow-xs">
          ✅ 근거 검증 · 출처 확인
        </div>
        <div className="text-slate-300 font-black text-base leading-none">↓</div>

        {/* 결과 */}
        <div className="px-4 py-2.5 rounded-xl bg-rose-500/30 border-2 border-rose-400 text-rose-50 font-black text-sm shadow-xs">
          📝 정책대안 생성 · 최종 결과
        </div>

        {/* MCP 확장 설명 */}
        <div className="mt-4 p-3 rounded-xl bg-slate-800/90 border-2 border-dashed border-slate-500 text-slate-200 text-xs font-bold leading-relaxed shadow-inner">
          🔌 MCP(Model Context Protocol) 확장 구조 — 외부 데이터베이스,<br/>
          공공데이터 포털, 병원 정보시스템과의 실시간 연동을 지원합니다.
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
              <h2 className="text-sm font-black text-slate-900 dark:text-white">AI 분석 실행</h2>
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                분석 프로세스 시각화
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
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">AI 분석 과정 (8단계)</div>

                {/* 색상 범례: 구축 주체 기준 */}
                <div className="flex flex-wrap gap-2 mb-3 pb-2.5 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 font-semibold self-center">구축 주체:</span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800">
                    🔵 개발사 구현
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-950/50 dark:text-teal-300 dark:border-teal-800">
                    🟢 인프라·DB 구축
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800">
                    🟠 외부 AI API
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
                          {idx === 1 && <Step2_데이터확인 is_done={is_done} />}
                          {idx === 2 && <Step3_데이터검색 />}
                          {idx === 3 && <Step4_RAG show_detail={show_rag_detail} on_toggle={() => set_show_rag_detail((v) => !v)} />}
                          {idx === 4 && <Step5_데이터분석 />}
                          {idx === 5 && <Step6_LLM is_running={is_running} />}
                          {idx === 6 && <Step7_검증 />}
                          {idx === 7 && <Step8_정책대안 />}
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
