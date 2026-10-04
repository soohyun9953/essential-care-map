// Essential Care Map - AI 분석 파이프라인 타입 정의
// AI Analysis Pipeline Type Definitions

/** AI 파이프라인 단계 상태 */
export type 파이프라인_단계_상태 = 'waiting' | 'running' | 'done' | 'error';

/** 실행 주체 카테고리 */
export type 실행_주체_유형 = 'user' | 'nlp' | 'data_db' | 'rag_engine' | 'analysis' | 'llm' | 'validator' | 'policy_gen';

/** 실행 주체 정보 */
export interface 실행_주체 {
  유형: 실행_주체_유형;
  이름: string;       // 고객 표시용 한국어 명칭
  영문: string;       // 시스템 내부 영문명 (괄호 표기용)
  아이콘: string;     // 이모지 아이콘
  색상_클래스: string; // Tailwind 색상 클래스
}

/** 개별 파이프라인 단계 */
export interface 파이프라인_단계 {
  id: string;
  번호: number;
  제목: string;          // 고객 표시용 한국어 제목
  부제목: string;        // 고객 표시용 설명
  처리_시간_ms: number;  // Mock 처리 시간 (밀리초)
  상태: 파이프라인_단계_상태;
  아이콘: string;        // 이모지 아이콘
  실행_주체: 실행_주체;  // 이 단계를 실행하는 시스템/모듈
}

/** 데이터 소스 카드 */
export interface 데이터_소스 {
  id: string;
  제목: string;
  설명: string;
  아이콘: string;
  상태: 'connected' | 'searching' | 'done';
}

/** RAG 문서 카드 */
export interface RAG_문서 {
  id: string;
  제목: string;
  유형: string;
  관련도_퍼센트: number; // [MOCK DATA] Demo용 관련도 점수
  아이콘: string;
}

/** 분석 결과 지표 */
export interface 분석_지표 {
  id: string;
  항목: string;
  값: string;
  단위: string;
  설명: string;
  강조: boolean;
}

/** 정책대안 */
export interface 정책대안 {
  id: string;
  제목: string;
  우선순위: '높음' | '중간' | '낮음';
  내용: string[];
  예산_규모: string;
  기대효과: string;
}

/** AI 분석 최종 결과 */
export interface AI_분석_결과 {
  분석_요약: string;
  주요_결과: string[];
  정책대안_목록: 정책대안[];
  참고_문서_수: number;
  분석_신뢰도: number; // [MOCK DATA] Demo용
  데이터_출처: string[];
}

/** AI 파이프라인 전체 상태 */
export interface AI_파이프라인_상태 {
  단계_목록: 파이프라인_단계[];
  현재_단계_인덱스: number;
  전체_완료: boolean;
  분석_결과: AI_분석_결과 | null;
  실행_중: boolean;
}
