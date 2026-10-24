'use client';

// ============================================================================
// 2025년 지역거점 공공병원 운영평가 통합 대시보드
// 근거: 보건복지부 / 국립중앙의료원 「2025년 지역거점 공공병원 운영평가 결과보고서」(2025. 12. 31.)
// 법적 근거: 「지방의료원의 설립 및 운영에 관한 법률」 제21조 (운영평가 및 지도)
// 구성:
//   1. [평가 종합 결과]: 종합 77.9점(+4.3점), A등급 15개소, 4대 영역/11개 부문, 20개년 추이
//   2. [41개 기관 벤치마크]: 전국 41개소 전수 병상·인력·점수 벤치마킹 및 상세 진단
//   3. [101개 조사항목 가이드]: 4영역-11부문-20분야-50기준-101항목 B-set 체계 및 점수분포
//   4. [만족도 & CS 포트폴리오]: 환자(90.7점)/직원(68.7점)/리더십(67.4점) 및 4사분면 매트릭스
//   5. [자가진단 시뮬레이터]: 11대 부문 실시간 가중치 시뮬레이션 및 A등급 달성 처방전
//   6. [우수사례 & 혁신과제]: 8대 우수기관(김천·서귀포·이천·포항 등) 및 2026 필수의료 혁신과제
// ============================================================================

import React, { useState, useMemo } from 'react';
import {
  Building2,
  Award,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  BarChart3,
  Search,
  Filter,
  Sparkles,
  Layers,
  Users,
  HeartPulse,
  Scale,
  ShieldCheck,
  ChevronRight,
  Info,
  Sliders,
  FileText,
  RotateCcw,
  ExternalLink,
  ChevronDown,
  Activity,
  Bed,
  Stethoscope,
  Compass,
  ArrowUpRight,
  UserCheck,
} from 'lucide-react';

import {
  운영평가_4대영역_목록,
  전국_41개_지역거점_공공병원_운영평가_목록,
  공공병원_운영평가_기관_데이터,
  연도별_운영평가_종합점수_추이,
  등급별_기관수_2025,
  환자만족도_통계_2025,
  내부직원_리더십_만족도_통계_2025,
  운영평가_8대_우수기관_사례,
  평가_등급,
} from '@/lib/지역거점_공공병원_운영평가_데이터셋';

import {
  simulate_hospital_evaluation,
  get_national_evaluation_summary,
  calculate_b_set_score,
  calculate_grid_fulfillment,
  병원_평가_시뮬레이션_입력,
} from '@/lib/지역거점_운영평가_엔진';
import { ISP_과제_뱃지 } from './ISP_과제_뱃지';

export type 운영평가_탭_타입 =
  | 'overview'       // 1. 종합 평가 결과
  | 'benchmark'      // 2. 41개 기관 벤치마크
  | 'indicators'     // 3. 101개 지표 및 B-set 체계
  | 'satisfaction'   // 4. 환자·직원 만족도 & CS 포트폴리오
  | 'simulator'      // 5. 자가진단 & B-set 시뮬레이터
  | 'best_practices';// 6. 우수사례 & 혁신과제

