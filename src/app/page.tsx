'use client';

// 애플 사이트(Apple.com) 스타일 필수의료 취약지 종합 진단 & 사업계획서 자동생성 플랫폼
// Left Sidebar Navigation + Right Workspace (healthy-project 스타일)

import React, { useState, useEffect, useMemo } from 'react';
import {
  시군구_원천_데이터,
  필수의료_진단_결과,
  지역_평균_통계,
  지도_시각화_모드,
  지역_구분_단위,
} from '@/lib/필수의료_타입';
import { 필수의료_진단_엔진 } from '@/lib/필수의료_엔진';
import { 전국_시군구_샘플_데이터 } from '@/lib/시군구_데이터셋';
import { export_element_as_png } from '@/lib/유틸리티';
import { 크로스탭_엑셀_처리기 } from '@/lib/크로스탭_엑셀_처리기';

// 좌측 사이드바 및 팝업 모달
import { 메인_사이드바_네비게이션, 메뉴_아이디 } from '@/components/메인_사이드바_네비게이션';
import { 파일_업로더_모달 } from '@/components/파일_업로더_모달';
import { 원문대조_신뢰뷰_모달 } from '@/components/원문대조_신뢰뷰_모달';
import { 구글_api키_설정_모달 } from '@/components/구글_api키_설정_모달';
import { 공공데이터_api키_설정_모달 } from '@/components/공공데이터_api키_설정_모달';

// 상단 전역 지역 신속 선택기
import { 상단_지역_선택기 } from '@/components/상단_지역_선택기';

// 기능별 9대 워크스페이스 컴포넌트
import { 지도_래퍼 } from '@/components/지도_래퍼';
import { 취약지_목록_테이블 } from '@/components/취약지_목록_테이블';
import { 실시간_응급_소아_모니터링 } from '@/components/실시간_응급_소아_모니터링';
import { 종합_진단_패널 } from '@/components/종합_진단_패널';
import { 진료역량_사분면_분포도 } from '@/components/진료역량_사분면_분포도';
import { 진료실적_서브그룹_대시보드 } from '@/components/진료실적_서브그룹_대시보드';
import { 공공의료_sLLM_업무비서 } from '@/components/공공의료_sLLM_업무비서';
import { 사업계획서_서술문_생성기 } from '@/components/사업계획서_서술문_생성기';
import { 경영위기_조기경보_대시보드 } from '@/components/경영위기_조기경보_대시보드';
import { 퇴원환자_돌봄자원_AI매칭 } from '@/components/퇴원환자_돌봄자원_AI매칭';
import { 일대일_비교_대시보드 } from '@/components/일대일_비교_대시보드';
import { 의료수요_추계_차트 } from '@/components/의료수요_추계_차트';
import { 의료지표_비교차트 } from '@/components/의료지표_비교차트';
import { 일반국민_공공병원_맞춤뷰 } from '@/components/일반국민_공공병원_맞춤뷰';
import { 글로벌_공공_헤더, 업무_도메인_타입 } from '@/components/글로벌_공공_헤더';
import { OurHospitalDashboard } from '@/components/우리_의료기관_대시보드';

import {
  Sparkles,
  Camera,
  Key,
  Database,
  ShieldCheck,
  ChevronRight,
  Download,
  Moon,
  Sun,
  PanelLeftOpen,
} from 'lucide-react';

