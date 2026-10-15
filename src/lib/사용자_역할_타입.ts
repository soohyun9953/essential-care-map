export type 사용자_역할_타입 = 'all' | 'citizen' | 'hospital' | 'nmc';

export interface 사용자_역할_정보 {
  id: 사용자_역할_타입;
  label: string;
  shortLabel: string;
  icon: string;
  badge: string;
  badgeColor: string;
  primaryWorkspace: 'national_safety' | 'hospital_ai_diagnosis' | 'regional_diagnosis' | 'home';
  title: string;
  subtitle: string;
  features: string[];
  recommendedTabs: string[];
}

export const 사용자_역할_목록: 사용자_역할_정보[] = [
  {
    id: 'citizen',
    label: '국민 (일반시민·환자)',
    shortLabel: '국민',
    icon: '👨‍👩‍👧',
    badge: '국민 전용 · 로그인 불필요',
    badgeColor: 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    primaryWorkspace: 'national_safety',
    title: '국민 안심의료 서비스',
    subtitle: '내 주변 가장 가까운 응급실·분만병원·소아과 실시간 가용병상 & AI 비서',
    features: [
      '🚨 내 주변 응급실·분만병원·소아과 실시간 잔여 병상 (E-Gen 연계)',
      '🌙 야간 소아 진료(달빛어린이병원 114개소) 및 야간 휴일 약국',
      '📞 119 즉시 전화연결 및 지도 길찾기, 국민안심 AI 증상 질의응답',
    ],
    recommendedTabs: ['national_safety', 'home'],
  },
  {
    id: 'hospital',
    label: '의료기관 담당자 (공공병원)',
    shortLabel: '의료기관 담당자',
    icon: '🏥',
    badge: '공공병원 업무 · 214개소',
    badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    primaryWorkspace: 'hospital_ai_diagnosis',
    title: '공공병원 AI 종합진단 & 자원관리',
    subtitle: '41개 거점공공병원 AI 종합진단, 환자 이용 유출입 분석 및 12대 항목 법정 사업계획서 수립',
    features: [
      '🩺 41개 거점공공병원 AI 종합점수 진단, 원인분석 및 5종 진단보고서 자동 작성',
      '🔄 시군구·중진료권 환자 이용 유출입(OD) 분석 & AI 정책기획·미래수요',
      '📝 복지부 12대 항목 법정 사업계획서(HWPX) 원클릭 자동 생성',
    ],
    recommendedTabs: ['hospital_ai_diagnosis', 'medical_institution', 'policy_planning', 'regional_diagnosis'],
  },
  {
    id: 'nmc',
    label: 'NMC 업무 담당자 (중앙·지원단)',
    shortLabel: 'NMC 업무 담당자',
    icon: '🏛️',
    badge: '중앙 총괄 관제 · 경영·공시',
    badgeColor: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/70 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
    primaryWorkspace: 'regional_diagnosis',
    title: '전국 헬스맵 & 공공병원 경영·공시 관제',
    subtitle: '전국 250개 시군구 필수의료 취약도 거시 관제, 공공병원 경영위기 조기경보 및 알리미 공시 사전검증',
    features: [
      '🗺️ 전국 250개 시군구 35:65 GIS 취약지 판정 및 필수의료 골든타임 관제',
      '🚨 35개 지방의료원 경영위기 조기경보 및 알리미 공시 14대 산출식 사전검증',
      '⚖️ 17개 시도·8개 부처 공공보건의료 시행계획·추진실적 AI 평가 (100점 만점)',
    ],
    recommendedTabs: ['regional_diagnosis', 'medical_institution', 'policy_planning', 'ai_analysis', 'home'],
  },
];
