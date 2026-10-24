'use client';

import React, { useMemo, useState } from 'react';
import { Building2, ExternalLink } from 'lucide-react';
import { 알리미_기관_공시_목록, 알리미_공시_출처 } from '@/lib/알리미_경영공시_데이터셋';
import { 경영지표_계산, 알리미_병상수, 알리미_소재지, 최근_결산연도, 알리미_공시_조회 } from '@/lib/알리미_경영지표';
import { 병원_실데이터_조회 } from '@/lib/공공병원_실데이터_연계';

// 선택 지역 공공병원 비교 (최대 3곳, 지역 선택을 따른다)
// - 후보: 선택 지역의 알리미 공시 기관. 강원을 고르면 알리미 공시 대상이 아닌 근로복지공단 태백병원도 후보에 넣는다
// - 기본: 강원(또는 전체)은 강원 남부 진료권 영월·삼척의료원 + 태백병원, 그 밖의 지역은 목록 앞 3곳
export interface 비교_후보 {
  이름: string;
  시도: string;
  시군구: string;
}

const 강원 = '강원특별자치도';
const 태백병원: 비교_후보 = { 이름: '근로복지공단 태백병원', 시도: 강원, 시군구: '태백시' };
const 강원남부_기본 = ['영월의료원', '삼척의료원', 태백병원.이름];
const 최대_비교 = 3;

function 지역_공공병원_비교표({ 지역명, 후보, 기본 }: { 지역명: string; 후보: 비교_후보[]; 기본: string[] }) {
  const [선택, set_선택] = useState<string[]>(기본);
  const 토글 = (이름: string) =>
    set_선택((prev) => (prev.includes(이름) ? prev.filter((x) => x !== 이름) : prev.length >= 최대_비교 ? prev : [...prev, 이름]));
  const 비교_병원 = 선택.map((이름) => 후보.find((b) => b.이름 === 이름)).filter((b): b is 비교_후보 => Boolean(b));
  const 행 = 비교_병원.map((b) => {
    const 실 = 병원_실데이터_조회(b.이름, b.시도, b.시군구);
    const 공시 = 알리미_공시_조회(b.이름);
    const r = 공시 ? 최근_결산연도(공시) : undefined;
    return { b, 실, 공시, r };
  });
  const 미공시 = '알리미 공시 대상 아님';
  const 원 = (v: number | null | undefined) => (v === null || v === undefined ? '-' : `${Math.round(v / 10000).toLocaleString()}만원`);
  const 율 = (v: number | null | undefined) => (v === null || v === undefined ? '-' : `${v}%`);
  const 항목: { 라벨: string; 값: (x: (typeof 행)[number]) => string; 출처: string }[] = [
    { 라벨: '허가병상', 값: (x) => (x.실.병상수 === null ? '자료 없음' : `${x.실.병상수}병상`), 출처: '공공의료기관 데이터셋' },
    { 라벨: '응급의료기관 지정', 값: (x) => x.실.응급의료기관_분류 ?? '미지정', 출처: 'E-Gen 응급의료기관 목록' },
    { 라벨: '분만', 값: (x) => (x.실.분만가능 ? (x.실.야간분만 ? '가능 (야간 실적 있음)' : '가능') : '청구 실적 없음'), 출처: '심평원 분만가능 의료기관 (2025.1~2026.4 청구)' },
    { 라벨: '달빛어린이병원', 값: (x) => (x.실.달빛어린이병원 ? '지정' : '미지정'), 출처: '국립중앙의료원 달빛어린이병원 목록' },
    { 라벨: '의사 · 간호사 (현원)', 값: (x) => (x.r ? `${x.r.의사직_현원 ?? '-'}명 · ${x.r.간호직_현원 ?? '-'}명 (${x.r.연도})` : 미공시), 출처: '알리미 직원 현황' },
    { 라벨: 'CP(표준진료지침) 적용률', 값: () => '자료 없음', 출처: '병원별 공개 자료 없음' },
    {
      라벨: '취약계층 진료비 감면액',
      값: (x) => (x.공시 ? (x.공시.감면액 ? 원(x.공시.감면액.취약계층_감면총액_원) : '자료 없음') : 미공시),
      출처: '알리미 감면액 (2025)',
    },
    {
      라벨: '취약계층 감면율 (진찰료·일반진료비·검진비)',
      값: (x) =>
        x.공시
          ? x.공시.감면액
            ? `${율(x.공시.감면액.취약계층_진찰료_율)} · ${율(x.공시.감면액.취약계층_일반진료비_율)} · ${율(x.공시.감면액.취약계층_종합검진비_율)}`
            : '자료 없음'
          : 미공시,
      출처: '알리미 감면액 (2025)',
    },
  ];
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3">
      <div>
        <h3 className="text-sm font-black text-slate-900 dark:text-white">{지역명} 공공병원 비교 — 필수의료 운영 · CP 적용률 · 취약계층 감면</h3>
        <p className="text-[11px] text-slate-500 mt-0.5">
          공개된 값만 표시합니다. 병원별 CP 적용률은 공개 자료가 없습니다.
          {선택.includes(태백병원.이름) && ' 태백병원은 근로복지공단 소속이라 지역거점공공병원 알리미 공시 대상이 아닙니다.'}
        </p>
      </div>
      {/* 비교할 병원 고르기 (최대 3곳) */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[11px] font-bold text-slate-500 mr-1">
          비교 병원 ({선택.length}/{최대_비교})
        </span>
        {후보.map((b) => {
          const 켜짐 = 선택.includes(b.이름);
          const 막힘 = !켜짐 && 선택.length >= 최대_비교;
          return (
            <button
              key={b.이름}
              type="button"
              onClick={() => 토글(b.이름)}
              disabled={막힘}
              aria-pressed={켜짐}
              title={막힘 ? '최대 3곳까지 비교합니다. 다른 병원을 먼저 빼 주세요.' : `${b.시도} ${b.시군구}`}
              className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold transition cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 ${
                켜짐
                  ? 'bg-rose-600 text-white border-rose-600'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-400'
              }`}
            >
              {b.이름}
            </button>
          );
        })}
      </div>
      {행.length === 0 ? (
        <p className="text-xs text-slate-500 py-4 text-center">비교할 병원을 위에서 골라 주세요.</p>
      ) : (
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead className="text-slate-500 bg-slate-50 dark:bg-slate-800/60">
            <tr>
              <th className="py-2 px-3 text-left font-bold">항목</th>
              {행.map((x) => (
                <th key={x.b.이름} className="py-2 px-3 text-left font-bold whitespace-nowrap">
                  {x.b.이름}
                  <span className="block text-[10px] font-medium text-slate-400">{x.b.시군구}</span>
                </th>
              ))}
              <th className="py-2 px-3 text-left font-bold">출처</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {항목.map((h) => (
              <tr key={h.라벨}>
                <td className="py-2 px-3 font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">{h.라벨}</td>
                {행.map((x) => {
                  const v = h.값(x);
                  return (
                    <td key={x.b.이름} className={`py-2 px-3 tabular-nums ${v === '자료 없음' || v === 미공시 ? 'text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                      {v}
                    </td>
                  );
                })}
                <td className="py-2 px-3 text-[11px] text-slate-400">{h.출처}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}
    </div>
  );
}

