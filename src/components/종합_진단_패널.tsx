'use client';

// 애플 헬스(Apple Health) 스타일의 3대 필수의료 취약지 종합 진단 패널

import React, { useMemo } from 'react';
import {
  Siren,
  Baby,
  HeartPulse,
  AlertCircle,
  Users,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';
import { 필수의료_진단_결과 } from '@/lib/필수의료_타입';
import { 취약도_등급_정보 } from '@/lib/필수의료_엔진';
import { format_number_comma } from '@/lib/유틸리티';
import { get_region_indicators_trend } from '@/lib/헬스맵_주제도_지표_데이터셋';

interface 종합_진단_패널_속성 {
  selected_region: 필수의료_진단_결과 | null;
}

export const 종합_진단_패널: React.FC<종합_진단_패널_속성> = ({ selected_region }) => {
  const region_trends = useMemo(() => {
    if (!selected_region) return null;
    return get_region_indicators_trend(selected_region.시도명, selected_region.시군구명);
  }, [selected_region]);

  if (!selected_region || !region_trends) {
    return (
      <div className="bg-white p-10 rounded-3xl border border-black/[0.05] shadow-apple-card text-center flex flex-col items-center justify-center min-h-[280px]">
        <div className="w-12 h-12 rounded-full bg-[#f5f5f7] flex items-center justify-center mb-3">
          <AlertCircle className="w-6 h-6 text-[#86868b]" />
        </div>
        <p className="text-base font-semibold text-[#1d1d1f]">진단할 지역을 지도에서 선택하세요</p>
        <p className="text-xs text-[#86868b] mt-1 max-w-sm">
          지도 상의 시·군·구를 클릭하면 필수의료 지표 진단 결과와 사업계획서가 실시간 생성됩니다.
        </p>
      </div>
    );
  }

  const meta_info = 취약도_등급_정보[selected_region.종합_취약도_등급];

  return (
    <div className="bg-white p-6 sm:p-7 rounded-3xl border border-black/[0.05] shadow-apple-card space-y-6">
      {/* 상단: 지역 타이틀 및 종합 등급 캡슐 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-black/[0.05]">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-[#0071e3] bg-[#0071e3]/10 px-2.5 py-0.5 rounded-full">
              {selected_region.시도명}
            </span>
            <span className="text-xs text-[#86868b]">행정코드: {selected_region.시군구코드}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1d1d1f] mt-1">
            {selected_region.시군구명}
          </h2>
          <div className="flex items-center space-x-1.5 text-xs text-[#86868b] mt-1">
            <Users className="w-3.5 h-3.5" />
            <span>관내 인구: <strong className="text-[#1d1d1f] font-semibold">{format_number_comma(selected_region.인구수)}</strong>명</span>
          </div>
        </div>

        {/* 종합 등급 캡슐 배지 (애플 스타일 톤온톤) */}
        <div className={`px-4 py-3 rounded-2xl border flex items-center space-x-3.5 ${meta_info.배경색상_클래스}`}>
          <div className="w-3.5 h-3.5 rounded-full animate-pulse" style={{ backgroundColor: meta_info.색상코드 }} />
          <div>
            <div className="text-[11px] font-medium opacity-75">종합 취약도 등급</div>
            <div className="text-lg font-bold tracking-tight flex items-center gap-2">
              <span>{meta_info.라벨}</span>
              <span className="text-xs font-semibold px-2 py-0.5 bg-white/80 rounded-full text-[#1d1d1f] shadow-apple-sm">
                취약 {selected_region.취약분야_수}/3개
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3대 핵심 지표 카드 (Apple Watch / Apple Health 모듈형 카드 디자인) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {/* 1. 응급의료 카드 */}
        <div
          className={`p-4 rounded-2.5xl border transition-all ${
            selected_region.응급취약지역_여부
              ? 'bg-[#ff3b30]/[0.03] border-[#ff3b30]/20 hover:border-[#ff3b30]/35'
              : 'bg-[#f5f5f7]/60 border-black/[0.04] hover:border-black/[0.08]'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center ${
                  selected_region.응급취약지역_여부
                    ? 'bg-[#ff3b30]/10 text-[#ff3b30]'
                    : 'bg-[#34c759]/10 text-[#34c759]'
                }`}
              >
                <Siren className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-semibold text-[#1d1d1f]">응급의료</span>
            </div>
            <span
              className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                selected_region.응급취약지역_여부
                  ? 'bg-[#ff3b30]/10 text-[#ff3b30]'
                  : 'bg-[#34c759]/10 text-[#34c759]'
              }`}
            >
              {selected_region.응급취약지역_여부 ? '취약' : '정상'}
            </span>
          </div>

          <div className="space-y-1.5 text-xs text-[#86868b]">
            <div className="flex justify-between items-baseline">
              <span>60분 미도달율:</span>
              <span className={`font-semibold text-sm ${selected_region.응급_60분_미도달_인구비율 > 30 ? 'text-[#ff3b30]' : 'text-[#1d1d1f]'}`}>
                {selected_region.응급_60분_미도달_인구비율}%
              </span>
            </div>
            <div className="flex justify-between items-baseline">
              <span>관내 이용률(RI):</span>
              <span className={`font-semibold text-sm ${selected_region.관내_응급_의료이용률 < 30 ? 'text-[#ff3b30]' : 'text-[#1d1d1f]'}`}>
                {selected_region.관내_응급_의료이용률}%
              </span>
            </div>
          </div>
          <p className="text-[11px] text-[#86868b] mt-3 pt-2.5 border-t border-black/[0.04] leading-relaxed">
            {selected_region.응급_판정근거}
          </p>
        </div>

        {/* 2. 분만·모자의료 카드 */}
        <div
          className={`p-4 rounded-2.5xl border transition-all ${
            selected_region.분만취약지역_여부
              ? 'bg-[#ff6934]/[0.03] border-[#ff6934]/20 hover:border-[#ff6934]/35'
              : 'bg-[#f5f5f7]/60 border-black/[0.04] hover:border-black/[0.08]'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center ${
                  selected_region.분만취약지역_여부
                    ? 'bg-[#ff6934]/10 text-[#ff6934]'
                    : 'bg-[#34c759]/10 text-[#34c759]'
                }`}
              >
                <Baby className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-semibold text-[#1d1d1f]">분만·모자</span>
            </div>
            <span
              className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                selected_region.분만취약지역_여부
                  ? 'bg-[#ff6934]/10 text-[#ff6934]'
                  : 'bg-[#34c759]/10 text-[#34c759]'
              }`}
            >
              {selected_region.분만취약지역_여부 ? '취약' : '정상'}
            </span>
          </div>

          <div className="space-y-1.5 text-xs text-[#86868b]">
            <div className="flex justify-between items-baseline">
              <span>60분 미도달율:</span>
              <span className={`font-semibold text-sm ${selected_region.분만_60분_미도달_인구비율 > 30 ? 'text-[#ff6934]' : 'text-[#1d1d1f]'}`}>
                {selected_region.분만_60분_미도달_인구비율}%
              </span>
            </div>
            <div className="flex justify-between items-baseline">
              <span>관내 분만율:</span>
              <span className={`font-semibold text-sm ${selected_region.관내_분만율 < 40 ? 'text-[#ff6934]' : 'text-[#1d1d1f]'}`}>
                {selected_region.관내_분만율}%
              </span>
            </div>
          </div>
          <p className="text-[11px] text-[#86868b] mt-3 pt-2.5 border-t border-black/[0.04] leading-relaxed">
            {selected_region.분만_판정근거}
          </p>
        </div>

        {/* 3. 소아·중증진료 카드 */}
        <div
          className={`p-4 rounded-2.5xl border transition-all ${
            selected_region.소아취약지역_여부
              ? 'bg-[#ff9500]/[0.03] border-[#ff9500]/20 hover:border-[#ff9500]/35'
              : 'bg-[#f5f5f7]/60 border-black/[0.04] hover:border-black/[0.08]'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center ${
                  selected_region.소아취약지역_여부
                    ? 'bg-[#ff9500]/10 text-[#ff9500]'
                    : 'bg-[#34c759]/10 text-[#34c759]'
                }`}
              >
                <HeartPulse className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-semibold text-[#1d1d1f]">소아·중증</span>
            </div>
            <span
              className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                selected_region.소아취약지역_여부
                  ? 'bg-[#ff9500]/10 text-[#ff9500]'
                  : 'bg-[#34c759]/10 text-[#34c759]'
              }`}
            >
              {selected_region.소아취약지역_여부 ? '취약' : '정상'}
            </span>
          </div>

          <div className="space-y-1.5 text-xs text-[#86868b]">
            <div className="flex justify-between items-baseline">
              <span>병상 공급율:</span>
              <span className={`font-semibold text-sm ${selected_region.소아_병상_공급비율 < 60 ? 'text-[#ff9500]' : 'text-[#1d1d1f]'}`}>
                {selected_region.소아_병상_공급비율}%
              </span>
            </div>
            <div className="flex justify-between items-baseline">
              <span>야간접근 지수:</span>
              <span className="font-semibold text-sm text-[#1d1d1f]">
                {selected_region.소아_야간휴일_접근성지수}점
              </span>
            </div>
          </div>
          <p className="text-[11px] text-[#86868b] mt-3 pt-2.5 border-t border-black/[0.04] leading-relaxed">
            {selected_region.소아_판정근거}
          </p>
        </div>
      </div>

      {/* 4대 영역 공식 헬스맵 실데이터 지표 요약 (수요·자원·이용·결과) */}
      <div className="pt-5 border-t border-black/[0.05] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-[#1d1d1f]">
              4대 영역 공공보건의료 지표 (2024년 기준 & 6개년 추이)
            </span>
          </div>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#f5f5f7] text-[#86868b]">
            보건복지부 헬스맵 실데이터
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* 1. 의료수요: 치매유병률 & 의료급여 */}
          <div className="p-3 rounded-2xl bg-[#f5f5f7]/80 dark:bg-slate-800/50 border border-black/[0.04] space-y-1">
            <div className="text-[10.5px] font-semibold text-[#86868b]">수요: 추정 치매유병률</div>
            <div className="text-sm font-bold text-[#1d1d1f] dark:text-white">
              {region_trends.indicators['ABA10']?.values['2024'] ?? '-'} <span className="text-[10px] font-normal text-[#86868b]">명/천명</span>
            </div>
            <div className="text-[10px] text-slate-500">
              2019년: {region_trends.indicators['ABA10']?.values['2019'] ?? '-'}명
            </div>
          </div>

          {/* 2. 의료자원: 인구10만당 전문의수 */}
          <div className="p-3 rounded-2xl bg-[#f5f5f7]/80 dark:bg-slate-800/50 border border-black/[0.04] space-y-1">
            <div className="text-[10.5px] font-semibold text-[#86868b]">자원: 10만당 전문의</div>
            <div className="text-sm font-bold text-[#0071e3]">
              {region_trends.indicators['BAE04']?.values['2024'] ?? '-'} <span className="text-[10px] font-normal text-[#86868b]">명</span>
            </div>
            <div className="text-[10px] text-slate-500">
              전국: {region_trends.national_indicators['BAE04']?.values['2024'] ?? '-'}명
            </div>
          </div>

          {/* 3. 의료이용: 투석 관내이용률 RI */}
          <div className="p-3 rounded-2xl bg-[#f5f5f7]/80 dark:bg-slate-800/50 border border-black/[0.04] space-y-1">
            <div className="text-[10.5px] font-semibold text-[#86868b]">이용: 투석(인공신장실) RI</div>
            <div className="text-sm font-bold text-emerald-600">
              {region_trends.indicators['CBD06']?.values['2024'] ?? '-'}%
            </div>
            <div className="text-[10px] text-slate-500">
              2019년 {region_trends.indicators['CBD06']?.values['2019'] ?? '-'}% 대비
            </div>
          </div>

          {/* 4. 건강결과: 치료가능사망률(OECD) */}
          <div className="p-3 rounded-2xl bg-[#f5f5f7]/80 dark:bg-slate-800/50 border border-black/[0.04] space-y-1">
            <div className="text-[10.5px] font-semibold text-[#86868b]">결과: 치료가능사망률</div>
            <div className="text-sm font-bold text-[#ff3b30]">
              {region_trends.indicators['DAA14']?.values['2024'] ?? '-'} <span className="text-[10px] font-normal text-[#86868b]">명/10만</span>
            </div>
            <div className="text-[10px] text-slate-500">
              전국: {region_trends.national_indicators['DAA14']?.values['2024'] ?? '-'}명
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
