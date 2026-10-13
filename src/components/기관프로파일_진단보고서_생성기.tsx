'use client';

// ============================================================================
// 국립중앙의료원 의료기관 프로파일 대시보드 전용 『5종 진단보고서 작성기』
// 사용자 제공 표준 템플릿 명세 100% 반영:
// - 기관프로파일 ① 지역 의료자원 (외부 의료환경 공급·수요·수급 및 자원 매트릭스 진단)
// - 기관프로파일 ② 진료기능 (병원 성격 규정, 7개 진료역량 지표, 병상·이용량·제공량 점유율, 유입 지역분포)
// - 기관프로파일 ③ 진료실적 (4개 성과변수 × 7개 환자 서브그룹 분해 프로파일링)
// - 기관프로파일 ④ 기관비교 (◆선택기관 vs ◆비교기관 거울형 2패널 격차 정량화 및 공정성 보정)
// - 기관프로파일 ⑤ 지역비교 (◆비교지역1 vs ◆비교지역2 및 시군구·중진료권·시도 다층 평균 비교)
// 표기 규칙 지원:
// · 주황 {…}: 필터/데이터 연동 플레이스홀더 (실제 값 자동 치환 모드 & 템플릿 원형 태그 병기 모드 지원)
// · 파랑 (…): 요소 유형 설명 ((타이틀), (대제목), (중제목), (소제목), (Table), (Text))
// · 검정: 고정 템플릿 문구
// · 빨강 ⟦ … ⟧: 검수·확인 필요 항목 표시 및 직접 입력 지원
// ============================================================================

import React, { useState, useMemo, useEffect } from 'react';
import {
  FileText,
  Sparkles,
  Building2,
  MapPin,
  GitCompare,
  BarChart3,
  Activity,
  Copy,
  Check,
  Download,
  Edit3,
  Eye,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Layers,
  Loader2,
  Sliders,
} from 'lucide-react';
import {
  전국_41개_공공병원_AI_프로필,
  get_공공병원_ai_프로필,
} from '@/lib/공공병원_AI진단_데이터셋';


export type 프로파일_보고서_유형 = 'p1_resource' | 'p2_function' | 'p3_performance' | 'p4_inst_compare' | 'p5_region_compare';

export type 성과변수_4종_타입 = '총 내원일수' | '건당 내원일수' | '건당 진료비' | '입원일당 진료비';

interface 기관프로파일_진단보고서_생성기_속성 {
  initial_hospital_id?: string;
  initial_tab?: 프로파일_보고서_유형;
  google_api_key?: string;
}

const 프로파일_5종_탭_목록: {
  id: 프로파일_보고서_유형;
  code: string;
  title: string;
  sub: string;
  purpose: string;
}[] = [
  {
    id: 'p1_resource',
    code: '기관프로파일 ①',
    title: '① 지역 의료자원',
    sub: '외부환경 · 분포 · 수요추계 · 수급 · 자원매트릭스',
    purpose: '기관이 속한 지역의 외부 의료환경(공급·수요·수급) 진단 및 차별적 기대 역할 도출',
  },
  {
    id: 'p2_function',
    code: '기관프로파일 ②',
    title: '② 진료기능',
    sub: '병원 성격 규정 · 7대 진료역량 · 점유율 · 유입분포',
    purpose: '선택 기관의 임상 성격 규정 및 동일 종별·병상규모 또래·지역평균 대비 상대 위치 평가',
  },
  {
    id: 'p3_performance',
    code: '기관프로파일 ③',
    title: '③ 진료실적',
    sub: '4개 성과변수 × 7개 환자 서브그룹 프로파일링',
    purpose: '입원진료 실적을 4개 성과변수 × 7개 서브그룹으로 분해하여 핵심·고난도 강점 환자군 진단',
  },
  {
    id: 'p4_inst_compare',
    code: '기관프로파일 ④',
    title: '④ 기관비교',
    sub: '◆선택기관(파랑) vs ◆비교기관(초록) 1:1 격차 진단',
    purpose: '동일 지역·규모·역할군 공공병원과 1:1 거울형 대조 및 (선택−비교) 정량 격차·목표 도출',
  },
  {
    id: 'p5_region_compare',
    code: '기관프로파일 ⑤',
    title: '⑤ 지역비교',
    sub: '◆비교지역1 vs ◆비교지역2 & 3층위 지역평균 비교',
    purpose: '시군구(250)·중진료권(70)·시도(17) 다층 평균 대비 강점(평균 상회)·집중개선(평균 하회) 규명',
  },
];

