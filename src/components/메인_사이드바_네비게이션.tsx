'use client';

import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Bot,
  Activity,
  ShieldAlert,
  HeartHandshake,
  FileEdit,
  GitCompare,
  TrendingUp,
  UserCheck,
  Upload,
  Download,
  ShieldCheck,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Menu,
  X,
  Sparkles,
  Layers,
  Key,
  Database,
  Compass,
  Brain,
  FileText,
  Building2,
  Users,
} from 'lucide-react';

export type 메뉴_아이디 =
  | 'gis_map'
  | 'diagnosis_metrics'
  | 'dual_ai_studio'
  | 'report_generator'
  | 'hospital_crisis'
  | 'discharge_care'
  | 'compare_1to1'
  | 'demand_forecast'
  | 'citizen_view'
  | 'my_hospital';

export interface 사이드바_메뉴_항목 {
  id: 메뉴_아이디;
  label: string;
  icon: React.ElementType;
  badge?: string;
  desc: string;
}

export interface 사이드바_대메뉴 {
  id: string;
  title: string;
  icon: React.ElementType;
  desc: string;
  items: 사이드바_메뉴_항목[];
}

// 6대 메인 메뉴 및 하위 메뉴 구조
const SIX_MAIN_CATEGORIES: 사이드바_대메뉴[] = [
  {
    id: 'status_diag',
    title: '1. 현황진단',
    icon: Compass,
    desc: 'GIS 지도 기반 취약지 진단 & 지표 분석',
    items: [
      {
        id: 'gis_map',
        label: 'GIS 헬스맵 & 취약지 DB',
        icon: MapPin,
        badge: '전국 70개',
        desc: '중진료권 지도 & 226개 시군구 진단',
      },
      {
        id: 'diagnosis_metrics',
        label: '취약지 종합 지표 진단',
        icon: Activity,
        desc: '3대 영역 지표 & 사분면 역량 분석',
      },
      {
        id: 'compare_1to1',
        label: '지자체 1:1 비교 대시보드',
        icon: GitCompare,
        desc: '전국 2개 지자체 인프라 정밀 비교',
      },
    ],
  },
  {
    id: 'ai_analysis',
    title: '2. AI분석',
    icon: Brain,
    desc: '듀얼 LLM 추론 & 시계열 의료수요 예측',
    items: [
      {
        id: 'dual_ai_studio',
        label: '듀얼 AI 스튜디오 (Gemini × sLLM)',
        icon: Bot,
        badge: 'Dual AI',
        desc: '외부 클라우드 vs 로컬 sLLM 1:1 비교',
      },
      {
        id: 'demand_forecast',
        label: '2030 의료수요 AI 추계',
        icon: TrendingUp,
        desc: '고령화 시계열 예측 & 시도 벤치마킹',
      },
    ],
  },
  {
    id: 'policy_plan',
    title: '3. 정책기획',
    icon: FileText,
    desc: '보건복지부 공모 표준 사업계획서 생성',
    items: [
      {
        id: 'report_generator',
        label: '사업계획서 자동생성기',
        icon: FileEdit,
        badge: '원클릭',
        desc: '복지부 공모 표준 개조식 보고서 완성',
      },
    ],
  },
  {
    id: 'field_manage',
    title: '4. 현장관리',
    icon: Building2,
    desc: '의료원 경영위기 감지 & 돌봄자원 매칭',
    items: [
      {
        id: 'hospital_crisis',
        label: '지방의료원 경영위기 조기경보',
        icon: ShieldAlert,
        badge: '35개 병원',
        desc: '공공병원 경영수지 & 선제 위기감지',
      },
      {
        id: 'discharge_care',
        label: '퇴원환자 돌봄자원 AI 매칭',
        icon: HeartHandshake,
        badge: '코디네이터',
        desc: '지역사회 보건소·장기요양 원클릭 연계',
      },
    ],
  },
  {
    id: 'public_service',
    title: '5. 국민서비스',
    icon: Users,
    desc: '응급실·소아과 찾기 & 모바일 안심 알림',
    items: [
      {
        id: 'citizen_view',
        label: '일반국민 공공병원 맞춤뷰',
        icon: UserCheck,
        badge: '국민안심',
        desc: '응급실·소아과 찾기 & 모바일 퇴원 알림',
      },
    ],
  },
  {
    id: 'my_hospital',
    title: '6. MY의료기관',
    icon: HeartHandshake,
    desc: '소속 기관 KPI·AI 병목진단·특화 Q&A',
    items: [
      {
        id: 'my_hospital',
        label: '우리 의료기관 대시보드',
        icon: HeartHandshake,
        badge: '기관특화',
        desc: '병상·인력·수지 4대 KPI & 현장 Q&A',
      },
    ],
  },
];

