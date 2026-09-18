'use client';

// Apple Notes / Pages 감성의 공문서 개조식 사업계획서 실시간 자동 생성기 컴포넌트

import React, { useState } from 'react';
import {
  Copy,
  Check,
  Download,
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
      <div className="bg-white p-8 rounded-3xl border border-black/[0.05] shadow-apple-card text-center flex flex-col items-center justify-center min-h-[320px]">
        <div className="w-12 h-12 rounded-full bg-[#f5f5f7] flex items-center justify-center mb-3">
          <FileText className="w-6 h-6 text-[#86868b]" />
        </div>
        <p className="text-base font-semibold text-[#1d1d1f]">시·군·구를 선택하면 공문서가 작성됩니다</p>
        <p className="text-xs text-[#86868b] mt-1 max-w-sm">
          보건복지부 취약지 지원사업 및 국립중앙의료원 공모 표준 양식에 맞춘 개조식 문안이 즉시 완성됩니다.
        </p>
      </div>
    );
  }

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
    link.setAttribute('download', `${selected_region.시도명}_${selected_region.시군구명}_사업계획서_서술문.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white p-6 sm:p-7 rounded-3xl border border-black/[0.05] shadow-apple-card space-y-5" id="narrative-generator-container">
      {/* 상단 툴바 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-black/[0.05]">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-[#0071e3]/10 text-[#0071e3] flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="zone-badge-result">📊 자동 생성 문안</span>
              <h3 className="text-base font-bold tracking-tight text-[#1d1d1f]">
                공문서 개조식 사업계획서 서술문
              </h3>
            </div>
            <p className="text-xs text-[#86868b] mt-0.5">
              보건복지부 취약지 지원사업 / 국립중앙의료원 공모 신청 표준 서식에 맞춘 읽기 전용 문안
            </p>
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={handle_download_txt}
            className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-medium bg-[#f5f5f7] hover:bg-[#e8e8ed] text-[#1d1d1f] rounded-full transition active:scale-[0.97]"
            title="텍스트 파일로 다운로드"
          >
            <Download className="w-3.5 h-3.5 text-[#86868b]" />
            <span>TXT 저장</span>
          </button>

          <button
            onClick={handle_copy_full}
            className={`inline-flex items-center space-x-1.5 px-4 py-1.5 text-xs font-semibold rounded-full transition-all shadow-apple-sm active:scale-[0.97] ${
              copied_section === 'full'
                ? 'bg-[#34c759] text-white'
                : 'bg-[#0071e3] hover:bg-[#0077ed] text-white'
            }`}
          >
            {copied_section === 'full' ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>복사 완료!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>문안 전체 복사</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 개조식 서술문 카드 리스트 */}
      <div className="space-y-3.5">
        {/* 섹션 1: 추진 배경 및 필요성 */}
        <div className="zone-info-box border-l-4 border-l-blue-500 p-4 rounded-2.5xl transition group">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="zone-badge-info">💡 섹션 1</span>
              <h4 className="font-bold text-xs sm:text-sm text-[#1d1d1f]">
                □ 추진 배경 및 필요성 (필수의료 인프라 분석)
              </h4>
            </div>
            <button
              onClick={() => handle_copy_single('sec1', `□ 추진 배경 및 필요성 (필수의료 인프라 분석)\n${narrative_package.추진배경_필요성}`)}
              className="text-[11px] text-[#86868b] hover:text-[#0071e3] flex items-center gap-1 opacity-70 group-hover:opacity-100 transition"
            >
              {copied_section === 'sec1' ? <Check className="w-3 h-3 text-[#34c759]" /> : <Copy className="w-3 h-3" />}
              <span>{copied_section === 'sec1' ? '복사됨' : '복사'}</span>
            </button>
          </div>
          <pre className="whitespace-pre-wrap font-sans text-[#48484a] text-xs leading-relaxed">
            {narrative_package.추진배경_필요성}
          </pre>
        </div>

        {/* 섹션 2: 법정 기준 충족 여부 */}
        <div className="zone-info-box border-l-4 border-l-teal-500 p-4 rounded-2.5xl transition group">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="zone-badge-info">💡 섹션 2</span>
              <h4 className="font-bold text-xs sm:text-sm text-[#1d1d1f]">
                □ 법정 기준 충족 여부 및 취약 분야 진단
              </h4>
            </div>
            <button
              onClick={() => handle_copy_single('sec2', `□ 법정 기준 충족 여부 및 취약 분야 진단\n${narrative_package.법정기준_충족현황}`)}
              className="text-[11px] text-[#86868b] hover:text-[#0071e3] flex items-center gap-1 opacity-70 group-hover:opacity-100 transition"
            >
              {copied_section === 'sec2' ? <Check className="w-3 h-3 text-[#34c759]" /> : <Copy className="w-3 h-3" />}
              <span>{copied_section === 'sec2' ? '복사됨' : '복사'}</span>
            </button>
          </div>
          <pre className="whitespace-pre-wrap font-sans text-[#48484a] text-xs leading-relaxed">
            {narrative_package.법정기준_충족현황}
          </pre>
        </div>

        {/* 섹션 3: 모자·소아 인프라 결핍 */}
        <div className="zone-info-box border-l-4 border-l-purple-500 p-4 rounded-2.5xl transition group">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="zone-badge-info">💡 섹션 3</span>
              <h4 className="font-bold text-xs sm:text-sm text-[#1d1d1f]">
                □ 모자·소아 필수의료 인프라 결핍 현황
              </h4>
            </div>
            <button
              onClick={() => handle_copy_single('sec3', `□ 모자·소아 필수의료 인프라 결핍 현황\n${narrative_package.모자_소아_인프라결핍}`)}
              className="text-[11px] text-[#86868b] hover:text-[#0071e3] flex items-center gap-1 opacity-70 group-hover:opacity-100 transition"
            >
              {copied_section === 'sec3' ? <Check className="w-3 h-3 text-[#34c759]" /> : <Copy className="w-3 h-3" />}
              <span>{copied_section === 'sec3' ? '복사됨' : '복사'}</span>
            </button>
          </div>
          <pre className="whitespace-pre-wrap font-sans text-[#48484a] text-xs leading-relaxed">
            {narrative_package.모자_소아_인프라결핍}
          </pre>
        </div>

        {/* 섹션 4: 종합 의견 및 사업 당위성 */}
        <div className="zone-info-box border-l-4 border-l-indigo-500 p-4 rounded-2.5xl transition group">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="zone-badge-info">💡 섹션 4</span>
              <h4 className="font-bold text-xs sm:text-sm text-[#1d1d1f]">
                □ 종합 의견 및 사업 추진 당위성
              </h4>
            </div>
            <button
              onClick={() => handle_copy_single('sec4', `□ 종합 의견 및 사업 추진 당위성\n${narrative_package.종합_건의_문안}`)}
              className="text-[11px] text-[#86868b] hover:text-[#0071e3] flex items-center gap-1 opacity-70 group-hover:opacity-100 transition"
            >
              {copied_section === 'sec4' ? <Check className="w-3 h-3 text-[#34c759]" /> : <Copy className="w-3 h-3" />}
              <span>{copied_section === 'sec4' ? '복사됨' : '복사'}</span>
            </button>
          </div>
          <pre className="whitespace-pre-wrap font-sans text-[#48484a] text-xs leading-relaxed">
            {narrative_package.종합_건의_문안}
          </pre>
        </div>
      </div>
    </div>
  );
};
