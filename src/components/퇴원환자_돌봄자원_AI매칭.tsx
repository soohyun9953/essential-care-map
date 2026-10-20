'use client';

// 공공보건의료 협력·연계 및 퇴원환자 케어체계: 퇴원환자 지역사회 돌봄자원 AI 매칭 & 원클릭 연계 시뮬레이터

import React, { useState, useEffect, useRef } from 'react';
import {
  User,
  HeartHandshake,
  Sparkles,
  Send,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Calendar,
  Activity,
  Phone,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  X,
  ClipboardList,
  ChevronDown,
  ChevronUp,
  Brain,
  Footprints,
  Utensils,
  Heart,
  AlertTriangle,
} from 'lucide-react';
import { 퇴원환자_정보, 돌봄_자원_추천항목, 심층평가_항목, ADL_세부항목, IADL_세부항목 } from '@/lib/필수의료_타입';

// ─────────────────────────────────────────
// 심층 평가 샘플 데이터
// ─────────────────────────────────────────

const 심층평가_김공공: 심층평가_항목 = {
  평가일: '2026-09-18',
  평가자: '김재활 (작업치료사)',

  ADL: {
    식사: 10,
    이동: 10,
    개인위생: 5,
    용변처리: 5,
    목욕: 0,
    계단오르기: 5,
    옷입기: 5,
    대변조절: 10,
    소변조절: 5,
    보행: 5,
  } as ADL_세부항목,
  ADL_총점: 60,

  IADL: {
    전화사용: 2,
    물건구매: 3,
    식사준비: 2,
    가사활동: 3,
    세탁: 2,
    이동수단: 3,
    약물복용: 2,
    재정관리: 1,
  } as IADL_세부항목,
  IADL_총점: 3,

  MoCA_총점: 22,
  MoCA_기억력: 3,
  MoCA_주의력: 4,
  MoCA_언어능력: 2,
  MoCA_시공간: 4,
  MoCA_추상사고: 2,
  MoCA_지남력: 7,
  인지장애_의심: true,

  낙상위험_점수: 55,
  낙상위험_등급: '높음',
  낙상이력_6개월: true,

  욕창위험_점수: 16,
  욕창위험_등급: '중간',

  통증_NRS: 4,

  영양위험_MNA: 10,
  영양상태: '위험',

  우울_GDS: 7,
  우울_의심: true,

  종합소견: '뇌졸중 후 우측 편마비로 ADL 부분 의존 상태. 인지기능 저하(MoCA 22점)로 독거 생활 시 안전 위협. 낙상 고위험으로 환경 수정 및 보조기구 지급 필요. 우울증 의심(GDS 7점)으로 정신건강 서비스 연계 권고.',
};

const 심층평가_박돌봄: 심층평가_항목 = {
  평가일: '2026-09-22',
  평가자: '이간호 (전담간호사)',

  ADL: {
    식사: 10,
    이동: 5,
    개인위생: 0,
    용변처리: 5,
    목욕: 0,
    계단오르기: 0,
    옷입기: 5,
    대변조절: 5,
    소변조절: 5,
    보행: 5,
  } as ADL_세부항목,
  ADL_총점: 40,

  IADL: {
    전화사용: 3,
    물건구매: 4,
    식사준비: 3,
    가사활동: 4,
    세탁: 2,
    이동수단: 4,
    약물복용: 2,
    재정관리: 2,
  } as IADL_세부항목,
  IADL_총점: 2,

  MoCA_총점: 24,
  MoCA_기억력: 4,
  MoCA_주의력: 5,
  MoCA_언어능력: 2,
  MoCA_시공간: 4,
  MoCA_추상사고: 2,
  MoCA_지남력: 7,
  인지장애_의심: false,

  낙상위험_점수: 75,
  낙상위험_등급: '높음',
  낙상이력_6개월: true,

  욕창위험_점수: 11,
  욕창위험_등급: '높음',

  통증_NRS: 6,

  영양위험_MNA: 8,
  영양상태: '위험',

  우울_GDS: 4,
  우울_의심: false,

  종합소견: '대퇴골 골절 수술 후 휠체어 이동 상태로 ADL 고도 의존. 욕창 고위험(Braden 11점)으로 체위변경 및 욕창예방 매트 즉시 지원 필요. 당뇨 합병증 관리 목적 방문간호 주 3회 이상 권고. 낙상 재발 방지를 위한 침대 난간·욕실 안전바 설치 우선.',
};

