'use client';

import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Building2,
  Activity,
  HeartPulse,
  Users,
  ShieldCheck,
  FileText,
  Sparkles,
  BarChart3,
  GitCompare,
  TrendingUp,
  AlertTriangle,
  Stethoscope,
  Database,
  Search,
  MessageSquare,
  Baby,
  Pill,
  MapPin,
  Compass,
} from 'lucide-react';
import { 워크스페이스_타입 } from './글로벌_공공_헤더';
import { 사용자_역할_타입 } from '@/lib/사용자_역할_타입';

export interface 대상자별_메뉴_항목 {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: string;
  badgeColor?: string;
  workspace: 워크스페이스_타입;
  subtab?: string;
  desc?: string;
}

export interface 대상자_그룹 {
  role: 사용자_역할_타입;
  title: string;
  shortTitle: string;
  icon: string;
  desc: string;
  themeColor: {
    bg: string;
    border: string;
    text: string;
    activeText: string;
    ring: string;
    cardBg: string;
    badgeBg: string;
  };
  menus: 대상자별_메뉴_항목[];
}

export const 대상자별_메뉴_데이터: 대상자_그룹[] = [
  {
    role: 'citizen',
    title: '국민 (일반시민·환자)',
    shortTitle: '국민',
    icon: '👨‍👩‍👧',
    desc: '내 주변 안심의료 검색 & 실시간 병상',
    themeColor: {
      bg: 'bg-rose-500',
      border: 'border-rose-200 dark:border-rose-900/60',
      text: 'text-rose-600 dark:text-rose-400',
      activeText: 'text-rose-700 dark:text-rose-300 font-black',
      ring: 'ring-rose-400/30',
      cardBg: 'from-rose-50/80 to-pink-50/40 dark:from-rose-950/30 dark:to-pink-950/10',
      badgeBg: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300',
    },
    menus: [
      {
        id: 'citizen_home',
        label: '국민안심 서비스 홈',
        icon: <HeartPulse className="w-4 h-4 text-rose-500" />,
        badge: '실시간',
        badgeColor: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
        workspace: 'national_safety',
        desc: '5대 안심의료 검색 & 실시간 가용병상',
      },
      {
        id: 'citizen_emergency',
        label: '응급실 실시간 병상',
        icon: <Activity className="w-4 h-4 text-rose-500" />,
        workspace: 'national_safety',
        desc: 'E-Gen 응급실·중환자실 잔여 병상 & 119',
      },
      {
        id: 'citizen_pediatric_maternity',
        label: '소아·분만 특화 병원',
        icon: <Baby className="w-4 h-4 text-pink-500" />,
        badge: '114곳',
        badgeColor: 'bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300',
        workspace: 'national_safety',
        desc: '달빛어린이병원 & 분만가능 의료기관',
      },
      {
        id: 'citizen_pharmacy',
        label: '야간·휴일 약국 찾기',
        icon: <Pill className="w-4 h-4 text-amber-500" />,
        workspace: 'national_safety',
        desc: '심야 약국 위치 및 운영시간 안내',
      },
      {
        id: 'citizen_ai_chat',
        label: '국민안심 AI 비서',
        icon: <MessageSquare className="w-4 h-4 text-rose-600" />,
        workspace: 'national_safety',
        desc: '자연어 증상 상담 및 가까운 병원 추천',
      },
    ],
  },
  {
    role: 'hospital',
    title: '의료기관 담당자 (공공병원)',
    shortTitle: '의료기관',
    icon: '🏥',
    desc: '41개 공공병원 AI 종합진단 & 자원관리',
    themeColor: {
      bg: 'bg-blue-600',
      border: 'border-blue-200 dark:border-blue-900/60',
      text: 'text-blue-600 dark:text-blue-400',
      activeText: 'text-blue-700 dark:text-blue-300 font-black',
      ring: 'ring-blue-400/30',
      cardBg: 'from-blue-50/80 to-cyan-50/40 dark:from-blue-950/30 dark:to-cyan-950/10',
      badgeBg: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
    },
    menus: [
      {
        id: 'hosp_ai_diag',
        label: 'AI 병원 종합진단',
        icon: <Sparkles className="w-4 h-4 text-amber-400" />,
        badge: 'AI분석',
        badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
        workspace: 'hospital_ai_diagnosis',
        subtab: 'diagnosis',
        desc: '41개 거점공공병원 6대 지표 종합점수 및 원인분석',
      },
      {
        id: 'hosp_profile_report',
        label: '5종 진단보고서 작성',
        icon: <FileText className="w-4 h-4 text-blue-600" />,
        badge: 'HWP',
        badgeColor: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
        workspace: 'hospital_ai_diagnosis',
        subtab: 'profile_report',
        desc: 'NMC 공식 의료기관 프로파일 5종 보고서 생성',
      },
      {
        id: 'hosp_patient_flow',
        label: '환자 이용 유출입',
        icon: <GitCompare className="w-4 h-4 text-blue-600" />,
        workspace: 'regional_diagnosis',
        desc: '시군구·중진료권 유출입 순위 Top5 & AI 질의',
      },
      {
        id: 'hosp_policy_planning',
        label: 'AI 정책기획 & 미래수요',
        icon: <TrendingUp className="w-4 h-4 text-indigo-600" />,
        workspace: 'policy_planning',
        subtab: 'policy_ai',
        desc: '유사지역 비교, 2030 의료수요 추계, AI 정책대안',
      },
      {
        id: 'hosp_legal_report',
        label: '12대 항목 법정 사업계획서',
        icon: <FileText className="w-4 h-4 text-purple-600" />,
        badge: 'HWPX',
        badgeColor: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
        workspace: 'policy_planning',
        subtab: 'report',
        desc: '복지부 12대 법정 목차 공문서 원클릭 생성',
      },
      {
        id: 'hosp_policy_incentive',
        label: '신포괄 정책가산 계산기',
        icon: <BarChart3 className="w-4 h-4 text-emerald-600" />,
        badge: '1.0% 가산',
        badgeColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
        workspace: 'medical_institution',
        subtab: 'policy_incentive',
        desc: 'CP 운영 가산율 및 연간 추가수익 시뮬레이터',
      },
      {
        id: 'hosp_cp_library',
        label: '71개 표준진료지침(CP)',
        icon: <Stethoscope className="w-4 h-4 text-blue-500" />,
        workspace: 'medical_institution',
        subtab: 'cp_library',
        desc: 'NMC 공인 71개 다빈도 질환 표준임상경로',
      },
      {
        id: 'hosp_cp_roi',
        label: 'CP 변이분석 & ROI',
        icon: <TrendingUp className="w-4 h-4 text-indigo-500" />,
        workspace: 'medical_institution',
        subtab: 'cp_variance',
        desc: '표준재원일수 초과 변이 및 병상회전율 재정효과',
      },
      {
        id: 'hosp_discharge_care',
        label: '퇴원환자 돌봄 매칭',
        icon: <Users className="w-4 h-4 text-purple-500" />,
        workspace: 'medical_institution',
        subtab: 'discharge_care',
        desc: '4단계 퇴원지원 평가 및 보건복지 연계의뢰서',
      },
    ],
  },
  {
    role: 'nmc',
    title: 'NMC 업무 담당자 (중앙·지원단)',
    shortTitle: 'NMC 담당자',
    icon: '🏛️',
    desc: '전국 250개 시군구 헬스맵 관제 & 경영·공시',
    themeColor: {
      bg: 'bg-indigo-600',
      border: 'border-indigo-200 dark:border-indigo-900/60',
      text: 'text-indigo-600 dark:text-indigo-400',
      activeText: 'text-indigo-700 dark:text-indigo-300 font-black',
      ring: 'ring-indigo-400/30',
      cardBg: 'from-indigo-50/80 to-purple-50/40 dark:from-indigo-950/30 dark:to-purple-950/10',
      badgeBg: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300',
    },
    menus: [
      {
        id: 'nmc_regional_diag',
        label: '전국 250개 시군구 지역진단',
        icon: <Compass className="w-4 h-4 text-indigo-600" />,
        badge: 'GIS 35:65',
        badgeColor: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300',
        workspace: 'regional_diagnosis',
        desc: '응급·분만·소아 3대 필수의료 취약도 지도',
      },
      {
        id: 'nmc_crisis',
        label: '경영위기 조기경보',
        icon: <AlertTriangle className="w-4 h-4 text-amber-500" />,
        badge: '35개소',
        badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
        workspace: 'medical_institution',
        subtab: 'crisis',
        desc: '지방의료원 부채비율·의업수지 4단계 경보',
      },
      {
        id: 'nmc_disclosure',
        label: '알리미 공시 사전검증',
        icon: <ShieldCheck className="w-4 h-4 text-emerald-600" />,
        workspace: 'medical_institution',
        subtab: 'aa_disclosure',
        desc: '14대 회계산출식 검증, PII 비식별화, 소명서 생성',
      },
      {
        id: 'nmc_plan_eval',
        label: '시행계획·추진실적 AI 평가',
        icon: <ShieldCheck className="w-4 h-4 text-amber-500" />,
        badge: '100점',
        badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
        workspace: 'policy_planning',
        subtab: 'evaluation',
        desc: '17개 시도·8개 부처 평가표 산출 & 6단계 AI 심사',
      },
      {
        id: 'nmc_datacenter',
        label: '214개 공공병원 데이터센터',
        icon: <Database className="w-4 h-4 text-emerald-600" />,
        workspace: 'medical_institution',
        subtab: 'datacenter',
        desc: '전국 공공병원 E-Gen 실시간 연계 및 자원 관제',
      },
      {
        id: 'nmc_ai_studio',
        label: '듀얼 AI 분석 스튜디오',
        icon: <Sparkles className="w-4 h-4 text-indigo-500" />,
        workspace: 'ai_analysis',
        desc: 'Cloud Gemini vs 원내 sLLM 추론 & 지침 RAG',
      },
    ],
  },
];

