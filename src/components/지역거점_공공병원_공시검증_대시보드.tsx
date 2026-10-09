'use client';

import React, { useState, useMemo } from 'react';
import {
  Building2,
  AlertTriangle,
  CheckCircle2,
  Search,
  Filter,
  TrendingDown,
  ShieldAlert,
  ShieldCheck,
  FileSpreadsheet,
  Calculator,
  Lock,
  ArrowUpDown,
  ExternalLink,
  ChevronRight,
  Info,
  Layers,
  Sparkles,
  BarChart3,
  Calendar,
} from 'lucide-react';
import {
  전국_41개_지역거점공공병원_공시검증_목록,
  통합공시_3대영역_통계,
  통합공시_14대_회계산출식,
  수시공시_개인정보_점검_결과,
  공공병원_공시검증_기관_데이터,
} from '@/lib/지역거점_공공병원_공시검증_데이터셋';
import { ISP_과제_뱃지 } from './ISP_과제_뱃지';
import { 회계_공시_사전검증_시뮬레이터 } from './회계_공시_사전검증_시뮬레이터';
import { 개인정보_수정공시_시뮬레이터 } from './개인정보_수정공시_시뮬레이터';

export const 지역거점_공공병원_공시검증_대시보드: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'hospitals' | 'formulas' | 'pii_process'>('hospitals');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSido, setSelectedSido] = useState('전체');
  const [sortOrder, setSortOrder] = useState<'suspect_desc' | 'suspect_asc' | 'name_asc'>('suspect_desc');
  const [selectedHospital, setSelectedHospital] = useState<공공병원_공시검증_기관_데이터 | null>(null);

  // 시도 목록 추출
  const sidoList = useMemo(() => {
    const set = new Set(전국_41개_지역거점공공병원_공시검증_목록.map((h) => h.시도));
    return ['전체', ...Array.from(set)];
  }, []);

  // 필터링 및 정렬된 병원 목록
  const filteredHospitals = useMemo(() => {
    return 전국_41개_지역거점공공병원_공시검증_목록
      .filter((h) => {
        const matchName = h.기관명.toLowerCase().includes(searchTerm.toLowerCase());
        const matchSido = selectedSido === '전체' || h.시도 === selectedSido;
        return matchName && matchSido;
      })
      .sort((a, b) => {
        if (sortOrder === 'suspect_desc') {
          return b.오류의심_건수 - a.오류의심_건수 || b.총_점검_건수 - a.총_점검_건수;
        }
        if (sortOrder === 'suspect_asc') {
          return a.오류의심_건수 - b.오류의심_건수 || a.총_점검_건수 - b.총_점검_건수;
        }
        return a.기관명.localeCompare(b.기관명, 'ko');
      });
  }, [searchTerm, selectedSido, sortOrder]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. 상단 타이틀 & 거버넌스 정보 */}
      <div className="bg-white dark:bg-[#15161b] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300">
              국립중앙의료원 2026.6 검증 실증데이터
            </span>
            <ISP_과제_뱃지 taskId="3.8" customLabel="과제 3.8 지역거점 공공병원 알리미(AA)" />
            <span className="text-xs text-slate-400">
              「지방의료원법」 제24조의2 법정 통합공시
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <span>전국 41개 지역거점 공공병원 알리미 통합공시 &amp; 품질검증</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-4xl">
            전국 지방의료원 35개소 및 적십자병원 6개소(41개 기관)의 12종 공시항목(186개 지표, 38,261건)에 대한
            사전검증(총괄검증) 및 사후검증(수정 z-score·결산서 대조) 실증 결과를 토대로 데이터 품질 체계를 관제합니다.
          </p>
        </div>

        {/* 탭 전환 버튼 */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl shrink-0">
          <button
            onClick={() => setActiveTab('hospitals')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'hospitals'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>41개 병원별 품질검증</span>
          </button>
          <button
            onClick={() => setActiveTab('formulas')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'formulas'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>14대 회계산출식 &amp; 통계이상치</span>
          </button>
          <button
            onClick={() => setActiveTab('pii_process')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'pii_process'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>개인정보(PII) 점검 &amp; 수정공시</span>
          </button>
        </div>
      </div>

      {/* 2. 핵심 KPI 카드 4종 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 카드 1 */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#15161b] border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold">
            <span>검증 대상 기관</span>
            <Building2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">41</span>
            <span className="text-xs text-slate-500 font-bold">개소 (분원 포함 42개)</span>
          </div>
          <p className="text-[11px] text-slate-400">지방의료원 35개소 + 적십자병원 6개소</p>
        </div>

        {/* 카드 2 */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#15161b] border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold">
            <span>5개년 누적 검증 규모</span>
            <BarChart3 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">38,261</span>
            <span className="text-xs text-slate-500 font-bold">건</span>
          </div>
          <p className="text-[11px] text-slate-400">’21~’25년 12개 공시항목 186개 세부지표</p>
        </div>

        {/* 카드 3 */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#15161b] border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold">
            <span>오류의심 (수정대상)</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400">216</span>
            <span className="text-xs text-slate-500 font-bold">건 (오류율 2.0%)</span>
          </div>
          <p className="text-[11px] text-slate-400">결산서 불일치 110건 · 0원등록 75건 등</p>
        </div>

        {/* 카드 4 */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#15161b] border border-blue-200 dark:border-blue-900/60 bg-gradient-to-br from-blue-50/50 to-indigo-50/30 dark:from-blue-950/20 dark:to-indigo-950/20 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-blue-900 dark:text-blue-300 text-xs font-bold">
            <span>사전검증 도입 혁신 성과</span>
            <TrendingDown className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400">▼ 66.1%</span>
            <span className="text-xs text-blue-800 dark:text-blue-300 font-bold">인력오류 급감</span>
          </div>
          <p className="text-[11px] text-blue-700 dark:text-blue-400">
            인력항목: 이전 5개년 연평균 242건 ➔ 2025년 119건
          </p>
        </div>
      </div>

      {/* 3. 탭별 메인 컨텐츠 영역 */}
      {activeTab === 'hospitals' && (
        <div className="space-y-4">
          {/* 필터 및 검색 컨트롤 바 */}
          <div className="bg-white dark:bg-[#15161b] p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <div className="relative w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="공공병원명 검색 (예: 영월, 진안, 포천, 목포...)"
                  className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* 시도 필터 */}
              <select
                value={selectedSido}
                onChange={(e) => setSelectedSido(e.target.value)}
                className="px-3 py-2 text-xs font-semibold rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
              >
                {sidoList.map((s) => (
                  <option key={s} value={s}>
                    시도: {s}
                  </option>
                ))}
              </select>

              {/* 정렬 순서 */}
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as any)}
                className="px-3 py-2 text-xs font-semibold rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
              >
                <option value="suspect_desc">정렬: 오류의심 많은순</option>
                <option value="suspect_asc">정렬: 오류의심 적은순 (우수)</option>
                <option value="name_asc">정렬: 가나다순</option>
              </select>
            </div>
          </div>

          {/* 41개 병원 테이블 그리드 */}
          <div className="bg-white dark:bg-[#15161b] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <span className="font-bold text-slate-700 dark:text-slate-300">
                총 {filteredHospitals.length}개 기관 검색됨 (전체 41개소 중)
              </span>
              <span className="text-[11px] text-slate-400">
                * 행을 클릭하면 해당 공공병원의 상세 검증 내역을 확인할 수 있습니다.
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4 w-14 text-center">연번</th>
                    <th className="py-3 px-4">기관명</th>
                    <th className="py-3 px-3">지역</th>
                    <th className="py-3 px-3">기관유형</th>
                    <th className="py-3 px-4 text-center">
                      <span className="text-rose-600 dark:text-rose-400 font-black">❶ 오류의심(수정요청)</span>
                    </th>
                    <th className="py-3 px-4 text-center">
                      <span className="text-amber-600 dark:text-amber-400 font-black">❷ 검토요청(소명)</span>
                    </th>
                    <th className="py-3 px-4 text-center">총 검증건수</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {filteredHospitals.map((hospital) => (
                    <tr
                      key={hospital.기관명}
                      onClick={() => setSelectedHospital(hospital)}
                      className="hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition cursor-pointer group"
                    >
                      <td className="py-3.5 px-4 text-center font-mono text-slate-400">
                        {hospital.연번}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white flex items-center gap-1.5 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                        <span>{hospital.기관명}</span>
                        <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300">
                          {hospital.시도}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-slate-500 text-[11px]">
                        {hospital.기관유형}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-black ${
                            hospital.오류의심_건수 >= 8
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                              : hospital.오류의심_건수 >= 5
                              ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                              : hospital.오류의심_건수 > 0
                              ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          }`}
                        >
                          {hospital.오류의심_건수}건
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-amber-700 dark:text-amber-400">
                        {hospital.검토요청_건수}건
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-800 dark:text-slate-200">
                        {hospital.총_점검_건수}건
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* [탭 2] 14대 회계 산출식 & 통계적 이상치 분석 */}
      {activeTab === 'formulas' && (
        <div className="space-y-6">
          {/* 실시간 AI 회계·공시 사전검증 시뮬레이터 위젯 */}
          <회계_공시_사전검증_시뮬레이터 />

          {/* 영역별 오류 비중 개요 */}
          <div className="bg-white dark:bg-[#15161b] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                <span>3대 공시 영역별 검증 통계 (2,093건 오류 분포)</span>
              </h3>
              <span className="text-xs text-slate-400 font-medium">인건비 영역 오류 91.5% 집중</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {통합공시_3대영역_통계.map((stat) => (
                <div
                  key={stat.영역}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{stat.영역}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-black bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                      오류비중 {stat.오류비중}%
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between text-xs">
                    <span className="text-slate-500">오류의심(수정대상):</span>
                    <span className="font-bold text-rose-600 dark:text-rose-400">{stat.오류의심}건</span>
                  </div>
                  <div className="flex items-baseline justify-between text-xs">
                    <span className="text-slate-500">검토요청(소명대상):</span>
                    <span className="font-bold text-amber-600 dark:text-amber-400">{stat.검토필요}건</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-800 leading-snug">
                    {stat.주요특징}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* 14대 회계 산출식 리스트 */}
          <div className="bg-white dark:bg-[#15161b] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Calculator className="w-5 h-5 text-emerald-600" />
                <span>14대 법정 회계 자동산출식 &amp; 정합성 사전검증 기준</span>
              </h3>
              <p className="text-xs text-slate-500">
                알리미 시스템 입력 단계에서 사전 차단되는 14개 자동 산출 공식으로, 수기 입력 착오를 방지합니다.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {통합공시_14대_회계산출식.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                      {item.항목}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">산식 #{idx + 1}</span>
                  </div>
                  <div className="font-mono text-xs font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-800 p-2 rounded-xl border border-slate-200/80 dark:border-slate-700">
                    {item.산식}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{item.설명}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* [탭 3] 수시공시 개인정보(PII) 점검 및 수정공시 프로세스 */}
      {activeTab === 'pii_process' && (
        <div className="space-y-6">
          {/* 실시간 개인정보(PII) 비식별화 및 수정공시 사유서 시뮬레이터 */}
          <개인정보_수정공시_시뮬레이터 />

          {/* 개인정보 유출 검출 배너 */}
          <div className="p-6 rounded-3xl bg-amber-500/10 border-2 border-amber-500/30 text-amber-950 dark:text-amber-200 space-y-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <h3 className="font-bold text-base">
                수시공시 첨부문서 환자 개인정보(PII) 유출 긴급 점검 결과
              </h3>
            </div>
            <p className="text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-300">
              수시공시 항목 1,932건 검토 결과, 이사회 회의록·사업계획서·감면자료 등 첨부문서 내에서{' '}
              <strong className="text-rose-600 dark:text-rose-400">오류의심 34건(오류율 1.76%)</strong>이 확인되었습니다. 여기에는 개인정보(이름·병록번호·소속·주소 등)가 포함된 첨부파일 공시와 암호화로 열람할 수 없는 문서 등이 포함되며, 개인정보 포함 문서는
              대국민공시 페이지에서 삭제 후 비식별화하여 재공시하도록 요구했습니다.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
              <div className="p-3 bg-white/70 dark:bg-slate-900/60 rounded-xl border border-amber-200 dark:border-amber-800">
                <span className="font-bold block text-rose-700 dark:text-rose-400 mb-1">🚨 PII 유출 위험</span>
                <span>{수시공시_개인정보_점검_결과.유형1_개인정보포함}</span>
              </div>
              <div className="p-3 bg-white/70 dark:bg-slate-900/60 rounded-xl border border-amber-200 dark:border-amber-800">
                <span className="font-bold block text-blue-700 dark:text-blue-400 mb-1">💡 AI ISP 플랫폼 대안</span>
                <span>{수시공시_개인정보_점검_결과.개선방향}</span>
              </div>
            </div>
          </div>

          {/* 2026 수정공시 6단계 프로세스 흐름도 */}
          <div className="bg-white dark:bg-[#15161b] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <span>2026년 공공병원 알리미 수정공시 6단계 절차 가이드</span>
              </h3>
              <span className="text-xs text-slate-400 font-bold">5월 4주 ~ 6월 4주 추진</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                { step: 'STEP 1', role: '국립중앙의료원(NMC)', title: '오류의심 항목 기관 전달', desc: '사후검증(수정 z-score 및 결산서 대조) 도출 자료를 해당 41개 병원으로 공문 발송' },
                { step: 'STEP 2', role: '지역거점 공공병원', title: '정정 자료 및 사유서 회신', desc: '오류의심 항목 확인 후 정정자료와 증빙서류를 첨부하여 수정공시사유서 공문 제출' },
                { step: 'STEP 3', role: '국립중앙의료원(NMC)', title: '알리미 입력 시스템 개방', desc: '공공병원이 정정 데이터를 직접 수정공시할 수 있도록 권한 부여 및 시스템 개방' },
                { step: 'STEP 4', role: '지역거점 공공병원', title: '시스템 직접 입력 및 확인서', desc: '알리미 시스템에 정정 수치 직접 입력 완료 후 수정공시확인서 최종 제출' },
                { step: 'STEP 5', role: '국립중앙의료원(NMC)', title: '수정 데이터 최종 검증·승인', desc: '제출된 수정 공시자료의 정합성을 14대 산식으로 재검증하고 승인 처리' },
                { step: 'STEP 6', role: '대국민 알리미 포털', title: '수정 이력 및 데이터셋 공개', desc: '수정일시, 수정사유, 전·후 비교내역을 대국민 투명 공개 및 신뢰 데이터셋 배포' },
              ].map((s) => (
                <div
                  key={s.step}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1.5"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-mono font-black text-blue-600 dark:text-blue-400">{s.step}</span>
                    <span className="font-bold text-slate-500">{s.role}</span>
                  </div>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white">{s.title}</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. 병원 선택 시 상세 팝업 모달 */}
      {selectedHospital && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-[#18181b] rounded-3xl p-6 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400 flex items-center justify-center font-bold">
                  {selectedHospital.연번}
                </div>
                <div>
                  <h4 className="font-bold text-base text-slate-900 dark:text-white">
                    {selectedHospital.기관명}
                  </h4>
                  <span className="text-[11px] text-slate-400">
                    {selectedHospital.시도} · {selectedHospital.기관유형}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedHospital(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60">
                <span className="text-[10px] text-rose-700 dark:text-rose-400 font-bold block">오류의심</span>
                <span className="text-xl font-black text-rose-600 dark:text-rose-400">
                  {selectedHospital.오류의심_건수}건
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60">
                <span className="text-[10px] text-amber-700 dark:text-amber-400 font-bold block">검토요청</span>
                <span className="text-xl font-black text-amber-600 dark:text-amber-400">
                  {selectedHospital.검토요청_건수}건
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-500 font-bold block">총 검증건수</span>
                <span className="text-xl font-black text-slate-800 dark:text-slate-200">
                  {selectedHospital.총_점검_건수}건
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500">
              기관별 세부 오류 항목은 업무보고 원문에 없어 표시하지 않습니다. NMC 검증결과 통보 자료를 확인하세요.
            </p>

            <div className="p-3 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/40 text-[11px] text-blue-900 dark:text-blue-300">
              💡 2026 수정공시 일정에 따라 해당 기관은 소명사유서 제출 및 시스템 직접 수정을 완료해야 합니다.
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedHospital(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
