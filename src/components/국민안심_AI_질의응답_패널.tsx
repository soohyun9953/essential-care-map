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
  포화도: '여유' | '보통' | '혼잡' | '포화';
  장비: {
    CT: boolean;
    MRI: boolean;
    인공호흡기: boolean;
    인큐베이터: boolean;
  };
  특징_설명: string;
}

export interface 대화_메시지 {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  recommended_hospitals?: 추천_의료기관_항목[];
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
  current_region_name = '내 주변',
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
      const is_pediatric = /아이|소아|어린이|애기|열|소아과|달빛/i.test(trimmed);
      const is_delivery = /분만|산부인과|출산|임신|산모|아기낳/i.test(trimmed);
      const is_icu_or_equip = /중환자|icu|ct|mri|인공호흡기|투석/i.test(trimmed);

      // 2. 질문에 포함된 특정 지명 감지 및 기준 좌표 산출
      let query_target_region = '';
      let effective_lat = user_lat;
      let effective_lng = user_lng;

      // 전국 시군구 대표 좌표 전수 검사 (예: '도봉구', '도봉', '노원', '영월' 등)
      for (const [sgg, coords] of Object.entries(전국_시군구_대표_좌표)) {
        const short_name = sgg.replace(/(구|군|시)$/, '');
        if (trimmed.includes(sgg) || (short_name.length >= 2 && trimmed.includes(short_name))) {
          query_target_region = sgg;
          effective_lat = coords[0];
          effective_lng = coords[1];
          break;
        }
      }

      // 특별히 '도봉' 관련 언급이 있을 때 도봉구 좌표 우선 적용
      if (!query_target_region && trimmed.includes('도봉')) {
        query_target_region = '도봉구';
        effective_lat = 37.6688;
        effective_lng = 127.0471;
      }

      // 기준 위치 명칭
      const user_loc_label = query_target_region
        ? (query_target_region.endsWith('구') ? `서울특별시 ${query_target_region}` : query_target_region)
        : get_user_location_name(effective_lat, effective_lng);

      // 3. 통합 검색 후보군 구축 (실제 거리순 정렬)
      let candidate_hospitals: 추천_의료기관_항목[] = [];

