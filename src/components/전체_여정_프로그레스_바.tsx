'use client';

// Essential Care Map - 전체 여정(Journey) 상단 고정 Progress Navigation
// 1.지역진단 ✓ → 2.지역비교 ✓ → 3.미래수요 ✓ → 4.AI 정책분석·대안 ● → 5.사업계획 ○ → 6.시행계획 심사·평가 ○
// 좌측 상단: 분석 대상 시·군·구 선택 팝오버 (전국 250개 시·군·구 실데이터 연동)

import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  MapPin,
  GitCompare,
  TrendingUp,
  Sparkles,
  FileText,
  ShieldCheck,
  Check,
  ChevronRight,
  Info,
  ChevronDown,
  Search,
  X,
} from 'lucide-react';
import { 워크스페이스_타입 } from '@/components/글로벌_공공_헤더';
import { 필수의료_진단_결과 } from '@/lib/필수의료_타입';

export type 여정_단계_키 =
  | 'diagnosis'    // 1. 지역진단
  | 'compare'      // 2. 지역비교
  | 'forecast'     // 3. 미래수요
  | 'ai_analysis'  // 4. AI 정책분석 & 대안 도출
  | 'alternatives' // (하위 호환 유지)
  | 'report'       // 5. 사업계획
  | 'evaluation';  // 6. 시행계획 심사·평가

export interface 여정_단계_정의 {
  key: 여정_단계_키;
  order: number;
  label: string;
  subLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  workspace: 워크스페이스_타입;
  policyTab?: 'compare' | 'forecast' | 'policy_ai' | 'report' | 'evaluation';
}

export const 전체_여정_단계_목록: 여정_단계_정의[] = [
  {
    key: 'diagnosis',
    order: 1,
    label: '지역진단',
    subLabel: '3대 필수의료 취약도 & 환자 유출입(OD) 진단',
    icon: MapPin,
    workspace: 'regional_diagnosis',
  },
  {
    key: 'compare',
    order: 2,
    label: '지역비교',
    subLabel: '유사 지자체 1:1 격차 비교',
    icon: GitCompare,
    workspace: 'policy_planning',
    policyTab: 'compare',
  },
  {
    key: 'forecast',
    order: 3,
    label: '미래수요',
    subLabel: '2030 장래인구 및 수요 추계',
    icon: TrendingUp,
    workspace: 'policy_planning',
    policyTab: 'forecast',
  },
  {
    key: 'ai_analysis',
    order: 4,
    label: 'AI 정책분석·대안',
    subLabel: '취약원인 정밀진단 & Option A/B/C 정책 패키지',
    icon: Sparkles,
    workspace: 'policy_planning',
    policyTab: 'policy_ai',
  },
  {
    key: 'report',
    order: 5,
    label: '사업계획',
    subLabel: '12대 항목 법정 공문서 완성 & HWPX 다운로드 (의료기관 계획 수립 완료)',
    icon: FileText,
    workspace: 'policy_planning',
    policyTab: 'report',
  },
];

const SIDO_FILTERS = [
  '전체',
  '강원',
  '경기',
  '충북',
  '충남',
  '전북',
  '전남',
  '경북',
  '경남',
  '제주',
  '서울',
  '인천',
  '부산',
  '대구',
  '광주',
  '대전',
  '울산',
  '세종',
];

interface 전체_여정_프로그레스_바_속성 {
  current_step: 여정_단계_키;
  selected_region_name?: string;
  selected_region?: 필수의료_진단_결과 | null;
  regions_list?: 필수의료_진단_결과[];
  on_select_region?: (region: 필수의료_진단_결과) => void;
  on_select_step: (step: 여정_단계_정의) => void;
  className?: string;
}

