// 브라우저 API 키 저장소
// - 기본: sessionStorage (탭/브라우저를 닫으면 자동 삭제)
// - '이 기기에 저장' 선택 시에만 localStorage에 보관
// 읽기는 sessionStorage → localStorage 순으로 조회하므로 기존에 localStorage에 저장된 키도 그대로 동작합니다.

export type API키_이름 = 'google_gemini_api_key' | 'data_go_kr_api_key';

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
    if (!value) return;
    (remember_on_device ? localStorage : sessionStorage).setItem(name, value);
  }, undefined);
}

export function API키_삭제하기(name: API키_이름): void {
  API키_저장하기(name, '', false);
}
