// Essential Care Map - 공공보건의료 시행계획 및 추진실적 AI 평가 엔진
// 근거 지침:
// 1) 보건복지부·국립중앙의료원 『2025년 공공보건의료 시행계획 수립 지침』
// 2) 보건복지부·국립중앙의료원 『2024년 공공보건의료 시행계획 추진실적 작성 지침』
// 법적 근거: 「공공보건의료에 관한 법률」 제4조 및 동법 시행령 제3조·제4조

export type 평가대상_기관유형 = 'sido' | 'central_public';

export type 성과지표_성격유형 = '투입(Input)' | '과정(Process)' | '산출(Output)' | '결과(Outcome)';

export type 루브릭_척도_등급 = '수' | '우' | '미' | '양' | '가';

export type 종합_평가_등급 = '최우수' | '우수' | '양호' | '보통' | '미흡';

// 제2차 공공보건의료 기본계획(2021~2025) 3대 분야 · 11개 추진과제 · 18개 세부과제
export interface 기본계획_세부과제_정의 {
  fieldId: 1 | 2 | 3;
  fieldName: string;
  taskCode: string;
  taskName: string;
  subTaskCode: string;
  subTaskName: string;
  targetGroup: 'all' | 'sido_only';
}

export const 제2차_기본계획_과제체계: 기본계획_세부과제_정의[] = [
  // 1분야: 필수의료 제공 체계 확충 (중앙·공공 60% / 시·도 50%)
  { fieldId: 1, fieldName: '1분야. 필수의료 제공 체계 확충', taskCode: '1-1', taskName: '공공보건의료 수행기관 확충 및 역할 정립', subTaskCode: '1분야-1-1', subTaskName: '공공의료기관 및 공공적 민간의료기관 확충', targetGroup: 'all' },
  { fieldId: 1, fieldName: '1분야. 필수의료 제공 체계 확충', taskCode: '1-1', taskName: '공공보건의료 수행기관 확충 및 역할 정립', subTaskCode: '1분야-1-2', subTaskName: '필수의료 보장을 위한 공공보건의료기관별 역할 정립', targetGroup: 'all' },
  { fieldId: 1, fieldName: '1분야. 필수의료 제공 체계 확충', taskCode: '1-2', taskName: '지역 완결적 필수중증의료 보장', subTaskCode: '1분야-2-1', subTaskName: '응급, 심뇌혈관질환 등 중증응급 지역 기반 대응 체계 마련 (지정 센터 실적 필수)', targetGroup: 'all' },
  { fieldId: 1, fieldName: '1분야. 필수의료 제공 체계 확충', taskCode: '1-2', taskName: '지역 완결적 필수중증의료 보장', subTaskCode: '1분야-2-2', subTaskName: '지역별 암 치료·돌봄 강화', targetGroup: 'all' },
  { fieldId: 1, fieldName: '1분야. 필수의료 제공 체계 확충', taskCode: '1-3', taskName: '건강 취약 계층 지원 및 의료 수요 증가 대응', subTaskCode: '1분야-3-1', subTaskName: '산모, 어린이, 장애인, 노인 등 취약층 의료서비스 보장', targetGroup: 'all' },
  { fieldId: 1, fieldName: '1분야. 필수의료 제공 체계 확충', taskCode: '1-3', taskName: '건강 취약 계층 지원 및 의료 수요 증가 대응', subTaskCode: '1분야-3-2', subTaskName: '정신, 간호·간병, 말기 돌봄, 장기·혈액 등 의료 수요 증가 대응', targetGroup: 'all' },
  { fieldId: 1, fieldName: '1분야. 필수의료 제공 체계 확충', taskCode: '1-4', taskName: '공중보건위기 대응 체계 구축', subTaskCode: '1분야-4-1', subTaskName: '감염병 대응 체계 확충', targetGroup: 'all' },
  { fieldId: 1, fieldName: '1분야. 필수의료 제공 체계 확충', taskCode: '1-4', taskName: '공중보건위기 대응 체계 구축', subTaskCode: '1분야-4-2', subTaskName: '감염병 대응 역량 강화', targetGroup: 'all' },

  // 2분야: 공공보건의료 역량 강화 (중앙·공공 40% / 시·도 30%)
  { fieldId: 2, fieldName: '2분야. 공공보건의료 역량 강화', taskCode: '2-1', taskName: '공공보건의료 인력 양성 및 지원', subTaskCode: '2분야-1-1', subTaskName: '공공보건의료 인력 확충 체계 마련', targetGroup: 'all' },
  { fieldId: 2, fieldName: '2분야. 공공보건의료 역량 강화', taskCode: '2-1', taskName: '공공보건의료 인력 양성 및 지원', subTaskCode: '2분야-1-2', subTaskName: '공공보건의료 인력 지원 강화', targetGroup: 'all' },
  { fieldId: 2, fieldName: '2분야. 공공보건의료 역량 강화', taskCode: '2-2', taskName: '공공의료기관 운영 개선 및 역량 강화', subTaskCode: '2분야-2', subTaskName: '공공의료기관 운영 개선 및 역량 강화', targetGroup: 'all' },
  { fieldId: 2, fieldName: '2분야. 공공보건의료 역량 강화', taskCode: '2-3', taskName: '국립중앙의료원 및 국립대병원 공공적 역할 확대', subTaskCode: '2분야-3-1', subTaskName: '국립중앙의료원의 중심적 역할 확대', targetGroup: 'all' },
  { fieldId: 2, fieldName: '2분야. 공공보건의료 역량 강화', taskCode: '2-3', taskName: '국립중앙의료원 및 국립대병원 공공적 역할 확대', subTaskCode: '2분야-3-2', subTaskName: '국립대학병원의 공공성 및 지역의료 지원 역할 강화', targetGroup: 'all' },
  { fieldId: 2, fieldName: '2분야. 공공보건의료 역량 강화', taskCode: '2-4', taskName: '첨단 정보통신기술 활용 강화', subTaskCode: '2분야-4', subTaskName: '첨단 정보통신기술(ICT/AI) 활용 강화', targetGroup: 'all' },

  // 3분야: 공공보건의료 제도 기반 강화 (시·도 20% / 중앙·공공 미작성)
  { fieldId: 3, fieldName: '3분야. 공공보건의료 제도 기반 강화', taskCode: '3-1', taskName: '협력 및 지원 기반 확대', subTaskCode: '3분야-1-1', subTaskName: '공공보건의료 협력·지원 체계 구축 (위원회·지원단 운영)', targetGroup: 'sido_only' },
  { fieldId: 3, fieldName: '3분야. 공공보건의료 제도 기반 강화', taskCode: '3-1', taskName: '협력 및 지원 기반 확대', subTaskCode: '3분야-1-2', subTaskName: '책임의료기관 중심 필수보건의료 협력 기반 확대', targetGroup: 'sido_only' },
  { fieldId: 3, fieldName: '3분야. 공공보건의료 제도 기반 강화', taskCode: '3-2', taskName: '재원 및 유인 체계 강화', subTaskCode: '3분야-2', subTaskName: '공공보건의료 재원 및 유인 체계 강화', targetGroup: 'sido_only' },
  { fieldId: 3, fieldName: '3분야. 공공보건의료 제도 기반 강화', taskCode: '3-3', taskName: '평가 체계 정비', subTaskCode: '3분야-3', subTaskName: '공공보건의료 평가 체계 정비 및 환류 강화', targetGroup: 'sido_only' },
];

// 공식 평가지표 10대 항목 정의 (<붙임 1, 2> 평가항목 및 배점표 완벽 반영)
export interface 공식_평가지표_항목 {
  id: string;
  category: '추진실적(70점)' | '사업계획(30점)';
  code: string;
  title: string;
  type: '정성' | '정량';
  totalMaxScore: number;
  // 중앙행정기관·공공단체 분야별 배점 (1분야, 2분야)
  centralPublicWeights: { field1: number; field2: number; common?: number };
  // 시·도 지자체 분야별 배점 (1분야, 2분야, 3분야)
  sidoWeights: { field1: number; field2: number; field3: number; common?: number };
  purpose: string;
  criteriaQuestions: string[];
  targetSectionInDoc: string;
  aiServicePoint: string;
}

