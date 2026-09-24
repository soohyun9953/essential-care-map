import { describe, it, expect, afterEach, vi } from 'vitest';
import { 로컬_LLM_허용, 서버_Gemini_키_허용 } from './서버_환경설정';

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('로컬_LLM_허용', () => {
  it('LOCAL_LLM_ENABLED 미지정 시 개발 환경에서만 허용', () => {
    vi.stubEnv('LOCAL_LLM_ENABLED', undefined as unknown as string);
    vi.stubEnv('NODE_ENV', 'development');
    expect(로컬_LLM_허용()).toBe(true);
    vi.stubEnv('NODE_ENV', 'production');
    expect(로컬_LLM_허용()).toBe(false);
  });

  it('LOCAL_LLM_ENABLED 명시 값이 NODE_ENV보다 우선', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('LOCAL_LLM_ENABLED', 'true');
    expect(로컬_LLM_허용()).toBe(true);
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('LOCAL_LLM_ENABLED', 'false');
    expect(로컬_LLM_허용()).toBe(false);
  });
});

describe('서버_Gemini_키_허용', () => {
  it('ALLOW_SERVER_GEMINI_KEY=true 일 때만 서버 키 사용 허용 (기본 차단)', () => {
    vi.stubEnv('ALLOW_SERVER_GEMINI_KEY', undefined as unknown as string);
    expect(서버_Gemini_키_허용()).toBe(false);
    vi.stubEnv('ALLOW_SERVER_GEMINI_KEY', '1');
    expect(서버_Gemini_키_허용()).toBe(false);
    vi.stubEnv('ALLOW_SERVER_GEMINI_KEY', 'true');
    expect(서버_Gemini_키_허용()).toBe(true);
  });
});
