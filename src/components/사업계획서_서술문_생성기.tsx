'use client';

// 보건복지부 및 국립중앙의료원 공모사업 양식 기반 공문서 개조식 사업계획서 자동 생성기 컴포넌트

import React, { useState } from 'react';
import {
  FileCheck,
  Copy,
  Check,
  Download,
  FileSpreadsheet,
  FileText,
  Sparkles,
} from 'lucide-react';
import { 필수의료_진단_결과, 지역_평균_통계, 사업계획서_서술문_패키지 } from '@/lib/필수의료_타입';
import { 사업계획서_문안_생성기 } from '@/lib/필수의료_엔진';
import { copy_text_to_clipboard } from '@/lib/유틸리티';

interface 사업계획서_서술문_생성기_속성 {
  selected_region: 필수의료_진단_결과 | null;
  sido_stat: 지역_평균_통계;
  national_stat: 지역_평균_통계;
}

export const 사업계획서_서술문_생성기: React.FC<사업계획서_서술문_생성기_속성> = ({
  selected_region,
  sido_stat,
  national_stat,
}) => {
  const [copied_section, set_copied_section] = useState<string | null>(null);

  if (!selected_region) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center flex flex-col items-center justify-center min-h-[350px]">
        <FileText className="w-10 h-10 text-slate-300 mb-2" />
        <p className="text-sm font-semibold text-slate-700">시·군·구를 선택하면 공문서 개조식 사업계획서가 자동 생성됩니다.</p>
        <p className="text-xs text-slate-400 mt-1">보건복지부 및 국립중앙의료원 공모사업 신청서 기준 실시간 작성</p>
      </div>
    );
  }

  // 서술문 패키지 생성
  const narrative_package: 사업계획서_서술문_패키지 = 사업계획서_문안_생성기.generate_narrative(
    selected_region,
    sido_stat,
    national_stat
  );

  const handle_copy_full = async () => {
    const success = await copy_text_to_clipboard(narrative_package.전체_통합_문안);
    if (success) {
      set_copied_section('full');
      setTimeout(() => set_copied_section(null), 2000);
    }
  };

  const handle_copy_single = async (section_key: string, text: string) => {
    const success = await copy_text_to_clipboard(text);
    if (success) {
      set_copied_section(section_key);
      setTimeout(() => set_copied_section(null), 2000);
    }
  };

  const handle_download_txt = () => {
    const blob = new Blob([narrative_package.전체_통합_문안], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${selected_region.시도명}_${selected_region.시군구명}_필수의료_사업계획서_문안.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4" id="narrative-generator-container">
      {/* 타이틀 및 툴바 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-lg bg-sky-100 text-sky-700">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>공문서 개조식 사업계획서 실시간 생성기</span>
            </h3>
            <p className="text-xs text-slate-500">
              보건복지부 취약지 지원사업 및 국립중앙의료원 공공보건의료 공모 신청 서식
            </p>
          </div>
        </div>

        {/* 복사 및 다운로드 액션 */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handle_download_txt}
            className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
            title="텍스트 파일로 다운로드"
          >
            <Download className="w-3.5 h-3.5" />
            <span>TXT 저장</span>
          </button>

          <button
            onClick={handle_copy_full}
            className={`inline-flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition shadow-sm ${
              copied_section === 'full'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-900 hover:bg-slate-800 text-white'
            }`}
          >
            {copied_section === 'full' ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>전체 복사 완료!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>개조식 문안 전체 복사</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 개조식 서술문 프리뷰 박스 */}
      <div className="space-y-3 font-sans text-xs sm:text-sm text-slate-800 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
        {/* 섹션 1: 추진 배경 및 필요성 */}
        <div className="bg-white p-3.5 rounded-lg border border-slate-200/80 shadow-2xs space-y-1.5 relative group">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-900 text-xs sm:text-sm text-sky-950">
              □ 추진 배경 및 필요성 (필수의료 인프라 분석)
            </h4>
            <button
              onClick={() => handle_copy_single('sec1', `□ 추진 배경 및 필요성 (필수의료 인프라 분석)\n${narrative_package.추진배경_필요성}`)}
              className="text-[11px] text-slate-400 hover:text-sky-600 flex items-center gap-1 opacity-80 group-hover:opacity-100 transition"
            >
              {copied_section === 'sec1' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              <span>{copied_section === 'sec1' ? '복사됨' : '복사'}</span>
            </button>
          </div>
          <pre className="whitespace-pre-wrap font-sans text-slate-700 text-xs leading-5">
            {narrative_package.추진배경_필요성}
          </pre>
        </div>

        {/* 섹션 2: 법정 기준 충족 여부 및 취약 분야 */}
        <div className="bg-white p-3.5 rounded-lg border border-slate-200/80 shadow-2xs space-y-1.5 relative group">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-900 text-xs sm:text-sm text-sky-950">
              □ 법정 기준 충족 여부 및 취약 분야 진단
            </h4>
            <button
              onClick={() => handle_copy_single('sec2', `□ 법정 기준 충족 여부 및 취약 분야 진단\n${narrative_package.법정기준_충족현황}`)}
              className="text-[11px] text-slate-400 hover:text-sky-600 flex items-center gap-1 opacity-80 group-hover:opacity-100 transition"
            >
              {copied_section === 'sec2' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              <span>{copied_section === 'sec2' ? '복사됨' : '복사'}</span>
            </button>
          </div>
          <pre className="whitespace-pre-wrap font-sans text-slate-700 text-xs leading-5">
            {narrative_package.법정기준_충족현황}
          </pre>
        </div>

        {/* 섹션 3: 모자·소아 필수의료 인프라 결핍 */}
        <div className="bg-white p-3.5 rounded-lg border border-slate-200/80 shadow-2xs space-y-1.5 relative group">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-900 text-xs sm:text-sm text-sky-950">
              □ 모자·소아 필수의료 인프라 결핍 현황
            </h4>
            <button
              onClick={() => handle_copy_single('sec3', `□ 모자·소아 필수의료 인프라 결핍 현황\n${narrative_package.모자_소아_인프라결핍}`)}
              className="text-[11px] text-slate-400 hover:text-sky-600 flex items-center gap-1 opacity-80 group-hover:opacity-100 transition"
            >
              {copied_section === 'sec3' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              <span>{copied_section === 'sec3' ? '복사됨' : '복사'}</span>
            </button>
          </div>
          <pre className="whitespace-pre-wrap font-sans text-slate-700 text-xs leading-5">
            {narrative_package.모자_소아_인프라결핍}
          </pre>
        </div>

        {/* 섹션 4: 종합 의견 및 사업 추진 당위성 */}
        <div className="bg-white p-3.5 rounded-lg border border-slate-200/80 shadow-2xs space-y-1.5 relative group">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-900 text-xs sm:text-sm text-sky-950">
              □ 종합 의견 및 사업 추진 당위성
            </h4>
            <button
              onClick={() => handle_copy_single('sec4', `□ 종합 의견 및 사업 추진 당위성\n${narrative_package.종합_건의_문안}`)}
              className="text-[11px] text-slate-400 hover:text-sky-600 flex items-center gap-1 opacity-80 group-hover:opacity-100 transition"
            >
              {copied_section === 'sec4' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              <span>{copied_section === 'sec4' ? '복사됨' : '복사'}</span>
            </button>
          </div>
          <pre className="whitespace-pre-wrap font-sans text-slate-700 text-xs leading-5">
            {narrative_package.종합_건의_문안}
          </pre>
        </div>
      </div>
    </div>
  );
};
