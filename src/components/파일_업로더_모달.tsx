'use client';

// iOS / macOS 스타일의 드래그 앤 드롭 파일 업로더 모달 컴포넌트

import React, { useState, useRef } from 'react';
import { UploadCloud, X, FileText, AlertCircle, CheckCircle2 } from 'lucide-react';
import { 시군구_원천_데이터 } from '@/lib/필수의료_타입';
import { 파일_처리기 } from '@/lib/파일_처리기';

interface 파일_업로더_모달_속성 {
  is_open: boolean;
  on_close: () => void;
  on_data_loaded: (data: 시군구_원천_데이터[]) => void;
}

export const 파일_업로더_모달: React.FC<파일_업로더_모달_속성> = ({
  is_open,
  on_close,
  on_data_loaded,
}) => {
  const [is_dragging, set_is_dragging] = useState(false);
  const [is_loading, set_is_loading] = useState(false);
  const [error_message, set_error_message] = useState<string | null>(null);
  const [success_count, set_success_count] = useState<number | null>(null);
  const file_input_ref = useRef<HTMLInputElement>(null);

  if (!is_open) return null;

  const handle_process_file = async (file: File) => {
    set_error_message(null);
    set_is_loading(true);

    try {
      let parsed_rows: 시군구_원천_데이터[] = [];
      const file_extension = file.name.split('.').pop()?.toLowerCase();

      if (file_extension === 'csv') {
        parsed_rows = await 파일_처리기.parse_csv_file(file);
      } else if (file_extension === 'xlsx' || file_extension === 'xls') {
        parsed_rows = await 파일_처리기.parse_excel_file(file);
      } else {
        throw new Error('지원되지 않는 파일 형식입니다. .csv 또는 .xlsx 파일을 업로드해주세요.');
      }

      if (parsed_rows.length === 0) {
        throw new Error('유효한 시·군·구 데이터 행을 찾을 수 없습니다. 컬럼명을 확인해주세요.');
      }

      set_success_count(parsed_rows.length);
      setTimeout(() => {
        on_data_loaded(parsed_rows);
        set_is_loading(false);
        set_success_count(null);
        on_close();
      }, 700);
    } catch (err: any) {
      set_error_message(err.message || '파일을 파싱하는 도중 오류가 발생했습니다.');
      set_is_loading(false);
    }
  };

  const handle_drag_over = (e: React.DragEvent) => {
    e.preventDefault();
    set_is_dragging(true);
  };

  const handle_drag_leave = (e: React.DragEvent) => {
    e.preventDefault();
    set_is_dragging(false);
  };

  const handle_drop = (e: React.DragEvent) => {
    e.preventDefault();
    set_is_dragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handle_process_file(files[0]);
    }
  };

  const handle_file_change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handle_process_file(files[0]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4 transition-all animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-apple-glass max-w-lg w-full overflow-hidden border border-black/[0.08] transition-all">
        {/* 모달 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/[0.05] bg-[#f5f5f7]/60">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-full bg-[#0071e3]/10 text-[#0071e3] flex items-center justify-center">
              <UploadCloud className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight text-[#1d1d1f]">
                원천 데이터 업로드
              </h3>
              <p className="text-[11px] text-[#86868b]">지자체 또는 공공의료기관 지표 파일</p>
            </div>
          </div>
          <button
            onClick={on_close}
            className="w-7 h-7 rounded-full bg-[#e8e8ed] hover:bg-[#dcdcde] flex items-center justify-center text-[#86868b] hover:text-[#1d1d1f] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 모달 본문 */}
        <div className="p-6 space-y-4">
          <div
            onDragOver={handle_drag_over}
            onDragLeave={handle_drag_leave}
            onDrop={handle_drop}
            onClick={() => file_input_ref.current?.click()}
            className={`border-2 border-dashed rounded-2.5xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center ${
              is_dragging
                ? 'border-[#0071e3] bg-[#0071e3]/[0.04] scale-[0.99]'
                : 'border-black/[0.1] hover:border-[#0071e3] hover:bg-[#f5f5f7]/50'
            }`}
          >
            <input
              type="file"
              ref={file_input_ref}
              onChange={handle_file_change}
              accept=".csv,.xlsx,.xls"
              className="hidden"
            />
            <div className="w-12 h-12 rounded-full bg-[#f5f5f7] text-[#0071e3] flex items-center justify-center mb-3 shadow-apple-sm">
              <FileText className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-[#1d1d1f]">
              CSV 또는 Excel(.xlsx) 파일을 드래그하여 업로드
            </p>
            <p className="text-xs text-[#86868b] mt-1">
              클릭하여 파일 선택 (100% 클라이언트 로컬 보안 파싱)
            </p>
          </div>

          {/* 필수 컬럼 가이드 */}
          <div className="bg-[#f5f5f7] p-3.5 rounded-2xl text-xs text-[#86868b] space-y-1">
            <p className="font-semibold text-[#1d1d1f] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0071e3]" />
              자동 매핑 지원 컬럼:
            </p>
            <div className="grid grid-cols-2 gap-1 text-[11px] pl-3 text-[#6e6e73]">
              <div>• 시도명 / 시군구명 / 인구수</div>
              <div>• 응급_60분_미도달_인구비율</div>
              <div>• 관내_응급_의료이용률 (RI)</div>
              <div>• 분만_60분_미도달_인구비율</div>
              <div>• 관내_분만율</div>
              <div>• 소아_병상_공급비율 (선택, 비우면 판정 제외)</div>
            </div>
          </div>

          {is_loading && (
            <div className="p-3 bg-[#0071e3]/[0.08] text-[#0071e3] rounded-2xl text-xs font-medium flex items-center space-x-2 animate-pulse">
              <div className="w-3.5 h-3.5 border-2 border-[#0071e3] border-t-transparent rounded-full animate-spin" />
              <span>데이터 파싱 및 필수의료 취약지 진단 중...</span>
            </div>
          )}

          {error_message && (
            <div className="p-3 bg-[#ff3b30]/10 text-[#ff3b30] rounded-2xl text-xs font-medium flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error_message}</span>
            </div>
          )}

          {success_count !== null && (
            <div className="p-3 bg-[#34c759]/10 text-[#34c759] rounded-2xl text-xs font-medium flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>총 {success_count}개 시·군·구 데이터 로드 완료</span>
            </div>
          )}
        </div>

        {/* 모달 푸터 */}
        <div className="px-6 py-3.5 bg-[#f5f5f7]/60 border-t border-black/[0.05] flex justify-end">
          <button
            onClick={on_close}
            className="px-4 py-1.5 text-xs font-medium text-[#1d1d1f] hover:bg-[#e8e8ed] rounded-full transition"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
