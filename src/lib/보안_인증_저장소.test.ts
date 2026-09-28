import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  verify_site_password,
  get_site_auth_status,
  set_site_auth_status,
  NMC_SITE_PASSWORD,
} from './보안_인증_저장소';

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
  clear() {
    this.map.clear();
  }
}

let session: 메모리_저장소;
let local: 메모리_저장소;

describe('보안_인증_저장소 단위 테스트', () => {
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

  it('하드코딩된 패스워드 nmc2026*와 일치할 때만 true를 반환한다', () => {
    expect(verify_site_password('nmc2026*')).toBe(true);
    expect(verify_site_password(' nmc2026* ')).toBe(true); // trim 허용
    expect(verify_site_password('wrong_password')).toBe(false);
    expect(verify_site_password('')).toBe(false);
    expect(verify_site_password('nmc2026')).toBe(false);
    expect(verify_site_password('NMC2026*')).toBe(false);
  });

  it('패스워드 상수가 nmc2026*로 설정되어 있어야 한다', () => {
    expect(NMC_SITE_PASSWORD).toBe('nmc2026*');
  });

  it('인증 상태를 저장하고 조회할 수 있어야 한다', () => {
    expect(get_site_auth_status()).toBe(false);

    set_site_auth_status(true);
    expect(get_site_auth_status()).toBe(true);

    set_site_auth_status(false);
    expect(get_site_auth_status()).toBe(false);
  });
});
