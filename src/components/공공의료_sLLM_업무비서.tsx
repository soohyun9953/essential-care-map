'use client';

// 공공의료 특화 sLLM 지침 검색 및 보고서 초안 자동화 워크플로우
// 1. 실제 경량 하이브리드 RAG 엔진 연동
// 2. 외부 클라우드 LLM(Google Gemini) vs 노트북 로컬 sLLM(Qwen2.5-0.5B-Instruct) 1:1 비교 스튜디오 탑재

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
  FilePlus,
  SplitSquareVertical,
  Key,
  Globe,
  Laptop,
  Zap,
  ShieldAlert,
  Clock,
  Coins,
  AlertCircle,
  Power,
  Loader2,
  RefreshCw,
  HelpCircle,
} from 'lucide-react';
import { 필수의료_진단_결과 } from '@/lib/필수의료_타입';
import { copy_text_to_clipboard } from '@/lib/유틸리티';
import { 경량_RAG_엔진, RAG_실행_응답 } from '@/lib/경량_rag_엔진';
import { get_all_corpus } from '@/lib/공공의료_지침_코퍼스';
import { 지침_문서_등록_모달 } from './지침_문서_등록_모달';
import { 구글_api키_설정_모달 } from './구글_api키_설정_모달';
import { 듀얼_AI_안내_모달 } from './듀얼_AI_안내_모달';

interface sLLM_업무비서_속성 {
  selected_region?: 필수의료_진단_결과 | null;
  on_open_grounding?: () => void;
}

interface LLM_비교_결과 {
  google_gemini: {
    model: string;
    model_id?: string;
    success_model?: string;
    response: string;
    elapsed_ms: number;
    is_live: boolean;
    security: string;
    cost: string;
  };
  local_sllm: {
    model: string;
    response: string;
    elapsed_ms: number;
    is_live: boolean;
    security: string;
    cost: string;
  };
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
  // 모드 전환: 'single' (기본 RAG 비서) vs 'compare' (Gemini vs 로컬 sLLM 비교 스튜디오)
  const [active_view_tab, set_active_view_tab] = useState<'single' | 'compare'>('compare');

  const [selected_prompt, set_selected_prompt] = useState(PRESET_PROMPTS[0]);
  const [workflow_step, set_workflow_step] = useState<0 | 1 | 2 | 3>(0);
  const [is_running, set_is_running] = useState(false);
  const [is_copied, set_is_copied] = useState(false);
  const [rag_result, set_rag_result] = useState<RAG_실행_응답 | null>(null);
  const [show_sources, set_show_sources] = useState(true);
  const [is_doc_modal_open, set_is_doc_modal_open] = useState(false);
  const [is_key_modal_open, set_is_key_modal_open] = useState(false);
  const [is_guide_modal_open, set_is_guide_modal_open] = useState(false);
  const [google_api_key, set_google_api_key] = useState('');
  const [total_doc_count, set_total_doc_count] = useState(12);

  // 1:1 비교 상태
  const [compare_result, set_compare_result] = useState<LLM_비교_결과 | null>(null);
  const [is_comparing, set_is_comparing] = useState(false);
  const [copied_side, set_copied_side] = useState<'gemini' | 'local' | null>(null);
  const [show_compare_rag, set_show_compare_rag] = useState(false);

  // 로컬 sLLM 서버 구동 상태
  const [local_server_status, set_local_server_status] = useState<{
    is_running: boolean;
    model?: string;
    device?: string;
    message?: string;
  } | null>(null);
  const [is_starting_server, set_is_starting_server] = useState(false);

  // 로컬 sLLM 서버 상태 헬스체크
  const check_local_server_status = async () => {
    try {
      const res = await fetch('/api/llm/local-server');
      if (res.ok) {
        const data = await res.json();
        set_local_server_status(data);
      }
    } catch {
      set_local_server_status({ is_running: false });
    }
  };

