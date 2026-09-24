import { describe, it, expect } from 'vitest';
import { 전체_공공의료기관_상세목록 as 목록, 의료서비스_검색_엔진, 분만가능_기관_조회 } from './의료서비스_검색_엔진';
import { 분만가능_의료기관_목록, 분만가능_의료기관_출처 } from './분만가능_의료기관_데이터셋';
import { 전국_공공의료기관_목록 } from './공공의료기관_데이터셋';

const 서비스_상태 = (h: (typeof 목록)[number], code: string) => h.서비스_상세.find((s) => s.코드 === code)?.상태;
const 유형 = (h: (typeof 목록)[number]) => h.기관유형.split('거점')[0];

describe('공공의료기관 상세 프로필 - 기본 데이터', () => {
  it('내장 데이터셋의 전체 기관(214개소)이 프로필로 생성된다', () => {
    expect(목록.length).toBe(전국_공공의료기관_목록.length);
    expect(목록.length).toBe(214);
  });

  it('총 병상·대표전화는 원본 데이터셋 값을 그대로 쓴다', () => {
    const 원본 = new Map(전국_공공의료기관_목록.map((h) => [h.id, h]));
    for (const h of 목록) {
      expect(h.의료자원.병상.총병상).toBe(원본.get(h.id)!.병상수);
      expect(h.전화번호).toBe(원본.get(h.id)!.대표전화);
    }
  });
});

describe('임의 생성값 회귀 방지 (v1.0.19~v1.0.21 정정 사항)', () => {
  it('주소는 시도·시군구만 표기하고 도로명을 지어내지 않는다', () => {
    for (const h of 목록) {
      expect(h.주소).toBe(`${h.시도명} ${h.시군구명}`);
    }
  });

  it('홈페이지 URL을 지어내지 않는다', () => {
    for (const h of 목록) expect(h.홈페이지).toBe('');
  });

  it('진료시간·운영상태를 일괄 고정값으로 단정하지 않는다', () => {
    for (const h of 목록) {
      expect(h.운영시간).not.toMatch(/\d{2}:\d{2}/);
      expect(h.운영_상태).toBe('확인필요');
    }
  });

  it('데이터 출처를 실제 연계되지 않은 기관·자동 갱신으로 표기하지 않는다', () => {
    for (const h of 목록) {
      expect(h.데이터_신뢰성.출처).toContain('내장');
      expect(h.데이터_신뢰성.갱신주기).not.toMatch(/실시간|자동 갱신$/);
      expect(h.데이터_신뢰성.상태).not.toBe('정상');
    }
  });

  it('서비스 비고는 추정임을 밝히거나 공개 데이터 출처를 명시한다', () => {
    for (const h of 목록) {
      for (const s of h.서비스_상세) {
        if (s.근거 === '청구실적') expect(s.비고).toContain('심평원');
        else expect(s.비고).toContain('추정');
      }
    }
  });
});

describe('진료 서비스 운영 추정 규칙', () => {
  // 급성기 서비스별 '지역 기관' 운영 추정 병상 기준 (분만은 심평원 청구 실적 목록으로 판정하므로 제외)
  const 급성기_기준: Record<string, number> = { severe: 250, cardio_cerebro: 300 };

  it.each(Object.entries(급성기_기준))('%s: 권역 기관 또는 기준 병상 초과 지역 기관만 운영으로 추정한다', (code, 기준) => {
    const 운영 = 목록.filter((h) => 서비스_상태(h, code) === '운영');
    expect(운영.length).toBeGreaterThan(0);
    for (const h of 운영) {
      const ok = 유형(h) === '권역' || (유형(h) === '지역' && h.의료자원.병상.총병상 > 기준);
      expect(ok, `${h.기관명}(${h.기관유형})`).toBe(true);
    }
  });

  it('노인·정신·치과·한방·재활 병원은 분만·중환자·심뇌혈관 미운영으로 추정한다', () => {
    for (const h of 목록.filter((h) => ['노인', '정신', '치과', '한방', '재활(소아)'].includes(유형(h)))) {
      for (const code of ['delivery', ...Object.keys(급성기_기준)]) expect(서비스_상태(h, code), `${h.기관명} ${code}`).toBe('미운영');
    }
  });

  it('중환자 치료 미운영 추정 기관은 중환자실 규모도 0이다 (표시 일관성)', () => {
    for (const h of 목록.filter((h) => 서비스_상태(h, 'severe') === '미운영' && ['노인', '정신', '치과', '한방', '재활(소아)'].includes(유형(h)))) {
      expect(h.의료자원.중환자실.총병상, h.기관명).toBe(0);
    }
  });

  it('응급실 운영 추정은 권역·지역 기관에 한정된다', () => {
    for (const h of 목록.filter((h) => 서비스_상태(h, 'emergency') === '운영')) {
      expect(['권역', '지역']).toContain(유형(h));
    }
  });
});

