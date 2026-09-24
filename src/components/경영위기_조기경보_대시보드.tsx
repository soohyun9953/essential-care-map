'use client';

// 공공병원 성과 모니터링·평가: 35개 지방의료원 성과평가 매트릭스 및 경영위기 조기경보(Early Warning) 대시보드

import React, { useState } from 'react';
import {
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Building2,
  ShieldAlert,
  Sparkles,
  ArrowRight,
  Filter,
  CheckCircle2,
} from 'lucide-react';
import { 지방의료원_경영지표 } from '@/lib/필수의료_타입';

const SAMPLE_HOSPITAL_METRICS: 지방의료원_경영지표[] = [
  {
    병원코드: 'H-GW-01',
    병원명: '강원특별자치도 영월의료원',
    중진료권명: '영월진료권',
    병상수: 198,
    병상가동률: 64.2,
    표준진료지침_CP적용률: 78.5,
    의사인력_충원율: 68.0,
    월간외래_환자변화율: -18.4,
    위기등급: '경고',
    조기경보메시지: '최근 3개월간 외래 환자수 18.4% 급감 및 필수의료 전문의 이탈 감지',
    AI권고사항:
      '소아청소년과 당직 공백으로 인한 소아·가족 환자 원주 권역 유출 가속. 취약지 지역의사 파견 지원사업 즉시 연계 권고.',
  },
  {
    병원코드: 'H-GN-02',
    병원명: '경상남도 거창적십자병원',
    중진료권명: '거창권',
    병상수: 120,
    병상가동률: 58.1,
    표준진료지침_CP적용률: 62.0,
    의사인력_충원율: 62.5,
    월간외래_환자변화율: -14.2,
    위기등급: '경고',
    조기경보메시지: '중증응급 전원율 전년 대비 +8.6%p 증가 (자체완결 역량 저하)',
    AI권고사항: '응급실 인공호흡기 및 응급의학과 전문의 확충 위한 기능보강 국비 우선 신청 대상.',
  },
  {
    병원코드: 'H-JN-03',
    병원명: '전라남도 순천의료원',
    중진료권명: '순천권',
    병상수: 260,
    병상가동률: 82.4,
    표준진료지침_CP적용률: 91.2,
    의사인력_충원율: 92.0,
    월간외래_환자변화율: +4.8,
    위기등급: '정상',
    조기경보메시지: '3대 필수의료 자체충족률 양호 및 경영수지 균형 유지',
    AI권고사항: '지역책임의료기관 우수 거점병원 모델 확산 대상.',
  },
  {
    병원코드: 'H-CB-04',
    병원명: '충청북도 제천명지병원 (공공연계)',
    중진료권명: '제천권',
    병상수: 205,
    병상가동률: 71.0,
    표준진료지침_CP적용률: 74.0,
    의사인력_충원율: 75.0,
    월간외래_환자변화율: -5.1,
    위기등급: '주의',
    조기경보메시지: '간호등급 하락 우려 및 수술 환자 비율 정체',
    AI권고사항: '간호간병통합서비스 병상 확대 지원을 통한 입원 환자 수급 안정화 필요.',
  },
];

interface 경영위기_조기경보_대시보드_속성 {
  on_open_grounding?: () => void;
}

