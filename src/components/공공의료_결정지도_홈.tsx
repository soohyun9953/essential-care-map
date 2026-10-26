'use client';

// Essential Care Map HOME 화면 (UI/UX 전면 개선)
// 기존 기능 보존 + 개선된 Hero (영월군 예시 미리보기·4대 바로가기 카드는 2026-10-24 삭제)
// 변경 이유: 단순 데이터 조회 사이트 → 공공의료 정책 의사결정 Journey 지원 플랫폼으로 정체성 재정의

import React, { useState } from 'react';
import {
  Search,
  ArrowRight,
  ShieldCheck,
  FileText,
  Sparkles,
  ChevronRight,
  MapPin,
  Activity,
  Building2,
  CheckCircle2,
} from 'lucide-react';
import { 의료서비스_코드 } from '@/lib/의료서비스_검색_엔진';
import { ISP_과제_뱃지 } from './ISP_과제_뱃지';
import { 워크스페이스_타입 } from './글로벌_공공_헤더';
import { 사용자_역할_타입 } from '@/lib/사용자_역할_타입';
import { 페르소나_목록, type 페르소나_키 } from '@/lib/페르소나_메뉴_구조';

interface 공공의료_결정지도_홈_속성 {
  on_search_region: (region_name: string) => void;
  on_navigate_workspace: (
    workspace: 워크스페이스_타입,
    sub_feature?: string
  ) => void;
  active_user_role?: 사용자_역할_타입;
  /** 사용자 그룹 서브탭 열기 (상단 사용자 그룹 버튼과 같은 화면: 1-1 · 2-1 · 3-1 …) */
  on_open_persona_subtab?: (subtab_id: string) => void;
  /** 기존 화면을 그 화면이 속한 사용자 그룹·서브탭이 선택된 상태로 열기 (배너용) */
  on_open_in_persona?: (workspace: 워크스페이스_타입, sub_feature?: string) => void;
  /** 기존 화면이 속한 서브탭 표시 문구 (예: '③ 3-1 통합 평가·공시심사·성과 모니터링 AI') */
  화면_소속?: (workspace: 워크스페이스_타입, sub_feature?: string) => string | null;
  on_open_guide_modal?: () => void;
  // 하위 호환성 핸들러
  on_search_submit?: (keyword: string, selected_services: 의료서비스_코드[]) => void;
  on_navigate_map?: (service?: 의료서비스_코드) => void;
  on_open_kakao_modal?: () => void;
  kakao_map_key_registered?: boolean;
}

const SAMPLE_REGIONS = ['영월군', '태백시', '강원특별자치도', '정선군'];

// 사용자 그룹 카드 색 (상단 사용자 그룹 버튼과 같은 계열: 대국민 rose · 의료기관 blue · NMC indigo)
const 그룹_색: Record<페르소나_키, Record<'배경' | '테두리' | '활성_테두리' | '아이콘' | '배지' | '제목_호버' | '구분선' | '체크' | '버튼', string>> = {
  citizen: {
    배경: 'from-rose-50/90 via-white to-pink-50/60 dark:from-rose-950/20 dark:via-[#161820] dark:to-pink-950/10',
    테두리: 'border-rose-200 dark:border-rose-900/50 hover:border-rose-400',
    활성_테두리: 'border-rose-500 shadow-md ring-4 ring-rose-400/20',
    아이콘: 'from-rose-500 to-pink-500',
    배지: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    제목_호버: 'group-hover:text-rose-600 dark:group-hover:text-rose-400',
    구분선: 'border-rose-100 dark:border-rose-900/40',
    체크: 'text-rose-500',
    버튼: 'from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700',
  },
  hospital: {
    배경: 'from-blue-50/90 via-white to-cyan-50/60 dark:from-blue-950/20 dark:via-[#161820] dark:to-cyan-950/10',
    테두리: 'border-blue-200 dark:border-blue-900/50 hover:border-blue-400',
    활성_테두리: 'border-blue-600 shadow-md ring-4 ring-blue-400/20',
    아이콘: 'from-blue-600 to-cyan-600',
    배지: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    제목_호버: 'group-hover:text-blue-600 dark:group-hover:text-blue-400',
    구분선: 'border-blue-100 dark:border-blue-900/40',
    체크: 'text-blue-600',
    버튼: 'from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700',
  },
  nmc: {
    배경: 'from-indigo-50/90 via-white to-purple-50/60 dark:from-indigo-950/20 dark:via-[#161820] dark:to-purple-950/10',
    테두리: 'border-indigo-200 dark:border-indigo-900/50 hover:border-indigo-400',
    활성_테두리: 'border-indigo-600 shadow-md ring-4 ring-indigo-400/20',
    아이콘: 'from-indigo-600 to-purple-600',
    배지: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
    제목_호버: 'group-hover:text-indigo-600 dark:group-hover:text-indigo-400',
    구분선: 'border-indigo-100 dark:border-indigo-900/40',
    체크: 'text-indigo-600',
    버튼: 'from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700',
  },
};

