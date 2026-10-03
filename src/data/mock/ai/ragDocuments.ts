// [MOCK DATA] Essential Care Map - RAG 문서 Mock 데이터
// Demo용 관련도 점수 및 문서 정보입니다.
// 실제 Vector DB 검색 결과가 아니며, 향후 실제 RAG 시스템 연결 시 대체합니다.

import type { RAG_문서 } from '@/types/ai';

/** [MOCK DATA] RAG 검색 결과 문서 목록 (관련도 점수는 Demo용 임의 값) */
export const RAG_문서_목록: RAG_문서[] = [
  {
    id: 'doc_public_health_policy',
    제목: '공공보건의료 기본계획 (2023~2027)',
    유형: '정책자료',
    관련도_퍼센트: 94, // [MOCK] Demo용 임의 관련도 점수
    아이콘: '📄',
  },
  {
    id: 'doc_emergency_weak',
    제목: '응급의료 취약지 선정 기준 및 지원 가이드',
    유형: '업무지침',
    관련도_퍼센트: 91, // [MOCK] Demo용 임의 관련도 점수
    아이콘: '📄',
  },
  {
    id: 'doc_essential_care',
    제목: '지역필수의료 정책 패키지 (보건복지부, 2024)',
    유형: '정책자료',
    관련도_퍼센트: 87, // [MOCK] Demo용 임의 관련도 점수
    아이콘: '📄',
  },
  {
    id: 'doc_public_hospital',
    제목: '공공병원 기능 강화 및 사업계획 기준',
    유형: '업무지침',
    관련도_퍼센트: 83, // [MOCK] Demo용 임의 관련도 점수
    아이콘: '📄',
  },
  {
    id: 'doc_guideline',
    제목: '필수의료 취약지 지원사업 운영 지침',
    유형: '행정지침',
    관련도_퍼센트: 79, // [MOCK] Demo용 임의 관련도 점수
    아이콘: '📄',
  },
];