export default function Home() {
  // 현재 활성화된 좌측 기능 메뉴
  const [active_menu, set_active_menu] = useState<메뉴_아이디 | 'my_hospital'>('gis_map');
  // 6대 글로벌 업무 도메인 상태
  const [current_domain, set_current_domain] = useState<업무_도메인_타입>('status_diag');

  // 사이드바 숨김 및 다크/블랙 테마 상태
  const [is_sidebar_hidden, set_is_sidebar_hidden] = useState(false);
  const [is_dark_mode, set_is_dark_mode] = useState(false);

  // 도메인 변경 시 대표 기능 메뉴 자동 활성화
  const handle_select_domain = (domain: 업무_도메인_타입) => {
    set_current_domain(domain);
    if (domain === 'status_diag') {
      if (!['gis_map', 'diagnosis_metrics', 'compare_1to1', 'demand_forecast'].includes(active_menu)) {
        set_active_menu('gis_map');
      }
    } else if (domain === 'ai_analysis') {
      set_active_menu('dual_ai_studio');
    } else if (domain === 'policy_plan') {
      set_active_menu('report_generator');
    } else if (domain === 'field_manage') {
      if (!['hospital_crisis', 'discharge_care'].includes(active_menu)) {
        set_active_menu('hospital_crisis');
      }
    } else if (domain === 'public_service') {
      set_active_menu('citizen_view');
    } else if (domain === 'my_hospital') {
      set_active_menu('my_hospital');
    }
  };

  // 메뉴 변경 시 도메인 자동 동기화
  const handle_select_menu = (menu: 메뉴_아이디 | 'my_hospital') => {
    set_active_menu(menu);
    if (['gis_map', 'diagnosis_metrics', 'compare_1to1', 'demand_forecast'].includes(menu)) {
      set_current_domain('status_diag');
    } else if (menu === 'dual_ai_studio') {
      set_current_domain('ai_analysis');
    } else if (menu === 'report_generator') {
      set_current_domain('policy_plan');
    } else if (['hospital_crisis', 'discharge_care'].includes(menu)) {
      set_current_domain('field_manage');
    } else if (menu === 'citizen_view') {
      set_current_domain('public_service');
    } else if (menu === 'my_hospital') {
      set_current_domain('my_hospital');
    }
  };

  // 모달 상태
  const [is_grounding_open, set_is_grounding_open] = useState(false);
  const [is_upload_modal_open, set_is_upload_modal_open] = useState(false);
  const [is_key_modal_open, set_is_key_modal_open] = useState(false);
  const [is_data_go_kr_modal_open, set_is_data_go_kr_modal_open] = useState(false);
  const [google_api_key, set_google_api_key] = useState('');
  const [data_go_kr_api_key, set_data_go_kr_api_key] = useState('');

  // 데이터셋 & 진단 상태
  const [raw_dataset, set_raw_dataset] = useState<시군구_원천_데이터[]>(전국_시군구_샘플_데이터);
  const [diagnosed_list, set_diagnosed_list] = useState<필수의료_진단_결과[]>([]);
  const [selected_region, set_selected_region] = useState<필수의료_진단_결과 | null>(null);

  // 지도 옵션 상태
  const [view_mode, set_view_mode] = useState<지도_시각화_모드>('종합취약도');
  const [region_unit, set_region_unit] = useState<지역_구분_단위>('시군구');

  // 초기 데이터 로드 및 API 키, 테마, 사이드바 숨김 설정 복원
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved_key = localStorage.getItem('google_gemini_api_key') || '';
      set_google_api_key(saved_key);

      const saved_data_key = localStorage.getItem('data_go_kr_api_key') || '';
      set_data_go_kr_api_key(saved_data_key);

      const saved_theme = localStorage.getItem('healthmap_theme');
      if (saved_theme === 'dark') {
        set_is_dark_mode(true);
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }

      const saved_sidebar_hidden = localStorage.getItem('healthmap_sidebar_hidden') === 'true';
      set_is_sidebar_hidden(saved_sidebar_hidden);
    }
  }, []);

  // 다크/블랙 테마 전환 핸들러
  const toggle_dark_mode = () => {
    const next = !is_dark_mode;
    set_is_dark_mode(next);
    if (typeof window !== 'undefined') {
      if (next) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('healthmap_theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('healthmap_theme', 'light');
      }
    }
  };

  // 사이드바 숨기기 / 펼치기 토글 핸들러
  const toggle_sidebar_hidden = () => {
    const next = !is_sidebar_hidden;
    set_is_sidebar_hidden(next);
    if (typeof window !== 'undefined') {
      localStorage.setItem('healthmap_sidebar_hidden', String(next));
    }
  };

  // 원천 데이터 변경 시 일괄 진단 실행
  useEffect(() => {
    const diagnosed = 필수의료_진단_엔진.batch_diagnose(raw_dataset);
    set_diagnosed_list(diagnosed);

    const default_target =
      diagnosed.find((item) => item.시군구명 === '영월군') ||
      diagnosed.find((item) => item.종합_취약도_등급 === '심각') ||
      diagnosed[0] ||
      null;

    set_selected_region(default_target);
  }, [raw_dataset]);

  // 전국 및 시도 평균 통계
  const national_stat: 지역_평균_통계 = useMemo(() => {
    return 필수의료_진단_엔진.calculate_region_statistics(diagnosed_list);
  }, [diagnosed_list]);

  const sido_stat: 지역_평균_통계 = useMemo(() => {
    if (!selected_region) return national_stat;
    return 필수의료_진단_엔진.calculate_region_statistics(diagnosed_list, selected_region.시도명);
  }, [diagnosed_list, selected_region, national_stat]);

  const vulnerable_region_count = useMemo(() => {
    return diagnosed_list.filter((item) => item.종합_취약도_등급 !== '정상').length;
  }, [diagnosed_list]);

  const handle_load_sample_data = () => {
    set_raw_dataset(전국_시군구_샘플_데이터);
  };

  const handle_data_loaded = (new_data: 시군구_원천_데이터[]) => {
    set_raw_dataset(new_data);
  };

  const handle_export_report_png = async () => {
    const filename = selected_region
      ? `${selected_region.시도명}_${selected_region.시군구명}_${active_menu}_리포트`
      : `전국_필수의료_${active_menu}_리포트`;
    await export_element_as_png('main-workspace-content', filename);
  };

  const handle_download_nmc_excel = () => {
    if (!selected_region) return;
    크로스탭_엑셀_처리기.download_nmc_standard_excel_package(selected_region);
  };

  // 메뉴별 타이틀 및 설명 맵
  const MENU_TITLES: Record<메뉴_아이디 | 'my_hospital', { title: string; subtitle: string }> = {
    gis_map: {
      title: '전국 70개 중진료권 GIS 헬스맵 & 226개 시군구 취약지 DB',
      subtitle: '보건복지부 법정 고시 기준 알고리즘에 따른 응급·분만·소아 취약지 공간 시각화',
    },
    diagnosis_metrics: {
      title: '취약지 종합 지표 진단 & 진료역량 사분면 포지셔닝',
      subtitle: '응급 미도달율, 관내이용률(RI), 분만율 및 7대 필수의료 세부 진료역량 분석',
    },
    dual_ai_studio: {
      title: '공공보건의료 듀얼 AI 스튜디오 (Google Gemini × 노트북 sLLM)',
      subtitle: '외부 클라우드 대형 LLM과 원내 폐쇄망 온디바이스 sLLM 1:1 비교 & 하이브리드 RAG 지침 질의',
    },
    report_generator: {
      title: '보건복지부 공모 표준 개조식 사업계획서 자동생성기',
      subtitle: '지자체 DW 진단 지표와 정책 지침을 결합한 행정 보고서 문안 원클릭 완성',
    },
    hospital_crisis: {
      title: '35개 지방의료원 경영위기 선제 감지 (Early Warning Engine)',
      subtitle: '지방의료원 경영공시, 병상가동률, CP적용률, 의사인력 충원율 기반 조기경보',
    },
    discharge_care: {
      title: '퇴원환자-지역사회 돌봄자원 AI 매칭 & 원클릭 연계',
      subtitle: '의료원 공공의료협력팀 전용. 환자 ADL 및 상병 맞춤 보건소·장기요양 자원 매칭',
    },
    compare_1to1: {
      title: '지자체 1:1 심층 비교 대시보드',
      subtitle: '동일 권역 또는 인근 지자체 간 필수의료 인프라 및 의료이용 격차 정밀 대조',
    },
    demand_forecast: {
      title: '2030 필수의료 수요 추계 및 시도 평균 비교',
      subtitle: '인구구조 고령화 추세를 반영한 중장기 필수의료 수요 예측 및 벤치마크',
    },
    citizen_view: {
      title: '일반국민 안심 공공병원 안내 & 모바일 퇴원돌봄 알리미',
      subtitle: '가장 가까운 응급실·소아과 보유 공공병원 확인 및 카카오 퇴원 알림톡 연계',
    },
    my_hospital: {
      title: '의료기관 담당자 전용 대시보드 (My Hospital)',
      subtitle: '소속 기관의 필수의료 4대 운영 지표, AI 병목 진단, 경영개선 과제 및 AI 질의응답',
    },
  };

  const current_title_info = MENU_TITLES[active_menu];

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#0c0d10] flex flex-col text-slate-900 dark:text-slate-100 selection:bg-blue-600/20 transition-colors duration-200 font-sans">
      {/* 1. 최상단 글로벌 공공 헤더 (1줄에 모든 정보 통합) */}
      <글로벌_공공_헤더
        active_domain={current_domain}
        on_select_domain={handle_select_domain}
        on_open_key_modal={() => set_is_key_modal_open(true)}
        on_open_data_go_kr_modal={() => set_is_data_go_kr_modal_open(true)}
        on_open_upload_modal={() => set_is_upload_modal_open(true)}
        on_open_grounding_modal={() => set_is_grounding_open(true)}
        on_export_capture={handle_export_report_png}
        is_dark_mode={is_dark_mode}
        on_toggle_dark_mode={toggle_dark_mode}
        google_api_key_registered={!!google_api_key}
        data_go_kr_key_registered={!!data_go_kr_api_key}
        vulnerable_region_count={vulnerable_region_count}
      />

      {/* 2. 본체 영역 (사이드바 + 메인 워크스페이스) */}
      <div className="flex-1 flex flex-col lg:flex-row min-w-0 min-h-0 overflow-hidden">
        {/* 좌측 기능 사이드바 네비게이션 */}
        <메인_사이드바_네비게이션
          active_menu={active_menu as 메뉴_아이디}
          on_select_menu={handle_select_menu}
          on_open_upload_modal={() => set_is_upload_modal_open(true)}
          on_load_sample_data={handle_load_sample_data}
          on_download_nmc_excel={handle_download_nmc_excel}
          on_open_grounding_modal={() => set_is_grounding_open(true)}
          on_open_key_modal={() => set_is_key_modal_open(true)}
          google_api_key_registered={!!google_api_key}
          data_go_kr_key_registered={!!data_go_kr_api_key}
          on_open_data_go_kr_modal={() => set_is_data_go_kr_modal_open(true)}
          selected_region_name={selected_region ? `${selected_region.시도명} ${selected_region.시군구명}` : '영월군'}
          selected_region_grade={selected_region?.종합_취약도_등급 ?? '심각'}
          is_hidden={is_sidebar_hidden}
          on_toggle_hide={toggle_sidebar_hidden}
        />

        {/* 우측 메인 워크스페이스 */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto">
          {/* 서브 헤더 바 (컴팩트 1줄 타이틀 & 지역 선택기) */}
          <header className="sticky top-0 z-20 bg-white/95 dark:bg-[#15161b]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-2 space-y-2 shadow-xs">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center space-x-2.5 min-w-0">
                {is_sidebar_hidden && (
                  <button
                    onClick={toggle_sidebar_hidden}
                    className="hidden lg:inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-800 dark:text-slate-200 text-xs font-bold shadow-xs transition shrink-0"
                    title="좌측 기능 메뉴 펼치기"
                  >
                    <PanelLeftOpen className="w-3.5 h-3.5 text-blue-600" />
                    <span>메뉴 열기</span>
                  </button>
                )}

                <div className="flex items-center gap-2 min-w-0 flex-wrap">
                  <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/70 text-[#0071e3] dark:text-[#2997ff] text-[11px] font-bold shrink-0 border border-blue-200/60 dark:border-blue-900">
                    {current_domain === 'status_diag' && '1. 현황진단'}
                    {current_domain === 'ai_analysis' && '2. AI분석'}
                    {current_domain === 'policy_plan' && '3. 정책기획'}
                    {current_domain === 'field_manage' && '4. 현장관리'}
                    {current_domain === 'public_service' && '5. 국민서비스'}
                    {current_domain === 'my_hospital' && '6. MY의료기관'}
                  </span>
                  <h2 className="text-sm sm:text-base font-extrabold tracking-tight text-slate-900 dark:text-slate-100 truncate">
                    {current_title_info.title}
                  </h2>
                </div>
              </div>

              {/* 빠른 바로가기 CTA */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => handle_select_domain('ai_analysis')}
                  className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-lg text-xs font-semibold transition flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>듀얼 AI 분석</span>
                </button>
                <button
                  onClick={() => handle_select_domain('policy_plan')}
                  className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition flex items-center gap-1"
                >
                  <span>사업계획서 작성</span>
                </button>
              </div>
            </div>

            {/* 상단 글로벌 지역 신속 선택기 */}
            <상단_지역_선택기
              diagnosed_list={diagnosed_list}
              selected_region={selected_region}
              on_select_region={(region) => set_selected_region(region)}
            />
          </header>

          {/* 본문 작업 영역 (선택된 기능 메뉴만 단독 렌더링) */}
          <div id="main-workspace-content" className="p-4 sm:p-6 lg:p-8 space-y-6">
            {/* ============================================================== */}
            {/* 1. GIS 헬스맵 & 시군구 취약지 데이터베이스 */}
            {/* ============================================================== */}
            {active_menu === 'gis_map' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
                  <div className="xl:col-span-7 h-[640px]">
                    <지도_래퍼
                      diagnosed_list={diagnosed_list}
                      selected_region={selected_region}
                      on_select_region={(region) => set_selected_region(region)}
                      view_mode={view_mode}
                      on_change_view_mode={set_view_mode}
                      region_unit={region_unit}
                      on_change_region_unit={set_region_unit}
                    />
                  </div>

                  <div className="xl:col-span-5 flex flex-col gap-4">
                    <div className="h-[480px]">
                      <취약지_목록_테이블
                        diagnosed_list={diagnosed_list}
                        selected_region={selected_region}
                        on_select_region={(region) => set_selected_region(region)}
                      />
                    </div>

                    {/* 선택 지역 대상 의사결정 체인 퀵 액션 카드 */}
                    {selected_region && (
                      <div className="p-4 bg-white dark:bg-[#15161b] rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            선택 지역: {selected_region.시도명} {selected_region.시군구명}
                          </span>
                          <span className={`px-2 py-0.5 rounded font-bold ${
                            selected_region.종합_취약도_등급 === '심각'
                              ? 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                          }`}>
                            취약도: {selected_region.종합_취약도_등급}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          응급 미도달율 {selected_region.응급_60분_미도달_인구비율 ?? 35}%, 관내이용률 {selected_region.관내_응급_의료이용률 ?? 42}%
                        </p>
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <button
                            onClick={() => handle_select_domain('ai_analysis')}
                            className="p-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-lg text-xs font-semibold text-center transition"
                          >
                            AI 원인 심층분석 →
                          </button>
                          <button
                            onClick={() => handle_select_domain('policy_plan')}
                            className="p-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-lg text-xs font-semibold text-center transition"
                          >
                            사업계획서 작성 →
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 실시간 응급 소아 모니터링 바 */}
                {selected_region && (
                  <실시간_응급_소아_모니터링 selected_region={selected_region} />
                )}
              </div>
            )}

            {/* ============================================================== */}
            {/* 2. 취약지 종합 지표 진단 & 사분면 분석 */}
            {/* ============================================================== */}
            {active_menu === 'diagnosis_metrics' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <종합_진단_패널
                  selected_region={selected_region}
                />

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
                  <진료역량_사분면_분포도
                    selected_region={selected_region}
                  />
                  <진료실적_서브그룹_대시보드 selected_region={selected_region} />
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* 3. 듀얼 AI 스튜디오 (Google Gemini vs 로컬 sLLM) */}
            {/* ============================================================== */}
            {active_menu === 'dual_ai_studio' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <공공의료_sLLM_업무비서
                  selected_region={selected_region}
                  on_open_grounding={() => set_is_grounding_open(true)}
                />
              </div>
            )}

            {/* ============================================================== */}
            {/* 4. 사업계획서 자동생성기 */}
            {/* ============================================================== */}
            {active_menu === 'report_generator' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <사업계획서_서술문_생성기
                  selected_region={selected_region}
                  sido_stat={sido_stat}
                  national_stat={national_stat}
                />
              </div>
            )}

            {/* ============================================================== */}
            {/* 5. 35개 지방의료원 경영위기 조기경보 */}
            {/* ============================================================== */}
            {active_menu === 'hospital_crisis' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <경영위기_조기경보_대시보드
                  on_open_grounding={() => set_is_grounding_open(true)}
                />
              </div>
            )}

            {/* ============================================================== */}
            {/* 6. 퇴원환자 돌봄자원 AI 매칭 */}
            {/* ============================================================== */}
            {active_menu === 'discharge_care' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <퇴원환자_돌봄자원_AI매칭 />
              </div>
            )}

            {/* ============================================================== */}
            {/* 7. 지자체 1:1 비교 대시보드 */}
            {/* ============================================================== */}
            {active_menu === 'compare_1to1' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <일대일_비교_대시보드
                  selected_region={selected_region}
                  diagnosed_list={diagnosed_list}
                />
              </div>
            )}

            {/* ============================================================== */}
            {/* 8. 2030 의료수요 추계 & 지표 비교 */}
            {/* ============================================================== */}
            {active_menu === 'demand_forecast' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
                  <의료수요_추계_차트 selected_region={selected_region} />
                  <의료지표_비교차트
                    selected_region={selected_region}
                    sido_stat={sido_stat}
                    national_stat={national_stat}
                  />
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* 9. 일반국민 공공병원 안심뷰 */}
            {/* ============================================================== */}
            {active_menu === 'citizen_view' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <일반국민_공공병원_맞춤뷰
                  selected_region={selected_region}
                />
              </div>
            )}

            {/* ============================================================== */}
            {/* 10. [신규] 의료기관 담당자 My Hospital 대시보드 */}
            {/* ============================================================== */}
            {active_menu === 'my_hospital' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <OurHospitalDashboard
                  onNavigateToGis={(regionName) => {
                    handle_select_menu('gis_map');
                  }}
                  onNavigateToDualAi={(prompt) => {
                    handle_select_menu('dual_ai_studio');
                  }}
                  onNavigateToPolicy={(topic) => {
                    handle_select_menu('report_generator');
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>


      {/* ============================================================== */}
      {/* 공통 팝업 모달 레이어 */}
      {/* ============================================================== */}

      {/* 엑셀/CSV 데이터 업로더 모달 */}
      <파일_업로더_모달
        is_open={is_upload_modal_open}
        on_close={() => set_is_upload_modal_open(false)}
        on_data_loaded={handle_data_loaded}
      />

      {/* 환각 제로 원문 대조 신뢰 뷰 모달 */}
      <원문대조_신뢰뷰_모달
        is_open={is_grounding_open}
        on_close={() => set_is_grounding_open(false)}
      />

      {/* Google Gemini API 키 설정 모달 */}
      <구글_api키_설정_모달
        is_open={is_key_modal_open}
        on_close={() => set_is_key_modal_open(false)}
        on_key_saved={(new_key) => set_google_api_key(new_key)}
      />

      {/* data.go.kr 공공데이터포털 API 인증키 설정 모달 */}
      <공공데이터_api키_설정_모달
        is_open={is_data_go_kr_modal_open}
        on_close={() => set_is_data_go_kr_modal_open(false)}
        on_key_saved={(new_key) => set_data_go_kr_api_key(new_key)}
      />
    </main>
  );
}
