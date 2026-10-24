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

const 표_머리 = 'py-2 px-3 text-left font-bold text-slate-500 bg-slate-50 dark:bg-slate-800/60 whitespace-nowrap';
const 표_칸 = 'py-2.5 px-3 align-top';

function TO_BE_링크({ id, on_open_subtab }: { id: string; on_open_subtab: (s: 페르소나_서브탭) => void }) {
  const x = 서브탭_찾기(id.trim());
  if (!x) return <span>{id}</span>;
  return (
    <button
      type="button"
      onClick={() => on_open_subtab(x.서브탭)}
      className="text-left px-2 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-bold hover:underline cursor-pointer"
    >
      {x.페르소나.번호} {x.서브탭.id}. {x.서브탭.label}
    </button>
  );
}

export function 오분류_교정_내역_뷰({ on_open_subtab }: { on_open_subtab: (s: 페르소나_서브탭) => void }) {
  return (
    <div className="max-w-7xl mx-auto w-full p-4 sm:p-6 space-y-4">
      <div>
        <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
          <Wrench className="w-5 h-5 text-amber-600" />
          메뉴·기능 오분류 6대 교정 내역
        </h2>
        <p className="text-xs text-slate-500 mt-1">기존 좌측 메뉴(내부용·외부용·대국민)에서 이용 주체와 맞지 않던 기능을 3대 사용자 그룹으로 옮긴 비교표입니다. TO-BE를 누르면 해당 화면으로 이동합니다.</p>
      </div>
      {안내문()}
      <div className="overflow-x-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr>
              <th className={표_머리}>No</th>
              <th className={표_머리}>기능</th>
              <th className={표_머리}>AS-IS 위치 (오분류)</th>
              <th className={표_머리}></th>
              <th className={표_머리}>TO-BE 위치 (교정)</th>
              <th className={표_머리}>교정 사유</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {오분류_교정_내역.map((c) => (
              <tr key={c.번호}>
                <td className={`${표_칸} font-black text-amber-600`}>{c.번호}</td>
                <td className={`${표_칸} font-bold text-slate-900 dark:text-white`}>{c.기능}</td>
                <td className={`${표_칸} text-slate-600 dark:text-slate-300`}>{c.as_is}</td>
                <td className={`${표_칸} text-amber-500`}><ArrowRight className="w-4 h-4" /></td>
                <td className={표_칸}>
                  <div className="flex flex-col gap-1">
                    {c.to_be.split('·').map((t) => (
                      <TO_BE_링크 key={t} id={t} on_open_subtab={on_open_subtab} />
                    ))}
                  </div>
                </td>
                <td className={`${표_칸} text-slate-600 dark:text-slate-400`}>{c.사유}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function 메뉴_구조도_뷰({ on_open_subtab }: { on_open_subtab: (s: 페르소나_서브탭) => void }) {
  // AS-IS 메뉴 1개 → 이관된 TO-BE 서브탭 (여러 곳일 수 있음)
  const 이관 = 신규_메뉴_구조_데이터.flatMap((g) =>
    g.menus.map((m) => ({
      그룹: g.title,
      분류: m.category ?? '',
      메뉴: m.label,
      대상: 페르소나_목록.flatMap((p) => p.서브탭.filter((s) => s.as_is_메뉴_ids.includes(m.id)).map((s) => s.id)),
    }))
  );
  return (
    <div className="max-w-7xl mx-auto w-full p-4 sm:p-6 space-y-6">
      <div>
        <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
          <MapIcon className="w-5 h-5 text-blue-600" />
          AS-IS ➔ TO-BE 전체 메뉴 구조도 (A01)
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          표 1은 현재 메뉴 {이관.length}개가 옮겨 간 위치, 표 2는 3대 사용자 그룹 12개 서브탭의 구현 상태와 출처 메뉴입니다.
        </p>
      </div>
      {안내문()}

      <div className="space-y-2">
        <h3 className="text-sm font-black text-slate-900 dark:text-white">표 1. AS-IS 메뉴 → TO-BE 이관 위치</h3>
        <div className="overflow-x-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr>
                <th className={표_머리}>AS-IS 그룹</th>
                <th className={표_머리}>분류</th>
                <th className={표_머리}>AS-IS 메뉴</th>
                <th className={표_머리}></th>
                <th className={표_머리}>TO-BE 서브탭</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {이관.map((r) => (
                <tr key={`${r.그룹}-${r.메뉴}`}>
                  <td className={`${표_칸} text-slate-500 whitespace-nowrap`}>{r.그룹}</td>
                  <td className={`${표_칸} text-slate-500`}>{r.분류}</td>
                  <td className={`${표_칸} font-bold text-slate-800 dark:text-slate-200`}>{r.메뉴}</td>
                  <td className={`${표_칸} text-blue-400`}><ArrowRight className="w-4 h-4" /></td>
                  <td className={표_칸}>
                    <div className="flex flex-wrap gap-1">
                      {r.대상.length ? r.대상.map((id) => <TO_BE_링크 key={id} id={id} on_open_subtab={on_open_subtab} />) : <span className="text-rose-600">미대응</span>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-black text-slate-900 dark:text-white">표 2. TO-BE 3대 사용자 그룹 · 12개 서브탭</h3>
        <div className="overflow-x-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr>
                <th className={표_머리}>사용자 그룹 · 채널</th>
                <th className={표_머리}>서브탭</th>
                <th className={표_머리}>상태</th>
                <th className={표_머리}>현재 구현 내용</th>
                <th className={표_머리}>← AS-IS 출처 메뉴</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {페르소나_목록.flatMap((p) =>
                p.서브탭.map((s, i) => (
                  <tr key={s.id}>
                    {i === 0 && (
                      <td rowSpan={p.서브탭.length} className={`${표_칸} font-black text-slate-900 dark:text-white border-r border-slate-100 dark:border-slate-800`}>
                        {p.아이콘} {p.번호} {p.이름}
                        <span className="block text-[10px] font-medium text-slate-500 mt-1">{p.채널}</span>
                      </td>
                    )}
                    <td className={표_칸}><TO_BE_링크 id={s.id} on_open_subtab={on_open_subtab} /></td>
                    <td className={표_칸}><span className={`px-1.5 py-0.5 rounded border text-[10px] font-bold whitespace-nowrap ${상태_스타일[s.상태]}`}>{s.상태}</span></td>
                    <td className={`${표_칸} text-slate-600 dark:text-slate-400`}>{s.설명}</td>
                    <td className={`${표_칸} text-slate-500`}>{s.as_is_메뉴_ids.length ? s.as_is_메뉴_ids.map(메뉴명).join(', ') : '신규 (AS-IS 메뉴 없음)'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
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
