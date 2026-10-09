'use client';

// Essential Care Map - AI 정책대안 판단 근거 모달
// 사용자 요구사항 5번: 「왜 이 결과가 나왔나요?」/「판단 근거」
// 1) 핵심 데이터 2) 현재 수치 3) 유사 지역 비교값 4) 미래 예측값 5) 관련 정책자료 6) AI 종합판단 표출

import React from 'react';
import {
  X,
  Sparkles,
  HelpCircle,
  TrendingUp,
  GitCompare,
  FileText,
  Brain,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  Layers,
  Cpu,
} from 'lucide-react';
import { 필수의료_진단_결과 } from '@/lib/필수의료_타입';
import { 전국_시군구_진단_데이터 } from '@/lib/시군구_데이터셋';

export interface 정책_옵션_근거 {
  option_id: 'A' | 'B' | 'C';
  대안명: string;
  핵심분야: string;
  핵심데이터: {
    지표명: string;
    현재수치: string;
    유사지역비교값: string;
    유사지역격차: string;
    미래예측값: string;
  }[];
  관련정책자료: {
    문서명: string;
    조항_근거: string;
    지원내용: string;
  }[];
  AI종합판단: {
    요약: string;
    추론단계: string[];
    최종결론: string;
  };
}

// 전국 시군구 평균 (헬스맵 2024 진단 데이터)
const 전국평균 = (f: (r: (typeof 전국_시군구_진단_데이터)[number]) => number) =>
  Math.round((전국_시군구_진단_데이터.reduce((acc, r) => acc + f(r), 0) / 전국_시군구_진단_데이터.length) * 10) / 10;
const 전국_응급미도달 = 전국평균((r) => r.응급_60분_미도달_인구비율);
const 전국_응급RI = 전국평균((r) => r.관내_응급_의료이용률);
const 전국_분만미도달 = 전국평균((r) => r.분만_60분_미도달_인구비율);
const 전국_분만RI = 전국평균((r) => r.관내_분만율);

const 격차 = (값: number, 기준: number) => {
  const d = Math.round((값 - 기준) * 10) / 10;
  return `전국 평균 대비 ${d > 0 ? '+' : ''}${d}%p`;
};

const 지표 = (지표명: string, 값: number | undefined, 기준: number) => ({
  지표명,
  현재수치: 값 === undefined ? '지역 미선택' : `${값}%`,
  유사지역비교값: `전국 시군구 평균 ${기준}%`,
  유사지역격차: 값 === undefined ? '-' : 격차(값, 기준),
  미래예측값: '내장된 예측 자료 없음',
});

const 응급_정책자료 = [
  {
    문서명: '보건복지부 고시 「응급의료분야 의료취약지 지정」 (제2024-261호)',
    조항_근거: '선정 기준: 응급의료기관 30분 또는 응급의료센터 1시간 내 도달 불가 인구 30% 이상',
    지원내용: '실제 지정 여부는 고시 첨부 지역 목록, 지원 내용·분담 비율은 해당 연도 지침으로 확인',
  },
  {
    문서명: '보건복지부 공공병원 파견 의료인력 인건비 지원사업',
    조항_근거: '파견 인력 인건비 국고 50% (일부 확인)',
    지원내용: '1인당 국고 한도는 연도별로 다르게 보도됨 — 해당 연도 지침 확인',
  },
];

const 분만_정책자료 = [
  {
    문서명: '보건복지부 「분만취약지 지원사업」',
    조항_근거: '60분 내 분만의료 이용률 30% 미만 / 접근 불가 인구 30% 이상 (둘 다 A등급, 하나 B등급)',
    지원내용: '분만산부인과 시설·장비비 10억원(첫해) + 운영비 연 5억원, 외래산부인과 운영비 연 2억원 (국비·지방비 각 50%)',
  },
  {
    문서명: '보건복지부 「달빛어린이병원 운영지침」',
    조항_근거: '평일 18~23시, 휴일 10~18시 최소 운영',
    지원내용: '운영비 연 3,000만원~4억 3,200만원 (운영시간 비례)',
  },
];

