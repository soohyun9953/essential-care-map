/**
 * 의료서비스_검색_엔진.ts
 *
 * Essential Care Map: 공공의료 의사결정 지도 통합 검색 및 자원 매핑 엔진
 * - 9대 Quick Filter (응급, 중증, 심뇌혈관, 소아, 분만, 투석, 정신건강, 재활, 입원)
 * - 214개 공공의료기관 전수 DB 연계 및 정밀 필터링
 * - 서비스별 운영 상태 (운영, 제한/확인필요, 미운영, 정보없음)
 * - 의료자원 (병상, 중환자실, 수술실, 응급실, 의료인력, 주요 장비)
 * - AI 자연어 검색 질의 파서
 */

import { 전국_공공의료기관_목록, 공공의료기관_정보 } from './공공의료기관_데이터셋';
import { get_region_location, get_sgg_coordinates } from './시군구_경계_데이터';
import { get_public_hospital_coords } from './공공의료기관_좌표_데이터';
import { 분만가능_의료기관_목록, 분만가능_의료기관, 분만가능_의료기관_출처 } from './분만가능_의료기관_데이터셋';

// 기관명 비교용 정규화 (괄호 표기·공백·법인 명칭 제거)
export function 기관명_정규화(name: string): string {
  return name.replace(/\(.*?\)/g, '').replace(/\s|주식회사|의료법인|재단법인|학교법인|사회복지법인/g, '');
}

// 심평원 분만가능 의료기관 목록 (정규화 기관명 → 기관). 공공병원과는 정규화 기관명이 정확히 일치할 때만 대응
const 분만가능_기관_색인 = new Map<string, 분만가능_의료기관>(
  분만가능_의료기관_목록.map((h) => [기관명_정규화(h.기관명), h])
);

export function 분만가능_기관_조회(기관명: string): 분만가능_의료기관 | undefined {
  return 분만가능_기관_색인.get(기관명_정규화(기관명));
}

export type 의료서비스_코드 =
  | 'emergency'     // 응급
  | 'severe'        // 중증
  | 'cardio_cerebro'// 심뇌혈관
  | 'pediatric'     // 소아
  | 'delivery'      // 분만
  | 'dialysis'      // 투석
  | 'mental'        // 정신건강
  | 'rehab'         // 재활
  | 'inpatient';    // 입원

export interface 퀵필터_항목 {
  id: 의료서비스_코드;
  라벨: string;
  설명: string;
  아이콘_이름: string;
}

export const 주요_9대_퀵필터_목록: 퀵필터_항목[] = [
  { id: 'emergency', 라벨: '응급', 설명: '24시간 응급실 및 응급의료센터', 아이콘_이름: 'Activity' },
  { id: 'severe', 라벨: '중증', 설명: '중환자실 및 고난도 중증 치료', 아이콘_이름: 'ShieldAlert' },
  { id: 'cardio_cerebro', 라벨: '심뇌혈관', 설명: '급성 뇌경색·심근경색 골든타임 진료', 아이콘_이름: 'Heart' },
  { id: 'pediatric', 라벨: '소아', 설명: '소아청소년과 외래·입원 및 달빛어린이병원', 아이콘_이름: 'Baby' },
  { id: 'delivery', 라벨: '분만', 설명: '분만 산부인과 및 신생아실', 아이콘_이름: 'Sparkles' },
  { id: 'dialysis', 라벨: '투석', 설명: '만성신부전 인공신장실 혈액투석', 아이콘_이름: 'Droplet' },
  { id: 'mental', 라벨: '정신건강', 설명: '정신응급 입원 및 심리상담 치료', 아이콘_이름: 'Brain' },
  { id: 'rehab', 라벨: '재활', 설명: '전문 재활치료 및 로봇·소아재활', 아이콘_이름: 'UserCheck' },
  { id: 'inpatient', 라벨: '입원', 설명: '간호간병통합서비스 및 일반입원병상', 아이콘_이름: 'Bed' },
];

export type 서비스_운영_상태 = '운영' | '확인필요' | '미운영' | '정보없음';

export interface 개별_의료서비스_상태 {
  코드: 의료서비스_코드;
  서비스명: string;
  상태: 서비스_운영_상태;
  비고: string;
  근거?: '청구실적' | '추정'; // 청구실적: 심평원 공개 목록 기반 / 추정: 기관 유형·규모 기반
}

