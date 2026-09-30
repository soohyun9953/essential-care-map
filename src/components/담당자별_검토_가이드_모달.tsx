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
} from 'lucide-react';
import { 워크스페이스_타입 } from './글로벌_공공_헤더';

interface 담당자별_검토_가이드_모달_속성 {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (workspace: 워크스페이스_타입, subFeature?: string) => void;
}

export const 담당자별_검토_가이드_모달: React.FC<담당자별_검토_가이드_모달_속성> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  // 기본 선택 시스템: 공공병원 알리미
  const [activeSystemKey, setActiveSystemKey] = useState<string>('aa_disclosure');

  if (!isOpen) return null;

  // 고객이 요청한 7대 시스템 분류 체계
  const systemGuides = [
    {
      key: 'health_map',
      systemName: '1. 헬스맵',
      badge: '필수의료 GIS & 정책',
      badgeColor: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-blue-300',
      icon: <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
      targetWorkspace: 'regional_diagnosis' as 워크스페이스_타입,
      subFeature: 'policy_ai',
      menuPath: '① [지역진단] (35:65 GIS 지도) & ② [정책기획] (AI 사업계획서)',
      isImplemented: true,
      summary: '전국 250개 시군구 필수의료 취약도 지도 및 환자 유출입 분석, AI 기반 지자체 표준 사업계획서 1초 자동생성',
      keyChecks: [
        '250개 시군구 GIS 35:65 분할 지도 및 7대 필수의료 Layer(응급·분만·소아·공공의료원)',
        '관내 중증 응급환자 타 지역 유출률 및 골든타임(골든아워) 취약지 분석',
        'AI 정책 대안(Option A/B/C: 보조금 지원 vs 시설확충 vs 인력보강) 시뮬레이션',
        '지자체 맞춤형 8대 표준 정부공식 사업계획서(예산, 인력, KPI) 원클릭 생성 및 다운로드',
        '1:1 지자체 간 의료자원 정밀 비교 및 2030 진료권 수요추계',
      ],
      tip: '지도에서 "강원 영월군" 또는 "전북 진안군"을 클릭하여 사업계획서를 직접 생성해 보세요.',
    },
    {
      key: 'cp_monitoring',
      systemName: '2. CP 모니터링',
      badge: '표준 임상경로 & 질관리',
      badgeColor: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border-purple-300',
      icon: <HeartPulse className="w-4 h-4 text-purple-600 dark:text-purple-400" />,
      targetWorkspace: 'medical_institution' as 워크스페이스_타입,
      subFeature: 'cp_library',
      menuPath: '③ [의료기관] ➔ [📋 표준 임상경로 CP] & [📈 CP 변이분석 & ROI]',
      isImplemented: true,
      summary: '국립중앙의료원 71개 표준 CP 라이브러리 및 재원일수 변이(Variance) ROI 모니터링',
      keyChecks: [
        '국립중앙의료원(NMC) 공인 71개 진료과목별 표준 CP(Clinical Pathway) 검색 및 적용 지침',
        'CP 변이(Variance) 모니터링: 표준재원일수 대비 초과일수 및 원인 분석',
        '진료비 절감 및 병상회전율 향상에 따른 연간 재정적 ROI 산출',
        '임상 질 향상(QI) 및 적정진료 유도 효과 분석',
      ],
      tip: '표준 CP 탭에서 "담낭절제술" 또는 "슬관절치환술"의 표준재원일수와 지침을 확인해 보세요.',
    },
    {
      key: 'resource_mgmt',
      systemName: '3. 공공병원 자원관리',
      badge: '병상·인력·장비 인프라',
      badgeColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300',
      icon: <LayoutGrid className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
      targetWorkspace: 'medical_institution' as 워크스페이스_타입,
      subFeature: 'hospitals',
      menuPath: '③ [의료기관] ➔ [🏥 공공병원 통합현황 & 기관 데이터센터]',
      isImplemented: true,
      summary: '전국 214개 공공병원(지방의료원 35, 적십자 6, 국립대병원 등) 통합 자원 데이터센터',
      keyChecks: [
        '214개 공공병원 허가/가동 병상수(일반/중환자실/음압격리) 실시간 데이터 연동',
        '필수의료 진료과목별 전문의·전공의·공보의 및 간호사 정원/현원 인력 통계',
        '의사 1인당 연간 외래·입원 진료환자수 및 인력 결원율 분석',
        'NMC 표준 3종 엑셀 서식(크로스탭 원본 데이터셋) 일괄 다운로드',
      ],
      tip: '검색창에서 "공주의료원" 또는 "포항의료원"을 입력하여 상세 인력·병상 현황을 조회해 보세요.',
    },
    {
      key: 'hospital_portal',
      systemName: '4. 공공병원 포털',
      badge: '대국민 서비스 포털',
      badgeColor: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300 border-cyan-300',
      icon: <Search className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />,
      targetWorkspace: 'national_safety' as 워크스페이스_타입,
      subFeature: 'citizen_view',
      menuPath: '⑤ [국민안심] (대국민 5대 안심의료 포털) & [홈] (통합 메인)',
      isImplemented: true,
      summary: '대국민 모바일 최적화 실시간 안심의료 검색, 응급실 가용병상, 24시 달빛어린이병원 안내',
      keyChecks: [
        '모바일-First 5대 안심의료(응급의료, 분만병원, 달빛어린이병원, 필수의료 병원) 위치 기반 검색',
        '전국 응급실/중환자실/수술실 실시간 가용병상 및 소아과 전문의 야간 진료 현황',
        '원클릭 119/병원 직통 전화연결 및 실시간 카카오/네이버 길찾기 연계',
        '※ (안내) 공공병원 내부 임직원 전용 업무포털(그룹웨어/전자결재)은 연계 시스템으로 분류됨',
      ],
      tip: '우측 상단 [국민안심] 탭을 눌러 모바일 뷰에서 야간 응급의료 및 달빛어린이병원을 조회해 보세요.',
    },
    {
      key: 'care_network',
      systemName: '5. 공공병원 연계망',
      badge: '퇴원환자 지역사회 돌봄',
      badgeColor: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-300',
      icon: <Network className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />,
      targetWorkspace: 'medical_institution' as 워크스페이스_타입,
      subFeature: 'discharge_care',
      menuPath: '③ [의료기관] ➔ [🏠 퇴원환자 지역사회 연계망]',
      isImplemented: true,
      summary: '보건복지부 공공병원 퇴원환자 지역사회 연계사업(환자평가표 ➔ 돌봄계획 ➔ 복지관 원클릭 연계)',
      keyChecks: [
        '복지부 표준 4단계 퇴원지원 프로세스(스크리닝 ➔ 심층평가 ➔ 계획수립 ➔ 지역연계)',
        '표준 환자평가표(ADL 일상생활동작, 낙상·욕창 위험도, 사회복지 요구도) 전산 입력',
        '지역 보건소 방문건강관리, 재가장기요양기관, 종합사회복지관 원클릭 연계 의뢰서 발행',
        '퇴원 후 30일/90일 재입원율 감소 효과 모니터링',
      ],
      tip: '퇴원돌봄 탭에서 "가상 환자 평가표"를 작성하고 지역사회 복지관 연계 의뢰서를 확인해 보세요.',
    },
    {
      key: 'mgmt_monitoring',
      systemName: '6. 경영정보모니터링',
      badge: '재무위기 조기경보 & 신포괄',
      badgeColor: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-amber-300',
      icon: <TrendingUp className="w-4 h-4 text-amber-600 dark:text-amber-400" />,
      targetWorkspace: 'medical_institution' as 워크스페이스_타입,
      subFeature: 'hospital_crisis',
      menuPath: '③ [의료기관] ➔ [🚨 경영위기 조기경보 & 신포괄 정산]',
      isImplemented: true,
      summary: '전국 35개 지방의료원 결산 재무비율, 경영위기 4단계 조기경보 및 신포괄 정책가산 시뮬레이터',
      keyChecks: [
        '전국 지방의료원 35개소 결산서 기반 부채비율, 의업수지비율, 차입금의존도 3대 지표 관제',
        '4단계 경영위기(정상, 주의, 경계, 심각) 자동 판정 및 모니터링',
        '신포괄수가제 정책가산율(5%~15%) 달성을 위한 6대 공공성 평가지표 시뮬레이션',
        '정책가산 달성에 따른 연간 추가 건강보험 재정 지원금 자동 산출',
      ],
      tip: '경영위기 탭에서 신포괄 정책가산율 슬라이더를 조정하여 연간 추가 지원금을 산출해 보세요.',
    },
    {
      key: 'aa_disclosure',
      systemName: '7. 공공병원 알리미',
      badge: '통합공시 품질검증 (NEW)',
      badgeColor: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border-rose-300',
      icon: <Building2 className="w-4 h-4 text-rose-600 dark:text-rose-400" />,
      targetWorkspace: 'medical_institution' as 워크스페이스_타입,
      subFeature: 'aa_disclosure',
      menuPath: '③ [의료기관] ➔ [📋 41개 공공병원 알리미 공시검증] (과제 3.8)',
      isImplemented: true,
      summary: '국립중앙의료원 2026.6 실증 보고서 기반 41개 공공병원 오류검증, 14대 회계산식 & PII 비식별화 도구',
      keyChecks: [
        '41개 병원별 품질등급(우수/양호/보통/중점관리) 랭킹 및 216건 오류의심(결산서 불일치, 0원 등록 등)',
        '14대 법정 회계산출식 및 이상치(수정 z-score, 전년대비 ±15% 변동) 실시간 사전검증 시뮬레이터',
        '영월의료원 2026 실제 검증 사례(전문의 1명 오차 & 인건비 급변동) 자동 감지 체험',
        '수시공시 첨부문서 환자 개인정보(주민번호, 병록번호, 성명, 연락처, 주소) 실시간 비식별화 마스킹',
        '국립중앙의료원 6단계 수정공시 공식 소명사유서 원클릭 자동 생성기',
      ],
      tip: '14대 회계산식 탭에서 "영월의료원" 또는 "오류다발" 프리셋을 눌러 실시간 판정을 확인해 보세요.',
    },
  ];

  const currentSystem = systemGuides.find((g) => g.key === activeSystemKey) || systemGuides[6];

  const handleGo = () => {
    onNavigate(currentSystem.targetWorkspace, currentSystem.subFeature);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#15161b] rounded-3xl w-full max-w-4xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* 모달 상단 헤더 */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white flex items-start justify-between gap-4 shrink-0">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-blue-500/20 text-blue-300 border border-blue-400/30">
              <Compass className="w-3.5 h-3.5 text-blue-400" />
              <span>고객 검토 가이드 &amp; 7대 시스템 매핑</span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
              <span>7대 공공의료 시스템별 프로토타입 집중 검토 가이드</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-300">
              헬스맵, CP 모니터링, 공공병원 자원관리, 포털, 연계망, 경영정보, 알리미 등 7대 시스템별 해당 메뉴와 검증 포인트를 안내합니다.
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

        {/* 7대 시스템 탭 버튼 리스트 */}
        <div className="flex items-center gap-1.5 p-2 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 overflow-x-auto shrink-0">
          {systemGuides.map((sys) => (
            <button
              key={sys.key}
              onClick={() => setActiveSystemKey(sys.key)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer shrink-0 ${
                activeSystemKey === sys.key
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs ring-1 ring-blue-500/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {sys.icon}
              <span>{sys.systemName}</span>
              {sys.key === 'aa_disclosure' && (
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              )}
            </button>
          ))}
        </div>

        {/* 선택된 시스템 상세 안내 카드 본문 */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* 상단 요약 배너 */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${currentSystem.badgeColor}`}>
                  {currentSystem.badge}
                </span>
                <span className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                  {currentSystem.systemName}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  구현완료 ✓
                </span>
              </div>
              <div className="text-xs text-blue-600 dark:text-blue-400 font-bold flex items-center gap-1">
                <span>프로토타입 해당 메뉴:</span>
                <strong className="underline underline-offset-2">{currentSystem.menuPath}</strong>
              </div>
            </div>

            <button
              onClick={handleGo}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-md flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer shrink-0"
            >
              <span>해당 메뉴로 즉시 이동</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
            {currentSystem.summary}
          </p>

          {/* 핵심 검토 포인트 체크리스트 */}
          <div className="space-y-2.5">
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

          {/* 팁 안내 */}
          <div className="p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40 flex items-start gap-2.5 text-xs text-blue-900 dark:text-blue-300">
            <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold">시연 및 검증 추천 시나리오: </strong>
              <span>{currentSystem.tip}</span>
            </div>
          </div>
        </div>

        {/* 모달 하단 푸터 */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            ※ 7대 시스템 분류 기준에 따라 원하시는 메뉴를 즉시 검토하실 수 있습니다.
          </span>
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              닫기
            </button>
            <button
              onClick={handleGo}
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
