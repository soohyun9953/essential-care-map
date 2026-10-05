'use client';

// Essential Care Map - 전체 여정(Journey) 상단 고정 Progress Navigation
// 지역진단 ✓ → 지역비교 ✓ → 미래수요 ✓ → AI 정책분석 ● → 정책대안 ○ → 사업계획 ○
// 사용자 요구사항 1번: 모든 주요 화면 상단에 고정 표시

import React from 'react';
import {
  MapPin,
  GitCompare,
  TrendingUp,
  Cpu,
  Sparkles,
  FileText,
  Check,
  ChevronRight,
  Info,
} from 'lucide-react';
import { 워크스페이스_타입 } from '@/components/글로벌_공공_헤더';

export type 여정_단계_키 =
  | 'diagnosis'    // 1. 지역진단
  | 'compare'      // 2. 지역비교
  | 'forecast'     // 3. 미래수요
  | 'ai_analysis'  // 4. AI 정책분석
  | 'alternatives' // 5. 정책대안
  | 'report';      // 6. 사업계획

export interface 여정_단계_정의 {
  key: 여정_단계_키;
  order: number;
  label: string;
  subLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  workspace: 워크스페이스_타입;
  policyTab?: 'compare' | 'forecast' | 'policy_ai' | 'report';
}

export const 전체_여정_단계_목록: 여정_단계_정의[] = [
  {
    key: 'diagnosis',
    order: 1,
    label: '지역진단',
    subLabel: '3대 필수의료 취약도 진단',
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
    label: 'AI 정책분석',
    subLabel: '데이터·지침 5단계 인과추론',
    icon: Cpu,
    workspace: 'policy_planning',
    policyTab: 'policy_ai',
  },
  {
    key: 'alternatives',
    order: 5,
    label: '정책대안',
    subLabel: '3대 시나리오 옵션 검토',
    icon: Sparkles,
    workspace: 'policy_planning',
    policyTab: 'policy_ai',
  },
  {
    key: 'report',
    order: 6,
    label: '사업계획',
    subLabel: '12대 항목 법정 공문서 완성',
    icon: FileText,
    workspace: 'policy_planning',
    policyTab: 'report',
  },
];

interface 전체_여정_프로그레스_바_속성 {
  current_step: 여정_단계_키;
  selected_region_name?: string;
  on_select_step: (step: 여정_단계_정의) => void;
  className?: string;
}

export const 전체_여정_프로그레스_바: React.FC<전체_여정_프로그레스_바_속성> = ({
  current_step,
  selected_region_name,
  on_select_step,
  className = '',
}) => {
  const current_step_index = 전체_여정_단계_목록.findIndex((s) => s.key === current_step);
  const active_index = current_step_index >= 0 ? current_step_index : 3;

  return (
    <div
      className={`w-full bg-white/95 dark:bg-[#121318]/95 backdrop-blur-md border-b border-slate-200/90 dark:border-slate-800/90 shadow-xs z-30 transition-all ${className}`}
    >
      <div className="max-w-[1700px] mx-auto px-3 sm:px-6 py-2.5 flex flex-col md:flex-row md:items-center md:justify-between gap-2.5">
        {/* 좌측: 타이틀 및 타겟 지역 표시 */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200/70 dark:border-blue-900/60">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span className="text-[11px] font-black text-blue-700 dark:text-blue-300 tracking-wide uppercase">
              AI 정책 의사결정 Workflow
            </span>
          </div>
          {selected_region_name && (
            <div className="hidden xl:flex items-center gap-1.5 text-xs text-slate-500">
              <span className="text-slate-400">대상:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                {selected_region_name}
              </span>
            </div>
          )}
        </div>

        {/* 중앙: 6단계 Journey 프로그레스 바 (가로 스크롤 대응) */}
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar py-0.5">
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

        {/* 우측: 안내 팁 */}
        <div className="hidden 2xl:flex items-center gap-1.5 text-[11px] text-slate-400 shrink-0">
          <Info className="w-3.5 h-3.5 text-blue-500" />
          <span>단계를 클릭하면 해당 분석 작업으로 즉시 전환됩니다</span>
        </div>
      </div>
    </div>
  );
};
