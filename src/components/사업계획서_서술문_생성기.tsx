'use client';

// Apple Notes / Pages 감성의 공문서 개조식 사업계획서 실시간 자동 생성기 컴포넌트
// 1~4단계 실데이터(214개 공공병원, 24개 지표 6개년 추이, 2024 환자 유출입 OD, 331개 헬스맵 지표정의 RAG) 완벽 통합

import React, { useState, useEffect, useMemo } from 'react';
import {
  Copy,
  Check,
  Download,
  FileText,
  Sparkles,
  Search,
  BookOpen,
  Building2,
  Activity,
  ShieldAlert,
  Baby,
  Stethoscope,
  ChevronRight,
  ExternalLink,
  Info,
  Loader2,
  RefreshCw,
  Sliders,
  Share2,
} from 'lucide-react';
import { 필수의료_진단_결과, 지역_평균_통계, 사업계획서_서술문_패키지 } from '@/lib/필수의료_타입';
import { 사업계획서_문안_생성기 } from '@/lib/필수의료_엔진';
import { copy_text_to_clipboard } from '@/lib/유틸리티';
import {
  사업계획서_AI_엔진,
  공모_분야_목록,
  공모_분야_타입,
  AI_사업계획서_생성_결과,
} from '@/lib/사업계획서_AI_엔진';
import {
  헬스맵_지표정의_목록,
  search_indicators,
  헬스맵_지표_정의,
} from '@/lib/헬스맵_지표정의_코퍼스';
import { get_nearest_public_hospital } from '@/lib/공공의료기관_데이터셋';
import { get_patient_flow_data } from '@/lib/환자_유출입_데이터셋';

interface 사업계획서_서술문_생성기_속성 {
  selected_region: 필수의료_진단_결과 | null;
  sido_stat: 지역_평균_통계;
  national_stat: 지역_평균_통계;
  google_api_key?: string;
}

