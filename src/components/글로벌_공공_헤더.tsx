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
  Building2,
  FileText,
  Brain,
  HeartHandshake,
  Users,
  Compass,
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
  active_domain: 메인_도메인;
  on_select_domain: (domain: 메인_도메인) => void;
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
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      {/* 1. 상단 글로벌 네비게이션 바 */}
      <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between gap-4">
          {/* 브랜드 로고 및 시스템 타이틀 */}
          <div
            onClick={() => on_select_domain('status_diag')}
            className="flex items-center space-x-3 cursor-pointer select-none shrink-0"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#003366] via-[#0055a5] to-[#0088cc] flex items-center justify-center text-white shadow-sm ring-1 ring-white/20">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-bold tracking-wider text-[#0055a5] dark:text-[#38bdf8] uppercase">
                  National Medical Center
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold border border-slate-200 dark:border-slate-700">
                  공공보건의료
                </span>
              </div>
              <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                필수의료 헬스맵
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 hidden md:inline">
                  | 정책의사결정지원 AI 플랫폼
                </span>
              </h1>
            </div>
          </div>

          {/* 중앙: 6대 업무 도메인 네비게이션 */}
          <nav className="hidden lg:flex items-center space-x-1">
            <button
              onClick={() => on_select_domain('status_diag')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center space-x-1.5 ${
                active_domain === 'status_diag'
                  ? 'bg-[#003366] text-white shadow-sm dark:bg-[#0284c7]'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>현황진단</span>
            </button>

            <button
              onClick={() => on_select_domain('ai_analysis')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center space-x-1.5 ${
                active_domain === 'ai_analysis'
                  ? 'bg-[#003366] text-white shadow-sm dark:bg-[#0284c7]'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Brain className="w-4 h-4" />
              <span>AI 분석</span>
            </button>

            <button
              onClick={() => on_select_domain('policy_plan')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center space-x-1.5 ${
                active_domain === 'policy_plan'
                  ? 'bg-[#003366] text-white shadow-sm dark:bg-[#0284c7]'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>정책기획</span>
            </button>

            <button
              onClick={() => on_select_domain('field_manage')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center space-x-1.5 ${
                active_domain === 'field_manage'
                  ? 'bg-[#003366] text-white shadow-sm dark:bg-[#0284c7]'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>현장관리</span>
            </button>

            <button
              onClick={() => on_select_domain('citizen_svc')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center space-x-1.5 ${
                active_domain === 'citizen_svc'
                  ? 'bg-[#003366] text-white shadow-sm dark:bg-[#0284c7]'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>국민서비스</span>
            </button>

            <div className="h-5 w-px bg-slate-200 dark:bg-slate-700 mx-1" />

            {/* 신규 29번: MY 의료기관 대시보드 강조 버튼 */}
            <button
              onClick={() => on_select_domain('my_hospital')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center space-x-1.5 ring-1 ${
                active_domain === 'my_hospital'
                  ? 'bg-teal-700 text-white shadow-sm ring-teal-700 dark:bg-teal-600'
                  : 'bg-teal-50 text-teal-800 hover:bg-teal-100 dark:bg-teal-950/50 dark:text-teal-300 ring-teal-200 dark:ring-teal-800'
              }`}
              title="의료기관 담당자 전용 대시보드"
            >
              <HeartHandshake className="w-4 h-4" />
              <span>MY 의료기관</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </button>
          </nav>

          {/* 우측 유틸리티: 검색 / 알림 / 테마 / 관리자 */}
          <div className="flex items-center space-x-2 shrink-0">
            {/* 시군구 빠른 검색 */}
            <form onSubmit={handle_search_submit} className="relative hidden xl:block w-48">
              <input
                type="text"
                value={search_text}
                onChange={(e) => set_search_text(e.target.value)}
                placeholder="지역·의료원 검색..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#003366]/30 dark:focus:ring-sky-500/30 transition"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </form>

            {/* 실시간 알림 팝오버 버튼 */}
            <div className="relative" ref={noti_ref}>
              <button
                type="button"
                onClick={() => set_is_noti_open(!is_noti_open)}
                className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition relative"
                title="시스템 공지 및 RAG 업데이트 알림"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
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
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title={is_dark_mode ? '화이트 테마로 전환' : '블랙 테마로 전환'}
            >
              {is_dark_mode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* 관리자 & 데이터 설정 드롭다운 (19번 요건: 개발자용 기능 분리 정돈) */}
            <div className="relative" ref={admin_ref}>
              <button
                type="button"
                onClick={() => set_is_admin_open(!is_admin_open)}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition"
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

      {/* 2. 하위 서브 도메인 탭 바 (각 6대 영역별 서브 메뉴) */}
      <div className="bg-slate-50/90 dark:bg-[#0b1329]/90 border-t border-slate-200/80 dark:border-slate-800/80 px-4 sm:px-6 lg:px-8 py-2">
        <div className="max-w-[1720px] mx-auto flex items-center justify-between overflow-x-auto text-xs">
          <div className="flex items-center space-x-2 shrink-0">
            {active_domain === 'status_diag' && (
              <>
                <span className="font-bold text-slate-700 dark:text-slate-300 mr-1">현황진단:</span>
                <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 text-[#003366] dark:text-sky-400 font-bold border border-slate-200 dark:border-slate-700 shadow-2xs">
                  🗺️ 필수의료 헬스맵 (GIS 65:35)
                </span>
                <span className="px-2.5 py-1 rounded-lg text-slate-600 dark:text-slate-400">
                  📊 취약지 종합 진단 &amp; 사분면
                </span>
                <span className="px-2.5 py-1 rounded-lg text-slate-600 dark:text-slate-400">
                  ⚖️ 지자체 1:1 비교
                </span>
                <span className="px-2.5 py-1 rounded-lg text-slate-600 dark:text-slate-400">
                  🏥 실시간 의료자원 모니터링
                </span>
              </>
            )}

            {active_domain === 'ai_analysis' && (
              <>
                <span className="font-bold text-slate-700 dark:text-slate-300 mr-1">AI 분석:</span>
                <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 text-[#003366] dark:text-sky-400 font-bold border border-slate-200 dark:border-slate-700 shadow-2xs">
                  🤖 듀얼 AI 지역진단 (Gemini × sLLM)
                </span>
                <span className="px-2.5 py-1 rounded-lg text-slate-600 dark:text-slate-400">
                  📈 2030 의료수요 추계
                </span>
                <span className="px-2.5 py-1 rounded-lg text-slate-600 dark:text-slate-400">
                  ⚠️ 35개 지방의료원 경영위기 조기경보
                </span>
              </>
            )}

            {active_domain === 'policy_plan' && (
              <>
                <span className="font-bold text-slate-700 dark:text-slate-300 mr-1">정책기획:</span>
                <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 text-[#003366] dark:text-sky-400 font-bold border border-slate-200 dark:border-slate-700 shadow-2xs">
                  📝 복지부 공모 표준 사업계획서 자동생성
                </span>
                <span className="px-2.5 py-1 rounded-lg text-slate-600 dark:text-slate-400">
                  💡 RAG 지침 기반 정책 대안 설계
                </span>
                <span className="px-2.5 py-1 rounded-lg text-slate-600 dark:text-slate-400">
                  🎯 성과지표 추천 및 환각 검증
                </span>
              </>
            )}

            {active_domain === 'field_manage' && (
              <>
                <span className="font-bold text-slate-700 dark:text-slate-300 mr-1">현장관리:</span>
                <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 text-[#003366] dark:text-sky-400 font-bold border border-slate-200 dark:border-slate-700 shadow-2xs">
                  🏢 35개 지방의료원 경영 성과 모니터링
                </span>
                <span className="px-2.5 py-1 rounded-lg text-slate-600 dark:text-slate-400">
                  🤝 퇴원환자 지역사회 돌봄자원 AI 매칭
                </span>
                <span className="px-2.5 py-1 rounded-lg text-slate-600 dark:text-slate-400">
                  🔗 지역 공공보건의료 연계 체계
                </span>
              </>
            )}

            {active_domain === 'citizen_svc' && (
              <>
                <span className="font-bold text-slate-700 dark:text-slate-300 mr-1">국민서비스:</span>
                <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 text-[#003366] dark:text-sky-400 font-bold border border-slate-200 dark:border-slate-700 shadow-2xs">
                  🚑 일반국민 안심 공공병원 안내
                </span>
                <span className="px-2.5 py-1 rounded-lg text-slate-600 dark:text-slate-400">
                  🌙 달빛어린이병원 &amp; 야간진료소
                </span>
                <span className="px-2.5 py-1 rounded-lg text-slate-600 dark:text-slate-400">
                  📱 모바일 퇴원돌봄 알리미
                </span>
              </>
            )}

            {active_domain === 'my_hospital' && (
              <>
                <span className="font-bold text-teal-800 dark:text-teal-300 mr-1">MY 의료기관:</span>
                <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 text-teal-800 dark:text-teal-300 font-bold border border-teal-200 dark:border-teal-800 shadow-2xs">
                  🏥 우리 의료기관 운영 현황 &amp; KPI
                </span>
                <span className="px-2.5 py-1 rounded-lg text-slate-600 dark:text-slate-400">
                  📈 12개월 추세 분석
                </span>
                <span className="px-2.5 py-1 rounded-lg text-slate-600 dark:text-slate-400">
                  ⚖️ 유사 의료기관 비교
                </span>
                <span className="px-2.5 py-1 rounded-lg text-slate-600 dark:text-slate-400">
                  🤖 AI 우리 병원 분석 &amp; 개선과제
                </span>
              </>
            )}
          </div>

          <div className="hidden md:flex items-center space-x-2 text-[11px] text-slate-500 dark:text-slate-400 shrink-0">
            <span>데이터 기준일 : 2026.09</span>
            <span>•</span>
            <span>출처 : 국립중앙의료원</span>
            <span>•</span>
            <span>갱신주기 : 월 1회</span>
          </div>
        </div>
      </div>
    </header>
  );
};
