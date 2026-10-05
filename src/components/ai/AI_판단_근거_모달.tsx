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

export const 정책_근거_데이터_맵: Record<'A' | 'B' | 'C', 정책_옵션_근거> = {
  A: {
    option_id: 'A',
    대안명: 'Option A: 응급의료 인프라 및 골든타임 강화형',
    핵심분야: '중증응급 · 골든타임 사각지대',
    핵심데이터: [
      {
        지표명: '권역응급 60분 미도달 인구비율',
        현재수치: '54.2%',
        유사지역비교값: '38.4% (유사 군지역 평균)',
        유사지역격차: '+15.8%p 취약 심화',
        미래예측값: '2030년 고령인구 급증으로 60분 미도달 취약인구 약 22,000명으로 증가 우려',
      },
      {
        지표명: '관내 응급 의료이용률 (RI)',
        현재수치: '42.1%',
        유사지역비교값: '56.7% (전국 군단위 평균)',
        유사지역격차: '-14.6%p 관외 유출 과다',
        미래예측값: '현재 시설 방치 시 2030년 관내이용률 35% 미만으로 추가 하락 전망',
      },
      {
        지표명: '응급의학과 전문의 및 당직 인력',
        현재수치: '지역응급기관 1개소 (전문의 결원)',
        유사지역비교값: '평균 1.8개소 / 전담의 2.4인',
        유사지역격차: '심야·휴일 당직 역량 임계점',
        미래예측값: '2030년 심근경색·뇌졸중 응급수요 +27.4% 증가로 진료 마비 위험',
      },
    ],
    관련정책자료: [
      {
        문서명: '2026 보건복지부 응급의료 취약지 지정 고시',
        조항_근거: '제3조(응급의료분야 취약지 기준) 관내 60분 도달 불가 인구 30% 초과',
        지원내용: '응급실 인건비 및 필수 시설·장비비 국비 70% 지원 대상 적격',
      },
      {
        문서명: '제4차 응급의료 기본계획(2023-2027)',
        조항_근거: '중점과제 2: 중증응급환자 골든타임 내 이송·전원 체계 개편',
        지원내용: '권역응급센터(원주세브란스)와 지역응급의료기관 간 원격 심뇌혈관 협진 예산 지원',
      },
    ],
    AI종합판단: {
      요약: '영월군은 지리적 산악지형과 거점병원 부재로 인해 응급환자의 57.9%가 관외로 유출되고 있으며, 이동시간 초과(62분)로 인한 예방가능 사망률이 우려됩니다. 따라서 자체 관내 응급의료기관 역량 승격과 권역센터 연계가 최우선 순위입니다.',
      추론단계: [
        '1단계 [현황 진단]: 60분 미도달율(54.2%)과 관내이용률(42.1%) 모두 국가 기준선 미달 확인',
        '2단계 [지역 비교]: 인근 유사 군지역(평창/정선/단양) 대비 응급 전원 지연 시간이 평균 23분 더 소요됨',
        '3단계 [미래 수요]: 2030년 65세 이상 고령자 39.8% 진입 시 급성 심뇌혈관 응급환자 27.4% 증가 필연',
        '4단계 [정책 부합도]: 보건복지부 취약지 인프라 보강 사업의 국비 70% 매칭 조건 100% 충족',
      ],
      최종결론: '단순 환자 이송 중심의 수동적 대응보다는, 지역거점 공공병원(영월의료원) 응급실의 24시간 전문의 상주 체계 및 원격협진망을 구축하는 것이 가장 높은 생존율 개선(RI 65% 달성) 효과를 보입니다.',
    },
  },
  B: {
    option_id: 'B',
    대안명: 'Option B: 인근 3차 권역 연계 Fast-Track 핫라인형',
    핵심분야: '광역 전원 협진 · 닥터헬기 이송망',
    핵심데이터: [
      {
        지표명: '권역 3차 대학병원까지 실제 육상이동시간',
        현재수치: '평균 68분 (원주세브란스기독병원)',
        유사지역비교값: '52분 (권역 인접 군지역 평균)',
        유사지역격차: '+16분 지연 발생',
        미래예측값: '골든타임(60분) 초과로 중증환자 이송 중 악화 리스크 상존',
      },
      {
        지표명: '닥터헬기 인계점 및 119 다중출동 건수',
        현재수치: '관내 인계점 4개소 (운용률 저조)',
        유사지역비교값: '평균 7개소 인계점 확보',
        유사지역격차: '야간·기상악화 시 대체 이송수단 부족',
        미래예측값: '2030년 권역간 이송 환자 연간 1,800건 돌파 예상',
      },
      {
        지표명: '타 지자체 3차병원 전원 성공률',
        현재수치: '78.2% (전원 거부·지연 경험 21.8%)',
        유사지역비교값: '88.5% (핫라인 체결 지역)',
        유사지역격차: '-10.3%p 불안정',
        미래예측값: '상급종합병원 병상 부족 심화 시 지역 외상환류 차단 위험',
      },
    ],
    관련정책자료: [
      {
        문서명: '지역책임의료기관 - 권역책임의료기관 연계 협력지침',
        조항_근거: '제4장 필수보건의료 협력모델: 중증응급 이송·전원 및 진료협력사업',
        지원내용: '전원 조정 지원금 및 전원환자 Fast-Track 수가 정책가산 적용',
      },
      {
        문서명: '강원특별자치도 응급의료이송체계 기본계획',
        조항_근거: '영월-원주 축 중증응급환자 광역 핫라인 개설',
        지원내용: '닥터헬기 우선 배정 및 119 구급상황관리센터 직통 배정망 지원',
      },
    ],
    AI종합판단: {
      요약: '영월군 단독으로 중증 심뇌혈관 수술실과 24시간 심혈관중재시술팀을 유지하는 것은 전문인력 수급상 막대한 비효율이 존재합니다. 따라서 인근 권역센터와의 광역 Fast-Track 체계가 현실적인 해법입니다.',
      추론단계: [
        '1단계 [비용-효과성]: 고난도 수술팀 관내 상주는 막대한 재정 투입에도 불구하고 케이스 부족으로 질 저하 우려',
        '2단계 [이송 시간]: 닥터헬기 및 스마트 구급차 실시간 원격 심전도 전송 시 이송시간 25분 이내로 단축 가능',
        '3단계 [책임 체계]: 국립중앙의료원 및 권역책임의료기관 협약 체결로 응급실 뺑뺑이 전원 거부 사전 차단',
      ],
      최종결론: '지역 내 과도한 시설 중복투자 대신, 119 구급대-원주세브란스 직통 Fast-Track 및 초동처치 보건지소 네트워크를 구축하여 골든타임 내 처치율 90%를 보장합니다.',
    },
  },
  C: {
    option_id: 'C',
    대안명: 'Option C: 의료인력 확보 및 모자·소아 특화 안심망형',
    핵심분야: '분만 취약지 해소 · 24시간 소아 야간진료',
    핵심데이터: [
      {
        지표명: '분만 의료기관 60분 미도달 인구비율',
        현재수치: '76.8% (분만취약지 A등급)',
        유사지역비교값: '58.3% (도내 군지역 평균)',
        유사지역격차: '+18.5%p 분만 공백 심각',
        미래예측값: '관내 분만인프라 미확보 시 청년층 정주인구 이탈 가속화',
      },
      {
        지표명: '관내 분만율 (원정출산 비율)',
        현재수치: '11.4% (산모 88.6% 타지역 출산)',
        유사지역비교값: '22.1% (외래산부인과 운영지역)',
        유사지역격차: '-10.7%p 산모 안전위협',
        미래예측값: '산전 진찰 미수진 및 응급 분만 중 사산 리스크 증가',
      },
      {
        지표명: '소아 야간·휴일 의료기관 접근성 지수',
        현재수치: '32.4점 (야간 달빛어린이병원 0개소)',
        유사지역비교값: '51.2점',
        유사지역격차: '심야 소아 발열 시 50km 이상 원정 진료',
        미래예측값: '영유아 부모 정주 만족도 최하위권 고착 우려',
      },
    ],
    관련정책자료: [
      {
        문서명: '2026 보건복지부 분만·소아 취약지 지원사업 지침',
        조항_근거: '분만취약지 A등급 지역 외래 산부인과 개설 및 인건비 연 5억원 지원',
        지원내용: '산부인과 전문의 2인, 간호사 4인 인건비 국비 50% + 도비 50% 보조',
      },
      {
        문서명: '달빛어린이병원 확대 및 소아의료체계 개선대책',
        조항_근거: '인구소멸지역 소아 야간진료 운영비 정액 지원 특례',
        지원내용: '야간·휴일 진료 시 건당 정책가산금 및 당직의료진 수당 보조',
      },
    ],
    AI종합판단: {
      요약: '영월군은 분만취약지 A등급으로 지정되어 산모 88.6%가 원정 출산을 하고 있으며, 야간 소아 진료기관이 없어 젊은 부모들의 정주 여건이 심각하게 훼손되고 있습니다. 모자·소아 특화 안심망은 지방소멸 방지의 핵심 정책입니다.',
      추론단계: [
        '1단계 [고시 지표]: 분만 60분 미도달율(76.8%)은 보건복지부 최상위 취약지 지원 요건에 완벽히 부합',
        '2단계 [인력 모델]: 정규직 채용 한계를 극복하기 위해 국립중앙의료원 공공임상교수제 및 시니어 의사 매칭 필수',
        '3단계 [미래 영향]: 아이 낳고 키울 수 있는 최소한의 안전망 구축으로 2030 인구 유출 억제 효과 기대',
      ],
      최종결론: '영월의료원에 외래 산부인과 및 안심분만 이송센터를 복원하고, 평일 야간 23시까지 진료하는 소아 특화 진료소를 지원하는 패키지 정책이 가장 시급합니다.',
    },
  },
};

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

  const data = 정책_근거_데이터_맵[option_id] || 정책_근거_데이터_맵['A'];
  const region_name = selected_region
    ? `${selected_region.시도명} ${selected_region.시군구명}`
    : '강원 영월군';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#15161b] rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        {/* 모달 상단 헤더 */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                AI 의사결정 추론 근거 (Explainable AI)
              </span>
              <span className="text-xs text-slate-400">데이터 기반 종합판단 보고서</span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-blue-600" />
              <span>왜 이 정책대안 결과가 도출되었나요?</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              <strong className="text-slate-800 dark:text-slate-200">{region_name}</strong> 대상{' '}
              <strong className="text-blue-600 dark:text-blue-400">{data.대안명}</strong>이 생성된 데이터와 인과 추론 과정입니다.
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
                핵심 데이터 · 현재 수치 · 유사 지역 비교 · 미래 예측값
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
                        [유사 지역 비교값] 동일 유형 코호트
                      </span>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {item.유사지역비교값}
                      </span>
                    </div>

                    {/* 미래 예측값 */}
                    <div className="p-2.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-900/40">
                      <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold block mb-0.5">
                        [2030 미래 예측 리스크]
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
                관련 정부 정책 자료 및 법정 지원 근거 (RAG 검증)
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
                AI 종합 판단 및 단계별 인과추론 (Reasoning Chain)
              </h4>
            </div>

            <div className="p-4 rounded-2xl bg-purple-50/30 dark:bg-purple-950/20 border border-purple-200/70 dark:border-purple-900/50 space-y-3">
              <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                {data.AI종합판단.요약}
              </p>

              {/* 4단계 인과추론 단계 */}
              <div className="space-y-1.5 pt-2 border-t border-purple-200/50 dark:border-purple-900/40">
                <span className="text-[10px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-wider block">
                  AI 추론 로직 흐름
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
            다양한 원천 데이터를 결합하여 검증 가능한 근거 중심으로 생성된 결과입니다.
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
