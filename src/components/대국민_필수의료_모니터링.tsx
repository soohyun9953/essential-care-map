'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Activity, Baby, HeartPulse, Moon, RefreshCw } from 'lucide-react';
import { 전국_시군구_진단_데이터 } from '@/lib/시군구_데이터셋';
import { 지역_의료자원_집계 } from '@/lib/지역_의료자원_집계';
import type { 실시간_응급실_기관정보 } from '@/lib/공공의료_자원_서비스';

// ① 대국민 › 1-1 상단: 응급실·소아병상 실시간 현황 + 시도 내 시군구 2열 그리드
// - 실시간 값: 국립중앙의료원 E-Gen 응급실 실시간 가용병상 (공공데이터포털 API 키가 있을 때만)
//   실시간 연동이 안 되면 병상 숫자를 보여주지 않고 기관 목록만 표시 (내장 기준 데이터의 병상 수는 실제 값이 아님)
// - 그리드: E-Gen 응급의료기관 목록 · 심평원 분만가능 의료기관(청구 실적) · NMC 달빛어린이병원 목록을 시군구별로 집계
// - 고위험 산모·신생아(NICU) 전원 관제는 대국민 화면에서 제외 (신생아중환자실 병상은 표시하지 않음)

interface 실시간_응답 {
  is_live_api: boolean;
  source: string;
  last_updated: string;
  all_hospitals: 실시간_응급실_기관정보[];
}

const 시도_목록 = Array.from(new Set(전국_시군구_진단_데이터.map((r) => r.시도명)));

