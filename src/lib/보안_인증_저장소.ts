// 국립중앙의료원 공공보건의료 플랫폼 - 보안 로그인 및 접근 제어 저장소
// 일반인 무단 접근 방지를 위한 패스워드 인증 시스템

export const NMC_SITE_PASSWORD = 'nmc2026*';
export const AUTH_STORAGE_KEY = 'nmc_essential_care_auth';
export const AUTH_TOKEN_VALUE = 'nmc_authorized_2026_pass';

/**
 * 입력된 패스워드가 하드코딩된 패스워드와 일치하는지 검증합니다.
 */
export function verify_site_password(input: string): boolean {
  if (!input) return false;
  return input.trim() === NMC_SITE_PASSWORD;
}

/**
 * 브라우저 스토리지에서 현재 인증 상태를 확인합니다.
 */
export function get_site_auth_status(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const session_val = sessionStorage.getItem(AUTH_STORAGE_KEY);
    if (session_val === AUTH_TOKEN_VALUE) return true;

    const local_val = localStorage.getItem(AUTH_STORAGE_KEY);
    if (local_val === AUTH_TOKEN_VALUE) {
      // 세션에도 동기화
      sessionStorage.setItem(AUTH_STORAGE_KEY, AUTH_TOKEN_VALUE);
      return true;
    }
  } catch (err) {
    console.error('인증 상태 조회 오류:', err);
  }
  return false;
}

/**
 * 패스워드 인증 성공 시 인증 상태를 저장합니다.
 */
export function set_site_auth_status(authenticated: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    if (authenticated) {
      sessionStorage.setItem(AUTH_STORAGE_KEY, AUTH_TOKEN_VALUE);
      localStorage.setItem(AUTH_STORAGE_KEY, AUTH_TOKEN_VALUE);
    } else {
      sessionStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  } catch (err) {
    console.error('인증 상태 저장 오류:', err);
  }
}
