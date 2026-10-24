'use client';

import React, { useMemo, useState } from 'react';
import { AI_질의_입력창 } from '@/components/ai/AI_질의_입력창';
import { Database, MapPinned } from 'lucide-react';
import { 취약지_요약, 자연어_질의, 질의_예시, type 질의_결과 } from '@/lib/NMC_정책통계_DW';

// ③ NMC › 3-2 전국 취약지 정책통계 & 통합 DW 분석 (정책연구팀·책임지원팀)
// 책임의료기관 퇴원연계 실적·국회/복지부 요구자료 초안 카드는 2026-10-24 삭제

const 카드 = 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-2';

export function NMC_정책통계_DW_화면() {
  const 요약 = useMemo(() => 취약지_요약(), []);
  const [질문, set_질문] = useState('');
  const [결과, set_결과] = useState<질의_결과 | { 오류: string } | null>(null);

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8 space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-lg font-black text-slate-900 dark:text-white">전국 취약지 정책통계 & 통합 DW 분석</h2>
        <span className="text-[11px] text-slate-500">정책연구팀·책임지원팀 · 내부망 전용</span>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 items-start">
        <section className={카드}>
          <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5 flex-wrap"><MapPinned className="w-4 h-4 text-rose-600" /> 전국 250개 시군구 응급·분만·소아 취약지 식별</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              ['응급취약', 요약.응급취약],
              ['분만 A등급', 요약.분만A],
              ['분만 B등급', 요약.분만B],
              ['응급·분만 중복', 요약.중복취약],
            ].map(([k, v]) => (
              <div key={k} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-center">
                <div className="text-[11px] text-slate-500">{k}</div>
                <div className="text-xl font-black text-slate-900 dark:text-white">{v}</div>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-slate-500">헬스맵 2024 + 보건복지부 선정 기준. 소아는 근거 확인 중인 참고 기준이라 판정하지 않습니다.</p>
          <div className="max-h-60 overflow-y-auto">
            <table className="w-full text-xs border-collapse">
              <thead className="sticky top-0 bg-slate-50 dark:bg-slate-800 text-slate-500"><tr><th className="py-1.5 px-2 text-left">시도</th><th className="py-1.5 px-2 text-right">시군구</th><th className="py-1.5 px-2 text-right">응급취약</th><th className="py-1.5 px-2 text-right">분만 A·B</th><th className="py-1.5 px-2 text-right">종합 심각</th></tr></thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {[...요약.시도별].sort((a, b) => b.응급취약 - a.응급취약).map((s) => (
                  <tr key={s.시도명}><td className="py-1.5 px-2 font-bold">{s.시도명}</td><td className="py-1.5 px-2 text-right">{s.시군구}</td><td className="py-1.5 px-2 text-right">{s.응급취약}</td><td className="py-1.5 px-2 text-right">{s.분만A}·{s.분만B}</td><td className="py-1.5 px-2 text-right">{s.심각}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className={카드}>
          <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5 flex-wrap"><Database className="w-4 h-4 text-indigo-600" /> 통합 DW 대화형 자연어 질의 (Text-to-SQL)</h3>
          <p className="text-[11px] text-slate-500">정해진 질문 유형을 SQL로 바꿔 플랫폼 내장 테이블(시군구_진단, 알리미_공시)에서 실행합니다. 자유 질의(내부 sLLM)는 본 사업 대상입니다.</p>
          <AI_질의_입력창 value={질문} onChange={set_질문} onSubmit={(q) => set_결과(자연어_질의(q))} 예시={질의_예시[0]} 크기="sm" aria_label="자연어 질의" />
          <div className="flex flex-wrap gap-1">
            {질의_예시.map((q) => (
              <button key={q} type="button" onClick={() => set_질문(q)} className="px-2 py-0.5 rounded-lg text-[10px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 cursor-pointer">{q}</button>
            ))}
          </div>
          {결과 && ('오류' in 결과 ? (
            <p className="text-xs text-rose-600 p-2 rounded-lg result-panel">{결과.오류}</p>
          ) : (
            <div className="p-2 rounded-xl result-panel space-y-2">
              <pre className="text-[10px] p-2 rounded-lg bg-slate-900 text-emerald-300 overflow-x-auto">{결과.sql}</pre>
              <div className="text-[11px] text-slate-500">{결과.설명} · {결과.행.length}행</div>
              <div className="max-h-56 overflow-y-auto">
                <table className="w-full text-xs border-collapse">
                  <thead className="sticky top-0 bg-slate-50 dark:bg-slate-800 text-slate-500"><tr>{결과.열.map((c) => <th key={c} className="py-1 px-2 text-left">{c}</th>)}</tr></thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {결과.행.map((r, i) => <tr key={i}>{r.map((v, j) => <td key={j} className="py-1 px-2 tabular-nums">{v ?? '-'}</td>)}</tr>)}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
