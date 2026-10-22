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
  Database,
  Baby,
  Pill,
  MapPin,
  Compass,
  Award,
  Upload,
  Download,
  Key,
  Share2,
  Sliders,
  Cpu,
  Lock,
  MessageSquare,
  Clock,
  Layers,
} from 'lucide-react';
import { 워크스페이스_타입 } from './글로벌_공공_헤더';
import { 사용자_역할_타입 } from '@/lib/사용자_역할_타입';

export type 사이드바_액션_타입 =
  | 'excel'
  | 'upload'
  | 'grounding'
  | 'key'
  | 'isp'
  | 'auth';

export type 사이드바_대분류_키 = 'internal' | 'external' | 'citizen' | 'admin';

export interface 대상자별_메뉴_항목 {
  id: string;
  menuCode?: string; // 예: MN-01-01
  category?: string; // 중분류 (예: 전반, 통합공시, 지역진단, 계획수립, 경영개선, 연계망)
  label: string;
  icon: React.ReactNode;
  badge?: string;
  badgeColor?: string;
  workspace: 워크스페이스_타입;
  subtab?: string;
  desc?: string;
  actionType?: 사이드바_액션_타입;
}

export interface 대상자_그룹 {
  role: 사이드바_대분류_키;
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

// ============================================================================
// 신규 IA v1.24.0 기준 4대 영역 메뉴 구조 데이터 (삭제 대상 4종 숨김 처리 완료)
// ============================================================================
export const 신규_메뉴_구조_데이터: 대상자_그룹[] = [
  // 1. 내부용 (전반 / 통합공시)
  {
    role: 'internal',
    title: '1. 내부용 (총괄·지원단)',
    shortTitle: '내부용',
    icon: '🏛️',
    desc: '214개 공공병원 통합 관제 및 알리미 공시 검증',
    themeColor: {
      bg: 'bg-indigo-600',
      border: 'border-indigo-200 dark:border-indigo-900/60',
      text: 'text-indigo-600 dark:text-indigo-400',
      activeText: 'text-indigo-700 dark:text-indigo-300 font-black',
      ring: 'ring-indigo-400/30',
      cardBg: 'from-indigo-50/80 to-slate-50/40 dark:from-indigo-950/30 dark:to-slate-950/10',
      badgeBg: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300',
    },
    menus: [
      {
        id: 'mn_04_01',
        menuCode: 'MN-04-01',
        category: '전반',
        label: '전국 214개 공공병원 통합 관제',
        icon: <Building2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />,
        badge: '214개소',
        badgeColor: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300',
        workspace: 'medical_institution',
        subtab: 'hospitals',
        desc: '국립대병원, 지방의료원, 적십자병원 병상·인력 종합 모니터링',
      },
      {
        id: 'mn_04_02',
        menuCode: 'MN-04-02',
        category: '전반',
        label: '의료기관 AI 자연어 질의응답',
        icon: <Sparkles className="w-4 h-4 text-amber-500" />,
        badge: 'Gemini RAG',
        badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
        workspace: 'medical_institution',
        subtab: 'hospitals',
        desc: '경영 지표, 인력 현황, 진료 실적에 대한 실시간 대화식 질의',
      },
      {
        id: 'mn_04_08',
        menuCode: 'MN-04-08',
        category: '통합공시',
        label: '공공의료 알리미 경영공시 검증',
        icon: <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
        badge: '신뢰검증',
        badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
        workspace: 'medical_institution',
        subtab: 'aa_disclosure',
        desc: '알리미 등록 데이터의 누락, 이상치, 회계 불일치 자동 검증',
      },
    ],
  },

  // 2. 외부용 (지역진단 / 계획수립 / 경영개선 / 연계망)
  {
    role: 'external',
    title: '2. 외부용 (지자체·공공병원)',
    shortTitle: '외부용',
    icon: '🏥',
    desc: '지역진단, 계획수립, 경영개선 및 연계망 통합 솔루션',
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
      // 2-1. [지역진단]
      {
        id: 'mn_01_01',
        menuCode: 'MN-01-01',
        category: '지역진단',
        label: '전국 필수의료 취약지 지도',
        icon: <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
        badge: 'GIS 헬스맵',
        badgeColor: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
        workspace: 'regional_diagnosis',
        desc: '17개 시도 및 250개 시군구 필수의료 취약지 등급 시각화',
      },
      {
        id: 'mn_01_02',
        menuCode: 'MN-01-02',
        category: '지역진단',
        label: '지역별 취약지 등급 필터 & 검색',
        icon: <Compass className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
        workspace: 'regional_diagnosis',
        desc: '중증응급/분만취약/소아취약 및 골든타임 60분 도달지역 필터링',
      },
      {
        id: 'mn_01_03',
        menuCode: 'MN-01-03',
        category: '지역진단',
        label: '취약지 종합 지표 매트릭스',
        icon: <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
        workspace: 'regional_diagnosis',
        desc: '응급실 병상수, 분만실 수, 전문의 수, 표준화 사망비 종합 산출',
      },
      {
        id: 'mn_01_04',
        menuCode: 'MN-01-04',
        category: '지역진단',
        label: '환자 의료이용 유출입(OD) 분석',
        icon: <Share2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />,
        badge: 'OD 분석',
        badgeColor: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300',
        workspace: 'regional_diagnosis',
        desc: '타 시도 원정 진료(유출) 및 타지역 환자 유입 이동 패턴 흐름도',
      },

      // 2-2. [계획수립]
      {
        id: 'mn_02_02',
        menuCode: 'MN-02-02',
        category: '계획수립',
        label: '2030 미래 의료수요 AI 추계',
        icon: <TrendingUp className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />,
        badge: '시계열 AI',
        badgeColor: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300',
        workspace: 'policy_planning',
        subtab: 'forecast',
        desc: '인구 고령화 및 질환 역학 기반 2030년 진료과별 입원/외래 수요',
      },
      {
        id: 'mn_02_03',
        menuCode: 'MN-02-03',
        category: '계획수립',
        label: '인프라 확충 효과 시뮬레이터',
        icon: <Sliders className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />,
        workspace: 'policy_planning',
        subtab: 'policy_ai',
        desc: '병상 증설·전문의 확충 시 골든타임 도달률 및 취약지 개선율 예측',
      },
      {
        id: 'mn_01_05',
        menuCode: 'MN-01-05',
        category: '계획수립',
        label: '지자체 1:1 비교 갭(Gap) 분석',
        icon: <GitCompare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />,
        workspace: 'policy_planning',
        subtab: 'compare',
        desc: '기준 지자체와 유사 규모 지자체 간 인프라·재정 레이더 벤치마킹',
      },
      {
        id: 'mn_03_01',
        menuCode: 'MN-03-01',
        category: '계획수립',
        label: '근거 기반 AI 정책대안 패키지',
        icon: <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />,
        badge: 'Option A/B/C',
        badgeColor: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
        workspace: 'policy_planning',
        subtab: 'policy_ai',
        desc: '취약 원인 진단 기반 단기/중기/장기 맞춤형 정책 패키지 자동 도출',
      },
      {
        id: 'mn_03_02',
        menuCode: 'MN-03-02',
        category: '계획수립',
        label: '시행계획 사업계획서 자동생성기',
        icon: <FileText className="w-4 h-4 text-purple-600 dark:text-purple-400" />,
        badge: 'HWPX 빌더',
        badgeColor: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
        workspace: 'policy_planning',
        subtab: 'report',
        desc: '정부 공식 서식(사업개요, 성과지표, 소요예산) 12대 항목 자동 생성',
      },
      {
        // ⭐ 사용자 요구사항 1: 시행계획 AI 평가를 사업계획서 생성 하위 탭으로 귀속
        id: 'mn_03_02_eval',
        menuCode: 'MN-03-02(평가)',
        category: '계획수립',
        label: '↳ 시행계획·추진실적 AI 평가',
        icon: <ShieldCheck className="w-4 h-4 text-amber-500" />,
        badge: '100점 심사',
        badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
        workspace: 'policy_planning',
        subtab: 'evaluation',
        desc: '17개 시도·8개 부처 100점 평가표 산출 및 6단계 AI 심사 연계',
      },
      {
        id: 'mn_02_04',
        menuCode: 'MN-02-04',
        category: '계획수립',
        label: 'AI 처리 8단계 파이프라인 관제',
        icon: <Cpu className="w-4 h-4 text-indigo-500" />,
        workspace: 'ai_analysis',
        desc: '수집→정제→임베딩→색인→RAG→LLM→가드레일→시각화 전주기 모니터링',
      },

      // 2-3. [경영개선]
      {
        id: 'mn_06_01',
        menuCode: 'MN-06-01',
        category: '경영개선',
        label: '우리 의료기관 현황 대시보드',
        icon: <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
        badge: '기관 전용',
        badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
        workspace: 'hospital_ai_diagnosis',
        subtab: 'diagnosis',
        desc: '소속 공공병원의 병상가동률, 의사인력, 외래·입원환자 요약 모니터링',
      },
      {
        // ⭐ 사용자 요구사항 2: 2025 지역거점 공공병원 운영평가를 기관 맞춤 대시보드 서브탭으로 유지
        id: 'mn_06_01_eval',
        menuCode: 'MN-06-01(운영평가)',
        category: '경영개선',
        label: '↳ 2025 거점공공병원 운영평가',
        icon: <Award className="w-4 h-4 text-amber-500" />,
        badge: '77.9점',
        badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
        workspace: 'medical_institution',
        subtab: 'operation_eval',
        desc: '4대 영역 11개 부문 평가결과 및 A등급 개선 시뮬레이터',
      },
      {
        // ⭐ 사용자 요구사항 3: NMC 기관프로파일 5종 진단보고서 자동 생성기를 경영개선 하위 기능으로 유지
        id: 'mn_06_01_report',
        menuCode: 'MN-06-01(보고서)',
        category: '경영개선',
        label: '↳ 기관프로파일 5종 진단보고서',
        icon: <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
        badge: '5종 자동화',
        badgeColor: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
        workspace: 'hospital_ai_diagnosis',
        subtab: 'profile_report',
        desc: 'NMC 공식 의료자원·진료기능·실적·기관비교·지역비교 진단보고서',
      },
      {
        id: 'mn_04_06',
        menuCode: 'MN-04-06',
        category: '경영개선',
        label: '지방의료원 경영위기 조기경보',
        icon: <AlertTriangle className="w-4 h-4 text-amber-500" />,
        badge: '조기경보',
        badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
        workspace: 'medical_institution',
        subtab: 'crisis',
        desc: '의사 1인당 입원수익, 병상가동률, 의료수지비율 이상 징후 조기 포착',
      },
      {
        id: 'mn_06_02',
        menuCode: 'MN-06-02',
        category: '경영개선',
        label: 'AI 진료 병목진단 및 개선 제언',
        icon: <BarChart3 className="w-4 h-4 text-blue-500" />,
        workspace: 'hospital_ai_diagnosis',
        subtab: 'simulation',
        desc: '외래 대기시간 지연, 수술실 가동 병목 원인 진단 및 프로세스 혁신 제언',
      },
      {
        id: 'mn_04_04',
        menuCode: 'MN-04-04',
        category: '경영개선',
        label: '신포괄수가 정책가산 인센티브 계산기',
        icon: <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
        badge: '가산 모의계산',
        badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
        workspace: 'medical_institution',
        subtab: 'policy_incentive',
        desc: '공공성 평가 및 표준진료지침 기반 정부 정책가산 지원금 모의계산',
      },

      // 2-4. [연계망]
      {
        id: 'mn_04_07',
        menuCode: 'MN-04-07',
        category: '연계망',
        label: '퇴원환자 돌봄자원 AI 매칭',
        icon: <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />,
        badge: '돌봄 연계',
        badgeColor: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
        workspace: 'medical_institution',
        subtab: 'discharge_care',
        desc: '퇴원 고위험 환자 대상 방문간호, 보건소, 복지관 돌봄 자원 최적 AI 추천',
      },
    ],
  },