describe('분만: 심평원 분만가능 의료기관 목록(청구 실적) 기반 판정', () => {
  it('원본 데이터셋은 420개 기관, 필수 항목과 출처 정보를 갖는다', () => {
    expect(분만가능_의료기관_목록.length).toBe(420);
    for (const h of 분만가능_의료기관_목록) {
      expect(h.기관명 && h.시도 && h.종별, JSON.stringify(h)).toBeTruthy();
    }
    expect(분만가능_의료기관_출처.이용허락).toContain('공공누리');
  });

  it('공공병원의 분만 운영 여부는 목록 등재 여부와 정확히 일치하고 근거를 청구실적으로 표시한다', () => {
    for (const h of 목록) {
      const svc = h.서비스_상세.find((s) => s.코드 === 'delivery')!;
      expect(svc.상태 === '운영', h.기관명).toBe(!!분만가능_기관_조회(h.기관명));
      expect(svc.근거).toBe('청구실적');
    }
  });

  it('공공병원 중 목록 등재 기관은 33곳이며, 요양병원이 본원 이름으로 오대응되지 않는다', () => {
    expect(목록.filter((h) => 서비스_상태(h, 'delivery') === '운영').length).toBe(33);
    const 이름 = (n: string) => 목록.find((h) => h.기관명 === n)!;
    expect(서비스_상태(이름('울진군의료원'), 'delivery')).toBe('운영');
    expect(서비스_상태(이름('울진군의료원요양병원'), 'delivery')).toBe('미운영');
    expect(서비스_상태(이름('강원특별자치도영월의료원'), 'delivery')).toBe('운영');
    // 병상 규모로는 '운영 추정'이었지만 실제 분만 청구 실적이 없는 기관
    expect(서비스_상태(이름('경찰병원'), 'delivery')).toBe('미운영');
  });
});

describe('의료서비스_검색_엔진.search_hospitals', () => {
  it('서비스 필터는 운영(추정) 기관만 포함하고 확인필요는 제외한다', () => {
    const 결과 = 의료서비스_검색_엔진.search_hospitals({ 선택된_서비스: ['delivery'] });
    expect(결과.length).toBeGreaterThan(0);
    for (const h of 결과) expect(서비스_상태(h, 'delivery')).toBe('운영');
  });

  it('여러 서비스를 선택하면 모두 운영(추정)인 기관만 남는다', () => {
    const 결과 = 의료서비스_검색_엔진.search_hospitals({ 선택된_서비스: ['emergency', 'delivery'] });
    for (const h of 결과) {
      expect(서비스_상태(h, 'emergency')).toBe('운영');
      expect(서비스_상태(h, 'delivery')).toBe('운영');
    }
  });

  it('시도명으로 지역을 좁힐 수 있다', () => {
    const 결과 = 의료서비스_검색_엔진.search_hospitals({ 선택된_서비스: [], 시도명: '강원' });
    expect(결과.length).toBeGreaterThan(0);
    for (const h of 결과) expect(h.시도명).toContain('강원');
  });
});
