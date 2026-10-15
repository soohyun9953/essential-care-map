'use client';

// Essential Care Map HOME 화면 (UI/UX 전면 개선)
// 기존 기능 100% 보존 + Journey Stepper + 개선된 Hero + 미리보기 카드 추가
// 변경 이유: 단순 데이터 조회 사이트 → 공공의료 정책 의사결정 Journey 지원 플랫폼으로 정체성 재정의

import React, { useState } from 'react';
import {
  Search,
  ArrowRight,
  ShieldCheck,
  FileText,
  AlertTriangle,
  TrendingUp,
  Sparkles,
  ChevronRight,
  Info,
  MapPin,
  Activity,
  Users,
  Building2,
  CheckCircle2,
} from 'lucide-react';
import { 의료서비스_코드 } from '@/lib/의료서비스_검색_엔진';
import { ISP_과제_뱃지 } from './ISP_과제_뱃지';
import { 워크스페이스_타입 } from './글로벌_공공_헤더';
import { 사용자_역할_타입 } from '@/lib/사용자_역할_타입';

interface 공공의료_결정지도_홈_속성 {
  on_search_region: (region_name: string) => void;
  on_navigate_workspace: (
    workspace: 워크스페이스_타입,
    sub_feature?: string
  ) => void;
  on_select_user_role?: (role: 사용자_역할_타입) => void;
  active_user_role?: 사용자_역할_타입;
  on_open_guide_modal?: () => void;
  // 하위 호환성 핸들러
  on_search_submit?: (keyword: string, selected_services: 의료서비스_코드[]) => void;
  on_navigate_map?: (service?: 의료서비스_코드) => void;
}

const SAMPLE_REGIONS = ['영월군', '태백시', '강원특별자치도', '정선군'];

// 정책 의사결정 여정 정의 (※ 「정책분석 5단계」와 별개인 화면 이동 흐름)
const JOURNEY_STEPS = [
  {
    step: '01',
    title: '지역 진단',
    desc: '필수의료 취약도를\n분석합니다',
    workspace: 'regional_diagnosis' as const,
    sub: undefined,
    color: 'blue',
    taskId: '3.8',
    taskLabel: '과제 3.8 헬스맵 고도화',
  },
  {
    step: '02',
    title: '지역 비교',
    desc: '유사 지역과 격차를\n확인합니다',
    workspace: 'policy_planning' as const,
    sub: 'compare',
    color: 'indigo',
    taskId: '3.8',
    taskLabel: '과제 3.8 헬스맵 고도화',
  },
  {
    step: '03',
    title: '수요 예측',
    desc: '2030년 의료수요를\n예측합니다',
    workspace: 'policy_planning' as const,
    sub: 'forecast',
    color: 'amber',
    taskId: '3.8',
    taskLabel: '과제 3.8 AI 의사결정',
  },
  {
    step: '04',
    title: 'AI 정책기획',
    desc: '정책대안을\n도출합니다',
    workspace: 'policy_planning' as const,
    sub: 'policy_ai',
    color: 'emerald',
    taskId: '3.8',
    taskLabel: '과제 3.8 AI 의사결정',
  },
  {
    step: '05',
    title: '사업계획서',
    desc: '실행계획을\n작성합니다',
    workspace: 'policy_planning' as const,
    sub: 'report',
    color: 'purple',
    taskId: '3.4',
    taskLabel: '과제 3.4 기능보강 PMS',
  },
  {
    step: '06',
    title: '시행계획 평가',
    desc: '100점 평가표 산출\n및 AI 6단계 심사',
    workspace: 'policy_planning' as const,
    sub: 'evaluation',
    color: 'indigo',
    taskId: '3.4',
    taskLabel: '과제 3.4 시행계획 AI 평가',
  },
];

