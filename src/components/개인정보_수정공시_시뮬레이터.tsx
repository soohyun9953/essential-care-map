'use client';

import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  FileText,
  Copy,
  Check,
  Sparkles,
  AlertTriangle,
  RotateCcw,
  Building2,
  Download,
  Eye,
  FileCheck2,
  Lock,
} from 'lucide-react';
import {
  mask_patient_pii,
  generate_amendment_statement,
  PII_시뮬레이션_샘플문서,
  수정공시_사유서_데이터,
} from '@/lib/개인정보_비식별화_엔진';
import { 전국_41개_지역거점공공병원_공시검증_목록 } from '@/lib/지역거점_공공병원_공시검증_데이터셋';

export const 개인정보_수정공시_시뮬레이터: React.FC = () => {
  // 서브 모드: 'pii_masking' (개인정보 비식별화) vs 'amendment_statement' (수정공시 사유서 생성)
  const [subMode, setSubMode] = useState<'pii_masking' | 'amendment_statement'>('pii_masking');

  // --- [1. PII 마스킹 상태] ---
  const [selectedPreset, setSelectedPreset] = useState<string>('이사회_회의록_감면의결');
  const [inputText, setInputText] = useState<string>(PII_시뮬레이션_샘플문서.이사회_회의록_감면의결);
  const [copiedMasked, setCopiedMasked] = useState<boolean>(false);

  // 실시간 PII 검사
  const piiResult = useMemo(() => {
    return mask_patient_pii(inputText);
  }, [inputText]);

  const handleSelectPreset = (key: keyof typeof PII_시뮬레이션_샘플문서) => {
    setSelectedPreset(key);
    setInputText(PII_시뮬레이션_샘플문서[key]);
  };

  const handleCopyMasked = () => {
    navigator.clipboard.writeText(piiResult.마스킹_결과텍스트);
    setCopiedMasked(true);
    setTimeout(() => setCopiedMasked(false), 2000);
  };

  // --- [2. 수정공시 소명사유서 상태] ---
  const [selectedHospitalName, setSelectedHospitalName] = useState<string>('영월의료원');
  const selectedHospitalData = useMemo(() => {
    return (
      전국_41개_지역거점공공병원_공시검증_목록.find((h) => h.기관명 === selectedHospitalName) ||
      전국_41개_지역거점공공병원_공시검증_목록[11] // 영월의료원
    );
  }, [selectedHospitalName]);

  const [managerName, setManagerName] = useState<string>('김공시 주임');
  const [managerPhone, setManagerPhone] = useState<string>('033-370-9114');
  const [errorCause, setErrorCause] = useState<string>(
    '공시 담당자의 회계 프로그램 출력물과 알리미 시스템 입력 단위 간 단순 착오 및 결산서 확정 후 소급 수정분 미반영'
  );
  const [amendmentDetail, setAmendmentDetail] = useState<string>(
    '결산서 원본과 14대 회계산출식을 전수 대조하여 불일치 지표 정정 완료 및 감사보고서 부속명세서 첨부'
  );
  const [preventionPlan, setPreventionPlan] = useState<string>(
    '- 기획조정실 자체 2인 교차검증 체계 구축\n  - 온디바이스 AI 사전검증 필터 통과 후 최종 기관장 결재 상신'
  );
  const [copiedStatement, setCopiedStatement] = useState<boolean>(false);

  const generatedStatement = useMemo(() => {
    const data: 수정공시_사유서_데이터 = {
      기관명: selectedHospitalData.기관명,
      공시연도: 2025,
      수정공시_단계: 'STEP 2 정정 자료 및 사유서 회신',
      담당자성명: managerName,
      연락처: managerPhone,
      오류의심_지표목록: ['(NMC 검증결과 통보 자료의 기관별 오류 항목을 기재)'],
      오류발생_원인분석: errorCause,
      정정_내용및결과: amendmentDetail,
      재발방지대책: preventionPlan,
    };
    return generate_amendment_statement(data);
  }, [
    selectedHospitalData,
    managerName,
    managerPhone,
    errorCause,
    amendmentDetail,
    preventionPlan,
  ]);

  const handleCopyStatement = () => {
    navigator.clipboard.writeText(generatedStatement);
    setCopiedStatement(true);
    setTimeout(() => setCopiedStatement(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* 서브 모드 전환 탭 */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-2 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setSubMode('pii_masking')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              subMode === 'pii_masking'
                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-rose-500" />
            <span>첨부문서 환자 개인정보(PII) 실시간 비식별화 도구</span>
          </button>
          <button
            onClick={() => setSubMode('amendment_statement')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              subMode === 'amendment_statement'
                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4 text-blue-500" />
            <span>2026 수정공시 6단계 소명사유서 공식양식 생성기</span>
          </button>
        </div>

        <span className="text-[11px] text-slate-400 px-2 font-medium">
          국립중앙의료원 2026.6 실증 프로세스 연계
        </span>
      </div>

      {/* [MODE 1] 첨부문서 환자 개인정보(PII) 실시간 비식별화 도구 */}
      {subMode === 'pii_masking' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* 상단 컨트롤 바: 프리셋 선택 */}
          <div className="p-5 rounded-3xl bg-white dark:bg-[#15161b] border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                  검증 결과: 수시공시 1,932건 중 오류의심 34건 (개인정보 포함·문서형식 오류 등)
                </span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  수시공시 첨부문서 PII 안전 점검
                </span>
              </div>
              <p className="text-xs text-slate-500">
                이사회 회의록, 진료비 감면자료 등에 포함된 환자 성명, 병록번호, 주민등록번호를 온디바이스에서 즉시 감지·마스킹합니다.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => handleSelectPreset('이사회_회의록_감면의결')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  selectedPreset === '이사회_회의록_감면의결'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>영월의료원 회의록 (유출사례)</span>
              </button>
              <button
                onClick={() => handleSelectPreset('진료비_감면_대장_누출')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  selectedPreset === '진료비_감면_대장_누출'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>감면집행대장 (다수유출)</span>
              </button>
              <button
                onClick={() => handleSelectPreset('클린_정상_공시문서')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  selectedPreset === '클린_정상_공시문서'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>통영적십자 (Clean 문서)</span>
              </button>
            </div>
          </div>

          {/* 진단 결과 카드 3종 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div
              className={`p-4 rounded-2xl border shadow-xs space-y-1 ${
                piiResult.위험등급.includes('심각')
                  ? 'bg-rose-50 dark:bg-rose-950/20 border-rose-300 dark:border-rose-900/60'
                  : piiResult.위험등급 === '경고'
                  ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-900/60'
                  : 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-900/60'
              }`}
            >
              <span className="text-[11px] font-bold text-slate-500">개인정보 유출 위험도</span>
              <div className="text-xl font-black flex items-center gap-2">
                {piiResult.위험등급.includes('심각') ? (
                  <ShieldAlert className="w-5 h-5 text-rose-600" />
                ) : piiResult.위험등급 === '경고' ? (
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                ) : (
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                )}
                <span
                  className={
                    piiResult.위험등급.includes('심각')
                      ? 'text-rose-700 dark:text-rose-400'
                      : piiResult.위험등급 === '경고'
                      ? 'text-amber-700 dark:text-amber-400'
                      : 'text-emerald-700 dark:text-emerald-400'
                  }
                >
                  {piiResult.위험등급}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#15161b] border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-slate-500">탐지된 개인식별정보(PII)</span>
              <div className="flex items-baseline gap-2">
                <span
                  className={`text-2xl font-black ${
                    piiResult.총_탐지건수 > 0 ? 'text-rose-600' : 'text-emerald-600'
                  }`}
                >
                  {piiResult.총_탐지건수}
                </span>
                <span className="text-xs text-slate-400 font-bold">건 노출</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#15161b] border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-slate-500">대국민 알리미 재공시 적합성</span>
              <div className="text-base font-black flex items-center gap-1.5 pt-1">
                {piiResult.원클릭_재공시_적합여부 ? (
                  <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <Check className="w-4 h-4" /> 즉시 공시 가능
                  </span>
                ) : (
                  <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1">
                    <Lock className="w-4 h-4" /> 비식별화 필수 (공시불가)
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* 2분할 텍스트 뷰 (좌: 원본 입력 / 우: 실시간 마스킹 결과) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* 좌측: 원본 첨부문서 텍스트 */}
            <div className="bg-white dark:bg-[#15161b] p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 flex flex-col">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-500" />
                  <span className="text-xs font-black text-slate-900 dark:text-white">
                    공시 첨부문서 원본 텍스트 (직접 편집 가능)
                  </span>
                </div>
                <span className="text-[10px] text-slate-400">OCR 추출 텍스트 시뮬레이션</span>
              </div>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                rows={12}
                className="w-full flex-1 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-800 dark:text-slate-200 leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
                placeholder="첨부문서(PDF, HWP) 텍스트를 붙여넣으세요..."
              />
            </div>

            {/* 우측: 실시간 비식별화 마스킹 결과 */}
            <div className="bg-white dark:bg-[#15161b] p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 flex flex-col">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-black text-slate-900 dark:text-white">
                    AI 자동 비식별화 마스킹 결과
                  </span>
                </div>
                <button
                  onClick={handleCopyMasked}
                  className="px-3 py-1 rounded-xl text-xs font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 hover:bg-blue-100 transition flex items-center gap-1 cursor-pointer"
                >
                  {copiedMasked ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedMasked ? '복사완료' : '결과 복사'}</span>
                </button>
              </div>
              <div className="w-full flex-1 p-3.5 rounded-2xl bg-emerald-50/30 dark:bg-emerald-950/10 border border-emerald-200/60 dark:border-emerald-900/40 text-xs font-mono text-slate-800 dark:text-slate-200 leading-relaxed overflow-y-auto whitespace-pre-wrap select-all">
                {piiResult.마스킹_결과텍스트}
              </div>
            </div>
          </div>

          {/* 탐지된 개인정보 세부 내역 테이블 */}
          {piiResult.탐지목록.length > 0 && (
            <div className="bg-white dark:bg-[#15161b] p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  <span>검출된 환자 개인식별정보(PII) 상세 내역 ({piiResult.탐지목록.length}건)</span>
                </h4>
                <span className="text-[11px] text-slate-400">개인정보보호법 제24조의2 적용</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 font-bold border-y border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3">식별 유형</th>
                      <th className="py-2.5 px-3">원본 노출 텍스트</th>
                      <th className="py-2.5 px-3">비식별화 마스킹</th>
                      <th className="py-2.5 px-3">위험도</th>
                      <th className="py-2.5 px-3">법적 근거 및 조치 가이드</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                    {piiResult.탐지목록.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-900/40">
                        <td className="py-2 px-3 font-sans font-bold text-slate-800 dark:text-slate-200">
                          {item.유형}
                        </td>
                        <td className="py-2 px-3 text-rose-600 dark:text-rose-400 font-bold bg-rose-50/50 dark:bg-rose-950/20">
                          {item.원본텍스트}
                        </td>
                        <td className="py-2 px-3 text-emerald-600 dark:text-emerald-400 font-bold">
                          {item.마스킹텍스트}
                        </td>
                        <td className="py-2 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-black font-sans ${
                              item.위험도 === '심각'
                                ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                                : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                            }`}
                          >
                            {item.위험도}
                          </span>
                        </td>
                        <td className="py-2 px-3 font-sans text-slate-500 text-[11px] max-w-xs">
                          {item.설명}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* [MODE 2] 2026 수정공시 6단계 소명사유서 공식양식 생성기 */}
      {subMode === 'amendment_statement' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 좌측: 소명서 입력 파라미터 폼 */}
            <div className="bg-white dark:bg-[#15161b] p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  <h4 className="text-xs font-black text-slate-900 dark:text-white">
                    소명대상 기관 및 담당자 정보
                  </h4>
                </div>
                <span className="text-[10px] text-slate-400">STEP 2 정정서식</span>
              </div>

              <div className="space-y-3 text-xs">
                {/* 41개 병원 선택 */}
                <div className="space-y-1">
                  <label className="text-slate-600 dark:text-slate-400 font-bold">
                    소명 대상 공공병원 선택
                  </label>
                  <select
                    value={selectedHospitalName}
                    onChange={(e) => setSelectedHospitalName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold cursor-pointer"
                  >
                    {전국_41개_지역거점공공병원_공시검증_목록.map((h) => (
                      <option key={h.기관명} value={h.기관명}>
                        [{h.시도}] {h.기관명} (오류의심 {h.오류의심_건수}건)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="p-3 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40 space-y-1 text-[11px] text-rose-800 dark:text-rose-300">
                  <span className="font-bold">국립중앙의료원 검증 결과 (업무보고 붙임 2):</span>{' '}
                  오류의심 {selectedHospitalData.오류의심_건수}건 · 검토요청 {selectedHospitalData.검토요청_건수}건. 세부 오류 항목은 NMC 통보 자료를 확인하세요.
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-slate-600 dark:text-slate-400">공시 담당자명</label>
                    <input
                      type="text"
                      value={managerName}
                      onChange={(e) => setManagerName(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-600 dark:text-slate-400">담당자 연락처</label>
                    <input
                      type="text"
                      value={managerPhone}
                      onChange={(e) => setManagerPhone(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-600 dark:text-slate-400 font-bold">
                    불일치 및 오류 원인 분석
                  </label>
                  <textarea
                    value={errorCause}
                    onChange={(e) => setErrorCause(e.target.value)}
                    rows={3}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-600 dark:text-slate-400 font-bold">
                    정정 내역 및 조치 결과
                  </label>
                  <textarea
                    value={amendmentDetail}
                    onChange={(e) => setAmendmentDetail(e.target.value)}
                    rows={3}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-600 dark:text-slate-400 font-bold">
                    재발 방지 대책
                  </label>
                  <textarea
                    value={preventionPlan}
                    onChange={(e) => setPreventionPlan(e.target.value)}
                    rows={3}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>
            </div>

            {/* 우측: 완성된 수정공시 사유서 공식 공문 뷰 */}
            <div className="lg:col-span-2 bg-white dark:bg-[#15161b] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 flex flex-col">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <FileCheck2 className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-black text-slate-900 dark:text-white">
                    2026 수정공시 사유서 공식 표준 공문 서식
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyStatement}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    {copiedStatement ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedStatement ? '복사완료' : '공문 복사'}</span>
                  </button>
                </div>
              </div>

              <div className="flex-1 p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 font-mono text-xs leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-wrap overflow-y-auto select-all shadow-inner">
                {generatedStatement}
              </div>

              <div className="p-3 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/40 text-[11px] text-blue-900 dark:text-blue-300">
                📌 본 사유서는 국립중앙의료원 공공보건의료본부 및 보건복지부에 제출되는 공문 서식으로, 복사 후 기관장 직인 날인하여 알리미 시스템 또는 공문서로 회신하십시오.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
