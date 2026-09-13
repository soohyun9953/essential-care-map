'use client';

// 선택 시군구 vs 시도 평균 vs 전국 평균 비교 레이더 차트 및 바 차트 컴포넌트

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

  // 레이더 차트용 데이터 (모든 지표는 충족도/안전도 관점 100점 만점으로 정규화)
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

  // 바 차트용 데이터
  const bar_data = [
    {
      name: '응급 60분 미도달(%)',
      선택지역: selected_region.응급_60분_미도달_인구비율,
      시도평균: sido_stat.평균_응급_60분_미도달_인구비율,
      전국평균: national_stat.평균_응급_60분_미도달_인구비율,
    },
    {
      name: '응급이용률 RI(%)',
      선택지역: selected_region.관내_응급_의료이용률,
      시도평균: sido_stat.평균_관내_응급_의료이용률,
      전국평균: national_stat.평균_관내_응급_의료이용률,
    },
    {
      name: '분만 60분 미도달(%)',
      선택지역: selected_region.분만_60분_미도달_인구비율,
      시도평균: sido_stat.평균_분만_60분_미도달_인구비율,
      전국평균: national_stat.평균_분만_60분_미도달_인구비율,
    },
    {
      name: '관내 분만율(%)',
      선택지역: selected_region.관내_분만율,
      시도평균: sido_stat.평균_관내_분만율,
      전국평균: national_stat.평균_관내_분만율,
    },
    {
      name: '소아 병상공급(%)',
      선택지역: selected_region.소아_병상_공급비율,
      시도평균: sido_stat.평균_소아_병상_공급비율,
      전국평균: national_stat.평균_소아_병상_공급비율,
    },
  ];

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3" id="comparison-chart-container">
      {/* 탭 헤더 */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <div>
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
            <BarChart2 className="w-4 h-4 text-sky-600" />
            <span>선택 지역 vs 시·도 vs 전국 평균 지표 비교</span>
          </h3>
          <p className="text-[11px] text-slate-400">
            {selected_region.시군구명}과 {sido_stat.구분명} 및 전국 단위의 필수의료 격차
          </p>
        </div>

        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => set_chart_tab('radar')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition flex items-center space-x-1 ${
              chart_tab === 'radar'
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <PieChart className="w-3.5 h-3.5" />
            <span>종합 레이더</span>
          </button>
          <button
            onClick={() => set_chart_tab('bar')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition flex items-center space-x-1 ${
              chart_tab === 'bar'
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>지표별 바 차트</span>
          </button>
        </div>
      </div>

      {/* 차트 본체 */}
      <div className="h-[280px] w-full pt-1">
        {chart_tab === 'radar' ? (
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radar_data}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 11 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#cbd5e1" />
              <Radar
                name={selected_region.시군구명}
                dataKey="선택지역"
                stroke="#0284c7"
                fill="#0284c7"
                fillOpacity={0.45}
              />
              <Radar
                name={`${sido_stat.구분명} 평균`}
                dataKey="시도평균"
                stroke="#8b5cf6"
                fill="#8b5cf6"
                fillOpacity={0.25}
              />
              <Radar
                name="전국 평균"
                dataKey="전국평균"
                stroke="#64748b"
                fill="#64748b"
                fillOpacity={0.15}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  color: '#fff',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '11px',
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={bar_data} margin={{ top: 10, right: 10, left: -15, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 10 }} interval={0} angle={-15} textAnchor="end" />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  color: '#fff',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '11px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar dataKey="선택지역" fill="#0284c7" radius={[4, 4, 0, 0]} name={selected_region.시군구명} />
              <Bar dataKey="시도평균" fill="#a78bfa" radius={[4, 4, 0, 0]} name={`${sido_stat.구분명} 평균`} />
              <Bar dataKey="전국평균" fill="#94a3b8" radius={[4, 4, 0, 0]} name="전국 평균" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