interface 대상자별_좌측_사이드바_속성 {
  is_collapsed: boolean;
  on_toggle_collapse: () => void;
  current_role: 사용자_역할_타입;
  on_select_role: (role: 사용자_역할_타입) => void;
  current_workspace: 워크스페이스_타입;
  current_subtab?: string;
  on_navigate_workspace: (
    workspace: 워크스페이스_타입,
    subtab?: string
  ) => void;
}

export const 대상자별_좌측_사이드바: React.FC<대상자별_좌측_사이드바_속성> = ({
  is_collapsed,
  on_toggle_collapse,
  current_role,
  on_select_role,
  current_workspace,
  current_subtab,
  on_navigate_workspace,
}) => {
  // 열려있는 아코디언 그룹들 (기본적으로 모두 열림)
  const [open_groups, set_open_groups] = useState<Record<string, boolean>>({
    citizen: true,
    hospital: true,
    nmc: true,
  });

  // 역할 또는 워크스페이스 변경 시 해당 역할 그룹을 펼치고 사이드바 스크롤을 최상단으로 리셋
  useEffect(() => {
    if (current_role && current_role !== 'all') {
      set_open_groups((prev) => ({
        ...prev,
        [current_role]: true,
      }));
    }
    const sidebar = document.getElementById('sidebar-scroll-container');
    if (sidebar) {
      sidebar.scrollTop = 0;
    }
  }, [current_role, current_workspace]);

  const toggle_group = (roleKey: string) => {
    set_open_groups((prev) => ({
      ...prev,
      [roleKey]: !prev[roleKey],
    }));
  };

  return (
    <aside
      className={`h-full min-h-[calc(100vh-7.5rem)] bg-white dark:bg-[#12141a] border-r border-slate-200 dark:border-slate-800 transition-all duration-300 ease-in-out shrink-0 z-20 flex flex-col sticky top-0 self-start ${
        is_collapsed ? 'w-14' : 'w-72 sm:w-80'
      }`}
    >
      {/* 1. 사이드바 상단 헤더: 접기/펼치기 토글 버튼 */}
      <div className="h-12 border-b border-slate-200 dark:border-slate-800 px-3 flex items-center justify-between shrink-0 bg-slate-50/80 dark:bg-slate-900/60">
        {!is_collapsed ? (
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="text-xs font-black text-slate-800 dark:text-slate-200 tracking-tight flex items-center gap-1.5 whitespace-nowrap">
              <span className="text-base">📋</span>
              <span>대상자별 맞춤 메뉴</span>
            </span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-bold whitespace-nowrap">
              3종 구분
            </span>
          </div>
        ) : (
          <span className="text-base mx-auto" title="대상자별 맞춤 메뉴">
            📋
          </span>
        )}

        <button
          type="button"
          onClick={on_toggle_collapse}
          className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition cursor-pointer shrink-0"
          title={is_collapsed ? '메뉴 펼치기' : '메뉴 접기'}
        >
          {is_collapsed ? (
            <ChevronRight className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          ) : (
            <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500">
              <span>접기</span>
              <ChevronLeft className="w-3.5 h-3.5" />
            </div>
          )}
        </button>
      </div>

      {/* 2. 접혔을 때 (Collapsed Icon Rail View) */}
      {is_collapsed ? (
        <div className="flex-1 py-3 px-1.5 flex flex-col items-center gap-2 overflow-y-auto">
          {/* 전체보기 홈 아이콘 바로가기 */}
          <div className="w-full flex flex-col items-center gap-1">
            <button
              type="button"
              onClick={() => {
                on_select_role('all');
                on_navigate_workspace('home');
              }}
              className={`w-10 h-10 rounded-2xl flex items-center justify-center text-base transition-all cursor-pointer shadow-xs ${
                current_workspace === 'home' && current_role === 'all'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 ring-2 ring-slate-400/40 scale-105'
                  : 'bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
              title="플랫폼 종합 홈 (전체보기)"
            >
              <span>🌐</span>
            </button>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 text-center leading-tight">
              전체홈
            </span>
            <div className="w-6 h-px bg-slate-200 dark:bg-slate-800 my-1" />
          </div>

          {대상자별_메뉴_데이터.map((group) => {
            const isRoleActive = current_role === group.role;
            return (
              <div key={group.role} className="w-full flex flex-col items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    on_select_role(group.role);
                    on_toggle_collapse(); // 누르면 펼쳐서 상세를 보여줌
                  }}
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg transition-all cursor-pointer shadow-xs ${
                    isRoleActive
                      ? `${group.themeColor.bg} text-white ring-2 ring-blue-400/40 scale-105`
                      : 'bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                  title={`${group.title} (클릭 시 펼치기)`}
                >
                  <span>{group.icon}</span>
                </button>
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 text-center leading-tight">
                  {group.shortTitle}
                </span>
                <div className="w-6 h-px bg-slate-200 dark:bg-slate-800 my-1.5" />
              </div>
            );
          })}
        </div>
      ) : (
        /* 3. 펼쳐졌을 때 (Expanded Detailed Sidebar View) */
        <div id="sidebar-scroll-container" className="flex-1 overflow-y-auto p-3 space-y-4">
          {/* 전체보기 복귀 바로가기 */}
          <button
            type="button"
            onClick={() => {
              on_select_role('all');
              on_navigate_workspace('home');
            }}
            className={`w-full p-2.5 rounded-2xl border text-xs font-bold transition flex items-center justify-between cursor-pointer ${
              current_workspace === 'home' && current_role === 'all'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 shadow-xs'
                : 'bg-slate-50 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-base">🌐</span>
              <span>플랫폼 종합 홈 (전체보기)</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* 3대 대상자별 아코디언 그룹 목록 */}
          {대상자별_메뉴_데이터.map((group) => {
            const isGroupOpen = open_groups[group.role] !== false;
            const isRoleSelected = current_role === group.role;

            return (
              <div
                key={group.role}
                className={`rounded-3xl border transition-all ${
                  isRoleSelected
                    ? `${group.themeColor.border} bg-gradient-to-b ${group.themeColor.cardBg} shadow-xs ring-2 ${group.themeColor.ring}`
                    : 'border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-[#151720]'
                }`}
              >
                {/* 그룹 헤더 */}
                <div
                  onClick={() => toggle_group(group.role)}
                  className="p-3.5 flex items-center justify-between cursor-pointer select-none group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-xl shrink-0 group-hover:scale-110 transition-transform">
                      {group.icon}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-black text-slate-900 dark:text-white truncate">
                          {group.title}
                        </span>
                        {isRoleSelected && (
                          <span className={`text-[9px] font-black px-1.5 py-0.2 rounded ${group.themeColor.badgeBg}`}>
                            현재 선택
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {group.desc}
                      </p>
                    </div>
                  </div>

                  <div className="p-1 rounded-lg text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 shrink-0">
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${isGroupOpen ? 'rotate-180' : ''}`}
                    />
                  </div>
                </div>

                {/* 그룹 내 세부 메뉴 목록 */}
                {isGroupOpen && (
                  <div className="px-2 pb-2.5 space-y-1 border-t border-slate-100 dark:border-slate-800/60 pt-2">
                    {group.menus.map((item) => {
                      const isMenuSelected =
                        current_role === group.role &&
                        current_workspace === item.workspace &&
                        (!item.subtab || (current_subtab ? item.subtab === current_subtab : true));

                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            on_select_role(group.role);
                            on_navigate_workspace(item.workspace, item.subtab);
                          }}
                          className={`w-full p-2 rounded-xl text-left transition flex items-center justify-between gap-2 cursor-pointer ${
                            isMenuSelected
                              ? 'bg-white dark:bg-slate-850 shadow-xs border border-slate-200 dark:border-slate-700 text-slate-950 dark:text-white'
                              : 'hover:bg-slate-100/80 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="shrink-0">{item.icon}</span>
                            <div className="min-w-0">
                              <span className="text-xs font-bold block truncate">
                                {item.label}
                              </span>
                              {item.desc && (
                                <span className="text-[10px] text-slate-400 block truncate leading-tight">
                                  {item.desc}
                                </span>
                              )}
                            </div>
                          </div>

                          {item.badge && (
                            <span
                              className={`text-[9px] font-black px-1.5 py-0.5 rounded-full shrink-0 ${
                                item.badgeColor || 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </aside>
  );
};
