'use client';

import React from 'react';
import { 페르소나_목록, 페르소나_찾기, type 페르소나_키, type 페르소나_서브탭, type 구현_상태 } from '@/lib/페르소나_메뉴_구조';

// 3대 사용자 그룹 원클릭 전환(헤더 가운데) + 선택한 그룹의 서브탭(헤더 아래)
interface PersonaSwitcherBar_속성 {
  active_persona: 페르소나_키 | null; // null = 전체 보기(역할 미선택)
  active_subtab_id: string | null;
  on_select_persona: (persona: 페르소나_키) => void;
  on_select_subtab: (subtab: 페르소나_서브탭) => void;
}

const 역할_색상: Record<페르소나_키, { 활성: string; 탭: string }> = {
  citizen: {
    활성: 'bg-rose-600 text-white border-rose-600 shadow-sm',
    탭: 'bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-950/50 dark:text-rose-200 dark:border-rose-800',
  },
  hospital: {
    활성: 'bg-blue-600 text-white border-blue-600 shadow-sm',
    탭: 'bg-blue-50 text-blue-800 border-blue-300 dark:bg-blue-950/50 dark:text-blue-200 dark:border-blue-800',
  },
  nmc: {
    활성: 'bg-indigo-700 text-white border-indigo-700 shadow-sm',
    탭: 'bg-indigo-50 text-indigo-800 border-indigo-300 dark:bg-indigo-950/50 dark:text-indigo-200 dark:border-indigo-800',
  },
};

const 상태_배지: Record<구현_상태, string> = {
  구현: '',
  '부분 구현': 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300',
  '준비 중': 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
};

/** 헤더 가운데: 3대 사용자 그룹 원클릭 전환 버튼 */
export function PersonaGroupButtons({ active_persona, on_select_persona }: Pick<PersonaSwitcherBar_속성, 'active_persona' | 'on_select_persona'>) {
  return (
    <div className="flex flex-nowrap items-center justify-center gap-1.5" role="tablist" aria-label="사용자 그룹 선택">
      {페르소나_목록.map((p) => {
        const 활성 = p.키 === active_persona;
        return (
          <button
            key={p.키}
            type="button"
            role="tab"
            aria-selected={활성}
            onClick={() => on_select_persona(p.키)}
            title={p.채널}
            className={`px-3 py-1.5 rounded-xl border text-xs font-black transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              활성
                ? 역할_색상[p.키].활성
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-400'
            }`}
          >
            <span>{p.아이콘}</span>
            <span>
              {p.번호} {p.이름}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/** 헤더 아래: 선택한 사용자 그룹의 서브탭 (그룹 미선택이면 표시하지 않음) */
export function PersonaSwitcherBar({ active_persona, active_subtab_id, on_select_subtab }: Omit<PersonaSwitcherBar_속성, 'on_select_persona'>) {
  const 현재 = active_persona ? 페르소나_찾기(active_persona) : null;
  if (!현재) return null;

  return (
    <div className="shrink-0 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-[#0f172a]/90 backdrop-blur-sm">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 py-2">
        <div className="flex flex-wrap items-center gap-1.5" role="tablist" aria-label={`${현재.이름} 서브탭`}>
          {현재.서브탭.map((s) => {
            const 활성 = s.id === active_subtab_id;
            return (
              <button
                key={s.id}
                type="button"
                role="tab"
                aria-selected={활성}
                onClick={() => on_select_subtab(s)}
                title={s.설명}
                className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold transition cursor-pointer flex items-center gap-1 whitespace-nowrap ${
                  활성
                    ? 역할_색상[현재.키].탭
                    : 'bg-transparent text-slate-600 dark:text-slate-400 border-transparent hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span>
                  {s.id}. {s.label}
                </span>
                {s.상태 !== '구현' && (
                  <span className={`px-1 py-px rounded text-[9px] font-black ${상태_배지[s.상태]}`}>{s.상태}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
