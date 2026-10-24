'use client';

// Essential Care Map - 공공의료 의사결정 지원 플랫폼
// 5대 Global Workspace 통합 라우팅 및 상태 관리:
// 1. [지역진단] 지역진단_통합_대시보드 (35:65 지도, 7대 Layer, 6단계 취약분석)
// 2. [정책기획] 정책기획_통합_워크스페이스 (AI 정책대안 3옵션, 8대 항목 사업계획서, 1:1비교, 2030수요)
// 3. [의료기관] 의료기관_통합_워크스페이스 (214개 공공병원, 데이터센터, 경영위기, 71개 CP, 신포괄, CP변이 ROI, 퇴원돌봄)
// 4. [AI 분석] AI분석_통합_워크스페이스 (Cloud AI vs Local sLLM 듀얼 AI 스튜디오)
// 5. [국민안심] 국민안심_서비스_뷰 (Mobile-First 5대 안심의료, 3단계 바텀시트)

import React, { useState, useEffect, useMemo, useRef } from 'react';
import dynamic from 'next/dynamic';
import {
  시군구_원천_데이터,
  필수의료_진단_결과,
  지역_평균_통계,
} from '@/lib/필수의료_타입';
import { 필수의료_진단_엔진 } from '@/lib/필수의료_엔진';
import { 전국_시군구_진단_데이터 } from '@/lib/시군구_데이터셋';
import { export_element_as_png } from '@/lib/유틸리티';

// 5대 Global Workspace 컴포넌트
// 홈·헤더만 초기 번들에 포함하고, 대용량 데이터셋을 쓰는 워크스페이스는 진입 시점에 지연 로딩
import { 글로벌_공공_헤더, 워크스페이스_타입, type 헤더_화면_모드 } from '@/components/글로벌_공공_헤더';
import { PersonaGroupButtons, PersonaSwitcherBar } from '@/components/PersonaSwitcherBar';
import { 페르소나_찾기, 서브탭_찾기, 메뉴_소속_서브탭, type 페르소나_키, type 페르소나_서브탭 } from '@/lib/페르소나_메뉴_구조';
import { 공공의료_결정지도_홈 } from '@/components/공공의료_결정지도_홈';
import { 전체_여정_프로그레스_바, 여정_단계_키, 여정_단계_정의 } from '@/components/전체_여정_프로그레스_바';
import { 대상자별_좌측_사이드바, 신규_메뉴_구조_데이터 } from '@/components/대상자별_좌측_사이드바';
import type { 의료기관_서브탭_타입 } from '@/components/의료기관_통합_워크스페이스';

const 워크스페이스_로딩 = () => (
  <div className="flex-1 flex items-center justify-center py-24 text-sm text-[#86868b]">
    <div className="w-5 h-5 mr-2.5 rounded-full border-2 border-[#0071e3] border-t-transparent animate-spin" />
    데이터를 불러오는 중입니다...
  </div>
);

const 지역진단_통합_대시보드 = dynamic(
  () => import('@/components/지역진단_통합_대시보드').then((m) => m.지역진단_통합_대시보드),
  { loading: 워크스페이스_로딩 }
);
const 정책기획_통합_워크스페이스 = dynamic(
  () => import('@/components/정책기획_통합_워크스페이스').then((m) => m.정책기획_통합_워크스페이스),
  { loading: 워크스페이스_로딩 }
);
const 의료기관_통합_워크스페이스 = dynamic(
  () => import('@/components/의료기관_통합_워크스페이스').then((m) => m.의료기관_통합_워크스페이스),
  { loading: 워크스페이스_로딩 }
);
const AI_병원진단_통합_워크스페이스 = dynamic(
  () => import('@/components/AI_병원진단_통합_워크스페이스').then((m) => m.AI_병원진단_통합_워크스페이스),
  { loading: 워크스페이스_로딩 }
);
const AI분석_통합_워크스페이스 = dynamic(
  () => import('@/components/AI분석_통합_워크스페이스').then((m) => m.AI분석_통합_워크스페이스),
  { loading: 워크스페이스_로딩 }
);
const 대국민_알리미_비교 = dynamic(
  () => import('@/components/대국민_알리미_비교').then((m) => m.대국민_알리미_비교),
  { loading: 워크스페이스_로딩 }
);
const 대국민_필수의료_모니터링 = dynamic(
  () => import('@/components/대국민_필수의료_모니터링').then((m) => m.대국민_필수의료_모니터링),
  { loading: 워크스페이스_로딩 }
);
const 대국민_공개정보_AI_안내 = dynamic(
  () => import('@/components/대국민_공개정보_AI_안내').then((m) => m.대국민_공개정보_AI_안내),
  { loading: 워크스페이스_로딩 }
);
const 공공보건의료계획_작성도우미 = dynamic(
  () => import('@/components/공공보건의료계획_작성도우미').then((m) => m.공공보건의료계획_작성도우미),
  { loading: 워크스페이스_로딩 }
);
const 퇴원환자_연계_업무화면 = dynamic(
  () => import('@/components/퇴원환자_연계_업무화면').then((m) => m.퇴원환자_연계_업무화면),
  { loading: 워크스페이스_로딩 }
);
const 경영벤치마킹_사전검증_화면 = dynamic(
  () => import('@/components/경영벤치마킹_사전검증_화면').then((m) => m.경영벤치마킹_사전검증_화면),
  { loading: 워크스페이스_로딩 }
);
const 고위험_모자_전원매칭_화면 = dynamic(
  () => import('@/components/고위험_모자_전원매칭_화면').then((m) => m.고위험_모자_전원매칭_화면),
  { loading: 워크스페이스_로딩 }
);
const 교육_인력매칭_스마트병원_화면 = dynamic(
  () => import('@/components/교육_인력매칭_스마트병원_화면').then((m) => m.교육_인력매칭_스마트병원_화면),
  { loading: 워크스페이스_로딩 }
);
const NMC_평가_모니터링_화면 = dynamic(() => import('@/components/NMC_평가_모니터링_화면').then((m) => m.NMC_평가_모니터링_화면), {
  loading: 워크스페이스_로딩,
});
const NMC_정책통계_DW_화면 = dynamic(() => import('@/components/NMC_정책통계_DW_화면').then((m) => m.NMC_정책통계_DW_화면), {
  loading: 워크스페이스_로딩,
});
const NMC_투자배분_모자관제_화면 = dynamic(() => import('@/components/NMC_투자배분_모자관제_화면').then((m) => m.NMC_투자배분_모자관제_화면), {
  loading: 워크스페이스_로딩,
});
const NMC_에이전트_LLMOps_화면 = dynamic(() => import('@/components/NMC_에이전트_LLMOps_화면').then((m) => m.NMC_에이전트_LLMOps_화면), {
  loading: 워크스페이스_로딩,
});
const 오분류_교정_내역_뷰 = dynamic(() => import('@/components/페르소나_구조_뷰').then((m) => m.오분류_교정_내역_뷰), {
  loading: 워크스페이스_로딩,
});
const 메뉴_구조도_뷰 = dynamic(() => import('@/components/페르소나_구조_뷰').then((m) => m.메뉴_구조도_뷰), {
  loading: 워크스페이스_로딩,
});
const 페르소나_준비중_화면 = dynamic(() => import('@/components/페르소나_구조_뷰').then((m) => m.페르소나_준비중_화면), {
  loading: 워크스페이스_로딩,
});
const 국민안심_서비스_뷰 = dynamic(
  () => import('@/components/국민안심_서비스_뷰').then((m) => m.국민안심_서비스_뷰),
  { loading: 워크스페이스_로딩 }
);