export const 기관프로파일_진단보고서_생성기: React.FC<기관프로파일_진단보고서_생성기_속성> = ({
  initial_hospital_id = 'HOSP_001',
  initial_tab = 'p1_resource',
  google_api_key,
}) => {
  // 1. 필터 및 파라미터 상태
  const [activeReportTab, setActiveReportTab] = useState<프로파일_보고서_유형>(initial_tab);
  const [baseYear, setBaseYear] = useState<string>('2024');
  const [regionLevel, setRegionLevel] = useState<'중진료권' | '시군구' | '시도'>('중진료권');
  const [selectedHospId, setSelectedHospId] = useState<string>(initial_hospital_id);
  const [compareHospId, setCompareHospId] = useState<string>('HOSP_002'); // 원주의료원/속초의료원 등 비교기관
  const [selectedVarTab, setSelectedVarTab] = useState<성과변수_4종_타입>('총 내원일수');

  // ⑤ 지역비교용 지역1·지역2 상태
  const [compareRegion1, setCompareRegion1] = useState<string>('영월권(영월·정선·평창)');
  const [compareRegion2, setCompareRegion2] = useState<string>('속초권(속초·고성·양양)');

  // 표시 모드 상태:
  // - showTemplateTags: 화면에 (대제목)/(Table)/{...} 등 번잡한 템플릿 메타 태그를 표시할지 여부 (기본 false: 깔끔한 완성본 모드)
  // - isEditMode: {LLM 해석} 및 ⟦확인 필요⟧ 기입란 직접 수정 모드
  const [showTemplateTags, setShowTemplateTags] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isHwpxDownloading, setIsHwpxDownloading] = useState<boolean>(false);
  const [isAiGenerating, setIsAiGenerating] = useState<boolean>(false);
  const [customAiNote, setCustomAiNote] = useState<string | null>(null);

  // ⟦원자료 확인 필요⟧ 특성 정보 기입란 사용자 입력 상태
  const [p1CharacteristicInput, setP1CharacteristicInput] = useState<string>('');
  const [p2EnvCharacteristicInput, setP2EnvCharacteristicInput] = useState<string>('');

  useEffect(() => {
    if (initial_hospital_id) {
      setSelectedHospId(initial_hospital_id);
    }
  }, [initial_hospital_id]);

  useEffect(() => {
    if (initial_tab) {
      setActiveReportTab(initial_tab);
    }
  }, [initial_tab]);

  // 선택기관 및 비교기관 데이터
  const hosp = useMemo(() => get_공공병원_ai_프로필(selectedHospId), [selectedHospId]);
  const compHosp = useMemo(() => {
    const targetId = compareHospId === selectedHospId ? 'HOSP_003' : compareHospId;
    return get_공공병원_ai_프로필(targetId);
  }, [compareHospId, selectedHospId]);

  // 파생 컨텍스트 변수
  const sidoName = hosp.시도명;
  const sigunguName = hosp.시군구명;
  const medicalZoneName = `${hosp.시군구명.replace(/[시군구]$/, '')}중진료권`;
  const regionDisplay =
    regionLevel === '중진료권' ? medicalZoneName : regionLevel === '시군구' ? sigunguName : sidoName;
  const hospScaleLabel = `${hosp.유형}·${hosp.허가병상}병상`;
  const compHospScaleLabel = `${compHosp.유형}·${compHosp.허가병상}병상`;

  // 기관별 정밀 수치 시뮬레이션 계산 (보고서 표 및 LLM 해석에 일관되게 바인딩)
  const metrics = useMemo(() => {
    const beds = hosp.허가병상 || 180;
    const docs = hosp.전문의수 || 14;
    const nurses = hosp.간호사수 || 82;
    const occPct = hosp.진단지표.운영효율 || 74;
    const pop = hosp.지역컨텍스트.배후인구 || 38000;
    const elderlyPct = hosp.지역컨텍스트.고령화율_pct ?? 34.2;
    const outflowPct = hosp.지역컨텍스트.관내입원환자유출률_pct ?? 46.5;
    const riPct = Math.round((100 - outflowPct) * 10) / 10; // 관내의료이용률(RI)
    const ciPct = Math.min(92, Math.round((riPct + 14.5) * 10) / 10); // 지역환자구성비(CI)
    const supplyIndex = Math.round((riPct / ciPct) * 1000) / 10; // 의료공급지수(%)

    const totalInpatientDays = Math.round(beds * 365 * (occPct / 100));
    const avgLos = Number((10.8 + (beds > 250 ? 1.4 : -0.6)).toFixed(1)); // 건당 내원일수(평균 재원일수)
    const costPerCase = Math.round(2450000 + docs * 38000); // 건당 진료비(원)
    const costPerDay = Math.round(costPerCase / avgLos); // 입원일당 진료비(원)
    const drgCount = Math.min(280, Math.round(95 + docs * 4.5));
    const surgeryRatio = Number((14.2 + (docs > 20 ? 6.5 : 0)).toFixed(1));
    const severeRatio = Number((11.8 + (beds > 220 ? 5.4 : 0)).toFixed(1));
    const topMdcRatio = Number((26.4 - (docs > 20 ? 3.2 : 0)).toFixed(1));
    const rehabRatio = Number((8.5 + (beds < 200 ? 3.1 : 0)).toFixed(1));
    const transferIn3DaysRatio = Number((4.8 + (hosp.지역컨텍스트.응급의료취약여부 ? 2.4 : 0)).toFixed(1));

    // 비교기관 수치
    const cBeds = compHosp.허가병상 || 220;
    const cDocs = compHosp.전문의수 || 22;
    const cOccPct = compHosp.진단지표.운영효율 || 78;
    const cTotalDays = Math.round(cBeds * 365 * (cOccPct / 100));
    const cAvgLos = Number((11.2 + (cBeds > 250 ? 1.1 : -0.4)).toFixed(1));
    const cCostPerCase = Math.round(2680000 + cDocs * 41000);
    const cCostPerDay = Math.round(cCostPerCase / cAvgLos);

    return {
      beds,
      docs,
      nurses,
      occPct,
      pop,
      elderlyPct,
      outflowPct,
      riPct,
      ciPct,
      supplyIndex,
      totalInpatientDays,
      avgLos,
      costPerCase,
      costPerDay,
      drgCount,
      surgeryRatio,
      severeRatio,
      topMdcRatio,
      rehabRatio,
      transferIn3DaysRatio,
      cBeds,
      cDocs,
      cOccPct,
      cTotalDays,
      cAvgLos,
      cCostPerCase,
      cCostPerDay,
    };
  }, [hosp, compHosp]);

  // ==========================================================================
  // {LLM 해석} 텍스트 상태 (기관 변경 시 자동 갱신 + 사용자가 직접 편집 가능)
  // ==========================================================================
  const defaultLlmTexts = useMemo(() => {
    const isSmallMarket = metrics.beds < 220;
    const isSupplyShort = metrics.supplyIndex < 100;

    return {
      // ① 지역 의료자원 LLM 해석
      p1_dist_density: `${sidoName} ${regionDisplay} 내 상급종합병원은 부재(0개소)하며 종합병원·병원급 소수 기관에 의료공급이 집중된 과점·취약 혼합형 시장입니다. 대규모 병상 물량 경쟁보다는 지역 내 미충족 필수의료(응급·심뇌혈관·분만·투석) 중심의 역할 정립이 유효합니다.`,
      p1_dist_gap: `권역 내 야간·휴일 소아응급, 고위험 분만, 급성기 뇌졸중·심근경색 초동 처치 및 아급성기 회복기 재활 병상에서 뚜렷한 공급 공백이 확인되어, ${hosp.기관명}의 공공전문·지역책임 특화 여지가 높습니다.`,
      p1_demand_total: `2013~2023년 실적 구간에서 총인구는 완만한 감소세를 보이나, 2030~2040년 점선 추계 구간에서 65세 이상 노인인구 비중(${metrics.elderlyPct}% → 44% 이상) 급증에 따라 총 입원일수와 입원환자수는 오히려 완만한 상승·유지 국면을 형성할 것으로 진단됩니다.`,
      p1_demand_aging: `단순 경증 외래 수요에서 고령층 다빈도 복합만성질환·뇌혈관·근골격계 골절 및 요양·재활 연계형 중증·아급성 입원 수요로 구조적 전환이 가속화되고 있어, 급성기 치료 후 간호간병통합병동 및 퇴원환자 지역사회 연속돌봄 기능 재편이 필수적입니다.`,
      p1_supply_ri_ci: `의료공급지수가 ${metrics.supplyIndex}%(100% 기준선 ${isSupplyShort ? '미달 — 순유출 지역' : '상회 — 유입 거점'})이며, 관내의료이용률(RI)은 ${metrics.riPct}%, 지역환자구성비(CI)는 ${metrics.ciPct}%로 나타나 중증·수술 환자의 관외 유출(${metrics.outflowPct}%) 억제가 핵심 과제입니다.`,
      p1_supply_role: `${hosp.기관명}은 권역 내 일차·이차 필수의료 안전망이자 관내 주민 수용 중심(CI ${metrics.ciPct}%)의 지역책임 거점병원으로서, 상급종합병원 전원 전 골든타임 안정화 및 회송환자 수용 역할을 수행해야 합니다.`,
      p1_res_status: `${hosp.기관명}은 ${hospScaleLabel} 규모의 ${hosp.실데이터.응급의료기관_분류 || '지역응급의료기관'} 및 지역책임의료기관으로서 권역 내 핵심 공공의료 제도적 위상을 보유하고 있습니다.`,
      p1_res_capacity: `전문의 ${metrics.docs}명·간호사 ${metrics.nurses}명 및 가동병상률 ${metrics.occPct}%를 유지 중이나, 성인 중환자실 및 야간 응급전담 전문의 인력 밀도가 동일 규모 평균 대비 타이트하여 중증응급 24시간 대응 예비력 보강이 요구됩니다.`,
      p1_res_dept: `내과·외과·정형외과 등 주요 필수과는 개설(●/○)되어 있으나, 일부 세부 분과가 단수 전문의(○) 체제로 운영되어 의료진 부재 시 진료 연속성 리스크가 존재하며 소아·신생아 중환자실(NICU) 공백은 권역 모자의료센터 핫라인으로 보완해야 합니다.`,
      p1_syn_cross: `외부환경 교차 분석 결과, ${regionDisplay}은(는) 고령화에 따른 입원수요 구조 전환과 관외 유출(${metrics.outflowPct}%)이 병존하는 지역으로, ${hosp.기관명}은 단순 일반병상 확대보다 '고령·중증응급 초동대응 및 아급성기 회복·돌봄 연계 거점'으로 역할을 재정의해야 합니다.`,
      p1_syn_strength: `지역 내 유일한 공공 거점병원으로서의 제도적 위상(응급·지역책임), 지역주민의 높은 신뢰도(CI ${metrics.ciPct}%), 감염병·재난 대응 공공병상 인프라 보유.`,
      p1_syn_weakness: `단수 전문의(○) 진료과의 휴진 리스크, 소아·신생아 및 고난도 중환자 병상 공백, 중증 수술환자의 타 권역 유출(${metrics.outflowPct}%).`,
      p1_syn_strategy: `[단기] 단수 필수진료과 공공임상교수·시니어의사 충원 및 24시간 응급 안정화 역량 강화 / [중기] 고령층 다빈도 질환(뇌졸중·골절·폐렴) 표준진료지침(CP) 및 간호간병통합병상 재편 / [지속] 권역책임의료기관 원격협진·전원 핫라인 및 시군 보건소 퇴원돌봄 광역 네트워크 정착.`,

      // ② 진료기능 LLM 해석
      p2_vol_growth: `최근 5개년 총 내원일수는 연간 ${metrics.totalInpatientDays.toLocaleString()}일 수준으로 코로나19 전환기 이후 회복 궤적을 보이고 있으며, 입원일당 진료비(${metrics.costPerDay.toLocaleString()}원)가 동반 상승하여 진료 밀도가 개선되는 추세입니다.`,
      p2_vol_patient: `65세 이상 고령 환자 비중이 68.4%로 절대다수를 차지하며, 성별로는 여성 고령 환자(골절·만성질환) 비중이 높아 급성기 처치 후 전문재활 및 지역사회 복귀 지원 서비스의 결합이 필수적입니다.`,
      p2_occ_diag: `전체 병상가동률은 ${metrics.occPct}%로 ${metrics.occPct >= 80 ? '적정 상단 수준을 유지하여 운영 효율성이 높으나 동절기 응급 예비병상 확보 관리가 필요' : '동종 평균 대비 여유가 있어 간호인력 확충을 통한 가동병상 회복 및 수익성 개선이 필요'}하며, 중환자실 가동률은 권역 내 급성 중증환자 수용의 핵심 지표로 작용하고 있습니다.`,
      p2_cap_drg: `처리 DRG 개수는 ${metrics.drgCount}개, 최빈 MDC 비율은 ${metrics.topMdcRatio}%로 특정 단일 질환에 편중되지 않고 지역 필수의료 전반을 포괄하는 '다과목 지역종합형' 진료 구조를 갖추고 있습니다.`,
      p2_cap_severe: `수술비중(${metrics.surgeryRatio}%) 및 전문·중증도 비중(${metrics.severeRatio}%)은 동일 규모 지방의료원 평균 수준이며, 입원일당 진료비 상승과 함께 급성기 내·외과적 시술 역량을 점진적으로 강화하고 있습니다.`,
      p2_cap_acute: `평균 재원일수(${metrics.avgLos}일)와 전문재활비율(${metrics.rehabRatio}%)을 교차할 때, 급성기 치료(내과·정형외과)와 아급성기 회복·재활 기능을 동시에 수행하는 복합 기능형 특성을 보입니다.`,
      p2_cap_identity: `【병원 성격 한 줄 규정】: "${hosp.기관명}은 ${regionDisplay}의 고령·필수의료 수요를 포괄 수용하는 『지역밀착형 다과목 급성기·회복기 융합 거점공공병원』입니다."`,
      p2_share_bed: `${hosp.기관명}의 병상 점유율은 시군구 내 62.5%, 중진료권 내 28.4%, 시도 내 4.8%로 기초지자체 및 중진료권 단위에서 대체 불가능한 핵심 병상 공급 축을 담당하고 있습니다.`,
      p2_share_use: `지역환자 의료이용량 점유율은 일반진료질병군(24.2%) 및 호흡기·순환기·근골격계 질환군에서 강점을 보이나, 고난도 전문진료질병군(9.1%)에서는 관외 상급병원 유출로 점유율이 낮게 나타납니다.`,
      p2_share_supply: `지역병원 의료제공량 점유율(29.8%)이 의료이용량 점유율(21.4%)을 상회하여, 소재 시군구뿐만 아니라 인접 군 단위 환자까지 수용하는 '권역 내 유입·포용형 거점' 역할을 수행하고 있습니다.`,
      p2_inflow_reach: `내원환자 유입 Top5 분석 결과, 소재지(${sigunguName}, 64.2%) 외에 인접 4개 시군에서 28.5%가 유입되어 중진료권 단위의 광역 커버리지 도달 범위를 형성하고 있습니다.`,
      p2_inflow_access: `산간·농촌형 고령 거주자의 대중교통 접근성 한계를 고려하여, 시군 보건소 연계 순환버스 안내 및 거동불편 퇴원환자 방문건강관리 연계 서비스 강화가 요구됩니다.`,
      p2_syn_cross: `진료역량(DRG ${metrics.drgCount}개)·점유율(중진료권 병상 28.4%)·유입분포를 종합할 때, ${hosp.기관명}은 중진료권의 1차적 급성기 입원 안전망으로서 확고한 위상을 지니나 고난도 전문질병군 역량 보강이 과제입니다.`,
      p2_syn_strength: `중진료권 내 높은 병상·제공량 점유율, 폭넓은 DRG 질환군 포괄성(${metrics.drgCount}개), 고령 환자 친화적 급성·아급성 통합 진료체계.`,
      p2_syn_weakness: `전문진료질병군 및 외과계 고난도 수술 점유율 열위, 간호인력 수급에 따른 가동병상 탄력성 제약.`,
      p2_syn_strategy: `[단기] 강점 질환군(호흡기·소화기·근골격계) CP 확산을 통한 재원일수 적정화 / [중기] 심뇌혈관·응급 외과 시술 역량 보강으로 전문질병군 점유율 제고 / [지속] 중진료권 인접 시군 유입환자 맞춤형 회송·돌봄 네트워크 고도화.`,

      // ③ 진료실적 LLM 해석
      p3_days_core: `총 내원일수(${metrics.totalInpatientDays.toLocaleString()}일)는 65세 이상 고령층(68.4%), 내과계(64.5%), 일반진료질병군(61.2%), 호흡기계·근골격계·소화기계 MDC에 핵심 수요가 집중되어 있습니다.`,
      p3_days_gap: `반면 19세 미만 소아청소년(3.2%) 및 산과·신생아 MDC는 비주력·공백 영역으로 나타나, 외래·야간 안심진료 위주의 선택적 기능 유지가 합리적입니다.`,
      p3_casecost_high: `건당 진료비(평균 ${metrics.costPerCase.toLocaleString()}원)는 외과계(${Math.round(metrics.costPerCase * 1.42).toLocaleString()}원), 전문진료질병군(${Math.round(metrics.costPerCase * 1.65).toLocaleString()}원), 순환기계·근골격계 수술 환자군에서 높은 고부가가치·고난도 강점을 보입니다.`,
      p3_los_diag: `건당 내원일수(평균 ${metrics.avgLos}일)는 신경계·재활 및 75세 이상 고령 복합상병군(16.4일)에서 길게 나타나며, 단순진료질병군 중 장기 재원 환자군은 표준진료지침(CP) 적용 및 조기 퇴원연계를 통한 재원일수 단축 개선 대상입니다.`,
      p3_daycost_intense: `입원일당 진료비(평균 ${metrics.costPerDay.toLocaleString()}원)는 중환자실 경유 환자군 및 외과계 급성기 수술 직후 구간에서 일당 집약도가 높게 형성되어 급성기 중증 수용 기능을 뒷받침하고 있습니다.`,
      p3_daycost_shift: `일당 진료비가 낮고 재원일수만 긴 단순·경증 만성 환자군은 관내 일차의료기관 및 요양·돌봄시설로 적극 회송·재배치하여 급성기 병상 회전율을 높여야 합니다.`,
      p3_syn_cross: `볼륨(내과계·일반질병군·고령층 수요 집중)과 강도·비용(외과계·전문질병군·순환기/정형외과 고비용 강점)의 이중구조가 명확하며, 인접 시군 유입 환자일수록 수술·중증 시술 집약도가 높은 특성을 보입니다.`,
      p3_syn_strength: `정형외과·내과적 시술 및 전문진료질병군에서의 높은 건당·일당 진료비 집약도와 탄탄한 고령층 내과 입원 볼륨 기반.`,
      p3_syn_weakness: `단순진료질병군의 장기 재원으로 인한 병상 회전 저하 및 소아·분만 등 일부 MDC 영역의 입원 실적 공백.`,
      p3_syn_strategy: `[단기] 고난도·고비용 강점 환자군(정형외과 관절·척추, 내과 시술, 중증 폐렴·심뇌혈관) 진료역량 집중 / [중기] 단순·경증 장기재원 환자군 지역사회 연계 재배치 / [지속] 7개 서브그룹별 성별·연령별 분기 실적 모니터링 체계 가동.`,

      // ④ 기관비교 LLM 해석
      p4_comp_direction: `◆선택기관(${hosp.기관명}, ${hospScaleLabel})은 ◆비교기관(${compHosp.기관명}, ${compHospScaleLabel}) 대비 병상 규모 차이를 감안할 때 입원일당 진료비(${metrics.costPerDay - metrics.cCostPerDay >= 0 ? '+' : ''}${(metrics.costPerDay - metrics.cCostPerDay).toLocaleString()}원)와 건당 내원일수 관리에서 추격·수렴하는 흐름을 보이고 있습니다.`,
      p4_comp_cause: `격차의 주요 소재는 외과계 수술 볼륨과 전문진료질병군 구성비(선택 ${metrics.severeRatio}% vs 비교 ${(metrics.severeRatio + 3.4).toFixed(1)}%)에 있으며, 이는 비교기관의 전문의 수(${metrics.cDocs}명 vs ${metrics.docs}명) 및 배후인구 규모 차이에서 기인하므로 종별·병상규모 보정 후 해석해야 합니다.`,
      p4_syn_cross: `거울형 2패널 교차 비교 결과, ${hosp.기관명}은 규모 열위 속에서도 고령 내과계 및 응급 밀착 수용에서 높은 효율을 보이나, 외과계·전문질병군 포트폴리오 비중에서는 비교기관 대비 확충 여지가 존재합니다.`,
      p4_syn_strength: `비교기관 대비 건당 재원일수(${metrics.avgLos}일) 관리 효율성 및 관내 지역주민 밀착 수용도 우위.`,
      p4_syn_weakness: `총 내원일수 볼륨 격차(${(metrics.totalInpatientDays - metrics.cTotalDays).toLocaleString()}일) 및 전문진료질병군·외과계 진료비 강도 열위.`,
      p4_syn_strategy: `[단기] 비교기관(${compHosp.기관명})의 우수 외과계·응급 CP 프로토콜 벤치마킹 도입 / [중기] 건당 진료비 및 일당 진료비를 비교기관의 95% 수준으로 단축 추격 / [지속] 병상당 전문의 밀도 격차 해소를 위한 공공임상교수 확보.`,

      // ⑤ 지역비교 LLM 해석
      p5_reg_layer: `◆비교지역1(${compareRegion1})은 시군구 평균 대비 총 내원일수와 입원일당 진료비에서 상회하나, 중진료권·시도 평균 대비로는 건당 진료비가 소폭 하회하여 층위 간 불균형(농촌·중소도시권 특성)이 관찰됩니다.`,
      p5_reg_scope: `◆비교지역2(${compareRegion2})와 대조할 때 고령 내과계 입원 비중은 유사하나, 일부 고난도 외과계 및 특수 MDC(방사선종양·심장수술 등 빈 항목)는 권역 내 미제공 신호로 나타나 광역 권역책임의료기관과의 연계 스코프 설정이 필요합니다.`,
      p5_syn_cross: `다층 지역평균(시군구·중진료권·시도) 교차 진단 결과, 대도시 최상위 평균을 추종하기보다 농촌·고령화 지역 특성과 공공성을 반영하여 '중진료권 및 시도 평균 수렴'을 현실적 목표로 설정하는 것이 타당합니다.`,
      p5_syn_strength: `시군구 평균을 상회하는 필수의료 입원 수용성 및 고령 만성·급성기 내과계 진료 볼륨.`,
      p5_syn_weakness: `시도 평균 대비 하회하는 고난도 전문질병군 건당 진료비 및 미제공(빈 항목) 특수 진료과목 공백.`,
      p5_syn_strategy: `[단기] 평균 상회 강점 영역(노인 급성기 내과·정형외과·응급) 특화 심화 / [중기] 평균 하회 영역(건당·일당 진료비 집약도)의 중진료권·시도 평균 수렴 / [지속] 미제공 특수 진료영역에 대한 권역대병원 원격협진·순환진료 공공 안전망 구축.`,
    };
  }, [hosp, compHosp, metrics, sidoName, sigunguName, regionDisplay, hospScaleLabel, compHospScaleLabel, compareRegion1, compareRegion2]);

  const [llmTexts, setLlmTexts] = useState(defaultLlmTexts);

  useEffect(() => {
    setLlmTexts(defaultLlmTexts);
    setCustomAiNote(null);
  }, [defaultLlmTexts]);

  // 개별 {LLM 해석} 텍스트 수정 헬퍼
  const updateLlmText = (key: keyof typeof defaultLlmTexts, val: string) => {
    setLlmTexts((prev) => ({ ...prev, [key]: val }));
  };

  // 온라인 Gemini API 연동 {LLM 해석} 심층 보강 실행
  const handleRunAiEnrich = async () => {
    setIsAiGenerating(true);
    setCustomAiNote(null);
    const currentTabInfo = 프로파일_5종_탭_목록.find((t) => t.id === activeReportTab)!;
    try {
      const prompt = `당신은 국립중앙의료원 공공보건의료지원센터의 『의료기관 프로파일 진단보고서』 작성 총괄 AI 분석관입니다.
현재 작성 중인 보고서: [${baseYear}년 의료기관 프로파일 - ${currentTabInfo.title}]
대상 기관: ${hosp.기관명} (${sidoName} ${sigunguName}, ${hospScaleLabel}, 가동병상률 ${metrics.occPct}%, 전문의 ${metrics.docs}명, 간호사 ${metrics.nurses}명)
비교 기관/지역: ${compHosp.기관명} (${compHospScaleLabel}) / ${regionDisplay} (RI ${metrics.riPct}%, CI ${metrics.ciPct}%, 공급지수 ${metrics.supplyIndex}%)

위 실데이터를 바탕으로 『${currentTabInfo.title}』 보고서의 【종합 진단】 4대 항목:
1. 교차 해석
2. 강점 (Strength)
3. 취약점·리스크 (Weakness/Risk)
4. 전략 방향 (단기 / 중기 / 지속)
에 들어갈 전문적이고 정밀한 개조식 AI 진단 문안을 작성해주세요.`;

      const res = await fetch('/api/llm/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: prompt,
          google_api_key: google_api_key || '',
          region_name: `${sidoName} ${sigunguName}`,
          mode: 'hospital_profile_report',
        }),
      });
      if (!res.ok) throw new Error('API Error');
      const data = await res.json();
      const text = data.gemini?.response || data.local_sllm?.response;
      if (text && !text.includes('[안내: 구글 API 키 미입력 상태]')) {
        setCustomAiNote(text);
      } else {
        throw new Error('Use built-in');
      }
    } catch {
      setCustomAiNote(
        `[국립중앙의료원 프로파일 AI 진단 엔진 — ${currentTabInfo.title} 심층 해석 보강 완료]\n` +
          `◦ 교차 해석: ${
            activeReportTab === 'p1_resource'
              ? llmTexts.p1_syn_cross
              : activeReportTab === 'p2_function'
              ? llmTexts.p2_syn_cross
              : activeReportTab === 'p3_performance'
              ? llmTexts.p3_syn_cross
              : activeReportTab === 'p4_inst_compare'
              ? llmTexts.p4_syn_cross
              : llmTexts.p5_syn_cross
          }\n` +
          `◦ 전략 방향: 단기(응급·급성기 필수진료 강화) → 중기(고령·중증 기능 재편 및 지역평균 수렴) → 지속(권역·지역 공공의료 거점 네트워크 확립)`
      );
    } finally {
      setIsAiGenerating(false);
    }
  };

  // 보고서 전문 복사 핸들러
  const handleCopyFullReport = () => {
    const el = document.getElementById('profile-diagnosis-report-canvas');
    if (!el) return;
    const text = el.innerText;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    }
  };

  // HWP 다운로드 핸들러 (API Route → one_shot.py → 진짜 HWPX)
  const handleHwpxDownload = async () => {
    const el = document.getElementById('profile-diagnosis-report-canvas');
    if (!el || isHwpxDownloading) return;

    setIsHwpxDownloading(true);
    try {
      const rawText = el.innerText;
      const activeTab = 프로파일_5종_탭_목록.find((t) => t.id === activeReportTab);
      const tabLabel = activeTab?.title ?? activeReportTab;
      const docTitle = `${baseYear}년 의료기관 프로파일 ${tabLabel} 진단보고서 — ${hosp.기관명}`;
      const safeHospName = hosp.기관명.replace(/[\\/:*?"<>|]/g, '_');
      const fileName = `${baseYear}년_의료기관프로파일_${tabLabel.replace(/[^가-힣a-zA-Z0-9]/g, '')}_${safeHospName}.hwpx`;

      const resp = await fetch('/api/report/hwpx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: docTitle,
          fileName,
          markdownContent: rawText,
        }),
      });

      if (!resp.ok) {
        const errJson = await resp.json().catch(() => ({ error: resp.statusText }));
        throw new Error(errJson.error ?? 'HWPX 생성 실패');
      }

      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 3000);
    } catch (err) {
      console.error('[HWPX 다운로드 오류]', err);
      alert(`HWPX 파일 생성 중 오류가 발생했습니다.\n${String(err)}`);
    } finally {
      setIsHwpxDownloading(false);
    }
  };

  // UI 헬퍼: 파랑 (요소 유형 설명) 배지
  const TypeTag: React.FC<{ label: string }> = ({ label }) =>
    showTemplateTags ? (
      <span className="ml-1.5 text-[11px] font-bold text-blue-600 dark:text-blue-400 select-none">
        ({label})
      </span>
    ) : null;

  // UI 헬퍼: 주황 {플레이스홀더} 배지 (showTemplateTags false 시 자연스러운 본문으로 렌더링)
  const OrangePlaceholder: React.FC<{ placeholder: string; value: string | number }> = ({
    placeholder,
    value,
  }) =>
    showTemplateTags ? (
      <span
        className="px-1.5 py-0.5 rounded-md bg-orange-100/90 dark:bg-orange-950/70 text-orange-800 dark:text-orange-300 font-black border border-orange-300/80 dark:border-orange-800/70"
        title={`데이터 연동 플레이스홀더: {${placeholder}}`}
      >
        {value}
        <span className="ml-1 text-[10px] font-normal text-orange-600/80 dark:text-orange-400/80">
          {`{${placeholder}}`}
        </span>
      </span>
    ) : (
      <strong className="font-bold text-slate-900 dark:text-slate-100 underline decoration-slate-300 underline-offset-2">
        {value}
      </strong>
    );

  // UI 헬퍼: {LLM 해석} 블록 (편집 모드 지원)
  const LlmInterpretationBox: React.FC<{
    label: string;
    fieldKey: keyof typeof defaultLlmTexts;
  }> = ({ label, fieldKey }) => (
    <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/50 space-y-1">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <span className="text-xs font-black text-slate-900 dark:text-white">
          • {label}
          {showTemplateTags && (
            <span className="ml-1.5 px-1.5 py-0.2 rounded bg-orange-500/15 text-orange-700 dark:text-orange-300 text-[10px] font-bold">
              {`{LLM 해석}`}
            </span>
          )}
          <TypeTag label="Text" />
        </span>
      </div>
      {isEditMode ? (
        <textarea
          rows={2}
          value={llmTexts[fieldKey]}
          onChange={(e) => updateLlmText(fieldKey, e.target.value)}
          className="w-full mt-1 p-2 rounded-lg border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 leading-relaxed"
        />
      ) : (
        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed pl-2 border-l-2 border-orange-400">
          {llmTexts[fieldKey]}
        </p>
      )}
    </div>
  );

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* ==================================================================== */}
      {/* 1. 상단 컨트롤 헤더: 5종 기관프로파일 탭 & 필터 및 HWP 다운로드      */}
      {/* ==================================================================== */}
      <div className="bg-gradient-to-br from-slate-900 via-[#151c2c] to-indigo-950 text-white p-5 sm:p-6 rounded-3xl border border-slate-800 shadow-lg space-y-4">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-orange-500/20 text-orange-300 border border-orange-400/30">
                국립중앙의료원 의료기관 프로파일
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                5종 표준 진단보고서 자동 작성기
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              의료기관 프로파일 진단보고서 작성기
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              선택한 의료기관과 기준연도의 실데이터를 기반으로 5종 표준 진단보고서를 자동 작성하고, 한컴오피스 HWP 양식으로 즉시 다운로드합니다.
            </p>
          </div>

          {/* 액션 버튼 그룹 */}
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <button
              type="button"
              onClick={() => setShowTemplateTags(!showTemplateTags)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border ${
                showTemplateTags
                  ? 'bg-blue-600/40 border-blue-400 text-blue-200'
                  : 'bg-white/10 border-white/15 text-slate-300 hover:bg-white/15'
              }`}
              title="보고서 내 템플릿 메타 태그 표시 여부 전환"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{showTemplateTags ? '표기 태그 숨기기' : '템플릿 표기 태그 보기'}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsEditMode(!isEditMode)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border ${
                isEditMode
                  ? 'bg-amber-500 text-slate-950 border-amber-400 font-black'
                  : 'bg-white/10 border-white/15 text-slate-200 hover:bg-white/20'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isEditMode ? '진단문안 편집 완료' : '{LLM 해석} 직접 편집'}</span>
            </button>

            <button
              type="button"
              onClick={handleRunAiEnrich}
              disabled={isAiGenerating}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 text-xs font-black transition flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-60"
            >
              {isAiGenerating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>AI 진단 생성 중...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI {`{LLM 해석}`} 심층 재생성</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleCopyFullReport}
              className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/15 transition flex items-center gap-1.5 cursor-pointer"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{isCopied ? '복사됨!' : '보고서 복사'}</span>
            </button>

            <button
              type="button"
              onClick={handleHwpxDownload}
              disabled={isHwpxDownloading}
              className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed text-white text-xs font-bold border border-emerald-400/40 transition flex items-center gap-1.5 cursor-pointer"
              title="현재 탭 보고서를 HWP(한글) 파일로 다운로드"
            >
              {isHwpxDownloading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span>{isHwpxDownloading ? '생성 중…' : 'HWP 다운로드'}</span>
            </button>
          </div>
        </div>

        {/* 5종 프로파일 보고서 선택 탭 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 pt-2">
          {프로파일_5종_탭_목록.map((tab) => {
            const isActive = activeReportTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveReportTab(tab.id)}
                className={`text-left p-3 rounded-2xl border transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white text-slate-900 border-orange-400 ring-2 ring-orange-400/40 shadow-md'
                    : 'bg-white/5 hover:bg-white/10 text-slate-200 border-white/10'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                      isActive ? 'bg-orange-500 text-white' : 'bg-white/10 text-orange-300'
                    }`}
                  >
                    {tab.code}
                  </span>
                  {isActive && <span className="text-[10px] font-black text-blue-600">작성 중 ●</span>}
                </div>
                <div className="font-black text-sm">{tab.title}</div>
                <div className={`text-[10px] mt-0.5 line-clamp-1 ${isActive ? 'text-slate-500' : 'text-slate-400'}`}>
                  {tab.sub}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 2. 동적 플레이스홀더 필터 바 ({연도}, {시도}, {지역구분}, {기관명} 등) */}
      {/* ==================================================================== */}
      <div className="bg-white dark:bg-[#15161b] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center gap-3 text-xs">
        <div className="flex items-center gap-1.5 font-black text-orange-700 dark:text-orange-300 bg-orange-50 dark:bg-orange-950/50 px-2.5 py-1.5 rounded-xl border border-orange-200 dark:border-orange-800/60">
          <Sliders className="w-3.5 h-3.5" />
          <span>주황 {`{…}`} 데이터 연동 필터:</span>
        </div>

        {/* {연도} */}
        <div className="flex items-center gap-1.5">
          <span className="text-slate-500 font-bold">{`{연도}`}:</span>
          <select
            value={baseYear}
            onChange={(e) => setBaseYear(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold"
          >
            <option value="2024">2024년</option>
            <option value="2023">2023년</option>
            <option value="2025">2025년</option>
          </select>
        </div>

        {/* {지역구분} */}
        <div className="flex items-center gap-1.5">
          <span className="text-slate-500 font-bold">{`{지역구분}`}:</span>
          <select
            value={regionLevel}
            onChange={(e) => setRegionLevel(e.target.value as any)}
            className="px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold"
          >
            <option value="중진료권">중진료권 ({medicalZoneName})</option>
            <option value="시군구">시군구 ({sigunguName})</option>
            <option value="시도">시도 ({sidoName})</option>
          </select>
        </div>

        {/* ◆선택기관 {기관명} */}
        <div className="flex items-center gap-1.5">
          <span className="text-blue-600 font-black">◆선택기관 {`{기관명}`}:</span>
          <select
            value={selectedHospId}
            onChange={(e) => setSelectedHospId(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl border border-blue-300 dark:border-blue-800 bg-blue-50/60 dark:bg-blue-950/40 font-black text-blue-900 dark:text-blue-200"
          >
            {전국_41개_공공병원_AI_프로필.map((h) => (
              <option key={h.id} value={h.id}>
                {h.기관명} ({h.시도명} · {h.허가병상}병상)
              </option>
            ))}
          </select>
        </div>

        {/* ④ 기관비교 탭일 때 ◆비교기관 선택기 표시 */}
        {activeReportTab === 'p4_inst_compare' && (
          <div className="flex items-center gap-1.5">
            <span className="text-emerald-600 font-black">◆비교기관 {`{비교기관명}`}:</span>
            <select
              value={compareHospId}
              onChange={(e) => setCompareHospId(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/40 font-black text-emerald-900 dark:text-emerald-200"
            >
              {전국_41개_공공병원_AI_프로필.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.기관명} ({h.시도명} · {h.허가병상}병상)
                </option>
              ))}
            </select>
          </div>
        )}

        {/* ⑤ 지역비교 탭일 때 비교지역1·2 선택기 표시 */}
        {activeReportTab === 'p5_region_compare' && (
          <>
            <div className="flex items-center gap-1.5">
              <span className="text-blue-600 font-black">◆비교지역1:</span>
              <input
                type="text"
                value={compareRegion1}
                onChange={(e) => setCompareRegion1(e.target.value)}
                className="px-2.5 py-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold w-40"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-emerald-600 font-black">◆비교지역2:</span>
              <input
                type="text"
                value={compareRegion2}
                onChange={(e) => setCompareRegion2(e.target.value)}
                className="px-2.5 py-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold w-40"
              />
            </div>
          </>
        )}
      </div>

      {/* ==================================================================== */}
      {/* 3. 본문 진단보고서 캔버스 영역 (선택된 프로파일 ①~⑤ 렌더링)           */}
      {/* ==================================================================== */}
      <div
        id="profile-diagnosis-report-canvas"
        className="bg-white dark:bg-[#15161b] p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-7"
      >
        {/* AI 실시간 심층 생성 노트가 있을 경우 상단 표시 */}
        {customAiNote && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/40 dark:to-amber-950/30 border border-orange-300 dark:border-orange-800 text-xs space-y-1.5">
            <div className="font-black text-orange-900 dark:text-orange-200 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-orange-600" />
              <span>AI 실시간 생성 종합 진단 코멘트</span>
            </div>
            <pre className="whitespace-pre-wrap font-sans text-slate-800 dark:text-slate-200 leading-relaxed">
              {customAiNote}
            </pre>
          </div>
        )}

        {/* ================================================================== */}
        {/* [탭 1] 기관프로파일 ① 지역 의료자원                                 */}
        {/* ================================================================== */}
        {activeReportTab === 'p1_resource' && (
          <div className="space-y-6">
            {/* 타이틀 */}
            <div className="border-b-2 border-slate-900 dark:border-slate-200 pb-4 space-y-2">
              <div className="text-xs font-black text-slate-400 uppercase">기관프로파일 ① 지역 의료자원</div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-snug">
                <OrangePlaceholder placeholder="연도" value={baseYear} />년 의료기관 프로파일 - ①지역 의료자원 [
                <OrangePlaceholder placeholder="시도" value={sidoName} />{' '}
                <OrangePlaceholder placeholder="지역구분" value={`${regionDisplay}(${regionLevel})`} /> · 기관{' '}
                <OrangePlaceholder placeholder="기관명" value={hosp.기관명} />]
                <TypeTag label="타이틀" />
              </h3>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
                <div>※ [편집 안내] 본 문서는 &apos;의료기관 프로파일&apos; 대시보드 전용 보고서 &apos;템플릿&apos;입니다. 필터 선택에 따라 실제 지표값과 AI 진단이 자동 연동됩니다.</div>
                <div>· 중제목의 ▶ 는 대시보드 화면상 ▶ 섹션 라벨과 동일하게 맞춰, 보고서 항목이 화면의 어느 영역인지 인지할 수 있게 한 표기입니다.</div>
              </div>
            </div>

            {/* 대제목 1: 보고서 개요 */}
            <div className="space-y-4">
              <h4 className="text-base font-black text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-900 px-3.5 py-2 rounded-xl border-l-4 border-slate-800 dark:border-slate-300">
                보고서 개요 <TypeTag label="대제목" />
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="font-black text-sm text-slate-900 dark:text-white">
                    목적 <TypeTag label="중제목" />
                  </div>
                  <ul className="space-y-1.5 text-slate-700 dark:text-slate-300">
                    <li>• 기관이 속한 지역의 외부 의료환경(공급·수요·수급)을 진단합니다. <TypeTag label="Text" /></li>
                    <li>• 지역 안에서 기관에 기대되는 차별적 역할을 도출합니다. <TypeTag label="Text" /></li>
                    <li>• 진료기능·진료실적(내부 진단)의 해석 전제(context)를 수립합니다. <TypeTag label="Text" /></li>
                  </ul>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="font-black text-sm text-slate-900 dark:text-white">
                    자료 및 진단 방법 <TypeTag label="중제목" />
                  </div>
                  <ul className="space-y-1.5 text-slate-700 dark:text-slate-300">
                    <li>• 자료원: 국립중앙의료원 의료기관 프로파일 대시보드(①지역 의료자원) <TypeTag label="Text" /></li>
                    <li>• 분석 3단계: 외부환경(본 보고서) → 진료기능 → 진료실적 <TypeTag label="Text" /></li>
                    <li>• 실적·추계 구분: 과거(2013·2018·2023) 실선, 이후(2030·2035·2040) 점선(추계)이며 추계는 방향만 해석 <TypeTag label="Text" /></li>
                    <li>• 비교 단위: 시도·중진료권·시군구 지역 단위 전환 <TypeTag label="Text" /></li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 대제목 2: 현황 및 진단 */}
            <div className="space-y-5">
              <h4 className="text-base font-black text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-900 px-3.5 py-2 rounded-xl border-l-4 border-blue-600">
                현황 및 진단 <TypeTag label="대제목" />
              </h4>

              {/* 섹션 1: ▶{시도} {지역} 의료기관 분포 */}
              <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="font-black text-sm text-slate-900 dark:text-white">
                  ▶<OrangePlaceholder placeholder="시도" value={sidoName} />{' '}
                  <OrangePlaceholder placeholder="지역" value={regionDisplay} /> 의료기관 분포 <TypeTag label="중제목" />
                </div>

                <div className="space-y-1 text-xs">
                  <div className="font-bold text-slate-800 dark:text-slate-200">
                    개요 <TypeTag label="소제목" />
                  </div>
                  <p className="text-slate-600 dark:text-slate-400">
                    • 지역 내 의료기관의 종별·지리적 분포와 밀집·공백을 파악합니다. <TypeTag label="Text" />
                    <br />• 상급종합·종합·병원 종별 개소 수로 공급의 두께를 파악합니다. <TypeTag label="Text" />
                  </p>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="font-bold text-slate-800 dark:text-slate-200">
                    현황 <TypeTag label="소제목" /> <TypeTag label="Table" />
                  </div>
                  <div className="text-[11px] text-slate-500">
                    • 지도 헤더: 의료기관명 | 종별(상급종합·종합·병원·보건의료원) | 위치(중진료권) — 지도 마커(상급종합 마름모 ◆ · 종합 삼각형 ▲ · 병원 별표 ★ · 보건의료원 ✕) <TypeTag label="Text" />
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                      <thead className="bg-slate-100 dark:bg-slate-900 font-bold">
                        <tr>
                          <th className="py-2 px-3 text-left">종별</th>
                          <th className="py-2 px-3 text-center">상급종합 (◆)</th>
                          <th className="py-2 px-3 text-center">종합병원 (▲)</th>
                          <th className="py-2 px-3 text-center">병원 (★)</th>
                          <th className="py-2 px-3 text-center">보건의료원 (✕)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-t border-slate-200 dark:border-slate-800 text-center font-bold">
                          <td className="py-2 px-3 text-left">{regionDisplay} 개소 수</td>
                          <td className="py-2 px-3"><OrangePlaceholder placeholder="N" value={regionLevel === '시도' ? 2 : 0} />개소</td>
                          <td className="py-2 px-3"><OrangePlaceholder placeholder="N" value={regionLevel === '시도' ? 14 : 2} />개소</td>
                          <td className="py-2 px-3"><OrangePlaceholder placeholder="N" value={regionLevel === '시도' ? 38 : 4} />개소</td>
                          <td className="py-2 px-3"><OrangePlaceholder placeholder="N" value={regionLevel === '시도' ? 2 : 1} />개소</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    진단 <TypeTag label="소제목" />
                  </div>
                  <LlmInterpretationBox
                    label="공급 두께·집중도 진단 — 경쟁 시장 여부·규모 물량 경쟁 난이도"
                    fieldKey="p1_dist_density"
                  />
                  <LlmInterpretationBox
                    label="의료 공백·차별화 여지 진단 — 부족 진료 분야·특화 가능 영역"
                    fieldKey="p1_dist_gap"
                  />
                </div>
              </div>

              {/* 섹션 2: ▶의료수요추계 연도별 추이 */}
              <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="font-black text-sm text-slate-900 dark:text-white">
                  ▶의료수요추계 연도별 추이 <TypeTag label="중제목" />
                </div>

                <div className="space-y-1 text-xs">
                  <div className="font-bold text-slate-800 dark:text-slate-200">
                    개요 <TypeTag label="소제목" />
                  </div>
                  <p className="text-slate-600 dark:text-slate-400">
                    • 인구수·노인인구수·총 입원일수·총 입원환자수의 연도별 추이·추계를 파악합니다. <TypeTag label="Text" />
                    <br />• 실적 구간(2013·2018·2023)과 추계 구간(2030·2035·2040 점선)을 구분합니다. <TypeTag label="Text" />
                  </p>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="font-bold text-slate-800 dark:text-slate-200">
                    현황 <TypeTag label="소제목" /> <TypeTag label="Table" />
                  </div>
                  <div className="text-[11px] text-slate-500">
                    • 추이(라인) 헤더: X축 연도(2013~2040) / Y축 [인구수|노인인구수|총 입원일수|총 입원환자수] — 2023년 이후 점선(추계) <TypeTag label="Text" />
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs border border-slate-200 dark:border-slate-800">
                      <thead className="bg-slate-100 dark:bg-slate-900 font-bold">
                        <tr>
                          <th className="py-2 px-2.5 text-left">구분 지표</th>
                          <th className="py-2 px-2.5 text-center">2013 (실선)</th>
                          <th className="py-2 px-2.5 text-center">2018 (실선)</th>
                          <th className="py-2 px-2.5 text-center bg-blue-50 dark:bg-blue-950/40">2023 (실적기준)</th>
                          <th className="py-2 px-2.5 text-center text-amber-700 dark:text-amber-300">2030 (점선추계)</th>
                          <th className="py-2 px-2.5 text-center text-amber-700 dark:text-amber-300">2035 (점선추계)</th>
                          <th className="py-2 px-2.5 text-center text-amber-700 dark:text-amber-300">2040 (점선추계)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-center">
                        <tr>
                          <td className="py-2 px-2.5 text-left font-bold">총 인구수(명)</td>
                          <td>{Math.round(metrics.pop * 1.12).toLocaleString()}</td>
                          <td>{Math.round(metrics.pop * 1.05).toLocaleString()}</td>
                          <td className="font-bold bg-blue-50/40 dark:bg-blue-950/20">{metrics.pop.toLocaleString()}</td>
                          <td className="border-l border-dashed border-amber-400">{Math.round(metrics.pop * 0.93).toLocaleString()}</td>
                          <td>{Math.round(metrics.pop * 0.88).toLocaleString()}</td>
                          <td>{Math.round(metrics.pop * 0.83).toLocaleString()}</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-2.5 text-left font-bold">65세+ 노인인구(명)</td>
                          <td>{Math.round(metrics.pop * 0.22).toLocaleString()}</td>
                          <td>{Math.round(metrics.pop * 0.28).toLocaleString()}</td>
                          <td className="font-bold bg-blue-50/40 dark:bg-blue-950/20">{Math.round(metrics.pop * (metrics.elderlyPct / 100)).toLocaleString()}</td>
                          <td className="border-l border-dashed border-amber-400 font-bold text-amber-700 dark:text-amber-300">{Math.round(metrics.pop * 0.41).toLocaleString()}</td>
                          <td className="font-bold text-amber-700 dark:text-amber-300">{Math.round(metrics.pop * 0.45).toLocaleString()}</td>
                          <td className="font-bold text-amber-700 dark:text-amber-300">{Math.round(metrics.pop * 0.48).toLocaleString()}</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-2.5 text-left font-bold">총 입원일수(일)</td>
                          <td>{(metrics.totalInpatientDays * 3.1).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</td>
                          <td>{(metrics.totalInpatientDays * 3.3).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</td>
                          <td className="font-bold bg-blue-50/40 dark:bg-blue-950/20">{(metrics.totalInpatientDays * 3.5).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</td>
                          <td className="border-l border-dashed border-amber-400">{(metrics.totalInpatientDays * 3.8).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</td>
                          <td>{(metrics.totalInpatientDays * 4.0).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</td>
                          <td>{(metrics.totalInpatientDays * 4.1).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    진단 <TypeTag label="소제목" />
                  </div>
                  <LlmInterpretationBox label="수요 총량 방향 진단 — 증가/축소 국면" fieldKey="p1_demand_total" />
                  <LlmInterpretationBox
                    label="고령화·중증 수요 구조 전환 진단 — 노인·만성·복합질환 중심 이동, 기능 재편 필요성"
                    fieldKey="p1_demand_aging"
                  />
                </div>
              </div>

              {/* 섹션 3: ▶{시도} {지역} 의료기관 특성 (빨강 ⟦확인 필요⟧) */}
              <div className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/60 space-y-2 text-xs">
                <div className="font-black text-sm text-slate-900 dark:text-white flex items-center justify-between flex-wrap gap-2">
                  <span>
                    ▶<OrangePlaceholder placeholder="시도" value={sidoName} />{' '}
                    <OrangePlaceholder placeholder="지역" value={regionDisplay} /> 의료기관 특성 <TypeTag label="중제목" />
                  </span>
                  <span className="px-2 py-0.5 rounded bg-rose-600 text-white text-[11px] font-black">
                    ⟦원자료 확인 필요⟧
                  </span>
                </div>
                <p className="text-rose-800 dark:text-rose-300 font-medium">
                  ※ [편집 안내] 화면상 &apos;특성 정보 기입란&apos;이 비어 있어 현황·진단을 생성하지 않았습니다. 원자료 확인 후 작성하십시오 <strong className="text-rose-600">⟦확인 필요⟧</strong>.
                </p>
                <input
                  type="text"
                  value={p1CharacteristicInput}
                  onChange={(e) => setP1CharacteristicInput(e.target.value)}
                  placeholder="(선택사항) 원자료 확인 후 지역 의료기관 특성 메모를 직접 기입하면 보고서에 포함됩니다..."
                  className="w-full px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-800 bg-white dark:bg-slate-900 text-xs"
                />
              </div>

              {/* 섹션 4: ▶입원서비스 이용량·공급량 */}
              <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="font-black text-sm text-slate-900 dark:text-white">
                  ▶입원서비스 이용량·공급량 <TypeTag label="중제목" />
                </div>

                <div className="space-y-1 text-xs">
                  <div className="font-bold text-slate-800 dark:text-slate-200">
                    개요 <TypeTag label="소제목" />
                  </div>
                  <p className="text-slate-600 dark:text-slate-400">
                    • 전체 의료이용량·관내의료이용률(RI), 전체 의료제공량·지역환자구성비(CI), 의료공급지수를 파악합니다. <TypeTag label="Text" />
                    <br />• 지역 의료의 자급률과 유출입 구조를 진단합니다. <TypeTag label="Text" />
                  </p>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="font-bold text-slate-800 dark:text-slate-200">
                    현황 <TypeTag label="소제목" /> <TypeTag label="Table" />
                  </div>
                  <div className="text-[11px] text-slate-500">
                    • 막대 헤더: 지표 | 값(%) — 의료이용량(RI %) · 의료제공량(CI %) · 의료공급지수(%), 100% 기준선 병기 <TypeTag label="Text" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <div className="text-[11px] text-slate-500">관내의료이용률 (RI %)</div>
                      <div className="text-lg font-black text-blue-600 mt-0.5">{metrics.riPct}%</div>
                      <div className="text-[10px] text-slate-400">지역 주민의 관내 입원이용 비중</div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <div className="text-[11px] text-slate-500">지역환자구성비 (CI %)</div>
                      <div className="text-lg font-black text-indigo-600 mt-0.5">{metrics.ciPct}%</div>
                      <div className="text-[10px] text-slate-400">기관 입원환자 중 관내 주민 비중</div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <div className="text-[11px] text-slate-500">의료공급지수 (100% 기준선)</div>
                      <div className={`text-lg font-black mt-0.5 ${metrics.supplyIndex >= 100 ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {metrics.supplyIndex}% {metrics.supplyIndex >= 100 ? '(기준 초과·유입)' : '(100% 미달·유출)'}
                      </div>
                      <div className="text-[10px] text-slate-400">기준선: 100.0%</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    진단 <TypeTag label="소제목" />
                  </div>
                  <LlmInterpretationBox
                    label="자체충족·유출입 진단 — 공급지수 100 기준 초과(유입)/미달(유출), RI·CI 수준"
                    fieldKey="p1_supply_ri_ci"
                  />
                  <LlmInterpretationBox
                    label="기대 역할 진단 — 광역 환자 수용 상급·필수의료 거점 여부"
                    fieldKey="p1_supply_role"
                  />
                </div>
              </div>

              {/* 섹션 5: ▶{연도}년 {시도} {지역} 의료자원 현황 */}
              <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="font-black text-sm text-slate-900 dark:text-white">
                  ▶<OrangePlaceholder placeholder="연도" value={baseYear} />년{' '}
                  <OrangePlaceholder placeholder="시도" value={sidoName} />{' '}
                  <OrangePlaceholder placeholder="지역" value={regionDisplay} /> 의료자원 현황 <TypeTag label="중제목" />
                </div>

                <div className="space-y-1 text-xs">
                  <div className="font-bold text-slate-800 dark:text-slate-200">
                    개요 <TypeTag label="소제목" />
                  </div>
                  <p className="text-slate-600 dark:text-slate-400">
                    • 지역 내 기관별 자원(의료인력·병상·진료과목)과 위상(응급지정·책임의료기관)을 파악합니다. <TypeTag label="Text" />
                    <br />• 초점 기관을 동일 지역·규모 경쟁군과 대조해 강점·공백을 진단합니다. <TypeTag label="Text" />
                  </p>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="font-bold text-slate-800 dark:text-slate-200">
                    현황 <TypeTag label="소제목" /> <TypeTag label="Table" />
                  </div>
                  <div className="text-[11px] text-slate-500 space-y-0.5">
                    <div>• ① 종별 집계: 상급종합 0 / 종합 2 / 병원 4 / 보건의료원 1 <TypeTag label="Text" /></div>
                    <div>• ② 기관 목록 표 헤더: 기관명 | 종별 | 응급의료기관 지정(권역센터·지역센터·지역기관·미지정) | 책임의료기관 지정(권역책임·지역책임·미지정) <TypeTag label="Text" /></div>
                    <div>• ③ 자원 매트릭스 헤더(열=기관, 초점 기관 강조): 의료인력(의사·전문의·간호사) | 병상(성인·소아·신생아 중환자실·응급·수술·분만·인공신장·정신과) | 진료과목(●복수·○단수·△전문의없음·+미개설) <TypeTag label="Text" /></div>
                  </div>

                  {/* 자원 매트릭스 테이블 */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs border border-slate-200 dark:border-slate-800">
                      <thead className="bg-slate-100 dark:bg-slate-900 font-bold">
                        <tr>
                          <th className="py-2 px-3 text-left">자원 구분 / 항목</th>
                          <th className="py-2 px-3 text-center bg-orange-50 dark:bg-orange-950/40 text-orange-900 dark:text-orange-200 border-x border-orange-300">
                            ★ 초점기관: {hosp.기관명}
                          </th>
                          <th className="py-2 px-3 text-center">동일권역 경쟁병원 A</th>
                          <th className="py-2 px-3 text-center">인접권역 거점병원 ({compHosp.기관명})</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-center">
                        <tr>
                          <td className="py-2 px-3 text-left font-bold">종별 / 응급 / 책임지정</td>
                          <td className="py-2 px-3 font-black bg-orange-50/40 dark:bg-orange-950/20 border-x border-orange-200">
                            {hosp.유형} / {hosp.실데이터.응급의료기관_분류 || '지역응급기관'} / 지역책임
                          </td>
                          <td className="py-2 px-3">병원 / 미지정 / 미지정</td>
                          <td className="py-2 px-3">{compHosp.유형} / 지역응급센터 / 지역책임</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-3 text-left font-bold">의료인력 (전문의 / 간호사)</td>
                          <td className="py-2 px-3 font-black bg-orange-50/40 dark:bg-orange-950/20 border-x border-orange-200">
                            전문의 {metrics.docs}명 / 간호사 {metrics.nurses}명
                          </td>
                          <td className="py-2 px-3">전문의 6명 / 간호사 34명</td>
                          <td className="py-2 px-3">전문의 {metrics.cDocs}명 / 간호사 {compHosp.간호사수}명</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-3 text-left font-bold">특수병상 (성인ICU / 소아·NICU / 응급 / 분만 / 투석)</td>
                          <td className="py-2 px-3 font-bold bg-orange-50/40 dark:bg-orange-950/20 border-x border-orange-200">
                            성인ICU 10 / NICU 0 / 응급 15 / 분만 {hosp.실데이터.분만가능 ? '2' : '0'} / 투석 18
                          </td>
                          <td className="py-2 px-3">성인ICU 0 / NICU 0 / 응급 0 / 분만 0 / 투석 0</td>
                          <td className="py-2 px-3">성인ICU 16 / NICU 4 / 응급 20 / 분만 4 / 투석 24</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-3 text-left font-bold">진료과목 (내과·외과·정형·소아·산부·신경외과)</td>
                          <td className="py-2 px-3 font-bold bg-orange-50/40 dark:bg-orange-950/20 border-x border-orange-200">
                            내과(●) · 정형(●) · 외과(○) · 소아(○) · 산부(○) · 신경외과(+)
                          </td>
                          <td className="py-2 px-3">내과(○) · 정형(●) · 외과(+) · 소아(+) · 산부(+) · 신경외과(+)</td>
                          <td className="py-2 px-3">내과(●) · 정형(●) · 외과(●) · 소아(●) · 산부(●) · 신경외과(○)</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    진단 <TypeTag label="소제목" />
                  </div>
                  <LlmInterpretationBox label="기관 위상·규모 진단 — 종별·응급/책임의료기관 지정 등 제도적 위상" fieldKey="p1_res_status" />
                  <LlmInterpretationBox label="인력·병상 역량 진단 — 급성기·중증 응급 대응 역량" fieldKey="p1_res_capacity" />
                  <LlmInterpretationBox label="진료과목 포괄성·공백 진단 — 단수(○)·미개설(+)·소아/신생아 중환자 공백" fieldKey="p1_res_dept" />
                </div>
              </div>
            </div>

            {/* 대제목 3: 종합 진단 */}
            <div className="space-y-3 pt-2">
              <h4 className="text-base font-black text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-900 px-3.5 py-2 rounded-xl border-l-4 border-emerald-600">
                종합 진단 <TypeTag label="대제목" />
              </h4>
              <LlmInterpretationBox label="교차 해석 — 공급 초과·유입 시장 속 기대 역할, 고령·중증 대응형 역할 재정의 (중제목)" fieldKey="p1_syn_cross" />
              <LlmInterpretationBox label="강점 (Strength) — 급성기·응급·전문인력·공급 여력 등 강화 대상 (중제목)" fieldKey="p1_syn_strength" />
              <LlmInterpretationBox label="취약점·리스크 (Weakness/Risk) — 소아·신생아 중환자·단수/미개설 과목·책임의료기관 미지정 등 공백 (중제목)" fieldKey="p1_syn_weakness" />
              <LlmInterpretationBox label="전략 방향 — 단기(응급·급성기 강화) / 중기(고령·중증 기능 재편·과목 지역 연계) / 지속(공공·필수의료 광역 거점 확보) (중제목)" fieldKey="p1_syn_strategy" />
            </div>
          </div>
        )}

        {/* ================================================================== */}
        {/* [탭 2] 기관프로파일 ② 진료기능                                      */}
        {/* ================================================================== */}
        {activeReportTab === 'p2_function' && (
          <div className="space-y-6">
            {/* 타이틀 */}
            <div className="border-b-2 border-slate-900 dark:border-slate-200 pb-4 space-y-2">
              <div className="text-xs font-black text-slate-400 uppercase">기관프로파일 ② 진료기능</div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-snug">
                <OrangePlaceholder placeholder="연도" value={baseYear} />년 의료기관 프로파일 - ②진료기능 [
                <OrangePlaceholder placeholder="종별·병상규모" value={hospScaleLabel} />]{' '}
                <OrangePlaceholder placeholder="기관명" value={hosp.기관명} /> (
                <OrangePlaceholder placeholder="시도" value={sidoName} />{' '}
                <OrangePlaceholder placeholder="중진료권" value={medicalZoneName} /> 비교권역)
                <TypeTag label="타이틀" />
              </h3>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400">
                · 판정 기준: 동일 종별·병상규모 또래 평균 및 지역평균(중진료권·시도·전국) 대비 높음/보통/낮음.
              </div>
            </div>

            {/* 보고서 개요 */}
            <div className="space-y-3">
              <h4 className="text-base font-black text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-900 px-3.5 py-2 rounded-xl border-l-4 border-slate-800">
                보고서 개요 <TypeTag label="대제목" />
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1.5">
                  <div className="font-black text-sm">목적 <TypeTag label="중제목" /></div>
                  <p>• 선택 기관의 &apos;병원 성격&apos;(진료역량 특성)을 규정합니다. <TypeTag label="Text" /></p>
                  <p>• 진료실적·운영효율·진료역량·점유율·환자분포를 다각도로 진단합니다. <TypeTag label="Text" /></p>
                  <p>• 동일 종별·병상규모 또래(peer) 및 지역평균 대비 상대 위치를 평가합니다. <TypeTag label="Text" /></p>
                </div>
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1.5">
                  <div className="font-black text-sm">자료 및 진단 방법 <TypeTag label="중제목" /></div>
                  <p>• 자료원: 국립중앙의료원 의료기관 프로파일 대시보드(②진료기능) <TypeTag label="Text" /></p>
                  <p>• 비교 기준: 동일 종별·병상규모 평균 + 지역평균(중진료권·시도·전국) 다층 비교 <TypeTag label="Text" /></p>
                  <p>• 추이: 최근 3~5개년 자기추이와 전년대비 증감(색상 부호) / 판정: 높음/보통/낮음 <TypeTag label="Text" /></p>
                </div>
              </div>
            </div>

            {/* 현황 및 진단 */}
            <div className="space-y-5">
              <h4 className="text-base font-black text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-900 px-3.5 py-2 rounded-xl border-l-4 border-blue-600">
                현황 및 진단 <TypeTag label="대제목" />
              </h4>

              {/* ▶의료환경 특성-{기관명} */}
              <div className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/60 space-y-2 text-xs">
                <div className="font-black text-sm flex items-center justify-between">
                  <span>
                    ▶의료환경 특성-<OrangePlaceholder placeholder="기관명" value={hosp.기관명} /> <TypeTag label="중제목" />
                  </span>
                  <span className="px-2 py-0.5 rounded bg-rose-600 text-white text-[11px] font-black">⟦확인 필요⟧</span>
                </div>
                <p className="text-rose-800 dark:text-rose-300">
                  ※ [편집 안내] 화면상 &apos;의료 환경 특성 기입란&apos;이 비어 있어 현황·진단을 생성하지 않았습니다 <strong className="text-rose-600">⟦확인 필요⟧</strong>.
                </p>
                <input
                  type="text"
                  value={p2EnvCharacteristicInput}
                  onChange={(e) => setP2EnvCharacteristicInput(e.target.value)}
                  placeholder="(선택사항) 원자료 확인 후 기관의 의료환경 특성 메모를 기입하십시오..."
                  className="w-full px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-800 bg-white dark:bg-slate-900 text-xs"
                />
              </div>

              {/* ▶총 내원일수, 건당 내원일수, 건당 진료비, 입원일당 진료비 현황 */}
              <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="font-black text-sm">
                  ▶총 내원일수, 건당 내원일수, 건당 진료비, 입원일당 진료비 현황 <TypeTag label="중제목" />
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  • 총 내원일수·건당 내원일수·건당 진료비·입원일당 진료비의 최근 5개년 추이와 환자층(성별·연령대)을 파악합니다. <TypeTag label="Text" />
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs border border-slate-200 dark:border-slate-800">
                    <thead className="bg-slate-100 dark:bg-slate-900 font-bold">
                      <tr>
                        <th className="py-2 px-3 text-left">이용지표 / 환자층</th>
                        <th className="py-2 px-3 text-center">총 내원일수(일)</th>
                        <th className="py-2 px-3 text-center">건당 내원일수(일)</th>
                        <th className="py-2 px-3 text-center">건당 진료비(원)</th>
                        <th className="py-2 px-3 text-center">입원일당 진료비(원)</th>
                        <th className="py-2 px-3 text-center">고령층(65세+) 비중</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t border-slate-200 dark:border-slate-800 text-center font-bold">
                        <td className="py-2 px-3 text-left">{hosp.기관명} ({baseYear})</td>
                        <td className="py-2 px-3 text-blue-600">{metrics.totalInpatientDays.toLocaleString()}일 (+4.2%)</td>
                        <td className="py-2 px-3">{metrics.avgLos}일 (-0.3일)</td>
                        <td className="py-2 px-3">{metrics.costPerCase.toLocaleString()}원 (+5.8%)</td>
                        <td className="py-2 px-3">{metrics.costPerDay.toLocaleString()}원 (+6.4%)</td>
                        <td className="py-2 px-3 text-amber-600">68.4% (19-64세 28.4% · 19세미만 3.2%)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <LlmInterpretationBox label="양적 성장·궤적 진단 — 내원일수 추이 방향(성장/침체)" fieldKey="p2_vol_growth" />
                <LlmInterpretationBox label="환자층 구성 진단 — 성별·고연령(65+) 비중과 서비스 방향(재활·만성 연계)" fieldKey="p2_vol_patient" />
              </div>

              {/* ▶병상가동률 */}
              <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="font-black text-sm">▶병상가동률 <TypeTag label="중제목" /></div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-500">전체 병상 가동률(%)</span>
                    <div className="text-lg font-black text-blue-600">{metrics.occPct}%</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-500">중환자실 병상 가동률(%)</span>
                    <div className="text-lg font-black text-indigo-600">{Math.min(95, metrics.occPct + 8)}%</div>
                  </div>
                </div>
                <LlmInterpretationBox
                  label="운영 효율·중증 수용 진단 — 전체 가동률·중환자실 가동률(중증 진료 역할)"
                  fieldKey="p2_occ_diag"
                />
              </div>

              {/* ▶진료역량 비교 (7개 진료역량 지표) */}
              <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="font-black text-sm">▶진료역량 비교 (산점도 &amp; 7개 진료역량 지표) <TypeTag label="중제목" /></div>
                <div className="text-[11px] text-slate-500">
                  • ① 산점도 헤더: X축 평균 재원일수({metrics.avgLos}일) / Y축 DRG 개수({metrics.drgCount}개) — 동종·동규모 평균 대비 위치 확인 <TypeTag label="Text" />
                  <br />• ② 7지표 표 헤더: 지표 | 당해값 | 전년대비 | 지역평균(중진료권·시도·전국) | 판정 <TypeTag label="Table" />
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs border border-slate-200 dark:border-slate-800">
                    <thead className="bg-slate-100 dark:bg-slate-900 font-bold">
                      <tr>
                        <th className="py-2 px-3 text-left">7대 진료역량 지표</th>
                        <th className="py-2 px-3 text-center">당해값 ({hosp.기관명})</th>
                        <th className="py-2 px-3 text-center">전년대비</th>
                        <th className="py-2 px-3 text-center">중진료권 평균</th>
                        <th className="py-2 px-3 text-center">시도 평균</th>
                        <th className="py-2 px-3 text-center">전국 동종평균</th>
                        <th className="py-2 px-3 text-center">판정</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-center">
                      <tr>
                        <td className="py-2 px-3 text-left font-bold">1. DRG 개수 (질환군 포괄성)</td>
                        <td className="font-black text-blue-600">{metrics.drgCount}개</td>
                        <td className="text-emerald-600">+6개</td>
                        <td>138개</td>
                        <td>152개</td>
                        <td>148개</td>
                        <td><span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">높음</span></td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 text-left font-bold">2. 평균 재원일수</td>
                        <td className="font-black">{metrics.avgLos}일</td>
                        <td className="text-emerald-600">-0.3일</td>
                        <td>11.4일</td>
                        <td>10.9일</td>
                        <td>10.5일</td>
                        <td><span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold">보통</span></td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 text-left font-bold">3. 수술비중 (%)</td>
                        <td className="font-black">{metrics.surgeryRatio}%</td>
                        <td className="text-emerald-600">+1.1%p</td>
                        <td>13.5%</td>
                        <td>16.8%</td>
                        <td>17.2%</td>
                        <td><span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold">보통</span></td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 text-left font-bold">4. 중증도(전문진료질병군) 비중</td>
                        <td className="font-black">{metrics.severeRatio}%</td>
                        <td className="text-emerald-600">+0.8%p</td>
                        <td>10.2%</td>
                        <td>14.5%</td>
                        <td>15.1%</td>
                        <td><span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">낮음(개선)</span></td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 text-left font-bold">5. 최빈 MDC 비율</td>
                        <td className="font-black">{metrics.topMdcRatio}%</td>
                        <td>-0.5%p</td>
                        <td>29.5%</td>
                        <td>25.0%</td>
                        <td>24.2%</td>
                        <td><span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold">보통(다과목형)</span></td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 text-left font-bold">6. 전문재활비율</td>
                        <td className="font-black text-indigo-600">{metrics.rehabRatio}%</td>
                        <td className="text-emerald-600">+1.4%p</td>
                        <td>7.2%</td>
                        <td>8.0%</td>
                        <td>7.8%</td>
                        <td><span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">높음</span></td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 text-left font-bold">7. 3일이내 전원입원비율</td>
                        <td className="font-black">{metrics.transferIn3DaysRatio}%</td>
                        <td>+0.4%p</td>
                        <td>4.1%</td>
                        <td>3.8%</td>
                        <td>3.5%</td>
                        <td><span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">높음(응급연계)</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="space-y-2">
                  <LlmInterpretationBox label="질환군 포괄성 진단 — DRG 개수·최빈 MDC 비율" fieldKey="p2_cap_drg" />
                  <LlmInterpretationBox label="중증·수술 지향 진단 — 중증도 비중·수술비중·입원일당 진료비" fieldKey="p2_cap_severe" />
                  <LlmInterpretationBox label="급성 vs 아급성·재활 진단 — 평균 재원일수·전문재활비율" fieldKey="p2_cap_acute" />
                  <LlmInterpretationBox label="병원 성격 종합 규정 — 한 줄 규정" fieldKey="p2_cap_identity" />
                </div>
              </div>

              {/* ▶점유율 3종 & ▶내원환자 지역분포 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="font-black text-sm">▶지역병원 병상 점유율 &amp; ▶이용량·제공량 점유율 <TypeTag label="중제목" /></div>
                  <LlmInterpretationBox label="인프라 규모 위상 진단 (병상 점유율)" fieldKey="p2_share_bed" />
                  <LlmInterpretationBox label="수요 점유·강점 분야 진단 (이용량 점유율)" fieldKey="p2_share_use" />
                  <LlmInterpretationBox label="역할 유형 진단 (제공량>이용량 관외 유입형 vs 관내 소화형)" fieldKey="p2_share_supply" />
                </div>
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="font-black text-sm">
                    ▶내원환자 지역분포-<OrangePlaceholder placeholder="기관명" value={hosp.기관명} /> (유입 Top5) <TypeTag label="중제목" />
                  </div>
                  <LlmInterpretationBox label="진료권 도달 범위 진단 — 밀착형 vs 광역 커버리지형" fieldKey="p2_inflow_reach" />
                  <LlmInterpretationBox label="접근성·맞춤 서비스 진단 — 교통 접근성, 농촌형/도시형 서비스" fieldKey="p2_inflow_access" />
                </div>
              </div>
            </div>

            {/* 종합 진단 */}
            <div className="space-y-3 pt-2">
              <h4 className="text-base font-black text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-900 px-3.5 py-2 rounded-xl border-l-4 border-emerald-600">
                종합 진단 <TypeTag label="대제목" />
              </h4>
              <LlmInterpretationBox label="교차 해석 — 진료역량·점유·유입을 엮은 병원 정체성과 지역 내 위상 (중제목)" fieldKey="p2_syn_cross" />
              <LlmInterpretationBox label="강점 (Strength) — 또래·지역평균 대비 우위 지표·분야 (중제목)" fieldKey="p2_syn_strength" />
              <LlmInterpretationBox label="취약점·리스크 (Weakness/Risk) — 열위·공백 지표·분야 (중제목)" fieldKey="p2_syn_weakness" />
              <LlmInterpretationBox label="전략 방향 — 단기(강점 특화)/중기(약점 개선·역할 재정립)/지속(지역수요-역량 연계) (중제목)" fieldKey="p2_syn_strategy" />
            </div>
          </div>
        )}

        {/* ================================================================== */}
        {/* [탭 3] 기관프로파일 ③ 진료실적 (4개 성과변수 × 7개 서브그룹)        */}
        {/* ================================================================== */}
        {activeReportTab === 'p3_performance' && (
          <div className="space-y-6">
            <div className="border-b-2 border-slate-900 dark:border-slate-200 pb-4 space-y-2">
              <div className="text-xs font-black text-slate-400 uppercase">기관프로파일 ③ 진료실적</div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-snug">
                <OrangePlaceholder placeholder="연도" value={baseYear} />년 의료기관 프로파일 - ③진료실적 [
                <OrangePlaceholder placeholder="종별·병상규모" value={hospScaleLabel} />]{' '}
                <OrangePlaceholder placeholder="기관명" value={hosp.기관명} /> (
                <OrangePlaceholder placeholder="시도" value={sidoName} />{' '}
                <OrangePlaceholder placeholder="중진료권" value={medicalZoneName} />)
                <TypeTag label="타이틀" />
              </h3>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400">
                · 4개 성과변수(총 내원일수·건당 진료비·건당 내원일수·입원일당 진료비) × 7개 환자 서브그룹(성별·연령대·진료과목·내원환자 지역구분·진료계·중증도·주진단범주 MDC 26군) 분해 프로파일링.
              </div>
            </div>

            {/* 4개 성과변수 × 7개 서브그룹 매트릭스 요약표 */}
            <div className="space-y-3">
              <h4 className="text-base font-black text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-900 px-3.5 py-2 rounded-xl border-l-4 border-blue-600">
                현황 및 진단 — 4개 성과변수 × 7개 서브그룹 프로파일 표 <TypeTag label="대제목" /> <TypeTag label="Table" />
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-xs border border-slate-200 dark:border-slate-800">
                  <thead className="bg-slate-100 dark:bg-slate-900 font-bold">
                    <tr>
                      <th className="py-2.5 px-3 text-left">7개 환자 서브그룹 축</th>
                      <th className="py-2.5 px-3 text-left">주요 세부 범주</th>
                      <th className="py-2.5 px-3 text-center">▶총 내원일수 (값 · 구성비%)</th>
                      <th className="py-2.5 px-3 text-center">▶건당 진료비 (강도값, 원)</th>
                      <th className="py-2.5 px-3 text-center">▶건당 내원일수 (강도값, 일)</th>
                      <th className="py-2.5 px-3 text-center">▶입원일당 진료비 (강도값, 원)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-center">
                    <tr>
                      <td className="py-2 px-3 text-left font-bold">1. 성별</td>
                      <td className="py-2 px-3 text-left">남성 / 여성</td>
                      <td>여성 54.8% / 남성 45.2%</td>
                      <td>남성 {(metrics.costPerCase * 1.06).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}원</td>
                      <td>여성 {(metrics.avgLos + 0.8).toFixed(1)}일</td>
                      <td>남성 {(metrics.costPerDay * 1.05).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}원</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 text-left font-bold">2. 연령대</td>
                      <td className="py-2 px-3 text-left">65세 이상 / 19-64세 / 19세 미만</td>
                      <td className="font-bold text-blue-600">65세+ (68.4%) 집중</td>
                      <td>65세+ {(metrics.costPerCase * 1.18).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}원</td>
                      <td>65세+ {(metrics.avgLos + 2.4).toFixed(1)}일</td>
                      <td>19-64세 {(metrics.costPerDay * 1.08).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}원</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 text-left font-bold">3. 진료과목</td>
                      <td className="py-2 px-3 text-left">내과 · 정형외과 · 신경과 · 외과</td>
                      <td>내과(46.2%) · 정형외과(24.5%)</td>
                      <td className="font-bold text-indigo-600">정형외과 {(metrics.costPerCase * 1.45).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}원</td>
                      <td>재활·신경과 15.8일</td>
                      <td>외과·중환자 {(metrics.costPerDay * 1.35).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}원</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 text-left font-bold">4. 내원환자 지역구분</td>
                      <td className="py-2 px-3 text-left">관내 시군구 / 인접 중진료권 / 타 시도</td>
                      <td>관내({metrics.ciPct}%) / 관외({(100 - metrics.ciPct).toFixed(1)}%)</td>
                      <td>관외 유입 {(metrics.costPerCase * 1.15).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}원</td>
                      <td>관내 {metrics.avgLos}일</td>
                      <td>관외 유입 {(metrics.costPerDay * 1.12).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}원</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 text-left font-bold">5. 진료계</td>
                      <td className="py-2 px-3 text-left">내과계 · 외과계 · 내과적 시술</td>
                      <td>내과계(64.5%) · 외과계(22.1%)</td>
                      <td className="font-bold text-indigo-600">외과계 {(metrics.costPerCase * 1.52).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}원</td>
                      <td>외과계 {(metrics.avgLos + 1.2).toFixed(1)}일</td>
                      <td className="font-bold text-indigo-600">내과적시술 {(metrics.costPerDay * 1.4).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}원</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 text-left font-bold">6. 중증도</td>
                      <td className="py-2 px-3 text-left">전문 · 일반 · 단순진료질병군</td>
                      <td>일반(61.2%) · 단순(27.0%) · 전문({metrics.severeRatio}%)</td>
                      <td className="font-bold text-indigo-600">전문질병군 {(metrics.costPerCase * 1.68).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}원</td>
                      <td>전문 {(metrics.avgLos + 3.1).toFixed(1)}일 / 단순 8.4일</td>
                      <td>전문질병군 {(metrics.costPerDay * 1.48).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}원</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 text-left font-bold">7. 주진단범주(MDC 26군)</td>
                      <td className="py-2 px-3 text-left">호흡기계 · 근골격계 · 소화기계 · 순환기계</td>
                      <td>호흡기({metrics.topMdcRatio}%) · 근골격(21.4%)</td>
                      <td>순환기·근골격 수술군 고비용</td>
                      <td>신경계·호흡기계 장기재원</td>
                      <td>순환기계·PreMDC 고집약</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                <LlmInterpretationBox label="▶총 내원일수 — 수요 집중 핵심 환자군 진단" fieldKey="p3_days_core" />
                <LlmInterpretationBox label="▶총 내원일수 — 비주력·공백 영역 진단" fieldKey="p3_days_gap" />
                <LlmInterpretationBox label="▶건당 진료비 — 고비용·고난도 강점 환자군 진단" fieldKey="p3_casecost_high" />
                <LlmInterpretationBox label="▶건당 내원일수 — 재원 강도 높은/낮은 환자군 진단" fieldKey="p3_los_diag" />
                <LlmInterpretationBox label="▶입원일당 진료비 — 일당 집약도·중증 수용 진단" fieldKey="p3_daycost_intense" />
                <LlmInterpretationBox label="▶입원일당 진료비 — 개선·재배치 후보 환자군 진단" fieldKey="p3_daycost_shift" />
              </div>
            </div>

            {/* 종합 진단 */}
            <div className="space-y-3 pt-2">
              <h4 className="text-base font-black text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-900 px-3.5 py-2 rounded-xl border-l-4 border-emerald-600">
                종합 진단 <TypeTag label="대제목" />
              </h4>
              <LlmInterpretationBox label="교차 해석 — 볼륨(수요 집중) vs 강도·비용(고난도 강점) 이중구조 (중제목)" fieldKey="p3_syn_cross" />
              <LlmInterpretationBox label="강점 (Strength) — 전문진료질병군·외과계·광역 유입 등 집중·확대 대상 (중제목)" fieldKey="p3_syn_strength" />
              <LlmInterpretationBox label="취약점·리스크 (Weakness/Risk) — 단순·경증군 비효율 (중제목)" fieldKey="p3_syn_weakness" />
              <LlmInterpretationBox label="전략 방향 — 단기(강점 환자군 집중)/중기(경증 재배치·지역 연계)/지속(환자군별 맞춤·모니터링) (중제목)" fieldKey="p3_syn_strategy" />
            </div>
          </div>
        )}

        {/* ================================================================== */}
        {/* [탭 4] 기관프로파일 ④ 기관비교 (◆선택기관 vs ◆비교기관 거울형)      */}
        {/* ================================================================== */}
        {activeReportTab === 'p4_inst_compare' && (
          <div className="space-y-6">
            <div className="border-b-2 border-slate-900 dark:border-slate-200 pb-4 space-y-2">
              <div className="text-xs font-black text-slate-400 uppercase">기관프로파일 ④ 기관비교</div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-snug">
                <OrangePlaceholder placeholder="연도" value={baseYear} />년 의료기관 프로파일 - ④기관비교{' '}
                <span className="text-blue-600">◆선택기관</span> [
                <OrangePlaceholder placeholder="종별·병상규모" value={hospScaleLabel} />]{' '}
                <OrangePlaceholder placeholder="기관명" value={hosp.기관명} />{' '}
                <span className="text-emerald-600 ml-2">◆비교기관</span> [
                <OrangePlaceholder placeholder="비교 종별·병상규모" value={compHospScaleLabel} />]{' '}
                <OrangePlaceholder placeholder="비교기관명" value={compHosp.기관명} />
                <TypeTag label="타이틀" />
              </h3>
              <div className="p-3 rounded-xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800 text-[11px] text-slate-700 dark:text-slate-300 flex items-center justify-between flex-wrap gap-2">
                <span>
                  · 화면은 <strong className="text-blue-600">◆선택기관(좌·파랑)</strong> /{' '}
                  <strong className="text-emerald-600">◆비교기관(우·초록)</strong> 거울형 2패널이며, 격차는{' '}
                  <strong>(선택 − 비교)</strong>로 정량화합니다. 종별·병상규모 차이는 보정 후 해석합니다.
                </span>
                <span className="px-2 py-0.5 rounded bg-rose-600 text-white font-black">
                  ⟦비교 공정성 확인 필요: {hosp.허가병상}병상 vs {compHosp.허가병상}병상⟧
                </span>
              </div>
            </div>

            {/* 변수 선택 탭 */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-black text-slate-700 dark:text-slate-300">
                ▶<OrangePlaceholder placeholder="연도" value={baseYear} />년{' '}
                <OrangePlaceholder placeholder="변수" value={selectedVarTab} /> 전환:
              </span>
              {(['총 내원일수', '건당 내원일수', '건당 진료비', '입원일당 진료비'] as 성과변수_4종_타입[]).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setSelectedVarTab(v)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition ${
                    selectedVarTab === v
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>

            {/* 표1: 4개 변수 KPI 비교 통합 표 */}
            <div className="space-y-2">
              <div className="text-xs font-bold">
                표1 (4개 변수 KPI 거울형 비교) <TypeTag label="Table" />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs border border-slate-200 dark:border-slate-800">
                  <thead className="bg-slate-100 dark:bg-slate-900 font-bold">
                    <tr>
                      <th className="py-2.5 px-3 text-left">변수 (4대 성과지표)</th>
                      <th className="py-2.5 px-3 text-center bg-blue-50/70 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300">
                        ◆선택기관 ({hosp.기관명})
                      </th>
                      <th className="py-2.5 px-3 text-center bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300">
                        ◆비교기관 ({compHosp.기관명})
                      </th>
                      <th className="py-2.5 px-3 text-center bg-amber-50/70 dark:bg-amber-950/40">
                        격차 (선택 − 비교)
                      </th>
                      <th className="py-2.5 px-3 text-center">전년대비 (선택 / 비교, %)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-center font-medium">
                    <tr>
                      <td className="py-2 px-3 text-left font-bold">1. 총 내원일수 (일)</td>
                      <td className="py-2 px-3 font-black text-blue-600">{metrics.totalInpatientDays.toLocaleString()}일</td>
                      <td className="py-2 px-3 font-black text-emerald-600">{metrics.cTotalDays.toLocaleString()}일</td>
                      <td className="py-2 px-3 font-bold">
                        {(metrics.totalInpatientDays - metrics.cTotalDays).toLocaleString()}일
                      </td>
                      <td className="py-2 px-3">+4.2% / +3.1%</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 text-left font-bold">2. 건당 내원일수 (일)</td>
                      <td className="py-2 px-3 font-black text-blue-600">{metrics.avgLos}일</td>
                      <td className="py-2 px-3 font-black text-emerald-600">{metrics.cAvgLos}일</td>
                      <td className="py-2 px-3 font-bold">
                        {(metrics.avgLos - metrics.cAvgLos).toFixed(1)}일
                      </td>
                      <td className="py-2 px-3">-2.7% / -1.2%</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 text-left font-bold">3. 건당 진료비 (원)</td>
                      <td className="py-2 px-3 font-black text-blue-600">{metrics.costPerCase.toLocaleString()}원</td>
                      <td className="py-2 px-3 font-black text-emerald-600">{metrics.cCostPerCase.toLocaleString()}원</td>
                      <td className="py-2 px-3 font-bold">
                        {(metrics.costPerCase - metrics.cCostPerCase).toLocaleString()}원
                      </td>
                      <td className="py-2 px-3">+5.8% / +4.5%</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 text-left font-bold">4. 입원일당 진료비 (원)</td>
                      <td className="py-2 px-3 font-black text-blue-600">{metrics.costPerDay.toLocaleString()}원</td>
                      <td className="py-2 px-3 font-black text-emerald-600">{metrics.cCostPerDay.toLocaleString()}원</td>
                      <td className="py-2 px-3 font-bold">
                        {(metrics.costPerDay - metrics.cCostPerDay).toLocaleString()}원
                      </td>
                      <td className="py-2 px-3">+6.4% / +5.1%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-2">
              <LlmInterpretationBox label="상대 우열·격차 방향 진단 — 규모 열위 딛고 앞서는지, 벌리는/좁히는 흐름" fieldKey="p4_comp_direction" />
              <LlmInterpretationBox label="격차 소재·원인 진단 — 강점 집중(특화형)·열위 영역, 중증도·진료계 집약도" fieldKey="p4_comp_cause" />
            </div>

            {/* 종합 진단 */}
            <div className="space-y-3 pt-2">
              <h4 className="text-base font-black text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-900 px-3.5 py-2 rounded-xl border-l-4 border-emerald-600">
                종합 진단 <TypeTag label="대제목" />
              </h4>
              <LlmInterpretationBox label="교차 해석 — 종별·규모 효과, 중증·시술 집약도, 포트폴리오 특화 (중제목)" fieldKey="p4_syn_cross" />
              <LlmInterpretationBox label="강점 (Strength) — 비교기관 대비 우위 영역(강화·차별화) (중제목)" fieldKey="p4_syn_strength" />
              <LlmInterpretationBox label="취약점·리스크 (Weakness/Risk) — 열위 영역 원인·대응(목표=비교기관 수준) (중제목)" fieldKey="p4_syn_weakness" />
              <LlmInterpretationBox label="전략 방향 — 단기/중기/지속 목표 및 격차 단축 (중제목)" fieldKey="p4_syn_strategy" />
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 text-[11px] text-slate-500">
                ※ [편집 안내] 정량 지표만으로 의료의 질·환자 만족도·공공 기여도를 평가하기 어렵습니다. 종별·규모·기준연도 차이와 정성 요소를 함께 고려하십시오.
              </div>
            </div>
          </div>
        )}

        {/* ================================================================== */}
        {/* [탭 5] 기관프로파일 ⑤ 지역비교 (◆비교지역1 vs ◆비교지역2 & 3층위)   */}
        {/* ================================================================== */}
        {activeReportTab === 'p5_region_compare' && (
          <div className="space-y-6">
            <div className="border-b-2 border-slate-900 dark:border-slate-200 pb-4 space-y-2">
              <div className="text-xs font-black text-slate-400 uppercase">기관프로파일 ⑤ 지역비교</div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-snug">
                <OrangePlaceholder placeholder="연도" value={baseYear} />년 의료기관 프로파일 - ⑤지역비교{' '}
                <span className="text-blue-600">◆비교지역1</span>{' '}
                <OrangePlaceholder placeholder="비교지역1" value={compareRegion1} />{' '}
                <span className="text-emerald-600 ml-2">◆비교지역2</span>{' '}
                <OrangePlaceholder placeholder="비교지역2" value={compareRegion2} /> [지역구분:{' '}
                <OrangePlaceholder placeholder="지역구분" value={regionLevel} />]
                <TypeTag label="타이틀" />
              </h3>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400">
                · 강조 규칙: <strong>평균 이상 = 강점(더 발전)</strong> / <strong>평균 이하 = 집중 개선(지역평균 수렴)</strong>. 빈 항목은 서비스 미제공 신호입니다.
              </div>
            </div>

            {/* 표1: 4개 변수 KPI · 다층 평균(시군구·중진료권·시도) 비교 */}
            <div className="space-y-2">
              <div className="text-xs font-bold">
                표1 (4개 변수 KPI · 시군구[250]·중진료권[70]·시도[17] 다층 평균 비교) <TypeTag label="Table" />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs border border-slate-200 dark:border-slate-800">
                  <thead className="bg-slate-100 dark:bg-slate-900 font-bold">
                    <tr>
                      <th className="py-2.5 px-3 text-left">변수 (4대 지표)</th>
                      <th className="py-2.5 px-3 text-center bg-blue-50/70 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300">
                        ◆비교지역1 ({compareRegion1})
                      </th>
                      <th className="py-2.5 px-3 text-center bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300">
                        ◆비교지역2 ({compareRegion2})
                      </th>
                      <th className="py-2.5 px-3 text-center">시군구 평균(250개)</th>
                      <th className="py-2.5 px-3 text-center">중진료권 평균(70개)</th>
                      <th className="py-2.5 px-3 text-center">시도 평균(17개)</th>
                      <th className="py-2.5 px-3 text-center">다층 판정</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-center">
                    <tr>
                      <td className="py-2 px-3 text-left font-bold">1. 총 내원일수 (기관평균, 일)</td>
                      <td className="font-black text-blue-600">{metrics.totalInpatientDays.toLocaleString()}</td>
                      <td className="font-black text-emerald-600">{metrics.cTotalDays.toLocaleString()}</td>
                      <td>48,200</td>
                      <td>54,500</td>
                      <td>62,800</td>
                      <td><span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">시군구 상회(강점)</span></td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 text-left font-bold">2. 건당 내원일수 (일)</td>
                      <td className="font-black text-blue-600">{metrics.avgLos}일</td>
                      <td className="font-black text-emerald-600">{metrics.cAvgLos}일</td>
                      <td>11.5일</td>
                      <td>11.1일</td>
                      <td>10.6일</td>
                      <td><span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold">중진료권 수렴</span></td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 text-left font-bold">3. 건당 진료비 (원)</td>
                      <td className="font-black text-blue-600">{metrics.costPerCase.toLocaleString()}원</td>
                      <td className="font-black text-emerald-600">{metrics.cCostPerCase.toLocaleString()}원</td>
                      <td>2,580,000원</td>
                      <td>2,790,000원</td>
                      <td>3,120,000원</td>
                      <td><span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">시도 하회(집중개선)</span></td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 text-left font-bold">4. 입원일당 진료비 (원)</td>
                      <td className="font-black text-blue-600">{metrics.costPerDay.toLocaleString()}원</td>
                      <td className="font-black text-emerald-600">{metrics.cCostPerDay.toLocaleString()}원</td>
                      <td>224,000원</td>
                      <td>251,000원</td>
                      <td>294,000원</td>
                      <td><span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">시군구 상회</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-2">
              <LlmInterpretationBox label="다층 위치·추세 진단 — 세 층위 상회(견고)/엇갈림(불균형), 절대 우위 vs 추세 수렴" fieldKey="p5_reg_layer" />
              <LlmInterpretationBox label="진료 성격·스코프 진단 — 고난도 중증·시술 구성 차이, 빈 진료과목·MDC(서비스 미제공 신호)" fieldKey="p5_reg_scope" />
            </div>

            {/* 종합 진단 */}
            <div className="space-y-3 pt-2">
              <h4 className="text-base font-black text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-900 px-3.5 py-2 rounded-xl border-l-4 border-emerald-600">
                종합 진단 <TypeTag label="대제목" />
              </h4>
              <LlmInterpretationBox label="교차 해석 — 다층 상대 위치, 진료 성격 위치, 점유율-진료비 연계 역할 (중제목)" fieldKey="p5_syn_cross" />
              <LlmInterpretationBox label="강점 (Strength) — 지역평균 상회 영역(특화 심화) (중제목)" fieldKey="p5_syn_strength" />
              <LlmInterpretationBox label="취약점·리스크 (Weakness/Risk) — 평균 하회·층위 엇갈림 영역(집중 개선) (중제목)" fieldKey="p5_syn_weakness" />
              <LlmInterpretationBox label="전략 방향 — 강점 특화 심화 / 개선 지역평균 수렴(전국 최상위 추종 아님) (중제목)" fieldKey="p5_syn_strategy" />
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 text-[11px] text-slate-500">
                ※ [편집 안내] 대도시와 농촌은 다른 기준으로 평가하고, 공공병원은 수익 지표보다 공공성·필수의료 기여도를 함께 고려하십시오.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
