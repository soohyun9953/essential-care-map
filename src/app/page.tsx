'use client';

// Essential Care Map - 공공의료 의사결정 지원 플랫폼
// 5대 Global Workspace 통합 라우팅 및 상태 관리:
// 1. [지역진단] 지역진단_통합_대시보드 (35:65 지도, 7대 Layer, 6단계 취약분석)
// 2. [정책기획] 정책기획_통합_워크스페이스 (AI 정책대안 3옵션, 8대 항목 사업계획서, 1:1비교, 2030수요)
// 3. [의료기관] 의료기관_통합_워크스페이스 (214개 공공병원, 데이터센터, 경영위기, 71개 CP, 신포괄, CP변이 ROI, 퇴원돌봄)
// 4. [AI 분석] AI분석_통합_워크스페이스 (Cloud AI vs Local sLLM 듀얼 AI 스튜디오)
// 5. [국민안심] 국민안심_서비스_뷰 (Mobile-First 5대 안심의료, 3단계 바텀시트)

import React, { useState, useEffect, useMemo } from 'react';
import {
  시군구_원천_데이터,
  필수의료_진단_결과,
  지역_평균_통계,
} from '@/lib/필수의료_타입';
import { 필수의료_진단_엔진 } from '@/lib/필수의료_엔진';
import { 전국_시군구_샘플_데이터 } from '@/lib/시군구_데이터셋';
import { export_element_as_png } from '@/lib/유틸리티';
import { 크로스탭_엑셀_처리기 } from '@/lib/크로스탭_엑셀_처리기';

// 5대 Global Workspace 컴포넌트
import { 글로벌_공공_헤더, 워크스페이스_타입 } from '@/components/글로벌_공공_헤더';
import { 공공의료_결정지도_홈 } from '@/components/공공의료_결정지도_홈';
import { 지역진단_통합_대시보드 } from '@/components/지역진단_통합_대시보드';
import { 정책기획_통합_워크스페이스 } from '@/components/정책기획_통합_워크스페이스';
import { 의료기관_통합_워크스페이스, 의료기관_서브탭_타입 } from '@/components/의료기관_통합_워크스페이스';
import { AI분석_통합_워크스페이스 } from '@/components/AI분석_통합_워크스페이스';
import { 국민안심_서비스_뷰 } from '@/components/국민안심_서비스_뷰';

// 공통 모달 레이어
import { 파일_업로더_모달 } from '@/components/파일_업로더_모달';
import { 원문대조_신뢰뷰_모달 } from '@/components/원문대조_신뢰뷰_모달';
import { 구글_api키_설정_모달 } from '@/components/구글_api키_설정_모달';
import { 공공데이터_api키_설정_모달 } from '@/components/공공데이터_api키_설정_모달';
import { 데이터_사업가이드_안내_모달 } from '@/components/데이터_사업가이드_안내_모달';

