'use client';

import React, { useMemo, useState } from 'react';
import { ArrowRight, ClipboardCheck, FileText, GitCompareArrows, TriangleAlert } from 'lucide-react';
import type { 워크스페이스_타입 } from './글로벌_공공_헤더';
import { 알리미_기관_공시_목록 } from '@/lib/알리미_경영공시_데이터셋';
import { 알리미_공시_자동점검 } from '@/lib/알리미_공시_품질점검';
import { 평가_모듈, 교차검증_항목, 원천값, 교차검증, 공시_이상치, 평가_환류, 심사보고서_초안, type 교차검증_항목_키 } from '@/lib/NMC_평가_모니터링';

// ③ NMC › 3-1 통합 평가·공시심사·성과 모니터링 AI (기획평가팀·정보운영팀 | AP-03)

const 카드 = 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-2';
const 코드 = (c: string) => <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300">{c}</span>;

export function NMC_평가_모니터링_화면({ on_navigate }: { on_navigate: (ws: 워크스페이스_타입, sub?: string) => void }) {
  const [기관번호, set_기관번호] = useState(알리미_기관_공시_목록.find((h) => h.기관명 === '영월의료원')!.기관번호);
  const 기관 = 알리미_기관_공시_목록.find((h) => h.기관번호 === 기관번호)!;
  const 초기 = () => Object.fromEntries(교차검증_항목.map((k) => [k, 원천값(기관, k)])) as Record<교차검증_항목_키, number | null>;
  const [제출, set_제출] = useState(초기);
  const [제출_기관, set_제출_기관] = useState(기관번호);
  if (제출_기관 !== 기관번호) {
    set_제출_기관(기관번호);
    set_제출(초기());
  }
  const 교차 = useMemo(() => 교차검증(기관, 제출), [기관, 제출]);
  const 이상치 = useMemo(() => 공시_이상치(), []);
  const 자동점검_수 = useMemo(() => 알리미_공시_자동점검().length, []);
  const 환류 = useMemo(() => 평가_환류(기관), [기관]);
  const 보고서 = useMemo(() => 심사보고서_초안(기관, 교차), [기관, 교차]);

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8 space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-lg font-black text-slate-900 dark:text-white">통합 평가·공시심사·성과 모니터링 AI</h2>
        {코드('AP-03')}
        <span className="text-[11px] text-slate-500">기획평가팀·정보운영팀 · 내부망 전용</span>
        <select value={기관번호} onChange={(e) => set_기관번호(e.target.value)} className="ml-auto px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm" aria-label="심사 대상 기관">
          {알리미_기관_공시_목록.map((h) => <option key={h.기관번호} value={h.기관번호}>{h.기관명}</option>)}
        </select>
      </div>

      {/* 3대 평가 모듈 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {평가_모듈.map((m) => (
          <div key={m.id} className={카드}>
            <div className="text-sm font-black text-slate-900 dark:text-white">{m.이름}</div>
            <div className="text-[11px] text-slate-500">원천: {m.원천}</div>
            {m.id === '시도계획' && (
              <button type="button" onClick={() => on_navigate('policy_planning', 'evaluation')} className="text-xs font-bold text-blue-600 hover:underline cursor-pointer flex items-center gap-1">시행계획 AI 평가 화면 열기 <ArrowRight className="w-3 h-3" /></button>
            )}
            {m.id === '운영평가' && (
              <button type="button" onClick={() => on_navigate('medical_institution', 'operation_eval')} className="text-xs font-bold text-blue-600 hover:underline cursor-pointer flex items-center gap-1">운영평가 대시보드 열기 <ArrowRight className="w-3 h-3" /></button>
            )}
            {m.id === '책임의료' && <span className="text-[11px] text-amber-700 dark:text-amber-300">연계망 실적 원천 미연계 — 교차검증 불가</span>}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 items-start">
        <section className={카드}>
          <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5 flex-wrap"><GitCompareArrows className="w-4 h-4 text-indigo-600" /> 제출증빙 ↔ 원천데이터 교차검증 {코드('AIS-03-01')}</h3>
          <p className="text-[11px] text-slate-500">원천은 알리미 공시(최근 결산연도·2025 감면액). 제출값은 평가 제출본을 입력합니다.</p>
          <table className="w-full text-xs border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500"><tr><th className="py-1.5 px-2 text-left">항목</th><th className="py-1.5 px-2 text-right">제출</th><th className="py-1.5 px-2 text-right">원천</th><th className="py-1.5 px-2 text-left">판정</th></tr></thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {교차.map((c) => (
                <tr key={c.항목}>
                  <td className="py-1.5 px-2 font-bold text-slate-700 dark:text-slate-300">{c.항목.replace(/_/g, ' ')}</td>
                  <td className="py-1.5 px-2 text-right">
                    {(교차검증_항목 as readonly string[]).includes(c.항목) ? (
                      <input type="number" value={제출[c.항목 as 교차검증_항목_키] ?? ''} onChange={(e) => set_제출((p) => ({ ...p, [c.항목]: e.target.value === '' ? null : Number(e.target.value) }))} className="w-28 px-1.5 py-0.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-right tabular-nums" aria-label={`${c.항목} 제출값`} />
                    ) : '-'}
                  </td>
                  <td className="py-1.5 px-2 text-right tabular-nums text-slate-500">{c.원천?.toLocaleString() ?? '-'}</td>
                  <td className={`py-1.5 px-2 font-bold ${c.판정 === '일치' ? 'text-emerald-600' : c.판정 === '불일치' ? 'text-rose-600' : 'text-slate-400'}`}>{c.판정}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button type="button" onClick={() => set_제출((p) => ({ ...p, 의사직_현원: (p.의사직_현원 ?? 0) + 3 }))} className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 cursor-pointer">예시: 제출 의사 수 +3 (과다 보고)</button>
        </section>

        <section className={카드}>
          <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5 flex-wrap"><TriangleAlert className="w-4 h-4 text-amber-600" /> 공시 이상치 탐지 {코드('AIS-03-03')}</h3>
          <p className="text-[11px] text-slate-500">42곳 2025년 전년 대비 증감률의 수정 z-score |z| &gt; 3.5 (Iglewicz–Hoaglin). 규칙 기반 자동점검 {자동점검_수}건은 공시검증 대시보드에서 확인.</p>
          <table className="w-full text-xs border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500"><tr><th className="py-1.5 px-2 text-left">기관</th><th className="py-1.5 px-2 text-left">항목</th><th className="py-1.5 px-2 text-right">전년 대비</th><th className="py-1.5 px-2 text-right">z</th></tr></thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {이상치.slice(0, 10).map((x) => (
                <tr key={`${x.기관명}-${x.항목}`} className={x.기관명 === 기관.기관명 ? 'bg-amber-50/60 dark:bg-amber-950/20' : ''}>
                  <td className="py-1.5 px-2 font-bold">{x.기관명}</td>
                  <td className="py-1.5 px-2">{x.항목.replace(/_/g, ' ')}</td>
                  <td className="py-1.5 px-2 text-right tabular-nums">{x.증감률_pct > 0 ? '+' : ''}{x.증감률_pct}%</td>
                  <td className="py-1.5 px-2 text-right tabular-nums">{x.z}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className={카드}>
          <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5 flex-wrap"><FileText className="w-4 h-4 text-blue-600" /> 평가위원 종합 심사보고서 초안 {코드('AIS-03-06')}</h3>
          <p className="text-[11px] text-slate-500">교차검증·자동점검·이상치·취약영역을 모은 규칙 기반 초안입니다. 내부 sLLM(S등급) 연계 시 문장을 고도화하며, 최종 판단은 평가위원이 합니다.</p>
          <textarea readOnly value={보고서} rows={14} className="w-full text-[11px] leading-relaxed p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-mono" aria-label="심사보고서 초안" />
        </section>

        <section className={카드}>
          <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5 flex-wrap"><ClipboardCheck className="w-4 h-4 text-emerald-600" /> 3단계 자동 환류: 평가 취약영역 ➔ 운영진단·멘토링 ➔ LMS 직무교육</h3>
          <p className="text-[11px] text-slate-500">취약영역 = 알리미 공시 지표 중 공시기관 내 백분위 30 미만. 교육과정은 예시입니다.</p>
          {환류.length === 0 ? (
            <p className="text-xs text-emerald-700 dark:text-emerald-300">하위 30% 지표가 없어 환류 대상이 없습니다.</p>
          ) : (
            <div className="space-y-2">
              {환류.map((x) => (
                <div key={x.취약영역} className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 text-[11px]">
                  <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200"><strong>① {x.취약영역}</strong><br />값 {x.값} · 백분위 {x.백분위}</div>
                  <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200"><strong>② 운영진단·멘토링</strong><br />{x.운영진단}</div>
                  <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200"><strong>③ LMS 배정</strong><br />{x.LMS_과정}</div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
