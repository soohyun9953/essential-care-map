'use client';

// 공공의료 지능형 통합포털 관문: 3대 페르소나(중앙정책가, 지역코디네이터, 일반국민) 맞춤형 전환 스위처

import React from 'react';
import { Building2, Stethoscope, Users, Sparkles, ChevronRight } from 'lucide-react';
import { 페르소나_역할 } from '@/lib/필수의료_타입';

interface 페르소나_관문_네비게이션_속성 {
  current_persona: 페르소나_역할;
  on_change_persona: (role: 페르소나_역할) => void;
  on_open_grounding_modal?: () => void;
}

export const 페르소나_관문_네비게이션: React.FC<페르소나_관문_네비게이션_속성> = ({
  current_persona,
  on_change_persona,
  on_open_grounding_modal,
}) => {
  const personas: {
    role: 페르소나_역할;
    label: string;
    sublabel: string;
    icon: React.ElementType;
    badge: string;
    badgeColor: string;
    desc: string;
  }[] = [
    {
      role: '중앙정책가',
      label: '중앙 정책·운영 뷰',
      sublabel: '국립중앙의료원 / 보건복지부',
      icon: Building2,
      badge: '중앙 정책 & 경영 모니터링',
      badgeColor: 'bg-[#0071e3]/10 text-[#0071e3]',
      desc: '70개 중진료권 헬스맵, 35개 지방의료원 경영위기 조기경보, 공공의료계획 작성 AI',
    },
    {
      role: '지역코디네이터',
      label: '지역 책임의료기관 뷰',
      sublabel: '지방의료원 공공의료본부',
      icon: Stethoscope,
      badge: '진료협력 & 돌봄연계',
      badgeColor: 'bg-[#af52de]/10 text-[#af52de]',
      desc: '퇴원환자 케어플랜 수립, 지역사회 돌봄자원 AI 매칭, 원문 대조 신뢰 뷰',
    },
    {
      role: '일반국민',
      label: '일반 국민·환자 뷰',
      sublabel: '공공의료 안심 알리미',
      icon: Users,
      badge: '대국민 안심 서비스',
      badgeColor: 'bg-[#34c759]/10 text-[#34c759]',
      desc: '내 주변 안심 공공병원 찾기, 모바일 퇴원돌봄 안내, 응급·소아 진료정보',
    },
  ];

  return (
    <section className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2">
      <div className="bg-gradient-to-r from-slate-900 via-[#1d1d1f] to-slate-900 text-white p-4 sm:p-5 rounded-3xl shadow-apple-card border border-white/10 space-y-4">
        {/* 상단 안내 바 */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div className="flex items-center space-x-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#34c759] animate-pulse" />
            <span className="text-xs font-semibold tracking-wider text-[#86868b] uppercase">
              공공의료 AI 지능형 통합포털 라이브 데모 관문
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#0071e3] text-white">
              인터랙티브 시연 모드
            </span>
          </div>

          <div className="flex items-center space-x-3">
            {on_open_grounding_modal && (
              <button
                onClick={on_open_grounding_modal}
                className="inline-flex items-center space-x-1.5 px-3 py-1 text-xs font-medium bg-white/10 hover:bg-white/20 text-white rounded-full transition border border-white/15 active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#ff9500]" />
                <span>🛡️ 환각 제로 원문 대조 뷰</span>
                <ChevronRight className="w-3 h-3 text-white/60" />
              </button>
            )}
            <span className="text-xs text-white/60 hidden sm:inline">
              역할을 선택하면 화면 인터페이스가 동적으로 재구성됩니다
            </span>
          </div>
        </div>

        {/* 3대 페르소나 카드 선택 버튼 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {personas.map((item) => {
            const is_active = current_persona === item.role;
            const IconComponent = item.icon;

            return (
              <button
                key={item.role}
                onClick={() => on_change_persona(item.role)}
                className={`text-left p-3.5 sm:p-4 rounded-2xl transition-all duration-200 border relative overflow-hidden group ${
                  is_active
                    ? 'bg-white text-[#1d1d1f] border-white shadow-apple-card scale-[1.01]'
                    : 'bg-white/5 hover:bg-white/10 text-white border-white/10'
                }`}
              >
                {/* 활성 인디케이터 바 */}
                {is_active && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#0071e3] to-[#af52de]" />
                )}

                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center space-x-2.5">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center transition ${
                        is_active
                          ? 'bg-[#0071e3] text-white'
                          : 'bg-white/10 text-white/80 group-hover:text-white'
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className={`text-sm font-bold tracking-tight ${is_active ? 'text-[#1d1d1f]' : 'text-white'}`}>
                        {item.label}
                      </h4>
                      <p className={`text-[11px] ${is_active ? 'text-[#86868b]' : 'text-white/60'}`}>
                        {item.sublabel}
                      </p>
                    </div>
                  </div>

                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                </div>

                <p className={`text-xs mt-2.5 line-clamp-2 leading-relaxed ${is_active ? 'text-slate-600' : 'text-white/70'}`}>
                  {item.desc}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