export default function Home() {
  // 5대 Global Workspace 상태 (기본: 'home')
  const [current_workspace, set_current_workspace] = useState<워크스페이스_타입>('home');

  // 정책기획 서브탭 및 의료기관 서브탭 딥링크 상태
  const [policy_subtab, set_policy_subtab] = useState<'policy_ai' | 'report' | 'compare' | 'forecast'>('policy_ai');
  const [medical_subtab, set_medical_subtab] = useState<의료기관_서브탭_타입>('hospitals');

  // 전역 데이터셋 및 선택된 지역
  const [raw_dataset, set_raw_dataset] = useState<시군구_원천_데이터[]>(전국_시군구_샘플_데이터);
  const [diagnosed_list, set_diagnosed_list] = useState<필수의료_진단_결과[]>([]);
  const [selected_region, set_selected_region] = useState<필수의료_진단_결과 | null>(null);

  // 모달 상태
  const [is_grounding_open, set_is_grounding_open] = useState(false);
  const [is_guide_modal_open, set_is_guide_modal_open] = useState(false);
  const [is_upload_modal_open, set_is_upload_modal_open] = useState(false);
  const [is_key_modal_open, set_is_key_modal_open] = useState(false);
  const [is_data_go_kr_modal_open, set_is_data_go_kr_modal_open] = useState(false);
  const [google_api_key, set_google_api_key] = useState('');
  const [data_go_kr_api_key, set_data_go_kr_api_key] = useState('');

  // 테마 상태
  const [is_dark_mode, set_is_dark_mode] = useState(false);

  // 초기 설정 복원 (API 키 및 테마)
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

    // 226개 시군구 매칭
    const matched = diagnosed_list.find(
      (item) => item.시군구명.includes(trimmed) || item.시도명.includes(trimmed)
    );

    if (matched) {
      set_selected_region(matched);
    }
    set_current_workspace('regional_diagnosis');
  };

  // 홈 화면에서 4대 Quick Action 카드 클릭 시 네비게이션
  const handle_navigate_from_home = (
    workspace: 'regional_diagnosis' | 'policy_planning' | 'medical_institution' | 'ai_analysis' | 'national_safety',
    sub_feature?: string
  ) => {
    if (workspace === 'policy_planning' && sub_feature) {
      if (['compare', 'forecast', 'policy_ai', 'report'].includes(sub_feature)) {
        set_policy_subtab(sub_feature as any);
      }
    } else if (workspace === 'medical_institution' && sub_feature) {
      set_medical_subtab(sub_feature as any);
    }
    set_current_workspace(workspace);
  };

  // 지역진단에서 정책 연계 액션 클릭 시 정책기획 탭 전환
  const handle_navigate_policy = (feature: 'compare' | 'forecast' | 'policy_ai' | 'report') => {
    set_policy_subtab(feature);
    set_current_workspace('policy_planning');
  };

  // 안내 모달에서 메뉴 네비게이션
  const handle_guide_navigate = (menu_id: string) => {
    set_is_guide_modal_open(false);
    if (['cp_library', 'policy_incentive', 'cp_variance', 'hospital_crisis', 'discharge_care'].includes(menu_id)) {
      set_medical_subtab(menu_id as 의료기관_서브탭_타입);
      set_current_workspace('medical_institution');
    } else if (['report_generator', 'compare_1to1', 'demand_forecast'].includes(menu_id)) {
      if (menu_id === 'report_generator') set_policy_subtab('report');
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

  // 엑셀 패키지 다운로드 및 캡처
  const handle_download_nmc_excel = () => {
    if (!selected_region) return;
    크로스탭_엑셀_처리기.download_nmc_standard_excel_package(selected_region);
  };

  const handle_export_report_png = async () => {
    const filename = selected_region
      ? `${selected_region.시도명}_${selected_region.시군구명}_공공의료리포트`
      : '전국_필수의료_종합진단리포트';
    await export_element_as_png('main-workspace-content', filename);
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#0c0d10] flex flex-col text-slate-900 dark:text-slate-100 selection:bg-blue-600/20 transition-colors duration-200 font-sans">
      {/* 1. 최상단 글로벌 공공 헤더 (5대 워크스페이스 통합 네비게이션) */}
      <글로벌_공공_헤더
        active_workspace={current_workspace}
        on_change_workspace={(ws) => set_current_workspace(ws)}
        on_open_key_modal={() => set_is_key_modal_open(true)}
        on_open_data_go_kr_modal={() => set_is_data_go_kr_modal_open(true)}
        on_open_upload_modal={() => set_is_upload_modal_open(true)}
        on_open_grounding_modal={() => set_is_grounding_open(true)}
        on_open_guide_modal={() => set_is_guide_modal_open(true)}
        on_download_nmc_excel={handle_download_nmc_excel}
        on_export_capture={handle_export_report_png}
        is_dark_mode={is_dark_mode}
        on_toggle_dark_mode={toggle_dark_mode}
        google_api_key_registered={!!google_api_key}
        data_go_kr_key_registered={!!data_go_kr_api_key}
        vulnerable_region_count={vulnerable_region_count}
        on_search_query={handle_search_region}
      />

      {/* 2. 본문 메인 워크스페이스 렌더링 영역 */}
      <div id="main-workspace-content" className="flex-1 flex flex-col min-w-0">
        {/* 워크스페이스 0: HOME 화면 (Hero + 4대 Quick Action + 지역 검색창) */}
        {current_workspace === 'home' && (
          <div className="flex-1 w-full overflow-y-auto">
            <공공의료_결정지도_홈
              on_search_region={handle_search_region}
              on_navigate_workspace={handle_navigate_from_home}
              on_open_guide_modal={() => set_is_guide_modal_open(true)}
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
            />
          </div>
        )}

        {/* 워크스페이스 2: [정책기획] (AI 정책대안 Option A/B/C, 8대 항목 사업계획서, 1:1 비교, 2030 수요추계) */}
        {current_workspace === 'policy_planning' && (
          <div className="flex-1 w-full p-4 sm:p-6 lg:p-8 overflow-y-auto">
            <정책기획_통합_워크스페이스
              key={policy_subtab}
              initial_tab={policy_subtab}
              selected_region={selected_region}
              diagnosed_list={diagnosed_list}
              sido_stat={sido_stat}
              national_stat={national_stat}
              google_api_key={google_api_key}
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
          <div className="flex-1 w-full min-h-[calc(100vh-3.5rem)] overflow-hidden">
            <국민안심_서비스_뷰 />
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* 전역 공통 팝업 모달 레이어 */}
      {/* ============================================================== */}

      {/* 엑셀/CSV 데이터 업로더 모달 */}
      <파일_업로더_모달
        is_open={is_upload_modal_open}
        on_close={() => set_is_upload_modal_open(false)}
        on_data_loaded={(new_data) => set_raw_dataset(new_data)}
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

      {/* 플랫폼 탑재 데이터셋 & 정부 법정 사업가이드 안내 팝업 모달 */}
      <데이터_사업가이드_안내_모달
        is_open={is_guide_modal_open}
        on_close={() => set_is_guide_modal_open(false)}
        on_navigate={handle_guide_navigate}
      />
    </main>
  );
}
