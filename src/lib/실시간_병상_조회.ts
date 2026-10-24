// E-Gen 응급실 실시간 가용병상 조회 (화면 공용)
// - /api/emergency/realtime 를 기관 소재 시군구별로 한 번씩 호출해 기관명으로 맞춘다
// - 실시간 연동(is_live_api)이 아니면 병상 수를 돌려주지 않는다 (내장 기준 데이터의 병상 수는 실제 값이 아님)

import { 전국_시군구_진단_데이터 } from './시군구_데이터셋';
import { 주소_지역_일치 } from './지역_의료자원_집계';
import type { 실시간_응급실_기관정보 } from './공공의료_자원_서비스';

export interface 실시간_조회_대상 {
  시도명: string;
  시군구명: string;
  기관명: string;
}

export interface 실시간_조회_결과 {
  /** 하나 이상의 시군구에서 E-Gen 실시간 응답을 받았는지 */
  연동됨: boolean;
  /** 대상 기관명 → 실시간 기관 정보 (실시간 목록에 없으면 null) */
  기관별: Map<string, 실시간_응급실_기관정보 | null>;
}

/** 주소(또는 '시도 시군구' 문자열)에서 시도·시군구 추출 */
export function 주소_시군구(주소: string): { 시도명: string; 시군구명: string } | null {
  const r = 전국_시군구_진단_데이터.find((x) => 주소_지역_일치(x.시도명, x.시군구명, 주소));
  return r ? { 시도명: r.시도명, 시군구명: r.시군구명 } : null;
}

const 압축 = (x: string) => x.replace(/\s/g, '');

export function 기관명_일치(a: string, b: string) {
  const x = 압축(a);
  const y = 압축(b);
  return x === y || x.includes(y) || y.includes(x);
}

export async function 실시간_병상_조회(대상: 실시간_조회_대상[]): Promise<실시간_조회_결과> {
  const 시군구들 = Array.from(new Map(대상.map((x) => [`${x.시도명}|${x.시군구명}`, x])).values());
  const 응답 = await Promise.all(
    시군구들.map((x) =>
      fetch(`/api/emergency/realtime?sido=${encodeURIComponent(x.시도명)}&sigungu=${encodeURIComponent(x.시군구명)}`)
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null)
    )
  );
  const 기관별 = new Map<string, 실시간_응급실_기관정보 | null>();
  const 연동됨 = 응답.some((d) => d?.is_live_api);
  if (!연동됨) return { 연동됨, 기관별 };
  const 병원들: 실시간_응급실_기관정보[] = 응답.flatMap((d) => (d?.is_live_api ? d.all_hospitals : []));
  for (const x of 대상) 기관별.set(x.기관명, 병원들.find((b) => 기관명_일치(b.기관명, x.기관명)) ?? null);
  return { 연동됨, 기관별 };
}
