'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Activity,
  User,
  ChevronDown,
  ShieldCheck,
  Download,
  Upload,
  Key,
  Database,
  Moon,
  Sun,
  BookOpen,
  HelpCircle,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

export type 워크스페이스_타입 =
  | 'home'
  | 'regional_diagnosis'    // ① 지역진단
  | 'policy_planning'       // ② 정책기획
  | 'medical_institution'   // ③ 의료기관
  | 'ai_analysis'           // ④ AI 분석
  | 'national_safety';      // ⑤ 국민안심

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
  active_workspace?: 워크스페이스_타입;
  on_change_workspace?: (ws: 워크스페이스_타입) => void;
  // 하위 호환성 속성
  active_main_view?: any;
  on_change_main_view?: (view: any) => void;
  active_domain?: 메인_도메인;
  on_select_domain?: (domain: 메인_도메인) => void;
  is_dark_mode: boolean;
  on_toggle_dark_mode: () => void;
  on_open_key_modal: () => void;
  on_open_data_go_kr_modal: () => void;
  on_open_upload_modal: () => void;
  on_open_grounding_modal: () => void;
  on_open_guide_modal?: () => void;
  on_download_nmc_excel?: () => void;
  on_export_capture?: () => void;
  google_key_registered?: boolean;
  google_api_key_registered?: boolean;
  data_go_kr_key_registered?: boolean;
  on_search_query?: (query: string) => void;
  vulnerable_region_count?: number;
}