export interface 기관_의료자원_현황 {
  병상: {
    총병상: number;
    사용병상: number;
    가용병상: number;
    가동률: number; // %
  };
  중환자실: {
    총병상: number;
    가용병상: number;
  };
  수술실: {
    총실: number;
    가동실: number;
  };
  응급실: {
    구분: string;
    가용병상: number;
    소아가용병상: number;
    상태: '여유' | '보통' | '혼잡' | '포화';
  };
  의료인력: {
    전체의사수: number;
    전문의수: number;
    간호사수: number;
    충원율: number; // %
  };
  주요장비: {
    CT: boolean;
    MRI: boolean;
    인공호흡기: boolean;
    인큐베이터: boolean;
    혈액투석기: number;
  };
}

export interface 공공의료기관_상세_프로필 {
  id: string;
  기관명: string;
  기관유형: string; // 권역책임의료기관, 지역책임의료기관, 특수공공병원 등
  공공의료기관_여부: boolean;
  시도명: string;
  시군구명: string;
  진료권명: string;
  주소: string;
  전화번호: string;
  홈페이지: string;
  운영시간: string;
  위도: number;
  경도: number;
  거리_km?: number;
  
  운영_상태: '정상운영' | '부분운영' | '확인필요';
  주요_의료서비스: string[];
  서비스_상세: 개별_의료서비스_상태[];
  의료자원: 기관_의료자원_현황;
  
  공공역할: {
    지역책임의료기관_여부: boolean;
    응급의료기관_종별: string;
    취약계층_지원사업: string[];
    퇴원환자_연계_협력: boolean;
    특화_공공보건사업: string[];
  };

  데이터_신뢰성: {
    기준시점: string; // 예: 2026.09.23 09:32
    출처: string;
    최종수집: string;
    갱신주기: string;
    상태: '정상' | '확인필요' | '지연';
  };
}

export interface 검색_필터_옵션 {
  키워드?: string;
  시도명?: string;
  시군구명?: string;
  진료권명?: string;
  선택된_서비스: 의료서비스_코드[];
  기관유형?: '전체' | '권역책임' | '지역책임' | '특수공공';
  운영상태?: '전체' | '정상운영' | '확인필요';
  정렬?: '추천순' | '거리순' | '병상순' | '이름순';
  기준_위도?: number;
  기준_경도?: number;
}

