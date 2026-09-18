'use client';

// 대국민 접점: 일반 국민·환자 맞춤형 공공의료 포털 및 모바일 퇴원돌봄 안심 알리미 뷰

import React, { useState, useRef, useEffect } from 'react';
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
} from 'lucide-react';
import { 필수의료_진단_결과 } from '@/lib/필수의료_타입';

interface 일반국민_뷰_속성 {
  selected_region?: 필수의료_진단_결과 | null;
  google_api_key?: string;
}

interface 채팅_메시지 {
  id: string;
  role: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

// 일반 국민용 추천 질문 목록
const CITIZEN_QUESTIONS = [
  '내 지역에서 24시간 응급실이 있는 공공병원은 어디인가요?',
  '퇴원 후 방문간호 서비스를 받으려면 어떻게 해야 하나요?',
  '야간에 소아과 진료를 받을 수 있는 곳을 알려주세요',
  '보건소에서 무료로 받을 수 있는 서비스는 무엇이 있나요?',
  '필수의료 취약지에 살고 있는데 응급상황 시 어떻게 해야 하나요?',
  '독감 예방접종을 무료로 받을 수 있는 대상자는 누구인가요?',
  '국립중앙의료원과 지역 공공병원의 차이가 무엇인가요?',
];

export const 일반국민_공공병원_맞춤뷰: React.FC<일반국민_뷰_속성> = ({
  selected_region,
  google_api_key = '',
}) => {
  const [chat_messages, set_chat_messages] = useState<채팅_메시지[]>([
    {
      id: 'welcome',
      role: 'ai',
      text: '안녕하세요! 공공의료 AI 안내 도우미입니다 😊\n\n공공병원 정보, 보건소 서비스, 퇴원 후 돌봄, 의료급여 등 궁금하신 것을 자유롭게 질문해 주세요.\n\n⬇️ 아래 추천 질문을 선택하거나 직접 입력하실 수 있습니다.',
      timestamp: new Date(),
    },
  ]);
  const [input_text, set_input_text] = useState('');
  const [is_generating, set_is_generating] = useState(false);
  const [is_chat_open, set_is_chat_open] = useState(false);
  const [selected_question, set_selected_question] = useState('');
  const chat_end_ref = useRef<HTMLDivElement>(null);

  const region_name = selected_region
    ? `${selected_region.시도명} ${selected_region.시군구명}`
    : '강원특별자치도 영월군';

  useEffect(() => {
    chat_end_ref.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat_messages]);

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
    set_selected_question('');
    set_is_generating(true);

    try {
      if (!google_api_key) {
        const no_key_msg: 채팅_메시지 = {
          id: `a_${Date.now()}`,
          role: 'ai',
          text: '⚠️ AI 기능을 사용하려면 우측 상단의 🔑 API 키 버튼을 눌러 Google Gemini API 키를 먼저 입력해 주세요.\n\nAPI 키는 [Google AI Studio](https://aistudio.google.com/)에서 무료로 발급받으실 수 있습니다.',
          timestamp: new Date(),
        };
        set_chat_messages((prev) => [...prev, no_key_msg]);
        return;
      }

      const region_context = selected_region
        ? `현재 선택된 지역: ${region_name} (응급 60분 미도달 인구비율: ${selected_region.응급_60분_미도달_인구비율}%, 취약도 등급: ${selected_region.종합_취약도_등급})`
        : `현재 선택된 지역: ${region_name}`;

      const res = await fetch('/api/llm/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          google_api_key,
          region_name,
          region_stats: region_context,
          rag_context: '',
          gemini_rag_context: '',
          local_rag_context: '',
          mode: 'citizen_qa',
          system_prompt_override: `당신은 일반 국민을 위한 공공의료 안내 AI 도우미입니다.
전문 용어보다 쉽고 친절한 말로 답변하세요.
공공병원, 보건소, 의료급여, 퇴원 후 돌봄, 방문간호, 응급의료 등 공공의료 분야의 질문에 답변합니다.
지역 정보: ${region_context}
답변은 간결하고 실용적으로, 필요 시 연락처나 이용 방법을 포함하세요.
한국어로 친절하게 답변하세요.`,
        }),
      });

      const data = await res.json();
      const ai_text =
        data?.google_gemini?.response ||
        data?.local_sllm?.response ||
        '죄송합니다. 답변을 생성하지 못했습니다. 잠시 후 다시 시도해 주세요.';

      const ai_msg: 채팅_메시지 = {
        id: `a_${Date.now()}`,
        role: 'ai',
        text: ai_text,
        timestamp: new Date(),
      };
      set_chat_messages((prev) => [...prev, ai_msg]);
    } catch (e) {
      const err_msg: 채팅_메시지 = {
        id: `a_${Date.now()}`,
        role: 'ai',
        text: '일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
        timestamp: new Date(),
      };
      set_chat_messages((prev) => [...prev, err_msg]);
    } finally {
      set_is_generating(false);
    }
  };

  const handle_key_down = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handle_send();
    }
  };

  const handle_select_question = (q: string) => {
    set_selected_question(q);
    set_input_text(q);
  };

  return (
    <div className="space-y-6">
      {/* 국민 뷰 히어로 배너 */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white p-5 sm:p-6 rounded-3xl shadow-apple-card space-y-3">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/20 text-xs font-bold backdrop-blur-md">
          <Heart className="w-3.5 h-3.5 fill-current" />
          <span>공공의료 안심동행 서비스</span>
        </div>
        <h3 className="text-lg sm:text-xl font-extrabold tracking-tight">
          내 주변 안심 공공병원과 퇴원 후 맞춤 돌봄을 연결합니다
        </h3>
        <p className="text-xs sm:text-sm text-white/90 max-w-3xl leading-relaxed font-medium">
          국민 누구나 내가 사는 지역의 믿을 수 있는 공공병원 정보, 심야 소아과 및 달빛어린이병원 위치,
          퇴원 후 보건소 방문간호와 도시락 돌봄 알림을 스마트폰 하나로 확인하세요.
        </p>
      </div>

      {/* 2단 구성: 공공병원 찾기 (좌) + 모바일 안심돌봄 알리미 시뮬레이터 (우) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* 좌측: 내 지역 안심 공공병원 목록 (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-[#15161b] p-5 sm:p-6 rounded-3xl border border-black/[0.05] dark:border-white/10 shadow-apple-card space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-black/[0.06] dark:border-white/10">
            <div className="flex items-center space-x-2">
              <Building2 className="w-4 h-4 text-[#0071e3]" />
              <h4 className="font-bold text-sm sm:text-base text-[#1d1d1f] dark:text-white">
                {region_name} 인근 공공의료기관 &amp; 안심 진료처
              </h4>
            </div>
            <span className="text-xs text-[#0071e3] dark:text-blue-400 font-bold bg-[#0071e3]/10 px-3 py-1 rounded-full">
              보건복지부 인증기관
            </span>
          </div>

          <div className="space-y-4">
            {/* 영월의료원 카드 */}
            <div className="p-4 rounded-2xl bg-[#fbfbfd] dark:bg-[#1e2027] border border-black/[0.05] dark:border-white/10 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#0071e3] text-white">
                      지역책임의료기관
                    </span>
                    <span className="text-sm font-bold text-[#1d1d1f] dark:text-white">
                      강원특별자치도 영월의료원
                    </span>
                  </div>
                  <p className="text-xs text-[#86868b] dark:text-slate-400 mt-1 flex items-center gap-1.5 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-[#86868b]" />
                    <span>영월군 영월읍 중앙로 59</span>
                  </p>
                </div>
                <span className="text-xs font-bold text-[#34c759] flex items-center gap-1.5 shrink-0">
                  <span className="w-2 h-2 rounded-full bg-[#34c759] animate-pulse" />
                  <span>24시간 응급실 운영</span>
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center bg-white dark:bg-[#15161b] p-3 rounded-xl border border-black/[0.05] dark:border-white/10">
                <div>
                  <span className="text-xs text-[#86868b] dark:text-slate-400 block font-semibold">간호간병통합</span>
                  <strong className="text-xs sm:text-sm text-[#1d1d1f] dark:text-white">전 병동 운영</strong>
                </div>
                <div>
                  <span className="text-xs text-[#86868b] dark:text-slate-400 block font-semibold">인공신장실</span>
                  <strong className="text-xs sm:text-sm text-[#0071e3] dark:text-blue-400">혈액투석 가능</strong>
                </div>
                <div>
                  <span className="text-xs text-[#86868b] dark:text-slate-400 block font-semibold">대표전화</span>
                  <strong className="text-xs sm:text-sm text-[#1d1d1f] dark:text-white">033-370-9114</strong>
                </div>
              </div>
            </div>

            {/* 영월군보건소 카드 */}
            <div className="p-4 rounded-2xl bg-[#fbfbfd] dark:bg-[#1e2027] border border-black/[0.05] dark:border-white/10 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                      공공보건기관
                    </span>
                    <span className="text-sm font-bold text-[#1d1d1f] dark:text-white">
                      영월군보건소 (만성질환·치매안심센터)
                    </span>
                  </div>
                  <p className="text-xs text-[#86868b] dark:text-slate-400 mt-1 flex items-center gap-1.5 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-[#86868b]" />
                    <span>영월군 영월읍 하송로 64</span>
                  </p>
                </div>
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300 shrink-0">
                  평일 09:00 ~ 18:00
                </span>
              </div>

              <p className="text-xs text-slate-700 dark:text-slate-200 bg-white dark:bg-[#15161b] p-3 rounded-xl border border-black/[0.05] dark:border-white/10 leading-relaxed font-medium">
                💡 <strong>주요 혜택:</strong> 65세 이상 어르신 무료 독감 예방접종, 고혈압·당뇨 등록관리, 거동불편 환자 방문건강관리 상담 상시 가능
              </p>
            </div>
          </div>
        </div>

        {/* 우측: 모바일 퇴원돌봄 안심 알리미 스마트폰 목업 시뮬레이터 (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-[#15161b] p-5 sm:p-6 rounded-3xl border border-black/[0.05] dark:border-white/10 shadow-apple-card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-black/[0.06] dark:border-white/10">
            <div className="flex items-center space-x-2">
              <Bell className="w-4 h-4 text-[#af52de]" />
              <h4 className="font-bold text-sm sm:text-base text-[#1d1d1f] dark:text-white">
                모바일 퇴원돌봄 안심 알리미
              </h4>
            </div>
            <span className="text-xs text-[#86868b] dark:text-slate-400 font-bold">스마트폰 화면 예시</span>
          </div>

          {/* 모바일 화면 프레임 */}
          <div className="bg-slate-900 text-white p-4 rounded-3xl space-y-3 shadow-2xl border border-slate-700 w-full max-w-md mx-auto">
            <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800 font-semibold">
              <span>오전 09:30</span>
              <span>5G 100%</span>
            </div>

            <div className="bg-slate-800/90 p-3 rounded-2xl border border-slate-700 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <Pill className="w-3.5 h-3.5" />
                  <span>[공공의료 안심케어 알림]</span>
                </span>
                <span className="text-xs text-slate-400">오늘</span>
              </div>
              <p className="text-xs font-bold text-white">김공공 어르신, 아침 약 복용 시간입니다</p>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                혈압약 및 뇌졸중 2차 예방약 1포를 식후 30분 이내 복용해 주세요.
              </p>
            </div>

            <div className="bg-slate-800/90 p-3 rounded-2xl border border-slate-700 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>[방문재활 안내]</span>
                </span>
                <span className="text-xs text-slate-400">내일 14:00</span>
              </div>
              <p className="text-xs font-bold text-white">영월군보건소 전담 물리치료사 방문 예정</p>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                우측 편마비 보행 재활운동 및 낙상방지 환경 점검이 예정되어 있습니다.
              </p>
            </div>

            <div className="bg-slate-800/90 p-3 rounded-2xl border border-slate-700 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5" />
                  <span>[생활돌봄 서비스]</span>
                </span>
                <span className="text-xs text-slate-400">오늘 11:30</span>
              </div>
              <p className="text-xs font-bold text-white">영월종합사회복지관 따뜻한 점심 도시락 배달</p>
            </div>

            <div className="pt-1 text-center">
              <span className="text-xs text-slate-400 font-semibold">
                국립중앙의료원 공공보건의료 통합알리미 발송
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ===================== AI 문의 섹션 ===================== */}
      <div className="bg-white dark:bg-[#15161b] rounded-3xl border border-black/[0.05] dark:border-white/10 shadow-apple-card overflow-hidden">
        {/* AI 문의 헤더 (클릭 시 열기/닫기) */}
        <button
          onClick={() => set_is_chat_open((v) => !v)}
          className="w-full flex items-center justify-between p-5 sm:p-6 hover:bg-[#f5f5f7]/50 dark:hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-sm">
              <MessageCircle className="w-4 h-4 text-white" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-[#1d1d1f] dark:text-white">
                  공공의료 AI 안내 도우미
                </span>
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Gemini AI
                </span>
              </div>
              <p className="text-xs text-[#86868b] dark:text-slate-400 mt-0.5">
                공공병원·보건소·퇴원돌봄 등 궁금한 것을 AI에게 물어보세요
              </p>
            </div>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-[#86868b] transition-transform duration-200 ${is_chat_open ? 'rotate-180' : ''}`}
          />
        </button>

        {/* AI 채팅 영역 */}
        {is_chat_open && (
          <div className="border-t border-black/[0.05] dark:border-white/10">
            {/* 추천 질문 드롭다운 */}
            <div className="px-5 pt-4 pb-2">
              <label className="block text-xs font-semibold text-[#86868b] dark:text-slate-400 mb-1.5">
                💡 추천 질문 선택
              </label>
              <div className="relative">
                <select
                  value={selected_question}
                  onChange={(e) => handle_select_question(e.target.value)}
                  className="w-full text-xs border border-black/[0.08] dark:border-white/10 rounded-xl px-3 py-2 bg-[#f5f5f7] dark:bg-[#1e2027] text-[#1d1d1f] dark:text-white appearance-none pr-8 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 cursor-pointer"
                >
                  <option value="">-- 자주 묻는 질문을 선택하세요 --</option>
                  {CITIZEN_QUESTIONS.map((q) => (
                    <option key={q} value={q}>{q}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#86868b] pointer-events-none" />
              </div>
            </div>

            {/* 채팅 메시지 영역 */}
            <div className="h-[320px] overflow-y-auto px-5 py-3 space-y-3">
              {chat_messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {/* 아바타 */}
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                      msg.role === 'ai'
                        ? 'bg-gradient-to-br from-emerald-500 to-teal-600'
                        : 'bg-gradient-to-br from-[#0071e3] to-[#34aadc]'
                    }`}
                  >
                    {msg.role === 'ai' ? (
                      <Bot className="w-3.5 h-3.5 text-white" />
                    ) : (
                      <User className="w-3.5 h-3.5 text-white" />
                    )}
                  </div>

                  {/* 말풍선 */}
                  <div
                    className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed whitespace-pre-wrap ${
                      msg.role === 'ai'
                        ? 'bg-[#f5f5f7] dark:bg-[#1e2027] text-[#1d1d1f] dark:text-white rounded-tl-sm'
                        : 'bg-[#0071e3] text-white rounded-tr-sm'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {/* 로딩 스피너 */}
              {is_generating && (
                <div className="flex gap-2.5 flex-row">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="bg-[#f5f5f7] dark:bg-[#1e2027] rounded-2xl rounded-tl-sm px-3.5 py-2.5 flex items-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 text-emerald-500 animate-spin" />
                    <span className="text-xs text-[#86868b]">AI가 답변을 작성 중입니다...</span>
                  </div>
                </div>
              )}
              <div ref={chat_end_ref} />
            </div>

            {/* 입력창 */}
            <div className="px-5 pb-5 pt-2 border-t border-black/[0.04] dark:border-white/10">
              <div className="flex gap-2 items-end">
                <div className="flex-1 relative">
                  <textarea
                    value={input_text}
                    onChange={(e) => set_input_text(e.target.value)}
                    onKeyDown={handle_key_down}
                    placeholder="공공병원·보건소·돌봄서비스에 대해 질문하세요... (Enter로 전송)"
                    rows={2}
                    className="w-full text-xs border border-black/[0.08] dark:border-white/10 rounded-xl px-3.5 py-2.5 bg-[#f5f5f7] dark:bg-[#1e2027] text-[#1d1d1f] dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/30 placeholder-[#86868b]"
                  />
                  {input_text && (
                    <button
                      onClick={() => { set_input_text(''); set_selected_question(''); }}
                      className="absolute right-2.5 top-2 text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <button
                  onClick={handle_send}
                  disabled={!input_text.trim() || is_generating}
                  className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                    input_text.trim() && !is_generating
                      ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm hover:shadow-md hover:scale-105 active:scale-95'
                      : 'bg-[#f5f5f7] dark:bg-[#1e2027] text-[#c7c7cc] cursor-not-allowed'
                  }`}
                >
                  {is_generating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </div>
              <p className="text-[10px] text-[#86868b] mt-1.5">
                ※ AI 답변은 참고용이며, 정확한 정보는 해당 기관에 직접 문의하세요.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
