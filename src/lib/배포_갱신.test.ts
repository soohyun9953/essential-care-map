import { describe, it, expect, afterEach, vi } from 'vitest';
import { 조각_로드_오류인가, 한번만_새로고침 } from './배포_갱신';

describe('배포 후 이전 화면 오류 처리', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('이전 빌드 조각 로드 실패만 배포 오류로 본다', () => {
    const e = new Error('Loading chunk 821 failed.\n(error: http://localhost:3000/_next/static/chunks/821.js)');
    e.name = 'ChunkLoadError';
    expect(조각_로드_오류인가(e)).toBe(true);
    expect(조각_로드_오류인가(new Error('Loading CSS chunk 12 failed'))).toBe(true);
    expect(조각_로드_오류인가(new TypeError('Failed to fetch dynamically imported module: /x.js'))).toBe(true);
    expect(조각_로드_오류인가(new TypeError("Cannot read properties of undefined (reading 'x')"))).toBe(false);
    expect(조각_로드_오류인가(undefined)).toBe(false);
  });

  it('30초 안에는 다시 새로고침하지 않아 무한 새로고침을 막는다', () => {
    const 저장 = new Map<string, string>();
    const reload = vi.fn();
    vi.stubGlobal('window', {
      sessionStorage: { getItem: (k: string) => 저장.get(k) ?? null, setItem: (k: string, v: string) => void 저장.set(k, v) },
      location: { reload },
    });
    expect(한번만_새로고침(1_000_000)).toBe(true);
    expect(한번만_새로고침(1_010_000)).toBe(false);
    expect(한번만_새로고침(1_031_000)).toBe(true);
    expect(reload).toHaveBeenCalledTimes(2);
  });
});