export const 전체_여정_프로그레스_바: React.FC<전체_여정_프로그레스_바_속성> = ({
  current_step,
  selected_region_name,
  selected_region,
  regions_list = [],
  on_select_region,
  on_select_step,
  className = '',
}) => {
  const current_step_index = 전체_여정_단계_목록.findIndex((s) => s.key === current_step);
  const active_index = current_step_index >= 0 ? current_step_index : 0;

  // 지역 선택 드롭다운 상태
  const [is_dropdown_open, set_is_dropdown_open] = useState(false);
  const [search_query, set_search_query] = useState('');
  const [selected_sido, set_selected_sido] = useState('전체');

  const dropdown_ref = useRef<HTMLDivElement>(null);
  const search_input_ref = useRef<HTMLInputElement>(null);

  // 바깥 클릭 및 ESC 감지
  useEffect(() => {
    if (!is_dropdown_open) return;
    const handle_click_outside = (e: MouseEvent) => {
      if (dropdown_ref.current && !dropdown_ref.current.contains(e.target as Node)) {
        set_is_dropdown_open(false);
      }
    };
    const handle_keydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        set_is_dropdown_open(false);
      }
    };
    document.addEventListener('mousedown', handle_click_outside);
    document.addEventListener('keydown', handle_keydown);
    return () => {
      document.removeEventListener('mousedown', handle_click_outside);
      document.removeEventListener('keydown', handle_keydown);
    };
  }, [is_dropdown_open]);

  // 열릴 때 자동 포커스
  useEffect(() => {
    if (is_dropdown_open) {
      setTimeout(() => search_input_ref.current?.focus(), 60);
    } else {
      set_search_query('');
    }
  }, [is_dropdown_open]);

  // 필터링된 지역 목록
  const filtered_regions = useMemo(() => {
    if (!regions_list || regions_list.length === 0) return [];
    return regions_list.filter((r) => {
      // 1. 시도 필터
      if (selected_sido !== '전체') {
        if (!r.시도명.includes(selected_sido)) return false;
      }
      // 2. 검색어 필터
      if (search_query.trim()) {
        const q = search_query.trim().toLowerCase();
        const matchName = r.시군구명.toLowerCase().includes(q);
        const matchSido = r.시도명.toLowerCase().includes(q);
        return matchName || matchSido;
      }
      return true;
    });
  }, [regions_list, selected_sido, search_query]);

  // 등급별 스타일 함수
  const get_grade_badge = (grade?: string) => {
    switch (grade) {
      case '심각':
        return 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300 border-red-200 dark:border-red-800';
      case '취약':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300 border-orange-200 dark:border-orange-800';
      case '주의':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case '관심':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/60 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800';
      default:
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
    }
  };

  return (
    <div
      className={`w-full bg-white/95 dark:bg-[#121318]/95 backdrop-blur-md border-b border-slate-200/90 dark:border-slate-800/90 shadow-xs z-30 transition-all ${className}`}
    >
      <div className="max-w-[1700px] mx-auto px-3 sm:px-6 py-2.5 flex flex-col md:flex-row md:items-center md:justify-between gap-2.5">
        {/* 좌측: 타이틀 및 타겟 지역 선택 드롭다운 */}
        <div className="flex items-center gap-2.5 shrink-0" ref={dropdown_ref}>
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200/70 dark:border-blue-900/60 cursor-help"
            title="단계를 클릭하면 해당 분석 작업으로 즉시 전환됩니다"
          >
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span className="text-[11px] font-black text-blue-700 dark:text-blue-300 tracking-wide uppercase">
              AI 정책 의사결정 Workflow
            </span>
            <Info className="w-3.5 h-3.5 text-blue-500" />
          </div>

          {/* 🎯 대상 지역 선택 드롭다운 버튼 */}
          <div className="relative">
            <button
              type="button"
              onClick={() => set_is_dropdown_open((prev) => !prev)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-blue-950/60 border border-slate-300/80 hover:border-blue-400 dark:border-slate-700 dark:hover:border-blue-600 transition shadow-2xs group cursor-pointer text-xs"
              title="클릭하여 분석 대상 지역을 변경합니다 (전국 250개 시·군·구)"
            >
              <MapPin className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0 group-hover:scale-110 transition-transform" />
              <span className="text-slate-500 dark:text-slate-400 font-medium">대상:</span>
              <span className="font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                {selected_region_name || '지역 선택'}
              </span>
              <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold px-1 py-0.5 rounded bg-blue-100/70 dark:bg-blue-900/40">
                변경
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-transform ${
                  is_dropdown_open ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* 🎯 지역 선택 팝오버 창 */}
            {is_dropdown_open && (
              <div className="absolute left-0 top-full mt-2 w-[340px] sm:w-[420px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-3.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                {/* 팝오버 헤더 */}
                <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-black text-slate-900 dark:text-white">
                      분석 대상 지역 선택
                    </span>
                    <span className="text-[10px] text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-full font-bold">
                      전국 250개 시·군·구
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => set_is_dropdown_open(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* 검색창 */}
                <div className="relative mb-2.5">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    ref={search_input_ref}
                    type="text"
                    value={search_query}
                    onChange={(e) => set_search_query(e.target.value)}
                    placeholder="시·군·구 검색 (예: 태백, 영월, 단양, 해남, 안동)"
                    className="w-full pl-8 pr-7 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
                  />
                  {search_query && (
                    <button
                      type="button"
                      onClick={() => set_search_query('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* 시도 빠른 필터 탭 */}
                <div className="flex items-center gap-1 overflow-x-auto pb-2 mb-2 scrollbar-none text-[11px]">
                  {SIDO_FILTERS.map((sido) => (
                    <button
                      key={sido}
                      type="button"
                      onClick={() => set_selected_sido(sido)}
                      className={`px-2 py-0.5 rounded-md font-bold shrink-0 transition ${
                        selected_sido === sido
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {sido}
                    </button>
                  ))}
                </div>

                {/* 시군구 목록 (스크롤) */}
                <div className="max-h-60 overflow-y-auto space-y-1 pr-1">
                  {filtered_regions.length === 0 ? (
                    <div className="text-center py-8 text-xs text-slate-400">
                      일치하는 지역이 없습니다.
                    </div>
                  ) : (
                    filtered_regions.map((reg) => {
                      const is_selected =
                        selected_region?.시군구코드 === reg.시군구코드 ||
                        (selected_region_name &&
                          selected_region_name.includes(reg.시군구명));
                      return (
                        <button
                          key={reg.시군구코드}
                          type="button"
                          onClick={() => {
                            on_select_region?.(reg);
                            set_is_dropdown_open(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition cursor-pointer text-left ${
                            is_selected
                              ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-900 dark:text-blue-200 font-black border border-blue-200 dark:border-blue-800'
                              : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            {is_selected ? (
                              <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 font-bold" />
                            ) : (
                              <span className="w-3.5 h-3.5 shrink-0" />
                            )}
                            <div className="truncate">
                              <span className="text-[10px] text-slate-400 dark:text-slate-500 mr-1.5">
                                {reg.시도명}
                              </span>
                              <span className="font-bold">{reg.시군구명}</span>
                              {reg.인구수 > 0 && (
                                <span className="text-[10px] text-slate-400 ml-1.5">
                                  ({(reg.인구수 / 10000).toFixed(1)}만명)
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {reg.종합_취약도_등급 && (
                              <span
                                className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${get_grade_badge(
                                  reg.종합_취약도_등급
                                )}`}
                              >
                                {reg.종합_취약도_등급}
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>

                {/* 하단 안내 푸터 */}
                <div className="pt-2.5 mt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1 text-[10px] text-slate-400">
                  <Info className="w-3 h-3 text-blue-500 shrink-0" />
                  <span>지역 선택 시 진단·비교·수요예측·AI대안·계획서에 즉시 반영됩니다.</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 우측: 7단계 Journey 프로그레스 바 (가로 스크롤로 마지막 단계가 가려지지 않게, 넘치면 다음 줄로) */}
        <div className="flex flex-wrap items-center md:justify-end gap-1 sm:gap-1.5 py-0.5 min-w-0">
          {전체_여정_단계_목록.map((step, idx) => {
            const is_passed = idx < active_index;
            const is_current = idx === active_index;
            const is_pending = idx > active_index;
            const StepIcon = step.icon;

            return (
              <React.Fragment key={step.key}>
                <button
                  type="button"
                  onClick={() => on_select_step(step)}
                  className={`group flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs transition-all cursor-pointer shrink-0 border select-none ${
                    is_current
                      ? 'bg-blue-600 text-white font-black border-blue-600 shadow-sm ring-2 ring-blue-500/30'
                      : is_passed
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200/70 dark:border-emerald-800/60 font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-900/50'
                      : 'bg-slate-50 dark:bg-slate-900/60 text-slate-400 dark:text-slate-500 border-slate-200/70 dark:border-slate-800/80 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100'
                  }`}
                  title={`${step.label}: ${step.subLabel}`}
                >
                  {/* 상태 기호: 완료(✓), 현재(●), 예정(○) */}
                  <span
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                      is_current
                        ? 'bg-white text-blue-600'
                        : is_passed
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                    }`}
                  >
                    {is_passed ? (
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    ) : is_current ? (
                      '●'
                    ) : (
                      '○'
                    )}
                  </span>

                  <span className="truncate">{step.label}</span>

                  {/* 현재 단계 강조 뱃지 */}
                  {is_current && (
                    <span className="hidden sm:inline-block text-[9px] bg-white/20 text-white px-1.5 py-0.2 rounded-md font-bold">
                      현재
                    </span>
                  )}
                </button>

                {/* 화살표 구분자 */}
                {idx < 전체_여정_단계_목록.length - 1 && (
                  <span
                    className={`text-xs px-0.5 shrink-0 ${
                      idx < active_index
                        ? 'text-emerald-500 dark:text-emerald-400 font-bold'
                        : 'text-slate-300 dark:text-slate-700'
                    }`}
                  >
                    →
                  </span>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};
