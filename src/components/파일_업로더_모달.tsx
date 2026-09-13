'use client';

// CSV/XLSX 드래그 앤 드롭 파일 업로더 모달 컴포넌트

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-200">
        {/* 모달 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center space-x-2">
            <UploadCloud className="w-5 h-5 text-sky-600" />
            <h3 className="text-base font-bold text-slate-800">
              필수의료 지표 원천 데이터 업로드
            </h3>
          </div>
          <button
            onClick={on_close}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 모달 본문 */}
        <div className="p-6 space-y-4">
          <div
            onDragOver={handle_drag_over}
            onDragLeave={handle_drag_leave}
            onDrop={handle_drop}
            onClick={() => file_input_ref.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition flex flex-col items-center justify-center ${
              is_dragging
                ? 'border-sky-500 bg-sky-50/50 scale-[0.99]'
                : 'border-slate-300 hover:border-sky-400 hover:bg-slate-50'
            }`}
          >
            <input
              type="file"
              ref={file_input_ref}
              onChange={handle_file_change}
              accept=".csv,.xlsx,.xls"
              className="hidden"
            />
            <div className="w-12 h-12 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center mb-3 shadow-inner">
              <FileText className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-700">
              CSV 또는 Excel(.xlsx) 파일을 여기에 드래그하거나 클릭하여 선택
            </p>
            <p className="text-xs text-slate-400 mt-1">
              최대 10MB (100% 브라우저 클라이언트 로컬 파싱)
            </p>
          </div>

          {/* 필수 컬럼 안내 */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 text-xs text-slate-600 space-y-1.5">
            <p className="font-semibold text-slate-800 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500 inline-block" />
              자동 인식 지원 컬럼명:
            </p>
            <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-500 pl-2">
              <div>• 시도명 / 시군구명 / 인구수</div>
              <div>• 응급_60분_미도달_인구비율</div>
              <div>• 관내_응급_의료이용률 (RI)</div>
              <div>• 분만_60분_미도달_인구비율</div>
              <div>• 관내_분만율</div>
              <div>• 소아_병상_공급비율</div>
            </div>
          </div>

          {/* 로딩 & 에러 & 성공 상태 메시지 */}
          {is_loading && (
            <div className="p-3 bg-sky-50 text-sky-700 rounded-lg text-xs font-medium flex items-center space-x-2 animate-pulse">
              <div className="w-4 h-4 border-2 border-sky-600 border-t-transparent rounded-full animate-spin" />
              <span>데이터 파싱 및 필수의료 취약지 종합 진단 중...</span>
            </div>
          )}

          {error_message && (
            <div className="p-3 bg-rose-50 text-rose-700 rounded-lg text-xs font-medium flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error_message}</span>
            </div>
          )}

          {success_count !== null && (
            <div className="p-3 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-medium flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>총 {success_count}개 시·군·구 데이터가 성공적으로 로드되었습니다!</span>
            </div>
          )}
        </div>

        {/* 모달 푸터 */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={on_close}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
