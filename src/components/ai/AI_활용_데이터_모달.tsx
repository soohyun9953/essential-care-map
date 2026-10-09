'use client';

// Essential Care Map - AI 활용 데이터 상세 모달
// 사용자 요구사항 4번: 7대 데이터 그룹 상세 표출 및 프로토타입 예시(Mock) 데이터 안내

import React, { useState } from 'react';
import {
  X,
  Database,
  Building2,
  Stethoscope,
  Users,
  Activity,
  MapPin,
  TrendingUp,
  FileText,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Search,
} from 'lucide-react';

export interface 데이터_그룹_아이템 {
  id: string;
  이름: string;
  아이콘: React.ComponentType<{ className?: string }>;
  카테고리: string;
  제공기관: string;
  주요항목: string[];
  갱신주기: string;
  활용목적: string;
  상태: '내장 스냅샷' | '일부 보유' | '미보유' | '정적 코퍼스';
  샘플데이터: { 항목: string; 값: string }[];
}

export const AI_활용_데이터_그룹: 데이터_그룹_아이템[] = [
  {
    id: 'hospitals',
    이름: '의료기관 데이터',
    아이콘: Building2,
    카테고리: '인프라',
    제공기관: '건강보험심사평가원, 국립중앙의료원 중앙응급의료센터',
    주요항목: [
      '전국 214개 공공병원 현황',
      '권역·지역응급의료센터 및 응급의료기관 지정 목록',
      '분만산부인과 및 소아청소년과 개설 의료기관',
      '달빛어린이병원 지정 현황',
    ],
    갱신주기: '실시간 API / 월간 배치',
    활용목적: '지역 내 필수 의료전달체계의 최일선 공급 거점 및 기능 공백 여부 파악',
    상태: '내장 스냅샷',
    샘플데이터: [
      { 항목: '공공의료기관', 값: '214개소 목록·병상 (내장 데이터셋)' },
      { 항목: '응급의료기관', 값: 'E-Gen 목록 528개소 (2026-09-25 수집)' },
      { 항목: '분만 가능 기관', 값: '심평원 목록 (2025.1~2026.4 청구 실적)' },
      { 항목: '달빛어린이병원', 값: 'NMC 목록 114곳 (2026-09-25 수집)' },
    ],
  },
  {
    id: 'resources',
    이름: '의료자원 데이터',
    아이콘: Stethoscope,
    카테고리: '인력 및 장비',
    제공기관: '보건복지부 보건의료인력통계, 심평원 자원포털',
    주요항목: [
      '전문의 수 (응급의학과, 산부인과, 소아청소년과, 외과)',
      '중환자실(ICU) 및 음압격리병상 보유 수',
      '특수 의료장비 (CT, MRI, 혈관조영기)',
      '119 특수구급차 및 닥터헬기 인계점',
    ],
    갱신주기: '분기별 갱신',
    활용목적: '단순 시설 존재를 넘어 실질적 중증 환자 수용 및 24시간 당직 가동 역량 진단',
    상태: '미보유',
    샘플데이터: [
      { 항목: '전문의·간호인력', 값: '시군구 단위 자료 미보유' },
      { 항목: 'ICU·특수장비', 값: '시군구 단위 자료 미보유' },
    ],
  },
  {
    id: 'demographics',
    이름: '지역 인구통계',
    아이콘: Users,
    카테고리: '지역 환경',
    제공기관: '행정안전부 주민등록 인구통계, 통계청 인구총조사',
    주요항목: [
      '행정구역별 총 주민등록인구 및 세대수',
      '65세 이상 고령인구 및 80세 이상 초고령인구 비율',
      '0~14세 유소년 인구 및 가임기 여성(15~49세) 인구수',
      '지방소멸위험지수 및 독거노인 가구 비율',
    ],
    갱신주기: '월간 갱신',
    활용목적: '지역별 잠재적 의료취약 인구 규모와 고위험군(노인/소아/산모) 분포 매핑',
    상태: '일부 보유',
    샘플데이터: [
      { 항목: '총 인구수', 값: '헬스맵 2024 (ABA01)' },
      { 항목: '고령·영유아 인구', 값: '미보유' },
    ],
  },
  {
    id: 'utilization',
    이름: '의료이용 데이터',
    아이콘: Activity,
    카테고리: '환자 이동 및 진료',
    제공기관: '국민건강보험공단 진료내역 빅데이터, 한국보건사회연구원',
    주요항목: [
      '관내 이용률(Relevance Index, RI) - 응급, 분만, 외래',
      '관외 환자 유출률 및 유출 진료비 규모',
      '자체 충족률(Sufficiency Ratio) 및 환자 전원(이송) 비율',
      '예방가능한 외상 사망률 및 급성심근경색 재관류 시간',
    ],
    갱신주기: '연간 공표 데이터',
    활용목적: '지역 주민들이 관내 병원을 외면하고 타지로 이탈하는 핵심 원인 분석',
    상태: '내장 스냅샷',
    샘플데이터: [
      { 항목: '응급·분만 관내이용률', 값: '헬스맵 2024 (CBB04·CBD01)' },
      { 항목: '입원 환자 유출입', 값: '2024 재원일수 자료 (원천 엑셀)' },
    ],
  },
  {
    id: 'gis_accessibility',
    이름: 'GIS / 공간접근성 데이터',
    아이콘: MapPin,
    카테고리: '공간 분석',
    제공기관: '국립중앙의료원 공공보건의료지원센터 헬스맵, 국토지리정보원',
    주요항목: [
      '도로망 네트워크 기반 권역응급의료센터 60분 미도달 인구비율',
      '지역응급실 30분 도달 취약 격자(1km x 1km 단위)',
      '분만산부인과 60분 도달 불가 지역 거주민 수',
      '소아 야간·휴일 의료기관 30분 접근성 지수',
    ],
    갱신주기: '연간 헬스맵 갱신',
    활용목적: '지리적·공간적 격차로 인한 골든타임 사각지대 도출 및 이송망 설계',
    상태: '내장 스냅샷',
    샘플데이터: [
      { 항목: '권역응급 60분 미도달', 값: '헬스맵 2024 (BBB01)' },
      { 항목: '분만 60분 미도달', 값: '헬스맵 2024 (BBD01)' },
      { 항목: '소아 야간 접근성', 값: '미보유 (진단 제외)' },
    ],
  },
  {
    id: 'future_demand',
    이름: '미래수요 데이터',
    아이콘: TrendingUp,
    카테고리: '시계열 예측',
    제공기관: '통계청 시군구별 장래인구추계(2025~2040), AI 의료수요 추계 모델',
    주요항목: [
      '2030년 연령구조 변화 및 생산가능인구 감소율',
      '급성기 질환(심뇌혈관, 중증외상) 입원 수요 예측치',
      '만성질환 유병률 및 재택의료·방문간호 수요 증가율',
      '지역 내 병상 과부족 시나리오 (과잉/결원 지표)',
    ],
    갱신주기: '모델 재학습 주기(연간)',
    활용목적: '단기 처방이 아닌 2030~2035년 미래 인구구조에 부합하는 정책 타당성 검증',
    상태: '미보유',
    샘플데이터: [
      { 항목: '장래인구 추계', 값: '미보유' },
      { 항목: '수요추계 탭', 값: '인구수 기반 단순 추정 모델 (실측 아님)' },
    ],
  },
  {
    id: 'policy_documents',
    이름: '정책·사업 자료',
    아이콘: FileText,
    카테고리: '규정 및 RAG 코퍼스',
    제공기관: '보건복지부 고시, 질병관리청, 전국 공공보건의료지원단',
    주요항목: [
      '보건복지부 고시 「응급의료분야 의료취약지 지정」(제2024-261호)',
      '제2차 공공보건의료 기본계획(2021-2025)',
      '지역보건의료계획 우수 시군구 벤치마킹 사례집',
      '공공보건의료 협력체계 구축사업(책임의료기관) 가이드라인',
    ],
    갱신주기: '고시 발표 즉시 RAG 인덱싱',
    활용목적: '정부 재정지원 공모 요건 부합도 검토 및 법정 사업계획서 표준 양식 매핑',
    상태: '정적 코퍼스',
    샘플데이터: [
      { 항목: '지침 코퍼스', 값: '14개 청크, 검증상태(원문 확인/일부/미확인) 표기' },
      { 항목: '국비 분담 비율', 값: '사업별 상이 — 해당 연도 지침 확인' },
    ],
  },
];