  // 3. 대국민 (시민포털 / 필수의료 찾기 / 실시간 응급실 관제)
  {
    role: 'citizen',
    title: '3. 대국민 (안심의료)',
    shortTitle: '대국민',
    icon: '👨‍👩‍👧',
    desc: '일반시민 눈높이 맞춤 포털 및 실시간 안심의료 검색',
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
        id: 'mn_05_01',
        menuCode: 'MN-05-01',
        category: '대국민',
        label: '일반국민 공공병원 맞춤형 뷰',
        icon: <HeartPulse className="w-4 h-4 text-rose-500" />,
        badge: '시민포털',
        badgeColor: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
        workspace: 'national_safety',
        desc: '시민 눈높이 쉬운 설명, 인근 공공병원 진료과 및 편의시설 안내',
      },
      {
        id: 'mn_05_02',
        menuCode: 'MN-05-02',
        category: '대국민',
        label: '내 주변 필수의료 자원 원클릭 찾기',
        icon: <Compass className="w-4 h-4 text-rose-500" />,
        workspace: 'national_safety',
        desc: '현재 위치 기반 야간·휴일 응급실, 달빛어린이병원, 안심분만센터 탐색',
      },
      {
        id: 'mn_05_03',
        menuCode: 'MN-05-03',
        category: '대국민',
        label: 'E-Gen 실시간 응급실·중환자실 관제',
        icon: <Activity className="w-4 h-4 text-rose-500" />,
        badge: '실시간 가용병상',
        badgeColor: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
        workspace: 'national_safety',
        desc: '중앙응급의료센터 연계 가용 성인/소아 중환자실, 장비 가동 현황 안내',
      },
    ],
  },

  // 4. 관리기능 (공통/관리자)
  {
    role: 'admin',
    title: '4. 관리기능 (시스템·데이터)',
    shortTitle: '관리기능',
    icon: '⚙️',
    desc: '3종 엑셀 추출, 원천 데이터 업로드, API 설정 및 보안 통제',
    themeColor: {
      bg: 'bg-slate-700 dark:bg-slate-600',
      border: 'border-slate-300 dark:border-slate-700',
      text: 'text-slate-700 dark:text-slate-300',
      activeText: 'text-slate-900 dark:text-white font-black',
      ring: 'ring-slate-400/30',
      cardBg: 'from-slate-50/90 to-gray-50/50 dark:from-slate-900/60 dark:to-gray-950/20',
      badgeBg: 'bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200',
    },
    menus: [
      {
        id: 'mn_02_01',
        menuCode: 'MN-02-01',
        category: '관리기능',
        label: '듀얼 AI 추론 스튜디오 (Gemini × sLLM)',
        icon: <Sparkles className="w-4 h-4 text-indigo-500" />,
        badge: '전문가 도구',
        badgeColor: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300',
        workspace: 'ai_analysis',
        desc: 'Google Gemini 온라인 추론 및 온디바이스 경량 sLLM 듀얼 교차 검증',
      },
      {
        id: 'mn_cm_01',
        menuCode: 'MN-CM-01',
        category: '관리기능',
        label: '3종 크로스탭 다차원 엑셀 다운로드',
        icon: <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
        workspace: 'regional_diagnosis',
        actionType: 'excel',
        desc: '지자체별, 공공병원별, 취약지표별 정형화된 공공기관 보고용 Excel 추출',
      },
      {
        id: 'mn_cm_02',
        menuCode: 'MN-CM-02',
        category: '관리기능',
        label: '공공데이터 업로더 및 전처리 검증',
        icon: <Upload className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
        workspace: 'regional_diagnosis',
        actionType: 'upload',
        desc: '신규 지자체 통계, 병원 현황 파일 업로드 시 결측치/이상치 자동 검증',
      },
      {
        id: 'mn_cm_03',
        menuCode: 'MN-CM-03',
        category: '관리기능',
        label: '원문대조 출처 신뢰 팝업 뷰',
        icon: <ShieldCheck className="w-4 h-4 text-teal-600 dark:text-teal-400" />,
        workspace: 'regional_diagnosis',
        actionType: 'grounding',
        desc: '대시보드의 모든 통계 수치에 대한 복지부 고시·공시 문서 원문 및 산출 근거',
      },
      {
        id: 'mn_cm_04',
        menuCode: 'MN-CM-04',
        category: '관리기능',
        label: 'Google Gemini API 키 관리 설정',
        icon: <Key className="w-4 h-4 text-amber-500" />,
        workspace: 'regional_diagnosis',
        actionType: 'key',
        desc: '사용자 고유 Google Gemini API Key 입력 및 실시간 연결 유효성 테스트',
      },
      {
        id: 'mn_cm_05',
        menuCode: 'MN-CM-05',
        category: '관리기능',
        label: '공공보건의료 ISP 15대 전략과제',
        icon: <Layers className="w-4 h-4 text-purple-600 dark:text-purple-400" />,
        badge: '15개 과제',
        badgeColor: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
        workspace: 'regional_diagnosis',
        actionType: 'isp',
        desc: '보건의료 ISP 15개 세부과제 정의서 및 이행 로드맵 연계 현황',
      },
      {
        id: 'mn_cm_06',
        menuCode: 'MN-CM-06',
        category: '관리기능',
        label: '역할 기반 사용자 권한 및 로그인 관리',
        icon: <Lock className="w-4 h-4 text-slate-600 dark:text-slate-400" />,
        workspace: 'regional_diagnosis',
        actionType: 'auth',
        desc: '복지부 총괄, 지자체 공무원, 공공병원 관리자, 일반 시민의 역할별(RBAC) 제어',
      },
    ],
  },
];

