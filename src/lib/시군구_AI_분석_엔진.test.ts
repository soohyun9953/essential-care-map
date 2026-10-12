import { describe, it, expect } from 'vitest';
import { 시군구_찾기, 시군구_AI_분석_실행 } from './시군구_AI_분석_엔진';

describe('시군구_AI_분석_엔진', () => {
  it('시군구명을 정확하게 검색한다 (영월군, 신안군, 울릉군, 종로구)', () => {
    const 영월 = 시군구_찾기('강원 영월군');
    expect(영월.시군구명).toBe('영월군');
    expect(영월.시도명).toBe('강원특별자치도');

    const 신안 = 시군구_찾기('전라남도 신안군');
    expect(신안.시군구명).toBe('신안군');

    const 울릉 = 시군구_찾기('경북 울릉군');
    expect(울릉.시군구명).toBe('울릉군');

    const 종로 = 시군구_찾기('서울특별시 종로구');
    expect(종로.시군구명).toBe('종로구');
  });

  it('자연어 질문 문장에서도 시군구를 추출한다', () => {
    const res = 시군구_찾기('단양군의 응급의료 취약 원인과 개선방안을 분석해줘.');
    expect(res.시군구명).toBe('단양군');
  });

  it('영월군 분석 시 실데이터와 정책대안을 정상 생성한다', () => {
    const result = 시군구_AI_분석_실행('강원 영월군');
    expect(result.시군구.시군구명).toBe('영월군');
    expect(result.분석_지표_목록.length).toBeGreaterThanOrEqual(4);
    expect(result.정책대안_목록.length).toBe(3);
    expect(result.최종_분석_결과.분석_요약).toContain('영월군');
    expect(result.데이터_검색_결과.인구_데이터).toContain('36,721');
  });

  it('응급 취약 지역(신안군 등) 분석 시 응급 거점 기능보강 대안을 제시한다', () => {
    const result = 시군구_AI_분석_실행('전라남도 신안군');
    expect(result.시군구.시군구명).toBe('신안군');
    expect(result.정책대안_목록[0].우선순위).toBe('높음');
    expect(result.최종_분석_결과.주요_결과[0]).toContain('신안군');
  });

  it('대도시 지역(종로구 등) 분석 시 과도한 응급취약 왜곡 없이 적절한 대안을 제시한다', () => {
    const result = 시군구_AI_분석_실행('서울특별시 종로구');
    expect(result.시군구.시군구명).toBe('종로구');
    expect(result.시군구.응급_60분_미도달_인구비율).toBe(0);
    expect(result.정책대안_목록.length).toBe(3);
  });
});
