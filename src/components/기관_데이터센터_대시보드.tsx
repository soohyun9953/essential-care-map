'use client';

import React, { useState, useMemo } from 'react';
import {
  Building2,
  Database,
  Activity,
  Bed,
  Users,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  FileText,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Clock,
  Sparkles,
  ChevronRight,
  TrendingUp,
  X,
  Send,
  Check,
} from 'lucide-react';
import {
  전체_공공의료기관_상세목록,
  공공의료기관_상세_프로필,
} from '@/lib/의료서비스_검색_엔진';

export const 기관_데이터센터_대시보드: React.FC = () => {
  // 선택된 기관 (기본값: 첫 번째 공공병원 - 서울대학교병원 또는 영월의료원)
  const default_hospital = useMemo(() => {
    return (
      전체_공공의료기관_상세목록.find((h) => h.기관명.includes('영월의료원')) ||
      전체_공공의료기관_상세목록[0]
    );
  }, []);

  const [selected_hospital, setSelected_hospital] = useState<공공의료기관_상세_프로필>(default_hospital);

  // 모달 상태
  const [is_report_modal_open, setIs_report_modal_open] = useState(false);
  const [is_detail_view_open, setIs_detail_view_open] = useState(false);
  const [is_refreshing, setIs_refreshing] = useState(false);
  const [refresh_success, setRefresh_success] = useState(false);

  // 오류 신고 폼 상태
  const [report_category, setReport_category] = useState<'병상' | '응급실' | '인력' | '운영상태' | '기타'>('병상');
  const [report_content, setReport_content] = useState('');
  const [report_submitted, setReport_submitted] = useState(false);

  // 실시간 갱신 시뮬레이션
  const handle_request_refresh = () => {
    setIs_refreshing(true);
    setTimeout(() => {
      setIs_refreshing(false);
      setRefresh_success(true);
      setTimeout(() => setRefresh_success(false), 3000);
    }, 1200);
  };

  const handle_submit_report = (e: React.FormEvent) => {
    e.preventDefault();
    setReport_submitted(true);
    setTimeout(() => {
      setReport_submitted(false);
      setIs_report_modal_open(false);
      setReport_content('');
    }, 1500);
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6 md:py-8 space-y-6 animate-in fade-in duration-200">
      {/* ============================================================== */}
      {/* 1. 상단 기관 선택기 & 데이터센터 타이틀 헤더 */}
      {/* ============================================================== */}
      <div className="bg-white dark:bg-[#12141a] rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                기관 담당자 전용
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                실시간 연계 상태 정상
              </span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
              <Database className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              기관 데이터센터 (Data Center Dashboard)
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              소속 의료기관의 병상·인력·응급실 가동 현황, 데이터 품질 및 전산 동기화 상태를 모니터링하고 오류를 관리합니다.
            </p>
          </div>

          {/* 기관 전환 드롭다운 */}
          <div className="flex items-center gap-2 shrink-0">
            <Building2 className="w-4 h-4 text-slate-400" />
            <select
              value={selected_hospital.id}
              onChange={(e) => {
                const found = 전체_공공의료기관_상세목록.find((h) => h.id === e.target.value);
                if (found) setSelected_hospital(found);
              }}
              className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {전체_공공의료기관_상세목록.map((h) => (
                <option key={h.id} value={h.id}>
                  [{h.시도명}] {h.기관명} ({h.기관유형})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 3대 액션 버튼 툴바: [데이터 상세] [오류 신고] [데이터 갱신 요청] */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <Clock className="w-3.5 h-3.5" />
            <span>최종 동기화 시각: <strong>2026.09.23 09:32</strong> (자동 수집 정상)</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIs_detail_view_open(!is_detail_view_open)}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              <span>{is_detail_view_open ? '데이터 상세 닫기' : '데이터 상세'}</span>
            </button>

            <button
              onClick={() => setIs_report_modal_open(true)}
              className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-bold transition flex items-center gap-1.5"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>오류 신고</span>
            </button>

            <button
              onClick={handle_request_refresh}
              disabled={is_refreshing}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${is_refreshing ? 'animate-spin' : ''}`} />
              <span>{refresh_success ? '갱신 완료!' : '데이터 갱신 요청'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. 데이터 품질 현황 KPI & 정상/오류 상태 바 */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 데이터 품질 상태 */}
        <div className="bg-white dark:bg-[#12141a] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-semibold">데이터 품질 지수</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
              우수
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            정상 96%
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <span className="text-amber-600 font-semibold">미갱신 2%</span>
            <span>•</span>
            <span className="text-rose-600 font-semibold">오류 의심 2%</span>
          </div>
        </div>

        {/* 병상 가동률 */}
        <div className="bg-white dark:bg-[#12141a] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-semibold">병상 현황</span>
            <span className="text-blue-600 dark:text-blue-400 font-bold">
              가동률 {selected_hospital.의료자원.병상.가동률}%
            </span>
          </div>
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400">
            {selected_hospital.의료자원.병상.사용병상} / {selected_hospital.의료자원.병상.총병상}석
          </div>
          <p className="text-[11px] text-slate-400">
            실시간 가용 잔여 병상: <strong>{selected_hospital.의료자원.병상.가용병상}석</strong>
          </p>
        </div>

        {/* 응급실 현황 */}
        <div className="bg-white dark:bg-[#12141a] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-semibold">응급실 상태</span>
            <span className="text-rose-600 dark:text-rose-400 font-bold">
              {selected_hospital.의료자원.응급실.상태}
            </span>
          </div>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400">
            가용 {selected_hospital.의료자원.응급실.가용병상}석
          </div>
          <p className="text-[11px] text-slate-400">
            소아 전용 가용: <strong>{selected_hospital.의료자원.응급실.소아가용병상}석</strong>
          </p>
        </div>

        {/* 의료인력 충원율 */}
        <div className="bg-white dark:bg-[#12141a] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-semibold">의료인력 충원율</span>
            <span className="text-purple-600 dark:text-purple-400 font-bold">
              {selected_hospital.의료자원.의료인력.충원율}%
            </span>
          </div>
          <div className="text-2xl font-black text-purple-600 dark:text-purple-400">
            전문의 {selected_hospital.의료자원.의료인력.전문의수}명
          </div>
          <p className="text-[11px] text-slate-400">
            전체의사 {selected_hospital.의료자원.의료인력.전체의사수}명 / 간호사 {selected_hospital.의료자원.의료인력.간호사수}명
          </p>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. 의료자원 상세 모니터링 매트릭스 */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* 1) 중환자실 & 수술실 현황 */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#12141a] border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-rose-500" />
            중환자실(ICU) 및 수술실(OR)
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900">
              <span className="text-slate-500">중환자실 총 병상:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{selected_hospital.의료자원.중환자실.총병상}석</span>
            </div>
            <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900">
              <span className="text-slate-500">실시간 가용 중환자실:</span>
              <span className="font-bold text-emerald-600">{selected_hospital.의료자원.중환자실.가용병상}석 잔여</span>
            </div>
            <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900">
              <span className="text-slate-500">정규 수술실 가동:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{selected_hospital.의료자원.수술실.가동실} / {selected_hospital.의료자원.수술실.총실}실</span>
            </div>
          </div>
        </div>

        {/* 2) 주요 장비 가동률 */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#12141a] border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            핵심 정밀 의료장비 상태
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900">
              <span className="text-slate-500">전산화단층촬영(CT):</span>
              <span className="font-bold text-emerald-600">{selected_hospital.의료자원.주요장비.CT ? '정상 가동' : '미보유'}</span>
            </div>
            <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900">
              <span className="text-slate-500">자기공명영상(MRI):</span>
              <span className="font-bold text-emerald-600">{selected_hospital.의료자원.주요장비.MRI ? '정상 가동' : '미보유'}</span>
            </div>
            <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900">
              <span className="text-slate-500">인공신장 혈액투석기:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{selected_hospital.의료자원.주요장비.혈액투석기}대 가동 중</span>
            </div>
          </div>
        </div>

        {/* 3) 데이터 갱신 및 연계 품질 */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#12141a] border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-500" />
            전산망 연계 주기 &amp; 프로토콜
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900">
              <span className="text-slate-500">연계 데이터 소스:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">원내 OCS/EMR 및 심평원</span>
            </div>
            <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900">
              <span className="text-slate-500">응급실 가용병상 갱신:</span>
              <span className="font-bold text-blue-600">5분 주기 (실시간)</span>
            </div>
            <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900">
              <span className="text-slate-500">입원병상·인력 공시:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">일 1회 (자정 정산)</span>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 4. 데이터 상세 뷰어 (아코디언 토글) */}
      {/* ============================================================== */}
      {is_detail_view_open && (
        <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              원천 수집 데이터 로그 및 필드 매핑 내역
            </h4>
            <span className="text-xs text-slate-400">기관 ID: {selected_hospital.id}</span>
          </div>
          <div className="font-mono text-xs text-slate-700 dark:text-slate-300 space-y-1 bg-white dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 overflow-x-auto">
            <div>• AGENCY_NAME: {selected_hospital.기관명}</div>
            <div>• AGENCY_TYPE: {selected_hospital.기관유형}</div>
            <div>• REGION_CODE: {selected_hospital.시도명} {selected_hospital.시군구명} ({selected_hospital.진료권명})</div>
            <div>• TOTAL_BEDS: {selected_hospital.의료자원.병상.총병상} | OCCUPIED: {selected_hospital.의료자원.병상.사용병상} | AVAILABLE: {selected_hospital.의료자원.병상.가용병상}</div>
            <div>• ER_CAPACITY: {selected_hospital.의료자원.응급실.가용병상} | STATUS: {selected_hospital.의료자원.응급실.상태}</div>
            <div>• DOCTORS_TOTAL: {selected_hospital.의료자원.의료인력.전체의사수} | SPECIALISTS: {selected_hospital.의료자원.의료인력.전체의사수}</div>
            <div>• SYNC_TIMESTAMP: 2026-09-23T09:32:00Z | ERROR_FLAG: 0</div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 5. 오류 신고 팝업 모달 */}
      {/* ============================================================== */}
      {is_report_modal_open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-[#12141a] rounded-3xl p-6 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  의료데이터 오류 신고 및 정정 요청
                </h3>
              </div>
              <button
                onClick={() => setIs_report_modal_open(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {report_submitted ? (
              <div className="py-8 text-center space-y-2 text-emerald-600">
                <CheckCircle2 className="w-12 h-12 mx-auto" />
                <p className="font-bold text-sm">오류 신고가 정상 접수되었습니다.</p>
                <p className="text-xs text-slate-400">데이터 검증 센터에서 1시간 이내 확인 후 반영됩니다.</p>
              </div>
            ) : (
              <form onSubmit={handle_submit_report} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">대상 기관</label>
                  <input
                    type="text"
                    disabled
                    value={selected_hospital.기관명}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">오류 항목 분류</label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {(['병상', '응급실', '인력', '운영상태', '기타'] as const).map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setReport_category(cat)}
                        className={`py-1.5 rounded-lg font-bold border transition ${
                          report_category === cat
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">정정 요청 상세 내용</label>
                  <textarea
                    rows={4}
                    required
                    value={report_content}
                    onChange={(e) => setReport_content(e.target.value)}
                    placeholder="예: 실제 가용 병상은 5석이나 시스템에는 1석으로 표기되어 있습니다. 즉시 정정 바랍니다."
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIs_report_modal_open(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold"
                  >
                    신고서 제출
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
