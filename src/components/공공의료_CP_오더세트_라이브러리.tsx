'use client';

import React, { useState, useMemo } from 'react';
import {
  공공의료_71개_CP_데이터셋,
  공공의료_CP_항목,
  CP_진료과,
  CP_통계_요약,
} from '@/lib/공공의료_CP_데이터셋';
import {
  FileSpreadsheet,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Activity,
  Layers,
  Sparkles,
  Stethoscope,
  HeartPulse,
  Syringe,
  FileCheck,
  ShieldCheck,
  TrendingUp,
  Award,
  ChevronRight,
  BookOpen,
  Calendar,
  AlertCircle,
  ExternalLink,
  GitBranch,
  Building,
} from 'lucide-react';

const DEPARTMENTS: { label: string; value: CP_진료과 | '전체' }[] = [
  { label: '전체 (71)', value: '전체' },
  { label: '정형외과 (12)', value: '정형외과' },
  { label: '외과 (10)', value: '외과' },
  { label: '내과 (14)', value: '내과' },
  { label: '산부인과 (6)', value: '산부인과' },
  { label: '비뇨의학과 (7)', value: '비뇨의학과' },
  { label: '이비인후과 (6)', value: '이비인후과' },
  { label: '안과 (3)', value: '안과' },
  { label: '신경과 (5)', value: '신경과' },
  { label: '신경외과 (2)', value: '신경외과' },
  { label: '소아청소년과 (4)', value: '소아청소년과' },
  { label: '응급/정신/재활 (6)', value: '응급/정신/재활/기타' },
];

