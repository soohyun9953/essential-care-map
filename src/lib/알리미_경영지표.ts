// 지역거점공공병원 알리미 공시값으로 경영지표를 계산하고, 공시기관 전체 분포와 비교한다.
// - 모든 비율은 공시값을 그대로 나눈 값이며 보정·추정하지 않는다
// - 재무건전성 점수는 플랫폼 자체 산식: 같은 연도 공시기관 중 상대 위치(백분위)의 평균

import { 알리미_기관_공시_목록, type 알리미_기관_공시, type 알리미_연도별_공시 } from './알리미_경영공시_데이터셋';
import { 병원명_키 } from './공공병원_실데이터_연계';
import { 전국_공공의료기관_목록 } from './공공의료기관_데이터셋';

export interface 알리미_경영지표 {
  연도: number;
  의료이익률: number | null; // 의료이익 ÷ 의료수익 × 100
  당기순이익률: number | null; // 당기순이익 ÷ 의료수익 × 100
  인건비율: number | null; // 인건비 지출(수입·지출 현황) ÷ 의료수익 × 100 (인건비 0 공시는 미공시로 봄)
  지원금_비율: number | null; // 정부·지자체 지원금 합계 ÷ 의료수익 × 100
  부채비율: number | null; // 부채총계 ÷ 자산총계 × 100
  자본잠식: boolean | null; // 자본총계 < 0
  의사직_현원: number | null;
  간호직_현원: number | null;
  직원_현원: number | null;
  병상당_의사직: number | null; // 100병상당 의사직 현원 (허가병상: 공공의료기관 데이터셋)
  병상당_간호직: number | null; // 100병상당 간호직 현원
}

const 비율 = (a: number | null, b: number | null) =>
  a === null || b === null || b === 0 ? null : Math.round((a / b) * 1000) / 10;

export function 경영지표_계산(r: 알리미_연도별_공시, 병상수: number | null = null): 알리미_경영지표 {
  const 지원금 = r.정부지원금 === null && r.지자체지원금 === null ? null : (r.정부지원금 ?? 0) + (r.지자체지원금 ?? 0);
  return {
    연도: r.연도,
    의료이익률: 비율(r.의료이익, r.의료수익),
    당기순이익률: 비율(r.당기순이익, r.의료수익),
    인건비율: r.인건비 ? 비율(r.인건비, r.의료수익) : null,
    지원금_비율: 비율(지원금, r.의료수익),
    부채비율: 비율(r.부채총계, r.자산총계),
    자본잠식: r.자본총계 === null ? null : r.자본총계 < 0,
    의사직_현원: r.의사직_현원,
    간호직_현원: r.간호직_현원,
    직원_현원: r.직원_현원,
    병상당_의사직: 비율(r.의사직_현원, 병상수),
    병상당_간호직: 비율(r.간호직_현원, 병상수),
  };
}

// 다른 목록의 기관명 → 알리미 표기 (같은 기관인데 표기가 다른 경우)
const 별칭: Record<string, string> = {
  인천의료원백령도분원: '인천의료원백령병원',
};

export function 알리미_공시_조회(기관명: string): 알리미_기관_공시 | undefined {
  const 원래키 = 병원명_키(기관명);
  const key = 별칭[원래키] ?? 원래키;
  return 알리미_기관_공시_목록.find((h) => 병원명_키(h.기관명) === key);
}

/** 알리미 기관의 허가병상 (공공의료기관 데이터셋, 이름으로 연결) */
export function 알리미_병상수(h: 알리미_기관_공시): number | null {
  const key = 병원명_키(h.기관명);
  return 전국_공공의료기관_목록.find((p) => 병원명_키(p.기관명) === key)?.병상수 ?? null;
}

/** 결산(의료수익)이 공시된 가장 최근 연도 */
export function 최근_결산연도(h: 알리미_기관_공시): 알리미_연도별_공시 | undefined {
  return [...h.연도별].reverse().find((r) => r.의료수익 !== null);
}

export type 비교_지표 = '의료이익률' | '당기순이익률' | '인건비율' | '지원금_비율' | '부채비율' | '병상당_의사직' | '병상당_간호직';

