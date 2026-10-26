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
  MapPin,
  Compass,
  Share2,
  Sliders,
} from 'lucide-react';
import { 워크스페이스_타입 } from './글로벌_공공_헤더';
import { 사용자_역할_타입 } from '@/lib/사용자_역할_타입';
import {
  서브탭_찾기,
  type 페르소나_서브탭,
} from '@/lib/페르소나_메뉴_구조';

export type 사이드바_대분류_키 = 'citizen' | 'hospital' | 'nmc';

export interface 대상자별_메뉴_항목 {
  id: string; // 서브탭 id ('1-1' ~ '3-4')
  subtabId: string;
  category?: string;
  label: string;
  icon: React.ReactNode;
  badge?: string;
  badgeColor?: string;
  workspace: 워크스페이스_타입;
  subtab?: string;
  desc?: string;
  isCustomPage?: boolean;
}

export interface 대상자_그룹 {
  role: 사이드바_대분류_키;
  title: string;
  shortTitle: string;
  icon: string;
  desc: string;
  headerStyle: {
    container: string;
    iconBg: string;
    titleColor: string;
    badgeBg: string;
    border: string;
  };
  menus: 대상자별_메뉴_항목[];
}

// ============================================================================
// 상단·중앙·좌측 100% 동일 일치화 메뉴 구조 (3대 페르소나 · 14개 서브탭)
// - ① 대국민 (4개): 1-1, 1-2, 1-3, 1-4
// - ② 의료기관 담당자 (6개): 2-1, 2-2, 2-3, 2-4, 2-5, 2-6(신포괄 계산기 승격)
// - ③ 국립중앙의료원·복지부 (4개): 3-1, 3-2, 3-3, 3-4(환자 유출입 OD 분석 승격)
// ============================================================================
export const 신규_메뉴_구조_데이터: 대상자_그룹[] = [
  // 1. 대국민 (안심의료) - 4개 서브탭
  {
    role: 'citizen',
    title: '① 대국민 (안심의료)',
    shortTitle: '대국민',
    icon: '👨‍👩‍👧',
    desc: '필수의료 실시간 찾기 및 안심의료 AI 안내',
    headerStyle: {
      container:
        'bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 text-white border-rose-500/50 hover:border-rose-400 shadow-sm',
      iconBg: 'bg-rose-600/30 border border-rose-400/40 text-rose-300',
      titleColor: 'text-white',
      badgeBg: 'bg-rose-500/25 text-rose-200 border border-rose-400/30',
      border: 'border-rose-200/80 dark:border-rose-900/60',
    },
    menus: [
      {
        id: '1-1',
        subtabId: '1-1',
        category: '안심의료',
        label: '1-1. 지금 필요한 공공의료기관 찾기',
        icon: <MapPin className="w-4 h-4 text-rose-500 shrink-0" />,
        badge: '지도검색',
        badgeColor: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
        workspace: 'persona_page',
        desc: '안심의료 지도(현재 위치·길찾기·전화), 응급실·분만·소아 빠른 검색',
        isCustomPage: true,
      },
      {
        id: '1-2',
        subtabId: '1-2',
        category: '안심의료',
        label: '1-2. 우리 동네 응급실·소아 진료 현황',
        icon: <HeartPulse className="w-4 h-4 text-rose-500 shrink-0" />,
        badge: '실시간 E-Gen',
        badgeColor: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
        workspace: 'persona_page',
        desc: '실시간 응급실·소아병상 모니터링, 시군구별 기관 수 그리드',
        isCustomPage: true,
      },
      {
        id: '1-3',
        subtabId: '1-3',
        category: '공시비교',
        label: '1-3. 우리 지역 공공병원 알리미 비교',
        icon: <Building2 className="w-4 h-4 text-rose-500 shrink-0" />,
        badge: '공시비교',
        badgeColor: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
        workspace: 'persona_page',
        desc: '영월·삼척의료원·태백병원 필수의료 운영·취약계층 감면 비교',
        isCustomPage: true,
      },
      {
        id: '1-4',
        subtabId: '1-4',
        category: 'AI안내',
        label: '1-4. 대국민 공공의료 AI 안내 도우미',
        icon: <Sparkles className="w-4 h-4 text-rose-500 shrink-0" />,
        badge: 'AI 안내',
        badgeColor: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
        workspace: 'persona_page',
        desc: '공개정보 AI 안내 챗봇: 응급실·달빛병원 안내 및 근거 출처 표시',
        isCustomPage: true,
      },
    ],
  },

  // 2. 의료기관 담당자 - 6개 서브탭 (업무 흐름: AI정책의사결정·계획수립 원스톱 ➔ 경영 ➔ 인센티브 ➔ 돌봄 ➔ 모자 ➔ 지침)
  {
    role: 'hospital',
    title: '② 의료기관 담당자',
    shortTitle: '의료기관',
    icon: '🏥',
    desc: 'AI 정책 의사결정 & 계획수립, 경영 및 인센티브, 돌봄·모자 연계',
    headerStyle: {
      container:
        'bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white border-blue-500/50 hover:border-blue-400 shadow-sm',
      iconBg: 'bg-blue-600/30 border border-blue-400/40 text-blue-300',
      titleColor: 'text-white',
      badgeBg: 'bg-blue-500/25 text-blue-200 border border-blue-400/30',
      border: 'border-blue-200/80 dark:border-blue-900/60',
    },
    menus: [
      {
        id: '2-1',
        subtabId: '2-1',
        category: '의사결정',
        label: '2-1. AI 정책 의사결정 & 계획수립 원스톱',
        icon: <Share2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />,
        badge: '진단·HWPX',
        badgeColor: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
        workspace: 'regional_diagnosis',
        desc: '진료권 진단·환자 유출입(OD) ➔ 1:1 비교 ➔ 2030 수요 ➔ AI 대안 ➔ 12대 항목 HWPX 계획서 완성',
      },
      {
        id: '2-2',
        subtabId: '2-2',
        category: '경영개선',
        label: '2-2. 경영 벤치마킹 & 공시·시설장비 사전검증',
        icon: <BarChart3 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />,
        badge: '사전검증',
        badgeColor: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
        workspace: 'persona_page',
        desc: '동일 규모 지방의료원 비교군 벤치마킹, ERP 공시 대조 사전검증',
        isCustomPage: true,
      },
      {
        id: '2-3',
        subtabId: '2-3',
        category: '인센티브',
        label: '2-3. 신포괄수가 정책가산 인센티브 계산기',
        icon: <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />,
        badge: '가산 모의계산',
        badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
        workspace: 'medical_institution',
        subtab: 'policy_incentive',
        desc: '공공성 평가 및 표준진료지침 기반 정부 정책가산 지원금 모의계산',
      },
      {
        id: '2-4',
        subtabId: '2-4',
        category: '퇴원돌봄',
        label: '2-4. 퇴원환자 케어플랜·돌봄자원 매칭 AI',
        icon: <Users className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />,
        badge: '돌봄 연계',
        badgeColor: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
        workspace: 'persona_page',
        desc: '퇴원환자 4단계 평가·케어플랜(ADL 10개 영역), 최적 돌봄자원 매칭',
        isCustomPage: true,
      },
      {
        id: '2-5',
        subtabId: '2-5',
        category: '모자전원',
        label: '2-5. 고위험 산모·신생아 전원의뢰·수용 매칭',
        icon: <Compass className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />,
        badge: '전원 매칭',
        badgeColor: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
        workspace: 'persona_page',
        desc: '중증도×이송시간×수용확률 점수 기반 권역 수용기관 TOP 3 추천',
        isCustomPage: true,
      },
      {
        id: '2-6',
        subtabId: '2-6',
        category: '지침Q&A',
        label: '2-6. 책임의료기관 사업지침 AI 질의응답',
        icon: <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />,
        badge: '331쪽 RAG',
        badgeColor: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
        workspace: 'persona_page',
        desc: '2026 책임의료기관 통합 지침 원문(331쪽) 근거 페이지 발췌 답변',
        isCustomPage: true,
      },
    ],
  },

  // 3. 국립중앙의료원·복지부 - 4개 서브탭 (업무 흐름: 통계DW ➔ 투자배분 ➔ 공시심사 ➔ 시행계획 100점 심사평가)
  {
    role: 'nmc',
    title: '③ 보건복지부·지원단/NMC',
    shortTitle: '중앙·NMC',
    icon: '🏛️',
    desc: '전국 정책통계 DW 분석, 기능보강 투자배분, 통합 공시심사 및 시행계획 100점 심사평가',
    headerStyle: {
      container:
        'bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border-indigo-500/50 hover:border-indigo-400 shadow-sm',
      iconBg: 'bg-indigo-600/30 border border-indigo-400/40 text-indigo-300',
      titleColor: 'text-white',
      badgeBg: 'bg-indigo-500/25 text-indigo-200 border border-indigo-400/30',
      border: 'border-indigo-200/80 dark:border-indigo-900/60',
    },
    menus: [
      {
        id: '3-1',
        subtabId: '3-1',
        category: '통계DW',
        label: '3-1. 전국 취약지 정책통계 & 통합 DW 분석',
        icon: <Activity className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />,
        badge: '통합 DW',
        badgeColor: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300',
        workspace: 'persona_page',
        desc: '250개 시군구 취약지 식별, 내장 Text-to-SQL, AI 파이프라인 관제',
        isCustomPage: true,
      },
      {
        id: '3-2',
        subtabId: '3-2',
        category: '투자배분',
        label: '3-2. 기능보강 투자배분 & 중앙모자의료 관제',
        icon: <Sliders className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />,
        badge: '투자 시뮬레이션',
        badgeColor: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300',
        workspace: 'persona_page',
        desc: '투자 우선순위 시뮬레이터(수요×활용률×유지비), E-Gen 미갱신 경보',
        isCustomPage: true,
      },
      {
        id: '3-3',
        subtabId: '3-3',
        category: '공시심사',
        label: '3-3. 통합 공시심사·이상치 탐지 & 성과 모니터링',
        icon: <BarChart3 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />,
        badge: '교차검증',
        badgeColor: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300',
        workspace: 'persona_page',
        desc: '알리미 교차검증, 이상치 탐지(수정 z-score), 조기경보 모니터링',
        isCustomPage: true,
      },
      {
        id: '3-4',
        subtabId: '3-4',
        category: '시행계획평가',
        label: '3-4. 공공보건의료 시행계획·추진실적 AI 평가 (100점 심사)',
        icon: <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />,
        badge: '100점 심사',
        badgeColor: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300',
        workspace: 'policy_planning',
        subtab: 'evaluation',
        desc: '17개 시·도 및 공공단체 지침 공식 100점 심사표 기반 정량·루브릭 AI 평가 및 심사보고서 생성',
      },
    ],
  },
];

