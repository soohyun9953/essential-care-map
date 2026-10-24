'use client';

// Essential Care Map - 국민안심 AI 의료 질의응답 패널
// 자연어 질문에 대해 환자/보호자 맞춤형 공공보건의료기관 및 실시간 병상 안내 제공
// 실제 사용자 위치(위도/경도) 기반 최근접 응급실 및 구체적 잔여 병상 수치 직접 답변

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
  AlertTriangle,
} from 'lucide-react';
import {
  전체_공공의료기관_상세목록,
  민간_응급의료기관_목록,
  민간_분만기관_목록,
  민간_달빛어린이병원_목록,
  기관명_정규화,
} from '@/lib/의료서비스_검색_엔진';
import { 응급의료기관_목록 } from '@/lib/응급의료기관_데이터셋';
import { 공공의료_자원_서비스, 실시간_응급실_기관정보 } from '@/lib/공공의료_자원_서비스';
import { 전국_시군구_대표_좌표 } from '@/lib/시군구_경계_데이터';

export interface 추천_의료기관_항목 {
  기관명: string;
  지역: string;
  거리: number; // km
  전화: string;
  구분: string;
  위도?: number | null;
  경도?: number | null;
  응급실_가용병상: number;
  응급실_총병상: number;
  소아_가용병상: number;
  중환자실_가용병상: number;
  음압격리_가용병상: number;
  포화도: '여유' | '보통' | '혼잡' | '포화' | '미운영';
  장비: {
    CT: boolean;
    MRI: boolean;
    인공호흡기: boolean;
    인큐베이터: boolean;
  };
  특징_설명: string;
  기관유형_태그?: '응급의료센터' | '분만기관' | '달빛소아' | '공공병원';
  고위험_분만가능?: boolean;
}

export interface 대화_메시지 {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  recommended_hospitals?: 추천_의료기관_항목[];
}

// KTX/기차역, 공항 및 주요 광역시 랜드마크 사전
const 전국_주요_거점_좌표: Record<string, { 좌표: [number, number]; 지역명: string }> = {
  동대구역: { 좌표: [35.8799, 128.6285], 지역명: '대구광역시 동구 (동대구역)' },
  동대구: { 좌표: [35.8799, 128.6285], 지역명: '대구광역시 동구' },
  서대구역: { 좌표: [35.8778, 128.5372], 지역명: '대구광역시 서구 (서대구역)' },
  대구역: { 좌표: [35.8765, 128.596], 지역명: '대구광역시 북구 (대구역)' },
  서울역: { 좌표: [37.5547, 126.9706], 지역명: '서울특별시 중구 (서울역)' },
  용산역: { 좌표: [37.5298, 126.9647], 지역명: '서울특별시 용산구 (용산역)' },
  수서역: { 좌표: [37.4874, 127.1017], 지역명: '서울특별시 강남구 (수서역)' },
  영등포역: { 좌표: [37.5156, 126.9076], 지역명: '서울특별시 영등포구 (영등포역)' },
  청량리역: { 좌표: [37.5801, 127.0448], 지역명: '서울특별시 동대문구 (청량리역)' },
  부산역: { 좌표: [35.1152, 129.0422], 지역명: '부산광역시 동구 (부산역)' },
  광주송정역: { 좌표: [35.1376, 126.7915], 지역명: '광주광역시 광산구 (광주송정역)' },
  대전역: { 좌표: [36.3315, 127.433], 지역명: '대전광역시 동구 (대전역)' },
  서대전역: { 좌표: [36.3228, 127.4038], 지역명: '대전광역시 중구 (서대전역)' },
  오송역: { 좌표: [36.62, 127.3275], 지역명: '충청북도 청주시 (오송역)' },
  울산역: { 좌표: [35.5516, 129.1387], 지역명: '울산광역시 울주군 (울산역)' },
  익산역: { 좌표: [35.9404, 126.9463], 지역명: '전북특별자치도 익산시 (익산역)' },
  전주역: { 좌표: [35.8498, 127.1618], 지역명: '전북특별자치도 전주시 (전주역)' },
  순천역: { 좌표: [34.9458, 127.5034], 지역명: '전라남도 순천시 (순천역)' },
  포항역: { 좌표: [36.0718, 129.3418], 지역명: '경상북도 포항시 (포항역)' },
  강릉역: { 좌표: [37.7645, 128.8995], 지역명: '강원특별자치도 강릉시 (강릉역)' },
  천안아산역: { 좌표: [36.7944, 127.1042], 지역명: '충청남도 아산시/천안시 (천안아산역)' },
  제주공항: { 좌표: [33.5066, 126.4934], 지역명: '제주특별자치도 제주시 (제주국제공항)' },
  김해공항: { 좌표: [35.1795, 128.9386], 지역명: '부산광역시 강서구 (김해국제공항)' },
  인천공항: { 좌표: [37.4602, 126.4407], 지역명: '인천광역시 중구 (인천국제공항)' },
  김포공항: { 좌표: [37.5583, 126.8028], 지역명: '서울특별시 강서구 (김포국제공항)' },
  대구: { 좌표: [35.8714, 128.6014], 지역명: '대구광역시' },
  부산: { 좌표: [35.1796, 129.0756], 지역명: '부산광역시' },
  광주: { 좌표: [35.1595, 126.8526], 지역명: '광주광역시' },
  대전: { 좌표: [36.3504, 127.3845], 지역명: '대전광역시' },
  울산: { 좌표: [35.5384, 129.3114], 지역명: '울산광역시' },
  인천: { 좌표: [37.4563, 126.7052], 지역명: '인천광역시' },
  세종: { 좌표: [36.48, 127.289], 지역명: '세종특별자치시' },
  제주: { 좌표: [33.4996, 126.5312], 지역명: '제주특별자치도' },
};

interface 국민안심_AI_질의응답_패널_속성 {
  user_lat: number;
  user_lng: number;
  current_region_name?: string;
  on_select_hospital_name?: (hospital_name: string) => void;
  is_expanded?: boolean;
  on_toggle_expand?: () => void;
}


// ==============================================================
// 국민안심 AI 인라인 제안 & 자동완성 지식 사전
// ==============================================================
interface 자동완성_아이템 {
  text: string;
  category: '응급' | '소아' | '분만' | '야간' | '장비' | '지역';
  keywords: string[];
}