// ─────────────────────────────────────────
// 샘플 환자 데이터 (심층평가 포함)
// ─────────────────────────────────────────

const SAMPLE_PATIENTS: 퇴원환자_정보[] = [
  {
    환자번호: 'P-2026-0891',
    이름: '김공공',
    연령: 72,
    성별: '남',
    진단명: '대뇌경색증 (급성기 치료 완료, 우측 편마비)',
    질병코드: 'I63.9',
    거주지: '강원특별자치도 영월군 영월읍 하송리',
    가구특성: '독거노인',
    거동상태: '보행보조기',
    ADL점수: 55,
    퇴원예정일: '2026-09-20',
    필요돌봄유형: ['가정방문 재활운동', '장기요양 등급신청', '일상식사 지원'],
    심층평가: 심층평가_김공공,
  },
  {
    환자번호: 'P-2026-0412',
    이름: '박돌봄',
    연령: 81,
    성별: '여',
    진단명: '대퇴골 경부 골절 수술 후 상태, 당뇨병',
    질병코드: 'S72.0 / E11',
    거주지: '강원특별자치도 영월군 주천면',
    가구특성: '노부부',
    거동상태: '휠체어이동',
    ADL점수: 40,
    퇴원예정일: '2026-09-24',
    필요돌봄유형: ['방문간호 욕창관리', '낙상방지 보조기기', '긴급 안심벨 설치'],
    심층평가: 심층평가_박돌봄,
  },
];

const INITIAL_RECOMMENDED_RESOURCES: 돌봄_자원_추천항목[] = [
  {
    자원ID: 'RES-001',
    자원명: '맞춤형 방문건강관리사업',
    기관명: '영월군보건소 건강증진과',
    분류: '보건의료',
    지원내용: '전담 간호사 및 물리치료사 주 2회 가정 방문 재활운동, 혈압·혈당 모니터링',
    적합도점수: 98,
    추천사유: '뇌졸중 편마비 환자의 잔존기능 유지 및 재발 방지 위한 방문재활 적합도 최상',
    담당자연락처: '연락처 미제공 (기관 대표번호 확인 필요)',
    연계상태: '미의뢰',
  },
  {
    자원ID: 'RES-002',
    자원명: '노인장기요양보험 재가급여 연계',
    기관명: '국민건강보험공단 영월출장소',
    분류: '요양돌봄',
    지원내용: '장기요양 3등급 예상, 요양보호사 일 3시간 방문요양(가사·신체활동 지원)',
    적합도점수: 95,
    추천사유: '독거노인 및 ADL 55점으로 일상 가사활동 전면 불가능 상태 조기 해소',
    담당자연락처: '연락처 미제공 (기관 대표번호 확인 필요)',
    연계상태: '미의뢰',
  },
  {
    자원ID: 'RES-003',
    자원명: '사랑의 도시락 배달 및 안부살핌',
    기관명: '영월종합사회복지관',
    분류: '생활복지',
    지원내용: '주 5회 영양 도시락 직접 배달 및 생활관리사 방문 안전확인',
    적합도점수: 91,
    추천사유: '영양 불량 고위험군 및 고독사 예방을 위한 식생활 안전망 결합 필수',
    담당자연락처: '연락처 미제공 (기관 대표번호 확인 필요)',
    연계상태: '미의뢰',
  },
];

// ─────────────────────────────────────────
// 유틸리티 함수
// ─────────────────────────────────────────

