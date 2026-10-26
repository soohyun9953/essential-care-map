'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  X,
  Building2,
  FileText,
  Activity,
  Calculator,
  ShieldCheck,
  HeartPulse,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  Users,
  Compass,
  LayoutGrid,
  Search,
  Sliders,
  UserCheck,
  Layers,
  Brain,
  Share2,
  MapPin,
  Stethoscope,
  Baby,
} from 'lucide-react';
import { 워크스페이스_타입 } from './글로벌_공공_헤더';
import { 서브탭_찾기, 페르소나_서브탭 } from '@/lib/페르소나_메뉴_구조';

interface 담당자별_검토_가이드_모달_속성 {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (workspace: 워크스페이스_타입, subFeature?: string) => void;
  onSelectPersonaSubtab?: (subtab: 페르소나_서브탭) => void;
}

type 직무_카테고리 = 'all' | 'citizen' | 'hospital' | 'nmc';

interface 시스템_가이드_항목 {
  key: string;
  subtabId: string;
  systemName: string;
  category: 직무_카테고리;
  targetRole: string; // 주요 검토 대상 담당자
  roleBadge: string;
  badge: string;
  badgeColor: string;
  icon: React.ReactNode;
  targetWorkspace: 워크스페이스_타입;
  subFeature?: string;
  menuPath: string;
  isImplemented: boolean;
  summary: string;
  keyChecks: string[];
  tip: string;
}