// =============================================================================
// 214개 공공병원 데이터 기반 상세 인메모리 DB 생성
// =============================================================================
function generate_hospital_profiles(): 공공의료기관_상세_프로필[] {
  return 전국_공공의료기관_목록.map((h, idx) => {
    const [lat, lng] = get_public_hospital_coords(h.id, h.시군구명, h.시도명);

    const is_regional = h.그룹 === '권역';
    const is_local = h.그룹 === '지역';
    const is_senior = h.그룹 === '노인';
    const is_mental = h.그룹 === '정신';
    const is_rehab = h.그룹 === '재활(소아)';
    // 급성기(중환자·심뇌혈관) 진료와 무관한 특수목적 병원 (병상 규모와 관계없이 미운영으로 추정)
    const is_non_acute = is_senior || is_mental || is_rehab || h.그룹 === '치과' || h.그룹 === '한방';
    // 급성기 서비스 공통 추정: 권역 기관 또는 일정 규모 초과 지역 기관만 운영, 특수목적 병원은 미운영,
    // 보훈·암·산재·감염 병원 등은 확인필요
    const 급성기_추정 = (지역_병상_기준: number): 서비스_운영_상태 =>
      is_regional || (is_local && h.병상수 > 지역_병상_기준) ? '운영' : is_non_acute ? '미운영' : '확인필요';

    // 주요 의료서비스 태그 결정
    const services: string[] = [];
    if (is_regional) services.push('중증응급', '심뇌혈관', '중환자치료', '고위험분만', '소아입원');
    else if (is_local) services.push('지역응급', '인공신장투석', '일반입원', '소아외래', '재활');
    else if (is_senior) services.push('노인전문', '치매안심', '재활', '호스피스');
    else if (is_mental) services.push('정신건강', '정신응급', '위기상담');
    else if (is_rehab) services.push('전문재활', '소아발달', '물리치료');
    else services.push('공공진료', '건강검진', '필수의료');

    // 9대 서비스별 운영 여부: 실제 연계 데이터가 없어 기관 유형·병상 규모로 추정한 값
    // ('운영' = 운영 추정, '미운영' = 미운영 추정). 개별 서비스의 세부 내용은 임의로 기재하지 않음
    const 추정_비고 = '기관 유형·병상 규모 기반 추정 (방문 전 기관 확인 필요)';
    const 분만_실적 = 분만가능_기관_조회(h.기관명);
    const service_details: 개별_의료서비스_상태[] = [
      {
        코드: 'emergency',
        서비스명: '응급실 (24시간)',
        상태: is_regional || is_local ? '운영' : is_senior || is_rehab ? '미운영' : '확인필요',
        비고: 추정_비고,
      },
      {
        코드: 'severe',
        서비스명: '중환자 치료',
        상태: 급성기_추정(250),
        비고: 추정_비고,
      },
      {
        코드: 'cardio_cerebro',
        서비스명: '급성 심뇌혈관',
        상태: 급성기_추정(300),
        비고: 추정_비고,
      },
      {
        코드: 'pediatric',
        서비스명: '소아청소년과',
        상태: is_regional || is_local ? '운영' : is_rehab ? '운영' : '미운영',
        비고: 추정_비고,
      },
      {
        코드: 'delivery',
        서비스명: '분만 산부인과',
        // 심평원 분만가능 의료기관 목록(분만 청구 실적) 등재 여부로 판정
        상태: 분만_실적 ? '운영' : '미운영',
        비고: 분만_실적
          ? `심평원 분만가능 의료기관 목록 등재 (${분만가능_의료기관_출처.산출기간}${분만_실적.야간 ? ', 야간 분만 실적 있음' : ''}) · 방문 전 확인 필요`
          : `심평원 분만가능 의료기관 목록 미등재 (${분만가능_의료기관_출처.산출기간} 기준)`,
        근거: '청구실적',
      },
      {
        코드: 'dialysis',
        서비스명: '혈액투석(인공신장)',
        상태: is_regional || is_local ? '운영' : '미운영',
        비고: 추정_비고,
      },
      {
        코드: 'mental',
        서비스명: '정신건강의학과',
        상태: is_mental ? '운영' : is_regional ? '운영' : '확인필요',
        비고: 추정_비고,
      },
      {
        코드: 'rehab',
        서비스명: '전문 재활치료',
        상태: is_rehab || is_senior ? '운영' : is_regional || is_local ? '운영' : '확인필요',
        비고: 추정_비고,
      },
      {
        코드: 'inpatient',
        서비스명: '일반 입원 및 간호간병',
        상태: '운영',
        비고: 추정_비고,
      },
    ];

    // 병상 및 장비 가용량 시뮬레이션
    const total_beds = h.병상수;
    const occ_rate = Math.min(96, Math.max(68, 75 + (idx % 18)));
    const used_beds = Math.round((total_beds * occ_rate) / 100);
    const avail_beds = Math.max(2, total_beds - used_beds);

    // 중환자실 규모(추정): 중환자 치료 미운영 추정 기관은 0 (서비스 상태와 일치)
    const icu_total = is_non_acute ? 0 : Math.max(4, Math.round(total_beds * 0.06));
    const icu_avail = icu_total === 0 ? 0 : Math.max(1, Math.round(icu_total * 0.15));

    const or_total = Math.max(2, Math.round(total_beds * 0.025));
    const or_active = Math.max(1, or_total - (idx % 2));

    const er_avail = Math.max(1, (idx % 7) + 1);

    const doctors_count = Math.max(5, Math.round(total_beds / (is_senior ? 25 : is_regional ? 4 : 8)));
    const nurses_count = Math.round(doctors_count * 2.8);

    return {
      id: h.id,
      기관명: h.기관명,
      기관유형: `${h.그룹}거점 (${h.기관구분})`,
      공공의료기관_여부: true,
      시도명: h.시도명,
      시군구명: h.시군구명,
      진료권명: h.진료권명,
      // 내장 데이터셋에는 상세 주소·홈페이지·진료시간이 없으므로 임의로 만들지 않음
      주소: `${h.시도명} ${h.시군구명}`,
      전화번호: h.대표전화,
      홈페이지: '',
      운영시간: '내장 데이터 미제공 (기관에 문의)',
      위도: lat,
      경도: lng,
      운영_상태: '확인필요', // 실제 운영 상태 연계 없음
      주요_의료서비스: services,
      서비스_상세: service_details,
      의료자원: {
        병상: {
          총병상: total_beds,
          사용병상: used_beds,
          가용병상: avail_beds,
          가동률: occ_rate,
        },
        중환자실: {
          총병상: icu_total,
          가용병상: icu_avail,
        },
        수술실: {
          총실: or_total,
          가동실: or_active,
        },
        응급실: {
          구분: is_regional ? '권역응급의료센터' : is_local ? '지역응급의료기관' : '응급진료실',
          가용병상: er_avail,
          소아가용병상: Math.max(0, (idx % 3) - 1),
          상태: er_avail <= 2 ? '혼잡' : er_avail <= 4 ? '보통' : '여유',
        },
        의료인력: {
          전체의사수: doctors_count,
          전문의수: Math.max(3, Math.round(doctors_count * 0.85)),
          간호사수: nurses_count,
          충원율: Math.min(98, 82 + (idx % 15)),
        },
        주요장비: {
          CT: total_beds > 100,
          MRI: total_beds > 200,
          인공호흡기: total_beds > 80,
          인큐베이터: is_regional || h.병상수 > 350,
          혈액투석기: is_local || is_regional ? Math.max(10, Math.round(total_beds * 0.08)) : 0,
        },
      },
      공공역할: {
        지역책임의료기관_여부: is_local || is_regional,
        응급의료기관_종별: is_regional ? '권역센터' : is_local ? '지역센터/기관' : '미지정',
        취약계층_지원사업: ['의료급여수급권자 본인부담 감면', '행려환자 무료 진료', '취약계층 간병비 지원'],
        퇴원환자_연계_협력: true,
        특화_공공보건사업: ['방문보건의료', '치매안심네트워크', '감염병 격리병상 가동', '지역사회 통합돌봄'],
      },
      // 실제 데이터 상태를 그대로 표기 (자동 수집·갱신 연계는 아직 없음)
      데이터_신뢰성: {
        기준시점: '2024년 기준',
        출처: '플랫폼 내장 공공의료기관 데이터셋 (2024년 기준)',
        최종수집: '자동 수집 미연동',
        갱신주기: '수동 업데이트 (자동 갱신 미지원)',
        상태: '확인필요',
      },
    };
  });
}

