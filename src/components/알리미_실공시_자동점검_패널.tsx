'use client';

import React, { useMemo, useState } from 'react';
import { FileSearch } from 'lucide-react';
import { 알리미_공시_자동점검, 알리미_점검_규칙_목록, 알리미_점검_기준 } from '@/lib/알리미_공시_품질점검';

// 지역거점공공병원 알리미 실제 공시값 자동점검 결과 (플랫폼 점검 규칙)
export function 알리미_실공시_자동점검_패널() {
  const 결과 = useMemo(() => 알리미_공시_자동점검(), []);
  const [규칙_필터, set_규칙_필터] = useState<string>('전체');

  const 규칙별 = 알리미_점검_규칙_목록.map((규칙) => {
    const 해당 = 결과.filter((r) => r.규칙 === 규칙.id);
    return { 규칙, 건수: 해당.length, 기관수: new Set(해당.map((r) => r.기관명)).size };
  });
  const 표시 = 결과.filter((r) => 규칙_필터 === '전체' || r.규칙 === 규칙_필터);
  const 규칙명 = (id: string) => 알리미_점검_규칙_목록.find((r) => r.id === id);

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-[#15161b] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileSearch className="w-5 h-5 text-emerald-600" />
              <span>알리미 실제 공시 자동점검 ({알리미_점검_기준.기관수}곳)</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{알리미_점검_기준.자료}</p>
          </div>
          <span className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 font-bold text-[11px] shrink-0">
            {알리미_점검_기준.안내}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {규칙별.map(({ 규칙, 건수, 기관수 }) => (
            <button
              type="button"
              key={규칙.id}
              onClick={() => set_규칙_필터(규칙_필터 === 규칙.id ? '전체' : 규칙.id)}
              className={`text-left p-3.5 rounded-2xl border transition cursor-pointer ${
                규칙_필터 === 규칙.id
                  ? 'border-blue-400 bg-blue-50/60 dark:bg-blue-950/40'
                  : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{규칙.이름}</span>
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold whitespace-nowrap shrink-0 ${
                    규칙.구분 === '오류의심'
                      ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300'
                      : 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300'
                  }`}
                >
                  {규칙.구분}
                </span>
              </div>
              <div className="mt-1.5 text-xl font-black text-slate-900 dark:text-white">
                {건수}
                <span className="text-xs font-bold text-slate-500 ml-1">건 · {기관수}곳</span>
              </div>
              <p className="mt-1 text-[11px] text-slate-500 leading-snug">{규칙.설명}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-[#15161b] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
            점검 결과 {규칙_필터 === '전체' ? '전체' : 규칙명(규칙_필터)?.이름} ({표시.length}건)
          </h4>
          {규칙_필터 !== '전체' && (
            <button
              type="button"
              onClick={() => set_규칙_필터('전체')}
              className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
            >
              전체 보기
            </button>
          )}
        </div>
        <div className="overflow-x-auto max-h-[420px] overflow-y-auto">
          <table className="w-full text-xs border-collapse">
            <thead className="sticky top-0 bg-slate-50 dark:bg-slate-900">
              <tr className="text-slate-500 border-b border-slate-200 dark:border-slate-800">
                <th className="py-2 px-3 text-left font-bold">기관</th>
                <th className="py-2 px-3 text-left font-bold">연도</th>
                <th className="py-2 px-3 text-left font-bold">점검</th>
                <th className="py-2 px-3 text-left font-bold">내용</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {표시.map((r, i) => (
                <tr key={`${r.규칙}-${r.기관명}-${r.연도}-${i}`}>
                  <td className="py-2 px-3 font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap">{r.기관명}</td>
                  <td className="py-2 px-3 tabular-nums">{r.연도}</td>
                  <td className="py-2 px-3 whitespace-nowrap">{규칙명(r.규칙)?.이름}</td>
                  <td className="py-2 px-3 text-slate-600 dark:text-slate-300">{r.내용}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
