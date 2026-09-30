import { describe, it, expect } from 'vitest';
import {
  mask_patient_pii,
  generate_amendment_statement,
  PII_시뮬레이션_샘플문서,
} from './개인정보_비식별화_엔진';

describe('수시공시 첨부문서 환자 개인정보(PII) 비식별화 및 수정공시 엔진 테스트', () => {
  it('이사회 회의록 샘플에서 주민등록번호, 병록번호, 성명, 연락처, 주소가 모두 감지되고 마스킹되어야 함', () => {
    const result = mask_patient_pii(PII_시뮬레이션_샘플문서.이사회_회의록_감면의결);
    expect(result.총_탐지건수).toBeGreaterThanOrEqual(4);
    expect(result.위험등급).toBe('심각(유출위험)');
    expect(result.원클릭_재공시_적합여부).toBe(false);

    // 주민등록번호 마스킹 확인
    const rrnFound = result.탐지목록.find((t) => t.유형 === '주민등록번호');
    expect(rrnFound).toBeDefined();
    expect(rrnFound?.원본텍스트).toBe('620514-1849201');
    expect(rrnFound?.마스킹텍스트).toBe('620514-1******');
    expect(result.마스킹_결과텍스트).not.toContain('620514-1849201');
    expect(result.마스킹_결과텍스트).toContain('620514-1******');

    // 병록번호 마스킹 확인
    const chartFound = result.탐지목록.find((t) => t.유형 === '병록번호');
    expect(chartFound).toBeDefined();
    expect(result.마스킹_결과텍스트).not.toContain('202410887');

    // 성명 마스킹 확인
    const nameFound = result.탐지목록.find((t) => t.유형 === '환자성명');
    expect(nameFound).toBeDefined();
    expect(result.마스킹_결과텍스트).toContain('김*수');

    // 연락처 마스킹 확인
    const phoneFound = result.탐지목록.find((t) => t.유형 === '연락처');
    expect(phoneFound).toBeDefined();
    expect(result.마스킹_결과텍스트).toContain('010-****-5432');
  });

  it('진료비 감면대장 샘플에서 다수의 환자 식별정보가 감지되어야 함', () => {
    const result = mask_patient_pii(PII_시뮬레이션_샘플문서.진료비_감면_대장_누출);

    expect(result.총_탐지건수).toBeGreaterThanOrEqual(5);
    expect(result.위험등급).toBe('심각(유출위험)');
    expect(result.마스킹_결과텍스트).not.toContain('880210-2391024');
    expect(result.마스킹_결과텍스트).not.toContain('541005-1029384');
  });

  it('개인정보가 없는 클린 공시 문서는 안전 등급을 반환해야 함', () => {
    const result = mask_patient_pii(PII_시뮬레이션_샘플문서.클린_정상_공시문서);

    expect(result.총_탐지건수).toBe(0);
    expect(result.위험등급).toBe('안전');
    expect(result.원클릭_재공시_적합여부).toBe(true);
    expect(result.조치권고[0]).toContain('개인정보 노출 위험이 없으며');
  });

  it('2026 수정공시 6단계 소명사유서가 공식 서식에 맞게 정상 생성되어야 함', () => {
    const statement = generate_amendment_statement({
      기관명: '영월의료원',
      공시연도: 2025,
      수정공시_단계: 'STEP 2 정정자료 및 사유서 회신',
      담당자성명: '홍길동 주임',
      연락처: '033-370-9114',
      오류의심_지표목록: [
        '전문의 현원 합계(29개 과 18명 vs 공시값 19명)',
        '인건비 전년대비 +23.2% 급변동',
      ],
      오류발생_원인분석: '진료과목별 인력 집계 과정에서의 단순 오기 및 결산서 급여 인상분 반영 차이',
      정정_내용및결과: '전문의 현원을 18명으로 정정하고 인건비 세부 내역서(증빙) 첨부 완료',
      재발방지대책: '공시 입력 전 14대 회계 산출식 자동검증 의무화',
    });

    expect(statement).toContain('영월의료원');
    expect(statement).toContain('STEP 2 정정자료 및 사유서 회신');
    expect(statement).toContain('국립중앙의료원(NMC) 공공보건의료본부 귀중');
    expect(statement).toContain('홍길동 주임');
    expect(statement).toContain('전문의 현원 합계');
  });
});