// 하위 호환성을 위해 기존 변수명도 export
export const 대상자별_메뉴_데이터 = 신규_메뉴_구조_데이터;

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
  // 관리기능 액션 모달 콜백들
  on_open_key_modal?: () => void;
  on_open_upload_modal?: () => void;
  on_open_grounding_modal?: () => void;
  on_download_nmc_excel?: () => void;
  on_open_auth_modal?: () => void;
  on_open_isp_drawer?: () => void;
}

export const 대상자별_좌측_사이드바: React.FC<대상자별_좌측_사이드바_속성> = ({
  is_collapsed,
  on_toggle_collapse,
  current_role,
  on_select_role,
  current_workspace,
  current_subtab,
  on_navigate_workspace,
  on_open_key_modal,
  on_open_upload_modal,
  on_open_grounding_modal,
  on_download_nmc_excel,
  on_open_auth_modal,
  on_open_isp_drawer,
}) => {
  // 열려있는 아코디언 그룹들 (기본적으로 모두 열림)
  const [open_groups, set_open_groups] = useState<Record<string, boolean>>({
    internal: true,
    external: true,
    citizen: true,
    admin: true,
  });

  // 역할 또는 워크스페이스 변경 시 해당 그룹 자동 확장
  useEffect(() => {
    if (current_workspace === 'national_safety') {
      set_open_groups((prev) => ({ ...prev, citizen: true }));
    } else if (
      current_workspace === 'regional_diagnosis' ||
      current_workspace === 'policy_planning' ||
      current_workspace === 'hospital_ai_diagnosis'
    ) {
      set_open_groups((prev) => ({ ...prev, external: true }));
    } else if (current_workspace === 'medical_institution') {
      set_open_groups((prev) => ({ ...prev, internal: true }));
    }
  }, [current_workspace]);

  const toggle_group = (groupKey: string) => {
    set_open_groups((prev) => ({
      ...prev,
      [groupKey]: !prev[groupKey],
    }));
  };

  const handle_item_click = (item: 대상자별_메뉴_항목) => {
    if (item.actionType) {
      switch (item.actionType) {
        case 'excel':
          on_download_nmc_excel?.();
          break;
        case 'upload':
          on_open_upload_modal?.();
          break;
        case 'grounding':
          on_open_grounding_modal?.();
          break;
        case 'key':
          on_open_key_modal?.();
          break;
        case 'isp':
          on_open_isp_drawer?.();
          break;
        case 'auth':
          on_open_auth_modal?.();
          break;
      }
      return;
    }

    on_navigate_workspace(item.workspace, item.subtab);
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
              <span>플랫폼 정보구조 (IA)</span>
            </span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-bold whitespace-nowrap">
              4대 분류
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
          {/* 전체보기 홈 아이콘 바로가기 */}
          <div className="w-full flex flex-col items-center gap-1">
            <button
              type="button"
              onClick={() => {
                on_select_role('all');
                on_navigate_workspace('home');
              }}
              className={`w-10 h-10 rounded-2xl flex items-center justify-center text-base transition-all cursor-pointer shadow-xs ${
                current_workspace === 'home'
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

          {신규_메뉴_구조_데이터.map((group) => {
            return (
              <div key={group.role} className="w-full flex flex-col items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    on_toggle_collapse();
                  }}
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg transition-all cursor-pointer shadow-xs bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:scale-105`}
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
          {/* 전체보기 복귀 바로가기 */}
          <button
            type="button"
            onClick={() => {
              on_select_role('all');
              on_navigate_workspace('home');
            }}
            className={`w-full p-2.5 rounded-2xl border text-xs font-bold transition flex items-center justify-between cursor-pointer ${
              current_workspace === 'home'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 shadow-xs'
                : 'bg-slate-50 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-base">🌐</span>
              <span>플랫폼 종합 결정지도 홈</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* 4대 영역 아코디언 그룹 목록 */}
          {신규_메뉴_구조_데이터.map((group) => {
            const isGroupOpen = open_groups[group.role] !== false;

            // 중분류(category)별로 묶어서 렌더링
            let lastCategory = '';

            return (
              <div
                key={group.role}
                className="rounded-3xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-[#151720] shadow-xs overflow-hidden transition-all"
              >
                {/* 대분류 헤더 */}
                <div
                  onClick={() => toggle_group(group.role)}
                  className="p-3 flex items-center justify-between cursor-pointer select-none group bg-slate-50/60 dark:bg-slate-900/40 hover:bg-slate-100/70 transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-lg shrink-0 group-hover:scale-110 transition-transform">
                      {group.icon}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black text-slate-900 dark:text-white truncate">
                          {group.title}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
                        {group.desc}
                      </p>
                    </div>
                  </div>

                  <div className="p-1 rounded-lg text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 shrink-0">
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${
                        isGroupOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </div>

                {/* 그룹 내 세부 메뉴 목록 */}
                {isGroupOpen && (
                  <div className="px-2 pb-2.5 pt-1.5 space-y-1 border-t border-slate-100 dark:border-slate-800/60">
                    {group.menus.map((item) => {
                      // 중분류 소제목 표시
                      let showCategoryHeader = false;
                      if (item.category && item.category !== lastCategory) {
                        showCategoryHeader = true;
                        lastCategory = item.category;
                      }

                      const isMenuSelected =
                        !item.actionType &&
                        current_workspace === item.workspace &&
                        (!item.subtab || (current_subtab ? item.subtab === current_subtab : true));

                      return (
                        <React.Fragment key={item.id}>
                          {showCategoryHeader && (
                            <div className="pt-2 pb-1 px-2 flex items-center gap-1.5 text-[10px] font-black text-slate-400 dark:text-slate-500">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500/70" />
                              <span className="uppercase tracking-wider">[{item.category}]</span>
                              <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800/80 ml-1" />
                            </div>
                          )}

                          <button
                            type="button"
                            onClick={() => handle_item_click(item)}
                            className={`w-full p-2 rounded-xl text-left transition flex items-center justify-between gap-2 cursor-pointer ${
                              isMenuSelected
                                ? 'bg-blue-50/90 dark:bg-blue-950/60 shadow-xs border border-blue-200 dark:border-blue-900 text-blue-950 dark:text-white font-bold ring-1 ring-blue-400/20'
                                : 'hover:bg-slate-100/80 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="shrink-0">{item.icon}</span>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1">
                                  {item.menuCode && (
                                    <span className="text-[9px] font-mono font-bold text-slate-400 dark:text-slate-500">
                                      {item.menuCode}
                                    </span>
                                  )}
                                  <span className="text-xs font-bold block truncate">
                                    {item.label}
                                  </span>
                                </div>
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
                        </React.Fragment>
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