function get_adl_label(score: number): { label: string; color: string } {
  if (score >= 80) return { label: '경도 의존', color: 'text-emerald-600 dark:text-emerald-400' };
  if (score >= 60) return { label: '중등도 의존', color: 'text-amber-600 dark:text-amber-400' };
  if (score >= 40) return { label: '고도 의존', color: 'text-orange-600 dark:text-orange-400' };
  return { label: '완전 의존', color: 'text-red-600 dark:text-red-400' };
}

function get_등급_badge(등급: '낮음' | '중간' | '높음'): string {
  if (등급 === '낮음') return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400';
  if (등급 === '중간') return 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400';
  return 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400';
}

function get_moca_label(score: number): { label: string; color: string } {
  if (score >= 26) return { label: '정상', color: 'text-emerald-600 dark:text-emerald-400' };
  if (score >= 18) return { label: '경도 인지장애', color: 'text-amber-600 dark:text-amber-400' };
  return { label: '중등도 이상 인지장애', color: 'text-red-600 dark:text-red-400' };
}

// ─────────────────────────────────────────
// 심층 평가표 서브 컴포넌트
// ─────────────────────────────────────────

const 심층평가_섹션: React.FC<{ 평가: 심층평가_항목; 로딩중: boolean }> = ({ 평가, 로딩중 }) => {
  const adl_info = get_adl_label(평가.ADL_총점);
  const moca_info = get_moca_label(평가.MoCA_총점);

  const adl_항목들: { key: keyof ADL_세부항목; label: string; max: number }[] = [
    { key: '식사', label: '식사', max: 10 },
    { key: '이동', label: '이동', max: 15 },
    { key: '개인위생', label: '개인위생', max: 5 },
    { key: '용변처리', label: '용변처리', max: 10 },
    { key: '목욕', label: '목욕', max: 5 },
    { key: '계단오르기', label: '계단오르기', max: 10 },
    { key: '옷입기', label: '옷입기', max: 10 },
    { key: '대변조절', label: '대변조절', max: 10 },
    { key: '소변조절', label: '소변조절', max: 10 },
    { key: '보행', label: '보행', max: 15 },
  ];

  const moca_항목들 = [
    { label: '기억력', score: 평가.MoCA_기억력, max: 5 },
    { label: '주의력', score: 평가.MoCA_주의력, max: 6 },
    { label: '언어능력', score: 평가.MoCA_언어능력, max: 3 },
    { label: '시공간', score: 평가.MoCA_시공간, max: 5 },
    { label: '추상사고', score: 평가.MoCA_추상사고, max: 2 },
    { label: '지남력', score: 평가.MoCA_지남력, max: 6 },
  ];

  return (
    <div
      className={`space-y-5 transition-all duration-500 ${
        로딩중 ? 'opacity-40 blur-sm pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* 평가 메타 정보 */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pb-2 border-b border-slate-200 dark:border-slate-800">
        <span>📋 평가일: <strong className="text-slate-700 dark:text-slate-200">{평가.평가일}</strong></span>
        <span>평가자: <strong className="text-slate-700 dark:text-slate-200">{평가.평가자}</strong></span>
      </div>

      {/* 상단 요약 뱃지 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {/* ADL */}
        <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-3 flex flex-col items-center text-center">
          <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1">ADL (Barthel)</span>
          <span className={`text-2xl font-black ${adl_info.color}`}>{평가.ADL_총점}</span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400">/100</span>
          <span className={`mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${adl_info.color} bg-current/10`}>
            {adl_info.label}
          </span>
        </div>
        {/* IADL */}
        <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-3 flex flex-col items-center text-center">
          <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1">IADL (Lawton)</span>
          <span className={`text-2xl font-black ${평가.IADL_총점 <= 3 ? 'text-red-600 dark:text-red-400' : 평가.IADL_총점 <= 5 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
            {평가.IADL_총점}
          </span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400">/8</span>
          <span className={`mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${평가.IADL_총점 <= 3 ? 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400' : 평가.IADL_총점 <= 5 ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'}`}>
            {평가.IADL_총점 <= 3 ? '고도 의존' : 평가.IADL_총점 <= 5 ? '중등도 의존' : '경도 의존'}
          </span>
        </div>
        {/* MoCA */}
        <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-3 flex flex-col items-center text-center">
          <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1">MoCA 인지</span>
          <span className={`text-2xl font-black ${moca_info.color}`}>{평가.MoCA_총점}</span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400">/30</span>
          <span className={`mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${평가.인지장애_의심 ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'}`}>
            {평가.인지장애_의심 ? '⚠ 인지장애 의심' : '정상'}
          </span>
        </div>
        {/* 낙상 */}
        <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-3 flex flex-col items-center text-center">
          <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1">낙상위험 (Morse)</span>
          <span className={`text-2xl font-black ${평가.낙상위험_등급 === '높음' ? 'text-red-600 dark:text-red-400' : 평가.낙상위험_등급 === '중간' ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
            {평가.낙상위험_점수}
          </span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400">점</span>
          <span className={`mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${get_등급_badge(평가.낙상위험_등급)}`}>
            {평가.낙상위험_등급} 위험
          </span>
        </div>
      </div>

      {/* ADL 세부 항목 바차트 */}
      <div className="bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Activity className="w-4 h-4 text-[#0071e3] dark:text-blue-400" />
          <span className="text-xs font-bold text-slate-900 dark:text-white">ADL 세부 항목 (Barthel Index)</span>
          <span className={`ml-auto text-xs font-bold ${adl_info.color}`}>{평가.ADL_총점}점</span>
        </div>
        <div className="space-y-1.5">
          {adl_항목들.map(({ key, label, max }) => {
            const val = 평가.ADL[key] as number;
            const pct = Math.round((val / max) * 100);
            return (
              <div key={key} className="flex items-center gap-2">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 w-16 shrink-0">{label}</span>
                <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      pct >= 80 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-400' : 'bg-red-400'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 w-10 text-right shrink-0">
                  {val}/{max}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* MoCA 세부 + 부가 지표 2열 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* MoCA 세부 */}
        <div className="bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Brain className="w-4 h-4 text-[#af52de] dark:text-purple-400" />
            <span className="text-xs font-bold text-slate-900 dark:text-white">MoCA 인지기능 세부</span>
            <span className={`ml-auto text-xs font-bold ${moca_info.color}`}>{평가.MoCA_총점}/30</span>
          </div>
          <div className="space-y-1.5">
            {moca_항목들.map(({ label, score, max }) => {
              const pct = Math.round((score / max) * 100);
              return (
                <div key={label} className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 w-16 shrink-0">{label}</span>
                  <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        pct >= 80 ? 'bg-purple-500' : pct >= 50 ? 'bg-amber-400' : 'bg-red-400'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 w-10 text-right shrink-0">
                    {score}/{max}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 부가 지표 */}
        <div className="bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-bold text-slate-900 dark:text-white">위험 지표 요약</span>
          </div>

          {/* 욕창 */}
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-600 dark:text-slate-400">욕창위험 (Braden)</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">{평가.욕창위험_점수}점</span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${get_등급_badge(평가.욕창위험_등급)}`}>
                {평가.욕창위험_등급}
              </span>
            </div>
          </div>

          {/* 통증 NRS */}
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-600 dark:text-slate-400">통증 (NRS)</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">{평가.통증_NRS}/10</span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${평가.통증_NRS >= 7 ? 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400' : 평가.통증_NRS >= 4 ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'}`}>
                {평가.통증_NRS >= 7 ? '중증' : 평가.통증_NRS >= 4 ? '중등도' : '경도'}
              </span>
            </div>
          </div>

          {/* 영양 MNA */}
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-600 dark:text-slate-400">영양 (MNA-SF)</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">{평가.영양위험_MNA}/14</span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${평가.영양상태 === '영양불량' ? 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400' : 평가.영양상태 === '위험' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'}`}>
                {평가.영양상태}
              </span>
            </div>
          </div>

          {/* 우울 GDS */}
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-600 dark:text-slate-400">우울 (GDS-SF)</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">{평가.우울_GDS}/15</span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${평가.우울_의심 ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'}`}>
                {평가.우울_의심 ? '⚠ 우울 의심' : '정상'}
              </span>
            </div>
          </div>

          {/* 낙상 이력 */}
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-600 dark:text-slate-400">6개월 내 낙상 이력</span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${평가.낙상이력_6개월 ? 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
              {평가.낙상이력_6개월 ? '있음' : '없음'}
            </span>
          </div>
        </div>
      </div>

      {/* 종합소견 */}
      <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 rounded-2xl">
        <p className="text-[11px] font-semibold text-blue-800 dark:text-blue-300 mb-1 flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5" />
          종합소견 및 퇴원 후 권고사항
        </p>
        <p className="text-xs text-blue-900 dark:text-blue-200 leading-relaxed">{평가.종합소견}</p>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────
// 메인 컴포넌트
// ─────────────────────────────────────────

export const 퇴원환자_돌봄자원_AI매칭: React.FC = () => {
  const [selected_patient, set_selected_patient] = useState<퇴원환자_정보>(SAMPLE_PATIENTS[0]);
  const [resources, set_resources] = useState<돌봄_자원_추천항목[]>(INITIAL_RECOMMENDED_RESOURCES);
  const [is_matching, set_is_matching] = useState(false);
  const [referral_notice, set_referral_notice] = useState<string | null>(null);

  // 심층 평가 자동 로딩 관련 상태
  const [is_assessment_open, set_is_assessment_open] = useState(false);
  const [is_assessment_loading, set_is_assessment_loading] = useState(false);
  const [loaded_assessment, set_loaded_assessment] = useState<심층평가_항목 | null>(
    SAMPLE_PATIENTS[0].심층평가 ?? null
  );

  const assessment_ref = useRef<HTMLDivElement>(null);

  // ── 환자 변경 시 심층 평가 자동 로딩 ──
  useEffect(() => {
    if (!selected_patient.심층평가) {
      set_loaded_assessment(null);
      return;
    }
    // 로딩 애니메이션 → 데이터 로드
    set_is_assessment_loading(true);
    set_loaded_assessment(null);
    const timer = setTimeout(() => {
      set_loaded_assessment(selected_patient.심층평가 ?? null);
      set_is_assessment_loading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, [selected_patient]);

  // ── 평가 섹션 열릴 때 스크롤 ──
  useEffect(() => {
    if (is_assessment_open && assessment_ref.current) {
      setTimeout(() => {
        assessment_ref.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    }
  }, [is_assessment_open]);

  // AI 매칭 재실행
  const handle_run_ai_match = () => {
    set_is_matching(true);
    setTimeout(() => {
      set_is_matching(false);
      set_resources(INITIAL_RECOMMENDED_RESOURCES.map((r) => ({ ...r, 연계상태: '미의뢰' })));
    }, 600);
  };

  // 환자 변경
  const handle_patient_change = (번호: string) => {
    const p = SAMPLE_PATIENTS.find((item) => item.환자번호 === 번호);
    if (p) {
      set_selected_patient(p);
      handle_run_ai_match();
    }
  };

  // 원클릭 일괄 연계의뢰서 전송 안내
  const handle_send_all_referrals = () => {
    set_referral_notice('퇴원환자 연계의뢰서 전자 전송 기능은 보건복지부 차세대 사회보장정보시스템(행복e음) 및 지자체 돌봄망 정식 연동 후 제공될 예정입니다.');
  };

  const has_assessment = !!selected_patient.심층평가;

  return (
    <div className="bg-white dark:bg-[#15161b] p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#af52de] to-[#0071e3] text-white flex items-center justify-center shadow-apple-sm">
            <HeartHandshake className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-semibold tracking-tight text-slate-500 dark:text-slate-400">
                공공보건의료 협력·연계 및 퇴원환자 케어체계
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#af52de]/10 dark:bg-[#af52de]/20 text-[#af52de] dark:text-[#d48cf6] text-[10px] font-bold">
                지방의료원 코디네이터 전용
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white">
              퇴원환자 지역사회 돌봄자원 AI 매칭 &amp; 원클릭 연계
            </h3>
          </div>
        </div>

        {/* 환자 선택 셀렉터 */}
        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">대상 환자:</span>
          <select
            value={selected_patient.환자번호}
            onChange={(e) => handle_patient_change(e.target.value)}
            className="text-xs font-semibold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full px-3 py-1.5 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30"
          >
            {SAMPLE_PATIENTS.map((p) => (
              <option key={p.환자번호} value={p.환자번호} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                {p.이름} ({p.연령}세/{p.성별}) - {p.진단명.split(' ')[0]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 환자 프로필 요약 카드 */}
      <div className="bg-slate-50 dark:bg-slate-900/60 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">환자 인적사항</span>
          <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 flex items-center gap-1.5">
            <User className="w-4 h-4 text-[#0071e3] dark:text-blue-400" />
            <span>{selected_patient.이름} ({selected_patient.연령}세, {selected_patient.성별})</span>
          </p>
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 block">{selected_patient.가구특성} · {selected_patient.거동상태}</span>
        </div>

        <div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">임상 진단 및 ADL</span>
          <p className="text-xs font-semibold text-slate-900 dark:text-white mt-0.5 leading-snug line-clamp-1">
            {selected_patient.진단명}
          </p>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400 dark:border dark:border-red-800/40">
              ADL {selected_patient.ADL점수}점 (주의)
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">{selected_patient.질병코드}</span>
          </div>
        </div>

        <div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">거주지 및 퇴원예정일</span>
          <p className="text-xs text-slate-900 dark:text-slate-200 mt-0.5 flex items-center gap-1 line-clamp-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span>{selected_patient.거주지}</span>
          </p>
          <p className="text-[11px] text-[#0071e3] dark:text-blue-400 font-semibold mt-1 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>퇴원 예정: {selected_patient.퇴원예정일}</span>
          </p>
        </div>

        <div className="flex flex-col justify-center items-start sm:items-end">
          <button
            onClick={handle_run_ai_match}
            disabled={is_matching}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-1.5 px-4 py-2 text-xs font-semibold rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white transition shadow-apple-sm active:scale-95 disabled:opacity-60 cursor-pointer"
          >
            <Sparkles className={`w-3.5 h-3.5 ${is_matching ? 'animate-spin' : ''}`} />
            <span>{is_matching ? '불러오는 중...' : '예시 추천 다시 보기'}</span>
          </button>
        </div>
      </div>

      {/* ── 심층 평가표 자동 로딩 섹션 ── */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* 헤더 토글 버튼 */}
        <button
          type="button"
          onClick={() => set_is_assessment_open((v) => !v)}
          className={`w-full flex items-center justify-between px-4 py-3 transition-colors ${
            is_assessment_open
              ? 'bg-indigo-50 dark:bg-indigo-950/30 border-b border-indigo-200 dark:border-indigo-800/50'
              : 'bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-900'
          }`}
        >
          <div className="flex items-center gap-2">
            <ClipboardList className={`w-4 h-4 ${is_assessment_open ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'}`} />
            <span className={`text-xs font-bold ${is_assessment_open ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-300'}`}>
              심층 평가표 자동 로딩
            </span>
            {/* 로딩 뱃지 / 완료 뱃지 */}
            {is_assessment_loading ? (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 text-[10px] font-bold animate-pulse">
                <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                로딩 중…
              </span>
            ) : has_assessment && loaded_assessment ? (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 text-[10px] font-bold">
                <CheckCircle2 className="w-2.5 h-2.5" />
                평가 완료 — {loaded_assessment.평가일}
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 text-[10px] font-medium">
                ADL · IADL · MoCA · 낙상 · 욕창 · 영양 · 우울
              </span>
            )}
          </div>
          {is_assessment_open ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {/* 펼쳐지는 평가 내용 */}
        {is_assessment_open && (
          <div ref={assessment_ref} className="p-4 sm:p-5 bg-white dark:bg-[#15161b]">
            {is_assessment_loading ? (
              // 스켈레톤 로더
              <div className="space-y-3 animate-pulse">
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-20 bg-slate-100 dark:bg-slate-800 rounded-xl" />
                  ))}
                </div>
                <div className="h-32 bg-slate-100 dark:bg-slate-800 rounded-2xl" />
                <div className="grid grid-cols-2 gap-3">
                  <div className="h-40 bg-slate-100 dark:bg-slate-800 rounded-2xl" />
                  <div className="h-40 bg-slate-100 dark:bg-slate-800 rounded-2xl" />
                </div>
                <div className="h-16 bg-blue-50 dark:bg-blue-950/30 rounded-2xl" />
              </div>
            ) : loaded_assessment ? (
              <심층평가_섹션 평가={loaded_assessment} 로딩중={is_assessment_loading} />
            ) : (
              <div className="py-8 text-center text-slate-400 dark:text-slate-600 text-sm">
                <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-40" />
                이 환자의 심층 평가 데이터가 아직 등록되지 않았습니다.
              </div>
            )}
          </div>
        )}
      </div>

      {/* 예시 데이터 안내 */}
      <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-[11px] text-amber-800 dark:text-amber-300">
        <strong>예시 화면:</strong> 가상 환자와 예시 돌봄자원 목록입니다. 환자별 AI 매칭과 기관 전자연계는 아직 구현되지 않았으며, 추천 목록과 적합도는 고정된 예시값입니다.
      </div>

      {/* 예시 추천 지역사회 돌봄자원 리스트 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-900 dark:text-white">
              예시 추천 돌봄자원 ({resources.length}개 기관)
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">고정 예시 목록 (실제 매칭 아님)</span>
          </div>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
            전자연계망 연동 준비 중
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {resources.map((res) => (
            <div
              key={res.자원ID}
              className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between space-y-3 ${
                res.연계상태 === '접수완료'
                  ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/60'
                  : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:shadow-apple-sm'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#0071e3]/10 dark:bg-blue-500/20 text-[#0071e3] dark:text-blue-400">
                    {res.분류}
                  </span>
                  <div className="flex items-center space-x-1">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">적합도(예시)</span>
                    <span className="text-xs font-bold text-[#af52de] dark:text-[#d48cf6]">{res.적합도점수}%</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">{res.자원명}</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{res.기관명}</p>
                </div>

                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                  {res.지원내용}
                </p>

                <p className="text-[10px] text-slate-500 dark:text-slate-400 italic">
                  💡 {res.추천사유}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  <span>{res.담당자연락처}</span>
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    res.연계상태 === '접수완료'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {res.연계상태}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 하단 액션 바 */}
      <div className="space-y-3">
        <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <p className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#0071e3] dark:text-blue-400" />
              <span>기존 팩스·전화 중심 수기 의뢰 ➔ 전자연계망 연계 준비</span>
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              환자 사전 동의서 서명 완료 · 보건복지부 공공보건의료 연계표준 서식 전자문서 암호화 규격 지원
            </p>
          </div>

          <button
            type="button"
            onClick={handle_send_all_referrals}
            className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-full text-xs font-bold transition shadow-2xs bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 cursor-not-allowed select-none"
            title="보건복지부 차세대 사회보장정보시스템(행복e음) 정식 연동 후 제공 예정"
          >
            <Send className="w-3.5 h-3.5 text-slate-400" />
            <span>원클릭 연계의뢰서 전자 전송</span>
            <span className="text-[10px] px-1.5 py-0.2 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-md font-semibold">연동 준비중</span>
          </button>
        </div>

        {referral_notice && (
          <div className="p-3 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 rounded-2xl flex items-center justify-between text-xs text-amber-900 dark:text-amber-200 animate-in fade-in">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
              <span className="font-semibold">{referral_notice}</span>
            </div>
            <button
              type="button"
              onClick={() => set_referral_notice(null)}
              className="text-amber-700 hover:text-amber-900 dark:text-amber-400 p-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