// ① 대국민 1-3: 우리 지역 공공병원 알리미 비교
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
  // 기본은 강원 (강원 남부 진료권 영월·삼척 비교로 시작)
  const [시도, set_시도] = useState<string>(강원);
  const 표시 = 행
    .filter((x) => 시도 === '전체' || x.소재지?.시도명 === 시도)
    .sort((a, b) => (a.소재지?.시도명 ?? '').localeCompare(b.소재지?.시도명 ?? '') || a.h.기관명.localeCompare(b.h.기관명));

  // 위쪽 비교표 후보·기본 선택 (지역 선택을 따름)
  const 비교_후보: 비교_후보[] = [
    ...표시.map((x) => ({ 이름: x.h.기관명, 시도: x.소재지?.시도명 ?? '', 시군구: x.소재지?.시군구명 ?? '' })),
    ...(시도 === 강원 || 시도 === '전체' ? [태백병원] : []),
  ];
  const 기본_선택 =
    시도 === 강원 || 시도 === '전체'
      ? 강원남부_기본.filter((이름) => 비교_후보.some((b) => b.이름 === 이름))
      : 비교_후보.slice(0, 최대_비교).map((b) => b.이름);

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8 space-y-4">
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

      <지역_공공병원_비교표 key={시도} 지역명={시도 === '전체' ? '전국' : 시도} 후보={비교_후보} 기본={기본_선택} />

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