export const 담당자별_검토_가이드_모달: React.FC<담당자별_검토_가이드_모달_속성> = ({
  isOpen,
  onClose,
  onNavigate,
  onSelectPersonaSubtab,
}) => {
  // 기본 선택 시스템: 2-1 AI 정책 의사결정 원스톱
  const [activeSystemKey, setActiveSystemKey] = useState<string>('2-1');
  // 직무 필터 상태
  const [selectedCategory, setSelectedCategory] = useState<직무_카테고리>('all');

  if (!isOpen) return null;

  // 13대 메뉴 체계에 맞춘 전수 가이드 정의 (대국민 4 + 의료기관 6 + NMC 3)
  const systemGuides: 시스템_가이드_항목[] = [
    // ──────────────────────────────────────────────────────────────────────────
    // 2. 의료기관 담당자 (6개 메뉴)
    // ──────────────────────────────────────────────────────────────────────────
    {
      key: '2-1',
      subtabId: '2-1',
      systemName: '2-1. AI 정책 의사결정 & 공공보건의료계획 수립',
      category: 'hospital',
      targetRole: '지자체(시·도/시·군·구) 보건기획관, 공공병원 기획조정실, 보건복지부 공공의료과',
      roleBadge: '지자체 정책관 / 병원 기획실',
      badge: '진단·대안·HWPX One-Stop',
      badgeColor: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-blue-300',
      icon: <Share2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
      targetWorkspace: 'regional_diagnosis',
      menuPath: '② 의료기관 담당자 ➔ 2-1. AI 정책 의사결정 & 계획수립 원스톱',
      isImplemented: true,
      summary:
        '진료권 진단(환자 유출입 OD 분석) ➔ 1:1 병원 비교 ➔ 2030 장래수요 ➔ AI 정책대안(Option A/B/C) ➔ 12대 항목 법정 사업계획서 ➔ HWPX 공문서 다운로드까지 6단계 완결형 의사결정 워크플로우를 제공합니다.',
      keyChecks: [
        '[1단계 진료권 진단]: 전국 250개 시군구 취약도 지도 및 72.6MB 엑셀 전수 기반 환자 관외 유출입(OD Matrix) 네트워크 흐름도 및 관내이용률(RI)',
        '[2단계 1:1 비교분석]: 영월의료원 vs 삼척의료원 등 인근 의료기관 간 진료권 인구·병상·의료자원 Gap 분석',
        '[3단계 장래수요]: 2030년 미래 의료수요(외래/입원/응급) 추계 및 진료권별 위험구간 사전 탐지',
        '[4단계 AI 정책대안]: Option A(보조금 지원) vs Option B(시설·장비 확충) vs Option C(의료인력 파견) 대안별 소요예산 및 정책효과 정밀 비교',
        '[5단계 법정계획서]: 정부 12대 항목(사업목표, 추진체계, 예산, KPI 등) 법정 공공보건의료계획서 초안 실시간 자동 작성 (환각 방지 원칙)',
        '[6단계 HWPX 다운로드]: 한글과컴퓨터 표준 공문서 규격(HWPX) 원클릭 즉시 다운로드',
      ],
      tip: '상단 여정바 1단계(진료권 진단)부터 6단계(HWPX 다운로드)까지 차례대로 클릭해 보며, 지역진단 통계가 법정 공문서로 원스톱 완성되는 과정을 체험해 보세요.',
    },
    {
      key: '2-2',
      subtabId: '2-2',
      systemName: '2-2. 경영 벤치마킹 & 공시·시설장비 사전검증',
      category: 'hospital',
      targetRole: '지방의료원 원장, 기획조정실 재무회계팀장, 원내 장비관리과',
      roleBadge: '병원장 / 기조실 / 회계담당',
      badge: '경영진단 & 사전검증',
      badgeColor: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-blue-300',
      icon: <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
      targetWorkspace: 'persona_page',
      subFeature: '2-2',
      menuPath: '② 의료기관 담당자 ➔ 2-2. 경영 벤치마킹 & 공시·시설장비 사전검증',
      isImplemented: true,
      summary:
        '동일 규모 지방의료원 12곳 익명 비교군 벤치마킹(알리미 실데이터), 공시·ERP 원천 대조 사전검증(출연금·보조금 혼입 탐지), 원내 시설·장비 노후도 진단을 지원합니다.',
      keyChecks: [
        '허가병상 150~250병상 동일 규모 지방의료원 12곳(비공개 비교군) 중앙값·평균 대비 우리 병원 재무·경영지표 벤치마킹',
        '의료이익률(-38.7% vs 중앙값 -43.7%), 인건비율(89.3%), 경상운영비율, 정부·지자체 지원금 의존도 심층 분석',
        '공시 사전검증: 정부 출연금 및 지자체 보조금 이중계상·원천 불일치(결산서 대조) 사전 감지',
        '원내 주요 시설장비(심뇌혈관 CT, 혈관조영장치, 인공신장기, MRI 등) 도입연도 및 내구연수 만료 진단',
      ],
      tip: '상단 병원 선택 셀렉트박스에서 [영월의료원]을 선택하고, 익명 비교군과의 경영 격차 및 원내 장비 노후도 진단 목록을 확인해 보세요.',
    },
    {
      key: '2-3',
      subtabId: '2-3',
      systemName: '2-3. 신포괄수가 정책가산 인센티브 계산기',
      category: 'hospital',
      targetRole: '공공병원 적정진료실(QI팀), 심사평가팀, CP위원회, 원무과',
      roleBadge: '진료처 / QI팀 / 심사평가',
      badge: '정책가산 모의계산',
      badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300',
      icon: <Calculator className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
      targetWorkspace: 'medical_institution',
      subFeature: 'policy_incentive',
      menuPath: '② 의료기관 담당자 ➔ 2-3. 신포괄수가 정책가산 인센티브 계산기',
      isImplemented: true,
      summary:
        '심평원 2026 신포괄지불제도 지침 및 국립중앙의료원 71개 표준진료지침(CP) 운영 점수를 기반으로 정부 정책가산 지원금(최대 1.0%)을 모의계산합니다.',
      keyChecks: [
        '신포괄 지침 별표3 기준: 표준진료지침(CP) 운영 가산율 최대 1.0% 점수 비례 산식 적용',
        '가산수가 공식: 포괄수가 × (정책가산율 / 100) 기반 기관별 연간 추가 수가액 시뮬레이션',
        '4대 병상 규모(500병상 초과, 300병상 초과, 300병상 이하, 병원급) 차등 가산 기준 적용',
        'CP 개발 체계(50점) + 적용 현황(20점) + 질환별 적용(10점) + 관리율(5점) + 모니터링(15점) 100점 만점 연산',
      ],
      tip: '슬라이더로 포괄수가 진료비와 CP 운영 점수를 조절해 보며, 병원의 연간 재정지원 추가 인센티브 금액이 실시간으로 변동하는 것을 확인해 보세요.',
    },
    {
      key: '2-4',
      subtabId: '2-4',
      systemName: '2-4. 퇴원환자 케어플랜·돌봄자원 매칭 AI',
      category: 'hospital',
      targetRole: '공공병원 공공의료사업실, 퇴원지원팀 전담 간호사, 의료사회복지사',
      roleBadge: '공공의료사업실 / 복지사',
      badge: '돌봄 연계 & 의뢰서',
      badgeColor: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-blue-300',
      icon: <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
      targetWorkspace: 'persona_page',
      subFeature: '2-4',
      menuPath: '② 의료기관 담당자 ➔ 2-4. 퇴원환자 케어플랜·돌봄자원 매칭 AI',
      isImplemented: true,
      summary:
        '복지부 급성기 퇴원지원 시범사업 표준 4단계에 따라 입원 스크리닝, ADL 10개 영역 심층평가, 케어플랜 수립, 최적 지역 돌봄자원 매칭 및 공식 연계의뢰서를 생성합니다.',
      keyChecks: [
        '표준 4단계 프로세스: 조기 스크리닝 ➔ 다학제 심층평가 ➔ 케어플랜 수립 ➔ 지역사회 연계',
        '가상 환자 프리셋 2종(김공공 72세·독거 뇌경색 vs 박돌봄 81세·노부부 대퇴골절) 지원',
        'ADL 10개 영역 일상동작, 낙상위험, 영양상태, 주거환경 심층평가표 자동 로딩',
        '지역사회 돌봄자원(보건소 방문간호, 맞춤돌봄, 식사배달 등) 최적 매칭 및 보건복지부 공식 [퇴원환자 지역사회 연계 의뢰서] 다운로드',
      ],
      tip: '상단 가상 환자 탭에서 [김공공]을 선택하고 하단 [공식 퇴원연계 의뢰서 서식 미리보기]를 클릭하여 복지부 제출용 정량 서식을 확인해 보세요.',
    },
    {
      key: '2-5',
      subtabId: '2-5',
      systemName: '2-5. 고위험 산모·신생아 전원의뢰·수용 매칭',
      category: 'hospital',
      targetRole: '분만산부인과, NICU 전담의사·간호사, 광역 모자의료센터 전원조정관',
      roleBadge: '모자의료센터 / NICU',
      badge: '전원 매칭 & 관제',
      badgeColor: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-blue-300',
      icon: <Baby className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
      targetWorkspace: 'persona_page',
      subFeature: '2-5',
      menuPath: '② 의료기관 담당자 ➔ 2-5. 고위험 산모·신생아 전원의뢰·수용 매칭',
      isImplemented: true,
      summary:
        '중증도×이송시간×수용확률 종합 점수화로 권역 내 수용 가능한 고위험 모자의료센터 TOP 3를 추천하고 실시간 NICU 가용 자원을 연계합니다.',
      keyChecks: [
        '고위험 산모(임신중독증, 조기양막파열) 및 고위험 신생아(극소저체중, 호흡곤란) 중증도 입력',
        '골든타임 이송 소요시간(구급차 60분 이내) 및 실시간 수용확률 종합 산출',
        '권역 모자의료센터 TOP 3 추천 및 다기관 동시 전원 요청 시뮬레이션',
      ],
      tip: '산모 중증도 체크박스를 선택하고 [수용기관 추천]을 눌러 강원대병원, 원주세브란스기독병원 등 권역 기관의 매칭 점수를 확인해 보세요.',
    },
    {
      key: '2-6',
      subtabId: '2-6',
      systemName: '2-6. 책임의료기관 통합 사업 지침 AI 질의응답',
      category: 'hospital',
      targetRole: '책임의료기관 사업 전담인력, 시도 공공보건의료지원단 사업관리자',
      roleBadge: '책임의료기관 전담팀',
      badge: '331쪽 지침 RAG',
      badgeColor: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-blue-300',
      icon: <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
      targetWorkspace: 'persona_page',
      subFeature: '2-6',
      menuPath: '② 의료기관 담당자 ➔ 2-6. 책임의료기관 사업지침 AI 질의응답',
      isImplemented: true,
      summary:
        '「2026년 책임의료기관 통합 사업 안내」(총 331쪽) 원문 벡터 DB를 기반으로 질문과 관련된 정확한 페이지와 원문 발췌문을 근거로 답변합니다.',
      keyChecks: [
        '331쪽 법정 사업안내 원문 전수 임베딩: 임의 환각 답변을 차단하고 오직 원문만 근거로 요약',
        '답변 시 근거 페이지(예: p.45 제2절) 및 원문 조항 즉시 인용 표출',
        '사업비 집행기준, 인건비 책정, 필수원내협의체 구성 요건 등 실무 질의 지원',
      ],
      tip: '검색창에 "원내협의체 구성 요건" 또는 "사업비 집행 기준"을 입력하여 쪽수와 함께 제시되는 근거 답변을 확인해 보세요.',
    },

    // ──────────────────────────────────────────────────────────────────────────
    // 3. 보건복지부·NMC (3개 메뉴)
    // ──────────────────────────────────────────────────────────────────────────
    {
      key: '3-1',
      subtabId: '3-1',
      systemName: '3-1. 전국 취약지 정책통계 & 통합 DW 분석',
      category: 'nmc',
      targetRole: '보건복지부 공공의료과, 국립중앙의료원 공공보건의료지원센터 통계팀',
      roleBadge: '복지부 / NMC 통계팀',
      badge: '정책통계 & DW 분석',
      badgeColor: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-300',
      icon: <Activity className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />,
      targetWorkspace: 'persona_page',
      subFeature: '3-1',
      menuPath: '③ 보건복지부·지원단/NMC ➔ 3-1. 전국 취약지 정책통계 & 통합 DW 분석',
      isImplemented: true,
      summary:
        '전국 250개 시군구 필수의료 취약지 식별, 내장 테이블 기반 규칙형 Text-to-SQL 통계 질의, 공공의료 8단계 AI 파이프라인 관제를 제공합니다.',
      keyChecks: [
        '전국 250개 시군구 취약지 종합 지표 매트릭스 및 다차원 큐브 분석',
        '자연어 질문("응급취약 시군구 목록")을 SQL로 자동 변환하여 즉시 질의하는 Text-to-SQL',
        '공공데이터포털 및 E-Gen 실시간 연계 파이프라인 무결성 모니터링',
      ],
      tip: '통계 질의창에 "강원도 응급 취약지 현황"을 입력하고 실행하여 SQL 변환 및 집계 테이블이 도출되는 과정을 확인해 보세요.',
    },
    {
      key: '3-2',
      subtabId: '3-2',
      systemName: '3-2. 기능보강 투자배분 & 중앙모자의료 관제',
      category: 'nmc',
      targetRole: '보건복지부 기능보강사업 담당관, 중앙모자의료센터 관제실',
      roleBadge: '복지부 투자심사 / 모자관제',
      badge: '투자 시뮬레이션 & 관제',
      badgeColor: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-300',
      icon: <Sliders className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />,
      targetWorkspace: 'persona_page',
      subFeature: '3-2',
      menuPath: '③ 보건복지부·지원단/NMC ➔ 3-2. 기능보강 투자배분 & 중앙모자의료 관제',
      isImplemented: true,
      summary:
        '시설·장비 국고 지원 우선순위 시뮬레이터(지역수요×활용률×유지비), 전국 중앙 모자의료 실시간 관제 및 E-Gen 미갱신 경보를 수행합니다.',
      keyChecks: [
        '기능보강 사업 국비 투자 우선순위 다기준 평가 시뮬레이터',
        '기관별 국고 지원액 및 전문인력 확보 수준 종합 대시보드',
        '광역 모자의료센터 병상 가용정보 미갱신 기관 자동 경보(Alert) 시스템',
      ],
      tip: '투자 시뮬레이터에서 지역 취약도 가중치를 상향 조절하여 기관별 지원금 우선순위 순위가 재배열되는 것을 확인해 보세요.',
    },
    {
      key: '3-3',
      subtabId: '3-3',
      systemName: '3-3. 통합 평가·공시심사·성과 모니터링 (100점 심사)',
      category: 'nmc',
      targetRole: '국립중앙의료원 평가심사팀, 공공보건의료 평가위원, 복지부 심사관',
      roleBadge: 'NMC 심사평가팀 / 평가위원',
      badge: '100점 심사 & 공시검증',
      badgeColor: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-300',
      icon: <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />,
      targetWorkspace: 'persona_page',
      subFeature: '3-3',
      menuPath: '③ 보건복지부·지원단/NMC ➔ 3-3. 통합 평가·공시심사·성과 모니터링',
      isImplemented: true,
      summary:
        '거점공공병원 운영평가, 시행계획 100점 심사(추진실적 70점 + 사업계획 30점), 42곳 알리미 공시 교차검증(14대 회계식·이상치) 및 심사보고서를 자동 편성합니다.',
      keyChecks: [
        '공식 100점 평가표 자동 채점: 10대 평가항목(실적 70점, 계획 30점) 루브릭 심사 및 위원회 정량 5점 자동 계산',
        '알리미 교차검증: 14대 법정 회계산출식 및 수정 z-score 이상치(출연금 중복, 인건비 급변) 탐지',
        '소위원회 점수 편차 중재안 도출 및 복지부 보고용 종합평가결과서 자동 생성',
      ],
      tip: '기관 프리셋에서 [지침위반 샘플]을 선택한 뒤 [사전검증 스캔]을 실행하여 누락 항목과 오류가 즉시 적발되는 과정을 확인해 보세요.',
    },

    // ──────────────────────────────────────────────────────────────────────────
    // 1. 대국민 (4개 메뉴)
    // ──────────────────────────────────────────────────────────────────────────
    {
      key: '1-1',
      subtabId: '1-1',
      systemName: '1-1. 지금 필요한 공공의료 찾기 (안심의료 지도)',
      category: 'citizen',
      targetRole: '일반 국민, 응급환자 보호자, 119 구급상황관리센터',
      roleBadge: '대국민 / 119 구급대',
      badge: '안심의료 지도검색',
      badgeColor: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border-rose-300',
      icon: <MapPin className="w-4 h-4 text-rose-600 dark:text-rose-400" />,
      targetWorkspace: 'persona_page',
      subFeature: '1-1',
      menuPath: '① 대국민 ➔ 1-1. 지금 필요한 공공의료 찾기',
      isImplemented: true,
      summary:
        '내 위치 기반 3대 필수의료(응급실, 분만병원, 달빛어린이병원) 안심의료 검색, 실시간 야간 진료 여부, 원클릭 119 전화 및 카카오맵 길찾기를 지원합니다.',
      keyChecks: [
        '현재 위치 기반 3대 안심의료(응급실 528곳, 분만 420곳, 달빛어린이병원 114곳) 탐색',
        '원클릭 119 구급대 / 병원 직통 전화연결 및 카카오맵 실시간 길찾기',
        '야간·공휴일 실시간 진료 가능 기관 필터링',
      ],
      tip: '상단 안심의료 필터(응급실, 분만병원, 달빛병원)를 누르고 지도 위의 마커를 클릭하여 실시간 진료 정보와 전화연결을 확인해 보세요.',
    },
    {
      key: '1-2',
      subtabId: '1-2',
      systemName: '1-2. 우리 동네 응급실·소아병상 모니터링',
      category: 'citizen',
      targetRole: '소아·응급 환자 보호자, 지역 주민, 보건소 당직실',
      roleBadge: '대국민 / 보건소 민원실',
      badge: '실시간 가용병상 E-Gen',
      badgeColor: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border-rose-300',
      icon: <HeartPulse className="w-4 h-4 text-rose-600 dark:text-rose-400" />,
      targetWorkspace: 'persona_page',
      subFeature: '1-2',
      menuPath: '① 대국민 ➔ 1-2. 우리 동네 응급실·소아병상 모니터링',
      isImplemented: true,
      summary:
        '시도 내 시군구별 응급실 및 달빛어린이병원 실시간 가용병상 그리드 모니터링을 제공합니다.',
      keyChecks: [
        '시도 내 시군구별 응급실·분만실·달빛어린이병원 기관 수 그리드',
        'E-Gen 공공데이터포털 실시간 가용병상 API 연동 모니터링',
        '소아야간진료 달빛어린이병원 114개소 전수 좌표 연계',
      ],
      tip: '지역을 강원도로 변경하여 영월·삼척·태백 지역의 응급실 및 소아 야간 진료 현황 그리드를 확인해 보세요.',
    },
    {
      key: '1-3',
      subtabId: '1-3',
      systemName: '1-3. 우리 지역 공공병원 알리미 비교',
      category: 'citizen',
      targetRole: '지역 주민, 공공병원 이용 환자, 시민단체',
      roleBadge: '일반 시민 / 소비자',
      badge: '공공병원 공시비교',
      badgeColor: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border-rose-300',
      icon: <FileText className="w-4 h-4 text-rose-600 dark:text-rose-400" />,
      targetWorkspace: 'persona_page',
      subFeature: '1-3',
      menuPath: '① 대국민 ➔ 1-3. 우리 지역 공공병원 알리미 비교',
      isImplemented: true,
      summary:
        '영월의료원·삼척의료원·태백병원 등 공공병원의 필수의료 운영, 표준진료지침(CP) 적용률, 취약계층 진료비 감면 현황을 투명하게 비교합니다.',
      keyChecks: [
        '전국 42곳 거점공공병원 알리미 공시 결산 데이터 1:1 비교',
        '필수의료 진료과목 개설 현황 및 CP 적용률 대조',
        '취약계층 의료비 감면액 및 공공보건의료사업 수행 실적 비교',
      ],
      tip: '비교 대상 병원으로 [영월의료원]과 [삼척의료원]을 선택하여 필수의료 지표와 감면액 차이를 확인해 보세요.',
    },
    {
      key: '1-4',
      subtabId: '1-4',
      systemName: '1-4. 대국민 공공의료 AI 안내 도우미',
      category: 'citizen',
      targetRole: '일반 시민, 복지 상담사, 보건소 민원 담당자',
      roleBadge: '대국민 AI 도우미',
      badge: '공개정보 AI RAG',
      badgeColor: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border-rose-300',
      icon: <Sparkles className="w-4 h-4 text-rose-600 dark:text-rose-400" />,
      targetWorkspace: 'persona_page',
      subFeature: '1-4',
      menuPath: '① 대국민 ➔ 1-4. 대국민 공공의료 AI 안내 도우미',
      isImplemented: true,
      summary:
        '공개된 공공데이터(E-Gen, 심평원, 알리미)만을 근거로 응급실·달빛병원 안내 및 공공의료 제도를 정확하고 친절하게 설명합니다.',
      keyChecks: [
        '외부 비공개 정보 배제: 사이트 내 공개 데이터만을 근거로 답변',
        '답변마다 원천 공공데이터 출처 표출 및 신뢰성 확보',
        '야간 소아진료, 긴급 분만, 취약지 혜택 등 대국민 맞춤 안내',
      ],
      tip: '질문창에 "영월군 근처 야간에 아이가 아플 때 갈 수 있는 병원 알려줘"를 입력해 보세요.',
    },
  ];

  // 카테고리 필터링된 시스템 목록
  const filteredSystems =
    selectedCategory === 'all'
      ? systemGuides
      : systemGuides.filter((s) => s.category === selectedCategory);

  const currentSystem =
    systemGuides.find((g) => g.key === activeSystemKey) || systemGuides[0];

  const handleGo = (subtabId: string, workspace?: 워크스페이스_타입, subFeature?: string) => {
    const 찾은 = 서브탭_찾기(subtabId);
    if (찾은 && onSelectPersonaSubtab) {
      onSelectPersonaSubtab(찾은.서브탭);
    } else if (workspace) {
      onNavigate(workspace, subFeature);
    }
    onClose();
  };

  const categories: { id: 직무_카테고리; label: string; icon: string }[] = [
    { id: 'all', label: '전체 (13대 기능)', icon: '🌐' },
    { id: 'hospital', label: '② 의료기관 담당자 (6개)', icon: '🏥' },
    { id: 'nmc', label: '③ 보건복지부·NMC (3개)', icon: '🏛️' },
    { id: 'citizen', label: '① 대국민 (4개)', icon: '👨‍👩‍👧' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#15161b] rounded-3xl w-full max-w-5xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* 모달 상단 헤더 */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white flex items-start justify-between gap-4 shrink-0">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-blue-500/20 text-blue-300 border border-blue-400/30">
              <Compass className="w-3.5 h-3.5 text-blue-400" />
              <span>3대 사용자 그룹 13대 서브탭 검토 총람</span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
              <span>공공보건의료 의사결정 지원 플랫폼 담당자별 집중 검토 가이드</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-300">
              의료기관 담당자, 보건복지부·국립중앙의료원(NMC), 일반 대국민 등 각 역할별 최우선 검토 메뉴와 핵심 확인 시나리오를 안내합니다.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition cursor-pointer"
            title="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 담당자 직무별 필터 칩 */}
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto shrink-0">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap mr-1 flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            <span>사용자 그룹:</span>
          </span>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id);
                // 필터링 후 현재 선택이 없으면 첫번째 항목으로 자동 변경
                const first = cat.id === 'all' ? systemGuides[0] : systemGuides.find((s) => s.category === cat.id);
                if (first && (cat.id !== 'all' && currentSystem.category !== cat.id)) {
                  setActiveSystemKey(first.key);
                }
              }}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* 13대 서브탭 그리드 선택 탭 (반응형 3~4열) */}
        <div className="p-3 bg-slate-100/90 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0 max-h-48 overflow-y-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {filteredSystems.map((sys) => {
              const isSelected = activeSystemKey === sys.key;
              return (
                <button
                  key={sys.key}
                  type="button"
                  onClick={() => setActiveSystemKey(sys.key)}
                  className={`p-2 rounded-xl text-left transition-all cursor-pointer border flex flex-col justify-between gap-1 relative ${
                    isSelected
                      ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm border-blue-500/50 ring-2 ring-blue-500/20'
                      : 'bg-white/70 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-700/60 hover:bg-white dark:hover:bg-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="shrink-0">{sys.icon}</span>
                      <span className="text-xs font-black truncate">{sys.systemName}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-1">
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-medium truncate ${
                        isSelected
                          ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {sys.roleBadge}
                    </span>
                    {isSelected && (
                      <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 shrink-0">선택됨</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 선택된 시스템 상세 안내 본문 */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* 1. 상단 요약 배너 */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="space-y-1.5 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${currentSystem.badgeColor}`}>
                  {currentSystem.badge}
                </span>
                <span className="font-black text-base sm:text-lg text-slate-900 dark:text-white truncate">
                  {currentSystem.systemName}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  구현완료 ✓
                </span>
              </div>

              {/* 주요 검토 대상 담당자 (Role) 표시 */}
              <div className="flex items-center gap-1.5 text-xs text-indigo-700 dark:text-indigo-300 font-semibold bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-1 rounded-lg border border-indigo-200 dark:border-indigo-900/50 inline-flex flex-wrap">
                <UserCheck className="w-3.5 h-3.5 shrink-0 text-indigo-600 dark:text-indigo-400" />
                <span>주요 검토 대상 담당자:</span>
                <strong className="font-black text-indigo-900 dark:text-indigo-200">{currentSystem.targetRole}</strong>
              </div>

              {/* 프로토타입 해당 메뉴 경로 */}
              <div className="text-xs text-blue-600 dark:text-blue-400 font-bold flex items-center gap-1 pt-0.5">
                <span>실제 메뉴 경로:</span>
                <strong className="underline underline-offset-2">{currentSystem.menuPath}</strong>
              </div>
            </div>

            {/* 바로가기 버튼 */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => handleGo(currentSystem.subtabId, currentSystem.targetWorkspace, currentSystem.subFeature)}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-md flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer whitespace-nowrap"
              >
                <span>해당 메뉴로 즉시 이동</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 2. 시스템 개요 설명 */}
          <div className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-900/30 border border-slate-200/60 dark:border-slate-800 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
            {currentSystem.summary}
          </div>

          {/* 3. 핵심 검토 포인트 체크리스트 */}
          <div className="space-y-2">
            <h4 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>시스템 담당자 집중 검토 포인트 (Checklist)</span>
            </h4>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
              {currentSystem.keyChecks.map((check, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                  <div className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <span className="leading-snug">{check}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 4. 시연 및 검증 팁 안내 */}
          <div className="p-4 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 flex items-start gap-3 text-xs text-blue-950 dark:text-blue-200">
            <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="font-black text-blue-900 dark:text-blue-100 block">
                시연 및 검증 추천 시나리오:
              </strong>
              <p className="leading-relaxed">{currentSystem.tip}</p>
            </div>
          </div>
        </div>

        {/* 모달 하단 푸터 */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            ※ 공공보건의료 플랫폼 13대 서브탭과 100% 동기화된 담당자별 최우선 검증 가이드입니다.
          </span>
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              닫기
            </button>
            <button
              onClick={() => handleGo(currentSystem.subtabId, currentSystem.targetWorkspace, currentSystem.subFeature)}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-black shadow-xs hover:bg-blue-700 transition flex items-center gap-1.5 cursor-pointer"
            >
              <span>{currentSystem.systemName} 확인하러 가기</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