export function 대국민_필수의료_모니터링() {
  const [시도, set_시도] = useState('강원특별자치도');
  const 시군구들 = useMemo(() => 전국_시군구_진단_데이터.filter((r) => r.시도명 === 시도), [시도]);
  const [시군구, set_시군구] = useState('영월군');
  const 선택 = 시군구들.find((r) => r.시군구명 === 시군구) ?? 시군구들[0];

  const [실시간, set_실시간] = useState<실시간_응답 | null>(null);
  const [불러오는중, set_불러오는중] = useState(false);
  const [새로고침, set_새로고침] = useState(0);

  useEffect(() => {
    if (!선택) return;
    let 취소 = false;
    set_불러오는중(true);
    fetch(`/api/emergency/realtime?sido=${encodeURIComponent(선택.시도명)}&sigungu=${encodeURIComponent(선택.시군구명)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => !취소 && set_실시간(d))
      .catch(() => !취소 && set_실시간(null))
      .finally(() => !취소 && set_불러오는중(false));
    return () => {
      취소 = true;
    };
  }, [선택, 새로고침]);

  const 그리드 = useMemo(
    () => 시군구들.map((r) => ({ r, 자원: 지역_의료자원_집계(r.시도명, r.시군구명, r.시군구코드) })),
    [시군구들]
  );
  const 선택_자원 = 선택 ? 지역_의료자원_집계(선택.시도명, 선택.시군구명, 선택.시군구코드) : null;

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8 space-y-4">
      {/* 지역 선택 */}
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-base font-black text-slate-900 dark:text-white mr-2">우리 동네 응급실·소아 진료 현황</h2>
        <select value={시도} onChange={(e) => { set_시도(e.target.value); set_시군구(전국_시군구_진단_데이터.find((r) => r.시도명 === e.target.value)?.시군구명 ?? ''); }}
          className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm" aria-label="시도 선택">
          {시도_목록.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={선택?.시군구명 ?? ''} onChange={(e) => set_시군구(e.target.value)}
          className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm" aria-label="시군구 선택">
          {시군구들.map((r) => <option key={r.시군구코드} value={r.시군구명}>{r.시군구명}</option>)}
        </select>
      </div>

      {/* 실시간 응급실·소아병상 위젯 */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-rose-600" />
              국립중앙의료원 실시간 응급실·소아병상 모니터링 · {선택?.시군구명}
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {실시간 ? `${실시간.source} · ${실시간.last_updated}` : 불러오는중 ? '불러오는 중…' : '응급실 정보를 불러오지 못했습니다.'}
            </p>
          </div>
          <button type="button" onClick={() => set_새로고침((x) => x + 1)} className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 cursor-pointer flex items-center gap-1">
            <RefreshCw className={`w-3.5 h-3.5 ${불러오는중 ? 'animate-spin' : ''}`} /> 새로고침
          </button>
        </div>

        {실시간?.is_live_api ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500">
                <tr>
                  <th className="py-2 px-3 text-left font-bold">응급실</th>
                  <th className="py-2 px-3 text-right font-bold">응급실 가용병상</th>
                  <th className="py-2 px-3 text-right font-bold">소아 응급병상</th>
                  <th className="py-2 px-3 text-right font-bold">중환자실</th>
                  <th className="py-2 px-3 text-left font-bold">CT · MRI</th>
                  <th className="py-2 px-3 text-left font-bold">전화</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {실시간.all_hospitals.map((h) => (
                  <tr key={h.기관코드}>
                    <td className="py-2 px-3 font-bold text-slate-900 dark:text-white">{h.기관명}</td>
                    <td className="py-2 px-3 text-right tabular-nums">{h.응급실_가용병상}</td>
                    <td className="py-2 px-3 text-right tabular-nums">{h.소아_가용병상}</td>
                    <td className="py-2 px-3 text-right tabular-nums">{h.중환자실_가용병상}</td>
                    <td className="py-2 px-3">{h.장비가동상태.CT ? 'CT 가능' : 'CT -'} · {h.장비가동상태.MRI ? 'MRI 가능' : 'MRI -'}</td>
                    <td className="py-2 px-3"><a href={`tel:${h.전화번호}`} className="text-blue-600 hover:underline">{h.전화번호}</a></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-xl px-3 py-2">
              지금은 실시간 병상 정보가 연동되지 않아 병상 수를 표시하지 않습니다. 응급실 이용 전 119 또는 해당 병원에 확인하세요.
            </p>
            <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1">
              {(선택_자원?.응급의료기관 ?? []).length === 0 ? (
                <li className="text-slate-500">이 지역에는 E-Gen에 등록된 응급의료기관이 없습니다. 인근 지역 응급실을 확인하세요.</li>
              ) : (
                선택_자원!.응급의료기관.map((h) => (
                  <li key={h.기관명}>· {h.기관명} <span className="text-slate-400">({h.분류})</span></li>
                ))
              )}
            </ul>
          </div>
        )}
      </div>

      {/* 시도 내 시군구 2열 그리드 */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="text-sm font-black text-slate-900 dark:text-white">{시도} 시군구별 필수의료 기관</h3>
          <span className="text-[11px] text-slate-400">출처: E-Gen 응급의료기관 · 심평원 분만가능 의료기관(2025.1~2026.4 청구) · NMC 달빛어린이병원</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {그리드.map(({ r, 자원 }) => {
            const 활성 = r.시군구코드 === 선택?.시군구코드;
            return (
              <button
                key={r.시군구코드}
                type="button"
                onClick={() => set_시군구(r.시군구명)}
                className={`text-left p-3 rounded-2xl border transition cursor-pointer ${
                  활성 ? 'border-rose-400 bg-rose-50/60 dark:bg-rose-950/30' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-400'
                }`}
              >
                <div className="text-sm font-bold text-slate-900 dark:text-white">{r.시군구명}</div>
                <div className="mt-1.5 grid grid-cols-3 gap-1 text-[11px]">
                  <span className={`flex items-center gap-1 ${자원.응급의료기관.length ? 'text-slate-700 dark:text-slate-300' : 'text-rose-600 font-bold'}`}>
                    <HeartPulse className="w-3.5 h-3.5" /> 응급실 {자원.응급의료기관.length}
                  </span>
                  <span className={`flex items-center gap-1 ${자원.분만기관_수 ? 'text-slate-700 dark:text-slate-300' : 'text-rose-600 font-bold'}`}>
                    <Baby className="w-3.5 h-3.5" /> 분만 {자원.분만기관_수}
                    {자원.야간분만기관_수 > 0 && <span className="text-slate-400">(야간 {자원.야간분만기관_수})</span>}
                  </span>
                  <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
                    <Moon className="w-3.5 h-3.5" /> 달빛 {자원.달빛어린이병원_수}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
