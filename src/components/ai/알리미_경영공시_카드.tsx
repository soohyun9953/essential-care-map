'use client';

import React from 'react';
import { FileSpreadsheet } from 'lucide-react';
import type { 알리미_경영공시_요약 } from '@/types/aiHospitalDiagnosis';
import { 알리미_공시_출처 } from '@/lib/알리미_경영공시_데이터셋';

const 숫자 = (v: number | null, 단위 = '') => (v === null ? '-' : `${v.toLocaleString()}${단위}`);

// 지역거점공공병원 알리미 결산·인력 공시 5개년 요약 (실데이터)
export function 알리미_경영공시_카드({ 공시 }: { 공시: 알리미_경영공시_요약 | null }) {
  if (!공시) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 text-xs text-slate-500">
        이 기관은 지역거점공공병원 알리미 공시와 연결되지 않았습니다.
      </div>
    );
  }

  const 행: { 라벨: string; 값: (r: 알리미_경영공시_요약['연도별'][number]) => string }[] = [
    { 라벨: '의료수익 (억원)', 값: (r) => 숫자(r.의료수익_억) },
    { 라벨: '의료이익 (억원)', 값: (r) => 숫자(r.의료이익_억) },
    { 라벨: '당기순이익 (억원)', 값: (r) => 숫자(r.당기순이익_억) },
    { 라벨: '의료이익률', 값: (r) => 숫자(r.의료이익률, '%') },
    { 라벨: '의료수익 대비 인건비 지출', 값: (r) => 숫자(r.인건비율, '%') },
    { 라벨: '의료수익 대비 정부·지자체 지원금', 값: (r) => 숫자(r.지원금_비율, '%') },
    { 라벨: '부채 ÷ 자산', 값: (r) => 숫자(r.부채비율, '%') },
    { 라벨: '자본잠식 (자본총계 < 0)', 값: (r) => (r.자본잠식 === null ? '-' : r.자본잠식 ? '예' : '아니오') },
    { 라벨: '의사직 현원 (명)', 값: (r) => 숫자(r.의사직_현원) },
    { 라벨: '간호직 현원 (명)', 값: (r) => 숫자(r.간호직_현원) },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            <span>알리미 경영 공시 (5개년)</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {알리미_공시_출처.자료명} · {공시.알리미_기관명} · 결산 기준일 {공시.결산_기준일 ?? '-'} (제출 {공시.결산_제출일 ?? '-'}) · 수집{' '}
            {알리미_공시_출처.수집일시}
          </p>
        </div>
        <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-bold text-xs shrink-0">
          실데이터 (공시값)
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
              <th className="py-2 px-3 text-left font-bold">항목</th>
              {공시.연도별.map((r) => (
                <th key={r.연도} className="py-2 px-3 text-right font-bold">
                  {r.연도}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {행.map((h) => (
              <tr key={h.라벨}>
                <td className="py-2 px-3 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">{h.라벨}</td>
                {공시.연도별.map((r) => (
                  <td key={r.연도} className="py-2 px-3 text-right tabular-nums text-slate-800 dark:text-slate-200">
                    {h.값(r)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {공시.재무건전성 && (
        <p className="text-xs text-slate-600 dark:text-slate-300">
          재무건전성 점수 <strong>{공시.재무건전성.점수}점</strong> ({공시.재무건전성.연도}년, 공시기관 내 백분위 평균 — 플랫폼 자체 산식):{' '}
          {공시.재무건전성.구성
            .map((x) => `${x.지표 === '인건비율' ? '인건비 지출 비율' : x.지표} ${x.값}% → 백분위 ${x.백분위}`)
            .join(' · ')}
        </p>
      )}
      <p className="text-[11px] text-slate-400">
        인건비는 「수입·지출 현황」의 인건비 지출, 지원금은 정부지원금 소계와 지자체지원금 소계의 합입니다. 공시값을 그대로 나눈 비율이며, 인건비가 0으로 공시된 연도는 미공시로 표시합니다.
      </p>
    </div>
  );
}
