'use client';

// 공공의료 특화 sLLM 지침 검색 및 보고서 초안 자동화 워크플로우
// 1. 실제 경량 하이브리드 RAG 엔진 연동
// 2. 외부 클라우드 LLM(Google Gemini) vs 노트북 로컬 sLLM(Qwen2.5-0.5B-Instruct) 1:1 비교 스튜디오 탑재

import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  FileText,
  MessageSquare,
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
  X,
} from 'lucide-react';
import { 필수의료_진단_결과 } from '@/lib/필수의료_타입';
import { copy_text_to_clipboard } from '@/lib/유틸리티';
import { 경량_RAG_엔진, RAG_실행_응답 } from '@/lib/경량_rag_엔진';
import { get_all_corpus } from '@/lib/공공의료_지침_코퍼스';
import { 지침_문서_등록_모달 } from './지침_문서_등록_모달';
import { 구글_api키_설정_모달 } from './구글_api키_설정_모달';
import { 듀얼_AI_안내_모달 } from './듀얼_AI_안내_모달';
import { API키_불러오기 } from '@/lib/API키_저장소';

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

const PRESET_BUSINESS_PROMPTS = [
  '2026년 공공보건의료계획 평가지표 중 필수의료 자체충족률 산정 기준을 알려주고, 영월의료원 실적보고서 초안을 작성해줘.',
  '보건복지부 의료취약지 파견의사 지원사업 신청 자격 요건과 당직비 보조 규정을 요약하고 지자체 사업계획서를 작성해줘.',
  '분만취약지 A등급과 B등급 지원 기준 차이 및 운영비 국비 지원 규모를 비교하여 지원 신청서 표준안을 작성해줘.',
  '달빛어린이병원 지정 요건과 소아청소년과 전문의 야간진료 관리료 가산 규정을 포함한 운영계획서를 작성해줘.',
];

const PRESET_QA_PROMPTS = [
  '의료취약지 파견의사 지원사업의 신청 자격 요건과 국비 보조 비율 및 지원 한도는 얼마인가요?',
  '권역책임의료기관과 지역책임의료기관의 주요 역할 차이점과 필수 연계 체계를 설명해줘.',
  '공공보건의료계획 평가에서 필수의료 자체충족률(RI) 계산 공식과 가점 기준은 어떻게 되나요?',
  '분만취약지 A등급과 B등급의 판정 기준 및 지원 내용(개설비/운영비) 차이는 무엇인가요?',
  '심야 응급실 당직 수당 국비 지원 한도 및 신청 절차에 대해 상세히 알려줘.',
];

