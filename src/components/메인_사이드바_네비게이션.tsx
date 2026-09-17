'use client';

import React, { useState } from 'react';
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
  Menu,
  X,
  Sparkles,
  Layers,
  Key,
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
  | 'citizen_view';

interface 사이드바_메뉴_항목 {
  id: 메뉴_아이디;
  label: string;
  icon: React.ElementType;
  badge?: string;
  desc: string;
}

interface 사이드바_카테고리 {
  category: string;
  items: 사이드바_메뉴_항목[];
}

const MENU_CATEGORIES: 사이드바_카테고리[] = [
  {
    category: '핵심 진단 & GIS',
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
    ],
  },
  {
    category: 'AI 에이전트 & 정책 기획',
    items: [
      {
        id: 'dual_ai_studio',
        label: '듀얼 AI 스튜디오 (Gemini × sLLM)',
        icon: Bot,
        badge: 'Dual AI',
        desc: '외부 클라우드 vs 로컬 sLLM 1:1 비교',
      },
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
    category: '현장 연계 & 경영 모니터링',
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
      {
        id: 'compare_1to1',
        label: '지자체 1:1 비교 대시보드',
        icon: GitCompare,
        desc: '전국 2개 지자체 인프라 정밀 비교',
      },
      {
        id: 'demand_forecast',
        label: '2030 의료수요 추계',
        icon: TrendingUp,
        desc: '고령화 시계열 예측 & 시도 벤치마킹',
      },
    ],
  },
  {
    category: '대국민 안심 서비스',
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
  selected_region_name?: string;
  selected_region_grade?: string;
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
  selected_region_name = '강원도 영월군',
  selected_region_grade = '심각',
}) => {
  const [is_mobile_open, set_is_mobile_open] = useState(false);

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
            <div className="w-7 h-7 rounded-lg bg-[#1d1d1f] text-white flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-[#1d1d1f]">필수의료 헬스맵</span>
          </div>
        </div>

        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#0071e3]/10 text-[#0071e3]">
          2026.09.17 v0.23
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
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 w-72 bg-white border-r border-black/[0.06] flex flex-col justify-between transition-transform duration-300 ease-in-out shadow-lg lg:shadow-none ${
          is_mobile_open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* 상단: 플랫폼 로고 및 헤더 */}
        <div className="p-4 border-b border-black/[0.05]">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-b from-[#1d1d1f] to-[#2d2d30] text-white flex items-center justify-center shadow-apple-sm">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="text-[10px] font-semibold text-[#86868b] tracking-tight">
                    국립중앙의료원 지원센터
                  </span>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-[#0071e3]/10 text-[#0071e3]">
                    v0.23
                  </span>
                </div>
                <h1 className="text-sm font-bold tracking-tight text-[#1d1d1f]">
                  필수의료 취약지 헬스맵
                </h1>
              </div>
            </div>

            <button
              onClick={() => set_is_mobile_open(false)}
              className="lg:hidden p-1 rounded-lg text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 현재 선택된 진단 지역 간이 카드 */}
          <div className="mt-3 p-2.5 rounded-xl bg-[#f5f5f7] border border-black/[0.04] flex items-center justify-between text-xs">
            <div className="flex items-center space-x-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#0071e3]" />
              <span className="font-bold text-slate-800">{selected_region_name}</span>
            </div>
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
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

        {/* 중앙: 기능 네비게이션 메뉴 리스트 (스크롤 가능) */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
          {MENU_CATEGORIES.map((cat, c_idx) => (
            <div key={c_idx} className="space-y-1">
              <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#86868b]">
                {cat.category}
              </div>

              <div className="space-y-0.5">
                {cat.items.map((item) => {
                  const is_active = active_menu === item.id;
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.id}
                      onClick={() => handle_menu_click(item.id)}
                      className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center justify-between transition-all group ${
                        is_active
                          ? 'bg-[#0071e3] text-white shadow-apple-sm font-bold'
                          : 'text-[#1d1d1f] hover:bg-[#f5f5f7] font-medium'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <Icon
                          className={`w-4 h-4 shrink-0 transition-colors ${
                            is_active ? 'text-white' : 'text-[#86868b] group-hover:text-[#0071e3]'
                          }`}
                        />
                        <div className="truncate">
                          <div className="text-xs truncate">{item.label}</div>
                          <div
                            className={`text-[10px] truncate ${
                              is_active ? 'text-white/80' : 'text-[#86868b]'
                            }`}
                          >
                            {item.desc}
                          </div>
                        </div>
                      </div>

                      {item.badge && (
                        <span
                          className={`px-1.5 py-0.5 rounded text-[9px] font-bold shrink-0 ml-1.5 ${
                            is_active
                              ? 'bg-white/20 text-white'
                              : 'bg-black/[0.05] text-[#86868b]'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* 하단: 퀵 액션 툴바 */}
        <div className="p-3 bg-slate-50 border-t border-black/[0.05] space-y-1.5">
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={on_open_upload_modal}
              className="px-2 py-1.5 rounded-xl bg-white border border-black/[0.06] hover:bg-slate-100 text-[11px] font-semibold text-slate-700 flex items-center justify-center gap-1 transition shadow-xs"
              title="지자체 데이터 엑셀/CSV 업로드"
            >
              <Upload className="w-3.5 h-3.5 text-[#0071e3]" />
              <span>데이터 업로드</span>
            </button>

            <button
              onClick={on_download_nmc_excel}
              className="px-2 py-1.5 rounded-xl bg-white border border-black/[0.06] hover:bg-slate-100 text-[11px] font-semibold text-slate-700 flex items-center justify-center gap-1 transition shadow-xs"
              title="국립중앙의료원 3종 크로스탭 엑셀 다운로드"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>NMC 엑셀</span>
            </button>
          </div>

          <div className="flex items-center justify-between gap-1 pt-1">
            <button
              onClick={on_open_grounding_modal}
              className="flex-1 py-1.5 px-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center justify-center gap-1 border border-emerald-200/60 transition"
              title="법령·고시 원문 대조 신뢰 뷰"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>원문 대조 뷰</span>
            </button>

            <button
              onClick={on_open_key_modal}
              className={`py-1.5 px-2 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1 border transition ${
                google_api_key_registered
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-black/[0.06]'
                  : 'bg-amber-100 hover:bg-amber-200 text-amber-900 border-amber-300'
              }`}
              title="Google Gemini API 키 관리"
            >
              <Key className="w-3.5 h-3.5 text-amber-600" />
              <span>{google_api_key_registered ? 'Google키' : '키입력'}</span>
            </button>

            <button
              onClick={on_load_sample_data}
              className="p-1.5 rounded-xl bg-white border border-black/[0.06] hover:bg-slate-100 text-slate-600 transition"
              title="샘플 데이터 초기화"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
