'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { BellRing, ClipboardList, Moon, SlidersHorizontal, Table2 } from 'lucide-react';
import { 투자_후보_목록, 투자_우선순위, 입력_경과분, type 가중치 } from '@/lib/NMC_투자배분_모자관제';
import { 전국_시군구_진단_데이터 } from '@/lib/시군구_데이터셋';
import { 응급의료기관_목록 } from '@/lib/응급의료기관_데이터셋';
import { 주소_지역_일치 } from '@/lib/지역_의료자원_집계';
import type { 실시간_응급실_기관정보 } from '@/lib/공공의료_자원_서비스';

// ③ NMC › 3-3 기능보강 투자배분 & 중앙모자의료 관제·환류 (사업지원팀·중앙모자센터 | AP-04·06)
// 좌측(투자배분)에는 요청에 따라 '병상' 용어를 쓰지 않는다.

const 카드 = 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-2';
const 시연 = <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">시연 데이터</span>;
const 시도_목록 = Array.from(new Set(전국_시군구_진단_데이터.map((r) => r.시도명)));

const 시연_미수용 = [
  { 사유: '신생아 집중치료 자리 부족', 건수: 14 },
  { 사유: '산과 전문의 당직 부재', 건수: 9 },
  { 사유: '마취·수술 인력 부족', 건수: 6 },
  { 사유: '장비(인큐베이터·인공호흡기) 사용 중', 건수: 4 },
  { 사유: '기타·사유 미기재', 건수: 3 },
];

interface 사업_실적 {
  사업명: string;
  실적_건수: number | null;
  집행액_천원: number | null;
  교부액_천원: number | null;
  증빙_첨부: boolean;
}

