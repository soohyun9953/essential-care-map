'use client';

// 국립중앙의료원 매뉴얼(p.61~69) 기반 1:1 기관비교 및 지역비교 벤치마킹 대시보드 컴포넌트

import React, { useState, useMemo } from 'react';
import { 필수의료_진단_결과 } from '@/lib/필수의료_타입';
import {
  일대일_비교_엔진,
  전국_지역거점_공공병원_데이터셋,
  거점_공공병원_정보,
  기관_비교_결과,
  지역_비교_결과,
} from '@/lib/일대일_비교_엔진';
import { format_number_comma } from '@/lib/유틸리티';
import { GitCompare, Building2, MapPin, ArrowRightLeft, CheckCircle2, TrendingUp, TrendingDown } from 'lucide-react';

interface 일대일_비교_대시보드_속성 {
  selected_region: 필수의료_진단_결과 | null;
  diagnosed_list: 필수의료_진단_결과[];
}

export const 일대일_비교_대시보드: React.FC<일대일_비교_대시보드_속성> = ({
  selected_region,
  diagnosed_list,
}) => {
  const [compare_mode, set_compare_mode] = useState<'hospital' | 'region'>('hospital');

  // 1) 기관비교 상태
  const default_hospital_a = useMemo(() => {
    if (!selected_region) return 전국_지역거점_공공병원_데이터셋[0];
    return (
      전국_지역거점_공공병원_데이터셋.find((h) => h.시군구명 === selected_region.시군구명) ||
      전국_지역거점_공공병원_데이터셋[0]
    );
  }, [selected_region]);

  const [hospital_a_code, set_hospital_a_code] = useState<string>(default_hospital_a.병원코드);
  const [hospital_b_code, set_hospital_b_code] = useState<string>('GW-02'); // 기본: 원주의료원

  const hospital_a = useMemo(() => {
    return 전국_지역거점_공공병원_데이터셋.find((h) => h.병원코드 === hospital_a_code) || default_hospital_a;
  }, [hospital_a_code, default_hospital_a]);

  const hospital_b = useMemo(() => {
    return 전국_지역거점_공공병원_데이터셋.find((h) => h.병원코드 === hospital_b_code) || 전국_지역거점_공공병원_데이터셋[1];
  }, [hospital_b_code]);

  const hospital_comparison: 기관_비교_결과 = useMemo(() => {
    return 일대일_비교_엔진.compare_hospitals(hospital_a, hospital_b);
  }, [hospital_a, hospital_b]);

  // 2) 지역비교 상태
  const default_region_b = useMemo(() => {
    return diagnosed_list.find((r) => r.시군구명 === '안동시') || diagnosed_list[1] || selected_region;
  }, [diagnosed_list, selected_region]);

  const [region_b_sgg, set_region_b_sgg] = useState<string>(default_region_b?.시군구명 || '');

  const region_b = useMemo(() => {
    return diagnosed_list.find((r) => r.시군구명 === region_b_sgg) || default_region_b;
  }, [region_b_sgg, diagnosed_list, default_region_b]);

  const region_comparison: 지역_비교_결과 | null = useMemo(() => {
    if (!selected_region || !region_b) return null;
    return 일대일_비교_엔진.compare_regions(selected_region, region_b);
  }, [selected_region, region_b]);

  if (!selected_region) return null;

  return (
    <div className="bg-white p-6 sm:p-7 rounded-3xl border border-black/[0.05] shadow-apple-card space-y-6">
      {/* 상단 탭 & 모드 전환 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-black/[0.05]">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-[#0071e3] bg-[#0071e3]/10 px-2.5 py-0.5 rounded-full">
              NMC 매뉴얼 1:1 비교
            </span>
            <span className="text-xs text-[#86868b]">객관적 격차 분석 & 벤치마킹</span>
          </div>
          <h3 className="text-base font-bold tracking-tight text-[#1d1d1f] mt-1 flex items-center gap-1.5">
            <GitCompare className="w-4 h-4 text-[#0071e3]" />
            <span>실시간 1:1 심층 비교 대시보드</span>
          </h3>
          <p className="text-xs text-[#86868b] mt-0.5">
            비슷한 여건의 지역거점 공공병원 또는 타 지역과의 격차를 객관적으로 분석
          </p>
        </div>

        {/* 세그먼트 컨트롤러 */}
        <div className="flex items-center space-x-1 bg-[#f5f5f7] p-1 rounded-full border border-black/[0.04] text-xs">
          <button
            onClick={() => set_compare_mode('hospital')}
            className={`px-3 py-1 font-semibold rounded-full transition-all flex items-center gap-1.5 ${
              compare_mode === 'hospital'
                ? 'bg-white text-[#1d1d1f] shadow-apple-sm'
                : 'text-[#86868b] hover:text-[#1d1d1f]'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>기관별 1:1 비교</span>
          </button>
          <button
            onClick={() => set_compare_mode('region')}
            className={`px-3 py-1 font-semibold rounded-full transition-all flex items-center gap-1.5 ${
              compare_mode === 'region'
                ? 'bg-white text-[#1d1d1f] shadow-apple-sm'
                : 'text-[#86868b] hover:text-[#1d1d1f]'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>지역별 1:1 비교</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. 기관별 1:1 비교 모드 */}
      {/* ========================================================================= */}
      {compare_mode === 'hospital' && (
        <div className="space-y-5">
          {/* 셀렉터 영역 (좌측 우리 병원 vs 우측 벤치마킹 병원) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#f5f5f7]/60 p-4 rounded-2.5xl border border-black/[0.04]">
            {/* 좌측 A 병원 */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-[#86868b] flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#0071e3]" />
                <span>기준 병원 (선택 기관)</span>
              </label>
              <select
                value={hospital_a_code}
                onChange={(e) => set_hospital_a_code(e.target.value)}
                className="w-full text-xs font-semibold bg-white p-2 rounded-2xl border border-black/[0.06] text-[#1d1d1f] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30"
              >
                {전국_지역거점_공공병원_데이터셋.map((h) => (
                  <option key={`a-${h.병원코드}`} value={h.병원코드}>
                    {h.병원명} ({h.시군구명}, {h.허가병상수}병상)
                  </option>
                ))}
              </select>
            </div>

            {/* 우측 B 병원 */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-[#86868b] flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#af52de]" />
                <span>비교 대상 병원 (벤치마킹)</span>
              </label>
              <select
                value={hospital_b_code}
                onChange={(e) => set_hospital_b_code(e.target.value)}
                className="w-full text-xs font-semibold bg-white p-2 rounded-2xl border border-black/[0.06] text-[#1d1d1f] focus:outline-none focus:ring-2 focus:ring-[#af52de]/30"
              >
                {전국_지역거점_공공병원_데이터셋.map((h) => (
                  <option key={`b-${h.병원코드}`} value={h.병원코드}>
                    {h.병원명} ({h.시군구명}, {h.허가병상수}병상)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 4대 진료실적 좌우 비교 지표 카드 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* 총 내원일수 */}
            <div className="bg-[#f5f5f7] p-3.5 rounded-2.5xl border border-black/[0.03]">
              <span className="text-[#86868b] text-[11px]">연간 총 내원일수</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-sm font-bold text-[#0071e3]">
                  {format_number_comma(hospital_a.전체_내원일수)}일
                </span>
                <span className="text-xs text-[#86868b]">vs</span>
                <span className="text-sm font-bold text-[#af52de]">
                  {format_number_comma(hospital_b.전체_내원일수)}일
                </span>
              </div>
              <div className="text-[10px] text-[#86868b] mt-1 pt-1 border-t border-black/[0.04]">
                격차: {hospital_comparison.내원일수_격차 > 0 ? `+${format_number_comma(hospital_comparison.내원일수_격차)}일` : `${format_number_comma(hospital_comparison.내원일수_격차)}일`}
              </div>
            </div>

            {/* 건당 내원일수 (재원일수) */}
            <div className="bg-[#f5f5f7] p-3.5 rounded-2.5xl border border-black/[0.03]">
              <span className="text-[#86868b] text-[11px]">평균 재원일수</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-sm font-bold text-[#0071e3]">{hospital_a.건당_내원일수}일</span>
                <span className="text-xs text-[#86868b]">vs</span>
                <span className="text-sm font-bold text-[#af52de]">{hospital_b.건당_내원일수}일</span>
              </div>
              <div className="text-[10px] text-[#86868b] mt-1 pt-1 border-t border-black/[0.04]">
                격차: {(hospital_a.건당_내원일수 - hospital_b.건당_내원일수).toFixed(1)}일
              </div>
            </div>

            {/* 건당 진료비 */}
            <div className="bg-[#f5f5f7] p-3.5 rounded-2.5xl border border-black/[0.03]">
              <span className="text-[#86868b] text-[11px]">건당 진료비</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-sm font-bold text-[#0071e3]">{Math.round(hospital_a.건당_진료비 / 10000)}만원</span>
                <span className="text-xs text-[#86868b]">vs</span>
                <span className="text-sm font-bold text-[#af52de]">{Math.round(hospital_b.건당_진료비 / 10000)}만원</span>
              </div>
              <div className="text-[10px] text-[#86868b] mt-1 pt-1 border-t border-black/[0.04]">
                격차: {Math.round(hospital_comparison.진료비_격차 / 10000)}만원
              </div>
            </div>

            {/* 입원일당 진료비 */}
            <div className="bg-[#f5f5f7] p-3.5 rounded-2.5xl border border-black/[0.03]">
              <span className="text-[#86868b] text-[11px]">입원일당 진료비</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-sm font-bold text-[#0071e3]">{format_number_comma(hospital_a.입원일당_진료비)}원</span>
                <span className="text-xs text-[#86868b]">vs</span>
                <span className="text-sm font-bold text-[#af52de]">{format_number_comma(hospital_b.입원일당_진료비)}원</span>
              </div>
              <div className="text-[10px] text-[#86868b] mt-1 pt-1 border-t border-black/[0.04]">
                격차: {format_number_comma(hospital_comparison.입원일당_격차)}원
              </div>
            </div>
          </div>

          {/* 수술비중 & 중증도 게이지 비교 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {/* 외과계 수술비중 비교 */}
            <div className="p-4 rounded-2.5xl border border-black/[0.04] bg-white space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-[#1d1d1f]">외과계 수술 환자 비중</span>
                <span className="text-[#86868b]">
                  격차: <strong className={hospital_comparison.수술비중_격차 >= 0 ? 'text-[#0071e3]' : 'text-[#ff3b30]'}>
                    {hospital_comparison.수술비중_격차 > 0 ? `+${hospital_comparison.수술비중_격차}%p` : `${hospital_comparison.수술비중_격차}%p`}
                  </strong>
                </span>
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-[11px]">
                  <span className="text-[#0071e3] font-semibold">{hospital_a.병원명}</span>
                  <span className="font-bold">{hospital_a.외과계_수술비중}%</span>
                </div>
                <div className="w-full bg-[#f2f2f7] h-2 rounded-full overflow-hidden">
                  <div className="bg-[#0071e3] h-full rounded-full" style={{ width: `${Math.min(100, hospital_a.외과계_수술비중 * 2.5)}%` }} />
                </div>
                <div className="flex justify-between text-[11px] pt-1">
                  <span className="text-[#af52de] font-semibold">{hospital_b.병원명}</span>
                  <span className="font-bold">{hospital_b.외과계_수술비중}%</span>
                </div>
                <div className="w-full bg-[#f2f2f7] h-2 rounded-full overflow-hidden">
                  <div className="bg-[#af52de] h-full rounded-full" style={{ width: `${Math.min(100, hospital_b.외과계_수술비중 * 2.5)}%` }} />
                </div>
              </div>
            </div>

            {/* 전문진료질병군(중증도) 비율 비교 */}
            <div className="p-4 rounded-2.5xl border border-black/[0.04] bg-white space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-[#1d1d1f]">전문진료질병군 (중증도) 비중</span>
                <span className="text-[#86868b]">
                  격차: <strong className={hospital_comparison.중증도_격차 >= 0 ? 'text-[#0071e3]' : 'text-[#ff3b30]'}>
                    {hospital_comparison.중증도_격차 > 0 ? `+${hospital_comparison.중증도_격차}%p` : `${hospital_comparison.중증도_격차}%p`}
                  </strong>
                </span>
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-[11px]">
                  <span className="text-[#0071e3] font-semibold">{hospital_a.병원명}</span>
                  <span className="font-bold">{hospital_a.전문진료_중증도비율}%</span>
                </div>
                <div className="w-full bg-[#f2f2f7] h-2 rounded-full overflow-hidden">
                  <div className="bg-[#0071e3] h-full rounded-full" style={{ width: `${Math.min(100, hospital_a.전문진료_중증도비율 * 3.5)}%` }} />
                </div>
                <div className="flex justify-between text-[11px] pt-1">
                  <span className="text-[#af52de] font-semibold">{hospital_b.병원명}</span>
                  <span className="font-bold">{hospital_b.전문진료_중증도비율}%</span>
                </div>
                <div className="w-full bg-[#f2f2f7] h-2 rounded-full overflow-hidden">
                  <div className="bg-[#af52de] h-full rounded-full" style={{ width: `${Math.min(100, hospital_b.전문진료_중증도비율 * 3.5)}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* 종합 시사점 카드 */}
          <div className="bg-[#f5f5f7] p-4 rounded-2.5xl border border-black/[0.04] text-xs space-y-1.5">
            <div className="font-bold text-[#1d1d1f] flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#34c759]" />
              <span>1:1 벤치마킹 종합 평가 및 사업 당위성 시사점</span>
            </div>
            <p className="text-[#48484a] leading-relaxed pl-5">
              {hospital_comparison.종합_비교_평가}
            </p>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. 지역별 1:1 비교 모드 */}
      {/* ========================================================================= */}
      {compare_mode === 'region' && region_comparison && (
        <div className="space-y-5">
          {/* 지역 셀렉터 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#f5f5f7]/60 p-4 rounded-2.5xl border border-black/[0.04]">
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-[#86868b] flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#0071e3]" />
                <span>기준 지역</span>
              </label>
              <div className="p-2.5 bg-white rounded-2xl border border-black/[0.06] text-xs font-bold text-[#1d1d1f]">
                {selected_region.시도명} {selected_region.시군구명} (인구 {format_number_comma(selected_region.인구수)}명)
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-[#86868b] flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#ff9500]" />
                <span>비교 대상 지역</span>
              </label>
              <select
                value={region_b_sgg}
                onChange={(e) => set_region_b_sgg(e.target.value)}
                className="w-full text-xs font-semibold bg-white p-2 rounded-2xl border border-black/[0.06] text-[#1d1d1f] focus:outline-none focus:ring-2 focus:ring-[#ff9500]/30"
              >
                {diagnosed_list.map((r) => (
                  <option key={`rb-${r.시도코드}-${r.시군구코드}`} value={r.시군구명}>
                    {r.시도명} {r.시군구명} ({r.종합_취약도_등급}, 인구 {format_number_comma(r.인구수)}명)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 지표별 1:1 비교 그리드 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* 응급 60분 미도달율 */}
            <div className="bg-[#f5f5f7] p-3.5 rounded-2.5xl border border-black/[0.03]">
              <span className="text-[#86868b] text-[11px]">응급 60분 미도달 인구비율</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-sm font-bold text-[#0071e3]">{selected_region.응급_60분_미도달_인구비율}%</span>
                <span className="text-xs text-[#86868b]">vs</span>
                <span className="text-sm font-bold text-[#ff9500]">{region_comparison.지역B.응급_60분_미도달_인구비율}%</span>
              </div>
              <div className="text-[10px] text-[#86868b] mt-1 pt-1 border-t border-black/[0.04]">
                격차: {region_comparison.응급_미도달_격차 > 0 ? `+${region_comparison.응급_미도달_격차}%p` : `${region_comparison.응급_미도달_격차}%p`}
              </div>
            </div>

            {/* 관내 응급이용률(RI) */}
            <div className="bg-[#f5f5f7] p-3.5 rounded-2.5xl border border-black/[0.03]">
              <span className="text-[#86868b] text-[11px]">관내 응급이용률 (RI)</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-sm font-bold text-[#0071e3]">{selected_region.관내_응급_의료이용률}%</span>
                <span className="text-xs text-[#86868b]">vs</span>
                <span className="text-sm font-bold text-[#ff9500]">{region_comparison.지역B.관내_응급_의료이용률}%</span>
              </div>
              <div className="text-[10px] text-[#86868b] mt-1 pt-1 border-t border-black/[0.04]">
                격차: {region_comparison.응급_RI_격차 > 0 ? `+${region_comparison.응급_RI_격차}%p` : `${region_comparison.응급_RI_격차}%p`}
              </div>
            </div>

            {/* 소아 병상공급비율 */}
            <div className="bg-[#f5f5f7] p-3.5 rounded-2.5xl border border-black/[0.03]">
              <span className="text-[#86868b] text-[11px]">소아 병상 공급비율</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-sm font-bold text-[#0071e3]">{selected_region.소아_병상_공급비율 === null ? '자료 없음' : `${selected_region.소아_병상_공급비율}%`}</span>
                <span className="text-xs text-[#86868b]">vs</span>
                <span className="text-sm font-bold text-[#ff9500]">{region_comparison.지역B.소아_병상_공급비율 === null ? '자료 없음' : `${region_comparison.지역B.소아_병상_공급비율}%`}</span>
              </div>
              <div className="text-[10px] text-[#86868b] mt-1 pt-1 border-t border-black/[0.04]">
                격차: {region_comparison.소아_병상_격차 === null ? '산출 불가 (자료 없음)' : region_comparison.소아_병상_격차 > 0 ? `+${region_comparison.소아_병상_격차}%p` : `${region_comparison.소아_병상_격차}%p`}
              </div>
            </div>
          </div>

          {/* 시사점 카드 */}
          <div className="bg-[#f5f5f7] p-4 rounded-2.5xl border border-black/[0.04] text-xs space-y-1.5">
            <div className="font-bold text-[#1d1d1f] flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#0071e3]" />
              <span>지역 간 필수의료 자원 격차 시사점</span>
            </div>
            <p className="text-[#48484a] leading-relaxed pl-5">
              {region_comparison.종합_비교_시사점}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
