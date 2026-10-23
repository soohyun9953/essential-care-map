'use client';

import React, { useMemo, useState } from 'react';
import { Building2, ExternalLink } from 'lucide-react';
import { 알리미_기관_공시_목록, 알리미_공시_출처 } from '@/lib/알리미_경영공시_데이터셋';
import { 경영지표_계산, 알리미_병상수, 알리미_소재지, 최근_결산연도 } from '@/lib/알리미_경영지표';

// ① 대국민 1-2: 우리 지역 공공병원 알리미 비교
// 지역거점공공병원 알리미 공시값(결산·인력)을 시도별로 나란히 보여준다. 값은 공시 그대로이며 평가·순위를 매기지 않는다.

const 억 = (천원: number | null) => (천원 === null ? '-' : `${(Math.round(천원 / 10000) / 10).toLocaleString()}억원`);
const 값 = (v: number | null, 단위 = '') => (v === null ? '-' : `${v.toLocaleString()}${단위}`);

export function 대국민_알리미_비교() {
  const 행 = useMemo(
    () =>
      알리미_기관_공시_목록.map((h) => {
        const r = 최근_결산연도(h);
        const 병상 = 알리미_병상수(h);
        const m = r ? 경영지표_계산(r, 병상) : null;
        return { h, r, 병상, m, 소재지: 알리미_소재지(h) };
      }),
    []
  );
  const 시도_목록 = useMemo(
    () => Array.from(new Set(행.map((x) => x.소재지?.시도명).filter((x): x is string => Boolean(x)))).sort(),
    [행]
  );
  const [시도, set_시도] = useState<string>('전체');
  const 표시 = 행
    .filter((x) => 시도 === '전체' || x.소재지?.시도명 === 시도)
    .sort((a, b) => (a.소재지?.시도명 ?? '').localeCompare(b.소재지?.시도명 ?? '') || a.h.기관명.localeCompare(b.h.기관명));

  return (
    <div className="max-w-6xl mx-auto w-full p-4 sm:p-6 space-y-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-rose-600" />
              우리 지역 공공병원 알리미 비교
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              지방의료원·적십자병원 등 지역거점공공병원 {알리미_기관_공시_목록.length}곳이 공개한 경영·인력 정보입니다. 출처: {알리미_공시_출처.자료명} (수집{' '}
              {알리미_공시_출처.수집일시})
            </p>
          </div>
          <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 shrink-0">
            지역
            <select
              value={시도}
              onChange={(e) => set_시도(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
            >
              <option value="전체">전체 ({행.length}곳)</option>
              {시도_목록.map((s) => (
                <option key={s} value={s}>
                  {s} ({행.filter((x) => x.소재지?.시도명 === s).length}곳)
                </option>
              ))}
            </select>
          </label>
        </div>
        <ul className="text-[11px] text-slate-500 dark:text-slate-400 list-disc pl-4 space-y-0.5">
          <li>의사·간호사 수는 직종별 현원, 100병상당 인원은 허가병상으로 나눈 값입니다.</li>
          <li>의료이익률은 진료로 번 돈(의료수익) 대비 진료 손익입니다. 공공병원은 필수의료를 맡느라 대부분 적자이며, 값이 낮다고 진료 수준이 낮다는 뜻은 아닙니다.</li>
        </ul>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500">
            <tr>
              <th className="py-2.5 px-3 text-left font-bold">병원</th>
              <th className="py-2.5 px-3 text-left font-bold">소재지</th>
              <th className="py-2.5 px-3 text-right font-bold">허가병상</th>
              <th className="py-2.5 px-3 text-right font-bold">의사</th>
              <th className="py-2.5 px-3 text-right font-bold">간호사</th>
              <th className="py-2.5 px-3 text-right font-bold">100병상당 의사·간호사</th>
              <th className="py-2.5 px-3 text-right font-bold">의료수익</th>
              <th className="py-2.5 px-3 text-right font-bold">의료이익률</th>
              <th className="py-2.5 px-3 text-right font-bold">기준</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {표시.map(({ h, r, 병상, m, 소재지 }) => (
              <tr key={h.기관번호} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white whitespace-nowrap">{h.기관명}</td>
                <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                  {소재지 ? `${소재지.시도명} ${소재지.시군구명}` : '-'}
                </td>
                <td className="py-2.5 px-3 text-right tabular-nums">{값(병상)}</td>
                <td className="py-2.5 px-3 text-right tabular-nums">{값(r?.의사직_현원 ?? null, '명')}</td>
                <td className="py-2.5 px-3 text-right tabular-nums">{값(r?.간호직_현원 ?? null, '명')}</td>
                <td className="py-2.5 px-3 text-right tabular-nums whitespace-nowrap">
                  {m?.병상당_의사직 ?? '-'} · {m?.병상당_간호직 ?? '-'}
                </td>
                <td className="py-2.5 px-3 text-right tabular-nums">{억(r?.의료수익 ?? null)}</td>
                <td className="py-2.5 px-3 text-right tabular-nums">{값(m?.의료이익률 ?? null, '%')}</td>
                <td className="py-2.5 px-3 text-right text-slate-400">{r ? `${r.연도}년` : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <a
        href={알리미_공시_출처.URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline"
      >
        지역거점공공병원 알리미에서 원문 공시 보기 <ExternalLink className="w-3 h-3" />
      </a>
    </div>
  );
}
