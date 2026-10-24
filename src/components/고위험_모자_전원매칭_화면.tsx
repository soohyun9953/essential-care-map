'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Ambulance, Baby, Send, X } from 'lucide-react';
import { 수용기관_후보, 기관_좌표, 중증도_점수, 수용기관_매칭, type 산모_정보 } from '@/lib/고위험_모자_전원매칭';
import type { 실시간_응급실_기관정보 } from '@/lib/공공의료_자원_서비스';

// ② 의료기관 담당자 › 2-4 고위험 산모·신생아 전원의뢰·수용 매칭 (AP-06 병원용)

const 의뢰기관 = '강원특별자치도영월의료원';

export function 고위험_모자_전원매칭_화면() {
  // 우리 병원 가용자원 등록 (담당자 입력 — 실제 등록·공유는 본 사업 대상)
  const [자원, set_자원] = useState({ MFICU: 0, NICU: 0, 산부인과_전문의: 0, 소아청소년과_전문의: 0 });
  const [산모, set_산모] = useState<산모_정보>({ 재태주수: 31, 조기진통: true, 조기양막파수: false, 전자간증: false, 다태아: false });
  const [nicu, set_nicu] = useState<Record<string, number | null>>({});
  const [실시간_여부, set_실시간_여부] = useState<boolean | null>(null);
  const [요청_모달, set_요청_모달] = useState(false);

  useEffect(() => {
    let 취소 = false;
    Promise.all(
      수용기관_후보.map((c) =>
        fetch(`/api/emergency/realtime?sido=${encodeURIComponent('강원특별자치도')}&sigungu=${encodeURIComponent(c.시군구)}`)
          .then((r) => (r.ok ? r.json() : null))
          .catch(() => null)
          .then((d: { is_live_api: boolean; all_hospitals: 실시간_응급실_기관정보[] } | null) => {
            if (!d?.is_live_api) return [c.기관명, null, false] as const;
            const h = d.all_hospitals.find((x) => x.기관명.replace(/\s/g, '').includes(c.표시명.replace(/\s/g, '')) || c.기관명.includes(x.기관명));
            return [c.기관명, h?.신생아중환자실_가용병상 ?? null, true] as const;
          })
      )
    ).then((rs) => {
      if (취소) return;
      set_nicu(Object.fromEntries(rs.map(([k, v]) => [k, v])));
      set_실시간_여부(rs.some(([, , live]) => live));
    });
    return () => {
      취소 = true;
    };
  }, []);

  const 출발 = 기관_좌표(의뢰기관);
  const 중증도 = 중증도_점수(산모);
  const 결과 = useMemo(() => (출발 ? 수용기관_매칭(출발, 중증도, nicu) : []), [출발, 중증도, nicu]);

  const 숫자입력 = (라벨: string, 값: number, on: (v: number) => void) => (
    <label className="flex items-center justify-between gap-2 text-xs text-slate-700 dark:text-slate-300">
      {라벨}
      <input type="number" min={0} value={값} onChange={(e) => on(Math.max(0, Number(e.target.value) || 0))} className="w-16 px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-right" />
    </label>
  );

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8 space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-lg font-black text-slate-900 dark:text-white">고위험 산모·신생아 전원의뢰·수용 매칭</h2>
        <span className="px-2 py-0.5 rounded-lg text-[11px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">병원용</span>
        <span className="text-[11px] text-slate-500">의뢰기관: 영월의료원 · 판단 보조용이며 최종 전원 결정은 의료진이 합니다.</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        {/* 우리 병원 가용자원 */}
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-2">
          <h3 className="text-sm font-black text-slate-900 dark:text-white">우리 병원 가용자원 등록</h3>
          {숫자입력('산모·태아 집중치료실(MFICU) 가용', 자원.MFICU, (v) => set_자원((p) => ({ ...p, MFICU: v })))}
          {숫자입력('신생아 집중치료실(NICU) 가용', 자원.NICU, (v) => set_자원((p) => ({ ...p, NICU: v })))}
          {숫자입력('산부인과 전문의 (당직 가능)', 자원.산부인과_전문의, (v) => set_자원((p) => ({ ...p, 산부인과_전문의: v })))}
          {숫자입력('소아청소년과 전문의 (당직 가능)', 자원.소아청소년과_전문의, (v) => set_자원((p) => ({ ...p, 소아청소년과_전문의: v })))}
          <p className="text-[11px] text-slate-500">담당자 입력값입니다. 권역 실시간 공유(등록 연동)는 본 사업 구현 대상입니다.</p>
        </section>

        {/* 산모 정보 · 중증도 */}
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-2">
          <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5"><Baby className="w-4 h-4 text-rose-600" /> 고위험 산모 발생 — 중증도</h3>
          {숫자입력('재태주수 (주)', 산모.재태주수, (v) => set_산모((p) => ({ ...p, 재태주수: Math.min(42, v) })))}
          {(['조기진통', '조기양막파수', '전자간증', '다태아'] as const).map((k) => (
            <label key={k} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
              <input type="checkbox" checked={산모[k]} onChange={(e) => set_산모((p) => ({ ...p, [k]: e.target.checked }))} /> {k}
            </label>
          ))}
          <div className="text-sm font-black text-rose-700 dark:text-rose-300">중증도 {중증도}점</div>
          <p className="text-[11px] text-slate-500">재태주수 기본점수(&lt;28주 90 · &lt;32주 75 · &lt;34주 55 · &lt;37주 35 · 그 외 15) + 위험요인 각 10점. 플랫폼 규칙이며 임상 지침이 아닙니다.</p>
        </section>

        {/* TOP 3 추천 */}
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-2">
          <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5"><Ambulance className="w-4 h-4 text-blue-600" /> 권역 수용기관 TOP 3</h3>
          <p className="text-[11px] text-slate-500">
            {실시간_여부 === null ? 'E-Gen 실시간 NICU 조회 중…' : 실시간_여부 ? 'NICU 가용: E-Gen 실시간 (hvncc)' : 'E-Gen 실시간 미연동 — NICU 가용은 전화 확인 필요'} · MFICU 실시간 항목 없음
          </p>
          <ol className="space-y-2">
            {결과.map((r, i) => (
              <li key={r.기관명} className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-900 dark:text-white">{i + 1}. {r.표시명}</span>
                  <span className="text-sm font-black text-blue-700 dark:text-blue-300">적합도 {r.적합도}</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  이송 약 {r.이송_분}분 ({r.거리_km}km 직선, 허용 {r.허용_분}분) · 수용확률 {Math.round(r.수용확률 * 100)}% ({r.수용_설명})
                </div>
              </li>
            ))}
          </ol>
          <p className="text-[10px] text-slate-400">적합도 = 수용확률 × max(0.05, 1 − 이송분 ÷ 허용분) × 100, 허용분 = 240 − 1.5×중증도. 이송시간은 직선거리×1.4÷70km/h 추정.</p>
          <button type="button" onClick={() => set_요청_모달(true)} className="w-full px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black cursor-pointer flex items-center justify-center gap-1.5">
            <Send className="w-4 h-4" /> TOP 3 다기관 동시 수용 요청
          </button>
        </section>
      </div>

      {요청_모달 && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/50" role="dialog" aria-modal="true">
          <div className="w-full max-w-lg bg-white dark:bg-[#15161b] rounded-3xl p-6 space-y-3 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900 dark:text-white">다기관 동시 수용 요청 (시뮬레이션)</h3>
              <button type="button" onClick={() => set_요청_모달(false)} aria-label="닫기" className="cursor-pointer"><X className="w-5 h-5 text-slate-500" /></button>
            </div>
            <p className="text-xs text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 rounded-xl px-3 py-2">
              프로토타입이라 실제로 전송되지 않습니다. 실제 요청은 해당 병원 응급실·분만실에 전화로 하세요.
            </p>
            <div className="text-xs text-slate-700 dark:text-slate-300 space-y-1">
              <div>의뢰기관: 영월의료원 · 재태주수 {산모.재태주수}주{산모.조기진통 ? ' · 조기진통' : ''} · 중증도 {중증도}점</div>
              {결과.map((r) => (
                <div key={r.기관명}>→ {r.표시명}: 요청 대기 (적합도 {r.적합도})</div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
