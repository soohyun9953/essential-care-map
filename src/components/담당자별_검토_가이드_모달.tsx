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
  Cpu,
  HeartPulse,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Users,
  Compass,
  FileSpreadsheet,
  Network,
  LayoutGrid,
  Search,
  Sliders,
  DollarSign,
  UserCheck,
  Layers,
  Bot,
  Brain,
  ShieldAlert,
  HelpCircle,
} from 'lucide-react';
import { 워크스페이스_타입 } from './글로벌_공공_헤더';

interface 담당자별_검토_가이드_모달_속성 {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (workspace: 워크스페이스_타입, subFeature?: string) => void;
}

type 직무_카테고리 = 'all' | 'policy' | 'qi_medical' | 'care_network' | 'mgmt_disclosure' | 'ai_data';

interface 시스템_가이드_항목 {
  key: string;
  systemName: string;
  category: 직무_카테고리;
  targetRole: string; // 주요 검토 대상 담당자
  roleBadge: string;
  badge: string;
  badgeColor: string;
  icon: React.ReactNode;
  targetWorkspace: 워크스페이스_타입;
  subFeature?: string;
  secondaryWorkspace?: 워크스페이스_타입;
  secondarySubFeature?: string;
  secondaryLabel?: string;
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
}) => {
  // 기본 선택 시스템: 공공병원 알리미
  const [activeSystemKey, setActiveSystemKey] = useState<string>('aa_disclosure');
  // 직무 필터 상태
  const [selectedCategory, setSelectedCategory] = useState<직무_카테고리>('all');

  if (!isOpen) return null;

  // 공공병원 AI 진단·개선 + 공공의료 7대 시스템 + AI 스튜디오 총 9대 영역 정밀 가이드 정의
  const systemGuides: 시스템_가이드_항목[] = [
    {
      key: 'ai_hospital_diagnosis',
      systemName: '⭐ AI 병원진단·개선 (신규 핵심)',
      category: 'all',
      targetRole: '지방의료원장, 지자체 보건의료과장, 보건복지부, NMC 지원센터',
      roleBadge: '병원장 / 지자체장 / 복지부',
      badge: 'AI 병원진단·개선·의사결정',
      badgeColor: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-blue-300',
      icon: <Sparkles className="w-4 h-4 text-amber-500" />,
      targetWorkspace: 'hospital_ai_diagnosis',
      menuPath: '[AI 병원진단·개선] ➔ 7단계 풀스택 의사결정 프로세스',
      isImplemented: true,
      summary: '41개 거점공공병원 대상 종합진단 ➔ 문제·원인분석 ➔ Benchmarking ➔ 5개년 수요예측 ➔ 개선대안 ➔ 시뮬레이션 ➔ 실행계획 ➔ 성과관리',
      keyChecks: [
        '41개 거점공공병원(지방의료원 35, 적십자 6) 전수 AI 진단점수(공공성·효율·수요·인력·필수의료·재무 6대 지표 및 69점 등 종합점수 산출)',
        'AI 설명가능성(XAI): 각 점수마다 산출기준, 사용데이터, 기준연도, 비교대상 [AI 분석 근거 보기] 모달 제공',
        'AI가 발견한 4대 핵심 문제(응급인력 부족, 필수의료 약화, 간호인력 부담, 외래유출) 클릭 시 직접원인, 구조적원인, 연관데이터 심층 분석',
        '유사병원 Benchmarking: 우리병원 vs 유사규모 vs 전국평균 vs 상위 10% 병원 Gap 자동 발견',
        'AI 5개년 수요예측(2026~2030): 외래·입원·응급·병상·의료인력 추계 및 2028년 위험구간 조기경보',
        'Human-in-the-loop 의사결정: AI 추천 3대 대안(A안: 인력충원 vs B안: 필수의료종합 vs C안: 원격협진) 담당자 검토 및 확정 채택',
        '실시간 경영·정책 시뮬레이터: 의사·간호사 증원 및 원격협진 슬라이더 직접 조절에 따른 처리량·대기시간·전원율 실시간 비교',
        '세부 실행계획 로드맵 및 성과관리 KPI 목표 대비 달성률 환류 체계 (가상 시연 데이터)',
      ],
      tip: '헤더의 [AI 병원진단·개선] 버튼을 누르고 영월의료원 선택 후, ①종합진단 ➔ ②유사병원 Benchmarking ➔ ④개선대안 및 실시간 시뮬레이터를 순서대로 체험해 보세요.',
    },
    {
      key: 'health_map',
      systemName: '1. 헬스맵',
      category: 'policy',
      targetRole: '지자체(시·도/보건소) 보건기획관 & 보건복지부 공공의료과',
      roleBadge: '지자체 정책관 / 복지부',
      badge: '필수의료 GIS & 정책',
      badgeColor: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-blue-300',
      icon: <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
      targetWorkspace: 'regional_diagnosis',
      menuPath: '[지역진단] (35:65 GIS 지도) & [정책기획] (AI 사업계획서)',
      secondaryWorkspace: 'policy_planning',
      secondarySubFeature: 'report',
      secondaryLabel: '[정책기획] 사업계획서 이동',
      isImplemented: true,
      summary: '전국 250개 시군구 필수의료 취약도 지도 및 환자 유출입 분석, AI 기반 지자체 표준 12대 항목 사업계획서 1초 자동생성',
      keyChecks: [
        '250개 시군구 GIS 35:65 화면 분할 지도 및 7대 필수의료 Layer(응급·분만·소아·공공의료원 등)',
        '환자 의료이용 유출입 네트워크 Top 5: 시·군·구, 중진료권, 시·도 단위별 유출/유입 순위 및 프로그레스 바',
        '의료이용 AI 자연어 질의응답: "중진료권별 유출 Top10과 유출 재원일수 보여줘" 등 대화형 전수 통계 산출',
        '관내 중증 응급환자 타 지역 유출률 및 골든타임(골든아워) 취약지 분석',
        'AI 정책 대안 3종(Option A: 보조금 지원 vs Option B: 시설확충 vs Option C: 인력보강) 시뮬레이션',
        '정부 공식 지자체 맞춤형 12대 항목 사업계획서(예산, 인력, 성과지표 KPI) 원클릭 생성 및 인쇄/다운로드',
        '1:1 지자체 간 의료자원 정밀 비교 및 2030 진료권 수요추계',
      ],
      tip: '[지역진단] 상단 [환자 유출입 AI Q&A] 버튼을 눌러보거나, [AI 정책기획으로 연계하기] 버튼을 눌러 Option A·B·C 선택에 따른 12대 항목 사업계획서 자동 작성을 확인해 보세요.',
    },
    {
      key: 'cp_monitoring',
      systemName: '2. CP 모니터링',
      category: 'qi_medical',
      targetRole: '공공병원 진료처·적정진료실(QI팀), 국립중앙의료원(NMC) 표준진료지침센터',
      roleBadge: '진료처 / QI팀 / CP위원회',
      badge: '표준 임상경로 & 질관리',
      badgeColor: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border-purple-300',
      icon: <HeartPulse className="w-4 h-4 text-purple-600 dark:text-purple-400" />,
      targetWorkspace: 'medical_institution',
      subFeature: 'cp_library',
      secondaryWorkspace: 'medical_institution',
      secondarySubFeature: 'cp_variance',
      secondaryLabel: '[CP 변이분석 & ROI] 이동',
      menuPath: '[의료기관] ➔ [71개 표준진료지침(CP) 라이브러리] & [CP 변이 분석 & ROI]',
      isImplemented: true,
      summary: '국립중앙의료원(NMC) 공인 71개 표준 CP 라이브러리 및 재원일수 변이(Variance) 모니터링, 병상회전율·진료비 절감 ROI 산출',
      keyChecks: [
        '국립중앙의료원(NMC) 공인 71개 진료과목별 표준 CP(Clinical Pathway) 검색 및 적용 지침 안내',
        '질환별(복강경 담낭절제술, 슬관절전치환술 등) 표준재원일수 및 다학제 임상경로 흐름도(입원~수술~퇴원) 제공',
        'CP 변이(Variance) 모니터링: 표준재원일수 대비 초과일수 및 원인별(임상/환자/병원) 변이 분석',
        '재원일수 단축에 따른 병상회전율·재정 효과를 병원별 입력값으로 계산 (고정 효과 수치 없음)',
        '임상 질 향상(QI) 및 적정진료 유도 효과 분석 지표 실시간 관제',
      ],
      tip: '[71개 표준진료지침(CP) 라이브러리] 탭에서 "담낭절제술" 또는 "슬관절치환술"의 표준재원일수를 확인한 뒤, [CP 변이 분석 & ROI] 탭에서 연간 재정 ROI 절감액을 확인해 보세요.',
    },
    {
      key: 'resource_mgmt',
      systemName: '3. 공공병원 자원관리',
      category: 'mgmt_disclosure',
      targetRole: '국립중앙의료원 중앙공공보건의료지원단, 공공병원 기획/총무/의료자원과',
      roleBadge: 'NMC 지원단 / 병원 자원관리팀',
      badge: '병상·인력·장비 인프라',
      badgeColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300',
      icon: <LayoutGrid className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
      targetWorkspace: 'medical_institution',
      subFeature: 'hospitals',
      secondaryWorkspace: 'medical_institution',
      secondarySubFeature: 'datacenter',
      secondaryLabel: '[기관 데이터센터] 이동',
      menuPath: '[의료기관] ➔ [공공의료기관 탐색 (214개소)] & [기관 데이터센터]',
      isImplemented: true,
      summary: '전국 214개 공공병원(지방의료원 35, 적십자 6, 국립대병원 등) 통합 자원 관제 및 자연어 AI 질의응답, NMC 표준 데이터셋 다운로드',
      keyChecks: [
        '전국 214개 공공병원 허가/가동 병상수(일반/중환자실/음압격리) 통합 데이터베이스 구축',
        '의료기관 AI 자연어 질의응답: "병상수가 가장 많은 공공병원 Top10", "강원도 공공병원 현황" 등 전수 질의 지원',
        '필수의료 진료과목별 전문의·전공의·공보의 및 간호사 정원/현원 인력 통계 관제',
        '의사 1인당 연간 외래·입원 진료환자수 및 인력 결원율 분석',
        'NMC 표준 3종 엑셀 서식(크로스탭 원본 데이터셋) 일괄 다운로드 및 data.go.kr API 연계',
      ],
      tip: '[공공의료기관 탐색] 탭 우측 상단 [의료기관 AI 질의응답] 버튼을 클릭하여 자연어로 질문해 보거나, "영월의료원" 카드를 클릭해 병상·전문의 상세 인력을 확인해 보세요.',
    },
    {
      key: 'hospital_portal',
      systemName: '4. 공공병원 포털',
      category: 'policy',
      targetRole: '일반 국민, 응급환자 보호자, 119 구급상황관리센터, 보건소 민원실',
      roleBadge: '대국민 / 119 구급대 / 보건소',
      badge: '대국민 서비스 포털',
      badgeColor: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300 border-cyan-300',
      icon: <Search className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />,
      targetWorkspace: 'national_safety',
      subFeature: 'citizen_view',
      secondaryWorkspace: 'home',
      secondaryLabel: '[홈] 메인 포털 이동',
      menuPath: '[국민안심] (대국민 5대 안심의료 포털) & [홈] (통합 메인)',
      isImplemented: true,
      summary: '모바일 최적화 실시간 5대 안심의료 검색, 응급실 실시간 가용병상, 24시 달빛어린이병원 안내 및 원클릭 119/길찾기 연계',
      keyChecks: [
        '모바일-First 5대 안심의료(응급실, 분만병원, 달빛어린이병원, 필수의료 병원, 야간약국) 위치 기반 탐색',
        '전국 응급실/중환자실/수술실 실시간 가용병상 및 소아과 전문의 야간 진료 현황 연계',
        '원클릭 119/병원 직통 전화연결 및 카카오맵/네이버 지도 실시간 길찾기 연계',
        '하단 3단계 접이식 바텀시트를 통한 모바일 최적화 UI/UX 제공',
        '※ (안내) 공공병원 내부 임직원 전용 업무포털(그룹웨어/전자결재)은 연계 시스템으로 분류됨',
      ],
      tip: '상단 [국민안심] 메뉴로 이동하여 상단 필터(응급실, 분만병원, 달빛어린이병원)를 누르고, 병원 카드의 [전화연결] 및 [길찾기] 버튼을 체험해 보세요.',
    },
    {
      key: 'care_network',
      systemName: '5. 공공병원 연계망',
      category: 'care_network',
      targetRole: '공공병원 공공의료사업실, 퇴원지원팀 전담 간호사 & 의료사회복지사, 지역 보건소·사회복지관',
      roleBadge: '공공의료사업실 / 사회복지팀',
      badge: '퇴원환자 지역사회 돌봄',
      badgeColor: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-300',
      icon: <Network className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />,
      targetWorkspace: 'medical_institution',
      subFeature: 'discharge_care',
      menuPath: '[의료기관] ➔ [퇴원환자 돌봄자원 매칭]',
      isImplemented: true,
      summary: '보건복지부 공공병원 퇴원환자 지역사회 연계사업 표준 4단계(스크리닝 ➔ 심층평가 ➔ 돌봄계획 ➔ 복지관 연계 의뢰서 자동생성)',
      keyChecks: [
        '복지부 표준 4단계 퇴원지원 프로세스(입원 스크리닝 ➔ 다학제 심층평가 ➔ 계획수립 ➔ 지역사회 연계)',
        '가상 환자 프리셋 2종(김공공 72세/남·뇌경색 독거노인 vs 박돌봄 81세/여·골절 노부부) 원클릭 매칭',
        '표준 환자평가표(ADL 10개 영역 일상동작, 낙상위험도, 영양상태, 주거환경) 자동 산출',
        'AI 기반 지역사회 맞춤형 돌봄자원 추천(영월군보건소 방문간호, 영월종합사회복지관 도시락 배달 등)',
        '보건복지부 공식 서식 [퇴원환자 지역사회 연계 의뢰서] 원클릭 자동 생성 및 인쇄/다운로드',
        '퇴원 후 30일/90일 재입원율 감소 효과 모니터링 체계 연계',
      ],
      tip: '[의료기관] ➔ [퇴원환자 돌봄자원 매칭] 탭에서 상단 가상 환자(김공공 또는 박돌봄)를 선택하면 심층평가표가 자동 로딩되며, 하단 [연계 의뢰서 자동생성 & 미리보기] 버튼을 눌러 공식 의뢰서를 확인해 보세요.',
    },
    {
      key: 'mgmt_monitoring',
      systemName: '6. 경영정보모니터링',
      category: 'mgmt_disclosure',
      targetRole: '지방의료원 원장·기획조정실 재무회계팀장, 보건복지부 공공의료경영평가관',
      roleBadge: '병원장 / 기조실 / 복지부 평가관',
      badge: '재무위기 조기경보 & 신포괄',
      badgeColor: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-amber-300',
      icon: <TrendingUp className="w-4 h-4 text-amber-600 dark:text-amber-400" />,
      targetWorkspace: 'medical_institution',
      subFeature: 'crisis',
      secondaryWorkspace: 'medical_institution',
      secondarySubFeature: 'policy_incentive',
      secondaryLabel: '[신포괄 정책가산 계산기] 이동',
      menuPath: '[의료기관] ➔ [지방의료원 경영위기 조기경보] & [신포괄 정책가산 계산기]',
      isImplemented: true,
      summary: '전국 35개 지방의료원 결산 재무비율 기반 4단계 경영위기 조기경보 및 신포괄 정책가산 시뮬레이터 (가산율 기준 원문 미확인)',
      keyChecks: [
        '전국 35개 지방의료원 결산서 기반 부채비율, 의업수지비율, 차입금의존도 3대 핵심 재무지표 실시간 관제',
        '4단계 경영위기(정상, 주의, 경계, 심각) 자동 판정 및 지역별 취약기관 리스트 표출',
        '신포괄 정책가산율 시뮬레이션 (점수별 가산율 기준은 원문 미확인 — 지침 확인 필요)',
        '연간 신포괄 진료비 × 가산율로 추가 재정 효과를 계산 (입력값 기준)',
      ],
      tip: '[지방의료원 경영위기 조기경보] 탭에서 35개 의료원 위기등급을 확인한 뒤, [신포괄 정책가산(1.0%) 계산기] 탭에서 가산율 슬라이더를 조정하여 연간 추가 지원금을 산출해 보세요.',
    },
    {
      key: 'aa_disclosure',
      systemName: '7. 공공병원 알리미',
      category: 'mgmt_disclosure',
      targetRole: '전국 41개 지역거점 공공병원 통합공시 총괄담당자, 국립중앙의료원(NMC) 알리미 검증팀',
      roleBadge: '공공병원 공시총괄팀 / NMC 검증팀',
      badge: '통합공시 품질검증 (NEW)',
      badgeColor: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border-rose-300',
      icon: <Building2 className="w-4 h-4 text-rose-600 dark:text-rose-400" />,
      targetWorkspace: 'medical_institution',
      subFeature: 'aa_disclosure',
      menuPath: '[의료기관] ➔ [41개 공공병원 알리미 공시검증]',
      isImplemented: true,
      summary: '국립중앙의료원 2026.6 실증 보고서 기반 41개 공공병원 공시 오류검증, 14대 법정 회계산출식 및 PII 개인정보 비식별화 도구',
      keyChecks: [
        '전국 41개 공공병원별 오류의심·검토요청 건수 (업무보고 원문 대조) 및 216건 오류의심(결산서 불일치, 0원 등록 등) 현황',
        '14대 법정 회계산출식 및 통계이상치(수정 z-score, 전년대비 ±15% 급변동) 실시간 사전검증 시뮬레이터',
        '영월의료원 2026 실제 검증 사례(전문의 1명 오차 & 인건비 급변동) 자동 감지 체험 프리셋',
        '수시공시 첨부문서 내 환자 개인정보(주민번호, 의무기록번호, 성명, 연락처, 주소) 실시간 비식별화 마스킹 도구',
        '국립중앙의료원 6단계 수정공시 공식 소명사유서 원클릭 자동 생성기',
      ],
      tip: '[41개 병원별 품질검증] 탭에서 랭킹을 확인하고, [14대 회계산출식 & 통계이상치] 탭에서 "영월의료원" 또는 "오류다발" 프리셋을 눌러 사전검증 판정을 확인해 보세요.',
    },
    {
      key: 'ai_analysis',
      systemName: '8. 공공의료 AI 스튜디오',
      category: 'ai_data',
      targetRole: '공공보건의료 AI 연구원, 정책 입안자, 보건의료 빅데이터 분석관',
      roleBadge: 'AI 연구원 / 데이터 분석관',
      badge: '듀얼 AI & RAG 지침 질의',
      badgeColor: 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300 border-violet-300',
      icon: <Brain className="w-4 h-4 text-violet-600 dark:text-violet-400" />,
      targetWorkspace: 'ai_analysis',
      menuPath: '[AI 분석] (Cloud AI vs Local sLLM 듀얼 스튜디오 & RAG 지침 질의)',
      isImplemented: true,
      summary: 'Google Gemini Cloud AI와 원내 폐쇄망 로컬 sLLM 간 비교 검증 및 2026 보건복지부 법정 정책 지침 벡터 DB RAG 실시간 질의',
      keyChecks: [
        'Cloud 대규모 모델(Gemini) vs 원내 온프레미스 폐쇄망 sLLM(Ollama / vLLM) 간 듀얼 추론 비교',
        '환자 민감정보(PII) 유출 없는 안전한 온디바이스/폐쇄망 AI 의사결정 인프라 시연',
        '2026 보건복지부 필수의료 정책 지침서·시행계획 원문 RAG 벡터 데이터베이스 실시간 검색',
        '공공의료 정책 기획 특화 프롬프트 템플릿(시행계획 서술문, 예산산출 근거, 정량 KPI 지표 생성)',
      ],
      tip: '상단 [AI 분석] 메뉴로 이동하여 듀얼 AI 스튜디오에서 정책 질의를 실행하거나, 정책 지침 RAG 검색창에서 "분만취약지 지원 요건"을 검색해 보세요.',
    },
  ];

  // 카테고리 필터링된 시스템 목록
  const filteredSystems =
    selectedCategory === 'all'
      ? systemGuides
      : systemGuides.filter((s) => s.category === selectedCategory);

  const currentSystem =
    systemGuides.find((g) => g.key === activeSystemKey) || systemGuides[0];

  const handleGo = (workspace: 워크스페이스_타입, subFeature?: string) => {
    onNavigate(workspace, subFeature);
    onClose();
  };

  const categories: { id: 직무_카테고리; label: string; icon: string }[] = [
    { id: 'all', label: '전체 (8대 시스템)', icon: '🌐' },
    { id: 'policy', label: '지자체·정책관', icon: '🏛️' },
    { id: 'qi_medical', label: '진료·QI팀', icon: '🏥' },
    { id: 'care_network', label: '공공의료·돌봄', icon: '🤝' },
    { id: 'mgmt_disclosure', label: '경영·공시총괄', icon: '📋' },
    { id: 'ai_data', label: 'AI·데이터분석', icon: '🤖' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#15161b] rounded-3xl w-full max-w-4xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* 모달 상단 헤더 */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white flex items-start justify-between gap-4 shrink-0">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-blue-500/20 text-blue-300 border border-blue-400/30">
              <Compass className="w-3.5 h-3.5 text-blue-400" />
              <span>담당자별 맞춤 검토 가이드 &amp; 8대 시스템 매핑</span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
              <span>공공의료 의사결정 플랫폼 직무별·시스템별 집중 검토 가이드</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-300">
              지자체 정책관, 공공병원 진료/QI팀, 공공의료사업실, 기획재무팀, 공시담당자 등 검토 직무별 최우선 확인 메뉴와 조작 시나리오를 안내합니다.
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
            <span>담당자 직무:</span>
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
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 whitespace-nowrap cursor-pointer ${
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

        {/* 8대 시스템 그리드 탭 (2행 4열로 8개 시스템 전체가 한눈에 시원하게 표시됨) */}
        <div className="p-3 bg-slate-100/90 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {filteredSystems.map((sys) => {
              const isSelected = activeSystemKey === sys.key;
              return (
                <button
                  key={sys.key}
                  type="button"
                  onClick={() => setActiveSystemKey(sys.key)}
                  className={`p-2 sm:p-2.5 rounded-2xl text-left transition-all cursor-pointer border flex flex-col justify-between gap-1 relative ${
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
                    {sys.key === 'aa_disclosure' && (
                      <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0 animate-ping" />
                    )}
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

        {/* 선택된 시스템 상세 안내 카드 본문 */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* 1. 상단 요약 배너 */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${currentSystem.badgeColor}`}>
                  {currentSystem.badge}
                </span>
                <span className="font-black text-base sm:text-lg text-slate-900 dark:text-white">
                  {currentSystem.systemName}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  구현완료 ✓
                </span>
              </div>

              {/* 주요 검토 대상 담당자 (Role) 표시 */}
              <div className="flex items-center gap-1.5 text-xs text-indigo-700 dark:text-indigo-300 font-semibold bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-1 rounded-lg border border-indigo-200 dark:border-indigo-900/50 inline-flex">
                <UserCheck className="w-3.5 h-3.5 shrink-0 text-indigo-600 dark:text-indigo-400" />
                <span>주요 검토 대상 담당자:</span>
                <strong className="font-black text-indigo-900 dark:text-indigo-200">{currentSystem.targetRole}</strong>
              </div>

              {/* 프로토타입 해당 메뉴 경로 */}
              <div className="text-xs text-blue-600 dark:text-blue-400 font-bold flex items-center gap-1 pt-0.5">
                <span>프로토타입 해당 메뉴:</span>
                <strong className="underline underline-offset-2">{currentSystem.menuPath}</strong>
              </div>
            </div>

            {/* 바로가기 버튼 그룹 */}
            <div className="flex items-center gap-2 shrink-0 flex-wrap lg:flex-col lg:items-end">
              <button
                onClick={() => handleGo(currentSystem.targetWorkspace, currentSystem.subFeature)}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-md flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer whitespace-nowrap"
              >
                <span>해당 메뉴로 즉시 이동</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* 보조 이동 버튼 (예: 정책기획, CP변이, 데이터센터 등) */}
              {currentSystem.secondaryWorkspace && (
                <button
                  onClick={() => handleGo(currentSystem.secondaryWorkspace!, currentSystem.secondarySubFeature)}
                  className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-[11px] font-bold flex items-center justify-center gap-1 transition cursor-pointer whitespace-nowrap"
                >
                  <span>{currentSystem.secondaryLabel || '연계 화면 이동'}</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              )}
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
            ※ 공공의료 의사결정 플랫폼 8대 핵심 시스템 및 담당자 직무별 최우선 검증 가이드입니다.
          </span>
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              닫기
            </button>
            <button
              onClick={() => handleGo(currentSystem.targetWorkspace, currentSystem.subFeature)}
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
