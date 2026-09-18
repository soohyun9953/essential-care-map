'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Activity,
  Search,
  Bell,
  User,
  ChevronDown,
  ShieldCheck,
  Download,
  Upload,
  Key,
  Database,
  Moon,
  Sun,
} from 'lucide-react';

export type 메인_도메인 =
  | 'status_diag'    // 1. 현황진단
  | 'ai_analysis'    // 2. AI 분석
  | 'policy_plan'    // 3. 정책기획
  | 'field_manage'   // 4. 현장관리
  | 'citizen_svc'    // 5. 국민서비스
  | 'public_service' // 5. 대국민서비스 (alias)
  | 'my_hospital';   // 6. MY 의료기관

export type 업무_도메인_타입 = 메인_도메인;

interface 글로벌_공공_헤더_속성 {
  active_domain?: 메인_도메인;
  on_select_domain?: (domain: 메인_도메인) => void;
  is_dark_mode: boolean;
  on_toggle_dark_mode: () => void;
  on_open_key_modal: () => void;
  on_open_data_go_kr_modal: () => void;
  on_open_upload_modal: () => void;
  on_open_grounding_modal: () => void;
  on_download_nmc_excel?: () => void;
  on_export_capture?: () => void;
  google_key_registered?: boolean;
  google_api_key_registered?: boolean;
  data_go_kr_key_registered?: boolean;
  on_search_query?: (query: string) => void;
  vulnerable_region_count?: number;
}