interface 메인_사이드바_네비게이션_속성 {
  active_menu: 메뉴_아이디;
  on_select_menu: (menu_id: 메뉴_아이디) => void;
  on_open_upload_modal: () => void;
  on_load_sample_data: () => void;
  on_download_nmc_excel: () => void;
  on_open_grounding_modal: () => void;
  on_open_key_modal: () => void;
  google_api_key_registered: boolean;
  data_go_kr_key_registered?: boolean;
  on_open_data_go_kr_modal?: () => void;
  selected_region_name?: string;
  selected_region_grade?: string;
  is_hidden?: boolean;
  on_toggle_hide?: () => void;
}

export const 메인_사이드바_네비게이션: React.FC<메인_사이드바_네비게이션_속성> = ({
  active_menu,
  on_select_menu,
  on_open_upload_modal,
  on_load_sample_data,
  on_download_nmc_excel,
  on_open_grounding_modal,
  on_open_key_modal,
  google_api_key_registered,
  data_go_kr_key_registered = false,
  on_open_data_go_kr_modal,
  selected_region_name = '강원도 영월군',
  selected_region_grade = '심각',
  is_hidden = false,
  on_toggle_hide,
}) => {
  const [is_mobile_open, set_is_mobile_open] = useState(false);

  // 모든 6대 대메뉴 기본 확장 상태로 초기화
  const [expanded_categories, set_expanded_categories] = useState<Record<string, boolean>>({
    status_diag: true,
    ai_analysis: true,
    policy_plan: true,
    field_manage: true,
    public_service: true,
    my_hospital: true,
  });

  // 활성화된 메뉴가 속한 카테고리는 항상 열려있도록 보장
  useEffect(() => {
    const parent_cat = SIX_MAIN_CATEGORIES.find((cat) =>
      cat.items.some((item) => item.id === active_menu)
    );
    if (parent_cat) {
      set_expanded_categories((prev) => ({
        ...prev,
        [parent_cat.id]: true,
      }));
    }
  }, [active_menu]);

  const toggle_category = (cat_id: string) => {
    set_expanded_categories((prev) => ({
      ...prev,
      [cat_id]: !prev[cat_id],
    }));
  };

  const handle_menu_click = (id: 메뉴_아이디) => {
    on_select_menu(id);
    set_is_mobile_open(false);
  };

  return (
    <>
      {/* 모바일 상단 바 (모바일에서만 표시) */}
      <div className="lg:hidden sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-black/[0.06] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => set_is_mobile_open(true)}
            className="p-1.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-2">
            {/* 1. 아이콘 파랑색 수정 */}
            <div className="w-7 h-7 rounded-lg bg-[#0071e3] text-white flex items-center justify-center shadow-sm">
              <Activity className="w-4 h-4 text-white" />
            </div>
            {/* 3. 모바일 타이틀 수정 */}
            <span className="text-xs font-bold text-[#1d1d1f] truncate max-w-[180px]">
              공공의료 정책의사결정지원 AI 플랫폼
            </span>
          </div>
        </div>

        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#0071e3]/10 text-[#0071e3]">
          20260918 v0.24
        </span>
      </div>

      {/* 모바일 드로어 오버레이 */}
      {is_mobile_open && (
        <div
          onClick={() => set_is_mobile_open(false)}
          className="lg:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-xs animate-in fade-in"
        />
      )}

      {/* 좌측 사이드바 본체 */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 bg-white border-r border-black/[0.06] flex flex-col justify-between transition-all duration-300 ease-in-out shadow-lg lg:shadow-none ${
          is_mobile_open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${
          is_hidden
            ? 'lg:w-0 lg:min-w-0 lg:-ml-84 lg:overflow-hidden lg:opacity-0 lg:pointer-events-none'
            : 'lg:w-84 lg:min-w-[336px]'
        }`}
      >
        {/* 상단: 플랫폼 로고 및 헤더 */}
        <div className="p-4 sm:p-5 border-b border-black/[0.05]">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 min-w-0">
              {/* 1. 아이콘 파랑색 수정 (#0071e3) */}
              <div className="w-11 h-11 rounded-xl bg-[#0071e3] text-white flex items-center justify-center shadow-apple-sm shrink-0">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                {/* 2. 국립중앙의료원 지원센터 삭제 및 배지만 유지 */}
                <div className="flex items-center space-x-1.5 mb-0.5">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-[#0071e3]/10 text-[#0071e3]">
                    20260918 v0.24
                  </span>
                </div>
                {/* 3. 타이틀 수정: 공공의료 정책의사결정지원 AI 플랫폼 */}
                <h1 className="text-[14.5px] font-extrabold tracking-tight text-[#1d1d1f] leading-snug">
                  공공의료 정책의사결정지원 AI 플랫폼
                </h1>
              </div>
            </div>

            <div className="flex items-center space-x-1 shrink-0 ml-1">
              {/* 데스크톱 사이드바 접기/숨기기 버튼 */}
              {on_toggle_hide && (
                <button
                  onClick={on_toggle_hide}
                  className="hidden lg:flex p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                  title="사이드바 메뉴 숨기기 (화면 넓게 보기)"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}

              {/* 모바일 닫기 버튼 */}
              <button
                onClick={() => set_is_mobile_open(false)}
                className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* 현재 선택된 진단 지역 간이 카드 */}
          <div className="mt-3.5 p-3 rounded-xl bg-[#f5f5f7] border border-black/[0.04] flex items-center justify-between text-base">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-[#0071e3] shrink-0" />
              <span className="font-bold text-slate-800">{selected_region_name}</span>
            </div>
            <span
              className={`px-2.5 py-1 rounded-lg text-xs font-extrabold ${
                selected_region_grade === '심각'
                  ? 'bg-rose-500 text-white'
                  : selected_region_grade === '경고'
                  ? 'bg-amber-500 text-white'
                  : 'bg-emerald-500 text-white'
              }`}
            >
              {selected_region_grade} 취약지
            </span>
          </div>
        </div>

        {/* 중앙: 6대 메인 메뉴 및 하위 메뉴 리스트 (1~6번 테두리선 진하게 강조) */}
        <div className="flex-1 overflow-y-auto px-3 py-3.5 space-y-3.5">
          {SIX_MAIN_CATEGORIES.map((main_cat) => {
            const is_expanded = expanded_categories[main_cat.id] ?? true;
            const MainIcon = main_cat.icon;
            const has_active_child = main_cat.items.some((it) => it.id === active_menu);

            return (
              <div
                key={main_cat.id}
                className={`rounded-2xl border-2 transition-all ${
                  has_active_child
                    ? 'border-[#0071e3] bg-blue-50/20 dark:bg-blue-950/20 shadow-md ring-2 ring-[#0071e3]/15'
                    : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 shadow-xs hover:border-slate-400 dark:hover:border-slate-500'
                }`}
              >
                {/* 1계층: 6대 대메뉴 헤더 (명확한 타이틀 바) */}
                <button
                  type="button"
                  onClick={() => toggle_category(main_cat.id)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-t-xl transition text-left cursor-pointer select-none ${
                    has_active_child
                      ? 'bg-blue-50/70 dark:bg-blue-950/40 text-[#0071e3] font-bold'
                      : 'bg-slate-50/80 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 hover:bg-slate-100/80 font-bold'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                        has_active_child
                          ? 'bg-[#0071e3] text-white shadow-xs'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold border border-slate-300 dark:border-slate-600'
                      }`}
                    >
                      <MainIcon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[13.5px] tracking-tight truncate flex items-center gap-1.5 font-bold">
                        <span>{main_cat.title}</span>
                        <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600">
                          {main_cat.items.length}
                        </span>
                      </div>
                    </div>
                  </div>

                  <ChevronDown
                    className={`w-4 h-4 text-slate-500 transition-transform duration-200 shrink-0 ml-1 ${
                      is_expanded ? 'rotate-180 text-slate-700 dark:text-slate-300' : ''
                    }`}
                  />
                </button>

                {/* 2계층: 하위 메뉴 리스트 */}
                {is_expanded && (
                  <div className="px-2 pb-2.5 pt-1.5 space-y-1 border-t-2 border-slate-200 dark:border-slate-700/80">
                    {main_cat.items.map((sub_item) => {
                      const is_active = active_menu === sub_item.id;
                      const SubIcon = sub_item.icon;

                      return (
                        <button
                          key={sub_item.id}
                          onClick={() => handle_menu_click(sub_item.id)}
                          className={`w-full text-left pl-3 pr-2.5 py-2 rounded-xl flex items-center justify-between transition-all group ${
                            is_active
                              ? 'bg-[#0071e3] text-white shadow-apple-sm font-bold ring-1 ring-[#0071e3]'
                              : 'text-slate-700 hover:bg-slate-100/80 font-medium'
                          }`}
                        >
                          <div className="flex items-center space-x-2.5 min-w-0">
                            {/* 서브 불릿 또는 아이콘 */}
                            <SubIcon
                              className={`w-4 h-4 shrink-0 transition-colors ${
                                is_active
                                  ? 'text-white'
                                  : 'text-slate-400 group-hover:text-[#0071e3]'
                              }`}
                            />
                            <div className="min-w-0">
                              <div className="text-[13px] truncate leading-snug">
                                {sub_item.label}
                              </div>
                              <div
                                className={`text-[11px] truncate leading-tight mt-0.5 ${
                                  is_active ? 'text-white/80' : 'text-slate-400'
                                }`}
                              >
                                {sub_item.desc}
                              </div>
                            </div>
                          </div>

                          {sub_item.badge && (
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0 ml-1.5 ${
                                is_active
                                  ? 'bg-white/25 text-white'
                                  : 'bg-slate-100 text-slate-500'
                              }`}
                            >
                              {sub_item.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 하단: 퀵 액션 툴바 */}
        <div className="p-3.5 bg-slate-50 border-t border-black/[0.05] space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={on_open_upload_modal}
              className="px-2.5 py-2 rounded-xl bg-white border border-black/[0.06] hover:bg-slate-100 text-sm font-bold text-slate-700 flex items-center justify-center gap-1.5 transition shadow-xs"
              title="지자체 데이터 엑셀/CSV 업로드"
            >
              <Upload className="w-4 h-4 text-[#0071e3]" />
              <span>데이터 업로드</span>
            </button>

            <button
              onClick={on_download_nmc_excel}
              className="px-2.5 py-2 rounded-xl bg-white border border-black/[0.06] hover:bg-slate-100 text-sm font-bold text-slate-700 flex items-center justify-center gap-1.5 transition shadow-xs"
              title="국립중앙의료원 3종 크로스탭 엑셀 다운로드"
            >
              <Download className="w-4 h-4 text-emerald-600" />
              <span>NMC 엑셀</span>
            </button>
          </div>

          <div className="flex items-center justify-between gap-1.5 pt-1">
            <button
              onClick={on_open_grounding_modal}
              className="flex-1 py-2 px-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-sm font-bold flex items-center justify-center gap-1 border border-emerald-200/60 transition"
              title="법령·고시 원문 대조 신뢰 뷰"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>원문 대조</span>
            </button>

            <button
              onClick={on_open_key_modal}
              className={`py-2 px-2 rounded-xl text-sm font-bold flex items-center justify-center gap-1 border transition ${
                google_api_key_registered
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-black/[0.06]'
                  : 'bg-amber-100 hover:bg-amber-200 text-amber-900 border-amber-300'
              }`}
              title="Google Gemini API 키 관리"
            >
              <Key className="w-4 h-4 text-amber-600" />
              <span>{google_api_key_registered ? 'Google키' : 'Gemini'}</span>
            </button>

            {on_open_data_go_kr_modal && (
              <button
                onClick={on_open_data_go_kr_modal}
                className={`py-2 px-2 rounded-xl text-sm font-bold flex items-center justify-center gap-1 border transition ${
                  data_go_kr_key_registered
                    ? 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200'
                    : 'bg-amber-100 hover:bg-amber-200 text-amber-900 border-amber-300'
                }`}
                title="공공데이터포털(data.go.kr) API 인증키 관리"
              >
                <Database className="w-4 h-4 text-[#0071e3]" />
                <span>{data_go_kr_key_registered ? 'data.go' : '공공키'}</span>
              </button>
            )}

            <button
              onClick={on_load_sample_data}
              className="p-2 rounded-xl bg-white border border-black/[0.06] hover:bg-slate-100 text-slate-600 transition"
              title="샘플 데이터 초기화"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
