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

  return (
    <div className="bg-white p-6 rounded-3xl border border-black/[0.05] shadow-apple-card space-y-4" id="comparison-chart-container">
      {/* 상단 헤더 및 세그먼트 컨트롤 */}
      <div className="flex items-center justify-between pb-3 border-b border-black/[0.05]">
        <div>
          <h3 className="text-sm font-bold tracking-tight text-[#1d1d1f] flex items-center gap-1.5">
            <span>지표 비교 분석</span>
          </h3>
          <p className="text-xs text-[#86868b] mt-0.5">
            {selected_region.시군구명} vs {sido_stat.구분명} vs 전국 평균
          </p>
        </div>

        <div className="flex items-center space-x-1 bg-[#f5f5f7] p-1 rounded-full border border-black/[0.04]">
          <button
            onClick={() => set_chart_tab('radar')}
            className={`px-3 py-1 text-xs font-semibold rounded-full transition-all ${
              chart_tab === 'radar'
                ? 'bg-white text-[#1d1d1f] shadow-apple-sm'
                : 'text-[#86868b] hover:text-[#1d1d1f]'
            }`}
          >
            레이더
          </button>
          <button
            onClick={() => set_chart_tab('bar')}
            className={`px-3 py-1 text-xs font-semibold rounded-full transition-all ${
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
      <div className="h-[270px] w-full pt-1">
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
    </div>
  );
};
