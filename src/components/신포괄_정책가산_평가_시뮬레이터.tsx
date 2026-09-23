'use client';

import React, { useState, useMemo } from 'react';
import {
  신포괄_정책가산_시뮬레이션_엔진,
  공공병원_41개_프리셋,
  병원_규모_구분,
  CP_개발_체크리스트,
  CP_적용_실적_입력,
  공공병원_프로필,
} from '@/lib/신포괄_정책가산_시뮬레이션_엔진';
import {
  Calculator,
  Award,
  TrendingUp,
  Building2,
  DollarSign,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Copy,
  Check,
  RefreshCw,
  Layers,
  Sparkles,
  ShieldCheck,
  FileCheck,
  ChevronRight,
  Sliders,
  FileSpreadsheet,
} from 'lucide-react';

export default function 신포괄_정책가산_평가_시뮬레이터() {
  // 선택된 병원 프리셋
  const [selected_hospital, set_selected_hospital] = useState<공공병원_프로필>(공공병원_41개_프리셋[0]);

  // 병원 기본 설정
  const [hospital_scale, set_hospital_scale] = useState<병원_규모_구분>(selected_hospital.규모_구분);
  const [annual_revenue, set_annual_revenue] = useState<number>(selected_hospital.연간_신포괄_진료비_억원);

  // 활성 입력 탭
  const [active_input_tab, set_active_input_tab] = useState<'basic' | 'dev_checklist' | 'usage_input'>('basic');
  const [is_copied, set_is_copied] = useState(false);

  // ㉠ 개발 체계 16개 체크리스트 상태
  const [checklist, set_checklist] = useState<CP_개발_체크리스트>({
    전담인력_지정: true,
    다학제_팀구성표_구비: true,
    운영계획서_CP_명시: true,
    의료진_인센티브_규정: true,
    CP_개발실적_충족: true,

    CP위원회_회의록_보유: true,
    사전조사_의무기록분석: true,
    시범적용_3개월_실시: true,
    유형별_Branch_CP_개발: true,
    환자_보호자_교육제공: true,

    담당자_연1회_교육이수: true,
    환자_직원_의견반영: true,
    관련부서_현황_공유: true,
    신규직원_원내교육_실시: true,
    변이_모니터링_관리: true,
    주기적_CP_최신화_갱신: true,
  });

  // ㉡ 적용 실적 파라미터 상태
  const [usage, set_usage] = useState<CP_적용_실적_입력>({
    운영_CP_개수: 15,
    대상_환자건수: 1200,
    적용_환자건수: 1020, // 적용률 85%
    완료_환자건수: 938,  // 완료율 92%
    모니터링_보고_CP_개수: 15, // 관리율 100%
    대표_5개_CP_지표평가_보고: true, // 15점 만점
  });

  // 병원 프리셋 변경 핸들러
  const handle_select_preset = (hospital_name: string) => {
    const found = 공공병원_41개_프리셋.find((h) => h.이름 === hospital_name);
    if (found) {
      set_selected_hospital(found);
      set_hospital_scale(found.규모_구분);
      set_annual_revenue(found.연간_신포괄_진료비_억원);
      const min_cp = 신포괄_정책가산_시뮬레이션_엔진.get_min_cp_required(found.규모_구분);
      set_usage((prev) => ({
        ...prev,
        운영_CP_개수: min_cp,
        모니터링_보고_CP_개수: min_cp,
      }));
    }
  };

  // 체크리스트 전체 토글
  const handle_toggle_all_checklist = (value: boolean) => {
    set_checklist({
      전담인력_지정: value,
      다학제_팀구성표_구비: value,
      운영계획서_CP_명시: value,
      의료진_인센티브_규정: value,
      CP_개발실적_충족: value,
      CP위원회_회의록_보유: value,
      사전조사_의무기록분석: value,
      시범적용_3개월_실시: value,
      유형별_Branch_CP_개발: value,
      환자_보호자_교육제공: value,
      담당자_연1회_교육이수: value,
      환자_직원_의견반영: value,
      관련부서_현황_공유: value,
      신규직원_원내교육_실시: value,
      변이_모니터링_관리: value,
      주기적_CP_최신화_갱신: value,
    });
  };

  // 단일 체크리스트 토글
  const handle_toggle_item = (key: keyof CP_개발_체크리스트) => {
    set_checklist((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // 실시간 계산 결과
  const result = useMemo(() => {
    return 신포괄_정책가산_시뮬레이션_엔진.calculate(
      hospital_scale,
      annual_revenue,
      checklist,
      usage
    );
  }, [hospital_scale, annual_revenue, checklist, usage]);

  // 보고서 클립보드 복사
  const handle_copy_report = () => {
    const text = `[신포괄 정책가산 & 지역거점 운영평가 시뮬레이션 결과]
기관명: ${selected_hospital.이름} (${result.병원_규모}, ${selected_hospital.병상수}병상)
연간 신포괄 진료비: ${result.연간_신포괄_진료비_억원}억 원
------------------------------------------------
1. 운영평가 1.1.8 종합 점수: ${result.종합_운영평가_점수}점 / 100점 (등급: ${result.운영평가_예상_등급})
 - ㉠ 표준진료지침 개발 영역: ${result.개발_영역_점수}점 / 50점
 - ㉡ 표준진료지침 적용 영역: ${result.적용_영역_점수}점 / 50점
2. 적용 성과 지표:
 - 적용률: ${result.적용률_퍼센트}% (적용 ${usage.적용_환자건수}건 / 대상 ${usage.대상_환자건수}건)
 - 완료율: ${result.완료율_퍼센트}% (완료 ${usage.완료_환자건수}건)
 - 관리율: ${result.질환별_관리율_퍼센트}% (운영 ${usage.운영_CP_개수}개)
3. 신포괄 정책가산 평가 결과:
 - 확정 정책가산율: +${result.신포괄_정책가산율}% (최대 1.0%)
 - 연간 예상 추가 건보 수가: +${result.연간_예상_수가_가산금액_만원.toLocaleString()}만 원 (약 ${(result.연간_예상_수가_가산금액_만원 / 10000).toFixed(2)}억 원)
------------------------------------------------
(출처: 보건복지부·국립중앙의료원 2026 공공의료 CP 지침 & 심평원 2026 신포괄지불제도 지침)`;

    navigator.clipboard.writeText(text);
    set_is_copied(true);
    setTimeout(() => set_is_copied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* 1. 상단 그라데이션 타이틀 배너 */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 rounded-2xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-blue-500/10 to-transparent pointer-events-none" />
        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-200 border border-blue-400/30 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-blue-300" />
              건강보험심사평가원 2026.1 신포괄 지침 [별표3] 반영
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              <ShieldCheck className="w-3 h-3" />
              지역거점 공공병원 운영평가 1.1.8 산식 연계
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/20 text-amber-300 border border-amber-400/30">
              <Award className="w-3 h-3" />
              최대 1.0% 정책가산금 실시간 시뮬레이션
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                <Calculator className="w-7 h-7 text-indigo-400" />
                신포괄 정책가산 & 지역거점 운영평가 자가진단 계산기
              </h1>
              <p className="text-xs md:text-sm text-slate-300 mt-2 max-w-3xl leading-relaxed">
                공공병원 규모별 필수 CP 기준 충족 여부, 16개 정규 개발 체계 체크리스트 및 환자 적용률·완료율 데이터를 기반으로
                운영평가 득점과 신포괄 수가 정책가산액(수억 원 대)을 실시간으로 산출하고 가산금 극대화 처방전을 제시합니다.
              </p>
            </div>

            {/* 전국 41개 공공병원 프리셋 신속 선택기 */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-3 rounded-xl min-w-[280px]">
              <span className="text-[11px] font-semibold text-blue-200 block mb-1 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5" />
                41개 공공병원 데이터 프리셋
              </span>
              <select
                value={selected_hospital.이름}
                onChange={(e) => handle_select_preset(e.target.value)}
                className="w-full bg-slate-800 text-white border border-slate-700 rounded-lg p-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                {공공병원_41개_프리셋.map((h) => (
                  <option key={h.이름} value={h.이름}>
                    [{h.시도}] {h.이름} ({h.병상수}병상)
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 2. 메인 시뮬레이션 인터페이스: 좌측 설정 패널(5) + 우측 실시간 결과 대시보드(7) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* 좌측: 설정 및 입력 패널 */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-5 space-y-4">
          {/* 3대 입력 탭 네비게이션 */}
          <div className="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => set_active_input_tab('basic')}
              className={`py-2 rounded-lg transition ${
                active_input_tab === 'basic'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              1. 기본 정보
            </button>
            <button
              onClick={() => set_active_input_tab('dev_checklist')}
              className={`py-2 rounded-lg transition ${
                active_input_tab === 'dev_checklist'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              2. ㉠ 개발체계 (50점)
            </button>
            <button
              onClick={() => set_active_input_tab('usage_input')}
              className={`py-2 rounded-lg transition ${
                active_input_tab === 'usage_input'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              3. ㉡ 적용실적 (50점)
            </button>
          </div>

          {/* 탭 1: 병원 기본 정보 & 청구액 */}
          {active_input_tab === 'basic' && (
            <div className="space-y-4 pt-1">
              <div>
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1.5">
                  병원 규모 분류 (2026 지침 기준)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(
                    [
                      { id: '종합병원_500병상_초과', label: '500병상 초과 종합병원', min: '최소 15개 CP' },
                      { id: '종합병원_300병상_초과', label: '300병상 초과 종합병원', min: '최소 10개 CP' },
                      { id: '종합병원_300병상_이하', label: '300병상 이하 종합병원', min: '최소 7개 CP' },
                      { id: '병원급', label: '병원급 의료기관', min: '최소 5개 CP' },
                    ] as const
                  ).map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => set_hospital_scale(opt.id)}
                      className={`p-3 rounded-xl border text-left transition ${
                        hospital_scale === opt.id
                          ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500 ring-1 ring-blue-500'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {opt.label}
                      </div>
                      <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 mt-1 block">
                        {opt.min}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 연간 신포괄 진료비 슬라이더 */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    연간 신포괄 포괄수가 청구액
                  </span>
                  <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                    {annual_revenue}억 원
                  </span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="1000"
                  step="10"
                  value={annual_revenue}
                  onChange={(e) => set_annual_revenue(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>50억</span>
                  <span>300억 (중소의료원)</span>
                  <span>600억 (대형의료원)</span>
                  <span>1,000억</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                  * 1.0% 정책가산 시 연간 최대{' '}
                  <strong className="text-indigo-600 dark:text-indigo-400">
                    {(annual_revenue * 0.01).toFixed(2)}억 원({annual_revenue}천만 원)
                  </strong>
                  의 추가 건강보험 재정이 지급됩니다.
                </p>
              </div>

              {/* 300병상 초과 전담인력 의무 알림 */}
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-xs text-blue-900 dark:text-blue-200 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  2026 지침 개정 전담인력 요건
                </div>
                <p className="text-[11px] text-blue-800 dark:text-blue-300 leading-relaxed">
                  300병상 초과 종합병원은 CP 업무만 100% 수행하는 <strong>의료인 전담 1명 이상 필수 지정</strong>(겸임 불인정)이며,
                  전년도 12월 기준 6개월 이상 직무를 유지해야 득점으로 인정됩니다.
                </p>
              </div>
            </div>
          )}

          {/* 탭 2: ㉠ 개발체계 16개 체크리스트 */}
          {active_input_tab === 'dev_checklist' && (
            <div className="space-y-4 pt-1">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  16개 공문서 및 증빙 항목
                </span>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => handle_toggle_all_checklist(true)}
                    className="px-2 py-0.5 text-[11px] font-semibold bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                  >
                    모두 충족
                  </button>
                  <button
                    onClick={() => handle_toggle_all_checklist(false)}
                    className="px-2 py-0.5 text-[11px] font-semibold bg-slate-100 text-slate-600 rounded hover:bg-slate-200"
                  >
                    모두 해제
                  </button>
                </div>
              </div>

              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1 scrollbar-thin text-xs">
                {/* ⓐ 개발 체계 */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-blue-700 dark:text-blue-400 block">
                    [ⓐ CP 개발 체계 적절성 - 공통]
                  </span>
                  {[
                    { key: '전담인력_지정' as const, label: '1) 부서 내 담당 인력 지정 (병상별 전담/겸임 규정 충족)' },
                    { key: '다학제_팀구성표_구비' as const, label: '2) 대표 CP 팀 구성 및 직종별 역할 명시' },
                    { key: '운영계획서_CP_명시' as const, label: '3) 지자체 제출 병원 운영계획서 내 CP 필요성 명시' },
                    { key: '의료진_인센티브_규정' as const, label: '4) CP 개발/적용 참여 의료진 전용 인센티브 규정 구비' },
                    { key: 'CP_개발실적_충족' as const, label: '5) NMC 개발사업 참여 2개 이상 또는 원내 4개 증빙' },
                  ].map((item) => (
                    <label
                      key={item.key}
                      className="flex items-start gap-2 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={checklist[item.key]}
                        onChange={() => handle_toggle_item(item.key)}
                        className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-slate-800 dark:text-slate-200">{item.label}</span>
                    </label>
                  ))}
                </div>

                {/* ⓑ 개발 과정 */}
                <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 block">
                    [ⓑ CP 개발 과정 적절성 - 개별]
                  </span>
                  {[
                    { key: 'CP위원회_회의록_보유' as const, label: '6) CP/QI 위원회 질환 선정 회의록 및 기록 구비' },
                    { key: '사전조사_의무기록분석' as const, label: '7) 사전조사 (재원일수, 진료비, 항생제 의무기록 분석)' },
                    { key: '시범적용_3개월_실시' as const, label: '8) 실제 환자 진료 시범 적용 (3개월 이상)' },
                    { key: '유형별_Branch_CP_개발' as const, label: '9) 유형별 CP(Branch CP) 개발 (단일 CP 불인정)' },
                    { key: '환자_보호자_교육제공' as const, label: '10) 환자 및 보호자 치료 과정 설명·교육 자료 제공' },
                  ].map((item) => (
                    <label
                      key={item.key}
                      className="flex items-start gap-2 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={checklist[item.key]}
                        onChange={() => handle_toggle_item(item.key)}
                        className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-slate-800 dark:text-slate-200 font-medium">
                        {item.label}
                        {item.key === '유형별_Branch_CP_개발' && (
                          <span className="ml-1 text-[10px] text-amber-600 font-bold">(★필수)</span>
                        )}
                      </span>
                    </label>
                  ))}
                </div>

                {/* ⓒ 교육 및 유지관리 */}
                <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-400 block">
                    [ⓒ CP 교육 및 유지관리 적절성 - 공통]
                  </span>
                  {[
                    { key: '담당자_연1회_교육이수' as const, label: '11) CP 담당자 연 1회 이상 외부/NMC CP 교육 이수' },
                    { key: '환자_직원_의견반영' as const, label: '12) 환자 및 직원 설문조사 수행 및 개선 반영' },
                    { key: '관련부서_현황_공유' as const, label: '13) 경영진·진료과 CP 모니터링 현황 공유' },
                    { key: '신규직원_원내교육_실시' as const, label: '14) 갱신 및 신규 직원 배치 시 원내 CP 교육 실시' },
                    { key: '변이_모니터링_관리' as const, label: '15) 환자·의료진·시스템 변이(Variance) 모니터링 및 관리' },
                    { key: '주기적_CP_최신화_갱신' as const, label: '16) 최신 임상 지침 반영 주기적 CP 최신화 갱신' },
                  ].map((item) => (
                    <label
                      key={item.key}
                      className="flex items-start gap-2 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={checklist[item.key]}
                        onChange={() => handle_toggle_item(item.key)}
                        className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-slate-800 dark:text-slate-200">{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 탭 3: ㉡ 적용 및 모니터링 실적 */}
          {active_input_tab === 'usage_input' && (
            <div className="space-y-4 pt-1 text-xs">
              {/* 운영 CP 개수 슬라이더 */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    현재 운영 중인 CP 질환 수
                  </span>
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                    {usage.운영_CP_개수}개{' '}
                    <span className="text-[11px] font-normal text-slate-400">
                      (기준 {result.최소_필요_CP_개수}개)
                    </span>
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="30"
                  value={usage.운영_CP_개수}
                  onChange={(e) =>
                    set_usage((prev) => ({
                      ...prev,
                      운영_CP_개수: Number(e.target.value),
                      모니터링_보고_CP_개수: Math.min(prev.모니터링_보고_CP_개수, Number(e.target.value)),
                    }))
                  }
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <span className="text-[10px] text-slate-400 block">
                  * 조사기간 중 실제 적용 환자가 1건 이상 발생한 전산(EMR) 등록 CP 질환만 인정
                </span>
              </div>

              {/* 적용 환자수 & 대상 환자수 (적용률) */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                    CP 대상 환자수 (건)
                  </label>
                  <input
                    type="number"
                    value={usage.대상_환자건수}
                    onChange={(e) =>
                      set_usage((prev) => ({ ...prev, 대상_환자건수: Math.max(1, Number(e.target.value)) }))
                    }
                    className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                  />
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                    실제 적용 환자수 (건)
                  </label>
                  <input
                    type="number"
                    value={usage.적용_환자건수}
                    onChange={(e) =>
                      set_usage((prev) => ({ ...prev, 적용_환자건수: Math.max(0, Number(e.target.value)) }))
                    }
                    className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold text-blue-600"
                  />
                </div>
              </div>

              {/* 완료 환자수 (완료율) */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                    변이/탈락 없는 완료 환자수 (건)
                  </label>
                  <span className="text-xs font-bold text-emerald-600">
                    완료율 {result.완료율_퍼센트}%
                  </span>
                </div>
                <input
                  type="number"
                  value={usage.완료_환자건수}
                  onChange={(e) =>
                    set_usage((prev) => ({ ...prev, 완료_환자건수: Math.max(0, Number(e.target.value)) }))
                  }
                  className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold text-emerald-600"
                />
              </div>

              {/* 대표 5개 CP 성과 모니터링 토글 */}
              <div className="p-3.5 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white">
                    대표 5개 CP 성과 모니터링 보고 (15점)
                  </span>
                  <input
                    type="checkbox"
                    checked={usage.대표_5개_CP_지표평가_보고}
                    onChange={(e) =>
                      set_usage((prev) => ({ ...prev, 대표_5개_CP_지표평가_보고: e.target.checked }))
                    }
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  대표 5개 질환에 대해 재원일수 단축, 항생제 일수, 재입원률 등 최종 성과지표의 전후 비교 결과를 정기 보고 시 15점 만점이 부여됩니다.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 우측: 실시간 시뮬레이션 결과 대시보드 */}
        <div className="lg:col-span-7 space-y-4">
          {/* 상단 4대 핵심 결과 카드 */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* 1. 신포괄 정책가산율 */}
            <div className="bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-900/60 rounded-2xl p-4 shadow-sm relative overflow-hidden">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
                신포괄 정책가산율
              </span>
              <div className="text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400 mt-1">
                +{result.신포괄_정책가산율.toFixed(1)}%
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                최대 1.0% 만점 기준
              </span>
            </div>

            {/* 2. 연간 예상 수가 가산 금액 */}
            <div className="bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900/60 rounded-2xl p-4 shadow-sm relative overflow-hidden">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
                연간 건보 수가 증액분
              </span>
              <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 truncate">
                +{(result.연간_예상_수가_가산금액_만원 / 10000).toFixed(2)}억
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5 block truncate">
                {result.연간_예상_수가_가산금액_만원.toLocaleString()}만 원 / 년
              </span>
            </div>

            {/* 3. 운영평가 종합 득점 */}
            <div className="bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-900/60 rounded-2xl p-4 shadow-sm relative overflow-hidden">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
                운영평가 1.1.8 득점
              </span>
              <div className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
                {result.종합_운영평가_점수}점
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                등급: <strong>{result.운영평가_예상_등급}</strong>
              </span>
            </div>

            {/* 4. 적용률 & 완료율 */}
            <div className="bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-900/60 rounded-2xl p-4 shadow-sm relative overflow-hidden">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
                적용률 / 완료율
              </span>
              <div className="text-xl sm:text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">
                {result.적용률_퍼센트}%
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                완료율 {result.완료율_퍼센트}% (관리 {result.질환별_관리율_퍼센트}%)
              </span>
            </div>
          </div>

          {/* 배점 영역별 상세 게이지 카드 */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-indigo-500" />
                지역거점 공공병원 운영평가 1.1.8 세부 배점 현황 (100점 만점)
              </h3>
              <button
                onClick={handle_copy_report}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 transition"
              >
                {is_copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                {is_copied ? '복사 완료' : '결과 복사'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* ㉠ 개발 영역 점수 게이지 */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    ㉠ 표준진료지침 개발 (50점)
                  </span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    {result.개발_영역_점수}점 / 50점
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${(result.개발_영역_점수 / 50) * 100}%` }}
                  />
                </div>
                <div className="text-[11px] text-slate-500 flex justify-between">
                  <span>체크리스트 충족률</span>
                  <span>{Math.round((result.개발_영역_점수 / 50) * 100)}%</span>
                </div>
              </div>

              {/* ㉡ 적용 영역 점수 게이지 */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    ㉡ 표준진료지침 적용 (50점)
                  </span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {result.적용_영역_점수}점 / 50점
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${(result.적용_영역_점수 / 50) * 100}%` }}
                  />
                </div>
                <div className="text-[11px] text-slate-500 flex justify-between">
                  <span>적용·모니터링 종합률</span>
                  <span>{Math.round((result.적용_영역_점수 / 50) * 100)}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* 득점 개선 및 가산금 증액 액션 플랜 (Gap Analysis) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                가산금 극대화 및 득점 개선 액션 플랜 (Gap 분석)
              </h3>
              <span className="text-[11px] font-semibold text-slate-400">
                미달 항목 {result.개선_처방전_목록.length}건 식별
              </span>
            </div>

            {result.개선_처방전_목록.length === 0 ? (
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <strong>모든 평가 기준을 완벽하게 충족하였습니다!</strong>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-300 mt-0.5">
                    현재 설정 기준으로 신포괄 정책가산율 최대 1.0% 및 지역거점 공공병원 운영평가 100점 만점을 획득할 수 있습니다.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-2.5">
                {result.개선_처방전_목록.map((action, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        {action.항목명}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100">
                        +{action.예상_추가점수}점 획득 가능
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 dark:text-slate-400">
                      <strong>현황:</strong> {action.현재상태}
                    </p>
                    <div className="pt-1 text-[11px] text-amber-950 dark:text-amber-200 font-medium">
                      <strong>개선 권고:</strong> {action.권고조치}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
