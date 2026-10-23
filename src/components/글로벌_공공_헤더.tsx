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
  RefreshCw,
  Moon,
  Sun,
  BookOpen,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  AlertTriangle,
  Lock,
  Unlock,
  Compass,
  FileText,
  HelpCircle,
  Check,
  Building2,
  Bot,
} from 'lucide-react';
import { PLATFORM_VERSION } from '@/lib/버전_정보';
import { 사용자_역할_타입, 사용자_역할_목록 } from '@/lib/사용자_역할_타입';

export type 워크스페이스_타입 =
  | 'home'
  | 'regional_diagnosis'    // ① 지역진단
  | 'policy_planning'       // ② 정책기획
  | 'medical_institution'   // ③ 의료기관
  | 'hospital_ai_diagnosis' // ⭐ 신규: AI 병원진단·개선
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
  // 3대 사용자 역할 (국민 / 의료기관 / NMC)
  active_user_role?: 사용자_역할_타입;
  on_change_user_role?: (role: 사용자_역할_타입) => void;
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
  on_open_admin_dashboard?: () => void;
  on_open_llm_compare?: () => void;
  on_download_nmc_excel?: () => void;

  on_export_capture?: () => void;
  google_key_registered?: boolean;
  google_api_key_registered?: boolean;
  google_api_key?: string;
  data_go_kr_key_registered?: boolean;
  on_search_query?: (query: string) => void;
  vulnerable_region_count?: number;
  is_authenticated?: boolean;
  on_open_auth_modal?: () => void;
  on_open_review_guide_modal?: () => void;
  on_open_plan_evaluation?: () => void;
  is_plan_evaluation_active?: boolean;
  on_open_profile_report?: () => void;
  is_profile_report_active?: boolean;
}

const ROLE_OPTIONS: {
  id: 사용자_역할_타입;
  icon: string;
  label: string;
  badge: string;
  desc: string;
}[] = [
  {
    id: 'citizen',
    icon: '👨‍👩‍👧',
    label: '국민',
    badge: '대국민 안심',
    desc: '내 주변 응급실·분만병원·소아과 실시간 병상 및 AI 증상 비서',
  },
  {
    id: 'hospital',
    icon: '🏥',
    label: '의료기관 담당자',
    badge: '공공병원',
    desc: '41개 거점공공병원 AI 종합진단, 5종 보고서, HWPX 사업계획서',
  },
  {
    id: 'nmc',
    icon: '🏛️',
    label: 'NMC 업무 담당자',
    badge: '중앙 총괄',
    desc: '전국 250개 시군구 헬스맵 취약지 관제, 환자 유출입, 공시 검증',
  },
  {
    id: 'all',
    icon: '🌐',
    label: '전체',
    badge: '전체보기',
    desc: '모든 워크스페이스 메뉴 및 플랫폼 전 기능 탐색',
  },
];

