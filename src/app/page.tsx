'use client';

// 애플 사이트(Apple.com) 스타일 필수의료 취약지 종합 진단 & 사업계획서 자동생성 플랫폼

import React, { useState, useEffect, useMemo } from 'react';
import {
  시군구_원천_데이터,
  필수의료_진단_결과,
  지역_평균_통계,
  지도_시각화_모드,
  지역_구분_단위,
  페르소나_역할,
} from '@/lib/필수의료_타입';
import { 필수의료_진단_엔진 } from '@/lib/필수의료_엔진';
import { 전국_시군구_샘플_데이터 } from '@/lib/시군구_데이터셋';
import { export_element_as_png } from '@/lib/유틸리티';

import { 헤더_네비게이션 } from '@/components/헤더_네비게이션';
import { 파일_업로더_모달 } from '@/components/파일_업로더_모달';
import { 지도_래퍼 } from '@/components/지도_래퍼';
import { 종합_진단_패널 } from '@/components/종합_진단_패널';
import { 실시간_응급_소아_모니터링 } from '@/components/실시간_응급_소아_모니터링';
import { 진료역량_사분면_분포도 } from '@/components/진료역량_사분면_분포도';
import { 진료실적_서브그룹_대시보드 } from '@/components/진료실적_서브그룹_대시보드';
import { 일대일_비교_대시보드 } from '@/components/일대일_비교_대시보드';
import { 의료수요_추계_차트 } from '@/components/의료수요_추계_차트';
import { 의료지표_비교차트 } from '@/components/의료지표_비교차트';
import { 사업계획서_서술문_생성기 } from '@/components/사업계획서_서술문_생성기';
import { 취약지_목록_테이블 } from '@/components/취약지_목록_테이블';

// 공공의료 AI ISP 스토리텔링 6대 핵심 신규 컴포넌트
import { 페르소나_관문_네비게이션 } from '@/components/페르소나_관문_네비게이션';
import { 퇴원환자_돌봄자원_AI매칭 } from '@/components/퇴원환자_돌봄자원_AI매칭';
import { 공공의료_sLLM_업무비서 } from '@/components/공공의료_sLLM_업무비서';
import { 경영위기_조기경보_대시보드 } from '@/components/경영위기_조기경보_대시보드';
import { 원문대조_신뢰뷰_모달 } from '@/components/원문대조_신뢰뷰_모달';
import { 일반국민_공공병원_맞춤뷰 } from '@/components/일반국민_공공병원_맞춤뷰';

import { MapPin, FileEdit, Sparkles, Building2, UserCheck, HeartHandshake, ShieldCheck } from 'lucide-react';