export const 글로벌_공공_헤더: React.FC<글로벌_공공_헤더_속성> = ({
  active_domain,
  on_select_domain,
  is_dark_mode,
  on_toggle_dark_mode,
  on_open_key_modal,
  on_open_data_go_kr_modal,
  on_open_upload_modal,
  on_open_grounding_modal,
  on_download_nmc_excel,
  on_export_capture,
  google_key_registered,
  google_api_key_registered,
  data_go_kr_key_registered,
  on_search_query,
  vulnerable_region_count = 82,
}) => {
  const [is_admin_open, set_is_admin_open] = useState(false);
  const [is_noti_open, set_is_noti_open] = useState(false);
  const [search_text, set_search_text] = useState('');
  const admin_ref = useRef<HTMLDivElement>(null);
  const noti_ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handle_click_outside = (e: MouseEvent) => {
      if (admin_ref.current && !admin_ref.current.contains(e.target as Node)) {
        set_is_admin_open(false);
      }
      if (noti_ref.current && !noti_ref.current.contains(e.target as Node)) {
        set_is_noti_open(false);
      }
    };
    document.addEventListener('mousedown', handle_click_outside);
    return () => document.removeEventListener('mousedown', handle_click_outside);
  }, []);

  const handle_search_submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (on_search_query && search_text.trim()) {
      on_search_query(search_text.trim());
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors shadow-xs">
      {/* 1줄 단일 헤더 (모든 정보 1줄에 컴팩트 통합) */}
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6">
        <div className="h-14 flex items-center justify-between gap-3">
          
          {/* 1. 좌측: 브랜드 로고 & 단일 타이틀 */}
          <div
            onClick={() => on_select_domain?.('status_diag')}
            className="flex items-center space-x-2.5 cursor-pointer select-none shrink-0"
          >
            <div className="w-8 h-8 rounded-lg bg-[#0071e3] flex items-center justify-center text-white shadow-sm ring-1 ring-white/20">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-black tracking-tight text-slate-900 dark:text-white">
                공공의료 정책의사결정지원 AI 플랫폼
              </h1>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-50 dark:bg-blue-950/60 text-[#0071e3] dark:text-[#2997ff] font-bold border border-blue-200/60 dark:border-blue-900 hidden md:inline">
                20260918 v0.24
              </span>
            </div>
          </div>

          {/* 2. 중앙: 1줄 컴팩트 핵심 운영 지표 티커 */}
          <div className="hidden lg:flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700">
              <span className="text-slate-500 text-[11px]">시군구 226:</span>
              <span className="font-bold text-red-600 dark:text-red-400">취약지 {vulnerable_region_count}개소</span>
            </div>

            <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700">
              <span className="text-slate-500 text-[11px]">중진료권:</span>
              <span className="font-bold text-teal-700 dark:text-teal-300">70개 네트워크</span>
            </div>

            <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700">
              <span className="text-slate-500 text-[11px]">지방의료원:</span>
              <span className="font-bold text-amber-700 dark:text-amber-300">35개 병원 경보</span>
            </div>

            <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700">
              <span className="text-slate-500 text-[11px]">핵심의료:</span>
              <span className="font-bold text-purple-700 dark:text-purple-300">응급·분만·소아</span>
            </div>

            <span className="text-[11px] text-slate-400 hidden 2xl:inline">
              (기준: 2026.09 NMC 월 1회 갱신)
            </span>
          </div>

          {/* 3. 우측: 검색 / 알림 / 테마 / 관리자 */}
          <div className="flex items-center space-x-2 shrink-0">
            {/* 시군구 빠른 검색 */}
            <form onSubmit={handle_search_submit} className="relative hidden xl:block w-44">
              <input
                type="text"
                value={search_text}
                onChange={(e) => set_search_text(e.target.value)}
                placeholder="✏️ 지역·의료원 검색..."
                className="zone-input-box w-full pl-7 pr-2.5 py-1 text-xs rounded-lg transition"
              />
              <Search className="w-3.5 h-3.5 text-indigo-500 absolute left-2 top-1/2 -translate-y-1/2" />
            </form>

            {/* 실시간 알림 팝오버 버튼 */}
            <div className="relative" ref={noti_ref}>
              <button
                type="button"
                onClick={() => set_is_noti_open(!is_noti_open)}
                className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition relative"
                title="시스템 공지 및 RAG 업데이트 알림"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
              </button>

              {is_noti_open && (
                <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-3.5 text-xs z-50 animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="font-bold text-slate-900 dark:text-white">실시간 알림</span>
                    <span className="text-[10px] text-[#0055a5] font-semibold">전체 2건</span>
                  </div>
                  <div className="divide-y divide-slate-100 dark:divide-slate-800 py-1">
                    <div className="py-2 space-y-0.5">
                      <p className="font-bold text-slate-800 dark:text-slate-200">2026.09 필수의료 DW 지표 갱신</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">전국 226개 시군구 7대 필수의료 취약도 산정 완료</p>
                    </div>
                    <div className="py-2 space-y-0.5">
                      <p className="font-bold text-slate-800 dark:text-slate-200">하이브리드 RAG 지침 코퍼스 가동</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">보건복지부 법정 고시 및 지자체 지침 12건 연동</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 라이트/다크 테마 토글 */}
            <button
              onClick={on_toggle_dark_mode}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title={is_dark_mode ? '화이트 테마로 전환' : '블랙 테마로 전환'}
            >
              {is_dark_mode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* 관리자 & 데이터 설정 드롭다운 */}
            <div className="relative" ref={admin_ref}>
              <button
                type="button"
                onClick={() => set_is_admin_open(!is_admin_open)}
                className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition"
                title="데이터 및 시스템 설정"
              >
                <User className="w-3.5 h-3.5 text-slate-500" />
                <span>관리자</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {is_admin_open && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-2 text-xs z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                    <span className="font-bold text-slate-900 dark:text-white block">시스템 &amp; 데이터 관리</span>
                    <span className="text-[10px] text-slate-400">데이터 연동 및 API 키 설정</span>
                  </div>

                  <button
                    onClick={() => {
                      on_open_key_modal();
                      set_is_admin_open(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition"
                  >
                    <div className="flex items-center space-x-2">
                      <Key className="w-3.5 h-3.5 text-amber-600" />
                      <span className="text-slate-700 dark:text-slate-200 font-medium">Google Gemini API 키</span>
                    </div>
                    {google_key_registered ? (
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.5 rounded">등록됨</span>
                    ) : (
                      <span className="text-[10px] text-slate-400">미등록</span>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      on_open_data_go_kr_modal();
                      set_is_admin_open(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition"
                  >
                    <div className="flex items-center space-x-2">
                      <Database className="w-3.5 h-3.5 text-blue-600" />
                      <span className="text-slate-700 dark:text-slate-200 font-medium">공공데이터포털 인증키</span>
                    </div>
                    {data_go_kr_key_registered ? (
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.5 rounded">등록됨</span>
                    ) : (
                      <span className="text-[10px] text-slate-400">미등록</span>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      on_open_upload_modal();
                      set_is_admin_open(false);
                    }}
                    className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-left text-slate-700 dark:text-slate-200 font-medium transition"
                  >
                    <Upload className="w-3.5 h-3.5 text-slate-500" />
                    <span>원천 CSV 데이터 업로드</span>
                  </button>

                  <button
                    onClick={() => {
                      on_download_nmc_excel?.();
                      set_is_admin_open(false);
                    }}
                    className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-left text-slate-700 dark:text-slate-200 font-medium transition"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-600" />
                    <span>NMC 표준 3종 엑셀 다운로드</span>
                  </button>

                  <button
                    onClick={() => {
                      on_export_capture?.();
                      set_is_admin_open(false);
                    }}
                    className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-left text-slate-700 dark:text-slate-200 font-medium transition"
                  >
                    <Download className="w-3.5 h-3.5 text-blue-600" />
                    <span>화면 리포트 이미지 저장</span>
                  </button>

                  <button
                    onClick={() => {
                      on_open_grounding_modal();
                      set_is_admin_open(false);
                    }}
                    className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-left text-slate-700 dark:text-slate-200 font-medium transition"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                    <span>법령·원문 대조 신뢰뷰</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
