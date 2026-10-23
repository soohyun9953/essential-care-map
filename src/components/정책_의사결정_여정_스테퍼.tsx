'use client';

import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import type { 워크스페이스_타입 } from './글로벌_공공_헤더';

// 정책 의사결정 여정 5단계 (01 지역진단 ~ 05 12대 항목 사업계획서)
// 홈 화면에 있던 스테퍼를 ② 의료기관 담당자 › 2-1 작성 도우미로 이동 (2026-10-24).
// 06 시행계획 평가는 평가·심사 업무라 ③ NMC › 3-1로 분리되어 여기서는 제외.
export const 정책_여정_단계 = [
  { step: '01', title: '지역 진단', desc: '필수의료 취약도를\n분석합니다', workspace: 'regional_diagnosis' as const, sub: undefined, color: 'blue' },
  { step: '02', title: '지역 비교', desc: '유사 지역과 격차를\n확인합니다', workspace: 'policy_planning' as const, sub: 'compare', color: 'indigo' },
  { step: '03', title: '수요 예측', desc: '2030년 의료수요를\n예측합니다', workspace: 'policy_planning' as const, sub: 'forecast', color: 'amber' },
  { step: '04', title: 'AI 정책기획', desc: '정책대안을\n도출합니다', workspace: 'policy_planning' as const, sub: 'policy_ai', color: 'emerald' },
  { step: '05', title: '12대 항목 사업계획서', desc: '실행계획을\n작성합니다', workspace: 'policy_planning' as const, sub: 'report', color: 'purple' },
] as const;

const 색상: Record<string, { ring: string; text: string; bg: string }> = {
  blue: { ring: 'ring-blue-600', text: 'text-blue-600', bg: 'bg-blue-600' },
  indigo: { ring: 'ring-indigo-600', text: 'text-indigo-600', bg: 'bg-indigo-600' },
  amber: { ring: 'ring-amber-500', text: 'text-amber-600', bg: 'bg-amber-500' },
  emerald: { ring: 'ring-emerald-600', text: 'text-emerald-600', bg: 'bg-emerald-600' },
  purple: { ring: 'ring-purple-600', text: 'text-purple-600', bg: 'bg-purple-600' },
};

export function 정책_의사결정_여정_스테퍼({
  on_navigate,
}: {
  on_navigate: (workspace: 워크스페이스_타입, sub?: string) => void;
}) {
  const [활성, set_활성] = useState<number | null>(null);
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 px-1">
        <div className="w-1 h-5 rounded-full bg-blue-700" />
        <span className="text-sm font-bold text-slate-700 dark:text-slate-200">정책 의사결정 여정 · 지역진단부터 12대 항목 사업계획서까지</span>
        <span className="text-xs text-slate-400">각 단계를 클릭하면 해당 화면으로 이동합니다</span>
      </div>
      <div className="relative">
        <div className="hidden lg:block absolute top-[2.4rem] left-[10%] right-[10%] h-0.5 bg-slate-200 dark:bg-slate-700 z-0" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 relative z-10">
          {정책_여정_단계.map((s, idx) => {
            const c = 색상[s.color];
            const on = 활성 === idx;
            return (
              <button
                key={s.step}
                type="button"
                onClick={() => {
                  set_활성(idx);
                  on_navigate(s.workspace, s.sub);
                }}
                className={`relative flex flex-col items-center gap-2.5 p-3.5 sm:p-4 rounded-2xl border bg-white dark:bg-[#15161b] transition-all cursor-pointer group text-center ${
                  on ? `shadow-lg ring-2 ${c.ring}/30 border-transparent` : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-md'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm border-2 transition-all ${
                    on ? `${c.bg} text-white border-transparent shadow-md` : `bg-slate-50 dark:bg-slate-900 ${c.text} border-slate-200 dark:border-slate-700`
                  }`}
                >
                  {s.step}
                </div>
                <div className="space-y-1">
                  <div className={`text-sm font-bold ${on ? c.text : 'text-slate-800 dark:text-slate-200'}`}>{s.title}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 leading-snug whitespace-pre-line hidden sm:block">{s.desc}</div>
                </div>
                {idx < 정책_여정_단계.length - 1 && (
                  <ArrowRight className="w-4 h-4 absolute right-[-10px] top-[2.4rem] text-slate-300 hidden lg:block" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
