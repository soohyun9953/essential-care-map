'use client';

// 애플 사이트(Apple.com) 스타일 글로벌 내비게이션 바 컴포넌트

import React from 'react';
import {
  Download,
  Upload,
  RefreshCw,
  Camera,
  Activity,
} from 'lucide-react';
import { 파일_처리기 } from '@/lib/파일_처리기';

interface 헤더_네비게이션_속성 {
  on_open_upload_modal: () => void;
  on_load_sample_data: () => void;
  on_export_report_png: () => void;
  on_download_nmc_excel: () => void;
  total_region_count: number;
  vulnerable_region_count: number;
}

export const 헤더_네비게이션: React.FC<헤더_네비게이션_속성> = ({
  on_open_upload_modal,
  on_load_sample_data,
  on_export_report_png,
  on_download_nmc_excel,
  total_region_count,
  vulnerable_region_count,
}) => {
  const handle_download_template = () => {
    파일_처리기.download_standard_template();
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-black/[0.06] transition-all">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-14 sm:h-16 flex items-center justify-between gap-4">
          {/* 브랜드 아이덴티티: 애플 특유의 정제된 타이포그래피 */}
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-b from-[#1d1d1f] to-[#2d2d30] text-white flex items-center justify-center shadow-apple-sm">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-semibold tracking-tight text-[#86868b]">
                  국립중앙의료원 공공보건의료지원센터
                </span>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#0071e3]/10 text-[#0071e3]">
                  20260918 v0.24
                </span>
              </div>
              <h1 className="text-sm sm:text-base font-semibold tracking-tight text-[#1d1d1f] flex items-center gap-1.5">
                필수의료 취약지 종합 진단 & 공문서 생성 플랫폼
              </h1>
            </div>
          </div>

          {/* 중앙 요약: 애플 스타일 캡슐 뱃지 */}
          <div className="hidden xl:flex items-center space-x-3 bg-[#f5f5f7] px-3.5 py-1.5 rounded-full text-xs text-[#1d1d1f] font-medium border border-black/[0.04]">
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-[#34c759]" />
              <span className="text-[#86868b]">진단 대상:</span>
              <span className="font-semibold">{total_region_count}개 시·군·구</span>
            </div>
            <span className="text-black/20">•</span>
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-[#ff3b30]" />
              <span className="text-[#86868b]">취약 판정:</span>
              <span className="font-semibold text-[#ff3b30]">{vulnerable_region_count}개 지역</span>
            </div>
          </div>

          {/* 애플 스타일 액션 버튼 그룹 */}
          <div className="flex items-center space-x-2">
            {/* NMC 표준 크로스탭 엑셀(3종) 다운로드 */}
            <button
              onClick={on_download_nmc_excel}
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-semibold bg-[#34c759]/10 hover:bg-[#34c759]/20 text-[#248a3d] rounded-full transition active:scale-[0.97] border border-[#34c759]/20"
              title="국립중앙의료원 표준 크로스탭 3종 엑셀(.xlsx) 다운로드"
            >
              <Download className="w-3.5 h-3.5 text-[#34c759]" />
              <span>NMC 엑셀 다운로드</span>
            </button>

            {/* 표준 템플릿 다운로드 */}
            <button
              onClick={handle_download_template}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-[#1d1d1f] bg-[#f5f5f7] hover:bg-[#e8e8ed] rounded-full transition active:scale-[0.97]"
              title="CSV 표준 양식 다운로드"
            >
              <Download className="w-3.5 h-3.5 text-[#86868b]" />
              <span className="hidden sm:inline">표준 템플릿</span>
            </button>

            {/* 샘플 데이터 로드 */}
            <button
              onClick={on_load_sample_data}
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-medium text-[#1d1d1f] bg-[#f5f5f7] hover:bg-[#e8e8ed] rounded-full transition active:scale-[0.97]"
              title="국립중앙의료원 전국 표준 샘플 데이터셋 로드"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#86868b]" />
              <span className="hidden sm:inline">샘플 데이터</span>
            </button>

            {/* 사용자 파일 업로드 - 애플 블루 버튼 */}
            <button
              onClick={on_open_upload_modal}
              className="inline-flex items-center space-x-1.5 px-4 py-1.5 text-xs font-medium text-white bg-[#0071e3] hover:bg-[#0077ed] rounded-full transition shadow-apple-sm active:scale-[0.97]"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>데이터 업로드</span>
            </button>

            {/* 리포트 캡처 */}
            <button
              onClick={on_export_report_png}
              className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-medium text-[#1d1d1f] hover:bg-[#f5f5f7] rounded-full transition active:scale-[0.97]"
              title="대시보드 리포트 PNG 이미지 캡처"
            >
              <Camera className="w-3.5 h-3.5 text-[#86868b]" />
              <span className="hidden md:inline">리포트 저장</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
