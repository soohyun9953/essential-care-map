'use client';

// 선택된 시·군·구의 3대 필수의료 취약지 진단 결과 및 KPI 지표 패널

import React from 'react';
import {
  Siren,
  Baby,
  HeartPulse,
  AlertTriangle,
  CheckCircle2,
  Users,
  Award,
} from 'lucide-react';
import { 필수의료_진단_결과 } from '@/lib/필수의료_타입';
import { 취약도_등급_정보 } from '@/lib/필수의료_엔진';
import { format_number_comma } from '@/lib/유틸리티';

interface 종합_진단_패널_속성 {
  selected_region: 필수의료_진단_결과 | null;
}

export const 종합_진단_패널: React.FC<종합_진단_패널_속성> = ({ selected_region }) => {
  if (!selected_region) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center flex flex-col items-center justify-center min-h-[300px]">
        <AlertTriangle className="w-10 h-10 text-slate-300 mb-3" />
        <p className="text-base font-semibold text-slate-700">진단할 시·군·구를 지도 또는 목록에서 선택해주세요.</p>
        <p className="text-xs text-slate-400 mt-1">지도의 시군구 영역을 클릭하면 즉시 진단 지표와 사업계획서가 생성됩니다.</p>
      </div>
    );
  }

  const meta_info = 취약도_등급_정보[selected_region.종합_취약도_등급];

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
      {/* 지역명 및 종합 판정 뱃지 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-sky-600 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200">
              {selected_region.시도명}
            </span>
            <span className="text-xs text-slate-400">코드: {selected_region.시군구코드}</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            {selected_region.시군구명}
          </h2>
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 mt-0.5">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <span>총 인구수: <strong className="text-slate-800">{format_number_comma(selected_region.인구수)}</strong>명</span>
          </div>
        </div>

        {/* 종합 등급 카드 */}
        <div className={`px-4 py-2.5 rounded-xl border flex items-center space-x-3 ${meta_info.배경색상_클래스}`}>
          <div className="p-2 rounded-lg bg-white/80 shadow-sm">
            <Award className="w-5 h-5" style={{ color: meta_info.색상코드 }} />
          </div>
          <div>
            <div className="text-[11px] font-medium opacity-80">종합 취약도 등급</div>
            <div className="text-base font-extrabold flex items-center gap-1.5">
              <span>{meta_info.라벨}</span>
              <span className="text-xs font-semibold px-1.5 py-0.2 bg-white/90 rounded text-slate-800">
                취약 {selected_region.취약분야_수}/3개
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3대 핵심 분야별 법정 진단 카드 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* 1. 응급의료 취약지 */}
        <div
          className={`p-3.5 rounded-xl border transition ${
            selected_region.응급취약지역_여부
              ? 'bg-rose-50/50 border-rose-200'
              : 'bg-emerald-50/40 border-emerald-200'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-1.5">
              <Siren
                className={`w-4 h-4 ${
                  selected_region.응급취약지역_여부 ? 'text-rose-600' : 'text-emerald-600'
                }`}
              />
              <span className="text-xs font-bold text-slate-800">1. 응급의료 분야</span>
            </div>
            <span
              className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                selected_region.응급취약지역_여부
                  ? 'bg-rose-100 text-rose-700 border border-rose-300'
                  : 'bg-emerald-100 text-emerald-700 border border-emerald-300'
              }`}
            >
              {selected_region.응급취약지역_여부 ? '취약 판정' : '기준 충족'}
            </span>
          </div>

          <div className="space-y-1.5 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>60분 미도달 인구:</span>
              <strong className={selected_region.응급_60분_미도달_인구비율 > 30 ? 'text-rose-600 font-bold' : 'text-slate-800'}>
                {selected_region.응급_60분_미도달_인구비율}%
              </strong>
            </div>
            <div className="flex justify-between">
              <span>관내 이용률(RI):</span>
              <strong className={selected_region.관내_응급_의료이용률 < 30 ? 'text-rose-600 font-bold' : 'text-slate-800'}>
                {selected_region.관내_응급_의료이용률}%
              </strong>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-200/60 leading-tight">
            {selected_region.응급_판정근거}
          </p>
        </div>

        {/* 2. 분만·모자의료 취약지 */}
        <div
          className={`p-3.5 rounded-xl border transition ${
            selected_region.분만취약지역_여부
              ? 'bg-orange-50/50 border-orange-200'
              : 'bg-emerald-50/40 border-emerald-200'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-1.5">
              <Baby
                className={`w-4 h-4 ${
                  selected_region.분만취약지역_여부 ? 'text-orange-600' : 'text-emerald-600'
                }`}
              />
              <span className="text-xs font-bold text-slate-800">2. 분만·모자 분야</span>
            </div>
            <span
              className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                selected_region.분만취약지역_여부
                  ? 'bg-orange-100 text-orange-700 border border-orange-300'
                  : 'bg-emerald-100 text-emerald-700 border border-emerald-300'
              }`}
            >
              {selected_region.분만취약지역_여부 ? '취약 판정' : '기준 충족'}
            </span>
          </div>

          <div className="space-y-1.5 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>60분 미도달 인구:</span>
              <strong className={selected_region.분만_60분_미도달_인구비율 > 30 ? 'text-orange-600 font-bold' : 'text-slate-800'}>
                {selected_region.분만_60분_미도달_인구비율}%
              </strong>
            </div>
            <div className="flex justify-between">
              <span>관내 분만율:</span>
              <strong className={selected_region.관내_분만율 < 40 ? 'text-orange-600 font-bold' : 'text-slate-800'}>
                {selected_region.관내_분만율}%
              </strong>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-200/60 leading-tight">
            {selected_region.분만_판정근거}
          </p>
        </div>

        {/* 3. 소아·중증진료 취약지 */}
        <div
          className={`p-3.5 rounded-xl border transition ${
            selected_region.소아취약지역_여부
              ? 'bg-amber-50/50 border-amber-200'
              : 'bg-emerald-50/40 border-emerald-200'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-1.5">
              <HeartPulse
                className={`w-4 h-4 ${
                  selected_region.소아취약지역_여부 ? 'text-amber-600' : 'text-emerald-600'
                }`}
              />
              <span className="text-xs font-bold text-slate-800">3. 소아·중증 분야</span>
            </div>
            <span
              className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                selected_region.소아취약지역_여부
                  ? 'bg-amber-100 text-amber-700 border border-amber-300'
                  : 'bg-emerald-100 text-emerald-700 border border-emerald-300'
              }`}
            >
              {selected_region.소아취약지역_여부 ? '취약 판정' : '기준 충족'}
            </span>
          </div>

          <div className="space-y-1.5 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>병상 공급비율:</span>
              <strong className={selected_region.소아_병상_공급비율 < 60 ? 'text-amber-600 font-bold' : 'text-slate-800'}>
                {selected_region.소아_병상_공급비율}%
              </strong>
            </div>
            <div className="flex justify-between">
              <span>야간휴일 접근성:</span>
              <strong className="text-slate-800">
                {selected_region.소아_야간휴일_접근성지수}점
              </strong>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-200/60 leading-tight">
            {selected_region.소아_판정근거}
          </p>
        </div>
      </div>
    </div>
  );
};
