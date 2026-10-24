import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { 지침_검색, 지침_요약_프롬프트, 질문_낱말 } from './책임의료기관_지침_검색';
import { POST } from '@/app/api/guide/rmi-ask/route';

const 쪽들 = (q: string) => 지침_검색(q).map((g) => g.쪽_표시);

describe('2-5 책임의료기관 지침 검색 (원문 331쪽)', () => {
  it('질문의 핵심 낱말만 남긴다 (의문·요청 표현과 조사 제거)', () => {
    expect(질문_낱말('전담조직은 어떻게 구성해야 하나요?')).toEqual(['전담조직', '구성해야', '하나']);
  });

  it('전담조직 질문은 본문 16쪽(Ⅱ-2 전담조직 설치·운영)을 맨 앞에 찾는다', () => {
    expect(쪽들('전담조직은 어떻게 구성해야 하나요?')[0]).toBe('본문 16쪽');
  });

  it('퇴원환자 연계 질문은 본문 31쪽(분야별 사업내용)을, 협의체 질문은 본문 22쪽을 찾는다', () => {
    expect(쪽들('퇴원환자 지역사회 연계 사업의 목적과 내용은?')[0]).toBe('본문 31쪽');
    expect(쪽들('협의체는 몇 번 열어야 해?')).toContain('본문 22쪽');
  });

  it('바뀐 점 질문은 2026년 주요 변경사항 쪽을 먼저 보여준다', () => {
    expect(쪽들('2026년에 바뀐 점은?')[0]).toContain('2026년 주요 변경사항');
  });

  it('지침과 관련 없는 질문은 근거가 없다', () => {
    expect(지침_검색('오늘 날씨 어때?')).toEqual([]);
    expect(지침_검색('맛집 추천해줘')).toEqual([]);
  });

  it('프롬프트에는 발췌 번호·쪽수와 "발췌 밖 내용 금지" 규칙이 들어간다', () => {
    const p = 지침_요약_프롬프트('전담조직 구성', 지침_검색('전담조직은 어떻게 구성해야 하나요?'));
    expect(p).toContain('[1] 본문 16쪽');
    expect(p).toContain('원문 발췌에 없는 기준·숫자·금액·기한·서식을 만들지 마세요');
  });
});

describe('2-5 /api/guide/rmi-ask', () => {
  const 요청 = (질문: string, ip: string) =>
    new NextRequest('http://localhost/api/guide/rmi-ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-forwarded-for': ip },
      body: JSON.stringify({ 질문 }),
    });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('근거가 없으면 Gemini를 부르지 않는다', async () => {
    const f = vi.fn();
    vi.stubGlobal('fetch', f);
    vi.stubEnv('GEMINI_API_KEY', 'k');
    const r = await (await POST(요청('오늘 날씨 어때?', '10.1.0.1'))).json();
    expect(r.상태).toBe('근거없음');
    expect(f).not.toHaveBeenCalled();
  });

  it('키가 없어도 근거 쪽과 발췌는 돌려준다', async () => {
    vi.stubEnv('GEMINI_API_KEY', '');
    const r = await (await POST(요청('전담조직은 어떻게 구성해야 하나요?', '10.1.0.2'))).json();
    expect(r.상태).toBe('미연결');
    expect(r.근거[0].쪽_표시).toBe('본문 16쪽');
    expect(r.근거[0].발췌).toContain('전담조직');
  });

  it('찾은 발췌로 Gemini를 호출해 요약을 돌려준다', async () => {
    vi.stubEnv('GEMINI_API_KEY', 'k');
    const f = vi.fn(async (url: string) =>
      url.endsWith('/models')
        ? { ok: true, json: async () => ({ models: [{ name: 'models/gemini-x-flash', supportedGenerationMethods: ['generateContent'] }] }) }
        : { ok: true, status: 200, json: async () => ({ candidates: [{ content: { parts: [{ text: '전담조직을 설치합니다 [1].' }] } }] }) }
    );
    vi.stubGlobal('fetch', f);
    const r = await (await POST(요청('전담조직은 어떻게 구성해야 하나요?', '10.1.0.3'))).json();
    expect(r.상태).toBe('성공');
    expect(r.요약).toContain('[1]');
    const 호출 = (f.mock.calls as unknown as [string, { body: string }][]).find(([u]) => u.includes(':generateContent'))!;
    expect(JSON.parse(호출[1].body).contents[0].parts[0].text).toContain('본문 16쪽');
  });
});
