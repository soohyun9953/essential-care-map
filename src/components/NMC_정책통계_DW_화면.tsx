'use client';

import React, { useMemo, useState } from 'react';
import { Database, FileText, MapPinned, Network } from 'lucide-react';
import { 취약지_요약, 자연어_질의, 질의_예시, 정책_요구자료_초안, type 질의_결과 } from '@/lib/NMC_정책통계_DW';

// ③ NMC › 3-2 전국 취약지 정책통계·연계실적 & 통합 DW 분석 (정책연구팀·책임지원팀 | AP-05·08·01)

const 카드 = 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-2';
const 코드 = (c: string) => <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300">{c}</span>;

export function NMC_정책통계_DW_화면() {
  const 요약 = useMemo(() => 취약지_요약(), []);
  const [질문, set_질문] = useState(질의_예시[0]);
  const [결과, set_결과] = useState<질의_결과 | { 오류: string } | null>(() => 자연어_질의(질의_예시[0]));
  const [요청기관, set_요청기관] = useState<'국회' | '보건복지부'>('국회');
  const [요청내용, set_요청내용] = useState('시도별 필수의료 취약지 현황');
  const [초안, set_초안] = useState('');

  return (
    <div className="max-w-[1500px] mx-auto w-full p-4 sm:p-6 space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-lg font-black text-slate-900 dark:text-white">전국 취약지 정책통계·연계실적 & 통합 DW 분석</h2>
        {코드('AP-05·08·01')}
        <span className="text-[11px] text-slate-500">정책연구팀·책임지원팀 · 내부망 전용</span>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 items-start">
        <section className={카드}>
          <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5 flex-wrap"><MapPinned className="w-4 h-4 text-rose-600" /> 전국 250개 시군구 응급·분만·소아 취약지 식별 {코드('AIS-05-03')}</h3>
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
          <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5 flex-wrap"><Network className="w-4 h-4 text-blue-600" /> 책임의료기관 퇴원연계 실적 자동취합·해설 {코드('AIS-01-07')}</h3>
          <div className="p-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 space-y-1">
            <p className="font-bold">실적 원천 미연계 — 표시할 실적이 없습니다.</p>
            <p>55개 책임의료기관의 퇴원연계 실적은 공공의료 연계망(퇴원환자 의뢰·회신)에서 자동 취합해야 합니다. 이 프로토타입에는 해당 원천이 없어 숫자를 만들지 않았습니다.</p>
            <p className="text-slate-500">취합 예정 항목: 기관별 퇴원환자 평가 건수, 지역사회 연계 의뢰 건수, 연계기관 회신율, 연계 후 30일 재입원.</p>
          </div>
        </section>

        <section className={카드}>
          <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5 flex-wrap"><Database className="w-4 h-4 text-indigo-600" /> 통합 DW 대화형 자연어 질의 (Text-to-SQL) {코드('AIS-08-01')}</h3>
          <p className="text-[11px] text-slate-500">정해진 질문 유형을 SQL로 바꿔 플랫폼 내장 테이블(시군구_진단, 알리미_공시)에서 실행합니다. 자유 질의(내부 sLLM)는 본 사업 대상입니다.</p>
          <form onSubmit={(e) => { e.preventDefault(); set_결과(자연어_질의(질문)); }} className="flex gap-1.5">
            <input value={질문} onChange={(e) => set_질문(e.target.value)} className="flex-1 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs" aria-label="자연어 질의" />
            <button type="submit" className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold cursor-pointer">실행</button>
          </form>
          <div className="flex flex-wrap gap-1">
            {질의_예시.map((q) => (
              <button key={q} type="button" onClick={() => { set_질문(q); set_결과(자연어_질의(q)); }} className="px-2 py-0.5 rounded-lg text-[10px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 cursor-pointer">{q}</button>
            ))}
          </div>
          {결과 && ('오류' in 결과 ? (
            <p className="text-xs text-rose-600">{결과.오류}</p>
          ) : (
            <>
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
            </>
          ))}
        </section>

        <section className={카드}>
          <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5 flex-wrap"><FileText className="w-4 h-4 text-emerald-600" /> 국회·복지부 정책 요구자료 초안 {코드('TB-PR-07')}</h3>
          <div className="flex flex-wrap gap-2">
            <select value={요청기관} onChange={(e) => set_요청기관(e.target.value as '국회' | '보건복지부')} className="px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs" aria-label="요청기관">
              <option>국회</option><option>보건복지부</option>
            </select>
            <input value={요청내용} onChange={(e) => set_요청내용(e.target.value)} className="flex-1 px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs" aria-label="요청 내용" />
            <button type="button" onClick={() => set_초안(정책_요구자료_초안(요청기관, 요청내용))} className="px-3 py-1 rounded-lg bg-emerald-600 text-white text-xs font-bold cursor-pointer">초안 생성</button>
          </div>
          {초안 && <textarea readOnly value={초안} rows={14} className="w-full text-[11px] leading-relaxed p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-mono" aria-label="요구자료 초안" />}
          <p className="text-[10px] text-slate-400">취약지 통계로 채우는 템플릿 초안입니다. 제출 전 최신 지정 고시와 대조해야 합니다.</p>
        </section>
      </div>
    </div>
  );
}