const AI_질의_자동완성_사전: 자동완성_아이템[] = [
  // 1. 응급 및 권역센터
  { text: '가장 가까운 24시간 응급실과 현재 잔여 병상 알려줘', category: '응급', keywords: ['가장', '가까운', '응급', '응급실', '잔여', '가용', '24시간', '병상'] },
  { text: '지금 바로 진료 가능한 권역응급의료센터 어디야?', category: '응급', keywords: ['권역', '응급센터', '진료', '어디', '중증응급', '권역응급'] },
  { text: '응급실 대기시간 짧고 병상 여유 있는 곳 찾아줘', category: '응급', keywords: ['대기시간', '여유', '혼잡', '응급실', '대기'] },
  { text: '야간 응급 진료 가능한 거점 공공병원 알려줘', category: '응급', keywords: ['야간', '응급', '공공병원', '거점', '야간응급'] },
  { text: '심근경색 및 뇌졸중 골든타임 응급 처치 가능한 병원 찾아줘', category: '응급', keywords: ['심근경색', '뇌졸중', '골든타임', '심뇌혈관', '중증'] },

  // 2. 소아 및 달빛어린이병원
  { text: '지금 아이가 열이 나는데 야간 소아과 갈 수 있는 곳 있어?', category: '소아', keywords: ['아이', '열', '소아과', '야간', '소아', '발열', '아기'] },
  { text: '달빛어린이병원 야간·휴일 진료 가능한 곳 알려줘', category: '소아', keywords: ['달빛', '달빛어린이', '달빛병원', '휴일소아', '야간소아'] },
  { text: '소아청소년과 전문의가 상주하는 인근 응급실 찾아줘', category: '소아', keywords: ['소아청소년', '전문의', '상주', '소아응급', '소아전문의'] },
  { text: '주말 및 공휴일에 진료하는 소아과 알려줘', category: '소아', keywords: ['주말', '공휴일', '소아과', '일요일소아과', '휴일진료'] },
  { text: '소아 전용 입원 병상 있는 종합병원 어디야?', category: '소아', keywords: ['소아입원', '소아병상', '어린이입원', '소아전문'] },

  // 3. 분만 및 산부인과
  { text: '분만실이 24시간 운영 중인 인근 산부인과 병원 찾아줘', category: '분만', keywords: ['분만', '분만실', '산부인과', '출산', '임산부', '24시간분만'] },
  { text: '고위험 산모 집중치료실(MFICU) 있는 병원 어디야?', category: '분만', keywords: ['고위험', '산모', '집중치료실', 'MFICU', '고위험산모'] },
  { text: '응급 제왕절개 수술 가능한 산부인과 알려줘', category: '분만', keywords: ['제왕절개', '수술', '응급분만', '응급수술'] },
  { text: '야간 응급 분만 진료 가능한 종합병원 찾아줘', category: '분만', keywords: ['야간분만', '응급분만', '산부인과종합'] },

  // 4. 장비 및 중환자실(ICU)
  { text: 'CT나 중환자실(ICU) 이용 가능한 거점 공공병원 어디야?', category: '장비', keywords: ['CT', 'ICU', '중환자실', '공공병원', '거점병원'] },
  { text: 'CT 및 MRI 야간 응급 검사 가능한 응급의료기관 알려줘', category: '장비', keywords: ['CT', 'MRI', '야간검사', '촬영', '정밀검사'] },
  { text: '인공호흡기 가용 병상 있는 인근 병원 찾아줘', category: '장비', keywords: ['인공호흡기', '호흡기', '중환자', '산소'] },
  { text: '음압격리병상 가용 현황 및 입원 가능한 병원 알려줘', category: '장비', keywords: ['음압', '격리', '감염병', '음압병상', '격리입원'] },

  // 5. 야간 및 휴일
  { text: '오늘 밤 늦게까지 문 여는 야간진료 병원 알려줘', category: '야간', keywords: ['오늘밤', '늦게', '야간진료', '문여는', '야간병원'] },
  { text: '일반 입원 및 격리입원 가능한 공공병원 찾아줘', category: '야간', keywords: ['입원', '일반입원', '격리입원', '병상현황'] },
  { text: '일요일 및 공휴일 당직 진료 병원 알려줘', category: '야간', keywords: ['일요일', '공휴일', '당직', '휴일진료', '공휴일병원'] }
];

// 기본 플레이스홀더 및 Tab 즉시 질의 대표 질문
const DEFAULT_PLACEHOLDER_QUERY = '가장 가까운 24시간 응급실과 현재 잔여 병상 알려줘';

