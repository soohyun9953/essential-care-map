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
} from 'lucide-react';
import { 메뉴_아이디 } from './메인_사이드바_네비게이션';

interface 데이터_사업가이드_안내_모달_속성 {
  is_open: boolean;
  on_close: () => void;
  on_navigate?: (menu: 메뉴_아이디) => void;
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

  const handle_menu_click = (menu_id: 메뉴_아이디) => {
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
                  플랫폼 탑재 데이터셋 &amp; 2026 정부 법정 사업가이드
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  2026.09 공식 지침 100% 반영
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                보건복지부 법정 고시, 건강보험심사평가원 신포괄 지침 및 국립중앙의료원(NMC) CP 운영 기준 총람
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
            1. 탑재 데이터셋 (7대 영역)
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
            2. 법정 사업가이드 (5대 정부 지침)
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
            3. 핵심 산식 &amp; 평가 공식
          </button>
        </div>

        {/* ============================================================== */}
        {/* 모달 스크롤 본문 */}
        {/* ============================================================== */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* ============================================================ */}
          {/* 탭 1: 탑재 데이터셋 (7대 영역) */}
          {/* ============================================================ */}
          {active_tab === 'datasets' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40 text-xs text-blue-950 dark:text-blue-200 leading-relaxed">
                💡 <strong>데이터 출처 안내:</strong> 데이터셋마다 출처와 성격이 다릅니다. 환자 유출입(데이터셋 3)은 원천 엑셀 자료에서 추출한 값이고, 공공의료기관 목록·총 병상은 내장 데이터셋(2024년 기준)입니다.
                응급실 운영 여부는 국립중앙의료원 E-Gen 「전국 응급의료기관 목록」(2026-09-25 수집, 528개소)을, 분만 가능 여부는 건강보험심사평가원 「분만가능 의료기관 목록」(2025.1~2026.4 청구 실적, 공공누리 제1유형)을 사용합니다.
                그 밖의 의료기관별 인력·장비·진료 서비스 운영 여부는 기관 유형·규모 기반 <strong>추정치</strong>이며, 시뮬레이터·대시보드의 일부 수치는 <strong>예시 기본값</strong>입니다. 실시간 연계는 공공데이터포털 응급실 API(선택)만 지원합니다.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1) 시군구 필수의료 DB (내장 144개 시군구) */}
                <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                      <Compass className="w-4 h-4" /> 데이터셋 1
                    </span>
                    <button
                      onClick={() => handle_menu_click('gis_map')}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      GIS 헬스맵 보기 <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    시군구 필수의료 지표 데이터셋 (내장 144개 시군구)
                  </h4>
                  <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 list-disc list-inside">
                    <li>인구수</li>
                    <li>응급의료: 60분 미도달율(%), 관내 응급 의료이용률(RI, %)</li>
                    <li>분만취약: 관내 분만율(%), 산부인과 60분 미도달율(%)</li>
                    <li>소아청소년: 필요 병상 대비 공급비율(%), 야간·휴일 접근성 지수</li>
                    <li>종합 취약도 등급(정상/관찰/취약/심각 4단계) 자동 산정</li>
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
                    전국 70개 중진료권 공간 경계 및 책임의료기관
                  </h4>
                  <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 list-disc list-inside">
                    <li>70개 중진료권 및 포함 시군구 매핑</li>
                    <li>내장 공공의료기관 목록 기준 권역 그룹 19개·지역 그룹 49개 기관</li>
                    <li>권역 내 필수의료 연계·협력 네트워크 관할 구역 정보</li>
                  </ul>
                </div>

                {/* 3) 환자 의료이용 유출입 OD Matrix */}
                <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                      <Activity className="w-4 h-4" /> 데이터셋 3
                    </span>
                    <button
                      onClick={() => handle_menu_click('patient_flow')}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400"
                    >
                      유출입 분석 보기 <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    환자 의료이용 유출입 실데이터 (OD Matrix)
                  </h4>
                  <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 list-disc list-inside">
                    <li>시군구별 관내이용(RI), 관외유출(Outflow), 유입(Inflow)</li>
                    <li>필수의료 4개 분야: 투석, 응급, 분만, 중환자</li>
                    <li>관외 유출 상위 목적지 시군구 (원천: 의료이용 유출입 데이터 2019–2024 중 2024년)</li>
                  </ul>
                </div>

