'use client';

// 필수의료 취약지 진단 및 공문서 사업계획서 자동생성 플랫폼 메인 대시보드 페이지

import React, { useState, useEffect, useMemo } from 'react';
import {
  시군구_원천_데이터,
  필수의료_진단_결과,
  지역_평균_통계,
  지도_시각화_모드,
} from '@/lib/필수의료_타입';
import { 필수의료_진단_엔진 } from '@/lib/필수의료_엔진';
import { 전국_시군구_샘플_데이터 } from '@/lib/시군구_데이터셋';
import { export_element_as_png } from '@/lib/유틸리티';

import { 헤더_네비게이션 } from '@/components/헤더_네비게이션';
import { 파일_업로더_모달 } from '@/components/파일_업로더_모달';
import { 지도_래퍼 } from '@/components/지도_래퍼';
import { 종합_진단_패널 } from '@/components/종합_진단_패널';
import { 의료지표_비교차트 } from '@/components/의료지표_비교차트';
import { 사업계획서_서술문_생성기 } from '@/components/사업계획서_서술문_생성기';
import { 취약지_목록_테이블 } from '@/components/취약지_목록_테이블';
import { LayoutDashboard, MapPin, FileEdit, TableProperties, Sparkles } from 'lucide-react';

export default function Home() {
  // 1. 원천 데이터 및 진단 결과 상태
  const [raw_dataset, set_raw_dataset] = useState<시군구_원천_데이터[]>(전국_시군구_샘플_데이터);
  const [diagnosed_list, set_diagnosed_list] = useState<필수의료_진단_결과[]>([]);
  const [selected_region, set_selected_region] = useState<필수의료_진단_결과 | null>(null);

  // 2. 지도 시각화 모드 상태
  const [view_mode, set_view_mode] = useState<지도_시각화_모드>('종합취약도');

  // 3. 파일 업로드 모달 상태
  const [is_upload_modal_open, set_is_upload_modal_open] = useState(false);

  // 4. 모바일/반응형 뷰 탭 상태
  const [active_mobile_tab, set_active_mobile_tab] = useState<'map' | 'report'>('map');

  // 원천 데이터 변경 시 일괄 진단 실행
  useEffect(() => {
    const diagnosed = 필수의료_진단_엔진.batch_diagnose(raw_dataset);
    set_diagnosed_list(diagnosed);

    // 기본 선택 지역: 강원도 영월군 또는 첫 번째 취약지역
    const default_target =
      diagnosed.find((item) => item.시군구명 === '영월군') ||
      diagnosed.find((item) => item.종합_취약도_등급 === '심각') ||
      diagnosed[0] ||
      null;

    set_selected_region(default_target);
  }, [raw_dataset]);

  // 전국 및 선택 시도 단위 평균 통계 계산
  const national_stat: 지역_평균_통계 = useMemo(() => {
    return 필수의료_진단_엔진.calculate_region_statistics(diagnosed_list);
  }, [diagnosed_list]);

  const sido_stat: 지역_평균_통계 = useMemo(() => {
    if (!selected_region) return national_stat;
    return 필수의료_진단_엔진.calculate_region_statistics(diagnosed_list, selected_region.시도명);
  }, [diagnosed_list, selected_region, national_stat]);

  // 취약지역 카운트
  const vulnerable_region_count = useMemo(() => {
    return diagnosed_list.filter((item) => item.종합_취약도_등급 !== '정상').length;
  }, [diagnosed_list]);

  // 핸들러: 샘플 데이터 다시 로드
  const handle_load_sample_data = () => {
    set_raw_dataset(전국_시군구_샘플_데이터);
  };

  // 핸들러: 업로드 데이터 반영
  const handle_data_loaded = (new_data: 시군구_원천_데이터[]) => {
    set_raw_dataset(new_data);
  };

  // 핸들러: 리포트 전체 PNG 캡처 저장
  const handle_export_report_png = async () => {
    const filename = selected_region
      ? `${selected_region.시도명}_${selected_region.시군구명}_필수의료_진단_리포트`
      : '전국_필수의료_취약지_종합리포트';
    await export_element_as_png('main-dashboard-content', filename);
  };

  return (
    <main className="min-h-screen bg-slate-100 flex flex-col selection:bg-sky-200">
      {/* 1. 상단 네비게이션 헤더 */}
      <헤더_네비게이션
        on_open_upload_modal={() => set_is_upload_modal_open(true)}
        on_load_sample_data={handle_load_sample_data}
        on_export_report_png={handle_export_report_png}
        total_region_count={diagnosed_list.length}
        vulnerable_region_count={vulnerable_region_count}
      />

      {/* 모바일 탭 네비게이션 */}
      <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-2 flex items-center justify-around text-xs font-semibold">
        <button
          onClick={() => set_active_mobile_tab('map')}
          className={`flex items-center space-x-1.5 py-1 px-3 rounded-lg ${
            active_mobile_tab === 'map' ? 'bg-sky-600 text-white' : 'text-slate-600'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>GIS 지도 & 목록</span>
        </button>
        <button
          onClick={() => set_active_mobile_tab('report')}
          className={`flex items-center space-x-1.5 py-1 px-3 rounded-lg ${
            active_mobile_tab === 'report' ? 'bg-sky-600 text-white' : 'text-slate-600'
          }`}
        >
          <FileEdit className="w-4 h-4" />
          <span>진단 대시보드 & 사업계획서</span>
        </button>
      </div>

      {/* 2. 메인 대시보드 영역 */}
      <div
        id="main-dashboard-content"
        className="flex-1 max-w-[1720px] w-full mx-auto p-3 sm:p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5"
      >
        {/* 좌측 영역: 전국 시·군·구 GIS 행정구역 지도 및 목록 테이블 (5 cols) */}
        <div
          className={`lg:col-span-5 flex flex-col space-y-4 ${
            active_mobile_tab === 'report' ? 'hidden lg:flex' : 'flex'
          }`}
        >
          {/* 인터랙티브 GIS 지도 */}
          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[520px]">
            <div className="flex items-center justify-between px-2 py-1 mb-2">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-sky-600" />
                <h3 className="text-sm font-bold text-slate-800">
                  전국 시·군·구 GIS 취약지도
                </h3>
              </div>
              <span className="text-[11px] text-slate-400">
                시군구 영역 클릭 시 진단 연동
              </span>
            </div>
            <div className="flex-1 w-full h-full relative">
              <지도_래퍼
                diagnosed_list={diagnosed_list}
                selected_region={selected_region}
                on_select_region={(region) => {
                  set_selected_region(region);
                  if (window.innerWidth < 1024) {
                    set_active_mobile_tab('report');
                  }
                }}
                view_mode={view_mode}
                on_change_view_mode={set_view_mode}
              />
            </div>
          </div>

          {/* 전국 시군구 취약지 목록 및 검색 테이블 */}
          <취약지_목록_테이블
            diagnosed_list={diagnosed_list}
            selected_region={selected_region}
            on_select_region={(region) => {
              set_selected_region(region);
              if (window.innerWidth < 1024) {
                set_active_mobile_tab('report');
              }
            }}
          />
        </div>

        {/* 우측 영역: 종합 진단 패널, 비교 차트, 공문서 개조식 사업계획서 생성기 (7 cols) */}
        <div
          className={`lg:col-span-7 flex flex-col space-y-4 ${
            active_mobile_tab === 'map' ? 'hidden lg:flex' : 'flex'
          }`}
        >
          {/* 1. 선택 지역 3대 필수의료 취약지 종합 진단 패널 */}
          <종합_진단_패널 selected_region={selected_region} />

          {/* 2. 지역 vs 시도 vs 전국 비교 레이더 & 바 차트 */}
          <의료지표_비교차트
            selected_region={selected_region}
            sido_stat={sido_stat}
            national_stat={national_stat}
          />

          {/* 3. 공문서 개조식 사업계획서 실시간 서술문 자동 생성기 */}
          <사업계획서_서술문_생성기
            selected_region={selected_region}
            sido_stat={sido_stat}
            national_stat={national_stat}
          />
        </div>
      </div>

      {/* 파일 업로드 모달 다이얼로그 */}
      <파일_업로더_모달
        is_open={is_upload_modal_open}
        on_close={() => set_is_upload_modal_open(false)}
        on_data_loaded={handle_data_loaded}
      />
    </main>
  );
}