export function NMC_투자배분_모자관제_화면() {
  const [w, set_w] = useState<가중치>({ 수요: 2, 활용: 1, 유지비: 1 });
  const 후보 = useMemo(() => 투자_후보_목록(), []);
  const 순위 = useMemo(() => 투자_우선순위(후보, w), [후보, w]);

  // 미갱신 경보: 선택 시도의 권역·지역응급센터 소재 시군구를 E-Gen 실시간으로 조회
  const [시도, set_시도] = useState('강원특별자치도');
  const [기준_분, set_기준_분] = useState(60);
  const [실시간, set_실시간] = useState<{ 시군구: string; 기관: 실시간_응급실_기관정보[]; live: boolean }[] | null>(null);
  const 대상_시군구 = useMemo(
    () =>
      전국_시군구_진단_데이터
        .filter((r) => r.시도명 === 시도)
        .filter((r) => 응급의료기관_목록.some((h) => /권역응급의료센터|지역응급의료센터/.test(h.분류) && 주소_지역_일치(r.시도명, r.시군구명, h.주소)))
        .slice(0, 8),
    [시도]
  );
  useEffect(() => {
    let 취소 = false;
    set_실시간(null);
    Promise.all(
      대상_시군구.map((r) =>
        fetch(`/api/emergency/realtime?sido=${encodeURIComponent(r.시도명)}&sigungu=${encodeURIComponent(r.시군구명)}`)
          .then((x) => (x.ok ? x.json() : null))
          .catch(() => null)
          .then((d) => ({ 시군구: r.시군구명, 기관: (d?.all_hospitals ?? []) as 실시간_응급실_기관정보[], live: Boolean(d?.is_live_api) }))
      )
    ).then((rs) => !취소 && set_실시간(rs));
    return () => {
      취소 = true;
    };
  }, [대상_시군구]);
  const 경보 = (실시간 ?? []).flatMap((s) =>
    s.live ? s.기관.map((h) => ({ 시군구: s.시군구, 기관명: h.기관명, 경과: 입력_경과분(h.최종_입력일시) })) : []
  );
  const 연동됨 = (실시간 ?? []).some((s) => s.live);

  const [실적, set_실적] = useState<사업_실적[]>([{ 사업명: '(예시) 고위험 산모·신생아 통합치료센터 운영', 실적_건수: 120, 집행액_천원: 480000, 교부액_천원: 450000, 증빙_첨부: false }]);
  const 실적_검증 = 실적.map((r) => {
    const 문제: string[] = [];
    if (r.실적_건수 === null || r.실적_건수 <= 0) 문제.push('실적 건수 누락');
    if (r.집행액_천원 !== null && r.교부액_천원 !== null && r.집행액_천원 > r.교부액_천원) 문제.push('집행액이 교부액 초과');
    if (!r.증빙_첨부) 문제.push('증빙 미첨부');
    return { ...r, 문제 };
  });

  const 슬라이더 = (라벨: string, k: keyof 가중치) => (
    <label className="flex items-center gap-2 text-[11px] text-slate-700 dark:text-slate-300">
      <span className="w-24">{라벨}</span>
      <input type="range" min={0} max={3} value={w[k]} onChange={(e) => set_w((p) => ({ ...p, [k]: Number(e.target.value) }))} aria-label={`${라벨} 가중치`} />
      <span className="w-4 tabular-nums">{w[k]}</span>
    </label>
  );

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8 space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-lg font-black text-slate-900 dark:text-white">기능보강 투자배분 & 중앙모자의료 관제·환류</h2>
        <span className="text-[11px] text-slate-500">사업지원팀·중앙모자센터 · 내부망 전용</span>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 items-start">
        {/* 좌측 */}
        <div className="space-y-4">
          <section className={카드}>
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5 flex-wrap"><SlidersHorizontal className="w-4 h-4 text-blue-600" /> 기능보강·시설·장비 투자 우선순위 시뮬레이터</h3>
            <p className="text-[11px] text-slate-500">
              지역수요 = 소재 시군구 종합 취약도(헬스맵 2024) · 활용률 = 소재 시군구 입원 자체충족률(대리지표, 2024 유출입) · 유지비 부담 = 경상운영비 ÷ 의료수익(알리미).
              각 값을 공시기관 내 백분위로 바꿔 가중합합니다(유지비는 낮을수록 가점). 플랫폼 규칙입니다.
            </p>
            {슬라이더('지역수요', '수요')}
            {슬라이더('활용률', '활용')}
            {슬라이더('유지비 부담', '유지비')}
            <div className="max-h-72 overflow-y-auto">
              <table className="w-full text-xs border-collapse">
                <thead className="sticky top-0 bg-slate-50 dark:bg-slate-800 text-slate-500"><tr><th className="py-1.5 px-2 text-left">순위</th><th className="py-1.5 px-2 text-left">기관</th><th className="py-1.5 px-2 text-right">지역수요</th><th className="py-1.5 px-2 text-right">활용률</th><th className="py-1.5 px-2 text-right">유지비</th><th className="py-1.5 px-2 text-right">점수</th></tr></thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {순위.map((x, i) => (
                    <tr key={x.기관명}>
                      <td className="py-1.5 px-2 font-black">{x.점수 === null ? '-' : i + 1}</td>
                      <td className="py-1.5 px-2 font-bold">{x.기관명}<span className="block text-[10px] font-normal text-slate-400">{x.시군구}</span></td>
                      <td className="py-1.5 px-2 text-right tabular-nums">{x.지역수요 ?? '-'}</td>
                      <td className="py-1.5 px-2 text-right tabular-nums">{x.활용률 === null ? '-' : `${x.활용률.toFixed(1)}%`}</td>
                      <td className="py-1.5 px-2 text-right tabular-nums">{x.유지비부담 === null ? '미공시' : `${x.유지비부담}%`}</td>
                      <td className="py-1.5 px-2 text-right tabular-nums font-black">{x.점수 ?? '산정 불가'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className={카드}>
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5"><Table2 className="w-4 h-4 text-emerald-600" /> 기관별 지원사업·지원액·배치인력 통합조회</h3>
            <p className="text-[11px] text-slate-500">지원액·인력은 알리미 최근 결산연도 공시. 사업별 지원 내역은 사업관리 원천 미연계라 표시하지 않습니다.</p>
            <div className="max-h-64 overflow-y-auto">
              <table className="w-full text-xs border-collapse">
                <thead className="sticky top-0 bg-slate-50 dark:bg-slate-800 text-slate-500"><tr><th className="py-1.5 px-2 text-left">기관</th><th className="py-1.5 px-2 text-right">정부지원(억)</th><th className="py-1.5 px-2 text-right">지자체지원(억)</th><th className="py-1.5 px-2 text-right">의사·간호</th><th className="py-1.5 px-2 text-left">지원사업</th></tr></thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {후보.map((x) => (
                    <tr key={x.기관명}><td className="py-1.5 px-2 font-bold">{x.기관명}</td><td className="py-1.5 px-2 text-right tabular-nums">{x.정부지원_억 ?? '-'}</td><td className="py-1.5 px-2 text-right tabular-nums">{x.지자체지원_억 ?? '-'}</td><td className="py-1.5 px-2 text-right tabular-nums">{x.의사직 ?? '-'}·{x.간호직 ?? '-'}</td><td className="py-1.5 px-2 text-slate-400">미연계</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* 우측: 중앙모자의료센터 */}
        <div className="space-y-4">
          <section className={카드}>
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5 flex-wrap"><BellRing className="w-4 h-4 text-rose-600" /> 미갱신 병상 자동경보</h3>
            <div className="flex flex-wrap items-center gap-2 text-[11px]">
              <select value={시도} onChange={(e) => set_시도(e.target.value)} className="px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800" aria-label="시도">{시도_목록.map((s) => <option key={s}>{s}</option>)}</select>
              <label className="flex items-center gap-1">기준 <input type="number" min={10} value={기준_분} onChange={(e) => set_기준_분(Math.max(10, Number(e.target.value) || 60))} className="w-16 px-1.5 py-0.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-right" /> 분 이상 미갱신</label>
            </div>
            <p className="text-[11px] text-slate-500">권역·지역응급센터가 있는 시군구 {대상_시군구.length}곳을 E-Gen 실시간으로 조회해 기관 입력일시(hvidate)를 봅니다.</p>
            {실시간 === null ? (
              <p className="text-xs text-slate-500">조회 중…</p>
            ) : !연동됨 ? (
              <p className="text-xs text-amber-700 dark:text-amber-300">E-Gen 실시간이 연동되지 않아 입력일시를 확인할 수 없습니다.</p>
            ) : (
              <table className="w-full text-xs border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500"><tr><th className="py-1.5 px-2 text-left">기관</th><th className="py-1.5 px-2 text-left">시군구</th><th className="py-1.5 px-2 text-right">마지막 입력</th><th className="py-1.5 px-2 text-left">상태</th></tr></thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {경보.sort((a, b) => (b.경과 ?? 1e9) - (a.경과 ?? 1e9)).map((x) => (
                    <tr key={`${x.시군구}-${x.기관명}`}>
                      <td className="py-1.5 px-2 font-bold">{x.기관명}</td>
                      <td className="py-1.5 px-2">{x.시군구}</td>
                      <td className="py-1.5 px-2 text-right tabular-nums">{x.경과 === null ? '입력일시 없음' : `${x.경과}분 전`}</td>
                      <td className={`py-1.5 px-2 font-bold ${x.경과 === null || x.경과 >= 기준_분 ? 'text-rose-600' : 'text-emerald-600'}`}>{x.경과 === null || x.경과 >= 기준_분 ? '경보' : '정상'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>

          <section className={카드}>
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5 flex-wrap"><Moon className="w-4 h-4 text-indigo-600" /> 야간 미수용(거절) 사유 병목 분석 {시연}</h3>
            <p className="text-[11px] text-slate-500">전원 거절 사유 원천(중앙모자의료센터 전원 기록)이 미연계라 시연 데이터로 집계 방식을 보여줍니다.</p>
            {시연_미수용.map((x) => {
              const 합 = 시연_미수용.reduce((a, b) => a + b.건수, 0);
              return (
                <div key={x.사유} className="text-[11px]">
                  <div className="flex justify-between"><span>{x.사유}</span><span className="tabular-nums">{x.건수}건 ({Math.round((x.건수 / 합) * 100)}%)</span></div>
                  <div className="h-1.5 rounded bg-slate-100 dark:bg-slate-800"><div className="h-1.5 rounded bg-indigo-500" style={{ width: `${(x.건수 / 합) * 100}%` }} /></div>
                </div>
              );
            })}
          </section>

          <section className={카드}>
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5 flex-wrap"><ClipboardList className="w-4 h-4 text-emerald-600" /> 11개 지원사업 실적·증빙 검증</h3>
            <p className="text-[11px] text-slate-500">사업 목록은 중앙모자의료센터 사업안내서 기준으로 등록합니다(이 프로토타입에는 사업 목록 원문이 없어 예시 1건). 규칙: 실적 누락 · 집행액 &gt; 교부액 · 증빙 미첨부.</p>
            {실적_검증.map((r, i) => (
              <div key={i} className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-[11px] space-y-1">
                <div className="font-bold">{r.사업명}</div>
                <div className="flex flex-wrap gap-2 items-center">
                  <span>실적 {r.실적_건수 ?? '-'}건 · 집행 {r.집행액_천원?.toLocaleString() ?? '-'} / 교부 {r.교부액_천원?.toLocaleString() ?? '-'}천원</span>
                  <label className="flex items-center gap-1"><input type="checkbox" checked={r.증빙_첨부} onChange={(e) => set_실적((p) => p.map((x, j) => (j === i ? { ...x, 증빙_첨부: e.target.checked } : x)))} /> 증빙 첨부</label>
                </div>
                {r.문제.length ? <div className="text-rose-600 font-bold">⚠ {r.문제.join(' · ')}</div> : <div className="text-emerald-600 font-bold">검증 통과</div>}
              </div>
            ))}
          </section>
        </div>
      </div>
    </div>
  );
}
