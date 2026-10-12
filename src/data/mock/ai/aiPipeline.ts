// [MOCK DATA] Essential Care Map - AI 파이프라인 단계 Mock 데이터
// 실제 AI API를 호출하지 않는 Demo용 데이터입니다.
// 향후 실제 LLM/RAG API 연결 시 이 파일의 데이터를 실제 API 응답으로 대체합니다.

import type { 파이프라인_단계, 실행_주체 } from '@/types/ai';

// ── 실행 주체 정의 ──────────────────────────────────────────────────
// 색상은 "구축 주체" 기준으로 3가지로 통일합니다.
//
//  🔵 파란색(indigo) — 개발사가 소스코드로 구현하는 모듈 (①②⑤⑦⑧)
//  🟢 초록색(teal)   — 사전에 별도로 구축해야 하는 인프라·DB (③④)
//  🟠 주황색(amber)  — 외부 AI API를 연결하여 사용하는 서비스 (⑥)

const 색상_기반인프라   = 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800';
const 색상_개발사구현   = 'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800';
const 색상_멀티에이전트 = 'bg-cyan-100 text-cyan-800 border-cyan-300 dark:bg-cyan-950/60 dark:text-cyan-300 dark:border-cyan-800';
const 색상_외부AI연결   = 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800';

export const 실행_주체_카탈로그: Record<string, 실행_주체> = {
  // 🟢 Step 0: 사전 구축 기반 인프라 (기구축)
  foundation_infra: {
    유형: 'foundation',
    이름: '기구축 데이터 인프라',
    영문: 'HIS · DW · Vector DB · MCP',
    아이콘: '🗄️',
    색상_클래스: 색상_기반인프라,
  },

  // 🔵 AI Orchestrator (오케스트레이터)
  orchestrator: {
    유형: 'orchestrator',
    이름: 'AI 오케스트레이터',
    영문: 'AI Orchestrator',
    아이콘: '🧭',
    색상_클래스: 색상_개발사구현,
  },

  // 🔷 멀티에이전트 3종 (동시 병렬 실행)
  data_agent: {
    유형: 'agent',
    이름: '데이터 수집 에이전트',
    영문: 'Data Extraction Agent',
    아이콘: '📡',
    색상_클래스: 색상_멀티에이전트,
  },
  analytics_agent: {
    유형: 'agent',
    이름: '통계·수요분석 에이전트',
    영문: 'Analytics Agent',
    아이콘: '📊',
    색상_클래스: 색상_멀티에이전트,
  },
  policy_agent: {
    유형: 'agent',
    이름: '법령·지침 정책 에이전트',
    영문: 'Policy Guidelines Agent',
    아이콘: '📚',
    색상_클래스: 색상_멀티에이전트,
  },

  // 🟠 외부 AI API / LLM
  llm_engine: {
    유형: 'llm',
    이름: 'LLM 종합 추론 엔진',
    영문: 'Reasoning LLM',
    아이콘: '🤖',
    색상_클래스: 색상_외부AI연결,
  },

  // 🔵 검증 엔진
  validator: {
    유형: 'validator',
    이름: '근거 검증 엔진',
    영문: 'Validator / XAI',
    아이콘: '🛡️',
    색상_클래스: 색상_개발사구현,
  },

  // 🔵 정책 생성 모듈
  policy_generator: {
    유형: 'policy_gen',
    이름: '정책대안·보고서 생성기',
    영문: 'Deliverable Generator',
    아이콘: '📝',
    색상_클래스: 색상_개발사구현,
  },
};

/** [MOCK DATA] 「AI 시스템 8단계 아키텍처」(Step 0 기반 + 3대 멀티에이전트 병렬 실행) */
export const AI_파이프라인_단계_목록: Omit<파이프라인_단계, '상태'>[] = [
  {
    id: 'step_foundation',
    번호: 0,
    제목: '사전 구축 인프라 확인',
    부제목: '공공의료정보시스템(HIS), 보건의료 DW, RAG Vector DB, MCP 연결 상태를 즉각 확인합니다.',
    처리_시간_ms: 800,
    아이콘: '🗄️',
    실행_주체: 실행_주체_카탈로그.foundation_infra, // 🟢 Step 0 기구축 인프라
  },
  {
    id: 'step_orchestration',
    번호: 1,
    제목: '질문 이해 & 작업 분배',
    부제목: '사용자의 분석 요구사항을 파악하고 3개 전문 멀티에이전트에게 작업을 동시 분배합니다.',
    처리_시간_ms: 1200,
    아이콘: '🧭',
    실행_주체: 실행_주체_카탈로그.orchestrator,     // 🔵 AI Orchestrator
  },
  {
    id: 'step_agent_data',
    번호: 2,
    제목: '[동시 실행 1/3] 데이터 수집 에이전트',
    부제목: 'MCP를 통해 기구축 DW 및 공공의료 DB에서 해당 지역의 자원·병상 데이터를 실시간 조회합니다.',
    처리_시간_ms: 1500,
    아이콘: '📡',
    실행_주체: 실행_주체_카탈로그.data_agent,        // 🔷 Multi-Agent 1
  },
  {
    id: 'step_agent_analytics',
    번호: 3,
    제목: '[동시 실행 2/3] 통계·수요분석 에이전트',
    부제목: '지역 관내이용률(RI), 유사 지자체 비교 격차 및 2030 시계열 미래 수요를 동시에 연산합니다.',
    처리_시간_ms: 1500,
    아이콘: '📊',
    실행_주체: 실행_주체_카탈로그.analytics_agent,   // 🔷 Multi-Agent 2
  },
  {
    id: 'step_agent_policy',
    번호: 4,
    제목: '[동시 실행 3/3] 정책·지침 에이전트',
    부제목: '기구축된 RAG Vector DB에서 보건복지부 취약지 고시, 국비 지원기준 및 법적 근거를 동시 발췌합니다.',
    처리_시간_ms: 1500,
    아이콘: '📚',
    실행_주체: 실행_주체_카탈로그.policy_agent,      // 🔷 Multi-Agent 3
  },
  {
    id: 'step_llm_reasoning',
    번호: 5,
    제목: '에이전트 결과 통합 → LLM 종합 추론',
    부제목: '3개 에이전트가 수집·분석한 데이터를 통합 전달받아 LLM이 지역 맞춤형 정책 인과관계를 추론합니다.',
    처리_시간_ms: 2200,
    아이콘: '🤖',
    실행_주체: 실행_주체_카탈로그.llm_engine,        // 🟠 외부 AI API / LLM
  },
  {
    id: 'step_validate',
    번호: 6,
    제목: '분석 근거 검증 (XAI)',
    부제목: '추론 결과가 실제 법령 조항 및 공공 통계 팩트와 일치하는지 환각 방지 교차 검증을 수행합니다.',
    처리_시간_ms: 1200,
    아이콘: '🛡️',
    실행_주체: 실행_주체_카탈로그.validator,         // 🔵 근거 검증
  },
  {
    id: 'step_policy_deliverable',
    번호: 7,
    제목: '정책대안 및 사업계획서 도출',
    부제목: '검증된 분석 결과를 토대로 3대 정책 옵션(Option A·B·C) 및 보건복지부 표준 사업계획서를 완성합니다.',
    처리_시간_ms: 1600,
    아이콘: '📝',
    실행_주체: 실행_주체_카탈로그.policy_generator,  // 🔵 정책/문서 생성
  },
];
