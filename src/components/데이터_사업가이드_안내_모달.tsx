'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  BookOpen,
  Database,
  FileText,
  Calculator,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Layers,
  Activity,
  Compass,
  Building2,
  TrendingUp,
  AlertTriangle,
  Award,
  Sparkles,
  ArrowRight,
  Info,
  UserCheck,
  HeartPulse,
} from 'lucide-react';
import { 메뉴_아이디 } from './메인_사이드바_네비게이션';

interface 데이터_사업가이드_안내_모달_속성 {
  is_open: boolean;
  on_close: () => void;
  on_navigate?: (menu: string) => void;
}

export const 데이터_사업가이드_안내_모달: React.FC<데이터_사업가이드_안내_모달_속성> = ({
  is_open,
  on_close,
  on_navigate,
}) => {
  const [active_tab, setActive_tab] = useState<'datasets' | 'guidelines' | 'formulas'>('datasets');

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handle_keydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && is_open) {
        on_close();
      }
    };
    window.addEventListener('keydown', handle_keydown);
    return () => window.removeEventListener('keydown', handle_keydown);
  }, [is_open, on_close]);

  if (!is_open) return null;

  const handle_menu_click = (menu_id: string) => {
    on_navigate?.(menu_id);
    on_close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 animate-in fade-in duration-200">
      {/* 배경 오버레이 */}
      <div
        className="absolute inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={on_close}
      />

      {/* 모달 윈도우 본체 (Apple Style) */}
      <div className="relative w-full max-w-5xl max-h-[90vh] bg-white dark:bg-[#12141a] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden z-10">
        {/* ============================================================== */}
        {/* 모달 헤더 */}
        {/* ============================================================== */}
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg md:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                  플랫폼 탑재 데이터셋 &amp; 2026 정부 법정 사업가이드 총람
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  프로그램 데이터·로직 100% 동기화
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                보건복지부 법정 고시, 건강보험심사평가원 신포괄 지침, 국립중앙의료원(NMC) 헬스맵·CP 기준 및 12대 항목 사업계획서 표준
              </p>
            </div>
          </div>

          <button
            onClick={on_close}
            className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ============================================================== */}
        {/* 탭 네비게이션 */}
        {/* ============================================================== */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#12141a] px-6 gap-2 shrink-0">
          <button
            onClick={() => setActive_tab('datasets')}
            className={`flex items-center gap-2 py-3.5 px-4 text-xs md:text-sm font-bold border-b-2 transition-all ${
              active_tab === 'datasets'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Database className="w-4 h-4" />
            1. 탑재 데이터셋 (7대 핵심 자산)
          </button>

          <button
            onClick={() => setActive_tab('guidelines')}
            className={`flex items-center gap-2 py-3.5 px-4 text-xs md:text-sm font-bold border-b-2 transition-all ${
              active_tab === 'guidelines'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            2. 법정 사업가이드 (7대 정부 지침)
          </button>

          <button
            onClick={() => setActive_tab('formulas')}
            className={`flex items-center gap-2 py-3.5 px-4 text-xs md:text-sm font-bold border-b-2 transition-all ${
              active_tab === 'formulas'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Calculator className="w-4 h-4" />
            3. 핵심 산식 &amp; 평가 공식 (5대 산식)
          </button>
        </div>

        {/* ============================================================== */}
        {/* 모달 스크롤 본문 */}
        {/* ============================================================== */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* ============================================================ */}
          {/* 탭 1: 탑재 데이터셋 (7대 핵심 자산) */}
          {/* ============================================================ */}
          {active_tab === 'datasets' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40 text-xs text-blue-950 dark:text-blue-200 leading-relaxed">
                💡 <strong>데이터 정합성 안내:</strong> 프로그램에서 실제로 취급하고 있는 데이터셋의 기준과 원천을 투명하게 공개합니다.
                시군구 취약지 진단은 헬스맵 2024년 전국 250개 시군구 데이터(소아 실데이터는 미확보로 판정 제외 및 응급·분만 재정규화)이며,
                환자 유출입(OD Matrix)은 원천 72.6MB 엑셀 전수 분석 기반 228개 시군구 데이터셋입니다.
                공공의료기관 전수 DB는 214개소이며, 국립중앙의료원 E-Gen 응급기관 528개소, 심평원 분만가능 기관(2025.1~2026.4 청구실적), NMC 달빛어린이병원 114곳이 연계되어 있습니다.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1) 시군구 필수의료 DB (헬스맵 2024, 250개 시군구) */}
                <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                      <Compass className="w-4 h-4" /> 데이터셋 1
                    </span>
                    <button
                      onClick={() => handle_menu_click('gis_map')}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      01 진단지도 보기 <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    시군구 필수의료 진단 데이터셋 (헬스맵 2024년, 250개 시군구 전수)
                  </h4>
                  <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 list-disc list-inside">
                    <li>인구수 지표 (ABA01)</li>
                    <li>응급의료: 권역응급 60분 취약인구율(BBB01), 응급의료기관 관내이용률(RI, CBB04)</li>
                    <li>분만: 분만기관 60분 취약인구율(BBD01), 분만 관내이용률(RI, CBD01)</li>
                    <li>소아청소년: 실데이터 미확보(null)로 <strong>판정 제외 및 가중치(0.4:0.35) 재정규화</strong></li>
                    <li>종합 취약도 점수(0~100) 및 4단계 등급(정상/관찰/취약/심각) 자동 산정</li>
                  </ul>
                </div>

                {/* 2) 전국 70개 중진료권 공간 DB */}
                <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-teal-600 dark:text-teal-400 flex items-center gap-1.5">
                      <Layers className="w-4 h-4" /> 데이터셋 2
                    </span>
                    <button
                      onClick={() => handle_menu_click('gis_map')}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400"
                    >
                      중진료권 지도 보기 <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    전국 70개 중진료권 공간 경계 및 책임의료기관 네트워크
                  </h4>
                  <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 list-disc list-inside">
                    <li>전국 70개 중진료권 및 17개 시도 산하 시군구 매핑 체계</li>
                    <li>내장 공공의료기관 전수 DB 기준 권역 그룹 19개소 · 지역 그룹 49개소</li>
                    <li>권역 내 필수의료 연계·협력 네트워크 관할 구역 정보 제공</li>
                  </ul>
                </div>

                {/* 3) 환자 의료이용 유출입 OD Matrix */}
                <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                      <Activity className="w-4 h-4" /> 데이터셋 3
                    </span>
                    <button
                      onClick={() => handle_menu_click('compare_1to1')}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400"
                    >
                      02 1:1 비교 보기 <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    환자 의료이용 유출입 실데이터 (OD Matrix, 228개 시군구)
                  </h4>
                  <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 list-disc list-inside">
                    <li>원천 72.6MB 엑셀(의료이용+유출입 데이터 2019-2024 중 2024년) 전수 분석</li>
                    <li>시군구별 자체충족률(RI), 관외유출(Outflow), 유입(Inflow)</li>
                    <li>필수의료 4대 핵심 분야: 투석, 응급, 분만, 중환자</li>
                    <li>관외 유출 상위 목적지 시군구 및 진료일수 점유율 매트릭스</li>
                  </ul>
                </div>

                {/* 4) 전국 214개 공공병원 전수 DB & 시뮬레이터 */}
                <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                      <Building2 className="w-4 h-4" /> 데이터셋 4
                    </span>
                    <button
                      onClick={() => handle_menu_click('policy_incentive')}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400"
                    >
                      공공병원 시뮬레이터 <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    전국 214개 공공의료기관 전수 DB &amp; 4대 규모별 정책가산 시뮬레이터
                  </h4>
                  <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 list-disc list-inside">
                    <li>국립대병원, 지방의료원, 적십자병원, 특수공공병원 214개소 전수 수록</li>
                    <li>4대 병상 규모(500병상 초과, 300병상 초과, 300병상 이하, 병원급) 분류</li>
                    <li>신포괄 정책가산(최대 1.0%) 및 지역거점 공공병원 운영평가 1.1.8 산출</li>
                    <li>기관별 신포괄 진료비 입력에 따른 실시간 추가 수가 가산액 시뮬레이션</li>
                  </ul>
                </div>

                {/* 5) 공공의료 71개 CP 전수 임상 DB */}
                <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                      <FileText className="w-4 h-4" /> 데이터셋 5
                    </span>
                    <button
                      onClick={() => handle_menu_click('cp_library')}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400"
                    >
                      71개 CP 라이브러리 <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    공공의료 71개 표준진료지침(CP) 스마트 라이브러리
                  </h4>
                  <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 list-disc list-inside">
                    <li>NMC 부록 1 기준 11개 진료과목 전수 질환(71개 CP) 수록</li>
                    <li>K-DRG 질병군 분류 코드 100% 매핑 및 심평원 정상군 표준 재원일수</li>
                    <li>5단계 다학제 Order Set (의사 오더 vs 간호 활동 분리)</li>
                    <li>유형별 Branch CP (소아/일반, 단측/양측, 동반질환군 등) 분기 경로</li>
                  </ul>
                </div>

                {/* 6) 3대 변이 15개 사유 & 10대 질환 ROI */}
                <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4" /> 데이터셋 6
                    </span>
                    <button
                      onClick={() => handle_menu_click('cp_variance')}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400"
                    >
                      변이분석 &amp; ROI <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    3대 변이(Variance) 15개 사유 &amp; 10대 질환 ROI 분석 모델
                  </h4>
                  <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 list-disc list-inside">
                    <li>환자(5개), 의료진(5개), 병원 시스템(5개) 15개 표준 변이 사유 DB</li>
                    <li>10대 대표 질환군별 가변 점유율(평균 약 환자 43%, 의료진 32%, 시스템 25%)</li>
                    <li>비CP vs CP표준 vs 이탈군 4단 정밀 대조 및 재원일수 단축(-1.8일) 통계</li>
                    <li>병상 회전 신규 수익 창출 및 Outlier 삭감 예방 ROI 알고리즘</li>
                  </ul>
                </div>

                {/* 7) 전국 응급·분만·소아 안심 인프라 DB */}
                <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/30 space-y-3 md:col-span-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                      <HeartPulse className="w-4 h-4" /> 데이터셋 7
                    </span>
                    <button
                      onClick={() => handle_menu_click('citizen_view')}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400"
                    >
                      국민안심 서비스 뷰 <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    전국 응급·분만·소아 안심 의료인프라 DB (실데이터 전수 연계)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600 dark:text-slate-300 pt-1">
                    <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                      <strong className="text-slate-900 dark:text-white block mb-1">응급의료기관 (528개소)</strong>
                      국립중앙의료원 E-Gen 공식 수집, 권역·지역응급센터 및 기관 전수 좌표·연락처 수록 (선택: 공공데이터포털 실시간 가용병상 API 연동)
                    </div>
                    <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                      <strong className="text-slate-900 dark:text-white block mb-1">분만가능 의료기관</strong>
                      건강보험심사평가원(HIRA) 분만 청구 실적(2025.1~2026.4, 공공누리 제1유형) 기반 전수 목록 및 24시간 분만 가능 여부
                    </div>
                    <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                      <strong className="text-slate-900 dark:text-white block mb-1">달빛어린이병원 (114곳)</strong>
                      국립중앙의료원 공식 등록 소아 야간·휴일 진료기관 전수 목록, 운영시간 및 인근 진료망 매핑
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* 탭 2: 법정 사업가이드 (7대 정부 지침) */}
          {/* ============================================================ */}
          {active_tab === 'guidelines' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 text-xs text-emerald-950 dark:text-emerald-200 leading-relaxed">
                ⚖️ <strong>법적 근거 및 정책 정합성 (7대 정부 공식 지침):</strong> 본 플랫폼의 진단 규칙, 시뮬레이션 알고리즘, 사업계획서 12대 필수 항목은 아래 7대 법령·지침을 100% 반영하여 구축되었습니다.
              </div>

              <div className="space-y-4">
                {/* 1) 복지부 의료취약지 지정 고시 */}
                <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                      지침 1 · 보건복지부 고시
                    </span>
                    <span className="text-xs text-slate-400">보건복지부고시 제2024-261호</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    보건복지부 고시 「응급의료분야 의료취약지 지정」(제2024-261호) &amp; 「공공보건의료에 관한 법률」 제12조
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    • <strong>응급취약지:</strong> 응급의료기관 30분 또는 응급의료센터 1시간 내 도달 불가 인구 30% 이상 (보건복지부 고시 기준). 플랫폼에서는 관내이용률(RI) 30% 미만도 자체충족 결핍 판정 기준으로 복합 적용.<br />
                    • <strong>분만취약지:</strong> 60분 내 분만의료 이용률 30% 미만 및 접근 불가 인구 30% 이상 (둘 다 충족 시 A등급, 하나 충족 시 B등급). 분만산부인과 설치 시 시설·장비비 10억원 + 운영비 연 5억원 지원. 플랫폼은 관내 분만율 40% 미만을 대리 지표로 분석.<br />
                    • <strong>소아취약지:</strong> 소아청소년과 지표는 원천데이터 실데이터 미확보로 진단 판정에서 제외하고 응급·분만 가중치(0.4:0.35)로 재정규화하여 왜곡을 원천 방지함.
                  </p>
                </div>

                {/* 2) 심평원 2026 신포괄지불제도 시범사업 지침 */}
                <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      지침 2 · 건강보험심사평가원 지침
                    </span>
                    <span className="text-xs text-slate-400">별표 3 「정책가산평가 지침」</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    「2026 신포괄지불제도 시범사업 지침 (2026.1 개정)」
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    • <strong>1.0% 정책가산율:</strong> 의료의 질 영역(9.5%) 중 CP 운영 배점 최대 1.0% 정책가산 부여.<br />
                    • <strong>추가 재정 지원 공식:</strong> 연간 신포괄 진료비 × (가산율 / 100). (예: 연 250억 원 × 1.0% = 연 2억 5,000만 원 추가 재정 확보).<br />
                    • <strong>K-DRG 정상군 관리:</strong> 기준 재원일수 초과 시 정액수가 삭감 및 비포괄 전환 방지 체계.
                  </p>
                </div>

                {/* 3) 공공병원 운영평가 편람 1.1.8 */}
                <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                      지침 3 · 보건복지부 평가 편람
                    </span>
                    <span className="text-xs text-slate-400">지표 1.1.8 [표준진료지침 운영]</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    「지역거점 공공병원 운영평가 편람 (100점 만점 구조)」
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    • <strong>㉠ 개발 체계 (50점):</strong> 16개 공문서 점검 (300병상 초과 전담인력 1명 필수, 유형별 Branch CP 개발, CP위원회 회의록 등).<br />
                    • <strong>㉡ 적용 및 운영 (50점):</strong> 병상 규모별 최소 운영(20점) + 질환별 적용(10점) + 관리율(5점, 85% 이상) + 5대 모니터링(15점).<br />
                    • <strong>신포괄 연계 득점 구간:</strong> 90점 이상 ➔ 1.0%, 80~89점 ➔ 0.8%, 70~79점 ➔ 0.6%, 60~69점 ➔ 0.4%, 60점 미만 ➔ 0.0%.
                  </p>
                </div>

                {/* 4) NMC 2026 CP 가이드라인 */}
                <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                      지침 4 · 국립중앙의료원(NMC) 안내서
                    </span>
                    <span className="text-xs text-slate-400">제3장~제4장 변이 관리 체계</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    「2026 공공의료 표준진료지침(CP) 개발 및 보급 사업 안내서」
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    • <strong>변이(Variance) 규격:</strong> 환자/의료진/시스템 3대 영역 15대 세부 코드 표준 분류 및 EMR 모니터링 체계.<br />
                    • <strong>경영 개선 효과 (ROI):</strong> 재원일수 단축에 따른 병상 회전율 증대 및 직접 진료비 절감 실시간 산출 알고리즘 적용.
                  </p>
                </div>

                {/* 5) 복지부 공모 표준 12대 필수 항목 사업계획서 서식 */}
                <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                      지침 5 · 보건복지부 공모 표준
                    </span>
                    <span className="text-xs text-slate-400">Section 19 표준 사업계획서</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    「보건복지부 공공보건의료 기능보강 및 책임의료계획 12대 필수 항목 사업계획서」
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    • <strong>12대 필수 목차 완비:</strong> ① 사업명, ② 사업목표, ③ 사업배경, ④ 지역현황, ⑤ 핵심 문제점, ⑥ 추진전략, ⑦ 세부사업, ⑧ 추진체계, ⑨ 소요예산, ⑩ 핵심 성과지표(KPI), ⑪ 추진일정, ⑫ 기대효과.<br />
                    • <strong>플랫폼 제공 기능:</strong> AI 기반 맞춤 초안 생성, 직접 수정/편집 폼, 브라우저 로컬 스토리지 임시저장, A4 규격 인쇄, HWPX 한글 공문서 다운로드 연계 지원.<br />
                    • <strong>환각 방지 원칙:</strong> 법정 산출근거 없는 예산·인력 수치는 임의 생성하지 않고 &apos;직접 입력 필요&apos;로 안내.
                  </p>
                </div>

                {/* 6) 보건복지부 파견인력 지원사업 */}
                <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300">
                      지침 6 · 보건복지부 사업안내
                    </span>
                    <span className="text-xs text-slate-400">의사인력 확충 정책</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    「공공병원 파견 의료인력 인건비 지원사업」 &amp; 「국립대병원 공공임상교수제」
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    • <strong>파견의사 인건비 국고 지원:</strong> 지방의료원·적십자병원 등 공공병원이 대학병원과 협약하여 파견받은 의료인력 인건비의 <strong>50% 국고 지원</strong> (1인당 최대 1.5억 원 한도).<br />
                    • <strong>공공임상교수제:</strong> 국립대병원 소속 정규 교원으로 임용되어 지방의료원 등 필수의료 현장에 상주 순환 배치되는 전문 의료인력 지원 체계.
                  </p>
                </div>

                {/* 7) 급성기 환자 퇴원지원 시범사업 */}
                <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                      지침 7 · 보건복지부·심평원 시범사업
                    </span>
                    <span className="text-xs text-slate-400">제2단계 시범사업 지침</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    「급성기 환자 퇴원지원 및 지역사회 연계활동 시범사업」
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    • <strong>4단계 표준 프로세스:</strong> 입원 조기 스크리닝 환자평가 ➔ 다학제 심층 케어플랜 수립 ➔ 지역사회 연계(보건소·장기요양·방문간호) ➔ 퇴원 후 정기 모니터링.<br />
                    • <strong>수가 보상 체계:</strong> 통합퇴원계획관리료, 지역사회연계관리료 및 퇴원 환자 재입원 방지 성과 지표 연계.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* 탭 3: 핵심 산식 & 평가 공식 (5대 산식) */}
          {/* ============================================================ */}
          {active_tab === 'formulas' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-200/60 dark:border-indigo-900/40 text-xs text-indigo-950 dark:text-indigo-200 leading-relaxed">
                🔢 <strong>공식 산식 일람 (5대 핵심 공식):</strong> 플랫폼에 내장된 취약도 판정, 정책가산 및 ROI 계산 공식입니다. 프로그램은 아래 수식에 따라 실시간으로 연산하여 시각화합니다.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 공식 1: 필수의료 3대 취약지 판정 & 종합 취약도 점수 */}
                <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 space-y-2 md:col-span-2">
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400 block">
                    [산식 1] 필수의료 3대 취약 판정 및 종합 취약도 점수·등급 공식
                  </span>
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 font-mono text-xs font-bold text-slate-800 dark:text-slate-200 space-y-1">
                    <div>• 응급 취약: 60분 미도달인구율 ≥ 30% OR 관내이용률(RI) &lt; 30%</div>
                    <div>• 분만 취약: 60분 미도달인구율 ≥ 30% OR 관내분만율 &lt; 40%</div>
                    <div>• 종합 취약도 점수 = (응급점수 × 0.4 + 분만점수 × 0.35) / 0.75 (소아 지표 부재 시 정규화)</div>
                    <div>• 4단계 등급: 심각(취약분야 3개 OR 점수≥65), 취약(취약분야 2개 OR 점수≥45), 관찰(취약분야 1개 OR 점수≥25), 정상(그 외)</div>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    원천: 헬스맵 2024년 전국 250개 시군구 진단 데이터셋 및 법정 취약지 지정 기준
                  </p>
                </div>

                {/* 공식 2: 신포괄 추가 수가 지급액 */}
                <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 space-y-2">
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 block">
                    [산식 2] 신포괄 정책가산 추가 수가액
                  </span>
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                    연간 추가 수가 = 연간 신포괄 진료비 × (정책가산율 / 100)
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    계산 예시: 연간 진료비 250억 원 × 정책가산율 1.0% = <strong>연 2억 5,000만 원</strong>
                  </p>
                </div>

                {/* 공식 3: 운영평가 1.1.8 100점 만점 */}
                <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 space-y-2">
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400 block">
                    [산식 3] 공공병원 운영평가 1.1.8 환산 득점
                  </span>
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                    종합 점수 = 개발체계(50점) + 병상적용(20점) + 질환적용(10점) + 관리율(5점) + 모니터링(15점)
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    개발 16개 항목(각 3.125점), 관리율(85% 이상 5점), 5개 모니터링(질환당 3점)
                  </p>
                </div>

                {/* 공식 4: 병원 경영 ROI (총 재정 기여도) */}
                <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 space-y-2">
                  <span className="text-xs font-bold text-purple-600 dark:text-purple-400 block">
                    [산식 4] CP 연간 총 재정 기여도 (ROI)
                  </span>
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                    총 재정효과 = 직접 진료비 절감액 + 병상회전 신규 진료수익 + Outlier 삭감 예방액
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    결과는 병원별 입력값(재원일수 단축일, 신규 환자 유치율, 마진율)에 따라 실시간 산출
                  </p>
                </div>

                {/* 공식 5: 자체충족률 (Relevance Index, RI) */}
                <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 space-y-2">
                  <span className="text-xs font-bold text-rose-600 dark:text-rose-400 block">
                    [산식 5] 필수의료 자체충족률 (RI)
                  </span>
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                    RI (%) = (관내 거주자의 관내 의료이용 건수 / 관내 거주자의 총 의료이용 건수) × 100
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    자체충족률 30% 미만 시 의료공백 취약지역으로 판정 및 거점의료기관 기능보강 우선 지원
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ============================================================== */}
        {/* 모달 하단 푸터 바 */}
        {/* ============================================================== */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Info className="w-4 h-4 text-blue-500" />
            <span>플랫폼 데이터 및 산출공식 100% 동기화 검증 완료 (2026.09 기준)</span>
          </div>

          <button
            onClick={on_close}
            className="px-5 py-2 rounded-xl text-xs md:text-sm font-semibold bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 transition shadow-sm"
          >
            확인 및 닫기
          </button>
        </div>
      </div>
    </div>
  );
};
