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
  const [activeRoleKey, setActiveRoleKey] = useState<string>('disclosure'); // 기본 선택: 최근 고도화된 공시 담당자

  if (!isOpen) return null;

  // 5대 담당자별 역할 정의 및 매핑
  const roleGuides = [
    {
      key: 'disclosure',
      title: '공공병원 알리미 공시 담당자',
      badge: '통합공시 실무자 (NEW)',
      badgeColor: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border-rose-300',
      icon: <Building2 className="w-5 h-5 text-rose-600 dark:text-rose-400" />,
      targetWorkspace: 'medical_institution' as 워크스페이스_타입,
      subFeature: 'aa_disclosure',
      menuPath: '의료기관 ➔ [📋 41개 공공병원 알리미 공시검증]',
      summary: '국립중앙의료원 2026.6 실증 보고서 기반 41개 병원 오류 검증 및 14대 산식·PII 비식별화 도구',
      keyChecks: [
        '41개 병원별 품질등급(우수/양호/보통/중점관리) 랭킹 및 오류의심 216건 현황',
        '14대 법정 회계산출식 및 이상치(수정 z-score, 전년대비 ±15% 변동) 실시간 시뮬레이터',
        '영월의료원 실증 사례(전문의 1명 불일치 및 인건비 급변동) 자동 감지 체험',
        '수시공시 첨부문서 환자 개인정보(주민번호, 병록번호, 성명) 실시간 비식별화 마스킹',
        '국립중앙의료원 6단계 수정공시 공식 소명사유서 원클릭 자동 생성 기능',
      ],
      tip: '14대 회계산출식 탭에서 "영월의료원" 또는 "오류다발" 프리셋을 눌러 실시간 판정을 확인해 보세요.',
    },
    {
      key: 'policy',
      title: '보건복지부 / 지자체 공공의료 정책관',
      badge: '중앙·시도 정책기획관',
      badgeColor: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-blue-300',
      icon: <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
      targetWorkspace: 'regional_diagnosis' as 워크스페이스_타입,
      subFeature: 'policy_ai',
      menuPath: '① 지역진단 (35:65 지도) & ② 정책기획 (AI 사업계획서)',
      summary: '전국 250개 시군구 필수의료 취약도 진단과 AI 기반 8대 표준 사업계획서 1초 자동생성',
      keyChecks: [
        '250개 시군구 GIS 35:65 분할 지도 및 7대 필수의료 Layer(응급·분만·소아·공공의료원)',
        '관내 중증 응급환자 타 지역 유출률 및 골든타임 취약지 분석',
        'AI 정책 옵션(Option A/B/C: 보조금 지원 vs 시설확충 vs 인력보강) 비교 분석',
        '지자체 맞춤형 8대 표준 정부공식 사업계획서(예산, 인력, KPI) 원클릭 생성 및 다운로드',
        '1:1 지자체 간 의료자원 정밀 비교 및 2030 진료권 수요추계',
      ],
      tip: '지도에서 "강원 영월군" 또는 "전북 진안군"을 클릭하여 사업계획서를 직접 생성해 보세요.',
    },
    {
      key: 'hospital_exec',
      title: '지방의료원 / 적십자병원장 및 경영진',
      badge: '공공병원 경영진',
      badgeColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300',
      icon: <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
      targetWorkspace: 'medical_institution' as 워크스페이스_타입,
      subFeature: 'hospital_crisis',
      menuPath: '의료기관 ➔ [🚨 경영위기 조기경보 & 신포괄 정산]',
      summary: '214개 공공병원 통합 재무분석, 경영위기 조기경보 지수 및 신포괄수가 정책가산 시뮬레이션',
      keyChecks: [
        '전국 지방의료원 35개소 결산 재무비율 및 4단계 경영위기 등급 관제',
        '신포괄수가 정책가산율(5%~15%) 달성을 위한 6대 공공성 평가지표 시뮬레이터',
        '의사·간호사 인력 결원율 추이 및 의사 1인당 진료실적 분석',
        'NMC 표준 3종 엑셀 서식(크로스탭 원본 데이터셋) 원클릭 다운로드',
      ],
      tip: '경영위기 탭에서 신포괄수가 가산율을 조정하여 연간 추가 재정지원액을 산출해 보세요.',
    },
    {
      key: 'clinical_quality',
      title: '적정진료실장 / 간호부장 / 질향상(QI)팀장',
      badge: '임상 질관리 및 진료지원',
      badgeColor: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border-purple-300',
      icon: <HeartPulse className="w-5 h-5 text-purple-600 dark:text-purple-400" />,
      targetWorkspace: 'medical_institution' as 워크스페이스_타입,
      subFeature: 'cp_library',
      menuPath: '의료기관 ➔ [📋 표준 임상경로 CP] & [🏠 퇴원환자 지역연계]',
      summary: '국립중앙의료원 71개 표준 CP 라이브러리 및 재원일수 변이 ROI 분석, 복지부 4단계 퇴원돌봄',
      keyChecks: [
        '국립중앙의료원(NMC) 공인 71개 진료과목별 표준 CP(Clinical Pathway) 검색 및 적용',
        'CP 변이(Variance) 모니터링: 평균 재원일수 단축 및 진료비 절감 ROI 산출',
        '보건복지부 공공병원 퇴원환자 지역사회 연계사업(환자평가표 ➔ 돌봄계획 ➔ 복지관 연계)',
        '공공병원 간호간병통합서비스 및 야간전담 간호사 확보 현황 대조',
      ],
      tip: '표준 CP 탭에서 "담낭절제술" 또는 "슬관절치환술"의 표준재원일수와 지침을 확인해 보세요.',
    },
    {
      key: 'it_ai',
      title: '전산정보팀장 / AI·데이터 분석 담당자',
      badge: 'IT·AI 인프라 총괄',
      badgeColor: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300 border-cyan-300',
      icon: <Cpu className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />,
      targetWorkspace: 'ai_analysis' as 워크스페이스_타입,
      subFeature: 'dual_ai',
      menuPath: '④ AI 분석 ➔ [듀얼 AI 스튜디오 & RAG 지침 질의]',
      summary: '망분리 온프레미스 Local sLLM vs Cloud Gemini 하이브리드 운영 및 공공보건 지침 RAG',
      keyChecks: [
        '보안 망분리 병원 환경을 위한 로컬 오픈소스 LLM(Qwen 2.5 3B, EXAONE 3.5, Llama 3.2) 구동',
        '클라우드 대규모 Gemini 2.5 Flash와의 정확도·응답속도·추론품질 실시간 1:1 비교',
        '보건복지부 345쪽 공공보건의료 지침서 전문 임베딩 RAG 시맨틱 검색',
        '원문 대조 신뢰뷰(Grounding View): AI 답변의 법령 및 지침서 페이지 출처 확인',
        '하드코딩 보안 로그인(nmc2026*)을 통한 인가자 전용 통제 시스템',
      ],
      tip: 'AI 분석 탭에서 "지방의료원 설립 요건"을 검색하여 지침서 원문 인용을 확인해 보세요.',
    },
  ];

  const currentGuide = roleGuides.find((g) => g.key === activeRoleKey) || roleGuides[0];

  const handleGo = () => {
    onNavigate(currentGuide.targetWorkspace, currentGuide.subFeature);
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
              <span>고객 검토 가이드 &amp; 메뉴 내비게이션</span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
              <span>시스템 담당자별 집중 검토 가이드</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-300">
              검토하시는 분의 직무와 역할에 맞춰 가장 최우선으로 확인해야 할 핵심 화면과 검증 포인트를 안내합니다.
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

        {/* 5대 담당자 탭 버튼 리스트 */}
        <div className="flex items-center gap-1.5 p-2 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 overflow-x-auto shrink-0">
          {roleGuides.map((role) => (
            <button
              key={role.key}
              onClick={() => setActiveRoleKey(role.key)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer shrink-0 ${
                activeRoleKey === role.key
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {role.icon}
              <span>{role.title.split('/')[0]}</span>
              {role.badge.includes('NEW') && (
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              )}
            </button>
          ))}
        </div>

        {/* 선택된 담당자 상세 안내 카드 본문 */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* 상단 요약 배너 */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${currentGuide.badgeColor}`}>
                  {currentGuide.badge}
                </span>
                <span className="font-bold text-sm text-slate-900 dark:text-white">
                  {currentGuide.title}
                </span>
              </div>
              <div className="text-xs text-blue-600 dark:text-blue-400 font-bold flex items-center gap-1">
                <span>추천 확인 경로:</span>
                <strong className="underline underline-offset-2">{currentGuide.menuPath}</strong>
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
            {currentGuide.summary}
          </p>

          {/* 핵심 검토 포인트 체크리스트 */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>집중 검토 포인트 (Checklist)</span>
            </h4>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
              {currentGuide.keyChecks.map((check, idx) => (
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
              <strong className="font-bold">시연 및 검토 팁: </strong>
              <span>{currentGuide.tip}</span>
            </div>
          </div>
        </div>

        {/* 모달 하단 푸터 */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            ※ 피드백 및 기능 보완 의견은 NMC 국립중앙의료원 공공의료 AI ISP 추진단에 전달됩니다.
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
              <span>{currentGuide.title.split('/')[0]} 메뉴 보기</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
