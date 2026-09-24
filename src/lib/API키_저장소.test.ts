import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { API키_불러오기, API키_기기저장_여부, API키_저장하기, API키_삭제하기 } from './API키_저장소';

// 브라우저 Storage 최소 구현 (node 환경에서 sessionStorage/localStorage 대체)
class 메모리_저장소 {
  private map = new Map<string, string>();
  getItem(k: string) {
    return this.map.has(k) ? this.map.get(k)! : null;
  }
  setItem(k: string, v: string) {
    this.map.set(k, v);
  }
  removeItem(k: string) {
    this.map.delete(k);
  }
}

let session: 메모리_저장소;
let local: 메모리_저장소;

beforeEach(() => {
  session = new 메모리_저장소();
  local = new 메모리_저장소();
  vi.stubGlobal('window', {});
  vi.stubGlobal('sessionStorage', session);
  vi.stubGlobal('localStorage', local);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('API키_저장소', () => {
  it('기본 저장은 sessionStorage (탭 종료 시 삭제)', () => {
    API키_저장하기('google_gemini_api_key', 'KEY1', false);
    expect(session.getItem('google_gemini_api_key')).toBe('KEY1');
    expect(local.getItem('google_gemini_api_key')).toBeNull();
    expect(API키_기기저장_여부('google_gemini_api_key')).toBe(false);
  });

  it("'이 기기에 저장' 선택 시에만 localStorage에 보관", () => {
    API키_저장하기('data_go_kr_api_key', 'KEY2', true);
    expect(local.getItem('data_go_kr_api_key')).toBe('KEY2');
    expect(session.getItem('data_go_kr_api_key')).toBeNull();
    expect(API키_기기저장_여부('data_go_kr_api_key')).toBe(true);
  });

  it('기존 localStorage 키(이전 버전 사용자)도 그대로 불러온다', () => {
    local.setItem('google_gemini_api_key', 'LEGACY');
    expect(API키_불러오기('google_gemini_api_key')).toBe('LEGACY');
  });

  it('저장 위치를 바꾸면 이전 위치의 키는 지워진다', () => {
    API키_저장하기('google_gemini_api_key', 'A', true);
    API키_저장하기('google_gemini_api_key', 'B', false);
    expect(local.getItem('google_gemini_api_key')).toBeNull();
    expect(API키_불러오기('google_gemini_api_key')).toBe('B');
  });

  it('삭제하면 양쪽 저장소에서 모두 지워진다', () => {
    session.setItem('google_gemini_api_key', 'S');
    local.setItem('google_gemini_api_key', 'L');
    API키_삭제하기('google_gemini_api_key');
    expect(API키_불러오기('google_gemini_api_key')).toBe('');
  });

  it('저장소 접근이 막힌 환경(시크릿 모드 등)에서도 예외 없이 빈 값', () => {
    vi.stubGlobal('sessionStorage', {
      getItem() {
        throw new Error('blocked');
      },
    });
    expect(API키_불러오기('google_gemini_api_key')).toBe('');
    expect(() => API키_저장하기('google_gemini_api_key', 'X', false)).not.toThrow();
  });

  it('서버 렌더링(window 없음)에서는 빈 값', () => {
    vi.stubGlobal('window', undefined);
    expect(API키_불러오기('google_gemini_api_key')).toBe('');
  });
});
