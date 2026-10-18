'use client';

// Essential Care Map - 공공보건의료 시행계획 및 추진실적 AI 평가 시스템
// 근거 문서:
// 1) 『2025년 공공보건의료 시행계획 수립 지침』 (보건복지부·국립중앙의료원)
// 2) 『2024년 공공보건의료 시행계획 추진실적 작성 지침』 (보건복지부·국립중앙의료원)
// 핵심 기능:
// - 공공기관(17개 시·도 / 8개 중앙행정기관·공공단체) 평가자료 입력·수정·업로드
// - 지침 공식 평가표(100점 만점: 추진실적 70점[6개 항목] + 사업계획 30점[4개 항목]) 기반 자동 산출
// - 평가 진행 전 과정 6단계 AI 서비스(사전검증 → 지표진단 → 정량채점 → 루브릭채점 → 이견조정 → 결과보고서·Gemini 심사) 시연

import React, { useState, useMemo, useRef } from 'react';
import {
  Sparkles,
  FileCheck2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ClipboardCheck,
  Award,
  Users,
  Scale,
  FileText,
  Upload,
  Wand2,
  Play,
  RefreshCw,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Printer,
  Cpu,
  BookOpen,
  Target,
  Sliders,
  ArrowRight,
  ShieldCheck,
  Building2,
  Info,
  Loader2,
  Layers,
  Download,
} from 'lucide-react';

import {
  기관_시행계획_평가패키지,
  시행계획_평가_프리셋_목록,
  evaluateImplementationPlan,
  루브릭_척도_등급,
  성과지표_성격유형,
  제2차_기본계획_과제체계,
} from '@/lib/시행계획_평가_엔진';
import { downloadHwpxDirect, ReportItem } from '@/lib/hwpx_생성기';

interface 시행계획_추진실적_AI평가_시스템_속성 {
  selected_region_name?: string;
  google_api_key?: string;
}

type 평가_워크플로우_탭 =
  | 'all'
  | 'step1_input'
  | 'step2_precheck'
  | 'step3_indicator_committee'
  | 'step4_scorecard'
  | 'step5_consensus'
  | 'step6_report';

const AI_평가_6단계_정의 = [
  {
    id: 'step1_input' as const,
    step: 1,
    title: '평가자료 입력·추출',
    sub: '추진실적·시행계획·위원회 입력',
    aiRole: 'HWP/HWPX 표·개조식 문단 자동 구조화 파싱',
    actor: '공공기관 작성자 → AI 파서',
  },
  {
    id: 'step2_precheck' as const,
    step: 2,
    title: 'AI 지침·서식 사전검증',
    sub: '8대 필수 작성요건 누락 점검',
    aiRole: '미수행 사유·지정센터 실적·전년도 의견 누락 탐지 및 자동 보완',
    actor: 'AI 사전검증 에이전트',
  },
  {
    id: 'step3_indicator_committee' as const,
    step: 3,
    title: 'AI 지표진단 & 위원회 정량채점',
    sub: '투입/과정 적발 & 위원회 5점 산출',
    aiRole: '성과지표 성격(투입→결과) AI 교정 & 위원회 5대 분야 정량 계산',
    actor: 'AI 지표분류기 & 정량규칙 엔진',
  },
  {
    id: 'step4_scorecard' as const,
    step: 4,
    title: '공식 평가표 100점 AI 채점',
    sub: '추진실적(70점) + 사업계획(30점)',
    aiRole: '10대 항목 × 3대 분야 가중치 루브릭 초벌채점 & 원문 근거 하이라이트',
    actor: 'AI 루브릭 심사기 + 평가위원',
  },
  {
    id: 'step5_consensus' as const,
    step: 5,
    title: '소위원회 편차·이견 조정',
    sub: '5인 평가위원 점수 편차 중재',
    aiRole: '위원 간 과다 편차 항목 자동 감지 및 원문 팩트 기반 조정안 제시',
    actor: 'AI 합의지원 + 총괄평가위원회',
  },
  {
    id: 'step6_report' as const,
    step: 6,
    title: '평가결과서 & 차년도 환류 생성',
    sub: '최종 등급 판정 & 개선권고안',
    aiRole: '보건복지부 통보용 종합평가결과서 자동 작성 & Gemini 심층 심사',
    actor: 'AI 보고서 생성기 (Cloud/sLLM)',
  },
];