export const 공식_10대_평가지표_목록: 공식_평가지표_항목[] = [
  {
    id: '1.1',
    category: '추진실적(70점)',
    code: '1.1',
    title: '기본계획과 사업 목적·내용의 적합성',
    type: '정성',
    totalMaxScore: 10,
    centralPublicWeights: { field1: 6, field2: 4 },
    sidoWeights: { field1: 5, field2: 3, field3: 2 },
    purpose: '제2차 공공보건의료 기본계획의 세부과제 목적과 기관의 추진실적 사업 목적·내용이 부합하는지 확인',
    criteriaQuestions: [
      '제2차 공공보건의료 기본계획의 세부과제 목적과 사업 목적이 부합하는가?',
      '추진된 사업내용이 사업목적에 부합하는가?',
    ],
    targetSectionInDoc: '요약표, ① 사업 총괄표, ③ 사업 추진실적 (1. 사업개요)',
    aiServicePoint: '기본계획 18개 세부과제 의미론적 임베딩(RAG) 매칭 및 부합도 자동 판독',
  },
  {
    id: '1.2',
    category: '추진실적(70점)',
    code: '1.2',
    title: '사업 추진체계(인력, 예산 투입 등)의 적정성',
    type: '정성',
    totalMaxScore: 10,
    centralPublicWeights: { field1: 6, field2: 4 },
    sidoWeights: { field1: 5, field2: 3, field3: 2 },
    purpose: '제2차 공공보건의료 기본계획과 연계된 사업 추진주체·대상·시행방법·절차·인력·예산 투입이 적절하였는지 확인',
    criteriaQuestions: [
      '사업 추진주체를 명확히 제시하고, 사업 목적 달성·내용 실현에 적합한 추진체계를 마련하였는가?',
      '사업 대상, 시행방법, 추진절차 및 예산·인력 투입이 구체적으로 수립·집행되었는가?',
    ],
    targetSectionInDoc: '③ 사업 추진실적 (1-3. 추진체계, 2-3. 예산집행 실적)',
    aiServicePoint: '추진주체·대상·절차 구조화 추출 및 국비·지방비 예산집행률(B/A) 정합성 자동 계산',
  },
  {
    id: '1.3',
    category: '추진실적(70점)',
    code: '1.3',
    title: '사업 추진 내용의 적정성',
    type: '정성',
    totalMaxScore: 30,
    centralPublicWeights: { field1: 18, field2: 12 },
    sidoWeights: { field1: 15, field2: 9, field3: 6 },
    purpose: '당초 시행계획 대비 추진실적의 구체성, 효과성·효율성, 정기 모니터링 체계 구축·운영 여부를 종합 평가 (최대 배점 30점)',
    criteriaQuestions: [
      '세부 사업 추진내용이 사업 목적과 연계하여 구체적으로 수립·이행되었는가?',
      '사업목적 달성을 위하여 효과성과 효율성이 높은 방법인가?',
      '사업추진 주체가 성과와 문제점에 대한 자료를 정기적으로 점검(모니터링)하는 체계를 구축·운영하고 있는가?',
      '(시·도 필수) 지정된 센터(권역외상, 권역응급의료, 공공전문진료센터 등) 관리·운영 실적이 1분야-2-1에 포함되었는가?',
    ],
    targetSectionInDoc: '② 당초 계획 대비 변경 사항, ③ 사업 추진실적 (1. 사업개요, 2. 추진과정, 2-2. 사업관리)',
    aiServicePoint: '당초 계획 대비 미수행·변경사유 누락 탐지, 지정센터 실적 포함 여부 검증, 정기 모니터링 주기 분석',
  },
  {
    id: '1.4',
    category: '추진실적(70점)',
    code: '1.4',
    title: '목표 설정의 적절성 및 달성도',
    type: '정성',
    totalMaxScore: 5,
    centralPublicWeights: { field1: 3, field2: 2 },
    sidoWeights: { field1: 3, field2: 1, field3: 1 },
    purpose: '공공보건의료 시행계획 사업에 대한 목표 설정의 적절성과 목표 대비 달성도가 적절히 이루어졌는지 확인',
    criteriaQuestions: [
      '공공보건의료 시행계획에 제시된 성과지표의 목표 대비 달성률(B/A)이 적절한가?',
      '목표 설정의 적절성이 확보되었는가? (※ 목표 설정이 미흡할 경우 달성률이 높더라도 감점 대상)',
    ],
    targetSectionInDoc: '③ 사업 추진실적 (3-1. 성과목표 달성도, 측정산식, 목표치 산출근거)',
    aiServicePoint: '목표(A) 대비 실적(B) 달성률 자동 연산 및 과소 목표 설정(Easy Target) 여부 AI 이상치 탐지',
  },
  {
    id: '1.5',
    category: '추진실적(70점)',
    code: '1.5',
    title: '자체평가 적정성',
    type: '정성',
    totalMaxScore: 10,
    centralPublicWeights: { field1: 6, field2: 4 },
    sidoWeights: { field1: 5, field2: 3, field3: 2 },
    purpose: '사업 수행 과정 및 결과에 대한 자체평가(성공요인 및 부진요인 원인 진단)가 구체적이고 적절히 이루어졌는지 확인',
    criteriaQuestions: [
      '사업 수행에 있어 자체 평가결과 및 성과(성공요인) 분석이 구체적이고 적절한가?',
      '자체평가에 현재 문제점 진단(부진요인 분석)이 회피 없이 구체적으로 작성되었는가?',
    ],
    targetSectionInDoc: '③ 사업 추진실적 (3-2. 자체평가 - 성공요인 / 부진요인)',
    aiServicePoint: '성공요인·부진요인 인과성 NLP 분석 및 형식적 기재("특이사항 없음" 등) 자동 감점 경고',
  },
  {
    id: '1.6',
    category: '추진실적(70점)',
    code: '1.6',
    title: '향후 개선방안',
    type: '정성',
    totalMaxScore: 5,
    centralPublicWeights: { field1: 3, field2: 2 },
    sidoWeights: { field1: 3, field2: 1, field3: 1 },
    purpose: '자체평가 결과(부진요인)에 따라 향후 개선 방안 및 미래 모습이 구체적으로 제시되었는지 확인',
    criteriaQuestions: [
      '자체평가에서 도출된 부진요인을 해소하기 위한 향후 개선방안 및 미래 모습이 구체적으로 제시되었는가?',
    ],
    targetSectionInDoc: '③ 사업 추진실적 (3-3. 향후 개선방안)',
    aiServicePoint: '3-2 부진요인과 3-3 향후 개선방안 간의 논리적 정합성(1:1 대응 여부) AI 교차검증',
  },
  {
    id: '2.1',
    category: '사업계획(30점)',
    code: '2.1',
    title: '계획수립 충실성',
    type: '정성',
    totalMaxScore: 10,
    centralPublicWeights: { field1: 6, field2: 4 },
    sidoWeights: { field1: 5, field2: 3, field3: 2 },
    purpose: '차년도 공공보건의료 시행계획이 지역사회(소관병원) 현황분석을 토대로 기본계획의 3대 분야·11개 추진과제·18개 세부과제를 충실히 포함하였는지 확인',
    criteriaQuestions: [
      '사업계획 수립과 밀접하게 연관된 지역사회(소관병원) 현황분석 및 의료이용 분석이 구체적으로 기술되었는가?',
      '현황분석을 토대로 기본계획의 3대 분야, 11개 추진과제, 18개 세부과제에 대해 충실히 포함(제외 시 구체적 사유 제시)하였는가?',
    ],
    targetSectionInDoc: '시행계획 1. 지역사회 현황분석, 3. 추진과제, 3.3 계획 수립 제외 과제, 4. 세부 추진 시행계획',
    aiServicePoint: '지역진단 통계(헬스맵 데이터)와 현황분석 수치 일치성 검증 및 18개 세부과제 누락·제외사유 자동 점검',
  },
  {
    id: '2.2',
    category: '사업계획(30점)',
    code: '2.2',
    title: '성과지표 적절성',
    type: '정성',
    totalMaxScore: 10,
    centralPublicWeights: { field1: 6, field2: 4 },
    sidoWeights: { field1: 5, field2: 3, field3: 2 },
    purpose: '시행계획 각 사업의 성과지표가 산출·결과 지표 위주로 명확하고 도전적(상향 목표치)으로 설정되었는지 확인',
    criteriaQuestions: [
      '성과지표가 단순 투입(Input)·과정(Process) 지표가 아닌 산출(Output)·결과(Outcome) 지표로 설정되었는가?',
      '성과지표가 정책내용을 포괄적으로 대표하며 직접적인 연관성이 있는가?',
      '목표치 설정의 준거기준(최근 3개년 추세 등)을 제시하고 있으며 비교기준에 근거하여 상향 목표치인가?',
    ],
    targetSectionInDoc: '시행계획 3.2 주요 성과지표 및 목표 총괄표 (2021~2025), 4. 세부 사업별 성과지표 표',
    aiServicePoint: '성과지표 성격(투입/과정/산출/결과) AI 자동 분류기 및 부적절 지표의 산출·결과 지표 자동 변환 추천',
  },
  {
    id: '2.3',
    category: '사업계획(30점)',
    code: '2.3',
    title: '전년도 평가결과에 대한 개선',
    type: '정성',
    totalMaxScore: 5,
    centralPublicWeights: { field1: 3, field2: 2 },
    sidoWeights: { field1: 3, field2: 1, field3: 1 },
    purpose: '전년도 공공보건의료 시행계획 추진실적 평가 결과보고서의 전체 평가 의견을 빠짐없이 기재하고 개선방향을 반영하여 계획을 수립하였는지 확인',
    criteriaQuestions: [
      '전년도 평가 결과보고서의 전체 평가 의견(미흡한 점 등 지적사항)을 누락 없이 작성하였는가?',
      '지적사항에 대한 차년도 계획 반영 여부와 구체적 개선방향(미반영 시 구체적 사유)이 타당하게 수립되었는가?',
    ],
    targetSectionInDoc: '시행계획 2. 전년도 평가결과에 대한 개선 노력',
    aiServicePoint: '전년도 평가 결과보고서 원문 DB와 제출 계획서 대조를 통한 지적사항 누락·환류 이행률 자동 판정',
  },
  {
    id: '2.4',
    category: '사업계획(30점)',
    code: '2.4',
    title: '(시·도) 공공보건의료위원회 구성 및 운영',
    type: '정량',
    totalMaxScore: 5,
    centralPublicWeights: { field1: 0, field2: 0, common: 5 },
    sidoWeights: { field1: 0, field2: 0, field3: 0, common: 5 },
    purpose: '공공보건의료 시행계획의 수립·변경을 심의하기 위하여 공공보건의료위원회를 법령 기준에 맞게 구성·운영하고 의결과제를 반영하였는지 정량 확인',
    criteriaQuestions: [
      '위원장 1명을 포함하여 20명 이내로 구성되어 있는가?',
      '5대 분야(①공무원/소속구성원, ②주민대표, ③수요자대표, ④공급자대표, ⑤전문가) 중 ②~⑤ 분야별 각 2명 이상 포함되었는가?',
      '위원회를 통해 시행계획 심의를 실시하고 의결과제 반영 결과 및 증빙자료(회의록·심의의결서)를 제출하였는가?',
    ],
    targetSectionInDoc: '시행계획 부록: (시·도) 공공보건의료위원회 심의결과 (❶ 구성 명단, ❷ 심의결과, ❸ 증빙자료)',
    aiServicePoint: '위원회 명단 자동 파싱을 통한 5대 분야별 인원수(각 2명 이상) 충족 여부 및 정량 5점 만점 즉시 산출',
  },
];

// 개별 세부사업 추진실적 및 계획 입력 데이터 구조
export interface 분야별_사업평가_입력데이터 {
  fieldId: 1 | 2 | 3;
  fieldName: string;
  subTaskCode: string;
  projectName: string;
  isContinue: '신규' | '계속';
  // 1. 추진실적 영역 (70점 평가 대상)
  purposeAndContent: string;       // 1.1 기본계획 적합성 평가 대상
  executionSystem: string;         // 1.2 추진체계 적정성 평가 대상
  budgetPlanned: number;           // 최종예산(A, 억원)
  budgetExecuted: number;          // 집행예산(B, 억원)
  executionContent: string;        // 1.3 추진내용 적정성 평가 대상
  monitoringCycle: string;         // 1.3 정기 모니터링 체계
  hasDesignatedCenterReport: boolean; // 1.3 시도 지정센터(권역응급·외상 등) 실적 포함 여부
  hasPlanChangeReason: boolean;    // 1.3 당초 계획 대비 변경사유 기재 여부
  indicatorName: string;           // 1.4 & 2.2 주요 성과지표명
  indicatorType: 성과지표_성격유형; // 투입 / 과정 / 산출 / 결과
  targetValue: number;             // 목표(A)
  actualValue: number;             // 실적(B)
  unit: string;
  formulaAndBasis: string;         // 측정산식 및 목표치 산출근거
  selfEvalSuccess: string;         // 1.5 자체평가 (성공요인)
  selfEvalWeakness: string;        // 1.5 자체평가 (부진요인)
  futureImprovement: string;       // 1.6 향후 개선방안
  // 2. 차년도 사업계획 영역 (25점 정성 평가 대상)
  nextYearAnalysisAndPlan: string; // 2.1 계획수립 충실성
  nextYearTargetTrend: string;     // 2.2 최근 3개년 추세 및 상향 목표 근거
  prevEvalFeedbackReflection: string; // 2.3 전년도 평가결과 개선 반영 내용
}

// 공공보건의료위원회 구성 및 운영 정량평가 입력 구조 (2.4 항목 5점)
export interface 위원회_정량평가_입력데이터 {
  totalMembers: number;            // 위원장 포함 총 위원 수 (기준: 20명 이내)
  govCount: number;                // ① 공무원(또는 소속 구성원) 수
  residentRepCount: number;        // ② 지역주민 대표 수 (기준: 2명 이상)
  consumerRepCount: number;        // ③ 공공보건의료 수요자 대표 수 (기준: 2명 이상)
  providerRepCount: number;        // ④ 공공보건의료 공급자 대표 수 (기준: 2명 이상)
  expertCount: number;             // ⑤ 전문가 수 (기준: 2명 이상)
  meetingHeldCount: number;        // 심의 개최 횟수
  agendaReflected: boolean;        // 심의 의결과제 계획 반영 여부
  evidenceAttached: boolean;       // 회의록 또는 심의의결서 증빙 첨부 여부
  meetingSummary: string;          // 주요 심의 내용 및 검토 의견 요약
}

// 사전검증(Pre-Check) 체크리스트 관련 설정
export interface 문서_사전검증_설정 {
  isBulletPointFormat: boolean;    // 개조식 작성 원칙 준수 여부
  blueGuideTextRemoved: boolean;   // 서식 내 파란색 가이드 주석 삭제 여부
  summaryTableMatched: boolean;    // 요약표-사업총괄표-본문 사업명 일치 여부
  prevReportAllIncluded: boolean;  // 전년도 평가보고서 전체 평가의견 누락 없이 기재 여부
  excludedTaskReasonProvided: boolean; // 계획 수립 제외 과제에 대한 구체적 사유 기재 여부
}

// 기관 전체 평가 입력 패키지
export interface 기관_시행계획_평가패키지 {
  presetId: string;
  institutionName: string;
  institutionType: 평가대상_기관유형;
  affiliatedHospitalsCount: number;
  affiliatedHospitalsSummary: string;
  submissionDate: string;
  preCheckFlags: 문서_사전검증_설정;
  committeeData: 위원회_정량평가_입력데이터;
  fieldProjects: 분야별_사업평가_입력데이터[];
}