export default function 공공의료_CP_오더세트_라이브러리() {
  const [selected_dept, set_selected_dept] = useState<CP_진료과 | '전체'>('전체');
  const [search_query, set_search_query] = useState('');
  const [active_tab, set_active_tab] = useState<'pathway' | 'orderset' | 'eligibility' | 'evaluation'>('pathway');
  const [selected_cp_id, set_selected_cp_id] = useState<string>('cp-01-슬관절전치환술');
  const [selected_stage_idx, set_selected_stage_idx] = useState<number>(0);
  const [filter_tag, set_filter_tag] = useState<'all' | 'renewed' | 'expanded' | 'surgical'>('all');

  // 필터링된 질환 목록
  const filtered_cp_list = useMemo(() => {
    return 공공의료_71개_CP_데이터셋.filter((item) => {
      // 진료과 필터
      if (selected_dept !== '전체' && item.진료과_분류 !== selected_dept) {
        return false;
      }
      // 태그 필터
      if (filter_tag === 'renewed' && !item.갱신연도) return false;
      if (filter_tag === 'expanded' && !item.적용확대연도) return false;
      if (filter_tag === 'surgical') {
        const is_surg = ['정형외과', '외과', '산부인과', '비뇨의학과', '안과', '이비인후과', '신경외과'].includes(
          item.진료과_분류
        );
        if (!is_surg) return false;
      }
      // 검색어 필터
      if (search_query.trim()) {
        const q = search_query.toLowerCase().trim();
        const match_name = item.CP명.toLowerCase().includes(q);
        const match_drg = item.K_DRG_코드.toLowerCase().includes(q);
        const match_dept = item.세부_진료과.toLowerCase().includes(q);
        const match_desc = item.개요.toLowerCase().includes(q);
        if (!match_name && !match_drg && !match_dept && !match_desc) return false;
      }
      return true;
    });
  }, [selected_dept, filter_tag, search_query]);

  // 현재 선택된 질환 객체
  const current_cp = useMemo(() => {
    const found = 공공의료_71개_CP_데이터셋.find((c) => c.id === selected_cp_id);
    return found || 공공의료_71개_CP_데이터셋[0];
  }, [selected_cp_id]);

  // 활성 단계
  const active_stage = current_cp.타임태스크_매트릭스[selected_stage_idx] || current_cp.타임태스크_매트릭스[0];

  return (
    <div className="space-y-6">
      {/* 1. 상단 타이틀 & 뱃지 헤더 */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-indigo-500/10 to-transparent pointer-events-none" />
        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-200 border border-blue-400/30 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-blue-300" />
              보건복지부 · 국립중앙의료원(NMC) 2026 표준 지침
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              <ShieldCheck className="w-3 h-3" />
              신포괄 정책가산 1.0% 연계
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/20 text-amber-300 border border-amber-400/30">
              <Award className="w-3 h-3" />
              지역거점 공공병원 운영평가 1.1.8 규격
            </span>
          </div>

          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              <FileSpreadsheet className="w-7 h-7 text-indigo-400" />
              공공의료 71개 표준진료지침(CP) 스마트 라이브러리 & 오더세트
            </h1>
            <p className="text-sm md:text-base text-slate-300 mt-2 max-w-4xl leading-relaxed">
              국립중앙의료원 공공보건의료지원센터 표준안 71개 질환 전수 탑재. 일자별 의사 처방(Order Set)과 간호 활동(Time-Task
              Matrix), 중증도별 분기 경로(Branch CP) 및 건강보험심사평가원 K-DRG 연계 가산율을 실시간 조회합니다.
            </p>
          </div>

          {/* 4대 핵심 통계 카드 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl p-3.5">
              <div className="text-xs text-slate-300 font-medium flex items-center justify-between">
                <span>표준 CP 질환군</span>
                <BookOpen className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-2xl font-bold text-white mt-1">
                71<span className="text-sm font-normal text-slate-300 ml-1">개 질환</span>
              </div>
              <div className="text-[11px] text-blue-200 mt-0.5">11개 필수 진료과목 전수</div>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl p-3.5">
              <div className="text-xs text-slate-300 font-medium flex items-center justify-between">
                <span>최신 갱신 및 확대</span>
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold text-emerald-300 mt-1">
                22<span className="text-sm font-normal text-slate-300 ml-1">개 갱신 / 38개 확대</span>
              </div>
              <div className="text-[11px] text-emerald-200 mt-0.5">&rsquo;14~&rsquo;25년 임상최신화 완료</div>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl p-3.5">
              <div className="text-xs text-slate-300 font-medium flex items-center justify-between">
                <span>신포괄 K-DRG 연계</span>
                <Activity className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-bold text-amber-300 mt-1">
                100<span className="text-sm font-normal text-slate-300 ml-1">%</span>
              </div>
              <div className="text-[11px] text-amber-200 mt-0.5">71개 전수 질병군 매핑</div>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl p-3.5">
              <div className="text-xs text-slate-300 font-medium flex items-center justify-between">
                <span>재원일수 단축 성과</span>
                <Clock className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-2xl font-bold text-purple-300 mt-1">
                -15.3<span className="text-sm font-normal text-slate-300 ml-1">%</span>
              </div>
              <div className="text-[11px] text-purple-200 mt-0.5">평균 1.8일 재원기간 단축</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. 진료과목 필터 탭 & 검색 바 */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
        {/* 진료과 탭 가로 스크롤 */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          {DEPARTMENTS.map((dept) => (
            <button
              key={dept.value}
              onClick={() => {
                set_selected_dept(dept.value);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selected_dept === dept.value
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {dept.label}
            </button>
          ))}
        </div>

        {/* 검색 및 보조 필터 */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1 border-t border-slate-100 dark:border-slate-800">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search_query}
              onChange={(e) => set_search_query(e.target.value)}
              placeholder="질환명, K-DRG 코드, 세부진료과 검색..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1 mr-1">
              <Filter className="w-3.5 h-3.5" /> 특성:
            </span>
            <button
              onClick={() => set_filter_tag('all')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${
                filter_tag === 'all'
                  ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              전체
            </button>
            <button
              onClick={() => set_filter_tag('renewed')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${
                filter_tag === 'renewed'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              갱신 완료 (22)
            </button>
            <button
              onClick={() => set_filter_tag('expanded')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${
                filter_tag === 'expanded'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              적용확대 (38)
            </button>
            <button
              onClick={() => set_filter_tag('surgical')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${
                filter_tag === 'surgical'
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              수술/처치군
            </button>
          </div>
        </div>
      </div>

      {/* 3. 메인 작업 영역: 좌측 질환 목록 (1/3) + 우측 인터랙티브 4단 뷰어 (2/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* 좌측: 71개 질환 목록 */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-4 space-y-2 max-h-[820px] flex flex-col">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-blue-500" />
              CP 질환 목록
              <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 rounded-full text-[11px] font-semibold">
                {filtered_cp_list.length}건
              </span>
            </span>
            <span className="text-[11px] text-slate-400">클릭 시 우측 상세 열람</span>
          </div>

          <div className="overflow-y-auto space-y-2 pr-1 flex-1 scrollbar-thin">
            {filtered_cp_list.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                검색 조건에 일치하는 CP 질환이 없습니다.
              </div>
            ) : (
              filtered_cp_list.map((cp) => {
                const is_active = cp.id === current_cp.id;
                return (
                  <div
                    key={cp.id}
                    onClick={() => {
                      set_selected_cp_id(cp.id);
                      set_selected_stage_idx(0);
                    }}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all duration-150 ${
                      is_active
                        ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-400 dark:border-blue-600 shadow-sm ring-1 ring-blue-500'
                        : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-6 h-6 rounded-md flex items-center justify-center text-[11px] font-bold ${
                            is_active
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          {cp.연번}
                        </span>
                        <span className="font-bold text-xs text-slate-900 dark:text-white truncate max-w-[150px]">
                          {cp.CP명}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                        {cp.K_DRG_코드}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-2 text-[11px] text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                          {cp.세부_진료과}
                        </span>
                        <span>표준 {cp.신포괄_정상군_재원일수}일</span>
                      </span>
                      <div className="flex items-center gap-1">
                        {cp.갱신연도 && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                            갱신 {cp.갱신연도}
                          </span>
                        )}
                        {cp.적용확대연도 && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                            확대 {cp.적용확대연도}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* 우측: 선택된 질환 4단 상세 뷰어 */}
        <div className="lg:col-span-8 space-y-4">
          {/* 상단 질환 개요 카드 */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-600 text-white">
                    CP #{current_cp.연번}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {current_cp.진료과_분류} · {current_cp.세부_진료과}
                  </span>
                  <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    K-DRG [{current_cp.K_DRG_코드}] {current_cp.질병군_분류명}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1.5 flex items-center gap-2">
                  {current_cp.CP명}
                </h2>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  개발: {current_cp.신규개발연도}년
                </span>
                {current_cp.갱신연도 && (
                  <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    갱신: {current_cp.갱신연도}년
                  </span>
                )}
                {current_cp.적용확대연도 && (
                  <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                    적용확대: {current_cp.적용확대연도}년
                  </span>
                )}
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {current_cp.개요}
            </p>

            {/* 신포괄 정상군 재원일수 & 목표 지표 바 */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200/70 dark:border-slate-700/70 text-xs">
              <div>
                <span className="text-slate-400 text-[11px] block">신포괄 정상군 재원일수</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {current_cp.신포괄_정상군_재원일수}일
                  <span className="text-[10px] font-normal text-slate-400 ml-1">
                    (하한 {current_cp.신포괄_정상군_하한}일 ~ 상한 {current_cp.신포괄_정상군_상한}일)
                  </span>
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">목표 적용률</span>
                <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                  {current_cp.핵심_모니터링_지표.목표_적용률}% 이상
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">목표 완료율</span>
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  {current_cp.핵심_모니터링_지표.목표_완료율}% 이상
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">예상 재원일수 단축</span>
                <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                  -{current_cp.핵심_모니터링_지표.평균재원일수_단축목표}일 단축
                </span>
              </div>
            </div>

            {/* 4대 탭 네비게이션 */}
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pt-2">
              <button
                onClick={() => set_active_tab('pathway')}
                className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
                  active_tab === 'pathway'
                    ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <GitBranch className="w-4 h-4" />
                1. 진료경로 & Branch 분기
              </button>

              <button
                onClick={() => set_active_tab('orderset')}
                className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
                  active_tab === 'orderset'
                    ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Stethoscope className="w-4 h-4" />
                2. 다학제 Order Set (의사·간호)
              </button>

              <button
                onClick={() => set_active_tab('eligibility')}
                className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
                  active_tab === 'eligibility'
                    ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                3. 적격성 & 변이(Variance)
              </button>

              <button
                onClick={() => set_active_tab('evaluation')}
                className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
                  active_tab === 'evaluation'
                    ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Award className="w-4 h-4" />
                4. 성과지표 & 1.0% 정책가산
              </button>
            </div>
          </div>

          {/* 탭 1: 진료경로 타임라인 & Branch CP 분기 */}
          {active_tab === 'pathway' && (
            <div className="space-y-4">
              {/* 타임라인 진행 카드 */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-500" />
                    입원~퇴원 일자별 표준 진료 진행 단계
                  </h3>
                  <span className="text-xs text-slate-500">총 {current_cp.타임태스크_매트릭스.length}단계</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 relative">
                  {current_cp.타임태스크_매트릭스.map((st, idx) => (
                    <div
                      key={st.단계}
                      onClick={() => {
                        setSelectedStageAndSwitch(idx);
                      }}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 hover:border-blue-400 cursor-pointer transition flex flex-col justify-between"
                    >
                      <div>
                        <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase">
                          Step {idx + 1}
                        </span>
                        <div className="font-bold text-xs text-slate-900 dark:text-white mt-0.5 truncate">
                          {st.단계}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                          {st.타이틀}
                        </div>
                      </div>
                      <div className="pt-2 text-[10px] text-indigo-500 font-semibold flex items-center gap-0.5">
                        오더보기 <ChevronRight className="w-3 h-3" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 유형별 CP (Branch CP) 분기 배너 및 상세 */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <GitBranch className="w-4 h-4 text-emerald-500" />
                      유형별 CP (Branch CP) 분기 경로
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      2026 개정 지침에 따라 단일 CP 대신 환자 중증도 및 동반질환 위험도에 따른 맞춤형 분기 경로를 제공합니다.
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                    {current_cp.Branch_CP_유형.length}개 유형 정의
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {current_cp.Branch_CP_유형.map((br, bIdx) => (
                    <div
                      key={br.유형명}
                      className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/50 dark:bg-emerald-950/20 space-y-2 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-600 text-white">
                            유형 {bIdx + 1}
                          </span>
                          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                            예상 {br.예상_재원일수}일
                          </span>
                        </div>
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white mt-1.5">{br.유형명}</h4>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
                          <strong className="text-slate-700 dark:text-slate-300">대상:</strong> {br.대상특성}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-emerald-200/60 dark:border-emerald-800/40 text-[11px] text-emerald-800 dark:text-emerald-200">
                        <strong>임상 전략:</strong> {br.임상_차별화_포인트}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 탭 2: 다학제 Order Set (의사 오더 vs 간호 활동) */}
          {active_tab === 'orderset' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
              {/* 단계 선택 서브 탭 */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-100 dark:border-slate-800">
                {current_cp.타임태스크_매트릭스.map((st, idx) => (
                  <button
                    key={st.단계}
                    onClick={() => set_selected_stage_idx(idx)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                      selected_stage_idx === idx
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {st.단계}
                  </button>
                ))}
              </div>

              {/* 선택된 단계 헤더 */}
              <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                <div>
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 block">
                    {active_stage.단계}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                    {active_stage.타이틀}
                  </h4>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-slate-400 block">표준 Order Set</span>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    전산 EMR 반영 서식 규격
                  </span>
                </div>
              </div>

              {/* 분할 뷰: 좌측 의사 처방 vs 우측 간호 활동 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
                {/* 1. 의사 처방 (Doctor Orders) */}
                <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/40 dark:bg-blue-950/20 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-blue-200/60 dark:border-blue-800/40">
                    <span className="text-xs font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                      <Stethoscope className="w-4 h-4 text-blue-600" />
                      의사 표준 처방 (Doctor Orders)
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-blue-600 text-white font-semibold">
                      진료과 오더
                    </span>
                  </div>

                  {/* 검사 오더 */}
                  <div>
                    <span className="text-[11px] font-bold text-blue-800 dark:text-blue-300 block mb-1">
                      [검사 및 영상 판독]
                    </span>
                    <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1">
                      {active_stage.의사_처방.검사.map((t, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-blue-500 font-bold">•</span>
                          <span>{t}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* 투약 및 처치 */}
                  <div>
                    <span className="text-[11px] font-bold text-blue-800 dark:text-blue-300 block mb-1">
                      [약제 및 수액·처치]
                    </span>
                    <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1">
                      {active_stage.의사_처방.투약_처치.map((t, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-blue-500 font-bold">•</span>
                          <span>{t}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* 예방적 항생제 가이드라인 */}
                  {active_stage.의사_처방.예방적_항생제 && (
                    <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50">
                      <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1">
                        <Syringe className="w-3.5 h-3.5" />
                        예방적 항생제 기준 (심평원 모니터링)
                      </span>
                      <p className="text-[11px] text-amber-900 dark:text-amber-200 mt-1">
                        {active_stage.의사_처방.예방적_항생제}
                      </p>
                    </div>
                  )}

                  {/* 협진 및 특이사항 */}
                  {active_stage.의사_처방.협진_특이사항 && (
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                      <strong>다학제 협진:</strong> {active_stage.의사_처방.협진_특이사항}
                    </div>
                  )}
                </div>

                {/* 2. 간호 활동 매트릭스 (Nurse Tasks) */}
                <div className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/40 dark:bg-indigo-950/20 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-indigo-200/60 dark:border-indigo-800/40">
                    <span className="text-xs font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
                      <HeartPulse className="w-4 h-4 text-indigo-600" />
                      간호 활동 매트릭스 (Nurse Tasks)
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-600 text-white font-semibold">
                      병동 케어
                    </span>
                  </div>

                  {/* 활력징후 & 모니터링 */}
                  <div>
                    <span className="text-[11px] font-bold text-indigo-800 dark:text-indigo-300 block mb-0.5">
                      [활력징후 측정 주기]
                    </span>
                    <p className="text-xs text-slate-700 dark:text-slate-300">
                      {active_stage.간호_활동.활력징후_모니터링}
                    </p>
                  </div>

                  {/* 식이 진행 */}
                  <div>
                    <span className="text-[11px] font-bold text-indigo-800 dark:text-indigo-300 block mb-0.5">
                      [식이(Diet) 단계]
                    </span>
                    <p className="text-xs text-slate-700 dark:text-slate-300">
                      {active_stage.간호_활동.식이_진행}
                    </p>
                  </div>

                  {/* 활동 및 운동 */}
                  <div>
                    <span className="text-[11px] font-bold text-indigo-800 dark:text-indigo-300 block mb-0.5">
                      [활동 및 재활 운동]
                    </span>
                    <p className="text-xs text-slate-700 dark:text-slate-300">
                      {active_stage.간호_활동.활동_운동}
                    </p>
                  </div>

                  {/* 환자 및 보호자 맞춤 교육 */}
                  <div>
                    <span className="text-[11px] font-bold text-indigo-800 dark:text-indigo-300 block mb-1">
                      [환자·보호자 교육 및 설명]
                    </span>
                    <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1">
                      {active_stage.간호_활동.환자_교육.map((ed, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-indigo-500 font-bold">✓</span>
                          <span>{ed}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 탭 3: 적격성(Eligibility) & 변이(Variance) 관리 */}
          {active_tab === 'eligibility' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 포함 기준 */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      적용 대상 포함 기준 (Inclusion)
                    </h4>
                  </div>
                  <ul className="space-y-2">
                    {current_cp.적용대상_포함기준.map((inc, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                        <span className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <span>{inc}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 제외 기준 */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                    <AlertTriangle className="w-5 h-5 text-rose-500" />
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      적용 대상 제외 기준 (Exclusion)
                    </h4>
                  </div>
                  <ul className="space-y-2">
                    {current_cp.적용대상_제외기준.map((exc, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                        <span className="w-4 h-4 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                          ✕
                        </span>
                        <span>{exc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* 임상 변이(Variance) 3대 요인 관리 매뉴얼 */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-amber-500" />
                  국립중앙의료원 표준 CP 변이(Variance) 3대 분류 및 대응 기준
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5">
                    <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                      1. 환자 요인 (Patient)
                    </span>
                    <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                      임상 상태 변화, 급성 합병증 발생, 환자/보호자의 시술·퇴원 거부 등. 즉시 CP 중단 또는 Branch CP 전환 등록.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5">
                    <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      2. 의료진 요인 (Provider)
                    </span>
                    <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                      추가 검사 처방, 집도의 판단에 의한 수술 일정 변경, 오더 누락 등. CP 위원회 정기 피드백 및 모니터링 기록.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5">
                    <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-purple-500" />
                      3. 시스템 요인 (System)
                    </span>
                    <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                      수술실·검사장비 고장, 주말/공휴일 퇴원 불가, 병상 부족 등. 병원 차원의 지원 프로세스 개선 보고서 제출.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 탭 4: 성과지표 & 1.0% 정책가산 연계 */}
          {active_tab === 'evaluation' && (
            <div className="space-y-4">
              {/* 성과지표 목표 카드 */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-indigo-500" />
                  해당 질환 핵심 모니터링 성과지표 (국립중앙의료원 가이드라인)
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50">
                    <span className="text-[11px] font-semibold text-blue-800 dark:text-blue-300 block">목표 적용률 & 완료율</span>
                    <div className="text-lg font-bold text-blue-900 dark:text-blue-200 mt-1">
                      {current_cp.핵심_모니터링_지표.목표_적용률}% / {current_cp.핵심_모니터링_지표.목표_완료율}%
                    </div>
                    <p className="text-[10px] text-blue-700 dark:text-blue-400 mt-0.5">
                      대상 환자 중 CP 처방 및 완수 비율
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/50">
                    <span className="text-[11px] font-semibold text-purple-800 dark:text-purple-300 block">평균 재원일수 단축</span>
                    <div className="text-lg font-bold text-purple-900 dark:text-purple-200 mt-1">
                      -{current_cp.핵심_모니터링_지표.평균재원일수_단축목표}일
                    </div>
                    <p className="text-[10px] text-purple-700 dark:text-purple-400 mt-0.5">
                      기준 {current_cp.신포괄_정상군_재원일수}일 대비 15% 감축
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50">
                    <span className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 block">30일 이내 재입원률</span>
                    <div className="text-lg font-bold text-emerald-900 dark:text-emerald-200 mt-1">
                      1.5% 미만
                    </div>
                    <p className="text-[10px] text-emerald-700 dark:text-emerald-400 mt-0.5">
                      퇴원 후 합병증 재입원 엄격 관리
                    </p>
                  </div>
                </div>
              </div>

              {/* 신포괄 정책가산 & 지역거점 운영평가 연계 체크박스 */}
              <div className="bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 rounded-2xl p-6 text-white shadow-lg space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award className="w-6 h-6 text-amber-400" />
                    <div>
                      <h4 className="text-base font-bold text-white">신포괄 정책가산 1.0% & 운영평가 1.1.8 직결 요건</h4>
                      <p className="text-xs text-indigo-200">
                        {current_cp.운영평가_연계포인트}
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-400 text-slate-900">
                    +1.0% 수가 가산
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 space-y-1">
                    <strong className="text-emerald-300 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      지역거점 공공병원 운영평가 (배점 100점)
                    </strong>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      • ⓐ 전담 인력 배치 및 CP위원회 운영 (50점)<br />
                      • ⓑ 병상 규모별 최소 적용 질환 수 충족<br />
                      &nbsp;&nbsp;(500병상 초과: 15개 / 300병상 초과: 10개 이상)
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 space-y-1">
                    <strong className="text-amber-300 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      신포괄 정책가산 평가 (건보 수가 직결)
                    </strong>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      • 의료의 질 영역(9.5%) 중 CP 운영 배점 1.0%<br />
                      • 질환별 적용률·완료율 전산(EMR/OCS) 제출 필수<br />
                      • 변이(Variance) 분석 및 분기별 모니터링 환류
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // 단계 변경 도우미
  function setSelectedStageAndSwitch(idx: number) {
    set_selected_stage_idx(idx);
    set_active_tab('orderset');
  }
}
