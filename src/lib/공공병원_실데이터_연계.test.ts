import { describe, it, expect } from 'vitest';
import { 병원_실데이터_조회, 병원명_키 } from './공공병원_실데이터_연계';
import { 전국_41개_공공병원_AI_프로필, get_공공병원_ai_프로필 } from './공공병원_AI진단_데이터셋';

describe('AI 병원진단 실데이터 연계', () => {
  it('영월의료원: 공공의료기관 병상·E-Gen 지정·분만 가능·배후 시군구 공식 판정이 연결된다', () => {
    const r = 병원_실데이터_조회('영월의료원', '강원특별자치도', '영월군');
    expect(r.병상수).toBe(188);
    expect(r.시군구코드).toBe('51750');
    expect(r.응급의료기관_분류).toBe('지역응급의료기관');
    expect(r.분만가능).toBe(true);
    expect(r.배후_시군구?.응급취약지역_여부).toBe(true);
    expect(r.배후_시군구?.분만취약지_등급).toBe('B');
  });

  it('부산·인천의료원은 각자의 기관으로 연결된다 (시도명을 지우면 둘 다 「의료원」이 되던 오류 방지)', () => {
    const 부산 = 병원_실데이터_조회('부산의료원', '부산광역시', '연제구');
    const 인천 = 병원_실데이터_조회('인천의료원', '인천광역시', '동구');
    expect(부산.공공의료기관명).toBe('부산광역시의료원');
    expect(인천.공공의료기관명).toBe('인천광역시의료원');
    expect(부산.병상수).toBe(543);
    expect(인천.병상수).toBe(315);
    expect(병원명_키('인천광역시의료원')).not.toBe(병원명_키('부산광역시의료원'));
    expect(병원_실데이터_조회('인천의료원 백령도분원', '인천광역시', '옹진군').응급의료기관_분류).not.toBeNull();
  });

  it('41개 프로필의 지역컨텍스트는 실데이터를 쓰고, 자료 없는 항목은 null', () => {
    const 영월 = get_공공병원_ai_프로필('영월의료원');
    expect(영월.허가병상).toBe(188);
    expect(영월.지역컨텍스트.배후인구).toBe(36721);
    expect(영월.지역컨텍스트.분만취약지등급).toBe('B등급');
    expect(영월.지역컨텍스트.고령화율_pct).toBeNull();
    const 연결됨 = 전국_41개_공공병원_AI_프로필.filter((h) => h.실데이터.병상수 !== null).length;
    expect(연결됨).toBeGreaterThanOrEqual(40);
  });
});
