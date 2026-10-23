// 브라우저 API 키 저장소
// - 기본: sessionStorage (탭/브라우저를 닫으면 자동 삭제)
// - '이 기기에 저장' 선택 시에만 localStorage에 보관
// 읽기는 sessionStorage → localStorage 순으로 조회하므로 기존에 localStorage에 저장된 키도 그대로 동작합니다.

export type API키_이름 =
  | 'google_gemini_api_key'
  | 'data_go_kr_api_key'
  | 'kakao_map_api_key';

const 안전_실행 = <T>(fn: () => T, fallback: T): T => {
  if (typeof window === 'undefined') return fallback;
  try {
    return fn();
  } catch {
    return fallback;
  }
};

export function API키_불러오기(name: API키_이름): string {
  return 안전_실행(
    () => sessionStorage.getItem(name) || localStorage.getItem(name) || '',
    ''
  );
}

// 현재 키가 기기(localStorage)에 영구 저장되어 있는지 여부
export function API키_기기저장_여부(name: API키_이름): boolean {
  return 안전_실행(() => !!localStorage.getItem(name), false);
}

export function API키_저장하기(name: API키_이름, value: string, remember_on_device: boolean): void {
  안전_실행(() => {
    sessionStorage.removeItem(name);
    localStorage.removeItem(name);
    if (value) {
      (remember_on_device ? localStorage : sessionStorage).setItem(name, value);
    }
    if (typeof window !== 'undefined') {
      try {
        window.dispatchEvent(new CustomEvent('app_api_key_updated', { detail: { name, value } }));
      } catch {}
    }
  }, undefined);
}

export function API키_삭제하기(name: API키_이름): void {
  API키_저장하기(name, '', false);
}

// 카카오 지도 API 키: 브라우저 저장소(session/local) 우선, 없으면 환경변수(NEXT_PUBLIC_KAKAO_MAP_KEY) 조회
export function 카카오_지도_API키_불러오기(): string {
  const stored = API키_불러오기('kakao_map_api_key');
  if (stored && stored.trim()) return stored.trim();
  const envKey = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY;
  if (envKey && envKey.trim()) return envKey.trim();
  return '';
}