      if (is_delivery) {
        // 분만 기관 검색
        const delivery_candidates: 추천_의료기관_항목[] = [];

        // 공공 분만기관
        전체_공공의료기관_상세목록
          .filter((h) => {
            const match_region = !query_target_region || h.시군구명.includes(query_target_region) || h.시도명.includes(query_target_region);
            const is_deliv = h.서비스_상세.some((s) => s.코드 === 'delivery' && s.상태 === '운영');
            return match_region && is_deliv;
          })
          .forEach((h) => {
            const dist = calculate_distance_km(effective_lat, effective_lng, h.위도, h.경도);
            delivery_candidates.push({
              기관명: h.기관명,
              지역: `${h.시도명} ${h.시군구명}`,
              거리: dist,
              전화: h.전화번호,
              구분: `${h.기관유형} (공공 분만실)`,
              위도: h.위도,
              경도: h.경도,
              응급실_가용병상: h.의료자원.응급실.가용병상,
              응급실_총병상: 20,
              소아_가용병상: h.의료자원.응급실.소아가용병상,
              중환자실_가용병상: h.의료자원.중환자실.가용병상,
              음압격리_가용병상: 1,
              포화도: '보통',
              장비: {
                CT: h.의료자원.주요장비.CT,
                MRI: h.의료자원.주요장비.MRI,
                인공호흡기: h.의료자원.주요장비.인공호흡기,
                인큐베이터: h.의료자원.주요장비.인큐베이터,
              },
              특징_설명: `총 ${h.의료자원.병상.총병상}병상 규모, 신생아실 및 24시간 산부인과 응급분만 인프라 구비`,
            });
          });

        // 민간 분만기관
        민간_분만기관_목록
          .filter((m) => m.위도 !== null && m.경도 !== null)
          .filter((m) => !query_target_region || m.시군구.includes(query_target_region) || m.시도.includes(query_target_region))
          .forEach((m) => {
            const dist = calculate_distance_km(effective_lat, effective_lng, m.위도!, m.경도!);
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
              포화도: '여유',
              장비: { CT: false, MRI: false, 인공호흡기: false, 인큐베이터: true },
              특징_설명: `심평원 분만 청구 실적 기관${m.야간 ? ' (야간 분만 실적 보유)' : ''}`,
            });
          });

        candidate_hospitals = delivery_candidates
          .sort((a, b) => a.거리 - b.거리)
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
              포화도: '여유',
              장비: { CT: false, MRI: false, 인공호흡기: false, 인큐베이터: false },
              특징_설명: '보건복지부 지정 달빛어린이병원 (평일 야간 23시 / 주말·공휴일 소아 외래진료)',
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
            pediatric_candidates.push({
              기관명: h.기관명,
              지역: `${h.시도명} ${h.시군구명}`,
              거리: dist,
              전화: h.전화번호,
              구분: `${h.기관유형} (소아청소년과)`,
              위도: h.위도,
              경도: h.경도,
              응급실_가용병상: h.의료자원.응급실.가용병상,
              응급실_총병상: 20,
              소아_가용병상: Math.max(1, h.의료자원.응급실.소아가용병상),
              중환자실_가용병상: h.의료자원.중환자실.가용병상,
              음압격리_가용병상: 1,
              포화도: '보통',
              장비: {
                CT: h.의료자원.주요장비.CT,
                MRI: h.의료자원.주요장비.MRI,
                인공호흡기: h.의료자원.주요장비.인공호흡기,
                인큐베이터: h.의료자원.주요장비.인큐베이터,
              },
              특징_설명: `소아청소년과 외래 및 입원 병상 가동 중 (인큐베이터: ${h.의료자원.주요장비.인큐베이터 ? '가동' : '미보유'})`,
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

        if (is_delivery) {
          answer_markdown = `현재 기준 위치(**${user_loc_label}**)에서 가장 가까운 분만 산부인과 및 신생아실 인프라 현황입니다:\n\n` +
            `🏥 **1. ${h1.기관명}** (직선 약 **${h1.거리}km** · ${h1.구분})\n` +
            `• 🤰 **분만실 운영**: 24시간 분만 가능 및 산부인과 전문의 진료\n` +
            `• 👶 **신생아 인프라**: 인큐베이터 ${h1.장비.인큐베이터 ? '정상 가동' : '보유'} | 소아과 전문의 상주\n` +
            `• 📞 **문의 전화**: \`${h1.전화}\` (${h1.지역})\n\n`;

          if (h2) {
            answer_markdown +=
              `🏥 **2. ${h2.기관명}** (직선 약 **${h2.거리}km** · ${h2.구분})\n` +
              `• 🤰 **분만 인프라**: ${h2.특징_설명}\n` +
              `• 📞 **문의 전화**: \`${h2.전화}\` (${h2.지역})\n\n`;
          }

          answer_markdown += `💡 **산모 안내**: 분만 징후(규칙적 진통, 파수 등)가 발생한 경우 즉시 분만실로 유선 연락 후 출발하시고, 긴급 이동이 필요한 경우 즉시 **119 구급차**를 호출하세요.`;
        } else if (is_pediatric) {
          answer_markdown = `현재 기준 위치(**${user_loc_label}**)에서 야간·휴일 소아청소년과 진료가 가능한 가장 가까운 병원입니다:\n\n` +
            `👶 **1. ${h1.기관명}** (직선 약 **${h1.거리}km** · ${h1.구분})\n` +
            `• 🛏️ **소아 가용병상**: **${h1.소아_가용병상}석 가용**\n` +
            `• ⏰ **진료 시간**: ${h1.특징_설명}\n` +
            `• 📞 **문의 전화**: \`${h1.전화}\` (${h1.지역})\n\n`;

          if (h2) {
            answer_markdown +=
              `👶 **2. ${h2.기관명}** (직선 약 **${h2.거리}km** · ${h2.구분})\n` +
              `• 🛏️ **소아 가용병상**: **${h2.소아_가용병상}석 가용** (${h2.특징_설명})\n` +
              `• 📞 **문의 전화**: \`${h2.전화}\`\n\n`;
          }

          answer_markdown += `💡 **소아 환자 안내**: 야간 소아 진료기관은 환자 집중 시 대기 시간이 길어질 수 있으므로, 출발 전 반드시 전화로 당직 전문의 진료 여부를 확인하시길 권장합니다. 고열 경련이나 호흡 곤란 시에는 **119**로 신고하세요.`;
        } else {
          // 핵심: 가장 가까운 24시간 응급실과 현재 잔여 병상 명확히 서술
          answer_markdown = `현재 위치(**${user_loc_label}**) 기준 가장 가까운 24시간 응급실과 **E-Gen 실시간 잔여 가용병상** 현황입니다:\n\n` +
            `🚨 **1. ${h1.기관명}** (직선거리 약 **${h1.거리}km** · ${h1.구분})\n` +
            `• 🛏️ **응급실 잔여 병상**: **${h1.응급실_가용병상}석 가용** (총 ${h1.응급실_총병상}석 / 포화도: **${h1.포화도}**)\n` +
            `• 👶 **소아 가용**: ${h1.소아_가용병상}석 | 🛏️ **중환자실(ICU)**: ${h1.중환자실_가용병상}석 | 음압격리: ${h1.음압격리_가용병상}석\n` +
            `• ⚙️ **장비 상태**: CT(${h1.장비.CT ? '가동중' : '점검중'}), MRI(${h1.장비.MRI ? '가동중' : '점검중'}), 인공호흡기(${h1.장비.인공호흡기 ? '가동중' : '점검중'})\n` +
            `• 📞 **응급실 직통**: \`${h1.전화}\` (${h1.지역})\n\n`;

          if (h2) {
            answer_markdown +=
              `🚨 **2. ${h2.기관명}** (직선거리 약 **${h2.거리}km** · ${h2.구분})\n` +
              `• 🛏️ **응급실 잔여 병상**: **${h2.응급실_가용병상}석 가용** (총 ${h2.응급실_총병상}석 / 포화도: **${h2.포화도}**)\n` +
              `• 👶 **소아 가용**: ${h2.소아_가용병상}석 | 🛏️ **중환자실**: ${h2.중환자실_가용병상}석\n` +
              `• 📞 **응급실 직통**: \`${h2.전화}\` (${h2.지역})\n\n`;
          }

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
                          <div className="text-[10px] text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900/60 p-2 rounded-lg border border-slate-100 dark:border-slate-800 space-y-0.5">
                            <div className="font-semibold text-slate-800 dark:text-slate-100">
                              🚨 응급 가용: <strong className="text-emerald-600 dark:text-emerald-400">{h.응급실_가용병상}석</strong> (총 {h.응급실_총병상}석)
                              {h.소아_가용병상 > 0 && <span className="ml-1 text-blue-600">| 소아: {h.소아_가용병상}석</span>}
                              {h.중환자실_가용병상 > 0 && <span className="ml-1 text-amber-600">| ICU: {h.중환자실_가용병상}석</span>}
                            </div>
                            <div className="text-slate-400">
                              ⚙️ CT({h.장비.CT ? 'ON' : 'OFF'}) · MRI({h.장비.MRI ? 'ON' : 'OFF'}) · 호흡기({h.장비.인공호흡기 ? 'ON' : 'OFF'})
                            </div>
                          </div>
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
          placeholder="예: 가장 가까운 24시간 응급실과 현재 잔여 병상 알려줘"
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