/** 선택 지역의 실데이터(헬스맵 2024)로 대안별 판단 근거를 만든다. 규칙 기반 요약이며 AI 추론 결과가 아님. */
export function 정책_근거_생성(option_id: 'A' | 'B' | 'C', region?: 필수의료_진단_결과 | null): 정책_옵션_근거 {
  const r = region ?? undefined;
  const 이름 = r ? `${r.시도명} ${r.시군구명}` : '선택 지역';
  if (option_id === 'C') {
    return {
      option_id: 'C',
      대안명: 'Option C: 분만·소아 안심망 구축형',
      핵심분야: '분만 · 소아 야간',
      핵심데이터: [
        지표('분만기관 60분 미도달 인구비율', r?.분만_60분_미도달_인구비율, 전국_분만미도달),
        지표('분만 관내이용률 (RI)', r?.관내_분만율, 전국_분만RI),
      ],
      관련정책자료: 분만_정책자료,
      AI종합판단: {
        요약: r ? `${이름} 분만 판정: ${r.분만_판정근거}.` : '지역을 선택하면 판정 결과가 표시됩니다.',
        추론단계: [
          `1단계 [현황]: 분만 60분 미도달 ${r ? `${r.분만_60분_미도달_인구비율}%` : '-'}, 분만 관내이용률 ${r ? `${r.관내_분만율}%` : '-'} (헬스맵 2024)`,
          `2단계 [전국 비교]: 전국 시군구 평균 미도달 ${전국_분만미도달}%, 관내이용률 ${전국_분만RI}%`,
          '3단계 [정책 기준]: 분만취약지 등급은 공식 선정 지표(60분 내 분만의료 이용률)로 판단 — 복지부 지역 목록 확인 필요',
        ],
        최종결론: '이 요약은 규칙 기반이며 AI 추론 결과가 아닙니다. 대안의 적합성과 우선순위는 담당자가 판단해야 합니다.',
      },
    };
  }
  const 대안명 = option_id === 'A' ? 'Option A: 응급의료 인프라 강화형' : 'Option B: 광역 전원 연계 강화형';
  return {
    option_id,
    대안명,
    핵심분야: option_id === 'A' ? '응급 · 관내 대응역량' : '응급 · 광역 전원',
    핵심데이터: [
      지표('권역응급 60분 미도달 인구비율', r?.응급_60분_미도달_인구비율, 전국_응급미도달),
      지표('응급 관내이용률 (RI)', r?.관내_응급_의료이용률, 전국_응급RI),
    ],
    관련정책자료: 응급_정책자료,
    AI종합판단: {
      요약: r ? `${이름} 응급 판정: ${r.응급_판정근거}.` : '지역을 선택하면 판정 결과가 표시됩니다.',
      추론단계: [
        `1단계 [현황]: 권역응급 60분 미도달 ${r ? `${r.응급_60분_미도달_인구비율}%` : '-'}, 응급 관내이용률 ${r ? `${r.관내_응급_의료이용률}%` : '-'} (헬스맵 2024)`,
        `2단계 [전국 비교]: 전국 시군구 평균 미도달 ${전국_응급미도달}%, 관내이용률 ${전국_응급RI}%`,
        '3단계 [정책 기준]: 응급의료취약지 선정 기준(1시간 내 도달 불가 인구 30% 이상)과 대조 — 실제 지정 여부는 고시 목록 확인',
      ],
      최종결론: '이 요약은 규칙 기반이며 AI 추론 결과가 아닙니다. 대안의 적합성과 우선순위는 담당자가 판단해야 합니다.',
    },
  };
}

interface AI_판단_근거_모달_속성 {
  is_open: boolean;
  on_close: () => void;
  option_id: 'A' | 'B' | 'C';
  selected_region?: 필수의료_진단_결과 | null;
  on_create_proposal?: (option_id: 'A' | 'B' | 'C') => void;
}

