'use client';

// 카카오 지도 Web API 키 설정 및 가이드 모달
// 카카오 개발자 센터(developers.kakao.com) JavaScript 키 발급 및 Web 도메인 등록 안내 포함

import React, { useState, useEffect } from 'react';
import { Key, X, Check, ExternalLink, ShieldCheck, Trash2, MapPin, AlertCircle, Copy } from 'lucide-react';
import { API키_불러오기, API키_기기저장_여부, API키_저장하기, API키_삭제하기 } from '@/lib/API키_저장소';
import { resetKakaoMapLoader } from '@/lib/카카오_지도_로더';

interface 카카오_api키_설정_모달_속성 {
  is_open: boolean;
  on_close: () => void;
  on_key_saved?: (new_key: string) => void;
}

export const 카카오_api키_설정_모달: React.FC<카카오_api키_설정_모달_속성> = ({
  is_open,
  on_close,
  on_key_saved,
}) => {
  const [api_key, set_api_key] = useState('');
  const [is_saved, set_is_saved] = useState(false);
  const [remember_on_device, set_remember_on_device] = useState(false);
  const [copied_domain, set_copied_domain] = useState(false);

  useEffect(() => {
    if (!is_open) return;
    const key = API키_불러오기('kakao_map_api_key') || process.env.NEXT_PUBLIC_KAKAO_MAP_KEY || '';
    set_api_key(key);
    set_remember_on_device(API키_기기저장_여부('kakao_map_api_key'));
    set_is_saved(false);
  }, [is_open]);

  if (!is_open) return null;

  const handle_save = (e: React.FormEvent) => {
    e.preventDefault();
    const clean_key = api_key.trim();
    API키_저장하기('kakao_map_api_key', clean_key, remember_on_device);
    resetKakaoMapLoader();
    set_is_saved(true);
    on_key_saved?.(clean_key);
    setTimeout(() => {
      set_is_saved(false);
      on_close();
    }, 900);
  };

  const handle_delete = () => {
    API키_삭제하기('kakao_map_api_key');
    resetKakaoMapLoader();
    set_api_key('');
    set_remember_on_device(false);
    on_key_saved?.('');
    on_close();
  };

  const currentDomain =
    typeof window !== 'undefined'
      ? `${window.location.protocol}//${window.location.host}`
      : 'http://localhost:3000';

  const copy_domain_to_clipboard = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(currentDomain);
      set_copied_domain(true);
      setTimeout(() => set_copied_domain(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg bg-white dark:bg-[#15161b] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col">
        {/* 헤더 */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-amber-50/50 dark:bg-amber-950/20">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-amber-400 text-slate-900 flex items-center justify-center font-black">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>카카오맵 Web API 연결 설정</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-900 dark:text-amber-300">
                  JavaScript 키
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                카카오 지도 공식 SDK로 고품질 국내 GIS 지도를 렌더링합니다
              </p>
            </div>
          </div>
          <button
            onClick={on_close}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 바디 */}
        <form onSubmit={handle_save} className="p-6 space-y-5 text-xs">
          {/* 가이드 카드 */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2.5">
            <div className="font-bold text-slate-900 dark:text-white flex items-center justify-between">
              <span>카카오 개발자 센터 발급 및 등록 가이드</span>
              <a
                href="https://developers.kakao.com/console/app"
                target="_blank"
                rel="noreferrer"
                className="text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 font-semibold text-[11px]"
              >
                <span>Kakao Developers 콘솔</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <ol className="list-decimal list-inside space-y-1.5 text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
              <li>
                <strong>애플리케이션 추가</strong> 후 [앱 설정] &gt; [앱 키]에서 <span className="text-amber-600 dark:text-amber-400 font-bold">JavaScript 키</span> 복사
              </li>
              <li>
                [앱 설정] &gt; [플랫폼] &gt; <strong>[Web]</strong> 클릭 후 <strong>사이트 도메인</strong> 등록:
                <div className="mt-1 flex items-center gap-2 bg-white dark:bg-slate-800 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
                  <code className="text-blue-600 dark:text-blue-400 font-mono font-bold flex-1">
                    {currentDomain}
                  </code>
                  <button
                    type="button"
                    onClick={copy_domain_to_clipboard}
                    className="text-[10px] text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 cursor-pointer"
                  >
                    {copied_domain ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    <span>{copied_domain ? '복사됨' : '복사'}</span>
                  </button>
                </div>
              </li>
              <li>복사한 JavaScript 키를 아래 입력창에 붙여넣고 저장합니다.</li>
            </ol>
          </div>

          {/* 키 입력 영역 */}
          <div className="space-y-2">
            <label className="font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
              <span>카카오 JavaScript 키</span>
              {process.env.NEXT_PUBLIC_KAKAO_MAP_KEY && (
                <span className="text-[10px] text-blue-600 dark:text-blue-400 font-normal">
                  (.env.local 기본값 감지됨)
                </span>
              )}
            </label>
            <div className="relative">
              <input
                type="text"
                value={api_key}
                onChange={(e) => set_api_key(e.target.value)}
                placeholder="예: 7a8b9c... (32자리 카카오 JavaScript 앱 키)"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
            <p className="text-[11px] text-slate-400">
              * REST API 키가 아닌 <strong>JavaScript 키</strong>를 입력해야 합니다.
            </p>
          </div>

          {/* 기기 저장 체크박스 */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="remember_kakao_key"
              checked={remember_on_device}
              onChange={(e) => set_remember_on_device(e.target.checked)}
              className="rounded border-slate-300 text-amber-500 focus:ring-amber-400"
            />
            <label htmlFor="remember_kakao_key" className="text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
              이 기기에 안전하게 영구 저장 (localStorage)
            </label>
          </div>

          {/* 푸터 액션 */}
          <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
            {api_key ? (
              <button
                type="button"
                onClick={handle_delete}
                className="px-3 py-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>키 삭제</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={on_close}
                className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer font-semibold text-xs"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={is_saved}
                className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold transition cursor-pointer flex items-center gap-1.5 text-xs shadow-sm"
              >
                {is_saved ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>저장 완료!</span>
                  </>
                ) : (
                  <>
                    <Key className="w-3.5 h-3.5" />
                    <span>저장 및 연결</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