export const 시행계획_추진실적_AI평가_시스템: React.FC<시행계획_추진실적_AI평가_시스템_속성> = ({
  selected_region_name,
  google_api_key,
}) => {
  // 1. 현재 선택된 기관 평가 패키지 상태 (깊은 복사로 실시간 수정 지원)
  const [selected_preset_id, setSelected_preset_id] = useState<string>('gangwon_best');
  const [eval_pkg, setEval_pkg] = useState<기관_시행계획_평가패키지>(() =>
    JSON.parse(JSON.stringify(시행계획_평가_프리셋_목록[0]))
  );

  // 2. 평가위원 수동 루브릭 등급 조정(Human-in-the-Loop) 오버라이드 상태
  const [manual_overrides, setManual_overrides] = useState<
    Record<string, { field1?: 루브릭_척도_등급; field2?: 루브릭_척도_등급; field3?: 루브릭_척도_등급 }>
  >({});

  // 3. 활성 워크플로우 단계 탭 ('all'이면 전체 파이프라인 통합 뷰)
  const [active_step_tab, setActive_step_tab] = useState<평가_워크플로우_탭>('all');

  // 4. 입력 폼 내부 서브탭 (1분야 / 2분야 / 3분야 / 위원회·사전요건)
  const [input_subtab, setInput_subtab] = useState<'field1' | 'field2' | 'field3' | 'committee'>('field1');

  // 5. AI 6단계 자동 평가 파이프라인 애니메이션 상태
  const [is_running_pipeline, setIs_running_pipeline] = useState(false);
  const [pipeline_progress_step, setPipeline_progress_step] = useState<number>(6);
  const timer_ref = useRef<NodeJS.Timeout | null>(null);

  // 6. 파일 업로드 시뮬레이션 토스트 및 AI 원클릭 교정 토스트
  const [toast_message, setToast_message] = useState<string | null>(null);
  const file_input_ref = useRef<HTMLInputElement | null>(null);

  // 7. 복사 상태 및 온라인 Gemini 실시간 심층 평가 상태
  const [is_copied, setIs_copied] = useState(false);
  const [is_gemini_loading, setIs_gemini_loading] = useState(false);
  const [gemini_live_review, setGemini_live_review] = useState<string | null>(null);
  const [show_guideline_modal, setShow_guideline_modal] = useState(false);

  const showToast = (msg: string) => {
    setToast_message(msg);
    setTimeout(() => setToast_message(null), 3500);
  };

  // 프리셋 변경 핸들러
  const handleSelectPreset = (presetId: string) => {
    const found = 시행계획_평가_프리셋_목록.find((p) => p.presetId === presetId);
    if (!found) return;
    setSelected_preset_id(presetId);
    setEval_pkg(JSON.parse(JSON.stringify(found)));
    setManual_overrides({});
    setGemini_live_review(null);
    showToast(`'${found.institutionName}' 평가자료(추진실적·시행계획)를 불러왔습니다.`);
  };

  // AI 6단계 파이프라인 시연 실행 핸들러
  const handleRunPipelineAnimation = () => {
    if (timer_ref.current) clearTimeout(timer_ref.current);
    setIs_running_pipeline(true);
    setPipeline_progress_step(1);

    let s = 1;
    const next = () => {
      timer_ref.current = setTimeout(() => {
        s += 1;
        if (s <= 6) {
          setPipeline_progress_step(s);
          next();
        } else {
          setIs_running_pipeline(false);
          showToast('AI 6단계 시행계획·추진실적 종합 평가 산출이 완료되었습니다.');
        }
      }, 550);
    };
    next();
  };

  // 실시간 평가 결과 계산
  const eval_result = useMemo(
    () => evaluateImplementationPlan(eval_pkg, manual_overrides),
    [eval_pkg, manual_overrides]
  );

  // ==========================================================================
  // AI 원클릭 자동 보완 핸들러들 (평가 과정에서 AI가 서비스하는 핵심 가치 시연!)
  // ==========================================================================

  // [AI 원클릭 보완 1] 지침 위반·누락 사항 일괄 보완 (사전검증 통과 처리)
  const handleAiFixPreCheckAll = () => {
    setEval_pkg((prev) => ({
      ...prev,
      preCheckFlags: {
        isBulletPointFormat: true,
        blueGuideTextRemoved: true,
        summaryTableMatched: true,
        prevReportAllIncluded: true,
        excludedTaskReasonProvided: true,
      },
      fieldProjects: prev.fieldProjects.map((fp) => ({
        ...fp,
        hasDesignatedCenterReport: true,
        hasPlanChangeReason: true,
        purposeAndContent: fp.purposeAndContent.includes('파란색 가이드')
          ? '◦ 제2차 공공보건의료 기본계획 1분야-2-1(중증응급 지역 기반 대응 체계 마련)과 연계하여 관내 권역·지역응급의료기관 24시간 진료벨트 구축 및 지정센터 운영 지원\n◦ 중증응급환자 적기 이송·최종치료 수용률 제고'
          : fp.purposeAndContent,
        executionSystem:
          fp.executionSystem.length < 40
            ? `${prev.institutionName} 공공의료담당관 총괄 · 공공보건의료지원단 기술지원 · 권역 및 지역책임의료기관 다기관 협력 수행 체계 가동`
            : fp.executionSystem,
        monitoringCycle:
          fp.monitoringCycle.includes('정산 시 1회') || fp.monitoringCycle.includes('없음')
            ? '월 1회 주요 성과지표 집행 점검 및 분기별 원외협의체 모니터링 회의 운영(연 4회)'
            : fp.monitoringCycle,
        selfEvalWeakness: fp.selfEvalWeakness.includes('특이사항 없음')
          ? '◦ 야간·공휴일 취약시간대 배후진료과(신경외과·흉부외과) 전문의 당직 인력 부족으로 일부 중증환자 타 권역 전원 발생'
          : fp.selfEvalWeakness,
        futureImprovement:
          fp.futureImprovement.length < 25
            ? '◦ 2025년 권역-지역 순환당직제 도입 및 원격 중환자 협진 핫라인 보강을 통해 야간 수용률을 15%p 이상 개선'
            : fp.futureImprovement,
        nextYearAnalysisAndPlan:
          fp.nextYearAnalysisAndPlan.includes('누락') || fp.nextYearAnalysisAndPlan.includes('미흡')
            ? '◦ 헬스맵 필수의료 취약지 진단 통계 및 의료이용 유출입 분석을 토대로 기본계획 18개 세부과제 전수 매핑 및 추진계획 수립 완료'
            : fp.nextYearAnalysisAndPlan,
        prevEvalFeedbackReflection:
          fp.prevEvalFeedbackReflection.includes('미작성') || fp.prevEvalFeedbackReflection.includes('공란')
            ? '◦ 전년도 평가 결과보고서의 전체 평가 의견을 빠짐없이 기재하고, 지적된 성과지표 고도화 및 지정센터 실적 관리 방안을 2025년 계획에 100% 반영함'
            : fp.prevEvalFeedbackReflection,
      })),
    }));
    showToast('✨ AI가 서식 불일치, 지정센터 실적 누락, 개조식 변환, 전년도 평가의견 누락을 지침 기준에 맞게 일괄 보완했습니다!');
  };

  // [AI 원클릭 보완 2] 부적절 성과지표(투입/과정) → 지침 권장 산출/결과 지표로 자동 교정
  const handleAiUpgradeIndicators = () => {
    setEval_pkg((prev) => ({
      ...prev,
      fieldProjects: prev.fieldProjects.map((fp) => {
        if (fp.indicatorType === '산출(Output)' || fp.indicatorType === '결과(Outcome)') {
          return fp;
        }
        const diag = eval_result.indicatorDiagnoses.find((d) => d.fieldId === fp.fieldId);
        return {
          ...fp,
          indicatorName: diag ? diag.recommendedIndicator : '중증응급환자 적정시간 내 최종치료 도달률',
          indicatorType: diag ? diag.recommendedType : '결과(Outcome)',
          targetValue: 75.0,
          actualValue: 78.2,
          unit: '%',
          formulaAndBasis: diag
            ? `∙ 측정산식: ${diag.recommendedFormula}\n∙ 산출근거: 최근 3개년 실적 추세(+3.2%p)를 반영하여 상향 목표치 설정`
            : fp.formulaAndBasis,
          nextYearTargetTrend: '◦ 최근 3개년 실적 추세에 근거하여 2025년 목표치를 전년대비 +3.5%p 도전적 상향 설정 완료',
        };
      }),
    }));
    showToast('✨ AI가 부적절한 투입·과정 지표를 지침 권장 「산출·결과 지표」 및 상향 목표치로 교정했습니다!');
  };

  // [AI 원클릭 보완 3] 공공보건의료위원회 구성·운영 요건 충족 시뮬레이션
  const handleAiFixCommittee = () => {
    setEval_pkg((prev) => ({
      ...prev,
      committeeData: {
        totalMembers: 18,
        govCount: 2,
        residentRepCount: Math.max(2, prev.committeeData.residentRepCount),
        consumerRepCount: Math.max(2, prev.committeeData.consumerRepCount),
        providerRepCount: Math.max(2, prev.committeeData.providerRepCount),
        expertCount: Math.max(2, prev.committeeData.expertCount),
        meetingHeldCount: Math.max(2, prev.committeeData.meetingHeldCount),
        agendaReflected: true,
        evidenceAttached: true,
        meetingSummary:
          '위원장 포함 18명(20명 이내) 및 5대 분야별 각 2명 이상 법정 구성요건을 완비하여 대면 심의를 완료하고, 심의의결서 및 계획 반영 대조표를 첨부함.',
      },
    }));
    showToast('✨ 공공보건의료위원회 5대 분야(각 2명 이상, 20명 이내) 및 심의 증빙 요건을 충족하여 정량 5.0점 만점으로 갱신되었습니다!');
  };

  // 파일 업로드 시뮬레이션 핸들러 (.hwp, .hwpx, .pdf, .docx)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fileName = file.name;
    // 파일명에 따라 적절한 프리셋 베이스에 기관명/파일명을 매핑하여 파싱 시뮬레이션
    setEval_pkg((prev) => ({
      ...prev,
      institutionName: fileName.replace(/\.(hwpx|hwp|pdf|docx)$/i, ''),
      submissionDate: new Date().toISOString().slice(0, 10).replace(/-/g, '. ') + '.',
    }));
    handleRunPipelineAnimation();
    showToast(`📄 '${fileName}' 문서에서 요약표·사업총괄표·추진실적·위원회 데이터를 AI로 자동 추출했습니다!`);
  };

  // 분야별 프로젝트 필드 수정 헬퍼
  const updateFieldProject = <K extends keyof 기관_시행계획_평가패키지['fieldProjects'][0]>(
    fieldId: 1 | 2 | 3,
    key: K,
    value: 기관_시행계획_평가패키지['fieldProjects'][0][K]
  ) => {
    setEval_pkg((prev) => ({
      ...prev,
      fieldProjects: prev.fieldProjects.map((fp) => (fp.fieldId === fieldId ? { ...fp, [key]: value } : fp)),
    }));
  };

  // 온라인 Google Gemini 실시간 심층 평가 실행
  const handleRunGeminiLiveReview = async () => {
    setIs_gemini_loading(true);
    setGemini_live_review(null);

    try {
      const prompt = `당신은 보건복지부 및 국립중앙의료원 공공보건의료지원센터의 『공공보건의료 시행계획 추진실적 평가위원회』 수석 평가위원입니다.
아래 제출된 공공기관의 시행계획 및 추진실적 평가 요약 데이터를 『2025년 공공보건의료 시행계획 수립 지침』 및 『2024년 공공보건의료 시행계획 추진실적 작성 지침』의 10대 평가지표(추진실적 70점 + 사업계획 30점 = 100점 만점) 기준에 따라 심층 심사평을 작성해주세요.

[평가 대상 기관]: ${eval_pkg.institutionName} (${eval_pkg.institutionType === 'sido' ? '시·도 지자체 - 1·2·3분야 평가' : '중앙행정기관·공공단체 - 1·2분야 평가'})
[AI 루브릭 산출 점수]: 총점 ${eval_result.totalScore100}점 / 100점 (${eval_result.finalGrade} 등급)
- 전년도 추진실적(70점 만점): ${eval_result.performanceScore70}점
- 당해 연도 사업계획(30점 만점): ${eval_result.planScore30}점 (공공보건의료위원회 정량 ${eval_result.quantitativeScore5}/5점 포함)
[1분야 대표사업]: ${eval_pkg.fieldProjects[0]?.projectName} (성과지표: ${eval_pkg.fieldProjects[0]?.indicatorName} [${eval_pkg.fieldProjects[0]?.indicatorType}], 예산집행: ${eval_pkg.fieldProjects[0]?.budgetExecuted}/${eval_pkg.fieldProjects[0]?.budgetPlanned}억원, 달성도: ${eval_pkg.fieldProjects[0]?.actualValue}/${eval_pkg.fieldProjects[0]?.targetValue}${eval_pkg.fieldProjects[0]?.unit})
[2분야 대표사업]: ${eval_pkg.fieldProjects[1]?.projectName} (성과지표: ${eval_pkg.fieldProjects[1]?.indicatorName} [${eval_pkg.fieldProjects[1]?.indicatorType}])

다음 4가지 목차로 명확하고 전문적인 공문서 개조식 심사평을 작성해주세요:
1. 【종합 심사평】 (제2차 공공보건의료 기본계획 연계성 및 총평)
2. 【주요 우수 사항】 (추진체계, 예산집행, 성과지표 달성도 측면)
3. 【감점 요인 및 보완 필요 사항】 (지침 기준 미흡점 지적)
4. 【차년도 시행계획 환류 권고사항】 (구체적 개선 대안 3가지)`;

      const res = await fetch('/api/llm/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: prompt,
          google_api_key: google_api_key || '',
          region_name: eval_pkg.institutionName,
          mode: 'policy_review',
        }),
      });
      if (!res.ok) throw new Error('API Error');
      const data = await res.json();
      const responseText = data.gemini?.response || data.local_sllm?.response;
      if (!responseText || responseText.includes('[안내: 구글 API 키 미입력 상태]')) {
        throw new Error('Fallback to built-in review');
      }
      setGemini_live_review(responseText);
    } catch (err: any) {
      setGemini_live_review(
        `[안내] 실시간 Gemini API 호출 중 일시적 오류가 발생하여 내장된 국립중앙의료원 표준 AI 심사 엔진 결과를 표시합니다.\n\n` +
          `1. 【종합 심사평】\n◦ ${eval_result.generatedOfficialReport.overallSummary}\n\n` +
          `2. 【주요 우수 사항】\n${eval_result.generatedOfficialReport.strengths.map((s) => `◦ ${s}`).join('\n')}\n\n` +
          `3. 【감점 요인 및 보완 필요 사항】\n${
            eval_result.generatedOfficialReport.weaknessesAndDeductions.length > 0
              ? eval_result.generatedOfficialReport.weaknessesAndDeductions.map((w) => `◦ ${w}`).join('\n')
              : '◦ 특이 감점 사항 없음 (지침 기준 충족)'
          }\n\n` +
          `4. 【차년도 시행계획 환류 권고사항】\n${eval_result.generatedOfficialReport.nextYearRecommendations
            .map((r) => `◦ ${r}`)
            .join('\n')}`
      );
    } finally {
      setIs_gemini_loading(false);
    }
  };

  // 평가결과서 클립보드 복사
  const handleCopyReport = () => {
    const reportText = [
      `====================================================================`,
      `『공공보건의료 시행계획 및 추진실적』 AI 종합 평가 결과보고서`,
      `====================================================================`,
      `■ 평가대상 기관: ${eval_result.institutionName} (${
        eval_result.institutionType === 'sido' ? '지방자치단체 [1·2·3분야]' : '중앙행정기관·공공단체 [1·2분야]'
      })`,
      `■ 소관 공공보건의료기관: ${eval_pkg.affiliatedHospitalsCount}개소 (${eval_pkg.affiliatedHospitalsSummary})`,
      `■ 최종 평가점수: ${eval_result.totalScore100}점 / 100점 만점 (최종 등급: 【${eval_result.finalGrade}】)`,
      `  - 전년도 추진실적 평가 (70점 만점): ${eval_result.performanceScore70}점`,
      `  - 당해 연도 시행계획 평가 (30점 만점): ${eval_result.planScore30}점 (위원회 정량평가 ${eval_result.quantitativeScore5}/5.0점 포함)`,
      ``,
      `[1. 항목별 세부 채점표]`,
      ...eval_result.itemScores.map(
        (item) =>
          `  • ${item.indicator.code} ${item.indicator.title} (${item.indicator.type}): ${item.totalScore}점 / ${item.totalMax}점 — ${item.aiDeductionReason}`
      ),
      ``,
      `[2. 종합 총평]`,
      `  ◦ ${eval_result.generatedOfficialReport.overallSummary}`,
      ``,
      `[3. 주요 강점 (우수한 점)]`,
      ...eval_result.generatedOfficialReport.strengths.map((s) => `  ◦ ${s}`),
      ``,
      `[4. 미흡한 점 및 감점 사유]`,
      ...(eval_result.generatedOfficialReport.weaknessesAndDeductions.length > 0
        ? eval_result.generatedOfficialReport.weaknessesAndDeductions.map((w) => `  ◦ ${w}`)
        : ['  ◦ 지침상 필수 요건 및 성과지표 기준을 모두 충족하여 주요 감점 사항 없음']),
      ``,
      `[5. 차년도 시행계획 수립 환류 권고의견 (법 제4조제6항 및 시행령 제4조제4항)]`,
      ...eval_result.generatedOfficialReport.nextYearRecommendations.map((r) => `  ◦ ${r}`),
    ].join('\n');

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(reportText);
      setIs_copied(true);
      setTimeout(() => setIs_copied(false), 2500);
      showToast('📋 공식 평가 결과보고서 전문이 클립보드에 복사되었습니다.');
    }
  };

  // 공식 평가 결과보고서 한컴 한글(HWP/HWPX) 파일 다운로드 핸들러
  const [is_exporting_hwp, setIs_exporting_hwp] = useState(false);

  const handleDownloadHwpReport = async () => {
    try {
      setIs_exporting_hwp(true);
      const title = `『${eval_pkg.institutionName} 공공보건의료 시행계획 추진실적 평가』 공식 결과보고서 (환류 통보문)`;
      const safeName = eval_pkg.institutionName.replace(/[/\\:*?"<>|]/g, '_');
      const fileName = `${safeName}_공공보건의료_시행계획_평가결과보고서.hwpx`;

      // 10대 세부 평가지표 테이블 행 생성
      const scoreRows: string[][] = [
        ...eval_result.itemScores.map((item, idx) => [
          item.indicator.category,
          `${idx + 1}. ${item.indicator.title}`,
          `${item.totalMax}점`,
          `${item.totalScore.toFixed(1)}점`,
          item.aiDeductionReason ? '감점 요인 확인' : '기준 충족',
        ]),
        [
          '합계 총점',
          '공식 평가지표 10대 항목 종합 합산',
          '100점',
          `${eval_result.totalScore100}점`,
          `최종 ${eval_result.finalGrade}등급`,
        ],
      ];

      const items: ReportItem[] = [
        { type: 'heading1', text: title },
        { type: 'spacer' },
        {
          type: 'box',
          title: '보건복지부 공공보건의료 시행계획 및 추진실적 공식 평가 결과',
          text: `평가 기관: ${eval_pkg.institutionName} | 최종 등급: ${eval_result.finalGrade}등급 | 획득 점수: ${eval_result.totalScore100}점 / 100점 만점\n소관 공공의료기관: ${eval_pkg.affiliatedHospitalsCount}개소 (${eval_pkg.affiliatedHospitalsSummary})\n평가 근거: 보건복지부·국립중앙의료원 공공보건의료 시행계획 수립 및 추진실적 평가 지침`,
        },
        { type: 'spacer' },
        { type: 'heading2', text: '【 1. 종합 평가점수 및 등급표 】' },
        {
          type: 'table',
          table: {
            headers: ['평가 영역', '세부 평가 항목', '배점', '취득 점수', '평가 상태'],
            rows: scoreRows,
            colWidths: [7000, 16000, 5000, 6520, 8000],
            alignments: ['center', 'left', 'center', 'center', 'center'],
          },
        },
        { type: 'spacer' },
        { type: 'heading2', text: '【 2. 종합 평가 총평 】' },
        {
          type: 'paragraph',
          text: eval_result.generatedOfficialReport.overallSummary,
        },
        { type: 'spacer' },
        { type: 'heading2', text: '【 3. 주요 우수 사항 (강점) 】' },
        ...eval_result.generatedOfficialReport.strengths.map((s) => ({
          type: 'bullet' as const,
          text: s,
        })),
        { type: 'spacer' },
        { type: 'heading2', text: '【 4. 미흡한 점 및 감점 요인 】' },
        ...(eval_result.generatedOfficialReport.weaknessesAndDeductions.length > 0
          ? eval_result.generatedOfficialReport.weaknessesAndDeductions.map((w) => ({
              type: 'bullet' as const,
              text: w,
            }))
          : [
              {
                type: 'paragraph' as const,
                text: '• 지침상 필수 요건 및 성과지표 기준을 모두 충족하여 주요 감점 사항 없음',
              },
            ]),
        { type: 'spacer' },
        { type: 'heading2', text: '【 5. 차년도 시행계획 수립 환류 권고안 (법정 환류) 】' },
        ...eval_result.generatedOfficialReport.nextYearRecommendations.map((r) => ({
          type: 'bullet' as const,
          text: r,
        })),
      ];

      if (gemini_live_review) {
        items.push({ type: 'spacer' });
        items.push({ type: 'heading2', text: '【 6. Google Gemini 수석 심사위원 실시간 심층 심사 의견서 】' });
        items.push({
          type: 'box',
          title: 'Google Gemini AI 심층 심사평 전문',
          text: gemini_live_review,
        });
      }

      await downloadHwpxDirect(title, items, fileName);
      showToast('📥 HWP 결과보고서 파일이 성공적으로 다운로드되었습니다.');
    } catch (err) {
      console.error('[HWP 결과보고서 저장 실패]', err);
      alert('HWP 파일 생성 중 오류가 발생했습니다.');
    } finally {
      setIs_exporting_hwp(false);
    }
  };

  // 등급별 배지 색상 헬퍼
  const getGradeBadgeStyle = (grade: string) => {
    switch (grade) {
      case '최우수':
        return 'bg-emerald-600 text-white border-emerald-500 shadow-sm';
      case '우수':
        return 'bg-blue-600 text-white border-blue-500 shadow-sm';
      case '양호':
        return 'bg-indigo-600 text-white border-indigo-500';
      case '보통':
        return 'bg-amber-500 text-white border-amber-400';
      default:
        return 'bg-rose-600 text-white border-rose-500';
    }
  };

  const activeFieldProject = useMemo(() => {
    const targetId = input_subtab === 'field1' ? 1 : input_subtab === 'field2' ? 2 : 3;
    return eval_pkg.fieldProjects.find((p) => p.fieldId === targetId) || eval_pkg.fieldProjects[0];
  }, [eval_pkg.fieldProjects, input_subtab]);

  const failedPreCheckCount = eval_result.preCheckResults.filter((r) => !r.passed).length;
  const inappropriateIndCount = eval_result.indicatorDiagnoses.filter((d) => !d.isAppropriate).length;

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* 상단 알림 토스트 */}
      {toast_message && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2.5 text-xs font-bold animate-in slide-in-from-bottom-4">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toast_message}</span>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 1. 최상단 헤더 배너: 법적 근거 + 공식 지침 2종 + 실시간 종합점수 요약  */}
      {/* ==================================================================== */}
      <div className="bg-gradient-to-br from-slate-900 via-[#131b2e] to-indigo-950 text-white p-5 sm:p-6 rounded-3xl border border-slate-800 shadow-lg relative overflow-hidden">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-5 relative z-10">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-blue-500/20 text-blue-300 border border-blue-400/30">
                공공보건의료법 제4조 · 시행령 제4조
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                2025 시행계획 수립지침 &amp; 2024 추진실적 작성지침 완벽 반영
              </span>
              <button
                type="button"
                onClick={() => setShow_guideline_modal(!show_guideline_modal)}
                className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/10 hover:bg-white/20 text-slate-200 border border-white/15 transition cursor-pointer flex items-center gap-1"
              >
                <BookOpen className="w-3 h-3 text-amber-300" />
                <span>평가지침 배점표·제출체계 원문 요약 {show_guideline_modal ? '접기 ▲' : '보기 ▼'}</span>
              </button>
            </div>

            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2.5 flex-wrap">
              <span>공공보건의료 시행계획 · 추진실적 AI 종합평가 센터</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              공공기관(중앙행정기관 8개소 · 시·도 17개소 · 공공단체)이 시행계획 및 추진실적 평가자료를 입력하면, 지침의{' '}
              <strong className="text-amber-300 font-bold">
                공식 평가표(추진실적 70점[6개 항목] + 사업계획 30점[4개 항목] = 100점 만점)
              </strong>
              로 평가점수·등급을 즉시 산출하고 평가 전 과정의 <strong className="text-blue-300 font-bold">6대 AI 지능형 서비스</strong>를 실연합니다.
            </p>
          </div>

          {/* 우측 실시간 총점 & 등급 스코어보드 카드 */}
          <div className="flex items-center gap-3 sm:gap-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 shrink-0">
            <div className="text-center px-2">
              <div className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">추진실적 (70점)</div>
              <div className="text-xl sm:text-2xl font-black text-white mt-0.5">
                {eval_result.performanceScore70}
                <span className="text-xs font-normal text-slate-400"> /70</span>
              </div>
            </div>
            <div className="text-slate-500 font-black text-lg">+</div>
            <div className="text-center px-2">
              <div className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">사업계획 (30점)</div>
              <div className="text-xl sm:text-2xl font-black text-white mt-0.5">
                {eval_result.planScore30}
                <span className="text-xs font-normal text-slate-400"> /30</span>
              </div>
            </div>
            <div className="text-slate-500 font-black text-lg">=</div>
            <div className="text-center px-3 py-1.5 rounded-xl bg-slate-950/60 border border-white/10">
              <div className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">종합 평가점수</div>
              <div className="text-2xl sm:text-3xl font-black text-amber-400">
                {eval_result.totalScore100}
                <span className="text-xs font-normal text-slate-400"> 점</span>
              </div>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-black border ${getGradeBadgeStyle(eval_result.finalGrade)}`}>
                {eval_result.finalGrade} 등급
              </span>
              <span className="text-[10px] text-slate-300">
                {eval_result.isAwardEligible ? '🏆 복지부 포상·공개 대상' : '차년도 환류·개선 대상'}
              </span>
            </div>
          </div>
        </div>

        {/* 지침 원문 요약 접이식 패널 */}
        {show_guideline_modal && (
          <div className="mt-5 pt-4 border-t border-white/15 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-200 animate-in fade-in">
            <div className="bg-slate-950/50 p-3.5 rounded-2xl border border-white/10 space-y-1.5">
              <div className="font-black text-amber-300 flex items-center gap-1.5">
                <Building2 className="w-4 h-4" />
                <span>1. 작성 대상기관 및 제출 기한 (법 제4조)</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                • <strong>중앙행정기관(8개소)</strong>: 경찰청, 고용노동부, 과기정통부, 교육부, 국가보훈부, 국방부, 국토교통부, 법무부 (소관 66개 병원)
                <br />• <strong>시·도지사(17개소)</strong>: 전국 17개 시·도 (지방의료원 등 소관 143개 병원)
                <br />• <strong>공공단체(1개소)</strong>: 대한적십자사(7개 병원), 보건복지부 소관 12개 국립병원 등 총 228개 공공보건의료기관
                <br />• <strong>제출 기한</strong>: 당해 시행계획 <strong>매년 1월 31일</strong> / 전년도 추진실적 <strong>매년 3월 31일</strong>
              </p>
            </div>

            <div className="bg-slate-950/50 p-3.5 rounded-2xl border border-white/10 space-y-1.5">
              <div className="font-black text-blue-300 flex items-center gap-1.5">
                <Scale className="w-4 h-4" />
                <span>2. 제2차 기본계획 3대 분야별 가중치 차등 배점</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                • <strong>정성평가(95점) + 정량평가(5점) = 총 100점 만점</strong>
                <br />• <strong>중앙행정기관·공공단체</strong>: 1분야(필수의료 확충, <strong>57점</strong>) + 2분야(역량 강화, <strong>38점</strong>) + 위원회 정량(<strong>5점</strong>) ※ 3분야 미평가
                <br />• <strong>시·도 지자체</strong>: 1분야(<strong>49점</strong>) + 2분야(<strong>27점</strong>) + 3분야(제도기반 강화, <strong>19점</strong>) + 위원회 정량(<strong>5점</strong>)
              </p>
            </div>

            <div className="bg-slate-950/50 p-3.5 rounded-2xl border border-white/10 space-y-1.5">
              <div className="font-black text-emerald-300 flex items-center gap-1.5">
                <Award className="w-4 h-4" />
                <span>3. 평가 등급 산정 및 결과 환류 (시행령 제4조)</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                • <strong>최우수</strong>(90점 이상) / <strong>우수</strong>(80~90점 미만) / <strong>양호</strong>(70~80점 미만) / <strong>보통</strong>(50~70점 미만) / <strong>미흡</strong>(50점 미만)
                <br />• <strong>결과 활용</strong>: 우수기관 보건복지부장관 포상 및 시행계획 원문 공개(www.ppm.or.kr), 평가결과 통보 후 <strong>차년도 시행계획에 의무 반영</strong>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ==================================================================== */}
      {/* 2. 공공기관 평가자료 선택기 (4종 실전 프리셋 + HWP/HWPX 업로드)         */}
      {/* ==================================================================== */}
      <div className="bg-white dark:bg-[#15161b] p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <span className="text-[11px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              STEP 0 · 평가대상 공공기관 및 제출자료 선택
            </span>
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-0.5">
              공공기관 평가자료 불러오기 또는 HWP/HWPX 계획서·실적보고서 업로드
            </h3>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <input
              ref={file_input_ref}
              type="file"
              accept=".hwp,.hwpx,.pdf,.docx,.xlsx"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => file_input_ref.current?.click()}
              className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold transition flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-blue-600" />
              <span>공문서(HWP/HWPX/PDF) 업로드 파싱</span>
            </button>

            <button
              type="button"
              onClick={handleRunPipelineAnimation}
              disabled={is_running_pipeline}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-black transition flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-60"
            >
              {is_running_pipeline ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>AI 6단계 평가 진행 중 ({pipeline_progress_step}/6)...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>AI 6단계 평가 전 과정 시연 실행</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 4대 기관 프리셋 카드 그리드 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {시행계획_평가_프리셋_목록.map((preset) => {
            const isSelected = selected_preset_id === preset.presetId;
            const previewEval = evaluateImplementationPlan(preset);
            return (
              <button
                key={preset.presetId}
                type="button"
                onClick={() => handleSelectPreset(preset.presetId)}
                className={`text-left p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                  isSelected
                    ? 'bg-blue-50/90 dark:bg-blue-950/50 border-blue-600 ring-2 ring-blue-500/20 shadow-sm'
                    : 'bg-slate-50/70 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 hover:border-blue-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                        preset.institutionType === 'sido'
                          ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                          : 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                      }`}
                    >
                      {preset.institutionType === 'sido' ? '시·도 (1·2·3분야)' : '중앙·공공 (1·2분야)'}
                    </span>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${getGradeBadgeStyle(previewEval.finalGrade)}`}>
                      {previewEval.totalScore100}점 ({previewEval.finalGrade})
                    </span>
                  </div>
                  <div className="font-black text-sm text-slate-900 dark:text-white truncate">
                    {preset.institutionName}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
                    소관 {preset.affiliatedHospitalsCount}개소 ({preset.affiliatedHospitalsSummary})
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200/70 dark:border-slate-800 flex items-center justify-between text-[10px] font-bold text-blue-600 dark:text-blue-400">
                  <span>
                    {preset.presetId === 'defect_verification'
                      ? '⚠️ 서식위반·투입지표 AI교정 체험용'
                      : preset.presetId === 'gyeongbuk_good'
                      ? '💡 과정지표·위원회 1명 미달 케이스'
                      : '✓ 지침 모범 준수 케이스'}
                  </span>
                  <span>{isSelected ? '선택됨 ●' : '불러오기 →'}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 3. 평가 진행 과정에서의 6단계 AI 서비스 파이프라인 네비게이터           */}
      {/* ==================================================================== */}
      <div className="bg-white dark:bg-[#15161b] p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-1 rounded-xl bg-purple-100 dark:bg-purple-950/70 text-purple-800 dark:text-purple-300 text-xs font-black flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5" />
              <span>평가 진행 과정별 AI 서비스 가능 영역 (6단계 파이프라인)</span>
            </span>
            <span className="text-xs text-slate-500">
              각 단계를 클릭하여 해당 단계의 AI 자동화 기능을 집중 체험하거나 [전체 통합 보기]로 한눈에 확인하세요.
            </span>
          </div>

          <button
            type="button"
            onClick={() => setActive_step_tab('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer shrink-0 ${
              active_step_tab === 'all'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            전체 6단계 한눈에 보기
          </button>
        </div>

        {/* 6단계 파이프라인 카드 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5">
          {AI_평가_6단계_정의.map((st) => {
            const isRunningThis = is_running_pipeline && pipeline_progress_step === st.step;
            const isDoneThis = !is_running_pipeline || pipeline_progress_step > st.step;
            const isTabActive = active_step_tab === st.id;

            return (
              <button
                key={st.id}
                type="button"
                onClick={() => setActive_step_tab(st.id)}
                className={`text-left p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                  isRunningThis
                    ? 'bg-blue-50 dark:bg-blue-950/70 border-blue-600 ring-2 ring-blue-500/30 shadow-md'
                    : isTabActive
                    ? 'bg-indigo-50/90 dark:bg-indigo-950/50 border-indigo-600 ring-2 ring-indigo-500/20'
                    : 'bg-slate-50/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 hover:border-blue-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[10px] font-black text-blue-600 dark:text-blue-400">
                      STAGE 0{st.step}
                    </span>
                    {isRunningThis ? (
                      <Loader2 className="w-3.5 h-3.5 text-blue-600 animate-spin" />
                    ) : isDoneThis ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    ) : null}
                  </div>
                  <div className="font-black text-xs text-slate-900 dark:text-white">
                    {st.title}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{st.sub}</div>
                </div>

                <div className="pt-2 border-t border-slate-200/70 dark:border-slate-800/80">
                  <div className="text-[10px] font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/50 px-2 py-1 rounded-lg leading-snug">
                    🤖 {st.aiRole}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ==================================================================== */}
      {/* STAGE 1: 공공기관 평가자료(추진실적·시행계획·위원회) 입력 및 실시간 편집 */}
      {/* ==================================================================== */}
      {(active_step_tab === 'all' || active_step_tab === 'step1_input') && (
        <div className="bg-white dark:bg-[#15161b] p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-lg bg-blue-600 text-white text-[11px] font-black">
                  STAGE 01 · 평가자료 입력
                </span>
                <span className="text-xs font-bold text-purple-700 dark:text-purple-300">
                  [AI 서비스] HWP/HWPX 서식 자동 추출 및 실시간 점수 연동 에디터
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-1">
                {eval_pkg.institutionName} — 2024년 추진실적(70점) &amp; 2025년 시행계획(30점) 제출자료 입력·수정
              </h3>
              <p className="text-xs text-slate-500">
                아래 예산집행액, 목표·실적 수치, 성과지표 유형(투입/과정/산출/결과), 위원회 인원수를 변경하면 우측 상단 총점과 하단 평가표가 <strong>실시간으로 재산출</strong>됩니다.
              </p>
            </div>

            {/* 기관 유형 전환 스위치 (시·도 vs 중앙행정기관·공공단체) */}
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shrink-0">
              <button
                type="button"
                onClick={() => setEval_pkg((p) => ({ ...p, institutionType: 'sido' }))}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  eval_pkg.institutionType === 'sido'
                    ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-xs font-black'
                    : 'text-slate-500'
                }`}
              >
                시·도 지자체 배점 (1·2·3분야)
              </button>
              <button
                type="button"
                onClick={() => setEval_pkg((p) => ({ ...p, institutionType: 'central_public' }))}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  eval_pkg.institutionType === 'central_public'
                    ? 'bg-white dark:bg-slate-800 text-purple-600 shadow-xs font-black'
                    : 'text-slate-500'
                }`}
              >
                중앙·공공단체 배점 (1·2분야)
              </button>
            </div>
          </div>

          {/* 분야 선택 서브탭 */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setInput_subtab('field1')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                input_subtab === 'field1'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              &lt;1분야&gt; 필수의료 제공 체계 확충 ({eval_pkg.institutionType === 'sido' ? '49점' : '57점'})
            </button>
            <button
              type="button"
              onClick={() => setInput_subtab('field2')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                input_subtab === 'field2'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              &lt;2분야&gt; 공공보건의료 역량 강화 ({eval_pkg.institutionType === 'sido' ? '27점' : '38점'})
            </button>
            {eval_pkg.institutionType === 'sido' && (
              <button
                type="button"
                onClick={() => setInput_subtab('field3')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  input_subtab === 'field3'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                &lt;3분야&gt; 공공보건의료 제도 기반 강화 (시·도 전용 19점)
              </button>
            )}
            <button
              type="button"
              onClick={() => setInput_subtab('committee')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                input_subtab === 'committee'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              [부록] 공공보건의료위원회 구성·운영 (정량 5점) &amp; 서식 요건
            </button>
          </div>

          {/* 1~3분야 사업 추진실적 & 시행계획 입력 폼 */}
          {input_subtab !== 'committee' && activeFieldProject && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-2">
              {/* 좌측 7열: 전년도 추진실적 양식 (1. 사업개요 / 2. 추진과정 / 3. 사업성과) */}
              <div className="lg:col-span-7 space-y-4 bg-slate-50/70 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span>[평가영역 1] 2024년 시행계획 추진실적 입력 (배점 70점 대상)</span>
                  </span>
                  <span className="text-[11px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 rounded-lg">
                    과제코드: {activeFieldProject.subTaskCode} ({activeFieldProject.isContinue})
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      세부 사업명 (요약표·총괄표·본문 일치 필수)
                    </label>
                    <input
                      type="text"
                      value={activeFieldProject.projectName}
                      onChange={(e) => updateFieldProject(activeFieldProject.fieldId, 'projectName', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      기본계획 세부과제 매핑
                    </label>
                    <select
                      value={activeFieldProject.subTaskCode}
                      onChange={(e) => updateFieldProject(activeFieldProject.fieldId, 'subTaskCode', e.target.value)}
                      className="w-full px-2.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white"
                    >
                      {제2차_기본계획_과제체계
                        .filter((t) => t.fieldId === activeFieldProject.fieldId)
                        .map((t) => (
                          <option key={t.subTaskCode} value={t.subTaskCode}>
                            {t.subTaskCode}: {t.subTaskName.slice(0, 22)}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                {/* 1.1 사업목적 및 내용 */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    1. 사업개요 — 사업목적 및 주요 사업내용 <span className="text-blue-600">[평가지표 1.1 적합성 (10점)]</span>
                  </label>
                  <textarea
                    rows={2}
                    value={activeFieldProject.purposeAndContent}
                    onChange={(e) => updateFieldProject(activeFieldProject.fieldId, 'purposeAndContent', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 leading-relaxed"
                  />
                </div>

                {/* 1.2 추진체계 및 예산집행 실적 */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  <div className="sm:col-span-6">
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      1-3. 추진체계 (수행주체·절차) <span className="text-blue-600">[지표 1.2 (10점)]</span>
                    </label>
                    <textarea
                      rows={2}
                      value={activeFieldProject.executionSystem}
                      onChange={(e) => updateFieldProject(activeFieldProject.fieldId, 'executionSystem', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      최종예산(A, 억원)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={activeFieldProject.budgetPlanned}
                      onChange={(e) =>
                        updateFieldProject(activeFieldProject.fieldId, 'budgetPlanned', parseFloat(e.target.value) || 0)
                      }
                      className="w-full px-2.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      집행예산(B, 억원)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={activeFieldProject.budgetExecuted}
                      onChange={(e) =>
                        updateFieldProject(activeFieldProject.fieldId, 'budgetExecuted', parseFloat(e.target.value) || 0)
                      }
                      className="w-full px-2.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold"
                    />
                  </div>
                  <div className="sm:col-span-2 flex flex-col justify-center bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400">집행률(B/A)</span>
                    <span className="text-sm font-black text-blue-600">
                      {activeFieldProject.budgetPlanned > 0
                        ? `${Math.round((activeFieldProject.budgetExecuted / activeFieldProject.budgetPlanned) * 1000) / 10}%`
                        : '0%'}
                    </span>
                  </div>
                </div>

                {/* 1.3 추진내용 및 사업관리(모니터링) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      2-1. 세부 추진내용 <span className="text-blue-600">[지표 1.3 적정성 (30점)]</span>
                    </label>
                    <textarea
                      rows={2}
                      value={activeFieldProject.executionContent}
                      onChange={(e) => updateFieldProject(activeFieldProject.fieldId, 'executionContent', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      2-2. 사업관리 (정기 모니터링 주기 및 결과)
                    </label>
                    <textarea
                      rows={2}
                      value={activeFieldProject.monitoringCycle}
                      onChange={(e) => updateFieldProject(activeFieldProject.fieldId, 'monitoringCycle', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                    />
                  </div>
                </div>

                {/* 1.5 자체평가 & 1.6 향후 개선방안 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      3-2. 자체평가 (부진요인 진단) <span className="text-blue-600">[지표 1.5 (10점)]</span>
                    </label>
                    <textarea
                      rows={2}
                      value={activeFieldProject.selfEvalWeakness}
                      onChange={(e) => updateFieldProject(activeFieldProject.fieldId, 'selfEvalWeakness', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      3-3. 향후 개선방안 <span className="text-blue-600">[지표 1.6 (5점)]</span>
                    </label>
                    <textarea
                      rows={2}
                      value={activeFieldProject.futureImprovement}
                      onChange={(e) => updateFieldProject(activeFieldProject.fieldId, 'futureImprovement', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* 우측 5열: 성과목표 달성도(1.4) & 2025년 차년도 사업계획(2.1~2.3) */}
              <div className="lg:col-span-5 space-y-4 bg-indigo-50/40 dark:bg-indigo-950/20 p-4 rounded-2xl border border-indigo-200/70 dark:border-indigo-900/40">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Target className="w-4 h-4 text-indigo-600" />
                    <span>[성과지표 &amp; 평가영역 2] 차년도 시행계획 (30점 대상)</span>
                  </span>
                </div>

                {/* 성과지표명 및 성격유형(투입/과정/산출/결과) 선택 */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                  <div className="sm:col-span-7">
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      주요 성과지표명 <span className="text-indigo-600">[지표 1.4(5점) &amp; 2.2(10점)]</span>
                    </label>
                    <input
                      type="text"
                      value={activeFieldProject.indicatorName}
                      onChange={(e) => updateFieldProject(activeFieldProject.fieldId, 'indicatorName', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold"
                    />
                  </div>
                  <div className="sm:col-span-5">
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      지표 성격 분류 (AI 자동판독)
                    </label>
                    <select
                      value={activeFieldProject.indicatorType}
                      onChange={(e) =>
                        updateFieldProject(activeFieldProject.fieldId, 'indicatorType', e.target.value as 성과지표_성격유형)
                      }
                      className={`w-full px-2.5 py-2 rounded-xl border text-xs font-black ${
                        activeFieldProject.indicatorType === '산출(Output)' ||
                        activeFieldProject.indicatorType === '결과(Outcome)'
                          ? 'border-emerald-400 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200'
                          : 'border-rose-400 bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-200'
                      }`}
                    >
                      <option value="투입(Input)">⚠️ 투입(Input) - 지양(감점)</option>
                      <option value="과정(Process)">⚠️ 과정(Process) - 지양(보완)</option>
                      <option value="산출(Output)">✅ 산출(Output) - 지침 권장</option>
                      <option value="결과(Outcome)">✅ 결과(Outcome) - 지침 최우선 권장</option>
                    </select>
                  </div>
                </div>

                {/* 목표(A) / 실적(B) / 달성률 */}
                <div className="grid grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      ’24년 목표(A)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={activeFieldProject.targetValue}
                      onChange={(e) =>
                        updateFieldProject(activeFieldProject.fieldId, 'targetValue', parseFloat(e.target.value) || 0)
                      }
                      className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      ’24년 실적(B)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={activeFieldProject.actualValue}
                      onChange={(e) =>
                        updateFieldProject(activeFieldProject.fieldId, 'actualValue', parseFloat(e.target.value) || 0)
                      }
                      className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold"
                    />
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-center flex flex-col justify-center">
                    <span className="text-[10px] text-slate-400">달성률(B/A)</span>
                    <span className="text-sm font-black text-indigo-600">
                      {activeFieldProject.targetValue > 0
                        ? `${Math.round((activeFieldProject.actualValue / activeFieldProject.targetValue) * 1000) / 10}%`
                        : '0%'}
                    </span>
                  </div>
                </div>

                {/* 2.1 계획수립 충실성 */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    시행계획 1 &amp; 3장: 현황분석 연계 및 18개 세부과제 충실성 <span className="text-indigo-600">[지표 2.1 (10점)]</span>
                  </label>
                  <textarea
                    rows={2}
                    value={activeFieldProject.nextYearAnalysisAndPlan}
                    onChange={(e) =>
                      updateFieldProject(activeFieldProject.fieldId, 'nextYearAnalysisAndPlan', e.target.value)
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                  />
                </div>

                {/* 2.2 최근 3개년 추세 및 상향 목표치 설정 근거 */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    시행계획 3.2: ’21~’25년 성과지표 목표치 추세 (상향 설정 여부) <span className="text-indigo-600">[지표 2.2 (10점)]</span>
                  </label>
                  <textarea
                    rows={2}
                    value={activeFieldProject.nextYearTargetTrend}
                    onChange={(e) =>
                      updateFieldProject(activeFieldProject.fieldId, 'nextYearTargetTrend', e.target.value)
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                  />
                </div>

                {/* 2.3 전년도 평가결과에 대한 개선 노력 */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    시행계획 2장: 전년도 평가결과 의견 반영 및 개선방향 <span className="text-indigo-600">[지표 2.3 (5점)]</span>
                  </label>
                  <textarea
                    rows={2}
                    value={activeFieldProject.prevEvalFeedbackReflection}
                    onChange={(e) =>
                      updateFieldProject(activeFieldProject.fieldId, 'prevEvalFeedbackReflection', e.target.value)
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 위원회 구성·운영 및 서식 사전요건 입력 탭 */}
          {input_subtab === 'committee' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 pt-2">
              <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-900 dark:text-white">
                    ❶ (시·도) 공공보건의료위원회 분야별 위원 수 입력 (지침 부록 2.4 정량 5점)
                  </span>
                  <button
                    type="button"
                    onClick={handleAiFixCommittee}
                    className="px-2.5 py-1 rounded-lg bg-blue-600 text-white text-[11px] font-bold hover:bg-blue-700 cursor-pointer"
                  >
                    법정 기준(각 2명 이상) 자동 맞춤
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">총 위원 수 (20명 이내)</label>
                    <input
                      type="number"
                      value={eval_pkg.committeeData.totalMembers}
                      onChange={(e) =>
                        setEval_pkg((p) => ({
                          ...p,
                          committeeData: { ...p.committeeData, totalMembers: parseInt(e.target.value) || 0 },
                        }))
                      }
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">① 공무원(소속구성원)</label>
                    <input
                      type="number"
                      value={eval_pkg.committeeData.govCount}
                      onChange={(e) =>
                        setEval_pkg((p) => ({
                          ...p,
                          committeeData: { ...p.committeeData, govCount: parseInt(e.target.value) || 0 },
                        }))
                      }
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">② 지역주민 대표 (≥2명)</label>
                    <input
                      type="number"
                      value={eval_pkg.committeeData.residentRepCount}
                      onChange={(e) =>
                        setEval_pkg((p) => ({
                          ...p,
                          committeeData: { ...p.committeeData, residentRepCount: parseInt(e.target.value) || 0 },
                        }))
                      }
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">③ 수요자 대표 (≥2명)</label>
                    <input
                      type="number"
                      value={eval_pkg.committeeData.consumerRepCount}
                      onChange={(e) =>
                        setEval_pkg((p) => ({
                          ...p,
                          committeeData: { ...p.committeeData, consumerRepCount: parseInt(e.target.value) || 0 },
                        }))
                      }
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">④ 공급자 대표 (≥2명)</label>
                    <input
                      type="number"
                      value={eval_pkg.committeeData.providerRepCount}
                      onChange={(e) =>
                        setEval_pkg((p) => ({
                          ...p,
                          committeeData: { ...p.committeeData, providerRepCount: parseInt(e.target.value) || 0 },
                        }))
                      }
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">⑤ 학식·경험 전문가 (≥2명)</label>
                    <input
                      type="number"
                      value={eval_pkg.committeeData.expertCount}
                      onChange={(e) =>
                        setEval_pkg((p) => ({
                          ...p,
                          committeeData: { ...p.committeeData, expertCount: parseInt(e.target.value) || 0 },
                        }))
                      }
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-2 text-xs">
                  <label className="flex items-center gap-1.5 font-bold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={eval_pkg.committeeData.agendaReflected}
                      onChange={(e) =>
                        setEval_pkg((p) => ({
                          ...p,
                          committeeData: { ...p.committeeData, agendaReflected: e.target.checked },
                        }))
                      }
                    />
                    <span>심의 의결과제 계획 반영 완료</span>
                  </label>
                  <label className="flex items-center gap-1.5 font-bold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={eval_pkg.committeeData.evidenceAttached}
                      onChange={(e) =>
                        setEval_pkg((p) => ({
                          ...p,
                          committeeData: { ...p.committeeData, evidenceAttached: e.target.checked },
                        }))
                      }
                    />
                    <span>회의록 / 심의의결서 증빙 첨부 완료</span>
                  </label>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2.5 text-xs">
                <div className="font-black text-slate-900 dark:text-white">
                  ❷ 제출문서 작성지침 준수 상태 토글 (체크 해제 시 감점·사전검증 적발 시뮬레이션)
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={eval_pkg.preCheckFlags.summaryTableMatched}
                    onChange={(e) =>
                      setEval_pkg((p) => ({
                        ...p,
                        preCheckFlags: { ...p.preCheckFlags, summaryTableMatched: e.target.checked },
                      }))
                    }
                  />
                  <span>요약표 · ①사업총괄표 · ③본문 사업명 100% 일치</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={eval_pkg.fieldProjects[0]?.hasDesignatedCenterReport ?? true}
                    onChange={(e) => updateFieldProject(1, 'hasDesignatedCenterReport', e.target.checked)}
                  />
                  <span>(시·도 필수) 1분야-2-1에 지정센터(권역응급·권역외상·공공전문진료센터) 운영실적 포함</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={eval_pkg.preCheckFlags.prevReportAllIncluded}
                    onChange={(e) =>
                      setEval_pkg((p) => ({
                        ...p,
                        preCheckFlags: { ...p.preCheckFlags, prevReportAllIncluded: e.target.checked },
                      }))
                    }
                  />
                  <span>전년도 평가 결과보고서 전체 평가의견 누락 없이 기재 및 미반영 사유 작성</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={eval_pkg.preCheckFlags.excludedTaskReasonProvided}
                    onChange={(e) =>
                      setEval_pkg((p) => ({
                        ...p,
                        preCheckFlags: { ...p.preCheckFlags, excludedTaskReasonProvided: e.target.checked },
                      }))
                    }
                  />
                  <span>계획 수립 제외 과제(3.3)에 대한 구체적 제외 근거 제시</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={eval_pkg.preCheckFlags.isBulletPointFormat && eval_pkg.preCheckFlags.blueGuideTextRemoved}
                    onChange={(e) =>
                      setEval_pkg((p) => ({
                        ...p,
                        preCheckFlags: {
                          ...p.preCheckFlags,
                          isBulletPointFormat: e.target.checked,
                          blueGuideTextRemoved: e.target.checked,
                        },
                      }))
                    }
                  />
                  <span>개조식 작성 원칙 준수 및 서식 내 파란색 작성안내 주석 삭제 완료</span>
                </label>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================================================================== */}
      {/* STAGE 2: [AI 서비스 ①] 제출서류·작성서식 지침 준수 자동 사전검증       */}
      {/* ==================================================================== */}
      {(active_step_tab === 'all' || active_step_tab === 'step2_precheck') && (
        <div className="bg-white dark:bg-[#15161b] p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-lg bg-indigo-600 text-white text-[11px] font-black">
                  STAGE 02 · AI 사전검증 (Pre-Check AI)
                </span>
                <span className="text-xs font-bold text-purple-700 dark:text-purple-300">
                  [AI 서비스 가능 부분 ①] 제출 전 지침 필수요건 위반·누락 자동 스캔 및 원클릭 보완
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-1">
                제출서식 및 작성지침 준수 자동 사전검증 리포트
              </h3>
            </div>

            <div className="flex items-center gap-2">
              {failedPreCheckCount > 0 ? (
                <button
                  type="button"
                  onClick={handleAiFixPreCheckAll}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black transition flex items-center gap-1.5 shadow-sm cursor-pointer animate-pulse"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>AI로 지침 위반·누락 {failedPreCheckCount}건 원클릭 일괄 보완</span>
                </button>
              ) : (
                <span className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-black border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>6대 필수 지침 요건 100% 충족</span>
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {eval_result.preCheckResults.map((pc) => (
              <div
                key={pc.id}
                className={`p-3.5 rounded-2xl border text-xs space-y-2 ${
                  pc.passed
                    ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200/80 dark:border-emerald-900/40'
                    : 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800 ring-1 ring-rose-400/30'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                    {pc.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    )}
                    <span>{pc.ruleTitle}</span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 ${
                      pc.passed
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200'
                        : 'bg-rose-600 text-white'
                    }`}
                  >
                    {pc.passed ? '적정' : '보완필요'}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 font-medium">근거: {pc.guidelineRef}</div>
                <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed">{pc.findingDetail}</p>
                {!pc.passed && (
                  <div className="pt-1.5 border-t border-rose-200/70 dark:border-rose-800/60 text-[11px] text-rose-800 dark:text-rose-300 font-semibold">
                    💡 <strong>AI 보완 제안:</strong> {pc.aiAutoFixSuggestion}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* STAGE 3: [AI 서비스 ②·③] 성과지표 적절성 진단 & 위원회 정량 5점 채점  */}
      {/* ==================================================================== */}
      {(active_step_tab === 'all' || active_step_tab === 'step3_indicator_committee') && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* 좌측 7열: AI 서비스 ② 성과지표 적절성 판독기 */}
          <div className="lg:col-span-7 bg-white dark:bg-[#15161b] p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="px-2.5 py-0.5 rounded-lg bg-blue-600 text-white text-[10px] font-black">
                  STAGE 03-A · 성과지표 적절성 AI 진단 (Indicator AI)
                </span>
                <h3 className="text-base font-black text-slate-900 dark:text-white mt-1">
                  지침 제3장(p.26~27) 성과지표 성격 분류 (투입·과정 지양 → 산출·결과 권장)
                </h3>
              </div>

              {inappropriateIndCount > 0 && (
                <button
                  type="button"
                  onClick={handleAiUpgradeIndicators}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black transition flex items-center gap-1.5 shadow-sm cursor-pointer shrink-0"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>부적절 지표({inappropriateIndCount}건) 산출·결과 지표로 AI 교정</span>
                </button>
              )}
            </div>

            <div className="space-y-3">
              {eval_result.indicatorDiagnoses.map((diag) => (
                <div
                  key={diag.fieldId}
                  className={`p-3.5 rounded-2xl border text-xs space-y-2 ${
                    diag.isAppropriate
                      ? 'bg-slate-50/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800'
                      : 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="font-black text-slate-900 dark:text-white">
                      &lt;{diag.fieldId}분야&gt; {diag.currentIndicator}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
                          diag.isAppropriate
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-rose-600 text-white'
                        }`}
                      >
                        현재 분류: {diag.currentType}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        달성률 {diag.achievementRate}%
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-600 dark:text-slate-300">{diag.guidelineDiagnosis}</p>

                  {!diag.isAppropriate && (
                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800/70 space-y-1">
                      <div className="text-[11px] font-black text-blue-700 dark:text-blue-300 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>AI 추천 대체 지표 ({diag.recommendedType}): {diag.recommendedIndicator}</span>
                      </div>
                      <div className="text-[10px] text-slate-500">추천 산식: {diag.recommendedFormula}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 우측 5열: AI 서비스 ③ 공공보건의료위원회 구성·운영 정량평가 (5점 만점) */}
          <div className="lg:col-span-5 bg-white dark:bg-[#15161b] p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="px-2.5 py-0.5 rounded-lg bg-emerald-600 text-white text-[10px] font-black">
                  STAGE 03-B · 위원회 정량채점 (5점 만점)
                </span>
                <h3 className="text-base font-black text-slate-900 dark:text-white mt-1">
                  평가지표 2.4 공공보건의료위원회 자동 채점
                </h3>
              </div>

              <div className="text-right">
                <div className="text-xl font-black text-emerald-600">
                  {eval_result.committeeResult.calculatedScore} <span className="text-xs text-slate-400">/ 5.0점</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900">
                <span className="font-bold">위원장 포함 총 위원 수 (20명 이내 기준)</span>
                <span
                  className={`font-black ${
                    eval_result.committeeResult.isTotalWithin20 ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  총 {eval_pkg.committeeData.totalMembers}명 (
                  {eval_result.committeeResult.isTotalWithin20 ? '적정 ✓' : '초과 ✗'})
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {eval_result.committeeResult.categoryCheck.map((cat) => (
                  <div
                    key={cat.label}
                    className={`p-2.5 rounded-xl border flex items-center justify-between ${
                      cat.passed
                        ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40'
                        : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800'
                    }`}
                  >
                    <span className="font-semibold text-[11px]">{cat.label}</span>
                    <span className={`font-black text-[11px] ${cat.passed ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-600'}`}>
                      {cat.count}명 (기준 ≥{cat.requiredMin}) {cat.passed ? '✓' : '✗'}
                    </span>
                  </div>
                ))}
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                <div className="font-bold text-slate-900 dark:text-white text-[11px]">🤖 AI 정량 채점 판정 근거</div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  {eval_result.committeeResult.aiComment}
                </p>
                {eval_result.committeeResult.calculatedScore < 5 && (
                  <button
                    type="button"
                    onClick={handleAiFixCommittee}
                    className="mt-1.5 px-3 py-1 rounded-lg bg-emerald-600 text-white text-[11px] font-bold hover:bg-emerald-700 cursor-pointer"
                  >
                    위원 위촉 보완 시뮬레이션 (5.0점 만점 전환)
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* STAGE 4: [AI 서비스 ④] 지침 공식 평가표 (100점 만점, 10대 항목)        */}
      {/* ==================================================================== */}
      {(active_step_tab === 'all' || active_step_tab === 'step4_scorecard') && (
        <div className="bg-white dark:bg-[#15161b] p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-lg bg-blue-600 text-white text-[11px] font-black">
                  STAGE 04 · 지침 &lt;붙임 1, 2&gt; 공식 평가표 (100점 만점)
                </span>
                <span className="text-xs font-bold text-purple-700 dark:text-purple-300">
                  [AI 서비스 가능 부분 ④] 10대 평가지표 × 3대 분야 가중치 자동 산출 &amp; 평가위원 수동 조정(Human-in-the-Loop)
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-1">
                {eval_pkg.institutionName} 공공보건의료 시행계획 및 추진실적 공식 채점표
              </h3>
              <p className="text-xs text-slate-500">
                각 분야의 5단계 척도 버튼(<strong>수 100% · 우 85% · 미 70% · 양 55% · 가 40%</strong>)을 클릭하면 평가위원 조정 점수가 즉시 반영됩니다.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {Object.keys(manual_overrides).length > 0 && (
                <button
                  type="button"
                  onClick={() => setManual_overrides({})}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 cursor-pointer flex items-center gap-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>AI 초벌채점 원복</span>
                </button>
              )}
              <div className="px-3.5 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-black">
                배점 기준: {eval_pkg.institutionType === 'sido' ? '시·도 지자체 (1·2·3분야 + 공통)' : '중앙·공공단체 (1·2분야 + 공통)'}
              </div>
            </div>
          </div>

          {/* 공식 평가표 테이블 */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-y border-slate-200 dark:border-slate-800">
                  <th className="py-3 px-3 font-black">평가분야</th>
                  <th className="py-3 px-3 font-black">평가지표 (10대 항목)</th>
                  <th className="py-3 px-2 text-center font-black">유형</th>
                  <th className="py-3 px-2 text-center font-black">총 배점</th>
                  <th className="py-3 px-3 text-center font-black bg-blue-50/60 dark:bg-blue-950/30">
                    1분야 (필수의료 확충)
                  </th>
                  <th className="py-3 px-3 text-center font-black bg-indigo-50/60 dark:bg-indigo-950/30">
                    2분야 (역량 강화)
                  </th>
                  {eval_pkg.institutionType === 'sido' && (
                    <th className="py-3 px-3 text-center font-black bg-purple-50/60 dark:bg-purple-950/30">
                      3분야 (제도 기반 강화)
                    </th>
                  )}
                  <th className="py-3 px-3 text-center font-black bg-amber-50/70 dark:bg-amber-950/30">
                    산출 점수
                  </th>
                  <th className="py-3 px-3 font-black min-w-[260px]">
                    AI 원문 근거 하이라이트 및 감점·가점 판정 사유
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/70 dark:divide-slate-800">
                {eval_result.itemScores.map((row) => {
                  const isQuant = row.indicator.id === '2.4';
                  const scales: 루브릭_척도_등급[] = ['수', '우', '미', '양', '가'];

                  return (
                    <tr key={row.indicator.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/40 transition">
                      <td className="py-3 px-3 font-bold text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {row.indicator.category}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-black text-slate-900 dark:text-white">
                          {row.indicator.code} {row.indicator.title}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          🤖 {row.indicator.aiServicePoint}
                        </div>
                      </td>
                      <td className="py-3 px-2 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
                            isQuant
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                          }`}
                        >
                          {row.indicator.type}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-center font-black text-slate-900 dark:text-white">
                        {row.totalMax}점
                      </td>

                      {/* 1분야 채점 셀 */}
                      <td className="py-3 px-2.5 text-center bg-blue-50/20 dark:bg-blue-950/10">
                        {isQuant ? (
                          <span className="text-[11px] text-slate-400">공통 5점</span>
                        ) : (
                          <div className="space-y-1">
                            <div className="font-black text-blue-700 dark:text-blue-300">
                              {row.field1Score} <span className="text-[10px] font-normal text-slate-400">/ {row.field1Max}점</span>
                            </div>
                            <div className="flex items-center justify-center gap-0.5">
                              {scales.map((g) => (
                                <button
                                  key={g}
                                  type="button"
                                  onClick={() =>
                                    setManual_overrides((prev) => ({
                                      ...prev,
                                      [row.indicator.id]: { ...prev[row.indicator.id], field1: g },
                                    }))
                                  }
                                  className={`w-5 h-5 rounded text-[10px] font-black cursor-pointer transition ${
                                    row.field1Grade === g
                                      ? 'bg-blue-600 text-white'
                                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200'
                                  }`}
                                >
                                  {g}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </td>

                      {/* 2분야 채점 셀 */}
                      <td className="py-3 px-2.5 text-center bg-indigo-50/20 dark:bg-indigo-950/10">
                        {isQuant ? (
                          <span className="text-[11px] text-slate-400">-</span>
                        ) : (
                          <div className="space-y-1">
                            <div className="font-black text-indigo-700 dark:text-indigo-300">
                              {row.field2Score} <span className="text-[10px] font-normal text-slate-400">/ {row.field2Max}점</span>
                            </div>
                            <div className="flex items-center justify-center gap-0.5">
                              {scales.map((g) => (
                                <button
                                  key={g}
                                  type="button"
                                  onClick={() =>
                                    setManual_overrides((prev) => ({
                                      ...prev,
                                      [row.indicator.id]: { ...prev[row.indicator.id], field2: g },
                                    }))
                                  }
                                  className={`w-5 h-5 rounded text-[10px] font-black cursor-pointer transition ${
                                    row.field2Grade === g
                                      ? 'bg-indigo-600 text-white'
                                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200'
                                  }`}
                                >
                                  {g}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </td>

                      {/* 3분야 채점 셀 (시·도만 표시) */}
                      {eval_pkg.institutionType === 'sido' && (
                        <td className="py-3 px-2.5 text-center bg-purple-50/20 dark:bg-purple-950/10">
                          {isQuant ? (
                            <span className="text-[11px] text-slate-400">-</span>
                          ) : (
                            <div className="space-y-1">
                              <div className="font-black text-purple-700 dark:text-purple-300">
                                {row.field3Score} <span className="text-[10px] font-normal text-slate-400">/ {row.field3Max}점</span>
                              </div>
                              <div className="flex items-center justify-center gap-0.5">
                                {scales.map((g) => (
                                  <button
                                    key={g}
                                    type="button"
                                    onClick={() =>
                                      setManual_overrides((prev) => ({
                                        ...prev,
                                        [row.indicator.id]: { ...prev[row.indicator.id], field3: g },
                                      }))
                                    }
                                    className={`w-5 h-5 rounded text-[10px] font-black cursor-pointer transition ${
                                      row.field3Grade === g
                                        ? 'bg-purple-600 text-white'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200'
                                    }`}
                                  >
                                    {g}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </td>
                      )}

                      {/* 항목 합계 점수 */}
                      <td className="py-3 px-3 text-center bg-amber-50/30 dark:bg-amber-950/10">
                        <div className="text-sm font-black text-slate-900 dark:text-white">
                          {row.totalScore} <span className="text-[10px] font-normal text-slate-400">/ {row.totalMax}</span>
                        </div>
                      </td>

                      {/* AI 원문 근거 하이라이트 및 판정 사유 */}
                      <td className="py-3 px-3 space-y-1">
                        <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
                          {row.aiDeductionReason}
                        </div>
                        <div className="text-[10px] text-slate-500 bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded-lg truncate max-w-md">
                          📌 원문 근거: {row.aiEvidenceHighlight}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-slate-900 text-white font-black text-xs">
                  <td colSpan={3} className="py-3.5 px-3">
                    총계 (추진실적 70점 + 사업계획 30점 = 100점 만점)
                  </td>
                  <td className="py-3.5 px-2 text-center">100점</td>
                  <td className="py-3.5 px-3 text-center text-blue-300">
                    1분야: {eval_result.field1TotalScore} / {eval_result.field1MaxScore}점
                  </td>
                  <td className="py-3.5 px-3 text-center text-indigo-300">
                    2분야: {eval_result.field2TotalScore} / {eval_result.field2MaxScore}점
                  </td>
                  {eval_pkg.institutionType === 'sido' && (
                    <td className="py-3.5 px-3 text-center text-purple-300">
                      3분야: {eval_result.field3TotalScore} / {eval_result.field3MaxScore}점
                    </td>
                  )}
                  <td className="py-3.5 px-3 text-center text-amber-400 text-sm">
                    {eval_result.totalScore100}점 ({eval_result.finalGrade})
                  </td>
                  <td className="py-3.5 px-3 text-[11px] text-slate-300">
                    정성평가 {eval_result.qualitativeScore95}/95점 + 위원회 정량평가 {eval_result.quantitativeScore5}/5점
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* STAGE 5: [AI 서비스 ⑤] 평가소위원회(5인) 점수 편차 탐지 & 이견 조정   */}
      {/* ==================================================================== */}
      {(active_step_tab === 'all' || active_step_tab === 'step5_consensus') && (
        <div className="bg-white dark:bg-[#15161b] p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-lg bg-amber-600 text-white text-[11px] font-black">
                STAGE 05 · 소위원회 이견 조정 AI (Consensus AI)
              </span>
              <span className="text-xs font-bold text-purple-700 dark:text-purple-300">
                [AI 서비스 가능 부분 ⑤] 지침 제2장(p.25) 5인 평가소위원회 위원 간 채점 편차 자동 감지 및 총괄평가위원회 중재안 도출
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-1">
              평가소위원회(학계·임상·정책·지원센터·수요자 5인) 채점 편차 분석 및 AI 중재 브리핑
            </h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {eval_result.subcommitteeDisputes.map((disp) => (
              <div
                key={disp.indicatorCode}
                className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-3 text-xs"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="font-black text-sm text-slate-900 dark:text-white">
                    지표 {disp.indicatorCode} {disp.indicatorTitle}
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                      disp.isDisputed
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    }`}
                  >
                    최대 편차 {disp.varianceGap}점 {disp.isDisputed ? '(총괄위 이견조정 대상)' : '(합의 범위 내)'}
                  </span>
                </div>

                <div className="space-y-1.5">
                  {disp.committeeScores.map((c) => (
                    <div
                      key={c.reviewerName}
                      className="flex items-center justify-between gap-2 bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200/70 dark:border-slate-800"
                    >
                      <div className="min-w-0">
                        <span className="font-bold text-slate-900 dark:text-white">{c.reviewerName}</span>
                        <span className="text-[10px] text-slate-400 ml-1.5">({c.specialty})</span>
                        <p className="text-[11px] text-slate-500 truncate">{c.comment}</p>
                      </div>
                      <span className="font-black text-blue-600 dark:text-blue-400 shrink-0">
                        {c.score} / {disp.maxScore}점
                      </span>
                    </div>
                  ))}
                </div>

                <div className="p-3 rounded-xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/70 text-[11px] text-amber-950 dark:text-amber-200 leading-relaxed">
                  <strong>🤖 AI 총괄평가위원회 중재 의견:</strong> {disp.aiMediationOpinion}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* STAGE 6: [AI 서비스 ⑥] 공식 평가결과보고서 & 차년도 환류의견 + Gemini  */}
      {/* ==================================================================== */}
      {(active_step_tab === 'all' || active_step_tab === 'step6_report') && (
        <div className="bg-white dark:bg-[#15161b] p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-lg bg-emerald-600 text-white text-[11px] font-black">
                  STAGE 06 · 평가결과서 및 환류의견 자동 생성 (Report &amp; LLM AI)
                </span>
                <span className="text-xs font-bold text-purple-700 dark:text-purple-300">
                  [AI 서비스 가능 부분 ⑥] 보건복지부 통보용 결과보고서(총평·우수사항·미흡사항·차년도 개선권고) 생성 및 Gemini 실시간 심사
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-1">
                『{eval_pkg.institutionName} 공공보건의료 시행계획 추진실적 평가』 공식 결과보고서 (환류 통보문)
              </h3>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleRunGeminiLiveReview}
                disabled={is_gemini_loading}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-black transition flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-60"
              >
                {is_gemini_loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Gemini 심층 심사평 생성 중...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Google Gemini 실시간 심층 심사 실행</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleCopyReport}
                className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold transition flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 cursor-pointer"
              >
                {is_copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{is_copied ? '복사 완료!' : '결과보고서 전문 복사'}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadHwpReport}
                disabled={is_exporting_hwp}
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                title="공식 결과보고서(환류 통보문)를 한컴 한글(HWP/HWPX) 파일로 즉시 다운로드"
              >
                {is_exporting_hwp ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>HWP 생성 중...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>hwp 저장</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 공식 평가 결과보고서 본문 카드 */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-4 text-xs">
            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div className="font-black text-slate-900 dark:text-white text-sm mb-1">
                1. 종합 평가 총평 (최종 등급: {eval_result.finalGrade} · {eval_result.totalScore100}점)
              </div>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                {eval_result.generatedOfficialReport.overallSummary}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* 강점 */}
              <div className="p-3.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 space-y-2">
                <div className="font-black text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>2. 주요 우수 사항 (강점)</span>
                </div>
                <ul className="space-y-1.5 text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed">
                  {eval_result.generatedOfficialReport.strengths.map((s, i) => (
                    <li key={i}>• {s}</li>
                  ))}
                </ul>
              </div>

              {/* 약점 및 감점 사유 */}
              <div className="p-3.5 rounded-xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 space-y-2">
                <div className="font-black text-rose-900 dark:text-rose-300 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>3. 미흡한 점 및 감점 요인</span>
                </div>
                <ul className="space-y-1.5 text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed">
                  {eval_result.generatedOfficialReport.weaknessesAndDeductions.length > 0 ? (
                    eval_result.generatedOfficialReport.weaknessesAndDeductions.map((w, i) => <li key={i}>• {w}</li>)
                  ) : (
                    <li>• 지침의 필수 서식 요건, 성과지표 적절성, 위원회 구성 기준을 모두 충족하여 주요 감점 요인 없음</li>
                  )}
                </ul>
              </div>

              {/* 차년도 시행계획 환류 권고 */}
              <div className="p-3.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 space-y-2">
                <div className="font-black text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span>4. 차년도 시행계획 반영 권고안 (법정 환류)</span>
                </div>
                <ul className="space-y-1.5 text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed">
                  {eval_result.generatedOfficialReport.nextYearRecommendations.map((r, i) => (
                    <li key={i}>• {r}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 온라인 Gemini 심층 심사 결과 표시 영역 */}
            {gemini_live_review && (
              <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/40 dark:to-indigo-950/40 border border-purple-300 dark:border-purple-800 space-y-2 animate-in fade-in">
                <div className="font-black text-purple-900 dark:text-purple-200 flex items-center gap-1.5 text-xs">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <span>Google Gemini 수석 평가위원 실시간 심층 심사 의견서</span>
                </div>
                <pre className="whitespace-pre-wrap font-sans text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
                  {gemini_live_review}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