export const 전체_공공의료기관_상세목록: 공공의료기관_상세_프로필[] = generate_hospital_profiles();

// =============================================================================
// 통합 검색 및 필터링 엔진
// =============================================================================
export class 의료서비스_검색_엔진 {
  /**
   * 다면 필터 및 키워드 기반 의료기관 검색
   */
  public static search_hospitals(
    options: 검색_필터_옵션,
    dataset: 공공의료기관_상세_프로필[] = 전체_공공의료기관_상세목록
  ): 공공의료기관_상세_프로필[] {
    let result = [...dataset];

    // 1. 키워드 검색 (기관명, 시도, 시군구, 주소, 서비스명)
    if (options.키워드 && options.키워드.trim()) {
      const q = options.키워드.trim().toLowerCase();
      result = result.filter(
        (h) =>
          h.기관명.toLowerCase().includes(q) ||
          h.시도명.toLowerCase().includes(q) ||
          h.시군구명.toLowerCase().includes(q) ||
          h.진료권명.toLowerCase().includes(q) ||
          h.주요_의료서비스.some((s) => s.toLowerCase().includes(q))
      );
    }

    // 2. 지역 필터
    if (options.시도명 && options.시도명 !== '전체') {
      result = result.filter((h) => h.시도명.includes(options.시도명!));
    }
    if (options.시군구명 && options.시군구명 !== '전체') {
      result = result.filter((h) => h.시군구명.includes(options.시군구명!));
    }
    if (options.진료권명 && options.진료권명 !== '전체') {
      result = result.filter((h) => h.진료권명.includes(options.진료권명!));
    }

    // 3. 9대 퀵필터 의료서비스 조건 필터 (선택된 서비스가 '운영' 중인 기관)
    if (options.선택된_서비스 && options.선택된_서비스.length > 0) {
      result = result.filter((h) => {
        return options.선택된_서비스.every((code) => {
          const detail = h.서비스_상세.find((s) => s.코드 === code);
          return detail?.상태 === '운영';
        });
      });
    }

    // 4. 기관 유형 필터
    if (options.기관유형 && options.기관유형 !== '전체') {
      if (options.기관유형 === '권역책임') {
        result = result.filter((h) => h.기관유형.includes('권역'));
      } else if (options.기관유형 === '지역책임') {
        result = result.filter((h) => h.기관유형.includes('지역'));
      } else if (options.기관유형 === '특수공공') {
        result = result.filter((h) => !h.기관유형.includes('권역') && !h.기관유형.includes('지역'));
      }
    }

    // 5. 운영 상태 필터
    if (options.운영상태 && options.운영상태 !== '전체') {
      result = result.filter((h) => h.운영_상태 === options.운영상태);
    }

    // 6. 기준 위치 기반 거리 계산 (거리 km)
    if (options.기준_위도 && options.기준_경도) {
      result = result.map((h) => {
        const d = this.calculate_distance_km(options.기준_위도!, options.기준_경도!, h.위도, h.경도);
        return { ...h, 거리_km: +(d.toFixed(1)) };
      });
    }

    // 7. 정렬
    if (options.정렬 === '거리순' && options.기준_위도) {
      result.sort((a, b) => (a.거리_km ?? 9999) - (b.거리_km ?? 9999));
    } else if (options.정렬 === '병상순') {
      result.sort((a, b) => b.의료자원.병상.총병상 - a.의료자원.병상.총병상);
    } else if (options.정렬 === '이름순') {
      result.sort((a, b) => a.기관명.localeCompare(b.기관명));
    } else {
      // 추천순: 권역/지역 거점 가중치 및 병상 규모 고려
      result.sort((a, b) => {
        const scoreA = (a.공공역할.지역책임의료기관_여부 ? 100 : 0) + a.의료자원.병상.총병상 * 0.1;
        const scoreB = (b.공공역할.지역책임의료기관_여부 ? 100 : 0) + b.의료자원.병상.총병상 * 0.1;
        return scoreB - scoreA;
      });
    }

    return result;
  }

