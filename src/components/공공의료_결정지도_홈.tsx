'use client';

// Essential Care Map HOME 화면
// 공공의료 의사결정 지원 플랫폼 정체성 반영 (Section 4 & 5 표준 구현)

import React, { useState } from 'react';
import {
  Search,
  MapPin,
  ArrowRight,
  ShieldCheck,
  Building2,
  TrendingUp,
  FileText,
  Compass,
  CheckCircle2,
} from 'lucide-react';
import { 의료서비스_코드 } from '@/lib/의료서비스_검색_엔진';

interface 공공의료_결정지도_홈_속성 {
  on_search_region: (region_name: string) => void;
  on_navigate_workspace: (
    workspace: 'regional_diagnosis' | 'policy_planning' | 'medical_institution' | 'ai_analysis' | 'national_safety',
    sub_feature?: string
  ) => void;
  on_open_guide_modal?: () => void;
  // 하위 호환성 핸들러
  on_search_submit?: (keyword: string, selected_services: 의료서비스_코드[]) => void;
  on_navigate_map?: (service?: 의료서비스_코드) => void;
}

const SAMPLE_REGIONS = ['서울특별시', '영월군', '강원특별자치도', '부산광역시'];

export const 공공의료_결정지도_홈: React.FC<공공의료_결정지도_홈_속성> = ({
  on_search_region,
  on_navigate_workspace,
  on_open_guide_modal,
  on_search_submit,
  on_navigate_map,
}) => {
  const [search_input, setSearch_input] = useState('');

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

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-12 sm:py-16 md:py-20 space-y-12 animate-in fade-in duration-300">
      {/* ============================================================== */}
      {/* 1. 메인 HERO 영역 (Section 4) */}
      {/* ============================================================== */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>대한민국 공공의료 정책의사결정지원 플랫폼</span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
          우리 지역의 필수의료, 지금 진단해보세요.
        </h1>

        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
          지역별 의료취약도를 분석하고 AI 기반 정책대안을 확인할 수 있습니다.
        </p>
      </div>

      {/* ============================================================== */}
      {/* 2. 중앙 지역 검색창 (Section 4) */}
      {/* ============================================================== */}
      <div className="max-w-2xl mx-auto space-y-3">
        <form onSubmit={handle_submit} className="relative">
          <div className="flex items-center bg-white dark:bg-[#15161b] rounded-2xl shadow-sm hover:shadow-md border-2 border-slate-300 dark:border-slate-700 focus-within:border-blue-600 focus-within:ring-4 focus-within:ring-blue-600/10 p-2 transition-all">
            <Search className="w-5 h-5 text-slate-400 ml-3 shrink-0" />
            <input
              type="text"
              value={search_input}
              onChange={(e) => setSearch_input(e.target.value)}
              placeholder="시군구 또는 지역명을 검색하세요"
              className="w-full px-3 py-2.5 text-base bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
            />
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-xs transition active:scale-95 shrink-0 cursor-pointer"
            >
              진단하기
            </button>
          </div>
        </form>

        {/* 검색 예시 칩 */}
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 px-2 flex-wrap">
          <span className="font-semibold">검색 예:</span>
          {SAMPLE_REGIONS.map((region) => (
            <button
              key={region}
              type="button"
              onClick={() => handle_select_sample(region)}
              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600 font-medium transition cursor-pointer"
            >
              {region}
            </button>
          ))}
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. 4대 Home Quick Action 카드 (Section 5) */}
      {/* ============================================================== */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-wider px-1">
          <span>주요 분석 워크스페이스 바로가기</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 카드 1: 지역 진단 */}
          <div
            onClick={() => on_navigate_workspace('regional_diagnosis')}
            className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#15161b] border border-slate-200 dark:border-slate-800 hover:border-blue-600 dark:hover:border-blue-500 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-md text-xs sm:text-[13px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                  지역 진단
                </span>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                우리 지역 필수의료 진단
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                응급·분만·소아 취약도와 7대 GIS 레이어로 관내 의료자원을 확인합니다.
              </p>
            </div>
            <div className="pt-2 text-xs sm:text-sm font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 group-hover:underline">
              <span>진단 대시보드 열기</span>
            </div>
          </div>

          {/* 카드 2: 지역 비교 */}
          <div
            onClick={() => on_navigate_workspace('policy_planning', 'compare')}
            className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#15161b] border border-slate-200 dark:border-slate-800 hover:border-indigo-600 dark:hover:border-indigo-500 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-md text-xs sm:text-[13px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                  지역 비교
                </span>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                유사 지자체 1:1 비교
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                인근 권역 및 동일 규모 지자체와 필수의료 인프라 격차를 정밀 대조합니다.
              </p>
            </div>
            <div className="pt-2 text-xs sm:text-sm font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 group-hover:underline">
              <span>비교 분석 시작하기</span>
            </div>
          </div>

          {/* 카드 3: 의료수요 예측 */}
          <div
            onClick={() => on_navigate_workspace('policy_planning', 'forecast')}
            className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#15161b] border border-slate-200 dark:border-slate-800 hover:border-amber-600 dark:hover:border-amber-500 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-md text-xs sm:text-[13px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400">
                  의료수요 예측
                </span>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                2030 의료수요 변화
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                인구 고령화와 질환별 의료이용 추세를 반영한 중장기 수요를 예측합니다.
              </p>
            </div>
            <div className="pt-2 text-xs sm:text-sm font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1 group-hover:underline">
              <span>수요 추계 확인</span>
            </div>
          </div>

          {/* 카드 4: AI 정책기획 */}
          <div
            onClick={() => on_navigate_workspace('policy_planning', 'policy_ai')}
            className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#15161b] border border-slate-200 dark:border-slate-800 hover:border-emerald-600 dark:hover:border-emerald-500 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-md text-xs sm:text-[13px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                  AI 정책기획
                </span>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                정책대안 및 사업계획서
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                진단 데이터를 근거로 3대 정책대안과 복지부 표준 사업계획서를 자동 완성합니다.
              </p>
            </div>
            <div className="pt-2 text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 group-hover:underline">
              <span>정책대안 도출하기</span>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 4. 데이터 신뢰성 & 5대 사업가이드 안내 배너 */}
      {/* ============================================================== */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2 text-sm sm:text-base">
            <span className="font-black text-slate-900 dark:text-slate-100 whitespace-nowrap">
              데이터 신뢰성 고지:
            </span>
            <span className="text-slate-700 dark:text-slate-300 font-semibold">
              보건복지부 취약지 고시, 국립중앙의료원 공공보건의료통계, 건강보험심사평가원 DW 기준
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            시·군·구 진단 지표는 헬스맵 주제도 2024년 값(250개 시·군·구)이며 자동으로 갱신되지 않습니다.
          </p>
        </div>
        {on_open_guide_modal && (
          <button
            type="button"
            onClick={on_open_guide_modal}
            className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition whitespace-nowrap cursor-pointer text-xs sm:text-sm shadow-xs shrink-0"
          >
            데이터·사업가이드 총람 보기
          </button>
        )}
      </div>
    </div>
  );
};