// ============================================================================
// 실전 평가 프리셋 4종 (시·도 최우수 / 시·도 양호 / 중앙·공공 우수 / 지침위반 미흡)
// ============================================================================
export const 시행계획_평가_프리셋_목록: 기관_시행계획_평가패키지[] = [
  {
    presetId: 'gangwon_best',
    institutionName: '강원특별자치도',
    institutionType: 'sido',
    affiliatedHospitalsCount: 12,
    affiliatedHospitalsSummary: '강원대병원(권역책임), 원주·강릉·속초·삼척·영월의료원(지역책임 5개소), 재활병원 등 12개소',
    submissionDate: '2025. 03. 28.',
    preCheckFlags: {
      isBulletPointFormat: true,
      blueGuideTextRemoved: true,
      summaryTableMatched: true,
      prevReportAllIncluded: true,
      excludedTaskReasonProvided: true,
    },
    committeeData: {
      totalMembers: 18,
      govCount: 2,
      residentRepCount: 3,
      consumerRepCount: 3,
      providerRepCount: 5,
      expertCount: 5,
      meetingHeldCount: 2,
      agendaReflected: true,
      evidenceAttached: true,
      meetingSummary: '2025년 강원특별자치도 공공보건의료 시행계획(안) 및 영월·삼척 중증응급 이송체계 개편안 원안 의결 (위원 의견 6건 전수 계획 반영, 회의록 및 의결서 첨부 완료)',
    },
    fieldProjects: [
      {
        fieldId: 1,
        fieldName: '1분야. 필수의료 제공 체계 확충',
        subTaskCode: '1분야-2-1',
        projectName: '강원 중증응급·심뇌혈관 지역완결형 골든타임 수호 및 지정센터(권역응급·외상) 통합 운영 사업',
        isContinue: '계속',
        purposeAndContent: '◦ 제2차 기본계획 1분야-2-1(중증응급 지역 기반 대응 체계 마련)과 연계하여 도내 응급 60분 미도달 취약군(영월·정선·평창 등)의 중증응급환자 적기 치료율 제고\n◦ 권역응급의료센터(춘천·원주·강릉) 및 권역외상센터 관리·운영 실적 포함, 취약지 지역응급의료기관 24시간 원격협진 및 닥터헬기 인계점 확충',
        executionSystem: '◦ 수행주체: 강원특별자치도 공공의료과 총괄 · 강원도공공보건의료지원단 기술지원 · 권역(강원대병원 등 3개소) 및 지역책임의료기관(영월의료원 등 5개소) 공동 수행\n◦ 추진절차: 취약지 환자 발생 → 119 스마트 구급대 심전도 전송 → 권역-지역 핫라인 동시 판독 → 전용병상 배정',
        budgetPlanned: 48.5,
        budgetExecuted: 47.2,
        executionContent: '◦ 2024.1~12월 권역응급의료센터 3개소·권역외상센터 1개소 전담전문의 당직비 및 중증응급 핫라인 365일 가동\n◦ 영월·속초·삼척 진료권 원격협진 네트워크 1,420건 수행, 고위험 산모·신생아 통합치료센터 연계 이송 프로토콜 정립',
        monitoringCycle: '월 1회 정기 응급의료지표 모니터링 및 분기별 시·도 응급의료협의체 전원 지연 사유 전수 분석(연 4회 완료)',
        hasDesignatedCenterReport: true,
        hasPlanChangeReason: true,
        indicatorName: '중증응급환자 적정시간(골든타임) 내 최종치료기관 도달률',
        indicatorType: '결과(Outcome)',
        targetValue: 62.0,
        actualValue: 64.8,
        unit: '%',
        formulaAndBasis: '∙ 측정산식: (발병 후 적정시간 내 최종치료 응급의료기관 도달 중증응급환자 수 / 전체 중증응급환자 수) × 100\n∙ 산출근거: 최근 3개년(’21년 54.2% → ’22년 57.5% → ’23년 59.8%) 연평균 증가율(+2.8%p)을 반영하여 ’24년 62.0%, ’25년 65.5% 상향 설정 (NEDIS 통계 기준)',
        selfEvalSuccess: '◦ 권역-지역책임의료기관 간 AI 심전도·영상 실시간 공유체계 도입으로 영월·정선권 급성심근경색 환자 전원 결정 시간을 평균 38분에서 19분으로 단축하여 목표치를 104.5% 초과 달성함',
        selfEvalWeakness: '◦ 동절기 폭설·기상악화 시 닥터헬기 출동 제한으로 산간 오지 지역의 야간 육로 이송 시간 지연 사례가 일부(연간 18건) 발생함',
        futureImprovement: '◦ 2025년 기상악화 대비 권역센터 전문의가 탑승하는 중증응급 전용 중환자 구급차(Mobile ICU) 2대 시범 배치 및 지역의료원 초동 안정화 처치실 장비 보강 반영',
        nextYearAnalysisAndPlan: '◦ [현황분석 연계] 헬스맵 진단 결과 도내 군단위 응급 60분 미도달 인구비율이 평균 48.2%로 전국 대비 열악함을 근거로 제시하고, 1분야 8개 세부과제 전체에 대해 누락 없이 2025년 실행사업 매핑 완료',
        nextYearTargetTrend: '◦ ’21년(54.2%) → ’22년(57.5%) → ’23년(59.8%) → ’24년 실적(64.8%) 추세를 반영하여 ’25년 목표치를 66.5%로 도전적 상향 설정',
        prevEvalFeedbackReflection: '◦ [’23년 평가의견 전수 기재] "권역외상센터와 지역응급의료기관 간 회송환자 관리 지표 보완 필요" 지적사항을 반영하여 ’25년 계획에 역전원(회송) 수용률 지표를 신설함',
      },
      {
        fieldId: 2,
        fieldName: '2분야. 공공보건의료 역량 강화',
        subTaskCode: '2분야-1-2',
        projectName: '지방의료원 필수의료 공공임상교수제 및 간호인력 공동수련·배치 지원 사업',
        isContinue: '계속',
        purposeAndContent: '◦ 제2차 기본계획 2분야-1-2(공공보건의료 인력 지원 강화)에 부합하도록 강원대병원-5개 지방의료원 간 공공임상교수 순환 파견 및 필수의료 간호사 임상교육 지원',
        executionSystem: '◦ 수행주체: 강원특별자치도 · 강원대학교병원(권역책임) · 5개 지방의료원(원주·강릉·속초·삼척·영월)\n◦ 국비·도비 매칭 인건비 및 정주여건 지원금 교부 체계 확립',
        budgetPlanned: 32.0,
        budgetExecuted: 30.8,
        executionContent: '◦ 신경외과·응급의학과·산부인과·소아청소년과 공공임상교수 10명 파견 근무 및 숙소·연구비 지원\n◦ 지방의료원 중환자실·응급실 전담간호사 85명 대상 권역대병원 시뮬레이션 임상교육 수료',
        monitoringCycle: '반기별 파견의료진 진료실적·만족도 평가 및 월별 간호인력 이직률 상시 모니터링',
        hasDesignatedCenterReport: true,
        hasPlanChangeReason: true,
        indicatorName: '취약지 지방의료원 필수의료 전문의 충원율 및 파견 의사 진료 기여율',
        indicatorType: '산출(Output)',
        targetValue: 85.0,
        actualValue: 88.0,
        unit: '%',
        formulaAndBasis: '∙ 측정산식: (실제 재직 및 파견 필수의료 전문의 수 / 정원 기준 필수 전문의 수) × 100\n∙ 산출근거: 전년도 실적(81.5%) 대비 +3.5%p 상향 목표 설정',
        selfEvalSuccess: '◦ 공공임상교수 정주여건 개선 및 대학병원 겸직 보장 제도를 통해 영월·삼척의료원 응급·내과 공백을 해소함',
        selfEvalWeakness: '◦ 소아청소년과 야간 당직 전문의는 여전히 채용 경쟁률이 낮아 단독 당직 체계 유지에 피로도가 누적됨',
        futureImprovement: '◦ 2025년 은퇴 시니어 의사 활용 공공의료 매칭 사업과 연계하여 소아·분만 야간 교대 인력을 추가 확보하고 원격 소아협진 수당 신설',
        nextYearAnalysisAndPlan: '◦ 도내 5개 지방의료원의 진료과별 전문의 결원 현황과 신포괄수가 CP 적용률을 정밀 분석하여 2분야 6개 세부과제 전부 반영',
        nextYearTargetTrend: '◦ ’22년(75.0%) → ’23년(81.5%) → ’24년(88.0%) 실적 기반 ’25년 목표치 91.0% 상향 설정',
        prevEvalFeedbackReflection: '◦ [’23년 평가의견 반영] "간호인력 교육 이수 후 실제 의료원 근속 유지 효과를 측정할 것" 권고를 반영하여 1년 이상 근속유지율 보조지표 추가',
      },
      {
        fieldId: 3,
        fieldName: '3분야. 공공보건의료 제도 기반 강화',
        subTaskCode: '3분야-1-2',
        projectName: '권역·지역책임의료기관 중심 퇴원환자 지역사회 연속돌봄 및 필수보건의료 원외협의체 운영',
        isContinue: '계속',
        purposeAndContent: '◦ 제2차 기본계획 3분야-1-2(책임의료기관 중심 필수보건의료 협력 기반 확대)에 따라 급성기 퇴원환자(뇌졸중·노인골절)의 지역사회 보건소·돌봄기관 연계 및 원외대표협의체 운영',
        executionSystem: '◦ 수행주체: 강원도 공공보건의료지원단 · 권역(1) 및 지역책임의료기관(5) 공공의료본부 · 18개 시군 보건소\n◦ 표준 케어플랜 수립 후 공공의료연계망 정보시스템을 통한 의뢰·회신 운영',
        budgetPlanned: 21.0,
        budgetExecuted: 20.5,
        executionContent: '◦ 뇌혈관·고관절골절 퇴원환자 1,180명 대상 다학제 퇴원계획 수립 및 시군 보건소 방문건강관리 연계\n◦ 권역·지역 필수보건의료 원외대표협의체 및 실무협의체 연 12회 개최하여 중증응급 이송·전원 지침 개정',
        monitoringCycle: '분기별 퇴원환자 재입원율 및 연계 완료율 점검 회의 개최(연 4회)',
        hasDesignatedCenterReport: true,
        hasPlanChangeReason: true,
        indicatorName: '퇴원환자 지역사회 케어플랜 연계 완료율 및 30일 내 계획되지 않은 재입원 감소율',
        indicatorType: '결과(Outcome)',
        targetValue: 78.0,
        actualValue: 81.2,
        unit: '%',
        formulaAndBasis: '∙ 측정산식: (퇴원 후 30일 이내 지역사회 보건·복지 서비스 실제 연계 완료 환자 수 / 연계 대상 등록 환자 수) × 100\n∙ 산출근거: 최근 3개년(’21년 65.0% → ’22년 71.2% → ’23년 75.4%) 추세 반영',
        selfEvalSuccess: '◦ 5개 지역책임의료기관 전체에 전담 케어코디네이터를 배치하여 퇴원 전 상담부터 보건소 연계까지 단절 없는 원스톱 체계를 정착시킴',
        selfEvalWeakness: '◦ 군 단위 일부 복지관·요양시설의 전산망 미연동으로 연계 후 사후 경과 회신이 수기 공문으로 처리되어 행정 시간 소요',
        futureImprovement: '◦ 2025년 클라우드 기반 지역사회 퇴원연계 모바일 알림·회신 채널을 도입하여 사후 모니터링 회신율을 95% 이상으로 개선',
        nextYearAnalysisAndPlan: '◦ 시·도 전용 평가영역인 3분야(협력·지원체계, 책임의료기관 협력, 재원·유인, 자체 평가체계) 4개 세부과제 전수 수립 완료',
        nextYearTargetTrend: '◦ ’23년(75.4%) → ’24년(81.2%) 달성 추세를 반영하여 ’25년 목표치 84.0% 상향 설정',
        prevEvalFeedbackReflection: '◦ [’23년 평가의견 반영] "원외협의체 논의 안건이 실제 시·도 정책 및 예산에 반영된 실적을 명시할 것" 지적사항을 반영하여 협의체 안건 정책반영 표 신설',
      },
    ],
  },
  {
    presetId: 'gyeongbuk_good',
    institutionName: '경상북도',
    institutionType: 'sido',
    affiliatedHospitalsCount: 9,
    affiliatedHospitalsSummary: '칠곡경북대병원(권역책임), 포항·김천·안동·울진군의료원, 상주·영주적십자병원 등 9개소',
    submissionDate: '2025. 03. 30.',
    preCheckFlags: {
      isBulletPointFormat: true,
      blueGuideTextRemoved: true,
      summaryTableMatched: true,
      prevReportAllIncluded: true,
      excludedTaskReasonProvided: false,
    },
    committeeData: {
      totalMembers: 16,
      govCount: 2,
      residentRepCount: 2,
      consumerRepCount: 1, // 기준 미달 (각 2명 이상이어야 하나 1명만 포함)
      providerRepCount: 6,
      expertCount: 5,
      meetingHeldCount: 1,
      agendaReflected: true,
      evidenceAttached: true,
      meetingSummary: '2025년 경상북도 공공보건의료 시행계획 서면 심의 완료 (단, 위원 구성 중 수요자 대표 위원이 1명으로 분야별 최소 2명 기준에 1명 미달)',
    },
    fieldProjects: [
      {
        fieldId: 1,
        fieldName: '1분야. 필수의료 제공 체계 확충',
        subTaskCode: '1분야-2-1',
        projectName: '경북 권역·지역 심뇌혈관 및 중증응급 이송·진료 협력 구축 사업',
        isContinue: '계속',
        purposeAndContent: '◦ 경북 북부권(안동·영주·봉화·울진) 중증응급 및 심뇌혈관질환 대응을 위한 응급의료기관 지원 및 홍보 사업 추진\n◦ 권역응급의료센터(안동병원·포항성모병원·구미차병원) 운영 지원 포함',
        executionSystem: '◦ 수행주체: 경상북도 공공의료과 · 경북공공보건의료지원단 · 3개 지방의료원 및 적십자병원',
        budgetPlanned: 38.0,
        budgetExecuted: 33.4,
        executionContent: '◦ 지역응급의료기관 당직의료진 인건비 보조 및 심뇌혈관질환 예방 도민 캠페인·홍보물 배포 실시\n◦ 닥터헬기 운항 지원 및 응급의료 종사자 교육 실시',
        monitoringCycle: '반기별 보조금 정산 점검 실시 (상시 성과지표 모니터링 주기는 구체적 기술 미흡)',
        hasDesignatedCenterReport: true,
        hasPlanChangeReason: true,
        indicatorName: '심뇌혈관질환 예방 교육 및 홍보 캠페인 개최 건수',
        indicatorType: '과정(Process)', // 지침에서 지양하는 과정/활동 지표! AI가 탐지하여 산출/결과 지표로 교정 제안
        targetValue: 24,
        actualValue: 26,
        unit: '회',
        formulaAndBasis: '∙ 측정산식: 연간 도내 보건소 및 의료원 합산 캠페인·교육 개최 횟수\n∙ 산출근거: 전년도(24회)와 동일한 수준으로 목표치 동결 설정',
        selfEvalSuccess: '◦ 도내 23개 시군 순회 캠페인을 통해 계획된 교육 횟수(24회)를 초과 달성(26회)함',
        selfEvalWeakness: '◦ 교육 횟수는 달성하였으나 실제 중증응급환자 관내 수용률이나 이송시간 단축 효과와의 직접적 인과성 분석이 부족함',
        futureImprovement: '◦ 차년도에는 홍보 사업 외에 실제 응급실 전원 핫라인 가동률을 높이기 위한 방안을 검토할 예정임',
        nextYearAnalysisAndPlan: '◦ 경북 의료취약지 현황분석은 작성되었으나, 1분야-2-2(지역별 암 치료·돌봄 강화) 세부과제 제외 사유가 구체적으로 기재되지 않음',
        nextYearTargetTrend: '◦ ’23년(24회) → ’24년(24회) → ’25년(24회)로 최근 3개년 목표치가 동결되어 상향 목표치 기준 미충족',
        prevEvalFeedbackReflection: '◦ 전년도 평가의견 중 "단순 홍보 건수 지표를 결과 지표로 대체할 것"이라는 권고가 있었으나 ’25년 계획에도 과정 지표가 일부 유지됨',
      },
      {
        fieldId: 2,
        fieldName: '2분야. 공공보건의료 역량 강화',
        subTaskCode: '2분야-2',
        projectName: '포항·김천·안동의료원 기능보강 및 필수의료 간호인력 역량강화 사업',
        isContinue: '계속',
        purposeAndContent: '◦ 도내 3개 지방의료원의 시설·장비 현대화 및 감염·중환자 간호인력 직무교육을 통한 공공병원 역량 강화',
        executionSystem: '◦ 수행주체: 경상북도 · 포항·김천·안동의료원 · 칠곡경북대병원 임상교육센터',
        budgetPlanned: 52.0,
        budgetExecuted: 49.1,
        executionContent: '◦ 김천·안동의료원 노후 의료장비(CT·생체징후모니터) 교체 완료 및 간호사 중환자 간호과정 120명 수료',
        monitoringCycle: '분기별 기능보강 집행점검 및 교육 수료자 만족도 조사 실시',
        hasDesignatedCenterReport: true,
        hasPlanChangeReason: true,
        indicatorName: '지방의료원 필수의료 임상교육 수료율 및 표준진료지침(CP) 적용률',
        indicatorType: '산출(Output)',
        targetValue: 75.0,
        actualValue: 76.5,
        unit: '%',
        formulaAndBasis: '∙ 측정산식: (임상교육 이수 인원 / 대상 간호사 수) × 100 및 CP 적용 퇴원환자 비율\n∙ 산출근거: 전년도 실적(72.0%) 대비 +3.0%p 상향',
        selfEvalSuccess: '◦ 권역책임의료기관 임상교육센터와 연계하여 지방의료원 신규 간호사들의 중증환자 처치 숙련도를 향상시킴',
        selfEvalWeakness: '◦ 일부 장비 도입이 계약 절차로 인해 4분기에 집중되어 연중 가동일수가 당초 계획보다 부족했음',
        futureImprovement: '◦ 2025년 장비 기능보강 사업은 1분기 조기 발주를 의무화하여 장비 가동률 지표를 병행 관리함',
        nextYearAnalysisAndPlan: '◦ 소관 3개 지방의료원 및 울진군의료원 경영·진료 현황 분석 수록 완료',
        nextYearTargetTrend: '◦ ’23년(72.0%) → ’24년(75.0%) → ’25년(78.5%) 상향 설정',
        prevEvalFeedbackReflection: '◦ 전년도 지적사항인 "기능보강 장비의 활용도 지표 추가" 의견을 반영하여 장비 가동률을 보조지표로 편성함',
      },
      {
        fieldId: 3,
        fieldName: '3분야. 공공보건의료 제도 기반 강화',
        subTaskCode: '3분야-1-1',
        projectName: '경상북도 공공보건의료지원단 및 책임의료기관 원외협의체 운영 사업',
        isContinue: '계속',
        purposeAndContent: '◦ 시·도 공공보건의료 협력·지원 체계 구축 및 중진료권별 원외협의체 운영을 통한 지역 필수의료 거버넌스 강화',
        executionSystem: '◦ 수행주체: 경상북도 · 경상북도공공보건의료지원단 · 권역(1) 및 지역책임의료기관(5)',
        budgetPlanned: 14.0,
        budgetExecuted: 13.6,
        executionContent: '◦ 경북 공공보건의료 기초통계 연보 발간, 시행계획 수립 지원 연구 4건 완료, 중진료권 원외협의체 8회 개최',
        monitoringCycle: '분기별 지원단 운영위원회 점검(연 4회)',
        hasDesignatedCenterReport: true,
        hasPlanChangeReason: true,
        indicatorName: '책임의료기관 원외협의체 의결 안건의 지자체 정책·사업 실제 반영률',
        indicatorType: '산출(Output)',
        targetValue: 70.0,
        actualValue: 72.5,
        unit: '%',
        formulaAndBasis: '∙ 측정산식: (시·도 및 시군 보건정책에 실제 반영된 안건 수 / 원외협의체 발굴 안건 수) × 100\n∙ 산출근거: 최근 3개년 평균(66.5%) 대비 상향 설정',
        selfEvalSuccess: '◦ 안동·포항권 퇴원환자 돌봄 연계 프로토콜이 시군 보건소 공식 사업으로 채택되는 성과를 거둠',
        selfEvalWeakness: '◦ 상주·김천권 일부 민간의료기관의 협의체 참석률이 저조하여 민·관 협력 범위 확대가 필요함',
        futureImprovement: '◦ 2025년 지역 종합병원장 간담회 정례화 및 협력 의료기관 인센티브 지원 조례 개정 추진',
        nextYearAnalysisAndPlan: '◦ 3분야 4개 세부과제 전반에 걸친 추진계획 수립 완료',
        nextYearTargetTrend: '◦ ’23년(66.5%) → ’24년(70.0%) → ’25년(75.0%) 상향 설정',
        prevEvalFeedbackReflection: '◦ 전년도 평가의견 전수 기재 및 개선방향 반영 완료',
      },
    ],
  },
  {
    presetId: 'moel_comwel_central',
    institutionName: '고용노동부 (근로복지공단)',
    institutionType: 'central_public',
    affiliatedHospitalsCount: 13,
    affiliatedHospitalsSummary: '근로복지공단 인천·대구·대전·안산·태백·동해·정선·순천·창원병원, 경기요양병원, 서울·부산·광주의원 (13개소)',
    submissionDate: '2025. 03. 27.',
    preCheckFlags: {
      isBulletPointFormat: true,
      blueGuideTextRemoved: true,
      summaryTableMatched: true,
      prevReportAllIncluded: true,
      excludedTaskReasonProvided: true,
    },
    committeeData: {
      totalMembers: 15,
      govCount: 3,
      residentRepCount: 2,
      consumerRepCount: 3,
      providerRepCount: 3,
      expertCount: 4,
      meetingHeldCount: 2,
      agendaReflected: true,
      evidenceAttached: true,
      meetingSummary: '고용노동부·근로복지공단 공공보건의료 심의위원회 대면 심의 개최 완료 (구성원·주민대표·수요자대표[근로자단체]·공급자대표·전문가 각 2명 이상 충족, 회의록 첨부)',
    },
    fieldProjects: [
      {
        fieldId: 1,
        fieldName: '1분야. 필수의료 제공 체계 확충',
        subTaskCode: '1분야-3-1',
        projectName: '산재근로자 전문재활 필수의료 확충 및 탄광·의료취약지(태백·정선·동해) 지역응급·분만 의료안전망 운영',
        isContinue: '계속',
        purposeAndContent: '◦ 제2차 기본계획 1분야(필수의료 확충)와 연계하여 산재근로자 급성기-아급성기 집중재활 치료 제공 및 강원 남부 의료취약지(태백·정선·동해병원) 응급·인공신장·검진 필수의료 수행',
        executionSystem: '◦ 수행주체: 고용노동부 산재보상정책국 · 근로복지공단 의료복지이사 및 전국 10개 산재병원·3개 의원\n◦ 지자체(강원도·태백시·정선군) 및 지역책임의료기관 협약 운영',
        budgetPlanned: 64.0,
        budgetExecuted: 62.5,
        executionContent: '◦ 태백·정선병원 24시간 지역응급의료기관 운영 및 인공신장실 혈액투석 18,500건 수행\n◦ 전문재활치료 로봇재활·작업복귀 프로그램 운영으로 산재장해 근로자 조기 직업복귀 달성',
        monitoringCycle: '매월 공단 본부-13개 소속병원 의료질관리(QI) 및 경영실적 정기 점검 회의 운영',
        hasDesignatedCenterReport: true,
        hasPlanChangeReason: true,
        indicatorName: '산재환자 집중재활 치료 후 직업복귀율 및 취약지 산재병원 응급실 수용률',
        indicatorType: '결과(Outcome)',
        targetValue: 71.0,
        actualValue: 73.4,
        unit: '%',
        formulaAndBasis: '∙ 측정산식: (집중재활프로그램 이수 후 6개월 내 원직장 또는 재취업 복귀자 수 / 전체 재활종결 산재환자 수) × 100\n∙ 산출근거: 최근 3개년(’21년 66.2% → ’22년 68.5% → ’23년 70.1%) 실적 추세 기반 상향 설정',
        selfEvalSuccess: '◦ 다학제 재활팀(재활의학과·물리치료·직업사회복지사) 통합 평가로 직업복귀율을 73.4%까지 끌어올렸으며, 정선·태백 지역 유일한 응급·투석 거점 역할을 완수함',
        selfEvalWeakness: '◦ 강원 탄광지역(태백·정선) 고령화 심화로 만성 호흡기·진폐 합병증 중환자 입원 수요가 급증하나 내과 세부전문의 확보에 애로가 있음',
        futureImprovement: '◦ 2025년 수도권 산재병원(인천·안산병원)과 태백·정선병원 간 원격 중환자 협진 및 순환 파견 진료 제도 도입',
        nextYearAnalysisAndPlan: '◦ 소관 13개 산재병원·의원의 소재지별 의료수요 및 환자 구성 현황을 충실히 분석하고 1분야 주요 과제 매핑 완료',
        nextYearTargetTrend: '◦ ’23년(70.1%) → ’24년(73.4%) 실적 추세에 맞춰 ’25년 목표치를 75.0%로 상향 설정',
        prevEvalFeedbackReflection: '◦ [’23년 평가의견 반영] "소속병원 소재 지자체(시·도) 지역보건의료계획과의 연계 협의를 강화할 것" 권고를 반영하여 태백·정선·동해시 보건소와의 합동 간담회 실적을 계획서 3.4항에 명시함',
      },
      {
        fieldId: 2,
        fieldName: '2분야. 공공보건의료 역량 강화',
        subTaskCode: '2분야-4',
        projectName: '13개 소속병원 차세대 스마트 병원정보시스템(EMR) 통합 및 AI 영상판독·표준진료지침(CP) 고도화 사업',
        isContinue: '계속',
        purposeAndContent: '◦ 제2차 기본계획 2분야-2(운영개선) 및 2분야-4(첨단 ICT 활용 강화)와 연계하여 공단 소속병원 클라우드 기반 통합 EMR 고도화 및 AI 흉부·근골격 영상판독 보조시스템 확산',
        executionSystem: '◦ 수행주체: 근로복지공단 의료정보부 · 10개 소속병원 적정진료실(QI팀)',
        budgetPlanned: 41.0,
        budgetExecuted: 39.8,
        executionContent: '◦ 태백·정선·동해 등 취약지 병원에 AI 흉부 X-ray/CT 진폐·결핵·폐암 판독보조 솔루션 도입(연간 42,000건 판독 지원)\n◦ 근골격계·재활 질환군 표준진료지침(CP) 28종 전산 적용',
        monitoringCycle: '분기별 소속병원 CP 적용률 및 AI 판독 일치율·판독소요시간 단축 효과 정기 점검',
        hasDesignatedCenterReport: true,
        hasPlanChangeReason: true,
        indicatorName: '소속병원 표준진료지침(CP) 적용률 및 취약지 병원 AI 영상판독 시간 단축률',
        indicatorType: '산출(Output)',
        targetValue: 65.0,
        actualValue: 67.2,
        unit: '%',
        formulaAndBasis: '∙ 측정산식: (CP 적용 퇴원환자 수 / CP 대상 질환군 전체 퇴원환자 수) × 100\n∙ 산출근거: 전년도 실적(61.8%) 대비 +3.2%p 상향 설정',
        selfEvalSuccess: '◦ 영상의학과 전문의 구인난을 겪는 태백·정선병원에 AI 영상판독 보조와 인천병원 원격판독을 결합하여 응급 영상 판독시간을 45% 단축함',
        selfEvalWeakness: '◦ 고령 복합상병 산재환자의 경우 단일 질환 CP 적용 시 중도 제외(Variance) 비율이 22%로 다소 높게 나타남',
        futureImprovement: '◦ 2025년 다빈도 복합상병(골절+당뇨·고혈압) 맞춤형 다학제 CP 5종을 추가 개발하여 변이율을 15% 이하로 낮춤',
        nextYearAnalysisAndPlan: '◦ 중앙행정기관·공공단체 작성 대상인 1분야·2분야 전체 과제에 대해 현황분석 및 추진계획 수립 완료 (3분야는 지침상 중앙·공공 평가 제외 대상)',
        nextYearTargetTrend: '◦ ’23년(61.8%) → ’24년(67.2%) 실적 기반 ’25년 목표치 70.0% 상향 설정',
        prevEvalFeedbackReflection: '◦ 전년도 평가의견 전수 기재 및 미반영 사항 없음',
      },
    ],
  },
  {
    presetId: 'defect_verification',
    institutionName: '○○시 (지침 위반·보완필요 검증 샘플)',
    institutionType: 'sido',
    affiliatedHospitalsCount: 4,
    affiliatedHospitalsSummary: '○○시의료원, ○○시립요양병원 등 4개소',
    submissionDate: '2025. 03. 31.',
    preCheckFlags: {
      isBulletPointFormat: false,          // 위반: 서술식 장문 작성 (개조식 미준수)
      blueGuideTextRemoved: false,         // 위반: 서식 내 파란색 작성안내 문구 미삭제
      summaryTableMatched: false,          // 위반: 요약표 사업명과 본문 사업명 불일치
      prevReportAllIncluded: false,        // 위반: 전년도 평가의견 일부 누락 및 미반영사유 미기재
      excludedTaskReasonProvided: false,   // 위반: 계획 제외 과제 사유 미기재
    },
    committeeData: {
      totalMembers: 22,                    // 위반: 위원장 포함 20명 이내 기준 초과 (22명)
      govCount: 4,
      residentRepCount: 1,                 // 위반: 주민대표 1명 (기준: 2명 이상)
      consumerRepCount: 1,                 // 위반: 수요자대표 1명 (기준: 2명 이상)
      providerRepCount: 10,
      expertCount: 6,
      meetingHeldCount: 1,
      agendaReflected: false,              // 위반: 심의 의견 미반영
      evidenceAttached: false,             // 위반: 회의록·심의의결서 증빙 누락
      meetingSummary: '서면 심의 진행하였으나 회의록 및 의결서 첨부 누락, 주민대표 및 수요자대표 각 1명만 위촉되어 법정 구성요건 미충족',
    },
    fieldProjects: [
      {
        fieldId: 1,
        fieldName: '1분야. 필수의료 제공 체계 확충',
        subTaskCode: '1분야-2-1',
        projectName: '○○시 응급의료 지원 사업',
        isContinue: '계속',
        purposeAndContent: '우리 시는 시민들의 건강을 지키기 위하여 응급의료기관에 보조금을 교부하는 사업을 매년 지속적으로 추진하고 있으며 앞으로도 열심히 추진할 계획입니다. * 사업의 목표, 사업추진방법 등을 알기 쉽게 작성(파란색 가이드 미삭제)',
        executionSystem: '○○시 보건위생과 단독 수행 (구체적 추진절차 및 연계체계 미기재)',
        budgetPlanned: 20.0,
        budgetExecuted: 11.2,
        executionContent: '관내 응급실 운영비 보조금 지급 완료 (권역응급의료센터·권역외상센터·공공전문진료센터 관리·운영 실적 누락, 당초 계획 대비 1개 세부사업 미수행 사유 미기재)',
        monitoringCycle: '연말 보조금 정산 시 1회 확인 (정기 모니터링 체계 미구축)',
        hasDesignatedCenterReport: false,
        hasPlanChangeReason: false,
        indicatorName: '응급의료기관 보조금 예산 교부 건수',
        indicatorType: '투입(Input)',
        targetValue: 2,
        actualValue: 2,
        unit: '건',
        formulaAndBasis: '산식 및 산출근거 미기재',
        selfEvalSuccess: '예산을 교부하여 사업을 무사히 완료하였음',
        selfEvalWeakness: '특이사항 없음 (부진요인 진단 누락)',
        futureImprovement: '지속 추진 예정',
        nextYearAnalysisAndPlan: '지역 현황 통계 제시 없이 기존 사업 단순 연장 기재, 기본계획 18개 세부과제 중 7개 과제 누락 및 제외 사유 미작성',
        nextYearTargetTrend: '전년도와 동일하게 2건으로 목표치 설정 (준거기준 및 상향 목표 미제시)',
        prevEvalFeedbackReflection: '전년도 평가의견 5건 중 2건만 발췌 기재하고 미반영 사유 공란 제출',
      },
      {
        fieldId: 2,
        fieldName: '2분야. 공공보건의료 역량 강화',
        subTaskCode: '2분야-1-1',
        projectName: '공공병원 직원 친절 교육 사업',
        isContinue: '계속',
        purposeAndContent: '제2차 기본계획 2분야-1-1(의사·필수의료 인력 확충 체계 마련) 과제에 전직원 일반 친절·소양 교육을 기재하여 기본계획 세부과제 목적과 사업 내용 간 적합성 미흡',
        executionSystem: '○○시의료원 총무팀',
        budgetPlanned: 5.0,
        budgetExecuted: 3.1,
        executionContent: '연 2회 외부강사 초빙 친절 교육 실시',
        monitoringCycle: '교육 종료 후 설문조사 1회',
        hasDesignatedCenterReport: false,
        hasPlanChangeReason: false,
        indicatorName: '친절 교육 개최 횟수',
        indicatorType: '과정(Process)',
        targetValue: 2,
        actualValue: 2,
        unit: '회',
        formulaAndBasis: '연간 교육 횟수 합산',
        selfEvalSuccess: '연 2회 교육을 정상 개최함',
        selfEvalWeakness: '바쁜 진료 일정으로 참석률이 낮았음',
        futureImprovement: '온라인 교육 병행 검토',
        nextYearAnalysisAndPlan: '의료인력 결원 현황 분석 미흡',
        nextYearTargetTrend: '’25년 목표치 2회 유지',
        prevEvalFeedbackReflection: '미작성',
      },
      {
        fieldId: 3,
        fieldName: '3분야. 공공보건의료 제도 기반 강화',
        subTaskCode: '3분야-1-1',
        projectName: '공공보건의료 간담회 운영',
        isContinue: '계속',
        purposeAndContent: '유관기관 간담회 개최',
        executionSystem: '○○시 보건위생과',
        budgetPlanned: 3.0,
        budgetExecuted: 1.5,
        executionContent: '연 1회 간담회 개최',
        monitoringCycle: '별도 모니터링 없음',
        hasDesignatedCenterReport: false,
        hasPlanChangeReason: false,
        indicatorName: '간담회 개최 횟수',
        indicatorType: '과정(Process)',
        targetValue: 2,
        actualValue: 1,
        unit: '회',
        formulaAndBasis: '간담회 개최 건수 (미달성 사유 미기재)',
        selfEvalSuccess: '유관기관 담당자 대면 회의 진행',
        selfEvalWeakness: '일정 조율 어려움으로 1회만 개최',
        futureImprovement: '차년도 2회 개최 추진',
        nextYearAnalysisAndPlan: '책임의료기관 협력계획 구체성 부족',
        nextYearTargetTrend: '2회 설정',
        prevEvalFeedbackReflection: '미작성',
      },
    ],
  },
];

