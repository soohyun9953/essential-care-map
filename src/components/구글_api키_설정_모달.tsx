'use client';

import React, { useState, useEffect } from 'react';
import { Key, X, Check, ExternalLink, ShieldCheck, Trash2, Sparkles } from 'lucide-react';

interface 구글_api키_설정_모달_속성 {
  is_open: boolean;
  on_close: () => void;
  on_key_saved: (new_key: string) => void;
}

export const 구글_api키_설정_모달: React.FC<구글_api키_설정_모달_속성> = ({
  is_open,
  on_close,
  on_key_saved,
}) => {
  const [api_key, set_api_key] = useState('');
  const [is_saved, set_is_saved] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('google_gemini_api_key') || '';
      set_api_key(saved);
    }
  }, [is_open]);

  if (!is_open) return null;

  const handle_save = () => {
    const clean_keys = api_key
      .split(/[\n,;]+/)
      .map((k) => k.trim().replace(/^["']|["']$/g, ''))
      .filter(Boolean)
      .join(', ');

    if (typeof window !== 'undefined') {
      if (clean_keys) {
        localStorage.setItem('google_gemini_api_key', clean_keys);
      } else {
        localStorage.removeItem('google_gemini_api_key');
      }
    }
    on_key_saved(clean_keys);
    set_is_saved(true);
    setTimeout(() => {
      set_is_saved(false);
      on_close();
    }, 800);
  };

  const handle_clear = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('google_gemini_api_key');
    }
    set_api_key('');
    on_key_saved('');
  };

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#161618] rounded-3xl shadow-2xl border border-black/[0.08] dark:border-white/[0.1] w-full max-w-lg overflow-hidden flex flex-col">
        {/* 헤더 */}
        <div className="p-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-[#0071e3]/20 text-[#0071e3] flex items-center justify-center border border-[#0071e3]/30">
              <Key className="w-4 h-4 text-[#0071e3]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>Google Gemini API 키 설정</span>
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              </h3>
              <p className="text-[11px] text-white/70">
                실제 외부 LLM(Google Gemini 2.5 Flash) 실시간 호출 연동
              </p>
            </div>
          </div>

          <button
            onClick={on_close}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 본문 */}
        <div className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#1d1d1f] dark:text-white flex items-center justify-between">
              <span>Google AI Studio API Key</span>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-[#0071e3] dark:text-[#2997ff] hover:underline flex items-center gap-1 font-semibold"
              >
                <span>무료 키 발급받기</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </label>
            <div className="relative">
              <input
                type="password"
                value={api_key}
                onChange={(e) => set_api_key(e.target.value)}
                placeholder="AIzaSy... (복수 키는 콤마나 줄바꿈으로 구분)"
                className="w-full px-3.5 py-2.5 bg-[#f5f5f7] dark:bg-[#1c1c1e] border border-black/[0.08] dark:border-white/[0.1] rounded-xl text-xs font-mono text-[#1d1d1f] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0071e3]/40 transition"
              />
            </div>
            <div className="flex items-center justify-between text-[11px] pt-1">
              <span className="text-[#86868b] dark:text-slate-400">
                단일 키 또는 복수 키(Multi-Key, 콤마 구분) 등록 시 자동 로드밸런싱
              </span>
              {api_key.split(/[\n,;]+/).map((k) => k.trim()).filter(Boolean).length > 0 ? (
                <span className="font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800 shrink-0">
                  {api_key.split(/[\n,;]+/).map((k) => k.trim()).filter(Boolean).length}개 키 등록됨
                </span>
              ) : (
                <span className="text-slate-400 dark:text-slate-500 shrink-0">키 미등록</span>
              )}
            </div>
            <p className="text-[11px] text-[#86868b] dark:text-slate-400 leading-relaxed">
              Google AI Studio에서 발급받은 무료 API 키를 입력하시면, 질문 시 구글의 최신 <strong>Gemini 2.5 Flash</strong> 모델이 실제 실시간으로 답변을 생성합니다.
            </p>
          </div>

          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/50 rounded-xl flex items-start gap-2 text-emerald-800 dark:text-emerald-300 text-[11px]">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p>
              <strong>보안 안심:</strong> 입력하신 API 키는 외부 서버로 절대 수집되거나 저장되지 않으며, 오직 본인 컴퓨터 브라우저의 <strong>LocalStorage</strong>에만 안전하게 보관됩니다.
            </p>
          </div>
        </div>

        {/* 푸터 */}
        <div className="p-4 bg-slate-50 dark:bg-[#161618] border-t border-black/[0.05] dark:border-white/[0.08] flex items-center justify-between">
          <button
            onClick={handle_clear}
            className="text-xs text-rose-600 hover:text-rose-700 dark:text-rose-400 font-semibold flex items-center gap-1 px-3 py-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>키 삭제</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={on_close}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-white/10 transition"
            >
              취소
            </button>
            <button
              onClick={handle_save}
              className={`px-4 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 shadow-apple-sm transition ${
                is_saved ? 'bg-[#34c759]' : 'bg-[#0071e3] hover:bg-[#0077ed]'
              }`}
            >
              {is_saved ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>저장 완료!</span>
                </>
              ) : (
                <span>저장하고 적용하기</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
