'use client';

// 국립중앙의료원 매뉴얼(p.56~61) 기반 7대 서브그룹 진료실적 심층 드릴다운(Drill-down) 대시보드

import React, { useState, useMemo } from 'react';
import { 필수의료_진단_결과 } from '@/lib/필수의료_타입';
import {
  진료실적_서브그룹_엔진,
  진료실적_지표_유형,
  서브그룹_분류_유형,
  서브그룹_분석_결과,
} from '@/lib/진료실적_서브그룹_엔진';
import { format_number_comma } from '@/lib/유틸리티';
import { Layers, PieChart, TrendingUp, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';

interface 진료실적_서브그룹_대시보드_속성 {
  selected_region: 필수의료_진단_결과 | null;
}

export const 진료실적_서브그룹_대시보드: React.FC<진료실적_서브그룹_대시보드_속성> = ({ selected_region }) => {
  const [active_metric, set_active_metric] = useState<진료실적_지표_유형>('총_내원일수');
  const [active_subgroup, set_active_subgroup] = useState<서브그룹_분류_유형>('연령대별');
  const [expanded_item, set_expanded_item] = useState<string | null>(null);

  const subgroup_analysis: 서브그룹_분석_결과 | null = useMemo(() => {
    if (!selected_region) return null;
    return 진료실적_서브그룹_엔진.calculate_subgroup_performance(
      selected_region,
      active_subgroup,
      active_metric
    );
  }, [selected_region, active_subgroup, active_metric]);

  if (!selected_region || !subgroup_analysis) return null;

  const get_metric_title = (type: 진료실적_지표_유형): string => {
    switch (type) {
      case '총_내원일수':
        return '총 내원일수 (연인원)';
      case '건당_내원일수':
        return '건당 내원일수 (평균 재원일수)';
      case '건당_진료비':
        return '건당 평균 진료비';
      case '입원일당_진료비':
        return '입원일당 평균 진료비';
    }
  };

  return (
    <div className="bg-white p-6 sm:p-7 rounded-3xl border border-black/[0.05] shadow-apple-card space-y-5">
      {/* 1. 헤더 및 4대 실적 지표 스위처 */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-4 border-b border-black/[0.05]">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-[#0071e3] bg-[#0071e3]/10 px-2.5 py-0.5 rounded-full">
              NMC 7대 서브그룹 드릴다운
            </span>
            <span className="text-xs text-[#86868b]">다차원 심층 교차분석</span>
          </div>
          <h3 className="text-base font-bold tracking-tight text-[#1d1d1f] mt-1 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-[#0071e3]" />
            <span>{selected_region.시군구명} 입원 진료실적 심층 분석</span>
          </h3>
          <p className="text-xs text-[#86868b] mt-0.5">
            4대 실적 지표를 7개 환자군·질병군 축으로 교차 필터링하여 집중 진료 영역 진단
          </p>
        </div>

        {/* 4대 진료실적 지표 스위처 */}
        <div className="flex flex-wrap items-center gap-1 bg-[#f5f5f7] p-1 rounded-full border border-black/[0.04] text-xs">
          {(['총_내원일수', '건당_내원일수', '건당_진료비', '입원일당_진료비'] as 진료실적_지표_유형[]).map((m) => (
            <button
              key={m}
              onClick={() => set_active_metric(m)}
              className={`px-3 py-1 font-semibold rounded-full transition-all ${
                active_metric === m
                  ? 'bg-white text-[#1d1d1f] shadow-apple-sm'
                  : 'text-[#86868b] hover:text-[#1d1d1f]'
              }`}
            >
              {m === '총_내원일수' && '총 내원일수'}
              {m === '건당_내원일수' && '재원일수'}
              {m === '건당_진료비' && '건당 진료비'}
              {m === '입원일당_진료비' && '일당 진료비'}
            </button>
          ))}
        </div>
      </div>

      {/* 2. 7대 서브그룹 알약형 탭 바 */}
      <div className="flex flex-wrap items-center gap-1.5 pb-2">
        {(
          [
            '연령대별',
            '성별',
            '중증도별',
            '진료계별',
            '주진단범주별',
            '진료과목별',
            '지역환자_권역별',
          ] as 서브그룹_분류_유형[]
        ).map((sg) => (
          <button
            key={sg}
            onClick={() => {
              set_active_subgroup(sg);
              set_expanded_item(null);
            }}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all ${
              active_subgroup === sg
                ? 'bg-[#1d1d1f] text-white shadow-apple-sm'
                : 'bg-[#f5f5f7] text-[#86868b] hover:text-[#1d1d1f] hover:bg-[#e8e8ed]'
            }`}
          >
            {sg === '연령대별' && '연령대별'}
            {sg === '성별' && '성별'}
            {sg === '중증도별' && '중증도별(A/B/C)'}
            {sg === '진료계별' && '진료계(외과/내과)'}
            {sg === '주진단범주별' && '26개 질병군(MDC)'}
            {sg === '진료과목별' && '진료과목별'}
            {sg === '지역환자_권역별' && '환자유입 권역'}
          </button>
        ))}
      </div>

      {/* 3. 서브그룹 항목별 수평 게이지 바 리스트 */}
      <div className="space-y-3 pt-1">
        <div className="flex justify-between text-xs text-[#86868b] px-1 font-medium">
          <span>세부 항목 ({subgroup_analysis.항목_리스트.length}개)</span>
          <span>{get_metric_title(active_metric)} 및 구성비</span>
        </div>

        <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
          {subgroup_analysis.항목_리스트.map((item) => {
            const is_expanded = expanded_item === item.항목명;
            return (
              <div
                key={item.항목명}
                className="p-3 bg-[#f5f5f7]/70 hover:bg-[#f5f5f7] rounded-2.5xl border border-black/[0.03] transition group cursor-pointer"
                onClick={() => set_expanded_item(is_expanded ? null : item.항목명)}
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-[#1d1d1f]">{item.항목명}</span>
                    <span className="text-[10px] text-[#0071e3] bg-[#0071e3]/10 px-2 py-0.2 rounded-full font-semibold">
                      {item.점유비율}%
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-[#1d1d1f]">
                      {active_metric.includes('진료비')
                        ? `${Math.round(item.수치 / 10000)}만원`
                        : `${format_number_comma(item.수치)}${item.단위}`}
                    </span>
                    {is_expanded ? (
                      <ChevronUp className="w-3.5 h-3.5 text-[#86868b]" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-[#86868b] opacity-60 group-hover:opacity-100" />
                    )}
                  </div>
                </div>

                {/* 게이지 바 */}
                <div className="w-full bg-white h-2 rounded-full overflow-hidden mt-2 border border-black/[0.04]">
                  <div
                    className="bg-[#0071e3] h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, item.점유비율)}%` }}
                  />
                </div>

                {/* 클릭 시 펼쳐지는 최근 3개년 미니 추이 */}
                {is_expanded && (
                  <div className="mt-3 pt-2.5 border-t border-black/[0.05] flex items-center justify-between text-[11px] text-[#86868b] animate-in fade-in duration-150">
                    <div className="flex items-center space-x-1.5 font-medium text-[#1d1d1f]">
                      <TrendingUp className="w-3.5 h-3.5 text-[#0071e3]" />
                      <span>최근 3개년 추이:</span>
                    </div>
                    <div className="flex items-center space-x-4 font-semibold">
                      {item.추이_3개년.map((t) => (
                        <div key={t.연도} className="flex flex-col items-center">
                          <span className="text-[10px] text-[#86868b]">{t.연도}년</span>
                          <span className="text-[#1d1d1f]">
                            {active_metric.includes('진료비')
                              ? `${Math.round(t.값 / 10000)}만`
                              : `${format_number_comma(t.값)}${item.단위}`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. 하단 자동 시사점 도출 카드 */}
      <div className="bg-[#f5f5f7] p-4 rounded-2.5xl border border-black/[0.04] text-xs space-y-1">
        <div className="font-bold text-[#1d1d1f] flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-[#0071e3]" />
          <span>서브그룹 분석 기반 핵심 전략 시사점</span>
        </div>
        <p className="text-[#48484a] leading-relaxed pl-5">
          {subgroup_analysis.핵심_시사점}
        </p>
      </div>
    </div>
  );
};