export const 사업계획서_서술문_생성기: React.FC<사업계획서_서술문_생성기_속성> = ({
  selected_region,
  sido_stat,
  national_stat,
  google_api_key,
}) => {
  // 복사 상태
  const [copied_section, set_copied_section] = useState<string | null>(null);

  // 활성 탭: 'ai_deep' (AI 심층 생성), 'quick_template' (기본 서식), 'dictionary' (331개 지표정의 사전)
  const [active_tab, set_active_tab] = useState<'ai_deep' | 'quick_template' | 'dictionary'>('ai_deep');

  // 선택된 공모 지원 분야
  const [selected_domain, set_selected_domain] = useState<공모_분야_타입>('dialysis');

  // AI 사업계획서 생성 상태
  const [is_generating, set_is_generating] = useState<boolean>(false);
  const [ai_result, set_ai_result] = useState<AI_사업계획서_생성_결과 | null>(null);

  // 지표정의 사전 검색 키워드
  const [dict_keyword, set_dict_keyword] = useState<string>('');

  // 1단계 & 3단계 실데이터 자동 매핑
  const public_hospital = useMemo(() => {
    if (!selected_region) return null;
    const res = get_nearest_public_hospital(selected_region.시도명, selected_region.시군구명, selected_region.시군구코드);
    return res ? res.hospital : null;
  }, [selected_region]);

  const patient_flow = useMemo(() => {
    if (!selected_region) return null;
    return get_patient_flow_data(selected_region.시군구명);
  }, [selected_region]);

  // 지표 사전 검색 결과
  const filtered_indicators = useMemo(() => {
    return search_indicators(dict_keyword);
  }, [dict_keyword]);

  // 지역 또는 공모분야 변경 시 AI 사업계획서 자동 초안 생성
  useEffect(() => {
    if (!selected_region) return;

    let is_cancelled = false;
    const generate_initial = async () => {
      set_is_generating(true);
      try {
        const res = await 사업계획서_AI_엔진.generate_plan({
          target_region: selected_region,
          sido_stat,
          national_stat,
          domain_type: selected_domain,
          google_api_key,
        });
        if (!is_cancelled) {
          set_ai_result(res);
        }
      } catch (err) {
        console.error('사업계획서 생성 오류:', err);
      } finally {
        if (!is_cancelled) {
          set_is_generating(false);
        }
      }
    };

    generate_initial();

    return () => {
      is_cancelled = true;
    };
  }, [selected_region, selected_domain, google_api_key, sido_stat, national_stat]);

  if (!selected_region) {
    return (
      <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm text-center flex flex-col items-center justify-center min-h-[320px]">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
          <FileText className="w-6 h-6" />
        </div>
        <p className="text-base font-semibold text-slate-900 dark:text-white">시·군·구를 선택하면 공문서가 작성됩니다</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
          보건복지부 취약지 지원사업 및 국립중앙의료원 공모 표준 양식에 맞춘 개조식 문안이 즉시 완성됩니다.
        </p>
      </div>
    );
  }

  // 기존 빠른 템플릿 생성기
  const narrative_package: 사업계획서_서술문_패키지 = 사업계획서_문안_생성기.generate_narrative(
    selected_region,
    sido_stat,
    national_stat
  );

  // 텍스트 복사 핸들러
  const handle_copy_text = async (key: string, text: string) => {
    const success = await copy_text_to_clipboard(text);
    if (success) {
      set_copied_section(key);
      setTimeout(() => set_copied_section(null), 2000);
    }
  };

  // 텍스트 파일 다운로드 핸들러
  const handle_download_file = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // 재실행 버튼
  const handle_regenerate = async () => {
    set_is_generating(true);
    try {
      const res = await 사업계획서_AI_엔진.generate_plan({
        target_region: selected_region,
        sido_stat,
        national_stat,
        domain_type: selected_domain,
        google_api_key,
      });
      set_ai_result(res);
    } finally {
      set_is_generating(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-6" id="narrative-generator-container">
      {/* ============================================================== */}
      {/* 1. 상단 툴바 & 타이틀 */}
      {/* ============================================================== */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50">
              보건복지부 공모 표준 규격
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400 border border-purple-100 dark:border-purple-900/50">
              345쪽 지표정의서 RAG 지식베이스 임베딩
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            공문서 개조식 사업계획서 자동생성기{' '}
            <span className="text-blue-600 dark:text-blue-400 font-medium text-base sm:text-lg">
              ({selected_region.시도명} {selected_region.시군구명})
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            214개 공공병원 DB, 24개 지표 6개년 시계열, 2024 환자 유출입 OD 데이터 및 331개 지표 산출식을 결합한 실전 행정문안을 생성합니다.
          </p>
        </div>

        {/* 액션 버튼 */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handle_regenerate}
            disabled={is_generating}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${is_generating ? 'animate-spin' : ''}`} />
            다시 생성
          </button>
          <button
            onClick={() => {
              if (active_tab === 'ai_deep' && ai_result) {
                handle_download_file(
                  ai_result.생성전문,
                  `${selected_region.시도명}_${selected_region.시군구명}_${selected_domain}_사업계획서.txt`
                );
              } else {
                handle_download_file(
                  narrative_package.전체_통합_문안,
                  `${selected_region.시도명}_${selected_region.시군구명}_사업계획서_기본서식.txt`
                );
              }
            }}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            .txt 다운로드
          </button>
          <button
            onClick={() => {
              const text = active_tab === 'ai_deep' && ai_result ? ai_result.생성전문 : narrative_package.전체_통합_문안;
              handle_copy_text('full', text);
            }}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            {copied_section === 'full' ? (
              <>
                <Check className="w-3.5 h-3.5" />
                복사 완료!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                전문 복사
              </>
            )}
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. 1~3단계 실데이터 자동 매핑 요약 그리드 */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70 text-xs">
        {/* 1단계: 책임공공병원 */}
        <div>
          <span className="text-2xs font-semibold text-slate-400 block mb-0.5">
            1단계: 관내/인접 공공병원
          </span>
          <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 truncate">
            <Building2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            {public_hospital ? public_hospital.기관명 : '관내 공공의료원 매핑중'}
          </div>
          <span className="text-2xs text-slate-500">
            {public_hospital ? `${public_hospital.그룹} (${public_hospital.기관구분})` : '지역책임의료기관'}
          </span>
        </div>

        {/* 2단계: 핵심 취약지표 */}
        <div>
          <span className="text-2xs font-semibold text-slate-400 block mb-0.5">
            2단계: 응급 60분 미도달율
          </span>
          <div className="font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
            {selected_region.응급_60분_미도달_인구비율.toFixed(1)}% (전국 {national_stat.평균_응급_60분_미도달_인구비율}%)
          </div>
          <span className="text-2xs text-slate-500">
            취약등급: {selected_region.종합_취약도_등급}
          </span>
        </div>

        {/* 3단계: 환자 유출입 실태 */}
        <div>
          <span className="text-2xs font-semibold text-slate-400 block mb-0.5">
            3단계: 관내이용(RI) 및 최다유출지
          </span>
          <div className="font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5 truncate">
            <Share2 className="w-3.5 h-3.5 shrink-0" />
            RI {patient_flow?.ri ?? selected_region.관내_응급_의료이용률}% / 유출 {patient_flow?.outflow_rate ?? 80}%
          </div>
          <span className="text-2xs text-slate-500 truncate block">
            최다 유출: {patient_flow?.outflow_top.find((x) => !x.is_self)?.dest_sgg || '인접 시군'}
          </span>
        </div>

        {/* 4단계: 지표정의서 연계 */}
        <div>
          <span className="text-2xs font-semibold text-slate-400 block mb-0.5">
            4단계: 331개 지표정의 매핑
          </span>
          <div className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 truncate">
            <BookOpen className="w-3.5 h-3.5 shrink-0" />
            코드: {공모_분야_목록.find((d) => d.id === selected_domain)?.primary_indicator_code}
          </div>
          <span className="text-2xs text-slate-500">
            HANA DB / 심평원 수가코드 연계
          </span>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. 공모사업 지원분야 선택 (5대 분야) */}
      {/* ============================================================== */}
      <div>
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
          🎯 신청 공모사업 지원분야 선택 (복지부 취약지 지원사업 및 공공병원 기능보강):
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {공모_분야_목록.map((domain) => {
            const is_selected = selected_domain === domain.id;
            return (
              <button
                key={domain.id}
                onClick={() => set_selected_domain(domain.id)}
                className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
                  is_selected
                    ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-400 dark:border-blue-600 shadow-sm'
                    : 'bg-white dark:bg-slate-800/40 border-slate-200/70 dark:border-slate-700/70 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {domain.label}
                  </span>
                </div>
                <span className="text-2xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300 font-semibold inline-block mb-1">
                  {domain.badge}
                </span>
                <p className="text-2xs text-slate-500 dark:text-slate-400 line-clamp-2">
                  {domain.desc}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* ============================================================== */}
      {/* 4. 상단 탭 네비게이션 */}
      {/* ============================================================== */}
      <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
        <button
          onClick={() => set_active_tab('ai_deep')}
          className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all cursor-pointer ${
            active_tab === 'ai_deep'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          🚀 AI 심층 사업계획서 (RAG 고도화)
        </button>
        <button
          onClick={() => set_active_tab('quick_template')}
          className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all cursor-pointer ${
            active_tab === 'quick_template'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          📋 기본 개조식 서식 (즉시 렌더링)
        </button>
        <button
          onClick={() => set_active_tab('dictionary')}
          className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all cursor-pointer ${
            active_tab === 'dictionary'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          📖 331개 헬스맵 지표정의 사전
        </button>
      </div>

      {/* ============================================================== */}
      {/* 5. 탭별 뷰 렌더링 */}
      {/* ============================================================== */}

      {/* [탭 1] AI 심층 사업계획서 (Gemini / RAG 엔진) */}
      {active_tab === 'ai_deep' && (
        <div className="space-y-4">
          {is_generating ? (
            <div className="p-12 text-center bg-slate-50 dark:bg-slate-800/40 rounded-3xl border border-slate-200/70 dark:border-slate-700 flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                1~4단계 전수 실데이터와 345쪽 지표정의서를 RAG 결합하여 사업계획서를 조판 중입니다...
              </p>
              <p className="text-xs text-slate-400 mt-1">
                복지부 공모 표준 4대 챕터 규격에 맞춰 정밀 행정문안을 작성하고 있습니다.
              </p>
            </div>
          ) : ai_result ? (
            <div className="space-y-4">
              {/* RAG 참조 지표 정보 배너 */}
              {ai_result.핵심지표정의 && (
                <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40 text-xs">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                      RAG 자동 연계 공식 지표: [{ai_result.핵심지표정의.code}] {ai_result.핵심지표정의.name}
                    </span>
                    <span className="text-2xs text-blue-700 dark:text-blue-400 font-semibold">
                      지표정의서 p.{ai_result.핵심지표정의.page}
                    </span>
                  </div>
                  <div className="text-slate-700 dark:text-slate-300 space-y-1">
                    <p>• 산출식: <strong>분자</strong> [{ai_result.핵심지표정의.formula_numerator}] / <strong>분모</strong> [{ai_result.핵심지표정의.formula_denominator || '-'}]</p>
                    {ai_result.핵심지표정의.procedure_codes && (
                      <p>• 관련 수가코드(EDI): <code className="px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 font-mono text-2xs">{ai_result.핵심지표정의.procedure_codes}</code></p>
                    )}
                  </div>
                </div>
              )}

              {/* 공문서 뷰어 (한글 HWP 스타일) */}
              <div className="p-6 sm:p-8 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 font-sans leading-relaxed text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap select-text shadow-inner overflow-x-auto">
                {ai_result.생성전문}
              </div>

              <div className="flex items-center justify-between text-2xs text-slate-400 px-2">
                <span>작성 엔진: {ai_result.생성모델} (소요시간: {ai_result.소요시간_ms}ms)</span>
                <span>보건복지부 / 국립중앙의료원 공모 심사 규격 완결형</span>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* [탭 2] 기본 개조식 서식 (즉시 렌더링) */}
      {active_tab === 'quick_template' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300">
            💡 본 서식은 대기 시간 없이 즉시 복사하여 한글(HWP) 보고서에 붙여넣을 수 있는 빠른 개조식 서식입니다.
          </div>

          <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 font-sans leading-relaxed text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap select-text">
            {narrative_package.전체_통합_문안}
          </div>
        </div>
      )}

      {/* [탭 3] 331개 헬스맵 지표정의 사전 검색기 */}
      {active_tab === 'dictionary' && (
        <div className="space-y-4">
          {/* 검색 바 */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={dict_keyword}
              onChange={(e) => set_dict_keyword(e.target.value)}
              placeholder="지표명, 지표코드(예: CBD06, ABA08), 산출식, 수가코드로 검색... (총 331개)"
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <p className="text-xs text-slate-400">
            검색 결과: 총 <strong>{filtered_indicators.length}</strong>개 지표 (345쪽 지표정의서 기준)
          </p>

          {/* 지표 리스트 그리드 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-1">
            {filtered_indicators.slice(0, 40).map((ind) => (
              <div
                key={ind.code}
                className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 shadow-2xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-mono text-xs font-bold">
                      {ind.code}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {ind.name}
                    </h4>
                  </div>
                  <span className="text-2xs text-slate-400">p.{ind.page}</span>
                </div>

                <div className="flex items-center gap-1.5 text-2xs text-slate-500">
                  <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                    {ind.area}
                  </span>
                  <span>›</span>
                  <span>{ind.category1}</span>
                  <span>›</span>
                  <span>{ind.category2}</span>
                  <span className="ml-auto font-semibold text-blue-600 dark:text-blue-400">단위: {ind.unit}</span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-snug">
                  {ind.definition}
                </p>

                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 text-2xs text-slate-500 space-y-0.5">
                  <div><strong>분자:</strong> {ind.formula_numerator}</div>
                  <div><strong>분모:</strong> {ind.formula_denominator || '-'}</div>
                  {ind.procedure_codes && (
                    <div className="text-blue-600 dark:text-blue-400 font-mono truncate">
                      <strong>수가코드:</strong> {ind.procedure_codes}
                    </div>
                  )}
                  <div className="text-slate-400 truncate"><strong>출처:</strong> {ind.source}</div>
                </div>

                <button
                  onClick={() => {
                    const cite_text = `\n○ [관련 공식 지표] ${ind.name} (${ind.code})\n  - 정의: ${ind.definition}\n  - 산출식: ${ind.formula_numerator} / ${ind.formula_denominator || '-'}\n  - 출처: ${ind.source}`;
                    handle_copy_text(ind.code, cite_text);
                  }}
                  className="w-full py-1.5 text-2xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  {copied_section === ind.code ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  {copied_section === ind.code ? '인용문 복사됨!' : '이 지표 인용문 복사'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
