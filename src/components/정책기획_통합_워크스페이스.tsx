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

  // Section 12: 8개 항목 사전 확인/수정 상태
  const region_name = selected_region ? `${selected_region.시도명} ${selected_region.시군구명}` : '(지역 선택 필요)';
  const [proposal_form, setProposal_form] = useState({
    사업명: `2026년 ${selected_region?.시군구명 || '○○군'} 필수의료 취약지 인프라 확충 및 책임의료 연계 강화 사업`,
    대상지역: region_name,
    문제정의: selected_region
      ? `권역응급 60분 미도달 ${selected_region.응급_60분_미도달_인구비율}%, 응급 관내이용률 ${selected_region.관내_응급_의료이용률}%, 분만 관내이용률 ${selected_region.관내_분만율}% (헬스맵 2024)`
      : '지역을 선택하면 진단 수치가 채워집니다',
    정책목표: '중증응급환자 관내 이용률(RI) 65% 달성 및 24시간 안전 분만·소아 안심망 구축',
    추진과제: '1. 지역응급실 시설장비 보강, 2. 거점병원 순환전문의 파견, 3. 퇴원환자 재택케어 연계',
    기대효과: '직접 입력 필요 (플랫폼에 효과 산출 근거 없음)',
    예산: '직접 입력 필요 (플랫폼에 예산 산출 근거 없음)',
    추진기간: '2026.01 ~ 2028.12 (3개년 사업)',
  });

  const [is_form_editing, setIs_form_editing] = useState(false);

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

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
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
      {/* 2. TAB 1: AI 정책대안 분석 (Section 11) */}
      {/* ============================================================== */}
      {active_tab === 'policy_ai' && (
        <div className="space-y-6">
          {/* 헤더 및 분석 근거 명시 */}
          <div className="bg-white dark:bg-[#15161b] rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                  Policy Review
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                  {selected_region ? selected_region.시군구명 : '지역 미선택'} 필수의료 정책대안 검토
                </h2>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold border border-slate-200 dark:border-slate-700">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>진단 수치는 실데이터 · 대안은 유형 예시 (AI 생성 아님)</span>
              </div>
            </div>

            {/* 4대 분석 근거 데이터 카드 */}
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
                정책 검토 근거
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                  <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-blue-600" />
                    <span>지역 의료데이터</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {selected_region
                      ? `응급 미도달 ${selected_region.응급_60분_미도달_인구비율}%, 응급 관내이용률 ${selected_region.관내_응급_의료이용률}%, 분만 관내이용률 ${selected_region.관내_분만율}% (헬스맵 2024)`
                      : '지역을 선택하세요'}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                  <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                    <span>의료자원 데이터</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {region_resources
                      ? `공공의료기관 ${region_resources.공공의료기관_수}곳(${format_number_comma(region_resources.공공의료기관_병상)}병상), 응급의료기관 ${region_resources.응급의료기관.length}곳, 분만 가능 기관 ${region_resources.분만기관_수}곳, 달빛어린이병원 ${region_resources.달빛어린이병원_수}곳`
                      : '지역을 선택하세요'}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                  <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-amber-600" />
                    <span>인구</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {selected_region ? `인구 ${format_number_comma(selected_region.인구수)}명 (헬스맵 2024) · 고령자 비율은 내장 자료 없음` : '지역을 선택하세요'}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                  <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-emerald-600" />
                    <span>5대 정부 사업 가이드</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    2026 복지부 취약지 지원, CP 보급, 신포괄 정책가산
                  </p>
                </div>
              </div>
            </div>

            {/* 핵심 문제 3가지 */}
            <div className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40 text-xs space-y-2">
              <span className="font-bold text-rose-800 dark:text-rose-300">
                분야별 진단 결과 (법정·플랫폼 기준 판정):
              </span>
              {selected_region ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-rose-900 dark:text-rose-200">
                  {분야별_판정.map((p, i) => (
                    <div key={p.분야} className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/60 border border-rose-100 dark:border-rose-900/30">
                      <strong>
                        {['①', '②', '③'][i]} {p.분야}: {!p.판정가능 ? '자료 없음' : p.취약 ? '취약' : '기준 충족'}
                      </strong>{' '}
                      — {p.근거}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-rose-900 dark:text-rose-200">지역을 선택하면 분야별 판정이 표시됩니다.</p>
              )}
            </div>
          </div>

          {/* AI 3대 정책대안 카드 (Option A / B / C) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                정책대안 유형 (3대 Option 비교)
              </h3>
              <span className="text-xs text-slate-400">유형 예시입니다. 예산·효과는 사업 설계 시 직접 산정하세요</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Option A */}
              <div
                onClick={() => setSelected_option('A')}
                className={`p-6 rounded-3xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
                  selected_option === 'A'
                    ? 'border-blue-600 dark:border-blue-500 bg-blue-50/30 dark:bg-blue-950/20 shadow-md ring-2 ring-blue-500/20'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#15161b] hover:border-slate-300'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                      Option A{selected_region?.응급취약지역_여부 && ' · 응급 취약 지역'}
                    </span>
                    {selected_option === 'A' && (
                      <CheckCircle2 className="w-5 h-5 text-blue-600" />
                    )}
                  </div>
                  <h4 className="text-base font-black text-slate-900 dark:text-white">
                    응급의료 인프라 강화형
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    관내 지역응급실을 지역응급의료센터 수준으로 승격하고, 24시간 응급의학과 전문의 및 심뇌혈관 원격협진망을 구축합니다.
                  </p>
                </div>

                <div className="space-y-1.5 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>예상 소요예산·효과:</span>
                    <strong className="text-slate-400">산출 근거 없음</strong>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>주요 수혜 대상:</span>
                    <span>중증응급 및 급성기 심뇌환자</span>
                  </div>
                </div>
              </div>

              {/* Option B */}
              <div
                onClick={() => setSelected_option('B')}
                className={`p-6 rounded-3xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
                  selected_option === 'B'
                    ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/30 dark:bg-indigo-950/20 shadow-md ring-2 ring-indigo-500/20'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#15161b] hover:border-slate-300'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                      Option B
                    </span>
                    {selected_option === 'B' && (
                      <CheckCircle2 className="w-5 h-5 text-indigo-600" />
                    )}
                  </div>
                  <h4 className="text-base font-black text-slate-900 dark:text-white">
                    인근 권역 연계 핫라인 강화형
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    자체 시설 확충 대신 인근 3차 대학병원과의 Fast-Track 이송 핫라인과 닥터헬기 인계점 및 구급차 이송 역량을 극대화합니다.
                  </p>
                </div>

                <div className="space-y-1.5 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>예상 소요예산·효과:</span>
                    <strong className="text-slate-400">산출 근거 없음</strong>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>주요 수혜 대상:</span>
                    <span>고난도 뇌혈관·외상 수술 환자</span>
                  </div>
                </div>
              </div>

              {/* Option C */}
              <div
                onClick={() => setSelected_option('C')}
                className={`p-6 rounded-3xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
                  selected_option === 'C'
                    ? 'border-emerald-600 dark:border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/20 shadow-md ring-2 ring-emerald-500/20'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#15161b] hover:border-slate-300'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                      Option C{(selected_region?.분만취약지역_여부 || selected_region?.소아취약지역_여부) && ' · 분만·소아 취약 지역'}
                    </span>
                    {selected_option === 'C' && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    )}
                  </div>
                  <h4 className="text-base font-black text-slate-900 dark:text-white">
                    의료인력 확보 및 모자·소아 특화형
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    시니어 의사 채용 연계와 공공병원 파견 제도를 통해 소아과·산부인과 외래를 주 5일 상시 가동하고 달빛어린이병원을 개설합니다.
                  </p>
                </div>

                <div className="space-y-1.5 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>예상 소요예산·효과:</span>
                    <strong className="text-slate-400">산출 근거 없음</strong>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>주요 수혜 대상:</span>
                    <span>영유아 및 가임기 여성 주민</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 하단 CTA: 사업계획서 생성 연결 */}
            <div className="p-5 rounded-3xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-0.5">
                <span className="text-xs text-blue-400 font-bold">선택한 대안: Option {selected_option}</span>
                <p className="text-sm font-semibold">
                  이 대안을 바탕으로 보건복지부 표준 공모 사업계획서를 자동 생성하시겠습니까?
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setActive_tab('report');
                }}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition active:scale-95 shrink-0 flex items-center gap-1.5 cursor-pointer"
              >
                <span>사업계획서 생성 단계로 이동</span>
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
          {/* 8개 항목 사전 확인/수정 패널 (Section 12) */}
          <div className="bg-white dark:bg-[#15161b] rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  <span>사업계획서 생성 전 8대 필수 항목 검토 &amp; 수정</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  지역 진단 데이터와 선택한 정책대안(Option {selected_option})을 바탕으로 채운 초안입니다. 기대효과·예산은 직접 입력하세요.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIs_form_editing(!is_form_editing)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{is_form_editing ? '수정 완료' : '직접 편집'}</span>
              </button>
            </div>

            {/* 8대 항목 폼 그리드 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">1. 사업명</label>
                {is_form_editing ? (
                  <input
                    type="text"
                    value={proposal_form.사업명}
                    onChange={(e) => setProposal_form({ ...proposal_form, 사업명: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-900 border rounded-xl"
                  />
                ) : (
                  <p className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 font-semibold text-slate-900 dark:text-white">
                    {proposal_form.사업명}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">2. 대상지역</label>
                {is_form_editing ? (
                  <input
                    type="text"
                    value={proposal_form.대상지역}
                    onChange={(e) => setProposal_form({ ...proposal_form, 대상지역: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-900 border rounded-xl"
                  />
                ) : (
                  <p className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 font-semibold text-slate-900 dark:text-white">
                    {proposal_form.대상지역}
                  </p>
                )}
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="font-bold text-slate-700 dark:text-slate-300">3. 문제정의 (지역 취약 원인)</label>
                {is_form_editing ? (
                  <textarea
                    rows={2}
                    value={proposal_form.문제정의}
                    onChange={(e) => setProposal_form({ ...proposal_form, 문제정의: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-900 border rounded-xl"
                  />
                ) : (
                  <p className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 font-medium text-slate-700 dark:text-slate-300">
                    {proposal_form.문제정의}
                  </p>
                )}
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="font-bold text-slate-700 dark:text-slate-300">4. 정책목표</label>
                {is_form_editing ? (
                  <input
                    type="text"
                    value={proposal_form.정책목표}
                    onChange={(e) => setProposal_form({ ...proposal_form, 정책목표: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-900 border rounded-xl"
                  />
                ) : (
                  <p className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 font-medium text-slate-700 dark:text-slate-300">
                    {proposal_form.정책목표}
                  </p>
                )}
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="font-bold text-slate-700 dark:text-slate-300">5. 핵심 추진과제</label>
                {is_form_editing ? (
                  <input
                    type="text"
                    value={proposal_form.추진과제}
                    onChange={(e) => setProposal_form({ ...proposal_form, 추진과제: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-900 border rounded-xl"
                  />
                ) : (
                  <p className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 font-medium text-slate-700 dark:text-slate-300">
                    {proposal_form.추진과제}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">6. 기대효과</label>
                {is_form_editing ? (
                  <input
                    type="text"
                    value={proposal_form.기대효과}
                    onChange={(e) => setProposal_form({ ...proposal_form, 기대효과: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-900 border rounded-xl"
                  />
                ) : (
                  <p className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 font-medium text-slate-700 dark:text-slate-300">
                    {proposal_form.기대효과}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">7. 총 예산 / 8. 추진기간</label>
                {is_form_editing ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={proposal_form.예산}
                      onChange={(e) => setProposal_form({ ...proposal_form, 예산: e.target.value })}
                      className="w-full p-2 bg-slate-50 dark:bg-slate-900 border rounded-xl"
                    />
                    <input
                      type="text"
                      value={proposal_form.추진기간}
                      onChange={(e) => setProposal_form({ ...proposal_form, 추진기간: e.target.value })}
                      className="w-full p-2 bg-slate-50 dark:bg-slate-900 border rounded-xl"
                    />
                  </div>
                ) : (
                  <p className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 font-medium text-slate-700 dark:text-slate-300">
                    {proposal_form.예산} • {proposal_form.추진기간}
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
              <의료수요_추계_차트 selected_region={selected_region} />
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
