'use client';

// 국립중앙의료원 매뉴얼(p.50) 기반 7대 진료역량 2차원 사분면(Quadrant) 분포도 및 3개년 추이 컴포넌트

import React, { useState, useMemo } from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import { 필수의료_진단_결과 } from '@/lib/필수의료_타입';
import {
  진료역량_엔진,
  진료역량_지표_목록,
  진료역량_지표_유형,
  병원_역량_데이터포인트,
} from '@/lib/진료역량_엔진';
import { Target, Compass, Sparkles, Activity } from 'lucide-react';

interface 진료역량_사분면_분포도_속성 {
  selected_region: 필수의료_진단_결과 | null;
}

export const 진료역량_사분면_분포도: React.FC<진료역량_사분면_분포도_속성> = ({ selected_region }) => {
  const [x_metric, set_x_metric] = useState<진료역량_지표_유형>('평균_재원일수');
  const [y_metric, set_y_metric] = useState<진료역량_지표_유형>('DRG_개수');
  const [trend_tab, set_trend_tab] = useState<'scatter' | 'trend'>('scatter');

  // 관심 병원 역량 데이터 산출
  const target_hospital: 병원_역량_데이터포인트 | null = useMemo(() => {
    if (!selected_region) return null;
    return 진료역량_엔진.calculate_competency_profile(selected_region);
  }, [selected_region]);

  // 비교 기관 군집 생성
  const peer_hospitals: 병원_역량_데이터포인트[] = useMemo(() => {
    if (!target_hospital) return [];
    return 진료역량_엔진.generate_peer_hospitals(target_hospital);
  }, [target_hospital]);

  // 사분면 전략적 시사점
  const quadrant_insight = useMemo(() => {
    if (!target_hospital) return null;
    return 진료역량_엔진.get_quadrant_insight(target_hospital, x_metric, y_metric);
  }, [target_hospital, x_metric, y_metric]);

  // 3개년 추이 데이터
  const trend_data_y = useMemo(() => {
    if (!target_hospital) return [];
    return 진료역량_엔진.get_3year_trend(target_hospital[y_metric], y_metric);
  }, [target_hospital, y_metric]);

  if (!selected_region || !target_hospital) return null;

  const x_meta = 진료역량_지표_목록[x_metric];
  const y_meta = 진료역량_지표_목록[y_metric];

  // 산점도용 포맷팅 (선택기관과 동료기관 분리)
  const target_data = peer_hospitals.filter((h) => h.선택기관_여부);
  const peers_data = peer_hospitals.filter((h) => !h.선택기관_여부);

  return (
    <div className="bg-white p-6 sm:p-7 rounded-3xl border border-black/[0.05] shadow-apple-card space-y-5">
      {/* 1. 헤더 및 축 선택 툴바 */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-black/[0.05]">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-[#af52de] bg-[#af52de]/10 px-2.5 py-0.5 rounded-full">
              NMC 7대 진료역량 진단
            </span>
            <span className="text-xs text-[#86868b]">동일 종별·병상규모 의료기관 벤치마킹</span>
          </div>
          <h3 className="text-base font-bold tracking-tight text-[#1d1d1f] mt-1 flex items-center gap-1.5">
            <span>{selected_region.시군구명} 공공병원 진료역량 사분면 분포도</span>
          </h3>
          <p className="text-xs text-[#86868b] mt-0.5">
            X축과 Y축 지표를 임의 조합하여 병원의 상대적 위치와 강점·개선영역 분석
          </p>
        </div>

        {/* X축 / Y축 및 탭 전환 */}
        <div className="flex flex-wrap items-center gap-2">
          {/* X축 선택기 */}
          <div className="flex items-center space-x-1.5 bg-[#f5f5f7] px-3 py-1 rounded-full text-xs border border-black/[0.04]">
            <span className="text-[#86868b] font-medium">X축:</span>
            <select
              value={x_metric}
              onChange={(e) => set_x_metric(e.target.value as 진료역량_지표_유형)}
              className="bg-transparent font-semibold text-[#1d1d1f] focus:outline-none cursor-pointer"
            >
              {Object.values(진료역량_지표_목록).map((item) => (
                <option key={`x-${item.키}`} value={item.키}>
                  {item.이름}
                </option>
              ))}
            </select>
          </div>

          {/* Y축 선택기 */}
          <div className="flex items-center space-x-1.5 bg-[#f5f5f7] px-3 py-1 rounded-full text-xs border border-black/[0.04]">
            <span className="text-[#86868b] font-medium">Y축:</span>
            <select
              value={y_metric}
              onChange={(e) => set_y_metric(e.target.value as 진료역량_지표_유형)}
              className="bg-transparent font-semibold text-[#1d1d1f] focus:outline-none cursor-pointer"
            >
              {Object.values(진료역량_지표_목록).map((item) => (
                <option key={`y-${item.키}`} value={item.키}>
                  {item.이름}
                </option>
              ))}
            </select>
          </div>

          {/* 뷰 모드 토글 */}
          <div className="flex items-center space-x-1 bg-[#f5f5f7] p-1 rounded-full border border-black/[0.04] text-xs">
            <button
              onClick={() => set_trend_tab('scatter')}
              className={`px-3 py-1 font-semibold rounded-full transition-all ${
                trend_tab === 'scatter'
                  ? 'bg-white text-[#1d1d1f] shadow-apple-sm'
                  : 'text-[#86868b] hover:text-[#1d1d1f]'
              }`}
            >
              사분면 분포
            </button>
            <button
              onClick={() => set_trend_tab('trend')}
              className={`px-3 py-1 font-semibold rounded-full transition-all ${
                trend_tab === 'trend'
                  ? 'bg-white text-[#1d1d1f] shadow-apple-sm'
                  : 'text-[#86868b] hover:text-[#1d1d1f]'
              }`}
            >
              3개년 추이
            </button>
          </div>
        </div>
      </div>

      {/* 2. 차트 본체 */}
      <div className="h-[280px] w-full pt-1">
        {trend_tab === 'scatter' ? (
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f2f2f7" />
              <XAxis
                type="number"
                dataKey={x_metric}
                name={x_meta.이름}
                unit={x_meta.단위}
                tick={{ fill: '#86868b', fontSize: 11 }}
                label={{ value: `${x_meta.이름} (${x_meta.단위})`, position: 'insideBottom', offset: -12, fill: '#86868b', fontSize: 11 }}
              />
              <YAxis
                type="number"
                dataKey={y_metric}
                name={y_meta.이름}
                unit={y_meta.단위}
                tick={{ fill: '#86868b', fontSize: 11 }}
                label={{ value: `${y_meta.이름} (${y_meta.단위})`, angle: -90, position: 'insideLeft', offset: 5, fill: '#86868b', fontSize: 11 }}
              />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as 병원_역량_데이터포인트;
                    return (
                      <div className="bg-white/95 backdrop-blur-xl p-3.5 rounded-2xl border border-black/[0.08] shadow-apple-glass text-xs space-y-1">
                        <div className="font-bold text-[#1d1d1f] border-b border-black/[0.06] pb-1 flex items-center justify-between gap-2">
                          <span>{data.기관명}</span>
                          {data.선택기관_여부 && (
                            <span className="text-[10px] bg-[#0071e3] text-white px-2 py-0.2 rounded-full">
                              선택 기관
                            </span>
                          )}
                        </div>
                        <div className="text-[#0071e3] font-semibold">
                          {x_meta.이름}: {data[x_metric]} {x_meta.단위}
                        </div>
                        <div className="text-[#af52de] font-semibold">
                          {y_meta.이름}: {data[y_metric]} {y_meta.단위}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              {/* 사분면 구분 전국 평균 기준선 (가로/세로 점선) */}
              <ReferenceLine
                x={x_meta.전국평균}
                stroke="#ff9500"
                strokeDasharray="4 4"
                label={{ value: `전국평균: ${x_meta.전국평균}`, fill: '#ff9500', fontSize: 10, position: 'top' }}
              />
              <ReferenceLine
                y={y_meta.전국평균}
                stroke="#ff9500"
                strokeDasharray="4 4"
                label={{ value: `전국평균: ${y_meta.전국평균}`, fill: '#ff9500', fontSize: 10, position: 'right' }}
              />

              {/* 비교 대상 동료 병원들 */}
              <Scatter
                name="비교 의료기관 (동일 규모)"
                data={peers_data}
                fill="#8e8e93"
                opacity={0.65}
              />

              {/* 현재 선택된 관심 병원 (크고 선명한 애플 블루) */}
              <Scatter
                name={target_hospital.기관명}
                data={target_data}
                fill="#0071e3"
                shape="circle"
              />
            </ScatterChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trend_data_y} margin={{ top: 15, right: 15, left: -10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f2f2f7" vertical={false} />
              <XAxis dataKey="연도" tick={{ fill: '#86868b', fontSize: 11 }} tickFormatter={(v) => `${v}년`} />
              <YAxis tick={{ fill: '#86868b', fontSize: 10 }} />
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
              <Bar dataKey="기관값" fill="#0071e3" radius={[6, 6, 0, 0]} name={`${target_hospital.기관명} (${y_meta.이름})`} />
              <Bar dataKey="지역평균" fill="#af52de" radius={[6, 6, 0, 0]} name="지역 평균" />
              <Bar dataKey="전국평균" fill="#8e8e93" radius={[6, 6, 0, 0]} name="전국 평균" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* 3. 하단: 사분면 포지셔닝 분석 및 전략적 권고사항 (Apple Glass Insight Card) */}
      {quadrant_insight && (
        <div className="bg-[#f5f5f7] p-4 rounded-2.5xl border border-black/[0.04] space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-[#1d1d1f] flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-[#0071e3]" />
              <span>포지셔닝 진단: {quadrant_insight.사분면}</span>
            </span>
            <div className="flex items-center space-x-2 text-[11px] text-[#86868b]">
              <span>{x_meta.이름}: <strong className="text-[#1d1d1f]">{target_hospital[x_metric]}{x_meta.단위}</strong></span>
              <span>•</span>
              <span>{y_meta.이름}: <strong className="text-[#1d1d1f]">{target_hospital[y_metric]}{y_meta.단위}</strong></span>
            </div>
          </div>
          <p className="text-[#48484a] leading-relaxed">
            {quadrant_insight.평가}
          </p>
          <div className="pt-2 border-t border-black/[0.04] text-[11px] text-[#0071e3] font-medium flex items-start gap-1">
            <span className="font-bold">전략적 제언:</span>
            <span>{quadrant_insight.권고사항}</span>
          </div>
        </div>
      )}
    </div>
  );
};