                {/* 4) 공공병원 40개 프리셋 */}
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
                    공공병원 40개 병상수·진료비 프리셋 (시뮬레이터용)
                  </h4>
                  <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 list-disc list-inside">
                    <li>지방의료원 34개 + 적십자병원 6개</li>
                    <li>병상 규모별 분류 (500병상 초과, 300~500, 300 이하, 병원급)</li>
                    <li>연간 신포괄 진료비 기본값 (120억 원 ~ 420억 원, 출처 확인 필요)</li>
                    <li>정책가산 시뮬레이터 입력값으로 사용 (수치 조정 가능)</li>
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
                    <li>NMC 부록 1 기준 11개 진료과목 전수 질환 수록</li>
                    <li>K-DRG 질병군 분류 코드 100% 매핑 및 표준 재원일수</li>
                    <li>5단계 다학제 Order Set (의사 오더 vs 간호 활동 정밀 분리)</li>
                    <li>유형별 Branch CP (단순 vs 복합, 소아 vs 일반 등) 분기 경로</li>
                  </ul>
                </div>

                {/* 6) 3대 변이 15개 코드 & 10대 질환 통계 */}
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
                    3대 변이(Variance) 15개 사유 &amp; ROI 시뮬레이션 기본값
                  </h4>
                  <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 list-disc list-inside">
                    <li>환자(43.5%) vs 의료진(32.1%) vs 시스템(24.4%) 15개 세부 코드</li>
                    <li>10대 대표 질환별 기준 vs 비CP vs CP표준 vs 이탈군 4단 비교</li>
                    <li>재원일수 단축(-1.8일), 총진료비 절감, 합병증(-68%) 통계</li>
                  </ul>
                </div>

