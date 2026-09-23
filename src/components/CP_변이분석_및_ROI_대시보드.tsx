'use client';

import React, { useState, useMemo } from 'react';
import {
  CP_변이_ROI_엔진,
  공공의료_10대_CP_변이_데이터,
  표준_세부_변이_사유_목록,
  CP_질환_변이_프로필,
  ROI_시뮬레이션_결과,
  세부_변이_사유,
} from '@/lib/CP_변이분석_및_ROI_엔진';
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  PieChart,
  BarChart3,
  DollarSign,
  Bed,
  Calendar,
  Layers,
  Copy,
  Check,
  Building2,
  FileSpreadsheet,
  Stethoscope,
  ChevronRight,
  ShieldAlert,
  ArrowDownRight,
  ArrowUpRight,
  Sliders,
  Sparkles,
  Award,
  Users,
  Clock,
} from 'lucide-react';

export default function CP_변이분석_및_ROI_대시보드() {
  // 선택된 질환 코드 ('ALL' 또는 'CP_01' ~ 'CP_10')
  const [selected_disease_code, set_selected_disease_code] = useState<string>('ALL');

  // 병상수 및 연간 환자수 파라미터
  const [bed_count, set_bed_count] = useState<number>(300);
  const [patient_count, set_patient_count] = useState<number>(1140);

  // 활성 탭 ('variance_analysis' | 'los_cost_compare' | 'roi_simulator')
  const [active_tab, setActive_tab] = useState<'variance_analysis' | 'los_cost_compare' | 'roi_simulator'>('variance_analysis');

  // 클립보드 복사 상태
  const [is_copied, setIs_copied] = useState(false);

  // 선택된 질환 프로필 (ALL인 경우 null)
  const current_disease_profile = useMemo(() => {
    if (selected_disease_code === 'ALL') return null;
    return 공공의료_10대_CP_변이_데이터.find((d) => d.질환_코드 === selected_disease_code) ?? null;
  }, [selected_disease_code]);

  // 병상수 변경 시 기본 환자수 자동 갱신
  const handle_bed_count_change = (new_beds: number) => {
    set_bed_count(new_beds);
    if (selected_disease_code === 'ALL') {
      set_patient_count(Math.round(new_beds * 3.8));
    } else {
      set_patient_count(Math.round(new_beds * 0.45));
    }
  };

  // 질환 변경 시 환자수 기본값 보정
  const handle_disease_change = (code: string) => {
    set_selected_disease_code(code);
    if (code === 'ALL') {
      set_patient_count(Math.round(bed_count * 3.8));
    } else {
      set_patient_count(Math.round(bed_count * 0.45));
    }
  };

  // 실시간 ROI 계산 결과
  const roi_result: ROI_시뮬레이션_결과 = useMemo(() => {
    return CP_변이_ROI_엔진.calculate_roi(selected_disease_code, patient_count, bed_count);
  }, [selected_disease_code, patient_count, bed_count]);

  // 선택 질환 변이 사유 목록 및 점유율 계산
  const top_variance_reasons: 세부_변이_사유[] = useMemo(() => {
    if (!current_disease_profile) {
      // ALL인 경우 전체에서 점유율 높은 상위 5개
      return [...표준_세부_변이_사유_목록].sort((a, b) => b.발생_비율 - a.발생_비율).slice(0, 5);
    }
    // 개별 질환인 경우 해당 질환의 대표 이탈 사유 매핑
    const matched = current_disease_profile.대표_이탈_사유_ids
      .map((id) => 표준_세부_변이_사유_목록.find((r) => r.id === id))
      .filter((r): r is 세부_변이_사유 => !!r);
    
    // 부족하면 전체 높은 순 추가
    if (matched.length < 5) {
      const rest = 표준_세부_변이_사유_목록.filter((r) => !matched.some((m) => m.id === r.id));
      matched.push(...rest.slice(0, 5 - matched.length));
    }
    return matched;
  }, [current_disease_profile]);

  // 3대 원인 점유율
  const cause_distribution = useMemo(() => {
    if (current_disease_profile) {
      return current_disease_profile.원인_점유율;
    }
    return {
      환자_보호자_요인: 43.5,
      의료진_요인: 32.1,
      병원_시스템_요인: 24.4,
    };
  }, [current_disease_profile]);

  // QI 개선 액션 플랜
  const action_plans = useMemo(() => {
    return CP_변이_ROI_엔진.get_variance_action_plans(selected_disease_code);
  }, [selected_disease_code]);

  // 보고서 텍스트 복사 핸들러
  const handle_copy_report = async () => {
    const text = CP_변이_ROI_엔진.generate_management_report_text(roi_result, selected_disease_code);
    await navigator.clipboard.writeText(text);
    setIs_copied(true);
    setTimeout(() => setIs_copied(false), 2500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* ============================================================== */}
      {/* 1. 상단 타이틀 배너 & 글로벌 파라미터 제어 바 */}
      {/* ============================================================== */}
      <div className="bg-white dark:bg-[#12141a] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                NMC 가이드라인 67~78p & 심평원 별표3 연동
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                실증 ROI 분석 모델
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              CP 변이(Variance) 원인 다차원 분석 & 재원일수·재정 ROI 대시보드
            </h1>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">
              환자·의료진·시스템 3대 변이 이탈 사유 정밀 추적, 불필요 재원일수 단축에 따른 병상 회전율 및 연간 순수 재정 기여도 실시간 산출
            </p>
          </div>

          {/* 원클릭 보고서 복사 버튼 */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handle_copy_report}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-xs md:text-sm bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all active:scale-95"
            >
              {is_copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-200" />
                  <span>보고서 복사 완료!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>경영진 보고서 복사</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 상단 파라미터 필터 컨트롤러 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-5">
          {/* 질환 선택기 */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
              <Stethoscope className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              분석 대상 CP 질환군 선택
            </label>
            <select
              value={selected_disease_code}
              onChange={(e) => handle_disease_change(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="ALL">전체 10대 대표 질환 가중 종합 (권장)</option>
              {공공의료_10대_CP_변이_데이터.map((d) => (
                <option key={d.질환_코드} value={d.질환_코드}>
                  [{d.진료과}] {d.질환명} ({d.K_DRG_코드})
                </option>
              ))}
            </select>
          </div>

          {/* 병상 규모 선택 */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              의료원 병상 규모 ({bed_count}병상)
            </label>
            <div className="flex items-center gap-2">
              <select
                value={bed_count}
                onChange={(e) => handle_bed_count_change(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value={150}>150병상 이하 (중소형 의료원)</option>
                <option value={200}>200병상 (소형 의료원)</option>
                <option value={300}>300병상 (지방거점 평균)</option>
                <option value={400}>400병상 (중대형 공공병원)</option>
                <option value={500}>500병상 이상 (대형 공공의료원)</option>
              </select>
            </div>
          </div>

          {/* 연간 CP 적용 환자수 슬라이더 */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                연간 CP 적용 환자 수
              </span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {patient_count.toLocaleString()}명
              </span>
            </div>
            <input
              type="range"
              min={100}
              max={selected_disease_code === 'ALL' ? 3000 : 800}
              step={10}
              value={patient_count}
              onChange={(e) => set_patient_count(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. 상단 4대 핵심 KPI 카드 */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 카드 1: 총 변이 발생률 */}
        <div className="bg-white dark:bg-[#12141a] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              총 변이(Variance) 발생률
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {current_disease_profile ? current_disease_profile.총_변이_발생률 : 19.8}%
            </span>
            <span className="text-xs text-amber-600 dark:text-amber-400 font-medium flex items-center">
              중도탈락 {current_disease_profile ? current_disease_profile.중도_탈락률 : 5.2}%
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            긍정적 변이(조기퇴원) {current_disease_profile ? current_disease_profile.긍정적_변이율 : 5.8}% 포함
          </p>
        </div>

        {/* 카드 2: 평균 재원일수(ALOS) 단축 */}
        <div className="bg-white dark:bg-[#12141a] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              평균 재원일수(ALOS) 단축
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl lg:text-3xl font-extrabold tracking-tight text-blue-600 dark:text-blue-400">
              -{roi_result.재원일수_단축_일수}일
            </span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center">
              <ArrowDownRight className="w-3.5 h-3.5" />
              회전율 +{roi_result.병상_회전율_증가율}%
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            연간 확보 가용 병상: {roi_result.총_가용_병상일수.toLocaleString()}일
          </p>
        </div>

        {/* 카드 3: 연간 총 재정 기여도 (ROI) */}
        <div className="bg-white dark:bg-[#12141a] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              연간 총 재정 개선 효과
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl lg:text-3xl font-extrabold tracking-tight text-emerald-600 dark:text-emerald-400">
              +{roi_result.총_연간_재정_기여도_억원}억 원
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            직접 절감 + 병상 회전 신규 수익 합산
          </p>
        </div>

        {/* 카드 4: 신포괄 정상군 유지율 */}
        <div className="bg-white dark:bg-[#12141a] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              신포괄 정상군 유지율
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl lg:text-3xl font-extrabold tracking-tight text-purple-600 dark:text-purple-400">
              {roi_result.신포괄_정상군_유지율}%
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              ROI {roi_result.투자_대비_수익률_ROI}%
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Outlier 비포괄 전환 및 삭감 방지
          </p>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. 3대 인터랙티브 탭 네비게이션 */}
      {/* ============================================================== */}
      <div className="bg-white dark:bg-[#12141a] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto bg-slate-50/50 dark:bg-slate-900/40">
          <button
            onClick={() => setActive_tab('variance_analysis')}
            className={`flex items-center gap-2 px-5 py-3.5 text-xs md:text-sm font-semibold border-b-2 whitespace-nowrap transition-all ${
              active_tab === 'variance_analysis'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 bg-white dark:bg-[#12141a]'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <PieChart className="w-4 h-4" />
            1. 3대 변이 다차원 원인 분석 & Top 5 사유
          </button>
          <button
            onClick={() => setActive_tab('los_cost_compare')}
            className={`flex items-center gap-2 px-5 py-3.5 text-xs md:text-sm font-semibold border-b-2 whitespace-nowrap transition-all ${
              active_tab === 'los_cost_compare'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 bg-white dark:bg-[#12141a]'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            2. 신포괄 재원일수 & 진료비 4단 정밀 대조
          </button>
          <button
            onClick={() => setActive_tab('roi_simulator')}
            className={`flex items-center gap-2 px-5 py-3.5 text-xs md:text-sm font-semibold border-b-2 whitespace-nowrap transition-all ${
              active_tab === 'roi_simulator'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 bg-white dark:bg-[#12141a]'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Sliders className="w-4 h-4" />
            3. 병원 경영 ROI & 병상 회전 시뮬레이터
          </button>
        </div>

        <div className="p-6">
          {/* ============================================================== */}
          {/* 탭 1: 3대 변이 다차원 원인 분석 */}
          {/* ============================================================== */}
          {active_tab === 'variance_analysis' && (
            <div className="space-y-6">
              {/* 3대 원인 점유율 시각화 */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* 1) 환자 및 보호자 요인 */}
                <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/40 dark:bg-rose-950/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-700 dark:text-rose-300">
                      환자 및 보호자 요인
                    </span>
                    <span className="text-sm font-extrabold text-rose-600 dark:text-rose-400">
                      {cause_distribution.환자_보호자_요인}%
                    </span>
                  </div>
                  <div className="w-full bg-rose-200/60 dark:bg-rose-900/40 rounded-full h-2">
                    <div
                      className="bg-rose-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${cause_distribution.환자_보호자_요인}%` }}
                    />
                  </div>
                  <p className="text-xs text-rose-800/80 dark:text-rose-300/80 leading-relaxed">
                    • 기저질환(고혈압/당뇨) 수술 전 조절 불량, 간병인 부재로 인한 자의적 퇴원 연기 요청
                  </p>
                </div>

                {/* 2) 의료진 요인 */}
                <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/40 dark:bg-blue-950/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-700 dark:text-blue-300">
                      의료진(의사/간호사) 요인
                    </span>
                    <span className="text-sm font-extrabold text-blue-600 dark:text-blue-400">
                      {cause_distribution.의료진_요인}%
                    </span>
                  </div>
                  <div className="w-full bg-blue-200/60 dark:bg-blue-900/40 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${cause_distribution.의료진_요인}%` }}
                    />
                  </div>
                  <p className="text-xs text-blue-800/80 dark:text-blue-300/80 leading-relaxed">
                    • 타과 협진(Consult) 회신 지연(평균 24h 이상), 주치의 퇴원 결정 및 약 처방 지연
                  </p>
                </div>

                {/* 3) 병원 및 시스템 요인 */}
                <div className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-900/50 bg-indigo-50/40 dark:bg-indigo-950/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300">
                      병원 및 지원 시스템 요인
                    </span>
                    <span className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400">
                      {cause_distribution.병원_시스템_요인}%
                    </span>
                  </div>
                  <div className="w-full bg-indigo-200/60 dark:bg-indigo-900/40 rounded-full h-2">
                    <div
                      className="bg-indigo-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${cause_distribution.병원_시스템_요인}%` }}
                    />
                  </div>
                  <p className="text-xs text-indigo-800/80 dark:text-indigo-300/80 leading-relaxed">
                    • 특수영상(CT/MRI) 예약 지연, 주말 퇴원 정산 불가로 인한 월요일 강제 체류
                  </p>
                </div>
              </div>

              {/* 다빈도 변이 원인 Top 5 랭킹 테이블 */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    다빈도 변이 이탈 사유 Top 5 및 현장 개선 처방전
                  </h3>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    NMC 공공의료 CP 표준 코드 체계
                  </span>
                </div>

                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                  <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                    {top_variance_reasons.map((reason, idx) => (
                      <div key={reason.id} className="p-4 hover:bg-slate-50/80 dark:hover:bg-slate-900/40 transition-colors">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-700 dark:text-slate-300">
                              {idx + 1}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                              reason.대분류 === '환자_보호자_요인'
                                ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                                : reason.대분류 === '의료진_요인'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                                : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300'
                            }`}>
                              {reason.대분류 === '환자_보호자_요인' ? '환자 요인' : reason.대분류 === '의료진_요인' ? '의료진 요인' : '시스템 요인'}
                            </span>
                            <span className="text-sm font-bold text-slate-900 dark:text-white">
                              {reason.사유명}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-xs">
                            <span className="text-slate-500 dark:text-slate-400">
                              발생비중: <strong className="text-slate-800 dark:text-slate-200">{reason.발생_비율}%</strong>
                            </span>
                            <span className="text-rose-600 dark:text-rose-400 font-semibold">
                              재원 지연: +{reason.평균_지연_일수}일
                            </span>
                            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                              {reason.주요_발생_단계}
                            </span>
                          </div>
                        </div>

                        <div className="mt-2.5 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs bg-slate-50 dark:bg-slate-900/60 p-3 rounded-lg border border-slate-100 dark:border-slate-800/60">
                          <div>
                            <span className="font-semibold text-slate-500 dark:text-slate-400 block mb-0.5">
                              [상세 임상 원인]
                            </span>
                            <p className="text-slate-700 dark:text-slate-300">
                              {reason.원인_설명}
                            </p>
                          </div>
                          <div>
                            <span className="font-semibold text-emerald-600 dark:text-emerald-400 block mb-0.5">
                              [QI 개선 솔루션 (처방)]
                            </span>
                            <p className="text-slate-700 dark:text-slate-300">
                              {reason.개선_처방전}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* 탭 2: 신포괄 재원일수 & 진료비 4단 정밀 대조 */}
          {/* ============================================================== */}
          {active_tab === 'los_cost_compare' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 1) 재원일수(ALOS) 4단 비교 바 차트 */}
                <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs md:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      환자군별 평균 재원일수(ALOS) 비교
                    </h4>
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                      CP 적용 시 {roi_result.재원일수_단축_일수}일 단축
                    </span>
                  </div>

                  {/* 4단계 재원일수 비교 바 */}
                  <div className="space-y-3 text-xs">
                    {/* ① 신포괄 심평원 기준 */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-slate-600 dark:text-slate-400">
                        <span>심평원 신포괄 기준 재원일수 (정상군 상한)</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {current_disease_profile ? current_disease_profile.신포괄_기준_재원일수 : 6.8}일
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-3">
                        <div
                          className="bg-slate-400 dark:bg-slate-500 h-3 rounded-full"
                          style={{ width: '65%' }}
                        />
                      </div>
                    </div>

                    {/* ② 비CP 미적용군 (과거 방식) */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-slate-600 dark:text-slate-400">
                        <span>비CP 미적용군 (의료진 자율 처방)</span>
                        <span className="font-bold text-rose-600 dark:text-rose-400">
                          {current_disease_profile ? current_disease_profile.비CP_군.평균_재원일수 : 7.9}일
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-3">
                        <div
                          className="bg-rose-500 h-3 rounded-full"
                          style={{ width: '78%' }}
                        />
                      </div>
                    </div>

                    {/* ③ CP 표준 진료군 (성공적 완료) */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-slate-600 dark:text-slate-400">
                        <span className="font-semibold text-emerald-700 dark:text-emerald-300">
                          ★ CP 표준 적용군 (최적 경로)
                        </span>
                        <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                          {current_disease_profile ? current_disease_profile.CP_표준_군.평균_재원일수 : 5.1}일
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-3">
                        <div
                          className="bg-emerald-500 h-3 rounded-full transition-all duration-500"
                          style={{ width: '50%' }}
                        />
                      </div>
                    </div>

                    {/* ④ 변이 발생 이탈군 (중도 탈락) */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-slate-600 dark:text-slate-400">
                        <span>변이 발생 이탈군 (합병증/지연)</span>
                        <span className="font-bold text-amber-600 dark:text-amber-400">
                          {current_disease_profile ? current_disease_profile.변이_이탈_군.평균_재원일수 : 10.4}일
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-3">
                        <div
                          className="bg-amber-500 h-3 rounded-full"
                          style={{ width: '98%' }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-white dark:bg-slate-900 rounded-lg text-xs text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-slate-800">
                    💡 <strong>신포괄 정액구간 이탈 위험:</strong> 변이 이탈군은 신포괄 기준일수를 3.6일 초과하여 열등구간에 진입, 병원 당기순손실의 주원인이 됩니다.
                  </div>
                </div>

                {/* 2) 1인당 총진료비 및 본인부담금 비교 바 차트 */}
                <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs md:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      환자 1인당 총진료비 & 본인부담금 절감
                    </h4>
                    <span className="text-xs text-blue-600 dark:text-blue-400 font-bold">
                      국민 의료비 경감
                    </span>
                  </div>

                  {/* 3군 진료비 비교 카드 */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-1">
                      <span className="text-[11px] text-slate-500 block">비CP 미적용</span>
                      <span className="text-base font-bold text-slate-800 dark:text-slate-200 block">
                        {current_disease_profile ? current_disease_profile.비CP_군.총_진료비_만원.toLocaleString() : '345'}만
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        본인: {current_disease_profile ? current_disease_profile.비CP_군.환자_본인부담_만원 : '69'}만
                      </span>
                    </div>

                    <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-center space-y-1">
                      <span className="text-[11px] text-emerald-700 dark:text-emerald-300 font-bold block">
                        ★ CP 표준적용
                      </span>
                      <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 block">
                        {current_disease_profile ? current_disease_profile.CP_표준_군.총_진료비_만원.toLocaleString() : '285'}만
                      </span>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block font-medium">
                        본인: {current_disease_profile ? current_disease_profile.CP_표준_군.환자_본인부담_만원 : '57'}만 (-12만)
                      </span>
                    </div>

                    <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-1">
                      <span className="text-[11px] text-slate-500 block">변이 이탈군</span>
                      <span className="text-base font-bold text-rose-600 dark:text-rose-400 block">
                        {current_disease_profile ? current_disease_profile.변이_이탈_군.총_진료비_만원.toLocaleString() : '430'}만
                      </span>
                      <span className="text-[10px] text-rose-500 block">
                        본인: {current_disease_profile ? current_disease_profile.변이_이탈_군.환자_본인부담_만원 : '86'}만
                      </span>
                    </div>
                  </div>

                  {/* 합병증 발생률 비교 */}
                  <div className="p-3.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        수술 후 합병증(감염/재수술) 발생률 비교
                      </span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                        -68% 감소 효과
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2 rounded bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400">
                        비CP군: <strong>{current_disease_profile ? current_disease_profile.비CP_군.합병증_발생률 : 5.1}%</strong>
                      </div>
                      <div className="p-2 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold">
                        CP표준군: <strong>{current_disease_profile ? current_disease_profile.CP_표준_군.합병증_발생률 : 1.6}%</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* 탭 3: 병원 경영 ROI & 병상 회전 시뮬레이터 */}
          {/* ============================================================== */}
          {active_tab === 'roi_simulator' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 1) 3대 재정 개선 항목 내역 */}
                <div className="lg:col-span-2 space-y-4">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    연간 병원 경영 수지 개선 내역 ({roi_result.연간_CP_환자수.toLocaleString()}명 적용 기준)
                  </h4>

                  <div className="space-y-3">
                    {/* 항목 1: 직접 진료비 절감액 */}
                    <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 flex items-center justify-between">
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-slate-900 dark:text-white block">
                          1. 직접 진료비 절감액 (약제/치료재료/불필요 검사 감소)
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 block">
                          불필요 항생제 처방 감소 및 중복 혈액/영상 검사 배제에 따른 원가 절감
                        </span>
                      </div>
                      <span className="text-base md:text-lg font-bold text-slate-900 dark:text-white shrink-0">
                        +{roi_result.직접_진료비_절감액_만원.toLocaleString()}만 원
                      </span>
                    </div>

                    {/* 항목 2: 병상 회전 신규 진료수익 */}
                    <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-800/80 bg-emerald-50/30 dark:bg-emerald-950/20 flex items-center justify-between">
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 block">
                          2. 병상 회전율 증대에 따른 신규 입원 진료수익 창출 (가장 큼)
                        </span>
                        <span className="text-xs text-emerald-700/80 dark:text-emerald-400/80 block">
                          단축된 가용 병상({roi_result.총_가용_병상일수.toLocaleString()}일)에 신규 환자 유치로 병원 마진 극대화
                        </span>
                      </div>
                      <span className="text-base md:text-lg font-extrabold text-emerald-600 dark:text-emerald-400 shrink-0">
                        +{roi_result.병상회전_신규_진료수익_만원.toLocaleString()}만 원
                      </span>
                    </div>

                    {/* 항목 3: 신포괄 Outlier 삭감 예방액 */}
                    <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 flex items-center justify-between">
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-slate-900 dark:text-white block">
                          3. 신포괄 기준초과(Outlier) 비포괄 전환 및 심사 삭감 예방액
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 block">
                          정상군 재원일수 초과로 인한 심평원 정액 삭감 방지
                        </span>
                      </div>
                      <span className="text-base md:text-lg font-bold text-slate-900 dark:text-white shrink-0">
                        +{roi_result.삭감_및_비포괄_전환_예방액_만원.toLocaleString()}만 원
                      </span>
                    </div>
                  </div>

                  {/* 총합 하이라이트 배너 */}
                  <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex items-center justify-between shadow-md">
                    <div>
                      <span className="text-xs font-medium text-emerald-100 block">
                        ★ {bed_count}병상 의료원 연간 순수 병원 경영 개선 총액
                      </span>
                      <span className="text-2xl md:text-3xl font-extrabold tracking-tight">
                        약 {roi_result.총_연간_재정_기여도_억원}억 원
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-medium text-emerald-100 block">
                        CP 전담팀 투자 대비 회수율
                      </span>
                      <span className="text-xl md:text-2xl font-black text-emerald-200">
                        ROI {roi_result.투자_대비_수익률_ROI}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2) 5개년 누적 재정 효과 & 공공의료 가치 */}
                <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 space-y-4">
                  <h4 className="text-xs md:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    5개년 누적 재정 및 공공의료 기여
                  </h4>

                  <div className="space-y-3 text-xs">
                    <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-800">
                      <span className="text-slate-500 dark:text-slate-400 block mb-1">
                        5개년 누적 병원 재정 수익
                      </span>
                      <span className="text-lg font-bold text-slate-900 dark:text-white">
                        +{(roi_result.총_연간_재정_기여도_억원 * 5.4).toFixed(1)}억 원
                      </span>
                    </div>

                    <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-800">
                      <span className="text-slate-500 dark:text-slate-400 block mb-1">
                        연간 지역주민 본인부담금 절감액
                      </span>
                      <span className="text-base font-bold text-blue-600 dark:text-blue-400">
                        {roi_result.환자_본인부담_경감액_만원.toLocaleString()}만 원 / 년
                      </span>
                    </div>

                    <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-800">
                      <span className="text-slate-500 dark:text-slate-400 block mb-1">
                        손익분기점 (BEP) 달성 시점
                      </span>
                      <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                        운영 개시 후 2.4개월 이내
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ============================================================== */}
      {/* 4. 하단 부서별 QI 액션 플랜 처방전 패널 */}
      {/* ============================================================== */}
      <div className="bg-white dark:bg-[#12141a] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="space-y-0.5">
            <h3 className="text-sm md:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              지역거점 공공병원 운영평가 1.1.8(관리율) 연계 맞춤형 QI 처방전
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              NMC 공공의료 CP 지침 제4장에 따른 변이 원인 해결을 위한 4대 부서별 실행 전략
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
            평가 배점 5점 만점 보장
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {action_plans.map((plan) => (
            <div
              key={plan.우선순위}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 flex items-center justify-center text-xs font-extrabold">
                    {plan.우선순위}
                  </span>
                  {plan.핵심_병목_요인}
                </span>
                <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                  {plan.영향도}
                </span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800/80 leading-relaxed">
                👉 <strong>실행 방안:</strong> {plan.구체적_실행_방안}
              </p>

              <div className="flex items-center justify-between text-[11px] pt-1">
                <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                  <span>협업부서:</span>
                  {plan.관련_부서.map((d) => (
                    <span key={d} className="px-1.5 py-0.5 rounded bg-slate-200/60 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {d}
                    </span>
                  ))}
                </div>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                  기대효과: {plan.예상_개선_효과}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