interface AI_활용_데이터_모달_속성 {
  is_open: boolean;
  on_close: () => void;
  selected_region_name?: string;
}

export const AI_활용_데이터_모달: React.FC<AI_활용_데이터_모달_속성> = ({
  is_open,
  on_close,
  selected_region_name = '선택 지역',
}) => {
  const [selected_category, setSelected_category] = useState<string>('all');
  const [search_query, setSearch_query] = useState<string>('');

  if (!is_open) return null;

  const filtered_groups = AI_활용_데이터_그룹.filter((group) => {
    const matches_category =
      selected_category === 'all' || group.카테고리 === selected_category;
    const matches_query =
      !search_query ||
      group.이름.includes(search_query) ||
      group.제공기관.includes(search_query) ||
      group.주요항목.some((item) => item.includes(search_query));
    return matches_category && matches_query;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#15161b] rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        {/* 헤더 */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                AI 분석 데이터 카탈로그
              </span>
              <span className="text-xs text-slate-400">7대 통합 데이터 그룹</span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-600" />
              <span>AI가 분석에 활용한 공공의료 데이터 셋</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              AI 정책기획 엔진은 7대 이기종 데이터 소스와 법정 정책 문서를 종합 결합하여 {selected_region_name}의 정책대안을 도출했습니다.
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

        {/* 프로토타입 예시 데이터 명시 안내 배너 (요구사항 4번 필수) */}
        <div className="mx-5 sm:mx-6 mt-4 p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/40 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
            <span className="font-bold">※ 프로토타입 안내: </span>
            본 화면의 수치 및 연동 파이프라인은 국립중앙의료원 헬스맵 및 보건복지부 공공데이터 스키마를 준용하여 구성된{' '}
            <span className="font-extrabold underline decoration-amber-400 underline-offset-2">
              ISP 개념검증용 예시(Mock) 시뮬레이션 데이터
            </span>
            입니다. To-Be 본 구축 시 국가 보건의료 빅데이터 플랫폼 및 심평원 실시간 API와 연계됩니다.
          </div>
        </div>

        {/* 필터 및 검색 바 */}
        <div className="px-5 sm:px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto no-scrollbar">
            {['all', '인프라', '인력 및 장비', '지역 환경', '환자 이동 및 진료', '공간 분석', '시계열 예측', '규정 및 RAG 코퍼스'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelected_category(cat)}
                className={`px-3 py-1 rounded-xl text-[11px] font-bold transition whitespace-nowrap cursor-pointer ${
                  selected_category === cat
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                {cat === 'all' ? '전체 보기 (7)' : cat}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-56">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search_query}
              onChange={(e) => setSearch_query(e.target.value)}
              placeholder="데이터명, 출처 검색..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* 7대 데이터 그룹 리스트 (스크롤) */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered_groups.map((group) => {
              const GroupIcon = group.아이콘;
              return (
                <div
                  key={group.id}
                  className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-900 transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* 카드 헤더 */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                          <GroupIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-slate-900 dark:text-white">
                            {group.이름}
                          </h4>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {group.제공기관}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 shrink-0">
                        {group.상태}
                      </span>
                    </div>

                    {/* 활용 목적 */}
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 mb-3 bg-white dark:bg-slate-800/80 p-2 rounded-xl border border-slate-100 dark:border-slate-700/60">
                      <strong className="text-slate-700 dark:text-slate-300">활용 목적: </strong>
                      {group.활용목적}
                    </p>

                    {/* 수집 항목 */}
                    <div className="space-y-1 mb-3">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                        주요 연계 항목
                      </span>
                      <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-0.5">
                        {group.주요항목.map((item, idx) => (
                          <li key={idx} className="flex items-center gap-1.5 text-[11px]">
                            <span className="w-1 h-1 rounded-full bg-blue-500" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* {selected_region_name} 실측 샘플 */}
                  <div className="pt-2.5 border-t border-slate-200/60 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 block mb-1">
                      현재 플랫폼 보유 현황
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[10px]">
                      {group.샘플데이터.map((sample, sIdx) => (
                        <div
                          key={sIdx}
                          className="px-2 py-1 rounded-lg bg-white/80 dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-700 flex justify-between gap-1"
                        >
                          <span className="text-slate-400 truncate">{sample.항목}</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200 shrink-0">
                            {sample.값}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 푸터 */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-[#121318] flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>국가 공공보건의료 데이터 표준 명명규칙 및 개인정보 비식별화 준수</span>
          </div>
          <button
            type="button"
            onClick={on_close}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition cursor-pointer"
          >
            확인 및 닫기
          </button>
        </div>
      </div>
    </div>
  );
};
