// 국립중앙의료원 2026 알리미 수시공시 첨부문서 환자 개인정보(PII) 실시간 탐지 및 비식별화 마스킹 엔진
// 근거: 2026년 지역거점 공공병원 통합공시 업무보고 (수시공시 첨부문서 점검 결과 - 1,932건 중 34건 PII 유출 적발)
// 점검 대상: 이사회 회의록, 진료비 감면기준자료, 사업계획서, 기부금품 영수증 등

export type PII_유형 =
  | '주민등록번호'
  | '병록번호'
  | '환자성명'
  | '연락처'
  | '상세주소'
  | '민감의료질환';

export interface PII_탐지_항목 {
  유형: PII_유형;
  원본텍스트: string;
  마스킹텍스트: string;
  위험도: '심각' | '경고' | '주의';
  설명: string;
}

export interface PII_검사_결과 {
  총_탐지건수: number;
  위험등급: '안전' | '주의' | '경고' | '심각(유출위험)';
  탐지목록: PII_탐지_항목[];
  마스킹_결과텍스트: string;
  원클릭_재공시_적합여부: boolean;
  조치권고: string[];
}

/**
 * 정규표현식 기반 한국형 개인정보(PII) 검출 및 마스킹 함수
 */
export function mask_patient_pii(content: string): PII_검사_결과 {
  const detected: PII_탐지_항목[] = [];
  let masked = content;

  // 1. 주민등록번호 탐지 (예: 950123-1234567, 9501231234567)
  const rrnRegex = /\b(\d{6})[- ]?([1-4]\d{6})\b/g;
  let rrnMatch;
  while ((rrnMatch = rrnRegex.exec(content)) !== null) {
    const raw = rrnMatch[0];
    const replacement = `${rrnMatch[1]}-${rrnMatch[2][0]}******`;
    detected.push({
      유형: '주민등록번호',
      원본텍스트: raw,
      마스킹텍스트: replacement,
      위험도: '심각',
      설명: '고유식별정보(주민등록번호)는 개인정보보호법 제24조의2에 의거 공시 첨부문서 내 전면 비식별화 필수입니다.',
    });
  }

  // 2. 환자 병록번호/차트번호 탐지 (주민등록번호는 제외)
  // 패턴: (병록번호|등록번호|차트번호|환자번호|EMR번호) : 12345678 또는 PT-2026-1234
  const chartRegex = /(?<!주민\s*)(?<!주민)(?:병록(?:번호)?|차트(?:번호)?|환자(?:번호)?|환자등록(?:번호)?|진료등록(?:번호)?|등록(?:번호)?)\s*[:：#]?\s*([A-Za-z0-9]{5,12})\b/gi;
  let chartMatch;
  while ((chartMatch = chartRegex.exec(content)) !== null) {
    const raw = chartMatch[0];
    const idVal = chartMatch[1];
    // 만약 주민등록번호 앞자리(6자리) 뒤에 하이픈이 붙어있는 형태라면 제외
    if (/^\d{6}$/.test(idVal) && content.includes(`${idVal}-`)) {
      continue;
    }
    const maskedId = idVal.length <= 4 ? '***' : idVal.slice(0, 2) + '*'.repeat(idVal.length - 2);
    const replacement = raw.replace(idVal, maskedId);
    detected.push({
      유형: '병록번호',
      원본텍스트: raw,
      마스킹텍스트: replacement,
      위험도: '심각',
      설명: '환자 병록번호는 의료법 및 개인정보보호법에 따른 진료기록 고유 식별자로 외부 공개가 엄격히 금지됩니다.',
    });
  }

  // 3. 환자 성명 패턴 (환자명: 홍길동, 성명: 김철수, 대상자 성명: 김영수 등)
  // 한글은 JS \b가 지원되지 않으므로 (?=[\s(),.:;]|$|\n) 사용
  const nameRegex = /(?:환자(?:명)?|성명|대상자(?:\s*성명)?|수진자(?:\s*성명)?)\s*[:：]\s*([가-힣]{2,4})(?=[\s(),.:;]|$|\n)/g;
  let nameMatch;
  while ((nameMatch = nameRegex.exec(content)) !== null) {
    const raw = nameMatch[0];
    const name = nameMatch[1];
    let maskedName = name;
    if (name.length === 2) {
      maskedName = name[0] + '*';
    } else if (name.length === 3) {
      maskedName = name[0] + '*' + name[2];
    } else if (name.length >= 4) {
      maskedName = name[0] + '**' + name[name.length - 1];
    }
    const replacement = raw.replace(name, maskedName);
    detected.push({
      유형: '환자성명',
      원본텍스트: raw,
      마스킹텍스트: replacement,
      위험도: '경고',
      설명: '이사회 회의록 및 감면대장 내 수진자 성명은 대외 공시 시 가명처리(성*명)되어야 합니다.',
    });
  }

  // 4. 전화번호 탐지 (010-XXXX-XXXX, 02-XXX-XXXX 등)
  const phoneRegex = /\b(01[016789]|02|0[3-6][1-5])[- ]?(\d{3,4})[- ]?(\d{4})\b/g;
  let phoneMatch;
  while ((phoneMatch = phoneRegex.exec(content)) !== null) {
    const raw = phoneMatch[0];
    const replacement = `${phoneMatch[1]}-****-${phoneMatch[3]}`;
    detected.push({
      유형: '연락처',
      원본텍스트: raw,
      마스킹텍스트: replacement,
      위험도: '경고',
      설명: '연락처 유출 시 스팸 및 2차 피해 우려로 마스킹 처리가 필수적입니다.',
    });
  }

  // 5. 상세 주소 패턴 (시/군/구 + 읍/면/동/리 + 번지/호수 등)
  const addressRegex = /([가-힣]+(?:시|군|구))\s+([가-힣\d]+(?:읍|면|동|로|길|리))(?:\s+[가-힣\d]+(?:리|동))?\s+(\d+(?:-\d+)?(?:번지)?(?:\s+[가-힣\d\s]+(?:아파트|빌라|호|동))?)/g;
  let addrMatch;
  while ((addrMatch = addressRegex.exec(content)) !== null) {
    const raw = addrMatch[0];
    const replacement = `${addrMatch[1]} ${addrMatch[2]} [이하 상세주소 마스킹]`;
    detected.push({
      유형: '상세주소',
      원본텍스트: raw,
      마스킹텍스트: replacement,
      위험도: '주의',
      설명: '도로명/지번 이하 상세 주소는 거주지 특정 위험으로 마스킹 권고 대상입니다.',
    });
  }

  // 치환 적용 (주민등록번호 우선, 그 다음 병록번호, 성명, 전화번호, 주소)
  masked = masked.replace(rrnRegex, (_match, p1, p2) => `${p1}-${p2[0]}******`);
  masked = masked.replace(chartRegex, (full, idVal) => {
    if (/^\d{6}$/.test(idVal) && (content.includes(`${idVal}-`) || content.includes(`${idVal} -`))) {
      return full;
    }
    const maskedId = idVal.length <= 4 ? '***' : idVal.slice(0, 2) + '*'.repeat(idVal.length - 2);
    return full.replace(idVal, maskedId);
  });
  masked = masked.replace(nameRegex, (full, name) => {
    let maskedName = name;
    if (name.length === 2) {
      maskedName = name[0] + '*';
    } else if (name.length === 3) {
      maskedName = name[0] + '*' + name[2];
    } else if (name.length >= 4) {
      maskedName = name[0] + '**' + name[name.length - 1];
    }
    return full.replace(name, maskedName);
  });
  masked = masked.replace(phoneRegex, (_match, p1, _p2, p3) => `${p1}-****-${p3}`);
  masked = masked.replace(addressRegex, (_m, p1, p2) => `${p1} ${p2} [이하 상세주소 마스킹]`);

  // 위험등급 판정
  const total = detected.length;
  const criticalCount = detected.filter((d) => d.위험도 === '심각').length;
  const warningCount = detected.filter((d) => d.위험도 === '경고').length;

  let 위험등급: '안전' | '주의' | '경고' | '심각(유출위험)' = '안전';
  if (criticalCount > 0) {
    위험등급 = '심각(유출위험)';
  } else if (warningCount > 0) {
    위험등급 = '경고';
  } else if (total > 0) {
    위험등급 = '주의';
  }

  const 조치권고: string[] = [];
  if (criticalCount > 0) {
    조치권고.push(
      `주민등록번호 및 병록번호 등 ${criticalCount}건의 심각한 환자 개인정보가 발견되었습니다. 즉시 비식별화된 문서를 재공시하여야 합니다.`
    );
  }
  if (warningCount > 0) {
    조치권고.push(
      `환자 성명 및 연락처 ${warningCount}건이 감지되었습니다. 식별 불가능한 가명정보(* 마스킹)로 치환되었습니다.`
    );
  }
  if (total === 0) {
    조치권고.push('개인정보 노출 위험이 없으며 대국민 통합공시 첨부문서로 적합합니다.');
  }

  return {
    총_탐지건수: total,
    위험등급,
    탐지목록: detected,
    마스킹_결과텍스트: masked,
    원클릭_재공시_적합여부: total === 0,
    조치권고,
  };
}

/**
 * 2026 수정공시 6단계 소명사유서 공식 양식 자동 생성 함수
 */
export interface 수정공시_사유서_데이터 {
  기관명: string;
  공시연도: number;
  수정공시_단계: string;
  담당자성명: string;
  연락처: string;
  오류의심_지표목록: string[];
  오류발생_원인분석: string;
  정정_내용및결과: string;
  재발방지대책: string;
}

export function generate_amendment_statement(data: 수정공시_사유서_데이터): string {
  const currentDate = new Date().toISOString().slice(0, 10);
  return `[2026년도 지역거점 공공병원 알리미 통합공시 정정 및 수정공시 사유서]

1. 기관 개요
  - 기 관 명 : ${data.기관명}
  - 대 상 연 도 : ${data.공시연도}년도 결산 통합공시
  - 작성 일자 : ${currentDate}
  - 공시 담당자 : ${data.담당자성명} (연락처: ${data.연락처})
  - 진행 절차 : 2026 알리미 수정공시 6단계 프로세스 중 [${data.수정공시_단계}]

2. 정정 대상 지표 (국립중앙의료원 검증 도출)
${data.오류의심_지표목록.map((item, idx) => `  (${idx + 1}) ${item}`).join('\n')}

3. 불일치 및 오류 발생 원인
  ${data.오류발생_원인분석}

4. 정정 내역 및 조치 결과
  ${data.정정_내용및결과}

5. 향후 재발 방지 대책
  - 사전검증 자동화: 공시 입력 전 '14대 법정 회계산출식 및 통계이상치 엔진' 검증 필터 필수 통과
  - 첨부문서 비식별화: 온디바이스 PII 탐지 필터를 적용하여 환자 병록번호 및 성명 유출 사전 차단
  ${data.재발방지대책}

위와 같이 「지방의료원의 설립 및 운영에 관한 법률」 제24조의2 및 동법 시행령에 의거하여
2026년도 결산 통합공시 수정공시 사유서 및 정정 증빙자료를 정히 제출합니다.

                                           2026년 ${currentDate.slice(5, 7)}월 ${currentDate.slice(8, 10)}일
                                           ${data.기관명} 기관장 (직인생략)

국립중앙의료원(NMC) 공공보건의료본부 귀중`;
}

/**
 * 실증 시뮬레이션을 위한 샘플 첨부문서 원문 3종
 */
export const PII_시뮬레이션_샘플문서 = {
  이사회_회의록_감면의결: `[제2025-4회 영월의료원 이사회 회의록 요약]
일시: 2025년 11월 24일 14:00
장소: 영월의료원 대회의실
안건: 취약계층 환자 비급여 진료비 감면 심의의 건

심의내용:
본 안건은 영월군 관내 의료급여 1종 수급권자 중 긴급 수술환자에 대한 비급여 진료비 1,450,000원 감면 지원 건임.
- 대상자 성명: 김영수 (병록번호: 202410887, 주민등록번호: 620514-1849201)
- 환자 주소: 강원도 영월군 영월읍 영흥리 324-5번지
- 긴급 연락처: 010-9876-5432
- 주진단명: 급성 충수염 복막염 (K35.2)

출석이사 7인 전원 찬성으로 원안 가결함.`,

  진료비_감면_대장_누출: `[2025년 3분기 공공의료 지원사업 진료비 감면 집행대장]
작성부서: 공공의료사업팀

1. 지원 대상자 1
- 환자명: 박지민 (등록번호: PT84920, 연락처: 010-3344-7788)
- 주민등록번호: 880210-2391024
- 거주지: 경상남도 통영시 중앙동 120-4 통영빌라 302호
- 감면금액: 850,000원

2. 지원 대상자 2
- 성명: 이순신 (차트번호: 20250911, 주민등록번호: 541005-1029384)
- 연락처: 010-8888-2233
- 거주지: 경상북도 안동시 풍천면 갈전리 102번지
- 감면금액: 1,200,000원`,

  클린_정상_공시문서: `[2025년도 공공보건의료 협력체계 구축사업 성과보고서 요약]
기관명: 통영적십자병원
작성일: 2026년 2월 10일

사업개요:
- 통영권역 필수의료(응급·외상·심뇌혈관) 안전망 구축
- 24시간 분만 인프라 및 소아응급 전원 핫라인 연계
- 총 투입예산: 1,200,000,000원 (국비 50%, 지방비 50%)

추진실적:
- 중증 응급환자 골든타임 내 전원율 89.4% 달성
- 취약계층 진료비 지원 총 142건 집행 (개인정보 비식별화 처리 완료)
- 의료 질 향상 및 공시 지표 100% 정합성 검증 통과

첨부문서: 사업비 집행 영수증 및 결산서 요약 (개인식별정보 없음)`,
};
