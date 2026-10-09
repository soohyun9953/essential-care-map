'use client';

// ============================================================================
// AI 공공병원 진단·개선 통합 워크스페이스
// 핵심 분석 대상을 '지역'에서 '공공병원'으로 전환한 차세대 공공의료 의사결정 플랫폼
// AI 5대 기능: Diagnosis ➔ Root Cause ➔ Benchmarking/Prediction ➔ Recommendation ➔ Simulation ➔ Human-in-the-loop ➔ Execution ➔ KPI
// ============================================================================

import React, { useState, useMemo } from 'react';
import {
  Building2,
  Activity,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  BarChart3,
  Brain,
  Stethoscope,
  Layers,
  ArrowRight,
  FileText,
  Sliders,
  Download,
  Search,
  Filter,
  Sparkles,
  HelpCircle,
  Info,
  Calendar,
  DollarSign,
  Users,
  Target,
  ShieldAlert,
  ChevronRight,
  Check,
  RotateCcw,
  Maximize2,
  ExternalLink,
  MapPin,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from 'lucide-react';

import {
  공공병원_종합_AI_프로필,
  공공병원_진단_지표점수,
  AI_발견_이슈,
  벤치마킹_지표,
  연도별_수요예측,
  AI_개선_대안,
  실행계획_과제,
  성과관리_KPI_실적,
  지표_산출_근거,
} from '@/types/aiHospitalDiagnosis';

import {
  전국_41개_공공병원_AI_프로필,
  get_공공병원_ai_프로필,
  get_전국_공공병원_AI_종합통계,
  AI진단_가상데이터_안내,
} from '@/lib/공공병원_AI진단_데이터셋';

export type AI_병원진단_서브탭 =
  | 'diagnosis'     // 1. AI 종합진단 & 원인분석
  | 'benchmark'     // 2. 공공병원 비교분석 (Benchmarking)
  | 'forecast'      // 3. AI 수요·성과 예측
  | 'simulation'    // 4. AI 개선대안 & 시뮬레이션 (Human-in-the-loop)
  | 'execution'     // 5. 세부 추진계획
  | 'kpi'           // 6. 성과관리 & 환류
  | 'national_view';// 7. 전국 41개 공공병원 통합현황

interface Props {
  initial_hospital_id?: string;
  initial_tab?: AI_병원진단_서브탭;
  on_navigate_medical_view?: (hospitalId: string) => void;
}

export const AI_병원진단_통합_워크스페이스: React.FC<Props> = ({
  initial_hospital_id = 'HOSP_001', // 영월의료원 기본
  initial_tab = 'diagnosis',
  on_navigate_medical_view,
}) => {
  // 1. 상태 관리
  const [selectedHospitalId, setSelectedHospitalId] = useState<string>(initial_hospital_id);
  const [activeSubtab, setActiveSubtab] = useState<AI_병원진단_서브탭>(initial_tab);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegionFilter, setSelectedRegionFilter] = useState<string>('전체');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('전체');

  // 활성 선택 이슈 (원인분석 상세 보기용)
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);

  // XAI 산출근거 모달 열림 상태
  const [isEvidenceModalOpen, setIsEvidenceModalOpen] = useState(false);
  const [activeEvidenceMetric, setActiveEvidenceMetric] = useState<지표_산출_근거 | null>(null);

  // Human-in-the-loop 선택된 AI 대안 ('A' | 'B' | 'C' | 'CUSTOM')
  const [selectedAlternativeId, setSelectedAlternativeId] = useState<'A' | 'B' | 'C' | 'CUSTOM'>('A');
  const [isAdoptedSuccess, setIsAdoptedSuccess] = useState(false);

  // 대화형 시뮬레이션 슬라이더 파라미터 (커스텀 시뮬레이션용)
  const [customSimParams, setCustomSimParams] = useState({
    addEmergencyDoctors: 2,
    addNurses: 6,
    openIntegratedBedCount: 40,
    digitalTelemedicine: true,
  });

  // 2. 현재 선택된 병원 프로필 계산
  const currentHospital = useMemo(() => {
    return get_공공병원_ai_프로필(selectedHospitalId);
  }, [selectedHospitalId]);

  // 전국 종합 통계
  const nationalStats = useMemo(() => {
    return get_전국_공공병원_AI_종합통계();
  }, []);

  // 병원 검색 및 필터링 목록
  const filteredHospitals = useMemo(() => {
    return 전국_41개_공공병원_AI_프로필.filter((h) => {
      const matchQuery =
        !searchQuery ||
        h.기관명.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.시도명.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.시군구명.toLowerCase().includes(searchQuery.toLowerCase());
      const matchRegion =
        selectedRegionFilter === '전체' || h.시도명.includes(selectedRegionFilter);
      const matchType =
        selectedTypeFilter === '전체' || h.유형 === selectedTypeFilter;
      return matchQuery && matchRegion && matchType;
    });
  }, [searchQuery, selectedRegionFilter, selectedTypeFilter]);

  // 시뮬레이션 실시간 계산값
  const simulatedImpact = useMemo(() => {
    const baseHandling = currentHospital.개선대안목록[0].시뮬레이션결과.응급환자처리량_현재;
    const addedDoctors = customSimParams.addEmergencyDoctors;
    const addedNurses = customSimParams.addNurses;
    const teleBonus = customSimParams.digitalTelemedicine ? 1.05 : 1.0;

    const newHandling = Math.round((baseHandling + addedDoctors * 1100 + addedNurses * 250) * teleBonus);
    const newWaitTime = Math.max(18, Math.round(48 - addedDoctors * 8 - (customSimParams.digitalTelemedicine ? 6 : 0)));
    const newTransferRate = Math.max(1.2, Number((6.8 - addedDoctors * 1.6 - (customSimParams.digitalTelemedicine ? 0.8 : 0)).toFixed(1)));
    const estBudget = (addedDoctors * 2.8 + addedNurses * 0.6 + (customSimParams.digitalTelemedicine ? 1.5 : 0)).toFixed(1);
    const newPublicScore = Math.min(100, currentHospital.진단지표.공공성 + addedDoctors * 3 + (customSimParams.digitalTelemedicine ? 3 : 0));

    return {
      newHandling,
      handlingGrowthPct: (((newHandling - baseHandling) / baseHandling) * 100).toFixed(1),
      newWaitTime,
      waitTimeReductionPct: (((48 - newWaitTime) / 48) * 100).toFixed(1),
      newTransferRate,
      transferReductionPct: (((6.8 - newTransferRate) / 6.8) * 100).toFixed(1),
      estBudget,
      newPublicScore,
    };
  }, [currentHospital, customSimParams]);

  // 이슈 상세 팝업용
  const activeIssue = useMemo(() => {
    if (!selectedIssueId) return currentHospital.주요이슈목록[0];
    return currentHospital.주요이슈목록.find((i) => i.id === selectedIssueId) || currentHospital.주요이슈목록[0];
  }, [currentHospital, selectedIssueId]);

  return (
    <div className="w-full space-y-6 pb-16">
      {/* 가상 시연 데이터 안내 */}
      <div className="flex items-start gap-2 p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-xs font-bold text-amber-900 dark:text-amber-200">
        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
        <span>{AI진단_가상데이터_안내}</span>
      </div>
      {/* ==================================================================== */}
      {/* 1. 상단 병원 선택 바 & 컨텍스트 헤더 */}
      {/* ==================================================================== */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* 좌측: 진단 대상 공공병원 셀렉터 & 기본 식별 정보 */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50">
              <Building2 className="w-6 h-6" />
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black tracking-wider text-blue-600 dark:text-blue-400 uppercase bg-blue-50 dark:bg-blue-900/40 px-2 py-0.5 rounded-md">
                  AI 병원진단·개선 대상 (41개소)
                </span>
                <span className="text-xs text-slate-400">|</span>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {currentHospital.유형} (설립 {currentHospital.설립연도}년)
                </span>
              </div>

              {/* 병원 드롭다운 셀렉터 */}
              <div className="flex items-center gap-3 pt-1">
                <select
                  value={selectedHospitalId}
                  onChange={(e) => {
                    setSelectedHospitalId(e.target.value);
                    setSelectedIssueId(null);
                    setIsAdoptedSuccess(false);
                  }}
                  className="text-lg sm:text-xl font-black text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-xs"
                >
                  {전국_41개_공공병원_AI_프로필.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.기관명} ({h.시도명} · {h.허가병상}병상)
                    </option>
                  ))}
                </select>

                <div className="hidden sm:flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/80 px-3 py-1.5 rounded-xl">
                  <MapPin className="w-3.5 h-3.5 text-blue-500" />
                  <span>{currentHospital.시도명} {currentHospital.시군구명}</span>
                  <span className="text-slate-300 dark:text-slate-600">•</span>
                  <span>허가병상 <strong>{currentHospital.허가병상}</strong>개</span>
                  <span className="text-slate-300 dark:text-slate-600">•</span>
                  <span>전문의 <strong>{currentHospital.전문의수}</strong>명</span>
                </div>
              </div>
            </div>
          </div>

          {/* 우측: 차별화 툴팁 및 기존 의료기관 화면(조회 전용) 바로가기 버튼 */}
          <div className="flex items-center gap-2 self-end lg:self-center">
            {on_navigate_medical_view && (
              <button
                type="button"
                onClick={() => on_navigate_medical_view(currentHospital.id)}
                className="px-3 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition flex items-center gap-1.5 cursor-pointer"
                title="단순 시설/진료과/장비 기본현황 조회 화면으로 이동"
              >
                <Stethoscope className="w-3.5 h-3.5 text-slate-500" />
                <span>「의료기관」 현황 조회</span>
                <ArrowRight className="w-3 h-3 text-slate-400" />
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsEvidenceModalOpen(true)}
              className="px-3 py-2 rounded-xl text-xs font-extrabold text-indigo-600 dark:text-indigo-400 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800 transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Brain className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>AI 분석 근거 보기 (XAI)</span>
            </button>
          </div>
        </div>

        {/* 배후 지역 Context (의료 환경 인프라) - 분석 대상이 아닌 Context 데이터로 표기 */}
        <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
            <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-500" />
              배후지역 Context 환경:
            </span>
            <span>배후인구 {currentHospital.지역컨텍스트.배후인구.toLocaleString()}명</span>
            <span>• 고령화율 <strong className="text-rose-600 dark:text-rose-400">{currentHospital.지역컨텍스트.고령화율_pct}%</strong></span>
            <span>• 응급취약여부 {currentHospital.지역컨텍스트.응급의료취약여부 ? '⚠️ 취약지' : '정상'}</span>
            <span>• 분만취약지 {currentHospital.지역컨텍스트.분만취약지등급}</span>
            <span>• 관내 중증환자 유출률 <strong className="text-amber-600 dark:text-amber-400">{currentHospital.지역컨텍스트.관내입원환자유출률_pct}%</strong></span>
          </div>

          <div className="text-[11px] font-semibold text-slate-400">
            * 지역 데이터는 병원 AI 의사결정을 위한 외부 거시 환경(Context)으로 결합됩니다.
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 2. 7단계 워크플로우 탭 네비게이션 */}
      {/* 진단 ➔ 원인분석 ➔ Benchmarking ➔ 예측 ➔ 대안/시뮬레이션 ➔ 실행계획 ➔ 성과관리 */}
      {/* ==================================================================== */}
      <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 dark:bg-slate-800/90 rounded-2xl overflow-x-auto shadow-inner text-xs font-bold scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveSubtab('diagnosis')}
          className={`px-4 py-2.5 rounded-xl whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
            activeSubtab === 'diagnosis'
              ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm font-black'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <span className="w-4 h-4 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-600 text-[10px] flex items-center justify-center font-black">1</span>
          <span>① AI 종합진단 & 원인분석</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubtab('benchmark')}
          className={`px-4 py-2.5 rounded-xl whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
            activeSubtab === 'benchmark'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm font-black'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <span className="w-4 h-4 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 text-[10px] flex items-center justify-center font-black">2</span>
          <span>② 유사병원 Benchmarking</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubtab('forecast')}
          className={`px-4 py-2.5 rounded-xl whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
            activeSubtab === 'forecast'
              ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-sm font-black'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <span className="w-4 h-4 rounded-full bg-purple-100 dark:bg-purple-900/60 text-purple-600 text-[10px] flex items-center justify-center font-black">3</span>
          <span>③ 5개년 AI 수요예측</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubtab('simulation')}
          className={`px-4 py-2.5 rounded-xl whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
            activeSubtab === 'simulation'
              ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm font-black'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <span className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 text-[10px] flex items-center justify-center font-black">4</span>
          <span>④ AI 개선대안 & 시뮬레이션</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubtab('execution')}
          className={`px-4 py-2.5 rounded-xl whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
            activeSubtab === 'execution'
              ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm font-black'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <span className="w-4 h-4 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-600 text-[10px] flex items-center justify-center font-black">5</span>
          <span>⑤ 세부 추진계획</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubtab('kpi')}
          className={`px-4 py-2.5 rounded-xl whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
            activeSubtab === 'kpi'
              ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-sm font-black'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <span className="w-4 h-4 rounded-full bg-rose-100 dark:bg-rose-900/60 text-rose-600 text-[10px] flex items-center justify-center font-black">6</span>
          <span>⑥ 성과관리 & 환류</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubtab('national_view')}
          className={`px-4 py-2.5 rounded-xl whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
            activeSubtab === 'national_view'
              ? 'bg-white dark:bg-slate-900 text-cyan-600 dark:text-cyan-400 shadow-sm font-black'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <span className="w-4 h-4 rounded-full bg-cyan-100 dark:bg-cyan-900/60 text-cyan-600 text-[10px] flex items-center justify-center font-black">7</span>
          <span>전국 41개 공공병원 통합현황</span>
        </button>
      </div>

      {/* ==================================================================== */}
      {/* 3. 서브탭 1: AI 종합진단 & 주요 이슈 원인분석 */}
      {/* ==================================================================== */}
      {activeSubtab === 'diagnosis' && (
        <div className="space-y-6">
          {/* 6대 핵심 지표 카드 */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {/* 종합 진단 카드 */}
            <div className="col-span-2 sm:col-span-1 p-4 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-md flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold opacity-90">종합진단</span>
                <span className="px-2 py-0.5 rounded-md bg-white/20 text-xs font-black">
                  {currentHospital.진단지표.종합등급}등급
                </span>
              </div>
              <div className="my-2">
                <div className="text-3xl font-black">{currentHospital.진단지표.종합점수}점</div>
                <div className="text-[11px] opacity-80 mt-0.5">전국평균 {nationalStats.종합평균}점 대비</div>
              </div>
              <div className="text-[10px] opacity-75">100점 만점 환산</div>
            </div>

            {/* 1. 공공성 */}
            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
                <span>공공성</span>
                <span className="text-blue-600 dark:text-blue-400">82점 기준</span>
              </div>
              <div className="my-1.5 text-2xl font-black text-slate-900 dark:text-white">
                {currentHospital.진단지표.공공성}점
              </div>
              <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-0.5">
                <ArrowUpRight className="w-3 h-3" />
                <span>우수 수준</span>
              </div>
            </div>

            {/* 2. 운영효율 */}
            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
                <span>운영효율</span>
                <span className="text-slate-400">71점</span>
              </div>
              <div className="my-1.5 text-2xl font-black text-slate-900 dark:text-white">
                {currentHospital.진단지표.운영효율}점
              </div>
              <div className="text-[11px] text-amber-600 font-semibold flex items-center gap-0.5">
                <Minus className="w-3 h-3" />
                <span>보통 수준</span>
              </div>
            </div>

            {/* 3. 의료수요 대응 */}
            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
                <span>의료수요 대응</span>
                <span className="text-slate-400">76점</span>
              </div>
              <div className="my-1.5 text-2xl font-black text-slate-900 dark:text-white">
                {currentHospital.진단지표.의료수요대응}점
              </div>
              <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-0.5">
                <ArrowUpRight className="w-3 h-3" />
                <span>양호 수준</span>
              </div>
            </div>

            {/* 4. 인력 적정성 */}
            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
                <span>인력 적정성</span>
                <span className="text-rose-500">64점</span>
              </div>
              <div className="my-1.5 text-2xl font-black text-slate-900 dark:text-white">
                {currentHospital.진단지표.인력적정성}점
              </div>
              <div className="text-[11px] text-rose-600 font-semibold flex items-center gap-0.5">
                <ArrowDownRight className="w-3 h-3" />
                <span>인력 확충 시급</span>
              </div>
            </div>

            {/* 5. 필수의료 대응 */}
            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
                <span>필수의료 대응</span>
                <span className="text-rose-500">58점</span>
              </div>
              <div className="my-1.5 text-2xl font-black text-slate-900 dark:text-white">
                {currentHospital.진단지표.필수의료대응}점
              </div>
              <div className="text-[11px] text-rose-600 font-semibold flex items-center gap-0.5">
                <ArrowDownRight className="w-3 h-3" />
                <span>중점관리 대상</span>
              </div>
            </div>

            {/* 6. 재무건전성 */}
            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
                <span>재무건전성</span>
                <span className="text-slate-400">68점</span>
              </div>
              <div className="my-1.5 text-2xl font-black text-slate-900 dark:text-white">
                {currentHospital.진단지표.재무건전성}점
              </div>
              <div className="text-[11px] text-amber-600 font-semibold flex items-center gap-0.5">
                <Minus className="w-3 h-3" />
                <span>적자 보전 필요</span>
              </div>
            </div>
          </div>

          {/* 중앙: AI가 발견한 주요 문제 (4대 Issue) & 클릭 시 원인분석 분할 레이아웃 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* 좌측 5칸: 이슈 카드 목록 */}
            <div className="lg:col-span-5 space-y-3">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                    AI가 발견한 주요 Issue (4건)
                  </h3>
                </div>
                <span className="text-xs text-slate-400 font-semibold">
                  클릭 시 심층 원인분석 연계
                </span>
              </div>

              <div className="space-y-2.5">
                {currentHospital.주요이슈목록.map((issue, idx) => {
                  const isSelected = activeIssue.id === issue.id;
                  return (
                    <div
                      key={issue.id}
                      onClick={() => setSelectedIssueId(issue.id)}
                      className={`p-4 rounded-2xl border transition cursor-pointer ${
                        isSelected
                          ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-500 ring-2 ring-blue-500/20 shadow-md'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
                              issue.심각도 === '위험'
                                ? 'bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-400'
                                : issue.심각도 === '경고'
                                ? 'bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-400'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            {issue.심각도}
                          </span>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                            {idx + 1}. {issue.제목}
                          </h4>
                        </div>
                        <ChevronRight className={`w-4 h-4 transition ${isSelected ? 'text-blue-600 rotate-90' : 'text-slate-400'}`} />
                      </div>

                      <ul className="mt-2.5 space-y-1 text-[11px] text-slate-600 dark:text-slate-300 pl-1">
                        {issue.핵심요약.map((item, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-blue-500 shrink-0 font-bold">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 우측 7칸: 선택된 이슈의 AI 심층 원인분석 (직접원인 + 구조적원인 + 연관 근거데이터) */}
            <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                    <Brain className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
                      AI Root Cause Analysis (원인분석)
                    </span>
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                      {activeIssue.제목}
                    </h3>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveSubtab('simulation')}
                  className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-xs"
                >
                  <span>개선대안 시뮬레이션으로 이동</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* 직접 원인 분석 */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  <span>1. 직접 원인 (Immediate Causes)</span>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {activeIssue.원인분석.직접원인.map((cause, i) => (
                    <div key={i} className="p-3 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 text-xs text-rose-900 dark:text-rose-200 leading-relaxed font-medium">
                      ⚠️ {cause}
                    </div>
                  ))}
                </div>
              </div>

              {/* 구조적 원인 분석 */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  <span>2. 구조적 원인 (Structural & Environmental Causes)</span>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {activeIssue.원인분석.구조적원인.map((cause, i) => (
                    <div key={i} className="p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-200 leading-relaxed font-medium">
                      🏛️ {cause}
                    </div>
                  ))}
                </div>
              </div>

              {/* 연관 증거 데이터 카드 */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  <span>3. AI 판단 근거 연관 데이터 (Evidence Metrics)</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {activeIssue.원인분석.연관데이터.map((data, i) => (
                    <div key={i} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-center">
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold truncate" title={data.라벨}>
                        {data.라벨}
                      </div>
                      <div className="text-base font-black text-slate-900 dark:text-white mt-1">
                        {data.값}
                      </div>
                      <span className={`inline-block mt-1 px-1.5 py-0.5 rounded-md text-[9px] font-black ${
                        data.상태 === '위험'
                          ? 'bg-rose-100 text-rose-600'
                          : data.상태 === '주의'
                          ? 'bg-amber-100 text-amber-600'
                          : 'bg-emerald-100 text-emerald-600'
                      }`}>
                        {data.상태}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 4. 서브탭 2: 유사병원 Benchmarking (핵심 차별화 요소) */}
      {/* ==================================================================== */}
      {activeSubtab === 'benchmark' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-indigo-600" />
                  <span>AI Benchmarking 비교분석</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  우리 병원과 동일 병상 규모(150~250병상) 유사 공공병원, 전국 41개소 평균 및 상위 10% 우수 병원 지표 비교
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold">
                  비교군: 유사 규모 공공병원 12개소
                </span>
              </div>
            </div>

            {/* 비교 테이블 */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-bold">
                    <th className="py-3 px-4">지표명</th>
                    <th className="py-3 px-4 text-blue-600 dark:text-blue-400 font-black">우리 병원 ({currentHospital.기관명})</th>
                    <th className="py-3 px-4">유사병원 평균</th>
                    <th className="py-3 px-4">전국평균</th>
                    <th className="py-3 px-4 text-emerald-600 dark:text-emerald-400">상위 공공병원</th>
                    <th className="py-3 px-4">AI Gap 진단 및 격차 원인</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {currentHospital.벤치마킹데이터.map((b, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                        {b.지표명}
                      </td>
                      <td className="py-3.5 px-4 font-black text-sm text-blue-700 dark:text-blue-400">
                        {b.우리병원.toLocaleString()} {b.단위}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300">
                        {b.유사병원.toLocaleString()} {b.단위}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                        {b.전국평균.toLocaleString()} {b.단위}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-emerald-600 dark:text-emerald-400">
                        {b.상위병원.toLocaleString()} {b.단위}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                        <div className="flex items-center gap-1.5 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0"></span>
                          <span>{b.격차설명}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* AI 핵심 Gap 자동 발견 박스 */}
            <div className="p-4 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 space-y-2">
              <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 font-extrabold text-xs">
                <Sparkles className="w-4 h-4" />
                <span>AI 지표 분석 자동 Gap 요약 코멘트</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-indigo-950 dark:text-indigo-200">
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-indigo-100 dark:border-indigo-900/60">
                  📢 <strong>전문의 확보 수준 취약:</strong> 유사 공공병원 평균(5.1명/100병상)보다 <strong>17.6% 낮음</strong>. 특히 응급의학과 및 외과 전문의 공백이 입원환자 유출의 직접 원인으로 작용함.
                </div>
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-indigo-100 dark:border-indigo-900/60">
                  📢 <strong>응급환자 유입 과밀:</strong> 응급의료 인력 증가율 대비 연간 응급환자 유입 증가율이 2.4배 높아 야간 당직 의료진의 번아웃 및 조기 퇴사 위험 발생.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 5. 서브탭 3: AI 5개년 수요예측 & 위험구간 경고 */}
      {/* ==================================================================== */}
      {activeSubtab === 'forecast' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                  <span>AI 5개년 미래 수요예측 (2026~2030)</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  지역 인구 고령화율 추이, 유출입 패턴 및 상병 통계를 학습한 AI 모델의 시계열 환자·인력 수요 예측치
                </p>
              </div>

              <span className="px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 font-bold text-xs">
                신뢰수준 95% 예측 모델 적용
              </span>
            </div>

            {/* 연도별 예측 카드 그리드 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {currentHospital.수요예측데이터.map((f, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl border transition flex flex-col justify-between ${
                    f.위험구간여부
                      ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-300 dark:border-rose-900/60 ring-1 ring-rose-400'
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-900 dark:text-white">
                        {f.연도}
                      </span>
                      {f.위험구간여부 && (
                        <span className="px-1.5 py-0.5 rounded-md bg-rose-600 text-white text-[9px] font-black">
                          위험구간
                        </span>
                      )}
                    </div>

                    <div className="mt-3 space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">외래환자:</span>
                        <span className="font-bold">{f.외래환자.toLocaleString()}명</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">입원환자:</span>
                        <span className="font-bold">{f.입원환자.toLocaleString()}명</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">응급환자:</span>
                        <span className="font-bold text-rose-600 dark:text-rose-400">{f.응급환자.toLocaleString()}명</span>
                      </div>
                      <div className="flex justify-between pt-1 border-t border-slate-200 dark:border-slate-700">
                        <span className="text-slate-500">필요 전문의:</span>
                        <span className="font-black text-blue-600">{f.전문의수요}명</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">필요 간호사:</span>
                        <span className="font-black text-indigo-600">{f.간호인력수요}명</span>
                      </div>
                    </div>
                  </div>

                  {f.위험구간여부 && f.위험메시지 && (
                    <div className="mt-3 p-2 rounded-xl bg-white/80 dark:bg-slate-900/80 text-[10px] text-rose-700 dark:text-rose-300 font-bold leading-tight">
                      ⚠️ {f.위험메시지}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* AI 미래 위험 구간 조기 경보 알림 배너 */}
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs text-amber-900 dark:text-amber-200">
                <h4 className="font-bold text-amber-950 dark:text-amber-100">
                  AI 위험구간 사전 경보: 2028년부터 응급의료 수요가 공급능력을 초과할 가능성 84.7%
                </h4>
                <p className="leading-relaxed">
                  영월 및 인근 폐광지역 초고령화(고령화율 36% 돌파)로 인한 심뇌혈관 급성기 환자 폭증이 예상됩니다. 현 인력 수준(전문의 19명) 유지 시 2028년부터 야간 응급실 수용 거부율이 15%를 넘어설 것으로 예측되므로, 2026~2027년 내 선제적 충원 및 개선사업 추진이 불가피합니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 6. 서브탭 4: AI 개선대안 & 시뮬레이션 (Human-in-the-loop 필수) */}
      {/* ==================================================================== */}
      {activeSubtab === 'simulation' && (
        <div className="space-y-6">
          {/* Human-in-the-loop 원칙 안내 배너 */}
          <div className="p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-blue-900 dark:text-blue-200 font-bold">
              <Brain className="w-4 h-4 text-blue-600" />
              <span>Human-in-the-loop 의사결정: AI가 복수 대안(A/B/C)을 추천하며, 최종 대안 선택과 변수 수정은 담당자가 결정합니다.</span>
            </div>
            {isAdoptedSuccess && (
              <span className="px-3 py-1 rounded-full bg-emerald-500 text-white font-black text-[11px] animate-in fade-in flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                선택 대안이 실행계획에 확정 반영됨
              </span>
            )}
          </div>

          {/* AI 추천 3대 대안 (A안/B안/C안) 카드 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {currentHospital.개선대안목록.map((alt) => {
              const isSelected = selectedAlternativeId === alt.id;
              return (
                <div
                  key={alt.id}
                  className={`p-5 rounded-2xl border transition flex flex-col justify-between ${
                    isSelected
                      ? 'bg-white dark:bg-slate-900 border-blue-600 ring-2 ring-blue-500/20 shadow-lg'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-blue-600 dark:text-blue-400">
                        {alt.안명칭}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300">
                        소요: {alt.소요예산_억원}억원 ({alt.실행기간})
                      </span>
                    </div>

                    <h4 className="text-sm font-extrabold text-slate-900 dark:text-white leading-snug">
                      {alt.제목}
                    </h4>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      💡 {alt.추천이유}
                    </p>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                      {alt.세부내용.map((item, i) => (
                        <div key={i} className="flex items-start gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span className="text-[11px]">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
                    {/* Before vs After 비교 지표 */}
                    <div className="grid grid-cols-2 gap-2 text-center text-xs">
                      <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                        <div className="text-[10px] text-slate-400">평균 대기시간</div>
                        <div className="font-extrabold text-slate-900 dark:text-white mt-0.5">
                          {alt.시뮬레이션결과.평균대기시간_현재_분}분 ➔ <span className="text-blue-600">{alt.시뮬레이션결과.평균대기시간_개선_분}분</span>
                        </div>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                        <div className="text-[10px] text-slate-400">타병원 전원율</div>
                        <div className="font-extrabold text-slate-900 dark:text-white mt-0.5">
                          {alt.시뮬레이션결과.전원율_현재_pct}% ➔ <span className="text-emerald-600">{alt.시뮬레이션결과.전원율_개선_pct}%</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedAlternativeId(alt.id);
                        setIsAdoptedSuccess(true);
                      }}
                      className={`w-full py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      <Check className="w-4 h-4" />
                      <span>{isSelected ? '선택됨 (담당자 확정)' : '이 대안 채택하기'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 대화형 시뮬레이션 인터랙티브 컨트롤러 (변수 직접 조절) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-emerald-600" />
                  <span>실시간 경영·정책 시뮬레이터 (파라미터 직접 조정)</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  의사 증원, 간호사 증원, 원격협진 여부를 슬라이더로 조절하여 예상 효과를 실시간으로 비교합니다.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setCustomSimParams({ addEmergencyDoctors: 2, addNurses: 6, openIntegratedBedCount: 40, digitalTelemedicine: true })}
                className="px-2.5 py-1 text-[11px] font-bold text-slate-500 hover:text-slate-700 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                초기화
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* 좌측 슬라이더 컨트롤러 (5칸) */}
              <div className="lg:col-span-5 space-y-4 text-xs font-semibold">
                <div>
                  <div className="flex justify-between text-slate-700 dark:text-slate-300 mb-1.5">
                    <span>응급의학과 전문의 증원:</span>
                    <span className="font-extrabold text-blue-600">+{customSimParams.addEmergencyDoctors}명</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="6"
                    step="1"
                    value={customSimParams.addEmergencyDoctors}
                    onChange={(e) => setCustomSimParams({ ...customSimParams, addEmergencyDoctors: Number(e.target.value) })}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                    <span>0명 (현상유지)</span>
                    <span>3명 (권장)</span>
                    <span>6명 (최대)</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-700 dark:text-slate-300 mb-1.5">
                    <span>야간 전담 간호인력 확충:</span>
                    <span className="font-extrabold text-indigo-600">+{customSimParams.addNurses}명</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="16"
                    step="2"
                    value={customSimParams.addNurses}
                    onChange={(e) => setCustomSimParams({ ...customSimParams, addNurses: Number(e.target.value) })}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                    <span>0명</span>
                    <span>8명</span>
                    <span>16명</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <span className="text-slate-700 dark:text-slate-300">국립대병원 24시간 원격협진망 연계:</span>
                  <button
                    type="button"
                    onClick={() => setCustomSimParams({ ...customSimParams, digitalTelemedicine: !customSimParams.digitalTelemedicine })}
                    className={`px-3 py-1 rounded-full text-xs font-bold cursor-pointer transition ${
                      customSimParams.digitalTelemedicine
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-600'
                    }`}
                  >
                    {customSimParams.digitalTelemedicine ? '연계 적용 ON' : '미적용 OFF'}
                  </button>
                </div>
              </div>

              {/* 우측 실시간 시뮬레이션 결과 표 (7칸) */}
              <div className="lg:col-span-7 bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 space-y-3">
                <div className="text-xs font-black text-slate-900 dark:text-white flex items-center justify-between">
                  <span>실시간 시뮬레이션 예측 성과</span>
                  <span className="text-blue-600 font-extrabold">예상 소요예산: 약 {simulatedImpact.estBudget}억원/년</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="text-[10px] text-slate-400">응급환자 처리량</div>
                    <div className="text-sm font-black text-blue-600 mt-1">
                      {simulatedImpact.newHandling.toLocaleString()}명
                    </div>
                    <div className="text-[10px] text-emerald-600 font-bold mt-0.5">
                      +{simulatedImpact.handlingGrowthPct}% 증가
                    </div>
                  </div>

                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="text-[10px] text-slate-400">평균 대기시간</div>
                    <div className="text-sm font-black text-slate-900 dark:text-white mt-1">
                      {simulatedImpact.newWaitTime}분
                    </div>
                    <div className="text-[10px] text-emerald-600 font-bold mt-0.5">
                      -{simulatedImpact.waitTimeReductionPct}% 단축
                    </div>
                  </div>

                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="text-[10px] text-slate-400">타병원 전원율</div>
                    <div className="text-sm font-black text-emerald-600 mt-1">
                      {simulatedImpact.newTransferRate}%
                    </div>
                    <div className="text-[10px] text-emerald-600 font-bold mt-0.5">
                      -{simulatedImpact.transferReductionPct}% 감소
                    </div>
                  </div>

                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="text-[10px] text-slate-400">공공성 종합점수</div>
                    <div className="text-sm font-black text-indigo-600 mt-1">
                      {simulatedImpact.newPublicScore}점
                    </div>
                    <div className="text-[10px] text-indigo-600 font-bold mt-0.5">
                      +{simulatedImpact.newPublicScore - currentHospital.진단지표.공공성}점 상승
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  * 시뮬레이션 수치는 시연용 단순 계산식으로 만든 값이며, 실제 실적 자료나 검증된 예측 모델에 근거하지 않습니다.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 7. 서브탭 5: 세부 추진계획 */}
      {/* ==================================================================== */}
      {activeSubtab === 'execution' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[10px] font-black text-amber-600 uppercase tracking-wider">
                  Action Plan RoadMap (2026-2027)
                </span>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  {currentHospital.실행계획.과제명}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">
                  주관: {currentHospital.실행계획.주관부서} ({currentHospital.실행계획.추진기간})
                </span>
              </div>
            </div>

            {/* 과제 세부 내용 & 예산 매칭 구조 */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* 좌측: 단계별 추진 내용 (7칸) */}
              <div className="lg:col-span-7 space-y-3">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-amber-500" />
                  <span>단계별 세부 추진계획</span>
                </h4>
                <div className="space-y-2">
                  {currentHospital.실행계획.추진내용.map((step, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-start gap-3">
                      <span className="w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 text-xs font-black flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                        {step}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 우측: 재정 투자 계획 및 매칭 비율 (5칸) */}
              <div className="lg:col-span-5 space-y-3">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-emerald-500" />
                  <span>소요 예산 및 재원 조달 계획 (합계 9.6억원)</span>
                </h4>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-3 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                    <span className="text-slate-500">인건비 (전문의/간호사 충원):</span>
                    <span className="font-bold text-slate-900 dark:text-white">{currentHospital.실행계획.소요예산.인건비_억원}억원</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                    <span className="text-slate-500">시스템 (AI EMR 협진망 연계):</span>
                    <span className="font-bold text-slate-900 dark:text-white">{currentHospital.실행계획.소요예산.시스템_억원}억원</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                    <span className="text-slate-500">시설장비 (응급실 장비 보강):</span>
                    <span className="font-bold text-slate-900 dark:text-white">{currentHospital.실행계획.소요예산.시설장비_억원}억원</span>
                  </div>

                  <div className="pt-2">
                    <div className="text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">재원 매칭 비율</div>
                    <div className="flex h-3 rounded-full overflow-hidden">
                      <div style={{ width: `${currentHospital.실행계획.소요예산.국비매칭_pct}%` }} className="bg-blue-600" title="국비 70%" />
                      <div style={{ width: `${currentHospital.실행계획.소요예산.지방비매칭_pct}%` }} className="bg-indigo-400" title="지방비 30%" />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                      <span>국비 보조 {currentHospital.실행계획.소요예산.국비매칭_pct}% (6.72억원)</span>
                      <span>지자체비 {currentHospital.실행계획.소요예산.지방비매칭_pct}% (2.88억원)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 과제 목표 KPI 목록 */}
            <div className="pt-2 space-y-2">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Target className="w-4 h-4 text-rose-500" />
                <span>핵심 성과지표 (Target KPIs)</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {currentHospital.실행계획.목표KPI.map((kpi, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60">
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{kpi.항목}</div>
                    <div className="flex items-center gap-2 mt-2 text-xs">
                      <span className="text-slate-400">{kpi.현재값}</span>
                      <span>➔</span>
                      <span className="font-extrabold text-blue-600 dark:text-blue-400">{kpi.목표값}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">달성기한: {kpi.달성기한}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 8. 서브탭 6: 성과관리 & 환류 (KPI 대비 실적 및 AI 추가 처방) */}
      {/* ==================================================================== */}
      {activeSubtab === 'kpi' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Target className="w-5 h-5 text-rose-600" />
                  <span>성과관리 및 모니터링 (KPI 추적 & 환류)</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  개선 사업 착수 이후 목표 대비 현재 실적 달성률을 추적하고, 미달성 지표에 대해 AI가 추가 개선방안을 제시합니다.
                </p>
              </div>

              <span className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-bold text-xs">
                가상 시연 데이터 (실시간 연동 아님)
              </span>
            </div>

            {/* KPI 리스트 카드 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentHospital.성과관리목록.map((kpi, idx) => (
                <div key={idx} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {kpi.kpi명}
                    </span>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
                      kpi.상태 === '달성'
                        ? 'bg-emerald-100 text-emerald-700'
                        : kpi.상태 === '근접'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-rose-100 text-rose-700'
                    }`}>
                      {kpi.상태} ({kpi.달성률_pct}%)
                    </span>
                  </div>

                  {/* 프로그레스 바 */}
                  <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <div
                      style={{ width: `${Math.min(100, kpi.달성률_pct)}%` }}
                      className={`h-full ${
                        kpi.달성률_pct >= 90 ? 'bg-emerald-500' : kpi.달성률_pct >= 75 ? 'bg-blue-500' : 'bg-rose-500'
                      }`}
                    />
                  </div>

                  <div className="flex justify-between text-xs text-slate-600 dark:text-slate-300 font-medium">
                    <span>현재 실적: <strong>{kpi.현재실적}{kpi.단위}</strong></span>
                    <span>목표치: <strong>{kpi.목표}{kpi.단위}</strong></span>
                  </div>

                  {/* AI 진단평가 및 추가 개선안 */}
                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 space-y-1.5 text-[11px]">
                    <div className="text-slate-700 dark:text-slate-300">
                      📝 <strong>AI 진단평가:</strong> {kpi.AI진단평가}
                    </div>
                    <div className="text-blue-700 dark:text-blue-300 font-semibold">
                      💡 <strong>AI 추가 개선방안:</strong> {kpi.AI추가개선안}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 9. 서브탭 7: 전국 41개 거점공공병원 통합 현황 분석 */}
      {/* ==================================================================== */}
      {activeSubtab === 'national_view' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-cyan-600" />
                  <span>전국 41개 거점공공병원 AI 종합진단 분포</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  지방의료원 35개소 및 적십자병원 6개소의 종합진단 점수 및 등급별 분포 현황
                </p>
              </div>

              {/* 검색 및 필터 */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="병원명 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden"
                />
              </div>
            </div>

            {/* 전국 41개 병원 종합 랭킹 그리드 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredHospitals.map((h, idx) => (
                <div
                  key={h.id}
                  onClick={() => {
                    setSelectedHospitalId(h.id);
                    setActiveSubtab('diagnosis');
                  }}
                  className={`p-3.5 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                    h.id === currentHospital.id
                      ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-500 ring-2 ring-blue-500/20'
                      : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60 hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400 font-bold">#{idx + 1}</span>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">{h.기관명}</h4>
                      <span className="text-[10px] text-slate-500">({h.시도명})</span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      허가병상 {h.허가병상}개 • 전문의 {h.전문의수}명
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-base font-black text-blue-600 dark:text-blue-400">
                      {h.진단지표.종합점수}점
                    </div>
                    <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                      {h.진단지표.종합등급}등급
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 10. AI 분석 근거 보기 (XAI 설명가능성) 모달 */}
      {/* ==================================================================== */}
      {isEvidenceModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  AI 분석 근거 및 데이터 출처 (XAI)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEvidenceModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
              >
                ✕ 닫기
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              현재 표시되는 진단 점수와 근거는 가상 시연 데이터입니다. 아래 「연계 예정」 자료를 실제로 연계해야 기관별 실적에 근거한 진단이 됩니다.
            </p>

            <div className="space-y-3">
              {currentHospital.산출근거목록.map((ev, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-1.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-blue-600 dark:text-blue-400">{ev.지표명} (부여점수: {ev.점수}점)</span>
                    <span className="text-[10px] text-slate-400">기준: {ev.기준연도}</span>
                  </div>
                  <div className="text-slate-700 dark:text-slate-300">
                    <strong>산출 기준:</strong> {ev.산출기준}
                  </div>
                  <div className="text-slate-500">
                    <strong>사용 데이터:</strong> {ev.사용데이터}
                  </div>
                  <div className="text-slate-500">
                    <strong>비교 대상군:</strong> {ev.비교대상}
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setIsEvidenceModalOpen(false)}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer"
            >
              확인 완료
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
