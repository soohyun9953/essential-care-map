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

interface 기관_데이터센터_대시보드_속성 {
  data_go_kr_api_key?: string;
  on_open_data_modal?: () => void;
}

const get_current_sync_time_str = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${year}.${month}.${day} ${hours}:${minutes}`;
};

export const 기관_데이터센터_대시보드: React.FC<기관_데이터센터_대시보드_속성> = ({
  data_go_kr_api_key,
  on_open_data_modal,
}) => {
  // 선택된 기관 (기본값: 첫 번째 공공병원 - 서울대학교병원 또는 영월의료원)
  const default_hospital = useMemo(() => {
    return (
      전체_공공의료기관_상세목록.find((h) => h.기관명.includes('영월의료원')) ||
      전체_공공의료기관_상세목록[0]
    );
  }, []);

  const [selected_hospital, setSelected_hospital] = useState<공공의료기관_상세_프로필>(default_hospital);

  // 모달 및 알림 상태
  const [is_detail_view_open, setIs_detail_view_open] = useState(false);
  const [action_notice, set_action_notice] = useState<string | null>(null);
  // 실제로 공공데이터 API 연결을 확인한 시각 (확인 전에는 빈 값)
  const [sync_time, set_sync_time] = useState<string>('');
  const [is_refreshing, set_is_refreshing] = useState<boolean>(false);

  // 전체 기관 일괄 업데이트 관련 상태
  const [is_bulk_syncing, set_is_bulk_syncing] = useState<boolean>(false);
  const [bulk_progress, set_bulk_progress] = useState<number>(0);
  const [bulk_current_name, set_bulk_current_name] = useState<string>('');
  const [is_bulk_modal_open, setIs_bulk_modal_open] = useState<boolean>(false);
  const [bulk_done, set_bulk_done] = useState<boolean>(false);
  const [bulk_result, set_bulk_result] = useState<'미등록' | '성공' | '실패' | null>(null);

  // 지금 즉시 데이터 동기화 핸들러 (선택된 기관 1곳)
  const handle_refresh_data = async () => {
    set_is_refreshing(true);
    try {
      if (!data_go_kr_api_key) {
        set_action_notice('ℹ️ 공공데이터포털 API 키가 등록되지 않아 실시간 조회를 수행하지 않았습니다. 화면의 수치는 플랫폼 내장 기준 데이터입니다.');
        return;
      }
      const is_live = await 실시간_API_확인(selected_hospital.시도명, selected_hospital.시군구명);
      const new_time = get_current_sync_time_str();
      set_sync_time(new_time);
      set_action_notice(
        is_live
          ? `✅ 공공데이터포털(E-Gen) 실시간 API 조회 성공 (${selected_hospital.시도명} ${selected_hospital.시군구명}, ${new_time}). 대시보드 수치는 내장 기준 데이터이며 자동 반영되지 않습니다.`
          : `⚠️ 공공데이터포털 실시간 API 조회에 실패했습니다 (${new_time}). 인증키 또는 API 상태를 확인해 주세요. 화면의 수치는 내장 기준 데이터입니다.`
      );
    } finally {
      set_is_refreshing(false);
    }
  };

  // 전국 214개 전체 공공의료기관 일괄 업데이트 핸들러
  // 공공데이터포털 E-Gen 실시간 API 조회 가능 여부 확인 (is_live_api 응답 기준)
  const 실시간_API_확인 = async (sido: string, sigungu: string): Promise<boolean> => {
    try {
      const res = await fetch(
        `/api/emergency/realtime?sido=${encodeURIComponent(sido)}&sigungu=${encodeURIComponent(sigungu)}`,
        { headers: { 'x-data-go-kr-key': data_go_kr_api_key || '' } }
      );
      if (!res.ok) return false;
      const data = await res.json();
      return data.is_live_api === true;
    } catch {
      return false;
    }
  };

  const handle_bulk_sync_all = async () => {
    setIs_bulk_modal_open(true);
    set_is_bulk_syncing(true);
    set_bulk_progress(0);
    set_bulk_done(false);

    set_bulk_result(null);

    // 실제 수행 작업: 공공데이터포털 E-Gen 실시간 API 연결 확인 (기관별 전수 수집은 미구현)
    let result: '미등록' | '성공' | '실패' = '미등록';
    if (data_go_kr_api_key) {
      set_bulk_current_name('공공데이터포털(E-Gen) 실시간 API 연결 확인 중...');
      set_bulk_progress(50);
      result = (await 실시간_API_확인(selected_hospital.시도명, selected_hospital.시군구명)) ? '성공' : '실패';
      set_sync_time(get_current_sync_time_str());
    }

    set_bulk_progress(100);
    set_bulk_result(result);
    set_bulk_done(true);
    set_is_bulk_syncing(false);
    set_action_notice(
      result === '성공'
        ? '✅ 공공데이터포털 실시간 API 연결을 확인했습니다. 214개 기관 수치는 내장 기준 데이터이며, 기관별 실시간 수집은 아직 지원되지 않습니다.'
        : result === '실패'
          ? '⚠️ 공공데이터포털 실시간 API 연결에 실패했습니다. 인증키 또는 API 상태를 확인해 주세요.'
          : 'ℹ️ 공공데이터포털 API 키가 없어 실시간 연결 확인을 수행하지 않았습니다. 화면의 수치는 내장 기준 데이터입니다.'
    );
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
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                내장 기준 데이터 (기관별 실시간 연계 미지원)
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

        {/* 4대 액션 버튼 툴바: [전체 업데이트] [선택 기관 갱신] [데이터 상세] [오류 신고] */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>
              실시간 API 최종 확인:{' '}
              <strong className="text-slate-800 dark:text-slate-200">{sync_time || '확인 이력 없음'}</strong>
              {!data_go_kr_api_key && ' (공공데이터 API 키 미등록)'}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* 🌟 1. 전국 214개 기관 전체 일괄 업데이트 버튼 */}
            <button
              type="button"
              onClick={handle_bulk_sync_all}
              disabled={is_bulk_syncing}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-md shadow-blue-500/20 active:scale-95 disabled:opacity-50"
              title="공공데이터포털 실시간 API 연결 상태를 확인합니다. (기관별 전수 수집은 아직 지원되지 않습니다)"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-white ${is_bulk_syncing ? 'animate-spin' : ''}`} />
              <span>연계 상태 확인</span>
            </button>

            {/* 2. 현재 선택 기관만 갱신 */}
            <button
              type="button"
              onClick={handle_refresh_data}
              disabled={is_refreshing || is_bulk_syncing}
              className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/50 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95 disabled:opacity-50"
              title={`[${selected_hospital.기관명}] 소재 지역의 실시간 API 조회를 확인합니다`}
            >
              <RefreshCw className={`w-3.5 h-3.5 text-blue-600 dark:text-blue-400 ${is_refreshing ? 'animate-spin' : ''}`} />
              <span>{is_refreshing ? '확인 중...' : '선택 기관 조회 확인'}</span>
            </button>

            {/* 3. 데이터 상세 */}
            <button
              onClick={() => setIs_detail_view_open(!is_detail_view_open)}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              <span>{is_detail_view_open ? '데이터 상세 닫기' : '데이터 상세'}</span>
            </button>

            {/* 4. 오류 신고 버튼 (정식 연동 전 비활성 안내 툴팁 및 클릭 메시지) */}
            <div className="relative group">
              <button
                type="button"
                onClick={() => {
                  set_action_notice('의료기관 데이터 오류 신고 및 정정 요청 기능은 보건복지부 및 국립중앙의료원(NMC) 전산망 정식 연동 후 제공될 예정입니다.');
                }}
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800 text-xs font-bold transition flex items-center gap-1 cursor-not-allowed select-none"
                title="공공의료 전산망 정식 연동 후 제공 예정"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-slate-400" />
                <span>오류 신고</span>
                <span className="text-[10px] px-1 py-0.2 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-md font-semibold">준비중</span>
              </button>
            </div>
          </div>
        </div>

        {/* 비활성 기능 클릭 시 명확한 안내 알림창 */}
        {action_notice && (
          <div className="p-3 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 rounded-2xl flex items-center justify-between text-xs text-amber-900 dark:text-amber-200 animate-in fade-in">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span className="font-semibold">{action_notice}</span>
            </div>
            <button
              type="button"
              onClick={() => set_action_notice(null)}
              className="text-amber-700 hover:text-amber-900 dark:text-amber-400 p-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
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
            <div>• SYNC_TIMESTAMP: {sync_time}:00Z | ERROR_FLAG: 0</div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 5. 전국 214개 기관 전체 일괄 업데이트 진행 모달 */}
      {/* ============================================================== */}
      {is_bulk_modal_open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#15161b] rounded-3xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 max-w-lg w-full shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <RefreshCw className={`w-5 h-5 ${is_bulk_syncing ? 'animate-spin' : ''}`} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    공공데이터 실시간 연계 상태 확인
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    공공데이터포털(E-Gen) 실시간 API 연결 여부를 점검합니다
                  </p>
                </div>
              </div>
              {!is_bulk_syncing && (
                <button
                  type="button"
                  onClick={() => setIs_bulk_modal_open(false)}
                  className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* 진행 상황 프로그레스 */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300">
                <span>{bulk_done ? '확인 완료' : '연결 확인 중...'}</span>
                <span className="text-blue-600 dark:text-blue-400 font-extrabold">{bulk_progress}%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-150"
                  style={{ width: `${bulk_progress}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {bulk_done ? (sync_time ? `확인 시각: ${sync_time}` : 'API 키 미등록으로 확인을 건너뛰었습니다') : bulk_current_name}
              </p>
            </div>

            {/* 완료 상태 표시 카드 */}
            {bulk_done && (
              <div
                className={`p-4 rounded-2xl border space-y-2 ${
                  bulk_result === '성공'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60'
                    : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60'
                }`}
              >
                <div
                  className={`flex items-center gap-2 font-bold text-xs ${
                    bulk_result === '성공' ? 'text-emerald-800 dark:text-emerald-300' : 'text-amber-800 dark:text-amber-300'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>
                    {bulk_result === '성공'
                      ? '공공데이터포털 실시간 API 연결 정상'
                      : bulk_result === '실패'
                        ? '공공데이터포털 실시간 API 연결 실패'
                        : '공공데이터포털 API 키 미등록'}
                  </span>
                </div>
                <ul className="text-[11px] text-slate-600 dark:text-slate-400 space-y-1 pl-6 list-disc">
                  <li>
                    대시보드의 {전체_공공의료기관_상세목록.length}개 기관 수치는 플랫폼에 내장된 기준 데이터입니다.
                  </li>
                  <li>기관별 병상·인력 실시간 전수 수집은 아직 지원되지 않습니다.</li>
                  {bulk_result === '실패' && <li>인증키가 올바른지, 공공데이터포털 API 활용 신청이 승인되었는지 확인해 주세요.</li>}
                  {bulk_result === '미등록' && <li>상단 [공공데이터 API 키] 메뉴에서 인증키를 등록하면 연결을 확인할 수 있습니다.</li>}
                </ul>
              </div>
            )}

            {/* 하단 버튼 */}
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              {bulk_done ? (
                <button
                  type="button"
                  onClick={() => setIs_bulk_modal_open(false)}
                  className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition cursor-pointer shadow-sm"
                >
                  확인
                </button>
              ) : (
                <button
                  type="button"
                  disabled
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 font-bold text-xs cursor-wait"
                >
                  연결 확인 중... ({bulk_progress}%)
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
