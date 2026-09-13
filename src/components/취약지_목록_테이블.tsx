'use client';

// 전국 시·군·구 필수의료 취약지 종합 목록 및 검색/필터링 테이블 컴포넌트

import React, { useState, useMemo } from 'react';
import { Search, Filter, ArrowUpDown, ChevronRight, Check } from 'lucide-react';
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

  // 시도 목록 추출
  const sido_list = useMemo(() => {
    const set = new Set<string>();
    diagnosed_list.forEach((item) => set.add(item.시도명));
    return ['전체', ...Array.from(set)];
  }, [diagnosed_list]);

  // 필터링 및 정렬
  const filtered_and_sorted_list = useMemo(() => {
    return diagnosed_list
      .filter((item) => {
        // 검색어 필터
        if (
          search_query &&
          !item.시도명.includes(search_query) &&
          !item.시군구명.includes(search_query)
        ) {
          return false;
        }
        // 시도 필터
        if (selected_sido !== '전체' && item.시도명 !== selected_sido) {
          return false;
        }
        // 등급 필터
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
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
      {/* 헤더 및 컨트롤 바 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            전국 시·군·구 필수의료 진단 결과 목록
          </h3>
          <p className="text-[11px] text-slate-400">
            총 {filtered_and_sorted_list.length}개 지역 조회됨 (클릭 시 세부 진단 및 지도 동기화)
          </p>
        </div>

        {/* 필터 툴바 */}
        <div className="flex flex-wrap items-center gap-2">
          {/* 검색창 */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search_query}
              onChange={(e) => set_search_query(e.target.value)}
              placeholder="지역명 검색..."
              className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 w-36 sm:w-44"
            />
          </div>

          {/* 시도 선택 */}
          <select
            value={selected_sido}
            onChange={(e) => set_selected_sido(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-sky-500"
          >
            {sido_list.map((sido) => (
              <option key={sido} value={sido}>
                {sido === '전체' ? '모든 시·도' : sido}
              </option>
            ))}
          </select>

          {/* 등급 선택 */}
          <select
            value={selected_grade}
            onChange={(e) => set_selected_grade(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-sky-500"
          >
            <option value="전체">모든 등급</option>
            <option value="심각">심각 (Critical)</option>
            <option value="취약">취약 (Vulnerable)</option>
            <option value="관찰">관찰 (Caution)</option>
            <option value="정상">정상 (Safe)</option>
          </select>
        </div>
      </div>

      {/* 목록 테이블 */}
      <div className="max-h-[380px] overflow-y-auto overflow-x-auto border border-slate-200 rounded-xl">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50 text-slate-700 font-semibold sticky top-0 z-10 border-b border-slate-200">
            <tr>
              <th className="py-2.5 px-3 cursor-pointer hover:text-sky-600" onClick={() => handle_sort('시도명')}>
                <div className="flex items-center gap-1">
                  <span>지역명</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-2.5 px-3 cursor-pointer hover:text-sky-600" onClick={() => handle_sort('종합_취약도_등급')}>
                <div className="flex items-center gap-1">
                  <span>취약도</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-2.5 px-3 cursor-pointer hover:text-sky-600" onClick={() => handle_sort('응급_60분_미도달_인구비율')}>
                <div className="flex items-center gap-1">
                  <span>응급 미도달</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-2.5 px-3 cursor-pointer hover:text-sky-600" onClick={() => handle_sort('관내_응급_의료이용률')}>
                <div className="flex items-center gap-1">
                  <span>응급 RI</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-2.5 px-3 cursor-pointer hover:text-sky-600" onClick={() => handle_sort('분만_60분_미도달_인구비율')}>
                <div className="flex items-center gap-1">
                  <span>분만 미도달</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-2.5 px-3 cursor-pointer hover:text-sky-600" onClick={() => handle_sort('소아_병상_공급비율')}>
                <div className="flex items-center gap-1">
                  <span>소아 병상</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-2.5 px-3 text-center">선택</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered_and_sorted_list.map((item) => {
              const is_selected =
                selected_region?.시군구코드 === item.시군구코드 ||
                (selected_region?.시도명 === item.시도명 && selected_region?.시군구명 === item.시군구명);
              const meta_info = 취약도_등급_정보[item.종합_취약도_등급];

              return (
                <tr
                  key={`${item.시도코드}-${item.시군구코드}-${item.시군구명}`}
                  onClick={() => on_select_region(item)}
                  className={`cursor-pointer transition hover:bg-sky-50/60 ${
                    is_selected ? 'bg-sky-50 font-semibold text-slate-900 border-l-4 border-sky-600' : ''
                  }`}
                >
                  <td className="py-2.5 px-3">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900">
                        {item.시군구명}
                      </span>
                      <span className="text-[10px] text-slate-400">{item.시도명}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white shadow-2xs"
                      style={{ backgroundColor: meta_info.색상코드 }}
                    >
                      {item.종합_취약도_등급}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className={item.응급_60분_미도달_인구비율 > 30 ? 'text-rose-600 font-bold' : 'text-slate-700'}>
                      {item.응급_60분_미도달_인구비율}%
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className={item.관내_응급_의료이용률 < 30 ? 'text-rose-600 font-bold' : 'text-slate-700'}>
                      {item.관내_응급_의료이용률}%
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className={item.분만_60분_미도달_인구비율 > 30 ? 'text-orange-600 font-bold' : 'text-slate-700'}>
                      {item.분만_60분_미도달_인구비율}%
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className={item.소아_병상_공급비율 < 60 ? 'text-amber-600 font-bold' : 'text-slate-700'}>
                      {item.소아_병상_공급비율}%
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        on_select_region(item);
                      }}
                      className="p-1 rounded-md text-slate-400 hover:text-sky-600 hover:bg-sky-100 transition"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
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
