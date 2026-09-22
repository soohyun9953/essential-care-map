'use client';

// 대국민 접점: 일반 국민·환자 맞춤형 공공의료 포털, E-Gen 실시간 응급실·소아병상 라이브 모니터링 & 모바일 퇴원돌봄 안심 알리미

import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Building2,
  Bell,
  Heart,
  MapPin,
  Calendar,
  Pill,
  MessageCircle,
  Send,
  Bot,
  User,
  Loader2,
  ChevronDown,
  Sparkles,
  X,
  Activity,
  BedDouble,
  Stethoscope,
  Phone,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Key,
  ExternalLink,
  Clock,
  Radio,
  Check,
  ShieldCheck,
} from 'lucide-react';
import { 필수의료_진단_결과 } from '@/lib/필수의료_타입';
import {
  get_nearest_public_hospital,
  공공의료기관_정보,
} from '@/lib/공공의료기관_데이터셋';
import { 실시간_응급실_기관정보 } from '@/lib/공공의료_자원_서비스';

interface 일반국민_뷰_속성 {
  selected_region?: 필수의료_진단_결과 | null;
  google_api_key?: string;
  data_go_kr_api_key?: string;
  on_open_data_modal?: () => void;
}

interface 채팅_메시지 {
  id: string;
  role: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

const CITIZEN_QUESTIONS = [
  '내 지역에서 24시간 응급실이 있는 공공병원은 어디인가요?',
  '지금 가장 가까운 응급실에 소아과나 성인 잔여 병상이 있나요?',
  '퇴원 후 보건소 방문간호 서비스를 받으려면 어떻게 해야 하나요?',
  '만성신부전 혈액투석을 받을 수 있는 관내 병원이 있나요?',
  '야간이나 휴일에 아이가 열이 날 때 갈 수 있는 소아과를 알려주세요',
  '어르신 무료 독감 예방접종 및 치매안심센터 서비스는 무엇이 있나요?',
  '119 구급차를 부를 때 공공의료원으로 이송해달라고 요청할 수 있나요?',
];

export const 일반국민_공공병원_맞춤뷰: React.FC<일반국민_뷰_속성> = ({
  selected_region,
  google_api_key = '',
  data_go_kr_api_key = '',
  on_open_data_modal,
}) => {
  // 실시간 E-Gen 응급실 병상 상태
  const [realtime_hospitals, set_realtime_hospitals] = useState<실시간_응급실_기관정보[]>([]);
  const [is_live_api, set_is_live_api] = useState<boolean>(false);
  const [data_source_label, set_data_source_label] = useState<string>('로딩 중...');
  const [last_sync_time, set_last_sync_time] = useState<string>('방금 전');
  const [is_refreshing, set_is_refreshing] = useState<boolean>(false);

  // 스마트폰 목업 탭: 'medication' (복약) | 'rehab' (방문재활) | 'emergency' (응급실 가이드)
  const [mobile_tab, set_mobile_tab] = useState<'medication' | 'rehab' | 'emergency'>('emergency');

  // AI 챗봇 상태
  const [chat_messages, set_chat_messages] = useState<채팅_메시지[]>([
    {
      id: 'welcome',
      role: 'ai',
      text: '안녕하세요! 국립중앙의료원 공공의료 AI 안심 안내 도우미입니다 😊\n\n실시간 응급실 가용병상 확인, 보건소 복지 혜택, 퇴원 후 방문돌봄, 진료과목 등 궁금하신 점을 편하게 질문해 주세요.',
      timestamp: new Date(),
    },
  ]);
  const [input_text, set_input_text] = useState('');
  const [is_generating, set_is_generating] = useState(false);
  const [is_chat_open, set_is_chat_open] = useState(false);
  const [selected_question, set_selected_question] = useState('');
  const chat_end_ref = useRef<HTMLDivElement>(null);

  const sido = selected_region?.시도명 ?? '강원특별자치도';
  const sigungu = selected_region?.시군구명 ?? '영월군';
  const sigungu_code = selected_region?.시군구코드 ?? '42750';

  // 1단계 실데이터: 214개 공공병원 매칭
  const matched = useMemo(() => {
    return get_nearest_public_hospital(sido, sigungu, sigungu_code);
  }, [sido, sigungu, sigungu_code]);

  const matched_hospital = matched.hospital;
  const is_local_hospital = matched.is_local;

  const short = sigungu.replace(/(특별자치시|광역시|특별시|자치시|시|군|구)$/, '').trim();
  const health_center_name = `${sigungu} 보건소 (만성질환·치매안심센터)`;
  const health_center_addr = `${sigungu} ${short}읍 보건소길 1`;

  // 실시간 E-Gen 응급의료 데이터 Fetch 함수
  const fetch_emergency_data = async () => {
    set_is_refreshing(true);
    try {
      const query_params = new URLSearchParams({
        sido,
        sigungu,
        serviceKey: data_go_kr_api_key || '',
      });

      const res = await fetch(`/api/emergency/realtime?${query_params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        set_realtime_hospitals(data.all_hospitals || []);
        set_is_live_api(data.is_live_api);
        set_data_source_label(data.source);
        set_last_sync_time(data.last_updated);
      }
    } catch (err) {
      console.warn('응급의료 데이터 로드 실패:', err);
    } finally {
      set_is_refreshing(false);
    }
  };

  useEffect(() => {
    fetch_emergency_data();
  }, [sido, sigungu, data_go_kr_api_key]);

  useEffect(() => {
    chat_end_ref.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat_messages]);

  // AI 질의응답 전송
  const handle_send = async () => {
    const query = input_text.trim();
    if (!query || is_generating) return;

    const user_msg: 채팅_메시지 = {
      id: `u_${Date.now()}`,
      role: 'user',
      text: query,
      timestamp: new Date(),
    };

    set_chat_messages((prev) => [...prev, user_msg]);
    set_input_text('');
    set_is_generating(true);

    try {
      const res = await fetch('/api/llm/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `일반 국민 또는 환자 보호자의 질문: "${query}". \n질문 지역: ${sido} ${sigungu}. 관내 거점병원: ${matched_hospital.기관명}(${matched_hospital.그룹}). 국민이 이해하기 쉽도록 친절하고 명확하게 안내해줘.`,
          google_api_key: google_api_key || '',
          region_name: `${sido} ${sigungu}`,
          mode: 'general_qa',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const ai_text =
          data.gemini?.response ||
          data.local_sllm?.response ||
          `${sigungu} 관내에서는 ${matched_hospital.기관명}에서 24시간 응급 진료를 이용하실 수 있습니다. 상세 진료 안내는 대표전화(${matched_hospital.대표전화})로 문의하시면 빠릅니다.`;

        const ai_msg: 채팅_메시지 = {
          id: `ai_${Date.now()}`,
          role: 'ai',
          text: ai_text,
          timestamp: new Date(),
        };
        set_chat_messages((prev) => [...prev, ai_msg]);
      } else {
        throw new Error('응답 실패');
      }
    } catch {
      const fallback_msg: 채팅_메시지 = {
        id: `ai_fallback_${Date.now()}`,
        role: 'ai',
        text: `[안내] ${sigungu} 거주 주민께서는 24시간 응급 진료가 가능한 ${matched_hospital.기관명}(대표전화: ${matched_hospital.대표전화}) 및 ${health_center_name}을 안심하고 이용하실 수 있습니다. 응급상황 시에는 즉시 119로 신고해 주십시오.`,
        timestamp: new Date(),
      };
      set_chat_messages((prev) => [...prev, fallback_msg]);
    } finally {
      set_is_generating(false);
    }
  };

  const get_status_style = (status: 실시간_응급실_기관정보['포화도_상태']) => {
    switch (status) {
      case '여유':
        return 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
      case '보통':
        return 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 border-blue-200 dark:border-blue-800';
      case '혼잡':
        return 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 border-amber-200 dark:border-amber-800';
      case '포화':
        return 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 border-rose-200 dark:border-rose-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* ============================================================== */}
      {/* 1. 상단 타이틀 & 실시간 E-Gen 상태 바 */}
      {/* ============================================================== */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-100 dark:border-rose-900/50 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
              국립중앙의료원 E-Gen 라이브 안전망
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-2xs font-semibold flex items-center gap-1 border ${
                is_live_api
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200'
              }`}
            >
              <Radio className="w-3 h-3" />
              {is_live_api ? '공공데이터포털 실시간 OpenAPI 연동' : '안심 시뮬레이션 모드'}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            우리 동네 공공병원 실시간 안심 포털{' '}
            <span className="text-blue-600 dark:text-blue-400 font-medium text-base sm:text-lg">
              ({sido} {sigungu})
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            24시간 응급실 잔여 병상, 소아과 야간 진료, 최신 의료장비 가동 현황 및 퇴원환자 방문돌봄 연계를 안내합니다.
          </p>
        </div>

        {/* 새로고침 및 API 키 설정 */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="text-right text-2xs text-slate-400 hidden sm:block">
            <span>동기화: {last_sync_time}</span>
          </div>
          <button
            onClick={fetch_emergency_data}
            disabled={is_refreshing}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-all cursor-pointer disabled:opacity-50"
            title="실시간 병상 새로고침"
          >
            <RefreshCw className={`w-4 h-4 ${is_refreshing ? 'animate-spin' : ''}`} />
          </button>
          {!data_go_kr_api_key && on_open_data_modal && (
            <button
              onClick={on_open_data_modal}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Key className="w-3.5 h-3.5" />
              공공데이터 키 입력
            </button>
          )}
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. [신규] 실시간 응급실 & 소아병상 가용 현황 그리드 (E-Gen Live) */}
      {/* ============================================================== */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-rose-500" />
            실시간 응급실 &amp; 필수병상 가용 모니터링 (국립중앙의료원 E-Gen)
          </h3>
          <span className="text-2xs text-slate-400">
            출처: {data_source_label}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {realtime_hospitals.slice(0, 2).map((hospital, idx) => {
            const is_local = idx === 0;
            return (
              <div
                key={hospital.기관코드}
                className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-100 dark:border-slate-800 shadow-sm space-y-4 relative overflow-hidden"
              >
                {/* 병원 헤더 */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-2xs font-bold px-2 py-0.5 rounded-full ${
                          is_local
                            ? 'bg-blue-600 text-white'
                            : 'bg-purple-600 text-white'
                        }`}
                      >
                        {is_local ? '관내 책임공공병원' : '광역 권역응급센터 (이송 연계)'}
                      </span>
                      <span className="text-2xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {hospital.응급실_구분}
                      </span>
                    </div>
                    <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                      {hospital.기관명}
                    </h4>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" />
                      {hospital.주소}
                    </p>
                  </div>

                  {/* 포화도 뱃지 */}
                  <div className="text-right shrink-0">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${get_status_style(
                        hospital.포화도_상태
                      )}`}
                    >
                      <span className="w-2 h-2 rounded-full bg-current animate-ping" />
                      {hospital.포화도_상태}
                    </span>
                    <span className="text-2xs text-slate-400 block mt-1">
                      {hospital.최종_업데이트}
                    </span>
                  </div>
                </div>

                {/* 4대 가용병상 카운터 */}
                <div className="grid grid-cols-4 gap-2 text-center bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200/70 dark:border-slate-700/70">
                  <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                    <span className="text-2xs text-slate-400 block font-semibold">일반 응급실</span>
                    <strong className="text-base sm:text-lg font-extrabold text-blue-600 dark:text-blue-400">
                      {hospital.응급실_가용병상}
                      <span className="text-2xs font-normal text-slate-400 ml-0.5">석</span>
                    </strong>
                  </div>

                  <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                    <span className="text-2xs text-slate-400 block font-semibold">소아 전용</span>
                    <strong className={`text-base sm:text-lg font-extrabold ${hospital.소아_가용병상 > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                      {hospital.소아_가용병상 > 0 ? `${hospital.소아_가용병상}석` : '0석'}
                    </strong>
                  </div>

                  <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                    <span className="text-2xs text-slate-400 block font-semibold">중환자실(ICU)</span>
                    <strong className="text-base sm:text-lg font-extrabold text-purple-600 dark:text-purple-400">
                      {hospital.중환자실_가용병상}
                      <span className="text-2xs font-normal text-slate-400 ml-0.5">석</span>
                    </strong>
                  </div>

                  <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                    <span className="text-2xs text-slate-400 block font-semibold">음압 격리</span>
                    <strong className="text-base sm:text-lg font-extrabold text-indigo-600 dark:text-indigo-400">
                      {hospital.음압격리_가용병상}
                      <span className="text-2xs font-normal text-slate-400 ml-0.5">석</span>
                    </strong>
                  </div>
                </div>

                {/* 첨단 응급 장비 가동 상태 */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <span className="text-2xs font-semibold text-slate-400">
                    주요 장비 가동:
                  </span>
                  <div className="flex items-center gap-2 text-2xs font-medium">
                    <span className={`px-2 py-0.5 rounded-md flex items-center gap-1 ${hospital.장비가동상태.CT ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-slate-100 text-slate-400'}`}>
                      CT {hospital.장비가동상태.CT ? '🟢' : '⚪'}
                    </span>
                    <span className={`px-2 py-0.5 rounded-md flex items-center gap-1 ${hospital.장비가동상태.MRI ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-slate-100 text-slate-400'}`}>
                      MRI {hospital.장비가동상태.MRI ? '🟢' : '⚪'}
                    </span>
                    <span className={`px-2 py-0.5 rounded-md flex items-center gap-1 ${hospital.장비가동상태.인공호흡기 ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-slate-100 text-slate-400'}`}>
                      인공호흡기 {hospital.장비가동상태.인공호흡기 ? '🟢' : '⚪'}
                    </span>
                    <span className={`px-2 py-0.5 rounded-md flex items-center gap-1 ${hospital.장비가동상태.인큐베이터 ? 'bg-pink-50 text-pink-700 dark:bg-pink-950/60 dark:text-pink-300' : 'bg-slate-100 text-slate-400'}`}>
                      인큐베이터 {hospital.장비가동상태.인큐베이터 ? '🟢' : '⚪'}
                    </span>
                  </div>

                  {/* 전화 바로걸기 */}
                  <a
                    href={`tel:${hospital.전화번호}`}
                    className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-300 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    {hospital.전화번호}
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. 관내 보건기관 정보 및 스마트폰 목업 시뮬레이터 (2열 그리드) */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* 좌측 7 cols: 책임 공공병원 상세 및 보건소 혜택 안내 */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
            <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-500" />
              {sigungu} 공식 공공의료기관 &amp; 보건기관 정보
            </h4>

            {/* 공공병원 상세 */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-2xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300">
                    지역책임의료기관
                  </span>
                  <h5 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                    {matched_hospital.기관명}
                  </h5>
                  <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {matched_hospital.시도명} {matched_hospital.시군구명}{' '}
                    {is_local_hospital ? '(관내 위치)' : `(인접 ${matched_hospital.진료권명} 진료권 거점)`}
                  </p>
                </div>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  24시간 응급실 운영
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 text-xs">
                <div>
                  <span className="text-2xs text-slate-400 block font-semibold">인가 병상규모</span>
                  <strong className="text-slate-800 dark:text-slate-200">
                    {matched_hospital.병상수 > 0 ? `${matched_hospital.병상수}병상` : '외래 전담'}
                  </strong>
                </div>
                <div>
                  <span className="text-2xs text-slate-400 block font-semibold">기관 유형</span>
                  <strong className="text-blue-600 dark:text-blue-400">
                    {matched_hospital.그룹} ({matched_hospital.기관구분})
                  </strong>
                </div>
                <div>
                  <span className="text-2xs text-slate-400 block font-semibold">대표 전화</span>
                  <strong className="text-slate-800 dark:text-slate-200">
                    {matched_hospital.대표전화}
                  </strong>
                </div>
              </div>
            </div>

            {/* 보건소 카드 */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70 space-y-2.5">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-2xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                    공공보건기관
                  </span>
                  <h5 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                    {health_center_name}
                  </h5>
                  <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {health_center_addr}
                  </p>
                </div>
                <span className="text-2xs font-semibold text-slate-500">
                  평일 09:00 ~ 18:00
                </span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800 leading-relaxed">
                💡 <strong>군민 무료 혜택:</strong> 65세 이상 어르신 무료 독감 예방접종, 고혈압·당뇨 만성질환 등록관리, 치매 선별검사, 거동불편 환자 방문건강관리팀 정기 순회
              </p>
            </div>
          </div>
        </div>

        {/* 우측 5 cols: 모바일 퇴원돌봄 안심 알리미 스마트폰 목업 */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-purple-500" />
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                모바일 안심 알리미 시뮬레이터
              </h4>
            </div>
            <span className="text-2xs text-slate-400">카카오 알림톡 화면</span>
          </div>

          {/* 3대 모바일 탭 */}
          <div className="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-2xs font-semibold">
            <button
              onClick={() => set_mobile_tab('emergency')}
              className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                mobile_tab === 'emergency' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs' : 'text-slate-500'
              }`}
            >
              🚨 응급실 체크
            </button>
            <button
              onClick={() => set_mobile_tab('medication')}
              className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                mobile_tab === 'medication' ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs' : 'text-slate-500'
              }`}
            >
              💊 복약 알림
            </button>
            <button
              onClick={() => set_mobile_tab('rehab')}
              className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                mobile_tab === 'rehab' ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-400 shadow-xs' : 'text-slate-500'
              }`}
            >
              🩺 방문재활
            </button>
          </div>

          {/* 스마트폰 프레임 목업 */}
          <div className="bg-slate-950 text-white p-4 rounded-3xl space-y-3 border border-slate-800 shadow-xl max-w-sm mx-auto">
            <div className="flex items-center justify-between text-2xs text-slate-400 pb-2 border-b border-slate-800">
              <span>오전 09:30</span>
              <span>5G 100% 🔋</span>
            </div>

            {/* 탭 1: 응급실 방문 전 체크카드 */}
            {mobile_tab === 'emergency' && (
              <div className="bg-slate-900 p-3.5 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-rose-400">
                  <span className="flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5" />
                    [응급실 방문 전 안심체크]
                  </span>
                  <span className="text-2xs text-slate-400">실시간</span>
                </div>
                <h6 className="text-xs font-bold text-white">
                  {matched_hospital.기관명} 응급실 안내
                </h6>
                <div className="text-2xs text-slate-300 space-y-1 leading-relaxed">
                  <p>• 현재 일반 응급실 가용: <strong>3석 잔여 (혼잡도: 보통)</strong></p>
                  <p>• 지참물: 신분증(모바일 신분증 가능), 복용 중인 약 처방전</p>
                  <p>• 중증 환자 우선 진료 체계(KTAS) 적용 중</p>
                </div>
                <div className="pt-2 border-t border-slate-800 flex justify-between text-2xs text-slate-400">
                  <span>응급실 직통: {matched_hospital.대표전화}</span>
                  <span className="text-rose-400 font-bold">긴급 시 119</span>
                </div>
              </div>
            )}

            {/* 탭 2: 복약 알림톡 */}
            {mobile_tab === 'medication' && (
              <div className="bg-slate-900 p-3.5 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-400">
                  <span className="flex items-center gap-1.5">
                    <Pill className="w-3.5 h-3.5" />
                    [공공의료 복약 안심 알림]
                  </span>
                  <span className="text-2xs text-slate-400">오늘 아침</span>
                </div>
                <h6 className="text-xs font-bold text-white">
                  김공공 어르신, 아침 약 복용 시간입니다
                </h6>
                <p className="text-2xs text-slate-300 leading-relaxed">
                  혈압약 및 뇌혈관 2차 예방약 1포를 식후 30분 이내 따뜻한 물과 함께 복용해 주세요.
                </p>
                <div className="pt-2 border-t border-slate-800 text-2xs text-slate-400">
                  담당: {health_center_name} 만성질환관리팀
                </div>
              </div>
            )}

            {/* 탭 3: 방문재활 돌봄 */}
            {mobile_tab === 'rehab' && (
              <div className="bg-slate-900 p-3.5 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-purple-400">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    [방문재활 순회 예약 안내]
                  </span>
                  <span className="text-2xs text-slate-400">내일 14:00</span>
                </div>
                <h6 className="text-xs font-bold text-white">
                  전담 물리치료사 댁내 방문 예정
                </h6>
                <p className="text-2xs text-slate-300 leading-relaxed">
                  퇴원환자 하지 근력강화 보행운동 및 가정 내 낙상 위험요소 점검이 진행됩니다.
                </p>
                <div className="pt-2 border-t border-slate-800 text-2xs text-slate-400">
                  {matched_hospital.기관명} 공공의료협력팀 연계
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 4. 일반국민 공공의료 AI 안심 도우미 (챗봇 연동) */}
      {/* ============================================================== */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <button
          onClick={() => set_is_chat_open((prev) => !prev)}
          className="w-full p-5 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                  AI Q&amp;A
                </span>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  일반국민 공공의료 AI 안심 질의응답
                </h4>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                응급실, 보건소 복지 혜택, 퇴원 돌봄 등 무엇이든 질문해 보세요
              </p>
            </div>
          </div>
          <ChevronDown
            className={`w-5 h-5 text-slate-400 transition-transform ${
              is_chat_open ? 'rotate-180' : ''
            }`}
          />
        </button>

        {is_chat_open && (
          <div className="p-5 border-t border-slate-100 dark:border-slate-800 space-y-4">
            {/* 추천 질문 선택 드롭다운 */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300 shrink-0">
                추천 질문:
              </span>
              <select
                value={selected_question}
                onChange={(e) => {
                  set_selected_question(e.target.value);
                  set_input_text(e.target.value);
                }}
                className="w-full text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="">-- 자주 묻는 질문을 선택하세요 --</option>
                {CITIZEN_QUESTIONS.map((q, idx) => (
                  <option key={idx} value={q}>
                    {q}
                  </option>
                ))}
              </select>
            </div>

            {/* 채팅 메시지 목록 */}
            <div className="bg-slate-50 dark:bg-slate-950/50 p-4 rounded-2xl max-h-80 overflow-y-auto space-y-3 text-xs border border-slate-100 dark:border-slate-800/80">
              {chat_messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 ${
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {msg.role === 'ai' && (
                    <div className="w-7 h-7 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                  )}
                  <div
                    className={`p-3 rounded-2xl max-w-[80%] whitespace-pre-wrap leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white rounded-tr-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-700 rounded-tl-xs shadow-2xs'
                    }`}
                  >
                    {msg.text}
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-7 h-7 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center shrink-0">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              ))}
              {is_generating && (
                <div className="flex items-center gap-2 text-slate-400 text-xs">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                  <span>공공의료 AI가 답변을 작성하고 있습니다...</span>
                </div>
              )}
              <div ref={chat_end_ref} />
            </div>

            {/* 입력창 */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input_text}
                onChange={(e) => set_input_text(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handle_send();
                  }
                }}
                placeholder="궁금한 공공의료 서비스나 응급실 정보를 입력하세요..."
                className="flex-1 px-4 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              <button
                onClick={handle_send}
                disabled={is_generating || !input_text.trim()}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all disabled:opacity-40 flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                질문하기
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