  // 로컬 sLLM 서버 브라우저 원클릭 가동
  const handle_start_local_server = async () => {
    set_is_starting_server(true);
    try {
      const res = await fetch('/api/llm/local-server', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start' }),
      });
      const data = await res.json();
      set_local_server_status(data);
      // 백그라운드 구동 안정화를 위해 2초 후 갱신
      setTimeout(check_local_server_status, 2000);
      setTimeout(check_local_server_status, 5000);
    } catch (err) {
      console.error('로컬 sLLM 서버 시작 오류:', err);
    } finally {
      set_is_starting_server(false);
    }
  };

  // 로컬스토리지 API 키 및 초기 RAG 세팅
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved_key = localStorage.getItem('google_gemini_api_key') || '';
      set_google_api_key(saved_key);
    }
    const all_docs = get_all_corpus();
    set_total_doc_count(all_docs.length);
    const initial_result = 경량_RAG_엔진.execute_rag(selected_prompt, selected_region || null);
    set_rag_result(initial_result);

    // 마운트 시 로컬 서버 상태 감지
    check_local_server_status();
  }, []);

  // 새 문서 등록 시 코퍼스 갱신
  const handle_document_added = () => {
    const all_docs = get_all_corpus();
    set_total_doc_count(all_docs.length);
    const updated_result = 경량_RAG_엔진.execute_rag(selected_prompt, selected_region || null);
    set_rag_result(updated_result);
  };

  // 단일 뷰 실행 핸들러
  const handle_execute_workflow = () => {
    set_is_running(true);
    set_workflow_step(1);

    setTimeout(() => {
      const result = 경량_RAG_엔진.execute_rag(selected_prompt, selected_region || null);
      set_rag_result(result);
      set_workflow_step(2);

      setTimeout(() => {
        set_workflow_step(3);
        set_is_running(false);
      }, 400);
    }, 400);
  };

  // 1:1 비교 실행 핸들러 (외부 Gemini vs 로컬 sLLM)
  const handle_execute_compare = async () => {
    set_is_comparing(true);
    try {
      // 1. 먼저 RAG를 통해 지자체 DW 및 법령 청크 추출
      const local_rag = 경량_RAG_엔진.execute_rag(selected_prompt, selected_region || null);
      set_rag_result(local_rag);

      const rag_context_text = local_rag.검색된_청크목록
        .map((c, i) => `[근거 ${i + 1}] ${c.청크.문서명} (${c.청크.조항_페이지}):\n${c.청크.본문}`)
        .join('\n\n');

      const region_name = selected_region
        ? `${selected_region.시도명} ${selected_region.시군구명}`
        : '강원특별자치도 영월군';

      // 2. /api/llm/compare 엔드포인트로 병렬 요청
      const res = await fetch('/api/llm/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: selected_prompt,
          google_api_key: google_api_key,
          region_name: region_name,
          region_stats: {
            emergency_rate: selected_region?.응급_60분_미도달_인구비율 ?? 68.2,
            ri_rate: selected_region?.관내_응급_의료이용률 ?? 19.8,
            maternity_rate: selected_region?.관내_분만율 ?? 15.2,
            vulnerability_grade: selected_region?.종합_취약도_등급 ?? '심각',
          },
          rag_context: rag_context_text,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        set_compare_result(json);
      }
    } catch (err) {
      console.error('LLM Compare error:', err);
    } finally {
      set_is_comparing(false);
    }
  };

  const handle_copy_text = async (text: string, side: 'gemini' | 'local') => {
    const ok = await copy_text_to_clipboard(text);
    if (ok) {
      set_copied_side(side);
      setTimeout(() => set_copied_side(null), 2000);
    }
  };

  return (
    <div className="bg-white p-6 sm:p-7 rounded-3xl border border-black/[0.05] shadow-apple-card space-y-5">
      {/* 1. 상단 타이틀 및 뷰 전환 탭바 */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-black/[0.05]">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#0071e3] to-[#34c759] text-white flex items-center justify-center shadow-apple-sm">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-semibold tracking-tight text-[#86868b]">
                공공보건의료 듀얼 AI 스튜디오
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#0071e3]/10 text-[#0071e3] text-[10px] font-bold">
                Gemini × Local sLLM
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold tracking-tight text-[#1d1d1f]">
              외부 클라우드 LLM vs 노트북 로컬 sLLM 비교 플랫폼
            </h3>
          </div>
        </div>

        {/* 뷰 모드 세그먼트 컨트롤러 & 설정 버튼들 */}
        <div className="flex flex-wrap items-center gap-2">
          {/* 탭 토글 */}
          <div className="bg-[#f5f5f7] p-1 rounded-2xl border border-black/[0.04] flex items-center text-xs font-bold">
            <button
              onClick={() => set_active_view_tab('compare')}
              className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
                active_view_tab === 'compare'
                  ? 'bg-white text-[#0071e3] shadow-apple-sm'
                  : 'text-[#86868b] hover:text-[#1d1d1f]'
              }`}
            >
              <SplitSquareVertical className="w-3.5 h-3.5" />
              <span>1:1 비교 스튜디오</span>
            </button>
            <button
              onClick={() => set_active_view_tab('single')}
              className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
                active_view_tab === 'single'
                  ? 'bg-white text-[#1d1d1f] shadow-apple-sm'
                  : 'text-[#86868b] hover:text-[#1d1d1f]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>표준 RAG 단일뷰</span>
            </button>
          </div>

          {/* 듀얼 AI 쉬운 설명 팝업 열기 버튼 */}
          <button
            onClick={() => set_is_guide_modal_open(true)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-2xl text-xs font-bold bg-gradient-to-r from-blue-500/10 via-emerald-500/10 to-blue-500/10 hover:from-blue-500/20 hover:to-emerald-500/20 text-[#0071e3] border border-[#0071e3]/30 transition shadow-apple-sm active:scale-95"
            title="듀얼 AI(클라우드 Gemini vs 온디바이스 sLLM) 기능을 아주 쉽게 설명해 드립니다"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>💡 듀얼 AI란? (쉬운 가이드)</span>
          </button>

          {/* 구글 API 키 설정 버튼 */}
          <button
            onClick={() => set_is_key_modal_open(true)}
            className={`inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-2xl text-xs font-bold border transition shadow-apple-sm ${
              google_api_key
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                : 'bg-amber-400/20 text-amber-900 border-amber-400 hover:bg-amber-400/30 ring-2 ring-amber-400/40 animate-pulse'
            }`}
            title="Google Gemini API 키 입력 및 관리"
          >
            <Key className="w-3.5 h-3.5 text-amber-600" />
            <span>{google_api_key ? '🔑 Google 키 등록됨' : '🔑 Google API 키 입력'}</span>
          </button>

          {/* 로컬 sLLM 서버 상태 및 원클릭 가동 버튼 */}
          <button
            onClick={local_server_status?.is_running ? check_local_server_status : handle_start_local_server}
            disabled={is_starting_server}
            className={`inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-2xl text-xs font-bold border transition shadow-apple-sm ${
              local_server_status?.is_running
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
            }`}
            title={
              local_server_status?.is_running
                ? '로컬 sLLM 가동 중 (클릭 시 상태 새로고침)'
                : '클릭 시 백그라운드에서 로컬 sLLM 서버(Qwen2.5-0.5B)를 즉시 가동합니다'
            }
          >
            {is_starting_server ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#34c759]" />
                <span>로컬 엔진 기동 중...</span>
              </>
            ) : local_server_status?.is_running ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>💻 로컬 sLLM 가동 중</span>
              </>
            ) : (
              <>
                <Power className="w-3.5 h-3.5 text-[#34c759]" />
                <span>💻 로컬 sLLM 실행</span>
              </>
            )}
          </button>

          {/* 새 지침 직접 등록 버튼 */}
          <button
            onClick={() => set_is_doc_modal_open(true)}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-2xl text-xs font-semibold bg-[#f5f5f7] hover:bg-[#e8e8ed] text-slate-700 border border-black/[0.04] transition"
          >
            <FilePlus className="w-3.5 h-3.5 text-[#0071e3]" />
            <span>지침 문서 등록 ({total_doc_count}건)</span>
          </button>

          {on_open_grounding && (
            <button
              onClick={on_open_grounding}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-2xl text-xs font-semibold bg-[#ff9500]/10 hover:bg-[#ff9500]/20 text-[#b26800] border border-[#ff9500]/25 transition"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#ff9500]" />
              <span>원문 대조 뷰</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. 프롬프트 추천 칩 영역 */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-[#1d1d1f] flex items-center justify-between">
          <span>추천 정책 질의 (클릭 시 자동 입력):</span>
          <span className="text-[11px] text-[#86868b] font-normal">
            선택 지역: <strong>{selected_region ? `${selected_region.시도명} ${selected_region.시군구명}` : '영월군'}</strong>
          </span>
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

      {/* 3. 질의 입력 및 실행창 */}
      <div className="relative">
        <input
          type="text"
          value={selected_prompt}
          onChange={(e) => {
            set_selected_prompt(e.target.value);
            set_workflow_step(0);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              if (active_view_tab === 'compare' && !is_comparing) {
                handle_execute_compare();
              } else if (active_view_tab === 'single' && !is_running) {
                handle_execute_workflow();
              }
            }
          }}
          placeholder="공공보건의료 지침, 법령 또는 예산 지원에 대해 질문하세요..."
          className="w-full pl-4 pr-32 py-3.5 text-xs sm:text-sm rounded-2xl bg-[#f5f5f7] border border-black/[0.06] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30 text-[#1d1d1f]"
        />
        <button
          onClick={active_view_tab === 'compare' ? handle_execute_compare : handle_execute_workflow}
          disabled={is_running || is_comparing || !selected_prompt.trim()}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-[#0071e3] hover:bg-[#0077ed] text-white shadow-apple-sm transition active:scale-95 disabled:opacity-60"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>
            {active_view_tab === 'compare'
              ? is_comparing
                ? '듀얼 추론 중...'
                : '1:1 비교 실행'
              : is_running
              ? '생성 중...'
              : 'RAG 실행'}
          </span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* 4-A. [1:1 비교 스튜디오 뷰] */}
      {/* ========================================================= */}
      {active_view_tab === 'compare' && (
        <div className="space-y-4 animate-in fade-in duration-300">
          {/* 상단 안내 바 */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-50 border border-black/[0.05] rounded-2xl text-xs">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold text-slate-700">비교 모드 활성화:</span>
              <span className="text-slate-500">
                1회 질의로 구글 클라우드 AI와 노트북 로컬 sLLM의 답변 품질 및 보안성을 동시 측정합니다.
              </span>
            </div>
            <div className="flex items-center space-x-2.5 text-[11px] text-slate-500 flex-wrap">
              <button
                onClick={() => set_is_guide_modal_open(true)}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0071e3] hover:text-[#005bb5] bg-white hover:bg-blue-50/60 px-2.5 py-1 rounded-xl border border-blue-200/80 shadow-xs transition"
              >
                <HelpCircle className="w-3 h-3 text-[#0071e3]" />
                <span>듀얼 AI란? 쉽게 보기</span>
              </button>
              <span>🌐 외부망: {google_api_key ? 'Gemini API 연동' : 'Gemini 시뮬레이션'}</span>
              <span>•</span>
              <span>💻 온디바이스: Qwen2.5-0.5B (폐쇄망 지원)</span>
            </div>
          </div>

          {/* RAG 실시간 지침 주입 알림 바 및 출처 보기 */}
          {rag_result && (
            <div className="bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-emerald-50/70 p-3.5 rounded-2xl border border-blue-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-[#0071e3] to-[#34c759] text-white flex items-center justify-center font-bold text-[10px] shadow-xs">
                  RAG
                </div>
                <div>
                  <span className="font-bold text-slate-900">
                    🔗 RAG + 듀얼 AI 실시간 결합 가동 중:
                  </span>{' '}
                  <span className="text-slate-600">
                    보건복지부 지침 DB에서 <strong>{rag_result.검색된_청크목록.length}건의 핵심 근거 조항</strong>을 실시간 검색하여, 두 모델(Gemini & 로컬 sLLM)의 프롬프트에 동시 주입하여 답변을 생성합니다.
                  </span>
                </div>
              </div>

              <button
                onClick={() => set_show_compare_rag(!show_compare_rag)}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0071e3] hover:underline bg-white px-3 py-1 rounded-xl border border-blue-200/80 shadow-xs self-start sm:self-auto shrink-0 transition"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>주입된 RAG 지침 {show_compare_rag ? '접기 ▲' : '열람하기 ▼'}</span>
              </button>
            </div>
          )}

          {/* 펼쳐졌을 때의 RAG 근거 청크 목록 */}
          {show_compare_rag && rag_result && (
            <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200 space-y-2.5 animate-in fade-in duration-200">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span className="flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-[#0071e3]" />
                  <span>두 AI에게 동시에 전달된 공공보건 지침/법령 근거 데이터:</span>
                </span>
                <span className="text-[11px] text-slate-500 font-normal">총 {rag_result.검색된_청크목록.length}건 검색됨</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                {rag_result.검색된_청크목록.slice(0, 3).map((item, idx) => (
                  <div key={idx} className="bg-white p-3 rounded-xl border border-slate-200/80 text-[11px] space-y-1 shadow-xs">
                    <div className="flex items-center justify-between text-[#0071e3] font-bold">
                      <span className="truncate max-w-[170px]">{item.청크.문서명}</span>
                      <span className="shrink-0 text-[10px] bg-blue-50 px-1.5 py-0.5 rounded text-blue-700">일치도 {item.유사도_점수}%</span>
                    </div>
                    <div className="text-slate-400 text-[10px] font-medium">{item.청크.조항_페이지}</div>
                    <div className="text-slate-600 line-clamp-3 text-[10px] leading-relaxed">
                      {item.청크.본문}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2열 Split-View 그리드 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
            {/* 좌측: Google Gemini (외부 클라우드 LLM) */}
            <div className="bg-[#fbfbfd] p-5 rounded-2xl border border-[#0071e3]/20 shadow-apple-sm flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-black/[0.05]">
                  <div className="flex items-center space-x-2">
                    <div className="w-7 h-7 rounded-lg bg-[#0071e3]/10 text-[#0071e3] flex items-center justify-center">
                      <Globe className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-bold text-[#1d1d1f]">
                          {compare_result?.google_gemini.success_model
                            ? compare_result.google_gemini.success_model
                            : compare_result?.google_gemini.model || 'Google Gemini (클라우드)'}
                        </span>
                        {compare_result?.google_gemini.is_live ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-white flex items-center gap-1 shadow-xs">
                            <Check className="w-3 h-3" />
                            <span>호출 성공</span>
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-[#0071e3]/10 text-[#0071e3]">
                            외부 클라우드 API
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-[#86868b]">
                        {compare_result?.google_gemini.is_live
                          ? `✓ 가용 모델 자동 검증 완료 (성공: ${compare_result.google_gemini.success_model || 'Gemini'})`
                          : '가용 모델 순차 자동 시도 (1.5 Flash ➔ 2.0 Flash ➔ 1.5 Pro)'}
                      </span>
                    </div>
                  </div>

                  {compare_result && (
                    <button
                      onClick={() => handle_copy_text(compare_result.google_gemini.response, 'gemini')}
                      className="p-1.5 rounded-lg hover:bg-slate-200/60 text-slate-600 transition"
                      title="답변 복사"
                    >
                      {copied_side === 'gemini' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  )}
                </div>

                {/* API 키 미등록 시 직관적인 입력 유도 배너 */}
                {!google_api_key && (
                  <div className="mt-2.5 p-2.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-[11px] text-amber-900">
                    <div className="flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-amber-600" />
                      <span>Gemini API 키를 등록하면 실제 실시간 구글 AI가 답변합니다.</span>
                    </div>
                    <button
                      onClick={() => set_is_key_modal_open(true)}
                      className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg transition shrink-0 shadow-apple-sm"
                    >
                      키 입력하기
                    </button>
                  </div>
                )}

                {/* 본문 */}
                <div className="mt-3">
                  {is_comparing ? (
                    <div className="py-12 flex flex-col items-center justify-center text-slate-400 space-y-2">
                      <div className="w-6 h-6 border-2 border-[#0071e3] border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs font-semibold text-slate-600">
                        가용 모델 순차 검증 및 추론 중...
                      </span>
                      <span className="text-[11px] text-slate-400">
                        (Gemini 1.5 Flash ➔ 2.0 Flash ➔ 1.5 Pro 순차 시도)
                      </span>
                    </div>
                  ) : compare_result ? (
                    <pre className="text-xs font-mono text-slate-800 whitespace-pre-wrap leading-relaxed bg-white p-4 rounded-xl border border-black/[0.04] max-h-[360px] overflow-y-auto">
                      {compare_result.google_gemini.response}
                    </pre>
                  ) : (
                    <div className="py-12 text-center text-slate-400 text-xs">
                      [1:1 비교 실행] 버튼을 누르면 구글 Gemini의 가용 모델을 순차 시도하여 최적 모델로 분석합니다.
                    </div>
                  )}
                </div>
              </div>

              {/* 하단 스펙 요약 바 */}
              <div className="pt-2 border-t border-black/[0.05] grid grid-cols-3 gap-2 text-[11px]">
                <div className="flex items-center gap-1 text-slate-600">
                  <Clock className="w-3.5 h-3.5 text-[#0071e3]" />
                  <span>지연시간: <strong>{compare_result?.google_gemini.elapsed_ms ? `${compare_result.google_gemini.elapsed_ms}ms` : '-'}</strong></span>
                </div>
                <div className="flex items-center gap-1 text-slate-600">
                  <Coins className="w-3.5 h-3.5 text-amber-500" />
                  <span>비용: <strong>종량제 과금</strong></span>
                </div>
                <div className="flex items-center gap-1 text-slate-600">
                  <ShieldAlert className="w-3.5 h-3.5 text-blue-500" />
                  <span>망분리: <strong>외부망 통신</strong></span>
                </div>
              </div>
            </div>

            {/* 우측: 노트북 로컬 sLLM (On-Device) */}
            <div className="bg-[#fbfbfd] p-5 rounded-2xl border border-[#34c759]/30 shadow-apple-sm flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-black/[0.05]">
                  <div className="flex items-center space-x-2">
                    <div className="w-7 h-7 rounded-lg bg-[#34c759]/10 text-[#34c759] flex items-center justify-center">
                      <Laptop className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-[#1d1d1f]">Qwen2.5-0.5B-Instruct</span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-[#34c759]/15 text-[#248a3d]">
                          노트북 On-Device sLLM
                        </span>
                      </div>
                      <span className="text-[10px] text-[#86868b]">
                        원내 폐쇄망 보안 특화 / 환자 개인정보 유출 원천 차단
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {local_server_status?.is_running ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        8000포트 가동 중
                      </span>
                    ) : (
                      <button
                        onClick={handle_start_local_server}
                        disabled={is_starting_server}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#34c759] hover:bg-[#28a745] text-white shadow-apple-sm transition disabled:opacity-50"
                        title="프로그램 내에서 로컬 sLLM 서버를 즉시 실행합니다"
                      >
                        {is_starting_server ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin" />
                            <span>실행 중...</span>
                          </>
                        ) : (
                          <>
                            <Power className="w-3 h-3" />
                            <span>서버 원클릭 실행</span>
                          </>
                        )}
                      </button>
                    )}

                    {compare_result && (
                      <button
                        onClick={() => handle_copy_text(compare_result.local_sllm.response, 'local')}
                        className="p-1.5 rounded-lg hover:bg-slate-200/60 text-slate-600 transition"
                        title="답변 복사"
                      >
                        {copied_side === 'local' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      </button>
                    )}
                  </div>
                </div>

                {/* 본문 */}
                <div className="mt-3">
                  {is_comparing ? (
                    <div className="py-12 flex flex-col items-center justify-center text-slate-400 space-y-2">
                      <div className="w-6 h-6 border-2 border-[#34c759] border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs">노트북 로컬 sLLM 엔진 추론 중...</span>
                    </div>
                  ) : compare_result ? (
                    <pre className="text-xs font-mono text-slate-800 whitespace-pre-wrap leading-relaxed bg-white p-4 rounded-xl border border-black/[0.04] max-h-[360px] overflow-y-auto">
                      {compare_result.local_sllm.response}
                    </pre>
                  ) : (
                    <div className="py-10 flex flex-col items-center justify-center text-slate-500 text-xs space-y-3">
                      <Laptop className="w-8 h-8 text-slate-300" />
                      <p className="text-center text-slate-500 max-w-xs">
                        {local_server_status?.is_running
                          ? '로컬 온디바이스 엔진(8000번 포트)이 정상 가동 중입니다. 상단의 [1:1 비교 실행] 버튼을 눌러보세요.'
                          : '노트북 로컬 sLLM 서버가 대기 중입니다. 아래 버튼을 눌러 터미널 없이 바로 실행할 수 있습니다.'}
                      </p>
                      {!local_server_status?.is_running && (
                        <button
                          onClick={handle_start_local_server}
                          disabled={is_starting_server}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#34c759] hover:bg-[#28a745] text-white shadow-apple-sm transition disabled:opacity-50"
                        >
                          {is_starting_server ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>로컬 sLLM 엔진 구동 중...</span>
                            </>
                          ) : (
                            <>
                              <Power className="w-4 h-4" />
                              <span>로컬 sLLM 서버 즉시 실행하기</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* 하단 스펙 요약 바 */}
              <div className="pt-2 border-t border-black/[0.05] grid grid-cols-3 gap-2 text-[11px]">
                <div className="flex items-center gap-1 text-slate-600">
                  <Clock className="w-3.5 h-3.5 text-[#34c759]" />
                  <span>지연시간: <strong>{compare_result?.local_sllm.elapsed_ms ? `${compare_result.local_sllm.elapsed_ms}ms` : '-'}</strong></span>
                </div>
                <div className="flex items-center gap-1 text-slate-600">
                  <Coins className="w-3.5 h-3.5 text-emerald-600" />
                  <span>비용: <strong>무제한 0원</strong></span>
                </div>
                <div className="flex items-center gap-1 text-slate-600">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>보안: <strong>폐쇄망 100%</strong></span>
                </div>
              </div>
            </div>
          </div>

          {/* 하단 비교 분석 종합 요약표 */}
          {compare_result && (
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <Zap className="w-4 h-4 text-amber-500" />
                <span>공공의료 AI 구축 관점 비교 분석 평가</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-[11px] text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 font-semibold">
                      <th className="py-1.5 px-3">비교 항목</th>
                      <th className="py-1.5 px-3 text-[#0071e3]">🌐 외부 LLM (Google Gemini)</th>
                      <th className="py-1.5 px-3 text-[#248a3d]">💻 로컬 sLLM (On-Device Qwen)</th>
                      <th className="py-1.5 px-3">공공의료 추천 적용 영역</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/60 text-slate-700">
                    <tr>
                      <td className="py-2 px-3 font-semibold">데이터 보안성</td>
                      <td className="py-2 px-3">외부 클라우드 전송 (개인식별정보 마스킹 필수)</td>
                      <td className="py-2 px-3 text-emerald-700 font-semibold">원내 폐쇄망 완벽 보호 (데이터 유출 0%)</td>
                      <td className="py-2 px-3"><strong>환자 전자의무기록(EMR), 비식별 진료 데이터</strong>는 로컬 sLLM 필수</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-semibold">운영 비용</td>
                      <td className="py-2 px-3">API 호출 건당 토큰 과금 발생</td>
                      <td className="py-2 px-3 text-emerald-700 font-semibold">무제한 무료 (자체 서버/노트북 연산)</td>
                      <td className="py-2 px-3">대규모 단순 질의응답 및 일상 스크리닝 시 로컬 sLLM이 예산 절감</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-semibold">정책 문안 품질</td>
                      <td className="py-2 px-3 text-[#0071e3] font-semibold">복합 법령 조항 합성 및 종합 기획력 우수</td>
                      <td className="py-2 px-3">개조식 핵심 요약 및 정형화된 서술문 위주</td>
                      <td className="py-2 px-3"><strong>정부 국고보조금 제안서, 중장기 종합발전계획</strong>은 대형 LLM 추천</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* 4-B. [표준 RAG 단일 뷰] */}
      {/* ========================================================= */}
      {active_view_tab === 'single' && (
        <div className="space-y-4 animate-in fade-in duration-300">
          {/* Agentic AI 워크플로우 3단계 실시간 시각화 */}
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
            <div className="bg-[#fbfbfd] p-5 rounded-2xl border border-black/[0.06] shadow-apple-sm space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-black/[0.05]">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-[#34c759]" />
                  <span className="text-xs font-bold text-[#1d1d1f]">
                    RAG 증강 생성 답변 및 공문서 초안 (소요시간: {rag_result.소요시간_ms}ms)
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={async () => {
                      if (rag_result) {
                        const ok = await copy_text_to_clipboard(rag_result.생성된_답변);
                        if (ok) {
                          set_is_copied(true);
                          setTimeout(() => set_is_copied(false), 2000);
                        }
                      }
                    }}
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
                    <span>실제 검색된 보건복지부 법정 고시 조항 ({rag_result.검색된_청크목록.length}건 발췌)</span>
                  </div>
                  {show_sources ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {show_sources && (
                  <div className="p-4 space-y-3 divide-y divide-slate-100">
                    {rag_result.검색된_청크목록.map((res, idx) => (
                      <div key={res.청크.id} className={`${idx > 0 ? 'pt-3' : ''} space-y-1`}>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900">
                            {idx + 1}. {res.청크.문서명}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#0071e3]/10 text-[#0071e3]">
                            유사도 {res.유사도_점수}%
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium">{res.청크.조항_페이지}</p>
                        <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200/60 leading-relaxed">
                          {res.청크.본문}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 지침 문서 업로드 모달 */}
      <지침_문서_등록_모달
        is_open={is_doc_modal_open}
        on_close={() => set_is_doc_modal_open(false)}
        on_document_added={handle_document_added}
      />

      {/* 구글 API 키 설정 모달 */}
      <구글_api키_설정_모달
        is_open={is_key_modal_open}
        on_close={() => set_is_key_modal_open(false)}
        on_key_saved={(new_key) => set_google_api_key(new_key)}
      />

      {/* 듀얼 AI 초간단 쉬운 설명 모달 */}
      <듀얼_AI_안내_모달
        is_open={is_guide_modal_open}
        on_close={() => set_is_guide_modal_open(false)}
      />
    </div>
  );
};