const STEP_COLOR_MAP: Record<string, { ring: string; text: string; bg: string; border: string; badge: string }> = {
  blue:    { ring: 'ring-blue-600',   text: 'text-blue-600',   bg: 'bg-blue-600',   border: 'border-blue-200', badge: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300' },
  indigo:  { ring: 'ring-indigo-600', text: 'text-indigo-600', bg: 'bg-indigo-600', border: 'border-indigo-200', badge: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300' },
  amber:   { ring: 'ring-amber-500',  text: 'text-amber-600',  bg: 'bg-amber-500',  border: 'border-amber-200', badge: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300' },
  emerald: { ring: 'ring-emerald-600',text: 'text-emerald-600',bg: 'bg-emerald-600',border: 'border-emerald-200',badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300' },
  purple:  { ring: 'ring-purple-600', text: 'text-purple-600', bg: 'bg-purple-600', border: 'border-purple-200', badge: 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300' },
};

// 미리보기 데이터 (영월군 예시 - DEMO DATA 명시)
const PREVIEW_REGION = {
  name: '영월군',
  sido: '강원특별자치도',
  score: 85,
  grade: '심각',
  gradeColor: 'text-red-600',
  gradeBg: 'bg-red-50 dark:bg-red-950/40',
  gradeBorder: 'border-red-200 dark:border-red-800',
  domains: [
    { name: '응급의료', score: 78, color: 'text-orange-600', bar: 'bg-orange-500', weak: true },
    { name: '분만의료', score: 92, color: 'text-red-600', bar: 'bg-red-500', weak: true },
    { name: '소아의료', score: 73, color: 'text-amber-600', bar: 'bg-amber-500', weak: true },
  ],
  factors: [
    { rank: 1, title: '응급의료 접근성', desc: '권역응급의료센터 60분 내 도달 불가 인구 비율 높음' },
    { rank: 2, title: '분만 의료공백', desc: '분만 가능 의료기관 부재로 관내 분만율 극히 낮음' },
    { rank: 3, title: '전문인력 부족', desc: '지역 내 필수의료 전문의 공급 절대 부족' },
  ],
};

export const 공공의료_결정지도_홈: React.FC<공공의료_결정지도_홈_속성> = ({
  on_search_region,
  on_navigate_workspace,
  on_select_user_role,
  active_user_role = 'all',
  on_open_guide_modal,
  on_search_submit,
  on_navigate_map,
}) => {
  const [search_input, setSearch_input] = useState('');
  const [active_step, set_active_step] = useState<number | null>(null);

  const handle_submit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = search_input.trim();
    if (!query) {
      on_navigate_workspace('regional_diagnosis');
      return;
    }
    on_search_region(query);
  };

  const handle_select_sample = (region: string) => {
    setSearch_input(region);
    on_search_region(region);
  };

  const handle_step_click = (step: typeof JOURNEY_STEPS[0]) => {
    on_navigate_workspace(step.workspace, step.sub);
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-10 sm:py-14 space-y-14 animate-in fade-in duration-300">

      {/* ================================================================== */}
      {/* 1. HERO 영역 - 정책 의사결정 플랫폼 정체성 강화                        */}
      {/* ================================================================== */}
      <div className="text-center space-y-6">
        {/* 플랫폼 정체성 배지 */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-bold">
          <Activity className="w-3.5 h-3.5" />
          <span>공공의료 정책 의사결정 지원 플랫폼</span>
        </div>

        {/* 메인 타이틀 */}
        <h1 className="text-3xl sm:text-4xl md:text-[2.6rem] font-black tracking-tight text-slate-900 dark:text-white leading-tight">
          우리 지역의 필수의료,<br />
          <span className="text-blue-700 dark:text-blue-400">데이터로 진단하고 정책으로 연결하세요.</span>
        </h1>

        {/* 서브 설명 */}
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          지역별 필수의료 현황을 진단하고 지역 간 격차와 미래 의료수요를 분석하여<br className="hidden sm:block" />
          정책대안과 사업계획 수립, 그리고 <strong>시행계획·추진실적 AI 평가</strong>까지 지원합니다.
        </p>

        {/* 검색창 */}
        <div className="max-w-2xl mx-auto space-y-3">
          <form onSubmit={handle_submit} className="relative">
            <div className="flex items-center bg-white dark:bg-[#15161b] rounded-2xl shadow-md hover:shadow-lg border-2 border-slate-200 dark:border-slate-700 focus-within:border-blue-600 focus-within:ring-4 focus-within:ring-blue-600/10 p-1.5 transition-all">
              <Search className="w-5 h-5 text-slate-400 ml-3 shrink-0" />
              <input
                type="text"
                value={search_input}
                onChange={(e) => setSearch_input(e.target.value)}
                placeholder="지역 또는 시·군·구 이름을 검색하세요"
                className="w-full px-3 py-3 text-base bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
              />
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-sm shadow-sm transition active:scale-95 shrink-0 cursor-pointer flex items-center gap-1.5"
              >
                <span>진단 시작</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* 검색 예시 칩 */}
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 px-2 flex-wrap justify-center">
            <span className="font-semibold">예시 지역:</span>
            {SAMPLE_REGIONS.map((region) => (
              <button
                key={region}
                type="button"
                onClick={() => handle_select_sample(region)}
                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-700 font-medium transition cursor-pointer flex items-center gap-1"
              >
                <MapPin className="w-3 h-3" />
                {region}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ================================================================== */}
      {/* 🌟 3대 사용자 역할별 맞춤 화면 바로가기 (국민 / 의료기관 / NMC)     */}
      {/* ============================================================== */}
      <div className="space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-4 rounded-full bg-blue-600" />
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span>사용자 유형별 맞춤 화면 바로가기</span>
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800">
              로그인 없이 즉시 이용 가능
            </span>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            원하시는 사용자 역할을 선택하시면 전용 화면으로 바로 접근할 수 있습니다.
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* [카드 1] 👨‍👩‍👧 일반 국민 (환자·보호자) */}
          <div
            onClick={() => {
              if (on_select_user_role) on_select_user_role('citizen');
              on_navigate_workspace('national_safety');
            }}
            className={`p-6 rounded-3xl bg-gradient-to-br from-rose-50/90 via-white to-pink-50/60 dark:from-rose-950/20 dark:via-[#161820] dark:to-pink-950/10 border-2 transition-all cursor-pointer group flex flex-col justify-between gap-5 hover:shadow-xl hover:-translate-y-1 ${
              active_user_role === 'citizen'
                ? 'border-rose-500 shadow-md ring-4 ring-rose-400/20'
                : 'border-rose-200 dark:border-rose-900/50 hover:border-rose-400'
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 text-white flex items-center justify-center text-xl shadow-md group-hover:scale-110 transition-transform">
                  👨‍👩‍👧
                </div>
                <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                  국민 전용 뷰
                </span>
              </div>

              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                  국민 안심의료 서비스
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  내 주변 응급실·분만병원·소아과 실시간 가용병상 &amp; AI 증상 비서
                </p>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-rose-100 dark:border-rose-900/40 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span>E-Gen 실시간 응급실·소아·중환자실 잔여 병상</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span>달빛어린이병원(114개소) 및 야간·휴일 약국</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span>119 즉시 전화, 길찾기 및 안심 AI 비서 질의응답</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-black text-xs sm:text-sm shadow-md transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>국민 안심의료 바로가기</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* [카드 2] 🏥 의료기관의 담당자 (공공병원) */}
          <div
            onClick={() => {
              if (on_select_user_role) on_select_user_role('hospital');
              on_navigate_workspace('hospital_ai_diagnosis');
            }}
            className={`p-6 rounded-3xl bg-gradient-to-br from-blue-50/90 via-white to-cyan-50/60 dark:from-blue-950/20 dark:via-[#161820] dark:to-cyan-950/10 border-2 transition-all cursor-pointer group flex flex-col justify-between gap-5 hover:shadow-xl hover:-translate-y-1 ${
              active_user_role === 'hospital'
                ? 'border-blue-600 shadow-md ring-4 ring-blue-400/20'
                : 'border-blue-200 dark:border-blue-900/50 hover:border-blue-400'
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-600 text-white flex items-center justify-center text-xl shadow-md group-hover:scale-110 transition-transform">
                  🏥
                </div>
                <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  공공병원 업무 (214개소)
                </span>
              </div>

              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  공공병원 AI 진단 &amp; 자원관리
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  41개 거점공공병원 AI 종합진단, 환자 이용 유출입 &amp; 법정 사업계획서
                </p>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-blue-100 dark:border-blue-900/40 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>41개 거점공공병원 AI 종합점수 및 5종 보고서</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>환자 이용 유출입(OD) &amp; AI 정책기획·미래수요</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>12대 항목 법정 사업계획서(HWPX) 원클릭 생성</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-black text-xs sm:text-sm shadow-md transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>의료기관 화면 바로가기</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* [카드 3] 🏛️ NMC 업무 담당자 (중앙·지원단) */}
          <div
            onClick={() => {
              if (on_select_user_role) on_select_user_role('nmc');
              on_navigate_workspace('regional_diagnosis');
            }}
            className={`p-6 rounded-3xl bg-gradient-to-br from-indigo-50/90 via-white to-purple-50/60 dark:from-indigo-950/20 dark:via-[#161820] dark:to-purple-950/10 border-2 transition-all cursor-pointer group flex flex-col justify-between gap-5 hover:shadow-xl hover:-translate-y-1 ${
              active_user_role === 'nmc'
                ? 'border-indigo-600 shadow-md ring-4 ring-indigo-400/20'
                : 'border-indigo-200 dark:border-indigo-900/50 hover:border-indigo-400'
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center text-xl shadow-md group-hover:scale-110 transition-transform">
                  🏛️
                </div>
                <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  중앙 총괄 관제
                </span>
              </div>

              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  전국 헬스맵 &amp; 공공병원 경영·공시 관제
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  전국 250개 시군구 GIS 취약지 관제, 경영위기 조기경보 &amp; 공시 사전검증
                </p>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-indigo-100 dark:border-indigo-900/40 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>전국 250개 시군구 35:65 GIS 취약지 판정 &amp; 분석</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>35개 지방의료원 경영위기 조기경보 &amp; 공시 사전검증</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>시행계획·추진실적 AI 평가 (100점 평가표) &amp; 데이터센터</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-black text-xs sm:text-sm shadow-md transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>NMC 업무 화면 바로가기</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* ================================================================== */}
      {/* ⭐ 신규 핵심 배너 2종: 1) 시행계획·추진실적 AI 평가 / 2) 공공병원 AI 진단 */}
      {/* ================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 배너 1: 공공보건의료 시행계획·추진실적 AI 평가 (100점 평가표) */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-900 text-white shadow-xl border border-indigo-400/40 relative overflow-hidden flex flex-col justify-between gap-5">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-black">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>NEW · 2025 시행계획 수립지침 &amp; 2024 추진실적 작성지침 반영</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              공공보건의료 시행계획 · 추진실적 AI 평가
            </h2>
            <p className="text-xs sm:text-sm text-indigo-100/90 leading-relaxed font-medium">
              공공기관(시·도 17개소 / 중앙부처 8개소 / 공공단체) 평가자료 입력 시 <strong>지침 공식 평가표(추진실적 70점 + 사업계획 30점 = 100점 만점)</strong> 산출 및 <strong>6단계 AI 평가 서비스(사전검증·지표교정·정량채점·이견조정·결과보고서)</strong>를 제공합니다.
            </p>
          </div>

          <button
            type="button"
            onClick={() => on_navigate_workspace('policy_planning', 'evaluation')}
            className="w-full sm:w-auto self-start px-6 py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm shadow-lg transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer group"
          >
            <ShieldCheck className="w-4 h-4 text-slate-950" />
            <span>시행계획·추진실적 AI 평가 바로가기 (100점 평가표)</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* 배너 2: AI 공공병원 종합진단 & 5종 진단보고서 작성 */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 text-white shadow-xl border border-blue-500/30 relative overflow-hidden flex flex-col justify-between gap-5">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/30 border border-blue-400/40 text-blue-200 text-xs font-black">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>NEW · 국립중앙의료원 의료기관 프로파일 5종 진단보고서 탑재</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              AI 공공병원 종합진단 &amp; 5종 진단보고서 작성
            </h2>
            <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed font-medium">
              <strong>41개 거점공공병원 전수 데이터</strong>를 기반으로 <strong>①지역 의료자원 · ②진료기능 · ③진료실적 · ④기관비교 · ⑤지역비교 5종 진단보고서</strong>를 자동 작성하고, AI 개선 시뮬레이션 및 실행계획을 수립합니다.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => on_navigate_workspace('hospital_ai_diagnosis', 'profile_report')}
              className="px-5 py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm shadow-lg transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer group"
            >
              <FileText className="w-4 h-4 text-slate-950" />
              <span>📄 5종 진단보고서 작성 바로가기</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              type="button"
              onClick={() => on_navigate_workspace('hospital_ai_diagnosis', 'diagnosis')}
              className="px-4 py-3.5 rounded-2xl bg-blue-500/80 hover:bg-blue-500 text-white font-extrabold text-xs sm:text-sm shadow-md border border-blue-400/40 transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Building2 className="w-4 h-4 text-white" />
              <span>AI 병원진단·시뮬레이션</span>
            </button>
          </div>
        </div>
      </div>

      {/* ================================================================== */}
      {/* 2. 정책 의사결정 여정 Stepper (화면 이동 흐름)                         */}
      {/* ================================================================== */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <div className="w-1 h-5 rounded-full bg-blue-700" />
          <span className="text-sm font-bold text-slate-700 dark:text-slate-200">정책 의사결정 여정 · 진단부터 사업계획서 및 시행계획 평가까지</span>
          <span className="text-xs text-slate-400">각 단계를 클릭해 바로 이동할 수 있습니다</span>
        </div>

        {/* 스텝 컨테이너 */}
        <div className="relative">
          {/* 연결선 (데스크탑) */}
          <div className="hidden lg:block absolute top-[2.4rem] left-[8%] right-[8%] h-0.5 bg-slate-200 dark:bg-slate-700 z-0" />

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 relative z-10">
            {JOURNEY_STEPS.map((step, idx) => {
              const colors = STEP_COLOR_MAP[step.color];
              const isActive = active_step === idx;
              return (
                <button
                  key={step.step}
                  type="button"
                  onClick={() => { set_active_step(idx); handle_step_click(step); }}
                  className={`flex flex-col items-center gap-2.5 p-3.5 sm:p-4 rounded-2xl border bg-white dark:bg-[#15161b] transition-all cursor-pointer group text-center
                    ${isActive
                      ? `border-${step.color}-400 shadow-lg ring-2 ${colors.ring}/30`
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-md'
                    }`}
                >

                  {/* 단계 번호 원 */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm border-2 transition-all
                    ${isActive
                      ? `${colors.bg} text-white border-transparent shadow-md`
                      : `bg-slate-50 dark:bg-slate-900 ${colors.text} border-slate-200 dark:border-slate-700 group-hover:${colors.bg} group-hover:text-white group-hover:border-transparent`
                    }`}>
                    {step.step}
                  </div>

                  {/* 단계 제목 */}
                  <div className="space-y-1">
                    <div className={`text-sm font-bold ${isActive ? colors.text : 'text-slate-800 dark:text-slate-200'}`}>
                      {step.title}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 leading-snug whitespace-pre-line hidden sm:block">
                      {step.desc}
                    </div>
                  </div>

                  {/* 연결 화살표 (모바일용) */}
                  {idx < JOURNEY_STEPS.length - 1 && (
                    <ArrowRight className={`w-4 h-4 absolute right-[-10px] top-[2.4rem] text-slate-300 hidden lg:block`} />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ================================================================== */}
      {/* 3. 미리보기 카드 + 4대 Quick Action 카드                               */}
      {/* ================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

        {/* 왼쪽: 영월군 진단 미리보기 카드 (예시 데이터) */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-white dark:bg-[#15161b] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-4">
          {/* 예시 데이터 배지 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span className="font-bold text-sm">{PREVIEW_REGION.name}</span>
              <span className="text-xs text-slate-500">{PREVIEW_REGION.sido}</span>
            </div>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 tracking-wider uppercase flex items-center gap-1">
              <Info className="w-3 h-3" />
              예시 데이터 · DEMO
            </span>
          </div>

          {/* 종합 취약도 */}
          <div className={`p-4 rounded-xl border ${PREVIEW_REGION.gradeBg} ${PREVIEW_REGION.gradeBorder} flex items-center justify-between`}>
            <div>
              <div className="text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">종합 취약도</div>
              <div className={`text-4xl font-black ${PREVIEW_REGION.gradeColor}`}>{PREVIEW_REGION.score}</div>
            </div>
            <div className={`px-3 py-1.5 rounded-xl text-sm font-black ${PREVIEW_REGION.gradeColor} ${PREVIEW_REGION.gradeBg} border ${PREVIEW_REGION.gradeBorder}`}>
              {PREVIEW_REGION.grade}
            </div>
          </div>

          {/* 3대 분야 점수 */}
          <div className="space-y-2.5">
            {PREVIEW_REGION.domains.map((d) => (
              <div key={d.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{d.name}</span>
                  <span className={`font-bold ${d.color}`}>{d.score}</span>
                </div>
                <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${d.bar}`} style={{ width: `${d.score}%` }} />
                </div>
              </div>
            ))}
          </div>

          {/* 주요 취약요인 */}
          <div className="space-y-1.5">
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">주요 취약요인</div>
            {PREVIEW_REGION.factors.map((f) => {
              const CIRCLE_NUMS = ['①', '②', '③', '④', '⑤'];
              const circle = CIRCLE_NUMS[f.rank - 1] ?? `${f.rank}.`;
              return (
                <div key={f.rank} className="flex items-start gap-2 text-xs">
                  <span className="font-black text-blue-700 dark:text-blue-400 shrink-0">{circle}</span>
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{f.title}</span>
                    <span className="text-slate-500 dark:text-slate-400 ml-1">— {f.desc}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* CTA */}
          <button
            type="button"
            onClick={() => on_search_region('영월군')}
            className="w-full py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-sm transition active:scale-95 cursor-pointer flex items-center justify-center gap-2 shadow-sm"
          >
            <span>영월군 상세 진단하기</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* 오른쪽: 4대 Quick Action 카드 */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center gap-2 px-1">
            <div className="w-1 h-5 rounded-full bg-slate-400" />
            <span className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">주요 분석 워크스페이스 바로가기</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* 카드 1: 지역 진단 */}
            <div
              onClick={() => on_navigate_workspace('regional_diagnosis')}
              className="p-5 rounded-2xl bg-white dark:bg-[#15161b] border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-600 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    01 지역 진단
                  </span>
                  <ISP_과제_뱃지 taskId="3.8" customLabel="과제 3.8 헬스맵 고도화" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">필수의료 현황 진단</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  응급·분만·소아 취약도와 GIS 레이어로 관내 의료자원을 확인합니다.
                </p>
              </div>
              <div className="text-xs font-bold text-blue-700 dark:text-blue-400 flex items-center justify-between group-hover:underline">
                <span>진단 대시보드 열기</span>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>

            {/* 카드 2: 지역 비교 */}
            <div
              onClick={() => on_navigate_workspace('policy_planning', 'compare')}
              className="p-5 rounded-2xl bg-white dark:bg-[#15161b] border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-600 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                    02 지역 비교
                  </span>
                  <ISP_과제_뱃지 taskId="3.8" customLabel="과제 3.8 헬스맵 고도화" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">유사 지자체 1:1 비교</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  인근 권역 및 동일 규모 지자체와 필수의료 인프라 격차를 비교합니다.
                </p>
              </div>
              <div className="text-xs font-bold text-indigo-700 dark:text-indigo-400 flex items-center justify-between group-hover:underline">
                <span>비교 분석 시작</span>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>

            {/* 카드 3: 의료수요 예측 */}
            <div
              onClick={() => on_navigate_workspace('policy_planning', 'forecast')}
              className="p-5 rounded-2xl bg-white dark:bg-[#15161b] border border-slate-200 dark:border-slate-800 hover:border-amber-500 dark:hover:border-amber-600 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                    03 수요 예측
                  </span>
                  <ISP_과제_뱃지 taskId="3.8" customLabel="과제 3.8 AI 의사결정" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">2030 의료수요 변화</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  인구수 기반 단순 추정 모델로 중장기 수요를 추정합니다.
                </p>
              </div>
              <div className="text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center justify-between group-hover:underline">
                <span>수요 추계 확인</span>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>

            {/* 카드 4: AI 정책기획 */}
            <div
              onClick={() => on_navigate_workspace('policy_planning', 'policy_ai')}
              className="p-5 rounded-2xl bg-white dark:bg-[#15161b] border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-600 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    04 AI 정책기획
                  </span>
                  <ISP_과제_뱃지 taskId="3.4" customLabel="과제 3.4 기능보강 PMS" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">정책대안 및 사업계획서</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  진단 데이터를 근거로 3대 정책대안과 표준 사업계획서를 자동 완성합니다.
                </p>
              </div>
              <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center justify-between group-hover:underline">
                <span>정책대안 도출</span>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================================================================== */}
      {/* 4. 데이터 신뢰성 고지 배너                                             */}
      {/* ================================================================== */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">데이터 신뢰성 고지</span>
            <span className="text-sm text-slate-600 dark:text-slate-300">
              보건복지부 취약지 고시, 국립중앙의료원 공공보건의료통계, 건강보험심사평가원 DW 기준
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" />
              기준년도: 2024
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 inline-block" />
              대상: 250개 시·군·구
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 inline-block" />
              헬스맵 주제도 2024 (수동 갱신)
            </span>
          </div>
        </div>
        {on_open_guide_modal && (
          <button
            type="button"
            onClick={on_open_guide_modal}
            className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer text-xs sm:text-sm shadow-xs shrink-0 flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5" />
            데이터·사업가이드 총람 보기
          </button>
        )}
      </div>
    </div>
  );
};