  /**
   * 두 좌표 간 하버사인 거리 계산 (km)
   */
  private static calculate_distance_km(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // 지구 반지름 (km)
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * [Phase 7] AI 자연어 질의 파서
   * 예: "서울 동북권에서 현재 소아 진료가 가능한 공공의료기관을 찾아줘."
   * -> { 진료권명: '서울동북', 선택된_서비스: ['pediatric'], 키워드: '소아' }
   */
  public static parse_natural_language_search(query: string): Partial<검색_필터_옵션> {
    const options: Partial<검색_필터_옵션> = {
      선택된_서비스: [],
    };

    const text = query.trim();

    // 1. 서비스 키워드 감지
    if (/응급|24시간|구급/i.test(text)) options.선택된_서비스!.push('emergency');
    if (/중증|중환자/i.test(text)) options.선택된_서비스!.push('severe');
    if (/심뇌|뇌경색|뇌출혈|심근경색|심장/i.test(text)) options.선택된_서비스!.push('cardio_cerebro');
    if (/소아|어린이|아이|달빛/i.test(text)) options.선택된_서비스!.push('pediatric');
    if (/분만|산부인과|출산|신생아/i.test(text)) options.선택된_서비스!.push('delivery');
    if (/투석|신부전|인공신장/i.test(text)) options.선택된_서비스!.push('dialysis');
    if (/정신|우울|스트레스|심리/i.test(text)) options.선택된_서비스!.push('mental');
    if (/재활|물리치료/i.test(text)) options.선택된_서비스!.push('rehab');
    if (/입원|간호간병/i.test(text)) options.선택된_서비스!.push('inpatient');

    // 2. 지역 키워드 감지
    const sido_names = ['서울', '부산', '대구', '인천', '광주', '대전', '울산', '세종', '경기', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주'];
    for (const sido of sido_names) {
      if (text.includes(sido)) {
        options.시도명 = sido;
        break;
      }
    }

    // 진료권 감지
    if (/서울동북/i.test(text)) options.진료권명 = '서울동북';
    else if (/서울서북/i.test(text)) options.진료권명 = '서울서북';
    else if (/서울동남/i.test(text)) options.진료권명 = '서울동남';
    else if (/서울서남/i.test(text)) options.진료권명 = '서울서남';

    // 3. 기관 유형
    if (/권역|상급/i.test(text)) options.기관유형 = '권역책임';
    else if (/지방의료원|지역책임/i.test(text)) options.기관유형 = '지역책임';

    options.키워드 = text;
    return options;
  }
}
