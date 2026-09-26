'use client';

// Essential Care Map - 의료기관 통합 워크스페이스
// Section 14 (공공의료기관 Card & 검색), Section 15 (기관 상세 5대 탭), Section 16 (기관 담당자 Dashboard)
// 및 기존 5대 현장관리 모듈(경영위기, CP 라이브러리, 신포괄, CP변이 ROI, 퇴원돌봄) 100% 무손실 보존

import React, { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import {
  Building2,
  Search,
  Filter,
  Phone,
  Navigation,
  CheckCircle2,
  ShieldCheck,
  AlertTriangle,
  Activity,
  Layers,
  Sparkles,
  Bed,
  Users,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import {
  전체_공공의료기관_상세목록,
  공공의료기관_상세_프로필,
  의료서비스_코드,
} from '@/lib/의료서비스_검색_엔진';
import { 의료기관_상세_정보_모달 } from './의료기관_상세_정보_모달';
import { 기관_데이터센터_대시보드 } from './기관_데이터센터_대시보드';
import { 경영위기_조기경보_대시보드 } from './경영위기_조기경보_대시보드';
// 71개 CP 데이터셋을 쓰는 라이브러리 탭은 진입 시점에 지연 로딩
const 공공의료_CP_오더세트_라이브러리 = dynamic(() => import('./공공의료_CP_오더세트_라이브러리'), {
  loading: () => (
    <div className="py-16 text-center text-sm text-[#86868b]">데이터를 불러오는 중입니다...</div>
  ),
});
import 신포괄_정책가산_평가_시뮬레이터 from './신포괄_정책가산_평가_시뮬레이터';
import CP_변이분석_및_ROI_대시보드 from './CP_변이분석_및_ROI_대시보드';
import { 퇴원환자_돌봄자원_AI매칭 } from './퇴원환자_돌봄자원_AI매칭';
import { ISP_과제_뱃지 } from './ISP_과제_뱃지';
import { AsIs_비교_배너 } from './AsIs_비교_배너';

export type 의료기관_서브탭_타입 =
  | 'hospitals'
  | 'datacenter'
  | 'crisis'
  | 'cp_library'
  | 'policy_incentive'
  | 'cp_variance'
  | 'discharge_care';

interface 의료기관_통합_워크스페이스_속성 {
  initial_subtab?: 의료기관_서브탭_타입;
  on_navigate_tab?: (tab: 의료기관_서브탭_타입) => void;
  data_go_kr_api_key?: string;
  on_open_data_modal?: () => void;
}

export const 의료기관_통합_워크스페이스: React.FC<의료기관_통합_워크스페이스_속성> = ({
  initial_subtab = 'hospitals',
  on_navigate_tab,
  data_go_kr_api_key,
  on_open_data_modal,
}) => {
  const [active_subtab, setActive_subtab] = useState<의료기관_서브탭_타입>(initial_subtab);

  // 검색 및 필터
  const [keyword, setKeyword] = useState('');
  const [selected_sido, setSelected_sido] = useState('전체');
  const [selected_type, setSelected_type] = useState<'전체' | '권역책임' | '지역책임' | '특수공공'>('전체');

  // 상세 모달 대상 기관
  const [detail_modal_hospital, set_detail_modal_hospital] = useState<공공의료기관_상세_프로필 | null>(null);

  // 시도 목록
  const sido_list = useMemo(() => {
    const set = new Set(전체_공공의료기관_상세목록.map((h) => h.시도명));
    return ['전체', ...Array.from(set)];
  }, []);

  // 필터링된 기관 목록
  const filtered_hospitals = useMemo(() => {
    return 전체_공공의료기관_상세목록.filter((h) => {
      const match_kw =
        h.기관명.includes(keyword) || h.시군구명.includes(keyword) || h.시도명.includes(keyword);
      const match_sido = selected_sido === '전체' || h.시도명 === selected_sido;
      const match_type = selected_type === '전체' || h.기관유형 === selected_type;
      return match_kw && match_sido && match_type;
    });
  }, [keyword, selected_sido, selected_type]);

  const handle_tab_change = (tab: 의료기관_서브탭_타입) => {
    setActive_subtab(tab);
    on_navigate_tab?.(tab);
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* ============================================================== */}
      {/* 1. 상단 서브탭 네비게이션 */}
      {/* ============================================================== */}
      <div className="bg-white dark:bg-[#15161b] p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-1.5 flex-wrap">
        <button
          onClick={() => handle_tab_change('hospitals')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            active_subtab === 'hospitals'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>공공의료기관 탐색 (214개소)</span>
        </button>

        <button
          onClick={() => handle_tab_change('datacenter')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            active_subtab === 'datacenter'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>기관 데이터센터 (담당자 전용)</span>
        </button>

        <button
          onClick={() => handle_tab_change('crisis')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            active_subtab === 'crisis'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>지방의료원 경영위기 조기경보 (예시)</span>
        </button>

        <button
          onClick={() => handle_tab_change('cp_library')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            active_subtab === 'cp_library'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>71개 표준진료지침(CP) 라이브러리</span>
          <ISP_과제_뱃지 taskId="3.3" customLabel="과제 3.3 CP 전주기 시스템" />
        </button>

        <button
          onClick={() => handle_tab_change('policy_incentive')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            active_subtab === 'policy_incentive'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>신포괄 정책가산(1.0%) 계산기</span>
          <ISP_과제_뱃지 taskId="3.3" customLabel="과제 3.3 CP 전주기 시스템" />
        </button>

        <button
          onClick={() => handle_tab_change('cp_variance')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            active_subtab === 'cp_variance'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>CP 변이 분석 &amp; ROI</span>
          <ISP_과제_뱃지 taskId="3.3" customLabel="과제 3.3 CP 전주기 시스템" />
        </button>

        <button
          onClick={() => handle_tab_change('discharge_care')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            active_subtab === 'discharge_care'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>퇴원환자 돌봄자원 매칭</span>
        </button>

        {/* 공공데이터포털 API 키 등록 상태 뱃지 (의료기관 수치는 내장 기준 데이터) */}
        <div className="ml-auto flex items-center gap-2">
          {data_go_kr_api_key ? (
            <div
              className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 shadow-2xs"
              title="기관 데이터센터에서 공공데이터포털 응급실 API 연결을 확인할 수 있습니다. 의료기관 수치는 내장 기준 데이터입니다."
            >
              <span>data.go.kr API 키 등록됨</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={on_open_data_modal}
              className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 dark:hover:bg-amber-900/60 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
              title="공공데이터포털 API 인증키 설정"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>공공데이터 API 키 등록</span>
            </button>
          )}
        </div>
      </div>

      {/* As-Is vs To-Be 공공병원 & CP 시뮬레이터 비교 배너 */}
      <AsIs_비교_배너 target="simulator" />

      {/* ============================================================== */}
      {/* 2. SUBTAB 1: 공공의료기관 탐색 (Section 14 & 15 표준 Card) */}
      {/* ============================================================== */}
      {active_subtab === 'hospitals' && (
        <div className="space-y-4">
          {/* 검색 및 필터 헤더 */}
          <div className="bg-white dark:bg-[#15161b] p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="기관명, 지역(시군구) 검색..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-blue-600"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <select
                value={selected_sido}
                onChange={(e) => setSelected_sido(e.target.value)}
                className="text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-700 dark:text-slate-300 focus:outline-none"
              >
                {sido_list.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>

              <select
                value={selected_type}
                onChange={(e) => setSelected_type(e.target.value as any)}
                className="text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-700 dark:text-slate-300 focus:outline-none"
              >
                <option value="전체">모든 유형</option>
                <option value="권역책임">권역책임의료기관</option>
                <option value="지역책임">지역책임의료기관</option>
                <option value="특수공공">특수공공병원</option>
              </select>

              <span className="text-xs text-slate-400 font-semibold whitespace-nowrap pl-2">
                총 {filtered_hospitals.length}개소
              </span>
            </div>
          </div>

          {/* Section 14 표준 기관 Card 그리드 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered_hospitals.map((h) => {
              // 기존 태그 정확일치 비교('응급' 등)는 '지역응급' 같은 태그와 일치하지 않아 항상 '-'였음 → 서비스 상태(추정) 기준
              const 운영_추정 = (code: string) => h.서비스_상세.some((s) => s.코드 === code && s.상태 === '운영');
              const has_emergency = 운영_추정('emergency');
              const has_pediatric = 운영_추정('pediatric');
              const has_dialysis = 운영_추정('dialysis');
              const has_inpatient = 운영_추정('inpatient');

              return (
                <div
                  key={h.id}
                  className="bg-white dark:bg-[#15161b] p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                >
                  {/* 상단: 기관명 & 유형 & 운영상태 */}
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-base font-black text-slate-900 dark:text-white">
                          {h.기관명}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {h.기관유형}
                        </p>
                      </div>
                      <span
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700 shrink-0"
                        title="실제 운영 상태는 연계되지 않습니다"
                      >
                        <span>운영 {h.운영_상태}</span>
                      </span>
                    </div>

                    {/* Section 14 표준 필수서비스 체크박스 (응급 ✓ / 소아 ✓ / 투석 ✓ / 입원 ✓) */}
                    <div
                      className="flex items-center gap-3 text-xs text-slate-700 dark:text-slate-300 pt-1"
                      title="기관 유형·병상 규모 기반 추정 (방문 전 기관 확인 필요)"
                    >
                      <span className={`flex items-center gap-0.5 ${has_emergency ? 'font-bold text-blue-600' : 'text-slate-300'}`}>
                        응급 {has_emergency ? '✓' : '-'}
                      </span>
                      <span className={`flex items-center gap-0.5 ${has_pediatric ? 'font-bold text-blue-600' : 'text-slate-300'}`}>
                        소아 {has_pediatric ? '✓' : '-'}
                      </span>
                      <span className={`flex items-center gap-0.5 ${has_dialysis ? 'font-bold text-blue-600' : 'text-slate-300'}`}>
                        투석 {has_dialysis ? '✓' : '-'}
                      </span>
                      <span className={`flex items-center gap-0.5 ${has_inpatient ? 'font-bold text-blue-600' : 'text-slate-300'}`}>
                        입원 {has_inpatient ? '✓' : '-'}
                      </span>
                      <span className="text-[10px] text-slate-400">(추정)</span>
                    </div>

                    {/* 병상 자원 수치: 총 병상은 원본 데이터, 가용 병상은 기관별 실시간 연계 미지원 */}
                    <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <span>가용 / 총 병상:</span>
                      <span className="text-slate-400 dark:text-slate-500 font-medium" title="기관별 가용 병상 실시간 연계는 아직 지원되지 않습니다">
                        - / {h.의료자원.병상.총병상} <span className="text-[10px]">(가용 실시간 미연동)</span>
                      </span>
                    </div>
                  </div>

                  {/* 하단 3대 액션 버튼: [상세정보] [길찾기] [전화] */}
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => set_detail_modal_hospital(h)}
                      className="py-1.5 px-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs text-center transition shadow-xs cursor-pointer"
                    >
                      상세정보
                    </button>
                    <a
                      href={`https://map.kakao.com/link/to/${encodeURIComponent(h.기관명)},${h.위도},${h.경도}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-1.5 px-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs text-center transition flex items-center justify-center gap-1"
                    >
                      <Navigation className="w-3 h-3" />
                      <span>길찾기</span>
                    </a>
                    <a
                      href={`tel:${h.전화번호}`}
                      className="py-1.5 px-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs text-center transition flex items-center justify-center gap-1"
                    >
                      <Phone className="w-3 h-3 text-emerald-600" />
                      <span>전화</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 5대 탭 상세 모달 (Section 15) */}
          <의료기관_상세_정보_모달
            hospital={detail_modal_hospital}
            is_open={!!detail_modal_hospital}
            on_close={() => set_detail_modal_hospital(null)}
            data_go_kr_api_key={data_go_kr_api_key}
            on_open_data_modal={on_open_data_modal}
          />
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. SUBTAB 2: 기관 데이터센터 (Section 16) */}
      {/* ============================================================== */}
      {active_subtab === 'datacenter' && (
        <기관_데이터센터_대시보드
          data_go_kr_api_key={data_go_kr_api_key}
          on_open_data_modal={on_open_data_modal}
        />
      )}

      {/* ============================================================== */}
      {/* 4. SUBTAB 3: 지방의료원 경영위기 조기경보 */}
      {/* ============================================================== */}
      {active_subtab === 'crisis' && (
        <경영위기_조기경보_대시보드 />
      )}

      {/* ============================================================== */}
      {/* 5. SUBTAB 4: 71개 표준진료지침(CP) 라이브러리 */}
      {/* ============================================================== */}
      {active_subtab === 'cp_library' && (
        <공공의료_CP_오더세트_라이브러리 />
      )}

      {/* ============================================================== */}
      {/* 6. SUBTAB 5: 신포괄 정책가산 계산기 */}
      {/* ============================================================== */}
      {active_subtab === 'policy_incentive' && (
        <신포괄_정책가산_평가_시뮬레이터 />
      )}

      {/* ============================================================== */}
      {/* 7. SUBTAB 6: CP 변이 분석 & ROI 대시보드 */}
      {/* ============================================================== */}
      {active_subtab === 'cp_variance' && (
        <CP_변이분석_및_ROI_대시보드 />
      )}

      {/* ============================================================== */}
      {/* 8. SUBTAB 7: 퇴원환자 돌봄자원 AI 매칭 */}
      {/* ============================================================== */}
      {active_subtab === 'discharge_care' && (
        <퇴원환자_돌봄자원_AI매칭 />
      )}
    </div>
  );
};
