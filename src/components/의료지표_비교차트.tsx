'use client';

// Apple Health 스타일의 의료 지표 비교 차트 (레이더 & 수평 바 차트)

import React, { useState } from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { 필수의료_진단_결과, 지역_평균_통계 } from '@/lib/필수의료_타입';
import { BarChart2, PieChart } from 'lucide-react';

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
  const [chart_tab, set_chart_tab] = useState<'radar' | 'bar'>('radar');

  if (!selected_region) return null;

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
  ];

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
      name: '소아 병상(%)',
      선택지역: selected_region.소아_병상_공급비율,
      시도평균: sido_stat.평균_소아_병상_공급비율,
      전국평균: national_stat.평균_소아_병상_공급비율,
    },
  ];

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
      value: selected_region.소아_병상_공급비율.toFixed(1),
      sido: sido_stat.평균_소아_병상_공급비율.toFixed(1),
      unit: '%',
      color: '#ff3b30',
      bg: 'bg-[#ff3b30]/[0.05]',
      border: 'border-[#ff3b30]/20',
    },
    {
      label: '소아 야간휴일',
      value: selected_region.소아_야간휴일_접근성지수.toFixed(1),
      sido: sido_stat.평균_소아_야간휴일_접근성지수.toFixed(1),
      unit: '',
      color: '#5e5ce6',
      bg: 'bg-[#5e5ce6]/[0.05]',
      border: 'border-[#5e5ce6]/20',
    },
  ];

  return (
    <div className="bg-white p-6 sm:p-7 rounded-3xl border border-black/[0.05] shadow-apple-card flex flex-col space-y-6 h-full" id="comparison-chart-container">
      {/* 상단 헤더 및 세그먼트 컨트롤 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-black/[0.05]">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-[#af52de] bg-[#af52de]/10 px-2.5 py-0.5 rounded-full">
              6대 필수의료 지표
            </span>
            <span className="text-xs text-[#86868b]">선택지역 vs 시도 vs 전국</span>
          </div>
          <h3 className="text-base font-bold tracking-tight text-[#1d1d1f] mt-1">
            지표 비교 분석
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
        </div>
      </div>

      {/* 차트 영역 */}
      <div className="h-[260px] w-full pt-1 flex-shrink-0">
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
        ) : (
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
        )}
      </div>

      {/* 하단 6대 지표 요약 카드 */}
      <div className="pt-4 border-t border-black/[0.05] space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-[#1d1d1f]">6대 필수의료 지표 현황 요약</h4>
          <span className="text-[11px] font-semibold text-[#86868b] bg-[#f5f5f7] px-2 py-0.5 rounded-full">
            선택지역 / 시도평균
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          {summary_items.map((item) => (
            <div key={item.label} className={`${item.bg} p-3.5 rounded-2xl border ${item.border}`}>
              <span className="text-[#86868b] text-[11px]">{item.label}</span>
              <div className="text-base font-bold mt-0.5" style={{ color: item.color }}>
                {item.value}{item.unit}
              </div>
              <div className="text-[11px] text-[#86868b] mt-1">
                시도평균: {item.sido}{item.unit}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