                {/* 7) 공공데이터포털 응급실 실시간 병상 API (선택 연동) */}
                <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/30 space-y-3 md:col-span-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                      <Activity className="w-4 h-4" /> 데이터셋 7
                    </span>
                    <button
                      onClick={() => handle_menu_click('citizen_view')}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400"
                    >
                      안심 응급실 보기 <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    공공데이터포털 응급실 실시간 가용병상 API (선택 연동)
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    전국 응급의료기관 목록(지정 분류·좌표)은 E-Gen에서 수집한 스냅샷을 내장해 모든 사용자에게 제공합니다. 공공데이터포털 인증키를 등록하면 응급실 가용병상 조회를 추가로 시도하며, 키가 없거나 조회에 실패하면 내장 기준 데이터를 표시하고,
                    기관별 병상·장비(CT·MRI·인공호흡기) 현황의 실시간 동기화는 지원하지 않습니다.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* 탭 2: 법정 사업가이드 (5대 정부 지침) */}
          {/* ============================================================ */}
          {active_tab === 'guidelines' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 text-xs text-emerald-950 dark:text-emerald-200 leading-relaxed">
                ⚖️ <strong>법적 근거 및 정책 정합성:</strong> 본 플랫폼의 진단 규칙과 시뮬레이션 알고리즘은 아래 법령·지침을 참고하여 구현했습니다. 실제 적용 시 세부 기준은 각 원문과 대조해 확인하시기 바랍니다.
              </div>

              <div className="space-y-4">
                {/* 1) 복지부 의료취약지 지정 고시 */}
                <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                      보건복지부 고시
                    </span>
                    <span className="text-xs text-slate-400">제3조(응급의료취약지의 기준)</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    「의료취약지 지정 및 운용 등에 관한 고시」 &amp; 「공공보건의료에 관한 법률」
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    • <strong>응급취약지:</strong> 응급의료기관 30분 또는 응급의료센터 1시간 내 도달 불가 인구 30% 이상 (보건복지부 기준). 플랫폼은 관내이용률(RI) 30% 미만도 추가 진단 기준으로 사용 (원문 미확인).<br />
                    • <strong>분만취약지:</strong> 60분 내 분만의료 이용률 30% 미만 / 접근 불가 인구 30% 이상 (둘 다 A등급, 하나 B등급), 분만산부인과 설치 시 시설·장비비 10억원 + 운영비 연 5억원. 플랫폼은 관내 분만율 40% 미만을 대리 지표로 사용.<br />
                    • <strong>소아취약지:</strong> 플랫폼 진단 기준은 필요 병상 대비 공급 60% 미만 (원문 미확인). 달빛어린이병원 최소 운영시간은 평일 18~23시, 휴일 10~18시.
                  </p>
                </div>

                {/* 2) 심평원 2026 신포괄지불제도 시범사업 지침 */}
                <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      건강보험심사평가원 지침
                    </span>
                    <span className="text-xs text-slate-400">별표 3 「정책가산평가 지침」</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    「2026 신포괄지불제도 시범사업 지침 (2026.1 개정)」
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    • <strong>1.0% 정책가산율:</strong> 의료의 질 영역(9.5%) 중 CP 운영 배점 최대 1.0% 가산.<br />
                    • <strong>추가 재정 지원:</strong> 연간 신포괄 진료비 × (가산율 / 100) (연간 250억 병원 기준 <strong>연 2.5억 원 순증</strong>).<br />
                    • <strong>K-DRG 정상군 관리:</strong> 기준 재원일수 초과 시 정액수가 삭감 및 비포괄 전환 Outlier 방지 체계.
                  </p>
                </div>

                {/* 3) 공공병원 운영평가 편람 1.1.8 */}
                <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                      보건복지부 평가 편람
                    </span>
                    <span className="text-xs text-slate-400">지표 1.1.8 [표준진료지침 운영]</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    「지역거점 공공병원 운영평가 편람 (100점 만점 구조)」
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    • <strong>㉠ 개발 체계 (50점):</strong> 16개 공문서 점검 (300병상 초과 전담인력 1명, Branch CP 개발, CP위원회 회의록 등).<br />
                    • <strong>㉡ 적용 및 운영 (50점):</strong> 병상별 적용(20점) + 질환별 적용(10점, 70%↑/80%↑) + 관리율(5점, 85%↑) + 5대 모니터링(15점).<br />
                    • <strong>신포괄 연계:</strong> 90점 이상 ➔ 1.0%, 80~89점 ➔ 0.8%, 70~79점 ➔ 0.6%, 60~69점 ➔ 0.4%, 60점 미만 ➔ 0.0%.
                  </p>
                </div>

                {/* 4) NMC 2026 CP 가이드라인 */}
                <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                      국립중앙의료원(NMC) 안내서
                    </span>
                    <span className="text-xs text-slate-400">제3장~제4장 변이 관리 체계</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    「2026 공공의료 표준진료지침(CP) 개발 및 보급 사업 안내서」
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    • <strong>변이(Variance) 규격:</strong> 환자/의료진/시스템 3대 영역 표준 분류 및 월별 피드백 체계.<br />
                    • <strong>경영 개선 효과 (ROI):</strong> 불필요 재원일수 단축(-1.8일)에 따른 병상 회전율 증대 및 연간 순수 병원 재정 2.8억~4.5억 원 개선 산출.
                  </p>
                </div>

                {/* 5) 복지부 공모 표준 사업계획서 */}
                <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                      보건복지부 공모 표준
                    </span>
                    <span className="text-xs text-slate-400">기능보강 및 책임의료계획</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    「보건복지부 공모 표준 6대 개조식 사업계획서 서식」
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    • <strong>6대 표준 목차:</strong> 추진 목적 및 법적 근거, 현황 및 결핍 진단, 세부 추진 계획, 소요 예산(국비 70% : 지방비 30%), 기대효과(ROI), 연차별 성과지표(KPI) 원클릭 서술문 자동 생성.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* 탭 3: 핵심 산식 & 평가 공식 */}
          {/* ============================================================ */}
          {active_tab === 'formulas' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-200/60 dark:border-indigo-900/40 text-xs text-indigo-950 dark:text-indigo-200 leading-relaxed">
                🔢 <strong>공식 산식 일람:</strong> 플랫폼에 내장된 정책가산 및 ROI 계산 공식입니다. 슬라이더나 수치를 변경하면 아래 수식에 따라 실시간 연산됩니다.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 공식 1: 신포괄 추가 수가 지급액 */}
                <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 space-y-2">
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400 block">
                    [산식 1] 신포괄 정책가산 추가 수가액
                  </span>
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                    연간 추가 수가 = 연간 신포괄 진료비 × (정책가산율 / 100)
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    예시: 연간 진료비 250억 원, 90점 이상(가산율 1.0%) 획득 시 <strong>연간 +2억 5,000만 원 순증</strong>
                  </p>
                </div>

                {/* 공식 2: 운영평가 1.1.8 100점 만점 */}
                <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 space-y-2">
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400 block">
                    [산식 2] 운영평가 1.1.8 환산 득점
                  </span>
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                    종합 점수 = 개발체계(50점) + 병상적용(20점) + 질환적용(10점) + 관리율(5점) + 모니터링(15점)
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    개발 16개 항목(각 3.125점), 관리율(85% 이상 5점), 5개 모니터링(질환당 3점)
                  </p>
                </div>

                {/* 공식 3: 병원 경영 ROI (총 재정 기여도) */}
                <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 space-y-2">
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 block">
                    [산식 3] CP 연간 총 재정 기여도 (ROI)
                  </span>
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                    총 재정효과 = 직접 진료비 절감액 + 병상회전 신규 진료수익 + Outlier 삭감 예방액
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    단축 병상에 신규 입원 환자 유치(마진율 22%)로 연간 2.8억~4.5억 원 개선
                  </p>
                </div>

                {/* 공식 4: 자체충족률 (Relevance Index, RI) */}
                <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 space-y-2">
                  <span className="text-xs font-bold text-purple-600 dark:text-purple-400 block">
                    [산식 4] 필수의료 자체충족률 (RI)
                  </span>
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                    RI (%) = (관내 거주자의 관내 의료이용 건수 / 관내 거주자의 총 의료이용 건수) × 100
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    RI 30% 미만 시 법정 취약지로 판정 및 국비 기능보강 우선 지원 대상
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
            <span>출처: 데이터셋별 상이 (탭 1의 각 항목 참고)</span>
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
