'use client';

// Essential Care Map - 정책기획 통합 워크스페이스
// AI 기반 공공의료 정책 의사결정 To-Be 모델 핵심 Workspace
// Journey: 지역진단 → 지역비교 → 미래수요 → AI 정책기획 → 사업계획서
// 1) 「정책분석 5단계」 인라인 진행 애니메이션
// 2) 3열 Workspace (정책분석 5단계 / AI 종합분석 / 분석 근거)
// ※ 명칭 규칙: 「정책분석 5단계」 = 이 화면의 인라인 분석, 「AI 처리 8단계」 = AI 분석 패널(시연 팝업)
// 3) AI 정책대안 3개 (판단 근거 / 상세 분석 / 사업계획 만들기)
// 4) 12대 항목 사업계획서 자동 작성 애니메이션 & AI vs 담당자 역할 구분
// 5) AI 활용 7대 데이터 및 기술구조 보기 연동

import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import {
  Sparkles,
  FileText,
  GitCompare,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ChevronRight,
  Download,
  Copy,
  Sliders,
  ShieldCheck,
  Building2,
  Database,
  Calendar,
  DollarSign,
  Target,
  Edit3,
  Users,
  Cpu,
  HelpCircle,
  BarChart3,
  BookOpen,
  Search,
  Activity,
  Layers,
  Check,
  Loader2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Info,
  RefreshCw,
  Play,
  UserCheck,
  Shield,
  Brain,
} from 'lucide-react';

import { 필수의료_진단_결과, 지역_평균_통계 } from '@/lib/필수의료_타입';
import { format_number_comma } from '@/lib/유틸리티';
import { 일대일_비교_대시보드 } from './일대일_비교_대시보드';
import { 의료수요_추계_차트 } from './의료수요_추계_차트';
import { 지역_의료자원_집계 } from '@/lib/지역_의료자원_집계';
import { ISP_과제_뱃지 } from './ISP_과제_뱃지';
import { AsIs_비교_배너 } from './AsIs_비교_배너';

// 모달 컴포넌트들
import { AI_활용_데이터_모달 } from './ai/AI_활용_데이터_모달';
import { AI_판단_근거_모달, 정책_근거_생성 } from './ai/AI_판단_근거_모달';
import { AI_기술구조_모달 } from './ai/AI_기술구조_모달';
import { AI_분석_패널 } from './ai/AI_분석_패널';

// 대용량 지연 로딩 컴포넌트
const 의료지표_비교차트 = dynamic(
  () => import('./의료지표_비교차트').then((m) => m.의료지표_비교차트),
  { loading: () => <div className="py-16 text-center text-sm text-[#86868b]">데이터를 불러오는 중입니다...</div> }
);
const 사업계획서_서술문_생성기 = dynamic(
  () => import('./사업계획서_서술문_생성기').then((m) => m.사업계획서_서술문_생성기),
  { loading: () => <div className="py-16 text-center text-sm text-[#86868b]">데이터를 불러오는 중입니다...</div> }
);

interface 정책기획_통합_워크스페이스_속성 {
  selected_region: 필수의료_진단_결과 | null;
  diagnosed_list: 필수의료_진단_결과[];
  sido_stat: 지역_평균_통계;
  national_stat: 지역_평균_통계;
  google_api_key?: string;
  initial_tab?: 'policy_ai' | 'report' | 'compare' | 'forecast';
  on_change_tab?: (tab: 'policy_ai' | 'report' | 'compare' | 'forecast') => void;
}

// 「정책분석 5단계」 정의
interface AI_분석_스텝 {
  step: number;
  이름: string;
  설명: string;
  핵심지표: string;
}

const AI_5단계_프로세스: AI_분석_스텝[] = [
  { step: 1, 이름: '지역 현황 분석', 설명: '인구구조, 의료자원, 취약지표 취합 및 1차 스크리닝', 핵심지표: '선택 지역의 헬스맵 2024 진단값' },
  { step: 2, 유사지역_분석: true, 이름: '유사 지역 비교', 설명: '전국 유사 군단위 코호트 매칭 및 격차 Gap 분석', 핵심지표: '인구 규모가 비슷한 시군구 평균과 비교' } as any,
  { step: 3, 이름: '미래 의료수요 분석', 설명: '2030 장래인구 추계 및 급성기 심뇌혈관 입원수요 예측', 핵심지표: '수요추계 탭의 추정 모델 참고 (실측 아님)' },
  { step: 4, 이름: '정책·사업 자료 분석', 설명: '보건복지부 취약지 고시 및 우수 시행계획 RAG 벡터 검색', 핵심지표: '지침 코퍼스 검색 (검증상태 표기)' },
  { step: 5, 이름: 'AI 종합 정책대안 생성', 설명: '다중 에이전트 인과추론 및 최적 실행 시나리오 도출', 핵심지표: '대안 유형 3가지 제시 (예산·효과는 직접 산정)' },
];

