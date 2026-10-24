'use client';

import React, { useMemo, useState } from 'react';
import { AI_질의_입력창 } from '@/components/ai/AI_질의_입력창';
import { Bot, Coins, GraduationCap, Route, ShieldAlert } from 'lucide-react';
import {
  에이전트_템플릿,
  MCP_도구,
  지식베이스_목록,
  에이전트_평가,
  배포_기준_통과율,
  라우팅_정책,
  정보등급_판정,
  법정의무교육,
  시연_이수_명단,
  미이수_탐지,
  시연_접근_로그,
  이상접근_탐지,
  type 에이전트_템플릿_종류,
  type 평가_결과,
} from '@/lib/NMC_에이전트_LLMOps';

// ③ NMC › 3-4 노코드 MCP 에이전트 빌더 & 교육기획·LLMOps (정보운영팀·교육센터 | Ⅳ.8·AP-07)

const 카드 = 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-2';
const 코드 = (c: string) => <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300">{c}</span>;
const 시연 = <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">시연 데이터</span>;

const 시연_토큰 = [
  { 부서: '정보운영팀', 한도: 2_000_000, 사용: 1_420_000 },
  { 부서: '기획평가팀', 한도: 1_000_000, 사용: 930_000 },
  { 부서: '정책연구팀', 한도: 1_500_000, 사용: 610_000 },
  { 부서: '중앙모자센터', 한도: 500_000, 사용: 520_000 },
];

