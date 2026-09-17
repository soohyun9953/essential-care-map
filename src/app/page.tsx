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

import {
  Sparkles,
  Camera,
  Key,
  ShieldCheck,
  ChevronRight,
  Download,
} from 'lucide-react';

export default function Home() {
  // 현재 활성화된 좌측 기능 메뉴
  const [active_menu, set_active_menu] = useState<메뉴_아이디>('gis_map');

  // 모달 상태
  const [is_grounding_open, set_is_grounding_open] = useState(false);
  const [is_upload_modal_open, set_is_upload_modal_open] = useState(false);
  const [is_key_modal_open, set_is_key_modal_open] = useState(false);
  const [google_api_key, set_google_api_key] = useState('');

  // 데이터셋 & 진단 상태
  const [raw_dataset, set_raw_dataset] = useState<시군구_원천_데이터[]>(전국_시군구_샘플_데이터);
  const [diagnosed_list, set_diagnosed_list] = useState<필수의료_진단_결과[]>([]);
  const [selected_region, set_selected_region] = useState<필수의료_진단_결과 | null>(null);

  // 지도 옵션 상태
  const [view_mode, set_view_mode] = useState<지도_시각화_모드>('종합취약도');
  const [region_unit, set_region_unit] = useState<지역_구분_단위>('시군구');

  // 초기 데이터 로드 및 API 키 확인
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved_key = localStorage.getItem('google_gemini_api_key') || '';
      set_google_api_key(saved_key);
    }
  }, []);

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
  const MENU_TITLES: Record<메뉴_아이디, { title: string; subtitle: string }> = {
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
  };

  const current_title_info = MENU_TITLES[active_menu];

  return (
    <main className="min-h-screen bg-[#f5f5f7] flex flex-col lg:flex-row selection:bg-[#0071e3]/20">
      {/* 1. 좌측 기능 사이드바 네비게이션 */}
      <메인_사이드바_네비게이션
        active_menu={active_menu}
        on_select_menu={set_active_menu}
        on_open_upload_modal={() => set_is_upload_modal_open(true)}
        on_load_sample_data={handle_load_sample_data}
        on_download_nmc_excel={handle_download_nmc_excel}
        on_open_grounding_modal={() => set_is_grounding_open(true)}
        on_open_key_modal={() => set_is_key_modal_open(true)}
        google_api_key_registered={!!google_api_key}
        selected_region_name={selected_region ? `${selected_region.시도명} ${selected_region.시군구명}` : '영월군'}
        selected_region_grade={selected_region?.종합_취약도_등급 ?? '심각'}
      />

      {/* 2. 우측 메인 워크스페이스 */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* 우측 상단 고정 헤더 바 (브레드크럼 & 지역 선택기 & 퀵 액션) */}
        <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-xl border-b border-black/[0.06] px-4 sm:px-6 lg:px-8 py-3.5 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* 좌측: 브레드크럼 타이틀 */}
            <div>
              <div className="flex items-center space-x-1.5 text-sm text-[#86868b] font-semibold">
                <span>공공보건의료 플랫폼</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
                <span className="text-[#0071e3] font-bold">
                  {active_menu === 'gis_map' && 'GIS 헬스맵'}
                  {active_menu === 'diagnosis_metrics' && '종합 지표 진단'}
                  {active_menu === 'dual_ai_studio' && '듀얼 AI 스튜디오'}
                  {active_menu === 'report_generator' && '사업계획서 생성기'}
                  {active_menu === 'hospital_crisis' && '경영위기 조기경보'}
                  {active_menu === 'discharge_care' && '퇴원환자 돌봄연계'}
                  {active_menu === 'compare_1to1' && '지자체 1:1 비교'}
                  {active_menu === 'demand_forecast' && '2030 수요추계'}
                  {active_menu === 'citizen_view' && '일반국민 안심뷰'}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#1d1d1f] mt-1">
                {current_title_info.title}
              </h2>
            </div>

            {/* 우측 상단 액션 버튼 그룹 */}
            <div className="flex items-center space-x-2 shrink-0">
              {/* Google API 키 설정 버튼 */}
              <button
                onClick={() => set_is_key_modal_open(true)}
                className={`inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-full text-sm font-bold border transition shadow-apple-sm ${
                  google_api_key
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                    : 'bg-amber-400/20 text-amber-900 border-amber-400 hover:bg-amber-400/30'
                }`}
                title="Google Gemini API 키 관리"
              >
                <Key className="w-4 h-4 text-amber-600" />
                <span>{google_api_key ? 'Google 키 등록됨' : 'Google 키 입력'}</span>
              </button>

              {/* 환각 제로 원문 대조 버튼 */}
              <button
                onClick={() => set_is_grounding_open(true)}
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-full text-sm font-bold shadow-apple-sm transition"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span className="hidden sm:inline">원문 대조</span>
              </button>

              {/* 리포트 이미지 저장 버튼 */}
              <button
                onClick={handle_export_report_png}
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-white border border-black/[0.08] hover:bg-slate-100 text-[#1d1d1f] rounded-full text-sm font-bold shadow-apple-sm transition"
                title="현재 화면을 PNG 이미지로 캡처 저장"
              >
                <Camera className="w-4 h-4 text-[#86868b]" />
                <span className="hidden sm:inline">화면 캡처</span>
              </button>
            </div>
          </div>

          {/* 상단 글로벌 지역 신속 선택기 (시도/시군구 드롭다운 & 대표 취약지 퀵 칩) */}
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
                <div className="xl:col-span-7 h-[620px]">
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

                <div className="xl:col-span-5 h-[620px]">
                  <취약지_목록_테이블
                    diagnosed_list={diagnosed_list}
                    selected_region={selected_region}
                    on_select_region={(region) => set_selected_region(region)}
                  />
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
    </main>
  );
}
