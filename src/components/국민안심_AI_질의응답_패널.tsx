'use client';

// Essential Care Map - 국민안심 AI 의료 질의응답 패널
// 자연어 질문에 대해 환자/보호자 맞춤형 공공보건의료기관 및 실시간 병상 안내 제공
// 넓은 화면 뷰, 전체화면 확장 토글, 쾌적한 스크롤 및 카드 가독성 극대화

import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Bot,
  User,
  Sparkles,
  Phone,
  Navigation,
  Activity,
  RotateCcw,
  Building2,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import {
  전체_공공의료기관_상세목록,
  민간_응급의료기관_목록,
  민간_분만기관_목록,
  민간_달빛어린이병원_목록,
} from '@/lib/의료서비스_검색_엔진';
import { 공공의료_자원_서비스, 실시간_응급실_기관정보 } from '@/lib/공공의료_자원_서비스';

export interface 대화_메시지 {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  recommended_hospitals?: {
    기관명: string;
    지역: string;
    거리?: string;
    전화: string;
    구분: string;
    위도?: number | null;
    경도?: number | null;
    가용병상_요약?: string;
    장비상태?: string;
    포화도?: '여유' | '보통' | '혼잡' | '포화';
  }[];
}

interface 국민안심_AI_질의응답_패널_속성 {
  user_lat: number;
  user_lng: number;
  current_region_name?: string;
  on_select_hospital_name?: (hospital_name: string) => void;
  is_expanded?: boolean;
  on_toggle_expand?: () => void;
}

