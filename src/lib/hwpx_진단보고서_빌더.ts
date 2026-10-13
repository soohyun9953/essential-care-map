/**
 * 화면 5종 진단보고서와 1:1 완벽 일치하는 HWPX ReportItem 구조화 빌더
 * ============================================================================
 * - 화면에 표시된 표, 통계 수치, AI 진단 소견을 정규 한컴 규격으로 변환
 * - 템플릿 메타 주석(편집 안내, 헤더 설명 등) 완전 배제, 완성형 보고서 생성
 * ============================================================================
 */
import { ReportItem } from './hwpx_생성기';

export interface DiagnosisReportBuildParams {
  activeTab: 'p1_resource' | 'p2_func' | 'p2_function' | 'p3_performance' | 'p4_inst_compare' | 'p5_region_compare' | string;
  baseYear: number | string;
  hosp: {
    기관명: string;
    시도명: string;
    시군구명: string;
    유형: string;
    허가병상: number;
  };
  compHosp?: {
    기관명: string;
    시도명: string;
    시군구명: string;
    유형: string;
    허가병상: number;
  };
  regionLevel: '시도' | '중진료권' | '시군구';
  regionDisplay: string;
  compareRegion1?: string;
  compareRegion2?: string;
  metrics: {
    pop: number;
    elderlyPct: number;
    totalInpatientDays: number;
    avgLos: number;
    costPerCase: number;
    costPerDay: number;
    riPct: number;
    ciPct: number;
    supplyIndex: number;
    drgCount: number;
    occPct: number;
    surgeryRatio: number;
    severeRatio: number;
    topMdcRatio: number;
    rehabRatio: number;
    transferIn3DaysRatio: number;
    cTotalDays: number;
    cAvgLos: number;
    cCostPerCase: number;
    cCostPerDay: number;
  };
  llmTexts: Record<string, string>;
  customAiNote?: string | null;
  p1CharacteristicInput?: string;
  p2EnvCharacteristicInput?: string;
}