export const 지역거점_운영평가_통합_대시보드: React.FC = () => {
  const [activeTab, setActiveTab] = useState<운영평가_탭_타입>('overview');

  // --------------------------------------------------------------------------
  // 기관 벤치마크 탭 상태
  // --------------------------------------------------------------------------
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSido, setSelectedSido] = useState('전체');
  const [selectedType, setSelectedType] = useState<'전체' | '지방의료원' | '적십자병원'>('전체');
  const [sortBy, setSortBy] = useState<'bed_desc' | 'doc_desc' | 'name_asc'>('bed_desc');
  const [selectedHospital, setSelectedHospital] = useState<공공병원_운영평가_기관_데이터 | null>(null);

  // 시도 목록
  const sidoList = useMemo(() => {
    const set = new Set(전국_41개_지역거점_공공병원_운영평가_목록.map((h) => h.시도));
    return ['전체', ...Array.from(set)];
  }, []);

  // 필터링 및 정렬된 병원 목록
  const filteredHospitals = useMemo(() => {
    return 전국_41개_지역거점_공공병원_운영평가_목록
      .filter((h) => {
        const matchName = h.기관명.toLowerCase().includes(searchTerm.toLowerCase()) || h.시군구.includes(searchTerm);
        const matchSido = selectedSido === '전체' || h.시도 === selectedSido;
        const matchType =
          selectedType === '전체' ||
          (selectedType === '적십자병원' ? h.기관명.includes('적십자') : !h.기관명.includes('적십자'));
        return matchName && matchSido && matchType;
      })
      .sort((a, b) => {
        if (sortBy === 'bed_desc') return b.허가병상 - a.허가병상;
        if (sortBy === 'doc_desc') return b.전문의수 - a.전문의수;
        return a.기관명.localeCompare(b.기관명, 'ko');
      });
  }, [searchTerm, selectedSido, selectedType, sortBy]);

  // 부록 2 우수 사례에 오른 기관 (기관별 점수·등급은 보고서 미공개)
  const 우수사례_기관 = useMemo(() => new Set(운영평가_8대_우수기관_사례.map((x) => x.병원명.replace(/\s+/g, ''))), []);
  const 우수사례_여부 = (기관명: string) => {
    const 키 = 기관명.replace(/\s+/g, '');
    return Array.from(우수사례_기관).some((x) => x.includes(키) || 키.includes(x));
  };

  // --------------------------------------------------------------------------
  // 지표 탐색기 탭 상태
  // --------------------------------------------------------------------------
  const [expandedDomain, setExpandedDomain] = useState<string>('quality');
  const [indicatorSearch, setIndicatorSearch] = useState('');

  // --------------------------------------------------------------------------
  // 자가진단 시뮬레이터 상태
  // --------------------------------------------------------------------------
  const [simInput, setSimInput] = useState<병원_평가_시뮬레이션_입력>({
    양질의_의료_일반진료: 69.9,
    양질의_의료_환자만족: 90.7,
    공익적_의료지원체계: 79.3,
    공익적_포용적의료: 75.9,
    공익적_특화서비스: 87.6,
    합리적_경영관리: 80.8,
    합리적_경영성과: 70.1,
    책임_거버넌스: 82.6,
    책임_리더십: 53.7,
    책임_윤리경영: 88.4,
    책임_작업환경: 80.9,
  });

  const simResult = useMemo(() => simulate_hospital_evaluation(simInput), [simInput]);

  const handleResetSimulator = () => {
    setSimInput({
      양질의_의료_일반진료: 69.9,
      양질의_의료_환자만족: 90.7,
      공익적_의료지원체계: 79.3,
      공익적_포용적의료: 75.9,
      공익적_특화서비스: 87.6,
      합리적_경영관리: 80.8,
      합리적_경영성과: 70.1,
      책임_거버넌스: 82.6,
      책임_리더십: 53.7,
      책임_윤리경영: 88.4,
      책임_작업환경: 80.9,
    });
  };

  const nationalSummary = useMemo(() => get_national_evaluation_summary(), []);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. 상단 타이틀 & 거버넌스 뱃지 헤더 */}
      <div className="bg-white dark:bg-[#15161b] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full text-xs font-black bg-blue-600 text-white shadow-xs">
              보건복지부 · 국립중앙의료원 공식 보고서
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              2025. 12. 31. 발행
            </span>
            <ISP_과제_뱃지 taskId="3.8" customLabel="과제 3.8 지역거점 운영평가 연계" />
            <span className="text-xs text-slate-400">
              지방의료원법 제21조 근거 전국 41개소 전수 평가
            </span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Award className="w-6 h-6 text-blue-600" />
            2025년 지역거점 공공병원 운영평가 결과 및 자가진단
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            4대 영역(양질의 의료 30% · 공익적 보건의료 30% · 합리적 운영 20% · 책임 운영 20%), 11개 부문, 101개 조사항목 B-set 체계 실증 분석
          </p>
        </div>

        {/* 핵심 KPI 미니 뱃지 (종합 77.9점 / A등급 15개소) */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-800/60 rounded-2xl px-4 py-3 text-right">
            <div className="text-[11px] font-bold text-blue-600 dark:text-blue-400">2025 전국 종합평균</div>
            <div className="text-2xl font-black text-blue-950 dark:text-blue-100 tracking-tight">
              77.9<span className="text-sm font-bold text-blue-600">점</span>
              <span className="ml-1.5 text-xs text-emerald-600 font-bold">(+4.3↑)</span>
            </div>
          </div>
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl px-4 py-3 text-right">
            <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">A등급 획득 기관</div>
            <div className="text-2xl font-black text-emerald-950 dark:text-emerald-100 tracking-tight">
              15<span className="text-sm font-bold text-emerald-600">개소</span>
              <span className="ml-1.5 text-xs text-emerald-600 font-bold">(전년 4→15)</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. 6대 서브탭 네비게이션 바 */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'overview'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>1. 평가 종합 결과</span>
        </button>

        <button
          onClick={() => setActiveTab('benchmark')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'benchmark'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>2. 41개 기관 벤치마크</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 font-bold">
            41개소
          </span>
        </button>

        <button
          onClick={() => setActiveTab('indicators')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'indicators'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>3. 101개 조사항목 &amp; B-set 체계</span>
        </button>

        <button
          onClick={() => setActiveTab('satisfaction')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'satisfaction'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <HeartPulse className="w-3.5 h-3.5" />
          <span>4. 만족도 &amp; CS 포트폴리오</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200 font-bold">
            90.7점
          </span>
        </button>

        <button
          onClick={() => setActiveTab('simulator')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'simulator'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>5. 자가진단 &amp; B-set 시뮬레이터</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200 font-bold">
            Action Plan
          </span>
        </button>

        <button
          onClick={() => setActiveTab('best_practices')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'best_practices'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>6. 우수사례 &amp; 혁신과제</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-200 font-bold">
            8대 우수
          </span>
        </button>
      </div>

      {/* ==================================================================== */}
      {/* 탭 1: 평가 종합 결과 (Overview) */}
      {/* ==================================================================== */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* 4대 영역 핵심 점수 카드 4종 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {운영평가_4대영역_목록.map((domain) => (
              <div
                key={domain.코드}
                className="bg-white dark:bg-[#15161b] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs hover:border-blue-400 transition"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    가중치 {domain.가중치}%
                  </span>
                  <span
                    className={`text-xs font-black px-2 py-0.5 rounded-full ${
                      domain.전년대비_증감 > 0
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        : domain.전년대비_증감 < 0
                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {domain.전년대비_증감 > 0 ? `+${domain.전년대비_증감}↑` : domain.전년대비_증감 < 0 ? `${domain.전년대비_증감}↓` : '동일'}
                  </span>
                </div>
                <div className="text-sm font-black text-slate-900 dark:text-white mb-1">
                  {domain.영역명}
                </div>
                <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
                  {domain.평균점수_2025}
                  <span className="text-sm font-medium text-slate-400 ml-1">점</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {domain.목표}
                </p>
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">세부 부문</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    {domain.부문목록.map((s) => `${s.부문명}(${s.평균점수_2025}점)`).join(', ')}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* 20개년 추이 & 2025 등급 분포 2열 그리드 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 좌측 2열: 2006~2025년 20년간 종합점수 변천 추이 */}
            <div className="lg:col-span-2 bg-white dark:bg-[#15161b] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    지역거점 공공병원 운영평가 20개년 종합점수 추이 (2006~2025년)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    코로나19 기간(’21~’22년) 회복기를 지나 2025년 77.9점으로 최고 수준 회복
                  </p>
                </div>
                <span className="text-xs font-bold text-slate-400">단위: 점 (100점 만점)</span>
              </div>

              {/* 시각화 바 차트 (최근 10년 강조) */}
              <div className="h-48 flex items-end gap-1.5 pt-6 pb-2 px-1">
                {연도별_운영평가_종합점수_추이.slice(-12).map((item) => {
                  const heightPercent = Math.max(10, ((item.전체_종합점수 - 50) / (85 - 50)) * 100);
                  const isLatest = item.연도 === 2025;
                  return (
                    <div key={item.연도} className="flex-1 flex flex-col items-center h-full justify-end group">
                      <span className={`text-[10px] font-bold mb-1 transition ${isLatest ? 'text-blue-600 font-black' : 'text-slate-400 group-hover:text-slate-700'}`}>
                        {item.전체_종합점수}
                      </span>
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full rounded-t-lg transition-all duration-300 ${
                          isLatest
                            ? 'bg-gradient-to-t from-blue-700 to-indigo-500 shadow-md'
                            : 'bg-slate-200 dark:bg-slate-700 group-hover:bg-blue-400'
                        }`}
                        title={`${item.연도}년: ${item.전체_종합점수}점`}
                      />
                      <span className={`text-[11px] mt-2 ${isLatest ? 'font-black text-blue-600 dark:text-blue-400' : 'text-slate-400'}`}>
                        &apos;{String(item.연도).slice(2)}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 flex items-center justify-between">
                <span>※ 2020~2022년 감염병 대응 기여도 임시 지표 반영 후, 2023년부터 4대 영역 100% 정상 체계로 전환</span>
                <span className="font-bold text-blue-600">2025 종합 평균: 77.9점 (역대 최고치 기록)</span>
              </div>
            </div>

            {/* 우측 1열: 2025 등급 분포 현황 */}
            <div className="bg-white dark:bg-[#15161b] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2 mb-1">
                  <Award className="w-5 h-5 text-amber-500" />
                  2025년 평가 등급별 기관 분포
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                  총 41개소 중 A등급 15개소(36.6%)로 전년 4개소 대비 증가. B·C·D등급 기관 수와 기관별 등급은 보고서에 공개되지 않았습니다.
                </p>

                <div className="space-y-3">
                  {Object.entries(등급별_기관수_2025).map(([gradeKey, gradeInfo]) => (
                    <div
                      key={gradeKey}
                      className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-8 h-8 rounded-xl font-black text-sm flex items-center justify-center border ${gradeInfo.색상}`}>
                          {gradeKey[0]}
                        </span>
                        <div>
                          <div className="text-xs font-black text-slate-900 dark:text-white">
                            {gradeKey} ({gradeInfo.기준})
                          </div>
                          <div className="text-[11px] text-slate-400">
                            점수 구간 충족 기관
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        {gradeInfo.기관수 === null ? (
                          <div className="text-xs font-bold text-slate-400">미공개</div>
                        ) : (
                          <>
                            <div className="text-base font-black text-slate-900 dark:text-white">
                              {gradeInfo.기관수}<span className="text-xs font-normal text-slate-400">개소</span>
                            </div>
                            <div className="text-[11px] font-bold text-blue-600 dark:text-blue-400">{gradeInfo.비율}%</div>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 text-xs text-blue-800 dark:text-blue-300">
                <span className="font-bold">평가 총평:</span> 필수의료 인프라 회복 및 환자만족도 개선(90.7점)에 힘입어 15개소가 A등급(80점 이상)을 받음. (보고서 74쪽)
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 탭 2: 전국 41개 공공병원 벤치마크 (41 Hospitals Benchmark) */}
      {/* ==================================================================== */}
      {activeTab === 'benchmark' && (
        <div className="space-y-6">
          {/* 필터 및 검색 바 */}
          <div className="bg-white dark:bg-[#15161b] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {/* 검색창 */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 input-icon" />
                <input
                  type="text"
                  placeholder="병원명 또는 시군구 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs w-48 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* 시도 필터 */}
              <select
                value={selectedSido}
                onChange={(e) => setSelectedSido(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                {sidoList.map((sido) => (
                  <option key={sido} value={sido}>{sido}</option>
                ))}
              </select>

              {/* 유형 필터 */}
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as any)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                <option value="전체">전체 기관 (41개)</option>
                <option value="지방의료원">지방의료원 (35개)</option>
                <option value="적십자병원">적십자병원 (6개)</option>
              </select>

            </div>

            {/* 정렬 셀렉터 */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-bold">정렬:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                <option value="bed_desc">허가병상 많은순</option>
                <option value="doc_desc">전문의수 많은순</option>
                <option value="name_asc">병원명 가나다순</option>
              </select>
            </div>
          </div>

          {/* 41개 병원 카드 그리드 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredHospitals.map((hospital) => {
              return (
                <div
                  key={hospital.연번}
                  onClick={() => setSelectedHospital(hospital)}
                  className="bg-white dark:bg-[#15161b] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs hover:border-blue-500 hover:shadow-md transition cursor-pointer flex flex-col justify-between group"
                >
                  <div>
                    {/* 상단 뱃지 행 */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {hospital.시도} {hospital.시군구}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {hospital.종별}
                        </span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold border bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
                        {hospital.소속}
                      </span>
                    </div>

                    {/* 병원명 */}
                    <h4 className="text-base font-black text-slate-900 dark:text-white group-hover:text-blue-600 transition mb-3">
                      {hospital.기관명}
                      {우수사례_여부(hospital.기관명) && (
                        <span className="ml-1.5 text-xs font-bold text-amber-500" title="결과보고서 부록 2 「2025년 우수 사례」 수록 기관">★ 우수 사례</span>
                      )}
                    </h4>

                    {/* 주요 지표 3개 (병상, 전문의, 간호사) */}
                    <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80 text-center mb-3">
                      <div>
                        <div className="text-[10px] text-slate-400 font-bold">허가병상</div>
                        <div className="text-xs font-black text-slate-800 dark:text-slate-200">
                          {hospital.허가병상}<span className="text-[10px] font-normal text-slate-400">병상</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400 font-bold">전문의</div>
                        <div className="text-xs font-black text-slate-800 dark:text-slate-200">
                          {hospital.전문의수}<span className="text-[10px] font-normal text-slate-400">명</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400 font-bold">간호직</div>
                        <div className="text-xs font-black text-slate-800 dark:text-slate-200">
                          {hospital.간호직_소계}<span className="text-[10px] font-normal text-slate-400">명</span>
                        </div>
                      </div>
                    </div>

                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
                    <span className="truncate">응급: {hospital.응급지정}</span>
                    <span className="shrink-0">상세 보기 ➔</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 병원 상세 정보 모달 */}
          {selectedHospital && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
              <div className="bg-white dark:bg-[#1a1b23] max-w-2xl w-full rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl max-h-[90vh] overflow-y-auto space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {selectedHospital.시도} {selectedHospital.시군구}
                      </span>
                      <span className="text-xs text-slate-400">{selectedHospital.종별} ({selectedHospital.소속})</span>
                    </div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">
                      {selectedHospital.기관명}
                    </h3>
                  </div>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  기관별 운영평가 점수·등급은 결과보고서에 공개되지 않아 표시하지 않습니다. 2025 전국 평균: 종합 77.9점 · 양질의 의료 76.0 · 공익적 보건의료 82.7 · 합리적 운영 75.5 · 책임 운영 75.5 (보고서 74~75쪽). 아래는 부록 1 일반현황입니다.
                </p>

                {/* 필수 시설 및 병상 상세 (부록 1 표 10-2) */}
                <div>
                  <h5 className="text-xs font-black text-slate-800 dark:text-slate-200 mb-2">필수의료 시설 및 병상 현황</h5>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-2 text-center text-xs">
                    <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                      <span className="text-[10px] text-slate-400 block">중환자실</span>
                      <span className="font-bold">{selectedHospital.중환자실_성인}병상</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                      <span className="text-[10px] text-slate-400 block">음압격리실</span>
                      <span className="font-bold">{selectedHospital.음압격리병실}실</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                      <span className="text-[10px] text-slate-400 block">완화의료(호스피스)</span>
                      <span className="font-bold">{selectedHospital.완화의료_호스피스}병상</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                      <span className="text-[10px] text-slate-400 block">분만실</span>
                      <span className="font-bold">{selectedHospital.분만실}실</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                      <span className="text-[10px] text-slate-400 block">수술실</span>
                      <span className="font-bold">{selectedHospital.수술실}실</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                      <span className="text-[10px] text-slate-400 block">응급병상</span>
                      <span className="font-bold">{selectedHospital.응급병상수}병상</span>
                    </div>
                  </div>
                </div>

                {/* 인력 구성 요약 (부록 1 표 10-3) */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
                  <div className="font-black text-slate-800 dark:text-slate-200 mb-2">인력 구성 (총 {selectedHospital.총직원수}명)</div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-slate-600 dark:text-slate-300">
                    <span>의사직: <strong className="text-blue-600">{selectedHospital.의사직_소계}명</strong> (전문의 {selectedHospital.전문의수}명)</span>
                    <span>간호직: <strong className="text-emerald-600">{selectedHospital.간호직_소계}명</strong> (간호사 {selectedHospital.간호사수}명)</span>
                    <span>보건직: <strong>{selectedHospital.보건직_소계}명</strong></span>
                    <span>행정직: <strong>{selectedHospital.행정직_소계}명</strong></span>
                    <span>응급지정: <strong>{selectedHospital.응급지정}</strong></span>
                    <span>수련병원: <strong>{selectedHospital.수련병원지정}</strong></span>
                  </div>
                </div>

                {/* 닫기 */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => setSelectedHospital(null)}
                    className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    닫기
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================================================================== */}
      {/* 탭 3: 101개 지표 & B-set 평가체계 (Evaluation Structure) */}
      {/* ==================================================================== */}
      {activeTab === 'indicators' && (
        <div className="space-y-6">
          {/* 상단 B-set 알고리즘 안내 카드 */}
          <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 rounded-3xl shadow-md space-y-3">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-blue-500 text-white">
                미국 JCAHO 방식 차용 결과종합 위계 체계
              </span>
              <span className="text-xs text-blue-200">
                조사항목(Item) ➔ 평가기준(Standard) ➔ 평가분야(Grid) ➔ 평가부문(Subdomain) ➔ 평가영역(Domain)
              </span>
            </div>
            <h3 className="text-xl font-black tracking-tight">
              운영평가 B-set 점수종합 규칙 (특정 개수 Critical Numbers)
            </h3>
            <p className="text-xs text-blue-200 leading-relaxed max-w-3xl">
              하위 조사항목이 연계되어 상위 기준의 충족 여부를 결정할 때, 단순 평균이나 합산이 아닌{' '}
              <strong className="text-amber-300">N/2 반올림 정수값(특정 개수)</strong> 기준을 적용합니다. N개가 모두 4점일 때만 4점을 부여하며,
              특정 개수 이상이 2점 이하인 경우 상위 점수가 2점 이하로 제한됩니다. (단, N=2인 경우 특정 개수 2개 적용)
            </p>
          </div>

          {/* 4대 영역 아코디언 탐색기 */}
          <div className="space-y-4">
            {운영평가_4대영역_목록.map((domain) => {
              const isExpanded = expandedDomain === domain.코드;
              return (
                <div
                  key={domain.코드}
                  className="bg-white dark:bg-[#15161b] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setExpandedDomain(isExpanded ? '' : domain.코드)}
                    className="w-full p-5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-900/40 transition cursor-pointer"
                  >
                    <div className="flex items-center gap-3 text-left">
                      <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 flex items-center justify-center font-black text-sm">
                        {domain.가중치}%
                      </div>
                      <div>
                        <div className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                          {domain.영역명}
                          <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                            (2025 전국 평균 {domain.평균점수_2025}점)
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {domain.설명}
                        </p>
                      </div>
                    </div>
                    <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </button>

                  {isExpanded && (
                    <div className="p-5 pt-0 border-t border-slate-100 dark:border-slate-800 space-y-4">
                      {domain.부문목록.map((subdomain) => (
                        <div
                          key={subdomain.부문코드}
                          className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded-md text-xs font-black bg-blue-600 text-white">
                                부문 {subdomain.부문코드}
                              </span>
                              <h4 className="text-sm font-black text-slate-900 dark:text-white">
                                {subdomain.부문명}
                              </h4>
                              <span className="text-xs text-slate-400">
                                (영역 내 가중치 {subdomain.부문가중치}%, 평균 {subdomain.평균점수_2025}점)
                              </span>
                            </div>
                            <span className="text-xs font-bold text-slate-500">
                              {subdomain.분야개수}개 분야 · {subdomain.기준개수}개 기준 · {subdomain.조사항목개수}개 조사항목
                            </span>
                          </div>

                          {/* 부문별 주요 평가 기준 안내 */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                            <div className="p-3 rounded-xl bg-white dark:bg-[#15161b] border border-slate-200 dark:border-slate-800">
                              <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                                📊 점수 산정 척도
                              </span>
                              <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                                Type I (Pass/Fail)부터 Type VIII (개선율 역구간) 및 B-set 복합 종합 방식 적용
                              </span>
                            </div>
                            <div className="p-3 rounded-xl bg-white dark:bg-[#15161b] border border-slate-200 dark:border-slate-800">
                              <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                                📑 평가 자료 원천
                              </span>
                              <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                                현지평가(서류·면담·실사), 건강보험심사평가원(약제급여 등), 국민건강보험공단 청구자료, 알리미 결산서
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 탭 4: 만족도 & CS 포트폴리오 (Satisfaction) */}
      {/* ==================================================================== */}
      {activeTab === 'satisfaction' && (
        <div className="space-y-6">
          {/* 환자만족도 상단 통계 카드 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-[#15161b] p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="text-xs text-slate-400 font-bold mb-1">환자 종합만족도 (전화설문 7,480명)</div>
              <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                90.7<span className="text-sm font-medium text-slate-400 ml-1">점</span>
                <span className="text-xs text-emerald-600 font-bold ml-2">(+3.8↑)</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                외래(88.8점)와 입원(92.5점) 산술평균, 코로나19 이전 수준을 완전히 돌파
              </p>
            </div>

            <div className="bg-white dark:bg-[#15161b] p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="text-xs text-slate-400 font-bold mb-1">직원 만족도 (웹 설문 9,589명)</div>
              <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                68.7<span className="text-sm font-medium text-slate-400 ml-1">점</span>
                <span className="text-xs text-emerald-600 font-bold ml-2">(+0.5↑)</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                재직 2년 이상 전수 설문, 직원교육(71.0점) 최고 vs 근무환경(64.4점) 최저
              </p>
            </div>

            <div className="bg-white dark:bg-[#15161b] p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="text-xs text-slate-400 font-bold mb-1">리더십 만족도 (경영진 평가)</div>
              <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                67.4<span className="text-sm font-medium text-slate-400 ml-1">점</span>
                <span className="text-xs text-emerald-600 font-bold ml-2">(+1.9↑)</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                변화와 혁신(69.9점) 최고 vs 동기부여(65.6점) 최저로 내부소통 강화 과제
              </p>
            </div>
          </div>

          {/* CS 포트폴리오 4사분면 매트릭스 안내 */}
          <div className="bg-white dark:bg-[#15161b] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Compass className="w-5 h-5 text-indigo-600" />
                  환자·직원 만족도 CS 포트폴리오 분석 (중요도 × 만족도 4사분면)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  보고서 제5장 및 제8장 분석: 중요도는 높으나 만족도가 낮아 시급히 개선해야 할 중점개선 과제 도출
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 외래환자 CS 포트폴리오 */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-900 dark:text-white">
                    🏥 외래환자 CS 포트폴리오
                  </span>
                  <span className="text-[11px] text-blue-600 font-bold">외래종합 88.8점</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start gap-2">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-rose-600 text-white shrink-0">
                      중점개선
                    </span>
                    <div>
                      <strong className="text-rose-900 dark:text-rose-200">의사의 진료서비스 (89.4점)</strong>
                      <p className="text-[11px] text-rose-700 dark:text-rose-300">
                        전문적 진료 제공에 대한 환자 기대치(중요도)가 가장 높으나 체감 만족도는 상대적 개선 필요
                      </p>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-start gap-2">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-amber-600 text-white shrink-0">
                      점진개선
                    </span>
                    <div>
                      <strong className="text-amber-900 dark:text-amber-200">예약 및 접수절차 (88.4점)</strong>
                      <p className="text-[11px] text-amber-700 dark:text-amber-300">
                        대기시간 지체원인 인지(85.6점) 등 절차 안내의 지속적 개선 요망
                      </p>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 flex items-start gap-2">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-emerald-600 text-white shrink-0">
                      유지강화
                    </span>
                    <div>
                      <strong className="text-emerald-900 dark:text-emerald-200">병원환경 및 기타의료서비스 (90.8점)</strong>
                      <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
                        진료/검사 시 배려(92.9점), 청결성(92.2점) 등 우수한 강점 유지
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 입원환자 및 직원 CS 포트폴리오 */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-900 dark:text-white">
                    🛏️ 입원환자 &amp; 🧑‍⚕️ 내부직원 중점개선
                  </span>
                  <span className="text-[11px] text-purple-600 font-bold">입원 92.5점 / 직원 68.7점</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/60 flex items-start gap-2">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-purple-600 text-white shrink-0">
                      입원 중점
                    </span>
                    <div>
                      <strong className="text-purple-900 dark:text-purple-200">간호사·의사 진료서비스 &amp; 병원환경</strong>
                      <p className="text-[11px] text-purple-700 dark:text-purple-300">
                        신속성(93.5점), 투약 이유설명(94.7점), 침구관리(94.0점) 등 세심한 간호 케어 중점
                      </p>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 flex items-start gap-2">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-blue-600 text-white shrink-0">
                      직원 중점
                    </span>
                    <div>
                      <strong className="text-blue-900 dark:text-blue-200">평가와 보상(65.0점) 및 근무환경(64.4점)</strong>
                      <p className="text-[11px] text-blue-700 dark:text-blue-300">
                        업무량 대비 적절한 인력배치 만족도가 낮아, 의료인력 수급 및 근무여건 개선 시급
                      </p>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 flex items-start gap-2">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-indigo-600 text-white shrink-0">
                      리더십 중점
                    </span>
                    <div>
                      <strong className="text-indigo-900 dark:text-indigo-200">조직관리(66.1점) 및 동기부여(65.6점)</strong>
                      <p className="text-[11px] text-indigo-700 dark:text-indigo-300">
                        의사직-간호직 간 소통 체계 및 노사협의회 정기 운영을 통한 경영진 신뢰 구축
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 탭 5: 자가진단 & B-set 시뮬레이터 (Simulator) */}
      {/* ==================================================================== */}
      {activeTab === 'simulator' && (
        <div className="space-y-6">
          {/* 상단 시뮬레이션 결과 대시보드 */}
          <div className="bg-white dark:bg-[#15161b] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-slate-400">진단 대상:</span>
                <span className="text-sm font-black text-blue-600 dark:text-blue-400" title="기관별 운영평가 점수는 결과보고서에 공개되지 않아, 시작값은 전국 부문 평균이며 직접 입력해 진단합니다">
                  직접 입력 (시작값: 2025 전국 부문 평균)
                </span>
                <button
                  type="button"
                  onClick={handleResetSimulator}
                  className="ml-2 text-[11px] text-slate-400 hover:text-slate-600 flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" /> 초기화
                </button>
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                예상 종합점수: {simResult.종합점수}점
                <span
                  className={`px-3 py-1 rounded-full text-sm font-black border ${
                    simResult.등급 === 'A'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950 dark:text-blue-300'
                  }`}
                >
                  {simResult.등급}등급
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {simResult.A등급_달성_차이 === 0
                  ? '🎉 축하합니다! 80점 이상으로 A등급(우수기관) 기준을 충족하고 있습니다.'
                  : `⚠️ A등급(80.0점) 달성까지 ${simResult.A등급_달성_차이}점이 추가로 필요합니다.`}
              </p>
            </div>

            {/* 4대 영역별 점수 미니 카드 */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 font-bold block">1. 양질의 의료 (30%)</span>
                <span className="text-lg font-black text-slate-900 dark:text-white">
                  {simResult.영역별_점수.양질의_의료}점
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 font-bold block">2. 공익적 보건 (30%)</span>
                <span className="text-lg font-black text-slate-900 dark:text-white">
                  {simResult.영역별_점수.공익적_보건의료}점
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 font-bold block">3. 합리적 운영 (20%)</span>
                <span className="text-lg font-black text-slate-900 dark:text-white">
                  {simResult.영역별_점수.합리적_운영}점
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 font-bold block">4. 책임 운영 (20%)</span>
                <span className="text-lg font-black text-slate-900 dark:text-white">
                  {simResult.영역별_점수.책임_운영}점
                </span>
              </div>
            </div>
          </div>

          {/* 11대 평가부문 슬라이더 그리드 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 좌측: 양질의 의료 & 공익적 보건의료 슬라이더 */}
            <div className="bg-white dark:bg-[#15161b] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                <Activity className="w-4 h-4 text-blue-600" />
                의료서비스 부문 지표 (가중치 60%)
              </h4>

              <div className="space-y-4 text-xs">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="font-bold">1.1 일반진료서비스 (부문 70% / 영역 30%)</span>
                    <span className="font-black text-blue-600">{simInput.양질의_의료_일반진료}점</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="100"
                    step="0.5"
                    value={simInput.양질의_의료_일반진료}
                    onChange={(e) => setSimInput({ ...simInput, 양질의_의료_일반진료: parseFloat(e.target.value) })}
                    className="w-full accent-blue-600"
                  />
                  <span className="text-[10px] text-slate-400">진료인프라(필수진료과·시설·인력) + 진료과정(CP·항생제) + 진료결과(RI·RDRG·응급)</span>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="font-bold">1.2 환자만족도 (부문 30% / 영역 30%)</span>
                    <span className="font-black text-blue-600">{simInput.양질의_의료_환자만족}점</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="100"
                    step="0.5"
                    value={simInput.양질의_의료_환자만족}
                    onChange={(e) => setSimInput({ ...simInput, 양질의_의료_환자만족: parseFloat(e.target.value) })}
                    className="w-full accent-blue-600"
                  />
                  <span className="text-[10px] text-slate-400">외래(88.8점) 및 입원(92.5점) 6단계 산출 만족도</span>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="font-bold">2.1 의료지원 체계 및 연계 (부문 30% / 영역 30%)</span>
                    <span className="font-black text-indigo-600">{simInput.공익적_의료지원체계}점</span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="100"
                    step="0.5"
                    value={simInput.공익적_의료지원체계}
                    onChange={(e) => setSimInput({ ...simInput, 공익적_의료지원체계: parseFloat(e.target.value) })}
                    className="w-full accent-indigo-600"
                  />
                  <span className="text-[10px] text-slate-400">공공의료 전담조직·인력 + 지역사회 보건·복지 연계 및 의뢰회송</span>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="font-bold">2.2 포용적 의료이용 (부문 20% / 영역 30%)</span>
                    <span className="font-black text-indigo-600">{simInput.공익적_포용적의료}점</span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="100"
                    step="0.5"
                    value={simInput.공익적_포용적의료}
                    onChange={(e) => setSimInput({ ...simInput, 공익적_포용적의료: parseFloat(e.target.value) })}
                    className="w-full accent-indigo-600"
                  />
                  <span className="text-[10px] text-slate-400">간호간병통합 + 호스피스 + 연명의료 + 의료급여/취약계층 의료비지원</span>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="font-bold">2.3 병원별 특화서비스 (부문 50% / 영역 30%)</span>
                    <span className="font-black text-indigo-600">{simInput.공익적_특화서비스}점</span>
                  </div>
                  <input
                    type="range"
                    min="40"
                    max="100"
                    step="0.5"
                    value={simInput.공익적_특화서비스}
                    onChange={(e) => setSimInput({ ...simInput, 공익적_특화서비스: parseFloat(e.target.value) })}
                    className="w-full accent-indigo-600"
                  />
                  <span className="text-[10px] text-slate-400">공공보건의료계획 1분야(필수의료) 시행결과 평가 연계 (25점 만점 환산)</span>
                </div>
              </div>
            </div>

            {/* 우측: 합리적 운영 & 책임 운영 슬라이더 */}
            <div className="bg-white dark:bg-[#15161b] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                <Scale className="w-4 h-4 text-emerald-600" />
                운영 및 경영 부문 지표 (가중치 40%)
              </h4>

              <div className="space-y-4 text-xs">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="font-bold">3.1 경영관리 (부문 50% / 영역 20%)</span>
                    <span className="font-black text-emerald-600">{simInput.합리적_경영관리}점</span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="100"
                    step="0.5"
                    value={simInput.합리적_경영관리}
                    onChange={(e) => setSimInput({ ...simInput, 합리적_경영관리: parseFloat(e.target.value) })}
                    className="w-full accent-emerald-600"
                  />
                  <span className="text-[10px] text-slate-400">지자체 지원 + 성과관리 체계 + 공동구매·경쟁입찰 시행률</span>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="font-bold">3.2 경영성과 (부문 50% / 영역 20%)</span>
                    <span className="font-black text-emerald-600">{simInput.합리적_경영성과}점</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="100"
                    step="0.5"
                    value={simInput.합리적_경영성과}
                    onChange={(e) => setSimInput({ ...simInput, 합리적_경영성과: parseFloat(e.target.value) })}
                    className="w-full accent-emerald-600"
                  />
                  <span className="text-[10px] text-slate-400">병상이용률(58.2%) + 외래초진율 + 의료/경상수지 비율 + 생산성/효율성</span>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="font-bold">4.1 거버넌스 (부문 20% / 영역 20%)</span>
                    <span className="font-black text-purple-600">{simInput.책임_거버넌스}점</span>
                  </div>
                  <input
                    type="range"
                    min="40"
                    max="100"
                    step="0.5"
                    value={simInput.책임_거버넌스}
                    onChange={(e) => setSimInput({ ...simInput, 책임_거버넌스: parseFloat(e.target.value) })}
                    className="w-full accent-purple-600"
                  />
                  <span className="text-[10px] text-slate-400">이사회 구성 적절성 + 주민참여위원회 구성 및 운영·결과공유</span>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="font-bold">4.2 리더십 (부문 30% / 영역 20%)</span>
                    <span className="font-black text-purple-600">{simInput.책임_리더십}점</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="100"
                    step="0.5"
                    value={simInput.책임_리더십}
                    onChange={(e) => setSimInput({ ...simInput, 책임_리더십: parseFloat(e.target.value) })}
                    className="w-full accent-purple-600"
                  />
                  <span className="text-[10px] text-slate-400">직원 만족도(68.7점) + 경영진 리더십 만족도(67.4점)</span>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="font-bold">4.3 윤리경영 (부문 30% / 영역 20%)</span>
                    <span className="font-black text-purple-600">{simInput.책임_윤리경영}점</span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="100"
                    step="0.5"
                    value={simInput.책임_윤리경영}
                    onChange={(e) => setSimInput({ ...simInput, 책임_윤리경영: parseFloat(e.target.value) })}
                    className="w-full accent-purple-600"
                  />
                  <span className="text-[10px] text-slate-400">부패감시 적발 최소화 + 자체감사 시스템 연2회 + 표준운영지침 준수</span>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="font-bold">4.4 작업환경 (부문 20% / 영역 20%)</span>
                    <span className="font-black text-purple-600">{simInput.책임_작업환경}점</span>
                  </div>
                  <input
                    type="range"
                    min="40"
                    max="100"
                    step="0.5"
                    value={simInput.책임_작업환경}
                    onChange={(e) => setSimInput({ ...simInput, 책임_작업환경: parseFloat(e.target.value) })}
                    className="w-full accent-purple-600"
                  />
                  <span className="text-[10px] text-slate-400">장애인 고용비율(3.8%) + 노사협의회 + 보건안전체계 + 공시 성실성</span>
                </div>
              </div>
            </div>
          </div>

          {/* AI 기반 개선 우선순위 처방전 (Action Items) */}
          <div className="bg-white dark:bg-[#15161b] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              A등급(80점 이상) 진입을 위한 전략적 개선 우선순위 처방전
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {simResult.개선_우선순위_제안.map((rec, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-black text-slate-900 dark:text-white">
                      {idx + 1}. {rec.부문명}
                    </span>
                    <span className="text-[11px] font-bold text-blue-600">
                      가중치 기여도 {rec.영역가중치_기여도}%
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500">
                    <span>현재: <strong>{rec.현재점수}점</strong></span>
                    <span>➔</span>
                    <span>전국평균: <strong>{rec.전국평균}점</strong></span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium">
                    💡 <strong>권고 조치:</strong> {rec.권고사항}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 탭 6: 우수사례 & 혁신과제 (Best Practices & Innovation) */}
      {/* ==================================================================== */}
      {activeTab === 'best_practices' && (
        <div className="space-y-6">
          {/* 8대 우수기관 사례 카드 그리드 */}
          <div>
            <div className="mb-4">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                2025년 운영평가 4대 영역 8대 우수기관 심층 분석
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                보고서 부록 2 수록: 영역별 최고 성과를 달성한 공공병원의 운영 모범 사례
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {운영평가_8대_우수기관_사례.map((practice, idx) => (
                <div
                  key={idx}
                  className="bg-white dark:bg-[#15161b] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                      {practice.영역}
                    </span>
                    <span className="text-xs font-black text-slate-900 dark:text-white">
                      {practice.병원명}
                    </span>
                  </div>

                  <h4 className="text-sm font-black text-slate-900 dark:text-white">
                    {practice.제목}
                  </h4>

                  <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                    {practice.핵심성과.map((item, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 text-[11px] text-slate-500 dark:text-slate-400">
                    <strong className="text-blue-600 dark:text-blue-400">벤치마킹 시사점:</strong> {practice.개선시사점}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 제9장 향후 평가지표 개선 과제 & 운영혁신 과제 (보고서 311~318p) */}
          <div className="bg-white dark:bg-[#15161b] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              지역거점 공공병원 운영평가 제도 개선 및 4대 운영혁신 전략 (제9장)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 space-y-2">
                <span className="font-black text-blue-900 dark:text-blue-200 text-sm block">
                  1. 필수의료 제공 역량 고도화와 진료 질 관리 강화
                </span>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
                  단순한 진료 유지 수준을 넘어 지역 환자 유출을 감소시키고 중진료권 내에서 완결적 치료를 제공할 수 있도록 적극적 수용 전략 마련. 항생제·주사제 등 적정성 지표의 상시 내부 모니터링 체계 강화.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/60 space-y-2">
                <span className="font-black text-indigo-900 dark:text-indigo-200 text-sm block">
                  2. 공익적 보건의료서비스 내실화 &amp; 지속가능 운영체계
                </span>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
                  형식적인 협약 체결을 넘어 실제 의뢰·회송 절차와 역할을 명확히 규정하고 결과 환류. 취약계층 지원사업의 전담 인력과 재정 기반을 안정적으로 확보하여 일회성 지원 방지.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 space-y-2">
                <span className="font-black text-emerald-900 dark:text-emerald-200 text-sm block">
                  3. 성과 기반 경영관리 &amp; 2026 필수의료 지원사업 종료 대응
                </span>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
                  2026년 종료 예정인 필수의료 강화지원 사업 실적과 경험을 경영 개선 지표로 전환. 원가분석 정규화에 대비한 정확한 원가 산출 체계 구축 및 책임의료기관 평가 정규화 선제 대응.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/60 space-y-2">
                <span className="font-black text-purple-900 dark:text-purple-200 text-sm block">
                  4. 거버넌스 및 평가 기준에 맞는 규정 정비
                </span>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
                  이사회 임원 공백 방지를 위해 지자체와 사전 협의 조율 강화. 원내 자체감사 시스템 연 2회 이상 정기 실시 및 공공기관 청렴 노력(신고창구·배너·교육) 지침 준수 의무화.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
