'use client';

import React, { useState, useMemo } from 'react';
import {
  Calculator,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  AlertCircle,
  HelpCircle,
  FileSpreadsheet,
  Coins,
  Users,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';
import {
  공시_회계_입력_데이터,
  validate_public_hospital_accounting,
  검증_시뮬레이션_샘플_목록,
} from '@/lib/회계_공시_사전검증_엔진';

export const 회계_공시_사전검증_시뮬레이터: React.FC = () => {
  // 기본 선택 프리셋: 영월의료원 실제 검증 사례
  const [selectedPresetKey, setSelectedPresetKey] = useState<string>('영월의료원_실제사례');
  const [formData, setFormData] = useState<공시_회계_입력_데이터>(
    () => ({ ...검증_시뮬레이션_샘플_목록.영월의료원_실제사례 })
  );

  // 실시간 사전검증 실행
  const validationResult = useMemo(() => {
    return validate_public_hospital_accounting(formData);
  }, [formData]);

  // 프리셋 변경 핸들러
  const handlePresetChange = (key: string) => {
    setSelectedPresetKey(key);
    if (검증_시뮬레이션_샘플_목록[key]) {
      setFormData({ ...검증_시뮬레이션_샘플_목록[key] });
    }
  };

  // 숫자 입력 변경 핸들러
  const handleNumberChange = (field: keyof 공시_회계_입력_데이터, value: string) => {
    const num = value === '' ? 0 : Number(value.replace(/[^0-9.-]/g, ''));
    setFormData((prev) => ({
      ...prev,
      [field]: isNaN(num) ? 0 : num,
    }));
  };

  return (
    <div className="space-y-6">
      {/* 1. 상단 안내 및 프리셋 선택 바 */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 text-white shadow-lg space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-blue-500/20 text-blue-300 border border-blue-400/30">
              <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
              <span>실시간 AI 회계·공시 사전검증 엔진 v2.0</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <Calculator className="w-6 h-6 text-blue-400" />
              <span>14대 법정 회계산출식 &amp; 통계적 이상치(Anomaly) 시뮬레이터</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl">
              2026년 국립중앙의료원 검증 기준에 따라, 공시 등록 전 입력 단계에서 대차불일치·0원 누락·전년대비 급변동(±15%)·전문의 현원 오차를 실시간 자동 진단합니다.
            </p>
          </div>

          {/* 프리셋 선택 버튼 그룹 */}
          <div className="flex flex-wrap items-center gap-2 bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700">
            <button
              onClick={() => handlePresetChange('정상_모범병원')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                selectedPresetKey === '정상_모범병원'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>🌟 통영적십자 (모범)</span>
            </button>
            <button
              onClick={() => handlePresetChange('영월의료원_실제사례')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                selectedPresetKey === '영월의료원_실제사례'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>🚨 영월의료원 (실제검증)</span>
            </button>
            <button
              onClick={() => handlePresetChange('오류다발_가상병원')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                selectedPresetKey === '오류다발_가상병원'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>⚠️ 오류다발 (시뮬)</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. 실시간 검증 진단 결과 패널 (KPI 및 종합판정) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* 종합 판정 카드 */}
        <div
          className={`p-5 rounded-3xl border shadow-xs flex flex-col justify-between ${
            validationResult.종합판정.includes('적합')
              ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800'
              : validationResult.종합판정.includes('보완권고')
              ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800'
              : 'bg-rose-50 dark:bg-rose-950/20 border-rose-300 dark:border-rose-800'
          }`}
        >
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">사전검증 종합 판정</span>
            <div className="text-xl font-black flex items-center gap-2">
              {validationResult.종합판정.includes('적합') ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              ) : validationResult.종합판정.includes('보완권고') ? (
                <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              ) : (
                <AlertCircle className="w-6 h-6 text-rose-600 dark:text-rose-400" />
              )}
              <span
                className={
                  validationResult.종합판정.includes('적합')
                    ? 'text-emerald-700 dark:text-emerald-300'
                    : validationResult.종합판정.includes('보완권고')
                    ? 'text-amber-700 dark:text-amber-300'
                    : 'text-rose-700 dark:text-rose-300'
                }
              >
                {validationResult.종합판정}
              </span>
            </div>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-200/60 dark:border-slate-800">
            {validationResult.종합판정.includes('적합')
              ? '보건복지부 알리미 법정 통합공시 즉시 등록 가능'
              : validationResult.종합판정.includes('보완권고')
              ? '전년대비 변동원인 소명서 작성 후 공시 권고'
              : '결산서 원본 대조 및 수기입력 정정 필수'}
          </p>
        </div>

        {/* 종합 품질점수 */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#15161b] border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>데이터 품질점수</span>
            <span className="font-mono text-slate-400">100점 만점</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span
              className={`text-3xl font-black ${
                validationResult.품질점수 >= 90
                  ? 'text-emerald-600'
                  : validationResult.품질점수 >= 75
                  ? 'text-amber-600'
                  : 'text-rose-600'
              }`}
            >
              {validationResult.품질점수}
            </span>
            <span className="text-xs font-bold text-slate-400">/ 100점</span>
          </div>
          {/* 점수 게이지 바 */}
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                validationResult.품질점수 >= 90
                  ? 'bg-emerald-500'
                  : validationResult.품질점수 >= 75
                  ? 'bg-amber-500'
                  : 'bg-rose-500'
              }`}
              style={{ width: `${Math.max(5, Math.min(100, validationResult.품질점수))}%` }}
            />
          </div>
        </div>

        {/* 14대 산식 통과 현황 */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#15161b] border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>14대 법정산식 정합성</span>
            <Calculator className="w-4 h-4 text-blue-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span
              className={`text-3xl font-black ${
                validationResult.산식_오류수 === 0 ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {validationResult.산식_통과수}
            </span>
            <span className="text-xs font-bold text-slate-400">
              / {validationResult.총_산식수}개 통과
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            {validationResult.산식_오류수 === 0 ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓ 산식 오류 0건 (완벽)</span>
            ) : (
              <span className="text-rose-600 dark:text-rose-400 font-bold">
                🚨 {validationResult.산식_오류수}개 산식 불일치 검출
              </span>
            )}
          </p>
        </div>

        {/* 통계적 이상치(Anomaly) */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#15161b] border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>통계적 이상치 (Anomaly)</span>
            <TrendingUp className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span
              className={`text-3xl font-black ${
                validationResult.이상치_탐지수 === 0 ? 'text-emerald-600' : 'text-amber-600'
              }`}
            >
              {validationResult.이상치_탐지수}
            </span>
            <span className="text-xs font-bold text-slate-400">건 탐지</span>
          </div>
          <p className="text-[11px] text-slate-400">
            급변동(±15%) · 0원 누락 · z-score 점검
          </p>
        </div>
      </div>

      {/* AI 품질 권고 배너 */}
      <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="text-xs font-black text-blue-900 dark:text-blue-300">
            AI 공시 품질 가이드 &amp; 조치 권고사항
          </h4>
          <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1 list-disc list-inside">
            {validationResult.핵심_권고사항.map((rec, i) => (
              <li key={i}>{rec}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* 3. 대화형 수치 입력 폼 (3대 영역: 대차평형, 손익계산, 인력보수) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 영역 1: 재무상태표 (대차평형 검증) */}
        <div className="bg-white dark:bg-[#15161b] p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-blue-600" />
              <h4 className="text-xs font-black text-slate-900 dark:text-white">
                1. 재무상태표 (대차평형)
              </h4>
            </div>
            <span className="text-[10px] text-slate-400">단위: 원</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="space-y-1">
              <label className="text-slate-600 dark:text-slate-400 flex justify-between">
                <span>유동자산</span>
                <span className="font-mono text-[11px] text-slate-400">
                  {formData.유동자산.toLocaleString()}원
                </span>
              </label>
              <input
                type="text"
                value={formData.유동자산}
                onChange={(e) => handleNumberChange('유동자산', e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-xs focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-600 dark:text-slate-400 flex justify-between">
                <span>비유동자산</span>
                <span className="font-mono text-[11px] text-slate-400">
                  {formData.비유동자산.toLocaleString()}원
                </span>
              </label>
              <input
                type="text"
                value={formData.비유동자산}
                onChange={(e) => handleNumberChange('비유동자산', e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-xs focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="space-y-1 p-2.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40">
              <label className="text-blue-900 dark:text-blue-300 font-bold flex justify-between">
                <span>자산총계 (공시값)</span>
                <span className="font-mono text-[11px]">
                  {formData.자산총계.toLocaleString()}원
                </span>
              </label>
              <input
                type="text"
                value={formData.자산총계}
                onChange={(e) => handleNumberChange('자산총계', e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-blue-300 dark:border-blue-800 font-mono text-xs font-bold focus:ring-2 focus:ring-blue-500/20"
              />
              <span className="text-[10px] text-blue-600 dark:text-blue-400">
                자동계산: {(formData.유동자산 + formData.비유동자산).toLocaleString()}원
              </span>
            </div>

            <div className="space-y-1">
              <label className="text-slate-600 dark:text-slate-400 flex justify-between">
                <span>부채총계 (공시값)</span>
                <span className="font-mono text-[11px] text-slate-400">
                  {formData.부채총계.toLocaleString()}원
                </span>
              </label>
              <input
                type="text"
                value={formData.부채총계}
                onChange={(e) => handleNumberChange('부채총계', e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-xs focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-600 dark:text-slate-400 flex justify-between">
                <span>자본총계 (공시값)</span>
                <span className="font-mono text-[11px] text-slate-400">
                  {formData.자본총계.toLocaleString()}원
                </span>
              </label>
              <input
                type="text"
                value={formData.자본총계}
                onChange={(e) => handleNumberChange('자본총계', e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-xs focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 text-[11px] space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">부채 + 자본 합계:</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {(formData.부채총계 + formData.자본총계).toLocaleString()}원
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">대차평형 오차:</span>
                <span
                  className={`font-mono font-bold ${
                    formData.자산총계 === formData.부채총계 + formData.자본총계
                      ? 'text-emerald-600'
                      : 'text-rose-600'
                  }`}
                >
                  {Math.abs(formData.자산총계 - (formData.부채총계 + formData.자본총계)).toLocaleString()}원
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 영역 2: 손익계산서 (의료수익 & 비용) */}
        <div className="bg-white dark:bg-[#15161b] p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <h4 className="text-xs font-black text-slate-900 dark:text-white">
                2. 손익계산서 (수익·비용)
              </h4>
            </div>
            <span className="text-[10px] text-slate-400">단위: 원</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-slate-600 dark:text-slate-400">입원수익</label>
                <input
                  type="text"
                  value={formData.입원수익}
                  onChange={(e) => handleNumberChange('입원수익', e.target.value)}
                  className="w-full px-2 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-slate-600 dark:text-slate-400">외래수익</label>
                <input
                  type="text"
                  value={formData.외래수익}
                  onChange={(e) => handleNumberChange('외래수익', e.target.value)}
                  className="w-full px-2 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-xs"
                />
              </div>
            </div>

            <div className="space-y-1 p-2 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40">
              <label className="text-emerald-900 dark:text-emerald-300 font-bold flex justify-between">
                <span>의료수익 (공시값)</span>
                <span className="font-mono text-[11px]">
                  {formData.의료수익.toLocaleString()}원
                </span>
              </label>
              <input
                type="text"
                value={formData.의료수익}
                onChange={(e) => handleNumberChange('의료수익', e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-800 font-mono text-xs font-bold"
              />
            </div>

            <div className="space-y-1 p-2 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40">
              <label className="text-rose-900 dark:text-rose-300 font-bold flex justify-between">
                <span>인건비 (핵심 검증 항목)</span>
                <span className="font-mono text-[11px]">
                  {formData.인건비.toLocaleString()}원
                </span>
              </label>
              <input
                type="text"
                value={formData.인건비}
                onChange={(e) => handleNumberChange('인건비', e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-rose-300 dark:border-rose-800 font-mono text-xs font-bold"
              />
              <span className="text-[10px] text-rose-600 dark:text-rose-400">
                0원 입력 시 결측 오류 자동 검출
              </span>
            </div>

            <div className="space-y-1">
              <label className="text-slate-600 dark:text-slate-400 flex justify-between">
                <span>의료비용 (공시값)</span>
                <span className="font-mono text-[11px] text-slate-400">
                  {formData.의료비용.toLocaleString()}원
                </span>
              </label>
              <input
                type="text"
                value={formData.의료비용}
                onChange={(e) => handleNumberChange('의료비용', e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-600 dark:text-slate-400 flex justify-between">
                <span>의료이익(손실)</span>
                <span className="font-mono text-[11px] text-slate-400">
                  {formData.의료이익.toLocaleString()}원
                </span>
              </label>
              <input
                type="text"
                value={formData.의료이익}
                onChange={(e) => handleNumberChange('의료이익', e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-xs"
              />
            </div>
          </div>
        </div>

        {/* 영역 3: 인력 현황 및 통계적 이상치(연봉·급변동) */}
        <div className="bg-white dark:bg-[#15161b] p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-600" />
              <h4 className="text-xs font-black text-slate-900 dark:text-white">
                3. 인력 및 통계적 이상치
              </h4>
            </div>
            <span className="text-[10px] text-slate-400">인력: 명 / 보수: 원</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-900/40">
              <div className="space-y-1">
                <label className="text-purple-900 dark:text-purple-300 font-bold block">
                  전문의 29개과 합계
                </label>
                <input
                  type="text"
                  value={formData.진료과목29개_전문의_합계}
                  onChange={(e) => handleNumberChange('진료과목29개_전문의_합계', e.target.value)}
                  className="w-full px-2 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-purple-300 dark:border-purple-800 font-mono text-xs font-bold text-center"
                />
              </div>
              <div className="space-y-1">
                <label className="text-purple-900 dark:text-purple-300 font-bold block">
                  전문의 현원 공시값
                </label>
                <input
                  type="text"
                  value={formData.전문의_현원_공시값}
                  onChange={(e) => handleNumberChange('전문의_현원_공시값', e.target.value)}
                  className="w-full px-2 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-purple-300 dark:border-purple-800 font-mono text-xs font-bold text-center"
                />
              </div>
              <div className="col-span-2 text-[10px] text-purple-600 dark:text-purple-400">
                {formData.진료과목29개_전문의_합계 === formData.전문의_현원_공시값 ? (
                  <span>✓ 29개 진료과목별 합계와 전문의 현원이 일치합니다.</span>
                ) : (
                  <span className="text-rose-600 dark:text-rose-400 font-bold">
                    🚨 {Math.abs(formData.진료과목29개_전문의_합계 - formData.전문의_현원_공시값)}명 불일치 (보고서 영월의료원 사례)
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-slate-600 dark:text-slate-400 flex justify-between">
                <span>임원연봉 (기관장 등)</span>
                <span className="text-[10px] text-slate-400">기준: 3천만 ~ 3억원</span>
              </label>
              <input
                type="text"
                value={formData.임원연봉}
                onChange={(e) => handleNumberChange('임원연봉', e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-600 dark:text-slate-400 flex justify-between">
                <span>전체직원 평균보수</span>
                <span className="text-[10px] text-slate-400">기준: 3천만 ~ 1억원</span>
              </label>
              <input
                type="text"
                value={formData.직원평균보수}
                onChange={(e) => handleNumberChange('직원평균보수', e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-600 dark:text-slate-400 flex justify-between">
                <span>전년도 인건비 (변동률 검사용)</span>
                <span className="text-[10px] text-slate-400">기준: ±15% 이내</span>
              </label>
              <input
                type="text"
                value={formData.전년도_인건비 ?? 0}
                onChange={(e) => handleNumberChange('전년도_인건비', e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-xs"
              />
              {formData.전년도_인건비 && formData.전년도_인건비 > 0 && (
                <div className="text-[10px] pt-1">
                  {(() => {
                    const rate =
                      ((formData.인건비 - formData.전년도_인건비) / formData.전년도_인건비) * 100;
                    const isOver = Math.abs(rate) >= 15;
                    return (
                      <span className={isOver ? 'text-amber-600 dark:text-amber-400 font-bold' : 'text-slate-400'}>
                        인건비 전년대비 {rate > 0 ? '+' : ''}
                        {rate.toFixed(1)}% 변동 {isOver && '(소명대상 이상치 감지)'}
                      </span>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 4. 세부 검증 결과 테이블 (14대 산식 리스트 & 이상치 분석) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 산식 검증 리스트 */}
        <div className="bg-white dark:bg-[#15161b] p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Calculator className="w-4 h-4 text-emerald-600" />
              <span>법정 회계산출식 정합성 점검 ({validationResult.총_산식수}개)</span>
            </h4>
            <span className="text-xs text-slate-400 font-medium">
              오류 {validationResult.산식_오류수}건
            </span>
          </div>

          <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
            {validationResult.산식_검증목록.map((item, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-2xl border text-xs space-y-1.5 transition ${
                  item.통과여부
                    ? 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800'
                    : 'bg-rose-50 dark:bg-rose-950/20 border-rose-300 dark:border-rose-900/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {item.통과여부 ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                    )}
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {item.산식명}
                    </span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-black ${
                      item.통과여부
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                    }`}
                  >
                    {item.통과여부 ? '정상 통과' : '산식 오류'}
                  </span>
                </div>

                <div className="font-mono text-[11px] text-slate-500 bg-white dark:bg-slate-800 p-1.5 rounded-lg border border-slate-200/60 dark:border-slate-700">
                  {item.산식공식}
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                  <span>
                    계산값: <strong className="font-mono">{item.계산값.toLocaleString()}</strong>
                  </span>
                  <span>
                    공시값: <strong className="font-mono">{item.입력값.toLocaleString()}</strong>
                  </span>
                  {item.오차 > 0 && (
                    <span className="text-rose-600 dark:text-rose-400 font-bold">
                      오차: {item.오차.toLocaleString()}
                    </span>
                  )}
                </div>

                {item.오류설명 && (
                  <p className="text-[11px] text-rose-600 dark:text-rose-400 font-medium">
                    ⚠️ {item.오류설명}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 통계적 이상치 분석 리스트 */}
        <div className="bg-white dark:bg-[#15161b] p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-600" />
              <span>통계적 이상치(Anomaly) 정밀 분석 ({validationResult.이상치_탐지수}건)</span>
            </h4>
            <span className="text-xs text-slate-400 font-medium">
              수정 z-score &amp; 급변동(±15%)
            </span>
          </div>

          <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
            {validationResult.이상치_검증목록.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                  통계적 이상치가 발견되지 않았습니다.
                </p>
                <p className="text-[11px] text-slate-500">
                  모든 수치가 전년 대비 안정적이며 허용 범위 이내입니다.
                </p>
              </div>
            ) : (
              validationResult.이상치_검증목록.map((anom, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-2xl border text-xs space-y-1.5 ${
                    anom.심각도 === '오류의심'
                      ? 'bg-rose-50 dark:bg-rose-950/20 border-rose-300 dark:border-rose-900/60'
                      : 'bg-amber-50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-900/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <AlertTriangle
                        className={`w-4 h-4 ${
                          anom.심각도 === '오류의심' ? 'text-rose-600' : 'text-amber-600'
                        }`}
                      />
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {anom.항목명}
                      </span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-black ${
                        anom.심각도 === '오류의심'
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {anom.심각도}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>
                      검사유형: <strong>{anom.검사유형}</strong>
                    </span>
                    <span>
                      기준: <strong className="font-mono">{anom.기준값_또는_범위}</strong>
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-snug">
                    {anom.메시지}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
