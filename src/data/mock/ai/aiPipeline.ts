// [MOCK DATA] Essential Care Map - AI 파이프라인 단계 Mock 데이터
// 실제 AI API를 호출하지 않는 Demo용 데이터입니다.
// 향후 실제 LLM/RAG API 연결 시 이 파일의 데이터를 실제 API 응답으로 대체합니다.

import type { 파이프라인_단계, 실행_주체 } from '@/types/ai';

// ── 실행 주체 정의 (시스템 컴포넌트 카탈로그) ──────────────────────
export const 실행_주체_카탈로그: Record<string, 실행_주체> = {
  nlp_engine: {
    유형: 'nlp',
    이름: '자연어 처리 엔진',
    영문: 'NLP Engine',
    아이콘: '🔤',
    색상_클래스: 'bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-950/50 dark:text-violet-300 dark:border-violet-800',
  },
  intent_analyzer: {
    유형: 'nlp',
    이름: 'AI 의도 분석 모듈',
    영문: 'Intent Analyzer',
    아이콘: '🧭',
    색상_클래스: 'bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-950/50 dark:text-violet-300 dark:border-violet-800',
  },
  public_health_db: {
    유형: 'data_db',
    이름: '공공의료 데이터베이스',
    영문: 'Public Health DB',
    아이콘: '🗄️',
    색상_클래스: 'bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-800',
  },
  rag_engine: {
    유형: 'rag_engine',
    이름: 'RAG 검색 엔진',
    영문: 'RAG · Vector DB',
    아이콘: '📚',
    색상_클래스: 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800',
  },
  analysis_engine: {
    유형: 'analysis',
    이름: '데이터 분석 모듈',
    영문: 'Analytics Engine',
    아이콘: '📊',
    색상_클래스: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800',
  },
  llm_engine: {
    유형: 'llm',
    이름: 'AI 언어모델',
    영문: 'LLM',
    아이콘: '🤖',
    색상_클래스: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800',
  },
  validator: {
    유형: 'validator',
    이름: '근거 검증 엔진',
    영문: 'Validator',
    아이콘: '🛡️',
    색상_클래스: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800',
  },
  policy_generator: {
    유형: 'policy_gen',
    이름: 'AI 정책 생성 모듈',
    영문: 'Policy Generator',
    아이콘: '📝',
    색상_클래스: 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800',
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
    실행_주체: 실행_주체_카탈로그.nlp_engine,
  },
  {
    id: 'step_data_confirm',
    번호: 2,
    제목: '필요한 데이터 확인',
    부제목: 'AI가 질문에 답하기 위해 필요한 데이터 항목을 확인합니다.',
    처리_시간_ms: 1800,
    아이콘: '📋',
    실행_주체: 실행_주체_카탈로그.intent_analyzer,
  },
  {
    id: 'step_data_search',
    번호: 3,
    제목: '공공의료 데이터 검색',
    부제목: '공공의료 데이터베이스에서 필요한 데이터를 검색합니다.',
    처리_시간_ms: 1800,
    아이콘: '🗄️',
    실행_주체: 실행_주체_카탈로그.public_health_db,
  },
  {
    id: 'step_rag',
    번호: 4,
    제목: '관련 지식 검색',
    부제목: 'AI가 관련 정책자료와 업무지식을 찾아 답변의 근거로 활용합니다.',
    처리_시간_ms: 1800,
    아이콘: '📚',
    실행_주체: 실행_주체_카탈로그.rag_engine,
  },
  {
    id: 'step_analysis',
    번호: 5,
    제목: '데이터 분석',
    부제목: '검색된 데이터를 분석하여 지역의 특성과 문제점을 파악합니다.',
    처리_시간_ms: 1800,
    아이콘: '📊',
    실행_주체: 실행_주체_카탈로그.analysis_engine,
  },
  {
    id: 'step_llm',
    번호: 6,
    제목: 'AI 종합 분석',
    부제목: 'AI가 질문, 데이터, 관련 지식을 종합하여 문제의 원인과 의미를 분석합니다.',
    처리_시간_ms: 2500,
    아이콘: '🤖',
    실행_주체: 실행_주체_카탈로그.llm_engine,
  },
  {
    id: 'step_validate',
    번호: 7,
    제목: '분석 근거 검증',
    부제목: 'AI가 생성한 분석 결과가 실제 데이터와 관련 자료에 근거하는지 확인합니다.',
    처리_시간_ms: 1800,
    아이콘: '✅',
    실행_주체: 실행_주체_카탈로그.validator,
  },
  {
    id: 'step_policy',
    번호: 8,
    제목: '정책대안 생성',
    부제목: '검증된 분석 결과를 바탕으로 실행 가능한 정책대안을 제안합니다.',
    처리_시간_ms: 2000,
    아이콘: '📝',
    실행_주체: 실행_주체_카탈로그.policy_generator,
  },
];