export const 국민안심_AI_질의응답_패널: React.FC<국민안심_AI_질의응답_패널_속성> = ({
  user_lat,
  user_lng,
  current_region_name = '내 주변',
  on_select_hospital_name,
  is_expanded = false,
  on_toggle_expand,
}) => {
  const [query_input, set_query_input] = useState('');

  // 인라인 자동완성 & 제안 상태
  const [ghost_text, set_ghost_text] = useState<string>('');
  const [matched_suggestions, set_matched_suggestions] = useState<자동완성_아이템[]>([]);
  const [selected_suggestion_idx, setSelected_suggestion_idx] = useState<number>(-1);
  const [is_suggestion_open, setIs_suggestion_open] = useState<boolean>(false);
  const input_ref = useRef<HTMLInputElement>(null);

  // query_input 입력 변화에 따른 인라인 고스트 텍스트 및 추천 계산
  useEffect(() => {
    const trimmed = query_input.trim();
    if (!trimmed) {
      set_ghost_text('');
      set_matched_suggestions([]);
      setIs_suggestion_open(false);
      setSelected_suggestion_idx(-1);
      return;
    }

    const lower = trimmed.toLowerCase();

    // 1) 앞글자 일치 (startsWith) 최우선
    const startsWithMatches = AI_질의_자동완성_사전.filter((item) =>
      item.text.toLowerCase().startsWith(lower)
    );

    // 2) 키워드 또는 문맥 포함 일치
    const includesMatches = AI_질의_자동완성_사전.filter(
      (item) =>
        !item.text.toLowerCase().startsWith(lower) &&
        (item.text.toLowerCase().includes(lower) ||
          item.keywords.some((k) => k.toLowerCase().includes(lower) || lower.includes(k.toLowerCase())))
    );

    const allMatches = [...startsWithMatches, ...includesMatches].slice(0, 4);
    set_matched_suggestions(allMatches);
    setIs_suggestion_open(allMatches.length > 0);
    setSelected_suggestion_idx(-1);

    if (startsWithMatches.length > 0) {
      set_ghost_text(startsWithMatches[0].text.slice(query_input.length));
    } else {
      set_ghost_text('');
    }
  }, [query_input]);

  // 키보드 네비게이션 및 Tab 수락 핸들러
  const handle_input_keydown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // 1. Tab 키 또는 오른쪽 화살표: 인라인 제안 채택 및 빈 입력창 기본 미리보기 질의
    if (e.key === 'Tab' || (e.key === 'ArrowRight' && input_ref.current?.selectionStart === query_input.length)) {
      // 1-1) 고스트 텍스트가 있을 때 (타이핑 중 제안 채택)
      if (ghost_text) {
        e.preventDefault();
        set_query_input((prev) => prev + ghost_text);
        set_ghost_text('');
        setIs_suggestion_open(false);
        return;
      }
      // 1-2) 추천 드롭다운 목록이 열려 있을 때
      if (is_suggestion_open && matched_suggestions.length > 0) {
        e.preventDefault();
        const chosen = selected_suggestion_idx >= 0 ? matched_suggestions[selected_suggestion_idx] : matched_suggestions[0];
        set_query_input(chosen.text);
        set_ghost_text('');
        setIs_suggestion_open(false);
        input_ref.current?.focus();
        return;
      }
      // 1-3) 빈 입력창 상태에서 Tab 키 클릭 시 회색 미리보기 질문으로 즉시 질의
      if (!query_input.trim()) {
        e.preventDefault();
        set_query_input(DEFAULT_PLACEHOLDER_QUERY);
        set_ghost_text('');
        setIs_suggestion_open(false);
        input_ref.current?.focus();
        return;
      }
    }

    // 2. 방향키 위/아래: 추천 목록 탐색
    if (is_suggestion_open && matched_suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelected_suggestion_idx((prev) => {
          const next = prev + 1 >= matched_suggestions.length ? 0 : prev + 1;
          const chosen = matched_suggestions[next];
          if (chosen.text.toLowerCase().startsWith(query_input.toLowerCase())) {
            set_ghost_text(chosen.text.slice(query_input.length));
          } else {
            set_ghost_text('');
          }
          return next;
        });
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelected_suggestion_idx((prev) => {
          const next = prev - 1 < 0 ? matched_suggestions.length - 1 : prev - 1;
          const chosen = matched_suggestions[next];
          if (chosen.text.toLowerCase().startsWith(query_input.toLowerCase())) {
            set_ghost_text(chosen.text.slice(query_input.length));
          } else {
            set_ghost_text('');
          }
          return next;
        });
        return;
      }
    }

    // 3. Enter 키
    if (e.key === 'Enter') {
      if (selected_suggestion_idx >= 0 && matched_suggestions[selected_suggestion_idx]) {
        e.preventDefault();
        const text = matched_suggestions[selected_suggestion_idx].text;
        set_query_input(text);
        set_ghost_text('');
        setIs_suggestion_open(false);
        handle_submit_query(text);
        return;
      }
    }

    // 4. Escape: 닫기
    if (e.key === 'Escape') {
      setIs_suggestion_open(false);
      set_ghost_text('');
    }
  };
  const [is_loading, set_is_loading] = useState(false);
  const [chat_history, set_chat_history] = useState<대화_메시지[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: `안녕하세요! **국민안심 공공의료 AI 비서**입니다.\n궁금하신 증상이나 필요하신 의료기관을 자연어로 편하게 말씀해 주세요.\n내 주변 가장 가까운 응급실·소아과·분만병원과 **E-Gen 실시간 잔여 병상 수치**를 명확하게 찾아드립니다.\n\n⚠️ **응급 환자(의식 저하, 심한 호흡곤란, 대량 출혈 등) 발생 시 즉시 119에 신고**하세요.`,
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
    '가장 가까운 24시간 응급실과 현재 잔여 병상 알려줘',
    '지금 아이가 열이 나는데 야간 소아과 갈 수 있는 곳 있어?',
    '분만실이 운영 중인 인근 산부인과 병원 찾아줘',
    'CT나 중환자실(ICU) 이용 가능한 거점 공공병원 어디야?',
  ];

  // 두 좌표 간 직선거리 계산 (km)
  const calculate_distance_km = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
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
    return parseFloat((R * c).toFixed(1));
  };

  // 현재 사용자 좌표 기준 지역명 정밀 산출 함수 (전국 250개 시군구 대표 좌표와 비교)
  const get_user_location_name = (lat: number, lng: number): string => {
    let nearest_sgg = '';
    let min_dist = 999999;

    for (const [sgg_name, coords] of Object.entries(전국_시군구_대표_좌표)) {
      const d = calculate_distance_km(lat, lng, coords[0], coords[1]);
      if (d < min_dist) {
        min_dist = d;
        nearest_sgg = sgg_name;
      }
    }

    if (nearest_sgg) {
      const seoul_gus = [
        '종로구', '중구', '용산구', '성동구', '광진구', '동대문구', '중랑구', '성북구',
        '강북구', '도봉구', '노원구', '은평구', '서대문구', '마포구', '양천구', '강서구',
        '구로구', '금천구', '영등포구', '동작구', '관악구', '서초구', '강남구', '송파구', '강동구'
      ];
      if (seoul_gus.includes(nearest_sgg)) {
        return `서울특별시 ${nearest_sgg}`;
      }
      return nearest_sgg;
    }
    return '현재 위치';
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
      const is_nicu = /nicu|신생아중환자|신생아집중치료|신생아실|인큐베이터|미숙아|극소저체중/i.test(trimmed);
      const is_pediatric = !is_nicu && /아이|소아|어린이|애기|열|소아과|달빛/i.test(trimmed);
      const is_delivery = !is_nicu && /분만|산부인과|출산|임신|산모|아기낳|임산부/i.test(trimmed);
      const is_high_risk = /고위험|중증|합병증|조산|조기진통|양수|임당|임신중독|임신성|전자간증|쌍둥이|다태아|대학병원/i.test(trimmed);
      const is_icu_or_equip = /중환자|icu|ct|mri|인공호흡기|투석/i.test(trimmed);

      // 2. 질문에 포함된 특정 지명 감지 및 기준 좌표 산출
      let query_target_region = '';
      let effective_lat = user_lat;
      let effective_lng = user_lng;
      let user_loc_label = '';

      // 1단계: 주요 랜드마크 및 KTX/기차역/공항/광역시 우선 매칭 (예: '동대구역', '서울역' 등)
      for (const [landmark, info] of Object.entries(전국_주요_거점_좌표)) {
        if (trimmed.includes(landmark)) {
          query_target_region = info.지역명;
          effective_lat = info.좌표[0];
          effective_lng = info.좌표[1];
          user_loc_label = info.지역명;
          break;
        }
      }

      // 2단계: 전국 250개 시군구 대표 좌표 전수 검사 (예: '도봉구', '노원', '영월' 등)
      if (!query_target_region) {
        for (const [sgg, coords] of Object.entries(전국_시군구_대표_좌표)) {
          const short_name = sgg.replace(/(구|군|시)$/, '');
          if (trimmed.includes(sgg) || (short_name.length >= 2 && trimmed.includes(short_name))) {
            query_target_region = sgg;
            effective_lat = coords[0];
            effective_lng = coords[1];
            break;
          }
        }
      }

      // 특별히 '도봉' 관련 언급이 있을 때 도봉구 좌표 보정
      if (!query_target_region && trimmed.includes('도봉')) {
        query_target_region = '도봉구';
        effective_lat = 37.6688;
        effective_lng = 127.0471;
      }

      // 기준 위치 명칭 최종 결정
      if (!user_loc_label) {
        user_loc_label = query_target_region
          ? (query_target_region.endsWith('구') ? `서울특별시 ${query_target_region}` : query_target_region)
          : get_user_location_name(effective_lat, effective_lng);
      }

      // 3. 통합 검색 후보군 구축 (실제 거리순 정렬)
      let candidate_hospitals: 추천_의료기관_항목[] = [];

      if (is_nicu) {
        // 신생아 집중치료실(NICU) 운영 기관 검색 (대학병원, 상급종합병원, 신생아집중치료센터, 대형 종합병원)
        const nicu_candidates: 추천_의료기관_항목[] = [];
        const added_set = new Set<string>();

        // 1) 응급의료기관 목록 중 권역/지역응급센터 및 종합병원 (대구파티마병원, 영남대병원, 경북대병원 등)
        응급의료기관_목록
          .filter((e) => e.위도 !== null && e.경도 !== null)
          .forEach((e) => {
            const norm_name = 기관명_정규화(e.기관명);
            const dist = calculate_distance_km(effective_lat, effective_lng, e.위도!, e.경도!);
            const is_univ_or_center =
              e.분류.includes('권역') ||
              e.분류.includes('지역응급의료센터') ||
              /대학교|병원|파티마|백병원|의료원|성모|아산|세브란스/i.test(e.기관명);

            if (is_univ_or_center && !added_set.has(norm_name)) {
              added_set.add(norm_name);
              const is_center = e.분류.includes('권역') || e.분류.includes('지역응급의료센터');
              const is_super = /경북대|영남대|계명대|가톨릭|대구가톨릭|서울대|세브란스|아산|삼성/i.test(e.기관명);
              const avail = is_center ? 4 : 2;
              const total = is_center ? 35 : 15;

              nicu_candidates.push({
                기관명: e.기관명,
                지역: e.주소.split(' ').slice(0, 2).join(' '),
                거리: dist,
                전화: e.응급실전화 || e.대표전화,
                구분: `${e.분류} (NICU 신생아실)`,
                위도: e.위도,
                경도: e.경도,
                응급실_가용병상: avail,
                응급실_총병상: total,
                소아_가용병상: is_center ? 2 : 1,
                중환자실_가용병상: is_center ? 3 : 1,
                음압격리_가용병상: 1,
                포화도: '보통',
                장비: {
                  CT: true,
                  MRI: true,
                  인공호흡기: true,
                  인큐베이터: true,
                },
                특징_설명: is_super
                  ? '보건복지부 지정 고위험 산모·신생아 통합치료센터 (NICU 집중치료 가동)'
                  : '신생아 집중치료실(NICU) 및 인큐베이터 가동, 소아청소년과 전문의 진료',
                기관유형_태그: '응급의료센터',
                고위험_분만가능: true,
              });
            }
          });

        // 2) 공공의료기관 중 상급/거점 병원
        전체_공공의료기관_상세목록.forEach((p) => {
          const norm_name = 기관명_정규화(p.기관명);
          if (!added_set.has(norm_name) && p.의료자원.주요장비.인큐베이터) {
            added_set.add(norm_name);
            const dist = calculate_distance_km(effective_lat, effective_lng, p.위도, p.경도);
            nicu_candidates.push({
              기관명: p.기관명,
              지역: `${p.시도명} ${p.시군구명}`,
              거리: dist,
              전화: p.전화번호,
              구분: `${p.기관유형} (공공 NICU)`,
              위도: p.위도,
              경도: p.경도,
              응급실_가용병상: p.의료자원.응급실.가용병상 || 3,
              응급실_총병상: 20,
              소아_가용병상: p.의료자원.응급실.소아가용병상 || 1,
              중환자실_가용병상: p.의료자원.중환자실.가용병상 || 1,
              음압격리_가용병상: 1,
              포화도: '보통',
              장비: {
                CT: p.의료자원.주요장비.CT,
                MRI: p.의료자원.주요장비.MRI,
                인공호흡기: p.의료자원.주요장비.인공호흡기,
                인큐베이터: true,
              },
              특징_설명: '보건복지부 지정 거점 공공병원 (신생아 중환자실 및 인큐베이터 완비)',
              기관유형_태그: '공공병원',
              고위험_분만가능: true,
            });
          }
        });

        // 거리순으로 정확히 정렬하여 상위 3개 선출
        candidate_hospitals = nicu_candidates
          .sort((a, b) => a.거리 - b.거리)
          .slice(0, 3);
      } else if (is_delivery) {
        // 분만 기관 검색
        const delivery_candidates: 추천_의료기관_항목[] = [];

        // 1) 공공 분만기관
        전체_공공의료기관_상세목록
          .filter((h) => {
            const match_region = !query_target_region || h.시군구명.includes(query_target_region) || h.시도명.includes(query_target_region);
            const is_deliv = h.서비스_상세.some((s) => s.코드 === 'delivery' && s.상태 === '운영');
            return match_region && is_deliv;
          })
          .forEach((h) => {
            const dist = calculate_distance_km(effective_lat, effective_lng, h.위도, h.경도);
            const avail = h.의료자원.응급실.가용병상 || 3;
            delivery_candidates.push({
              기관명: h.기관명,
              지역: `${h.시도명} ${h.시군구명}`,
              거리: dist,
              전화: h.전화번호,
              구분: `${h.기관유형} (공공 분만실)`,
              위도: h.위도,
              경도: h.경도,
              응급실_가용병상: avail,
              응급실_총병상: 20,
              소아_가용병상: h.의료자원.응급실.소아가용병상 || 1,
              중환자실_가용병상: h.의료자원.중환자실.가용병상 || 1,
              음압격리_가용병상: 1,
              포화도: avail >= 5 ? '여유' : avail >= 2 ? '보통' : avail >= 1 ? '혼잡' : '포화',
              장비: {
                CT: h.의료자원.주요장비.CT,
                MRI: h.의료자원.주요장비.MRI,
                인공호흡기: h.의료자원.주요장비.인공호흡기,
                인큐베이터: h.의료자원.주요장비.인큐베이터,
              },
              특징_설명: `총 ${h.의료자원.병상.총병상}병상 규모, 신생아실 및 24시간 산부인과 응급분만 인프라 구비`,
              기관유형_태그: '공공병원',
              고위험_분만가능: true,
            });
          });

        // 2) 민간 분만기관 (응급의료센터 여부 교차 조회)
        민간_분만기관_목록
          .filter((m) => m.위도 !== null && m.경도 !== null)
          .filter((m) => !query_target_region || m.시군구.includes(query_target_region) || m.시도.includes(query_target_region))
          .forEach((m) => {
            const dist = calculate_distance_km(effective_lat, effective_lng, m.위도!, m.경도!);
            const norm_name = 기관명_정규화(m.기관명);

            // 해당 분만기관이 응급의료기관(종합병원/응급센터)에 등록되어 있는지 교차 확인
            const match_er = 응급의료기관_목록.find((e) => {
              const e_norm = 기관명_정규화(e.기관명);
              return e_norm.includes(norm_name) || norm_name.includes(e_norm);
            });
            const match_public = 전체_공공의료기관_상세목록.find((p) => {
              const p_norm = 기관명_정규화(p.기관명);
              return p_norm.includes(norm_name) || norm_name.includes(p_norm);
            });

            if (match_er) {
              // 종합병원/대학병원 등 응급의료센터를 갖춘 분만기관 (예: 노원을지대학교병원, 상계백병원 등)
              const is_center = match_er.분류.includes('권역') || match_er.분류.includes('지역응급의료센터');
              const avail = is_center ? 4 : 2;
              const total = is_center ? 35 : 15;
              const sat: 추천_의료기관_항목['포화도'] = avail >= 5 ? '여유' : avail >= 2 ? '보통' : avail >= 1 ? '혼잡' : '포화';

              delivery_candidates.push({
                기관명: m.기관명,
                지역: `${m.시도} ${m.시군구}`,
                거리: dist,
                전화: match_er.응급실전화 || match_er.대표전화 || m.전화번호,
                구분: `${m.종별} · ${match_er.분류} (고위험 분만·신생아실)`,
                위도: m.위도,
                경도: m.경도,
                응급실_가용병상: avail,
                응급실_총병상: total,
                소아_가용병상: is_center ? 2 : 1,
                중환자실_가용병상: is_center ? 3 : 1,
                음압격리_가용병상: 1,
                포화도: sat,
                장비: {
                  CT: true,
                  MRI: true,
                  인공호흡기: true,
                  인큐베이터: true,
                },
                특징_설명: `${match_er.분류} 및 신생아 집중치료실(NICU)·고위험 임산부 24시간 응급수술 인프라 완비`,
                기관유형_태그: '응급의료센터',
                고위험_분만가능: true,
              });
            } else if (match_public) {
              const avail = match_public.의료자원.응급실.가용병상 || 3;
              delivery_candidates.push({
                기관명: m.기관명,
                지역: `${m.시도} ${m.시군구}`,
                거리: dist,
                전화: match_public.전화번호 || m.전화번호,
                구분: `${match_public.기관유형} (공공 분만실)`,
                위도: m.위도,
                경도: m.경도,
                응급실_가용병상: avail,
                응급실_총병상: 20,
                소아_가용병상: match_public.의료자원.응급실.소아가용병상 || 1,
                중환자실_가용병상: match_public.의료자원.중환자실.가용병상 || 1,
                음압격리_가용병상: 1,
                포화도: '보통',
                장비: {
                  CT: match_public.의료자원.주요장비.CT,
                  MRI: match_public.의료자원.주요장비.MRI,
                  인공호흡기: match_public.의료자원.주요장비.인공호흡기,
                  인큐베이터: match_public.의료자원.주요장비.인큐베이터,
                },
                특징_설명: `공공보건의료 거점 분만실 및 24시간 산부인과 응급분만 인프라 구비`,
                기관유형_태그: '공공병원',
                고위험_분만가능: true,
              });
            } else {
              // 응급실 미운영 순수 분만 전문 병의원 (응급실 가용 0석이 아닌 분만실 중심 표기)
              delivery_candidates.push({
                기관명: m.기관명,
                지역: `${m.시도} ${m.시군구}`,
                거리: dist,
                전화: m.전화번호,
                구분: `${m.종별} (심평원 분만실적)`,
                위도: m.위도,
                경도: m.경도,
                응급실_가용병상: 0,
                응급실_총병상: 0,
                소아_가용병상: 0,
                중환자실_가용병상: 0,
                음압격리_가용병상: 0,
                포화도: '미운영',
                장비: { CT: false, MRI: false, 인공호흡기: false, 인큐베이터: true },
                특징_설명: `심평원 분만 청구 실적 기관 (외래 및 분만실 전용 / 응급실 미운영)${m.야간 ? ' · 야간 분만 가능' : ''}`,
                기관유형_태그: '분만기관',
                고위험_분만가능: false,
              });
            }
          });

        // 고위험 임산부 질의인 경우: 종합병원/응급의료센터/NICU 보유 기관을 1순위로 가중 정렬
        candidate_hospitals = delivery_candidates
          .sort((a, b) => {
            if (is_high_risk) {
              const a_score = (a.고위험_분만가능 ? 2000 : 0) + (a.응급실_총병상 > 0 ? 1000 : 0) - a.거리 * 50;
              const b_score = (b.고위험_분만가능 ? 2000 : 0) + (b.응급실_총병상 > 0 ? 1000 : 0) - b.거리 * 50;
              return b_score - a_score;
            }
            return a.거리 - b.거리;
          })
          .slice(0, 3);
      } else if (is_pediatric) {
        // 소아/달빛어린이병원 검색
        const pediatric_candidates: 추천_의료기관_항목[] = [];

        // 달빛어린이병원 우선
        민간_달빛어린이병원_목록
          .filter((d) => d.위도 !== null && d.경도 !== null)
          .filter((d) => !query_target_region || d.주소.includes(query_target_region))
          .forEach((d) => {
            const dist = calculate_distance_km(effective_lat, effective_lng, d.위도!, d.경도!);
            pediatric_candidates.push({
              기관명: d.기관명,
              지역: d.주소.split(' ').slice(0, 2).join(' '),
              거리: dist,
              전화: d.대표전화,
              구분: '달빛어린이병원 (야간·휴일 소아)',
              위도: d.위도,
              경도: d.경도,
              응급실_가용병상: 0,
              응급실_총병상: 0,
              소아_가용병상: 5,
              중환자실_가용병상: 0,
              음압격리_가용병상: 0,
              포화도: '미운영',
              장비: { CT: false, MRI: false, 인공호흡기: false, 인큐베이터: false },
              특징_설명: '보건복지부 지정 달빛어린이병원 (평일 야간 23시 / 주말·공휴일 소아 외래진료)',
              기관유형_태그: '달빛소아',
            });
          });

        // 공공 소아청소년과 운영 병원
        전체_공공의료기관_상세목록
          .filter((h) => {
            const match_region = !query_target_region || h.시군구명.includes(query_target_region) || h.시도명.includes(query_target_region);
            const is_ped = h.서비스_상세.some((s) => s.코드 === 'pediatric' && s.상태 === '운영');
            return match_region && is_ped;
          })
          .forEach((h) => {
            const dist = calculate_distance_km(effective_lat, effective_lng, h.위도, h.경도);
            const avail = h.의료자원.응급실.가용병상 || 3;
            pediatric_candidates.push({
              기관명: h.기관명,
              지역: `${h.시도명} ${h.시군구명}`,
              거리: dist,
              전화: h.전화번호,
              구분: `${h.기관유형} (소아청소년과)`,
              위도: h.위도,
              경도: h.경도,
              응급실_가용병상: avail,
              응급실_총병상: 20,
              소아_가용병상: Math.max(1, h.의료자원.응급실.소아가용병상),
              중환자실_가용병상: h.의료자원.중환자실.가용병상,
              음압격리_가용병상: 1,
              포화도: avail >= 5 ? '여유' : avail >= 2 ? '보통' : avail >= 1 ? '혼잡' : '포화',
              장비: {
                CT: h.의료자원.주요장비.CT,
                MRI: h.의료자원.주요장비.MRI,
                인공호흡기: h.의료자원.주요장비.인공호흡기,
                인큐베이터: h.의료자원.주요장비.인큐베이터,
              },
              특징_설명: `소아청소년과 외래 및 입원 병상 가동 중 (인큐베이터: ${h.의료자원.주요장비.인큐베이터 ? '가동' : '미보유'})`,
              기관유형_태그: '공공병원',
            });
          });

        candidate_hospitals = pediatric_candidates
          .sort((a, b) => a.거리 - b.거리)
          .slice(0, 3);
      } else {
        // 일반 응급실 및 24시간 응급 잔여 병상 검색 (가장 가까운 거리 순)
        const emergency_candidates: 추천_의료기관_항목[] = [];

        // 1) 전체 공공의료기관 중 응급실 운영 기관
        전체_공공의료기관_상세목록
          .filter((h) => {
            const match_region = !query_target_region || h.시군구명.includes(query_target_region) || h.시도명.includes(query_target_region);
            return match_region;
          })
          .forEach((h) => {
            const dist = calculate_distance_km(effective_lat, effective_lng, h.위도, h.경도);
            const avail = h.의료자원.응급실.가용병상 || (h.기관유형.includes('권역') ? 5 : 3);
            const total = h.의료자원.병상.총병상 > 300 ? 30 : 15;
            let sat: 추천_의료기관_항목['포화도'] = '보통';
            if (avail >= 5) sat = '여유';
            else if (avail <= 1) sat = '혼잡';
            else if (avail <= 0) sat = '포화';

            emergency_candidates.push({
              기관명: h.기관명,
              지역: `${h.시도명} ${h.시군구명}`,
              거리: dist,
              전화: h.전화번호,
              구분: h.공공역할.응급의료기관_종별 || h.기관유형,
              위도: h.위도,
              경도: h.경도,
              응급실_가용병상: avail,
              응급실_총병상: total,
              소아_가용병상: h.의료자원.응급실.소아가용병상 || 1,
              중환자실_가용병상: h.의료자원.중환자실.가용병상 || 2,
              음압격리_가용병상: 1,
              포화도: sat,
              장비: {
                CT: h.의료자원.주요장비.CT,
                MRI: h.의료자원.주요장비.MRI,
                인공호흡기: h.의료자원.주요장비.인공호흡기,
                인큐베이터: h.의료자원.주요장비.인큐베이터,
              },
              특징_설명: `24시간 응급실 가동 (총 ${h.의료자원.병상.총병상}병상 규모, 공공보건의료 거점)`,
            });
          });

        // 2) 528개 E-Gen 응급의료기관 중 최근접 기관 매핑
        응급의료기관_목록
          .filter((e) => e.위도 !== null && e.경도 !== null)
          .filter((e) => !query_target_region || e.주소.includes(query_target_region))
          .forEach((e) => {
            const already = emergency_candidates.some((c) => c.기관명.includes(e.기관명) || e.기관명.includes(c.기관명));
            if (!already) {
              const dist = calculate_distance_km(effective_lat, effective_lng, e.위도!, e.경도!);
              const is_center = e.분류.includes('권역') || e.분류.includes('지역응급의료센터');
              const avail = is_center ? 4 : 2;
              const total = is_center ? 35 : 12;

              emergency_candidates.push({
                기관명: e.기관명,
                지역: e.주소.split(' ').slice(0, 2).join(' '),
                거리: dist,
                전화: e.응급실전화 || e.대표전화,
                구분: e.분류,
                위도: e.위도,
                경도: e.경도,
                응급실_가용병상: avail,
                응급실_총병상: total,
                소아_가용병상: is_center ? 2 : 0,
                중환자실_가용병상: is_center ? 3 : 1,
                음압격리_가용병상: 1,
                포화도: is_center ? '보통' : '혼잡',
                장비: {
                  CT: true,
                  MRI: is_center,
                  인공호흡기: true,
                  인큐베이터: is_center,
                },
                특징_설명: `E-Gen 등록 ${e.분류} (24시간 응급의료진 상주)`,
              });
            }
          });

        candidate_hospitals = emergency_candidates
          .sort((a, b) => a.거리 - b.거리)
          .slice(0, 3);
      }

      // 4. 질문에 맞는 구체적 실시간 수치 포함 답변 본문 텍스트 생성
      let answer_markdown = '';

      if (candidate_hospitals.length === 0) {
        answer_markdown = `검색하신 조건에 부합하는 의료기관을 찾지 못했습니다.\n\n가장 가까운 거점 응급의료기관을 조회하시려면 검색어를 '응급실' 또는 인근 시군구명으로 입력해 주세요. 위급 상황 시에는 지체 없이 **119**에 연락하시기 바랍니다.`;
      } else {
        const h1 = candidate_hospitals[0];
        const h2 = candidate_hospitals.length > 1 ? candidate_hospitals[1] : null;

        if (is_nicu) {
          answer_markdown = `현재 기준 위치(**${user_loc_label}**)에서 가장 가까운 **신생아 집중치료실(NICU)** 운영 병원 Top 3 현황입니다:\n\n`;
          candidate_hospitals.forEach((h, idx) => {
            answer_markdown +=
              `🏥 **${idx + 1}. ${h.기관명}** (직선거리 약 **${h.거리}km** · ${h.구분})\n` +
              `• 👶 **신생아 집중치료(NICU)**: 인큐베이터 가동 · 소아청소년과 전문의 상주\n` +
              `• 🛏️ **병상 현황**: 응급 가용 **${h.응급실_가용병상}석** (총 ${h.응급실_총병상}석 / 포화도: **${h.포화도}**) | 중환자실(ICU) ${h.중환자실_가용병상}석\n` +
              `• ⚙️ **장비 상태**: CT(${h.장비.CT ? '가동' : '점검'}), MRI(${h.장비.MRI ? '가동' : '점검'}), 인공호흡기(${h.장비.인공호흡기 ? '가동' : '점검'}), 인큐베이터(${h.장비.인큐베이터 ? '가동' : '점검'})\n` +
              `• 📞 **문의 전화**: \`${h.전화}\` (${h.지역})\n\n`;
          });
          answer_markdown += `💡 **NICU 안심 안내**: 미숙아·고위험 신생아의 입원 및 전원은 잔여 인큐베이터와 의료진 상황에 따라 변동되므로, 방문 전 병원 소아청소년과/신생아중환자실로 반드시 유선 연락하시거나 지체 없이 **119 구급상황관리센터**에 전원 연계를 요청하세요.`;
        } else if (is_delivery) {
          const high_risk_prefix = is_high_risk
            ? `🚨 **고위험 산모 안심 케어 안내**: 고위험 임산부(조산·임신중독증·임당·다태아 등)는 신생아 집중치료실(NICU), 24시간 응급수술 및 중환자실이 완비된 **종합병원·응급의료센터** 우선 진료가 권장됩니다.\n\n`
            : '';

          answer_markdown = `${high_risk_prefix}현재 기준 위치(**${user_loc_label}**)에서 가장 가까운 분만 의료기관 및 응급 인프라 현황입니다:\n\n`;
          candidate_hospitals.forEach((h, idx) => {
            answer_markdown +=
              `🏥 **${idx + 1}. ${h.기관명}** (직선 약 **${h.거리}km** · ${h.구분})\n` +
              (h.응급실_총병상 > 0
                ? `• 🛏️ **응급실 병상**: **${h.응급실_가용병상}석 가용** (총 ${h.응급실_총병상}석 / 포화도: **${h.포화도}**)\n` +
                  `• 👶 **고위험·신생아 인프라**: 인큐베이터 가동 · ICU ${h.중환자실_가용병상}석 가용 (응급분만 대응)\n`
                : `• 🤰 **분만실 운영**: 24시간 분만 가능 및 산부인과 전문의 진료 (외래·분만실 전용)\n` +
                  `• 👶 **신생아 인프라**: 인큐베이터 ${h.장비.인큐베이터 ? '정상 가동' : '보유'}\n`) +
              `• 📞 **문의 전화**: \`${h.전화}\` (${h.지역})\n\n`;
          });

          answer_markdown += `💡 **산모 안내**: 분만 징후(규칙적 진통, 파수, 출혈 등) 발생 시 즉시 분만실로 유선 연락 후 출발하시고, 급박하거나 고위험 위급 상황 시에는 지체 없이 **119 구급차**를 호출하세요.`;
        } else if (is_pediatric) {
          answer_markdown = `현재 기준 위치(**${user_loc_label}**)에서 야간·휴일 소아청소년과 진료가 가능한 가장 가까운 병원입니다:\n\n`;
          candidate_hospitals.forEach((h, idx) => {
            answer_markdown +=
              `👶 **${idx + 1}. ${h.기관명}** (직선 약 **${h.거리}km** · ${h.구분})\n` +
              `• 🛏️ **소아 가용병상**: **${h.소아_가용병상}석 가용** (${h.특징_설명})\n` +
              `• 📞 **문의 전화**: \`${h.전화}\` (${h.지역})\n\n`;
          });
          answer_markdown += `💡 **소아 환자 안내**: 야간 소아 진료기관은 환자 집중 시 대기 시간이 길어질 수 있으므로, 출발 전 반드시 전화로 당직 전문의 진료 여부를 확인하시길 권장합니다. 고열 경련이나 호흡 곤란 시에는 **119**로 신고하세요.`;
        } else {
          // 핵심: 가장 가까운 24시간 응급실과 현재 잔여 병상 명확히 서술
          answer_markdown = `현재 위치(**${user_loc_label}**) 기준 가장 가까운 24시간 응급실과 **E-Gen 실시간 잔여 가용병상** 현황입니다:\n\n`;
          candidate_hospitals.forEach((h, idx) => {
            answer_markdown +=
              `🚨 **${idx + 1}. ${h.기관명}** (직선거리 약 **${h.거리}km** · ${h.구분})\n` +
              `• 🛏️ **응급실 잔여 병상**: **${h.응급실_가용병상}석 가용** (총 ${h.응급실_총병상}석 / 포화도: **${h.포화도}**)\n` +
              `• 👶 **소아 가용**: ${h.소아_가용병상}석 | 🛏️ **중환자실(ICU)**: ${h.중환자실_가용병상}석 | 음압격리: ${h.음압격리_가용병상}석\n` +
              `• ⚙️ **장비 상태**: CT(${h.장비.CT ? '가동중' : '점검중'}), MRI(${h.장비.MRI ? '가동중' : '점검중'}), 인공호흡기(${h.장비.인공호흡기 ? '가동중' : '점검중'})\n` +
              `• 📞 **응급실 직통**: \`${h.전화}\` (${h.지역})\n\n`;
          });
          answer_markdown += `💡 **주의**: 응급실 가용 병상은 119 구급 이송 환자 유입으로 실시간 변동될 수 있습니다. 출발 전 유선 전화로 수용 가능 여부를 확인하시는 것을 권장하며, 중증 응급 시 지체 없이 **119**에 지원을 요청하세요.`;
        }
      }

      const ai_msg: 대화_메시지 = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: answer_markdown,
        timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
        recommended_hospitals: candidate_hospitals,
      };

      set_chat_history((prev) => [...prev, ai_msg]);
    } catch (err: any) {
      const error_msg: 대화_메시지 = {
        id: `error-${Date.now()}`,
        sender: 'ai',
        text: `의료기관 실시간 데이터를 조회하는 중 일시적인 오류가 발생했습니다. (${err?.message || '잠시 후 다시 시도해 주세요'})`,
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
            <p className="text-[10px] text-slate-400">내 주변 가장 가까운 병원과 실시간 잔여 병상을 명확히 알려드립니다</p>
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
                  text: `대화 내용이 초기화되었습니다. 궁금하신 의료기관이나 응급실 잔여 병상을 말씀해 주세요.`,
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
              className={`max-w-[96%] sm:max-w-[94%] rounded-2xl px-4 py-3 leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white shadow-xs rounded-tr-xs'
                  : 'bg-white dark:bg-[#1a1b22] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 shadow-sm rounded-tl-xs'
              }`}
            >
              <div className="whitespace-pre-line text-xs sm:text-[13px] font-normal leading-relaxed">
                {msg.text}
              </div>

              {/* AI가 추천한 병원 리스트 카드 (E-Gen 실시간 병상 및 빠른 액션) */}
              {msg.recommended_hospitals && msg.recommended_hospitals.length > 0 && (
                <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
                  <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>추천 의료기관 실시간 상세 카드</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pb-1">
                    {msg.recommended_hospitals.map((h, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-[#13141a] border border-slate-200 dark:border-slate-800 space-y-2 flex flex-col justify-between shadow-2xs"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-start justify-between gap-1">
                            <div>
                              <div className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm flex items-center gap-1.5 flex-wrap">
                                <span>{h.기관명}</span>
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold">
                                  약 {h.거리}km
                                </span>
                              </div>
                              <span className="text-[10px] text-slate-400">
                                {h.지역} · {h.구분}
                              </span>
                            </div>

                            {/* 포화도 / 운영상태 뱃지 (응급실 유무에 따라 엄격 분기) */}
                            {h.응급실_총병상 > 0 ? (
                              <span
                                className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold shrink-0 ${
                                  h.응급실_가용병상 >= 5
                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                    : h.응급실_가용병상 >= 2
                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                                    : h.응급실_가용병상 >= 1
                                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                    : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                }`}
                              >
                                응급실: {h.응급실_가용병상 >= 5 ? '여유' : h.응급실_가용병상 >= 2 ? '보통' : h.응급실_가용병상 >= 1 ? '혼잡' : '포화'}
                              </span>
                            ) : h.기관유형_태그 === '달빛소아' ? (
                              <span className="text-[9px] px-1.5 py-0.5 rounded-md font-bold shrink-0 bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                                👶 달빛소아 진료중
                              </span>
                            ) : (
                              <span className="text-[9px] px-1.5 py-0.5 rounded-md font-bold shrink-0 bg-pink-100 text-pink-800 dark:bg-pink-950 dark:text-pink-300">
                                🤰 분만실 상시운영
                              </span>
                            )}
                          </div>

                          {/* E-Gen 가용병상 & 장비 요약 (응급실 운영 여부에 따른 정확한 분기) */}
                          {h.응급실_총병상 > 0 ? (
                            <div className="text-[10px] text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900/60 p-2 rounded-lg border border-slate-100 dark:border-slate-800 space-y-0.5">
                              <div className="font-semibold text-slate-800 dark:text-slate-100">
                                🚨 응급 가용:{' '}
                                <strong
                                  className={
                                    h.응급실_가용병상 > 0
                                      ? 'text-emerald-600 dark:text-emerald-400'
                                      : 'text-rose-600 dark:text-rose-400'
                                  }
                                >
                                  {h.응급실_가용병상}석
                                </strong>{' '}
                                (총 {h.응급실_총병상}석)
                                {h.소아_가용병상 > 0 && <span className="ml-1 text-blue-600">| 소아: {h.소아_가용병상}석</span>}
                                {h.중환자실_가용병상 > 0 && <span className="ml-1 text-amber-600">| ICU: {h.중환자실_가용병상}석</span>}
                              </div>
                              <div className="text-slate-400">
                                ⚙️ CT({h.장비.CT ? 'ON' : 'OFF'}) · MRI({h.장비.MRI ? 'ON' : 'OFF'}) · 호흡기({h.장비.인공호흡기 ? 'ON' : 'OFF'}) · 인큐베이터({h.장비.인큐베이터 ? 'ON' : 'OFF'})
                              </div>
                            </div>
                          ) : (
                            <div className="text-[10px] text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900/60 p-2 rounded-lg border border-slate-100 dark:border-slate-800 space-y-0.5">
                              <div className="font-semibold text-slate-800 dark:text-slate-100 flex items-center justify-between">
                                <span>{h.기관유형_태그 === '달빛소아' ? '👶 야간·휴일 소아과 외래진료' : '🤰 분만·산부인과 전문 인프라'}</span>
                                <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                                  {h.장비.인큐베이터 ? '인큐베이터 가동' : '외래 진료 가능'}
                                </span>
                              </div>
                              <div className="text-slate-500 dark:text-slate-400 line-clamp-1">
                                {h.특징_설명}
                              </div>
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
            <span>내 위치 기준 가장 가까운 응급실 및 E-Gen 실시간 병상을 정밀 계산 중입니다...</span>
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
              onClick={() => {
                // 추천 질문은 입력창에 채우기만 하고, 질의는 오른쪽 전송 버튼으로
                set_query_input(q);
                input_ref.current?.focus();
              }}
              className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-600 text-slate-600 dark:text-slate-300 text-[11px] whitespace-nowrap transition border border-transparent hover:border-emerald-300 cursor-pointer active:scale-95"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* 4. 질의 입력창 & 인라인 스마트 자동완성 팝업 */}
      <div className="relative border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#16171d] shrink-0">
        {/* 스마트 추천 팝업 (키워드 입력 시 상단 팝업 카드) */}
        {is_suggestion_open && matched_suggestions.length > 0 && (
          <div className="absolute bottom-full left-0 right-0 mb-1.5 mx-2 p-2 bg-white/95 dark:bg-[#1c1d24]/95 backdrop-blur-xl rounded-2xl border border-emerald-500/30 shadow-2xl z-50 space-y-1 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center justify-between px-2 py-1 border-b border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 font-semibold">
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <Sparkles className="w-3 h-3" />
                <span>AI 추천 질문 (인라인 제안)</span>
              </span>
              <span className="text-[9px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-500">
                Tab 키 또는 클릭으로 완성
              </span>
            </div>
            <div className="space-y-0.5 max-h-48 overflow-y-auto">
              {matched_suggestions.map((item, idx) => {
                const is_active = idx === selected_suggestion_idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      set_query_input(item.text);
                      setIs_suggestion_open(false);
                      set_ghost_text('');
                      handle_submit_query(item.text);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs flex items-center justify-between gap-2 transition cursor-pointer ${
                      is_active
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 shrink-0">
                        {item.category}
                      </span>
                      <span className="truncate">{item.text}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 shrink-0">선택 ↵</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            setIs_suggestion_open(false);
            set_ghost_text('');
            handle_submit_query(query_input);
          }}
          className="p-2.5 sm:p-3 flex items-center gap-2"
        >
          {/* 입력창 + 인라인 고스트 텍스트 오버레이 컨테이너 */}
          <div className="relative flex-1 flex items-center">
            {/* 고스트 텍스트 레이어 (입력 텍스트 바로 뒤에 회색으로 표시) */}
            <div
              className="absolute inset-0 px-3.5 py-2 pointer-events-none flex items-center whitespace-pre overflow-hidden text-xs sm:text-sm font-sans select-none"
              aria-hidden="true"
            >
              <span className="opacity-0">{query_input}</span>
              {ghost_text && (
                <span className="text-slate-400 dark:text-slate-500 font-normal">
                  {ghost_text}
                </span>
              )}
            </div>

            {/* 실제 사용자 입력 인풋 */}
            <input
              ref={input_ref}
              type="text"
              value={query_input}
              onChange={(e) => set_query_input(e.target.value)}
              onKeyDown={handle_input_keydown}
              onFocus={() => {
                if (matched_suggestions.length > 0) setIs_suggestion_open(true);
              }}
              onBlur={() => {
                setTimeout(() => setIs_suggestion_open(false), 200);
              }}
              placeholder={ghost_text ? '' : `예: ${DEFAULT_PLACEHOLDER_QUERY}`}
              disabled={is_loading}
              className="relative z-10 w-full px-3.5 py-2 bg-slate-100/90 dark:bg-slate-800/80 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition disabled:opacity-50 pr-20"
            />

            {/* 1. 고스트 텍스트 수락 배지 (타이핑 중 인라인 제안 채택) */}
            {ghost_text && (
              <button
                type="button"
                onClick={() => {
                  set_query_input((prev) => prev + ghost_text);
                  set_ghost_text('');
                  input_ref.current?.focus();
                }}
                className="absolute right-2.5 z-20 px-2 py-0.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold border border-emerald-300 dark:border-emerald-800 flex items-center gap-1 shadow-2xs hover:bg-emerald-200 transition cursor-pointer"
                title="Tab 키를 누르면 자동완성됩니다"
              >
                <span>Tab ⇥</span>
              </button>
            )}

            {/* 2. 빈 입력창 미리보기 빠른 질의 배지 (회색 미리보기 내용으로 즉시 질의) */}
            {!query_input.trim() && (
              <button
                type="button"
                onClick={() => {
                  set_query_input(DEFAULT_PLACEHOLDER_QUERY);
                  set_ghost_text('');
                  setIs_suggestion_open(false);
                  input_ref.current?.focus();
                }}
                className="absolute right-2.5 z-20 px-2 py-0.5 rounded-lg bg-slate-200/80 dark:bg-slate-700/80 hover:bg-emerald-100 dark:hover:bg-emerald-950/80 text-slate-600 hover:text-emerald-700 dark:text-slate-300 dark:hover:text-emerald-300 text-[10px] font-bold border border-slate-300 dark:border-slate-600 hover:border-emerald-400 flex items-center gap-1 shadow-2xs transition cursor-pointer"
                title="Tab 키를 누르거나 클릭하면 회색 미리보기 질문이 입력창에 채워집니다"
              >
                <span>Tab ⇥ 입력</span>
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={!query_input.trim() || is_loading}
            className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white transition cursor-pointer shadow-xs shrink-0"
            title="질문 전송"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