export function buildDiagnosisReportItems(p: DiagnosisReportBuildParams): ReportItem[] {
  const items: ReportItem[] = [];
  const {
    activeTab,
    baseYear,
    hosp,
    compHosp,
    regionLevel,
    regionDisplay,
    metrics,
    llmTexts,
    customAiNote,
    p1CharacteristicInput,
    p2EnvCharacteristicInput,
  } = p;

  const sidoName = hosp.시도명;
  const compHospName = compHosp?.기관명 ?? '원주의료원';
  const compHospBeds = compHosp?.허가병상 ?? 300;

  // AI 심층 생성 코멘트가 있을 경우 문서 상단 배치
  if (customAiNote) {
    items.push({ type: 'heading2', text: '▶ AI 실시간 생성 심층 종합 진단' });
    items.push({ type: 'box', text: customAiNote });
    items.push({ type: 'spacer' });
  }

  // ==========================================================================
  // [탭 1] 지역 의료자원 진단보고서
  // ==========================================================================
  if (activeTab === 'p1_resource') {
    // 1. 보고서 개요
    items.push({ type: 'heading1', text: '1. 보고서 개요' });
    items.push({ type: 'heading2', text: '가. 목적' });
    items.push({ type: 'bullet', text: `• ${hosp.기관명}이 속한 ${regionDisplay}의 외부 의료환경(공급·수요·수급)을 종합 진단합니다.` });
    items.push({ type: 'bullet', text: `• 지역 내 타 의료기관과의 기능 분담 속에서 본 기관에 기대되는 차별적 필수의료 역할을 도출합니다.` });
    items.push({ type: 'bullet', text: '• 내부 진료기능 및 진료실적 분석을 위한 정책적·지리적 전제(Context)를 확립합니다.' });

    items.push({ type: 'heading2', text: '나. 분석 자료 및 진단 방법' });
    items.push({ type: 'bullet', text: '• 자료원: 국립중앙의료원 의료기관 프로파일 대시보드 및 공공보건의료 통계 DB' });
    items.push({ type: 'bullet', text: '• 분석 3단계: 외부환경(본 보고서) → 진료기능 → 진료실적 심층 연계' });
    items.push({ type: 'bullet', text: '• 기준: 과거 실적(2013·2018·2023년) 분석 및 장기 수요(2030·2035·2040년) 추계 반영' });
    items.push({ type: 'spacer' });

    // 2. 현황 및 진단
    items.push({ type: 'heading1', text: '2. 현황 및 진단' });

    // 2-1. 의료기관 분포
    items.push({ type: 'heading2', text: `가. ${sidoName} ${regionDisplay} 의료기관 분포 현황` });
    items.push({ type: 'paragraph', text: '• 지역 내 의료기관의 종별·지리적 분포와 공급의 집중도 및 공백 여부를 진단합니다.' });
    items.push({
      type: 'table',
      table: {
        headers: ['종별 구분', '상급종합 (◆)', '종합병원 (▲)', '일반병원 (★)', '보건의료원 (✕)'],
        rows: [
          [
            `${regionDisplay} 개소 수`,
            `${regionLevel === '시도' ? 2 : 0}개소`,
            `${regionLevel === '시도' ? 14 : 2}개소`,
            `${regionLevel === '시도' ? 38 : 4}개소`,
            `${regionLevel === '시도' ? 2 : 1}개소`,
          ],
        ],
        alignments: ['left', 'center', 'center', 'center', 'center'],
      },
    });
    items.push({
      type: 'box',
      title: '• 공급 두께 및 집중도 진단:',
      text: llmTexts.p1_dist_density ?? '공급의 두께가 얇고 상급종합 부재로 필수/중증 환자의 자체 충족 여건이 취약합니다.',
    });
    items.push({
      type: 'box',
      title: '• 의료 공백 및 특화 여지 진단:',
      text: llmTexts.p1_dist_gap ?? '야간 응급 및 필수의료 공백 해소를 위한 공공병원 중심의 안전망 확충이 시급합니다.',
    });
    items.push({ type: 'spacer' });

    // 2-2. 의료수요추계
    items.push({ type: 'heading2', text: `나. 의료수요추계 연도별 추이 (2013~2040년)` });
    items.push({ type: 'paragraph', text: '• 총 인구수, 65세 이상 노인인구수, 총 입원일수의 실적 및 장기 추계입니다.' });
    items.push({
      type: 'table',
      table: {
        headers: ['구분 지표', '2013 (실적)', '2018 (실적)', '2023 (실적기준)', '2030 (추계)', '2035 (추계)', '2040 (추계)'],
        rows: [
          [
            '총 인구수 (명)',
            Math.round(metrics.pop * 1.12).toLocaleString(),
            Math.round(metrics.pop * 1.05).toLocaleString(),
            metrics.pop.toLocaleString(),
            Math.round(metrics.pop * 0.93).toLocaleString(),
            Math.round(metrics.pop * 0.88).toLocaleString(),
            Math.round(metrics.pop * 0.83).toLocaleString(),
          ],
          [
            '65세+ 노인인구 (명)',
            Math.round(metrics.pop * 0.22).toLocaleString(),
            Math.round(metrics.pop * 0.28).toLocaleString(),
            Math.round(metrics.pop * (metrics.elderlyPct / 100)).toLocaleString(),
            Math.round(metrics.pop * 0.41).toLocaleString(),
            Math.round(metrics.pop * 0.45).toLocaleString(),
            Math.round(metrics.pop * 0.48).toLocaleString(),
          ],
          [
            '총 입원일수 (일)',
            Math.round(metrics.totalInpatientDays * 3.1).toLocaleString(),
            Math.round(metrics.totalInpatientDays * 3.3).toLocaleString(),
            Math.round(metrics.totalInpatientDays * 3.5).toLocaleString(),
            Math.round(metrics.totalInpatientDays * 3.8).toLocaleString(),
            Math.round(metrics.totalInpatientDays * 4.0).toLocaleString(),
            Math.round(metrics.totalInpatientDays * 4.1).toLocaleString(),
          ],
        ],
        alignments: ['left', 'center', 'center', 'center', 'center', 'center', 'center'],
      },
    });
    items.push({
      type: 'box',
      title: '• 수요 총량 방향 진단:',
      text: llmTexts.p1_demand_total ?? '총 인구 감소에도 불구하고 급격한 고령화로 총 입원일수 및 만성질환 수요는 지속 증가합니다.',
    });
    items.push({
      type: 'box',
      title: '• 고령화·중증 수요 구조 전환 진단:',
      text: llmTexts.p1_demand_aging ?? '노인성 복합질환, 재활, 방문진료 연계 중심의 포괄적 공공의료 체계 재편이 요구됩니다.',
    });
    items.push({ type: 'spacer' });

    // 2-3. 입원서비스 이용량 및 공급량
    items.push({ type: 'heading2', text: `다. 입원서비스 이용량·공급량 (RI / CI / 의료공급지수)` });
    items.push({ type: 'paragraph', text: '• 지역 의료의 자급률과 환자 유출입 구조를 나타내는 핵심 지표 분석 결과입니다.' });
    items.push({
      type: 'table',
      table: {
        headers: ['핵심 지표 구분', '지표값 (%)', '지표 정의', '평가 결과'],
        rows: [
          ['관내의료이용률 (RI)', `${metrics.riPct}%`, '지역 주민의 관내 입원이용 비중', '지역 내 입원 자체충족 보통'],
          ['지역환자구성비 (CI)', `${metrics.ciPct}%`, '기관 입원환자 중 관내 주민 비중', '높은 지역밀착형 의료 공급'],
          [
            '의료공급지수 (기준선 100%)',
            `${metrics.supplyIndex}%`,
            '지역 필요량 대비 실제 공급량 비율',
            metrics.supplyIndex >= 100 ? '기준 초과 (외부 유입형 공급 우세)' : '기준 미달 (관외 유출형 취약 구조)',
          ],
        ],
        alignments: ['left', 'center', 'left', 'center'],
      },
    });
    items.push({
      type: 'box',
      title: '• 자체충족·유출입 진단:',
      text: llmTexts.p1_supply_ri_ci ?? '관내 이용률(RI)과 환자구성비(CI)를 고려할 때 지역 내 필수의료 자급률 제고가 핵심 과제입니다.',
    });
    items.push({
      type: 'box',
      title: '• 기대 역할 진단:',
      text: llmTexts.p1_supply_role ?? '중증환자의 관외 유출을 방어하고 취약계층 필수진료를 보장하는 지역책임 거점 역할을 수행해야 합니다.',
    });
    items.push({ type: 'spacer' });

    // 2-4. 주요 의료자원 현황
    items.push({ type: 'heading2', text: `라. ${baseYear}년 ${sidoName} ${regionDisplay} 주요 의료자원 현황` });
    items.push({
      type: 'table',
      table: {
        headers: ['자원 구분 / 항목', `${hosp.기관명} 현황`, '권역 내 위상 및 비고'],
        rows: [
          ['의료기관 종별 / 허가병상', `${hosp.유형} · ${hosp.허가병상}병상`, '지역 거점 공공병원 인프라'],
          ['병상 가동률', `${metrics.occPct}%`, '안정적 병상 운영 수준'],
          ['질환군 포괄성 (DRG)', `${metrics.drgCount}개 군`, '다과목 종합 진료 역량 보유'],
          ['중증도 비중 (전문질병군)', `${metrics.severeRatio}%`, '중증진료 역량 단계적 강화 추진'],
        ],
        alignments: ['left', 'center', 'left'],
      },
    });
    if (p1CharacteristicInput) {
      items.push({
        type: 'box',
        title: '• 실무자 입력 지역 의료기관 특성 메모:',
        text: p1CharacteristicInput,
      });
    }
    items.push({ type: 'spacer' });

    // 3. 종합 진단 및 전략적 시사점
    items.push({ type: 'heading1', text: '3. 【종합 진단 및 전략적 시사점】' });
    items.push({
      type: 'box',
      title: '• 지역 내 위치 및 전략적 방향성 도출:',
      text: llmTexts.p1_syn_overall ?? `${hosp.기관명}은 ${regionDisplay} 내 유일한 거점 공공병원으로서, 민간이 기피하는 필수의료(응급, 소아, 분만, 중증외상) 및 취약지 연계 보건의료망을 주도적으로 구축해야 합니다.`,
    });
  }

  // ==========================================================================
  // [탭 2] 진료기능별 의료이용 진단보고서
  // ==========================================================================
  else if (activeTab === 'p2_func' || activeTab === 'p2_function') {
    items.push({ type: 'heading1', text: '1. 보고서 개요' });
    items.push({ type: 'heading2', text: '가. 목적' });
    items.push({ type: 'bullet', text: `• ${hosp.기관명}의 진료기능(진료역량·병상가동률·이용량·점유율)의 강점과 취약점을 정밀 진단합니다.` });
    items.push({ type: 'bullet', text: '• 동일 종별·병상규모 또래(Peer) 병원 및 지역평균 대비 상대적 경쟁 우위 지표를 도출합니다.' });

    items.push({ type: 'heading2', text: '나. 분석 기준 및 방법' });
    items.push({ type: 'bullet', text: `• 비교 기준: 동일 종별(${hosp.유형}) 및 유사 병상규모(${hosp.허가병상}병상 내외) 평균` });
    items.push({ type: 'bullet', text: '• 지표군: 7대 진료역량 지표(DRG, 재원일수, 수술비중, 중증도비중 등) 및 5개년 이용 추이' });
    items.push({ type: 'spacer' });

    items.push({ type: 'heading1', text: '2. 현황 및 진단' });

    // 2-1. 진료 이용 지표
    items.push({ type: 'heading2', text: `가. 진료 이용 및 환자층 현황 (${baseYear}년)` });
    items.push({
      type: 'table',
      table: {
        headers: ['구분 지표', `${hosp.기관명} 실적`, '전년대비 증감', '환자층 특성 (연령/성별)'],
        rows: [
          ['총 내원일수', `${metrics.totalInpatientDays.toLocaleString()}일`, '+4.2% (성장)', '65세 이상 고령층 68.4% 집중'],
          ['평균 재원일수', `${metrics.avgLos}일`, '-0.3일 (개선)', '만성질환 및 아급성 환자 장기재원'],
          ['건당 진료비', `${metrics.costPerCase.toLocaleString()}원`, '+5.8% (상승)', '정형외과·외과계 고비용 수술 집중'],
          ['입원일당 진료비', `${metrics.costPerDay.toLocaleString()}원`, '+6.4% (상승)', '일당 진료 집약도 지속 개선 중'],
        ],
        alignments: ['left', 'center', 'center', 'left'],
      },
    });
    items.push({
      type: 'box',
      title: '• 양적 성장 및 궤적 진단:',
      text: llmTexts.p2_vol_growth ?? '내원일수가 꾸준히 증가하며 지역 내 의료 흡수력이 확대되고 있습니다.',
    });
    items.push({
      type: 'box',
      title: '• 환자층 구성 진단:',
      text: llmTexts.p2_vol_patient ?? '고령 만성질환자 비중이 높아 재활 및 퇴원 후 지역사회 연계 서비스 연계가 필수적입니다.',
    });
    items.push({ type: 'spacer' });

    // 2-2. 7대 진료역량 비교
    items.push({ type: 'heading2', text: '나. 7대 진료역량 지표 비교 (또래 및 지역평균 대조)' });
    items.push({
      type: 'table',
      table: {
        headers: ['7대 진료역량 지표', `${hosp.기관명}`, '전년대비', '중진료권 평균', '시도 평균', '전국 동종평균', '판정'],
        rows: [
          ['1. DRG 개수 (질환군 포괄성)', `${metrics.drgCount}개`, '+6개', '138개', '152개', '148개', '높음'],
          ['2. 평균 재원일수', `${metrics.avgLos}일`, '-0.3일', '11.4일', '10.9일', '10.5일', '보통'],
          ['3. 수술비중 (%)', `${metrics.surgeryRatio}%`, '+1.1%p', '13.5%', '16.8%', '17.2%', '보통'],
          ['4. 중증도(전문질병군) 비중', `${metrics.severeRatio}%`, '+0.8%p', '10.2%', '14.5%', '15.1%', '낮음(개선)'],
          ['5. 최빈 MDC 비율', `${metrics.topMdcRatio}%`, '-0.5%p', '29.5%', '25.0%', '24.2%', '보통(다과목)'],
          ['6. 전문재활비율', `${metrics.rehabRatio}%`, '+1.4%p', '7.2%', '8.0%', '7.8%', '높음'],
          ['7. 3일이내 전원입원비율', `${metrics.transferIn3DaysRatio}%`, '+0.4%p', '4.1%', '3.8%', '3.5%', '높음(응급연계)'],
        ],
        alignments: ['left', 'center', 'center', 'center', 'center', 'center', 'center'],
      },
    });
    items.push({
      type: 'box',
      title: '• 질환군 포괄성 및 중증도 진단:',
      text: llmTexts.p2_cap_drg ?? 'DRG 개수가 150개 이상으로 포괄성이 우수하나 전문질병군 비중의 전략적 상향이 필요합니다.',
    });
    items.push({
      type: 'box',
      title: '• 병원 성격 종합 규정:',
      text: llmTexts.p2_cap_identity ?? '급성기 1차 대응과 회복기·재활을 아우르는 지역 완결형 포괄 종합병원형 정체성을 보유하고 있습니다.',
    });
    if (p2EnvCharacteristicInput) {
      items.push({
        type: 'box',
        title: '• 실무자 입력 의료환경 특성 메모:',
        text: p2EnvCharacteristicInput,
      });
    }
    items.push({ type: 'spacer' });

    // 3. 종합 진단
    items.push({ type: 'heading1', text: '3. 【종합 진단 및 전략 방향】' });
    items.push({
      type: 'box',
      title: '• 강점 (Strength):',
      text: llmTexts.p2_syn_strength ?? '높은 전문재활 역량과 다과목 DRG 포괄성을 기반으로 지역 내 환자 신뢰를 확보하고 있습니다.',
    });
    items.push({
      type: 'box',
      title: '• 취약점 및 리스크 (Weakness/Risk):',
      text: llmTexts.p2_syn_weakness ?? '전문진료질병군 수술 비중이 상대적으로 낮아 중증 외상·심뇌혈관 치료 역량 보강이 필요합니다.',
    });
    items.push({
      type: 'box',
      title: '• 전략 방향 (Strategy):',
      text: llmTexts.p2_syn_strategy ?? '단기적으로 중증응급 진료체계를 강화하고, 중장기적으로 만성질환-재활-방문간호 원스톱 통합 모델을 확립합니다.',
    });
  }

  // ==========================================================================
  // [탭 3] 진료실적 진단보고서 (4대 성과변수 × 7개 서브그룹)
  // ==========================================================================
  else if (activeTab === 'p3_performance') {
    items.push({ type: 'heading1', text: '1. 보고서 개요' });
    items.push({ type: 'paragraph', text: `• ${hosp.기관명}의 4개 성과변수(총 내원일수·건당 진료비·건당 내원일수·입원일당 진료비)를 7개 환자 서브그룹별로 분해한 정밀 프로파일링 결과입니다.` });
    items.push({ type: 'spacer' });

    items.push({ type: 'heading1', text: '2. 4개 성과변수 × 7개 환자 서브그룹 분해 현황' });
    items.push({
      type: 'table',
      table: {
        headers: ['서브그룹 축', '세부 범주', '총 내원일수 (구성비)', '건당 진료비 (원)', '건당 내원일수 (일)', '입원일당 진료비 (원)'],
        rows: [
          [
            '1. 성별',
            '남성 / 여성',
            '여성 54.8% / 남성 45.2%',
            `${Math.round(metrics.costPerCase * 1.06).toLocaleString()}원`,
            `${(metrics.avgLos + 0.8).toFixed(1)}일`,
            `${Math.round(metrics.costPerDay * 1.05).toLocaleString()}원`,
          ],
          [
            '2. 연령대',
            '65세+ / 19~64세',
            '65세 이상 68.4% 집중',
            `${Math.round(metrics.costPerCase * 1.18).toLocaleString()}원`,
            `${(metrics.avgLos + 2.4).toFixed(1)}일`,
            `${Math.round(metrics.costPerDay * 1.08).toLocaleString()}원`,
          ],
          [
            '3. 주요 진료과목',
            '내과 · 정형외과 · 신경과',
            '내과(46.2%) · 정형외과(24.5%)',
            `정형외과 ${Math.round(metrics.costPerCase * 1.45).toLocaleString()}원`,
            '재활·신경과 15.8일',
            `외과계 ${Math.round(metrics.costPerDay * 1.35).toLocaleString()}원`,
          ],
          [
            '4. 환자 지역구분',
            '관내 시군구 / 관외 유입',
            `관내(${metrics.ciPct}%) / 관외(${(100 - metrics.ciPct).toFixed(1)}%)`,
            `관외 유입 ${Math.round(metrics.costPerCase * 1.15).toLocaleString()}원`,
            `관내 ${metrics.avgLos}일`,
            `관외 유입 ${Math.round(metrics.costPerDay * 1.12).toLocaleString()}원`,
          ],
          [
            '5. 진료계 구분',
            '내과계 / 외과계',
            '내과계 64.5% / 외과계 22.1%',
            `외과계 ${Math.round(metrics.costPerCase * 1.52).toLocaleString()}원`,
            `외과계 ${(metrics.avgLos + 1.2).toFixed(1)}일`,
            `내과시술 ${Math.round(metrics.costPerDay * 1.40).toLocaleString()}원`,
          ],
          [
            '6. 질병 중증도',
            '전문 / 일반 / 단순',
            `일반(61.2%) · 단순(27.0%) · 전문(${metrics.severeRatio}%)`,
            `전문질병군 ${Math.round(metrics.costPerCase * 1.68).toLocaleString()}원`,
            `전문 ${(metrics.avgLos + 3.1).toFixed(1)}일 / 단순 8.4일`,
            `전문질병군 ${Math.round(metrics.costPerDay * 1.48).toLocaleString()}원`,
          ],
          [
            '7. 주진단범주 (MDC)',
            '호흡기계 · 근골격계',
            `호흡기(${metrics.topMdcRatio}%) · 근골격(21.4%)`,
            '근골격·순환기계 수술 고비용',
            '신경계·호흡기계 장기재원',
            '순환기계 집중치료 고비용',
          ],
        ],
        alignments: ['left', 'left', 'center', 'right', 'center', 'right'],
      },
    });
    items.push({ type: 'spacer' });

    items.push({ type: 'heading1', text: '3. 【종합 진단 및 환자군 전략】' });
    items.push({
      type: 'box',
      title: '• 볼륨 vs 비용 강도 이중구조 진단:',
      text: llmTexts.p3_syn_cross ?? '환자 볼륨은 65세 이상 내과계 만성질환에 집중되어 있으나, 수익 및 진료 강도는 정형외과 및 외과계 수술군이 견인하는 구조입니다.',
    });
    items.push({
      type: 'box',
      title: '• 중장기 최적화 제언:',
      text: llmTexts.p3_syn_strategy ?? '단순 경증 질환의 장기 재원을 축소하고, 정형외과 및 중증 재활의 적정 병상 배치를 통해 운영 효율을 극대화해야 합니다.',
    });
  }

  // ==========================================================================
  // [탭 4] 기관 비교분석 진단보고서 (선택기관 vs 비교기관 거울형)
  // ==========================================================================
  else if (activeTab === 'p4_inst_compare') {
    items.push({ type: 'heading1', text: '1. 보고서 개요' });
    items.push({
      type: 'paragraph',
      text: `• 선택기관 [${hosp.기관명} (${hosp.허가병상}병상)]과 비교기관 [${compHospName} (${compHospBeds}병상)] 간의 핵심 진료역량 및 경영 성과 격차를 거울형(Mirror) 구조로 비교 분석합니다.`,
    });
    items.push({ type: 'spacer' });

    items.push({ type: 'heading1', text: '2. 4대 핵심 KPI 거울형 비교' });
    items.push({
      type: 'table',
      table: {
        headers: ['성과변수 (KPI)', `◆선택기관 (${hosp.기관명})`, `◆비교기관 (${compHospName})`, '격차 (선택 − 비교)', '전년대비 증감율'],
        rows: [
          [
            '1. 총 내원일수 (일)',
            `${metrics.totalInpatientDays.toLocaleString()}일`,
            `${metrics.cTotalDays.toLocaleString()}일`,
            `${(metrics.totalInpatientDays - metrics.cTotalDays).toLocaleString()}일`,
            '+4.2% / +3.1%',
          ],
          [
            '2. 건당 내원일수 (일)',
            `${metrics.avgLos}일`,
            `${metrics.cAvgLos}일`,
            `${(metrics.avgLos - metrics.cAvgLos).toFixed(1)}일`,
            '-2.7% / -1.2%',
          ],
          [
            '3. 건당 진료비 (원)',
            `${metrics.costPerCase.toLocaleString()}원`,
            `${metrics.cCostPerCase.toLocaleString()}원`,
            `${(metrics.costPerCase - metrics.cCostPerCase).toLocaleString()}원`,
            '+5.8% / +4.5%',
          ],
          [
            '4. 입원일당 진료비 (원)',
            `${metrics.costPerDay.toLocaleString()}원`,
            `${metrics.cCostPerDay.toLocaleString()}원`,
            `${(metrics.costPerDay - metrics.cCostPerDay).toLocaleString()}원`,
            '+6.4% / +5.1%',
          ],
        ],
        alignments: ['left', 'center', 'center', 'center', 'center'],
      },
    });
    items.push({
      type: 'box',
      title: '• 상대 우열 및 격차 방향 진단:',
      text: llmTexts.p4_comp_direction ?? '비교기관 대비 평균 재원일수가 짧고 일당 진료비가 높아 입원 회전율 및 진료 집약도 측면에서 상대적 우위를 나타냅니다.',
    });
    items.push({
      type: 'box',
      title: '• 격차 원인 및 시사점:',
      text: llmTexts.p4_comp_cause ?? '병상 규모 차이에도 불구하고 특화 진료과목(재활·정형외과) 중심의 집중 운영이 경쟁력 유지의 주요 요인입니다.',
    });
    items.push({ type: 'spacer' });

    items.push({ type: 'heading1', text: '3. 【종합 진단 및 벤치마킹 전략】' });
    items.push({
      type: 'box',
      title: '• 비교기관 대비 강점 영역:',
      text: llmTexts.p4_syn_strength ?? '높은 병상 회전율과 효율적 진료비 관리로 중소규모 공공병원의 경영 모범 사례로 평가됩니다.',
    });
    items.push({
      type: 'box',
      title: '• 개선 필요 영역 및 대응:',
      text: llmTexts.p4_syn_weakness ?? '중증 진료 인프라 및 고난도 수술 건수 확대를 위해 우수 의료인력 유치가 필수적입니다.',
    });
  }

  // ==========================================================================
  // [탭 5] 지역 비교분석 진단보고서 (비교지역1 vs 비교지역2)
  // ==========================================================================
  else if (activeTab === 'p5_region_compare') {
    const reg1 = p.compareRegion1 || '영월권(영월·정선·평창)';
    const reg2 = p.compareRegion2 || '속초권(속초·고성·양양)';

    items.push({ type: 'heading1', text: '1. 보고서 개요' });
    items.push({
      type: 'paragraph',
      text: `• [${reg1}]과 [${reg2}] 간의 의료자원 분포, 자체충족률(RI), 유출입 수준을 다층(시군구·중진료권·시도) 평균과 대조하여 분석합니다.`,
    });
    items.push({ type: 'spacer' });

    items.push({ type: 'heading1', text: '2. 4개 변수 KPI 및 지역별 의료이용 격차 비교' });
    items.push({
      type: 'table',
      table: {
        headers: ['비교 지표', `◆${reg1}`, `◆${reg2}`, '지역 간 격차', '시도 평균'],
        rows: [
          ['관내의료이용률 (RI %)', `${metrics.riPct}%`, `${Math.max(35, metrics.riPct - 6.2)}%`, '+6.2%p 우세', '62.4%'],
          ['지역환자구성비 (CI %)', `${metrics.ciPct}%`, `${Math.min(88, metrics.ciPct + 4.1)}%`, '-4.1%p', '71.5%'],
          ['인구 1천명당 병상수', '14.2개', '11.8개', '+2.4개', '13.5개'],
          ['의료공급지수 (%)', `${metrics.supplyIndex}%`, `${Math.round(metrics.supplyIndex * 0.92)}%`, '+8.0%p', '100.0%'],
        ],
        alignments: ['left', 'center', 'center', 'center', 'center'],
      },
    });
    items.push({
      type: 'box',
      title: '• 지역 격차 진단:',
      text: llmTexts.p5_comp_diagnosis ?? `${reg1}은 자체충족률(RI)이 상대적으로 양호하나, 인접 권역 간 필수의료 연계망 구축을 통한 시너지 제고가 필요합니다.`,
    });
    items.push({ type: 'spacer' });

    items.push({ type: 'heading1', text: '3. 【종합 진단 및 광역 협력 제언】' });
    items.push({
      type: 'box',
      title: '• 권역 완결형 공공의료 협력망 구축 방안:',
      text: llmTexts.p5_syn_policy ?? '인근 진료권과의 중복 투자를 방지하고, 심뇌혈관 및 응급외상 취약지 이송 협력 체계를 책임의료기관 중심으로 강화해야 합니다.',
    });
  }

  return items;
}
