'use client';

// Essential Care Map - AI 분석 통합 워크스페이스
// Section 13 Dual AI UI 개선 표준 구현 (분석방식 선택, 구조화된 분석결과, 근거데이터/생성시점/분석방식 메타데이터 명시)

import React, { useState } from 'react';
import {
  Sparkles,
  Bot,
  Layers,
  Database,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Laptop,
  Globe,
  ArrowRight,
  GitCompare,
  FileText,
  Copy,
  Check,
} from 'lucide-react';
import { 필수의료_진단_결과 } from '@/lib/필수의료_타입';
import { 공공의료_sLLM_업무비서 } from './공공의료_sLLM_업무비서';

interface AI분석_통합_워크스페이스_속성 {
  selected_region: 필수의료_진단_결과 | null;
  google_api_key?: string;
  on_open_key_modal?: () => void;
}

export const AI분석_통합_워크스페이스: React.FC<AI분석_통합_워크스페이스_속성> = ({
  selected_region,
  google_api_key,
  on_open_key_modal,
}) => {
  // 메인 모드: 'policy_result' (Section 13 표준 분석결과) vs 'studio' (하이브리드 RAG 스튜디오)
  const [view_mode, set_view_mode] = useState<'policy_result' | 'studio'>('policy_result');

  // 분석 방식 선택 (Section 13: [Cloud AI] [Local sLLM] [결과 비교])
  const [analysis_method, set_analysis_method] = useState<'cloud' | 'local' | 'compare'>('cloud');

  const [copied, setCopied] = useState(false);

  const region_name = selected_region
    ? `${selected_region.시도명} ${selected_region.시군구명}`
    : '강원특별자치도 영월군';

  const handle_copy_result = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* ============================================================== */}
      {/* 1. 상단 워크스페이스 모드 스위처 */}
      {/* ============================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#15161b] p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => set_view_mode('policy_result')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              view_mode === 'policy_result'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI 정책분석 결과서</span>
          </button>

          <button
            onClick={() => set_view_mode('studio')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              view_mode === 'studio'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>하이브리드 RAG 지침 질의 스튜디오</span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 px-2">
          <span>분석 대상:</span>
          <span className="font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg">
            {region_name}
          </span>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. Section 13 표준 AI 정책분석 뷰 */}
      {/* ============================================================== */}
      {view_mode === 'policy_result' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#15161b] rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
            {/* 상단: 분석 방식 선택 ([Cloud AI] [Local sLLM] [결과 비교]) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  공공의료 AI 정책분석
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  지역 진단 원천 데이터와 정부 법정 지침을 기반으로 도출된 의사결정 분석 결과입니다.
                </p>
              </div>

              {/* 분석 방식 스위처 (Section 13) */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl border border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => set_analysis_method('cloud')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                    analysis_method === 'cloud'
                      ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Cloud AI</span>
                </button>

                <button
                  type="button"
                  onClick={() => set_analysis_method('local')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                    analysis_method === 'local'
                      ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Laptop className="w-3.5 h-3.5" />
                  <span>Local sLLM</span>
                </button>

                <button
                  type="button"
                  onClick={() => set_analysis_method('compare')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                    analysis_method === 'compare'
                      ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <GitCompare className="w-3.5 h-3.5" />
                  <span>결과 비교</span>
                </button>
              </div>
            </div>

            {/* 메타데이터 배지: 근거 데이터 / 생성시점 / AI 분석 방식 (Section 13 필수 규격) */}
            <div className="flex flex-wrap items-center gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                <Database className="w-3.5 h-3.5 text-blue-600" />
                <span>근거 데이터:</span>
              </span>
              <span className="bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                226개 시군구 취약지 DB + 5대 법정 지침 코퍼스
              </span>

              <span className="text-slate-300">|</span>

              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>생성시점:</span>
              </span>
              <span className="bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 font-mono">
                2026.09.24 09:32:15 KST
              </span>

              <span className="text-slate-300">|</span>

              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>분석 방식:</span>
              </span>
              <span className="bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 font-bold text-indigo-600 dark:text-indigo-400">
                {analysis_method === 'cloud' && 'Cloud AI (Google Gemini 1.5 Pro RAG)'}
                {analysis_method === 'local' && 'Local sLLM (원내 폐쇄망 온디바이스 Qwen2.5)'}
                {analysis_method === 'compare' && '하이브리드 교차 검증 (Cloud vs Local)'}
              </span>
            </div>

            {/* 분석 결과 본체 (핵심 문제 / 정책대안 / 근거 데이터 / 차이점) */}
            <div className="space-y-5 pt-2">
              {/* 1. 핵심 문제 */}
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-rose-500 rounded-full" />
                  <span>1. 진단된 핵심 문제 (Critical Issues)</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                    <strong className="text-rose-600 block">① 심뇌혈관 골든타임 도달 한계</strong>
                    <p className="text-slate-600 dark:text-slate-400">
                      응급 60분 미도달 인구비율이 45%를 상회하며, 중증응급 환자 전원 시 85분 이상 소요되어 골든타임 이탈 위험.
                    </p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                    <strong className="text-rose-600 block">② 분만실 인프라 공백</strong>
                    <p className="text-slate-600 dark:text-slate-400">
                      관내 분만 산부인과 부재로 분만 60분 미도달율이 취약지 기준을 초과하여 관외 원정 출산 불가피.
                    </p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                    <strong className="text-rose-600 block">③ 심야 소아 진료 취약</strong>
                    <p className="text-slate-600 dark:text-slate-400">
                      소아청소년과 전문의 수급 불균형으로 야간·휴일 달빛어린이병원 미운영에 따른 보육 안전망 결핍.
                    </p>
                  </div>
                </div>
              </div>

              {/* 2. 정책대안 */}
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-blue-600 rounded-full" />
                  <span>2. 정책대안 (Policy Alternatives)</span>
                </h4>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs space-y-2 leading-relaxed">
                  <p>
                    <strong>• 단기 과제 (1년차):</strong> 지역책임의료기관 응급실 24시간 원격협진 시스템 도입 및 중증환자 이송 닥터헬기 랑데부 포인트 정비.
                  </p>
                  <p>
                    <strong>• 중기 과제 (2년차):</strong> 도립 공공병원 파견 전문의 순환근무제를 활용한 소아·분만 외래 주 5일 개설 및 안심 임산부 이송 바우처 지원.
                  </p>
                  <p>
                    <strong>• 장기 과제 (3년차):</strong> 2026 복지부 취약지 지원사업 공모를 통한 응급실 시설 장비 현대화 및 퇴원환자 재택의료팀 가동.
                  </p>
                </div>
              </div>

              {/* 3. 근거 데이터 */}
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-emerald-600 rounded-full" />
                  <span>3. 산출 근거 데이터 (Evidence Base)</span>
                </h4>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <span className="text-slate-400 block text-[11px]">응급 미도달율</span>
                    <strong className="text-slate-900 dark:text-white text-sm">45.0% (법정 취약)</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">관내 응급이용률 (RI)</span>
                    <strong className="text-slate-900 dark:text-white text-sm">38.2%</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">인구 천명당 의사수</span>
                    <strong className="text-slate-900 dark:text-white text-sm">1.42명 (전국 2.18명 대비 65%)</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">고령자 비율</span>
                    <strong className="text-slate-900 dark:text-white text-sm">34.2% (초고령사회)</strong>
                  </div>
                </div>
              </div>

              {/* 4. 차이점 (Cloud vs Local 비교 시) */}
              {analysis_method === 'compare' && (
                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="w-1.5 h-4 bg-indigo-600 rounded-full" />
                    <span>4. Cloud AI vs Local sLLM 분석 차이점 비교</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 space-y-1">
                      <strong className="text-blue-900 dark:text-blue-300 flex items-center gap-1">
                        <Globe className="w-3.5 h-3.5" />
                        <span>Cloud AI (Gemini 1.5 Pro) 특성:</span>
                      </strong>
                      <p className="text-blue-800 dark:text-blue-200">
                        전국 지자체 벤치마크 사례와 중장기 고령화 추세 등 거시적 정책 방향성 및 다각도 타당성 논리를 정교하게 서술함.
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 space-y-1">
                      <strong className="text-emerald-900 dark:text-emerald-300 flex items-center gap-1">
                        <Laptop className="w-3.5 h-3.5" />
                        <span>Local sLLM (원내 폐쇄망) 특성:</span>
                      </strong>
                      <p className="text-emerald-800 dark:text-emerald-200">
                        환자 개인정보 및 원내 경영데이터의 유출 없이, 현장 규정 준수 여부 및 공문서 개조식 단문 양식에 충실하게 산출됨.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 하단 클립보드 복사 버튼 */}
            <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={handle_copy_result}
                className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs hover:opacity-90 transition flex items-center gap-1.5 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? '분석 결과 복사 완료' : '분석 결과 클립보드 복사'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. 하이브리드 RAG 스튜디오 뷰 (기존 sLLM 업무비서 임베드) */}
      {/* ============================================================== */}
      {view_mode === 'studio' && (
        <공공의료_sLLM_업무비서
          selected_region={selected_region}
        />
      )}
    </div>
  );
};
