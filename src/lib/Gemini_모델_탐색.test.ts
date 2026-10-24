import { afterEach, describe, expect, it, vi } from 'vitest';
import { Gemini_순차_호출, Gemini_응답_본문, 모델_목록_해석, 모델_정렬, 정적_후보 } from './Gemini_모델_탐색';

const 응답 = (status: number, body: unknown) => ({ ok: status >= 200 && status < 300, status, json: async () => body });

describe('Gemini 가용 모델 탐색·순차 호출', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('ListModels에서 generateContent 텍스트 모델만 고르고 flash를 앞에 둔다', () => {
    const 목록 = 모델_목록_해석(
      {
        models: [
          { name: 'models/gemini-x-pro', supportedGenerationMethods: ['generateContent'] },
          { name: 'models/gemini-x-flash', displayName: 'X Flash', supportedGenerationMethods: ['generateContent'] },
          { name: 'models/text-embedding-004', supportedGenerationMethods: ['embedContent'] },
          { name: 'models/gemini-x-flash-image', supportedGenerationMethods: ['generateContent'] },
        ],
      },
      'v1beta'
    );
    expect(모델_정렬(목록).map((m) => m.id)).toEqual(['gemini-x-flash', 'gemini-x-pro']);
  });

  it('앞 모델이 실패하면 다음 모델로 넘어가 성공한 모델의 답을 돌려준다', async () => {
    const f = vi.fn(async (url: string) => {
      if (url.endsWith('/models'))
        return 응답(200, { models: ['a-flash', 'b-flash'].map((n) => ({ name: `models/${n}-k1`, supportedGenerationMethods: ['generateContent'] })) });
      if (url.includes('a-flash')) return 응답(404, { error: { message: 'not found', status: 'NOT_FOUND' } });
      return 응답(200, { candidates: [{ content: { parts: [{ text: '생각', thought: true }, { text: '답변' }] } }] });
    });
    vi.stubGlobal('fetch', f);
    const r = await Gemini_순차_호출('key-seq', '질문');
    expect(r.성공 && r.모델.id).toBe('b-flash-k1');
    expect(r.성공 && r.본문).toBe('답변');
    expect(r.성공 && r.시도_순번).toBe(2);
  });

  it('키가 잘못되면(API_KEY_INVALID) 다른 모델을 시도하지 않고 멈춘다', async () => {
    const f = vi.fn(async (url: string) =>
      url.endsWith('/models')
        ? 응답(400, {})
        : 응답(400, { error: { message: 'API key not valid. Please pass a valid API key.', status: 'INVALID_ARGUMENT', details: [{ reason: 'API_KEY_INVALID' }] } })
    );
    vi.stubGlobal('fetch', f);
    const r = await Gemini_순차_호출('key-bad', '질문');
    expect(r.성공).toBe(false);
    if (!r.성공) {
      expect(r.키_오류).toBe(true);
      expect(r.시도).toHaveLength(1);
      expect(r.시도[0].error).toContain('API_KEY_INVALID');
    }
    // ListModels가 안 되면 정적 후보로 시도
    expect((f.mock.calls as unknown as [string][]).some(([u]) => u.includes(정적_후보[0].id))).toBe(true);
  });

  it('thinking 파트만 있으면 전체 텍스트를 쓴다', () => {
    expect(Gemini_응답_본문({ candidates: [{ content: { parts: [{ text: '가', thought: true }] } }] })).toBe('가');
    expect(Gemini_응답_본문({})).toBe('');
  });
});
