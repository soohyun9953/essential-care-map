'use client';

// Essential Care Map - 로컬 LLM vs Google Gemini 듀얼 AI 비교 모달
// 우측 상단 관리자 메뉴 및 관리자 대시보드에서 즉시 팝업하여 로컬 sLLM과 클라우드 Gemini의
// 답변 속도, 비용, 보안성, 지침 준수도(RAG)를 1:1로 비교 분석하는 전용 창

import React, { useEffect } from 'react';
import {
  X,
  Bot,
  ExternalLink,
  ShieldCheck,
  Zap,
  Sparkles,
  Laptop,
} from 'lucide-react';
import { 필수의료_진단_결과 } from '@/lib/필수의료_타입';
import { 공공의료_sLLM_업무비서 } from './공공의료_sLLM_업무비서';

interface 로컬_LLM_제미나이_비교_모달_속성 {
  is_open: boolean;
  on_close: () => void;
  selected_region?: 필수의료_진단_결과 | null;
  on_navigate_ai_workspace?: () => void;
}

export const 로컬_LLM_제미나이_비교_모달: React.FC<로컬_LLM_제미나이_비교_모달_속성> = ({
  is_open,
  on_close,
  selected_region = null,
  on_navigate_ai_workspace,
}) => {
  // ESC 키 닫기
  useEffect(() => {
    const handle_keydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && is_open) {
        on_close();
      }
    };
    window.addEventListener('keydown', handle_keydown);
    return () => window.removeEventListener('keydown', handle_keydown);
  }, [is_open, on_close]);

  if (!is_open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-7xl h-[92vh] max-h-[96vh] bg-white dark:bg-[#15161b] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col">
        {/* 모달 상단 헤더 */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-purple-500/20">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-slate-900 dark:text-white">
                  로컬 LLM vs Google Gemini 듀얼 AI 비교 스튜디오
                </h2>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                  Dual AI Studio
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  <ShieldCheck className="w-3 h-3" />
                  <span>원내 폐쇄망 보안 vs 클라우드</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                클라우드 파운데이션 모델(Gemini 2.5 Flash)과 온프레미스 경량화 모델(Local sLLM / Qwen2.5)의 응답 품질·속도·보안성을 1:1로 비교합니다.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {on_navigate_ai_workspace && (
              <button
                type="button"
                onClick={() => {
                  on_navigate_ai_workspace();
                  on_close();
                }}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition cursor-pointer"
                title="AI 분석 전체 워크스페이스 화면으로 전환"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>전체 화면으로 전환</span>
              </button>
            )}
            <button
              type="button"
              onClick={on_close}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              title="닫기 (ESC)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 모달 본문 (비교 스튜디오 임베드) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/40 dark:bg-slate-900/40">
          <공공의료_sLLM_업무비서 selected_region={selected_region} />
        </div>
      </div>
    </div>
  );
};