export const 경영위기_조기경보_대시보드: React.FC<경영위기_조기경보_대시보드_속성> = ({
  on_open_grounding,
}) => {
  const [selected_filter, set_selected_filter] = useState<'전체' | '경고' | '주의' | '정상'>('전체');

  const filtered_list = SAMPLE_HOSPITAL_METRICS.filter((item) =>
    selected_filter === '전체' ? true : item.위기등급 === selected_filter
  );

  const get_grade_badge = (grade: 지방의료원_경영지표['위기등급']) => {
    switch (grade) {
      case '심각':
      case '경고':
        return 'bg-[#ff3b30]/10 dark:bg-rose-950/40 text-[#ff3b30] dark:text-rose-400 border-[#ff3b30]/25 dark:border-rose-800/50';
      case '주의':
        return 'bg-[#ff9500]/10 dark:bg-amber-950/40 text-[#ff9500] dark:text-amber-400 border-[#ff9500]/25 dark:border-amber-800/50';
      case '정상':
        return 'bg-[#34c759]/10 dark:bg-emerald-950/40 text-[#34c759] dark:text-emerald-400 border-[#34c759]/25 dark:border-emerald-800/50';
    }
  };

  return (
    <div className="bg-white dark:bg-[#15161b] p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#ff3b30] to-[#af52de] text-white flex items-center justify-center shadow-apple-sm">
            <ShieldAlert className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-semibold tracking-tight text-slate-500 dark:text-slate-400">
                공공병원 성과 모니터링 &amp; 경영위기 조기경보
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#ff3b30]/10 dark:bg-[#ff3b30]/20 text-[#ff3b30] dark:text-red-400 text-[10px] font-bold">
                Early Warning Engine
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white">
              35개 지방의료원 성과평가 자동 스크리닝 &amp; 위기 조기감지
            </h3>
          </div>
        </div>

        {/* 필터 탭 */}
        <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-full flex items-center space-x-1 text-xs font-semibold">
          {(['전체', '경고', '주의', '정상'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => set_selected_filter(filter)}
              className={`px-3 py-1 rounded-full transition cursor-pointer ${
                selected_filter === filter
                  ? 'bg-slate-900 dark:bg-blue-600 text-white shadow-apple-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* 조기경보 하이라이트 배너 (영월의료원 사례) */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-50 via-amber-50 to-orange-50 dark:from-rose-950/30 dark:via-amber-950/20 dark:to-orange-950/20 border border-[#ff3b30]/20 dark:border-rose-800/40 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff3b30] animate-ping" />
            <span className="text-xs font-bold text-[#ff3b30] dark:text-rose-400 flex items-center gap-1">
              <AlertTriangle className="w-4 h-4" />
              <span>실시간 AI 조기경보 트리거: 강원특별자치도 영월의료원</span>
            </span>
          </div>
          <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">감지일시: 2026-09-16 08:30</span>
        </div>

        <p className="text-xs text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
          ⚠️ <strong>최근 3개월간 외래 환자 수 18.4% 급감 및 필수의료 전문의 결원 감지.</strong>
          소아청소년과 1인 체계의 한계로 평일 야간 외래가 중단되면서, 소아 및 동반 가족 환자층이 원주세브란스로 연쇄 유출되고 있습니다.
        </p>

        <div className="pt-2 border-t border-black/[0.05] dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center space-x-1 text-[#0071e3] dark:text-blue-400 font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI 맞춤 처방: 의료취약지 공공임상교수 파견 쿼터 즉시 배정 권고</span>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">국립중앙의료원 공공보건의료지원센터 자동 보고 완료</span>
        </div>
      </div>

      {/* 지방의료원 성과평가 테이블 */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
        <table className="w-full text-left text-xs text-slate-800 dark:text-slate-200">
          <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="py-3 px-4">지방의료원명</th>
              <th className="py-3 px-3">관할 진료권</th>
              <th className="py-3 px-3">병상가동률</th>
              <th className="py-3 px-3">CP 적용률</th>
              <th className="py-3 px-3">의사 충원율</th>
              <th className="py-3 px-3">외래 환자 추이</th>
              <th className="py-3 px-3 text-center">위기 등급</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filtered_list.map((h) => (
              <tr key={h.병원코드} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition">
                <td className="py-3 px-4 font-bold flex items-center gap-1.5 text-slate-900 dark:text-white">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>{h.병원명}</span>
                </td>
                <td className="py-3 px-3 text-slate-500 dark:text-slate-400">{h.중진료권명}</td>
                <td className="py-3 px-3 font-semibold">{h.병상가동률}%</td>
                <td className="py-3 px-3 font-semibold text-[#0071e3] dark:text-blue-400">{h.표준진료지침_CP적용률}%</td>
                <td className="py-3 px-3">
                  <span className={`font-semibold ${h.의사인력_충원율 < 70 ? 'text-[#ff3b30] dark:text-rose-400' : 'text-slate-800 dark:text-slate-200'}`}>
                    {h.의사인력_충원율}%
                  </span>
                </td>
                <td className="py-3 px-3 font-semibold">
                  <span
                    className={`inline-flex items-center gap-0.5 ${
                      h.월간외래_환자변화율 < 0 ? 'text-[#ff3b30] dark:text-rose-400' : 'text-[#34c759] dark:text-emerald-400'
                    }`}
                  >
                    {h.월간외래_환자변화율 < 0 ? <TrendingDown className="w-3.5 h-3.5" /> : <TrendingUp className="w-3.5 h-3.5" />}
                    <span>{h.월간외래_환자변화율 > 0 ? `+${h.월간외래_환자변화율}` : h.월간외래_환자변화율}%</span>
                  </span>
                </td>
                <td className="py-3 px-3 text-center">
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${get_grade_badge(h.위기등급)}`}>
                    {h.위기등급}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
