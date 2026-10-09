import { describe, it, expect, afterEach, vi } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { 비밀번호_검증, 인증_토큰_생성, 인증_토큰_검증, 인증_유효기간_초 } from './사이트_인증';
import { POST as 로그인 } from '@/app/api/auth/login/route';
import { middleware } from '@/middleware';
import { NextRequest } from 'next/server';

const 요청 = (url: string, init?: { cookie?: string; body?: unknown }) =>
  new NextRequest(new URL(url, 'http://localhost'), {
    method: init?.body ? 'POST' : 'GET',
    headers: { 'content-type': 'application/json', ...(init?.cookie ? { cookie: init.cookie } : {}) },
    body: init?.body ? JSON.stringify(init.body) : undefined,
  });

describe('사이트 인증 (서버 측)', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('서버 환경변수 SITE_PASSWORD 와 일치할 때만 통과하고, 설정이 없으면 항상 실패한다', async () => {
    vi.stubEnv('SITE_PASSWORD', 'test-pass-1');
    expect(await 비밀번호_검증('test-pass-1')).toBe(true);
    expect(await 비밀번호_검증(' test-pass-1 ')).toBe(true);
    expect(await 비밀번호_검증('test-pass-2')).toBe(false);
    expect(await 비밀번호_검증('')).toBe(false);
    vi.stubEnv('SITE_PASSWORD', '');
    expect(await 비밀번호_검증('test-pass-1')).toBe(false);
  });

  it('토큰: 서명이 맞고 만료 전일 때만 유효, 위조·만료·비밀번호 변경 시 무효', async () => {
    vi.stubEnv('SITE_PASSWORD', 'test-pass-1');
    const now = Date.now();
    const t = (await 인증_토큰_생성(now))!;
    expect(await 인증_토큰_검증(t, now)).toBe(true);
    expect(await 인증_토큰_검증(t.slice(0, -2) + 'xx', now)).toBe(false);
    expect(await 인증_토큰_검증(t.replace(/^v1\.\d+/, 'v1.9999999999'), now)).toBe(false);
    expect(await 인증_토큰_검증(t, now + (인증_유효기간_초 + 1) * 1000)).toBe(false);
    vi.stubEnv('SITE_PASSWORD', 'changed');
    expect(await 인증_토큰_검증(t, now)).toBe(false);
  });

  it('로그인 API: 맞으면 HttpOnly 쿠키 발급, 틀리면 401, 미설정이면 503', async () => {
    vi.stubEnv('SITE_PASSWORD', 'test-pass-1');
    const ok = await 로그인(요청('/api/auth/login', { body: { password: 'test-pass-1' } }));
    expect(ok.status).toBe(200);
    expect(ok.headers.get('set-cookie')).toMatch(/site_auth=v1\..*HttpOnly/i);
    const bad = await 로그인(요청('/api/auth/login', { body: { password: 'nope' } }));
    expect(bad.status).toBe(401);
    expect(bad.headers.get('set-cookie')).toBeNull();
    vi.stubEnv('SITE_PASSWORD', '');
    expect((await 로그인(요청('/api/auth/login', { body: { password: 'x' } }))).status).toBe(503);
  });

  it('미들웨어: 쿠키 없으면 페이지는 /login 으로, API는 401; 유효 쿠키면 통과', async () => {
    vi.stubEnv('SITE_PASSWORD', 'test-pass-1');
    const page = await middleware(요청('/'));
    expect(page.status).toBe(307);
    expect(page.headers.get('location')).toMatch(/\/login$/);
    expect((await middleware(요청('/api/llm/compare'))).status).toBe(401);
    const t = await 인증_토큰_생성();
    const pass = await middleware(요청('/', { cookie: `site_auth=${t}` }));
    expect(pass.headers.get('x-middleware-next')).toBe('1');
  });

  it('클라이언트 코드(src/components, src/app 페이지)에 비밀번호 상수가 없다', () => {
    const 파일들: string[] = [];
    const 순회 = (d: string) =>
      readdirSync(d).forEach((f) => {
        const p = join(d, f);
        if (statSync(p).isDirectory()) 순회(p);
        else if (/\.tsx?$/.test(f)) 파일들.push(p);
      });
    순회(join(process.cwd(), 'src'));
    const 옛_비밀번호 = ['nmc', '2026*'].join('');
    for (const p of 파일들.filter((f) => !f.endsWith('.test.ts'))) expect(readFileSync(p, 'utf-8'), p).not.toContain(옛_비밀번호);
  });
});
