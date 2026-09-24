'use client';

import React, { useState, useEffect } from 'react';
import { Database, X, Check, ExternalLink, ShieldCheck, Trash2, Globe } from 'lucide-react';
import { API키_불러오기, API키_기기저장_여부, API키_저장하기, API키_삭제하기 } from '@/lib/API키_저장소';

interface 공공데이터_api키_설정_모달_속성 {
  is_open: boolean;
  on_close: () => void;
  on_key_saved: (new_key: string) => void;
}

export const 공공데이터_api키_설정_모달: React.FC<공공데이터_api키_설정_모달_속성> = ({
  is_open,
  on_close,
  on_key_saved,
}) => {
  const [api_key, set_api_key] = useState('');
  const [is_saved, set_is_saved] = useState(false);
  const [remember_on_device, set_remember_on_device] = useState(false);

  useEffect(() => {
    set_api_key(API키_불러오기('data_go_kr_api_key'));
    set_remember_on_device(API키_기기저장_여부('data_go_kr_api_key'));
  }, [is_open]);

  if (!is_open) return null;

  const handle_save = () => {
    API키_저장하기('data_go_kr_api_key', api_key.trim(), remember_on_device);
    on_key_saved(api_key.trim());
    set_is_saved(true);
    setTimeout(() => {
      set_is_saved(false);
      on_close();
    }, 800);
  };

  const handle_clear = () => {
    API키_삭제하기('data_go_kr_api_key');
    set_api_key('');
    on_key_saved('');
  };

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#15161b] rounded-3xl shadow-2xl border border-black/[0.08] dark:border-white/10 w-full max-w-lg overflow-hidden flex flex-col">
        {/* 헤더 */}
        <div className="p-5 bg-gradient-to-r from-blue-900 to-indigo-950 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center border border-blue-400/30">
              <Database className="w-5 h-5 text-blue-300" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-1.5">
                <span>공공데이터포털(data.go.kr) API 키</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-500/30 text-blue-200">
                  OpenAPI
                </span>
              </h3>
              <p className="text-xs text-white/70">
                국립중앙의료원 및 보건의료빅데이터 실시간 공공데이터 연동
              </p>
            </div>
          </div>

          <button
            onClick={on_close}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 본문 */}
        <div className="p-6 space-y-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-[#1d1d1f] dark:text-slate-200">
                공공데이터포털 일반 인증키 (ServiceKey)
              </label>
              <a
                href="https://www.data.go.kr"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-[#0071e3] dark:text-blue-400 hover:underline flex items-center gap-1 font-bold"
              >
                <span>data.go.kr 바로가기</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="relative">
              <input
                type="password"
                value={api_key}
                onChange={(e) => set_api_key(e.target.value)}
                placeholder="일반 인증키(Encoding 또는 Decoding)를 입력하세요..."
                className="w-full px-3.5 py-3 bg-[#f5f5f7] dark:bg-[#1e2027] border border-black/[0.08] dark:border-white/10 rounded-xl text-sm font-mono text-[#1d1d1f] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0071e3]/40 transition"
              />
            </div>
            <p className="text-xs text-[#86868b] dark:text-slate-400 leading-relaxed">
              공공데이터포털 마이페이지의 <strong>[개발계정 상세보기]</strong>에서 발급된 <strong>일반 인증키 (Decoding 또는 Encoding)</strong>를 그대로 복사하여 붙여넣으시면 됩니다.
            </p>
          </div>

          {/* 주요 연동 공공데이터 목록 안내 */}
          <div className="p-3.5 bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-800/40 rounded-2xl space-y-2 text-xs text-blue-900 dark:text-blue-200">
            <div className="font-bold flex items-center gap-1.5 text-blue-800 dark:text-blue-300">
              <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
              <span>연동 대상 국립중앙의료원 공공 OpenAPI</span>
            </div>
            <ul className="list-disc pl-4 space-y-1 text-slate-700 dark:text-slate-300">
              <li>국립중앙의료원 전국 응급의료기관 정보 조회 서비스</li>
              <li>중증응급환자 실시간 병상 및 가용자원 정보</li>
              <li>건강보험심사평가원 전국 병·의원 및 약국 기본정보</li>
              <li>시·군·구 행정구역별 보건인프라 통계 데이터</li>
            </ul>
          </div>

          <label className="flex items-start gap-2 cursor-pointer select-none text-xs text-[#1d1d1f] dark:text-slate-300">
            <input
              type="checkbox"
              checked={remember_on_device}
              onChange={(e) => set_remember_on_device(e.target.checked)}
              className="mt-0.5 accent-[#0071e3]"
            />
            <span>
              <strong>이 기기에 저장</strong> — 체크하지 않으면 브라우저 탭을 닫을 때 키가 자동 삭제됩니다. 공용 PC에서는 체크하지 마세요.
            </span>
          </label>

          {/* 보안 안내 */}
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/40 rounded-xl flex items-start gap-2 text-emerald-800 dark:text-emerald-300 text-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <p>
              <strong>보안 안내:</strong> 등록하신 인증키는 서버에 저장되지 않으며, 조회 시에만 요청 헤더로 플랫폼 서버를 거쳐 공공데이터포털에 전달됩니다. 키는 본인 브라우저에만 보관되며, 기본적으로 탭을 닫으면 삭제됩니다.
            </p>
          </div>
        </div>

        {/* 푸터 */}
        <div className="p-4 bg-slate-50 dark:bg-[#1a1b22] border-t border-black/[0.05] dark:border-white/10 flex items-center justify-between">
          <button
            onClick={handle_clear}
            className="text-xs text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 px-3 py-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
          >
            <Trash2 className="w-4 h-4" />
            <span>키 삭제</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={on_close}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition"
            >
              닫기
            </button>
            <button
              onClick={handle_save}
              className={`px-4 py-2 rounded-xl text-sm font-bold text-white flex items-center gap-1.5 shadow-apple-sm transition ${
                is_saved ? 'bg-[#34c759]' : 'bg-[#0071e3] hover:bg-[#0077ed]'
              }`}
            >
              {is_saved ? (
                <>
                  <Check className="w-4 h-4" />
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
