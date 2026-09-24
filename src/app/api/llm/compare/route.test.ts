import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from './route';

beforeEach(() => {
  // 로컬 sLLM·서버 Gemini 키를 끄고 사전 작성 템플릿 경로만 검증
  vi.stubEnv('LOCAL_LLM_ENABLED', 'false');
  vi.stubEnv('ALLOW_SERVER_GEMINI_KEY', 'false');
});
afterEach(() => vi.unstubAllEnvs());

const 질의 = async (query: string, mode: 'general_qa' | 'business_plan', region_stats: Record<string, unknown>) => {
  const req = new NextRequest('http://localhost/api/llm/compare', {
    method: 'POST',
    body: JSON.stringify({ query, mode, region_name: '테스트도 테스트군', region_stats }),
  });
  const data = await (await POST(req)).json();
  return data.local_sllm as { model: string; is_live: boolean; response: string };
};

// 기준을 충족하지 않는(양호한) 지역
const 양호 = { emergency_rate: 10, ri_rate: 70, maternity_rate: 80, vulnerability_grade: '정상' };
// 취약 지역
const 취약 = { emergency_rate: 68.2, ri_rate: 19.8, maternity_rate: 15.2, vulnerability_grade: '심각' };

const 질의_목록: Array<[string, 'general_qa' | 'business_plan']> = [
  ['파견의사 자격', 'general_qa'],
  ['책임의료기관 차이', 'general_qa'],
  ['자체충족률 산정', 'general_qa'],
  ['분만취약지 A등급', 'general_qa'],
  ['응급실 당직 수당', 'general_qa'],
  ['기타 질문', 'general_qa'],
  ['파견의사 당직비', 'business_plan'],
  ['자체충족률 평가지표', 'business_plan'],
  ['분만취약지 B등급', 'business_plan'],
  ['달빛어린이병원', 'business_plan'],
  ['기타 사업', 'business_plan'],
];

describe('사전 작성 템플릿 답변 (로컬 sLLM 미연결)', () => {
  it.each(질의_목록)('"%s"(%s): AI 답변으로 표시하지 않고 원문 확인 안내를 붙인다', async (q, mode) => {
    const r = await 질의(q, mode, 취약);
    expect(r.is_live).toBe(false);
    expect(r.model).toContain('AI 모델 미사용');
    expect(r.response).toContain('원문으로 반드시 확인');
  });

  it.each(질의_목록)('"%s"(%s): 코퍼스와 불일치·미확인 수치와 영월 전용 표현을 쓰지 않는다', async (q, mode) => {
    const r = await 질의(q, mode, 취약);
    // 공개 자료와 불일치(2억 5천만원·월 500만원·분만율 40% 선정기준)하거나 근거 없는 수치, 영월 전용 표현
    for (const v of ['2,160', '2,910', '20만~30만', '40만~50만', '1억~1.5억', '11월', '익월 10일', '2억 5천만원', '월 최대 500만원', '선정기준(40% 미만)', '원주세브란스', '영월의료원', '영월 권역']) {
      expect(r.response, v).not.toContain(v);
    }
  });

  it.each(질의_목록)('"%s"(%s): 양호한 지역에 취약 판정 문구를 붙이지 않는다', async (q, mode) => {
    const r = await 질의(q, mode, 양호);
    for (const v of ['30% 초과', '전국 최상위', '완벽히 충족', '현저히 취약', '(취약)']) {
      expect(r.response, v).not.toContain(v);
    }
  });

  it('취약 지역에는 실제 값에 따른 취약 판정을 표시한다', async () => {
    const r = await 질의('기타 질문', 'general_qa', 취약);
    expect(r.response).toContain('68.2% (법정 기준선 30% 이상');
    expect(r.response).toContain('19.8% (플랫폼 기준 30% 미만 (취약))');
  });

  it('분만취약지는 원문 선정 기준(분만의료 이용률·접근 불가 인구)과 지원액으로 안내한다', async () => {
    const r = await 질의('분만취약지 A등급', 'general_qa', 양호);
    expect(r.response).toContain('60분 내 분만의료 이용률 30% 미만');
    expect(r.response).toContain('시설·장비비 10억원');
    expect(r.response).toContain('관내 분만율(플랫폼 지표)');
  });
});
