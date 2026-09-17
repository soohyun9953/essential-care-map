'use client';

// macOS Finder / Settings 스타일의 전국 시·군·구 취약지 목록 테이블 컴포넌트

import React, { useState, useMemo } from 'react';
import { Search, ArrowUpDown, ChevronRight } from 'lucide-react';
import { 필수의료_진단_결과, 취약도_등급 } from '@/lib/필수의료_타입';
import { 취약도_등급_정보 } from '@/lib/필수의료_엔진';
import { format_number_comma } from '@/lib/유틸리티';

interface 취약지_목록_테이블_속성 {
  diagnosed_list: 필수의료_진단_결과[];
  selected_region: 필수의료_진단_결과 | null;
  on_select_region: (region: 필수의료_진단_결과) => void;
}

export const 취약지_목록_테이블: React.FC<취약지_목록_테이블_속성> = ({
  diagnosed_list,
  selected_region,
  on_select_region,
}) => {
  const [search_query, set_search_query] = useState('');
  const [selected_sido, set_selected_sido] = useState<string>('전체');
  const [selected_grade, set_selected_grade] = useState<string>('전체');
  const [sort_key, set_sort_key] = useState<keyof 필수의료_진단_결과>('취약분야_수');
  const [sort_order, set_sort_order] = useState<'asc' | 'desc'>('desc');

  const sido_list = useMemo(() => {
    const set = new Set<string>();
    diagnosed_list.forEach((item) => set.add(item.시도명));
    return ['전체', ...Array.from(set)];
  }, [diagnosed_list]);

  const filtered_and_sorted_list = useMemo(() => {
    return diagnosed_list
      .filter((item) => {
        if (
          search_query &&
          !item.시도명.includes(search_query) &&
          !item.시군구명.includes(search_query)
        ) {
          return false;
        }
        if (selected_sido !== '전체' && item.시도명 !== selected_sido) {
          return false;
        }
        if (selected_grade !== '전체' && item.종합_취약도_등급 !== selected_grade) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        const val_a = a[sort_key];
        const val_b = b[sort_key];
        if (typeof val_a === 'number' && typeof val_b === 'number') {
          return sort_order === 'asc' ? val_a - val_b : val_b - val_a;
        }
        return sort_order === 'asc'
          ? String(val_a).localeCompare(String(val_b))
          : String(val_b).localeCompare(String(val_a));
      });
  }, [diagnosed_list, search_query, selected_sido, selected_grade, sort_key, sort_order]);

  const handle_sort = (key: keyof 필수의료_진단_결과) => {
    if (sort_key === key) {
      set_sort_order(sort_order === 'asc' ? 'desc' : 'asc');
    } else {
      set_sort_key(key);
      set_sort_order('desc');
    }
  };

  return (
    <div className="bg-white p-5 sm:p-6 rounded-3xl border border-black/[0.05] shadow-apple-card space-y-3.5 h-full flex flex-col">
      {/* 상단 컨트롤 바 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 pb-3 border-b border-black/[0.05]">
        <div>
          <h3 className="text-sm font-bold tracking-tight text-[#1d1d1f]">
            전국 시·군·구 진단 데이터베이스
          </h3>
          <p className="text-xs text-[#86868b] mt-0.5">
            총 {filtered_and_sorted_list.length}개 지역 조회됨
          </p>
        </div>

        {/* 필터 툴바 */}
        <div className="flex flex-wrap items-center gap-1.5">
          {/* 애플 스타일 서치 인풋 */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#86868b]" />
            <input
              type="text"
              value={search_query}
              onChange={(e) => set_search_query(e.target.value)}
              placeholder="지역명 검색..."
              className="pl-8 pr-3 py-1.5 text-xs bg-[#f5f5f7] rounded-full border-0 text-[#1d1d1f] placeholder:text-[#86868b] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30 w-28 sm:w-32 transition"
            />
          </div>

          <select
            value={selected_sido}
            onChange={(e) => set_selected_sido(e.target.value)}
            className="text-xs bg-[#f5f5f7] rounded-full px-2.5 py-1.5 border-0 text-[#1d1d1f] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30 transition"
          >
            {sido_list.map((sido) => (
              <option key={sido} value={sido}>
                {sido === '전체' ? '모든 시·도' : sido}
              </option>
            ))}
          </select>

          <select
            value={selected_grade}
            onChange={(e) => set_selected_grade(e.target.value)}
            className="text-xs bg-[#f5f5f7] rounded-full px-2.5 py-1.5 border-0 text-[#1d1d1f] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30 transition"
          >
            <option value="전체">모든 등급</option>
            <option value="심각">심각 (Critical)</option>
            <option value="취약">취약 (Vulnerable)</option>
            <option value="관찰">관찰 (Caution)</option>
            <option value="정상">정상 (Safe)</option>
          </select>
        </div>
      </div>

      {/* 테이블 스크롤 영역 */}
      <div className="flex-1 min-h-[380px] max-h-[460px] overflow-y-auto overflow-x-auto rounded-2xl border border-black/[0.04]">
        <table className="w-full text-left text-sm text-[#1d1d1f]">
          <thead className="bg-[#f5f5f7] text-[#86868b] font-semibold sticky top-0 z-10 border-b border-black/[0.04] text-xs">
            <tr>
              <th className="py-2.5 px-3 cursor-pointer hover:text-[#1d1d1f] transition" onClick={() => handle_sort('시도명')}>
                <div className="flex items-center gap-1">
                  <span>지역명</span>
                  <ArrowUpDown className="w-3.5 h-3.5 text-[#86868b]" />
                </div>
              </th>
              <th className="py-2.5 px-3 cursor-pointer hover:text-[#1d1d1f] transition" onClick={() => handle_sort('종합_취약도_등급')}>
                <div className="flex items-center gap-1">
                  <span>취약도</span>
                  <ArrowUpDown className="w-3.5 h-3.5 text-[#86868b]" />
                </div>
              </th>
              <th className="py-2.5 px-3 cursor-pointer hover:text-[#1d1d1f] transition" onClick={() => handle_sort('응급_60분_미도달_인구비율')}>
                <div className="flex items-center gap-1">
                  <span>응급 미도달</span>
                  <ArrowUpDown className="w-3.5 h-3.5 text-[#86868b]" />
                </div>
              </th>
              <th className="py-2.5 px-3 cursor-pointer hover:text-[#1d1d1f] transition" onClick={() => handle_sort('관내_응급_의료이용률')}>
                <div className="flex items-center gap-1">
                  <span>응급 RI</span>
                  <ArrowUpDown className="w-3.5 h-3.5 text-[#86868b]" />
                </div>
              </th>
              <th className="py-2.5 px-3 cursor-pointer hover:text-[#1d1d1f] transition" onClick={() => handle_sort('분만_60분_미도달_인구비율')}>
                <div className="flex items-center gap-1">
                  <span>분만 미도달</span>
                  <ArrowUpDown className="w-3.5 h-3.5 text-[#86868b]" />
                </div>
              </th>
              <th className="py-2.5 px-3 cursor-pointer hover:text-[#1d1d1f] transition" onClick={() => handle_sort('소아_병상_공급비율')}>
                <div className="flex items-center gap-1">
                  <span>소아 병상</span>
                  <ArrowUpDown className="w-3.5 h-3.5 text-[#86868b]" />
                </div>
              </th>
              <th className="py-2.5 px-3 text-center"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/[0.03]">
            {filtered_and_sorted_list.map((item) => {
              const is_selected =
                selected_region?.시군구코드 === item.시군구코드 ||
                (selected_region?.시도명 === item.시도명 && selected_region?.시군구명 === item.시군구명);
              const meta_info = 취약도_등급_정보[item.종합_취약도_등급];

              return (
                <tr
                  key={`${item.시도코드}-${item.시군구코드}-${item.시군구명}`}
                  onClick={() => on_select_region(item)}
                  className={`cursor-pointer transition-all duration-150 ${
                    is_selected
                      ? 'bg-[#0071e3]/[0.08] font-semibold text-[#0071e3]'
                      : 'hover:bg-[#f5f5f7]/80'
                  }`}
                >
                  <td className="py-2.5 px-3">
                    <div className="flex flex-col">
                      <span className="font-bold text-[#1d1d1f] text-sm">
                        {item.시군구명}
                      </span>
                      <span className="text-xs text-[#86868b]">{item.시도명}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className="px-2 py-0.5 rounded-full text-xs font-bold text-white shadow-2xs"
                      style={{ backgroundColor: meta_info.색상코드 }}
                    >
                      {item.종합_취약도_등급}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className={item.응급_60분_미도달_인구비율 > 30 ? 'text-[#ff3b30] font-semibold' : 'text-[#1d1d1f]'}>
                      {item.응급_60분_미도달_인구비율}%
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className={item.관내_응급_의료이용률 < 30 ? 'text-[#ff3b30] font-semibold' : 'text-[#1d1d1f]'}>
                      {item.관내_응급_의료이용률}%
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className={item.분만_60분_미도달_인구비율 > 30 ? 'text-[#ff6934] font-semibold' : 'text-[#1d1d1f]'}>
                      {item.분만_60분_미도달_인구비율}%
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className={item.소아_병상_공급비율 < 60 ? 'text-[#ff9500] font-semibold' : 'text-[#1d1d1f]'}>
                      {item.소아_병상_공급비율}%
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <ChevronRight className={`w-3.5 h-3.5 ${is_selected ? 'text-[#0071e3]' : 'text-[#c7c7cc]'}`} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
