import { describe, it, expect, vi, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

const 요청 = (headers: Record<string, string> = {}) =>
  new NextRequest(
    'http://localhost/api/emergency/realtime?sido=' +
      encodeURIComponent('강원특별자치도') +
      '&sigungu=' +
      encodeURIComponent('영월군'),
    { headers }
  );

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe('GET /api/emergency/realtime (공공데이터 API 미연결 시)', () => {
  it('키가 없으면 실시간이 아닌 내장 기준 데이터임을 명시한다', async () => {
    vi.stubEnv('DATA_GO_KR_API_KEY', '');
    const res = await GET(요청());
    const data = await res.json();

    expect(data.is_live_api).toBe(false);
    expect(data.source).toContain('실제 병상 현황 아님');
    expect(data.source).toContain('키 미등록');
    for (const h of data.all_hospitals) expect(h.최종_업데이트).toBe('기준 데이터 (실시간 아님)');
  });

  it('병상 수를 임의로 변동시키지 않는다 (반복 호출 시 동일)', async () => {
    vi.stubEnv('DATA_GO_KR_API_KEY', '');
    const a = await (await GET(요청())).json();
    await new Promise((r) => setTimeout(r, 5));
    const b = await (await GET(요청())).json();
    expect(a.all_hospitals.map((h: { 응급실_가용병상: number }) => h.응급실_가용병상)).toEqual(
      b.all_hospitals.map((h: { 응급실_가용병상: number }) => h.응급실_가용병상)
    );
  });

  it('인증키는 헤더로만 받고, 조회 실패 시 실패했음을 명시한다', async () => {
    vi.stubEnv('DATA_GO_KR_API_KEY', '');
    const fetch_mock = vi.fn().mockResolvedValue(new Response('error', { status: 500 }));
    vi.stubGlobal('fetch', fetch_mock);

    const data = await (await GET(요청({ 'x-data-go-kr-key': 'TESTKEY' }))).json();

    expect(fetch_mock).toHaveBeenCalledTimes(1);
    expect(String(fetch_mock.mock.calls[0][0])).toContain('serviceKey=TESTKEY');
    expect(data.is_live_api).toBe(false);
    expect(data.source).toContain('조회 실패');
  });

  it('조회 시각은 서버 시간대와 무관하게 한국 시간으로 표시한다', async () => {
    vi.stubEnv('DATA_GO_KR_API_KEY', '');
    // UTC 03:04:05 = KST 12:04:05 (Vercel 서버는 UTC)
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-09-24T03:04:05Z'));
    try {
      const data = await (await GET(요청())).json();
      expect(data.last_updated).toContain('12:04:05');
      expect(data.last_updated).not.toContain('03:04:05');
    } finally {
      vi.useRealTimers();
    }
  });
});
