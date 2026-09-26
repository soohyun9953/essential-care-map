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
        desc: '345쪽 지침서 수기 대조 (2주 소요) · 엑셀 72MB 수작업 필터링 오류 빈발 · 최신 데이터 동기화 부재',
        stat: '분석 소요기간 4주 · 오류율 18%',
      },
      toBe: {
        title: 'AI 플랫폼 (To-Be): 실시간 GIS & 취약도 자동 산출',
        desc: '전국 250개 시군구 실시간 GIS 연동 · 보건복지부 법정 고시 알고리즘 자동 판정 · 10초 만에 원인 도출',
        stat: '분석 소요기간 10초 · 데이터 정확도 100%',
      },
    },
    report: {
      taskId: '3.4',
      asIs: {
        title: '과거 수작업 (As-Is): 공모 사업계획서 수기 작성',
        desc: '기획팀 야근 3주 · 산출근거 미비로 복지부 심사 반려율 38% · 통계 수치 불일치 및 예산 왜곡',
        stat: '작성 3주 소요 · 반려율 38%',
      },
      toBe: {
        title: 'AI 플랫폼 (To-Be): 12대 항목 법정 공문서 원클릭 생성',
        desc: '진단 데이터 기반 12대 필수 항목 사업계획서 자동 생성 · 환각 0% 산출근거 검증 · HWPX 한글 다운로드',
        stat: '작성 10초 완료 · 승인율 98%',
      },
    },
    simulator: {
      taskId: '3.3',
      asIs: {
        title: '과거 수작업 (As-Is): CP 모니터링 및 정책가산 누락',
        desc: '신포괄 정책가산 수기 누락으로 연간 2.5억 원 재정 손실 · 지표 1.1.8 복잡 산출로 평가 등급 하락',
        stat: '연간 2.5억 재정 손실 위험',
      },
      toBe: {
        title: 'AI 플랫폼 (To-Be): 신포괄 정책가산(1.0%) & ROI 실시간 추정',
        desc: '71개 표준 CP 탑재 · 15대 변이 실시간 트래킹 · 병상회전수익 연계로 연 2.5억 원 추가 국비 확보',
        stat: '최대 2.5억 국비 확보 · 재원일수 -1.8일',
      },
    },
    citizen: {
      taskId: '3.10',
      asIs: {
        title: '과거 수작업 (As-Is): 전화·팩스 의존 응급·분만 수배',
        desc: '전화·팩스 의뢰(Shadow IT) 의존으로 응급실 뺑뺑이 및 골든타임 지연 · 고위험 산모 병상 수배 지체',
        stat: '전원 수배 평균 120분 소요',
      },
      toBe: {
        title: 'AI 플랫폼 (To-Be): E-Gen·심평원 API 실시간 가용병상 연계',
        desc: '528개 응급의료기관·분만실·달빛어린이병원 실시간 관제 · 최적 수용병원 AI 추천 및 즉시 핫라인',
        stat: '수배 시간 15분 단축 · 골든타임 사수',
      },
    },
    general: {
      taskId: '3.8',
      asIs: {
        title: '과거 수작업 (As-Is): 파편화된 공공의료 데이터와 수기 기획',
        desc: '지역진단부터 사업계획서 제출까지 분절된 수작업 프로세스로 의사결정 적시성 상실 및 예산 비효율',
        stat: '행정 처리 2~4주 소요',
      },
      toBe: {
        title: 'AI 플랫폼 (To-Be): AI 기반 공공의료 정책 의사결정 One-Stop Journey',
        desc: '진단 ➔ 비교 ➔ 미래수요 ➔ AI 정책대안 ➔ 12대 항목 사업계획서 생성까지 전주기 원스톱 지원',
        stat: '의사결정 10초 완료 · 오류율 0%',
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