export function NMC_에이전트_LLMOps_화면() {
  const [템플릿, set_템플릿] = useState<에이전트_템플릿_종류>('질의응답');
  const 전체_KB = useMemo(() => 지식베이스_목록(), []);
  const [KB, set_KB] = useState<string[]>([]);
  const [도구, set_도구] = useState<string[]>(['rag']);
  const [평가, set_평가] = useState<평가_결과[] | null>(null);
  const [배포, set_배포] = useState('');
  const 통과율 = 평가 ? 평가.filter((x) => x.통과).length / 평가.length : 0;

  const [입력, set_입력] = useState('');
  const [시험문장, set_시험문장] = useState('');
  const 판정 = 정보등급_판정(시험문장);
  const 미이수 = useMemo(() => 미이수_탐지(시연_이수_명단), []);
  const 이상 = useMemo(() => 이상접근_탐지(시연_접근_로그), []);

  const 토글 = (arr: string[], v: string) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8 space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-lg font-black text-slate-900 dark:text-white">노코드 MCP 에이전트 빌더 & 교육기획·LLMOps</h2>
        {코드('Ⅳ.8 · AP-07 · 과제 3.13')}
        <span className="text-[11px] text-slate-500">정보운영팀·교육센터 · 내부망 전용</span>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 items-start">
        {/* 좌측 */}
        <div className="space-y-4">
          <section className={카드}>
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5"><Bot className="w-4 h-4 text-blue-600" /> 노코드 에이전트 스튜디오</h3>
            <div className="text-[11px] font-bold text-slate-500">① 템플릿</div>
            <div className="flex flex-wrap gap-1.5">
              {에이전트_템플릿.map((t) => (
                <button key={t} type="button" onClick={() => { set_템플릿(t); set_평가(null); set_배포(''); }} className={`px-2.5 py-1 rounded-lg text-xs font-bold border cursor-pointer ${t === 템플릿 ? 'bg-blue-600 text-white border-blue-600' : 'border-slate-200 dark:border-slate-700'}`}>{t}</button>
              ))}
            </div>
            <div className="text-[11px] font-bold text-slate-500">② S등급 부서 지식베이스 (RAG, 선택 없으면 전체)</div>
            <div className="flex flex-wrap gap-1.5">
              {전체_KB.map((k) => (
                <label key={k} className="flex items-center gap-1 text-[11px]"><input type="checkbox" checked={KB.includes(k)} onChange={() => { set_KB((p) => 토글(p, k)); set_평가(null); }} /> {k}</label>
              ))}
            </div>
            <div className="text-[11px] font-bold text-slate-500">③ 중앙 MCP Gateway 도구</div>
            <div className="space-y-0.5">
              {MCP_도구.map((d) => (
                <label key={d.id} className="flex items-center gap-1.5 text-[11px]"><input type="checkbox" checked={도구.includes(d.id)} onChange={() => set_도구((p) => 토글(p, d.id))} /> {d.이름} <span className="text-slate-400">({d.경로})</span></label>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              <button type="button" onClick={() => { set_평가(에이전트_평가(템플릿, KB)); set_배포(''); }} className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold cursor-pointer">④ 시험평가(Evals) 실행</button>
              <button type="button" disabled={!평가 || 통과율 < 배포_기준_통과율} onClick={() => set_배포(`「${템플릿}」 에이전트를 업무화면 [AI 도움] 버튼에 배포 대기열로 등록했습니다 (시뮬레이션).`)} className="px-3 py-1.5 rounded-xl bg-emerald-600 disabled:opacity-40 text-white text-xs font-bold cursor-pointer">⑤ [AI 도움] 버튼으로 배포</button>
            </div>
            {평가 && (
              <div className="space-y-1">
                <div className={`text-xs font-black ${통과율 >= 배포_기준_통과율 ? 'text-emerald-600' : 'text-rose-600'}`}>통과율 {Math.round(통과율 * 100)}% (배포 기준 {배포_기준_통과율 * 100}%)</div>
                {평가.map((r) => (
                  <div key={r.사례} className="text-[11px]"><span className={r.통과 ? 'text-emerald-600' : 'text-rose-600'}>{r.통과 ? '✔' : '✘'}</span> {r.사례} <span className="text-slate-400">— {r.근거}</span></div>
                ))}
              </div>
            )}
            {배포 && <p className="text-[11px] text-emerald-700 dark:text-emerald-300">{배포}</p>}
            <p className="text-[10px] text-slate-400">Evals는 플랫폼의 실제 함수(지침 검색·요구자료 초안·공시 자동점검·DW 질의)를 실행해 채점합니다. 실제 배포 파이프라인은 본 사업 대상입니다.</p>
          </section>

          <section className={카드}>
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5 flex-wrap"><GraduationCap className="w-4 h-4 text-emerald-600" /> 교육과정 기획·법정교육 미이수 탐지 {코드('AIS-07-05~07')} {시연}</h3>
            <div className="text-[11px] text-slate-500">법정 의무교육 {법정의무교육.length}종 (근거 법령) — 연간 계획에 필수 반영</div>
            <ul className="text-[11px] space-y-0.5">{법정의무교육.map((c) => <li key={c.과정}>· {c.과정} <span className="text-slate-400">({c.근거})</span></li>)}</ul>
            <div className="text-[11px] font-bold text-rose-600 pt-1">미이수 {미이수.length}건 (시연 명단)</div>
            <ul className="text-[11px] space-y-0.5">{미이수.map((m) => <li key={`${m.직원}-${m.과정}`}>· {m.직원}({m.부서}) — {m.과정}</li>)}</ul>
          </section>
        </div>

        {/* 우측 */}
        <div className="space-y-4">
          <section className={카드}>
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5"><Route className="w-4 h-4 text-indigo-600" /> Model Gateway 정보등급별 라우팅 관제</h3>
            <table className="w-full text-xs border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500"><tr><th className="py-1.5 px-2 text-left">등급</th><th className="py-1.5 px-2 text-left">라우팅</th><th className="py-1.5 px-2 text-left">설명</th></tr></thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {(['C', 'S', 'O'] as const).map((g) => (
                  <tr key={g} className={시험문장 && g === 판정.등급 ? 'bg-indigo-50/70 dark:bg-indigo-950/30' : ''}>
                    <td className="py-1.5 px-2 font-black">{라우팅_정책[g].이름}</td><td className="py-1.5 px-2">{라우팅_정책[g].경로}</td><td className="py-1.5 px-2 text-slate-500">{라우팅_정책[g].설명}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <label className="block text-[11px] font-bold text-slate-500">요청 문장으로 라우팅 시험</label>
            <AI_질의_입력창 value={입력} onChange={set_입력} onSubmit={set_시험문장} 예시="환자 홍길동(010-1234-5678) 퇴원 의뢰서 요약해줘" 실행_라벨="라우팅" 크기="sm" aria_label="라우팅 시험 문장" />
            {시험문장 && (
              <p className="text-xs"><strong>{라우팅_정책[판정.등급].이름} → {라우팅_정책[판정.등급].경로}</strong> <span className="text-slate-500">({판정.사유})</span></p>
            )}
            <p className="text-[10px] text-slate-400">개인정보 탐지는 플랫폼 비식별화 엔진(정규식), 기밀 판정은 표시어 규칙입니다.</p>
          </section>

          <section className={카드}>
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5 flex-wrap"><Coins className="w-4 h-4 text-amber-600" /> 부서별 토큰 한도 (FinOps) {시연}</h3>
            {시연_토큰.map((t) => {
              const p = Math.round((t.사용 / t.한도) * 100);
              return (
                <div key={t.부서} className="text-[11px]">
                  <div className="flex justify-between"><span>{t.부서}</span><span className={`tabular-nums ${p >= 100 ? 'text-rose-600 font-bold' : p >= 90 ? 'text-amber-600 font-bold' : ''}`}>{t.사용.toLocaleString()} / {t.한도.toLocaleString()} ({p}%){p >= 100 ? ' 한도 초과 — 차단' : p >= 90 ? ' 경고' : ''}</span></div>
                  <div className="h-1.5 rounded bg-slate-100 dark:bg-slate-800"><div className={`h-1.5 rounded ${p >= 100 ? 'bg-rose-500' : p >= 90 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(100, p)}%` }} /></div>
                </div>
              );
            })}
          </section>

          <section className={카드}>
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5 flex-wrap"><ShieldAlert className="w-4 h-4 text-rose-600" /> 개인정보 이상접근 탐지 {코드('AIS-09-02')} {시연}</h3>
            <p className="text-[11px] text-slate-500">규칙: 야간(22~06시) 민감정보 50건 이상 대량조회 · 업무 무관 민감정보 조회 · 야간 민감정보 조회</p>
            {이상.map((x, i) => (
              <div key={i} className="text-[11px] flex gap-2"><span className={`shrink-0 px-1.5 rounded font-bold ${x.수준 === '경고' ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300' : 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300'}`}>{x.수준}</span>{x.사용자} — {x.사유}</div>
            ))}
          </section>
        </div>
      </div>
    </div>
  );
}