// ============================================================================
// AI 서비스 1: 제출서류·작성서식 지침 준수 자동 사전검증 (Pre-Check AI) 결과 타입
// ============================================================================
export interface 사전검증_항목_결과 {
  id: string;
  ruleTitle: string;
  guidelineRef: string;
  passed: boolean;
  severity: '필수(감점직결)' | '권고(보완필요)';
  findingDetail: string;
  aiAutoFixSuggestion: string;
}

// ============================================================================
// AI 서비스 2: 성과지표 적절성 진단 및 AI 추천 지표 변환 결과 타입
// ============================================================================
export interface 성과지표_AI진단_결과 {
  fieldId: 1 | 2 | 3;
  projectName: string;
  currentIndicator: string;
  currentType: 성과지표_성격유형;
  isAppropriate: boolean;
  achievementRate: number;
  guidelineDiagnosis: string;
  recommendedIndicator: string;
  recommendedType: '산출(Output)' | '결과(Outcome)';
  recommendedFormula: string;
}

// ============================================================================
// AI 서비스 3: 공공보건의료위원회 정량평가(5점) 자동 채점 결과 타입
// ============================================================================
export interface 위원회_정량채점_결과 {
  maxScore: 5;
  calculatedScore: number;
  isTotalWithin20: boolean;
  categoryCheck: {
    label: string;
    count: number;
    requiredMin: number;
    passed: boolean;
  }[];
  operationPassed: boolean;
  evidencePassed: boolean;
  aiComment: string;
}