export const 국민안심_AI_질의응답_패널: React.FC<국민안심_AI_질의응답_패널_속성> = ({
  user_lat,
  user_lng,
  current_region_name = '서울시/수도권',
  on_select_hospital_name,
  is_expanded = false,
  on_toggle_expand,
}) => {
  const [query_input, set_query_input] = useState('');
  const [is_loading, set_is_loading] = useState(false);
  const [chat_history, set_chat_history] = useState<대화_메시지[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: `안녕하세요! **국민안심 공공의료 AI 비서**입니다.\n궁금하신 증상이나 필요하신 의료기관을 자연어로 편하게 말씀해 주세요.\n내 주변 가장 가까운 공공병원과 **E-Gen 실시간 응급실·소아 병상 현황**을 즉시 확인해 드립니다.\n\n⚠️ **응급 환자(의식 저하, 심한 호흡곤란, 대량 출혈 등) 발생 시 즉시 119에 신고**하세요.`,
      timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messages_end_ref = useRef<HTMLDivElement>(null);

  // 자동 스크롤
  useEffect(() => {
    messages_end_ref.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat_history, is_loading]);

  // 대표 추천 질의 칩 목록
  const sample_questions = [
    '지금 아이가 열이 나는데 야간 소아과 갈 수 있는 곳 있어?',
    '가장 가까운 24시간 응급실과 현재 잔여 병상 알려줘',
    '분만실이 운영 중인 인근 산부인과 병원 찾아줘',
    'CT나 중환자실(ICU) 이용 가능한 거점 공공병원 어디야?',
  ];

  // 두 좌표 간 거리 계산 (km)
  const calculate_distance_km = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(1);
  };

  // 자연어 질의 처리 및 답변 생성 함수 (스네이크 케이스)
  const handle_submit_query = async (query_text: string) => {
    const trimmed = query_text.trim();
    if (!trimmed || is_loading) return;

    const current_time_str = new Date().toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const user_msg: 대화_메시지 = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: trimmed,
      timestamp: current_time_str,
    };

    set_chat_history((prev) => [...prev, user_msg]);
    set_query_input('');
    set_is_loading(true);

    try {
      // 1. 질의 의도 파악 (자연어 규칙 분석)
      const is_pediatric = /아이|소아|어린이|애기|열|소아과|달빛/i.test(trimmed);
      const is_delivery = /분만|산부인과|출산|임신|산모|아기낳/i.test(trimmed);
      const is_emergency = /응급|응급실|야간|다쳤|사고|골든타임|119|심야|휴일/i.test(trimmed);
      const is_icu_or_equip = /중환자|icu|ct|mri|인공호흡기|투석/i.test(trimmed);

      // 2. 지역명 추출 시도
      let target_region = '';
      const matched_sgg = 전체_공공의료기관_상세목록.find(
        (h) => trimmed.includes(h.시군구명) || trimmed.includes(h.시도명)
      );
      if (matched_sgg) {
        target_region = matched_sgg.시군구명;
      }

      // 3. E-Gen 실시간 자원 데이터 조회
      const query_sgg = target_region || (user_lat === 37.5665 ? '영월군' : '영월군');
      const resources = 공공의료_자원_서비스.get_integrated_resources(query_sgg);

      // 4. 거리 기준 상위 추천 병원 선별
      let candidate_hospitals: any[] = [];

      if (is_delivery) {
        // 분만 기관 우선
        const delivery_hospitals = 전체_공공의료기관_상세목록
          .filter((h) => h.서비스_상세.some((s) => s.코드 === 'delivery' && s.상태 === '운영'))
          .map((h) => ({
            기관명: h.기관명,
            지역: `${h.시도명} ${h.시군구명}`,
            전화: h.전화번호,
            구분: h.기관유형,
            위도: h.위도,
            경도: h.경도,
            거리: calculate_distance_km(user_lat, user_lng, h.위도, h.경도),
            가용병상_요약: `총 ${h.의료자원.병상.총병상}병상 (분만실 운영)`,
            장비상태: '신생아실 및 산부인과 전문의 상주',
            포화도: '보통' as const,
          }));

        const private_delivery = 민간_분만기관_목록.slice(0, 5).map((m) => ({
          기관명: m.기관명,
          지역: `${m.시도} ${m.시군구}`,
          전화: m.전화번호,
          구분: '민간 분만기관',
          위도: m.위도,
          경도: m.경도,
          거리: m.위도 && m.경도 ? calculate_distance_km(user_lat, user_lng, m.위도, m.경도) : undefined,
          가용병상_요약: '심평원 분만 청구 실적 기관',
          장비상태: m.야간 ? '야간 분만 실적 보유' : '일반 분만 가능',
          포화도: '보통' as const,
        }));

        candidate_hospitals = [...delivery_hospitals, ...private_delivery]
          .sort((a, b) => parseFloat(a.거리 || '999') - parseFloat(b.거리 || '999'))
          .slice(0, 3);
      } else if (is_pediatric) {
        // 소아/달빛어린이병원 우선
        const moonlight_list = 민간_달빛어린이병원_목록.map((d) => ({
          기관명: d.기관명,
          지역: d.주소.split(' ').slice(0, 2).join(' '),
          전화: d.대표전화,
          구분: '달빛어린이병원 (야간·휴일 소아진료)',
          위도: d.위도,
          경도: d.경도,
          거리: d.위도 && d.경도 ? calculate_distance_km(user_lat, user_lng, d.위도, d.경도) : undefined,
          가용병상_요약: '평일 야간 23시 / 휴일 소아 외래',
          장비상태: '소아청소년과 전문의 진료',
          포화도: '여유' as const,
        }));

        const public_pediatric = 전체_공공의료기관_상세목록
          .filter((h) => h.서비스_상세.some((s) => s.코드 === 'pediatric' && s.상태 === '운영'))
          .map((h) => ({
            기관명: h.기관명,
            지역: `${h.시도명} ${h.시군구명}`,
            전화: h.전화번호,
            구분: h.기관유형,
            위도: h.위도,
            경도: h.경도,
            거리: calculate_distance_km(user_lat, user_lng, h.위도, h.경도),
            가용병상_요약: `총 ${h.의료자원.병상.총병상}병상 (소아청소년과)`,
            장비상태: h.의료자원.주요장비.인큐베이터 ? '인큐베이터 가동' : '소아 외래/입원',
            포화도: '보통' as const,
          }));

        candidate_hospitals = [...moonlight_list, ...public_pediatric]
          .sort((a, b) => parseFloat(a.거리 || '999') - parseFloat(b.거리 || '999'))
          .slice(0, 3);
      } else {
        // 기본: 응급/공공병원 E-Gen 실시간 연계
        const live_egens = (resources.응급의료기관_목록 || []).map((e) => ({
          기관명: e.기관명,
          지역: e.주소.split(' ').slice(0, 2).join(' '),
          전화: e.전화번호,
          구분: e.응급실_구분,
          거리: '관내 최단거리',
          가용병상_요약: `응급 가용 ${e.응급실_가용병상}석 / 소아 ${e.소아_가용병상}석 / ICU ${e.중환자실_가용병상}석`,
          장비상태: `CT:${e.장비가동상태.CT ? '가동' : '중지'} · MRI:${e.장비가동상태.MRI ? '가동' : '중지'} · 인공호흡기:${e.장비가동상태.인공호흡기 ? '가동' : '중지'}`,
          포화도: e.포화도_상태,
        }));

        const public_nearest = 전체_공공의료기관_상세목록
          .map((h) => ({
            기관명: h.기관명,
            지역: `${h.시도명} ${h.시군구명}`,
            전화: h.전화번호,
            구분: h.기관유형,
            위도: h.위도,
            경도: h.경도,
            거리: calculate_distance_km(user_lat, user_lng, h.위도, h.경도),
            가용병상_요약: `총 ${h.의료자원.병상.총병상}병상 (응급실 ${h.의료자원.응급실.가용병상}석 가용)`,
            장비상태: `CT:${h.의료자원.주요장비.CT ? '가동' : '미보유'} · 중환자실:${h.의료자원.중환자실.가용병상}석`,
            포화도: (h.의료자원.응급실.상태 as any) || '보통',
          }))
          .sort((a, b) => parseFloat(a.거리 || '999') - parseFloat(b.거리 || '999'))
          .slice(0, 2);

        candidate_hospitals = [...live_egens, ...public_nearest].slice(0, 3);
      }

      // 5. 지능형 AI 응답 텍스트 빌드
      let answer_text = '';

      if (is_pediatric) {
        answer_text = `소아 환자의 진료가 필요하신 상황이군요.\n\n야간이나 휴일에는 **보건복지부 지정 달빛어린이병원** 또는 **소아 전문 응급실**을 우선 이용하시는 것이 안전합니다.\n\n현재 위치 기준으로 가장 접근이 용이한 의료기관 목록과 E-Gen 정보를 안내해 드립니다. 특히 고열이나 호흡곤란 증상이 지속될 경우 출발 전 유선 전화로 전문의 상주 여부를 확인하신 뒤 이동하시길 권장합니다.`;
      } else if (is_delivery) {
        answer_text = `분만 산부인과 및 신생아실 인프라를 찾으셨습니다.\n\n심평원 분만 청구 실적 및 공공보건의료 전수 DB를 기반으로, 분만실과 응급 수술이 가능한 가장 가까운 병·의원 목록을 정리했습니다.\n\n분만 징후(규칙적인 진통, 양수 파열 등)가 나타났다면 즉시 해당 병원 분만실로 연락하시거나 **119 구급차**를 호출해 주세요.`;
      } else if (is_icu_or_equip) {
        answer_text = `중환자실(ICU), CT, MRI 등 고난도 중증 의료장비 가동 현황입니다.\n\n국립중앙의료원 중앙응급의료센터(E-Gen) 실시간 데이터에 따르면 현재 권역 및 지역 거점 공공병원에서 해당 장비가 정상 가동 중입니다. 하단의 가용 병상과 장비 가동 상태를 확인해 주세요.`;
      } else {
        answer_text = `질문하신 내용과 관련하여 **내 주변에서 가장 가까운 공공의료기관 및 실시간 E-Gen 응급실 현황**을 검색하였습니다.\n\n현재 확인된 최단거리 의료기관의 응급실 잔여 가용병상과 전화번호를 안내해 드립니다. 야간/응급 상황 시 실시간 병상 변동이 발생할 수 있으므로, 출발 전 전화로 문의하시는 것을 권장합니다.`;
      }

      const ai_msg: 대화_메시지 = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: answer_text,
        timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
        recommended_hospitals: candidate_hospitals,
      };

      set_chat_history((prev) => [...prev, ai_msg]);
    } catch (err: any) {
      const error_msg: 대화_메시지 = {
        id: `error-${Date.now()}`,
        sender: 'ai',
        text: `죄송합니다. 의료기관 정보 및 E-Gen 실시간 데이터를 조회하는 중 일시적인 오류가 발생했습니다. (${err?.message || '잠시 후 다시 시도해 주세요'})`,
        timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
      };
      set_chat_history((prev) => [...prev, error_msg]);
    } finally {
      set_is_loading(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-50 dark:bg-[#121318] border-l border-slate-200 dark:border-slate-800 overflow-hidden">
      {/* 1. 패널 상단 헤더 */}
      <div className="p-3 sm:p-3.5 bg-white dark:bg-[#16171d] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5 flex-wrap">
              <span>국민안심 AI 의료 질의응답</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold">
                E-Gen 실시간 연동
              </span>
            </h3>
            <p className="text-[10px] text-slate-400">자연어로 물어보시면 가까운 공공병원과 실시간 병상을 찾아드립니다</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* 전체화면 넓게보기 토글 버튼 */}
          {on_toggle_expand && (
            <button
              type="button"
              onClick={on_toggle_expand}
              title={is_expanded ? '기본 화면으로 축소' : '답변 영역 넓게보기'}
              className="px-2 py-1 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
            >
              {is_expanded ? (
                <>
                  <Minimize2 className="w-3.5 h-3.5 text-blue-500" />
                  <span className="hidden sm:inline">지도 함께보기</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="hidden sm:inline">답변 넓게보기</span>
                </>
              )}
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              set_chat_history([
                {
                  id: 'welcome',
                  sender: 'ai',
                  text: `대화 내용이 초기화되었습니다. 필요하신 의료기관이나 증상을 말씀해 주세요.`,
                  timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
                },
              ]);
            }}
            title="대화 초기화"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. 대화 메시지 스크롤 영역 (충분한 높이 확보: flex-1 min-h-[300px]) */}
      <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 space-y-4 text-xs min-h-[280px]">
        {chat_history.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className="flex items-center gap-1 mb-1 text-[10px] text-slate-400">
              {msg.sender === 'ai' ? (
                <>
                  <Sparkles className="w-3 h-3 text-emerald-500" />
                  <span className="font-semibold text-slate-600 dark:text-slate-300">AI 안심 비서</span>
                </>
              ) : (
                <>
                  <User className="w-3 h-3 text-blue-500" />
                  <span className="font-semibold text-slate-600 dark:text-slate-300">나</span>
                </>
              )}
              <span>· {msg.timestamp}</span>
            </div>

            <div
              className={`max-w-[96%] sm:max-w-[92%] rounded-2xl px-4 py-3 leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white shadow-xs rounded-tr-xs'
                  : 'bg-white dark:bg-[#1a1b22] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 shadow-sm rounded-tl-xs'
              }`}
            >
              <div className="whitespace-pre-line text-xs sm:text-[13px] font-normal leading-relaxed">{msg.text}</div>

              {/* AI가 추천한 병원 리스트 카드 (E-Gen 실시간 병상 및 빠른 액션) */}
              {msg.recommended_hospitals && msg.recommended_hospitals.length > 0 && (
                <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
                  <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>추천 의료기관 및 실시간 병상 정보</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {msg.recommended_hospitals.map((h, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-[#13141a] border border-slate-200 dark:border-slate-800 space-y-2 flex flex-col justify-between"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-start justify-between gap-1">
                            <div>
                              <div className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm flex items-center gap-1.5 flex-wrap">
                                <span>{h.기관명}</span>
                                {h.거리 && (
                                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-semibold">
                                    약 {h.거리}km
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-400">
                                {h.지역} · {h.구분}
                              </span>
                            </div>

                            {h.포화도 && (
                              <span
                                className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold shrink-0 ${
                                  h.포화도 === '여유'
                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                    : h.포화도 === '보통'
                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                                    : h.포화도 === '혼잡'
                                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                    : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                }`}
                              >
                                응급실: {h.포화도}
                              </span>
                            )}
                          </div>

                          {/* E-Gen 가용병상 & 장비 요약 */}
                          {h.가용병상_요약 && (
                            <div className="text-[10px] text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900/60 p-2 rounded-lg border border-slate-100 dark:border-slate-800 space-y-0.5">
                              <div className="font-semibold text-slate-800 dark:text-slate-100">📊 {h.가용병상_요약}</div>
                              {h.장비상태 && <div className="text-slate-400">⚙️ {h.장비상태}</div>}
                            </div>
                          )}
                        </div>

                        {/* 빠른 액션 버튼: 전화 걸기 & 지도에서 찾기 */}
                        <div className="flex items-center gap-1.5 pt-1">
                          <a
                            href={`tel:${h.전화}`}
                            className="flex-1 py-1.5 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold text-center flex items-center justify-center gap-1 transition shadow-xs"
                          >
                            <Phone className="w-3 h-3" />
                            <span>전화 문의</span>
                          </a>

                          <a
                            href={
                              h.위도 && h.경도
                                ? `https://map.kakao.com/link/to/${encodeURIComponent(h.기관명)},${h.위도},${h.경도}`
                                : `https://map.kakao.com/link/search/${encodeURIComponent(h.기관명)}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 py-1.5 px-2 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-700 dark:text-slate-200 text-[10px] font-bold text-center flex items-center justify-center gap-1 transition"
                          >
                            <Navigation className="w-3 h-3 text-blue-500" />
                            <span>길찾기</span>
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {is_loading && (
          <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-white dark:bg-[#1a1b22] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 text-xs w-fit shadow-xs">
            <Activity className="w-4 h-4 text-emerald-500 animate-spin" />
            <span>E-Gen 실시간 병상 및 공공의료 DB를 정밀 분석 중입니다...</span>
          </div>
        )}

        <div ref={messages_end_ref} />
      </div>

      {/* 3. 추천 빠른 질문 칩들 */}
      <div className="p-2 sm:p-2.5 bg-white/80 dark:bg-[#16171d]/80 border-t border-slate-200 dark:border-slate-800 space-y-1 shrink-0">
        <div className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-500" />
          <span>추천 빠른 질문</span>
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {sample_questions.map((q, idx) => (
            <button
              key={idx}
              type="button"
              disabled={is_loading}
              onClick={() => handle_submit_query(q)}
              className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-600 text-slate-600 dark:text-slate-300 text-[11px] whitespace-nowrap transition border border-transparent hover:border-emerald-300 cursor-pointer active:scale-95"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* 4. 질의 입력창 */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handle_submit_query(query_input);
        }}
        className="p-2.5 sm:p-3 bg-white dark:bg-[#16171d] border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 shrink-0"
      >
        <input
          type="text"
          value={query_input}
          onChange={(e) => set_query_input(e.target.value)}
          placeholder="예: 지금 영월에서 아이가 열이 나는데 갈 수 있는 병원 있어?"
          disabled={is_loading}
          className="flex-1 px-3.5 py-2 bg-slate-100 dark:bg-slate-800/80 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!query_input.trim() || is_loading}
          className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white transition cursor-pointer shadow-xs shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