// 하위 호환성을 위해 기존 변수명도 export
export const 대상자별_메뉴_데이터 = 신규_메뉴_구조_데이터;

// ============================================================================
// 레거시 AS-IS 메뉴 데이터 (오분류 교정 내역 안내 및 하위 화면 매핑용 보존)
// ============================================================================
export const 레거시_AS_IS_메뉴_데이터 = [
  { id: 'mn_04_01', label: '전국 214개 공공병원 통합 관제', workspace: 'medical_institution', subtab: 'hospitals' },
  { id: 'mn_04_02', label: '의료기관 AI 자연어 질의응답 (Gemini RAG)', workspace: 'medical_institution', subtab: 'hospitals' },
  { id: 'mn_04_08', label: '공공의료 알리미 경영공시 검증', workspace: 'medical_institution', subtab: 'aa_disclosure' },
  { id: 'mn_01_01', label: '전국 필수의료 취약지 지도', workspace: 'regional_diagnosis' },
  { id: 'mn_01_02', label: '지역별 취약지 등급 필터 & 검색', workspace: 'regional_diagnosis' },
  { id: 'mn_01_03', label: '취약지 종합 지표 매트릭스', workspace: 'regional_diagnosis' },
  { id: 'mn_01_04', label: '환자 의료이용 유출입(OD) 분석', workspace: 'regional_diagnosis' },
  { id: 'mn_02_02', label: '2030 미래 의료수요 AI 추계', workspace: 'policy_planning', subtab: 'forecast' },
  { id: 'mn_02_03', label: '인프라 확충 효과 시뮬레이터', workspace: 'policy_planning', subtab: 'policy_ai' },
  { id: 'mn_01_05', label: '지자체 1:1 비교 갭(Gap) 분석', workspace: 'policy_planning', subtab: 'compare' },
  { id: 'mn_03_01', label: '근거 기반 AI 정책대안 Option A/B/C', workspace: 'policy_planning', subtab: 'policy_ai' },
  { id: 'mn_03_02', label: '시행계획 사업계획서 자동생성기', workspace: 'policy_planning', subtab: 'report' },
  { id: 'mn_03_02_eval', label: '시행계획·추진실적 AI 평가 (100점 심사)', workspace: 'policy_planning', subtab: 'evaluation' },
  { id: 'mn_02_04', label: 'AI 처리 8단계 파이프라인 관제', workspace: 'ai_analysis' },
  { id: 'mn_06_01', label: '우리 의료기관 현황 대시보드', workspace: 'hospital_ai_diagnosis', subtab: 'diagnosis' },
  { id: 'mn_06_01_eval', label: '2025 거점공공병원 운영평가', workspace: 'medical_institution', subtab: 'operation_eval' },
  { id: 'mn_06_01_report', label: '기관프로파일 5종 진단보고서', workspace: 'hospital_ai_diagnosis', subtab: 'profile_report' },
  { id: 'mn_04_06', label: '지방의료원 경영위기 조기경보', workspace: 'medical_institution', subtab: 'crisis' },
  { id: 'mn_06_02', label: 'AI 진료 병목진단 및 개선 제언', workspace: 'hospital_ai_diagnosis', subtab: 'simulation' },
  { id: 'mn_04_04', label: '신포괄수가 정책가산 인센티브 계산기', workspace: 'medical_institution', subtab: 'policy_incentive' },
  { id: 'mn_04_07', label: '퇴원환자 돌봄자원 AI 매칭', workspace: 'medical_institution', subtab: 'discharge_care' },
  { id: 'citizen_main_portal', label: '일반국민 공공병원 맞춤형 포털', workspace: 'national_safety' },
];