export const 공공의료_결정지도_홈: React.FC<공공의료_결정지도_홈_속성> = ({
  on_search_region,
  on_navigate_workspace,
  active_user_role = 'all',
  on_open_persona_subtab,
  on_open_in_persona,
  화면_소속,
  on_open_guide_modal,
  on_search_submit,
  on_navigate_map,
  on_open_kakao_modal,
  kakao_map_key_registered = false,
}) => {
  const [search_input, setSearch_input] = useState('');

  const handle_submit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = search_input.trim();
    if (!query) {
      on_navigate_workspace('regional_diagnosis');
      return;
    }
    on_search_region(query);
  };

  // 배너: 소속 사용자 그룹·서브탭 문맥으로 열고(없으면 기존 이동), 어느 메뉴인지 칩으로 표시
  const 열기 = (ws: 워크스페이스_타입, sub?: string) => (on_open_in_persona ?? on_navigate_workspace)(ws, sub);
  const 소속_칩 = (ws: 워크스페이스_타입, sub?: string) => {
    const 문구 = 화면_소속?.(ws, sub);
    return 문구 ? (
      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-white/15 text-white border border-white/30" title="이 기능이 속한 사용자 그룹 메뉴">
        {문구}
      </span>
    ) : null;
  };

  const handle_select_sample = (region: string) => {
    setSearch_input(region);
    on_search_region(region);
  };


  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-10 sm:py-14 space-y-14 animate-in fade-in duration-300">

      {/* ================================================================== */}
      {/* 1. HERO 영역 - 정책 의사결정 플랫폼 정체성 강화                        */}
      {/* ================================================================== */}
      <div className="text-center space-y-6">
        {/* 플랫폼 정체성 배지 */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-bold">
          <Activity className="w-3.5 h-3.5" />
          <span>공공의료 정책 의사결정 지원 플랫폼</span>
        </div>

        {/* 메인 타이틀 */}
        <h1 className="text-3xl sm:text-4xl md:text-[2.6rem] font-black tracking-tight text-slate-900 dark:text-white leading-tight">
          우리 지역의 필수의료,<br />
          <span className="text-blue-700 dark:text-blue-400">데이터로 진단하고 정책으로 연결하세요.</span>
        </h1>

        {/* 서브 설명 */}
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          지역별 필수의료 현황을 진단하고 지역 간 격차와 미래 의료수요를 분석하여<br className="hidden sm:block" />
          정책대안과 사업계획 수립, 그리고 <strong>시행계획·추진실적 AI 평가</strong>까지 지원합니다.
        </p>

        {/* 검색창 */}
        <div className="max-w-2xl mx-auto space-y-3">
          <form onSubmit={handle_submit} className="relative">
            <div className="flex items-center bg-white dark:bg-[#15161b] rounded-2xl shadow-md hover:shadow-lg border-2 border-slate-200 dark:border-slate-700 focus-within:border-blue-600 focus-within:ring-4 focus-within:ring-blue-600/10 p-1.5 transition-all">
              <Search className="w-5 h-5 input-icon ml-3 shrink-0" />
              <input
                type="text"
                value={search_input}
                onChange={(e) => setSearch_input(e.target.value)}
                placeholder="지역 또는 시·군·구 이름을 검색하세요"
                className="w-full px-3 py-3 text-base bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
              />
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-sm shadow-sm transition active:scale-95 shrink-0 cursor-pointer flex items-center gap-1.5"
              >
                <span>진단 시작</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* 검색 예시 칩 */}
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 px-2 flex-wrap justify-center">
            <span className="font-semibold">예시 지역:</span>
            {SAMPLE_REGIONS.map((region) => (
              <button
                key={region}
                type="button"
                onClick={() => handle_select_sample(region)}
                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-700 font-medium transition cursor-pointer flex items-center gap-1"
              >
                <MapPin className="w-3 h-3" />
                {region}
              </button>
            ))}
          </div>
        </div>
      </div>


      {/* ================================================================== */}
      {/* 3대 사용자 그룹 바로가기: 상단 사용자 그룹 버튼과 같은 메뉴 구조(페르소나_메뉴_구조)로 그린다 */}
      {/* 카드·바로가기 버튼 → 각 그룹 첫 서브탭(1-1 · 2-1 · 3-1), 서브탭 항목 → 해당 서브탭           */}
      {/* ================================================================== */}
      <div className="space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-4 rounded-full bg-blue-600" />
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">사용자 그룹별 화면 바로가기</h2>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">상단 사용자 그룹 버튼과 같은 화면으로 연결됩니다. 항목을 누르면 해당 화면이 바로 열립니다.</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {페르소나_목록.map((p) => {
            const 색 = 그룹_색[p.키];
            const 첫_서브탭 = p.서브탭[0];
            const 활성 = active_user_role === p.키;
            return (
              <div
                key={p.키}
                role="button"
                tabIndex={0}
                onClick={() => on_open_persona_subtab?.(첫_서브탭.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') on_open_persona_subtab?.(첫_서브탭.id);
                }}
                className={`p-6 rounded-3xl bg-gradient-to-br ${색.배경} border-2 transition-all cursor-pointer group flex flex-col justify-between gap-5 hover:shadow-xl hover:-translate-y-1 ${
                  활성 ? 색.활성_테두리 : 색.테두리
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={`w-11 h-11 rounded-2xl bg-gradient-to-tr ${색.아이콘} text-white flex items-center justify-center text-xl shadow-md group-hover:scale-110 transition-transform`}>
                      {p.아이콘}
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-black border ${색.배지}`}>서브탭 {p.서브탭.length}개</span>
                  </div>

                  <h3 className={`text-lg font-black text-slate-900 dark:text-white transition-colors ${색.제목_호버}`}>
                    {p.번호} {p.이름}
                  </h3>

                  <div className={`space-y-1 pt-2 border-t ${색.구분선} text-xs text-slate-600 dark:text-slate-300`}>
                    {p.서브탭.map((sub) => (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          on_open_persona_subtab?.(sub.id);
                        }}
                        title={sub.설명}
                        className="w-full flex items-start gap-1.5 text-left rounded-lg px-1 py-0.5 hover:bg-white/70 dark:hover:bg-slate-800/60 cursor-pointer"
                      >
                        <CheckCircle2 className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${색.체크}`} />
                        <span>
                          <strong className="font-black">{sub.id}</strong> {sub.label}
                          {sub.상태 !== '구현' && (
                            <span className="ml-1 px-1 py-px rounded text-[9px] font-black bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">{sub.상태}</span>
                          )}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  className={`w-full py-3 px-4 rounded-2xl bg-gradient-to-r ${색.버튼} text-white font-black text-xs sm:text-sm shadow-md transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer`}
                >
                  <span>
                    {첫_서브탭.id} {첫_서브탭.label} 바로가기
                  </span>
                  <ChevronRight className="w-4 h-4 shrink-0 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* ================================================================== */}
      {/* ⭐ 신규 핵심 배너 2종: 1) 2-2 경영 벤치마킹 & 사전검증 / 2) 3-3 통합 평가·심사 */}
      {/* ================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 배너 1: 2-2 경영 벤치마킹 & 공시·시설장비 사전검증 */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 text-white shadow-xl border border-blue-500/30 relative overflow-hidden flex flex-col justify-between gap-5">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/30 border border-blue-400/40 text-blue-200 text-xs font-black">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>NEW · 동일 규모 지방의료원 12곳 익명 비교군 실데이터 탑재</span>
            </div>
            <div>{소속_칩('hospital_ai_diagnosis', 'profile_report')}</div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              경영 벤치마킹 &amp; 공시·시설장비 사전검증
            </h2>
            <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed font-medium">
              <strong>허가병상 150~250병상 지방의료원 12곳</strong> 경영지표 벤치마킹(알리미 실데이터), 공시·ERP 대조 <strong>출연금·보조금 혼입 사전검증</strong>, 원내 <strong>시설·장비 노후도 진단</strong>을 제공합니다.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                if (on_open_persona_subtab) {
                  on_open_persona_subtab('2-2');
                } else {
                  열기('hospital_ai_diagnosis', 'profile_report');
                }
              }}
              className="px-5 py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm shadow-lg transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer group"
            >
              <Building2 className="w-4 h-4 text-slate-950" />
              <span>📊 경영 벤치마킹 &amp; 사전검증 바로가기</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* 배너 2: 공공보건의료 시행계획·추진실적 AI 평가 (100점 평가표) */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-900 text-white shadow-xl border border-indigo-400/40 relative overflow-hidden flex flex-col justify-between gap-5">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-black">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>NEW · 2025 시행계획 수립지침 &amp; 2024 추진실적 작성지침 반영</span>
            </div>
            <div>{소속_칩('policy_planning', 'evaluation')}</div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              공공보건의료 통합 평가 · 공시심사 (100점 심사)
            </h2>
            <p className="text-xs sm:text-sm text-indigo-100/90 leading-relaxed font-medium">
              공공기관(시·도 17개소 / 중앙부처 8개소 / 공공단체) 평가자료 입력 시 <strong>지침 공식 평가표(추진실적 70점 + 사업계획 30점 = 100점 만점)</strong> 산출 및 <strong>알리미 공시 교차검증·심사보고서 초안 자동화</strong>를 제공합니다.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              if (on_open_persona_subtab) {
                on_open_persona_subtab('3-4');
              } else {
                열기('policy_planning', 'evaluation');
              }
            }}
            className="w-full sm:w-auto self-start px-6 py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm shadow-lg transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer group"
          >
            <ShieldCheck className="w-4 h-4 text-slate-950" />
            <span>통합 평가·공시심사 바로가기 (100점 심사)</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* 정책 의사결정 여정 5단계 스테퍼는 ② 의료기관 담당자 › 2-1 작성 도우미로 이동 (정책_의사결정_여정_스테퍼.tsx) */}

      {/* ================================================================== */}
      {/* 4. 데이터 신뢰성 고지 배너                                             */}
      {/* ================================================================== */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">데이터 신뢰성 고지</span>
            <span className="text-sm text-slate-600 dark:text-slate-300">
              보건복지부 취약지 고시, 국립중앙의료원 공공보건의료통계, 건강보험심사평가원 DW 기준
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" />
              기준년도: 2024
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 inline-block" />
              대상: 250개 시·군·구
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 inline-block" />
              헬스맵 주제도 2024 (수동 갱신)
            </span>
          </div>
        </div>
        {on_open_guide_modal && (
          <button
            type="button"
            onClick={on_open_guide_modal}
            className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer text-xs sm:text-sm shadow-xs shrink-0 flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5" />
            데이터·사업가이드 총람 보기
          </button>
        )}
      </div>
    </div>
  );
};
