'use client';

// 대국민 접점: 일반 국민·환자 맞춤형 공공의료 포털 및 모바일 퇴원돌봄 안심 알리미 뷰

import React, { useState } from 'react';
import {
  Users,
  Search,
  Building2,
  Phone,
  Clock,
  Bell,
  Heart,
  ShieldCheck,
  MapPin,
  Calendar,
  Pill,
} from 'lucide-react';
import { 필수의료_진단_결과 } from '@/lib/필수의료_타입';

interface 일반국민_뷰_속성 {
  selected_region?: 필수의료_진단_결과 | null;
}

export const 일반국민_공공병원_맞춤뷰: React.FC<일반국민_뷰_속성> = ({ selected_region }) => {
  const [alarm_active, set_alarm_active] = useState(true);

  const region_name = selected_region ? `${selected_region.시도명} ${selected_region.시군구명}` : '강원특별자치도 영월군';

  return (
    <div className="space-y-6">
      {/* 국민 뷰 히어로 배너 */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white p-6 sm:p-7 rounded-3xl shadow-apple-card space-y-3">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold backdrop-blur-md">
          <Heart className="w-3.5 h-3.5 fill-current" />
          <span>공공의료 안심동행 서비스</span>
        </div>
        <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
          내 주변 안심 공공병원과 퇴원 후 맞춤 돌봄을 연결합니다
        </h3>
        <p className="text-xs sm:text-sm text-white/80 max-w-2xl leading-relaxed">
          국민 누구나 내가 사는 지역의 믿을 수 있는 공공병원 정보, 심야 소아과 및 달빛어린이병원 위치,
          퇴원 후 보건소 방문간호와 도시락 돌봄 알림을 스마트폰 하나로 확인하세요.
        </p>
      </div>

      {/* 2단 구성: 공공병원 찾기 (좌) + 모바일 안심돌봄 알리미 시뮬레이터 (우) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* 좌측: 내 지역 안심 공공병원 목록 (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-black/[0.05] shadow-apple-card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-black/[0.05]">
            <div className="flex items-center space-x-2">
              <Building2 className="w-5 h-5 text-[#0071e3]" />
              <h4 className="font-bold text-sm sm:text-base text-[#1d1d1f]">
                {region_name} 인근 공공의료기관 &amp; 안심 진료처
              </h4>
            </div>
            <span className="text-xs text-[#0071e3] font-semibold bg-[#0071e3]/10 px-2.5 py-1 rounded-full">
              보건복지부 인증기관
            </span>
          </div>

          <div className="space-y-3">
            {/* 영월의료원 카드 */}
            <div className="p-4 rounded-2xl bg-[#fbfbfd] border border-black/[0.04] space-y-2.5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#0071e3] text-white">
                      지역책임의료기관
                    </span>
                    <span className="text-xs font-bold text-[#1d1d1f]">강원특별자치도 영월의료원</span>
                  </div>
                  <p className="text-xs text-[#86868b] mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#86868b]" />
                    <span>영월군 영월읍 중앙로 59</span>
                  </p>
                </div>
                <span className="text-xs font-bold text-[#34c759] flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#34c759]" />
                  <span>24시간 응급실 운영</span>
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs bg-white p-2.5 rounded-xl border border-black/[0.04]">
                <div>
                  <span className="text-[10px] text-[#86868b] block">간호간병통합</span>
                  <strong className="text-[#1d1d1f]">전 병동 운영</strong>
                </div>
                <div>
                  <span className="text-[10px] text-[#86868b] block">인공신장실</span>
                  <strong className="text-[#0071e3]">혈액투석 가능</strong>
                </div>
                <div>
                  <span className="text-[10px] text-[#86868b] block">대표전화</span>
                  <strong className="text-[#1d1d1f]">033-370-9114</strong>
                </div>
              </div>
            </div>

            {/* 영월군보건소 카드 */}
            <div className="p-4 rounded-2xl bg-[#fbfbfd] border border-black/[0.04] space-y-2.5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                      공공보건기관
                    </span>
                    <span className="text-xs font-bold text-[#1d1d1f]">영월군보건소 (만성질환·치매안심센터)</span>
                  </div>
                  <p className="text-xs text-[#86868b] mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#86868b]" />
                    <span>영월군 영월읍 하송로 64</span>
                  </p>
                </div>
                <span className="text-xs font-semibold text-slate-600">평일 09:00 ~ 18:00</span>
              </div>

              <p className="text-xs text-slate-700 bg-white p-2.5 rounded-xl border border-black/[0.04]">
                💡 65세 이상 어르신 무료 독감 예방접종, 고혈압·당뇨 등록관리, 거동불편 환자 방문건강관리 상담 가능
              </p>
            </div>
          </div>
        </div>

        {/* 우측: 모바일 퇴원돌봄 안심 알리미 스마트폰 목업 시뮬레이터 (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-black/[0.05] shadow-apple-card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-black/[0.05]">
            <div className="flex items-center space-x-2">
              <Bell className="w-5 h-5 text-[#af52de]" />
              <h4 className="font-bold text-sm sm:text-base text-[#1d1d1f]">
                모바일 퇴원돌봄 안심 알리미
              </h4>
            </div>
            <span className="text-[11px] text-[#86868b]">환자·보호자 스마트폰 화면</span>
          </div>

          {/* 모바일 화면 프레임 */}
          <div className="bg-slate-900 text-white p-5 rounded-3xl space-y-3.5 shadow-2xl border border-slate-700 max-w-sm mx-auto">
            {/* 스마트폰 상단 시간 표시 */}
            <div className="flex items-center justify-between text-[11px] text-slate-400 pb-1 border-b border-slate-800">
              <span>오전 09:30</span>
              <span>5G 100%</span>
            </div>

            {/* 알림톡 카드 1: 퇴원 후 방문간호 */}
            <div className="bg-slate-800/90 p-3.5 rounded-2xl border border-slate-700 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                  <Pill className="w-3 h-3" />
                  <span>[공공의료 안심케어 알림]</span>
                </span>
                <span className="text-[9px] text-slate-400">오늘</span>
              </div>
              <p className="text-xs font-bold text-white">김공공 어르신, 아침 약 복용 시간입니다</p>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                혈압약 및 뇌졸중 2차 예방약 1포를 식후 30분 이내 복용해 주세요.
              </p>
            </div>

            {/* 알림톡 카드 2: 보건소 방문 일정 */}
            <div className="bg-slate-800/90 p-3.5 rounded-2xl border border-slate-700 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-cyan-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>[방문재활 안내]</span>
                </span>
                <span className="text-[9px] text-slate-400">내일 14:00</span>
              </div>
              <p className="text-xs font-bold text-white">영월군보건소 전담 물리치료사 방문 예정</p>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                우측 편마비 보행 재활운동 및 낙상방지 환경 점검이 예정되어 있습니다.
              </p>
            </div>

            {/* 알림톡 카드 3: 복지관 도시락 배달 */}
            <div className="bg-slate-800/90 p-3.5 rounded-2xl border border-slate-700 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-amber-400 flex items-center gap-1">
                  <Heart className="w-3 h-3" />
                  <span>[생활돌봄]</span>
                </span>
                <span className="text-[9px] text-slate-400">오늘 11:30</span>
              </div>
              <p className="text-xs font-bold text-white">영월종합사회복지관 따뜻한 점심 도시락 배달</p>
            </div>

            <div className="pt-1 text-center">
              <span className="text-[10px] text-slate-400">
                국립중앙의료원 공공보건의료 통합알리미 발송
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
