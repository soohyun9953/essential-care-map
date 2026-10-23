'use client';

import React from 'react';
import { ArrowRight, Construction, Map as MapIcon, Wrench } from 'lucide-react';
import {
  페르소나_목록,
  오분류_교정_내역,
  페르소나_구조_안내,
  서브탭_찾기,
  type 페르소나_서브탭,
  type 구현_상태,
} from '@/lib/페르소나_메뉴_구조';
import { 신규_메뉴_구조_데이터 } from './대상자별_좌측_사이드바';

// 헤더 우측 화면 전환: ⚠️ 오분류 6대 교정 내역 / 🗺️ AS-IS ➔ TO-BE 메뉴 구조도(A01) / 준비 중 서브탭 안내

const AS_IS_메뉴명 = new Map(신규_메뉴_구조_데이터.flatMap((g) => g.menus.map((m) => [m.id, { 메뉴: m.label, 그룹: g.shortTitle }] as const)));
const 메뉴명 = (id: string) => AS_IS_메뉴명.get(id)?.메뉴 ?? id;

const 상태_스타일: Record<구현_상태, string> = {
  구현: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800',
  '부분 구현': 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800',
  '준비 중': 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
};

function 안내문() {
  return (
    <p className="text-[11px] text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-xl px-3 py-2">
      {페르소나_구조_안내}
    </p>
  );
}

export function 오분류_교정_내역_뷰({ on_open_subtab }: { on_open_subtab: (s: 페르소나_서브탭) => void }) {
  return (
    <div className="max-w-6xl mx-auto w-full p-4 sm:p-6 space-y-4">
      <div>
        <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
          <Wrench className="w-5 h-5 text-amber-600" />
          메뉴·기능 오분류 6대 교정 내역
        </h2>
        <p className="text-xs text-slate-500 mt-1">기존 좌측 메뉴(내부용·외부용·대국민)에서 이용 주체와 맞지 않던 기능을 3대 사용자 그룹으로 옮긴 내역입니다.</p>
      </div>
      {안내문()}
      <div className="space-y-3">
        {오분류_교정_내역.map((c) => {
          const 대상들 = c.to_be.split('·').map((t) => 서브탭_찾기(t.trim())).filter((x) => x !== null);
          return (
            <div key={c.번호} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-2">
              <div className="flex items-start gap-3">
                <span className="w-7 h-7 shrink-0 rounded-full bg-amber-500 text-white text-xs font-black flex items-center justify-center">{c.번호}</span>
                <div className="flex-1 min-w-0 space-y-2">
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">{c.기능}</h3>
                  <div className="flex flex-col md:flex-row md:items-center gap-2 text-xs">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      AS-IS · {c.as_is}
                    </span>
                    <ArrowRight className="w-4 h-4 text-amber-500 hidden md:block shrink-0" />
                    <div className="flex flex-wrap gap-1.5">
                      {대상들.map((x) => (
                        <button
                          key={x!.서브탭.id}
                          type="button"
                          onClick={() => on_open_subtab(x!.서브탭)}
                          className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-bold hover:underline cursor-pointer"
                        >
                          TO-BE · {x!.페르소나.번호} {x!.서브탭.id}. {x!.서브탭.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">{c.사유}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function 메뉴_구조도_뷰({ on_open_subtab }: { on_open_subtab: (s: 페르소나_서브탭) => void }) {
  return (
    <div className="max-w-[1500px] mx-auto w-full p-4 sm:p-6 space-y-4">
      <div>
        <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
          <MapIcon className="w-5 h-5 text-blue-600" />
          AS-IS ➔ TO-BE 전체 메뉴 구조도 (A01)
        </h2>
        <p className="text-xs text-slate-500 mt-1">왼쪽은 현재 메뉴, 오른쪽은 3대 사용자 그룹 12개 서브탭입니다. TO-BE 서브탭 아래에 옮겨 온 AS-IS 메뉴를 표시했습니다.</p>
      </div>
      {안내문()}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,2fr)] gap-4 items-start">
        {/* AS-IS */}
        <div className="space-y-3">
          <div className="text-xs font-black text-slate-500">AS-IS · 현재 좌측 메뉴</div>
          {신규_메뉴_구조_데이터.map((g) => (
            <div key={g.role} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3">
              <div className="text-xs font-black text-slate-800 dark:text-slate-200 mb-1.5">
                {g.icon} {g.title}
              </div>
              <ul className="space-y-1">
                {g.menus.map((m) => (
                  <li key={m.id} className="text-[11px] text-slate-600 dark:text-slate-400 flex gap-1.5">
                    <span className="text-slate-400 shrink-0">{m.category}</span>
                    <span>{m.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="hidden lg:flex items-center justify-center pt-24">
          <ArrowRight className="w-8 h-8 text-blue-400" />
        </div>

        {/* TO-BE */}
        <div className="space-y-3">
          <div className="text-xs font-black text-slate-500">TO-BE · 3대 사용자 그룹</div>
          {페르소나_목록.map((p) => (
            <div key={p.키} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 space-y-2">
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="text-sm font-black text-slate-900 dark:text-white">
                  {p.아이콘} {p.번호} {p.이름}
                </span>
                <span className="text-[11px] text-slate-500">{p.채널}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {p.서브탭.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => on_open_subtab(s)}
                    className="text-left p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-400 transition cursor-pointer space-y-1"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {s.id}. {s.label}
                      </span>
                      <span className={`shrink-0 px-1.5 py-px rounded border text-[10px] font-bold ${상태_스타일[s.상태]}`}>{s.상태}</span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {s.as_is_메뉴_ids.length > 0 ? `← ${s.as_is_메뉴_ids.map(메뉴명).join(', ')}` : '← 신규 (AS-IS 메뉴 없음)'}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function 페르소나_준비중_화면({ subtab_id, on_open_citizen_map }: { subtab_id: string; on_open_citizen_map: () => void }) {
  const 찾음 = 서브탭_찾기(subtab_id);
  if (!찾음) return null;
  const { 페르소나, 서브탭 } = 찾음;
  return (
    <div className="max-w-3xl mx-auto w-full p-6">
      <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 rounded-3xl p-8 text-center space-y-3">
        <Construction className="w-10 h-10 text-slate-400 mx-auto" />
        <div className="text-xs font-bold text-slate-500">
          {페르소나.아이콘} {페르소나.번호} {페르소나.이름}
        </div>
        <h2 className="text-lg font-black text-slate-900 dark:text-white">
          {서브탭.id}. {서브탭.label}
        </h2>
        <span className={`inline-block px-2 py-0.5 rounded border text-xs font-bold ${상태_스타일[서브탭.상태]}`}>{서브탭.상태}</span>
        <p className="text-sm text-slate-600 dark:text-slate-300">{서브탭.설명}</p>
        <p className="text-xs text-slate-400">TO-BE 메뉴 구조에 포함된 기능으로, 이 프로토타입에는 아직 화면이 없습니다.</p>
        {서브탭.id === '2-4' && (
          <button
            type="button"
            onClick={on_open_citizen_map}
            className="mt-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer"
          >
            분만 가능 기관 지도 열기 (① 1-1)
          </button>
        )}
      </div>
    </div>
  );
}
