// 카카오 지도 Web API 비동기 동적 스크립트 로더

import { 카카오_지도_API키_불러오기 } from './API키_저장소';

const KAKAO_SDK_SCRIPT_ID = 'kakao-maps-sdk-script';

let loadPromise: Promise<typeof window.kakao.maps> | null = null;
let currentLoadedKey: string | null = null;

export class KakaoMapLoadError extends Error {
  constructor(message: string, public readonly code?: string) {
    super(message);
    this.name = 'KakaoMapLoadError';
  }
}

/**
 * 카카오 지도 SDK를 동적으로 로드하고 kakao.maps 네임스페이스를 반환합니다.
 * @param overrideKey 선택적 API 키 (미지정 시 저장소/환경변수에서 자동 조회)
 */
export function loadKakaoMap(overrideKey?: string): Promise<typeof window.kakao.maps> {
  if (typeof window === 'undefined') {
    return Promise.reject(new KakaoMapLoadError('서버 사이드(SSR)에서는 카카오 지도를 로드할 수 없습니다.', 'SSR'));
  }

  const appKey = (overrideKey || 카카오_지도_API키_불러오기()).trim();

  if (!appKey) {
    return Promise.reject(
      new KakaoMapLoadError('카카오 지도 JavaScript API 키가 설정되지 않았습니다.', 'NO_KEY')
    );
  }

  // 이미 kakao.maps가 전역에 준비되어 사용 가능한 경우
  if (
    window.kakao &&
    window.kakao.maps &&
    typeof window.kakao.maps.Map === 'function'
  ) {
    currentLoadedKey = appKey;
    return Promise.resolve(window.kakao.maps);
  }

  // 키가 바뀌었거나 재로드가 필요한 경우 기존 스크립트 제거
  if (currentLoadedKey && currentLoadedKey !== appKey) {
    const existingScript = document.getElementById(KAKAO_SDK_SCRIPT_ID);
    if (existingScript) {
      existingScript.remove();
    }
    loadPromise = null;
  }

  if (loadPromise) {
    return loadPromise;
  }

  loadPromise = new Promise((resolve, reject) => {
    // 이미 HTML에 스크립트가 존재하는지 확인
    let script = document.getElementById(KAKAO_SDK_SCRIPT_ID) as HTMLScriptElement | null;

    const onScriptLoaded = () => {
      if (!window.kakao || !window.kakao.maps) {
        loadPromise = null;
        reject(
          new KakaoMapLoadError(
            '카카오 지도 SDK 스크립트가 로드되었으나 window.kakao.maps 객체를 찾을 수 없습니다. 도메인 등록(http://localhost:3000)을 확인해주세요.',
            'INIT_FAILED'
          )
        );
        return;
      }

      try {
        window.kakao.maps.load(() => {
          currentLoadedKey = appKey;
          resolve(window.kakao.maps);
        });
      } catch (err: any) {
        loadPromise = null;
        reject(
          new KakaoMapLoadError(
            `카카오 지도 초기화(kakao.maps.load) 중 오류가 발생했습니다: ${err?.message || err}`,
            'INIT_FAILED'
          )
        );
      }
    };

    if (script) {
      if (window.kakao && window.kakao.maps && typeof window.kakao.maps.Map === 'function') {
        currentLoadedKey = appKey;
        resolve(window.kakao.maps);
        return;
      }
      script.addEventListener('load', onScriptLoaded, { once: true });
      return;
    }

    script = document.createElement('script');
    script.id = KAKAO_SDK_SCRIPT_ID;
    script.type = 'text/javascript';
    script.async = true;
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${encodeURIComponent(
      appKey
    )}&autoload=false&libraries=services,clusterer,drawing`;

    script.onload = onScriptLoaded;
    script.onerror = () => {
      loadPromise = null;
      script?.remove();
      reject(
        new KakaoMapLoadError(
          '카카오 지도 SDK 스크립트 다운로드에 실패했습니다. JavaScript 키 및 네트워크 연결을 확인해주세요.',
          'SCRIPT_ERROR'
        )
      );
    };

    document.head.appendChild(script);
  });

  return loadPromise;
}

/**
 * 카카오 지도 SDK가 현재 브라우저에 로드되어 인스턴스화 가능한지 확인
 */
export function isKakaoMapLoaded(): boolean {
  return (
    typeof window !== 'undefined' &&
    !!window.kakao &&
    !!window.kakao.maps &&
    typeof window.kakao.maps.Map === 'function'
  );
}

/**
 * 카카오 지도 SDK 캐시 초기화 (API 키 변경 시 호출)
 */
export function resetKakaoMapLoader(): void {
  loadPromise = null;
  currentLoadedKey = null;
  if (typeof document !== 'undefined') {
    const existing = document.getElementById(KAKAO_SDK_SCRIPT_ID);
    if (existing) existing.remove();
  }
}
