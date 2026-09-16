'use client';

// 공공의료 특화 sLLM 지침 검색 및 보고서 초안 자동화 워크플로우

import React, { useState } from 'react';
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
} from 'lucide-react';
import { 필수의료_진단_결과 } from '@/lib/필수의료_타입';
import { copy_text_to_clipboard } from '@/lib/유틸리티';

interface sLLM_업무비서_속성 {
  selected_region?: 필수의료_진단_결과 | null;
  on_open_grounding?: () => void;
}

const PRESET_PROMPTS = [
  '2026년 공공보건의료계획 평가지표 중 필수의료 자체충족률 산정 기준을 알려주고, 영월의료원 실적보고서 초안을 작성해줘.',
  '보건복지부 의료취약지 파견의사 지원사업 신청 자격 요건과 당직비 보조 규정을 요약해줘.',
  '권역-지역 책임의료기관 간 원격협진 인프라 구축을 위한 공공병원 기능보강사업 국비 신청서 개조식 초안 작성.',
];

export const 공공의료_sLLM_업무비서: React.FC<sLLM_업무비서_속성> = ({
  selected_region,
  on_open_grounding,
}) => {
  const [selected_prompt, set_selected_prompt] = useState(PRESET_PROMPTS[0]);
  const [workflow_step, set_workflow_step] = useState<0 | 1 | 2 | 3>(0);
  const [is_running, set_is_running] = useState(false);
  const [is_copied, set_is_copied] = useState(false);

  // Agentic AI 3단계 워크플로우 시뮬레이션
  const handle_execute_workflow = () => {
    set_is_running(true);
    set_workflow_step(1);

    setTimeout(() => {
      set_workflow_step(2);
      setTimeout(() => {
        set_workflow_step(3);
        set_is_running(false);
      }, 700);
    }, 700);
  };

  const handle_copy_result = async () => {
    const success = await copy_text_to_clipboard(GENERATED_REPORT_TEXT);
    if (success) {
      set_is_copied(true);
      setTimeout(() => set_is_copied(false), 2000);
    }
  };

  const GENERATED_REPORT_TEXT = `[2026년 공공보건의료계획 시행결과 보고서]
작성부서: 영월의료원 공공의료본부 기획팀
지표구분: 필수의료 자체충족률 제고 (핵심성과지표 2-1)
근거문서: 2026년도 공공보건의료계획 수립 지침(보건복지부) 제12조

1. 추진 배경 및 지표 산정 기준
  ○ (지침 기준) 관내 중증응급환자가 관내 의료기관을 이용한 비율(Relevance Index, RI)로 산출하며, 취약지 기준선(30%) 미달 시 필수 중점관리병원으로 지정됨.
  ○ (실적 현황) 2025년도 영월의료원 관내 응급환자 자체충족률(RI)은 19.8%로 시·도 평균(38.2%) 대비 현저히 낮으나, 전년 대비 1.8%p 개선 추세 유지.

2. 원인 분석 및 주요 추진 실적
  ○ (의료인력 공백) 심야 응급실 전담의사 2인 체계 유지의 한계로 야간 중증환자의 원주 권역센터 이송률이 42.1% 차지.
  ○ (개선 실적)
    - 강원도-국립중앙의료원 파견의사 지원사업 연계를 통한 응급의학과 전문의 1인 신규 확충
    - 원주세브란스기독병원 응급의료센터 간 24시간 원격 화상 응급협진 프로토콜 42건 가동

3. 2026년도 성과 목표 및 정책 건의
  ○ 2026년도 목표치: 관내 응급 자체충족률 23.0% 달성 (전년비 +3.2%p)
  ○ 건의사항: 분만·소아 진료 공백 해소를 위한 공공임상교수 파견 쿼터 배정 및 당직 인건비 국비 보조 확대 요청.`;

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
                지침 RAG + DW 연동
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
        <label className="text-xs font-bold text-[#1d1d1f] block">
          시연용 추천 업무 질의 (클릭 시 자동 입력):
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

      {/* 입력 및 실행 바 */}
      <div className="relative">
        <textarea
          rows={2}
          value={selected_prompt}
          onChange={(e) => set_selected_prompt(e.target.value)}
          className="w-full text-xs p-3.5 pr-28 rounded-2xl bg-[#fbfbfd] border border-black/[0.06] text-[#1d1d1f] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30 resize-none font-medium leading-relaxed"
        />
        <button
          onClick={handle_execute_workflow}
          disabled={is_running}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-[#0071e3] hover:bg-[#0077ed] text-white shadow-apple-sm transition active:scale-95 disabled:opacity-60"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>{is_running ? '생성 중...' : 'AI 실행'}</span>
        </button>
      </div>

      {/* Agentic AI 워크플로우 3단계 시각화 (Tool Calling Visualizer) */}
      <div className="bg-[#f5f5f7] p-4 rounded-2xl space-y-3">
        <span className="text-[11px] font-bold text-[#86868b] uppercase tracking-wider block">
          Agentic AI Tool-Calling 파이프라인 진행 상태
        </span>

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
              <span className="text-xs font-bold">1. 지침 벡터 RAG 검색</span>
            </div>
            <p className="text-[11px] text-[#86868b] mt-1">
              {workflow_step >= 1 ? '복지부 공공의료계획 지침 p.84 매칭 완료 (98.4%)' : '대기 중...'}
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
            <p className="text-[11px] text-[#86868b] mt-1">
              {workflow_step >= 2 ? '영월의료원 3개년 응급/외래 실적 DB 추출 완료' : '대기 중...'}
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
              <span className="text-xs font-bold">3. 개조식 서식 초안 렌더링</span>
            </div>
            <p className="text-[11px] text-[#86868b] mt-1">
              {workflow_step >= 3 ? '보건복지부 표준 서식 100% 일치 문안 완성' : '대기 중...'}
            </p>
          </div>
        </div>
      </div>

      {/* 최종 생성 결과 보고서 카드 */}
      {workflow_step === 3 && (
        <div className="bg-[#fbfbfd] p-5 rounded-2xl border border-black/[0.06] shadow-apple-sm space-y-3 animate-in fade-in duration-300">
          <div className="flex items-center justify-between pb-2 border-b border-black/[0.05]">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-[#34c759]" />
              <span className="text-xs font-bold text-[#1d1d1f]">
                생성 완료: 2026 공공보건의료계획 실적보고서 개조식 초안 (소요시간: 1.4초)
              </span>
            </div>
            <button
              onClick={handle_copy_result}
              className="inline-flex items-center space-x-1 px-3 py-1 text-xs font-medium rounded-full bg-white hover:bg-slate-100 text-[#1d1d1f] border border-black/[0.06] transition active:scale-95"
            >
              {is_copied ? <Check className="w-3.5 h-3.5 text-[#34c759]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{is_copied ? '복사됨' : '전체 복사'}</span>
            </button>
          </div>

          <pre className="text-xs text-slate-800 font-sans whitespace-pre-wrap leading-relaxed bg-white p-4 rounded-xl border border-black/[0.04] max-h-[280px] overflow-y-auto">
            {GENERATED_REPORT_TEXT}
          </pre>
        </div>
      )}
    </div>
  );
};