// ============================================================================
// AI 서비스 4: 공식 평가표 10대 항목 × 3대 분야 세부 채점 결과 타입
// ============================================================================
export interface 항목별_세부채점_결과 {
  indicator: 공식_평가지표_항목;
  field1Max: number;
  field1Score: number;
  field1Grade: 루브릭_척도_등급;
  field2Max: number;
  field2Score: number;
  field2Grade: 루브릭_척도_등급;
  field3Max: number;
  field3Score: number;
  field3Grade: 루브릭_척도_등급;
  commonMax: number;
  commonScore: number;
  totalMax: number;
  totalScore: number;
  aiEvidenceHighlight: string;
  aiDeductionReason: string;
}

// ============================================================================
// AI 서비스 5: 평가소위원회(5인) 위원 간 점수 편차 및 이견 조정 시뮬레이션
// ============================================================================
export interface 소위원회_위원편차_항목 {
  indicatorCode: string;
  indicatorTitle: string;
  maxScore: number;
  committeeScores: {
    reviewerName: string;
    specialty: string;
    score: number;
    comment: string;
  }[];
  varianceGap: number;
  isDisputed: boolean;
  aiMediationOpinion: string;
  recommendedFinalScore: number;
}

// ============================================================================
// 통합 AI 평가 산출 결과 패키지
// ============================================================================
export interface 시행계획_AI평가_종합결과 {
  institutionName: string;
  institutionType: 평가대상_기관유형;
  performanceScore70: number;      // 전년도 추진실적 점수 (70점 만점)
  planScore30: number;             // 당해 연도 시행계획 점수 (30점 만점)
  qualitativeScore95: number;      // 정성평가 합계 (95점 만점)
  quantitativeScore5: number;      // 정량평가 합계 (5점 만점)
  field1TotalScore: number;        // 1분야 득점 / 만점
  field1MaxScore: number;
  field2TotalScore: number;        // 2분야 득점 / 만점
  field2MaxScore: number;
  field3TotalScore: number;        // 3분야 득점 / 만점 (시·도만 해당)
  field3MaxScore: number;
  totalScore100: number;           // 총점 (100점 만점)
  finalGrade: 종합_평가_등급;      // 최우수 / 우수 / 양호 / 보통 / 미흡
  isAwardEligible: boolean;        // 보건복지부 포상 및 우수사례 공개 대상 여부
  preCheckResults: 사전검증_항목_결과[];
  indicatorDiagnoses: 성과지표_AI진단_결과[];
  committeeResult: 위원회_정량채점_결과;
  itemScores: 항목별_세부채점_결과[];
  subcommitteeDisputes: 소위원회_위원편차_항목[];
  generatedOfficialReport: {
    overallSummary: string;
    strengths: string[];
    weaknessesAndDeductions: string[];
    nextYearRecommendations: string[];
  };
}

