'use client';

// 상단 글로벌 지역 신속 선택기 (시·도 및 시·군·구 연동 드롭다운 & 인기 취약지역 퀵 칩)

import React, { useMemo } from 'react';
import { MapPin, ChevronDown, Check, Sparkles, Navigation } from 'lucide-react';
import { 필수의료_진단_결과 } from '@/lib/필수의료_타입';

interface 상단_지역_선택기_속성 {
  diagnosed_list: 필수의료_진단_결과[];
  selected_region: 필수의료_진단_결과 | null;
  on_select_region: (region: 필수의료_진단_결과) => void;
}

// 공공의료 대표 시연 지역 핫스팟
const QUICK_REGIONS = [
  { sido: '강원특별자치도', sgg: '영월군', desc: '의료취약지 심각' },
  { sido: '충청북도', sgg: '단양군', desc: '응급 60분 미도달 89%' },
  { sido: '경상북도', sgg: '봉화군', desc: '분만 취약 A등급' },
  { sido: '전라남도', sgg: '신안군', desc: '도서·해양 취약' },
  { sido: '경상남도', sgg: '거창군', desc: '책임의료기관 연계' },
];

export const 상단_지역_선택기: React.FC<상단_지역_선택기_속성> = ({
  diagnosed_list,
  selected_region,
  on_select_region,
}) => {
  // 1. 시도 고유 목록 추출
  const sido_list = useMemo(() => {
    const set = new Set<string>();
    diagnosed_list.forEach((item) => {
      if (item.시도명) set.add(item.시도명);
    });
    return Array.from(set);
  }, [diagnosed_list]);

  // 2. 현재 선택된 시도에 속한 시군구 목록 추출
  const current_sido = selected_region?.시도명 || sido_list[0] || '강원특별자치도';

  const sgg_list_for_sido = useMemo(() => {
    return diagnosed_list.filter((item) => item.시도명 === current_sido);
  }, [diagnosed_list, current_sido]);

  // 시도 변경 핸들러
  const handle_sido_change = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const new_sido = e.target.value;
    const first_sgg = diagnosed_list.find((item) => item.시도명 === new_sido);
    if (first_sgg) {
      on_select_region(first_sgg);
    }
  };

  // 시군구 변경 핸들러
  const handle_sgg_change = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const new_sgg_code = e.target.value;
    const target = diagnosed_list.find((item) => item.시군구코드 === new_sgg_code);
    if (target) {
      on_select_region(target);
    }
  };

  // 취약도 등급 뱃지 색상
  const get_grade_badge = (grade: string | undefined) => {
    switch (grade) {
      case '심각':
        return 'bg-[#ff3b30] text-white';
      case '경고':
        return 'bg-[#ff9500] text-white';
      case '주의':
        return 'bg-[#ffcc00] text-slate-900';
      default:
        return 'bg-[#34c759] text-white';
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-black/[0.06] p-3 sm:p-4 shadow-apple-sm flex flex-col md:flex-row md:items-center justify-between gap-3 transition-all">
      {/* 좌측: 시·도 및 시·군·구 선택 셀렉터 */}
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="flex items-center space-x-1.5 text-sm font-bold text-[#1d1d1f] mr-1">
          <MapPin className="w-4 h-4 text-[#0071e3]" />
          <span>진단 대상 지역 선택:</span>
        </div>

        {/* 시·도 드롭다운 */}
        <div className="relative">
          <select
            value={current_sido}
            onChange={handle_sido_change}
            className="appearance-none pl-3.5 pr-8 py-2 bg-[#f5f5f7] hover:bg-[#e8e8ed] border border-black/[0.06] rounded-xl text-sm font-semibold text-[#1d1d1f] cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30 transition"
          >
            {sido_list.map((sido) => (
              <option key={sido} value={sido}>
                {sido}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-[#86868b] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* 시·군·구 드롭다운 */}
        <div className="relative">
          <select
            value={selected_region?.시군구코드 || ''}
            onChange={handle_sgg_change}
            className="appearance-none pl-3.5 pr-8 py-2 bg-[#f5f5f7] hover:bg-[#e8e8ed] border border-black/[0.06] rounded-xl text-sm font-bold text-[#0071e3] cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30 transition"
          >
            {sgg_list_for_sido.map((item) => (
              <option key={item.시군구코드} value={item.시군구코드}>
                {item.시군구명} ({item.종합_취약도_등급})
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-[#0071e3] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* 현재 선택된 지역 요약 배지 */}
        {selected_region && (
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-100 border border-black/[0.04] text-sm">
            <span className="font-semibold text-slate-800">
              {selected_region.시도명} {selected_region.시군구명}
            </span>
            <span
              className={`px-2 py-0.5 rounded-md text-xs font-bold ${get_grade_badge(
                selected_region.종합_취약도_등급
              )}`}
            >
              {selected_region.종합_취약도_등급} 취약지
            </span>
          </div>
        )}
      </div>

      {/* 우측: 공공의료 취약지 퀵 바로가기 칩 */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 md:pb-0 text-sm">
        <span className="text-xs text-[#86868b] font-medium shrink-0 flex items-center gap-1 mr-0.5">
          <Sparkles className="w-3.5 h-3.5 text-[#0071e3]" />
          <span>주요 취약지:</span>
        </span>
        <div className="flex items-center space-x-1.5">
          {QUICK_REGIONS.map((qr) => {
            const is_active =
              selected_region?.시도명 === qr.sido && selected_region?.시군구명 === qr.sgg;
            return (
              <button
                key={`${qr.sido}-${qr.sgg}`}
                onClick={() => {
                  const target = diagnosed_list.find(
                    (d) => d.시도명 === qr.sido && d.시군구명 === qr.sgg
                  );
                  if (target) on_select_region(target);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  is_active
                    ? 'bg-[#1d1d1f] text-white shadow-apple-sm scale-[0.98]'
                    : 'bg-[#f5f5f7] hover:bg-[#e8e8ed] text-slate-700'
                }`}
                title={qr.desc}
              >
                {qr.sgg}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
