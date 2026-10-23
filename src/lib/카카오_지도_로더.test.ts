import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { loadKakaoMap, resetKakaoMapLoader, KakaoMapLoadError } from './카카오_지도_로더';
import * as API저장소 from './API키_저장소';

describe('카카오_지도_로더', () => {
  beforeEach(() => {
    vi.stubGlobal('window', {} as any);
    vi.stubGlobal('document', {
      getElementById: vi.fn().mockReturnValue(null),
      createElement: vi.fn(),
      head: { appendChild: vi.fn() },
    } as any);
    resetKakaoMapLoader();
  });

  afterEach(() => {
    resetKakaoMapLoader();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('SSR 환경(window 없음)에서는 SSR 에러로 reject된다', async () => {
    vi.stubGlobal('window', undefined);
    await expect(loadKakaoMap('TEST_KEY')).rejects.toMatchObject({ code: 'SSR' });
  });

  it('API 키가 없으면 NO_KEY 에러로 reject된다', async () => {
    vi.spyOn(API저장소, '카카오_지도_API키_불러오기').mockReturnValue('');
    await expect(loadKakaoMap()).rejects.toThrowError(KakaoMapLoadError);
    await expect(loadKakaoMap()).rejects.toMatchObject({ code: 'NO_KEY' });
  });

  it('이미 window.kakao.maps가 존재하고 로드된 상태면 해당 객체를 바로 반환한다', async () => {
    const fakeMaps = {
      Map: vi.fn(),
      load: (cb: () => void) => cb(),
    };
    (window as any).kakao = { maps: fakeMaps };

    const result = await loadKakaoMap('TEST_KEY');
    expect(result).toBe(fakeMaps);
  });
});
