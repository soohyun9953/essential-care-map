'use client';

// 애플 스타일 2040 장래 의료수요 추계 및 이용량 대비 공급량(RI/CI) 시각화 컴포넌트

import React, { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { 필수의료_진단_결과 } from '@/lib/필수의료_타입';
import {
  의료수요_추계_엔진,
  연도별_의료수요_데이터,
  이용량_대비_공급량_지표,
} from '@/lib/의료수요_추계_엔진';
import { format_number_comma } from '@/lib/유틸리티';
import { TrendingUp, Users, Calendar, AlertCircle, ArrowUpRight } from 'lucide-react';

interface 의료수요_추계_차트_속성 {
  selected_region: 필수의료_진단_결과 | null;
}

type 추계_지표_유형 = '인구수' | '노인인구수' | '총_입원일수' | '총_입원환자수';

export const 의료수요_추계_차트: React.FC<의료수요_추계_차트_속성> = ({ selected_region }) => {
  const [active_metric, set_active_metric] = useState<추계_지표_유형>('총_입원일수');

  const time_series_data: 연도별_의료수요_데이터[] = useMemo(() => {
    if (!selected_region) return [];
    return 의료수요_추계_엔진.calculate_time_series_demand(selected_region);
  }, [selected_region]);

  const supply_demand_ratio: 이용량_대비_공급량_지표 | null = useMemo(() => {
    if (!selected_region) return null;
    return 의료수요_추계_엔진.calculate_supply_demand_ratio(selected_region);
  }, [selected_region]);

  if (!selected_region || time_series_data.length === 0) return null;

  const get_metric_label = (type: 추계_지표_유형): string => {
    switch (type) {
      case '인구수':
        return '전체 인구수 (명)';
      case '노인인구수':
        return '65세 이상 노인 인구수 (명)';
      case '총_입원일수':
        return '총 입원일수 (일)';
      case '총_입원환자수':
        return '총 입원환자 수 (명)';
    }
  };

  const get_metric_unit = (type: 추계_지표_유형): string => {
    return type === '총_입원일수' ? '일' : '명';
  };

  // 2023년 대비 2040년 증감율 계산
  const current_val = time_series_data.find((d) => d.연도 === 2023)?.[active_metric] || 1;
  const future_val = time_series_data.find((d) => d.연도 === 2040)?.[active_metric] || 1;
  const growth_rate = Math.round(((future_val - current_val) / current_val) * 1000) / 10;

  return (
    <div className="bg-white p-6 sm:p-7 rounded-3xl border border-black/[0.05] shadow-apple-card space-y-6">
      {/* 1. 상단 헤더 및 지표 탭 스위처 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-black/[0.05]">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-[#0071e3] bg-[#0071e3]/10 px-2.5 py-0.5 rounded-full">
              국립중앙의료원 표준 추계 모델
            </span>
            <span className="text-xs text-[#86868b]">2013 ~ 2040년</span>
          </div>
          <h3 className="text-base font-bold tracking-tight text-[#1d1d1f] mt-1 flex items-center gap-2">
            <span>{selected_region.시군구명} 장래 의료수요 추계 (2040)</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
              growth_rate > 0 ? 'bg-[#ff3b30]/10 text-[#ff3b30]' : 'bg-[#0071e3]/10 text-[#0071e3]'
            }`}>
              2040년 대비 {growth_rate > 0 ? `+${growth_rate}% 증가` : `${growth_rate}%`}
            </span>
          </h3>
          <p className="text-xs text-[#86868b] mt-0.5">
            인구 고령화 심화에 따른 장기 입원의료 수요 및 병상 자원 예측
          </p>
        </div>

        {/* 세그먼트 컨트롤러 */}
        <div className="flex items-center space-x-1 bg-[#f5f5f7] p-1 rounded-full border border-black/[0.04] text-xs">
          {(['총_입원일수', '노인인구수', '총_입원환자수', '인구수'] as 추계_지표_유형[]).map((type) => (
            <button
              key={type}
              onClick={() => set_active_metric(type)}
              className={`px-3 py-1 font-semibold rounded-full transition-all ${
                active_metric === type
                  ? 'bg-white text-[#1d1d1f] shadow-apple-sm'
                  : 'text-[#86868b] hover:text-[#1d1d1f]'
              }`}
            >
              {type === '총_입원일수' && '입원일수'}
              {type === '노인인구수' && '노인인구'}
              {type === '총_입원환자수' && '입원환자'}
              {type === '인구수' && '전체인구'}
            </button>
          ))}
        </div>
      </div>

      {/* 2. 2013~2040 시계열 추계 에어리어 차트 */}
      <div className="h-[260px] w-full pt-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={time_series_data} margin={{ top: 15, right: 15, left: -5, bottom: 5 }}>
            <defs>
              <linearGradient id="appleDemandGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0071e3" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#0071e3" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f2f2f7" vertical={false} />
            <XAxis
              dataKey="연도"
              tick={{ fill: '#86868b', fontSize: 11, fontWeight: 500 }}
              tickFormatter={(y) => `${y}년`}
            />
            <YAxis
              tick={{ fill: '#86868b', fontSize: 10 }}
              tickFormatter={(v) => (v >= 10000 ? `${Math.round(v / 10000)}만` : v)}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload as 연도별_의료수요_데이터;
                  return (
                    <div className="bg-white/95 backdrop-blur-xl p-3.5 rounded-2xl border border-black/[0.08] shadow-apple-glass text-xs space-y-1">
                      <div className="flex items-center justify-between gap-3 border-b border-black/[0.06] pb-1">
                        <span className="font-bold text-[#1d1d1f]">{data.연도}년 ({data.구분})</span>
                        <span className="px-1.5 py-0.2 rounded-full text-[10px] font-semibold bg-[#0071e3]/10 text-[#0071e3]">
                          노인비율 {data.노인비율}%
                        </span>
                      </div>
                      <div className="text-[#1d1d1f] font-semibold">
                        {get_metric_label(active_metric)}: {format_number_comma(data[active_metric])} {get_metric_unit(active_metric)}
                      </div>
                      <div className="text-[11px] text-[#86868b]">
                        인구: {format_number_comma(data.인구수)}명 | 고령인구: {format_number_comma(data.노인인구수)}명
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <ReferenceLine x={2023} stroke="#ff9500" strokeDasharray="3 3" label={{ value: '현재(2023)', fill: '#ff9500', fontSize: 10 }} />
            <Area
              type="monotone"
              dataKey={active_metric}
              stroke="#0071e3"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#appleDemandGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* 3. 하단: 이용량 대비 공급량 (RI / CI / 의료공급지수) 분석 모듈 */}
      {!supply_demand_ratio && (
        <p className="pt-4 border-t border-black/[0.05] text-[11px] text-[#86868b]">
          의료공급지수: 자료 없음 (공급 계수로 쓰는 소아 병상 공급비율 실데이터 미확보)
        </p>
      )}
      {supply_demand_ratio && (
        <div className="pt-4 border-t border-black/[0.05] space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-[#1d1d1f] flex items-center gap-1.5">
              <span>관내 의료이용량 대비 의료제공량 분석 (의료공급지수)</span>
            </h4>
            <span
              className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                supply_demand_ratio.공급상태_판정 === '공급심각부족'
                  ? 'bg-[#ff3b30]/10 text-[#ff3b30]'
                  : supply_demand_ratio.공급상태_판정 === '공급부족'
                  ? 'bg-[#ff9500]/10 text-[#ff9500]'
                  : 'bg-[#34c759]/10 text-[#34c759]'
              }`}
            >
              {supply_demand_ratio.공급상태_판정 === '공급심각부족' && '공급 심각 부족 (타지역 유출)'}
              {supply_demand_ratio.공급상태_판정 === '공급부족' && '공급 다소 부족'}
              {supply_demand_ratio.공급상태_판정 === '수급균형' && '수급 적정 균형'}
              {supply_demand_ratio.공급상태_판정 === '공급과잉' && '의료자원 공급 과잉'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            {/* 1. 의료이용량 (주민 수요) */}
            <div className="bg-[#f5f5f7] p-3.5 rounded-2.5xl border border-black/[0.03]">
              <span className="text-[#86868b] text-[11px]">주민 총 의료이용량</span>
              <div className="text-base font-bold text-[#1d1d1f] mt-0.5">
                {format_number_comma(supply_demand_ratio.전체_의료이용량)} <span className="text-xs font-normal">일</span>
              </div>
              <div className="text-[11px] text-[#0071e3] mt-1 font-semibold">
                관내이용률(RI): {supply_demand_ratio.관내_의료이용률_RI}%
              </div>
            </div>

            {/* 2. 의료제공량 (지역 병원 공급) */}
            <div className="bg-[#f5f5f7] p-3.5 rounded-2.5xl border border-black/[0.03]">
              <span className="text-[#86868b] text-[11px]">관내 의료기관 총 제공량</span>
              <div className="text-base font-bold text-[#1d1d1f] mt-0.5">
                {format_number_comma(supply_demand_ratio.전체_의료제공량)} <span className="text-xs font-normal">일</span>
              </div>
              <div className="text-[11px] text-[#34c759] mt-1 font-semibold">
                지역환자구성비(CI): {supply_demand_ratio.지역환자구성비_CI}%
              </div>
            </div>

            {/* 3. 의료공급지수 (유출입비율) */}
            <div className={`p-3.5 rounded-2.5xl border ${
              supply_demand_ratio.의료공급지수 < 70
                ? 'bg-[#ff3b30]/[0.04] border-[#ff3b30]/20'
                : 'bg-[#f5f5f7] border-black/[0.03]'
            }`}>
              <span className="text-[#86868b] text-[11px]">의료공급지수 (유출입)</span>
              <div className={`text-base font-bold mt-0.5 ${
                supply_demand_ratio.의료공급지수 < 70 ? 'text-[#ff3b30]' : 'text-[#1d1d1f]'
              }`}>
                {supply_demand_ratio.의료공급지수}%
              </div>
              <div className="text-[11px] text-[#86868b] mt-1">
                {supply_demand_ratio.의료공급지수 < 100
                  ? `수요 대비 공급 ${(100 - supply_demand_ratio.의료공급지수).toFixed(1)}%p 부족`
                  : '관내 공급 자급 충족'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