export default function Home() {
  const [current_persona, set_current_persona] = useState<페르소나_역할>('중앙정책가');
  const [is_grounding_open, set_is_grounding_open] = useState(false);

  const [raw_dataset, set_raw_dataset] = useState<시군구_원천_데이터[]>(전국_시군구_샘플_데이터);
  const [diagnosed_list, set_diagnosed_list] = useState<필수의료_진단_결과[]>([]);
  const [selected_region, set_selected_region] = useState<필수의료_진단_결과 | null>(null);
  const [view_mode, set_view_mode] = useState<지도_시각화_모드>('종합취약도');
  const [region_unit, set_region_unit] = useState<지역_구분_단위>('시군구');
  const [is_upload_modal_open, set_is_upload_modal_open] = useState(false);
  const [active_mobile_tab, set_active_mobile_tab] = useState<'map' | 'report'>('map');

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

  // 통계 계산
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
      ? `${selected_region.시도명}_${selected_region.시군구명}_필수의료_진단_리포트`
      : '전국_필수의료_취약지_종합리포트';
    await export_element_as_png('main-dashboard-content', filename);
  };

  return (
    <main className="min-h-screen bg-[#f5f5f7] flex flex-col selection:bg-[#0071e3]/20">
      {/* 1. 상단 글로벌 네비게이션 */}
      <헤더_네비게이션
        on_open_upload_modal={() => set_is_upload_modal_open(true)}
        on_load_sample_data={handle_load_sample_data}
        on_export_report_png={handle_export_report_png}
        total_region_count={diagnosed_list.length}
        vulnerable_region_count={vulnerable_region_count}
      />

      {/* 2. 과제 3.4 통합포털 관문: 3대 페르소나 전환 바 */}
      <페르소나_관문_네비게이션
        current_persona={current_persona}
        on_change_persona={set_current_persona}
        on_open_grounding_modal={() => set_is_grounding_open(true)}
      />

      {/* 애플 스타일 히어로 타이틀 헤더 */}
      <section className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/80 border border-black/[0.04] text-xs font-semibold text-[#0071e3] shadow-apple-sm mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>
                {current_persona === '중앙정책가' && '과제 3.5 & 3.2: 70개 중진료권 헬스맵 & 공공의료 AI 조기경보'}
                {current_persona === '지역코디네이터' && '과제 3.1: 퇴원환자-지역사회 돌봄자원 AI 원클릭 매칭 연계'}
                {current_persona === '일반국민' && '과제 3.4: 국민 안심 공공의료 안내 & 모바일 퇴원돌봄 알리미'}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1d1d1f]">
              {current_persona === '중앙정책가' && '필수의료의 공백을 진단하고, 정책 지원을 지능화하다.'}
              {current_persona === '지역코디네이터' && '퇴원 후 단절 없는 케어, AI가 복지·돌봄을 연결합니다.'}
              {current_persona === '일반국민' && '우리 가족을 위한 든든한 공공병원과 안심 퇴원 케어.'}
            </h2>
            <p className="text-sm text-[#86868b] mt-1 max-w-3xl">
              {current_persona === '중앙정책가' &&
                '보건복지부 법정 고시 기준 알고리즘 탑재. 전국 70개 중진료권 응급·분만·소아 취약지 판정부터 35개 지방의료원 경영위기 선제 감지까지 한 화면에서 조망합니다.'}
              {current_persona === '지역코디네이터' &&
                '강원 영월의료원 공공의료협력팀을 위한 전용 뷰. 환자 특성에 맞는 장기요양·도시락·보건소 자원을 AI가 자동 매칭하고 전자연계의뢰서를 즉시 발송합니다.'}
              {current_persona === '일반국민' &&
                '가장 가까운 응급실·소아과 보유 공공병원을 실시간으로 확인하고, 퇴원 후 복약 및 방문재활 일정을 카카오 알림톡으로 안내받으세요.'}
            </p>
          </div>

          {/* 신뢰 뷰 바로가기 버튼 & 간이 통계 pill */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => set_is_grounding_open(true)}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-2xl text-xs font-semibold shadow-apple-sm transition-all"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>환각 제로 원문 대조 뷰</span>
            </button>

            <div className="flex items-center space-x-2 bg-white/70 backdrop-blur-md px-4 py-2 rounded-2xl border border-black/[0.04] shadow-apple-sm text-xs">
              <span className="text-[#86868b]">전국 평균 60분 미도달율:</span>
              <strong className="text-[#1d1d1f] font-semibold">{national_stat.평균_응급_60분_미도달_인구비율}%</strong>
              <span className="text-black/20">|</span>
              <span className="text-[#86868b]">평균 RI:</span>
              <strong className="text-[#1d1d1f] font-semibold">{national_stat.평균_관내_응급_의료이용률}%</strong>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 3. 페르소나별 뷰 스위칭 영역 */}
      {/* ============================================================== */}

      {/* [페르소나 1] 중앙정책가 (보건복지부 / 국립중앙의료원) */}
      {current_persona === '중앙정책가' && (
        <>
          {/* 모바일 탭 세그먼트 컨트롤러 */}
          <div className="lg:hidden px-4 mb-3">
            <div className="bg-white p-1 rounded-full border border-black/[0.05] shadow-apple-sm flex items-center justify-around text-xs font-semibold">
              <button
                onClick={() => set_active_mobile_tab('map')}
                className={`flex-1 py-1.5 rounded-full transition-all flex items-center justify-center space-x-1.5 ${
                  active_mobile_tab === 'map' ? 'bg-[#1d1d1f] text-white shadow-sm' : 'text-[#86868b]'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>GIS 지도 & 목록</span>
              </button>
              <button
                onClick={() => set_active_mobile_tab('report')}
                className={`flex-1 py-1.5 rounded-full transition-all flex items-center justify-center space-x-1.5 ${
                  active_mobile_tab === 'report' ? 'bg-[#1d1d1f] text-white shadow-sm' : 'text-[#86868b]'
                }`}
              >
                <FileEdit className="w-3.5 h-3.5" />
                <span>AI 정책비서 & 분석</span>
              </button>
            </div>
          </div>

          {/* GIS 지도 & 전국 시군구 취약지 데이터베이스 (좌우 7:5 분할) */}
          <section
            className={`max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 mb-8 ${
              active_mobile_tab === 'report' ? 'hidden lg:block' : 'block'
            }`}
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              <div className="lg:col-span-7 h-[580px]">
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
                  region_unit={region_unit}
                  on_change_region_unit={set_region_unit}
                />
              </div>

              <div className="lg:col-span-5 h-[580px]">
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
            </div>
          </section>

          {/* 경영위기 조기경보 & sLLM 업무비서 하이라이트 섹션 */}
          <section className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 mb-8">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
              {/* 과제 3.2: 35개 지방의료원 경영위기 조기경보 & 성과 스크리닝 */}
              <경영위기_조기경보_대시보드 on_open_grounding={() => set_is_grounding_open(true)} />

              {/* 과제 3.11/3.12: 공공의료 특화 sLLM 지침 비서 (RAG + DW 연동) */}
              <공공의료_sLLM_업무비서
                selected_region={selected_region}
                on_open_grounding={() => set_is_grounding_open(true)}
              />
            </div>
          </section>

          {/* 하단 상세 분석 영역: 2열 그리드(2개씩 나란히 배치) */}
          <section
            id="main-dashboard-content"
            className={`max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 pb-16 ${
              active_mobile_tab === 'map' ? 'hidden lg:block' : 'block'
            }`}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              {/* [1행 좌] 종합 진단 패널 (Apple Health 카드) */}
              <종합_진단_패널 selected_region={selected_region} />

              {/* [1행 우] 실시간 응급실 & 소아병상 모니터링 */}
              <실시간_응급_소아_모니터링 selected_region={selected_region} />

              {/* [2행 좌] 7대 진료역량 사분면 분포도 */}
              <진료역량_사분면_분포도 selected_region={selected_region} />

              {/* [2행 우] 7대 서브그룹 진료실적 심층 드릴다운 */}
              <진료실적_서브그룹_대시보드 selected_region={selected_region} />

              {/* [3행 좌] 1:1 기관비교 & 지역비교 벤치마킹 대시보드 */}
              <일대일_비교_대시보드
                selected_region={selected_region}
                diagnosed_list={diagnosed_list}
              />

              {/* [3행 우] 2040 장래 의료수요 추계 & 공급지수(RI/CI) 시뮬레이터 */}
              <의료수요_추계_차트 selected_region={selected_region} />

              {/* [4행 좌] 지표 비교 차트 */}
              <의료지표_비교차트
                selected_region={selected_region}
                sido_stat={sido_stat}
                national_stat={national_stat}
              />

              {/* [4행 우] 공문서 개조식 사업계획서 실시간 서술문 생성기 */}
              <사업계획서_서술문_생성기
                selected_region={selected_region}
                sido_stat={sido_stat}
                national_stat={national_stat}
              />
            </div>
          </section>
        </>
      )}

      {/* [페르소나 2] 지역 코디네이터 (지방의료원 공공의료협력팀) */}
      {current_persona === '지역코디네이터' && (
        <section className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-8">
          {/* 과제 3.1: 원클릭 환자 전원 및 돌봄자원 AI 매칭 시뮬레이터 */}
          <퇴원환자_돌봄자원_AI매칭 />

          {/* 코디네이터를 위한 보조 협력 패널들 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {/* 실시간 이송 및 병상 상황 파악 */}
            <실시간_응급_소아_모니터링 selected_region={selected_region} />

            {/* 담당 권역 필수의료 취약 현황 */}
            <종합_진단_패널 selected_region={selected_region} />
          </div>

          {/* 코디네이터를 위한 공공의료 지침 비서 */}
          <공공의료_sLLM_업무비서
            selected_region={selected_region}
            on_open_grounding={() => set_is_grounding_open(true)}
          />
        </section>
      )}

      {/* [페르소나 3] 일반 국민 (지역주민 / 환자·보호자) */}
      {current_persona === '일반국민' && (
        <section className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          {/* 과제 3.4 대국민 포털: 안심 공공병원 찾기 & 모바일 퇴원돌봄 알리미 */}
          <일반국민_공공병원_맞춤뷰 selected_region={selected_region} />
        </section>
      )}

      {/* 과제 3.14/3.18: 환각 제로 원문 대조 신뢰 뷰 모달 */}
      <원문대조_신뢰뷰_모달
        is_open={is_grounding_open}
        on_close={() => set_is_grounding_open(false)}
      />

      {/* 파일 업로드 모달 다이얼로그 */}
      <파일_업로더_모달
        is_open={is_upload_modal_open}
        on_close={() => set_is_upload_modal_open(false)}
        on_data_loaded={handle_data_loaded}
      />
    </main>
  );
}