export const 글로벌_공공_헤더: React.FC<글로벌_공공_헤더_속성> = ({
  active_workspace = 'home',
  on_change_workspace,
  active_main_view,
  on_change_main_view,
  active_domain,
  on_select_domain,
  is_dark_mode,
  on_toggle_dark_mode,
  on_open_key_modal,
  on_open_data_go_kr_modal,
  on_open_upload_modal,
  on_open_grounding_modal,
  on_open_guide_modal,
  on_download_nmc_excel,
  on_export_capture,
  google_key_registered,
  google_api_key_registered,
  data_go_kr_key_registered,
  on_search_query,
  vulnerable_region_count = 82,
}) => {
  const [is_admin_open, set_is_admin_open] = useState(false);
  const [is_hovering_medical, set_is_hovering_medical] = useState(false);
  const admin_ref = useRef<HTMLDivElement>(null);
  const medical_ref = useRef<HTMLDivElement>(null);

  // 워크스페이스 변경 통합 핸들러
  const handle_workspace_change = (ws: 워크스페이스_타입) => {
    if (on_change_workspace) {
      on_change_workspace(ws);
    } else if (on_change_main_view) {
      on_change_main_view(ws as any);
    }
  };

  useEffect(() => {
    const handle_click_outside = (e: MouseEvent) => {
      if (admin_ref.current && !admin_ref.current.contains(e.target as Node)) {
        set_is_admin_open(false);
      }
      if (medical_ref.current && !medical_ref.current.contains(e.target as Node)) {
        set_is_hovering_medical(false);
      }
    };
    document.addEventListener('mousedown', handle_click_outside);
    return () => document.removeEventListener('mousedown', handle_click_outside);
  }, []);

  const current_active = active_workspace || (active_main_view as any) || 'home';

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors shadow-xs">
      {/* 1줄 단일 헤더 (모든 정보 1줄에 컴팩트 통합) */}
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6">
        <div className="h-14 flex items-center justify-between gap-3">
          
          {/* 1. 좌측: 브랜드 로고 & 플랫폼 타이틀 (클릭 시 최초 초기 화면으로 이동) */}
          <button
            type="button"
            onClick={() => handle_workspace_change('home')}
            className="flex items-center gap-2.5 select-none shrink-0 cursor-pointer group text-left transition hover:opacity-90 focus:outline-none"
            title="최초 초기 화면으로 이동"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-sm ring-1 ring-white/20 shrink-0 group-hover:scale-105 transition-transform">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-black tracking-tight text-slate-900 dark:text-white leading-normal flex items-center group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                공공의료 의사결정 지원 플랫폼
              </h1>
              {/* 1. 좌측 버전 폰트 사이즈 확대 적용 (text-xs sm:text-[13px] font-bold) */}
              <span className="text-xs sm:text-[13px] px-2.5 py-0.5 rounded-md bg-blue-50/90 dark:bg-blue-950/80 text-[#0071e3] dark:text-[#38bdf8] font-bold border border-blue-200/80 dark:border-blue-800 shadow-2xs hidden sm:inline-flex items-center justify-center leading-none">
                20260923 버전 1.0.0
              </span>
            </div>
          </button>

          {/* 2. 중앙: 5대 핵심 워크스페이스 네비게이션 ([지역진단] [정책기획] [의료기관] [AI 분석] [국민안심]) */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-100/90 dark:bg-slate-900/90 p-1 rounded-2xl border border-slate-200/60 dark:border-slate-800">
            <button
              onClick={() => handle_workspace_change('regional_diagnosis')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                current_active === 'regional_diagnosis'
                  ? 'bg-white dark:bg-[#1a1d24] text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              지역진단
            </button>

            <button
              onClick={() => handle_workspace_change('policy_planning')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                current_active === 'policy_planning'
                  ? 'bg-white dark:bg-[#1a1d24] text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              정책기획
            </button>

            {/* 2. 의료기관(실시간): 연결 시 녹색 표시, 미연결 시 호버 툴팁 안내 */}
            <div
              className="relative"
              ref={medical_ref}
              onMouseEnter={() => set_is_hovering_medical(true)}
              onMouseLeave={() => set_is_hovering_medical(false)}
            >
              <button
                type="button"
                onClick={() => handle_workspace_change('medical_institution')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  current_active === 'medical_institution'
                    ? 'bg-white dark:bg-[#1a1d24] text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <span>의료기관</span>
                <span
                  className={`font-extrabold transition-colors ${
                    data_go_kr_key_registered
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-slate-400 dark:text-slate-500'
                  }`}
                >
                  (실시간)
                </span>
                {data_go_kr_key_registered && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse ml-0.5" />
                )}
              </button>

              {/* 실시간 연결됨: 호버 시 정상 연동 상태 툴팁 */}
              {data_go_kr_key_registered && is_hovering_medical && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-emerald-200 dark:border-emerald-800/60 z-50 text-left animate-in fade-in zoom-in-95 pointer-events-none">
                  <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>실시간 공공데이터 연계 정상</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    공공데이터포털(data.go.kr) 중앙응급의료센터 API와 실시간 동기화 중입니다.
                  </p>
                </div>
              )}

              {/* 실시간 미연결: 호버 시 연결 방법 안내 팝오버 & API 키 설정 모달 오픈 */}
              {!data_go_kr_key_registered && is_hovering_medical && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-72 p-3.5 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50 text-left animate-in fade-in zoom-in-95 pointer-events-auto">
                  <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold text-xs mb-1">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>실시간 병상 데이터 미연결</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                    현재 로컬 기준 데이터로 표출 중입니다. 국립중앙의료원 실시간 응급실·병상 정보를 수신하려면 공공데이터포털(data.go.kr) 인증키를 등록해주세요.
                  </p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      set_is_hovering_medical(false);
                      on_open_data_go_kr_modal();
                    }}
                    className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
                  >
                    <Key className="w-3.5 h-3.5" />
                    <span>공공데이터포털 API 키 등록하기 ➔</span>
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => handle_workspace_change('ai_analysis')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                current_active === 'ai_analysis'
                  ? 'bg-white dark:bg-[#1a1d24] text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              AI 분석
            </button>

            <button
              onClick={() => handle_workspace_change('national_safety')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                current_active === 'national_safety'
                  ? 'bg-white dark:bg-[#1a1d24] text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              국민안심
            </button>
          </nav>


          {/* 3. 우측: 데이터/사업가이드 안내 / 검색 / 알림 / 테마 / 관리자 */}
          <div className="flex items-center space-x-2 shrink-0">
            {/* 데이터 & 사업가이드 팝업 안내 버튼 (초기 화면 주요 안내 아이콘) */}
            <button
              type="button"
              onClick={on_open_guide_modal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-sm hover:shadow-md transition active:scale-95 ring-2 ring-blue-400/20 group cursor-pointer"
              title="플랫폼 탑재 7대 데이터셋 & 2026 정부 법정 사업가이드 총람 보기"
            >
              <BookOpen className="w-3.5 h-3.5 text-blue-200 group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline">데이터·사업가이드</span>
              <span className="sm:hidden inline">가이드</span>
              <span className="px-1 py-0.2 rounded bg-white/20 text-[10px] font-extrabold text-white">
                안내
              </span>
            </button>

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
                      on_open_guide_modal?.();
                      set_is_admin_open(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-blue-50/60 dark:bg-blue-950/40 hover:bg-blue-100/60 dark:hover:bg-blue-900/40 text-left transition mb-1 border border-blue-200/50 dark:border-blue-900/50"
                  >
                    <div className="flex items-center space-x-2">
                      <BookOpen className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      <span className="text-blue-900 dark:text-blue-200 font-bold">데이터·사업가이드 총람</span>
                    </div>
                    <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded border border-blue-200/50 dark:border-blue-800/50">안내</span>
                  </button>

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