export const AI_판단_근거_모달: React.FC<AI_판단_근거_모달_속성> = ({
  is_open,
  on_close,
  option_id,
  selected_region,
  on_create_proposal,
}) => {
  if (!is_open) return null;

  const data = 정책_근거_생성(option_id, selected_region);
  const region_name = selected_region
    ? `${selected_region.시도명} ${selected_region.시군구명}`
    : '선택 지역';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#15161b] rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        {/* 모달 상단 헤더 */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                판단 근거 (규칙 기반 요약)
              </span>
              <span className="text-xs text-slate-400">헬스맵 2024 실데이터 · AI 추론 아님</span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-blue-600" />
              <span>왜 이 정책대안 결과가 도출되었나요?</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              <strong className="text-slate-800 dark:text-slate-200">{region_name}</strong> 대상{' '}
              <strong className="text-blue-600 dark:text-blue-400">{data.대안명}</strong>의 근거 데이터와 판단 흐름입니다.
            </p>
          </div>
          <button
            type="button"
            onClick={on_close}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 바디 본문 (스크롤) */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* 1. 핵심 데이터 & 현재 수치 vs 유사 지역 vs 미래 예측 비교 테이블 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-blue-50 dark:bg-blue-950/80 text-blue-600 flex items-center justify-center text-xs font-black">
                1
              </div>
              <h4 className="text-sm font-black text-slate-900 dark:text-white">
                핵심 데이터 · 현재 수치 · 전국 비교 · 미래 예측
              </h4>
            </div>

            <div className="space-y-3">
              {data.핵심데이터.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2.5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-200/60 dark:border-slate-800 pb-2">
                    <span className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-600" />
                      {item.지표명}
                    </span>
                    <span className="text-[11px] font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/60 px-2 py-0.5 rounded-md self-start sm:self-auto">
                      {item.유사지역격차}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    {/* 현재 수치 */}
                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60">
                      <span className="text-[10px] text-slate-400 font-bold block mb-0.5">
                        [현재 수치] {region_name}
                      </span>
                      <span className="text-sm font-black text-slate-900 dark:text-white">
                        {item.현재수치}
                      </span>
                    </div>

                    {/* 유사 지역 비교값 */}
                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60">
                      <span className="text-[10px] text-slate-400 font-bold block mb-0.5">
                        [비교값] 전국 시군구 평균
                      </span>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {item.유사지역비교값}
                      </span>
                    </div>

                    {/* 미래 예측값 */}
                    <div className="p-2.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-900/40">
                      <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold block mb-0.5">
                        [미래 예측]
                      </span>
                      <span className="text-[11px] text-indigo-950 dark:text-indigo-200 leading-tight block">
                        {item.미래예측값}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 2. 관련 정책 자료 및 지원 법령 (RAG 검색 기반) */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 flex items-center justify-center text-xs font-black">
                2
              </div>
              <h4 className="text-sm font-black text-slate-900 dark:text-white">
                관련 정책 자료 (지침 코퍼스 확인 항목)
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {data.관련정책자료.map((doc, dIdx) => (
                <div
                  key={dIdx}
                  className="p-3.5 rounded-2xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200/70 dark:border-emerald-900/50 space-y-2"
                >
                  <div className="flex items-start gap-2">
                    <FileText className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white text-xs">
                        {doc.문서명}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {doc.조항_근거}
                      </div>
                    </div>
                  </div>
                  <div className="p-2 rounded-xl bg-white dark:bg-slate-800/80 text-[11px] text-emerald-800 dark:text-emerald-300 font-medium">
                    <strong>정부 지원 내용: </strong>
                    {doc.지원내용}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3. AI 종합 판단 및 단계별 인과추론 과정 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-purple-50 dark:bg-purple-950/80 text-purple-600 flex items-center justify-center text-xs font-black">
                3
              </div>
              <h4 className="text-sm font-black text-slate-900 dark:text-white">
                종합 판단 및 단계별 근거
              </h4>
            </div>

            <div className="p-4 rounded-2xl bg-purple-50/30 dark:bg-purple-950/20 border border-purple-200/70 dark:border-purple-900/50 space-y-3">
              <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                {data.AI종합판단.요약}
              </p>

              {/* 4단계 인과추론 단계 */}
              <div className="space-y-1.5 pt-2 border-t border-purple-200/50 dark:border-purple-900/40">
                <span className="text-[10px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-wider block">
                  판단 흐름
                </span>
                <div className="space-y-1">
                  {data.AI종합판단.추론단계.map((step, sIdx) => (
                    <div
                      key={sIdx}
                      className="p-2 rounded-xl bg-white dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0 mt-0.5" />
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 최종 결론 박스 */}
              <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-950/60 border border-purple-300 dark:border-purple-800 text-xs text-purple-950 dark:text-purple-200 font-semibold">
                <strong>■ 최종 정책 제언: </strong>
                {data.AI종합판단.최종결론}
              </div>
            </div>
          </div>
        </div>

        {/* 모달 하단 액션 바 */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-[#121318] flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-xs text-slate-400 text-center sm:text-left">
            헬스맵 2024 진단값과 지침 코퍼스의 확인된 기준만 사용한 규칙 기반 요약입니다.
          </span>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={on_close}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-700 dark:text-slate-300 text-xs font-bold transition cursor-pointer"
            >
              닫기
            </button>
            {on_create_proposal && (
              <button
                type="button"
                onClick={() => {
                  on_close();
                  on_create_proposal(option_id);
                }}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              >
                <span>이 대안으로 사업계획서 만들기</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