// 루브릭 등급별 환산율 (지침의 등간 5구간 절대평가 기준)
export const 루브릭_등급별_배율: Record<루브릭_척도_등급, number> = {
  수: 1.0,   // 매우 우수 (100%)
  우: 0.85,  // 우수 (85%)
  미: 0.70,  // 보통 (70%)
  양: 0.55,  // 미흡 (55%)
  가: 0.40,  // 매우 미흡 (40%)
};

function scoreToGrade(ratio: number): 루브릭_척도_등급 {
  if (ratio >= 0.92) return '수';
  if (ratio >= 0.80) return '우';
  if (ratio >= 0.65) return '미';
  if (ratio >= 0.50) return '양';
  return '가';
}

// ============================================================================
// 핵심 평가 산출 함수 (공공기관 입력자료 → 평가지침 평가표 산출 + AI 6단계 분석)
// ============================================================================
export function evaluateImplementationPlan(
  pkg: 기관_시행계획_평가패키지,
  manualGradeOverrides?: Record<string, { field1?: 루브릭_척도_등급; field2?: 루브릭_척도_등급; field3?: 루브릭_척도_등급 }>
): 시행계획_AI평가_종합결과 {
  const isSido = pkg.institutionType === 'sido';
  const f1 = pkg.fieldProjects.find((p) => p.fieldId === 1) || pkg.fieldProjects[0];
  const f2 = pkg.fieldProjects.find((p) => p.fieldId === 2) || pkg.fieldProjects[1] || f1;
  const f3 = pkg.fieldProjects.find((p) => p.fieldId === 3) || pkg.fieldProjects[2] || f1;

  // --------------------------------------------------------------------------
  // [AI 서비스 1] 제출서류·작성서식 지침 준수 사전검증 (8대 체크리스트)
  // --------------------------------------------------------------------------
  const preCheckResults: 사전검증_항목_결과[] = [
    {
      id: 'pc_1',
      ruleTitle: '요약표 · 사업 총괄표 · 본문 사업명 일관성 검증',
      guidelineRef: '추진실적 작성지침 p.30, p.50 (작성서식 정의 및 가이드)',
      passed: pkg.preCheckFlags.summaryTableMatched,
      severity: '필수(감점직결)',
      findingDetail: pkg.preCheckFlags.summaryTableMatched
        ? '요약표, 분야별 ① 사업 총괄표, ③ 사업 추진실적 본문의 사업명 및 과제번호가 100% 일치합니다.'
        : '요약표에 기재된 사업명과 본문 ③ 사업 추진실적의 세부 사업명이 불일치하는 항목이 감지되었습니다.',
      aiAutoFixSuggestion: '요약표의 기본계획 과제번호(1분야-2-1 등)를 기준으로 총괄표와 본문 사업명을 자동 동기화합니다.',
    },
    {
      id: 'pc_2',
      ruleTitle: '당초 계획 대비 변경사항 및 미수행 사유 기재 검증',
      guidelineRef: '추진실적 작성지침 제2장 1.2 작성방법 (p.22) 및 1.3 평가기준 (p.34)',
      passed: pkg.fieldProjects.every((p) => p.hasPlanChangeReason),
      severity: '필수(감점직결)',
      findingDetail: pkg.fieldProjects.every((p) => p.hasPlanChangeReason)
        ? '계획 대비 변경(또는 정상 이행) 사유가 ② 당초 계획 대비 변경 사항 및 ③ 계획 대비 변경사항 란에 모두 명시되었습니다.'
        : '당초 시행계획 대비 세부사업 변경·미수행 또는 목표치 변경이 발생하였으나 변경 사유가 누락된 분야가 있습니다.',
      aiAutoFixSuggestion: '전년도 시행계획 원문과 당해 추진실적을 비교하여 변경 전·후 표와 불가피한 변경 사유 초안을 자동 생성합니다.',
    },
    {
      id: 'pc_3',
      ruleTitle: '(시·도 필수) 지정 센터(권역응급·권역외상·공공전문진료센터) 실적 포함 여부',
      guidelineRef: '추진실적 작성지침 p.32, p.34 (1분야-2-1 필수 기재사항)',
      passed: !isSido || f1.hasDesignatedCenterReport,
      severity: '필수(감점직결)',
      findingDetail: !isSido
        ? '중앙행정기관·공공단체 해당 사항 (소관 13개 산재병원 응급·재활센터 실적 수록 완료)'
        : f1.hasDesignatedCenterReport
        ? '1분야-2-1(중증응급 지역 기반 대응 체계 마련)에 시·도 지정 권역응급·권역외상센터 관리·운영 실적이 정상 포함되었습니다.'
        : '[지침 위반] 시·도에 지정된 권역응급의료센터·권역외상센터·공공전문진료센터에 대한 관리·운영 실적이 1분야-2-1에서 누락되었습니다.',
      aiAutoFixSuggestion: '관내 지정 권역응급·권역외상센터의 전년도 운영보조금 집행실적 및 중증응급 수용률 데이터를 1분야-2-1에 자동 삽입합니다.',
    },
    {
      id: 'pc_4',
      ruleTitle: '전년도 추진실적 평가 결과보고서 전체 의견 기재 및 미반영 사유 유무',
      guidelineRef: '시행계획 수립지침 p.24, p.41 (2. 전년도 평가결과에 대한 개선 노력)',
      passed: pkg.preCheckFlags.prevReportAllIncluded,
      severity: '필수(감점직결)',
      findingDetail: pkg.preCheckFlags.prevReportAllIncluded
        ? '전년도 평가 결과보고서의 전체 평가 의견을 빠짐없이 기재하고 2025년 개선방향을 구체적으로 매핑하였습니다.'
        : '[지침 위반] 전년도 평가 결과보고서 의견 중 일부만 발췌 작성되었거나 미반영 항목에 대한 구체적 사유가 공란입니다.',
      aiAutoFixSuggestion: '국립중앙의료원 평가결과 DB에서 전년도 평가의견 전문을 불러와 누락 문항을 채우고 개선방향 문안을 생성합니다.',
    },
    {
      id: 'pc_5',
      ruleTitle: '계획 수립 제외 과제(3.3) 구체적 근거 제시 여부',
      guidelineRef: '시행계획 수립지침 p.25 (3.3 계획 수립 제외 과제)',
      passed: pkg.preCheckFlags.excludedTaskReasonProvided,
      severity: '필수(감점직결)',
      findingDetail: pkg.preCheckFlags.excludedTaskReasonProvided
        ? '기본계획 18개 세부과제 전수 포함(또는 미수립 과제에 대한 구체적 제외 근거 제시) 요건을 충족하였습니다.'
        : '기본계획 세부과제 중 일부 과제가 제외되었으나 3.3 [계획 수립 제외 과제] 표에 구체적 근거가 제시되지 않았습니다.',
      aiAutoFixSuggestion: '미매핑 세부과제를 자동 검출하고 기관 기능 특성상 제외된 사유 또는 연계 대안사업을 자동 매핑합니다.',
    },
    {
      id: 'pc_6',
      ruleTitle: '공문서 개조식 작성 원칙 및 파란색 작성안내 주석 삭제 여부',
      guidelineRef: '시행계획 수립지침 p.12 / 추진실적 작성지침 p.22 (기타 필수 검토사항)',
      passed: pkg.preCheckFlags.isBulletPointFormat && pkg.preCheckFlags.blueGuideTextRemoved,
      severity: '권고(보완필요)',
      findingDetail:
        pkg.preCheckFlags.isBulletPointFormat && pkg.preCheckFlags.blueGuideTextRemoved
          ? '모든 항목이 개조식(◦, -, ∙)으로 일목요연하게 작성되었으며 양식 내 파란색 가이드 주석이 완전 삭제되었습니다.'
          : '서술형 문장("~하고 있으며 앞으로도 열심히 추진할 계획입니다") 또는 삭제되지 않은 파란색 작성가이드 문구가 남아 있습니다.',
      aiAutoFixSuggestion: 'AI 개조식 변환기로 서술형 문장을 공문서 표준 개조식으로 즉시 교정하고 잔여 가이드 주석을 일괄 제거합니다.',
    },
  ];

  // --------------------------------------------------------------------------
  // [AI 서비스 2] 성과지표 적절성 진단 (투입/과정 지양 → 산출/결과 권장)
  // --------------------------------------------------------------------------
  const indicatorDiagnoses: 성과지표_AI진단_결과[] = pkg.fieldProjects.map((proj) => {
    const rate = proj.targetValue > 0 ? Math.round((proj.actualValue / proj.targetValue) * 1000) / 10 : 0;
    const isGoodType = proj.indicatorType === '산출(Output)' || proj.indicatorType === '결과(Outcome)';

    let diagnosis = '';
    let recIndicator = proj.indicatorName;
    let recType: '산출(Output)' | '결과(Outcome)' = '결과(Outcome)';
    let recFormula = proj.formulaAndBasis;

    if (isGoodType) {
      diagnosis = `[적정] 지침에서 권장하는 '${proj.indicatorType}' 지표로 설정되었으며, 측정산식과 최근 3개년 추세 기반 목표치 산출근거가 명확합니다. (달성률 ${rate}%)`;
    } else if (proj.indicatorType === '투입(Input)') {
      diagnosis = `[부적절 - 감점 대상] 지침(수립지침 p.26~27)에서 지양하도록 명시한 단순 '투입(Input) 지표(${proj.indicatorName})'입니다. 달성률이 ${rate}%이더라도 1.4항 및 2.2항에서 감점됩니다.`;
      recIndicator = '관내 중증응급환자 적정시간 내 최종치료 도달률 및 응급실 수용률';
      recType = '결과(Outcome)';
      recFormula = '(적정시간 내 최종치료 도달 중증응급환자 수 / 관내 발생 전체 중증응급환자 수) × 100 (NEDIS 자료원 기반)';
    } else {
      diagnosis = `[부적절 - 보완 권고] 단순 개최 횟수·홍보 건수 중심의 '과정(Process) 지표(${proj.indicatorName})'는 사업목적 달성 여부를 포괄적으로 대표하기 어렵습니다(수립지침 p.26).`;
      recIndicator =
        proj.fieldId === 1
          ? '중증응급·심뇌혈관 핫라인 경유 적기 전원 수용률(%)'
          : proj.fieldId === 2
          ? '필수의료 임상교육 이수 인력의 실제 현업 진료프로토콜(CP) 적용률(%)'
          : '공공보건의료 협의체 의결 안건의 지자체 정책·예산 실제 반영률(%)';
      recType = proj.fieldId === 1 ? '결과(Outcome)' : '산출(Output)';
      recFormula = '(사업 수행을 통해 실제 개선·반영된 산출 건수 / 전체 대상 건수) × 100 (최근 3개년 평균 대비 +3%p 상향 설정)';
    }

    return {
      fieldId: proj.fieldId,
      projectName: proj.projectName,
      currentIndicator: proj.indicatorName,
      currentType: proj.indicatorType,
      isAppropriate: isGoodType,
      achievementRate: rate,
      guidelineDiagnosis: diagnosis,
      recommendedIndicator: recIndicator,
      recommendedType: recType,
      recommendedFormula: recFormula,
    };
  });

  // --------------------------------------------------------------------------
  // [AI 서비스 3] 공공보건의료위원회 구성 및 운영 정량평가 (5점 만점 자동 산출)
  // --------------------------------------------------------------------------
  const c = pkg.committeeData;
  const isTotalWithin20 = c.totalMembers > 0 && c.totalMembers <= 20;
  const categoryCheck = [
    { label: '① 공무원(소속구성원)', count: c.govCount, requiredMin: 1, passed: c.govCount >= 1 },
    { label: '② 지역주민 대표', count: c.residentRepCount, requiredMin: 2, passed: c.residentRepCount >= 2 },
    { label: '③ 공공보건의료 수요자 대표', count: c.consumerRepCount, requiredMin: 2, passed: c.consumerRepCount >= 2 },
    { label: '④ 공공보건의료 공급자 대표', count: c.providerRepCount, requiredMin: 2, passed: c.providerRepCount >= 2 },
    { label: '⑤ 학식·경험 전문가', count: c.expertCount, requiredMin: 2, passed: c.expertCount >= 2 },
  ];
  const allCategoriesPassed = categoryCheck.every((cat) => cat.passed);
  const operationPassed = c.meetingHeldCount >= 1 && c.agendaReflected;
  const evidencePassed = c.evidenceAttached;

  // 정량 5점 산출 로직 (지침 2.4 점수화 기준: 3~4개 구간 평가, 증빙 불충분 시 불인정)
  let quantScore = 0;
  if (!evidencePassed) {
    quantScore = 1.5; // 증빙자료 미첨부 시 운영 점수 불인정, 구성 일부만 인정
  } else {
    // 구성 적절성 (2.5점) + 운영 및 심의반영 (2.5점)
    let compScore = 2.5;
    if (!isTotalWithin20) compScore -= 0.5;
    const failedCatCount = categoryCheck.filter((cat) => !cat.passed).length;
    compScore -= failedCatCount * 0.75;
    compScore = Math.max(0.5, compScore);

    let opScore = 2.5;
    if (c.meetingHeldCount === 0) opScore = 0;
    else if (!c.agendaReflected) opScore = 1.25;

    quantScore = Math.round((compScore + opScore) * 10) / 10;
  }

  const committeeResult: 위원회_정량채점_결과 = {
    maxScore: 5,
    calculatedScore: quantScore,
    isTotalWithin20,
    categoryCheck,
    operationPassed,
    evidencePassed,
    aiComment:
      quantScore === 5
        ? '위원장 포함 20명 이내 구성, ②주민·③수요자·④공급자·⑤전문가 각 2명 이상 위촉 기준을 모두 충족하며 심의의결 반영 및 회의록 증빙이 완벽합니다. (5.0 / 5.0점)'
        : `정량 기준 일부 미충족으로 감점(${quantScore} / 5.0점): ${
            !isTotalWithin20 ? `[총원 ${c.totalMembers}명으로 20명 이내 초과] ` : ''
          }${
            !allCategoriesPassed
              ? `[분야별 최소 2명 미달: ${categoryCheck
                  .filter((x) => !x.passed)
                  .map((x) => `${x.label}(${x.count}명)`)
                  .join(', ')}] `
              : ''
          }${!evidencePassed ? '[회의록/심의의결서 증빙자료 누락]' : ''}`,
  };

  // --------------------------------------------------------------------------
  // [AI 서비스 4] 개별 분야 프로젝트 품질 점수율(0.4~1.0) 평가 헬퍼
  // --------------------------------------------------------------------------
  const evaluateFieldProjectRatio = (proj: 분야별_사업평가_입력데이터, indicatorId: string): number => {
    const budgetRate = proj.budgetPlanned > 0 ? proj.budgetExecuted / proj.budgetPlanned : 0;
    const targetRate = proj.targetValue > 0 ? proj.actualValue / proj.targetValue : 0;
    const isGoodInd = proj.indicatorType === '산출(Output)' || proj.indicatorType === '결과(Outcome)';

    switch (indicatorId) {
      case '1.1': {
        // 기본계획과 사업 목적·내용 적합성
        let r = 0.88;
        if (proj.purposeAndContent.length >= 90) r += 0.08;
        if (proj.purposeAndContent.includes('기본계획') || proj.purposeAndContent.includes('연계')) r += 0.04;
        if (!pkg.preCheckFlags.isBulletPointFormat || proj.purposeAndContent.includes('파란색 가이드')) r -= 0.35;
        if (proj.purposeAndContent.includes('부적합') || proj.projectName.includes('친절 교육')) r -= 0.25;
        return Math.min(1.0, Math.max(0.4, r));
      }
      case '1.2': {
        // 사업 추진체계(인력, 예산 투입 등) 적정성
        let r = 0.85;
        if (proj.executionSystem.length >= 60) r += 0.08;
        if (budgetRate >= 0.90) r += 0.07;
        else if (budgetRate < 0.70) r -= 0.25;
        if (proj.executionSystem.includes('단독 수행') || proj.executionSystem.length < 30) r -= 0.20;
        return Math.min(1.0, Math.max(0.4, r));
      }
      case '1.3': {
        // 사업 추진 내용의 적정성 (30점 최대 배점)
        let r = 0.86;
        if (proj.executionContent.length >= 80) r += 0.06;
        if (proj.monitoringCycle.includes('월') || proj.monitoringCycle.includes('분기')) r += 0.08;
        else r -= 0.18;
        if (isSido && proj.fieldId === 1 && !proj.hasDesignatedCenterReport) r -= 0.22;
        if (!proj.hasPlanChangeReason) r -= 0.18;
        return Math.min(1.0, Math.max(0.4, r));
      }
      case '1.4': {
        // 목표 설정의 적절성 및 달성도
        let r = 0.85;
        if (targetRate >= 1.0) r += 0.10;
        else if (targetRate >= 0.90) r += 0.02;
        else r -= 0.20;
        // 지침 명시: 목표 설정의 적절성이 미흡할 경우 달성률이 높더라도 감점 대상!
        if (!isGoodInd) r -= 0.30;
        if (proj.formulaAndBasis.includes('미기재') || proj.formulaAndBasis.length < 25) r -= 0.15;
        return Math.min(1.0, Math.max(0.4, r));
      }
      case '1.5': {
        // 자체평가 적정성
        let r = 0.88;
        if (proj.selfEvalSuccess.length >= 45 && proj.selfEvalWeakness.length >= 45) r += 0.10;
        if (proj.selfEvalWeakness.includes('특이사항 없음') || proj.selfEvalWeakness.length < 20) r -= 0.35;
        return Math.min(1.0, Math.max(0.4, r));
      }
      case '1.6': {
        // 향후 개선방안
        let r = 0.88;
        if (proj.futureImprovement.length >= 45) r += 0.10;
        if (proj.futureImprovement.length < 20 || proj.futureImprovement.includes('지속 추진 예정')) r -= 0.35;
        return Math.min(1.0, Math.max(0.4, r));
      }
      case '2.1': {
        // 계획수립 충실성
        let r = 0.88;
        if (proj.nextYearAnalysisAndPlan.length >= 60) r += 0.08;
        if (!pkg.preCheckFlags.excludedTaskReasonProvided) r -= 0.18;
        if (proj.nextYearAnalysisAndPlan.includes('누락') || proj.nextYearAnalysisAndPlan.includes('미흡')) r -= 0.25;
        return Math.min(1.0, Math.max(0.4, r));
      }
      case '2.2': {
        // 성과지표 적절성
        let r = 0.90;
        if (!isGoodInd) r -= 0.35;
        if (proj.nextYearTargetTrend.includes('동결') || proj.nextYearTargetTrend.includes('동일')) r -= 0.18;
        else if (proj.nextYearTargetTrend.includes('상향')) r += 0.08;
        return Math.min(1.0, Math.max(0.4, r));
      }
      case '2.3': {
        // 전년도 평가결과에 대한 개선
        let r = 0.90;
        if (!pkg.preCheckFlags.prevReportAllIncluded) r -= 0.30;
        if (proj.prevEvalFeedbackReflection.includes('미작성') || proj.prevEvalFeedbackReflection.includes('공란')) r -= 0.25;
        else if (proj.prevEvalFeedbackReflection.includes('신설') || proj.prevEvalFeedbackReflection.includes('반영')) r += 0.08;
        return Math.min(1.0, Math.max(0.4, r));
      }
      default:
        return 0.85;
    }
  };

  // 10대 항목 채점 계산
  const itemScores: 항목별_세부채점_결과[] = 공식_10대_평가지표_목록.map((ind) => {
    if (ind.id === '2.4') {
      // 정량지표 (5점 공통)
      return {
        indicator: ind,
        field1Max: 0,
        field1Score: 0,
        field1Grade: '수',
        field2Max: 0,
        field2Score: 0,
        field2Grade: '수',
        field3Max: 0,
        field3Score: 0,
        field3Grade: '수',
        commonMax: 5,
        commonScore: committeeResult.calculatedScore,
        totalMax: 5,
        totalScore: committeeResult.calculatedScore,
        aiEvidenceHighlight: pkg.committeeData.meetingSummary,
        aiDeductionReason: committeeResult.aiComment,
      };
    }

    const w = isSido ? ind.sidoWeights : { ...ind.centralPublicWeights, field3: 0 };
    const override = manualGradeOverrides?.[ind.id];

    const r1 = evaluateFieldProjectRatio(f1, ind.id);
    const g1: 루브릭_척도_등급 = override?.field1 || scoreToGrade(r1);
    const s1 = Math.round(w.field1 * 루브릭_등급별_배율[g1] * 100) / 100;

    const r2 = evaluateFieldProjectRatio(f2, ind.id);
    const g2: 루브릭_척도_등급 = override?.field2 || scoreToGrade(r2);
    const s2 = Math.round(w.field2 * 루브릭_등급별_배율[g2] * 100) / 100;

    let g3: 루브릭_척도_등급 = '수';
    let s3 = 0;
    if (isSido && w.field3 > 0) {
      const r3 = evaluateFieldProjectRatio(f3, ind.id);
      g3 = override?.field3 || scoreToGrade(r3);
      s3 = Math.round(w.field3 * 루브릭_등급별_배율[g3] * 100) / 100;
    }

    const totalScore = Math.round((s1 + s2 + s3) * 100) / 100;

    // 항목별 원문 근거 및 감점 코멘트 생성
    let highlight = '';
    let deduction = '';
    if (ind.id === '1.1') {
      highlight = `[1분야] ${f1.purposeAndContent.slice(0, 75)}...`;
      deduction =
        totalScore >= ind.totalMaxScore * 0.9
          ? '제2차 기본계획 과제목적과 기관 수행사업 목적이 정확히 부합함'
          : '일부 세부사업(친절교육 등)이 기본계획 세부과제 취지와 직접적 부합성이 낮음';
    } else if (ind.id === '1.2') {
      const bRate1 = f1.budgetPlanned > 0 ? Math.round((f1.budgetExecuted / f1.budgetPlanned) * 1000) / 10 : 0;
      highlight = `[1분야 예산집행률 ${bRate1}% (${f1.budgetExecuted}/${f1.budgetPlanned}억원)] ${f1.executionSystem.slice(0, 65)}...`;
      deduction =
        bRate1 >= 90
          ? '다기관 협력 추진체계 및 예산집행률(90% 이상) 우수'
          : `예산 집행률(${bRate1}%) 부진 또는 유관기관 추진절차 구체성 보완 필요`;
    } else if (ind.id === '1.3') {
      highlight = `[모니터링: ${f1.monitoringCycle}] ${f1.executionContent.slice(0, 65)}...`;
      deduction =
        !f1.hasDesignatedCenterReport && isSido
          ? '시·도 지정센터(권역응급·권역외상센터 등) 운영실적 누락 및 정기 모니터링 미흡 감점'
          : f1.monitoringCycle.includes('월') || f1.monitoringCycle.includes('분기')
          ? '세부 사업내용의 구체성 및 정기 모니터링 환류 체계 우수'
          : '정기적 성과·문제점 모니터링 점검 주기 구체화 필요';
    } else if (ind.id === '1.4') {
      const aRate1 = f1.targetValue > 0 ? Math.round((f1.actualValue / f1.targetValue) * 1000) / 10 : 0;
      highlight = `[1분야 지표: ${f1.indicatorName} (${f1.indicatorType}) · 달성률 ${aRate1}%]`;
      deduction =
        f1.indicatorType === '투입(Input)' || f1.indicatorType === '과정(Process)'
          ? `지침 감점규정 적용: 목표 달성률(${aRate1}%)은 높으나 '${f1.indicatorType}' 지표로 목표 설정의 적절성 미흡`
          : '산출·결과 지표 기준 목표치 100% 이상 초과 달성 및 산출근거 명확';
    } else if (ind.id === '1.5') {
      highlight = `[부진요인 진단] ${f1.selfEvalWeakness.slice(0, 75)}`;
      deduction = f1.selfEvalWeakness.includes('특이사항 없음')
        ? '부진요인 분석을 "특이사항 없음"으로 형식적 기재하여 감점'
        : '성공요인 및 한계점(부진요인)에 대한 데이터 기반 원인 분석 충실';
    } else if (ind.id === '1.6') {
      highlight = `[개선방안] ${f1.futureImprovement.slice(0, 75)}`;
      deduction =
        f1.futureImprovement.length < 25
          ? '자체평가 부진요인과 연계된 구체적 개선 실행방안 미제시'
          : '부진요인을 해결하기 위한 차년도 예산·장비·인력 개선방안이 구체적으로 제시됨';
    } else if (ind.id === '2.1') {
      highlight = `[차년도 계획] ${f1.nextYearAnalysisAndPlan.slice(0, 75)}`;
      deduction = !pkg.preCheckFlags.excludedTaskReasonProvided
        ? '기본계획 세부과제 중 계획 제외 과제에 대한 구체적 제외 사유 누락 감점'
        : '지역사회(소관병원) 현황분석과 3대 분야·18개 세부과제 연계 충실';
    } else if (ind.id === '2.2') {
      highlight = `[목표 추세] ${f1.nextYearTargetTrend.slice(0, 75)}`;
      deduction =
        f1.indicatorType === '투입(Input)' || f1.indicatorType === '과정(Process)'
          ? '투입·과정 중심 지표 설정 및 최근 3개년 추세 대비 목표치 동결로 감점'
          : '산출·결과 중심 지표 설정 및 최근 3개년 추세 근거 상향 목표치 설정 우수';
    } else {
      highlight = `[전년도 평가환류] ${f1.prevEvalFeedbackReflection.slice(0, 75)}`;
      deduction = !pkg.preCheckFlags.prevReportAllIncluded
        ? '전년도 평가 결과보고서 전체 의견 일부 누락 또는 미반영 사유 미기재 감점'
        : '전년도 평가의견 전수 기재 및 차년도 시행계획에 개선사항 100% 반영';
    }

    return {
      indicator: ind,
      field1Max: w.field1,
      field1Score: s1,
      field1Grade: g1,
      field2Max: w.field2,
      field2Score: s2,
      field2Grade: g2,
      field3Max: w.field3,
      field3Score: s3,
      field3Grade: g3,
      commonMax: 0,
      commonScore: 0,
      totalMax: ind.totalMaxScore,
      totalScore,
      aiEvidenceHighlight: highlight,
      aiDeductionReason: deduction,
    };
  });

  // 분야별 및 영역별 총점 집계
  const performanceScore70 =
    Math.round(
      itemScores
        .filter((item) => item.indicator.category === '추진실적(70점)')
        .reduce((acc, cur) => acc + cur.totalScore, 0) * 10
    ) / 10;

  const planScore30 =
    Math.round(
      itemScores
        .filter((item) => item.indicator.category === '사업계획(30점)')
        .reduce((acc, cur) => acc + cur.totalScore, 0) * 10
    ) / 10;

  const qualitativeScore95 =
    Math.round(
      itemScores
        .filter((item) => item.indicator.type === '정성')
        .reduce((acc, cur) => acc + cur.totalScore, 0) * 10
    ) / 10;

  const quantitativeScore5 = committeeResult.calculatedScore;

  const field1TotalScore = Math.round(itemScores.reduce((acc, cur) => acc + cur.field1Score, 0) * 10) / 10;
  const field1MaxScore = itemScores.reduce((acc, cur) => acc + cur.field1Max, 0);

  const field2TotalScore = Math.round(itemScores.reduce((acc, cur) => acc + cur.field2Score, 0) * 10) / 10;
  const field2MaxScore = itemScores.reduce((acc, cur) => acc + cur.field2Max, 0);

  const field3TotalScore = Math.round(itemScores.reduce((acc, cur) => acc + cur.field3Score, 0) * 10) / 10;
  const field3MaxScore = itemScores.reduce((acc, cur) => acc + cur.field3Max, 0);

  const totalScore100 = Math.round((performanceScore70 + planScore30) * 10) / 10;

  // 최종 등급 판정 (지침 p.29: 최우수 90 이상 / 우수 80~90 / 양호 70~80 / 보통 50~70 / 미흡 50 미만)
  let finalGrade: 종합_평가_등급 = '미흡';
  if (totalScore100 >= 90) finalGrade = '최우수';
  else if (totalScore100 >= 80) finalGrade = '우수';
  else if (totalScore100 >= 70) finalGrade = '양호';
  else if (totalScore100 >= 50) finalGrade = '보통';
  else finalGrade = '미흡';

  // --------------------------------------------------------------------------
  // [AI 서비스 5] 평가소위원회(5인) 위원 간 점수 편차 및 총괄위원회 이견 조정 지원
  // --------------------------------------------------------------------------
  const item13 = itemScores.find((x) => x.indicator.id === '1.3')!;
  const item22 = itemScores.find((x) => x.indicator.id === '2.2')!;

  const subcommitteeDisputes: 소위원회_위원편차_항목[] = [
    {
      indicatorCode: '1.3',
      indicatorTitle: '사업 추진 내용의 적정성 (배점 30점)',
      maxScore: 30,
      committeeScores: [
        { reviewerName: '김○○ 위원 (소위원장·예방의학)', specialty: '학계 전문가', score: Math.min(30, Math.round((item13.totalScore + 1.5) * 10) / 10), comment: '권역-지역책임의료기관 간 중증응급 협력프로토콜 및 정기 모니터링 기록이 구체적임' },
        { reviewerName: '이○○ 위원 (응급의학 전문의)', specialty: '임상 현장', score: Math.max(12, Math.round((item13.totalScore - 3.8) * 10) / 10), comment: '야간·취약시간대 실질적 전문의 당직 가동일수 및 지정센터 세부 진료실적 표 보완 필요' },
        { reviewerName: '박○○ 위원 (보건행정학 교수)', specialty: '정책·기획', score: item13.totalScore, comment: '당초 시행계획 대비 세부사업 추진과정 및 예산 집행 관리가 지침 기준에 부합함' },
        { reviewerName: '최○○ 위원 (국립중앙의료원)', specialty: '공공의료지원센터', score: Math.min(30, Math.round((item13.totalScore + 0.8) * 10) / 10), comment: '계획 대비 변경사항 사유 기재 및 사업관리 점검체계가 적정하게 작동함' },
        { reviewerName: '정○○ 위원 (환자·시민단체 대표)', specialty: '수요자 대표', score: Math.max(12, Math.round((item13.totalScore - 1.2) * 10) / 10), comment: '취약지 주민 체감도를 확인할 수 있는 만족도 또는 미충족 의료 개선 수치 병기 권고' },
      ],
      varianceGap: 5.3,
      isDisputed: true,
      aiMediationOpinion: `위원 간 최대 5.3점 편차 발생(이○○ 위원 하향 채점 vs 김○○ 위원 상향 채점). 제출 보고서 원문 스캔 결과, 1분야-2-1에 ${
        f1.hasDesignatedCenterReport ? '지정센터 운영실적과 월별 모니터링 결과표가 수록되어 있으므로' : '지정센터 운영실적 표가 누락되어 있으므로'
      } 객관적 루브릭 기준점인 ${item13.totalScore}점으로 총괄평가위원회 조정 권고.`,
      recommendedFinalScore: item13.totalScore,
    },
    {
      indicatorCode: '2.2',
      indicatorTitle: '차년도 시행계획 성과지표 적절성 (배점 10점)',
      maxScore: 10,
      committeeScores: [
        { reviewerName: '김○○ 위원 (소위원장·예방의학)', specialty: '학계 전문가', score: item22.totalScore, comment: '지침의 산출·결과 지표 설정 원칙 준수 여부를 엄격히 반영함' },
        { reviewerName: '이○○ 위원 (응급의학 전문의)', specialty: '임상 현장', score: Math.min(10, Math.round((item22.totalScore + 1.2) * 10) / 10), comment: '현장 여건상 과정 지표를 일부 병행한 점을 참작하여 가점 부여' },
        { reviewerName: '박○○ 위원 (보건행정학 교수)', specialty: '정책·기획', score: Math.max(4, Math.round((item22.totalScore - 2.1) * 10) / 10), comment: '목표치 설정의 최근 3개년 추세 준거기준 및 상향 폭에 대한 통계적 근거 보강 필요' },
        { reviewerName: '최○○ 위원 (국립중앙의료원)', specialty: '공공의료지원센터', score: item22.totalScore, comment: '수립지침 p.26 성과지표 분류 기준에 따른 표준 채점 적용' },
        { reviewerName: '정○○ 위원 (환자·시민단체 대표)', specialty: '수요자 대표', score: item22.totalScore, comment: '최종 건강결과(Outcome) 중심의 지표 설정 수준에 부합' },
      ],
      varianceGap: 3.3,
      isDisputed: false,
      aiMediationOpinion: `수립지침 p.26~27(성과지표 성격 분류 및 최근 3개년 준거기준 상향 목표치 원칙)을 적용하여 ${item22.totalScore}점으로 합의 도출.`,
      recommendedFinalScore: item22.totalScore,
    },
  ];

  // --------------------------------------------------------------------------
  // [AI 서비스 6] 공식 평가 결과보고서 및 차년도 환류의견 자동 생성
  // --------------------------------------------------------------------------
  const strengths: string[] = [];
  const weaknessesAndDeductions: string[] = [];
  const nextYearRecommendations: string[] = [];

  if (field1TotalScore >= field1MaxScore * 0.85) {
    strengths.push(
      `[1분야 필수의료 제공 체계 확충 우수] 제2차 기본계획 1분야 과제와 연계하여 '${f1.projectName}'을 체계적으로 수행하였으며, 예산집행률(${
        Math.round((f1.budgetExecuted / f1.budgetPlanned) * 1000) / 10
      }%) 및 목표 달성도(${Math.round((f1.actualValue / f1.targetValue) * 1000) / 10}%)가 우수함.`
    );
  } else {
    weaknessesAndDeductions.push(
      `[1분야 추진실적 보완 필요] 1분야 핵심 사업의 예산집행률 또는 지정센터(권역응급·외상센터 등) 관리·운영 실적 기술이 미흡하여 감점 요인이 발생함.`
    );
  }

  if (indicatorDiagnoses.every((d) => d.isAppropriate)) {
    strengths.push(
      `[성과지표 설정 우수] 모든 분야의 핵심 성과지표가 단순 투입·과정 지표가 아닌 '산출(Output)·결과(Outcome)' 중심 지표로 설정되었고 최근 3개년 추세에 기반한 상향 목표치가 합리적으로 제시됨.`
    );
  } else {
    const badInds = indicatorDiagnoses.filter((d) => !d.isAppropriate);
    weaknessesAndDeductions.push(
      `[성과지표 적절성 감점] '${badInds.map((b) => b.currentIndicator).join(', ')}' 등 지침에서 지양하는 투입·과정 지표가 포함되어 1.4항(목표 설정의 적절성) 및 2.2항(성과지표 적절성)에서 감점됨.`
    );
    nextYearRecommendations.push(
      `단순 교육·홍보·예산교부 건수 등 투입·과정 지표를 지양하고, AI가 추천한 '${badInds[0].recommendedIndicator}' 등 실질적 산출·결과 지표로 차년도 시행계획 성과지표를 개편할 것.`
    );
  }

  if (committeeResult.calculatedScore === 5) {
    strengths.push(
      `[공공보건의료위원회 구성·운영 만점(5.0점)] 위원장 포함 ${pkg.committeeData.totalMembers}명(20명 이내)으로 구성하고 주민·수요자·공급자·전문가 각 2명 이상 법정 기준을 완벽히 준수하였으며 심의 결과를 계획에 충실히 반영함.`
    );
  } else {
    weaknessesAndDeductions.push(`[위원회 정량평가 감점(${committeeResult.calculatedScore}/5.0점)] ${committeeResult.aiComment}`);
    nextYearRecommendations.push(
      `(시·도) 공공보건의료위원회 위촉 시 ②지역주민 대표, ③수요자 대표, ④공급자 대표, ⑤전문가 분야별 각 2명 이상(총원 20명 이내) 법정 기준을 반드시 충족하고 회의록·심의의결서 증빙을 첨부할 것.`
    );
  }

  const failedPreChecks = preCheckResults.filter((p) => !p.passed);
  if (failedPreChecks.length > 0) {
    failedPreChecks.forEach((fp) => {
      weaknessesAndDeductions.push(`[지침 작성요건 미준수: ${fp.ruleTitle}] ${fp.findingDetail}`);
      nextYearRecommendations.push(fp.aiAutoFixSuggestion);
    });
  } else {
    strengths.push(
      `[제출서식 및 전년도 평가 환류 완결성] 요약표·총괄표·본문 간 정합성이 높고, 전년도 평가 결과보고서의 지적사항을 누락 없이 반영하여 계획-실행-평가-환류(PDCA) 체계가 확립됨.`
    );
    nextYearRecommendations.push(
      `현재의 우수한 성과관리 체계를 유지하되, 동절기·야간 등 취약시간대 중증응급 이송 지연 및 필수의료 당직 인력 피로도 해소를 위한 광역 단위 순환당직·원격협진 모델을 고도화할 것.`
    );
  }

  const overallSummary = `${pkg.institutionName}(소관 공공보건의료기관 ${pkg.affiliatedHospitalsCount}개소)에 대한 『2024년 공공보건의료 시행계획 추진실적(70점) 및 2025년 시행계획(30점)』 종합 평가 결과, 추진실적 ${performanceScore70}점(70점 만점), 사업계획 ${planScore30}점(30점 만점, 정량 ${quantitativeScore5}점 포함)으로 총점 ${totalScore100}점 / 100점 만점을 기록하여 최종 【${finalGrade}】 등급으로 판정됨.`;

  return {
    institutionName: pkg.institutionName,
    institutionType: pkg.institutionType,
    performanceScore70,
    planScore30,
    qualitativeScore95,
    quantitativeScore5,
    field1TotalScore,
    field1MaxScore,
    field2TotalScore,
    field2MaxScore,
    field3TotalScore,
    field3MaxScore,
    totalScore100,
    finalGrade,
    isAwardEligible: totalScore100 >= 90,
    preCheckResults,
    indicatorDiagnoses,
    committeeResult,
    itemScores,
    subcommitteeDisputes,
    generatedOfficialReport: {
      overallSummary,
      strengths,
      weaknessesAndDeductions,
      nextYearRecommendations,
    },
  };
}
