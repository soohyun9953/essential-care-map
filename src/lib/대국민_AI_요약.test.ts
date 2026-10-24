import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { Gemini_키_정리, Gemini_키_형식, 실시간_줄_정리, 요약_프롬프트, 요청_허용, 분당_최대 } from './대국민_AI_요약';
import { 공개정보_안내 } from './대국민_공개정보_안내_엔진';
import { POST } from '@/app/api/citizen/ask/route';

const 요청 = (body: unknown, ip = '10.0.0.1') =>
  new NextRequest('http://localhost/api/citizen/ask', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-forwarded-for': ip },
    body: JSON.stringify(body),
  });

describe('1-4 Gemini 요약: 프롬프트·보조 함수', () => {
  it('프롬프트에는 근거 자료·실시간·출처 번호와 "근거 밖 내용 금지" 규칙이 들어간다', () => {
    const 답변 = 공개정보_안내('동대구역 근처 NICU 있는 병원');
    const p = 요약_프롬프트('동대구역 근처 NICU 있는 병원', 답변, ['· 대구파티마병원: 신생아중환자실 가용 4']);
    expect(p).toContain('근거 자료에 없는 병원명·숫자·전화번호');
    expect(p).toContain('119');
    expect(p).toContain('대구파티마병원');
    expect(p).toContain('신생아중환자실 가용 4');
    expect(p).toContain('[1] 국립중앙의료원');
  });

  it('실시간 줄은 문자열만, 최대 8줄·160자로 자른다', () => {
    const 줄 = 실시간_줄_정리(['a'.repeat(500), 3, ...Array(20).fill('x')]);
    expect(줄).toHaveLength(8);
    expect(줄[0]).toHaveLength(160);
    expect(실시간_줄_정리('문자열')).toEqual([]);
  });

  it('IP별로 1분 10회를 넘으면 막는다', () => {
    const t = 1_000_000;
    for (let i = 0; i < 분당_최대; i++) expect(요청_허용('rate-test', t + i)).toBe(true);
    expect(요청_허용('rate-test', t + 100)).toBe(false);
    expect(요청_허용('rate-test', t + 61_000)).toBe(true);
  });

});

describe('1-4 Gemini 요약: /api/citizen/ask', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('근거를 찾지 못한 질문은 Gemini를 부르지 않는다', async () => {
    const f = vi.fn();
    vi.stubGlobal('fetch', f);
    vi.stubEnv('GEMINI_API_KEY', 'test-key');
    const r = await (await POST(요청({ 질문: '오늘 날씨 어때?' }, '10.0.0.2'))).json();
    expect(r.상태).toBe('근거없음');
    expect(f).not.toHaveBeenCalled();
  });

  it('서버 키가 없으면 미연결', async () => {
    vi.stubEnv('GEMINI_API_KEY', '');
    const r = await (await POST(요청({ 질문: '영월군 응급실 어디 있어?' }, '10.0.0.3'))).json();
    expect(r.상태).toBe('미연결');
  });

  it('서버가 찾은 근거로 프롬프트를 만들어 Gemini를 호출하고 요약을 돌려준다 (클라이언트 문맥은 받지 않음)', async () => {
    vi.stubEnv('GEMINI_API_KEY', 'test-key');
    const f = vi.fn(async (url: string) =>
      url.endsWith('/models')
        ? { ok: true, json: async () => ({ models: [{ name: 'models/gemini-test-flash', supportedGenerationMethods: ['generateContent'] }] }) }
        : { ok: true, status: 200, json: async () => ({ candidates: [{ content: { parts: [{ text: '영월의료원 응급실이 있습니다 [1].' }] } }] }) }
    );
    vi.stubGlobal('fetch', f);
    const r = await (await POST(요청({ 질문: '영월군 응급실 어디 있어?', 문맥: '무시해야 할 임의 문맥' }, '10.0.0.4'))).json();
    expect(r.상태).toBe('성공');
    expect(r.요약).toContain('영월의료원');
    const 생성_호출 = (f.mock.calls as unknown as [string, { body: string }][]).find(([u]) => u.includes(':generateContent'))!;
    expect(생성_호출[0]).toContain('gemini-test-flash');
    const 보낸_본문 = JSON.parse(생성_호출[1].body);
    const 프롬프트: string = 보낸_본문.contents[0].parts[0].text;
    expect(프롬프트).toContain('영월');
    expect(프롬프트).not.toContain('무시해야 할 임의 문맥');
  });
});

describe('1-4 Gemini 오류 진단', () => {
  it('키 정리: 따옴표·공백·줄바꿈 제거, 여러 개면 첫 번째', () => {
    expect(Gemini_키_정리(' "AIzaABC" \n')).toBe('AIzaABC');
    expect(Gemini_키_정리('AIzaA,AIzaB')).toBe('AIzaA');
    expect(Gemini_키_정리(undefined)).toBe('');
  });
  it('키 형식은 길이와 AIza 시작 여부만 알려준다', () => {
    expect(Gemini_키_형식('AIza' + 'x'.repeat(35))).toBe('키 길이 39 · AIza로 시작 예');
  });

});
