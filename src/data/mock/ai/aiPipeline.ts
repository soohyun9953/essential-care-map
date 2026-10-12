// [MOCK DATA] Essential Care Map - 공공의료 AI 분석 시스템 파이프라인 단계
// 공공의료 AI 분석 시스템 아키텍처 명세서(A 질의 처리 흐름 01~08단계 & B 시스템 구성요소) 준수

import type { 파이프라인_단계, 실행_주체 } from '@/types/ai';

// ── 실행 주체 색상 정의 ──────────────────────────────────────────────
const 색상_오케스트레이터 = 'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800';
const 색상_저장소_인프라  = 'bg-teal-100 text-teal-800 border-teal-300 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-800';
const 색상_분석엔진       = 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800';
const 색상_LLM레이어     = 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800';
const 색상_정책대안에이전트 = 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800';
const 색상_검증가드레일   = 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800';
const 색상_결과제공       = 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800';

export const 실행_주체_카탈로그: Record<string, 실행_주체> = {
  // 1. AI Orchestrator
  orchestrator: {
    유형: 'orchestrator',
    이름: 'AI Orchestrator',
    영문: 'Workflow Controller & Guardrails',
    아이콘: '🧭',
    색상_클래스: 색상_오케스트레이터,
  },

  // 2. Data Lake / DW·CDW (정형 데이터)
  data_dw: {
    유형: 'data_dw',
    이름: 'DW · CDW 저장소',
    영문: 'Data Lake / DW·CDW',
    아이콘: '🗄️',
    색상_클래스: 색상_저장소_인프라,
  },

  // 3. Vector DB (비정형 지식)
  vector_db: {
    유형: 'vector_db',
    이름: 'Vector DB',
    영문: 'Semantic Vector DB',
    아이콘: '📚',
    색상_클래스: 색상_저장소_인프라,
  },

  // 4. 분석 엔진 (계산과 해석의 분리)
  analysis_engine: {
    유형: 'analysis_engine',
    이름: '분석 엔진 (계산 전담)',
    영문: 'Analytics Engine (SQL·GIS)',
    아이콘: '📊',
    색상_클래스: 색상_분석엔진,
  },

  // 5. LLM 레이어 (종합 분석)
  llm_layer: {
    유형: 'llm_layer',
    이름: 'LLM 레이어 (해석 전담)',
    영문: 'LLM Layer (Internal sLLM / Cloud)',
    아이콘: '🤖',
    색상_클래스: 색상_LLM레이어,
  },

  // 6. 정책대안 Agent
  policy_agent: {
    유형: 'policy_agent',
    이름: '정책대안 Agent',
    영문: 'Policy Alternative Agent',
    아이콘: '💡',
    색상_클래스: 색상_정책대안에이전트,
  },

  // 7. 근거 검증 · 출력 가드레일
  validator: {
    유형: 'validator',
    이름: '근거 검증 · 출력 가드레일',
    영문: 'Evidence Validator & Guardrail',
    아이콘: '🛡️',
    색상_클래스: 색상_검증가드레일,
  },

  // 8. 결과 제공
  result_delivery: {
    유형: 'result_delivery',
    이름: '결과 제공 & 피드백 환류',
    영문: 'Delivery & LLMOps Feedback',
    아이콘: '📝',
    색상_클래스: 색상_결과제공,
  },
};

/** [공공의료 AI 분석 시스템 아키텍처] 8단계 질의 처리 흐름 (01~08) */
export const AI_파이프라인_단계_목록: Omit<파이프라인_단계, '상태'>[] = [
  {
    id: 'step_understand',
    번호: 1,
    제목: '질문 이해 & 가드레일',
    부제목: 'AI Orchestrator가 질문을 해석하고 분석 계획을 수립하며, 입력 가드레일이 민감정보와 인젝션을 차단합니다.',
    처리_시간_ms: 1200,
    아이콘: '🧭',
    실행_주체: 실행_주체_카탈로그.orchestrator,
  },
  {
    id: 'step_data_search',
    번호: 2,
    제목: '[정량 갈래] 데이터 검색',
    부제목: 'DW/CDW에 적재된 의료기관 병상·인력, 119 이송시간, 인구통계, 의료이용 데이터를 SQL로 조회합니다.',
    처리_시간_ms: 1400,
    아이콘: '🗄️',
    실행_주체: 실행_주체_카탈로그.data_dw,
  },
  {
    id: 'step_knowledge_search',
    번호: 3,
    제목: '[정성 갈래] 지식 검색 (Vector DB)',
    부제목: 'Vector DB에서 질문과 관련된 법령, 기본계획, 취약지 지정 기준, 사업 지침, 과거 사례를 의미 기반으로 검색합니다.',
    처리_시간_ms: 1400,
    아이콘: '📚',
    실행_주체: 실행_주체_카탈로그.vector_db,
  },
  {
    id: 'step_data_analysis',
    번호: 4,
    제목: '[정량 갈래] 데이터 분석 (분석 엔진)',
    부제목: '계산과 해석의 분리: 분석 엔진이 골든타임 도달 인구 비율, 지역 격차 등 정확한 수치를 SQL·GIS로 직접 계산합니다.',
    처리_시간_ms: 1600,
    아이콘: '📊',
    실행_주체: 실행_주체_카탈로그.analysis_engine,
  },
  {
    id: 'step_llm_synthesis',
    번호: 5,
    제목: 'LLM 종합 분석 (정량+정성 합류)',
    부제목: '정량 분석 결과와 정책 지식을 함께 받아 취약 원인을 진단합니다. (민감 데이터는 내부망 sLLM, 외부 LLM 비식별화)',
    처리_시간_ms: 2200,
    아이콘: '🤖',
    실행_주체: 실행_주체_카탈로그.llm_layer,
  },
  {
    id: 'step_policy_generation',
    번호: 6,
    제목: '정책대안 생성 (정책대안 Agent)',
    부제목: '진단 결과를 토대로 효과·비용·난이도 우선순위를 평가하고 단계별 실행 방안(Option A·B·C)을 구성합니다.',
    처리_시간_ms: 1800,
    아이콘: '💡',
    실행_주체: 실행_주체_카탈로그.policy_agent,
  },
  {
    id: 'step_evidence_validation',
    번호: 7,
    제목: '근거 검증 & 출력 가드레일',
    부제목: '출처·수치 일치 여부, 정책자료 근거, 논리 편향을 점검합니다. (검증 불통 시 종합 분석 또는 대안 생성으로 롤백)',
    처리_시간_ms: 1400,
    아이콘: '🛡️',
    실행_주체: 실행_주체_카탈로그.validator,
  },
  {
    id: 'step_result_delivery',
    번호: 8,
    제목: '결과 제공 & 피드백 환류',
    부제목: '검증을 통과한 분석 요약, 대안, 참고 근거를 대시보드와 보고서로 제공하며, 사용자 평가는 LLMOps 품질 개선에 환류합니다.',
    처리_시간_ms: 1200,
    아이콘: '📝',
    실행_주체: 실행_주체_카탈로그.result_delivery,
  },
];
