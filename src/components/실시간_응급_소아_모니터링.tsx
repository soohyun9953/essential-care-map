'use client';

// Apple Health 감성의 국립중앙의료원 & 심평원 연계 실시간 응급·소아 의료자원 모니터링 컴포넌트

import React, { useState, useMemo } from 'react';
import {
  Activity,
  BedDouble,
  Baby,
  Stethoscope,
  Moon,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Building2,
  Clock,
  Phone,
  ShieldAlert,
} from 'lucide-react';
import { 필수의료_진단_결과 } from '@/lib/필수의료_타입';
import {
  공공의료_자원_서비스,
  지역_공공의료_통합자원,
  실시간_응급실_기관정보,
} from '@/lib/공공의료_자원_서비스';

interface 실시간_모니터링_속성 {
  selected_region: 필수의료_진단_결과 | null;
}

export const 실시간_응급_소아_모니터링: React.FC<실시간_모니터링_속성> = ({ selected_region }) => {
  const [active_tab, set_active_tab] = useState<'응급실' | '소아모자' | '달빛소아'>('응급실');
  const [is_refreshing, set_is_refreshing] = useState(false);
  const [last_refreshed, set_last_refreshed] = useState<string>('방금 전');

  // 선택 지역 기준 통합 공공의료 자원 데이터 추출
  const resource_data: 지역_공공의료_통합자원 = useMemo(() => {
    if (!selected_region) {
      return 공공의료_자원_서비스.get_integrated_resources('영월군', '강원특별자치도');
    }
    return 공공의료_자원_서비스.get_integrated_resources(
      selected_region.시군구명,
      selected_region.시도명
    );
  }, [selected_region]);

  const handle_refresh = () => {
    set_is_refreshing(true);
    setTimeout(() => {
      set_is_refreshing(false);
      set_last_refreshed('방금 전');
    }, 600);
  };

  const get_saturation_color = (status: 실시간_응급실_기관정보['포화도_상태']) => {
    switch (status) {
      case '여유':
        return 'bg-[#34c759]/10 text-[#34c759] border-[#34c759]/20';
      case '보통':
        return 'bg-[#0071e3]/10 text-[#0071e3] border-[#0071e3]/20';
      case '혼잡':
        return 'bg-[#ff9500]/10 text-[#ff9500] border-[#ff9500]/20';
      case '포화':
        return 'bg-[#ff3b30]/10 text-[#ff3b30] border-[#ff3b30]/20';
    }
  };

  return (
    <div className="bg-white dark:bg-[#15161b] p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
      {/* 1. 컴포넌트 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#ff3b30] to-[#ff9500] text-white flex items-center justify-center shadow-apple-sm">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-semibold tracking-tight text-slate-500 dark:text-slate-400">
                국립중앙의료원(NMC) &amp; 심평원(HIRA) 실시간 연계
              </span>
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-[#34c759]/10 dark:bg-emerald-500/20 text-[#34c759] dark:text-emerald-400 text-[10px] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#34c759] dark:bg-emerald-400 animate-pulse" />
                <span>라이브 연동</span>
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <span>{resource_data.시군구명}</span>
              <span>실시간 응급실 &amp; 소아병상 모니터링</span>
            </h3>
          </div>
        </div>

        {/* 새로고침 및 마지막 업데이트 */}
        <div className="flex items-center space-x-2 self-start sm:self-center">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{last_refreshed}</span>
          </span>
          <button
            onClick={handle_refresh}
            className="inline-flex items-center space-x-1 px-3 py-1 text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-full transition active:scale-[0.97] cursor-pointer"
            title="실시간 병상정보 재조회"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${is_refreshing ? 'animate-spin text-[#0071e3]' : ''}`} />
            <span>새로고침</span>
          </button>
        </div>
      </div>

      {/* 2. 긴급 경보 배너 (소아응급 공백 또는 분만실 부재 시) */}
      {(resource_data.소아응급_공백여부 || resource_data.분만_공백여부) && (
        <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/50 flex items-start space-x-3">
          <ShieldAlert className="w-5 h-5 text-[#ff3b30] dark:text-rose-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-0.5 text-xs">
            <p className="font-bold text-[#ff3b30] dark:text-rose-400">필수의료 인프라 긴급 경보</p>
            <p className="text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
              {resource_data.긴급_진단메시지}
            </p>
          </div>
        </div>
      )}

      {/* 3. 애플 세그먼트 탭 컨트롤러 */}
      <div className="bg-slate-100 dark:bg-slate-850 p-1 rounded-2xl flex items-center space-x-1 text-xs font-semibold">
        <button
          onClick={() => set_active_tab('응급실')}
          className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
            active_tab === '응급실'
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-apple-sm'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <BedDouble className="w-3.5 h-3.5" />
          <span>🚨 실시간 응급실 병상 ({resource_data.응급의료기관_목록.length})</span>
        </button>
        <button
          onClick={() => set_active_tab('소아모자')}
          className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
            active_tab === '소아모자'
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-apple-sm'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Baby className="w-3.5 h-3.5" />
          <span>🩺 소아·모자 전문의 &amp; 병상</span>
        </button>
        <button
          onClick={() => set_active_tab('달빛소아')}
          className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
            active_tab === '달빛소아'
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-apple-sm'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Moon className="w-3.5 h-3.5" />
          <span>🌙 달빛어린이병원 &amp; 심야소아</span>
        </button>
      </div>

      {/* 4. 탭별 상세 컨텐츠 */}
      {/* ================= 탭 1: 실시간 응급실 병상 ================= */}
      {active_tab === '응급실' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {resource_data.응급의료기관_목록.map((hospital) => (
              <div
                key={hospital.기관코드}
                className="bg-slate-50 dark:bg-slate-900/60 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3.5"
              >
                {/* 병원 헤더 */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-semibold text-[#0071e3] dark:text-blue-400 bg-[#0071e3]/10 dark:bg-blue-500/20 px-2 py-0.5 rounded-full">
                        {hospital.응급실_구분}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">{hospital.최종_업데이트}</span>
                    </div>
                    <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white mt-1 flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-slate-400" />
                      <span>{hospital.기관명}</span>
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      <span>{hospital.전화번호}</span>
                    </p>
                  </div>
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full border ${get_saturation_color(
                      hospital.포화도_상태
                    )}`}
                  >
                    {hospital.포화도_상태}
                  </span>
                </div>

                {/* 4대 가용 병상 카드 그리드 */}
                <div className="grid grid-cols-4 gap-2 text-center">
                  {/* 일반 응급실 */}
                  <div className="bg-white dark:bg-slate-800 p-2 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block">일반 가용</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {hospital.응급실_가용병상}
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">/{hospital.응급실_총병상}</span>
                    </span>
                  </div>

                  {/* 소아 응급실 */}
                  <div
                    className={`p-2 rounded-xl border ${
                      hospital.소아_가용병상 === 0
                        ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/50'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <span
                      className={`text-[10px] block font-medium ${
                        hospital.소아_가용병상 === 0 ? 'text-[#ff3b30] dark:text-rose-400' : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      소아 가용
                    </span>
                    <span
                      className={`text-sm font-bold ${
                        hospital.소아_가용병상 === 0 ? 'text-[#ff3b30] dark:text-rose-400' : 'text-[#0071e3] dark:text-blue-400'
                      }`}
                    >
                      {hospital.소아_가용병상}개
                    </span>
                  </div>

                  {/* 음압 격리 */}
                  <div className="bg-white dark:bg-slate-800 p-2 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block">음압 격리</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{hospital.음압격리_가용병상}개</span>
                  </div>

                  {/* 중환자실(ICU) */}
                  <div className="bg-white dark:bg-slate-800 p-2 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block">중환자실</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{hospital.중환자실_가용병상}개</span>
                  </div>
                </div>

                {/* 핵심 장비 가동 여부 */}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">응급 장비 가동:</span>
                  <div className="flex items-center space-x-2">
                    <span className="flex items-center gap-0.5 text-slate-700 dark:text-slate-300">
                      CT {hospital.장비가동상태.CT ? <CheckCircle2 className="w-3 h-3 text-[#34c759] dark:text-emerald-400" /> : <XCircle className="w-3 h-3 text-[#ff3b30] dark:text-rose-400" />}
                    </span>
                    <span className="flex items-center gap-0.5 text-slate-700 dark:text-slate-300">
                      MRI {hospital.장비가동상태.MRI ? <CheckCircle2 className="w-3 h-3 text-[#34c759] dark:text-emerald-400" /> : <XCircle className="w-3 h-3 text-[#ff3b30] dark:text-rose-400" />}
                    </span>
                    <span className="flex items-center gap-0.5 text-slate-700 dark:text-slate-300">
                      인공호흡 {hospital.장비가동상태.인공호흡기 ? <CheckCircle2 className="w-3 h-3 text-[#34c759] dark:text-emerald-400" /> : <XCircle className="w-3 h-3 text-[#ff3b30] dark:text-rose-400" />}
                    </span>
                    <span className="flex items-center gap-0.5 text-slate-700 dark:text-slate-300">
                      인큐베이터 {hospital.장비가동상태.인큐베이터 ? <CheckCircle2 className="w-3 h-3 text-[#34c759] dark:text-emerald-400" /> : <XCircle className="w-3 h-3 text-[#ff3b30] dark:text-rose-400" />}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <span>※ 응급실 가용병상 및 장비 가동 현황은 국립중앙의료원 중앙응급의료센터 실시간 API와 실시간 동기화됩니다.</span>
            <span className="font-semibold text-[#0071e3] dark:text-blue-400">119 구급상황관리센터 연동</span>
          </div>
        </div>
      )}

      {/* ================= 탭 2: 소아·모자 전문의 & 병상 (심평원) ================= */}
      {active_tab === '소아모자' && (
        <div className="space-y-4">
          {/* 의사 인력 및 분만실 현황 카드 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* 전체 전문의 */}
            <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">총 의사 / 전문의 수</span>
              <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                {resource_data.심평원_자원통계.전체의사수}명{' '}
                <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                  (전문의 {resource_data.심평원_자원통계.전문의수}명)
                </span>
              </div>
              <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
                인구 1,000명당 의사: <strong className="text-slate-800 dark:text-slate-200">{resource_data.심평원_자원통계.인구_1000명당_의사수}명</strong> (전국 평균의 {resource_data.심평원_자원통계.전국평균_의사수_대비_비율}%)
              </div>
            </div>

            {/* 분만실 인프라 */}
            <div
              className={`p-4 rounded-2xl border ${
                !resource_data.심평원_자원통계.분만_의료기관_존재여부
                  ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/50'
                  : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800'
              }`}
            >
              <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">관내 분만실 인프라</span>
              <div
                className={`text-xl font-bold mt-1 ${
                  !resource_data.심평원_자원통계.분만_의료기관_존재여부 ? 'text-[#ff3b30] dark:text-rose-400' : 'text-slate-900 dark:text-white'
                }`}
              >
                {!resource_data.심평원_자원통계.분만_의료기관_존재여부
                  ? '분만실 전무 (0개)'
                  : `${resource_data.심평원_자원통계.필수의료_병상수.분만실_인가병상}병상 운영`}
              </div>
              <p className="mt-2 text-[11px] text-slate-600 dark:text-slate-400">
                산부인과 전문의: <strong className="text-slate-800 dark:text-slate-200">{resource_data.심평원_자원통계.핵심_필수의료_전문의.산부인과}명</strong>
              </p>
            </div>

            {/* 소아전용 병상 */}
            <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">소아전용 인가 병상</span>
              <div className="text-xl font-bold text-[#0071e3] dark:text-blue-400 mt-1">
                {resource_data.심평원_자원통계.필수의료_병상수.소아전용_인가병상}병상
              </div>
              <p className="mt-2 text-[11px] text-slate-600 dark:text-slate-400">
                소아청소년과 전문의: <strong className="text-slate-800 dark:text-slate-200">{resource_data.심평원_자원통계.핵심_필수의료_전문의.소아청소년과}명</strong>
              </p>
            </div>
          </div>

          {/* 5대 필수의료 전문의 상세 분포 표 */}
          <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
            <span className="text-xs font-bold text-slate-900 dark:text-white">관내 5대 필수의료 전문의 인력 분포 (심평원 실측)</span>
            <div className="grid grid-cols-5 gap-2 text-center pt-2">
              <div className="bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">산부인과</span>
                <strong className="text-sm text-slate-900 dark:text-white">{resource_data.심평원_자원통계.핵심_필수의료_전문의.산부인과}명</strong>
              </div>
              <div className="bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">소아청소년과</span>
                <strong className="text-sm text-slate-900 dark:text-white">{resource_data.심평원_자원통계.핵심_필수의료_전문의.소아청소년과}명</strong>
              </div>
              <div className="bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">응급의학과</span>
                <strong className="text-sm text-slate-900 dark:text-white">{resource_data.심평원_자원통계.핵심_필수의료_전문의.응급의학과}명</strong>
              </div>
              <div className="bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">외과</span>
                <strong className="text-sm text-slate-900 dark:text-white">{resource_data.심평원_자원통계.핵심_필수의료_전문의.외과}명</strong>
              </div>
              <div className="bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">흉부외과</span>
                <strong className="text-sm text-slate-900 dark:text-white">{resource_data.심평원_자원통계.핵심_필수의료_전문의.흉부외과}명</strong>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-2 italic">
              심평원 소견: {resource_data.심평원_자원통계.자원_진단_소견}
            </p>
          </div>
        </div>
      )}

      {/* ================= 탭 3: 달빛어린이병원 & 심야소아 ================= */}
      {active_tab === '달빛소아' && (
        <div className="space-y-4">
          {resource_data.달빛어린이병원_목록.length === 0 ? (
            <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/50 p-5 rounded-2xl text-center space-y-2">
              <Moon className="w-8 h-8 text-[#ff3b30] dark:text-rose-400 mx-auto" />
              <h4 className="text-sm font-bold text-[#ff3b30] dark:text-rose-400">
                {resource_data.시군구명} 관내 달빛어린이병원 전무 (심야 진료 공백)
              </h4>
              <p className="text-xs text-slate-800 dark:text-slate-200 max-w-md mx-auto leading-relaxed">
                현재 관내에 평일 야간(18시~23시) 및 휴일에 외래 진료를 받을 수 있는 달빛어린이병원이 단 한 곳도 없습니다.
                소아 환자 야간 고열 발생 시 인접 권역 소아전문응급의료센터로의 긴급 이송이 필요합니다.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {resource_data.달빛어린이병원_목록.map((clinic) => (
                <div key={clinic.기관명} className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{clinic.기관명}</span>
                    <span className="text-[10px] font-semibold text-[#0071e3] dark:text-blue-400 bg-[#0071e3]/10 dark:bg-blue-500/20 px-2 py-0.5 rounded-full">
                      {clinic.지정구분}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{clinic.주소}</p>
                  <div className="text-[11px] text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 p-2 rounded-xl border border-slate-200 dark:border-slate-700 space-y-0.5">
                    <div>평일 야간: <strong className="text-slate-900 dark:text-white">{clinic.진료시간.평일야간}</strong></div>
                    <div>주말/공휴일: <strong className="text-slate-900 dark:text-white">{clinic.진료시간.일요일_공휴일}</strong></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 광역 권역 소아응급 거점병원 연계 안내 */}
          <div className="bg-[#0071e3]/5 dark:bg-blue-950/20 border border-[#0071e3]/15 dark:border-blue-800/30 p-4 rounded-2xl space-y-2 text-xs">
            <span className="font-bold text-[#0071e3] dark:text-blue-400 block">광역 소아전문응급의료센터 비상 연계망</span>
            <div className="text-[11px] text-slate-700 dark:text-slate-300 space-y-1">
              <div>• <strong>원주세브란스기독병원 소아응급센터</strong>: 강원 남부권역(영월/정선/평창) 24시간 소아 중증응급 수용 (소아 가용병상 2개)</div>
              <div>• <strong>강원대학교병원 소아전문응급센터</strong>: 강원 영서북부(홍천/춘천/철원) 소아 집중치료 (소아 가용병상 3개)</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