export const 글로벌_공공_헤더: React.FC<글로벌_공공_헤더_속성> = ({
  active_workspace = 'home',
  on_change_workspace,
  active_user_role = 'all',
  on_change_user_role,
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
  on_open_admin_dashboard,
  on_open_llm_compare,
  on_download_nmc_excel,
  on_export_capture,
  google_key_registered,
  google_api_key_registered,
  google_api_key,
  data_go_kr_key_registered,
  on_search_query,
  vulnerable_region_count = 82,
  is_authenticated = false,
  on_open_auth_modal,
  on_open_review_guide_modal,
  on_open_plan_evaluation,
  is_plan_evaluation_active = false,
  on_open_profile_report,
  is_profile_report_active = false,
}) => {
  const [is_admin_open, set_is_admin_open] = useState(false);
  const [is_hovering_medical, set_is_hovering_medical] = useState(false);
  const [is_role_dropdown_open, set_is_role_dropdown_open] = useState(false);
  const admin_ref = useRef<HTMLDivElement>(null);
  const medical_ref = useRef<HTMLDivElement>(null);
  const role_dropdown_ref = useRef<HTMLDivElement>(null);
  // Gemini API 키 등록 현황 및 멀티 키 카운트
  const raw_gemini_keys = (google_api_key || '')
    .split(/[\n,;]+/)
    .map((k) => k.trim())
    .filter(Boolean);
  const gemini_key_count = raw_gemini_keys.length > 0
    ? raw_gemini_keys.length
    : (google_api_key_registered || google_key_registered ? 1 : 0);
  const is_gemini_connected = gemini_key_count > 0;

  // 워크스페이스 변경 통합 핸들러
  const handle_workspace_change = (ws: 워크스페이스_타입) => {
    if (on_change_workspace) {
      on_change_workspace(ws);
    } else if (on_change_main_view) {
      on_change_main_view(ws as any);
    }
  };

  // 🌟 3대 사용자 역할 전환 핸들러 (국민 / 의료기관 담당자 / NMC 업무 담당자 / 전체)
  const handle_user_role_change = (role: 사용자_역할_타입) => {
    if (on_change_user_role) {
      on_change_user_role(role);
    }
    // 각 역할의 전용 기본 화면으로 즉시 전환
    if (role === 'citizen') {
      handle_workspace_change('national_safety');
    } else if (role === 'hospital') {
      handle_workspace_change('hospital_ai_diagnosis');
    } else if (role === 'nmc') {
      handle_workspace_change('regional_diagnosis');
    } else if (role === 'all') {
      handle_workspace_change('home');
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
      if (role_dropdown_ref.current && !role_dropdown_ref.current.contains(e.target as Node)) {
        set_is_role_dropdown_open(false);
      }
    };
    document.addEventListener('mousedown', handle_click_outside);
    return () => document.removeEventListener('mousedown', handle_click_outside);
  }, []);

  const current_role_option =
    ROLE_OPTIONS.find((r) => r.id === active_user_role) || ROLE_OPTIONS[3];

  const current_active = active_workspace || (active_main_view as any) || 'home';

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors shadow-xs">
      {/* 1줄 단일 헤더 (모든 정보 1줄에 컴팩트 통합) */}
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6">
        {/* 1800px 이상은 한 줄, 그보다 좁으면 메뉴가 두 번째 줄로 내려감 (글자 단위 줄바꿈 방지) */}
        <div className="min-h-14 py-2 min-[1800px]:py-0 min-[1800px]:h-14 flex flex-wrap min-[1800px]:flex-nowrap items-center justify-between gap-x-3 gap-y-2">
          
          {/* 1. 좌측: 브랜드 로고 & 플랫폼 타이틀 + 🌟 3대 사용자 역할 선택 스위처 */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <div className="flex items-center gap-2 select-none shrink-0 whitespace-nowrap">
              <button
                type="button"
                onClick={() => handle_workspace_change('home')}
                className="flex items-center gap-2.5 cursor-pointer group text-left transition hover:opacity-90 focus:outline-none"
                title="최초 초기 화면으로 이동"
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-sm ring-1 ring-white/20 shrink-0 group-hover:scale-105 transition-transform">
                  <Activity className="w-4 h-4 text-white" />
                </div>
                <div className="flex flex-col justify-center">
                  <h1 className="text-sm sm:text-base font-black tracking-tight text-slate-900 dark:text-white leading-tight flex items-center group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    공공의료 의사결정 지원 플랫폼
                  </h1>
                  <div className="flex items-center mt-0.5 gap-1.5">
                    <span
                      className="text-[11px] px-1.5 py-0.2 rounded bg-blue-50/90 dark:bg-blue-950/80 text-[#0071e3] dark:text-[#38bdf8] font-bold border border-blue-200/80 dark:border-blue-800/80 shadow-2xs inline-flex items-center justify-center leading-tight"
                      title="플랫폼 최종 배포일시 및 버전"
                    >
                      {PLATFORM_VERSION.fullLabel}
                    </span>
                  </div>
                </div>
              </button>

              {/* ⭐ 좌측 상단: 프로토타입 명칭 뱃지 및 커서 호버 시 ISP 의미 상세 팝오버 툴팁 */}
              <div className="relative group/proto inline-block">
                <div
                  className="px-2 py-0.5 rounded-lg bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white text-[11px] font-black shadow-xs flex items-center gap-1 cursor-help hover:shadow-md hover:scale-105 transition-all ring-1 ring-white/25 select-none"
                  tabIndex={0}
                  role="tooltip"
                  aria-label="ISP 프로토타입의 의미 안내"
                >
                  <Sparkles className="w-3 h-3 text-amber-300 animate-pulse" />
                  <span>ISP 프로토타입</span>
                  <HelpCircle className="w-3 h-3 text-white/80" />
                </div>

                {/* 마우스 커서 호버 시 표시되는 ISP 프로토타입 상세 의미 카드 */}
                <div className="absolute left-0 top-full mt-2 w-72 sm:w-80 p-3 bg-slate-900/95 dark:bg-slate-900/98 text-white backdrop-blur-md rounded-2xl shadow-2xl border border-blue-500/40 opacity-0 invisible group-hover/proto:opacity-100 group-hover/proto:visible transition-all duration-200 z-[100] pointer-events-none group-hover/proto:pointer-events-auto">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-700/80 mb-2.5">
                    <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-sm">
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    </div>
                    <h4 className="font-extrabold text-xs sm:text-sm text-blue-300">
                      ISP 프로토타입의 의미
                    </h4>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-200">
                    <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-start gap-1.5">
                      <span className="shrink-0 text-sm">🎯</span>
                      <div>
                        <span className="font-bold text-white">1. 요구사항 가시화</span>
                        <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
                          (텍스트·서식 위주의 추상적 ISP 기획을 탈피)
                        </p>
                      </div>
                    </div>

                    <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center gap-1.5">
                      <span className="shrink-0 text-sm">🛡️</span>
                      <span className="font-bold text-white">2. 본 사업 실패 리스크 차단</span>
                    </div>

                    <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center gap-1.5">
                      <span className="shrink-0 text-sm">📋</span>
                      <span className="font-bold text-white">3. 발주 제안요청서(RFP) 기능규격서 정밀화</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 🌟 3대 사용자 역할별 화면 선택 드롭다운 (국민 / 의료기관 / NMC / 전체) */}
            <div className="relative inline-block" ref={role_dropdown_ref}>
              <button
                type="button"
                onClick={() => set_is_role_dropdown_open((prev) => !prev)}
                aria-expanded={is_role_dropdown_open}
                aria-haspopup="menu"
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer border shadow-2xs ${
                  is_role_dropdown_open
                    ? 'bg-blue-50/90 dark:bg-blue-950/70 border-blue-400/60 text-blue-700 dark:text-blue-300 ring-2 ring-blue-400/20'
                    : 'bg-slate-100/90 dark:bg-slate-900/90 border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-white/80 dark:hover:bg-slate-800/80'
                }`}
                title="사용자 역할(국민 / 의료기관 / NMC / 전체) 선택 드롭다운"
              >
                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 select-none">
                  사용자:
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="text-sm leading-none">{current_role_option.icon}</span>
                  <span className="font-extrabold">{current_role_option.label}</span>
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                    is_role_dropdown_open ? 'rotate-180 text-blue-600 dark:text-blue-400' : ''
                  }`}
                />
              </button>

              {/* 드롭다운 메뉴 레이어 */}
              {is_role_dropdown_open && (
                <div
                  role="menu"
                  className="absolute left-0 top-full mt-2 w-72 sm:w-80 p-2 bg-white/98 dark:bg-slate-900/98 text-slate-800 dark:text-slate-100 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200/90 dark:border-slate-800 z-[90] animate-in fade-in slide-in-from-top-1 duration-150"
                >
                  <div className="px-2.5 py-1.5 mb-1 border-b border-slate-100 dark:border-slate-800/80">
                    <p className="text-[11px] font-extrabold text-slate-900 dark:text-white">
                      사용자 역할 선택
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      선택하신 역할의 전용 기본 화면과 메뉴로 즉시 전환됩니다.
                    </p>
                  </div>

                  <div className="space-y-1">
                    {ROLE_OPTIONS.map((opt) => {
                      const is_active = active_user_role === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          role="menuitem"
                          onClick={() => {
                            handle_user_role_change(opt.id);
                            set_is_role_dropdown_open(false);
                          }}
                          className={`w-full text-left p-2 rounded-xl transition flex items-start gap-2.5 cursor-pointer ${
                            is_active
                              ? 'bg-blue-50/90 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/60'
                              : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-transparent'
                          }`}
                        >
                          <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-base shrink-0 mt-0.5 shadow-2xs">
                            {opt.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <span
                                className={`text-xs font-bold ${
                                  is_active
                                    ? 'text-blue-600 dark:text-blue-400'
                                    : 'text-slate-800 dark:text-slate-200'
                                }`}
                              >
                                {opt.label}
                              </span>
                              <span className="text-[9px] px-1.5 py-0.2 rounded-md font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                                {opt.badge}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1 leading-tight">
                              {opt.desc}
                            </p>
                          </div>
                          {is_active && (
                            <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0 mt-1" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 2. 중앙: 신규 IA v1.24.0 기준 통합 워크스페이스 네비게이션 */}
          <nav className="order-last min-[1800px]:order-none w-full min-[1800px]:w-auto flex flex-wrap min-[1800px]:flex-nowrap justify-center items-center gap-1 bg-slate-100/90 dark:bg-slate-900/90 p-1 rounded-2xl border border-slate-200/60 dark:border-slate-800">
            {/* [내부용] 전국 214개 공공병원 통합 관제 & 알리미 공시 */}
            <button
              type="button"
              onClick={() => handle_workspace_change('medical_institution')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                current_active === 'medical_institution'
                  ? 'bg-white dark:bg-[#1a1d24] text-indigo-700 dark:text-indigo-400 shadow-sm border border-indigo-100 dark:border-indigo-900/50'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/60 dark:hover:bg-slate-800/60'
              }`}
              title="[내부용] 전국 214개 공공병원 통합 관제 및 알리미 경영공시 검증"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>병원 통합관제</span>
              <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                내부용
              </span>
            </button>

            {/* [외부용: 지역진단] GIS 헬스맵 & 취약지 진단 */}
            <button
              type="button"
              onClick={() => handle_workspace_change('regional_diagnosis')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 ${
                current_active === 'regional_diagnosis'
                  ? 'bg-white dark:bg-[#1a1d24] text-blue-700 dark:text-blue-400 shadow-sm border border-blue-100 dark:border-blue-900/50'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/60 dark:hover:bg-slate-800/60'
              }`}
              title="[외부용 > 지역진단] 전국 250개 시군구 GIS 헬스맵 및 환자 유출입(OD) 분석"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>지역진단</span>
            </button>

            {/* [외부용: 계획수립] AI 정책기획, 2030 수요추계, 사업계획서 & 시행계획 AI 평가 */}
            <button
              type="button"
              onClick={() => handle_workspace_change('policy_planning')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 ${
                current_active === 'policy_planning'
                  ? 'bg-white dark:bg-[#1a1d24] text-indigo-700 dark:text-indigo-400 shadow-sm border border-indigo-100 dark:border-indigo-900/50'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/60 dark:hover:bg-slate-800/60'
              }`}
              title="[외부용 > 계획수립] 2030 수요추계, AI 정책대안, 사업계획서 자동생성 & 시행계획 100점 AI 평가"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>계획수립</span>
            </button>

            {/* [외부용: 경영개선] 우리 공공병원 대시보드, 2025 운영평가, 5종 진단보고서, 경영위기 조기경보 */}
            <button
              type="button"
              onClick={() => handle_workspace_change('hospital_ai_diagnosis')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                current_active === 'hospital_ai_diagnosis'
                  ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-500/30'
                  : 'bg-blue-50/80 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200/60 dark:border-blue-800/60'
              }`}
              title="[외부용 > 경영개선] 우리 공공병원 현황 대시보드, 2025 거점병원 운영평가(77.9점), 5종 진단보고서, 경영위기 조기경보"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>경영개선</span>
              <span className="text-[9px] font-black px-1 py-0.2 rounded bg-amber-400 text-slate-950">
                AI 진단
              </span>
            </button>

            {/* [대국민] 국민안심 안심의료 서비스 */}
            <button
              type="button"
              onClick={() => handle_workspace_change('national_safety')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                current_active === 'national_safety'
                  ? 'bg-rose-600 text-white shadow-sm ring-2 ring-rose-500/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/60 dark:hover:bg-slate-800/60'
              }`}
              title="[대국민] 시민 맞춤 포털, 내 주변 필수의료 찾기, E-Gen 실시간 응급실·중환자실 관제"
            >
              <Activity className="w-3.5 h-3.5 text-rose-500" />
              <span>대국민 안심</span>
            </button>
          </nav>

          {/* 3. 우측: 데이터·사업가이드 / 테마 / 관리자 */}
          <div className="flex items-center space-x-2 shrink-0 whitespace-nowrap">

            {/* 데이터 & 사업가이드 팝업 안내 버튼 */}
            <button
              type="button"
              onClick={on_open_guide_modal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-sm hover:shadow-md transition active:scale-95 cursor-pointer"
              title="플랫폼 탑재 7대 데이터셋 & 2026 정부 법정 사업가이드 총람 보기"
            >
              <BookOpen className="w-3.5 h-3.5 text-blue-200" />
              <span className="hidden min-[1800px]:inline">데이터·사업가이드</span>
              <span className="min-[1800px]:hidden inline">가이드</span>
              <span className="hidden min-[1800px]:inline px-1 py-0.5 rounded bg-white/20 text-[10px] font-extrabold text-white">
                안내
              </span>
            </button>

            {/* 3-2. 담당자별 집중 검토 가이드 버튼 (고객 프로토타입 검토 안내) */}
            <button
              type="button"
              onClick={on_open_review_guide_modal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black text-xs transition active:scale-95 cursor-pointer bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-xs hover:shadow-md ring-2 ring-blue-300 dark:ring-blue-800"
              title="고객 검토 안내: 각 시스템 담당자별 집중 확인 메뉴 및 가이드"
            >
              <Compass className="w-3.5 h-3.5 text-blue-100" />
              <span className="hidden min-[1800px]:inline">담당자별 검토 가이드</span>
              <span className="min-[1800px]:hidden inline">검토</span>
            </button>

            {/* 4. 보안 로그인 아이콘 버튼 (일반인 접근 차단 및 패스워드 인증) */}
            <button
              type="button"
              onClick={on_open_auth_modal}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs shadow-sm hover:shadow-md transition active:scale-95 cursor-pointer ${
                is_authenticated
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20'
                  : 'bg-amber-500 hover:bg-amber-600 text-white ring-2 ring-amber-300 dark:ring-amber-700 animate-pulse'
              }`}
              title={
                is_authenticated
                  ? '공공보건의료 인가자 보안 인증 완료 (클릭 시 상태 확인 및 로그아웃)'
                  : '일반인 접근 제한 중: 클릭하여 보안 패스워드를 입력하세요'
              }
            >
              {is_authenticated ? (
                <>
                  <Unlock className="w-3.5 h-3.5 text-emerald-100" />
                  <span className="hidden min-[1800px]:inline">인증완료</span>
                  <span className="min-[1800px]:hidden inline">인증</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 text-amber-100 fill-current" />
                  <span>로그인</span>
                </>
              )}
            </button>

            {/* 5. 블랙/화이트 화면 변경 (라이트/다크 테마 토글) */}
            <button
              onClick={on_toggle_dark_mode}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title={is_dark_mode ? '화이트 테마로 전환' : '블랙 테마로 전환'}
            >
              {is_dark_mode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* 6. 관리자 & 데이터 설정 드롭다운 (가장 우측) */}
            <div className="relative" ref={admin_ref}>
              <button
                type="button"
                onClick={() => set_is_admin_open(!is_admin_open)}
                className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition border ${
                  is_admin_open
                    ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white border-slate-300 dark:border-slate-600'
                    : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                }`}
                title="데이터 및 시스템 설정"
              >
                <User className="w-3.5 h-3.5 text-slate-500" />
                <span>관리자</span>
                <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${is_admin_open ? 'rotate-180' : ''}`} />
              </button>

              {is_admin_open && (
                <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-2 text-xs z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                    <span className="font-bold text-slate-900 dark:text-white block">시스템 &amp; 데이터 관리</span>
                    <span className="text-[10px] text-slate-400">데이터 연동 및 API 키 설정</span>
                  </div>

                  {/* === API 연결 상태 요약 (관리자 전용) === */}
                  <div className="mx-1 mb-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">API 연결 상태</div>
                    {/* Gemini API */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-2 h-2 rounded-full ${is_gemini_connected ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                        <span className="font-semibold text-slate-700 dark:text-slate-300">Google Gemini AI</span>
                      </div>
                      {is_gemini_connected ? (
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.5 rounded">
                          {gemini_key_count > 1 ? `${gemini_key_count}개 키 연결됨` : (google_api_key ? '사용자 키 연결됨' : '기본 탑재 (연결됨)')}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">기본 정책 AI 가동</span>
                      )}
                    </div>
                    {/* 공공데이터 API */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-2 h-2 rounded-full ${data_go_kr_key_registered ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                        <span className="font-semibold text-slate-700 dark:text-slate-300">공공데이터 API</span>
                      </div>
                      {data_go_kr_key_registered ? (
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.5 rounded">
                          기본 탑재 (연결됨)
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">기준 데이터 연동</span>
                      )}
                    </div>
                  </div>

                  {/* Section 22 표준: 관리자 대시보드 통합 모달 트리거 */}
                  <button
                    onClick={() => {
                      on_open_admin_dashboard?.();
                      set_is_admin_open(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-left transition mb-1.5 shadow-xs cursor-pointer font-bold"
                  >
                    <div className="flex items-center space-x-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-400 dark:text-blue-600" />
                      <span>관리자 통합 대시보드</span>
                    </div>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-600 text-white dark:bg-blue-600">통제센터</span>
                  </button>

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
                      on_open_llm_compare?.();
                      set_is_admin_open(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-purple-50/70 dark:bg-purple-950/40 hover:bg-purple-100/80 dark:hover:bg-purple-900/50 text-left transition mb-1 border border-purple-200/60 dark:border-purple-800/60 cursor-pointer"
                  >
                    <div className="flex items-center space-x-2">
                      <Bot className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                      <span className="text-purple-950 dark:text-purple-200 font-bold">로컬 LLM vs Gemini 비교</span>
                    </div>
                    <span className="text-[10px] font-bold text-purple-600 dark:text-purple-300 bg-white dark:bg-purple-950 px-1.5 py-0.5 rounded border border-purple-200 dark:border-purple-800">Dual AI</span>
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
                    {is_gemini_connected ? (
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.5 rounded">
                        {gemini_key_count > 1 ? `${gemini_key_count}개 등록됨` : '등록됨'}
                      </span>
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
                      handle_workspace_change('medical_institution');
                      set_is_admin_open(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition"
                  >
                    <div className="flex items-center space-x-2">
                      <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
                      <span className="text-slate-700 dark:text-slate-200 font-medium">전국 데이터 전체 업데이트</span>
                    </div>
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-950 px-1.5 py-0.5 rounded">
                      214개소
                    </span>
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
