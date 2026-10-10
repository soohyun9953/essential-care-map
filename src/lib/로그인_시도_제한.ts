// 로그인 시도 제한 (무차별 대입 방지)
// - 접속 IP별로 실패 횟수를 세어, 15분 안에 5번 틀리면 15분 동안 로그인을 막는다
// - 로그인에 성공하면 해당 IP의 실패 기록을 지운다
// - 서버 메모리에 보관하므로 서버 인스턴스마다 따로 센다. 여러 인스턴스에 걸친 차단은
//   Vercel 방화벽(WAF) 요청 제한 규칙으로 보완한다

export const 최대_실패_횟수 = 5;
export const 실패_집계_구간_ms = 15 * 60 * 1000; // 15분
export const 차단_시간_ms = 15 * 60 * 1000; // 15분
const 최대_기록_수 = 10_000; // 메모리 상한 (초과 시 만료 기록부터 정리)

interface 시도_기록 {
  실패_횟수: number;
  첫_실패_시각: number;
  차단_해제_시각: number; // 0이면 차단 아님
}

const 기록 = new Map<string, 시도_기록>();

export interface 시도_상태 {
  차단됨: boolean;
  /** 차단 중일 때 남은 시간(초) */
  남은_초: number;
}

function 만료됨(r: 시도_기록, now: number): boolean {
  if (r.차단_해제_시각) return r.차단_해제_시각 <= now;
  return now - r.첫_실패_시각 > 실패_집계_구간_ms;
}

function 정리(now: number) {
  기록.forEach((r, key) => {
    if (만료됨(r, now)) 기록.delete(key);
  });
  // 그래도 넘치면 오래된 것부터 삭제 (Map은 삽입 순서 유지)
  if (기록.size >= 최대_기록_수) {
    let 삭제할_수 = 기록.size - 최대_기록_수 + 1;
    기록.forEach((_r, key) => {
      if (삭제할_수-- > 0) 기록.delete(key);
    });
  }
}

/** 현재 차단 여부 확인 */
export function 시도_상태_확인(key: string, now: number = Date.now()): 시도_상태 {
  const r = 기록.get(key);
  if (!r) return { 차단됨: false, 남은_초: 0 };
  if (만료됨(r, now)) {
    기록.delete(key);
    return { 차단됨: false, 남은_초: 0 };
  }
  if (r.차단_해제_시각) return { 차단됨: true, 남은_초: Math.ceil((r.차단_해제_시각 - now) / 1000) };
  return { 차단됨: false, 남은_초: 0 };
}

/** 실패 기록. 한도에 도달하면 차단 상태를 돌려준다 */
export function 실패_기록(key: string, now: number = Date.now()): 시도_상태 {
  let r = 기록.get(key);
  if (r && 만료됨(r, now)) {
    기록.delete(key);
    r = undefined;
  }
  if (!r) {
    if (기록.size >= 최대_기록_수) 정리(now);
    r = { 실패_횟수: 0, 첫_실패_시각: now, 차단_해제_시각: 0 };
    기록.set(key, r);
  }
  r.실패_횟수 += 1;
  if (r.실패_횟수 >= 최대_실패_횟수) {
    r.차단_해제_시각 = now + 차단_시간_ms;
    return { 차단됨: true, 남은_초: Math.ceil(차단_시간_ms / 1000) };
  }
  return { 차단됨: false, 남은_초: 0 };
}

/** 로그인 성공 시 기록 삭제 */
export function 성공_기록(key: string) {
  기록.delete(key);
}

/** 남은 실패 허용 횟수 (안내 문구용) */
export function 남은_시도_횟수(key: string, now: number = Date.now()): number {
  const r = 기록.get(key);
  if (!r || 만료됨(r, now)) return 최대_실패_횟수;
  return Math.max(0, 최대_실패_횟수 - r.실패_횟수);
}

/** 요청 헤더에서 접속 IP 추출 (Vercel은 x-real-ip / x-forwarded-for 를 직접 설정) */
export function 접속_IP(headers: Headers): string {
  const real = headers.get('x-real-ip')?.trim();
  if (real) return real;
  const fwd = headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  return fwd || 'unknown';
}

/** 차단 안내 문구 */
export function 차단_안내(남은_초: number): string {
  const 분 = Math.max(1, Math.ceil(남은_초 / 60));
  return `로그인 시도가 너무 많아 잠시 차단되었습니다. 약 ${분}분 후 다시 시도해주세요.`;
}

/** 테스트용 초기화 */
export function 기록_초기화() {
  기록.clear();
}
