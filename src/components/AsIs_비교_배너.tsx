'use client';

import React from 'react';
import { useIsp } from '@/context/ISP_컨텍스트';
import { AlertTriangle, CheckCircle2, Sparkles, Clock, ArrowRight } from 'lucide-react';
import { ISP_과제_뱃지 } from './ISP_과제_뱃지';

interface AsIs_비교_배너_속성 {
  target: 'diagnosis' | 'report' | 'simulator' | 'citizen' | 'general';
  className?: string;
  showBadge?: boolean;
}

export const AsIs_비교_배너: React.FC<AsIs_비교_배너_속성> = ({
  target,
  className = '',
  showBadge = true,
}) => {
  const { ispViewMode, toggleIspViewMode } = useIsp();

  const configs: Record<
    string,
    {
      taskId: string;
      asIs: { title: string; desc: string; stat: string };
      toBe: { title: string; desc: string; stat: string };
    }
  > = {
    diagnosis: {
      taskId: '3.8',
      asIs: {
        title: '과거 수작업 (As-Is): 통계 수기 취합 및 분석 지연',
        desc: '지침서 수기 대조 · 엑셀 수작업 필터링 · 최신 데이터 동기화 부재',
        stat: '수작업 취합·분석',
      },
      toBe: {
        title: 'AI 플랫폼 (To-Be): 실시간 GIS & 취약도 자동 산출',
        desc: '전국 250개 시군구 헬스맵 2024 지표 내장 · 판정 기준 자동 적용 · 판정 근거 표시',
        stat: '자동 판정 (헬스맵 2024)',
      },
    },
    report: {
      taskId: '3.4',
      asIs: {
        title: '과거 수작업 (As-Is): 공모 사업계획서 수기 작성',
        desc: '사업계획서 수기 작성 · 통계 수치 수작업 인용',
        stat: '수기 작성',
      },
      toBe: {
        title: 'AI 플랫폼 (To-Be): 12대 항목 법정 공문서 원클릭 생성',
        desc: '진단 데이터 기반 사업계획서 초안 자동 생성 · 근거 없는 예산·목표는 직접 기재 칸으로 · HWPX 한글 다운로드',
        stat: '초안 자동 생성',
      },
    },
    simulator: {
      taskId: '3.3',
      asIs: {
        title: '과거 수작업 (As-Is): CP 모니터링 및 정책가산 누락',
        desc: 'CP 운영 실적과 정책가산 지표를 수기로 산출',
        stat: '수기 산출',
      },
      toBe: {
        title: 'AI 플랫폼 (To-Be): 신포괄 정책가산 & ROI 계산',
        desc: '표준 CP 라이브러리 · 변이 사유 기록 · 병원별 입력값으로 가산·재정 효과 계산 (CP 운영 가산율 1.0%, 점수 비례 — 신포괄 지침 별표3)',
        stat: '입력값 기반 계산',
      },
    },
    citizen: {
      taskId: '3.10',
      asIs: {
        title: '과거 수작업 (As-Is): 전화·팩스 의존 응급·분만 수배',
        desc: '전화·팩스 의뢰에 의존한 응급·분만 병원 수배',
        stat: '전화 수배',
      },
      toBe: {
        title: 'AI 플랫폼 (To-Be): 응급·분만·달빛 기관 목록 연계',
        desc: 'E-Gen 응급의료기관 528곳·심평원 분만가능 기관·달빛어린이병원 114곳 목록 표시 (실시간 가용병상은 미연동)',
        stat: '기관 목록 기준 (실시간 아님)',
      },
    },
    general: {
      taskId: '3.8',
      asIs: {
        title: '과거 수작업 (As-Is): 파편화된 공공의료 데이터와 수기 기획',
        desc: '지역진단부터 사업계획서까지 분절된 수작업 프로세스',
        stat: '분절된 수작업',
      },
      toBe: {
        title: 'AI 플랫폼 (To-Be): AI 기반 공공의료 정책 의사결정 One-Stop Journey',
        desc: '진단 ➔ 비교 ➔ 미래수요 ➔ 정책대안 ➔ 사업계획서 초안까지 한 화면 흐름으로 지원',
        stat: '원스톱 흐름',
      },
    },
  };

  const item = configs[target] || configs.general;

  if (ispViewMode === 'as_is') {
    return (
      <div
        className={`p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-rose-50 to-red-50 dark:from-rose-950/40 dark:to-red-950/20 border-2 border-rose-300 dark:border-rose-900 shadow-sm animate-in fade-in transition ${className}`}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded text-[11px] font-black bg-rose-200 dark:bg-rose-900 text-rose-800 dark:text-rose-200">
                  과거 수작업 (As-Is) 문제점
                </span>
                <span className="text-xs font-bold text-rose-900 dark:text-rose-100">
                  {item.asIs.title}
                </span>
                {showBadge && <ISP_과제_뱃지 taskId={item.taskId} />}
              </div>
              <p className="text-xs text-rose-800 dark:text-rose-300/90 leading-relaxed">
                {item.asIs.desc}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            <span className="px-3 py-1 rounded-xl text-xs font-black bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 shadow-2xs">
              ⚠️ {item.asIs.stat}
            </span>
            <button
              onClick={toggleIspViewMode}
              className="text-[11px] font-bold text-rose-700 dark:text-rose-300 hover:text-rose-900 underline underline-offset-2 flex items-center gap-0.5"
            >
              To-Be 전환 <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // To-Be 모드 (기본)
  return (
    <div
      className={`p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-blue-50/80 via-indigo-50/50 to-emerald-50/80 dark:from-blue-950/30 dark:via-indigo-950/20 dark:to-emerald-950/20 border border-blue-200 dark:border-blue-900/60 shadow-2xs animate-in fade-in transition ${className}`}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[11px] font-black bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                To-Be AI 혁신 모드
              </span>
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                {item.toBe.title}
              </span>
              {showBadge && <ISP_과제_뱃지 taskId={item.taskId} />}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {item.toBe.desc}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
          <span className="px-3 py-1 rounded-xl text-xs font-black bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shadow-2xs">
            ✨ {item.toBe.stat}
          </span>
          <button
            onClick={toggleIspViewMode}
            className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 underline underline-offset-2"
          >
            As-Is 비교
          </button>
        </div>
      </div>
    </div>
  );
};
