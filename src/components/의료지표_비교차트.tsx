'use client';

// Apple Health 스타일의 의료 지표 비교 차트 (레이더 & 수평 바 차트 & 6개년 시계열 실데이터 차트)

import React, { useState, useMemo } from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { 필수의료_진단_결과, 지역_평균_통계 } from '@/lib/필수의료_타입';
import {
  get_region_indicators_trend,
  헬스맵_24대_지표목록,
  지표_메타정보,
} from '@/lib/헬스맵_주제도_지표_데이터셋';
import { TrendingUp, BarChart2, PieChart, Activity, Sparkles } from 'lucide-react';

interface 의료지표_비교차트_속성 {
  selected_region: 필수의료_진단_결과 | null;
  sido_stat: 지역_평균_통계;
  national_stat: 지역_평균_통계;
}

export const 의료지표_비교차트: React.FC<의료지표_비교차트_속성> = ({
  selected_region,
  sido_stat,
  national_stat,
}) => {
  const [chart_tab, set_chart_tab] = useState<'radar' | 'bar' | 'trend'>('radar');
  const [selected_indicator_code, set_selected_indicator_code] = useState<string>('CBD06'); // 기본: 투석(인공신장실) RI

  if (!selected_region) return null;

  // 6개년 실데이터 시계열 조회
  const trend_dataset = useMemo(() => {
    return get_region_indicators_trend(selected_region.시도명, selected_region.시군구명);
  }, [selected_region.시도명, selected_region.시군구명]);

  const current_indicator_meta = useMemo(() => {
    return (
      헬스맵_24대_지표목록.find((i) => i.code === selected_indicator_code) ||
      헬스맵_24대_지표목록[0]
    );
  }, [selected_indicator_code]);

  // 시계열 차트 데이터 변환 (2019 ~ 2024년)
  const time_series_chart_data = useMemo(() => {
    const years = ['2019', '2020', '2021', '2022', '2023', '2024'];
    const local_vals = trend_dataset.indicators[selected_indicator_code]?.values || {};
    const sido_vals = trend_dataset.sido_indicators?.[selected_indicator_code]?.values || {};
    const nat_vals = trend_dataset.national_indicators[selected_indicator_code]?.values || {};

    return years.map((y) => ({
      year: `${y}년`,
      선택지역: local_vals[y] ?? 0,
      시도평균: sido_vals[y] ?? 0,
      전국평균: nat_vals[y] ?? 0,
    }));
  }, [trend_dataset, selected_indicator_code]);

  // 2019년 대비 2024년 변화율 계산
  const trend_delta = useMemo(() => {
    const v2019 = time_series_chart_data[0]?.선택지역 || 0;
    const v2024 = time_series_chart_data[time_series_chart_data.length - 1]?.선택지역 || 0;
    const diff = Math.round((v2024 - v2019) * 100) / 100;
    return { v2019, v2024, diff };
  }, [time_series_chart_data]);

  const 소아_자료_있음 = selected_region.소아_병상_공급비율 !== null;
  const radar_data = [
    {
      subject: '응급 도달성',
      선택지역: Math.max(0, 100 - selected_region.응급_60분_미도달_인구비율),
      시도평균: Math.max(0, 100 - sido_stat.평균_응급_60분_미도달_인구비율),
      전국평균: Math.max(0, 100 - national_stat.평균_응급_60분_미도달_인구비율),
    },
    {
      subject: '응급 RI 충족률',
      선택지역: selected_region.관내_응급_의료이용률,
      시도평균: sido_stat.평균_관내_응급_의료이용률,
      전국평균: national_stat.평균_관내_응급_의료이용률,
    },
    {
      subject: '분만 도달성',
      선택지역: Math.max(0, 100 - selected_region.분만_60분_미도달_인구비율),
      시도평균: Math.max(0, 100 - sido_stat.평균_분만_60분_미도달_인구비율),
      전국평균: Math.max(0, 100 - national_stat.평균_분만_60분_미도달_인구비율),
    },
    {
      subject: '분만 충족률',
      선택지역: selected_region.관내_분만율,
      시도평균: sido_stat.평균_관내_분만율,
      전국평균: national_stat.평균_관내_분만율,
    },
    {
      subject: '소아 병상공급',
      선택지역: selected_region.소아_병상_공급비율,
      시도평균: sido_stat.평균_소아_병상_공급비율,
      전국평균: national_stat.평균_소아_병상_공급비율,
    },
    {
      subject: '소아 야간휴일',
      선택지역: selected_region.소아_야간휴일_접근성지수,
      시도평균: sido_stat.평균_소아_야간휴일_접근성지수,
      전국평균: national_stat.평균_소아_야간휴일_접근성지수,
    },
  ].filter((d) => 소아_자료_있음 || !d.subject.startsWith('소아'));

  const bar_data = [
    {
      name: '응급 미도달(%)',
      선택지역: selected_region.응급_60분_미도달_인구비율,
      시도평균: sido_stat.평균_응급_60분_미도달_인구비율,
      전국평균: national_stat.평균_응급_60분_미도달_인구비율,
    },
    {
      name: '응급 RI(%)',
      선택지역: selected_region.관내_응급_의료이용률,
      시도평균: sido_stat.평균_관내_응급_의료이용률,
      전국평균: national_stat.평균_관내_응급_의료이용률,
    },
    {
      name: '분만 미도달(%)',
      선택지역: selected_region.분만_60분_미도달_인구비율,
      시도평균: sido_stat.평균_분만_60분_미도달_인구비율,
      전국평균: national_stat.평균_분만_60분_미도달_인구비율,
    },
    {
      name: '분만율(%)',
      선택지역: selected_region.관내_분만율,
      시도평균: sido_stat.평균_관내_분만율,
      전국평균: national_stat.평균_관내_분만율,
    },
    {
      name: '소아병상비율(%)',
      선택지역: selected_region.소아_병상_공급비율,
      시도평균: sido_stat.평균_소아_병상_공급비율,
      전국평균: national_stat.평균_소아_병상_공급비율,
    },
    {
      name: '소아접근지수',
      선택지역: selected_region.소아_야간휴일_접근성지수,
      시도평균: sido_stat.평균_소아_야간휴일_접근성지수,
      전국평균: national_stat.평균_소아_야간휴일_접근성지수,
    },
  ].filter((d) => 소아_자료_있음 || !d.name.startsWith('소아'));

  // 하단 요약 지표 데이터
  const summary_items = [
    {
      label: '응급 도달성',
      value: Math.max(0, 100 - selected_region.응급_60분_미도달_인구비율).toFixed(1),
      sido: Math.max(0, 100 - sido_stat.평균_응급_60분_미도달_인구비율).toFixed(1),
      unit: '%',
      color: '#0071e3',
      bg: 'bg-[#0071e3]/[0.05]',
      border: 'border-[#0071e3]/20',
    },
    {
      label: '응급 RI 충족률',
      value: selected_region.관내_응급_의료이용률.toFixed(1),
      sido: sido_stat.평균_관내_응급_의료이용률.toFixed(1),
      unit: '%',
      color: '#34c759',
      bg: 'bg-[#34c759]/[0.05]',
      border: 'border-[#34c759]/20',
    },
    {
      label: '분만 도달성',
      value: Math.max(0, 100 - selected_region.분만_60분_미도달_인구비율).toFixed(1),
      sido: Math.max(0, 100 - sido_stat.평균_분만_60분_미도달_인구비율).toFixed(1),
      unit: '%',
      color: '#ff9500',
      bg: 'bg-[#ff9500]/[0.05]',
      border: 'border-[#ff9500]/20',
    },
    {
      label: '분만 충족률',
      value: selected_region.관내_분만율.toFixed(1),
      sido: sido_stat.평균_관내_분만율.toFixed(1),
      unit: '%',
      color: '#af52de',
      bg: 'bg-[#af52de]/[0.05]',
      border: 'border-[#af52de]/20',
    },
    {
      label: '소아 병상공급',
      value: selected_region.소아_병상_공급비율?.toFixed(1) ?? '자료 없음',
      sido: sido_stat.평균_소아_병상_공급비율?.toFixed(1) ?? '자료 없음',
      unit: '%',
      color: '#ff3b30',
      bg: 'bg-[#ff3b30]/[0.05]',
      border: 'border-[#ff3b30]/20',
    },
    {
      label: '소아 야간휴일',
      value: selected_region.소아_야간휴일_접근성지수?.toFixed(1) ?? '자료 없음',
      sido: sido_stat.평균_소아_야간휴일_접근성지수?.toFixed(1) ?? '자료 없음',
      unit: '',
      color: '#5e5ce6',
      bg: 'bg-[#5e5ce6]/[0.05]',
      border: 'border-[#5e5ce6]/20',
    },
  ];

  return (
    <div
      className="bg-white p-6 sm:p-7 rounded-3xl border border-black/[0.05] shadow-apple-card flex flex-col space-y-6 h-full"
      id="comparison-chart-container"
    >
      {/* 상단 헤더 및 세그먼트 컨트롤 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-black/[0.05]">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-[#af52de] bg-[#af52de]/10 px-2.5 py-0.5 rounded-full">
              {chart_tab === 'trend' ? '복지부 헬스맵 6개년 실데이터' : '6대 필수의료 지표'}
            </span>
            <span className="text-xs text-[#86868b]">선택지역 vs 시도 vs 전국</span>
          </div>
          <h3 className="text-base font-bold tracking-tight text-[#1d1d1f] mt-1 flex items-center gap-1.5">
            {chart_tab === 'trend' ? (
              <>
                <TrendingUp className="w-4 h-4 text-[#0071e3]" />
                <span>6개년 시계열(2019-2024) 실데이터 추이</span>
              </>
            ) : (
              <span>지표 비교 분석</span>
            )}
          </h3>
          <p className="text-xs text-[#86868b] mt-0.5">
            {selected_region.시군구명} vs {sido_stat.구분명} vs 전국 평균
          </p>
        </div>

        <div className="flex items-center space-x-1 bg-[#f5f5f7] p-1 rounded-full border border-black/[0.04] text-xs">
          <button
            onClick={() => set_chart_tab('radar')}
            className={`px-3 py-1 font-semibold rounded-full transition-all ${
              chart_tab === 'radar'
                ? 'bg-white text-[#1d1d1f] shadow-apple-sm'
                : 'text-[#86868b] hover:text-[#1d1d1f]'
            }`}
          >
            레이더
          </button>
          <button
            onClick={() => set_chart_tab('bar')}
            className={`px-3 py-1 font-semibold rounded-full transition-all ${
              chart_tab === 'bar'
                ? 'bg-white text-[#1d1d1f] shadow-apple-sm'
                : 'text-[#86868b] hover:text-[#1d1d1f]'
            }`}
          >
            비교 바
          </button>
          <button
            onClick={() => set_chart_tab('trend')}
            className={`px-3 py-1 font-bold rounded-full transition-all flex items-center gap-1 ${
              chart_tab === 'trend'
                ? 'bg-[#0071e3] text-white shadow-apple-sm'
                : 'text-[#86868b] hover:text-[#0071e3]'
            }`}
          >
            <TrendingUp className="w-3 h-3" />
            <span>6개년 추이</span>
          </button>
        </div>
      </div>

      {/* 6개년 추이 탭일 때: 24대 지표 선택 드롭다운 */}
      {chart_tab === 'trend' && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
              📊 분석 지표 선택:
            </span>
            <select
              value={selected_indicator_code}
              onChange={(e) => set_selected_indicator_code(e.target.value)}
              className="text-xs font-bold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-[#0071e3] focus:outline-none cursor-pointer"
            >
              <optgroup label="1. 의료수요">
                {헬스맵_24대_지표목록.filter((i) => i.domain === '의료수요').map((i) => (
                  <option key={i.code} value={i.code}>
                    [{i.code}] {i.name} ({i.unit})
                  </option>
                ))}
              </optgroup>
              <optgroup label="2. 의료자원 & 접근성">
                {헬스맵_24대_지표목록.filter((i) => i.domain === '의료자원').map((i) => (
                  <option key={i.code} value={i.code}>
                    [{i.code}] {i.name} ({i.unit})
                  </option>
                ))}
              </optgroup>
              <optgroup label="3. 의료이용 (관내이용률 RI)">
                {헬스맵_24대_지표목록.filter((i) => i.domain === '의료이용').map((i) => (
                  <option key={i.code} value={i.code}>
                    [{i.code}] {i.name} ({i.unit})
                  </option>
                ))}
              </optgroup>
              <optgroup label="4. 건강결과 (사망률)">
                {헬스맵_24대_지표목록.filter((i) => i.domain === '건강결과').map((i) => (
                  <option key={i.code} value={i.code}>
                    [{i.code}] {i.name} ({i.unit})
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">2019 vs 2024:</span>
            <span
              className={`font-extrabold ${
                trend_delta.diff > 0
                  ? current_indicator_meta.higher_is_bad
                    ? 'text-rose-600'
                    : 'text-emerald-600'
                  : trend_delta.diff < 0
                  ? current_indicator_meta.higher_is_bad
                    ? 'text-emerald-600'
                    : 'text-rose-600'
                  : 'text-slate-600'
              }`}
            >
              {trend_delta.diff > 0 ? `+${trend_delta.diff}` : `${trend_delta.diff}`}{' '}
              {current_indicator_meta.unit} ({trend_delta.diff > 0 ? '증가' : '감소'})
            </span>
          </div>
        </div>
      )}

      {/* 차트 영역 */}
      <div className="h-[270px] w-full pt-1 flex-shrink-0">
        {chart_tab === 'radar' ? (
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="72%" data={radar_data}>
              <PolarGrid stroke="#e5e5ea" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#86868b', fontSize: 11, fontWeight: 500 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#e5e5ea" tick={{ fill: '#c7c7cc', fontSize: 9 }} />
              <Radar
                name={selected_region.시군구명}
                dataKey="선택지역"
                stroke="#0071e3"
                fill="#0071e3"
                fillOpacity={0.4}
              />
              <Radar
                name={`${sido_stat.구분명} 평균`}
                dataKey="시도평균"
                stroke="#af52de"
                fill="#af52de"
                fillOpacity={0.2}
              />
              <Radar
                name="전국 평균"
                dataKey="전국평균"
                stroke="#8e8e93"
                fill="#8e8e93"
                fillOpacity={0.12}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px', color: '#1d1d1f' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  color: '#1d1d1f',
                  borderRadius: '12px',
                  border: '1px solid rgba(0,0,0,0.08)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                  fontSize: '11px',
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        ) : chart_tab === 'bar' ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={bar_data} margin={{ top: 10, right: 10, left: -15, bottom: 15 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f2f2f7" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: '#86868b', fontSize: 10 }} interval={0} textAnchor="end" />
              <YAxis tick={{ fill: '#86868b', fontSize: 10 }} domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  color: '#1d1d1f',
                  borderRadius: '12px',
                  border: '1px solid rgba(0,0,0,0.08)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                  fontSize: '11px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              <Bar dataKey="선택지역" fill="#0071e3" radius={[6, 6, 0, 0]} name={selected_region.시군구명} />
              <Bar dataKey="시도평균" fill="#af52de" radius={[6, 6, 0, 0]} name={`${sido_stat.구분명} 평균`} />
              <Bar dataKey="전국평균" fill="#8e8e93" radius={[6, 6, 0, 0]} name="전국 평균" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          /* 6개년 실데이터 시계열 라인 차트 */
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={time_series_chart_data}
              margin={{ top: 15, right: 20, left: 0, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f2f2f7" vertical={false} />
              <XAxis dataKey="year" tick={{ fill: '#48484a', fontSize: 11, fontWeight: 600 }} />
              <YAxis
                tick={{ fill: '#86868b', fontSize: 10 }}
                domain={['auto', 'auto']}
                unit={` ${current_indicator_meta.unit}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  color: '#1d1d1f',
                  borderRadius: '12px',
                  border: '1px solid rgba(0,0,0,0.08)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                  fontSize: '11px',
                }}
                formatter={(val: any) => [`${val} ${current_indicator_meta.unit}`, '']}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }} />
              <Line
                type="monotone"
                dataKey="선택지역"
                stroke="#0071e3"
                strokeWidth={3}
                dot={{ r: 4, fill: '#0071e3', strokeWidth: 2, stroke: '#ffffff' }}
                activeDot={{ r: 6 }}
                name={`${selected_region.시군구명} (${current_indicator_meta.unit})`}
              />
              <Line
                type="monotone"
                dataKey="시도평균"
                stroke="#af52de"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={{ r: 3, fill: '#af52de' }}
                name={`${sido_stat.구분명} 평균`}
              />
              <Line
                type="monotone"
                dataKey="전국평균"
                stroke="#8e8e93"
                strokeWidth={1.5}
                strokeDasharray="2 2"
                dot={{ r: 2.5, fill: '#8e8e93' }}
                name="전국 평균"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* 하단 요약 카드 (탭에 따라 맞춤 전환) */}
      <div className="pt-4 border-t border-black/[0.05] space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-[#1d1d1f]">
            {chart_tab === 'trend'
              ? `${selected_region.시군구명} 6개년 추이 진단 분석`
              : '6대 필수의료 지표 현황 요약'}
          </h4>
          <span className="text-[11px] font-semibold text-[#86868b] bg-[#f5f5f7] px-2 py-0.5 rounded-full">
            {chart_tab === 'trend' ? '보건복지부 헬스맵 공식 데이터셋' : '선택지역 / 시도평균'}
          </span>
        </div>

        {chart_tab === 'trend' ? (
          <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/60 text-xs space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="font-bold text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>[{current_indicator_meta.name}] 2019년 ↔ 2024년 6개년 변화 분석</span>
              </span>
              <span className="font-semibold text-blue-700 dark:text-blue-300">
                2019년: {trend_delta.v2019} {current_indicator_meta.unit} → 2024년: {trend_delta.v2024} {current_indicator_meta.unit}
              </span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              💡 {selected_region.시군구명}의 {current_indicator_meta.name} 지표는 6개년 동안{' '}
              <strong className="text-blue-800 dark:text-blue-300">
                {trend_delta.diff > 0 ? `+${trend_delta.diff}` : trend_delta.diff} {current_indicator_meta.unit}
              </strong>
              의 변화를 기록하였습니다. (코로나19 시기 의료이용 패턴 변화 및 공공병원 개설·인력 수급 정책 영향 반영)
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            {summary_items.map((item) => (
              <div key={item.label} className={`${item.bg} p-3.5 rounded-2xl border ${item.border}`}>
                <span className="text-[#86868b] text-[11px]">{item.label}</span>
                <div className="text-base font-bold mt-0.5" style={{ color: item.color }}>
                  {item.value}
                  {item.unit}
                </div>
                <div className="text-[11px] text-[#86868b] mt-1">
                  시도평균: {item.sido}
                  {item.unit}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