export const 공공의료_sLLM_업무비서: React.FC<sLLM_업무비서_속성> = ({
  selected_region,
  on_open_grounding,
}) => {
  // 뷰 모드 전환: 'single' (표준 RAG 단일뷰) vs 'compare' (Gemini vs 로컬 sLLM 비교 스튜디오)
  const [active_view_tab, set_active_view_tab] = useState<'single' | 'compare'>('compare');

  // 우측 기능 분리 탭: 'business_plan' (1. 사업계획서 작성 비교) vs 'general_qa' (2. 일반 질의응답 비교)
  const [active_feature_tab, set_active_feature_tab] = useState<'business_plan' | 'general_qa'>('business_plan');

  // 모드별 정책질의 프리셋 및 목록 관리
  const [business_prompt_list, set_business_prompt_list] = useState<string[]>(PRESET_BUSINESS_PROMPTS);
  const [qa_prompt_list, set_qa_prompt_list] = useState<string[]>(PRESET_QA_PROMPTS);

  const [selected_business_prompt, set_selected_business_prompt] = useState(PRESET_BUSINESS_PROMPTS[0]);
  const [selected_qa_prompt, set_selected_qa_prompt] = useState(PRESET_QA_PROMPTS[0]);

  // 현재 활성화된 탭의 질의 및 질의목록
  const current_prompt = active_feature_tab === 'business_plan' ? selected_business_prompt : selected_qa_prompt;
  const current_prompt_list = active_feature_tab === 'business_plan' ? business_prompt_list : qa_prompt_list;

  const set_current_prompt = (text: string) => {
    if (active_feature_tab === 'business_plan') {
      set_selected_business_prompt(text);
    } else {
      set_selected_qa_prompt(text);
    }
  };

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

  // 1:1 비교 상태 (모드별 독립 보존)
  const [business_compare_result, set_business_compare_result] = useState<LLM_비교_결과 | null>(null);
  const [qa_compare_result, set_qa_compare_result] = useState<LLM_비교_결과 | null>(null);
  const compare_result = active_feature_tab === 'business_plan' ? business_compare_result : qa_compare_result;

  const [is_comparing, set_is_comparing] = useState(false);
  const [copied_side, set_copied_side] = useState<'gemini' | 'local' | null>(null);
  const [show_compare_rag, set_show_compare_rag] = useState(false);

  // 모델별 독립 RAG 주입 근거 수 및 상세 보기 상태
  const [gemini_rag_count, set_gemini_rag_count] = useState<number>(4);
  const [local_rag_count, set_local_rag_count] = useState<number>(2);
  const [show_gemini_rag_details, set_show_gemini_rag_details] = useState<boolean>(false);
  const [show_local_rag_details, set_show_local_rag_details] = useState<boolean>(false);

  // 추천 정책질의 드롭다운 열림 상태
  const [is_dropdown_open, set_is_dropdown_open] = useState(false);
  const dropdown_ref = useRef<HTMLDivElement>(null);

  // 입력창 추천 예시 및 Tab 자동완성 상태
  const [sllm_suggestion_idx, set_sllm_suggestion_idx] = useState<number>(0);
  const current_active_prompt_list = active_feature_tab === 'business_plan' ? business_prompt_list : qa_prompt_list;
  const sllm_current_suggestion = useMemo(() => {
    if (!current_prompt.trim()) {
      return current_active_prompt_list[sllm_suggestion_idx % current_active_prompt_list.length] || '';
    }
    const matched = current_active_prompt_list.find(s =>
      s.toLowerCase().includes(current_prompt.toLowerCase()) && s !== current_prompt
    );
    return matched || current_active_prompt_list[sllm_suggestion_idx % current_active_prompt_list.length] || '';
  }, [current_active_prompt_list, sllm_suggestion_idx, current_prompt]);

  // 새로운 정책 질의 자동 등록 및 로컬스토리지 저장
  const save_prompt_if_new = (new_prompt: string, tab: 'business_plan' | 'general_qa') => {
    const trimmed = new_prompt.trim();
    if (!trimmed) return;
    if (tab === 'business_plan') {
      set_business_prompt_list((prev) => {
        if (prev.includes(trimmed)) return prev;
        const updated = [trimmed, ...prev];
        if (typeof window !== 'undefined') {
          const user_saved = updated.filter((p) => !PRESET_BUSINESS_PROMPTS.includes(p));
          localStorage.setItem('user_saved_business_prompts', JSON.stringify(user_saved));
        }
        return updated;
      });
    } else {
      set_qa_prompt_list((prev) => {
        if (prev.includes(trimmed)) return prev;
        const updated = [trimmed, ...prev];
        if (typeof window !== 'undefined') {
          const user_saved = updated.filter((p) => !PRESET_QA_PROMPTS.includes(p));
          localStorage.setItem('user_saved_qa_prompts', JSON.stringify(user_saved));
        }
        return updated;
      });
    }
  };

  // 등록된 질의 삭제 핸들러
  const handle_delete_prompt = (e: React.MouseEvent, prompt_to_delete: string, tab: 'business_plan' | 'general_qa') => {
    e.stopPropagation();
    if (tab === 'business_plan') {
      set_business_prompt_list((prev) => {
        const updated = prev.filter((p) => p !== prompt_to_delete);
        if (typeof window !== 'undefined') {
          const user_saved = updated.filter((p) => !PRESET_BUSINESS_PROMPTS.includes(p));
          localStorage.setItem('user_saved_business_prompts', JSON.stringify(user_saved));
        }
        return updated;
      });
    } else {
      set_qa_prompt_list((prev) => {
        const updated = prev.filter((p) => p !== prompt_to_delete);
        if (typeof window !== 'undefined') {
          const user_saved = updated.filter((p) => !PRESET_QA_PROMPTS.includes(p));
          localStorage.setItem('user_saved_qa_prompts', JSON.stringify(user_saved));
        }
        return updated;
      });
    }
  };

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
      // 403(배포 환경 비활성)도 안내 메시지를 표시하기 위해 본문을 그대로 반영
      const data = await res.json().catch(() => ({ is_running: false }));
      set_local_server_status(data);
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
      set_google_api_key(API키_불러오기('google_gemini_api_key'));

      // 사용자가 이전에 직접 등록했던 사업계획서 질의들 복원
      const saved_b_prompts = localStorage.getItem('user_saved_business_prompts');
      if (saved_b_prompts) {
        try {
          const parsed = JSON.parse(saved_b_prompts);
          if (Array.isArray(parsed) && parsed.length > 0) {
            set_business_prompt_list(Array.from(new Set([...PRESET_BUSINESS_PROMPTS, ...parsed])));
          }
        } catch {}
      }

      // 사용자가 이전에 직접 등록했던 일반 질의들 복원
      const saved_qa_prompts = localStorage.getItem('user_saved_qa_prompts');
      if (saved_qa_prompts) {
        try {
          const parsed = JSON.parse(saved_qa_prompts);
          if (Array.isArray(parsed) && parsed.length > 0) {
            set_qa_prompt_list(Array.from(new Set([...PRESET_QA_PROMPTS, ...parsed])));
          }
        } catch {}
      }
    }
    const all_docs = get_all_corpus();
    set_total_doc_count(all_docs.length);
    const initial_result = 경량_RAG_엔진.execute_rag(selected_business_prompt, selected_region || null, 8);
    set_rag_result(initial_result);

    // 마운트 시 로컬 서버 상태 감지
    check_local_server_status();

    // 바깥 클릭 시 드롭다운 닫기
    const handle_click_outside = (e: MouseEvent) => {
      if (dropdown_ref.current && !dropdown_ref.current.contains(e.target as Node)) {
        set_is_dropdown_open(false);
      }
    };
    document.addEventListener('mousedown', handle_click_outside);
    return () => {
      document.removeEventListener('mousedown', handle_click_outside);
    };
  }, []);

  // 새 문서 등록 시 코퍼스 갱신
  const handle_document_added = () => {
    const all_docs = get_all_corpus();
    set_total_doc_count(all_docs.length);
    const updated_result = 경량_RAG_엔진.execute_rag(current_prompt, selected_region || null, 8);
    set_rag_result(updated_result);
  };

  // 단일 뷰 실행 핸들러
  const handle_execute_workflow = () => {
    save_prompt_if_new(current_prompt, active_feature_tab);
    set_is_running(true);
    set_workflow_step(1);

    setTimeout(() => {
      const result = 경량_RAG_엔진.execute_rag(current_prompt, selected_region || null, 8);
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
    const prompt_to_run = current_prompt;
    save_prompt_if_new(prompt_to_run, active_feature_tab);
    set_is_comparing(true);
    try {
      // 1. 먼저 RAG를 통해 지자체 DW 및 법령 청크 추출 (선택된 RAG 건수 중 최대값 이상 검색)
      const max_top_k = Math.max(gemini_rag_count, local_rag_count, 8);
      const local_rag = 경량_RAG_엔진.execute_rag(prompt_to_run, selected_region || null, max_top_k);
      set_rag_result(local_rag);

      // 모델별 독립된 RAG 청크 슬라이스 (선택한 개수만큼 전달)
      const gemini_chunks = local_rag.검색된_청크목록.slice(0, gemini_rag_count);
      const local_chunks = local_rag.검색된_청크목록.slice(0, local_rag_count);

      const gemini_rag_text = gemini_chunks
        .map((c, i) => `[근거 ${i + 1}] ${c.청크.문서명} (${c.청크.조항_페이지}):\n${c.청크.본문}`)
        .join('\n\n');

      const local_rag_text = local_chunks
        .map((c, i) => `[근거 ${i + 1}] ${c.청크.문서명} (${c.청크.조항_페이지}):\n${c.청크.본문}`)
        .join('\n\n');

      const region_name = selected_region
        ? `${selected_region.시도명} ${selected_region.시군구명}`
        : '강원특별자치도 영월군';

      // 2. /api/llm/compare 엔드포인트로 병렬 요청 (모델별 선택된 수와 내용 각각 전달 + mode 파라미터 전달)
      const res = await fetch('/api/llm/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: prompt_to_run,
          google_api_key: google_api_key,
          region_name: region_name,
          region_stats: {
            emergency_rate: selected_region?.응급_60분_미도달_인구비율 ?? 68.2,
            ri_rate: selected_region?.관내_응급_의료이용률 ?? 19.8,
            maternity_rate: selected_region?.관내_분만율 ?? 15.2,
            vulnerability_grade: selected_region?.종합_취약도_등급 ?? '심각',
          },
          rag_context: gemini_rag_text,
          gemini_rag_context: gemini_rag_text,
          local_rag_context: local_rag_text,
          gemini_chunks_count: gemini_rag_count,
          local_chunks_count: local_rag_count,
          mode: active_feature_tab,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        if (active_feature_tab === 'business_plan') {
          set_business_compare_result(json);
        } else {
          set_qa_compare_result(json);
        }
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
    <div className="bg-white dark:bg-[#161618] p-6 sm:p-7 rounded-3xl border border-black/[0.05] dark:border-white/[0.08] shadow-apple-card space-y-5">
      {/* ========================================================= */}
      {/* 1. 상단 공통 헤더: 타이틀 & 글로벌 제어 도구 (공통 기능) */}
      {/* ========================================================= */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-black/[0.05] dark:border-white/[0.08]">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#0071e3] to-[#34c759] text-white flex items-center justify-center shadow-apple-sm">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-semibold tracking-tight text-[#86868b] dark:text-slate-400">
                공공보건의료 듀얼 AI 스튜디오
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#0071e3]/10 dark:bg-[#0071e3]/20 text-[#0071e3] dark:text-[#2997ff] text-[10px] font-bold">
                Gemini × Local sLLM
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold tracking-tight text-[#1d1d1f] dark:text-white">
              외부 클라우드 LLM vs 노트북 로컬 sLLM 비교 플랫폼
            </h3>
          </div>
        </div>

        {/* 상단 우측 글로벌 공통 액션 버튼들 */}
        <div className="flex flex-wrap items-center gap-2">
          {/* 듀얼 AI 쉬운 설명 팝업 열기 버튼 */}
          <button
            onClick={() => set_is_guide_modal_open(true)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-2xl text-xs font-bold bg-gradient-to-r from-blue-500/10 via-emerald-500/10 to-blue-500/10 hover:from-blue-500/20 hover:to-emerald-500/20 text-[#0071e3] dark:text-[#2997ff] border border-[#0071e3]/30 dark:border-[#0071e3]/50 transition shadow-apple-sm active:scale-95"
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
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-700'
                : 'bg-amber-400/20 text-amber-900 border-amber-400 hover:bg-amber-400/30 ring-2 ring-amber-400/40 animate-pulse dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-700'
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
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-700'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300 dark:bg-[#2c2c2e] dark:hover:bg-[#3a3a3c] dark:text-slate-200 dark:border-white/[0.1]'
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
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-2xl text-xs font-semibold bg-[#f5f5f7] hover:bg-[#e8e8ed] text-slate-700 border border-black/[0.04] dark:bg-[#2c2c2e] dark:hover:bg-[#3a3a3c] dark:text-slate-200 dark:border-white/[0.1] transition shadow-apple-sm active:scale-95"
            title="법령 고시, 지자체 공문, 지침 문서를 등록하여 RAG 검색 대상에 즉시 포함합니다"
          >
            <FilePlus className="w-3.5 h-3.5 text-[#0071e3] dark:text-[#2997ff]" />
            <span>지침 문서 등록 ({total_doc_count}건)</span>
          </button>

          {on_open_grounding && (
            <button
              onClick={on_open_grounding}
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-2xl text-xs font-semibold bg-[#ff9500]/10 hover:bg-[#ff9500]/20 text-[#b26800] border border-[#ff9500]/25 dark:bg-[#ff9500]/20 dark:hover:bg-[#ff9500]/30 dark:text-[#ff9f0a] dark:border-[#ff9500]/40 transition shadow-apple-sm"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#ff9500]" />
              <span>원문 대조 뷰</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. [설명하는 곳 💡] 지자체 DW 현황 및 RAG 연동 배너 */}
      {/* ========================================================= */}
      <div className="space-y-2.5">
        <div className="zone-info-box flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2">
            <span className="zone-badge-info">💡 DW 현황</span>
            <span className="font-bold text-slate-800 dark:text-slate-100">
              분석 대상: <strong>{selected_region ? `${selected_region.시도명} ${selected_region.시군구명}` : '강원특별자치도 영월군'}</strong>
            </span>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400">
              취약도 {selected_region?.종합_취약도_등급 || '심각'}
            </span>
          </div>
          <div className="flex items-center space-x-2 text-[11px] text-slate-600 dark:text-slate-400 flex-wrap">
            <span className="bg-white dark:bg-[#252528] px-2.5 py-1 rounded-lg border border-slate-200/80 dark:border-white/[0.08] shadow-2xs text-slate-700 dark:text-slate-200">
              응급 60분 미도달: <strong className="text-red-600 dark:text-red-400">{selected_region?.응급_60분_미도달_인구비율 ?? 68.2}%</strong>
            </span>
            <span className="bg-white dark:bg-[#252528] px-2.5 py-1 rounded-lg border border-slate-200/80 dark:border-white/[0.08] shadow-2xs text-slate-700 dark:text-slate-200">
              관내 RI(자체충족): <strong className="text-amber-600 dark:text-amber-400">{selected_region?.관내_응급_의료이용률 ?? 19.8}%</strong>
            </span>
            <span className="bg-white dark:bg-[#252528] px-2.5 py-1 rounded-lg border border-slate-200/80 dark:border-white/[0.08] shadow-2xs text-slate-700 dark:text-slate-200">
              관내 분만율: <strong className="text-indigo-600 dark:text-indigo-400">{selected_region?.관내_분만율 ?? 15.2}%</strong>
            </span>
            <span className="text-slate-400 dark:text-slate-600">|</span>
            <span className="text-slate-600 dark:text-slate-300">🌐 외부망: {google_api_key ? 'Gemini API 연동' : 'Gemini 시뮬레이션'}</span>
            <span className="text-slate-400 dark:text-slate-600">•</span>
            <span className="text-slate-600 dark:text-slate-300">💻 온디바이스: Qwen2.5-0.5B (폐쇄망)</span>
          </div>
        </div>

        {/* RAG 실시간 지침 주입 알림 바 및 출처 보기 */}
        {rag_result && (
          <div className="bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-emerald-50/70 dark:from-blue-950/40 dark:via-indigo-950/30 dark:to-emerald-950/40 p-3.5 rounded-2xl border border-blue-200/70 dark:border-blue-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-[#0071e3] to-[#34c759] text-white flex items-center justify-center font-bold text-[10px] shadow-xs">
                RAG
              </div>
              <div>
                <span className="font-bold text-slate-900 dark:text-slate-100">
                  🔗 RAG + 듀얼 AI 실시간 결합 가동 중:
                </span>{' '}
                <span className="text-slate-600 dark:text-slate-300">
                  보건복지부 지침 DB 및 <strong>직접 등록 규정 문서</strong>에서 <strong>{rag_result.검색된_청크목록.length}건의 핵심 근거 조항</strong>을 실시간 검색하여, 두 모델(Gemini & 로컬 sLLM)에 동시 주입합니다.
                </span>
              </div>
            </div>

            <button
              onClick={() => set_show_compare_rag(!show_compare_rag)}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0071e3] dark:text-[#2997ff] hover:underline bg-white dark:bg-[#252528] px-3 py-1 rounded-xl border border-blue-200/80 dark:border-blue-800/60 shadow-xs self-start sm:self-auto shrink-0 transition"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>주입된 RAG 지침 {show_compare_rag ? '접기 ▲' : '열람하기 ▼'}</span>
            </button>
          </div>
        )}

        {/* 펼쳐졌을 때의 RAG 근거 청크 목록 */}
        {show_compare_rag && rag_result && (
          <div className="bg-slate-50/80 dark:bg-[#1a1a1c] p-4 rounded-2xl border border-slate-200 dark:border-white/[0.08] space-y-2.5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
              <span className="flex items-center gap-1.5">
                <Database className="w-4 h-4 text-[#0071e3] dark:text-[#2997ff]" />
                <span>두 AI에게 동시에 전달된 공공보건 지침/법령 근거 데이터:</span>
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">총 {rag_result.검색된_청크목록.length}건 검색됨</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-80 overflow-y-auto pr-1">
              {rag_result.검색된_청크목록.map((item, idx) => (
                <div key={idx} className="bg-white dark:bg-[#242428] p-3 rounded-xl border border-slate-200/80 dark:border-white/[0.08] text-[11px] space-y-1 shadow-xs">
                  <div className="flex items-center justify-between text-[#0071e3] dark:text-[#2997ff] font-bold">
                    <div className="flex items-center gap-1 min-w-0">
                      {item.청크.사용자추가여부 && (
                        <span className="shrink-0 px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                          직접등록 지침
                        </span>
                      )}
                      <span className="truncate max-w-[150px]">{item.청크.문서명}</span>
                    </div>
                    <span className="shrink-0 text-[10px] bg-blue-50 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300 px-1.5 py-0.5 rounded">일치도 {item.유사도_점수}%</span>
                  </div>
                  <div className="text-slate-400 dark:text-slate-500 text-[10px] font-medium">{item.청크.조항_페이지}</div>
                  <div className="text-slate-600 dark:text-slate-300 line-clamp-3 text-[10px] leading-relaxed">
                    {item.청크.본문}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* 3. 우측 기능 분리 탭 (1. 사업계획서 작성 비교 vs 2. 일반 질의응답 비교) */}
      {/* ========================================================= */}
      {/* ========================================================= */}
      {/* 3. 우측 기능 분리 탭 (1. 사업계획서 작성 비교 vs 2. 일반 질의응답 비교) */}
      {/* ========================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2 bg-[#f5f5f7] dark:bg-[#1c1c1e] rounded-2xl border border-teal-500/20 dark:border-teal-400/20 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="zone-badge-select">🎯 모드 선택</span>
          <button
            onClick={() => {
              set_active_view_tab('compare');
              set_active_feature_tab('business_plan');
              set_is_dropdown_open(false);
            }}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
              active_view_tab === 'compare' && active_feature_tab === 'business_plan'
                ? 'bg-white dark:bg-[#2c2c2e] text-[#0071e3] dark:text-[#2997ff] shadow-apple-sm border border-blue-500/30 ring-2 ring-blue-500/10'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5 border border-transparent'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>📋 1. 사업계획서 작성 비교</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              active_view_tab === 'compare' && active_feature_tab === 'business_plan'
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300'
                : 'bg-slate-200/80 text-slate-600 dark:bg-[#252528] dark:text-slate-400'
            }`}>
              실적보고서·기획
            </span>
          </button>

          <button
            onClick={() => {
              set_active_view_tab('compare');
              set_active_feature_tab('general_qa');
              set_is_dropdown_open(false);
            }}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
              active_view_tab === 'compare' && active_feature_tab === 'general_qa'
                ? 'bg-white dark:bg-[#2c2c2e] text-[#0071e3] dark:text-[#2997ff] shadow-apple-sm border border-emerald-500/30 ring-2 ring-emerald-500/10'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5 border border-transparent'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>💬 2. 일반 질의응답 비교</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              active_view_tab === 'compare' && active_feature_tab === 'general_qa'
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300'
                : 'bg-slate-200/80 text-slate-600 dark:bg-[#252528] dark:text-slate-400'
            }`}>
              행정·법령 Q&A
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2 px-2">
          <span className="hidden md:inline text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            {active_view_tab === 'compare'
              ? active_feature_tab === 'business_plan'
                ? '💡 DW + 법령 RAG 결합 사업계획서 1:1 비교'
                : '💡 공공보건 지침/규정 및 행정 업무 1:1 비교'
              : '💡 3단계 RAG 단일뷰 실행 모드'}
          </span>
          <button
            onClick={() => set_active_view_tab(active_view_tab === 'single' ? 'compare' : 'single')}
            className={`px-2.5 py-1.5 rounded-xl text-[11px] font-semibold border transition flex items-center gap-1 shrink-0 ${
              active_view_tab === 'single'
                ? 'bg-[#0071e3] text-white border-[#0071e3] shadow-apple-sm'
                : 'bg-white dark:bg-[#252528] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border-slate-200 dark:border-white/[0.08]'
            }`}
            title="기존 RAG 3단계(검색-DW주입-답변생성) 단일뷰로 전환"
          >
            <Layers className="w-3 h-3" />
            <span>{active_view_tab === 'single' ? '← 듀얼 비교 복귀' : '표준 RAG 단일뷰'}</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 4. 추천 정책 질의 드롭다운 선택기 (각 탭 전용 질의 목록 & 직접 입력 자동 등록) */}
      {/* ========================================================= */}
      <div className="space-y-2 relative" ref={dropdown_ref}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="zone-badge-select">🎯 추천 질의 선택</span>
            <label className="text-xs font-bold text-[#1d1d1f] dark:text-white">
              {active_feature_tab === 'business_plan'
                ? '사업계획서 추천 질의 드롭다운:'
                : '일반 정책·행정 추천 질의 드롭다운:'}
            </label>
            <span className="text-[11px] text-[#86868b] dark:text-slate-400 font-normal">
              (선택 시 즉시 적용되며, 아래 입력창에서 직접 수정/작성도 가능)
            </span>
          </div>
          <button
            type="button"
            onClick={() => set_is_dropdown_open(!is_dropdown_open)}
            className="text-xs text-[#0071e3] dark:text-[#2997ff] font-semibold hover:underline flex items-center gap-1 shrink-0"
          >
            <span>질의 목록 ({current_prompt_list.length}건)</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${is_dropdown_open ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* 드롭다운 셀렉트 박스 */}
        <div className="relative">
          <button
            type="button"
            onClick={() => set_is_dropdown_open(!is_dropdown_open)}
            className="zone-select-box w-full flex items-center justify-between px-4 py-3 rounded-xl text-left text-xs font-medium transition cursor-pointer"
          >
            <span className="truncate text-slate-800 dark:text-slate-200">
              {active_feature_tab === 'business_plan' ? '📋 ' : '💬 '}
              {current_prompt ? current_prompt : '추천 질의를 선택하세요...'}
            </span>
            <ChevronDown className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 ml-2" />
          </button>

          {/* 드롭다운 메뉴 팝오버 */}
          {is_dropdown_open && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-[#1c1c1e] border border-teal-500/30 dark:border-teal-400/30 shadow-2xl rounded-2xl z-30 max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-white/[0.06] animate-in fade-in zoom-in-95 duration-150">
              <div className="p-2.5 bg-teal-50/50 dark:bg-teal-950/30 text-[11px] font-bold text-teal-800 dark:text-teal-300 flex items-center justify-between border-b border-teal-100 dark:border-teal-900/40">
                <span className="flex items-center gap-1.5">
                  <span className="zone-badge-select">🎯 목록</span>
                  {active_feature_tab === 'business_plan'
                    ? '사업계획서 작성 추천 질의 (입력창에 직접 입력 시 자동 추가)'
                    : '일반 정책 질의응답 추천 질의 (입력창에 직접 입력 시 자동 추가)'}
                </span>
                <span className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold">총 {current_prompt_list.length}개</span>
              </div>
              <div className="p-1.5 space-y-1">
                {current_prompt_list.map((p, idx) => {
                  const presets = active_feature_tab === 'business_plan' ? PRESET_BUSINESS_PROMPTS : PRESET_QA_PROMPTS;
                  const is_custom = !presets.includes(p);
                  const is_active = current_prompt === p;
                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        set_current_prompt(p);
                        set_is_dropdown_open(false);
                      }}
                      className={`group flex items-start justify-between gap-2 p-2.5 rounded-xl cursor-pointer text-xs transition ${
                        is_active
                          ? 'bg-blue-50 dark:bg-blue-950/60 text-[#0071e3] dark:text-[#2997ff] font-semibold ring-1 ring-[#0071e3]/30'
                          : 'hover:bg-teal-50/50 dark:hover:bg-white/[0.06] text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      <div className="flex items-start gap-2 min-w-0">
                        <span className="shrink-0 mt-0.5 text-[10px] px-1.5 py-0.2 rounded font-bold bg-slate-100 dark:bg-[#2c2c2e] text-slate-600 dark:text-slate-300">
                          {is_custom ? '직접등록' : `추천 ${idx + 1}`}
                        </span>
                        <span className="leading-snug">{p}</span>
                      </div>
                      {is_custom && (
                        <button
                          type="button"
                          onClick={(e) => handle_delete_prompt(e, p, active_feature_tab)}
                          className="shrink-0 text-slate-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400 p-1 rounded-md transition"
                          title="질의 목록에서 삭제"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 5. [입력하는 곳 ✏️] 정책 질의 입력창 & Tab 키 자동완성 */}
      {/* ========================================================= */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2 px-1">
          <div className="flex items-center gap-2">
            <span className="zone-badge-input">✏️ 직접 질의 입력</span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              원하는 정책·사업 주제를 직접 타이핑하거나 Tab 키로 예시를 자동 입력할 수 있습니다.
            </span>
          </div>

          {/* 예시 제안 바 & Tab 자동완성 안내 */}
          {sllm_current_suggestion && (
            <div className="flex items-center gap-1.5 text-[11px] max-w-full overflow-hidden">
              <span className="text-slate-400 dark:text-slate-500 shrink-0">💡 예시:</span>
              <button
                type="button"
                onClick={() => {
                  set_current_prompt(sllm_current_suggestion);
                  set_workflow_step(0);
                }}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 transition font-medium text-[11px] max-w-[260px] sm:max-w-md truncate group cursor-pointer shadow-2xs"
                title="클릭하거나 Tab 키를 누르면 입력창에 자동 완성됩니다"
              >
                <span className="px-1.5 py-0.5 bg-indigo-200/80 dark:bg-indigo-800/80 text-indigo-900 dark:text-indigo-100 text-[10px] font-bold rounded font-mono shadow-2xs group-hover:bg-indigo-300">
                  Tab ↹
                </span>
                <span className="truncate">{sllm_current_suggestion}</span>
              </button>
              <button
                type="button"
                onClick={() => set_sllm_suggestion_idx((prev) => (prev + 1) % current_active_prompt_list.length)}
                className="p-1 px-1.5 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition text-[11px] font-medium flex items-center gap-1 shrink-0"
                title="다른 추천 예시 보기"
              >
                <span>↻</span>
                <span className="text-[10px] hidden sm:inline">예시변경</span>
              </button>
            </div>
          )}
        </div>

        <div className="relative flex items-center">
          {/* 고스트 텍스트: 입력값이 비어있을 때 흐릿하게 예시 표시 */}
          {!current_prompt && sllm_current_suggestion && (
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-xs sm:text-sm text-slate-400 dark:text-slate-500 truncate select-none pr-56 z-0">
              <span className="truncate">{sllm_current_suggestion}</span>
            </div>
          )}

          <input
            type="text"
            value={current_prompt}
            onChange={(e) => {
              set_current_prompt(e.target.value);
              set_workflow_step(0);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Tab') {
                if (sllm_current_suggestion && current_prompt !== sllm_current_suggestion) {
                  e.preventDefault();
                  set_current_prompt(sllm_current_suggestion);
                  set_workflow_step(0);
                }
              } else if (e.key === 'Enter') {
                if (active_view_tab === 'compare' && !is_comparing) {
                  handle_execute_compare();
                } else if (active_view_tab === 'single' && !is_running) {
                  handle_execute_workflow();
                }
              }
            }}
            placeholder={
              sllm_current_suggestion
                ? ''
                : active_feature_tab === 'business_plan'
                ? '사업계획서 작성 주제 또는 분석하고자 하는 공공보건 지침을 입력하세요...'
                : '공공보건의료 지침, 법령 요건, 보조금 규정 등 궁금한 점을 자유롭게 질문하세요...'
            }
            className="zone-input-box w-full pl-4 pr-56 py-3.5 text-xs sm:text-sm rounded-2xl transition relative z-10 bg-transparent"
          />

          {/* 인라인 Tab 자동완성 칩 */}
          {sllm_current_suggestion && current_prompt !== sllm_current_suggestion && (
            <button
              type="button"
              tabIndex={-1}
              onClick={() => {
                set_current_prompt(sllm_current_suggestion);
                set_workflow_step(0);
              }}
              className="absolute right-40 z-20 hidden md:flex items-center gap-1 px-2 py-1 text-[10px] font-bold bg-slate-100 dark:bg-slate-800 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-slate-600 hover:text-indigo-700 dark:text-slate-300 dark:hover:text-indigo-200 rounded-lg border border-slate-200 dark:border-slate-700 transition shadow-2xs select-none cursor-pointer"
              title="클릭하거나 Tab 키를 누르면 자동 입력됩니다"
            >
              <span className="font-mono bg-white dark:bg-slate-900 px-1 rounded text-indigo-600 dark:text-indigo-400">Tab ↹</span>
              <span>자동완성</span>
            </button>
          )}

          <button
            onClick={active_view_tab === 'compare' ? handle_execute_compare : handle_execute_workflow}
            disabled={is_running || is_comparing || !current_prompt.trim()}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-[#0071e3] hover:bg-[#0077ed] text-white shadow-apple-sm transition active:scale-95 disabled:opacity-60 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>
              {active_view_tab === 'compare'
                ? is_comparing
                  ? '듀얼 추론 중...'
                  : active_feature_tab === 'business_plan'
                  ? '📋 1:1 사업계획서 비교'
                  : '💬 1:1 질의응답 비교'
                : is_running
                ? '생성 중...'
                : 'RAG 실행'}
            </span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 6. [1:1 비교 스튜디오 뷰] */}
      {/* ========================================================= */}
      {active_view_tab === 'compare' && (
        <div className="space-y-4 animate-in fade-in duration-300">

          {/* 2열 Split-View 그리드 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
            {/* 좌측: Google Gemini (외부 클라우드 LLM) */}
            <div className="bg-[#fbfbfd] dark:bg-[#1c1c1e] p-5 rounded-2xl border-2 border-[#0071e3]/30 dark:border-[#0071e3]/50 shadow-apple-sm flex flex-col justify-between space-y-3 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#0071e3] to-[#2997ff]" />
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-black/[0.05] dark:border-white/[0.08]">
                  <div className="flex items-center space-x-2">
                    <div className="w-7 h-7 rounded-lg bg-[#0071e3]/10 dark:bg-[#0071e3]/20 text-[#0071e3] dark:text-[#2997ff] flex items-center justify-center shrink-0">
                      <Globe className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="zone-badge-result">📊 AI 생성 결과</span>
                        <span className="text-xs font-bold text-[#1d1d1f] dark:text-white">
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
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-[#0071e3]/10 dark:bg-[#0071e3]/20 text-[#0071e3] dark:text-[#2997ff]">
                            외부 클라우드 API
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-[#86868b] dark:text-slate-400">
                        {compare_result?.google_gemini.is_live
                          ? `✓ 가용 모델 자동 검증 완료 (성공: ${compare_result.google_gemini.success_model || 'Gemini'})`
                          : '가용 모델 순차 자동 시도 (Flash Latest ➔ 2.5 Flash ➔ 2.5 Pro)'}
                      </span>
                    </div>
                  </div>

                  {compare_result && (
                    <button
                      onClick={() => handle_copy_text(compare_result.google_gemini.response, 'gemini')}
                      className="p-1.5 rounded-lg hover:bg-slate-200/60 dark:hover:bg-white/10 text-slate-600 dark:text-slate-400 transition"
                      title="답변 복사"
                    >
                      {copied_side === 'gemini' ? <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  )}
                </div>

                {/* Gemini 전용 RAG 주입 건수 선택기 & 전달 내용 보기 */}
                <div className="mt-3 p-3 bg-blue-50/80 dark:bg-blue-950/30 rounded-2xl border border-blue-200/80 dark:border-blue-800/50 space-y-2 text-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 font-bold text-blue-950 dark:text-blue-200 flex-wrap">
                      <span className="zone-badge-select">🎯 옵션 선택</span>
                      <Database className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      <span>RAG 근거 주입 건수:</span>
                      <div className="flex items-center gap-1 bg-white dark:bg-[#252528] p-0.5 rounded-lg border border-blue-200 dark:border-blue-900/60 shadow-xs">
                        {[1, 2, 3, 4, 5, 6].map((num) => (
                          <button
                            key={num}
                            type="button"
                            onClick={() => set_gemini_rag_count(num)}
                            className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition ${
                              gemini_rag_count === num
                                ? 'bg-[#0071e3] text-white shadow-xs'
                                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10'
                            }`}
                          >
                            {num}건
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => set_show_gemini_rag_details(!show_gemini_rag_details)}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0071e3] dark:text-[#2997ff] hover:underline bg-white dark:bg-[#252528] px-2.5 py-1 rounded-lg border border-blue-200 dark:border-blue-900/60 shadow-xs transition"
                    >
                      <BookOpen className="w-3 h-3" />
                      <span>{show_gemini_rag_details ? '주입 내용 접기 ▲' : `전달된 내용 (${gemini_rag_count}건) 보기 ▼`}</span>
                    </button>
                  </div>

                  {/* 실제 Gemini에 전달된 RAG 조항 내용 각각 표시 */}
                  {show_gemini_rag_details && rag_result && (
                    <div className="pt-2 border-t border-blue-200/60 dark:border-blue-800/50 space-y-1.5 max-h-52 overflow-y-auto animate-in fade-in duration-150">
                      <div className="text-[10px] text-blue-800 dark:text-blue-300 font-semibold flex items-center justify-between">
                        <span>📌 Gemini 프롬프트에 실제로 주입된 RAG 조항 ({gemini_rag_count}건):</span>
                      </div>
                      {rag_result.검색된_청크목록.slice(0, gemini_rag_count).map((item, idx) => (
                        <div key={idx} className="p-2.5 bg-white dark:bg-[#242428] rounded-xl border border-blue-100 dark:border-blue-900/40 text-[10px] space-y-1 shadow-xs">
                          <div className="flex items-center justify-between font-bold text-blue-900 dark:text-blue-200">
                            <div className="flex items-center gap-1 truncate max-w-[220px]">
                              {item.청크.사용자추가여부 && (
                                <span className="shrink-0 px-1 py-0.2 rounded text-[9px] font-extrabold bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300">
                                  직접등록
                                </span>
                              )}
                              <span className="truncate">{idx + 1}. {item.청크.문서명}</span>
                            </div>
                            <span className="shrink-0 text-[9px] bg-blue-50 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300 px-1.5 py-0.5 rounded font-bold">
                              일치도 {item.유사도_점수}%
                            </span>
                          </div>
                          <div className="text-slate-400 dark:text-slate-500 font-medium">{item.청크.조항_페이지}</div>
                          <div className="text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">{item.청크.본문}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* API 키 미등록 시 직관적인 입력 유도 배너 */}
                {!google_api_key && (
                  <div className="mt-2.5 p-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 rounded-xl flex items-center justify-between text-[11px] text-amber-900 dark:text-amber-200">
                    <div className="flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
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
                    <div className="py-12 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 space-y-2">
                      <div className="w-6 h-6 border-2 border-[#0071e3] border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                        가용 모델 순차 검증 및 추론 중...
                      </span>
                      <span className="text-[11px] text-slate-400 dark:text-slate-500">
                        (Gemini Flash ➔ 2.5 Flash ➔ 2.5 Pro 순차 시도)
                      </span>
                    </div>
                  ) : compare_result ? (
                    <div className="zone-info-box border-l-4 border-l-[#0071e3] rounded-xl p-3 bg-white dark:bg-[#121214]">
                      <div className="flex items-center justify-between mb-2">
                        <span className="zone-badge-info">💡 Gemini 클라우드 답변</span>
                        <span className="text-[10px] text-slate-400">읽기 전용 보고서</span>
                      </div>
                      <pre className="text-xs font-mono text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed max-h-[360px] overflow-y-auto">
                        {compare_result.google_gemini.response}
                      </pre>
                    </div>
                  ) : (
                    <div className="zone-info-box border-l-4 border-l-[#0071e3]/40 p-8 text-center text-slate-400 dark:text-slate-500 text-xs">
                      [{active_feature_tab === 'business_plan' ? '1:1 사업계획서 비교' : '1:1 질의응답 비교'}] 버튼을 누르면 구글 Gemini의 가용 모델을 순차 시도하여 최적 모델로 분석합니다.
                    </div>
                  )}
                </div>
              </div>

              {/* 하단 스펙 요약 바 */}
              <div className="pt-2 border-t border-black/[0.05] dark:border-white/[0.08] grid grid-cols-3 gap-2 text-[11px]">
                <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                  <Clock className="w-3.5 h-3.5 text-[#0071e3] dark:text-[#2997ff]" />
                  <span>지연시간: <strong className="text-slate-800 dark:text-slate-200">{compare_result?.google_gemini.elapsed_ms ? `${compare_result.google_gemini.elapsed_ms}ms` : '-'}</strong></span>
                </div>
                <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                  <Coins className="w-3.5 h-3.5 text-amber-500" />
                  <span>비용: <strong className="text-slate-800 dark:text-slate-200">종량제 과금</strong></span>
                </div>
                <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                  <ShieldAlert className="w-3.5 h-3.5 text-blue-500" />
                  <span>망분리: <strong className="text-slate-800 dark:text-slate-200">외부망 통신</strong></span>
                </div>
              </div>
            </div>

            {/* 우측: 노트북 로컬 sLLM (On-Device) */}
            <div className="bg-[#fbfbfd] dark:bg-[#1c1c1e] p-5 rounded-2xl border-2 border-[#34c759]/40 dark:border-[#34c759]/50 shadow-apple-sm flex flex-col justify-between space-y-3 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#34c759] to-[#30d158]" />
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-black/[0.05] dark:border-white/[0.08]">
                  <div className="flex items-center space-x-2">
                    <div className="w-7 h-7 rounded-lg bg-[#34c759]/10 dark:bg-[#34c759]/20 text-[#34c759] dark:text-[#30d158] flex items-center justify-center shrink-0">
                      <Laptop className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="zone-badge-result">📊 AI 생성 결과</span>
                        <span className="text-xs font-bold text-[#1d1d1f] dark:text-white">Qwen2.5-0.5B-Instruct</span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-[#34c759]/15 text-[#248a3d] dark:bg-[#34c759]/25 dark:text-[#30d158]">
                          노트북 On-Device sLLM
                        </span>
                      </div>
                      <span className="text-[10px] text-[#86868b] dark:text-slate-400">
                        원내 폐쇄망 보안 특화 / 환자 개인정보 유출 원천 차단
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {local_server_status?.is_running ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-700">
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
                        className="p-1.5 rounded-lg hover:bg-slate-200/60 dark:hover:bg-white/10 text-slate-600 dark:text-slate-400 transition"
                        title="답변 복사"
                      >
                        {copied_side === 'local' ? <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    )}
                  </div>
                </div>

                {/* 로컬 sLLM 전용 RAG 주입 건수 선택기 & 전달 내용 보기 */}
                <div className="mt-3 p-3 bg-emerald-50/80 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200/80 dark:border-emerald-800/50 space-y-2 text-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-950 dark:text-emerald-200 flex-wrap">
                      <span className="zone-badge-select">🎯 옵션 선택</span>
                      <Database className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>RAG 근거 주입 건수:</span>
                      <div className="flex items-center gap-1 bg-white dark:bg-[#252528] p-0.5 rounded-lg border border-emerald-200 dark:border-emerald-900/60 shadow-xs">
                        {[1, 2, 3, 4].map((num) => (
                          <button
                            key={num}
                            type="button"
                            onClick={() => set_local_rag_count(num)}
                            className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition ${
                              local_rag_count === num
                                ? 'bg-[#34c759] text-white shadow-xs'
                                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10'
                            }`}
                          >
                            {num}건
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => set_show_local_rag_details(!show_local_rag_details)}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-[#30d158] hover:underline bg-white dark:bg-[#252528] px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-900/60 shadow-xs transition"
                    >
                      <BookOpen className="w-3 h-3" />
                      <span>{show_local_rag_details ? '주입 내용 접기 ▲' : `전달된 내용 (${local_rag_count}건) 보기 ▼`}</span>
                    </button>
                  </div>

                  {/* 실제 로컬 sLLM에 전달된 RAG 조항 내용 각각 표시 */}
                  {show_local_rag_details && rag_result && (
                    <div className="pt-2 border-t border-emerald-200/60 dark:border-emerald-800/50 space-y-1.5 max-h-52 overflow-y-auto animate-in fade-in duration-150">
                      <div className="text-[10px] text-emerald-800 dark:text-emerald-300 font-semibold flex items-center justify-between">
                        <span>📌 로컬 sLLM 엔진에 실제로 주입된 RAG 조항 ({local_rag_count}건):</span>
                      </div>
                      {rag_result.검색된_청크목록.slice(0, local_rag_count).map((item, idx) => (
                        <div key={idx} className="p-2.5 bg-white dark:bg-[#242428] rounded-xl border border-emerald-100 dark:border-emerald-900/40 text-[10px] space-y-1 shadow-xs">
                          <div className="flex items-center justify-between font-bold text-emerald-900 dark:text-emerald-200">
                            <div className="flex items-center gap-1 truncate max-w-[220px]">
                              {item.청크.사용자추가여부 && (
                                <span className="shrink-0 px-1 py-0.2 rounded text-[9px] font-extrabold bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300">
                                  직접등록
                                </span>
                              )}
                              <span className="truncate">{idx + 1}. {item.청크.문서명}</span>
                            </div>
                            <span className="shrink-0 text-[9px] bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 px-1.5 py-0.5 rounded font-bold">
                              일치도 {item.유사도_점수}%
                            </span>
                          </div>
                          <div className="text-slate-400 dark:text-slate-500 font-medium">{item.청크.조항_페이지}</div>
                          <div className="text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">{item.청크.본문}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 본문 */}
                <div className="mt-3">
                  {is_comparing ? (
                    <div className="py-12 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 space-y-2">
                      <div className="w-6 h-6 border-2 border-[#34c759] border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs text-slate-600 dark:text-slate-300">노트북 로컬 sLLM 엔진 추론 중...</span>
                    </div>
                  ) : compare_result ? (
                    <div className="zone-info-box border-l-4 border-l-[#34c759] rounded-xl p-3 bg-white dark:bg-[#121214]">
                      <div className="flex items-center justify-between mb-2">
                        {compare_result.local_sllm.is_live ? (
                          <span className="zone-badge-info">💡 온디바이스 로컬 sLLM 답변</span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800">
                            📋 사전 작성 템플릿 (로컬 sLLM 미연결 · AI 미사용)
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400">{compare_result.local_sllm.model}</span>
                      </div>
                      <pre className="text-xs font-mono text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed max-h-[360px] overflow-y-auto">
                        {compare_result.local_sllm.response}
                      </pre>
                    </div>
                  ) : (
                    <div className="zone-info-box border-l-4 border-l-[#34c759]/40 py-10 flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 text-xs space-y-3">
                      <Laptop className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                      <p className="text-center text-slate-500 dark:text-slate-400 max-w-xs">
                        {local_server_status?.is_running
                          ? `로컬 온디바이스 엔진(8000번 포트)이 정상 가동 중입니다. 상단의 [${active_feature_tab === 'business_plan' ? '1:1 사업계획서 비교' : '1:1 질의응답 비교'}] 버튼을 눌러보세요.`
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
              <div className="pt-2 border-t border-black/[0.05] dark:border-white/[0.08] grid grid-cols-3 gap-2 text-[11px]">
                <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                  <Clock className="w-3.5 h-3.5 text-[#34c759]" />
                  <span>지연시간: <strong className="text-slate-800 dark:text-slate-200">{compare_result?.local_sllm.elapsed_ms ? `${compare_result.local_sllm.elapsed_ms}ms` : '-'}</strong></span>
                </div>
                <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                  <Coins className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>비용: <strong className="text-slate-800 dark:text-slate-200">무제한 0원</strong></span>
                </div>
                <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>보안: <strong className="text-slate-800 dark:text-slate-200">폐쇄망 100%</strong></span>
                </div>
              </div>
            </div>
          </div>

          {/* 하단 비교 분석 종합 요약표 */}
          {compare_result && (
            <div className="bg-slate-50 dark:bg-[#1c1c1e] p-4 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-100">
                <Zap className="w-4 h-4 text-amber-500" />
                <span>공공의료 AI 구축 관점 비교 분석 평가</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-[11px] text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-white/[0.08] text-slate-500 dark:text-slate-400 font-semibold">
                      <th className="py-1.5 px-3">비교 항목</th>
                      <th className="py-1.5 px-3 text-[#0071e3] dark:text-[#2997ff]">🌐 외부 LLM (Google Gemini)</th>
                      <th className="py-1.5 px-3 text-[#248a3d] dark:text-[#30d158]">💻 로컬 sLLM (On-Device Qwen)</th>
                      <th className="py-1.5 px-3">공공의료 추천 적용 영역</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/60 dark:divide-white/[0.06] text-slate-700 dark:text-slate-300">
                    <tr>
                      <td className="py-2 px-3 font-semibold">데이터 보안성</td>
                      <td className="py-2 px-3">외부 클라우드 전송 (개인식별정보 마스킹 필수)</td>
                      <td className="py-2 px-3 text-emerald-700 dark:text-emerald-400 font-semibold">원내 폐쇄망 완벽 보호 (데이터 유출 0%)</td>
                      <td className="py-2 px-3"><strong className="text-slate-900 dark:text-slate-100">환자 전자의무기록(EMR), 비식별 진료 데이터</strong>는 로컬 sLLM 필수</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-semibold">운영 비용</td>
                      <td className="py-2 px-3">API 호출 건당 토큰 과금 발생</td>
                      <td className="py-2 px-3 text-emerald-700 dark:text-emerald-400 font-semibold">무제한 무료 (자체 서버/노트북 연산)</td>
                      <td className="py-2 px-3">대규모 단순 질의응답 및 일상 스크리닝 시 로컬 sLLM이 예산 절감</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-semibold">정책 문안 품질</td>
                      <td className="py-2 px-3 text-[#0071e3] dark:text-[#2997ff] font-semibold">복합 법령 조항 합성 및 종합 기획력 우수</td>
                      <td className="py-2 px-3">개조식 핵심 요약 및 정형화된 서술문 위주</td>
                      <td className="py-2 px-3"><strong className="text-slate-900 dark:text-slate-100">정부 국고보조금 제안서, 중장기 종합발전계획</strong>은 대형 LLM 추천</td>
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
          <div className="bg-[#f5f5f7] dark:bg-[#1c1c1e] p-4 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#86868b] dark:text-slate-400 uppercase tracking-wider block">
                Agentic AI Tool-Calling 파이프라인 (실제 경량 RAG 엔진 구동)
              </span>
              {rag_result && workflow_step === 3 && (
                <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                  실행 완료 ({rag_result.소요시간_ms}ms)
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Step 1: RAG */}
              <div
                className={`p-3 rounded-xl border transition-all ${
                  workflow_step >= 1
                    ? 'bg-white dark:bg-[#252528] border-[#0071e3] text-[#1d1d1f] dark:text-white shadow-apple-sm'
                    : 'bg-white/40 dark:bg-white/[0.04] border-black/[0.04] dark:border-white/[0.06] text-[#86868b] dark:text-slate-400'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Search className={`w-4 h-4 ${workflow_step >= 1 ? 'text-[#0071e3] dark:text-[#2997ff]' : 'text-[#86868b]'}`} />
                  <span className="text-xs font-bold">1. 하이브리드 RAG 검색</span>
                </div>
                <p className="text-[11px] text-[#86868b] dark:text-slate-400 mt-1 line-clamp-2">
                  {workflow_step >= 1 && rag_result
                    ? `${rag_result.검색된_청크목록[0]?.청크.문서명.slice(0, 20)}... (매칭률 ${rag_result.최고_유사도}%)`
                    : '지침 전문 코퍼스 대기 중...'}
                </p>
              </div>

              {/* Step 2: DW */}
              <div
                className={`p-3 rounded-xl border transition-all ${
                  workflow_step >= 2
                    ? 'bg-white dark:bg-[#252528] border-[#af52de] text-[#1d1d1f] dark:text-white shadow-apple-sm'
                    : 'bg-white/40 dark:bg-white/[0.04] border-black/[0.04] dark:border-white/[0.06] text-[#86868b] dark:text-slate-400'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Database className={`w-4 h-4 ${workflow_step >= 2 ? 'text-[#af52de]' : 'text-[#86868b]'}`} />
                  <span className="text-xs font-bold">2. 진료실적 DW 실시간 쿼리</span>
                </div>
                <p className="text-[11px] text-[#86868b] dark:text-slate-400 mt-1 line-clamp-2">
                  {workflow_step >= 2 && rag_result
                    ? `${rag_result.선택된_지역명} 응급/분만/병상 통계 추출 완료`
                    : '데이터웨어하우스 대기 중...'}
                </p>
              </div>

              {/* Step 3: Generator */}
              <div
                className={`p-3 rounded-xl border transition-all ${
                  workflow_step >= 3
                    ? 'bg-white dark:bg-[#252528] border-[#34c759] text-[#1d1d1f] dark:text-white shadow-apple-sm'
                    : 'bg-white/40 dark:bg-white/[0.04] border-black/[0.04] dark:border-white/[0.06] text-[#86868b] dark:text-slate-400'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <FileEdit className={`w-4 h-4 ${workflow_step >= 3 ? 'text-[#34c759] dark:text-[#30d158]' : 'text-[#86868b]'}`} />
                  <span className="text-xs font-bold">3. 근거 인용 초안 합성</span>
                </div>
                <p className="text-[11px] text-[#86868b] dark:text-slate-400 mt-1 line-clamp-2">
                  {workflow_step >= 3
                    ? '보건복지부 법정 고시 조항 인용 문안 완성'
                    : '증강 생성 대기 중...'}
                </p>
              </div>
            </div>
          </div>

          {/* 최종 생성 결과 보고서 카드 */}
          {(workflow_step === 3 || (!is_running && rag_result && workflow_step === 0)) && rag_result && (
            <div className="bg-[#fbfbfd] dark:bg-[#1c1c1e] p-5 rounded-2xl border border-black/[0.06] dark:border-white/[0.08] shadow-apple-sm space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-black/[0.05] dark:border-white/[0.08]">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-[#34c759] dark:text-[#30d158]" />
                  <span className="text-xs font-bold text-[#1d1d1f] dark:text-white">
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
                    className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-white dark:bg-[#252528] border border-black/[0.08] dark:border-white/[0.1] hover:bg-black/[0.02] dark:hover:bg-white/[0.06] text-[#1d1d1f] dark:text-white transition"
                  >
                    {is_copied ? <Check className="w-3.5 h-3.5 text-[#34c759] dark:text-[#30d158]" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{is_copied ? '복사됨' : '본문 복사'}</span>
                  </button>
                </div>
              </div>

              <pre className="text-xs sm:text-xs font-mono text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed bg-white dark:bg-[#121214] p-4 rounded-xl border border-black/[0.04] dark:border-white/[0.08] overflow-x-auto">
                {rag_result.생성된_답변}
              </pre>

              {/* 실제 RAG 검색된 근거 조항 (Top-3) 상세 뷰 */}
              <div className="border border-slate-200 dark:border-white/[0.08] rounded-xl overflow-hidden bg-white dark:bg-[#1c1c1e]">
                <button
                  onClick={() => set_show_sources(!show_sources)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#252528] hover:bg-slate-100 dark:hover:bg-[#2c2c2e] flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-200 transition"
                >
                  <div className="flex items-center space-x-2">
                    <BookOpen className="w-4 h-4 text-[#0071e3] dark:text-[#2997ff]" />
                    <span>실제 검색된 보건복지부 법정 고시 조항 ({rag_result.검색된_청크목록.length}건 발췌)</span>
                  </div>
                  {show_sources ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {show_sources && (
                  <div className="p-4 space-y-3 divide-y divide-slate-100 dark:divide-white/[0.06]">
                    {rag_result.검색된_청크목록.map((res, idx) => (
                      <div key={res.청크.id} className={`${idx > 0 ? 'pt-3' : ''} space-y-1`}>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            {idx + 1}. {res.청크.문서명}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#0071e3]/10 dark:bg-[#0071e3]/20 text-[#0071e3] dark:text-[#2997ff]">
                            유사도 {res.유사도_점수}%
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{res.청크.조항_페이지}</p>
                        <p className="text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-[#242428] p-2.5 rounded-lg border border-slate-200/60 dark:border-white/[0.06] leading-relaxed">
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