export interface 대상자별_좌측_사이드바_속성 {
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
  active_subtab_id?: string | null;
  on_select_persona_subtab?: (subtab: 페르소나_서브탭) => void;
}

export const 대상자별_좌측_사이드바: React.FC<대상자별_좌측_사이드바_속성> = ({
  is_collapsed,
  on_toggle_collapse,
  current_role,
  on_select_role,
  current_workspace,
  current_subtab,
  on_navigate_workspace,
  active_subtab_id,
  on_select_persona_subtab,
}) => {
  // 열려있는 아코디언 그룹들 (기본적으로 모두 열림)
  const [open_groups, set_open_groups] = useState<Record<string, boolean>>({
    citizen: true,
    hospital: true,
    nmc: true,
  });

  // 역할 또는 워크스페이스 변경 시 해당 그룹 자동 확장
  useEffect(() => {
    if (active_subtab_id) {
      if (active_subtab_id.startsWith('1-')) {
        set_open_groups((prev) => ({ ...prev, citizen: true }));
      } else if (active_subtab_id.startsWith('2-')) {
        set_open_groups((prev) => ({ ...prev, hospital: true }));
      } else if (active_subtab_id.startsWith('3-')) {
        set_open_groups((prev) => ({ ...prev, nmc: true }));
      }
      return;
    }

    if (current_role === 'citizen' || current_workspace === 'national_safety') {
      set_open_groups((prev) => ({ ...prev, citizen: true }));
    } else if (
      current_role === 'hospital' ||
      current_workspace === 'regional_diagnosis' ||
      current_workspace === 'hospital_ai_diagnosis' ||
      (current_workspace === 'medical_institution' && current_subtab === 'policy_incentive') ||
      (current_workspace === 'policy_planning' && current_subtab !== 'evaluation')
    ) {
      set_open_groups((prev) => ({ ...prev, hospital: true }));
    } else if (
      current_role === 'nmc' ||
      (current_workspace === 'policy_planning' && current_subtab === 'evaluation') ||
      (current_workspace === 'medical_institution' && current_subtab !== 'policy_incentive')
    ) {
      set_open_groups((prev) => ({ ...prev, nmc: true }));
    }
  }, [active_subtab_id, current_role, current_workspace, current_subtab]);

  const toggle_group = (groupKey: string) => {
    set_open_groups((prev) => ({
      ...prev,
      [groupKey]: !prev[groupKey],
    }));
  };

  const handle_item_click = (item: 대상자별_메뉴_항목) => {
    // 1. 해당 서브탭 객체가 존재하고 페르소나 전환 핸들러가 있으면 바로 실행
    const 찾은서브탭 = 서브탭_찾기(item.subtabId);
    if (찾은서브탭 && on_select_persona_subtab) {
      on_select_persona_subtab(찾은서브탭.서브탭);
      return;
    }

    // 2. 폴백: 기존 네비게이션 방식
    if (item.workspace) {
      on_navigate_workspace(item.workspace, item.subtab);
    }
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
              <span>플랫폼 메뉴</span>
            </span>
          </div>
        ) : (
          <span className="text-base mx-auto" title="공공보건의료 플랫폼 메뉴">
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
          {신규_메뉴_구조_데이터.map((group) => {
            const isGroupActive = current_role === group.role;
            return (
              <div key={group.role} className="w-full flex flex-col items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    on_select_role(group.role);
                    on_toggle_collapse();
                  }}
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg transition-all cursor-pointer shadow-xs ${
                    isGroupActive
                      ? 'bg-blue-600 text-white ring-2 ring-blue-400 scale-105'
                      : 'bg-slate-900 text-white hover:scale-105 border border-slate-700'
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
        <div id="sidebar-scroll-container" className="flex-1 overflow-y-auto p-3 space-y-3.5">
          {신규_메뉴_구조_데이터.map((group) => {
            const isGroupOpen = open_groups[group.role] !== false;

            return (
              <div
                key={group.role}
                className={`rounded-2xl border ${group.headerStyle.border} bg-white dark:bg-[#151720] shadow-sm overflow-hidden transition-all`}
              >
                {/* 🌟 상단/중앙과 일치화된 3대 그룹 헤더 */}
                <div
                  onClick={() => toggle_group(group.role)}
                  className={`p-3 flex items-center justify-between cursor-pointer select-none group border-b ${group.headerStyle.container} transition-all`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center text-base shrink-0 group-hover:scale-110 transition-transform ${group.headerStyle.iconBg}`}
                    >
                      {group.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-xs font-black tracking-tight truncate ${group.headerStyle.titleColor}`}
                        >
                          {group.title}
                        </span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-white/20 text-white font-bold">
                          {group.menus.length}개
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-300 dark:text-slate-400 truncate mt-0.5 font-medium leading-tight opacity-90">
                        {group.desc}
                      </p>
                    </div>
                  </div>

                  <div className="p-1 rounded-lg text-slate-300 group-hover:text-white shrink-0">
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${
                        isGroupOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </div>

                {/* 그룹 내 세부 13개 서브탭 목록 */}
                {isGroupOpen && (
                  <div className="px-2 pb-2.5 pt-1.5 space-y-1 bg-slate-50/50 dark:bg-slate-900/30">
                    {group.menus.map((item) => {
                      // 활성화 여부 판별 (상단/중앙 active_subtab_id와 100% 동기화: 정확히 1개만 활성화)
                      const isSubtabActive = active_subtab_id
                        ? item.subtabId === active_subtab_id
                        : item.id === '2-1' && (current_role === 'hospital' || !current_role)
                        ? current_workspace === 'regional_diagnosis' || (current_workspace === 'policy_planning' && current_subtab !== 'evaluation')
                        : item.workspace !== 'persona_page' &&
                          current_workspace === item.workspace &&
                          (item.subtab ? item.subtab === current_subtab : !current_subtab);

                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handle_item_click(item)}
                          className={`w-full p-2 rounded-xl text-left transition flex items-center justify-between gap-2 cursor-pointer ${
                            isSubtabActive
                              ? 'bg-blue-50/90 dark:bg-blue-950/60 shadow-xs border border-blue-200 dark:border-blue-900 text-blue-950 dark:text-white font-bold ring-1 ring-blue-400/20'
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
                                <span className="text-[10px] text-slate-400 dark:text-slate-500 block truncate leading-tight">
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