// 공통 모달 레이어 (파일 업로더는 xlsx·papaparse를 사용하므로 지연 로딩)
const 파일_업로더_모달 = dynamic(
  () => import('@/components/파일_업로더_모달').then((m) => m.파일_업로더_모달)
);
import { 원문대조_신뢰뷰_모달 } from '@/components/원문대조_신뢰뷰_모달';
import { 구글_api키_설정_모달 } from '@/components/구글_api키_설정_모달';
import { 공공데이터_api키_설정_모달 } from '@/components/공공데이터_api키_설정_모달';
import { 카카오_api키_설정_모달 } from '@/components/카카오_api키_설정_모달';
import { 카카오_지도_API키_불러오기 } from '@/lib/API키_저장소';
import { 데이터_사업가이드_안내_모달 } from '@/components/데이터_사업가이드_안내_모달';
import { 관리자_통합_모달 } from '@/components/관리자_통합_모달';
import { 로컬_LLM_제미나이_비교_모달 } from '@/components/로컬_LLM_제미나이_비교_모달';
import { 보안_로그인_모달 } from '@/components/보안_로그인_모달';
import { 담당자별_검토_가이드_모달 } from '@/components/담당자별_검토_가이드_모달';
import { IspProvider, PersonaInfo } from '@/context/ISP_컨텍스트';
import { ISP_과제_드로어 } from '@/components/ISP_과제_드로어';
import { Lock, Unlock, ShieldAlert } from 'lucide-react';

import { API키_불러오기 } from '@/lib/API키_저장소';
import { 사용자_역할_타입 } from '@/lib/사용자_역할_타입';

