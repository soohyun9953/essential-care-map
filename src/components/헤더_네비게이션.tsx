'use client';

// 상단 헤더 및 플랫폼 액션 네비게이션 바 컴포넌트

import React from 'react';
import {
  FileSpreadsheet,
  Download,
  Upload,
  RefreshCw,
  Camera,
  Activity,
  ShieldAlert,
} from 'lucide-react';
import { 파일_처리기 } from '@/lib/파일_처리기';

interface 헤더_네비게이션_속성 {
  on_open_upload_modal: () => void;
  on_load_sample_data: () => void;
  on_export_report_png: () => void;
  total_region_count: number;
  vulnerable_region_count: number;
}

export const 헤더_네비게이션: React.FC<헤더_네비게이션_속성> = ({
  on_open_upload_modal,
  on_load_sample_data,
  on_export_report_png,
  total_region_count,
  vulnerable_region_count,
}) => {
  const handle_download_template = () => {
    파일_처리기.download_standard_template();
  };

  return (
    <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-50 border-b border-slate-800">
      <div className="max-w-[1720px] mx-auto px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* 로고 및 서비스 타이틀 */}
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-tr from-sky-500 to-indigo-600 p-2.5 rounded-xl shadow-md flex items-center justify-center">
              <Activity className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/30">
                  국립중앙의료원 공공보건의료지원센터
                </span>
                <span className="text-xs text-slate-400">Ver 2.5</span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
                필수의료 3대 취약지 진단 & 사업계획서 자동생성 플랫폼
              </h1>
            </div>
          </div>

          {/* 중앙 요약 뱃지 */}
          <div className="hidden xl:flex items-center space-x-4 bg-slate-800/80 px-4 py-1.5 rounded-lg border border-slate-700/60 text-xs">
            <div className="flex items-center space-x-1.5">
              <span className="text-slate-400">분석 대상:</span>
              <span className="font-bold text-sky-400">{total_region_count}개 시·군·구</span>
            </div>
            <div className="h-3 w-px bg-slate-700" />
            <div className="flex items-center space-x-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              <span className="text-slate-400">취약지 판정:</span>
              <span className="font-bold text-rose-400">{vulnerable_region_count}개 지역</span>
            </div>
          </div>

          {/* 주요 액션 버튼 툴바 */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* 표준 템플릿 다운로드 */}
            <button
              onClick={handle_download_template}
              className="inline-flex items-center space-x-1.5 px-3 py-2 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition border border-slate-700 shadow-sm"
              title="CSV 표준 양식 다운로드"
            >
              <Download className="w-3.5 h-3.5 text-slate-300" />
              <span>표준 템플릿 (.csv)</span>
            </button>

            {/* 샘플 데이터 로드 */}
            <button
              onClick={on_load_sample_data}
              className="inline-flex items-center space-x-1.5 px-3 py-2 text-xs font-medium bg-indigo-600/80 hover:bg-indigo-600 text-white rounded-lg transition border border-indigo-500/40 shadow-sm"
              title="국립중앙의료원 전국 250개 시군구 표준 샘플 데이터셋 로드"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>샘플 데이터 로드</span>
            </button>

            {/* 사용자 파일 업로드 */}
            <button
              onClick={on_open_upload_modal}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-medium bg-sky-600 hover:bg-sky-500 text-white rounded-lg transition shadow-md hover:shadow-sky-500/20"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>데이터 업로드 (CSV/Excel)</span>
            </button>

            {/* 리포트 이미지 캡처 */}
            <button
              onClick={on_export_report_png}
              className="inline-flex items-center space-x-1.5 px-3 py-2 text-xs font-medium bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg transition shadow-sm"
              title="현재 대시보드 화면 및 리포트를 고해상도 PNG 이미지로 캡처 저장"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>리포트 캡처 (PNG)</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