export const 정책기획_통합_워크스페이스: React.FC<정책기획_통합_워크스페이스_속성> = ({
  selected_region,
  diagnosed_list,
  sido_stat,
  national_stat,
  google_api_key,
  initial_tab = 'policy_ai',
  on_change_tab,
}) => {
  const [active_tab, setActive_tab] = useState<'policy_ai' | 'report' | 'compare' | 'forecast'>(initial_tab);

  useEffect(() => {
    setActive_tab(initial_tab);
  }, [initial_tab]);

  const handle_tab_change = (tab: 'policy_ai' | 'report' | 'compare' | 'forecast') => {
    setActive_tab(tab);
    if (on_change_tab) on_change_tab(tab);
  };

  // ==============================================================
  // 1. AI 분석 실행 애니메이션 상태 관리 (사용자 요구사항 2번)
  // ==============================================================
  const [is_ai_analyzing, setIs_ai_analyzing] = useState(false);
  const [ai_current_step, setAi_current_step] = useState<number>(5); // 기본값: 5 (이미 분석 완료 상태로 바로 열람 가능)
  const [ai_analysis_completed, setAi_analysis_completed] = useState<boolean>(true);
  const animation_timer_ref = useRef<NodeJS.Timeout | null>(null);

  // 「정책분석 5단계」 실행 핸들러
  const handle_run_ai_analysis = () => {
    setIs_ai_analyzing(true);
    setAi_analysis_completed(false);
    setAi_current_step(1);

    if (animation_timer_ref.current) clearTimeout(animation_timer_ref.current);

    let step = 1;
    const run_next_step = () => {
      animation_timer_ref.current = setTimeout(() => {
        step += 1;
        if (step <= 5) {
          setAi_current_step(step);
          run_next_step();
        } else {
          setAi_analysis_completed(true);
          setIs_ai_analyzing(false);
        }
      }, 700); // 각 단계당 0.7초
    };

    run_next_step();
  };

  // 즉시 완료 건너뛰기
  const handle_skip_ai_analysis = () => {
    if (animation_timer_ref.current) clearTimeout(animation_timer_ref.current);
    setAi_current_step(5);
    setAi_analysis_completed(true);
    setIs_ai_analyzing(false);
  };

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (animation_timer_ref.current) clearTimeout(animation_timer_ref.current);
    };
  }, []);

  // ==============================================================
  // 2. 모달 상태 (활용 데이터 / 판단 근거 / 기술구조 / 상세 분석 / AI 처리 8단계)
  // ==============================================================
  const [is_utilized_data_open, setIs_utilized_data_open] = useState(false);
  const [is_reasoning_modal_open, setIs_reasoning_modal_open] = useState(false);
  const [reasoning_target_option, setReasoning_target_option] = useState<'A' | 'B' | 'C'>('A');
  const [is_architecture_modal_open, setIs_architecture_modal_open] = useState(false);
  const [is_ai_pipeline_open, setIs_ai_pipeline_open] = useState(false); // 「AI 처리 8단계」 시연 팝업
  const [active_detail_section, setActive_detail_section] = useState<string | null>(null);

  // 선택된 정책대안 (Option A / Option B / Option C)
  const [selected_option, setSelected_option] = useState<'A' | 'B' | 'C'>('A');

  // ==============================================================
  // 3. 사업계획서 12대 항목 및 자동작성 애니메이션 (사용자 요구사항 7번)
  // ==============================================================
  const region_name = selected_region ? `${selected_region.시도명} ${selected_region.시군구명}` : '(지역 선택 필요)';
  const region_short = selected_region ? selected_region.시군구명 : '○○군';
  const R = selected_region;

  // Option별 특화 사업계획 내용 생성 함수
  const get_proposal_by_option = useCallback(
    (option_id: 'A' | 'B' | 'C') => {
      if (option_id === 'A') {
        return {
          사업명: `2026년 ${region_short} 응급의료 인프라 및 골든타임 강화 사업`,
          추진배경: R
            ? `권역응급 60분 미도달 ${R.응급_60분_미도달_인구비율}%, 응급 관내이용률(RI) ${R.관내_응급_의료이용률}% (헬스맵 2024)`
            : '지역을 선택하면 진단 수치가 채워집니다',
          현황및문제점: R ? `응급 판정: ${R.응급_판정근거}` : '-',
          사업목표: '중증응급환자 관내 이용률(RI) ○○% 달성 (목표 직접 설정)',
          추진전략: '1. 관내 응급의료기관 시설·장비 보강, 2. 응급의학과 당직 체계 확보, 3. 권역센터 원격협진망',
          세부사업: '1) 응급실 중환자 모니터링 시스템 구축, 2) 심뇌혈관 전문의 핫라인, 3) 119 구급대 직접 이송 프로토콜',
          추진체계: `${region_short} 보건소 - 관내 공공병원 - 권역응급의료센터 협력 체계 (기관명 직접 기재)`,
          추진일정: '(공모 지침에 따라 기재)',
          예산: '직접 입력 필요 (국비·지방비 분담 비율은 해당 연도 공모 지침 확인)',
          성과지표: '권역응급 60분 미도달률 ○○%p 감축, 관내 응급이용률(RI) ○○% (목표 직접 설정)',
          기대효과: '직접 입력 필요 (플랫폼에 산출 근거 없음)',
          사후관리: '매월 응급환자 이송 골든타임 통계 모니터링 및 권역센터 협진 질관리',
        };
      } else if (option_id === 'B') {
        return {
          사업명: `2026년 ${region_short} 인근 3차 권역 연계 Fast-Track 광역 전원 핫라인 구축 사업`,
          추진배경: '자체 고난도 진료 유지가 어려운 경우 인근 상급종합병원과의 신속 전원 연계 검토',
          현황및문제점: R
            ? `권역응급 60분 미도달 ${R.응급_60분_미도달_인구비율}% (헬스맵 2024). 전원 소요시간·헬기 인계점 현황은 직접 기재`
            : '-',
          사업목표: '상급병원 전원 소요시간 ○○분 단축 (목표 직접 설정)',
          추진전략: '1. 상급종합병원 직통 핫라인 개설, 2. 닥터헬기 인계점 확대, 3. 초동처치 보건지소 네트워크',
          세부사업: '1) 스마트 구급차 원격 심전도 전송, 2) 닥터헬기 인계점 보강 (개소 직접 기재), 3) 회송 재활망 구축',
          추진체계: '지자체 - 소방본부 - 권역응급의료센터 - 지역병원 협약',
          추진일정: '(공모 지침에 따라 기재)',
          예산: '직접 입력 필요 (국비·지방비 분담 비율은 해당 연도 공모 지침 확인)',
          성과지표: '전원 소요시간 ○○분 단축 (목표 직접 설정)',
          기대효과: '직접 입력 필요 (플랫폼에 산출 근거 없음)',
          사후관리: '분기별 전원 환자 추적조사 및 핫라인 연결 가동률 분기별 점검',
        };
      } else {
        return {
          사업명: `2026년 ${region_short} 분만 취약지 해소 및 소아 야간진료 모자안심망 구축 사업`,
          추진배경: R
            ? `분만 60분 미도달 ${R.분만_60분_미도달_인구비율}%, 분만 관내이용률 ${R.관내_분만율}% (헬스맵 2024)`
            : '지역을 선택하면 진단 수치가 채워집니다',
          현황및문제점: R
            ? `분만 판정: ${R.분만_판정근거}. 분만취약지 등급은 복지부 공모 지침의 지역 목록으로 확인`
            : '-',
          사업목표: '안전 분만(또는 외래 산전진찰) 상시 운영 및 소아 야간 진료 확보',
          추진전략: '1. 관내 공공병원 산부인과(분만 또는 외래) 운영, 2. 달빛어린이병원 지정 검토, 3. 공공임상교수 매칭',
          세부사업: '1) 산부인과 전문의 채용 보조 (인원 직접 기재), 2) 소아 야간 진료실 운영, 3) 고위험 산모 이송 지원',
          추진체계: '보건소 - 관내 공공병원 - 국립중앙의료원(공공임상교수제) 연계 협력',
          추진일정: '(공모 지침에 따라 기재)',
          예산: '분만취약지 산부인과 지원 기준: 분만 10억원 + 연 5억원 / 외래 1억원 + 연 2억원 / 순회 1억원 + 연 2억원, 의료취약지 소아청소년과 1.92억원 + 연 2.5억원 (모두 국비·지방비 각 50%)',
          성과지표: '산전 진찰 관내 이용률 ○○% (목표 직접 설정)',
          기대효과: '직접 입력 필요 (플랫폼에 산출 근거 없음)',
          사후관리: '지역 산모·학부모 모니터링단 운영 및 야간 진료 일지 일일 점검',
        };
      }
    },
    [region_short, R]
  );

  const [proposal_form, setProposal_form] = useState(() => get_proposal_by_option('A'));

  // 정책대안 선택 및 사업계획서 폼 실시간 동기화 핸들러
  const handle_select_option = (option_id: 'A' | 'B' | 'C') => {
    setSelected_option(option_id);
    setProposal_form(get_proposal_by_option(option_id));
  };

  // 사업계획서 자동 작성 애니메이션 상태
  const [is_generating_proposal, setIs_generating_proposal] = useState(false);
  const [generated_item_count, setGenerated_item_count] = useState<number>(12); // 기본 12개 모두 작성됨
  const [is_form_editing, setIs_form_editing] = useState(false);
  const [is_saved_toast, setIs_saved_toast] = useState(false);

  // 정책대안에서 「사업계획 만들기」 클릭 시 실행되는 핸들러 (요구사항 7번)
  const handle_create_proposal_from_option = (option_id: 'A' | 'B' | 'C') => {
    handle_select_option(option_id);

    // 사업계획서 탭으로 전환
    handle_tab_change('report');

    // 12대 항목 순차 자동생성 애니메이션 실행
    setIs_generating_proposal(true);
    setGenerated_item_count(0);

    let count = 0;
    const interval = setInterval(() => {
      count += 1;
      setGenerated_item_count(count);
      if (count >= 12) {
        clearInterval(interval);
        setIs_generating_proposal(false);
      }
    }, 180);
  };

  // 저장 핸들러
  const handle_save_proposal = () => {
    try {
      if (typeof window !== 'undefined' && selected_region) {
        localStorage.setItem(`saved_proposal_${selected_region.시군구코드}`, JSON.stringify(proposal_form));
      }
    } catch {}
    setIs_saved_toast(true);
    setTimeout(() => setIs_saved_toast(false), 2500);
  };

  // PDF 인쇄
  const handle_print_pdf = () => {
    if (typeof window !== 'undefined') window.print();
  };

  // 선택 지역의 기관 목록 집계
  const region_resources = useMemo(
    () => (selected_region ? 지역_의료자원_집계(selected_region.시도명, selected_region.시군구명, selected_region.시군구코드) : null),
    [selected_region]
  );

  // 인구 규모가 가장 비슷한 시군구 5곳의 평균 (헬스맵 2024 진단값)
  const 유사지역 = useMemo(() => {
    if (!selected_region) return null;
    const 후보 = diagnosed_list
      .filter((r) => r.시군구코드 !== selected_region.시군구코드)
      .sort((a, b) => Math.abs(a.인구수 - selected_region.인구수) - Math.abs(b.인구수 - selected_region.인구수))
      .slice(0, 5);
    if (후보.length === 0) return null;
    const 평균 = (f: (r: 필수의료_진단_결과) => number) =>
      Math.round((후보.reduce((acc, r) => acc + f(r), 0) / 후보.length) * 10) / 10;
    return {
      이름: 후보.map((r) => r.시군구명).join('·'),
      응급미도달: 평균((r) => r.응급_60분_미도달_인구비율),
      응급RI: 평균((r) => r.관내_응급_의료이용률),
    };
  }, [diagnosed_list, selected_region]);

  // 사업계획서 12대 항목 목록
  const proposal_field_keys: (keyof typeof proposal_form)[] = [
    '사업명',
    '추진배경',
    '현황및문제점',
    '사업목표',
    '추진전략',
    '세부사업',
    '추진체계',
    '추진일정',
    '예산',
    '성과지표',
    '기대효과',
    '사후관리',
  ];

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* ============================================================== */}
      {/* 1. 상단 워크스페이스 서브탭 네비게이션 & 빠른 액션 */}
      {/* ============================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#15161b] p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => handle_tab_change('policy_ai')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              active_tab === 'policy_ai'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI 정책분석 &amp; 대안 워크스페이스</span>
            <ISP_과제_뱃지 taskId="3.8" customLabel="과제 3.8 AI 의사결정" />
          </button>

          <button
            onClick={() => handle_tab_change('report')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              active_tab === 'report'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>12대 항목 사업계획서</span>
            <ISP_과제_뱃지 taskId="3.4" customLabel="과제 3.4 기능보강 PMS" />
          </button>

          <button
            onClick={() => handle_tab_change('compare')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              active_tab === 'compare'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <GitCompare className="w-3.5 h-3.5" />
            <span>유사지역 1:1 비교</span>
          </button>

          <button
            onClick={() => handle_tab_change('forecast')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              active_tab === 'forecast'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>2030 미래수요 추계</span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 px-2 shrink-0 flex-wrap">
          {/* 「AI 처리 8단계」 시연 팝업 버튼 */}
          <button
            type="button"
            onClick={() => setIs_ai_pipeline_open(true)}
            className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI 처리 8단계 보기</span>
          </button>

          {/* AI가 어떻게 작동하나요? 버튼 (요구사항 9번) */}
          <button
            type="button"
            onClick={() => setIs_architecture_modal_open(true)}
            className="px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold text-xs hover:bg-purple-100 border border-purple-200 dark:border-purple-800 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>AI 작동원리</span>
          </button>

          <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-400">
            <span>대상:</span>
            <span className="font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg">
              {region_name}
            </span>
          </div>
        </div>
      </div>

      {/* As-Is vs To-Be 활성 탭별 비교 배너 */}
      <AsIs_비교_배너 target={active_tab === 'report' ? 'report' : active_tab === 'compare' ? 'diagnosis' : 'general'} />

      {/* ============================================================== */}
      {/* 2. TAB 1: AI 정책기획 핵심 Workspace (사용자 요구사항 2~6번)    */}
      {/* ============================================================== */}
      {active_tab === 'policy_ai' && (
        <div className="space-y-6">
          {/* 상단 액션 바 및 「AI 분석 실행」 버튼 유지 */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white dark:bg-[#15161b] p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                  AI 분석 핵심 Workspace
                </span>
                <span className="text-xs text-slate-400">
                  데이터 결합 → AI 인과추론 → 3대 정책대안 도출
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                {region_name} 공공의료 AI 정책 의사결정 모델
              </h2>
            </div>

            <div className="flex items-center gap-2 flex-wrap shrink-0">
              {/* 「AI 처리 8단계 보기」 버튼 — 질문 입력, 8단계 처리 애니메이션, 실행주체 뱃지 (시연) */}
              <button
                type="button"
                onClick={() => setIs_ai_pipeline_open(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-95 text-white text-xs sm:text-sm font-black transition shadow-sm cursor-pointer"
              >
                <Cpu className="w-4 h-4 text-white" />
                <span>AI 처리 8단계 보기</span>
              </button>

              {/* 「정책분석 5단계 다시 실행」 버튼 */}
              <button
                type="button"
                onClick={handle_run_ai_analysis}
                disabled={is_ai_analyzing}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold transition cursor-pointer border border-slate-200 dark:border-slate-700 disabled:opacity-50"
              >
                {is_ai_analyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                    <span>정책분석 진행 중...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                    <span>정책분석 다시 실행</span>
                  </>
                )}
              </button>

              {/* 「활용 데이터」 버튼 (사용자 요구사항 4번) */}
              <button
                type="button"
                onClick={() => setIs_utilized_data_open(true)}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold transition cursor-pointer border border-slate-200 dark:border-slate-700"
              >
                <Database className="w-4 h-4 text-blue-600" />
                <span>활용 데이터 (7)</span>
              </button>
            </div>
          </div>

          {/* 「정책분석 5단계」 진행 상태 바 */}
          <div className="bg-white dark:bg-[#15161b] p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-blue-600" />
                  <span>정책분석 5단계 진행 상태</span>
                </span>
                {is_ai_analyzing && (
                  <span className="text-[11px] font-bold text-blue-600 animate-pulse">
                    ({ai_current_step}/5단계 실행 중...)
                  </span>
                )}
                {ai_analysis_completed && (
                  <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>분석 완료 · 3대 정책대안 준비됨</span>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIs_ai_pipeline_open(true)}
                  className="px-2.5 py-1 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-bold hover:bg-blue-100 border border-blue-200 dark:border-blue-800 transition flex items-center gap-1 cursor-pointer"
                >
                  <Cpu className="w-3.5 h-3.5" />
                  <span>AI 처리 8단계 보기 →</span>
                </button>

                {is_ai_analyzing && (
                  <button
                    type="button"
                    onClick={handle_skip_ai_analysis}
                    className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 underline cursor-pointer"
                  >
                    Skip
                  </button>
                )}
              </div>
            </div>

            {/* 「정책분석 5단계」 카드 그리드 */}
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
              {AI_5단계_프로세스.map((stepItem) => {
                const is_step_done = stepItem.step < ai_current_step || ai_analysis_completed;
                const is_step_running = is_ai_analyzing && stepItem.step === ai_current_step;
                const is_step_pending = stepItem.step > ai_current_step && !ai_analysis_completed;

                return (
                  <div
                    key={stepItem.step}
                    className={`p-3 rounded-2xl border transition-all text-xs ${
                      is_step_running
                        ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 shadow-md ring-2 ring-blue-500/20'
                        : is_step_done
                        ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200/80 dark:border-emerald-900/40 text-emerald-950 dark:text-emerald-200'
                        : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-black uppercase tracking-wider">
                        STEP 0{stepItem.step}
                      </span>
                      {is_step_done ? (
                        <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-black">
                          ✓
                        </div>
                      ) : is_step_running ? (
                        <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                      ) : (
                        <div className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-400 flex items-center justify-center text-[9px]">
                          ○
                        </div>
                      )}
                    </div>
                    <div className="font-bold text-slate-900 dark:text-white truncate">
                      {stepItem.이름}
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">
                      {stepItem.설명}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ============================================================== */}
          {/* 3열 AI 분석 Workspace (사용자 요구사항 3번)                     */}
          {/* [좌측 1열]: 정책분석 5단계                                       */}
          {/* [중앙 2열]: AI 종합분석 & AI 정책대안 3개                      */}
          {/* [우측 3열]: 분석 근거                                           */}
          {/* ============================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* ------------------------------------------------------------ */}
            {/* [1열 - 좌측 (3 cols)]: 「정책분석 5단계」                       */}
            {/* ------------------------------------------------------------ */}
            <div className="lg:col-span-3 bg-white dark:bg-[#15161b] p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-black text-blue-600 uppercase tracking-wider block mb-1">
                    1열 · 분석 과정
                  </span>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    정책분석 5단계
                  </h3>
                  <span className="text-xs text-slate-500">
                    각 과정을 클릭하여 상세 분석 로그를 확인하세요.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIs_ai_pipeline_open(true)}
                  className="px-2 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-[10px] font-bold hover:bg-blue-100 border border-blue-200 dark:border-blue-800 transition shrink-0 cursor-pointer"
                  title="AI 처리 8단계 시연 팝업 열기"
                >
                  AI 처리 8단계 보기
                </button>
              </div>

              {/* 5개 과정 아코디언/인터랙티브 리스트 */}
              <div className="space-y-2.5 text-xs">
                {/* 1. 지역 현황 */}
                <div
                  onClick={() => setActive_detail_section(active_detail_section === 'status' ? null : 'status')}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-blue-300 transition cursor-pointer space-y-1"
                >
                  <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-600" />
                      1. 지역 현황
                    </span>
                    <span className="text-[10px] text-blue-600 font-semibold">
                      {active_detail_section === 'status' ? '접기 ▲' : '상세 ▼'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 pl-3">
                    {selected_region
                      ? `인구 ${format_number_comma(selected_region.인구수)}명 · 종합 취약도: ${selected_region.종합_취약도_등급}`
                      : '지역을 선택하세요'}
                  </p>
                  {active_detail_section === 'status' && (
                    <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 space-y-1 pl-3 bg-white/60 dark:bg-slate-800/60 p-2 rounded-xl">
                      <div>• 권역응급 60분 미도달율: <strong>{selected_region ? `${selected_region.응급_60분_미도달_인구비율}%` : '-'}</strong></div>
                      <div>• 관내 응급의료 이용률: <strong>{selected_region ? `${selected_region.관내_응급_의료이용률}%` : '-'}</strong></div>
                      <div>• 분만산부인과 미도달율: <strong>{selected_region ? `${selected_region.분만_60분_미도달_인구비율}%` : '-'}</strong></div>
                      <div>• 보유 응급의료기관: <strong>{region_resources ? `${region_resources.응급의료기관.length}개소` : '-'}</strong></div>
                    </div>
                  )}
                </div>

                {/* 2. 유사 지역 */}
                <div
                  onClick={() => setActive_detail_section(active_detail_section === 'compare' ? null : 'compare')}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-blue-300 transition cursor-pointer space-y-1"
                >
                  <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-indigo-600" />
                      2. 유사 지역
                    </span>
                    <span className="text-[10px] text-indigo-600 font-semibold">
                      {active_detail_section === 'compare' ? '접기 ▲' : '상세 ▼'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 pl-3">
                    {유사지역 && selected_region
                      ? `인구 유사 지역(${유사지역.이름}) 평균 응급 RI ${유사지역.응급RI}% · 선택 지역 ${selected_region.관내_응급_의료이용률}%`
                      : '지역을 선택하세요'}
                  </p>
                  {active_detail_section === 'compare' && (
                    <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 space-y-1 pl-3 bg-white/60 dark:bg-slate-800/60 p-2 rounded-xl">
                      {유사지역 && selected_region ? (
                        <>
                          <div>• 유사 지역 평균 응급 미도달: {유사지역.응급미도달}% (선택 지역 {selected_region.응급_60분_미도달_인구비율}%)</div>
                          <div>• 유사 지역 평균 응급 RI: {유사지역.응급RI}% (선택 지역 {selected_region.관내_응급_의료이용률}%)</div>
                          <div className="text-slate-400">• 기준: 인구 규모가 가장 비슷한 시군구 5곳, 헬스맵 2024</div>
                        </>
                      ) : (
                        <div>• 지역을 선택하세요</div>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handle_tab_change('compare');
                        }}
                        className="mt-1 text-blue-600 font-bold underline flex items-center gap-1"
                      >
                        1:1 비교 대시보드 바로가기 →
                      </button>
                    </div>
                  )}
                </div>

                {/* 3. 미래수요 */}
                <div
                  onClick={() => setActive_detail_section(active_detail_section === 'future' ? null : 'future')}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-blue-300 transition cursor-pointer space-y-1"
                >
                  <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-600" />
                      3. 미래수요
                    </span>
                    <span className="text-[10px] text-amber-600 font-semibold">
                      {active_detail_section === 'future' ? '접기 ▲' : '상세 ▼'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 pl-3">
                    2030 수요추계 탭의 추정 모델 참고 (실측 아님)
                  </p>
                  {active_detail_section === 'future' && (
                    <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 space-y-1 pl-3 bg-white/60 dark:bg-slate-800/60 p-2 rounded-xl">
                      <div>• 장래인구·질환별 입원수요 추계 자료는 내장되어 있지 않음</div>
                      <div>• 수요추계 탭의 값은 인구수 기반 단순 추정 모델임</div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handle_tab_change('forecast');
                        }}
                        className="mt-1 text-blue-600 font-bold underline flex items-center gap-1"
                      >
                        2030 수요추계 차트 바로가기 →
                      </button>
                    </div>
                  )}
                </div>

                {/* 4. 정책자료 */}
                <div
                  onClick={() => setActive_detail_section(active_detail_section === 'policy' ? null : 'policy')}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-blue-300 transition cursor-pointer space-y-1"
                >
                  <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-600" />
                      4. 정책자료 (RAG)
                    </span>
                    <span className="text-[10px] text-emerald-600 font-semibold">
                      {active_detail_section === 'policy' ? '접기 ▲' : '상세 ▼'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 pl-3">
                    응급의료취약지 고시·분만취약지 지원사업 기준 대조
                  </p>
                  {active_detail_section === 'policy' && (
                    <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 space-y-1 pl-3 bg-white/60 dark:bg-slate-800/60 p-2 rounded-xl">
                      <div>• 응급의료취약지: 응급의료센터 60분 내 도달 불가 인구 30% 이상 (고시 제2024-261호)</div>
                      <div>• 분만취약지 산부인과 지원: 분만 시설·장비 10억 + 운영 연 5억, 외래 1억 + 연 2억, 순회 1억 + 연 2억 (국비 50%)</div>
                      <div>• 실제 지원 대상 여부는 해당 연도 고시·공모 지침으로 확인</div>
                    </div>
                  )}
                </div>

                {/* 5. AI 종합분석 */}
                <div
                  onClick={() => setActive_detail_section(active_detail_section === 'ai' ? null : 'ai')}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-blue-300 transition cursor-pointer space-y-1"
                >
                  <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-purple-600" />
                      5. AI 종합분석
                    </span>
                    <span className="text-[10px] text-purple-600 font-semibold">
                      {active_detail_section === 'ai' ? '접기 ▲' : '상세 ▼'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 pl-3">
                    분야별 판정 결과에 따른 대안 유형 연결 (규칙 기반)
                  </p>
                  {active_detail_section === 'ai' && (
                    <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 space-y-1 pl-3 bg-white/60 dark:bg-slate-800/60 p-2 rounded-xl">
                      {selected_region ? (
                        <>
                          <div>• 응급: {selected_region.응급취약지역_여부 ? '취약' : '기준 충족'} → Option A·B 검토</div>
                          <div>• 분만: {selected_region.분만취약지역_여부 ? '취약' : '기준 충족'} → Option C 검토</div>
                        </>
                      ) : (
                        <div>• 지역을 선택하세요</div>
                      )}
                      <div>• 대안 우선순위는 담당자가 판단 (AI 자동 산출 아님)</div>
                    </div>
                  )}
                </div>
              </div>

              {/* 하단 고지 */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 space-y-0.5">
                <div>• 데이터 기준: 헬스맵 주제도 2024, E-Gen·심평원·NMC 기관 목록</div>
                <div>• RAG 인덱싱: 보건복지부 취약지 지원 고시</div>
              </div>
            </div>

            {/* ------------------------------------------------------------ */}
            {/* [2열 - 가운데 (5 cols)]: 「AI 종합분석」 & AI 정책대안 3개   */}
            {/* ------------------------------------------------------------ */}
            <div className="lg:col-span-5 space-y-4">
              {/* 상단 1: 주요 취약요인 & 우선순위 요약 카드 (사용자 요구사항 3번) */}
              <div className="bg-white dark:bg-[#15161b] p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Target className="w-4 h-4 text-red-500" />
                    <span>AI 도출 주요 취약요인 및 우선순위</span>
                  </span>
                  <span className="text-[10px] font-bold text-red-600 bg-red-50 dark:bg-red-950/60 px-2 py-0.5 rounded-md border border-red-200">
                    심각 등급
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-2xl bg-red-50/50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/40">
                    <span className="text-[10px] text-red-600 dark:text-red-400 font-bold block mb-0.5">
                      ■ 응급 분야 {selected_region ? (selected_region.응급취약지역_여부 ? '(취약)' : '(기준 충족)') : ''}
                    </span>
                    <div className="font-bold text-slate-900 dark:text-white text-xs">
                      권역응급 60분 미도달 · 응급 RI
                    </div>
                    <span className="text-[10px] text-slate-500">
                      {selected_region
                        ? `미도달 ${selected_region.응급_60분_미도달_인구비율}% · 관내이용률 ${selected_region.관내_응급_의료이용률}%`
                        : '지역을 선택하세요'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40">
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold block mb-0.5">
                      ■ 분만·소아 분야 {selected_region ? (selected_region.분만취약지역_여부 ? '(분만 취약)' : '(분만 기준 충족)') : ''}
                    </span>
                    <div className="font-bold text-slate-900 dark:text-white text-xs">
                      분만 60분 미도달 · 달빛어린이병원
                    </div>
                    <span className="text-[10px] text-slate-500">
                      {selected_region
                        ? `분만 미도달 ${selected_region.분만_60분_미도달_인구비율}% · 달빛어린이병원 ${region_resources?.달빛어린이병원_수 ?? '-'}곳`
                        : '지역을 선택하세요'}
                    </span>
                  </div>
                </div>
              </div>

              {/* 상단 2: AI 정책대안 3개 목록 (사용자 요구사항 6번 카드 구조 완벽 준수) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <span>정책대안 유형 3가지 (Option A · B · C)</span>
                  </span>
                  <span className="text-[11px] text-blue-600 font-bold">1개 선택 후 사업계획 생성</span>
                </div>

                {/* Option 01 (A) */}
                <div
                  onClick={() => handle_select_option('A')}
                  className={`p-4 sm:p-5 rounded-3xl border-2 transition-all space-y-3 cursor-pointer ${
                    selected_option === 'A'
                      ? 'border-blue-600 bg-blue-50/40 dark:bg-blue-950/30 shadow-md ring-2 ring-blue-500/20'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#15161b] hover:border-blue-400 hover:shadow-sm'
                  }`}
                >
                  {/* 대안명 & 우선순위 & 선택 버튼 */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-950 px-2 py-0.5 rounded-md">
                        Option A
                      </span>
                      <span className="text-[10px] font-black text-white bg-red-600 px-2 py-0.5 rounded-md">
                        {selected_region?.응급취약지역_여부 ? '응급 취약 지역 해당' : '유형 예시'}
                      </span>
                    </div>
                    {selected_option === 'A' ? (
                      <span className="text-xs font-black text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/60 px-2.5 py-1 rounded-xl flex items-center gap-1 shadow-2xs">
                        <Check className="w-3.5 h-3.5 stroke-[3]" /> 선택됨
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handle_select_option('A');
                        }}
                        className="text-xs font-bold text-slate-500 hover:text-blue-600 bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/50 px-2.5 py-1 rounded-xl border border-slate-200 dark:border-slate-700 transition flex items-center gap-1 cursor-pointer"
                      >
                        <span>선택하기</span>
                      </button>
                    )}
                  </div>

                  <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                    응급의료 인프라 및 골든타임 강화형
                  </h4>

                  {/* 주요 문제 & 핵심 근거 */}
                  <div className="text-xs space-y-1.5 bg-white/80 dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-200/60 dark:border-slate-800">
                    <div>
                      <strong className="text-slate-800 dark:text-slate-200">주요 문제: </strong>
                      <span className="text-slate-600 dark:text-slate-400">
                        {selected_region ? `권역응급 60분 미도달 ${selected_region.응급_60분_미도달_인구비율}%, 응급 관내이용률 ${selected_region.관내_응급_의료이용률}%` : '지역을 선택하세요'}
                      </span>
                    </div>
                    <div>
                      <strong className="text-slate-800 dark:text-slate-200">핵심 근거: </strong>
                      <span className="text-slate-600 dark:text-slate-400">
                        {selected_region ? selected_region.응급_판정근거 : '-'}
                      </span>
                    </div>
                    <div>
                      <strong className="text-slate-800 dark:text-slate-200">예상 효과: </strong>
                      <span className="text-blue-600 dark:text-blue-400 font-bold">
                        산출 근거 없음 (목표치는 사업 설계 시 직접 설정)
                      </span>
                    </div>
                  </div>

                  {/* 3대 액션 버튼 (요구사항 6번 필수) */}
                  <div className="flex items-center gap-2 pt-1 flex-wrap">
                    {/* 1. 「판단 근거」 버튼 */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setReasoning_target_option('A');
                        setIs_reasoning_modal_open(true);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold transition flex items-center gap-1 cursor-pointer border border-slate-200 dark:border-slate-700"
                    >
                      <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
                      <span>판단 근거 (왜 이 결과?)</span>
                    </button>

                    {/* 2. 「상세 분석」 버튼 */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handle_select_option('A');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      <BarChart3 className="w-3.5 h-3.5 text-indigo-600" />
                      <span>상세 분석 보기</span>
                    </button>

                    {/* 3. 「사업계획 만들기」 버튼 */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handle_create_proposal_from_option('A');
                      }}
                      className="ml-auto px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                    >
                      <span>사업계획 만들기</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Option 02 (B) */}
                <div
                  onClick={() => handle_select_option('B')}
                  className={`p-4 sm:p-5 rounded-3xl border-2 transition-all space-y-3 cursor-pointer ${
                    selected_option === 'B'
                      ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/30 shadow-md ring-2 ring-indigo-500/20'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#15161b] hover:border-indigo-400 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-950 px-2 py-0.5 rounded-md">
                        Option B
                      </span>
                      <span className="text-[10px] font-black text-indigo-800 dark:text-indigo-200 bg-indigo-100 dark:bg-indigo-900/60 px-2 py-0.5 rounded-md">
                        광역 연계형 (유형 예시)
                      </span>
                    </div>
                    {selected_option === 'B' ? (
                      <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/60 px-2.5 py-1 rounded-xl flex items-center gap-1 shadow-2xs">
                        <Check className="w-3.5 h-3.5 stroke-[3]" /> 선택됨
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handle_select_option('B');
                        }}
                        className="text-xs font-bold text-slate-500 hover:text-indigo-600 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 px-2.5 py-1 rounded-xl border border-slate-200 dark:border-slate-700 transition flex items-center gap-1 cursor-pointer"
                      >
                        <span>선택하기</span>
                      </button>
                    )}
                  </div>

                  <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                    인근 3차 권역 연계 Fast-Track 핫라인형
                  </h4>

                  <div className="text-xs space-y-1.5 bg-white/80 dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-200/60 dark:border-slate-800">
                    <div>
                      <strong className="text-slate-800 dark:text-slate-200">주요 문제: </strong>
                      <span className="text-slate-600 dark:text-slate-400">
                        자체 고난도 진료 유지가 어려운 경우 상급병원 전원 지연 위험
                      </span>
                    </div>
                    <div>
                      <strong className="text-slate-800 dark:text-slate-200">핵심 근거: </strong>
                      <span className="text-slate-600 dark:text-slate-400">
                        {selected_region ? `권역응급 60분 미도달 ${selected_region.응급_60분_미도달_인구비율}% (전원 소요시간 자료는 내장되어 있지 않음)` : '-'}
                      </span>
                    </div>
                    <div>
                      <strong className="text-slate-800 dark:text-slate-200">예상 효과: </strong>
                      <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                        산출 근거 없음 (목표치는 사업 설계 시 직접 설정)
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1 flex-wrap">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setReasoning_target_option('B');
                        setIs_reasoning_modal_open(true);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold transition flex items-center gap-1 cursor-pointer border border-slate-200 dark:border-slate-700"
                    >
                      <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
                      <span>판단 근거</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handle_select_option('B');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      <BarChart3 className="w-3.5 h-3.5 text-indigo-600" />
                      <span>상세 분석 보기</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handle_create_proposal_from_option('B');
                      }}
                      className="ml-auto px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                    >
                      <span>사업계획 만들기</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Option 03 (C) */}
                <div
                  onClick={() => handle_select_option('C')}
                  className={`p-4 sm:p-5 rounded-3xl border-2 transition-all space-y-3 cursor-pointer ${
                    selected_option === 'C'
                      ? 'border-emerald-600 bg-emerald-50/40 dark:bg-emerald-950/30 shadow-md ring-2 ring-emerald-500/20'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#15161b] hover:border-emerald-400 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-md">
                        Option C
                      </span>
                      <span className="text-[10px] font-black text-emerald-800 dark:text-emerald-200 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded-md">
                        {selected_region?.분만취약지역_여부 ? '분만 취약 지역 해당' : '유형 예시'}
                      </span>
                    </div>
                    {selected_option === 'C' ? (
                      <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/60 px-2.5 py-1 rounded-xl flex items-center gap-1 shadow-2xs">
                        <Check className="w-3.5 h-3.5 stroke-[3]" /> 선택됨
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handle_select_option('C');
                        }}
                        className="text-xs font-bold text-slate-500 hover:text-emerald-600 bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 px-2.5 py-1 rounded-xl border border-slate-200 dark:border-slate-700 transition flex items-center gap-1 cursor-pointer"
                      >
                        <span>선택하기</span>
                      </button>
                    )}
                  </div>

                  <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                    의료인력 확보 및 모자·소아 특화 안심망형
                  </h4>

                  <div className="text-xs space-y-1.5 bg-white/80 dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-200/60 dark:border-slate-800">
                    <div>
                      <strong className="text-slate-800 dark:text-slate-200">주요 문제: </strong>
                      <span className="text-slate-600 dark:text-slate-400">
                        {selected_region ? `분만 60분 미도달 ${selected_region.분만_60분_미도달_인구비율}%, 분만 관내이용률 ${selected_region.관내_분만율}%` : '지역을 선택하세요'}
                      </span>
                    </div>
                    <div>
                      <strong className="text-slate-800 dark:text-slate-200">핵심 근거: </strong>
                      <span className="text-slate-600 dark:text-slate-400">
                        {region_resources ? `관내 분만 가능 기관 ${region_resources.분만기관_수}곳, 달빛어린이병원 ${region_resources.달빛어린이병원_수}곳` : '-'}
                      </span>
                    </div>
                    <div>
                      <strong className="text-slate-800 dark:text-slate-200">예상 효과: </strong>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                        산출 근거 없음 (목표치는 사업 설계 시 직접 설정)
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1 flex-wrap">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setReasoning_target_option('C');
                        setIs_reasoning_modal_open(true);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold transition flex items-center gap-1 cursor-pointer border border-slate-200 dark:border-slate-700"
                    >
                      <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>판단 근거</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handle_select_option('C');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      <BarChart3 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>상세 분석 보기</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handle_create_proposal_from_option('C');
                      }}
                      className="ml-auto px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                    >
                      <span>사업계획 만들기</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* ------------------------------------------------------------ */}
            {/* [3열 - 우측 (4 cols)]: 「분석 근거」                          */}
            {/* ------------------------------------------------------------ */}
            <div className="lg:col-span-4 bg-white dark:bg-[#15161b] p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-wider block mb-1">
                  Step 03 · 검증 가능한 신뢰 체계
                </span>
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center justify-between">
                  <span>분석 근거</span>
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded-md">
                    Option {selected_option} 반영
                  </span>
                </h3>
                <span className="text-xs text-slate-500">
                  각 영역을 클릭하여 구체적인 원천 근거를 조회하세요.
                </span>
              </div>

              {/* 4대 분석 근거 카드 */}
              <div className="space-y-3 text-xs">
                {/* 1. 활용 데이터 (클릭 시 7대 데이터 카탈로그 모달) */}
                <div
                  onClick={() => setIs_utilized_data_open(true)}
                  className="p-3.5 rounded-2xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/50 hover:border-blue-500 transition cursor-pointer space-y-1"
                >
                  <div className="flex items-center justify-between font-bold text-blue-900 dark:text-blue-200">
                    <span className="flex items-center gap-1.5">
                      <Database className="w-4 h-4 text-blue-600" />
                      1. 활용 데이터 (7대 그룹)
                    </span>
                    <span className="text-[10px] underline font-bold">열기 ↗</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">
                    의료기관 · 의료자원 · 인구통계 · 의료이용 · GIS · 미래수요 · 정책자료
                  </p>
                  <div className="text-[10px] text-blue-600 font-semibold pt-1">
                    ※ 프로토타입: ISP 검증용 예시(Mock) 데이터셋 준용
                  </div>
                </div>

                {/* 2. 데이터 출처 */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
                  <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-emerald-600" />
                    2. 데이터 출처 기관
                  </span>
                  <div className="space-y-1 text-[11px] text-slate-600 dark:text-slate-400">
                    <div className="flex items-center justify-between">
                      <span>• 국립중앙의료원 공공보건의료지원센터</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">헬스맵 GIS</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>• 건강보험심사평가원</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">의료자원/인력</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>• 국민건강보험공단</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">관내이용률(RI)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>• 통계청 / 행정안전부</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">2030 장래인구</span>
                    </div>
                  </div>
                </div>

                {/* 3. 정책자료 */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1.5">
                  <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-purple-600" />
                    3. 정책 자료 및 법적 근거
                  </span>
                  <div className="text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
                    <div>• 보건복지부 고시 「응급의료분야 의료취약지 지정」 (제2024-261호)</div>
                    <div>• 제2차 공공보건의료 기본계획 (책임의료 협의체)</div>
                    <div>• 지방자치단체 보건의료계획 표준 양식 준수</div>
                  </div>
                </div>

                {/* 4. AI 판단 근거 상세 버튼 (Option 연계) */}
                <div className="p-3.5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-900/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
                      <Brain className="w-4 h-4 text-indigo-600" />
                      4. AI 종합 판단 근거
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setReasoning_target_option(selected_option);
                        setIs_reasoning_modal_open(true);
                      }}
                      className="text-[10px] font-bold text-indigo-600 hover:underline cursor-pointer"
                    >
                      보고서 전문 보기 ↗
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed">
                    {정책_근거_생성(selected_option, selected_region).AI종합판단.요약}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setReasoning_target_option(selected_option);
                      setIs_reasoning_modal_open(true);
                    }}
                    className="w-full py-2 rounded-xl bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-bold text-xs border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>「왜 이 결과가 나왔나요?」 열람</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* 하단 바로 사업계획서 생성 CTA */}
              <button
                type="button"
                onClick={() => handle_create_proposal_from_option(selected_option)}
                className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>선택한 Option {selected_option}으로 사업계획서 생성하기</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. TAB 2: 사업계획서 12대 항목 실무 검토 (사용자 요구사항 7~8번) */}
      {/* ============================================================== */}
      {active_tab === 'report' && (
        <div className="space-y-6">
          {/* 사용자 요구사항 8번: AI와 사람의 역할 구분 카드 및 책임 원칙 명시 */}
          <div className="bg-white dark:bg-[#15161b] rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950 px-2.5 py-0.5 rounded-full border border-purple-200 dark:border-purple-800">
                AI 거버넌스 &amp; 역할 분담 체계
              </span>
              <span className="text-xs text-slate-400">책임성 및 투명성 보장 가이드</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* AI의 역할 */}
              <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60 space-y-2">
                <div className="flex items-center gap-2 font-black text-blue-900 dark:text-blue-200 text-sm">
                  <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs">
                    <Cpu className="w-3.5 h-3.5" />
                  </div>
                  <span>AI의 역할 (분석 및 생성 지원)</span>
                </div>
                <ul className="space-y-1.5 text-slate-700 dark:text-slate-300 pl-1">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                    <strong>데이터 분석:</strong> 7대 공공의료 데이터 결합 및 취약지 지표 산출
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                    <strong>지역 비교:</strong> 유사 지자체 코호트 간 의료 인프라 격차 분석
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                    <strong>미래수요 예측:</strong> 2030 고령화 및 질환별 입원·외래 수요 추계
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                    <strong>정책대안 생성:</strong> 우선순위 3대 정책 시나리오(Option A/B/C) 도출
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                    <strong>사업계획 초안 생성:</strong> 법정 12대 항목 시행계획서 템플릿 자동 작성
                  </li>
                </ul>
              </div>

              {/* 담당자의 역할 */}
              <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-900/60 space-y-2">
                <div className="flex items-center gap-2 font-black text-emerald-900 dark:text-emerald-200 text-sm">
                  <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs">
                    <UserCheck className="w-3.5 h-3.5" />
                  </div>
                  <span>담당자의 역할 (정책 판단 및 최종 승인)</span>
                </div>
                <ul className="space-y-1.5 text-slate-700 dark:text-slate-300 pl-1">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                    <strong>결과 검토:</strong> AI가 산출한 수치와 인과추론의 지역 현장 적합성 검증
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                    <strong>내용 수정:</strong> 지자체 특수 사정(예산 조례, 병원 협약 등)을 반영한 문구 직접 편집
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                    <strong>정책 판단:</strong> 복수 대안 중 지자체 상황에 맞는 최적 방안 결정
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                    <strong>최종 승인:</strong> 보건복지부 공모 제출 및 예산 심의를 위한 공식 결재
                  </li>
                </ul>
              </div>
            </div>

            {/* 사용자 요구사항 8번 필수 하단 메시지 */}
            <div className="p-3.5 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 flex items-center gap-3">
              <Shield className="w-5 h-5 text-amber-400 shrink-0" />
              <p className="text-xs sm:text-sm font-bold tracking-tight">
                「AI는 정책을 결정하지 않습니다. AI는 데이터 기반 분석과 정책 초안을 지원하고 최종 판단은 담당자가 수행합니다.」
              </p>
            </div>
          </div>

          {/* 사업계획서 12대 항목 폼 & 자동작성 애니메이션 진행바 (요구사항 7번) */}
          <div className="bg-white dark:bg-[#15161b] rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
            {/* 상단 툴바 */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2.5 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
                    보건복지부 법정 12대 항목 양식
                  </span>

                  {/* 기반 대안 전환 세그먼트 버튼 (Option A / Option B / Option C) */}
                  <div className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="text-[11px] font-bold text-slate-500 pl-2 pr-1">기반 대안:</span>
                    {(['A', 'B', 'C'] as const).map((opt) => {
                      const is_active = selected_option === opt;
                      const active_color =
                        opt === 'A'
                          ? 'bg-blue-600 text-white shadow-2xs'
                          : opt === 'B'
                          ? 'bg-indigo-600 text-white shadow-2xs'
                          : 'bg-emerald-600 text-white shadow-2xs';

                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => handle_select_option(opt)}
                          className={`px-2.5 py-0.5 rounded-lg text-xs font-black transition cursor-pointer flex items-center gap-1 ${
                            is_active
                              ? active_color
                              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          <span>Option {opt}</span>
                          {is_active && <Check className="w-3 h-3 stroke-[3]" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  <span>공공보건의료 사업계획서 12대 항목 실무 검토 &amp; 편집기</span>
                </h3>
              </div>

              {/* 액션 버튼들 */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setIs_form_editing(!is_form_editing)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs ${
                    is_form_editing
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{is_form_editing ? '수정 완료' : '직접 수정'}</span>
                </button>

                <button
                  type="button"
                  onClick={handle_save_proposal}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{is_saved_toast ? '✓ 저장 완료!' : '임시 저장'}</span>
                </button>

                <button
                  type="button"
                  onClick={handle_print_pdf}
                  className="px-3.5 py-2 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 hover:bg-blue-100 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs border border-blue-200 dark:border-blue-800"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>PDF 인쇄 / 저장</span>
                </button>
              </div>
            </div>

            {/* AI 자동 작성 진행 상태 표시 애니메이션 (요구사항 7번) */}
            {is_generating_proposal && (
              <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 space-y-2 animate-in fade-in">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-blue-900 dark:text-blue-200 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                    <span>AI가 Option {selected_option}을 기반으로 12대 항목 사업계획서를 자동 작성 중입니다...</span>
                  </span>
                  <span className="font-bold text-blue-600">
                    {generated_item_count} / 12 완료
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-blue-200 dark:bg-blue-900/60 overflow-hidden">
                  <div
                    className="h-full bg-blue-600 transition-all duration-200"
                    style={{ width: `${(generated_item_count / 12) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* 12대 항목 폼 그리드 (사용자 요구사항 7번 필수 항목 명시) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* 1. 사업명 */}
              <div className={`space-y-1 md:col-span-2 transition-all ${generated_item_count < 1 ? 'opacity-30' : 'opacity-100'}`}>
                <label className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-600" />
                  <span>1. 사업명</span>
                  {generated_item_count >= 1 && <span className="text-[10px] text-emerald-600 font-bold">✓ AI 작성됨</span>}
                </label>
                {is_form_editing ? (
                  <input
                    type="text"
                    value={proposal_form.사업명}
                    onChange={(e) => setProposal_form({ ...proposal_form, 사업명: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-blue-300 rounded-xl font-bold"
                  />
                ) : (
                  <p className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 font-black text-slate-900 dark:text-white border border-slate-100 dark:border-slate-800">
                    {proposal_form.사업명}
                  </p>
                )}
              </div>

              {/* 2. 추진배경 */}
              <div className={`space-y-1 transition-all ${generated_item_count < 2 ? 'opacity-30' : 'opacity-100'}`}>
                <label className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <span>2. 추진배경</span>
                  {generated_item_count >= 2 && <span className="text-[10px] text-emerald-600 font-bold">✓ AI 작성됨</span>}
                </label>
                {is_form_editing ? (
                  <textarea
                    rows={3}
                    value={proposal_form.추진배경}
                    onChange={(e) => setProposal_form({ ...proposal_form, 추진배경: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border rounded-xl"
                  />
                ) : (
                  <p className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 font-medium text-slate-700 dark:text-slate-300 min-h-[72px]">
                    {proposal_form.추진배경}
                  </p>
                )}
              </div>

              {/* 3. 현황 및 문제점 */}
              <div className={`space-y-1 transition-all ${generated_item_count < 3 ? 'opacity-30' : 'opacity-100'}`}>
                <label className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <span>3. 현황 및 문제점</span>
                  {generated_item_count >= 3 && <span className="text-[10px] text-emerald-600 font-bold">✓ AI 작성됨</span>}
                </label>
                {is_form_editing ? (
                  <textarea
                    rows={3}
                    value={proposal_form.현황및문제점}
                    onChange={(e) => setProposal_form({ ...proposal_form, 현황및문제점: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border rounded-xl"
                  />
                ) : (
                  <p className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 font-medium text-slate-700 dark:text-slate-300 min-h-[72px]">
                    {proposal_form.현황및문제점}
                  </p>
                )}
              </div>

              {/* 4. 사업목표 */}
              <div className={`space-y-1 transition-all ${generated_item_count < 4 ? 'opacity-30' : 'opacity-100'}`}>
                <label className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <span>4. 사업목표</span>
                  {generated_item_count >= 4 && <span className="text-[10px] text-emerald-600 font-bold">✓ AI 작성됨</span>}
                </label>
                {is_form_editing ? (
                  <input
                    type="text"
                    value={proposal_form.사업목표}
                    onChange={(e) => setProposal_form({ ...proposal_form, 사업목표: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border rounded-xl"
                  />
                ) : (
                  <p className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 font-medium text-slate-700 dark:text-slate-300">
                    {proposal_form.사업목표}
                  </p>
                )}
              </div>

              {/* 5. 추진전략 */}
              <div className={`space-y-1 transition-all ${generated_item_count < 5 ? 'opacity-30' : 'opacity-100'}`}>
                <label className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <span>5. 추진전략</span>
                  {generated_item_count >= 5 && <span className="text-[10px] text-emerald-600 font-bold">✓ AI 작성됨</span>}
                </label>
                {is_form_editing ? (
                  <input
                    type="text"
                    value={proposal_form.추진전략}
                    onChange={(e) => setProposal_form({ ...proposal_form, 추진전략: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border rounded-xl"
                  />
                ) : (
                  <p className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 font-medium text-slate-700 dark:text-slate-300">
                    {proposal_form.추진전략}
                  </p>
                )}
              </div>

              {/* 6. 세부사업 */}
              <div className={`space-y-1 md:col-span-2 transition-all ${generated_item_count < 6 ? 'opacity-30' : 'opacity-100'}`}>
                <label className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <span>6. 세부사업</span>
                  {generated_item_count >= 6 && <span className="text-[10px] text-emerald-600 font-bold">✓ AI 작성됨</span>}
                </label>
                {is_form_editing ? (
                  <textarea
                    rows={2}
                    value={proposal_form.세부사업}
                    onChange={(e) => setProposal_form({ ...proposal_form, 세부사업: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border rounded-xl"
                  />
                ) : (
                  <p className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 font-medium text-slate-700 dark:text-slate-300">
                    {proposal_form.세부사업}
                  </p>
                )}
              </div>

              {/* 7. 추진체계 */}
              <div className={`space-y-1 transition-all ${generated_item_count < 7 ? 'opacity-30' : 'opacity-100'}`}>
                <label className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <span>7. 추진체계</span>
                  {generated_item_count >= 7 && <span className="text-[10px] text-emerald-600 font-bold">✓ AI 작성됨</span>}
                </label>
                {is_form_editing ? (
                  <input
                    type="text"
                    value={proposal_form.추진체계}
                    onChange={(e) => setProposal_form({ ...proposal_form, 추진체계: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border rounded-xl"
                  />
                ) : (
                  <p className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 font-medium text-slate-700 dark:text-slate-300">
                    {proposal_form.추진체계}
                  </p>
                )}
              </div>

              {/* 8. 추진일정 */}
              <div className={`space-y-1 transition-all ${generated_item_count < 8 ? 'opacity-30' : 'opacity-100'}`}>
                <label className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <span>8. 추진일정</span>
                  {generated_item_count >= 8 && <span className="text-[10px] text-emerald-600 font-bold">✓ AI 작성됨</span>}
                </label>
                {is_form_editing ? (
                  <input
                    type="text"
                    value={proposal_form.추진일정}
                    onChange={(e) => setProposal_form({ ...proposal_form, 추진일정: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border rounded-xl"
                  />
                ) : (
                  <p className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 font-medium text-slate-700 dark:text-slate-300">
                    {proposal_form.추진일정}
                  </p>
                )}
              </div>

              {/* 9. 예산 */}
              <div className={`space-y-1 transition-all ${generated_item_count < 9 ? 'opacity-30' : 'opacity-100'}`}>
                <label className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <span>9. 예산 (소요재원 및 국·도비 매칭)</span>
                  {generated_item_count >= 9 && <span className="text-[10px] text-emerald-600 font-bold">✓ AI 작성됨</span>}
                </label>
                {is_form_editing ? (
                  <input
                    type="text"
                    value={proposal_form.예산}
                    onChange={(e) => setProposal_form({ ...proposal_form, 예산: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border rounded-xl"
                  />
                ) : (
                  <p className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 font-medium text-slate-700 dark:text-slate-300">
                    {proposal_form.예산}
                  </p>
                )}
              </div>

              {/* 10. 성과지표 */}
              <div className={`space-y-1 transition-all ${generated_item_count < 10 ? 'opacity-30' : 'opacity-100'}`}>
                <label className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <span>10. 성과지표 (KPI)</span>
                  {generated_item_count >= 10 && <span className="text-[10px] text-emerald-600 font-bold">✓ AI 작성됨</span>}
                </label>
                {is_form_editing ? (
                  <input
                    type="text"
                    value={proposal_form.성과지표}
                    onChange={(e) => setProposal_form({ ...proposal_form, 성과지표: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border rounded-xl"
                  />
                ) : (
                  <p className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 font-medium text-slate-700 dark:text-slate-300">
                    {proposal_form.성과지표}
                  </p>
                )}
              </div>

              {/* 11. 기대효과 */}
              <div className={`space-y-1 transition-all ${generated_item_count < 11 ? 'opacity-30' : 'opacity-100'}`}>
                <label className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <span>11. 기대효과</span>
                  {generated_item_count >= 11 && <span className="text-[10px] text-emerald-600 font-bold">✓ AI 작성됨</span>}
                </label>
                {is_form_editing ? (
                  <textarea
                    rows={2}
                    value={proposal_form.기대효과}
                    onChange={(e) => setProposal_form({ ...proposal_form, 기대효과: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border rounded-xl"
                  />
                ) : (
                  <p className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 font-medium text-slate-700 dark:text-slate-300">
                    {proposal_form.기대효과}
                  </p>
                )}
              </div>

              {/* 12. 사후관리 */}
              <div className={`space-y-1 transition-all ${generated_item_count < 12 ? 'opacity-30' : 'opacity-100'}`}>
                <label className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <span>12. 사후관리 (모니터링 및 질관리)</span>
                  {generated_item_count >= 12 && <span className="text-[10px] text-emerald-600 font-bold">✓ AI 작성됨</span>}
                </label>
                {is_form_editing ? (
                  <textarea
                    rows={2}
                    value={proposal_form.사후관리}
                    onChange={(e) => setProposal_form({ ...proposal_form, 사후관리: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border rounded-xl"
                  />
                ) : (
                  <p className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 font-medium text-slate-700 dark:text-slate-300">
                    {proposal_form.사후관리}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* 기존 보건복지부 개조식 서술문 자동생성기 임베드 (HWPX 다운로드 기능 보존) */}
          <div className="bg-white dark:bg-[#15161b] rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
            <사업계획서_서술문_생성기
              selected_region={selected_region}
              sido_stat={sido_stat}
              national_stat={national_stat}
              google_api_key={google_api_key}
            />
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. TAB 3: 유사 지자체 1:1 비교 (일대일_비교_대시보드)           */}
      {/* ============================================================== */}
      {active_tab === 'compare' && (
        <div className="bg-white dark:bg-[#15161b] rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
          <일대일_비교_대시보드
            selected_region={selected_region}
            diagnosed_list={diagnosed_list}
            on_navigate_step={(step) => {
              if (step === 'forecast') handle_tab_change('forecast');
            }}
          />
        </div>
      )}

      {/* ============================================================== */}
      {/* 5. TAB 4: 2030 의료수요 추계 및 지표 비교                      */}
      {/* ============================================================== */}
      {active_tab === 'forecast' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-stretch">
            <div className="bg-white dark:bg-[#15161b] rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
              <의료수요_추계_차트
                selected_region={selected_region}
                on_navigate_step={(step) => {
                  if (step === 'policy_ai') handle_tab_change('policy_ai');
                  else if (step === 'compare') handle_tab_change('compare');
                }}
              />
            </div>
            <div className="bg-white dark:bg-[#15161b] rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
              <의료지표_비교차트
                selected_region={selected_region}
                sido_stat={sido_stat}
                national_stat={national_stat}
              />
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 6. 모달 3종 레이어 연동                                          */}
      {/* ============================================================== */}
      {/* 1. 활용 데이터 모달 (요구사항 4번) */}
      <AI_활용_데이터_모달
        is_open={is_utilized_data_open}
        on_close={() => setIs_utilized_data_open(false)}
        selected_region_name={region_name}
      />

      {/* 2. AI 판단 근거 (왜 이 결과가 나왔나요?) 모달 (요구사항 5번) */}
      <AI_판단_근거_모달
        is_open={is_reasoning_modal_open}
        on_close={() => setIs_reasoning_modal_open(false)}
        option_id={reasoning_target_option}
        selected_region={selected_region}
        on_create_proposal={handle_create_proposal_from_option}
      />

      {/* 3. AI 기술구조 보기 모달 (요구사항 9번) */}
      <AI_기술구조_모달
        is_open={is_architecture_modal_open}
        on_close={() => setIs_architecture_modal_open(false)}
      />

      {/* 4. 「AI 처리 8단계」 시연 팝업 (질문입력, 순차 파이프라인 애니메이션, 실행주체 뱃지, RAG상세, 최종결과) */}
      <AI_분석_패널
        is_open={is_ai_pipeline_open}
        on_close={() => setIs_ai_pipeline_open(false)}
        region_name={selected_region ? `${selected_region.시도명} ${selected_region.시군구명}` : '강원 영월군'}
        initial_query={
          selected_region
            ? `${selected_region.시군구명}의 응급의료 취약 원인과 개선방안을 분석해줘.`
            : '영월군의 응급의료 취약 원인과 개선방안을 분석해줘.'
        }
      />
    </div>
  );
};
