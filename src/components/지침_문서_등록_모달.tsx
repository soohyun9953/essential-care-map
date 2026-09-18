'use client';

// 지침 문서를 파일 업로드(PDF, HWPX, DOCX, TXT 등) 또는 직접 입력으로 RAG 코퍼스에 등록하는 모달

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  UploadCloud,
  FileText,
  CheckCircle2,
  Trash2,
  FilePlus,
  Sparkles,
  Info,
  ListFilter,
  FileUp,
  Loader2,
  Tag,
  ArrowRight,
  Layers,
  Edit3,
  PlusCircle,
  BookOpen,
} from 'lucide-react';
import {
  지침_문서_청크,
  get_user_chunks,
  add_user_chunk,
  delete_user_chunk,
} from '@/lib/공공의료_지침_코퍼스';
import { 문서_텍스트_추출기, 문서_분석_결과 } from '@/lib/문서_텍스트_추출기';

interface 지침_문서_등록_모달_속성 {
  is_open: boolean;
  on_close: () => void;
  on_document_added: () => void;
}

export const 지침_문서_등록_모달: React.FC<지침_문서_등록_모달_속성> = ({
  is_open,
  on_close,
  on_document_added,
}) => {
  const [active_tab, set_active_tab] = useState<'upload' | 'manual' | 'list'>('upload');
  const [user_chunks, set_user_chunks] = useState<지침_문서_청크[]>([]);

  // 파일 업로드 상태
  const [is_dragging, set_is_dragging] = useState(false);
  const [is_parsing, set_is_parsing] = useState(false);
  const [parsed_doc, set_parsed_doc] = useState<문서_분석_결과 | null>(null);
  const file_input_ref = useRef<HTMLInputElement>(null);

  // 수동 폼 및 파일 파싱 수정 상태
  const [문서명, set_문서명] = useState('');
  const [조항_페이지, set_조항_페이지] = useState('');
  const [분류, set_분류] = useState('응급의료');
  const [본문, set_본문] = useState('');
  const [핵심키워드, set_핵심키워드] = useState('');
  const [기준수치, set_기준수치] = useState('');
  const [success_message, set_success_message] = useState('');

  useEffect(() => {
    if (is_open) {
      set_user_chunks(get_user_chunks());
      set_success_message('');
    }
  }, [is_open]);

  if (!is_open) return null;

  // 파일 선택/드롭 처리
  const handle_process_file = async (file: File) => {
    set_is_parsing(true);
    set_success_message('');

    try {
      const result = await 문서_텍스트_추출기.parse_file(file);
      set_parsed_doc(result);

      // 수정 폼에도 자동 동기화
      set_문서명(result.문서명);
      set_조항_페이지('제1장 총칙 / 본문 발췌');
      set_분류(result.추론_카테고리);
      set_본문(result.본문);
      set_핵심키워드(result.추출_키워드.join(', '));
      set_기준수치(result.기준_수치_요약);
    } catch (err) {
      console.error(err);
      alert('파일 텍스트 추출 중 오류가 발생했습니다.');
    } finally {
      set_is_parsing(false);
    }
  };

  const handle_drop = (e: React.DragEvent) => {
    e.preventDefault();
    set_is_dragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handle_process_file(files[0]);
    }
  };

  const handle_file_change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handle_process_file(files[0]);
    }
  };

  // 파싱된 문서 RAG 코퍼스에 즉시 등록
  const handle_register_parsed_doc = () => {
    if (!문서명.trim() || !본문.trim()) {
      alert('문서명과 본문 내용은 필수입니다.');
      return;
    }

    const keywords = 핵심키워드
      .split(',')
      .map((k) => k.trim())
      .filter((k) => k.length > 0);

    add_user_chunk({
      문서명: 문서명.trim(),
      조항_페이지: 조항_페이지.trim() || '제1장 일반원칙',
      분류: 분류,
      본문: 본문.trim(),
      핵심키워드: keywords.length > 0 ? keywords : [분류, '신규지침'],
      기준수치: 기준수치.trim() || '지침 규정 준용',
    });

    set_success_message(`"${문서명}" 파일이 RAG 코퍼스에 성공적으로 등록되었습니다!`);
    set_user_chunks(get_user_chunks());
    on_document_added();

    // 초기화 및 목록 탭으로 이동
    set_parsed_doc(null);
    setTimeout(() => {
      set_success_message('');
      set_active_tab('list');
    }, 1200);
  };

  // 예시 데이터 자동 입력 버튼
  const handle_fill_sample = () => {
    set_문서명('강원특별자치도 응급의료 원격협진 및 닥터헬기 운용 지침');
    set_조항_페이지('제5조(중증응급환자 이송 골든타임 관리)');
    set_분류('응급의료');
    set_본문(
      '영월군 등 의료취약지에서 발생한 중증 외상 및 심뇌혈관 환자는 발생 30분 이내에 원주세브란스기독병원 권역센터 간 원격 화상협진을 실시하고, 지체 없이 닥터헬기 또는 전용 구급차로 이송하여야 한다. 야간 이송 시 전담 코디네이터 출동 수당을 1건당 15만원 지급한다.'
    );
    set_핵심키워드('닥터헬기, 골든타임, 원격협진, 영월군, 이송수당, 30분');
    set_기준수치('30분 이내 협진 및 출동수당 건당 15만원');
  };

  // 삭제 핸들러
  const handle_delete = (id: string) => {
    if (confirm('이 문서를 RAG 코퍼스에서 삭제하시겠습니까?')) {
      delete_user_chunk(id);
      set_user_chunks(get_user_chunks());
      on_document_added();
    }
  };

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#161618] rounded-3xl shadow-2xl border border-black/[0.08] dark:border-white/[0.1] w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* 상단 헤더 */}
        <div className="p-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-full bg-[#0071e3] flex items-center justify-center">
              <UploadCloud className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold">RAG 지침 문서 업로드 &amp; 등록</h3>
              <p className="text-xs text-white/70">
                문서 파일(PDF, HWPX, TXT 등)을 올리면 AI가 지침을 자동 분석하여 RAG 코퍼스에 등록합니다.
              </p>
            </div>
          </div>

          <button
            onClick={on_close}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 탭 네비게이션 */}
        <div className="flex border-b border-black/[0.06] dark:border-white/[0.08] bg-[#fbfbfd] dark:bg-[#1c1c1e] px-5 pt-3">
          <button
            onClick={() => set_active_tab('upload')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition flex items-center space-x-1.5 ${
              active_tab === 'upload'
                ? 'border-[#0071e3] text-[#0071e3] dark:text-[#2997ff]'
                : 'border-transparent text-[#86868b] dark:text-slate-400 hover:text-[#1d1d1f] dark:hover:text-white'
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>파일 업로드로 등록</span>
          </button>
          <button
            onClick={() => set_active_tab('manual')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition flex items-center space-x-1.5 ${
              active_tab === 'manual'
                ? 'border-[#0071e3] text-[#0071e3] dark:text-[#2997ff]'
                : 'border-transparent text-[#86868b] dark:text-slate-400 hover:text-[#1d1d1f] dark:hover:text-white'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>직접 텍스트 작성</span>
          </button>
          <button
            onClick={() => set_active_tab('list')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition flex items-center space-x-1.5 ${
              active_tab === 'list'
                ? 'border-[#0071e3] text-[#0071e3] dark:text-[#2997ff]'
                : 'border-transparent text-[#86868b] dark:text-slate-400 hover:text-[#1d1d1f] dark:hover:text-white'
            }`}
          >
            <ListFilter className="w-3.5 h-3.5" />
            <span>등록된 문서 ({user_chunks.length}건)</span>
          </button>
        </div>

        {/* 탭 컨텐츠 */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {success_message && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl flex items-center space-x-2 text-xs text-emerald-800 dark:text-emerald-300 font-semibold animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{success_message}</span>
            </div>
          )}

          {/* ============================================================== */}
          {/* 탭 1: 파일 업로드로 등록 */}
          {/* ============================================================== */}
          {active_tab === 'upload' && (
            <div className="space-y-4">
              {/* 드래그앤드롭 업로드 박스 */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  set_is_dragging(true);
                }}
                onDragLeave={() => set_is_dragging(false)}
                onDrop={handle_drop}
                onClick={() => file_input_ref.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all ${
                  is_dragging
                    ? 'border-[#0071e3] bg-[#0071e3]/5 dark:bg-[#0071e3]/10 scale-[0.99]'
                    : 'border-black/[0.1] dark:border-white/[0.1] hover:border-[#0071e3]/60 bg-[#fbfbfd] dark:bg-[#1c1c1e]'
                }`}
              >
                <input
                  ref={file_input_ref}
                  type="file"
                  accept=".pdf,.hwpx,.docx,.txt,.md,.csv,.json"
                  onChange={handle_file_change}
                  className="hidden"
                />

                {is_parsing ? (
                  <div className="py-4 space-y-2">
                    <Loader2 className="w-8 h-8 mx-auto text-[#0071e3] animate-spin" />
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">문서 텍스트 분석 및 키워드 추출 중...</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="w-12 h-12 rounded-full bg-[#0071e3]/10 dark:bg-[#0071e3]/20 text-[#0071e3] dark:text-[#2997ff] flex items-center justify-center mx-auto shadow-apple-sm">
                      <FileUp className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-bold text-[#1d1d1f] dark:text-white">
                      지침 문서 파일을 여기에 끌어다 놓거나 클릭하여 선택
                    </p>
                    <p className="text-xs text-[#86868b] dark:text-slate-400">
                      지원 포맷: PDF, HWPX, DOCX, TXT, Markdown, CSV, JSON
                    </p>
                  </div>
                )}
              </div>

              {/* 파싱된 문서 확인 및 수정 카드 */}
              {parsed_doc && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between pb-2 border-b border-black/[0.05]">
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-bold text-slate-800">
                        문서 분석 완료 ({parsed_doc.글자수.toLocaleString()}자 추출)
                      </span>
                    </div>
                    <span className="text-[11px] font-semibold text-[#0071e3] bg-[#0071e3]/10 px-2.5 py-0.5 rounded-full">
                      추론 분류: {분류}
                    </span>
                  </div>

                  {parsed_doc.깨짐_감지 && (
                    <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200/80 text-[11px] text-amber-800 flex items-start space-x-2">
                      <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div className="space-y-0.5 leading-relaxed">
                        <strong>HWP 바이너리/압축 포맷 감지:</strong> 한글 문서는 <strong>HWPX</strong> 또는 <strong>PDF</strong>로 저장 후 업로드하시면 100% 완전한 원문이 자동 추출됩니다. 현재 추출된 본문은 아래 입력창에서 자유롭게 편집·보완하여 등록하실 수 있습니다.
                      </div>
                    </div>
                  )}

                  {/* 메타데이터 입력/확인 폼 */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">문서명</label>
                      <input
                        type="text"
                        value={문서명}
                        onChange={(e) => set_문서명(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">분야 분류</label>
                      <select
                        value={분류}
                        onChange={(e) => set_분류(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs"
                      >
                        <option value="응급의료">응급의료</option>
                        <option value="분만취약지">분만취약지</option>
                        <option value="소아의료">소아의료</option>
                        <option value="성과평가">성과평가</option>
                        <option value="의사인력">의사인력</option>
                        <option value="시설기능보강">시설기능보강</option>
                        <option value="퇴원돌봄">퇴원돌봄</option>
                        <option value="사용자등록">기타 지침</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      자동 추출된 검색 키워드 (수정 가능)
                    </label>
                    <input
                      type="text"
                      value={핵심키워드}
                      onChange={(e) => set_핵심키워드(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      추출된 본문 미리보기 (RAG 검색 대상)
                    </label>
                    <textarea
                      rows={3}
                      value={본문}
                      onChange={(e) => set_본문(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-mono resize-none leading-relaxed"
                    />
                  </div>

                  <div className="pt-2 flex justify-end space-x-2">
                    <button
                      onClick={() => set_parsed_doc(null)}
                      className="px-3.5 py-1.5 text-xs rounded-xl bg-slate-200 text-slate-700 hover:bg-slate-300 transition"
                    >
                      다시 올리기
                    </button>
                    <button
                      onClick={handle_register_parsed_doc}
                      className="px-4 py-1.5 text-xs font-bold rounded-xl bg-[#0071e3] hover:bg-[#0077ed] text-white shadow-apple-sm transition flex items-center space-x-1.5"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>RAG 코퍼스에 즉시 등록</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* 탭 2: 직접 텍스트 작성 등록 */}
          {/* ============================================================== */}
          {active_tab === 'manual' && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handle_register_parsed_doc();
              }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between pb-1">
                <span className="text-xs text-[#86868b]">
                  지침/고시 전문의 세부 조항 또는 핵심 요강을 직접 입력하세요.
                </span>
                <button
                  type="button"
                  onClick={handle_fill_sample}
                  className="inline-flex items-center space-x-1 px-2.5 py-1 text-[11px] font-semibold text-[#0071e3] bg-[#0071e3]/10 hover:bg-[#0071e3]/20 rounded-lg transition"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>예시 데이터 채우기</span>
                </button>
              </div>

              {/* 1행: 문서명 & 조항 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#1d1d1f]">문서명 / 지침명 *</label>
                  <input
                    type="text"
                    required
                    value={문서명}
                    onChange={(e) => set_문서명(e.target.value)}
                    placeholder="예: 2026년 공공보건의료 협력사업 안내"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[#f5f5f7] border border-black/[0.06] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#1d1d1f]">조항 / 페이지</label>
                  <input
                    type="text"
                    value={조항_페이지}
                    onChange={(e) => set_조항_페이지(e.target.value)}
                    placeholder="예: 제3조(이송체계) 제2항 p.18"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[#f5f5f7] border border-black/[0.06] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30"
                  />
                </div>
              </div>

              {/* 2행: 분류 & 기준수치 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#1d1d1f]">분야 카테고리</label>
                  <select
                    value={분류}
                    onChange={(e) => set_분류(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[#f5f5f7] border border-black/[0.06] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30"
                  >
                    <option value="응급의료">응급의료</option>
                    <option value="분만취약지">분만취약지</option>
                    <option value="소아의료">소아의료</option>
                    <option value="성과평가">성과평가</option>
                    <option value="의사인력">의사인력</option>
                    <option value="시설기능보강">시설기능보강</option>
                    <option value="퇴원돌봄">퇴원돌봄</option>
                    <option value="사용자등록">기타 지침</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#1d1d1f]">핵심 기준 수치</label>
                  <input
                    type="text"
                    value={기준수치}
                    onChange={(e) => set_기준수치(e.target.value)}
                    placeholder="예: 30분 내 이송, 국비 50% 보조"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[#f5f5f7] border border-black/[0.06] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30"
                  />
                </div>
              </div>

              {/* 3행: 핵심 키워드 */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#1d1d1f]">
                  검색 핵심 키워드 (쉼표로 구분)
                </label>
                <input
                  type="text"
                  value={핵심키워드}
                  onChange={(e) => set_핵심키워드(e.target.value)}
                  placeholder="예: 닥터헬기, 이송시간, 영월의료원, 골든타임"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-[#f5f5f7] border border-black/[0.06] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30"
                />
              </div>

              {/* 4행: 본문 내용 */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#1d1d1f]">지침 본문 내용 *</label>
                <textarea
                  required
                  rows={4}
                  value={본문}
                  onChange={(e) => set_본문(e.target.value)}
                  placeholder="공공보건의료 지침 또는 고시 조항의 실제 문장을 복사하여 붙여넣으세요."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-[#f5f5f7] border border-black/[0.06] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30 resize-none font-mono"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={on_close}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-[#0071e3] hover:bg-[#0077ed] text-white shadow-apple-sm transition flex items-center space-x-1.5"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>RAG 코퍼스에 등록</span>
                </button>
              </div>
            </form>
          )}

          {/* ============================================================== */}
          {/* 탭 3: 내가 등록한 문서 목록 */}
          {/* ============================================================== */}
          {active_tab === 'list' && (
            <div className="space-y-3">
              {user_chunks.length === 0 ? (
                <div className="py-12 text-center text-xs text-[#86868b] space-y-2">
                  <BookOpen className="w-8 h-8 mx-auto text-slate-300" />
                  <p>직접 추가한 지침 문서가 아직 없습니다.</p>
                  <button
                    onClick={() => set_active_tab('upload')}
                    className="text-[#0071e3] font-semibold underline"
                  >
                    파일 업로드하여 등록하기
                  </button>
                </div>
              ) : (
                user_chunks.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#0071e3]/10 text-[#0071e3]">
                            {item.분류}
                          </span>
                          <strong className="text-slate-800 font-semibold">{item.문서명}</strong>
                        </div>
                        <span className="text-[#86868b] text-[11px] mt-0.5 block">
                          {item.조항_페이지} · 등록일: {item.생성일시 || '최근'}
                        </span>
                      </div>

                      <button
                        onClick={() => handle_delete(item.id)}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                        title="코퍼스에서 삭제"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-slate-700 bg-white p-2.5 rounded-xl border border-slate-100 text-[11px] leading-relaxed">
                      {item.본문}
                    </p>

                    <div className="flex flex-wrap items-center gap-1 text-[10px]">
                      <span className="text-slate-400">키워드:</span>
                      {item.핵심키워드.map((k, i) => (
                        <span key={i} className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">
                          #{k}
                        </span>
                      ))}
                      {item.기준수치 && (
                        <span className="ml-2 text-slate-600 font-medium">기준: {item.기준수치}</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
