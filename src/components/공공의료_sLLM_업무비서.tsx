'use client';

// 공공의료 특화 sLLM 지침 검색 및 보고서 초안 자동화 워크플로우 (실제 경량 하이브리드 RAG 엔진 연동)

import React, { useState, useEffect } from 'react';
import {
  Bot,
  Sparkles,
  Search,
  Database,
  FileEdit,
  CheckCircle2,
  Copy,
  Check,
  ChevronRight,
  ShieldCheck,
  Play,
  RotateCcw,
  BookOpen,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { 필수의료_진단_결과 } from '@/lib/필수의료_타입';
import { copy_text_to_clipboard } from '@/lib/유틸리티';
import { 경량_RAG_엔진, RAG_실행_응답 } from '@/lib/경량_rag_엔진';

interface sLLM_업무비서_속성 {
  selected_region?: 필수의료_진단_결과 | null;
  on_open_grounding?: () => void;
}

const PRESET_PROMPTS = [
  '2026년 공공보건의료계획 평가지표 중 필수의료 자체충족률 산정 기준을 알려주고, 영월의료원 실적보고서 초안을 작성해줘.',
  '보건복지부 의료취약지 파견의사 지원사업 신청 자격 요건과 당직비 보조 규정을 요약해줘.',
  '분만취약지 A등급과 B등급 지원 기준 차이 및 운영비 국비 지원 규모를 비교 설명해줘.',
  '달빛어린이병원 지정 요건과 소아청소년과 전문의 야간진료 관리료 가산 규정을 알려줘.',
];

export const 공공의료_sLLM_업무비서: React.FC<sLLM_업무비서_속성> = ({
  selected_region,
  on_open_grounding,
}) => {
  const [selected_prompt, set_selected_prompt] = useState(PRESET_PROMPTS[0]);
  const [workflow_step, set_workflow_step] = useState<0 | 1 | 2 | 3>(0);
  const [is_running, set_is_running] = useState(false);
  const [is_copied, set_is_copied] = useState(false);
  const [rag_result, set_rag_result] = useState<RAG_실행_응답 | null>(null);
  const [show_sources, set_show_sources] = useState(true);

  // 초기 1회 기본 프롬프트에 대한 사전 RAG 실행
  useEffect(() => {
    const initial_result = 경량_RAG_엔진.execute_rag(selected_prompt, selected_region || null);
    set_rag_result(initial_result);
  }, []);

  // 실제 경량 RAG 검색 & 생성 파이프라인 가동
  const handle_execute_workflow = () => {
    set_is_running(true);
    set_workflow_step(1);

    // 1단계: RAG 검색
    setTimeout(() => {
      const result = 경량_RAG_엔진.execute_rag(selected_prompt, selected_region || null);
      set_rag_result(result);
      set_workflow_step(2);

      // 2단계: DW 지표 연동
      setTimeout(() => {
        set_workflow_step(3);
        set_is_running(false);
      }, 500);
    }, 450);
  };

  const handle_copy_result = async () => {
    if (!rag_result) return;
    const success = await copy_text_to_clipboard(rag_result.생성된_답변);
    if (success) {
      set_is_copied(true);
      setTimeout(() => set_is_copied(false), 2000);
    }
  };

  return (
    <div className="bg-white p-6 sm:p-7 rounded-3xl border border-black/[0.05] shadow-apple-card space-y-5">
      {/* 상단 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-black/[0.05]">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#0071e3] to-[#34c759] text-white flex items-center justify-center shadow-apple-sm">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-semibold tracking-tight text-[#86868b]">
                sLLM 기반 Agentic AI 업무비서
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#0071e3]/10 text-[#0071e3] text-[10px] font-bold">
                경량 하이브리드 RAG 탑재
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold tracking-tight text-[#1d1d1f]">
              공공의료 행정지침 Q&amp;A 및 실적보고서 초안 자동생성
            </h3>
          </div>
        </div>

        {on_open_grounding && (
          <button
            onClick={on_open_grounding}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#ff9500]/10 hover:bg-[#ff9500]/20 text-[#b26800] border border-[#ff9500]/25 transition"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#ff9500]" />
            <span>원문 근거 대조 (환각 제로 뷰)</span>
          </button>
        )}
      </div>

      {/* 프롬프트 선택 칩 영역 */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-[#1d1d1f] flex items-center justify-between">
          <span>시연용 추천 업무 질의 (클릭 시 자동 입력):</span>
          <span className="text-[11px] text-[#86868b] font-normal">직접 입력창에서 수정 가능</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {PRESET_PROMPTS.map((p, idx) => (
            <button
              key={idx}
              onClick={() => {
                set_selected_prompt(p);
                set_workflow_step(0);
              }}
              className={`text-left text-xs px-3 py-2 rounded-xl border transition ${
                selected_prompt === p
                  ? 'bg-[#0071e3]/10 text-[#0071e3] border-[#0071e3]/30 font-semibold'
                  : 'bg-[#f5f5f7] hover:bg-[#e8e8ed] text-slate-700 border-black/[0.04]'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* 프롬프트 입력 및 실행 바 */}
      <div className="relative">
        <input
          type="text"
          value={selected_prompt}
          onChange={(e) => {
            set_selected_prompt(e.target.value);
            set_workflow_step(0);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !is_running) {
              handle_execute_workflow();
            }
          }}
          placeholder="공공보건의료 지침 또는 정책에 대해 무엇이든 질문하세요..."
          className="w-full pl-4 pr-28 py-3.5 text-xs sm:text-sm rounded-2xl bg-[#f5f5f7] border border-black/[0.06] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30 text-[#1d1d1f]"
        />
        <button
          onClick={handle_execute_workflow}
          disabled={is_running || !selected_prompt.trim()}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-[#0071e3] hover:bg-[#0077ed] text-white shadow-apple-sm transition active:scale-95 disabled:opacity-60"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>{is_running ? '검색·생성 중...' : 'RAG 실행'}</span>
        </button>
      </div>

      {/* Agentic AI 워크플로우 3단계 실시간 시각화 (Tool Calling Visualizer) */}
      <div className="bg-[#f5f5f7] p-4 rounded-2xl space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-[#86868b] uppercase tracking-wider block">
            Agentic AI Tool-Calling 파이프라인 (실제 경량 RAG 엔진 구동)
          </span>
          {rag_result && workflow_step === 3 && (
            <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              실행 완료 ({rag_result.소요시간_ms}ms)
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Step 1: RAG */}
          <div
            className={`p-3 rounded-xl border transition-all ${
              workflow_step >= 1
                ? 'bg-white border-[#0071e3] text-[#1d1d1f] shadow-apple-sm'
                : 'bg-white/40 border-black/[0.04] text-[#86868b]'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Search className={`w-4 h-4 ${workflow_step >= 1 ? 'text-[#0071e3]' : 'text-[#86868b]'}`} />
              <span className="text-xs font-bold">1. 하이브리드 RAG 검색</span>
            </div>
            <p className="text-[11px] text-[#86868b] mt-1 line-clamp-2">
              {workflow_step >= 1 && rag_result
                ? `${rag_result.검색된_청크목록[0]?.청크.문서명.slice(0, 20)}... (매칭률 ${rag_result.최고_유사도}%)`
                : '지침 전문 코퍼스 대기 중...'}
            </p>
          </div>

          {/* Step 2: DW */}
          <div
            className={`p-3 rounded-xl border transition-all ${
              workflow_step >= 2
                ? 'bg-white border-[#af52de] text-[#1d1d1f] shadow-apple-sm'
                : 'bg-white/40 border-black/[0.04] text-[#86868b]'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Database className={`w-4 h-4 ${workflow_step >= 2 ? 'text-[#af52de]' : 'text-[#86868b]'}`} />
              <span className="text-xs font-bold">2. 진료실적 DW 실시간 쿼리</span>
            </div>
            <p className="text-[11px] text-[#86868b] mt-1 line-clamp-2">
              {workflow_step >= 2 && rag_result
                ? `${rag_result.선택된_지역명} 응급/분만/병상 통계 추출 완료`
                : '데이터웨어하우스 대기 중...'}
            </p>
          </div>

          {/* Step 3: Generator */}
          <div
            className={`p-3 rounded-xl border transition-all ${
              workflow_step >= 3
                ? 'bg-white border-[#34c759] text-[#1d1d1f] shadow-apple-sm'
                : 'bg-white/40 border-black/[0.04] text-[#86868b]'
            }`}
          >
            <div className="flex items-center space-x-2">
              <FileEdit className={`w-4 h-4 ${workflow_step >= 3 ? 'text-[#34c759]' : 'text-[#86868b]'}`} />
              <span className="text-xs font-bold">3. 근거 인용 초안 합성</span>
            </div>
            <p className="text-[11px] text-[#86868b] mt-1 line-clamp-2">
              {workflow_step >= 3
                ? '보건복지부 법정 고시 조항 인용 문안 완성'
                : '증강 생성 대기 중...'}
            </p>
          </div>
        </div>
      </div>

      {/* 최종 생성 결과 보고서 카드 */}
      {(workflow_step === 3 || (!is_running && rag_result && workflow_step === 0)) && rag_result && (
        <div className="bg-[#fbfbfd] p-5 rounded-2xl border border-black/[0.06] shadow-apple-sm space-y-4 animate-in fade-in duration-300">
          <div className="flex items-center justify-between pb-2 border-b border-black/[0.05]">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-[#34c759]" />
              <span className="text-xs font-bold text-[#1d1d1f]">
                RAG 증강 생성 답변 및 공문서 초안 (소요시간: {rag_result.소요시간_ms}ms)
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handle_copy_result}
                className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-white border border-black/[0.08] hover:bg-black/[0.02] text-[#1d1d1f] transition"
              >
                {is_copied ? <Check className="w-3.5 h-3.5 text-[#34c759]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{is_copied ? '복사됨' : '본문 복사'}</span>
              </button>
            </div>
          </div>

          <pre className="text-xs sm:text-xs font-mono text-slate-800 whitespace-pre-wrap leading-relaxed bg-white p-4 rounded-xl border border-black/[0.04] overflow-x-auto">
            {rag_result.생성된_답변}
          </pre>

          {/* 실제 RAG 검색된 근거 조항 (Top-3) 상세 뷰 */}
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
            <button
              onClick={() => set_show_sources(!show_sources)}
              className="w-full px-4 py-2.5 bg-slate-50 hover:bg-slate-100 flex items-center justify-between text-xs font-bold text-slate-700 transition"
            >
              <div className="flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-[#0071e3]" />
                <span>RAG 검색으로 추출된 실제 근거 조항 ({rag_result.검색된_청크목록.length}건)</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#0071e3]/10 text-[#0071e3]">
                  최고 일치도 {rag_result.최고_유사도}%
                </span>
              </div>
              {show_sources ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {show_sources && (
              <div className="p-3 space-y-2.5 divide-y divide-slate-100 text-xs">
                {rag_result.검색된_청크목록.map((item, idx) => (
                  <div key={item.청크.id} className={`${idx > 0 ? 'pt-2.5' : ''} space-y-1.5`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 font-mono text-[10px] text-slate-600 font-bold">
                          근거 {idx + 1}
                        </span>
                        <strong className="text-slate-800 font-semibold">{item.청크.문서명}</strong>
                        <span className="text-[#86868b] text-[11px]">({item.청크.조항_페이지})</span>
                      </div>
                      <span className="text-[11px] font-bold text-[#0071e3] bg-[#0071e3]/10 px-2 py-0.5 rounded-full">
                        유사도 {item.유사도_점수}%
                      </span>
                    </div>

                    <p className="text-slate-600 bg-slate-50 p-2.5 rounded-lg text-[11px] leading-relaxed border border-slate-100">
                      &ldquo;{item.발췌_하이라이트}&rdquo;
                    </p>

                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                      <span className="text-[10px] text-slate-400 font-semibold">매칭 키워드:</span>
                      {item.매칭_키워드.map((kw, kwIdx) => (
                        <span
                          key={kwIdx}
                          className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-medium"
                        >
                          #{kw}
                        </span>
                      ))}
                      <span className="text-[10px] text-slate-400 font-semibold ml-2">기준:</span>
                      <span className="text-[10px] text-slate-700 font-medium">{item.청크.기준수치}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