export default function Home() {
  const main_content_ref = useRef<HTMLDivElement>(null);

  // 5대 Global Workspace 상태 (기본: 'home')
  const [current_workspace, set_current_workspace] = useState<워크스페이스_타입>('home');

  // 🌟 3대 사용자 역할 상태 ('all' | 'citizen' | 'hospital' | 'nmc')
  const [current_user_role, set_current_user_role] = useState<사용자_역할_타입>('all');

  // 🌟 좌측 대상자별 메뉴 접힘 여부 (데스크톱 기본 펼침: false)
  const [is_sidebar_collapsed, set_is_sidebar_collapsed] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      set_is_sidebar_collapsed(true);
    }
  }, []);

  const handle_navigate_from_sidebar = (ws: 워크스페이스_타입, subtab?: string) => {
    set_화면_모드('프로토타입');
    if (ws === 'medical_institution' && subtab) {
      set_medical_subtab(subtab as any);
    }
    if (ws === 'policy_planning' && subtab) {
      set_policy_subtab(subtab as any);
    }
    if (ws === 'hospital_ai_diagnosis' && subtab) {
      set_ai_hospital_subtab(subtab as any);
    }
    set_current_workspace(ws);
  };

  const handle_select_user_role = (role: 사용자_역할_타입) => {
    set_current_user_role(role);
    if (role === 'citizen') {
      set_current_workspace('national_safety');
    } else if (role === 'hospital') {
      set_current_workspace('hospital_ai_diagnosis');
    } else if (role === 'nmc') {
      set_current_workspace('regional_diagnosis');
    } else if (role === 'all') {
      set_current_workspace('home');
    }
  };

  // 헤더 우측 화면 전환 (프로토타입 체험 / 오분류 교정 내역 / 메뉴 구조도)
  const [화면_모드, set_화면_모드] = useState<헤더_화면_모드>('프로토타입');
  // 사용자 그룹 전용 화면에서 보여줄 서브탭 id (workspace === 'persona_page'일 때)
  const [persona_page_id, set_persona_page_id] = useState<string | null>(null);

  // 정책기획 서브탭 및 의료기관 서브탭 딥링크 상태
  const [policy_subtab, set_policy_subtab] = useState<'policy_ai' | 'report' | 'evaluation' | 'compare' | 'forecast'>('policy_ai');
  const [medical_subtab, set_medical_subtab] = useState<의료기관_서브탭_타입>('hospitals');
  const [ai_hospital_id, set_ai_hospital_id] = useState<string>('HOSP_001'); // 영월의료원 기본
  const [ai_hospital_subtab, set_ai_hospital_subtab] = useState<'diagnosis' | 'profile_report' | 'benchmark' | 'forecast' | 'simulation' | 'execution' | 'kpi' | 'national_view'>('diagnosis');
  // 5종 진단보고서 세부 탭 라우팅 ('p1_resource' | 'p2_function' | 'p3_performance' | 'p4_inst_compare' | 'p5_region_compare')
  const [profile_report_tab, set_profile_report_tab] = useState<
    'p1_resource' | 'p2_function' | 'p3_performance' | 'p4_inst_compare' | 'p5_region_compare'
  >('p1_resource');

  const handle_open_profile_report = (
    tab: 'p1_resource' | 'p2_function' | 'p3_performance' | 'p4_inst_compare' | 'p5_region_compare' = 'p1_resource',
    hospId?: string
  ) => {
    if (hospId) set_ai_hospital_id(hospId);
    set_profile_report_tab(tab);
    set_ai_hospital_subtab('profile_report');
    set_current_workspace('hospital_ai_diagnosis');
  };

  // 전역 데이터셋 및 선택된 지역
  const [raw_dataset, set_raw_dataset] = useState<시군구_원천_데이터[]>(전국_시군구_진단_데이터);
  const [diagnosed_list, set_diagnosed_list] = useState<필수의료_진단_결과[]>([]);
  const [selected_region, set_selected_region] = useState<필수의료_진단_결과 | null>(null);

  // 모달 상태
  const [is_grounding_open, set_is_grounding_open] = useState(false);
  const [is_guide_modal_open, set_is_guide_modal_open] = useState(false);
  const [is_upload_modal_open, set_is_upload_modal_open] = useState(false);
  const [is_key_modal_open, set_is_key_modal_open] = useState(false);
  const [is_data_go_kr_modal_open, set_is_data_go_kr_modal_open] = useState(false);
  const [is_admin_dashboard_open, set_is_admin_dashboard_open] = useState(false);
  const [is_llm_compare_modal_open, set_is_llm_compare_modal_open] = useState(false);
  const [is_review_guide_open, set_is_review_guide_open] = useState(false);
  const [google_api_key, set_google_api_key] = useState('');
  const [data_go_kr_api_key, set_data_go_kr_api_key] = useState('');
  const [kakao_map_api_key, set_kakao_map_api_key] = useState('');
  const [is_kakao_modal_open, set_is_kakao_modal_open] = useState(false);

  // 시스템 기본 탑재 API 상태 (고객 별도 설정 없이 바로 확인 가능)
  const [system_status, set_system_status] = useState<{
    gemini_connected: boolean;
    data_go_kr_connected: boolean;
  }>({
    gemini_connected: true,
    data_go_kr_connected: true,
  });

  // 테마 상태
  const [is_dark_mode, set_is_dark_mode] = useState(false);

  // 로그인 상태: 모든 화면·API는 로그인 후 사용 (미로그인 요청은 서버 proxy가 /login 으로 보냄)
  const [is_authenticated, set_is_authenticated] = useState<boolean>(false);
  const [is_auth_modal_open, set_is_auth_modal_open] = useState<boolean>(false);
  const [is_auth_initialized, set_is_auth_initialized] = useState<boolean>(false);

  // 초기 설정 복원 (API 키 및 테마 + 시스템 상태 자동 동기화 + 보안 인증 상태 확인)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // 로그인 여부 확인 (서버가 HttpOnly 쿠키를 검증)
      fetch('/api/auth/status')
        .then((r) => r.json())
        .then((d) => set_is_authenticated(Boolean(d.authenticated)))
        .catch(() => set_is_authenticated(false))
        .finally(() => set_is_auth_initialized(true));

      const stored_gemini = API키_불러오기('google_gemini_api_key');
      const stored_data_go_kr = API키_불러오기('data_go_kr_api_key');
      set_google_api_key(stored_gemini);
      set_kakao_map_api_key(카카오_지도_API키_불러오기());
      set_data_go_kr_api_key(stored_data_go_kr);

      // 서버의 기본 탑재 API 키 상태 비동기 동기화
      fetch('/api/system/status')
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data) {
            set_system_status({
              gemini_connected: data.gemini?.connected ?? true,
              data_go_kr_connected: data.data_go_kr?.connected ?? true,
            });
          }
        })
        .catch(() => {});

      const saved_theme = localStorage.getItem('healthmap_theme');
      if (saved_theme === 'dark') {
        set_is_dark_mode(true);
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, []);

  // 다크모드 토글
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

  // 원천 데이터 일괄 진단
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

  // 전국 및 시도 통계
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

  // 지역 검색 핸들러 (홈 및 헤더 공통)
  const handle_search_region = (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) {
      set_current_workspace('regional_diagnosis');
      return;
    }

    // 250개 시군구 매칭
    const matched = diagnosed_list.find(
      (item) => item.시군구명.includes(trimmed) || item.시도명.includes(trimmed)
    );

    if (matched) {
      set_selected_region(matched);
    }
    set_current_workspace('regional_diagnosis');
  };

  // 홈 화면에서 4대 Quick Action 카드 및 바로가기 클릭 시 네비게이션
  const handle_navigate_from_home = (
    workspace: 워크스페이스_타입,
    sub_feature?: string
  ) => {
    if (workspace === 'policy_planning' && sub_feature) {
      if (['compare', 'forecast', 'policy_ai', 'report', 'evaluation'].includes(sub_feature)) {
        set_policy_subtab(sub_feature as any);
      }
    } else if (workspace === 'medical_institution' && sub_feature) {
      set_medical_subtab(sub_feature as any);
    } else if (workspace === 'hospital_ai_diagnosis' && sub_feature) {
      set_ai_hospital_subtab(sub_feature as any);
    }
    set_current_workspace(workspace);
  };

  // 지역진단에서 정책 연계 액션 클릭 시 정책기획 탭 전환
  const handle_navigate_policy = (feature: 'compare' | 'forecast' | 'policy_ai' | 'report' | 'evaluation') => {
    set_policy_subtab(feature);
    set_current_workspace('policy_planning');
  };

  // 안내 모달에서 메뉴 네비게이션
  const handle_guide_navigate = (menu_id: string) => {
    set_is_guide_modal_open(false);
    const resolved_medical_tab = menu_id === 'hospital_crisis' ? 'crisis' : menu_id;
    if (['cp_library', 'policy_incentive', 'cp_variance', 'crisis', 'discharge_care', 'aa_disclosure', 'hospitals', 'datacenter', 'profile_report'].includes(resolved_medical_tab)) {
      set_medical_subtab(resolved_medical_tab as 의료기관_서브탭_타입);
      set_current_workspace('medical_institution');
    } else if (['report_generator', 'compare_1to1', 'demand_forecast', 'evaluation'].includes(menu_id)) {
      if (menu_id === 'report_generator') set_policy_subtab('report');
      else if (menu_id === 'evaluation') set_policy_subtab('evaluation');
      else if (menu_id === 'compare_1to1') set_policy_subtab('compare');
      else if (menu_id === 'demand_forecast') set_policy_subtab('forecast');
      set_current_workspace('policy_planning');
    } else if (['gis_map', 'diagnosis_metrics', 'patient_flow'].includes(menu_id)) {
      set_current_workspace('regional_diagnosis');
    } else if (menu_id === 'dual_ai_studio') {
      set_current_workspace('ai_analysis');
    } else if (menu_id === 'citizen_view') {
      set_current_workspace('national_safety');
    }
  };

  // 고객 검토 가이드 모달에서 메뉴 이동 시 네비게이션
  const handle_review_guide_navigate = (
    workspace: 워크스페이스_타입,
    subFeature?: string
  ) => {
    if (workspace === 'medical_institution' && subFeature) {
      const targetSubtab = subFeature === 'hospital_crisis' ? 'crisis' : subFeature;
      set_medical_subtab(targetSubtab as any);
    } else if (workspace === 'policy_planning' && subFeature) {
      if (['compare', 'forecast', 'policy_ai', 'report', 'evaluation'].includes(subFeature)) {
        set_policy_subtab(subFeature as any);
      }
    } else if (workspace === 'hospital_ai_diagnosis' && subFeature) {
      set_ai_hospital_subtab(subFeature as any);
    }
    set_current_workspace(workspace);
  };

  // 엑셀 패키지 다운로드 및 캡처
  const handle_download_nmc_excel = async () => {
    if (!selected_region) return;
    // xlsx 라이브러리는 다운로드 시점에만 로드
    const { 크로스탭_엑셀_처리기 } = await import('@/lib/크로스탭_엑셀_처리기');
    크로스탭_엑셀_처리기.download_nmc_standard_excel_package(selected_region);
  };

  const handle_export_report_png = async () => {
    const filename = selected_region
      ? `${selected_region.시도명}_${selected_region.시군구명}_공공의료리포트`
      : '전국_필수의료_종합진단리포트';
    await export_element_as_png('main-workspace-content', filename);
  };

  // 페르소나 변경 시 추천 워크스페이스 및 서브탭 딥링크 핸들러
  const handle_persona_change = (personaInfo: PersonaInfo) => {
    set_current_workspace(personaInfo.focusWorkspace);
    if (personaInfo.focusWorkspace === 'policy_planning' && personaInfo.focusSubtab) {
      set_policy_subtab(personaInfo.focusSubtab as any);
    } else if (personaInfo.focusWorkspace === 'medical_institution' && personaInfo.focusSubtab) {
      set_medical_subtab(personaInfo.focusSubtab as any);
    }
  };

  // 전체 AI 정책 의사결정 Journey 현재 단계 계산 (요구사항 1번)
  const current_journey_step: 여정_단계_키 = useMemo(() => {
    if (current_workspace === 'regional_diagnosis') return 'diagnosis';
    if (current_workspace === 'policy_planning') {
      if (policy_subtab === 'compare') return 'compare';
      if (policy_subtab === 'forecast') return 'forecast';
      if (policy_subtab === 'report') return 'report';
      if (policy_subtab === 'evaluation') return 'evaluation';
      return 'ai_analysis';
    }
    return 'ai_analysis';
  }, [current_workspace, policy_subtab]);

  // Journey 단계 클릭 시 네비게이션 핸들러
  const handle_select_journey_step = (step: 여정_단계_정의) => {
    if (step.workspace === 'policy_planning') {
      if (step.policyTab) {
        set_policy_subtab(step.policyTab);
      }
      set_current_workspace('policy_planning');
    } else {
      set_current_workspace(step.workspace);
    }
  };

  const current_active_subtab = useMemo(() => {
    if (current_workspace === 'medical_institution') return medical_subtab;
    if (current_workspace === 'policy_planning') return policy_subtab;
    if (current_workspace === 'hospital_ai_diagnosis') return ai_hospital_subtab;
    return undefined;
  }, [current_workspace, medical_subtab, policy_subtab, ai_hospital_subtab]);

  // ── 3대 사용자 그룹 전환 바 (PersonaSwitcherBar) ──────────────────────────
  const active_persona: 페르소나_키 | null = current_user_role === 'all' ? null : current_user_role;

  const handle_open_persona_subtab = (sub: 페르소나_서브탭) => {
    const 소속 = (['citizen', 'hospital', 'nmc'] as const).find((k) => 페르소나_찾기(k).서브탭.some((x) => x.id === sub.id));
    if (소속) set_current_user_role(소속);
    set_화면_모드('프로토타입');
    if (sub.대상.종류 === '전용화면') {
      set_persona_page_id(sub.id);
      set_current_workspace('persona_page');
      return;
    }
    handle_navigate_from_sidebar(sub.대상.workspace, sub.대상.subtab);
  };

  // 기존 워크스페이스 화면(좌측 메뉴)이 속한 사용자 그룹 서브탭 (예: 운영평가 대시보드 → ③ 3-1)
  const 화면_소속_서브탭 = (ws: 워크스페이스_타입, sub?: string, 우선?: 페르소나_키 | null) => {
    const 메뉴 = 신규_메뉴_구조_데이터.flatMap((g) => g.menus).find((m) => m.workspace === ws && (m.subtab ?? undefined) === sub);
    return 메뉴 ? 메뉴_소속_서브탭(메뉴.id, 우선) : null;
  };

  // 홈 배너 등에서 기존 화면을 열 때, 그 화면이 속한 사용자 그룹·서브탭이 선택된 상태로 연다
  const handle_open_in_persona = (ws: 워크스페이스_타입, sub?: string) => {
    const 소속 = 화면_소속_서브탭(ws, sub);
    if (소속) set_current_user_role(소속.페르소나.키);
    handle_navigate_from_sidebar(ws, sub);
  };

  const handle_select_persona = (persona: 페르소나_키) => {
    handle_open_persona_subtab(페르소나_찾기(persona).서브탭[0]);
  };

  // 전용 화면 종류 (persona_page일 때)
  const persona_page_화면 = useMemo(() => {
    const 대상 = persona_page_id ? 서브탭_찾기(persona_page_id)?.서브탭.대상 : undefined;
    return 대상?.종류 === '전용화면' ? 대상.화면 : null;
  }, [persona_page_id]);

  // 현재 화면과 일치하는 서브탭 (같은 화면을 쓰는 서브탭이 여럿이면 첫 번째)
  const active_persona_subtab_id = useMemo(() => {
    if (!active_persona) return null;
    if (current_workspace === 'persona_page') return persona_page_id;
    const 서브탭들 = 페르소나_찾기(active_persona).서브탭;
    const 일치 = 서브탭들.find(
      (s) =>
        s.대상.종류 === '워크스페이스' &&
        s.대상.workspace === current_workspace &&
        (!s.대상.subtab || s.대상.subtab === current_active_subtab)
    );
    if (일치) return 일치.id;
    // 서브탭이 전용 화면이어도, 지금 화면이 그 서브탭에 속한 기존 메뉴면 그 서브탭을 표시 (예: 3-1 → 운영평가 대시보드)
    const 소속 = 화면_소속_서브탭(current_workspace, current_active_subtab, active_persona);
    return 소속 && 소속.페르소나.키 === active_persona ? 소속.서브탭.id : null;
  }, [active_persona, current_workspace, persona_page_id, current_active_subtab]);

  // 메뉴, 워크스페이스, 서브탭, 역할 변경 시 메인 콘텐츠 및 사이드바, 윈도우 스크롤을 최상단(위쪽)으로 리셋
  useEffect(() => {
    if (main_content_ref.current) {
      main_content_ref.current.scrollTop = 0;
    }
    const mainEl = document.getElementById('main-workspace-content');
    if (mainEl) {
      mainEl.scrollTop = 0;
      const innerScrolls = mainEl.querySelectorAll('.overflow-y-auto, .overflow-auto');
      innerScrolls.forEach((el) => {
        el.scrollTop = 0;
      });
    }
    const sidebarEl = document.getElementById('sidebar-scroll-container');
    if (sidebarEl) {
      sidebarEl.scrollTop = 0;
    }
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
    }
  }, [current_workspace, policy_subtab, medical_subtab, ai_hospital_subtab, current_user_role, 화면_모드, persona_page_id]);

  return (
    <IspProvider onPersonaChange={handle_persona_change}>
      <main className="h-screen max-h-screen overflow-hidden bg-slate-50 dark:bg-[#0c0d10] flex flex-col text-slate-900 dark:text-slate-100 selection:bg-blue-600/20 transition-colors duration-200 font-sans">
        {/* 1. 최상단 글로벌 공공 헤더 (5대 워크스페이스 통합 네비게이션) */}
      <글로벌_공공_헤더
        active_workspace={current_workspace}
        on_change_workspace={(ws) => {
          set_화면_모드('프로토타입');
          if (ws === 'policy_planning' && policy_subtab === 'evaluation') {
            set_policy_subtab('policy_ai');
          }
          if (ws === 'hospital_ai_diagnosis' && ai_hospital_subtab === 'profile_report') {
            set_ai_hospital_subtab('diagnosis');
          }
          if (ws === 'national_safety') {
            set_current_user_role('citizen');
          } else if (ws === 'hospital_ai_diagnosis') {
            set_current_user_role('hospital');
          } else if (ws === 'regional_diagnosis' || ws === 'policy_planning') {
            if (current_user_role === 'citizen') {
              set_current_user_role('nmc');
            }
          }
          set_current_workspace(ws);
        }}
        on_open_plan_evaluation={() => {
          set_policy_subtab('evaluation');
          set_current_workspace('policy_planning');
        }}
        is_plan_evaluation_active={current_workspace === 'policy_planning' && policy_subtab === 'evaluation'}
        on_open_profile_report={() => {
          set_ai_hospital_subtab('profile_report');
          set_current_workspace('hospital_ai_diagnosis');
        }}
        is_profile_report_active={
          (current_workspace === 'hospital_ai_diagnosis' && ai_hospital_subtab === 'profile_report') ||
          (current_workspace === 'medical_institution' && medical_subtab === 'profile_report')
        }
        on_open_key_modal={() => set_is_key_modal_open(true)}
        on_open_data_go_kr_modal={() => set_is_data_go_kr_modal_open(true)}
        on_open_upload_modal={() => set_is_upload_modal_open(true)}
        on_open_grounding_modal={() => set_is_grounding_open(true)}
        on_open_guide_modal={() => set_is_guide_modal_open(true)}
        on_open_admin_dashboard={() => set_is_admin_dashboard_open(true)}
        on_open_llm_compare={() => set_is_llm_compare_modal_open(true)}
        on_download_nmc_excel={handle_download_nmc_excel}
        on_export_capture={handle_export_report_png}
        is_dark_mode={is_dark_mode}
        on_toggle_dark_mode={toggle_dark_mode}
        google_api_key_registered={Boolean(google_api_key || system_status.gemini_connected)}
        google_api_key={google_api_key}
        data_go_kr_key_registered={Boolean(data_go_kr_api_key || system_status.data_go_kr_connected)}
        kakao_map_key_registered={Boolean(kakao_map_api_key || process.env.NEXT_PUBLIC_KAKAO_MAP_KEY)}
        on_open_kakao_modal={() => set_is_kakao_modal_open(true)}
        vulnerable_region_count={vulnerable_region_count}
        on_search_query={handle_search_region}
        is_authenticated={is_authenticated}
        on_open_auth_modal={() => set_is_auth_modal_open(true)}
        on_open_review_guide_modal={() => set_is_review_guide_open(true)}
        화면_모드={화면_모드}
        on_change_화면_모드={set_화면_모드}
        가운데_메뉴={<PersonaGroupButtons active_persona={화면_모드 === '프로토타입' ? active_persona : null} on_select_persona={handle_select_persona} />}
      />

      {/* 1-0. 선택한 사용자 그룹의 서브탭 바 (프로토타입 체험 화면에서만) */}
      {화면_모드 === '프로토타입' && (
        <PersonaSwitcherBar
          active_persona={active_persona}
          active_subtab_id={active_persona_subtab_id}
          on_select_subtab={handle_open_persona_subtab}
        />
      )}

      {/* 1-1. 전체 Journey 상단 고정 Progress Navigation (NMC / 보건복지부 정책 기획 화면에서만 조건부 노출) */}
      {화면_모드 === '프로토타입' && (current_workspace === 'regional_diagnosis' ||
        current_workspace === 'policy_planning' ||
        current_workspace === 'ai_analysis') && (
        <전체_여정_프로그레스_바
          current_step={current_journey_step}
          selected_region_name={selected_region ? `${selected_region.시도명} ${selected_region.시군구명}` : undefined}
          on_select_step={handle_select_journey_step}
        />
      )}

      {/* 2. 메인 바디 컨테이너: 좌측 3대 대상자별 접이식 사이드바 + 우측 메인 워크스페이스 */}
      <div className="flex-1 flex flex-row min-w-0 overflow-hidden relative min-h-0">
        {/* 2-1. 좌측 3대 정보구조(IA) 사이드바 (내부용 / 외부용 / 대국민) */}
        <대상자별_좌측_사이드바
          is_collapsed={is_sidebar_collapsed}
          on_toggle_collapse={() => set_is_sidebar_collapsed((prev) => !prev)}
          current_role={current_user_role}
          on_select_role={handle_select_user_role}
          current_workspace={current_workspace}
          current_subtab={current_active_subtab}
          on_navigate_workspace={handle_navigate_from_sidebar}
        />

        {/* 2-2. 우측 본문 메인 워크스페이스 렌더링 영역 */}
        <div
          id="main-workspace-content"
          ref={main_content_ref}
          className={`flex-1 flex flex-col min-w-0 min-h-0 relative ${
            current_workspace === 'national_safety' && 화면_모드 === '프로토타입' ? 'overflow-hidden h-full' : 'overflow-y-auto'
          }`}
        >
        {/* 헤더 화면 전환: 오분류 교정 내역 / 메뉴 구조도 */}
        {화면_모드 !== '프로토타입' && (
          <div className="w-full px-4 sm:px-6 lg:px-8 pt-4">
            <button
              type="button"
              onClick={() => set_화면_모드('프로토타입')}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-900 text-white dark:bg-white dark:text-slate-900 cursor-pointer"
            >
              ← 사용자별 프로토타입 화면으로 돌아가기
            </button>
          </div>
        )}
        {화면_모드 === '교정내역' && <오분류_교정_내역_뷰 on_open_subtab={handle_open_persona_subtab} />}
        {화면_모드 === '구조도' && <메뉴_구조도_뷰 on_open_subtab={handle_open_persona_subtab} />}

        {화면_모드 === '프로토타입' && (<>
        {/* 사용자 그룹 전용 화면 (1-1~1-4·2-1~2-5·3-1~3-4, 준비 중 서브탭 안내) */}
        {current_workspace === 'persona_page' && persona_page_화면 === '대국민_공공의료기관_찾기' && (
          <div className="flex-1 w-full h-full min-h-0 overflow-hidden">
            <국민안심_서비스_뷰 />
          </div>
        )}
        {current_workspace === 'persona_page' && persona_page_화면 === '대국민_필수의료_지도' && (
          <div className="flex-1 w-full overflow-y-auto">
            <대국민_필수의료_모니터링 />
          </div>
        )}
        {current_workspace === 'persona_page' && persona_page_화면 === '대국민_알리미_비교' && <대국민_알리미_비교 />}
        {current_workspace === 'persona_page' && persona_page_화면 === '대국민_AI_안내' && <대국민_공개정보_AI_안내 />}
        {current_workspace === 'persona_page' && persona_page_화면 === '작성도우미' && (
          <공공보건의료계획_작성도우미 on_navigate={handle_navigate_from_sidebar} />
        )}
        {current_workspace === 'persona_page' && persona_page_화면 === '퇴원연계' && <퇴원환자_연계_업무화면 />}
        {current_workspace === 'persona_page' && persona_page_화면 === '경영사전검증' && <경영벤치마킹_사전검증_화면 />}
        {current_workspace === 'persona_page' && persona_page_화면 === '모자전원' && <고위험_모자_전원매칭_화면 />}
        {current_workspace === 'persona_page' && persona_page_화면 === '교육인력' && <교육_인력매칭_스마트병원_화면 />}
        {current_workspace === 'persona_page' && persona_page_화면 === 'NMC평가' && <NMC_평가_모니터링_화면 on_navigate={handle_navigate_from_sidebar} />}
        {current_workspace === 'persona_page' && persona_page_화면 === 'NMC통계' && <NMC_정책통계_DW_화면 />}
        {current_workspace === 'persona_page' && persona_page_화면 === 'NMC투자' && <NMC_투자배분_모자관제_화면 />}
        {current_workspace === 'persona_page' && persona_page_화면 === 'NMC에이전트' && <NMC_에이전트_LLMOps_화면 />}
        {current_workspace === 'persona_page' && persona_page_id && persona_page_화면 === '준비중' && (
          <페르소나_준비중_화면
            subtab_id={persona_page_id}
            on_open_citizen_map={() => handle_open_persona_subtab(서브탭_찾기('1-1')!.서브탭)}
          />
        )}

        {/* 워크스페이스 0: HOME 화면 (Hero + 4대 Quick Action + 지역 검색창) */}
        {current_workspace === 'home' && (
          <div className="flex-1 w-full overflow-y-auto">
            <공공의료_결정지도_홈
              on_search_region={handle_search_region}
              on_navigate_workspace={handle_navigate_from_home}
              active_user_role={current_user_role}
              on_open_in_persona={handle_open_in_persona}
              화면_소속={(ws, sub) => {
                const 소속 = 화면_소속_서브탭(ws, sub);
                return 소속 ? `${소속.페르소나.번호} ${소속.서브탭.id} ${소속.서브탭.label}` : null;
              }}
              on_open_persona_subtab={(id) => {
                const 찾음 = 서브탭_찾기(id);
                if (찾음) handle_open_persona_subtab(찾음.서브탭);
              }}
              on_open_guide_modal={() => set_is_guide_modal_open(true)}
              on_open_kakao_modal={() => set_is_kakao_modal_open(true)}
              kakao_map_key_registered={Boolean(kakao_map_api_key || process.env.NEXT_PUBLIC_KAKAO_MAP_KEY)}
            />
          </div>
        )}

        {/* 워크스페이스 1: [지역진단] (35:65 진단지도, 7대 Layer, 6단계 취약분석 및 정책 연계) */}
        {current_workspace === 'regional_diagnosis' && (
          <div className="flex-1 w-full p-4 sm:p-6 lg:p-8 overflow-y-auto">
            <지역진단_통합_대시보드
              diagnosed_list={diagnosed_list}
              selected_region={selected_region}
              on_select_region={(reg) => set_selected_region(reg)}
              on_navigate_policy={handle_navigate_policy}
              on_open_profile_report={handle_open_profile_report}
            />
          </div>
        )}

        {/* 워크스페이스 2: [정책기획] (AI 정책대안 Option A/B/C, 8대 항목 사업계획서, 1:1 비교, 2030 수요추계) */}
        {current_workspace === 'policy_planning' && (
          <div className="flex-1 w-full p-4 sm:p-6 lg:p-8 overflow-y-auto">
            <정책기획_통합_워크스페이스
              initial_tab={policy_subtab}
              on_change_tab={(tab) => set_policy_subtab(tab)}
              selected_region={selected_region}
              diagnosed_list={diagnosed_list}
              sido_stat={sido_stat}
              national_stat={national_stat}
              google_api_key={google_api_key}
              on_open_profile_report={handle_open_profile_report}
            />
          </div>
        )}

        {/* 워크스페이스 3: [의료기관] (214개 공공병원, 기관 데이터센터, 경영위기, 71개 CP, 신포괄 계산기, CP변이 ROI, 퇴원돌봄) */}
        {current_workspace === 'medical_institution' && (
          <div className="flex-1 w-full p-4 sm:p-6 lg:p-8 overflow-y-auto">
            <의료기관_통합_워크스페이스
              key={medical_subtab}
              initial_subtab={medical_subtab}
              on_navigate_tab={(tab) => set_medical_subtab(tab)}
              data_go_kr_api_key={data_go_kr_api_key}
              on_open_data_modal={() => set_is_data_go_kr_modal_open(true)}
            />
          </div>
        )}

        {/* ⭐ 워크스페이스 3-2: [AI 병원진단·개선] (신규 핵심: 41개 거점공공병원 AI 종합진단, 5종 진단보고서 작성, 원인분석, Benchmarking, 수요예측, AI개선대안 및 시뮬레이션, ISP실행계획, 성과관리) */}
        {current_workspace === 'hospital_ai_diagnosis' && (
          <div className="flex-1 w-full p-4 sm:p-6 lg:p-8 overflow-y-auto">
            <AI_병원진단_통합_워크스페이스
              initial_hospital_id={ai_hospital_id}
              initial_tab={ai_hospital_subtab}
              initial_profile_tab={profile_report_tab}
              on_navigate_medical_view={(hId) => {
                set_current_workspace('medical_institution');
                set_medical_subtab('hospitals');
              }}
            />
          </div>
        )}

        {/* 워크스페이스 4: [AI 분석] (Cloud AI vs Local sLLM 듀얼 AI 스튜디오 & RAG 지침 질의) */}
        {current_workspace === 'ai_analysis' && (
          <div className="flex-1 w-full p-4 sm:p-6 lg:p-8 overflow-y-auto">
            <AI분석_통합_워크스페이스
              selected_region={selected_region}
              google_api_key={google_api_key}
              on_open_key_modal={() => set_is_key_modal_open(true)}
            />
          </div>
        )}

        {/* 워크스페이스 5: [국민안심] (Mobile-First 5대 안심의료 검색, 즉시 전화/길찾기, 3단계 바텀시트) */}
        {current_workspace === 'national_safety' && (
          <div className="flex-1 w-full h-full min-h-0 overflow-hidden">
            <국민안심_서비스_뷰 />
          </div>
        )}
        </>)}
        </div>
      </div>

      {/* ============================================================== */}
      {/* 전역 공통 팝업 모달 레이어 */}
      {/* ============================================================== */}

      {/* 엑셀/CSV 데이터 업로더 모달 */}
      {is_upload_modal_open && (
        <파일_업로더_모달
          is_open={is_upload_modal_open}
          on_close={() => set_is_upload_modal_open(false)}
          on_data_loaded={(new_data) => set_raw_dataset(new_data)}
        />
      )}

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

      {/* 플랫폼 탑재 데이터셋 & 정부 법정 사업가이드 안내 팝업 모달 */}
      <데이터_사업가이드_안내_모달
        is_open={is_guide_modal_open}
        on_close={() => set_is_guide_modal_open(false)}
        on_navigate={handle_guide_navigate}
      />

      {/* 카카오 지도 Web API 키 설정 모달 */}
      <카카오_api키_설정_모달
        is_open={is_kakao_modal_open}
        on_close={() => set_is_kakao_modal_open(false)}
        on_key_saved={(new_key) => set_kakao_map_api_key(new_key)}
      />

      {/* 관리자 전용 통제센터 (데이터·품질·보안 통합 관리) 모달 */}
      <관리자_통합_모달
        is_open={is_admin_dashboard_open}
        on_close={() => set_is_admin_dashboard_open(false)}
        is_gemini_connected={Boolean(google_api_key || system_status.gemini_connected)}
        gemini_key_count={google_api_key ? (google_api_key.split(/[\n,;]+/).filter(Boolean).length || 1) : 1}
        data_go_kr_key_registered={Boolean(data_go_kr_api_key || system_status.data_go_kr_connected)}
        kakao_map_key_registered={Boolean(kakao_map_api_key || process.env.NEXT_PUBLIC_KAKAO_MAP_KEY)}
        on_open_gemini_modal={() => set_is_key_modal_open(true)}
        on_open_data_modal={() => set_is_data_go_kr_modal_open(true)}
        on_open_kakao_modal={() => set_is_kakao_modal_open(true)}
        on_open_guide_modal={() => set_is_guide_modal_open(true)}
        on_open_llm_compare={() => set_is_llm_compare_modal_open(true)}
      />

      {/* 로컬 LLM vs Google Gemini 1:1 비교 스튜디오 전용 팝업 모달 */}
      <로컬_LLM_제미나이_비교_모달
        is_open={is_llm_compare_modal_open}
        on_close={() => set_is_llm_compare_modal_open(false)}
        selected_region={selected_region}
        on_navigate_ai_workspace={() => {
          set_current_workspace('ai_analysis');
        }}
      />

      {/* 보안 로그인 및 인가 패스워드 검증 모달 */}
      <보안_로그인_모달
        isOpen={is_auth_modal_open}
        onClose={() => set_is_auth_modal_open(false)}
        isAuthenticated={is_authenticated}
        onAuthSuccess={() => {
          set_is_authenticated(true);
          set_is_auth_modal_open(false);
        }}
        onLogout={() => {
          set_is_authenticated(false);
          set_is_auth_modal_open(false);
          window.location.replace('/login');
        }}
      />

      {/* 고객 프로토타입 검토를 위한 시스템 담당자별 집중 검토 가이드 모달 */}
      <담당자별_검토_가이드_모달
        isOpen={is_review_guide_open}
        onClose={() => set_is_review_guide_open(false)}
        onNavigate={handle_review_guide_navigate}
      />

      {/* ISP 개선과제 우측 슬라이딩 드로어 (과제 3.8 / 3.4 / 3.3 / 3.10 상세) */}
      <ISP_과제_드로어 />
    </main>
  </IspProvider>
  );
}
