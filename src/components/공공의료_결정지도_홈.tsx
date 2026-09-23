'use client';

import React, { useState } from 'react';
import {
  Search,
  Activity,
  ShieldAlert,
  Heart,
  Baby,
  Sparkles,
  Droplet,
  Brain,
  UserCheck,
  Bed,
  MapPin,
  ChevronRight,
  Building2,
  Navigation,
  ShieldCheck,
  Award,
  ArrowRight,
  TrendingUp,
  Clock,
  Compass,
} from 'lucide-react';
import {
  의료서비스_코드,
  주요_9대_퀵필터_목록,
  의료서비스_검색_엔진,
} from '@/lib/의료서비스_검색_엔진';

interface 공공의료_결정지도_홈_속성 {
  on_search_submit: (keyword: string, selected_services: 의료서비스_코드[]) => void;
  on_navigate_map: (service?: 의료서비스_코드) => void;
  on_open_guide_modal?: () => void;
}

export const 공공의료_결정지도_홈: React.FC<공공의료_결정지도_홈_속성> = ({
  on_search_submit,
  on_navigate_map,
  on_open_guide_modal,
}) => {
  const [search_input, setSearch_input] = useState('');
  const [selected_tags, setSelected_tags] = useState<의료서비스_코드[]>([]);

  // 퀵필터 클릭 토글
  const handle_filter_click = (code: 의료서비스_코드) => {
    // 즉시 해당 서비스 조건으로 지도 탐색 화면 전환
    on_navigate_map(code);
  };

  const handle_search = (e: React.FormEvent) => {
    e.preventDefault();
    if (!search_input.trim() && selected_tags.length === 0) {
      on_navigate_map();
      return;
    }

    // 자연어 질의 파싱
    const parsed = 의료서비스_검색_엔진.parse_natural_language_search(search_input);
    const combined_services = Array.from(new Set([...selected_tags, ...(parsed.선택된_서비스 || [])]));
    on_search_submit(search_input.trim(), combined_services);
  };

  const get_icon_component = (name: string) => {
    switch (name) {
      case 'Activity': return <Activity className="w-4 h-4" />;
      case 'ShieldAlert': return <ShieldAlert className="w-4 h-4" />;
      case 'Heart': return <Heart className="w-4 h-4" />;
      case 'Baby': return <Baby className="w-4 h-4" />;
      case 'Sparkles': return <Sparkles className="w-4 h-4" />;
      case 'Droplet': return <Droplet className="w-4 h-4" />;
      case 'Brain': return <Brain className="w-4 h-4" />;
      case 'UserCheck': return <UserCheck className="w-4 h-4" />;
      case 'Bed': return <Bed className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 sm:py-12 md:py-16 space-y-12 animate-in fade-in duration-300">
      {/* ============================================================== */}
      {/* 1. 메인 HERO 섹션 */}
      {/* ============================================================== */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/70 border border-blue-200/80 dark:border-blue-800 text-[#0071e3] dark:text-[#2997ff] text-xs font-bold shadow-xs">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>대한민국 공공보건의료 의사결정 지도</span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
          필요한 의료서비스를 찾아보세요
        </h1>

        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          응급실 실시간 가용병상부터 분만·소아·혈액투석·중환자실까지, <br className="hidden sm:inline" />
          내 주변 <strong>214개 공공의료기관</strong>의 진료 역량과 운영 현황을 빠르고 투명하게 비교합니다.
        </p>
      </div>

      {/* ============================================================== */}
      {/* 2. 대형 통합 검색창 */}
      {/* ============================================================== */}
      <div className="max-w-2xl mx-auto">
        <form onSubmit={handle_search} className="relative">
          <div className="flex items-center bg-white dark:bg-[#12141a] rounded-2xl shadow-lg border-2 border-blue-600/40 focus-within:border-blue-600 focus-within:ring-4 focus-within:ring-blue-600/10 p-2 transition-all">
            <Search className="w-5 h-5 text-slate-400 dark:text-slate-500 ml-3 shrink-0" />
            <input
              type="text"
              value={search_input}
              onChange={(e) => setSearch_input(e.target.value)}
              placeholder="지역, 의료기관 또는 의료서비스를 검색하세요"
              className="w-full px-3 py-2.5 text-sm sm:text-base bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
            />
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-sm transition active:scale-95 shrink-0"
            >
              검색하기
            </button>
          </div>
        </form>

        {/* ============================================================== */}
        {/* 3. 9대 Quick Filter 버튼 목록 */}
        {/* ============================================================== */}
        <div className="mt-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
            <span className="font-semibold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              자주 찾는 필수의료 퀵 필터
            </span>
            <span className="text-[11px]">클릭 시 해당 조건으로 지도 바로 이동</span>
          </div>

          <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
            {주요_9대_퀵필터_목록.map((filter) => (
              <button
                key={filter.id}
                type="button"
                onClick={() => handle_filter_click(filter.id)}
                className="group flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-950/30 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 transition-all shadow-xs hover:shadow active:scale-95 cursor-pointer"
              >
                <span className="text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                  {get_icon_component(filter.아이콘_이름)}
                </span>
                <span>{filter.라벨}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 4. 서비스 핵심 가이드 카드 3선 */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-4">
        {/* 카드 1: 의사결정 지도 */}
        <div
          onClick={() => on_navigate_map()}
          className="p-6 rounded-3xl bg-white dark:bg-[#12141a] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-blue-300 dark:hover:border-blue-800 transition-all cursor-pointer group space-y-3"
        >
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-105 transition-transform">
            <Compass className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center justify-between">
              <span>35:65 양방향 의사결정 지도</span>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              좌측 목록과 우측 지도가 실시간으로 동기화되어 원하는 의료자원을 한눈에 비교하고 선택합니다.
            </p>
          </div>
        </div>

        {/* 카드 2: 데이터 신뢰성 & 정부 가이드 */}
        <div
          onClick={on_open_guide_modal}
          className="p-6 rounded-3xl bg-white dark:bg-[#12141a] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-800 transition-all cursor-pointer group space-y-3"
        >
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center justify-between">
              <span>7대 데이터셋 &amp; 5대 사업가이드</span>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              2026 보건복지부 취약지 고시, 심평원 신포괄 지침 및 NMC CP 운영평가 기준을 100% 투명하게 공개합니다.
            </p>
          </div>
        </div>

        {/* 카드 3: 기관 데이터센터 */}
        <div
          onClick={() => on_navigate_map()}
          className="p-6 rounded-3xl bg-white dark:bg-[#12141a] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-800 transition-all cursor-pointer group space-y-3"
        >
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform">
            <Building2 className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center justify-between">
              <span>214개 공공병원 실시간 모니터링</span>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              응급실 가용병상, 중환자실, 소아진료 및 혈액투석 가동 상태를 실시간 연계 데이터로 제공합니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
