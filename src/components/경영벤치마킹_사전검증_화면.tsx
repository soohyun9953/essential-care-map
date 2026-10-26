'use client';

import React, { useMemo, useState } from 'react';
import { BarChart3, FileSearch, Wrench, FileText } from 'lucide-react';
import { 알리미_기관_공시_목록 } from '@/lib/알리미_경영공시_데이터셋';
import { 최근_결산연도, 알리미_병상수 } from '@/lib/알리미_경영지표';
import {
  경영_벤치마킹,
  경영진단_요약,
  공시_사전검증,
  사전검증_항목,
  장비_노후도_진단,
  시연_장비_대장,
  비교군_병상_범위,
  type 사전검증_항목_키,
} from '@/lib/경영_벤치마킹_사전검증';
import { 기관프로파일_진단보고서_생성기 } from './기관프로파일_진단보고서_생성기';

// ② 의료기관 담당자 › 2-2 경영 벤치마킹 & 공시·시설장비 사전검증 + 기관프로파일 5종 진단보고서

const 지방의료원 = 알리미_기관_공시_목록.filter((h) => h.유형 === '지방의료원');
const 천원 = (v: number | null) => (v === null ? '-' : v.toLocaleString());

export function 경영벤치마킹_사전검증_화면() {
  // 탭 상태: 5종 진단보고서 vs 경영 벤치마킹 & 사전검증
  const [active_tab, set_active_tab] = useState<'profile_report' | 'benchmark'>('profile_report');

  const [기관번호, set_기관번호] = useState(
    지방의료원.find((h) => h.기관명 === '영월의료원')?.기관번호 ?? 지방의료원[0].기관번호
  );
  const 기관 = 지방의료원.find((h) => h.기관번호 === 기관번호)!;
  const 벤치 = useMemo(() => 경영_벤치마킹(기관), [기관]);
  const 요약 = useMemo(() => (벤치 ? 경영진단_요약(벤치.행) : []), [벤치]);

  const 공시 = 최근_결산연도(기관);
  const 초기_erp = () =>
    Object.fromEntries(사전검증_항목.map((k) => [k, 공시?.[k] ?? null])) as Record<사전검증_항목_키, number | null>;
  const [erp, set_erp] = useState<Record<사전검증_항목_키, number | null>>(초기_erp);
  const [erp_기관, set_erp_기관] = useState(기관번호);
  if (erp_기관 !== 기관번호) {
    set_erp_기관(기관번호);
    set_erp(초기_erp());
  }
  const 검증 = useMemo(() => (공시 ? 공시_사전검증(공시, erp) : []), [공시, erp]);
  const 장비 = useMemo(() => 장비_노후도_진단(시연_장비_대장, 2026), []);

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8 space-y-5">
      {/* 2-2 상단 탭 전환 네비게이션: 1) 5종 진단보고서 작성 / 2) 경영 벤치마킹 & 사전검증 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-black bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300">
              2-2. 의료기관 전용
            </span>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              경영 벤치마킹 &amp; 기관프로파일 5종 진단서
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            41개 지역거점 공공병원 프로파일 5종 표준 진단보고서 자동작성(HWPX) 및 동일 규모 지방의료원 경영 벤치마킹·공시 사전검증을 제공합니다.
          </p>
        </div>

        {/* 탭 전환 버튼 2종 */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 shrink-0 self-start sm:self-center">
          <button
            type="button"
            onClick={() => set_active_tab('profile_report')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
              active_tab === 'profile_report'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-700/60'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>📄 5종 진단보고서 자동작성</span>
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                active_tab === 'profile_report'
                  ? 'bg-white/20 text-white'
                  : 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
              }`}
            >
              ①~⑤ HWPX
            </span>
          </button>

          <button
            type="button"
            onClick={() => set_active_tab('benchmark')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
              active_tab === 'benchmark'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-700/60'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>📊 경영 벤치마킹 &amp; 사전검증</span>
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                active_tab === 'benchmark'
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
              }`}
            >
              비교군 12곳
            </span>
          </button>
        </div>
      </div>

      {/* 탭 1: 5종 진단보고서 자동 작성기 (①지역의료자원~⑤지역비교 및 HWPX 다운로드) */}
      {active_tab === 'profile_report' ? (
        <div className="w-full">
          <기관프로파일_진단보고서_생성기
            initial_hospital_id="HOSP_001"
            initial_tab="p1_resource"
          />
        </div>
      ) : (
        /* 탭 2: 경영 벤치마킹 & 공시·시설장비 사전검증 */
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">분석 대상 기관:</span>
            <select
              value={기관번호}
              onChange={(e) => set_기관번호(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-white"
              aria-label="기관 선택"
            >
              {지방의료원.map((h) => (
                <option key={h.기관번호} value={h.기관번호}>
                  {h.기관명} ({알리미_병상수(h) ?? '-'}병상)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 items-start">
            {/* 좌측: 벤치마킹 + AI 경영진단 요약 */}
            <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3 shadow-xs">
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-blue-600" /> 동일 규모 지방의료원 익명 비교군 벤치마킹
              </h3>
              <p className="text-[11px] text-slate-500">
                비교군: 알리미 공시 기준 허가병상 {비교군_병상_범위.최소}~{비교군_병상_범위.최대} 지방의료원 {벤치?.비교군_수 ?? 0}곳 (병원명 비공개, {벤치?.연도}년 결산).
                갈렙ABC 등 외부 컨설팅 레퍼런스 데이터는 보유하지 않아 공개 공시로 비교군을 구성했습니다.
              </p>
              {벤치 && (
                <table className="w-full text-xs border-collapse">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500">
                    <tr>
                      <th className="py-2 px-2 text-left font-bold">지표</th>
                      <th className="py-2 px-2 text-right font-bold">{기관.기관명}</th>
                      <th className="py-2 px-2 text-right font-bold">비교군 중앙값</th>
                      <th className="py-2 px-2 text-right font-bold">비교군 평균</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {벤치.행.map((r) => (
                      <tr key={r.지표}>
                        <td className="py-2 px-2 font-bold text-slate-700 dark:text-slate-300">{r.지표}</td>
                        {r.비고 ? (
                          <td colSpan={3} className="py-2 px-2 text-right text-slate-400">
                            자료 없음 — {r.비고}
                          </td>
                        ) : (
                          <>
                            <td className="py-2 px-2 text-right tabular-nums font-bold">
                              {r.우리 ?? '-'}
                              {r.우리 !== null ? r.단위 : ''}
                            </td>
                            <td className="py-2 px-2 text-right tabular-nums">
                              {r.비교군_중앙값 ?? '-'}
                              {r.비교군_중앙값 !== null ? r.단위 : ''}
                            </td>
                            <td className="py-2 px-2 text-right tabular-nums text-slate-500">
                              {r.비교군_평균 ?? '-'}
                              {r.비교군_평균 !== null ? r.단위 : ''}
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 space-y-1">
                <div className="text-xs font-black text-blue-800 dark:text-blue-300">경영진단 요약 (규칙 기반)</div>
                {요약.map((s) => (
                  <p key={s} className="text-[11px] text-slate-700 dark:text-slate-300">
                    · {s}
                  </p>
                ))}
              </div>
            </section>

            <div className="space-y-4">
              {/* 우측 상단: 공시 사전검증 */}
              <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3 shadow-xs">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                    <FileSearch className="w-4 h-4 text-emerald-600" /> 결산 공시항목 · ERP 대조 사전검증
                  </h3>
                </div>
                <p className="text-[11px] text-slate-500">
                  공시값은 알리미에 실제 공시된 {공시?.연도}년 값입니다(단위 천원). 결산서 PDF 자동추출·ERP 직접 연동은 본 사업 구현 대상이라, ERP 값은 담당자가 입력합니다.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {사전검증_항목.map((k) => (
                    <label key={k} className="text-[11px] text-slate-600 dark:text-slate-300 flex items-center justify-between gap-2">
                      <span className="whitespace-nowrap">{k.replace('_', ' ')}</span>
                      <span className="text-slate-400 tabular-nums">공시 {천원(공시?.[k] ?? null)}</span>
                      <input
                        type="number"
                        value={erp[k] ?? ''}
                        onChange={(e) =>
                          set_erp((p) => ({ ...p, [k]: e.target.value === '' ? null : Number(e.target.value) }))
                        }
                        className="w-28 px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-right tabular-nums"
                        aria-label={`${k} ERP 값`}
                      />
                    </label>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      set_erp((p) => ({
                        ...p,
                        정부_출연금: 공시?.정부_보조금 ?? null,
                        정부_보조금: 공시?.정부_출연금 ?? null,
                      }))
                    }
                    className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 cursor-pointer"
                  >
                    예시: ERP 출연금·보조금 맞바꾸기
                  </button>
                  <button
                    type="button"
                    onClick={() => set_erp(초기_erp())}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 cursor-pointer"
                  >
                    ERP = 공시값으로 초기화
                  </button>
                </div>
                <div className="space-y-1.5">
                  {검증.length === 0 ? (
                    <p className="text-xs text-emerald-700 dark:text-emerald-300 font-bold">탐지된 오류·검토 사항이 없습니다.</p>
                  ) : (
                    검증.map((v, i) => (
                      <div key={i} className="text-[11px] flex gap-2">
                        <span
                          className={`shrink-0 px-1.5 py-0.5 rounded font-bold ${
                            v.수준 === '오류의심'
                              ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300'
                              : 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300'
                          }`}
                        >
                          {v.수준}
                        </span>
                        <span className="text-slate-700 dark:text-slate-300">
                          <strong>{v.규칙}</strong> — {v.내용}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </section>

              {/* 우측 하단: 원내 시설·장비 노후도·가동률 진단 */}
              <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3 shadow-xs">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Wrench className="w-4 h-4 text-amber-600" /> 원내 시설·장비 노후도·가동률 진단
                  </h3>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                    가상 시연 장비대장
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  장비 목록·도입연도·가동률은 시연용 예시입니다(실제 병원 자산대장 연계는 본 사업 대상). 우선순위 = 내용연수 초과연수×20 + 가동률 70% 이상 20 + 필수의료 연관 30 (플랫폼 규칙).
                </p>
                <table className="w-full text-xs border-collapse">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500">
                    <tr>
                      <th className="py-2 px-2 text-left font-bold">순위</th>
                      <th className="py-2 px-2 text-left font-bold">장비</th>
                      <th className="py-2 px-2 text-right font-bold">경과/내용연수</th>
                      <th className="py-2 px-2 text-right font-bold">가동률</th>
                      <th className="py-2 px-2 text-left font-bold">권고</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {장비.map((e, i) => (
                      <tr key={e.장비명} className={i === 0 ? 'bg-amber-50/60 dark:bg-amber-950/20' : ''}>
                        <td className="py-2 px-2 font-black">{i + 1}</td>
                        <td className="py-2 px-2 font-bold text-slate-800 dark:text-slate-200">
                          {e.장비명}
                          <span className="block text-[10px] font-normal text-slate-400">
                            {e.분야}
                            {e.필수의료_연관 ? ' · 필수의료' : ''}
                          </span>
                        </td>
                        <td className="py-2 px-2 text-right tabular-nums">
                          {e.경과연수}/{e.내용연수}년
                        </td>
                        <td className="py-2 px-2 text-right tabular-nums">{e.가동률_pct}%</td>
                        <td className="py-2 px-2 text-slate-600 dark:text-slate-300">
                          {e.권고}
                          {i === 0 && e.초과연수 > 0 ? ' (교체신청 1순위 추천)' : ''}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