/** 높을수록 좋은 지표인지 */
export const 지표_방향: Record<비교_지표, '높을수록_좋음' | '낮을수록_좋음'> = {
  의료이익률: '높을수록_좋음',
  당기순이익률: '높을수록_좋음',
  인건비율: '낮을수록_좋음',
  지원금_비율: '낮을수록_좋음',
  부채비율: '낮을수록_좋음',
  병상당_의사직: '높을수록_좋음',
  병상당_간호직: '높을수록_좋음',
};

/** 같은 연도 공시기관의 지표값 목록 */
function 연도별_지표값(지표: 비교_지표, 연도: number, 유형?: 알리미_기관_공시['유형']): number[] {
  return 알리미_기관_공시_목록
    .filter((h) => !유형 || h.유형 === 유형)
    .map((h) => {
      const r = h.연도별.find((x) => x.연도 === 연도);
      return r ? 경영지표_계산(r, 알리미_병상수(h))[지표] : null;
    })
    .filter((v): v is number => v !== null);
}

export interface 지표_분포 {
  기관수: number;
  평균: number;
  중앙값: number;
  상위25: number; // 좋은 쪽 25% 경계
}

function 분위(sorted: number[], q: number): number {
  const i = (sorted.length - 1) * q;
  const lo = Math.floor(i);
  const hi = Math.ceil(i);
  return Math.round((sorted[lo] + (sorted[hi] - sorted[lo]) * (i - lo)) * 10) / 10;
}

/** 같은 연도 공시기관(유형 지정 시 해당 유형만)의 지표 분포 */
export function 지표_분포_계산(
  지표: 비교_지표,
  연도: number,
  유형?: 알리미_기관_공시['유형']
): 지표_분포 | null {
  const values = 연도별_지표값(지표, 연도, 유형).sort((a, b) => a - b);
  if (values.length === 0) return null;
  const 평균 = Math.round((values.reduce((s, v) => s + v, 0) / values.length) * 10) / 10;
  return {
    기관수: values.length,
    평균,
    중앙값: 분위(values, 0.5),
    상위25: 분위(values, 지표_방향[지표] === '높을수록_좋음' ? 0.75 : 0.25),
  };
}

/** 같은 연도 공시기관 중 상대 위치 (0 = 가장 나쁨, 100 = 가장 좋음) */
export function 지표_백분위(지표: 비교_지표, 연도: number, 값: number): number | null {
  const values = 연도별_지표값(지표, 연도);
  if (values.length < 2) return null;
  const 좋음 = 지표_방향[지표] === '높을수록_좋음';
  const 더나쁨 = values.filter((v) => (좋음 ? v < 값 : v > 값)).length;
  const 같음 = values.filter((v) => v === 값).length - 1;
  return Math.round(((더나쁨 + 같음 / 2) / (values.length - 1)) * 100);
}

export interface 재무건전성_평가 {
  연도: number;
  점수: number; // 0~100
  구성: { 지표: 비교_지표; 값: number; 백분위: number }[];
}

/** 재무건전성 점수: 의료이익률·당기순이익률·인건비율의 공시기관 내 백분위 평균 (플랫폼 자체 산식) */
export function 재무건전성_평가(h: 알리미_기관_공시): 재무건전성_평가 | null {
  const r = 최근_결산연도(h);
  if (!r) return null;
  const m = 경영지표_계산(r);
  const 구성 = (['의료이익률', '당기순이익률', '인건비율'] as 비교_지표[])
    .map((지표) => {
      const 값 = m[지표];
      const 백분위 = 값 === null ? null : 지표_백분위(지표, r.연도, 값);
      return 값 === null || 백분위 === null ? null : { 지표, 값, 백분위 };
    })
    .filter((x): x is { 지표: 비교_지표; 값: number; 백분위: number } => x !== null);
  if (구성.length === 0) return null;
  return { 연도: r.연도, 점수: Math.round(구성.reduce((s, x) => s + x.백분위, 0) / 구성.length), 구성 };
}
