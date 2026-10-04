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

const 색상_개발사구현   = 'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800';
const 색상_인프라구축   = 'bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-950/50 dark:text-teal-300 dark:border-teal-800';
const 색상_외부AI연결   = 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800';

export const 실행_주체_카탈로그: Record<string, 실행_주체> = {
  // 🔵 개발사 소스코드 구현
  nlp_engine: {
    유형: 'nlp',
    이름: '자연어 처리 엔진',
    영문: 'NLP Engine',
    아이콘: '🔤',
    색상_클래스: 색상_개발사구현,
  },
  intent_analyzer: {
    유형: 'nlp',
    이름: 'AI 의도 분석 모듈',
    영문: 'Intent Analyzer',
    아이콘: '🧭',
    색상_클래스: 색상_개발사구현,
  },
  analysis_engine: {
    유형: 'analysis',
    이름: '데이터 분석 모듈',
    영문: 'Analytics Engine',
    아이콘: '📊',
    색상_클래스: 색상_개발사구현,
  },
  validator: {
    유형: 'validator',
    이름: '근거 검증 엔진',
    영문: 'Validator',
    아이콘: '🛡️',
    색상_클래스: 색상_개발사구현,
  },
  policy_generator: {
    유형: 'policy_gen',
    이름: 'AI 정책 생성 모듈',
    영문: 'Policy Generator',
    아이콘: '📝',
    색상_클래스: 색상_개발사구현,
  },

  // 🟢 인프라·DB 별도 구축 (발주처 + 개발사 협력)
  public_health_db: {
    유형: 'data_db',
    이름: '공공의료 데이터베이스',
    영문: 'Public Health DB',
    아이콘: '🗄️',
    색상_클래스: 색상_인프라구축,
  },
  rag_engine: {
    유형: 'rag_engine',
    이름: 'RAG 검색 엔진',
    영문: 'RAG · Vector DB',
    아이콘: '📚',
    색상_클래스: 색상_인프라구축,
  },

  // 🟠 외부 AI API 연결 (Gemini, GPT 등)
  llm_engine: {
    유형: 'llm',
    이름: 'AI 언어모델',
    영문: 'LLM',
    아이콘: '🤖',
    색상_클래스: 색상_외부AI연결,
  },
};

/** [MOCK DATA] 8단계 AI 분석 파이프라인 기본 정의 */
export const AI_파이프라인_단계_목록: Omit<파이프라인_단계, '상태'>[] = [
  {
    id: 'step_understand',
    번호: 1,
    제목: '질문 이해',
    부제목: 'AI가 사용자의 질문에서 분석 대상과 목적을 파악합니다.',
    처리_시간_ms: 1200,
    아이콘: '🔍',
    실행_주체: 실행_주체_카탈로그.nlp_engine,         // 🔵 개발사 구현
  },
  {
    id: 'step_data_confirm',
    번호: 2,
    제목: '필요한 데이터 확인',
    부제목: 'AI가 질문에 답하기 위해 필요한 데이터 항목을 확인합니다.',
    처리_시간_ms: 1800,
    아이콘: '📋',
    실행_주체: 실행_주체_카탈로그.intent_analyzer,    // 🔵 개발사 구현
  },
  {
    id: 'step_data_search',
    번호: 3,
    제목: '공공의료 데이터 검색',
    부제목: '공공의료 데이터베이스에서 필요한 데이터를 검색합니다.',
    처리_시간_ms: 1800,
    아이콘: '🗄️',
    실행_주체: 실행_주체_카탈로그.public_health_db,   // 🟢 인프라 구축
  },
  {
    id: 'step_rag',
    번호: 4,
    제목: '관련 지식 검색',
    부제목: 'AI가 관련 정책자료와 업무지식을 찾아 답변의 근거로 활용합니다.',
    처리_시간_ms: 1800,
    아이콘: '📚',
    실행_주체: 실행_주체_카탈로그.rag_engine,         // 🟢 인프라 구축
  },
  {
    id: 'step_analysis',
    번호: 5,
    제목: '데이터 분석',
    부제목: '검색된 데이터를 분석하여 지역의 특성과 문제점을 파악합니다.',
    처리_시간_ms: 1800,
    아이콘: '📊',
    실행_주체: 실행_주체_카탈로그.analysis_engine,    // 🔵 개발사 구현
  },
  {
    id: 'step_llm',
    번호: 6,
    제목: 'AI 종합 분석',
    부제목: 'AI가 질문, 데이터, 관련 지식을 종합하여 문제의 원인과 의미를 분석합니다.',
    처리_시간_ms: 2500,
    아이콘: '🤖',
    실행_주체: 실행_주체_카탈로그.llm_engine,         // 🟠 외부 AI API
  },
  {
    id: 'step_validate',
    번호: 7,
    제목: '분석 근거 검증',
    부제목: 'AI가 생성한 분석 결과가 실제 데이터와 관련 자료에 근거하는지 확인합니다.',
    처리_시간_ms: 1800,
    아이콘: '✅',
    실행_주체: 실행_주체_카탈로그.validator,          // 🔵 개발사 구현
  },
  {
    id: 'step_policy',
    번호: 8,
    제목: '정책대안 생성',
    부제목: '검증된 분석 결과를 바탕으로 실행 가능한 정책대안을 제안합니다.',
    처리_시간_ms: 2000,
    아이콘: '📝',
    실행_주체: 실행_주체_카탈로그.policy_generator,   // 🔵 개발사 구현
  },
];
