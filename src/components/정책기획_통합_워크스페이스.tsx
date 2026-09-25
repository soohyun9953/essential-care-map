'use client';

// Essential Care Map - 정책기획 통합 워크스페이스
// Section 11 (AI 정책대안 분석) & Section 12 (사업계획서 자동생성) + 지역비교 및 2030수요예측 통합

import React, { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import {
  Sparkles,
  FileText,
  GitCompare,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ChevronRight,
  Download,
  Copy,
  Sliders,
  ShieldCheck,
  Building2,
  Database,
  Calendar,
  DollarSign,
  Target,
  Edit3,
  Users,
} from 'lucide-react';

import { 필수의료_진단_결과, 지역_평균_통계 } from '@/lib/필수의료_타입';
import { format_number_comma } from '@/lib/유틸리티';
import { 일대일_비교_대시보드 } from './일대일_비교_대시보드';
import { 의료수요_추계_차트 } from './의료수요_추계_차트';
import { 지역_의료자원_집계 } from '@/lib/지역_의료자원_집계';

// 대용량 데이터셋(주제도 지표·환자 유출입·지표정의 코퍼스)을 쓰는 탭은 진입 시점에 지연 로딩
const 의료지표_비교차트 = dynamic(
  () => import('./의료지표_비교차트').then((m) => m.의료지표_비교차트),
  { loading: () => (
    <div className="py-16 text-center text-sm text-[#86868b]">데이터를 불러오는 중입니다...</div>
  ) }
);
const 사업계획서_서술문_생성기 = dynamic(
  () => import('./사업계획서_서술문_생성기').then((m) => m.사업계획서_서술문_생성기),
  { loading: () => (
    <div className="py-16 text-center text-sm text-[#86868b]">데이터를 불러오는 중입니다...</div>
  ) }
);

interface 정책기획_통합_워크스페이스_속성 {
  selected_region: 필수의료_진단_결과 | null;
  diagnosed_list: 필수의료_진단_결과[];
  sido_stat: 지역_평균_통계;
  national_stat: 지역_평균_통계;
  google_api_key?: string;
  initial_tab?: 'policy_ai' | 'report' | 'compare' | 'forecast';
}

export const 정책기획_통합_워크스페이스: React.FC<정책기획_통합_워크스페이스_속성> = ({
  selected_region,
  diagnosed_list,
  sido_stat,
  national_stat,
  google_api_key,
  initial_tab = 'policy_ai',
}) => {
  const [active_tab, setActive_tab] = useState<'policy_ai' | 'report' | 'compare' | 'forecast'>(initial_tab);

  // Section 11: 선택된 정책대안 (Option A / Option B / Option C)
  const [selected_option, setSelected_option] = useState<'A' | 'B' | 'C'>('A');

  // Section 19 표준: 12개 핵심 항목 공문서 사업계획서 상태
  const region_name = selected_region ? `${selected_region.시도명} ${selected_region.시군구명}` : '(지역 선택 필요)';
  const [proposal_form, setProposal_form] = useState({
    사업명: `2026년 ${selected_region?.시군구명 || '○○군'} 필수의료 취약지 인프라 확충 및 책임의료 연계 강화 사업`,
    사업목표: '중증응급환자 관내 이용률(RI) 65% 달성 및 24시간 안전 분만·소아 안심망 구축',
    사업배경: selected_region
      ? `인구 고령화 심화 및 지리적 격차로 인한 60분 골든타임 미도달 인구비율 과다, 관외 유출 심각 (헬스맵 2024)`
      : '지역 현황 데이터를 기반으로 산출된 배경입니다.',
    지역현황: selected_region
      ? `${selected_region.시도명} ${selected_region.시군구명} (인구 ${format_number_comma(selected_region.인구수)}명, 종합 취약도: ${selected_region.종합_취약도_등급})`
      : '지역 선택 필요',
    문제점: selected_region
      ? `권역응급 60분 미도달 ${selected_region.응급_60분_미도달_인구비율}%, 응급 관내이용률 ${selected_region.관내_응급_의료이용률}%, 분만 관내이용률 ${selected_region.관내_분만율}%`
      : '지역을 선택하면 진단 수치가 채워집니다',
    추진전략: '1. 권역 거점병원 - 지역응급실 간 순환진료망 구축, 2. 원격 심뇌혈관 협진 핫라인, 3. 달빛어린이병원 지원',
    세부사업: '1) 응급실 장비 및 24시간 당직 인력 보강, 2) 분만·산부인과 외래 상시 진료체계, 3) 소아 야간·휴일 진료 가산',
    추진체계: '지자체 보건소 - 지역거점 공공병원 - 인근 3차 대학병원 협의체 구성',
    예산: '국비 70% / 지방비 30% 매칭 (연간 25억원 규모 검토)',
    성과지표: '응급 60분 미도달율 10%p 개선, 관내 응급이용률(RI) 65% 달성, 소아 야간진료 만족도 85% 이상',
    추진일정: '2026.01 ~ 2028.12 (총 3개년 사업)',
    기대효과: '지역 내 필수의료 골든타임 확보를 통한 예방가능 외상 사망률 감소 및 원정 진료비 지출 절감',
  });

  const [is_form_editing, setIs_form_editing] = useState(false);
  const [is_saved_toast, setIs_saved_toast] = useState(false);

  // 저장 핸들러
  const handle_save_proposal = () => {
    try {
      if (typeof window !== 'undefined' && selected_region) {
        localStorage.setItem(
          `saved_proposal_${selected_region.시군구코드}`,
          JSON.stringify(proposal_form)
        );
      }
    } catch {
      // ignore
    }
    setIs_saved_toast(true);
    setTimeout(() => setIs_saved_toast(false), 2500);
  };

  // PDF 인쇄 핸들러
  const handle_print_pdf = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };


  // 선택 지역의 기관 목록 집계 (추정값 없음)
  const region_resources = useMemo(
    () => (selected_region ? 지역_의료자원_집계(selected_region.시도명, selected_region.시군구명, selected_region.시군구코드) : null),
    [selected_region]
  );
  // 분야별 판정 결과 (진단 엔진의 판정 근거 그대로 사용)
  const 분야별_판정 = selected_region
    ? [
        { 분야: '응급', 취약: selected_region.응급취약지역_여부, 근거: selected_region.응급_판정근거, 판정가능: true },
        { 분야: '분만', 취약: selected_region.분만취약지역_여부, 근거: selected_region.분만_판정근거, 판정가능: true },
        { 분야: '소아', 취약: selected_region.소아취약지역_여부, 근거: selected_region.소아_판정근거, 판정가능: selected_region.소아_판정_가능 },
      ]
    : [];

  // Journey 배너: 현재 탭에 따른 단계 번호 매핑
  const tab_to_step: Record<string, { step: string; title: string }> = {
    compare:   { step: '02', title: '지역 비교' },
    forecast:  { step: '03', title: '수요 예측' },
    policy_ai: { step: '04', title: 'AI 정책기획' },
    report:    { step: '05', title: '사업계획서' },
  };
  const current_step = tab_to_step[active_tab] ?? { step: '04', title: 'AI 정책기획' };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* ============================================================== */}
      {/* 0. Journey 진행 배너 (현재 단계 동적 표시)                         */}
      {/* ============================================================== */}
      <div className="bg-white dark:bg-[#15161b] rounded-2xl p-4 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* 좌측: 단계 흐름 */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* 01 지역진단 (완료) */}
          <div className="flex items-center gap-1.5 text-slate-400">
            <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-black shrink-0">✓</div>
            <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">01 지역진단</span>
          </div>
          <ChevronRight className="w-3 h-3 text-slate-300 hidden sm:block shrink-0" />

          {/* 현재 활성 탭에 따른 현재 단계 */}
          <div className="flex items-center gap-1.5">
            <div className="w-7 h-7 rounded-full bg-blue-700 text-white flex items-center justify-center text-xs font-black shrink-0">
              {current_step.step}
            </div>
            <div>
              <div className="text-xs font-black text-blue-700 dark:text-blue-400">{current_step.title} (현재 단계)</div>
              <div className="text-[10px] text-slate-500 leading-tight">
                {active_tab === 'compare' && '유사 지역과 의료 인프라 격차 비교'}
                {active_tab === 'forecast' && '2030년 의료수요 변화 예측'}
                {active_tab === 'policy_ai' && 'AI 기반 정책대안 3개 도출'}
                {active_tab === 'report' && '표준 사업계획서 자동 생성'}
              </div>
            </div>
          </div>

          {/* 다음 단계들 (회색) */}
          {active_tab !== 'report' && (
            <>
              <ChevronRight className="w-3 h-3 text-slate-200 hidden sm:block shrink-0" />
              {active_tab === 'compare' && (
                <div className="hidden sm:flex items-center gap-1 text-slate-400">
                  <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 flex items-center justify-center text-[10px] font-black">03</div>
                  <span className="text-[10px] font-semibold">수요 예측</span>
                </div>
              )}
              {(active_tab === 'compare' || active_tab === 'forecast') && (
                <div className="hidden sm:flex items-center gap-1 text-slate-400">
                  <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 flex items-center justify-center text-[10px] font-black">04</div>
                  <span className="text-[10px] font-semibold">AI 정책기획</span>
                </div>
              )}
              {/* 05 사업계획서 - 항상 표시 (상위 조건에서 이미 report 제외) */}
              <div className="hidden sm:flex items-center gap-1 text-slate-400">
                <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 flex items-center justify-center text-[10px] font-black">05</div>
                <span className="text-[10px] font-semibold">사업계획서</span>
              </div>

            </>
          )}
        </div>

        {/* 우측: 다음 단계 CTA */}
        <div className="flex items-center gap-2 shrink-0">
          {active_tab === 'compare' && (
            <button type="button" onClick={() => setActive_tab('forecast')}
              className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 font-bold text-xs hover:bg-amber-100 transition flex items-center gap-1 cursor-pointer border border-amber-200 dark:border-amber-800">
              <span>03 수요 예측</span><ArrowRight className="w-3 h-3" />
            </button>
          )}
          {active_tab === 'forecast' && (
            <button type="button" onClick={() => setActive_tab('policy_ai')}
              className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-bold text-xs hover:bg-emerald-100 transition flex items-center gap-1 cursor-pointer border border-emerald-200 dark:border-emerald-800">
              <span>04 AI 정책기획</span><ArrowRight className="w-3 h-3" />
            </button>
          )}
          {active_tab === 'policy_ai' && (
            <button type="button" onClick={() => setActive_tab('report')}
              className="px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 font-bold text-xs hover:bg-purple-100 transition flex items-center gap-1 cursor-pointer border border-purple-200 dark:border-purple-800">
              <span>05 사업계획서</span><ArrowRight className="w-3 h-3" />
            </button>
          )}
          {active_tab === 'report' && (
            <span className="px-3 py-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-xs border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
              <span>✓ Journey 완료</span>
            </span>
          )}
        </div>
      </div>

      {/* ============================================================== */}
      {/* 1. 상단 워크스페이스 서브탭 네비게이션 */}
      {/* ============================================================== */}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#15161b] p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setActive_tab('policy_ai')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              active_tab === 'policy_ai'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>정책대안 검토 (3대 유형)</span>
          </button>

          <button
            onClick={() => setActive_tab('report')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              active_tab === 'report'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>사업계획서 자동생성</span>
          </button>

          <button
            onClick={() => setActive_tab('compare')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              active_tab === 'compare'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <GitCompare className="w-3.5 h-3.5" />
            <span>유사 지자체 1:1 비교</span>
          </button>

          <button
            onClick={() => setActive_tab('forecast')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              active_tab === 'forecast'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>2030 의료수요 추계</span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 px-2">
          <span>분석 대상:</span>
          <span className="font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg">
            {selected_region ? `${selected_region.시도명} ${selected_region.시군구명}` : '지역 미선택'}
          </span>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. TAB 1: AI 정책기획 Workspace (Section 16, 17, 18 3단 구조)      */}
      {/* ============================================================== */}
      {active_tab === 'policy_ai' && (
        <div className="space-y-6">

          {/* 상단 안내 바 */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white dark:bg-[#15161b] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                  04 AI 정책기획 · Workspace
                </span>
                <span className="text-xs text-slate-400">Section 16 ~ 18 표준 정책분석 작업 공간</span>
              </div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white mt-1">
                {selected_region ? `${selected_region.시도명} ${selected_region.시군구명}` : '지역 미선택'} 필수의료 정책대안 검토 &amp; 선택
              </h2>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold border border-slate-200 dark:border-slate-700">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>진단 수치: 실데이터 기준 • 대안: 정책 표준 Option</span>
            </div>
          </div>

          {/* Section 16 표준: 3단 컬럼 정책분석 Workspace (좌측 / 중앙 / 우측) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* [1단 - 좌측] 지역 현황 및 주요 문제 (Section 16) */}
            <div className="lg:col-span-3 bg-white dark:bg-[#15161b] p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                  Step 1 · 지역 현황
                </span>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  {selected_region ? `${selected_region.시군구명}` : '지역 선택 필요'}
                </h3>
                <span className="text-xs text-slate-500">
                  {selected_region ? `${selected_region.시도명} • 인구 ${format_number_comma(selected_region.인구수)}명` : '-'}
                </span>
              </div>

              {/* 종합 등급 */}
              {selected_region && (
                <div className="p-3 rounded-2xl bg-red-50/60 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">종합 취약도:</span>
                  <span className="text-xs font-black text-red-600 bg-white dark:bg-slate-900 px-2.5 py-0.5 rounded-lg border border-red-200">
                    {selected_region.종합_취약도_등급} ({selected_region.취약분야_수}/3개 취약)
                  </span>
                </div>
              )}

              {/* 주요 문제 3가지 (Section 16 표준) */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  주요 핵심 문제:
                </span>
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-0.5">
                    <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                      <span>응급의료 접근성 결핍</span>
                    </div>
                    <p className="text-[11px] text-slate-500 pl-3">
                      60분 미도달 {selected_region?.응급_60분_미도달_인구비율}% • 관내이용률 {selected_region?.관내_응급_의료이용률}%
                    </p>
                  </div>

                  <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-0.5">
                    <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                      <span>분만 의료공백 심화</span>
                    </div>
                    <p className="text-[11px] text-slate-500 pl-3">
                      60분 미도달 {selected_region?.분만_60분_미도달_인구비율}% • 관내분만율 {selected_region?.관내_분만율}%
                    </p>
                  </div>

                  <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-0.5">
                    <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      <span>소아 및 전문의 부족</span>
                    </div>
                    <p className="text-[11px] text-slate-500 pl-3">
                      {selected_region?.소아_야간휴일_접근성지수 !== null ? `야간접근성 ${selected_region?.소아_야간휴일_접근성지수}점` : '자료 미확보'} • 달빛어린이병원 {region_resources?.달빛어린이병원_수 || 0}개소
                    </p>
                  </div>
                </div>
              </div>

              {/* 데이터 기준 명시 (Section 17) */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 space-y-1">
                <div>• 기준년도: 2024년</div>
                <div>• 출처: 공공보건의료통계 / 헬스맵 2024</div>
                <div>• 고시: 2026.09 보건복지부 취약지 고시</div>
              </div>
            </div>

            {/* [2단 - 중앙] AI 정책 분석 & 대안 3개 선택 (Section 16 & 18) */}
            <div className="lg:col-span-5 space-y-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Step 2 · AI 정책대안 3선 (1개 선택)
                </span>
                <span className="text-[11px] text-blue-600 font-semibold">선택 시 우측에 상세 반영</span>
              </div>

              {/* Option 01 (A) */}
              <div
                onClick={() => setSelected_option('A')}
                className={`p-4 rounded-3xl border-2 transition-all cursor-pointer space-y-3 ${
                  selected_option === 'A'
                    ? 'border-blue-600 bg-blue-50/40 dark:bg-blue-950/30 shadow-md ring-2 ring-blue-500/20'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#15161b] hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="policy_option"
                      checked={selected_option === 'A'}
                      onChange={() => setSelected_option('A')}
                      className="w-4 h-4 text-blue-600 cursor-pointer"
                    />
                    <div>
                      <span className="text-[10px] font-black text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-950 px-2 py-0.5 rounded-md">
                        정책대안 01 · Option A
                      </span>
                      <h4 className="text-sm font-black text-slate-900 dark:text-white mt-0.5">
                        응급의료 인프라 및 골든타임 강화형
                      </h4>
                    </div>
                  </div>
                  {selected_option === 'A' && <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pl-6">
                  관내 응급실 시설·장비 승격, 24시간 응급의학과 전문의 확충 및 심뇌혈관 원격협진망을 구축합니다.
                </p>
                {/* 근거 데이터 표시 (Section 17) */}
                <div className="ml-6 p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 text-[10px] text-slate-500 space-y-0.5">
                  <span className="font-bold text-slate-700 dark:text-slate-300">근거 데이터:</span> 응급 60분 미도달 {selected_region?.응급_60분_미도달_인구비율}% • 관내이용률 {selected_region?.관내_응급_의료이용률}% (2024 헬스맵)
                </div>
              </div>

              {/* Option 02 (B) */}
              <div
                onClick={() => setSelected_option('B')}
                className={`p-4 rounded-3xl border-2 transition-all cursor-pointer space-y-3 ${
                  selected_option === 'B'
                    ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/30 shadow-md ring-2 ring-indigo-500/20'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#15161b] hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="policy_option"
                      checked={selected_option === 'B'}
                      onChange={() => setSelected_option('B')}
                      className="w-4 h-4 text-indigo-600 cursor-pointer"
                    />
                    <div>
                      <span className="text-[10px] font-black text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-950 px-2 py-0.5 rounded-md">
                        정책대안 02 · Option B
                      </span>
                      <h4 className="text-sm font-black text-slate-900 dark:text-white mt-0.5">
                        인근 3차 권역 연계 Fast-Track 핫라인형
                      </h4>
                    </div>
                  </div>
                  {selected_option === 'B' && <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0" />}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pl-6">
                  자체 병상 대규모 신축 대신 인근 거점 대학병원과의 이송 핫라인과 닥터헬기 인계점을 극대화합니다.
                </p>
                {/* 근거 데이터 표시 (Section 17) */}
                <div className="ml-6 p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 text-[10px] text-slate-500 space-y-0.5">
                  <span className="font-bold text-slate-700 dark:text-slate-300">근거 데이터:</span> 보유 응급기관 {region_resources?.응급의료기관.length || 0}개소 • 인근 3차 대학병원 전원 핫라인 연계
                </div>
              </div>

              {/* Option 03 (C) */}
              <div
                onClick={() => setSelected_option('C')}
                className={`p-4 rounded-3xl border-2 transition-all cursor-pointer space-y-3 ${
                  selected_option === 'C'
                    ? 'border-emerald-600 bg-emerald-50/40 dark:bg-emerald-950/30 shadow-md ring-2 ring-emerald-500/20'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#15161b] hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="policy_option"
                      checked={selected_option === 'C'}
                      onChange={() => setSelected_option('C')}
                      className="w-4 h-4 text-emerald-600 cursor-pointer"
                    />
                    <div>
                      <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-md">
                        정책대안 03 · Option C
                      </span>
                      <h4 className="text-sm font-black text-slate-900 dark:text-white mt-0.5">
                        의료인력 확보 및 모자·소아 특화 안심망형
                      </h4>
                    </div>
                  </div>
                  {selected_option === 'C' && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pl-6">
                  시니어 의사 채용 연계와 분만·소아 진료소를 지원하여 영유아와 가임기 여성의 의료접근성을 보장합니다.
                </p>
                {/* 근거 데이터 표시 (Section 17) */}
                <div className="ml-6 p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 text-[10px] text-slate-500 space-y-0.5">
                  <span className="font-bold text-slate-700 dark:text-slate-300">근거 데이터:</span> 분만 60분 미도달 {selected_region?.분만_60분_미도달_인구비율}% • 관내분만율 {selected_region?.관내_분만율}%
                </div>
              </div>
            </div>

            {/* [3단 - 우측] 선택 정책대안 상세 패널 (Section 16: 목표/대상/추진방안/예상효과/필요자원) */}
            <div className="lg:col-span-4 bg-white dark:bg-[#15161b] p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-wider block mb-1">
                  Step 3 · 정책대안 상세 명세서
                </span>
                <h4 className="text-base font-black text-slate-900 dark:text-white">
                  Option {selected_option} 상세 실행계획
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  {selected_option === 'A' && '응급의료 인프라 및 골든타임 강화형 세부안'}
                  {selected_option === 'B' && '인근 3차 권역 연계 Fast-Track 핫라인형 세부안'}
                  {selected_option === 'C' && '의료인력 확보 및 모자·소아 특화 안심망형 세부안'}
                </p>
              </div>

              <div className="space-y-3 text-xs">
                {/* 목표 */}
                <div className="space-y-1">
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">■ 정책 목표:</span>
                  <p className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 leading-relaxed">
                    {selected_option === 'A' && '중증응급환자 관내 이용률(RI) 65% 달성 및 60분 내 적정 치료율 제고'}
                    {selected_option === 'B' && '골든타임 내 초동처치율 90% 달성 및 3차 상급병원 전원 지연 시간 단축'}
                    {selected_option === 'C' && '관내 24시간 소아 야간 진료망 확보 및 안전 분만 인프라 유지'}
                  </p>
                </div>

                {/* 대상 */}
                <div className="space-y-1">
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">■ 주요 수혜 대상:</span>
                  <p className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300">
                    {selected_option === 'A' && `${selected_region?.시군구명 || '지역'} 내 급성기 심뇌혈관 및 중증외상 응급환자`}
                    {selected_option === 'B' && `${selected_region?.시군구명 || '지역'} 및 인근 진료권 광역 전원 대상 환자`}
                    {selected_option === 'C' && `${selected_region?.시군구명 || '지역'} 내 영유아, 소아청소년 및 가임기 여성 산모`}
                  </p>
                </div>

                {/* 추진방안 */}
                <div className="space-y-1">
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">■ 추진 방안:</span>
                  <ul className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 space-y-1 list-disc list-inside">
                    {selected_option === 'A' && (
                      <>
                        <li>지역응급실 시설 보강 및 전문의 순환 당직제</li>
                        <li>거점병원 간 실시간 원격 심뇌혈관 협진망</li>
                        <li>닥터헬기 인계점 및 구급대 직접 이송 정비</li>
                      </>
                    )}
                    {selected_option === 'B' && (
                      <>
                        <li>3차 대학병원 - 관내병원 간 Fast-Track 협약 체결</li>
                        <li>119 구급대 전원 상황실 실시간 병상 연계</li>
                        <li>급성기 시술 후 지역병원 회송 재활 체계 구축</li>
                      </>
                    )}
                    {selected_option === 'C' && (
                      <>
                        <li>달빛어린이병원 지정 및 야간·휴일 소아진료 가산 지원</li>
                        <li>외래 산부인과 상시 운영 및 모자보건 서비스 강화</li>
                        <li>국립중앙의료원 공공임상교수제 및 시니어 의사 매칭</li>
                      </>
                    )}
                  </ul>
                </div>

                {/* 예상효과 및 필요자원 */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 space-y-0.5">
                    <span className="font-bold text-slate-700 dark:text-slate-300 block">■ 예상 효과:</span>
                    <span className="text-[11px] text-slate-500">직접 입력 필요 (임의 수치 미생성)</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 space-y-0.5">
                    <span className="font-bold text-slate-700 dark:text-slate-300 block">■ 필요 자원:</span>
                    <span className="text-[11px] text-slate-500">전문의, 운영비, 의료장비</span>
                  </div>
                </div>
              </div>

              {/* Section 18 표준: 사업계획서 생성 단계로 이동 CTA */}
              <button
                type="button"
                onClick={() => setActive_tab('report')}
                className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <span>Option {selected_option}으로 사업계획서 생성하기</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}


      {/* ============================================================== */}
      {/* 3. TAB 2: 사업계획서 자동생성 (Section 12 Flow & 8대 항목 사전 확인) */}
      {/* ============================================================== */}
      {active_tab === 'report' && (
        <div className="space-y-6">
          {/* Section 19 표준: 12대 항목 사업계획서 사전 검토 & 직접 편집 패널 */}
          <div className="bg-white dark:bg-[#15161b] rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
            {/* 상단 툴바 및 5대 액션 버튼 바 (Section 19) */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2.5 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
                    Section 19 표준 공문서 체계
                  </span>
                  <span className="text-xs text-slate-400">12대 필수 법정·공모 항목</span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  <span>공공보건의료 사업계획서 12대 항목 실무 검토 &amp; 편집기</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  지역 진단 데이터와 선택한 Option {selected_option}을 기반으로 자동 작성된 초안입니다. 모든 항목을 자유롭게 수정 및 저장할 수 있습니다.
                </p>
              </div>

              {/* 5대 액션 버튼 바 (Section 19 표준: AI 초안 생성, 직접 수정, 저장, PDF, HWPX) */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* 1. 직접 수정 / 수정 완료 토글 */}
                <button
                  type="button"
                  onClick={() => setIs_form_editing(!is_form_editing)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs ${
                    is_form_editing
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{is_form_editing ? '수정 완료' : '직접 수정'}</span>
                </button>

                {/* 2. 임시 저장 */}
                <button
                  type="button"
                  onClick={handle_save_proposal}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{is_saved_toast ? '✓ 저장 완료!' : '저장'}</span>
                </button>

                {/* 3. PDF 인쇄/저장 */}
                <button
                  type="button"
                  onClick={handle_print_pdf}
                  className="px-3.5 py-2 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 hover:bg-blue-100 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs border border-blue-200 dark:border-blue-800"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>PDF 인쇄</span>
                </button>
              </div>
            </div>

            {/* Section 19 표준: 12대 항목 폼 그리드 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* 1. 사업명 */}
              <div className="space-y-1 md:col-span-2">
                <label className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-600" />
                  <span>1. 사업명 (Project Title)</span>
                </label>
                {is_form_editing ? (
                  <input
                    type="text"
                    value={proposal_form.사업명}
                    onChange={(e) => setProposal_form({ ...proposal_form, 사업명: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-blue-300 rounded-xl font-bold"
                  />
                ) : (
                  <p className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 font-black text-slate-900 dark:text-white border border-slate-100 dark:border-slate-800">
                    {proposal_form.사업명}
                  </p>
                )}
              </div>

              {/* 2. 사업목표 */}
              <div className="space-y-1">
                <label className="font-bold text-slate-800 dark:text-slate-200">2. 사업목표 (Goal)</label>
                {is_form_editing ? (
                  <textarea
                    rows={2}
                    value={proposal_form.사업목표}
                    onChange={(e) => setProposal_form({ ...proposal_form, 사업목표: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border rounded-xl"
                  />
                ) : (
                  <p className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 font-medium text-slate-700 dark:text-slate-300 min-h-[58px]">
                    {proposal_form.사업목표}
                  </p>
                )}
              </div>

              {/* 3. 사업배경 */}
              <div className="space-y-1">
                <label className="font-bold text-slate-800 dark:text-slate-200">3. 사업배경 (Background)</label>
                {is_form_editing ? (
                  <textarea
                    rows={2}
                    value={proposal_form.사업배경}
                    onChange={(e) => setProposal_form({ ...proposal_form, 사업배경: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border rounded-xl"
                  />
                ) : (
                  <p className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 font-medium text-slate-700 dark:text-slate-300 min-h-[58px]">
                    {proposal_form.사업배경}
                  </p>
                )}
              </div>

              {/* 4. 지역현황 */}
              <div className="space-y-1">
                <label className="font-bold text-slate-800 dark:text-slate-200">4. 지역현황 (Status)</label>
                {is_form_editing ? (
                  <input
                    type="text"
                    value={proposal_form.지역현황}
                    onChange={(e) => setProposal_form({ ...proposal_form, 지역현황: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border rounded-xl"
                  />
                ) : (
                  <p className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 font-medium text-slate-700 dark:text-slate-300">
                    {proposal_form.지역현황}
                  </p>
                )}
              </div>

              {/* 5. 문제점 */}
              <div className="space-y-1">
                <label className="font-bold text-slate-800 dark:text-slate-200">5. 문제점 및 취약요인 (Problems)</label>
                {is_form_editing ? (
                  <input
                    type="text"
                    value={proposal_form.문제점}
                    onChange={(e) => setProposal_form({ ...proposal_form, 문제점: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border rounded-xl"
                  />
                ) : (
                  <p className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 font-medium text-slate-700 dark:text-slate-300">
                    {proposal_form.문제점}
                  </p>
                )}
              </div>

              {/* 6. 추진전략 */}
              <div className="space-y-1 md:col-span-2">
                <label className="font-bold text-slate-800 dark:text-slate-200">6. 추진전략 (Strategy)</label>
                {is_form_editing ? (
                  <textarea
                    rows={2}
                    value={proposal_form.추진전략}
                    onChange={(e) => setProposal_form({ ...proposal_form, 추진전략: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border rounded-xl"
                  />
                ) : (
                  <p className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 font-medium text-slate-700 dark:text-slate-300">
                    {proposal_form.추진전략}
                  </p>
                )}
              </div>

              {/* 7. 세부사업 */}
              <div className="space-y-1 md:col-span-2">
                <label className="font-bold text-slate-800 dark:text-slate-200">7. 세부사업 (Action Plans)</label>
                {is_form_editing ? (
                  <textarea
                    rows={2}
                    value={proposal_form.세부사업}
                    onChange={(e) => setProposal_form({ ...proposal_form, 세부사업: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border rounded-xl"
                  />
                ) : (
                  <p className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 font-medium text-slate-700 dark:text-slate-300">
                    {proposal_form.세부사업}
                  </p>
                )}
              </div>

              {/* 8. 추진체계 */}
              <div className="space-y-1">
                <label className="font-bold text-slate-800 dark:text-slate-200">8. 추진체계 (Governance)</label>
                {is_form_editing ? (
                  <input
                    type="text"
                    value={proposal_form.추진체계}
                    onChange={(e) => setProposal_form({ ...proposal_form, 추진체계: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border rounded-xl"
                  />
                ) : (
                  <p className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 font-medium text-slate-700 dark:text-slate-300">
                    {proposal_form.추진체계}
                  </p>
                )}
              </div>

              {/* 9. 소요예산 */}
              <div className="space-y-1">
                <label className="font-bold text-slate-800 dark:text-slate-200">9. 소요예산 (Budget)</label>
                {is_form_editing ? (
                  <input
                    type="text"
                    value={proposal_form.예산}
                    onChange={(e) => setProposal_form({ ...proposal_form, 예산: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border rounded-xl"
                  />
                ) : (
                  <p className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 font-medium text-slate-700 dark:text-slate-300">
                    {proposal_form.예산}
                  </p>
                )}
              </div>

              {/* 10. 성과지표 */}
              <div className="space-y-1">
                <label className="font-bold text-slate-800 dark:text-slate-200">10. 핵심 성과지표 (KPI)</label>
                {is_form_editing ? (
                  <input
                    type="text"
                    value={proposal_form.성과지표}
                    onChange={(e) => setProposal_form({ ...proposal_form, 성과지표: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border rounded-xl"
                  />
                ) : (
                  <p className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 font-medium text-slate-700 dark:text-slate-300">
                    {proposal_form.성과지표}
                  </p>
                )}
              </div>

              {/* 11. 추진일정 */}
              <div className="space-y-1">
                <label className="font-bold text-slate-800 dark:text-slate-200">11. 추진일정 (Timeline)</label>
                {is_form_editing ? (
                  <input
                    type="text"
                    value={proposal_form.추진일정}
                    onChange={(e) => setProposal_form({ ...proposal_form, 추진일정: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border rounded-xl"
                  />
                ) : (
                  <p className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 font-medium text-slate-700 dark:text-slate-300">
                    {proposal_form.추진일정}
                  </p>
                )}
              </div>

              {/* 12. 기대효과 */}
              <div className="space-y-1 md:col-span-2">
                <label className="font-bold text-slate-800 dark:text-slate-200">12. 기대효과 (Impact)</label>
                {is_form_editing ? (
                  <textarea
                    rows={2}
                    value={proposal_form.기대효과}
                    onChange={(e) => setProposal_form({ ...proposal_form, 기대효과: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border rounded-xl"
                  />
                ) : (
                  <p className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 font-medium text-slate-700 dark:text-slate-300">
                    {proposal_form.기대효과}
                  </p>
                )}
              </div>
            </div>
          </div>


          {/* 기존 보건복지부 표준 개조식 사업계획서 자동생성기 임베드 (HWPX 다운로드 지원) */}
          <div className="bg-white dark:bg-[#15161b] rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
            <사업계획서_서술문_생성기
              selected_region={selected_region}
              sido_stat={sido_stat}
              national_stat={national_stat}
              google_api_key={google_api_key}
            />
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. TAB 3: 유사 지자체 1:1 비교 (일대일_비교_대시보드) */}
      {/* ============================================================== */}
      {active_tab === 'compare' && (
        <div className="bg-white dark:bg-[#15161b] rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
          <일대일_비교_대시보드
            selected_region={selected_region}
            diagnosed_list={diagnosed_list}
            on_navigate_step={(step) => {
              if (step === 'forecast') setActive_tab('forecast');
            }}
          />
        </div>
      )}

      {/* ============================================================== */}
      {/* 5. TAB 4: 2030 의료수요 추계 및 지표 비교 */}
      {/* ============================================================== */}
      {active_tab === 'forecast' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-stretch">
            <div className="bg-white dark:bg-[#15161b] rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
              <의료수요_추계_차트
                selected_region={selected_region}
                on_navigate_step={(step) => {
                  if (step === 'policy_ai') setActive_tab('policy_ai');
                  else if (step === 'compare') setActive_tab('compare');
                }}
              />
            </div>
            <div className="bg-white dark:bg-[#15161b] rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
              <의료지표_비교차트
                selected_region={selected_region}
                sido_stat={sido_stat}
                national_stat={national_stat}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
