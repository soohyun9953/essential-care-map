// 사이트 접근 인증 (서버 측)
// - 비밀번호는 서버 환경변수 SITE_PASSWORD 에만 둔다 (브라우저 번들에 포함되지 않음)
// - 로그인 성공 시 HMAC 서명 쿠키를 발급하고, 미들웨어가 모든 페이지·API 요청에서 서명을 검증한다
// - Web Crypto만 사용하므로 미들웨어(Edge)와 API 라우트(Node) 양쪽에서 동작한다

export const 인증_쿠키_이름 = 'site_auth';
export const 인증_유효기간_초 = 60 * 60 * 24 * 7; // 7일

const 인코더 = new TextEncoder();

/** 서명 키: SITE_AUTH_SECRET 이 있으면 사용, 없으면 비밀번호에서 파생 (비밀번호를 바꾸면 기존 세션 무효) */
function 서명_키_원문(): string | null {
  const secret = process.env.SITE_AUTH_SECRET;
  if (secret) return secret;
  const password = process.env.SITE_PASSWORD;
  return password ? `site-password:${password}` : null;
}

export function 비밀번호_설정됨(): boolean {
  return Boolean(process.env.SITE_PASSWORD);
}

function base64url(bytes: ArrayBuffer): string {
  let s = '';
  new Uint8Array(bytes).forEach((b) => (s += String.fromCharCode(b)));
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function hmac(key_text: string, data: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', 인코더.encode(key_text), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return base64url(await crypto.subtle.sign('HMAC', key, 인코더.encode(data)));
}

/** 길이가 같은 문자열을 시간 차이 없이 비교 */
function 같음(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** 입력 비밀번호 검증. 서버에 비밀번호가 없으면 항상 실패(차단 유지). */
export async function 비밀번호_검증(input: string): Promise<boolean> {
  const password = process.env.SITE_PASSWORD;
  if (!password || !input) return false;
  // 두 값을 같은 키로 HMAC 해 고정 길이로 만든 뒤 비교 (길이·내용에 따른 시간 차이 방지)
  const key = `compare:${서명_키_원문()}`;
  return 같음(await hmac(key, input.trim()), await hmac(key, password));
}

/** 인증 쿠키 값 생성: v1.<만료시각>.<서명> */
export async function 인증_토큰_생성(now_ms: number = Date.now()): Promise<string | null> {
  const key = 서명_키_원문();
  if (!key) return null;
  const payload = `v1.${Math.floor(now_ms / 1000) + 인증_유효기간_초}`;
  return `${payload}.${await hmac(key, payload)}`;
}

/** 인증 쿠키 값 검증 (서명·만료) */
export async function 인증_토큰_검증(token: string | undefined | null, now_ms: number = Date.now()): Promise<boolean> {
  const key = 서명_키_원문();
  if (!key || !token) return false;
  const parts = token.split('.');
  if (parts.length !== 3 || parts[0] !== 'v1') return false;
  const exp = Number(parts[1]);
  if (!Number.isFinite(exp) || exp * 1000 < now_ms) return false;
  return 같음(await hmac(key, `${parts[0]}.${parts[1]}`), parts[2]);
}
