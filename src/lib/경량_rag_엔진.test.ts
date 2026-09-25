import { describe, it, expect } from 'vitest';
import { 경량_RAG_엔진 } from './경량_rag_엔진';
import { 필수의료_진단_엔진 } from './필수의료_엔진';

const 지역 = 필수의료_진단_엔진.diagnose_region({
  시도코드: '11', 시도명: '서울특별시', 시군구코드: '11110', 시군구명: '종로구', 인구수: 140000,
  응급_60분_미도달_인구비율: 0, 관내_응급_의료이용률: 34, 분만_60분_미도달_인구비율: 0, 관내_분만율: 20,
  소아_병상_공급비율: null, 소아_야간휴일_접근성지수: null,
});

describe('경량 RAG 템플릿 답변', () => {
  it('분만: 공식 선정 기준과 확인된 지원 금액을 쓰고, 근거 없는 외래 설치비 1억은 쓰지 않는다', () => {
    const r = 경량_RAG_엔진.execute_rag('분만취약지 지원 기준', 지역).생성된_답변;
    expect(r).toContain('60분 내 분만의료 이용률 30% 미만');
    expect(r).toContain('외래산부인과 운영비 연 2억원');
    expect(r).not.toContain('설치비 1억원');
    expect(r).not.toContain('A등급 지원 신청 자격 충족');
  });

  it('응급 미도달 0% 지역을 기준 초과로 서술하지 않는다', () => {
    const r = 경량_RAG_엔진.execute_rag('필수의료 자체충족률 실적 보고서', 지역).생성된_답변;
    expect(r).not.toContain('2배 이상 초과');
    expect(r).toContain('미만 — 해당 없음');
    expect(r).not.toContain('원주');
  });

  it('파견의사: 확인되지 않은 한도(2.5억)·당직수당(500만원)을 쓰지 않는다', () => {
    const r = 경량_RAG_엔진.execute_rag('파견의사 인건비 지원', 지역).생성된_답변;
    expect(r).not.toContain('2억 5,000만원');
    expect(r).not.toContain('500만원');
  });
});
