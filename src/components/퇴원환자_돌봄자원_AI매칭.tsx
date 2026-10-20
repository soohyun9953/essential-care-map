'use client';

// 보건복지부 공공병원 퇴원환자 지역사회 연계사업 표준 4단계
// 스크리닝 → 심층평가 → 돌봄계획 → 복지관 연계 의뢰서 자동생성

import React, { useState, useEffect, useRef } from 'react';
import {
  User, HeartHandshake, Sparkles, Send, CheckCircle2,
  AlertCircle, MapPin, Calendar, Activity, Phone,
  ShieldCheck, RefreshCw, X, ClipboardList, ChevronDown,
  ChevronUp, Brain, AlertTriangle, FileText, Building2,
  Check, ArrowRight, Printer, Download, CircleDot,
  Stethoscope, ClipboardCheck, Handshake,
} from 'lucide-react';
import {
  퇴원환자_정보, 돌봄_자원_추천항목,
  심층평가_항목, ADL_세부항목, IADL_세부항목,
} from '@/lib/필수의료_타입';

// ═══════════════════════════════════════════════════
// 샘플 데이터
// ═══════════════════════════════════════════════════

const 심층평가_김공공: 심층평가_항목 = {
  평가일: '2026-09-18', 평가자: '김재활 (작업치료사)',
  ADL: { 식사: 10, 이동: 10, 개인위생: 5, 용변처리: 5, 목욕: 0, 계단오르기: 5, 옷입기: 5, 대변조절: 10, 소변조절: 5, 보행: 5 } as ADL_세부항목,
  ADL_총점: 60,
  IADL: { 전화사용: 2, 물건구매: 3, 식사준비: 2, 가사활동: 3, 세탁: 2, 이동수단: 3, 약물복용: 2, 재정관리: 1 } as IADL_세부항목,
  IADL_총점: 3,
  MoCA_총점: 22, MoCA_기억력: 3, MoCA_주의력: 4, MoCA_언어능력: 2, MoCA_시공간: 4, MoCA_추상사고: 2, MoCA_지남력: 7,
  인지장애_의심: true,
  낙상위험_점수: 55, 낙상위험_등급: '높음', 낙상이력_6개월: true,
  욕창위험_점수: 16, 욕창위험_등급: '중간',
  통증_NRS: 4,
  영양위험_MNA: 10, 영양상태: '위험',
  우울_GDS: 7, 우울_의심: true,
  종합소견: '뇌졸중 후 우측 편마비로 ADL 부분 의존 상태. 인지기능 저하(MoCA 22점)로 독거 생활 시 안전 위협. 낙상 고위험으로 환경 수정 및 보조기구 지급 필요. 우울증 의심(GDS 7점)으로 정신건강 서비스 연계 권고.',
};

const 심층평가_박돌봄: 심층평가_항목 = {
  평가일: '2026-09-22', 평가자: '이간호 (전담간호사)',
  ADL: { 식사: 10, 이동: 5, 개인위생: 0, 용변처리: 5, 목욕: 0, 계단오르기: 0, 옷입기: 5, 대변조절: 5, 소변조절: 5, 보행: 5 } as ADL_세부항목,
  ADL_총점: 40,
  IADL: { 전화사용: 3, 물건구매: 4, 식사준비: 3, 가사활동: 4, 세탁: 2, 이동수단: 4, 약물복용: 2, 재정관리: 2 } as IADL_세부항목,
  IADL_총점: 2,
  MoCA_총점: 24, MoCA_기억력: 4, MoCA_주의력: 5, MoCA_언어능력: 2, MoCA_시공간: 4, MoCA_추상사고: 2, MoCA_지남력: 7,
  인지장애_의심: false,
  낙상위험_점수: 75, 낙상위험_등급: '높음', 낙상이력_6개월: true,
  욕창위험_점수: 11, 욕창위험_등급: '높음',
  통증_NRS: 6,
  영양위험_MNA: 8, 영양상태: '위험',
  우울_GDS: 4, 우울_의심: false,
  종합소견: '대퇴골 골절 수술 후 휠체어 이동 상태로 ADL 고도 의존. 욕창 고위험(Braden 11점)으로 체위변경 및 욕창예방 매트 즉시 지원 필요. 당뇨 합병증 관리 목적 방문간호 주 3회 이상 권고.',
};

const SAMPLE_PATIENTS: 퇴원환자_정보[] = [
  {
    환자번호: 'P-2026-0891', 이름: '김공공', 연령: 72, 성별: '남',
    진단명: '대뇌경색증 (급성기 치료 완료, 우측 편마비)', 질병코드: 'I63.9',
    거주지: '강원특별자치도 영월군 영월읍 하송리', 가구특성: '독거노인',
    거동상태: '보행보조기', ADL점수: 55, 퇴원예정일: '2026-09-20',
    필요돌봄유형: ['가정방문 재활운동', '장기요양 등급신청', '일상식사 지원'],
    심층평가: 심층평가_김공공,
  },
  {
    환자번호: 'P-2026-0412', 이름: '박돌봄', 연령: 81, 성별: '여',
    진단명: '대퇴골 경부 골절 수술 후 상태, 당뇨병', 질병코드: 'S72.0 / E11',
    거주지: '강원특별자치도 영월군 주천면', 가구특성: '노부부',
    거동상태: '휠체어이동', ADL점수: 40, 퇴원예정일: '2026-09-24',
    필요돌봄유형: ['방문간호 욕창관리', '낙상방지 보조기기', '긴급 안심벨 설치'],
    심층평가: 심층평가_박돌봄,
  },
];

const RESOURCES_MAP: Record<string, 돌봄_자원_추천항목[]> = {
  'P-2026-0891': [
    { 자원ID: 'R1', 자원명: '맞춤형 방문건강관리사업', 기관명: '영월군보건소 건강증진과', 분류: '보건의료', 지원내용: '전담 간호사·물리치료사 주 2회 가정방문 재활운동, 혈압·혈당 모니터링', 적합도점수: 98, 추천사유: '뇌졸중 편마비 환자 잔존기능 유지 및 재발방지 위한 방문재활', 담당자연락처: '기관 대표번호 확인 필요', 연계상태: '미의뢰' },
    { 자원ID: 'R2', 자원명: '노인장기요양보험 재가급여 연계', 기관명: '국민건강보험공단 영월출장소', 분류: '요양돌봄', 지원내용: '장기요양 3등급 예상, 요양보호사 일 3시간 방문요양(가사·신체활동 지원)', 적합도점수: 95, 추천사유: '독거노인 ADL 60점으로 일상 가사활동 전면 보조 필요', 담당자연락처: '기관 대표번호 확인 필요', 연계상태: '미의뢰' },
    { 자원ID: 'R3', 자원명: '사랑의 도시락 배달 및 안부살핌', 기관명: '영월종합사회복지관', 분류: '생활복지', 지원내용: '주 5회 영양 도시락 직접 배달 및 생활관리사 방문 안전확인', 적합도점수: 91, 추천사유: '영양 위험 및 고독사 예방 식생활 안전망 결합 필수', 담당자연락처: '기관 대표번호 확인 필요', 연계상태: '미의뢰' },
  ],
  'P-2026-0412': [
    { 자원ID: 'R4', 자원명: '방문간호 욕창관리 서비스', 기관명: '영월군보건소 방문건강팀', 분류: '보건의료', 지원내용: '전담 간호사 주 3회 방문, 욕창 드레싱·체위변경 교육, 당뇨 혈당 모니터링', 적합도점수: 99, 추천사유: '욕창 고위험(Braden 11점) 및 당뇨 합병증 관리 최우선', 담당자연락처: '기관 대표번호 확인 필요', 연계상태: '미의뢰' },
    { 자원ID: 'R5', 자원명: '낙상방지 보조기기 지원', 기관명: '국민건강보험공단 영월출장소', 분류: '요양돌봄', 지원내용: '침대 안전난간, 욕실 손잡이, 미끄럼 방지매트, 휠체어 잠금장치 무상 지원', 적합도점수: 96, 추천사유: 'Morse 75점 낙상 고위험·6개월 이내 이력, 환경 개선 즉시 필요', 담당자연락처: '기관 대표번호 확인 필요', 연계상태: '미의뢰' },
    { 자원ID: 'R6', 자원명: '긴급 안심벨 설치 및 24시간 모니터링', 기관명: '영월종합사회복지관', 분류: '생활복지', 지원내용: '가정 내 긴급 안심벨 설치, 24시간 응급출동 서비스 연계', 적합도점수: 93, 추천사유: '노부부 단독 생활, 낙상 재발 시 즉각 대응체계 구축 필수', 담당자연락처: '기관 대표번호 확인 필요', 연계상태: '미의뢰' },
  ],
};

// ═══════════════════════════════════════════════════
// 유틸리티
// ═══════════════════════════════════════════════════

const 스크리닝_위험항목 = (p: 퇴원환자_정보) => [
  { label: '독거 또는 취약 가구', 해당: p.가구특성 === '독거노인' },
  { label: 'ADL 60점 미만 (일상생활 부분 의존 이상)', 해당: p.ADL점수 < 60 },
  { label: '거동 제한 (보행보조기·휠체어·침상)', 해당: p.거동상태 !== '독립보행' },
  { label: '복합 만성질환 (2개 이상)', 해당: p.질병코드.includes('/') },
  { label: '퇴원 후 재가 복귀 예정', 해당: true },
  { label: '지역사회 돌봄자원 연계 필요', 해당: p.필요돌봄유형.length > 0 },
];

function 등급배지(등급: '낮음' | '중간' | '높음') {
  return 등급 === '낮음'
    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
    : 등급 === '중간'
    ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
    : 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400';
}

// ═══════════════════════════════════════════════════
// 단계 1: 스크리닝
// ═══════════════════════════════════════════════════

const Step스크리닝: React.FC<{ 환자: 퇴원환자_정보; onNext: () => void }> = ({ 환자, onNext }) => {
  const 항목들 = 스크리닝_위험항목(환자);
  const 해당수 = 항목들.filter(v => v.해당).length;
  const 필요 = 해당수 >= 3;

  return (
    <div className="space-y-5">
      {/* 환자 기본 카드 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
          <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1">환자 정보</p>
          <p className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <User className="w-4 h-4 text-[#0071e3]" />
            {환자.이름} ({환자.연령}세/{환자.성별})
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{환자.가구특성} · {환자.거동상태}</p>
        </div>
        <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
          <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1">주요 진단</p>
          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-snug line-clamp-2">{환자.진단명}</p>
          <span className="text-[10px] font-mono text-slate-400 mt-0.5 block">{환자.질병코드}</span>
        </div>
        <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
          <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1">ADL / 퇴원 예정일</p>
          <p className="text-sm font-black text-red-600 dark:text-red-400">{환자.ADL점수}점</p>
          <p className="text-[11px] text-[#0071e3] dark:text-blue-400 font-semibold flex items-center gap-1 mt-0.5">
            <Calendar className="w-3 h-3" />{환자.퇴원예정일}
          </p>
        </div>
      </div>

      {/* 스크리닝 체크리스트 */}
      <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
        <p className="text-xs font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
          <ClipboardCheck className="w-4 h-4 text-[#0071e3]" />
          지역사회 연계 필요성 스크리닝 체크리스트
        </p>
        <div className="space-y-2">
          {항목들.map((item, i) => (
            <div key={i} className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all ${
              item.해당
                ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800/50'
                : 'bg-slate-50 dark:bg-slate-900/30 border-slate-100 dark:border-slate-800/50'
            }`}>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                item.해당 ? 'bg-[#0071e3] text-white' : 'bg-slate-200 dark:bg-slate-700'
              }`}>
                {item.해당 ? <Check className="w-3 h-3" /> : <span className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-500 block" />}
              </div>
              <span className={`text-xs font-medium ${item.해당 ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-600'}`}>
                {item.label}
              </span>
              {item.해당 && <span className="ml-auto text-[10px] font-bold text-[#0071e3] dark:text-blue-400">해당</span>}
            </div>
          ))}
        </div>
      </div>

      {/* 판정 결과 */}
      <div className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
        필요
          ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/60'
          : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800'
      }`}>
        <div>
          <p className={`text-sm font-bold flex items-center gap-2 ${필요 ? 'text-amber-800 dark:text-amber-300' : 'text-slate-600 dark:text-slate-400'}`}>
            <AlertTriangle className="w-4 h-4" />
            스크리닝 결과: {필요 ? '심층평가 필요' : '모니터링 권고'}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            {해당수}개 항목 해당 · 지역사회 연계사업 {필요 ? '대상자로 판정' : '기준 미충족 (3개 이상 시 대상)'}
          </p>
        </div>
        <button
          onClick={onNext}
          className="flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-bold shadow-apple-sm active:scale-95 transition cursor-pointer"
        >
          심층평가 진행 <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════
// 단계 2: 심층평가
// ═══════════════════════════════════════════════════

const Step심층평가: React.FC<{ 평가: 심층평가_항목; 로딩: boolean; onNext: () => void }> = ({ 평가, 로딩, onNext }) => {
  const adl_항목들: { key: keyof ADL_세부항목; label: string; max: number }[] = [
    { key: '식사', label: '식사', max: 10 }, { key: '이동', label: '이동', max: 15 },
    { key: '개인위생', label: '개인위생', max: 5 }, { key: '용변처리', label: '용변처리', max: 10 },
    { key: '목욕', label: '목욕', max: 5 }, { key: '계단오르기', label: '계단오르기', max: 10 },
    { key: '옷입기', label: '옷입기', max: 10 }, { key: '대변조절', label: '대변조절', max: 10 },
    { key: '소변조절', label: '소변조절', max: 10 }, { key: '보행', label: '보행', max: 15 },
  ];
  const moca_항목들 = [
    { label: '기억력', score: 평가.MoCA_기억력, max: 5 },
    { label: '주의력', score: 평가.MoCA_주의력, max: 6 },
    { label: '언어', score: 평가.MoCA_언어능력, max: 3 },
    { label: '시공간', score: 평가.MoCA_시공간, max: 5 },
    { label: '추상사고', score: 평가.MoCA_추상사고, max: 2 },
    { label: '지남력', score: 평가.MoCA_지남력, max: 6 },
  ];

  if (로딩) return (
    <div className="space-y-3 animate-pulse">
      <div className="grid grid-cols-4 gap-2">{[1,2,3,4].map(i => <div key={i} className="h-20 bg-slate-100 dark:bg-slate-800 rounded-xl" />)}</div>
      <div className="h-36 bg-slate-100 dark:bg-slate-800 rounded-2xl" />
      <div className="grid grid-cols-2 gap-3"><div className="h-44 bg-slate-100 dark:bg-slate-800 rounded-2xl" /><div className="h-44 bg-slate-100 dark:bg-slate-800 rounded-2xl" /></div>
    </div>
  );

  return (
    <div className="space-y-5">
      {/* 평가 메타 */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pb-2 border-b border-slate-200 dark:border-slate-800">
        <span>📋 평가일: <strong className="text-slate-700 dark:text-slate-200">{평가.평가일}</strong></span>
        <span>평가자: <strong className="text-slate-700 dark:text-slate-200">{평가.평가자}</strong></span>
      </div>

      {/* 4개 요약 뱃지 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { label: 'ADL (Barthel)', score: 평가.ADL_총점, max: 100, tag: 평가.ADL_총점 < 40 ? '완전의존' : 평가.ADL_총점 < 60 ? '고도의존' : 평가.ADL_총점 < 80 ? '중등도의존' : '경도의존', color: 평가.ADL_총점 < 60 ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400' },
          { label: 'IADL (Lawton)', score: 평가.IADL_총점, max: 8, tag: 평가.IADL_총점 <= 3 ? '고도의존' : 평가.IADL_총점 <= 5 ? '중등도의존' : '경도의존', color: 평가.IADL_총점 <= 3 ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400' },
          { label: 'MoCA 인지', score: 평가.MoCA_총점, max: 30, tag: 평가.인지장애_의심 ? '⚠ 인지장애의심' : '정상', color: 평가.인지장애_의심 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400' },
          { label: '낙상위험 (Morse)', score: 평가.낙상위험_점수, max: null as unknown as number, tag: `${평가.낙상위험_등급} 위험`, color: 평가.낙상위험_등급 === '높음' ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400' },
        ].map((item, i) => (
          <div key={i} className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-3 flex flex-col items-center text-center">
            <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1">{item.label}</span>
            <span className={`text-2xl font-black ${item.color}`}>{item.score}</span>
            {item.max && <span className="text-[10px] text-slate-400">/{item.max}</span>}
            <span className={`mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${item.color.includes('red') ? 'bg-red-100 dark:bg-red-950/50' : item.color.includes('amber') ? 'bg-amber-100 dark:bg-amber-950/50' : 'bg-emerald-100 dark:bg-emerald-950/50'}`}>
              {item.tag}
            </span>
          </div>
        ))}
      </div>

      {/* ADL 바차트 */}
      <div className="bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Activity className="w-4 h-4 text-[#0071e3]" />
          <span className="text-xs font-bold text-slate-900 dark:text-white">ADL 세부 항목 (Barthel Index)</span>
          <span className="ml-auto text-xs font-bold text-slate-600 dark:text-slate-300">{평가.ADL_총점}/100점</span>
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
          {adl_항목들.map(({ key, label, max }) => {
            const val = 평가.ADL[key] as number;
            const pct = Math.round((val / max) * 100);
            return (
              <div key={key} className="flex items-center gap-2">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 w-14 shrink-0">{label}</span>
                <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-700 ${pct >= 80 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-400' : 'bg-red-400'}`} style={{ width: `${pct}%` }} />
                </div>
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 w-9 text-right shrink-0">{val}/{max}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* MoCA + 위험지표 2열 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Brain className="w-4 h-4 text-[#af52de]" />
            <span className="text-xs font-bold text-slate-900 dark:text-white">MoCA 인지기능 세부</span>
            <span className="ml-auto text-xs font-bold text-slate-600 dark:text-slate-300">{평가.MoCA_총점}/30</span>
          </div>
          <div className="space-y-1.5">
            {moca_항목들.map(({ label, score, max }) => (
              <div key={label} className="flex items-center gap-2">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 w-14 shrink-0">{label}</span>
                <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-700 ${Math.round((score/max)*100) >= 80 ? 'bg-purple-500' : Math.round((score/max)*100) >= 50 ? 'bg-amber-400' : 'bg-red-400'}`} style={{ width: `${Math.round((score/max)*100)}%` }} />
                </div>
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 w-9 text-right shrink-0">{score}/{max}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-2.5">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-bold text-slate-900 dark:text-white">부가 위험 지표</span>
          </div>
          {[
            { label: '욕창위험 (Braden)', value: `${평가.욕창위험_점수}점`, tag: 평가.욕창위험_등급, type: 'grade' as const },
            { label: '통증 (NRS)', value: `${평가.통증_NRS}/10`, tag: 평가.통증_NRS >= 7 ? '중증' : 평가.통증_NRS >= 4 ? '중등도' : '경도', type: 'grade' as const },
            { label: '영양 (MNA-SF)', value: `${평가.영양위험_MNA}/14`, tag: 평가.영양상태, type: 'nutrition' as const },
            { label: '우울 (GDS-SF)', value: `${평가.우울_GDS}/15`, tag: 평가.우울_의심 ? '⚠ 우울의심' : '정상', type: 'bool' as const },
            { label: '6개월 낙상이력', value: '', tag: 평가.낙상이력_6개월 ? '있음' : '없음', type: 'bool' as const },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between">
              <span className="text-[11px] text-slate-600 dark:text-slate-400">{item.label}</span>
              <div className="flex items-center gap-1.5">
                {item.value && <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">{item.value}</span>}
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  item.tag === '낮음' || item.tag === '정상' || item.tag === '경도' || item.tag === '없음' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400' :
                  item.tag === '중간' || item.tag === '중등도' || item.tag === '위험' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400' :
                  'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400'
                }`}>{item.tag}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 종합소견 */}
      <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 rounded-2xl">
        <p className="text-[11px] font-bold text-blue-800 dark:text-blue-300 mb-1 flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5" />종합소견 및 퇴원 후 권고사항
        </p>
        <p className="text-xs text-blue-900 dark:text-blue-200 leading-relaxed">{평가.종합소견}</p>
      </div>

      <div className="flex justify-end">
        <button onClick={onNext} className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-bold shadow-apple-sm active:scale-95 transition cursor-pointer">
          돌봄계획 수립 <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════
// 단계 3: 돌봄계획
// ═══════════════════════════════════════════════════

const Step돌봄계획: React.FC<{
  환자: 퇴원환자_정보;
  평가: 심층평가_항목;
  resources: 돌봄_자원_추천항목[];
  onResourceChange: (id: string, 상태: '미의뢰' | '의뢰중' | '접수완료') => void;
  onNext: () => void;
}> = ({ 환자, 평가, resources, onResourceChange, onNext }) => {

  const 돌봄영역 = [
    { 영역: '신체기능 회복', 아이콘: '🏃', 필요: 평가.ADL_총점 < 70, 내용: `ADL ${평가.ADL_총점}점 · 가정방문 재활 우선 권고` },
    { 영역: '인지·정신건강', 아이콘: '🧠', 필요: 평가.인지장애_의심 || 평가.우울_의심, 내용: `${평가.인지장애_의심 ? 'MoCA ' + 평가.MoCA_총점 + '점 인지장애 의심 ' : ''}${평가.우울_의심 ? '· GDS ' + 평가.우울_GDS + '점 우울 의심' : ''}` },
    { 영역: '욕창·낙상 예방', 아이콘: '🛡️', 필요: 평가.욕창위험_등급 !== '낮음' || 평가.낙상위험_등급 !== '낮음', 내용: `욕창 ${평가.욕창위험_등급} / 낙상 ${평가.낙상위험_등급} 위험` },
    { 영역: '영양 관리', 아이콘: '🥗', 필요: 평가.영양상태 !== '정상', 내용: `MNA-SF ${평가.영양위험_MNA}점 · ${평가.영양상태}` },
    { 영역: '일상생활 지원', 아이콘: '🏠', 필요: 평가.IADL_총점 <= 5, 내용: `IADL ${평가.IADL_총점}점 · 가사·이동 보조 필요` },
    { 영역: '의료서비스 연계', 아이콘: '💊', 필요: true, 내용: '방문간호·장기요양 등급 신청 권고' },
  ];

  return (
    <div className="space-y-5">
      {/* 돌봄 필요 영역 매트릭스 */}
      <div>
        <p className="text-xs font-bold text-slate-800 dark:text-white mb-2 flex items-center gap-2">
          <ClipboardList className="w-4 h-4 text-[#0071e3]" />
          평가 기반 돌봄 필요 영역
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {돌봄영역.map((item, i) => (
            <div key={i} className={`p-3 rounded-2xl border text-left transition-all ${
              item.필요
                ? 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800/60'
                : 'bg-slate-50 dark:bg-slate-900/40 border-slate-100 dark:border-slate-800/50 opacity-50'
            }`}>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-base">{item.아이콘}</span>
                <span className={`text-[11px] font-bold ${item.필요 ? 'text-indigo-800 dark:text-indigo-300' : 'text-slate-500 dark:text-slate-500'}`}>{item.영역}</span>
                {item.필요 && <Check className="w-3 h-3 text-indigo-600 dark:text-indigo-400 ml-auto" />}
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-snug">{item.내용}</p>
            </div>
          ))}
        </div>
      </div>

      {/* AI 매칭 자원 리스트 */}
      <div>
        <p className="text-xs font-bold text-slate-800 dark:text-white mb-2 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#af52de]" />
          AI 추천 연계 자원 ({resources.length}개 기관)
          <span className="text-[10px] text-slate-400 font-normal">— 의뢰 상태를 선택하세요</span>
        </p>
        <div className="space-y-2">
          {resources.map((res) => (
            <div key={res.자원ID} className={`p-3.5 rounded-2xl border transition-all ${
              res.연계상태 === '접수완료' ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/50' :
              res.연계상태 === '의뢰중' ? 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800/50' :
              'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800'
            }`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#0071e3]/10 text-[#0071e3] dark:bg-blue-900/40 dark:text-blue-300">{res.분류}</span>
                    <span className="text-[10px] font-bold text-[#af52de] dark:text-purple-400">적합도 {res.적합도점수}%</span>
                  </div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">{res.자원명}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">{res.기관명}</p>
                  <p className="text-[10px] text-slate-600 dark:text-slate-300 mt-1 leading-snug">{res.지원내용}</p>
                </div>
                {/* 상태 버튼 그룹 */}
                <div className="flex flex-col gap-1 shrink-0">
                  {(['미의뢰', '의뢰중', '접수완료'] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => onResourceChange(res.자원ID, s)}
                      className={`text-[10px] font-bold px-2 py-1 rounded-lg border transition cursor-pointer ${
                        res.연계상태 === s
                          ? s === '접수완료' ? 'bg-emerald-600 text-white border-emerald-600' :
                            s === '의뢰중' ? 'bg-[#0071e3] text-white border-[#0071e3]' :
                            'bg-slate-700 text-white border-slate-700'
                          : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-400'
                      }`}
                    >{s}</button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={onNext} className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-bold shadow-apple-sm active:scale-95 transition cursor-pointer">
          의뢰서 자동생성 <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════
// 단계 4: 복지관 연계 의뢰서 자동생성
// ═══════════════════════════════════════════════════

const Step의뢰서: React.FC<{
  환자: 퇴원환자_정보;
  평가: 심층평가_항목;
  resources: 돌봄_자원_추천항목[];
}> = ({ 환자, 평가, resources }) => {
  const [생성됨, set생성됨] = useState(false);
  const [생성중, set생성중] = useState(false);
  const [전송알림, set전송알림] = useState(false);
  const 오늘 = new Date().toISOString().slice(0, 10);
  const 연계자원 = resources.filter(r => r.연계상태 !== '미의뢰');

  const handle생성 = () => {
    set생성중(true);
    setTimeout(() => { set생성됨(true); set생성중(false); }, 900);
  };

  return (
    <div className="space-y-5">
      {!생성됨 ? (
        /* 생성 전 미리보기 안내 */
        <div className="space-y-4">
          <div className="bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60 rounded-2xl p-4">
            <p className="text-xs font-bold text-indigo-800 dark:text-indigo-300 flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4" />
              자동생성될 의뢰서 정보 미리보기
            </p>
            <div className="space-y-1.5 text-[11px] text-slate-600 dark:text-slate-300">
              <div className="flex gap-2"><span className="font-semibold text-slate-500 dark:text-slate-400 w-20 shrink-0">환자명</span><span>{환자.이름} ({환자.연령}세/{환자.성별})</span></div>
              <div className="flex gap-2"><span className="font-semibold text-slate-500 dark:text-slate-400 w-20 shrink-0">진단명</span><span>{환자.진단명}</span></div>
              <div className="flex gap-2"><span className="font-semibold text-slate-500 dark:text-slate-400 w-20 shrink-0">거주지</span><span>{환자.거주지}</span></div>
              <div className="flex gap-2"><span className="font-semibold text-slate-500 dark:text-slate-400 w-20 shrink-0">ADL/MoCA</span><span>ADL {평가.ADL_총점}점 · MoCA {평가.MoCA_총점}점</span></div>
              <div className="flex gap-2"><span className="font-semibold text-slate-500 dark:text-slate-400 w-20 shrink-0">연계 기관</span>
                <span>{연계자원.length > 0 ? 연계자원.map(r => r.기관명).join(', ') : resources.map(r => r.기관명).join(', ')}</span>
              </div>
              <div className="flex gap-2"><span className="font-semibold text-slate-500 dark:text-slate-400 w-20 shrink-0">작성일</span><span>{오늘}</span></div>
            </div>
          </div>

          <button
            onClick={handle생성}
            disabled={생성중}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-[#0071e3] to-[#af52de] text-white font-bold text-sm shadow-apple-sm active:scale-[0.99] transition cursor-pointer disabled:opacity-60"
          >
            {생성중 ? (
              <><RefreshCw className="w-4 h-4 animate-spin" />의뢰서 생성 중…</>
            ) : (
              <><Sparkles className="w-4 h-4" />AI 연계 의뢰서 자동생성</>
            )}
          </button>
        </div>
      ) : (
        /* 생성된 의뢰서 */
        <div className="space-y-4">
          {/* 의뢰서 본문 */}
          <div className="border border-slate-300 dark:border-slate-700 rounded-2xl overflow-hidden">
            {/* 의뢰서 헤더 */}
            <div className="bg-slate-800 dark:bg-slate-900 px-5 py-3 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-slate-400 font-medium tracking-widest">보건복지부 공공병원 퇴원환자 지역사회 연계사업</p>
                <p className="text-sm font-black text-white">퇴원환자 지역사회 연계 의뢰서</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-400">문서번호</p>
                <p className="text-xs font-bold text-slate-200">REF-{환자.환자번호}-{오늘.replace(/-/g,'')}</p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-950 p-5 space-y-5">
              {/* 환자 기본 정보 */}
              <section>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">1. 환자 기본 정보</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { label: '성명', value: 환자.이름 },
                    { label: '생년/성별', value: `${환자.연령}세 / ${환자.성별}` },
                    { label: '가구 형태', value: 환자.가구특성 },
                    { label: '거동 상태', value: 환자.거동상태 },
                    { label: '주거지', value: 환자.거주지 },
                    { label: '주요 진단', value: 환자.진단명.split('(')[0].trim() },
                    { label: '질병코드', value: 환자.질병코드 },
                    { label: '퇴원 예정일', value: 환자.퇴원예정일 },
                  ].map((item, i) => (
                    <div key={i} className={`bg-slate-50 dark:bg-slate-900 rounded-xl p-2.5 ${i >= 4 ? 'sm:col-span-2' : ''}`}>
                      <p className="text-[9px] font-semibold text-slate-400 uppercase">{item.label}</p>
                      <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200 mt-0.5">{item.value}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* 심층평가 요약 */}
              <section>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">2. 심층평가 결과 요약</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { label: 'ADL (Barthel)', value: `${평가.ADL_총점}점`, sub: 평가.ADL_총점 < 60 ? '고도 의존' : '중등도 의존', danger: 평가.ADL_총점 < 60 },
                    { label: 'IADL (Lawton)', value: `${평가.IADL_총점}/8점`, sub: 평가.IADL_총점 <= 3 ? '고도 의존' : '중등도 의존', danger: 평가.IADL_총점 <= 3 },
                    { label: 'MoCA 인지', value: `${평가.MoCA_총점}/30점`, sub: 평가.인지장애_의심 ? '인지장애 의심' : '정상범위', danger: 평가.인지장애_의심 },
                    { label: '낙상 위험', value: `${평가.낙상위험_점수}점`, sub: `${평가.낙상위험_등급} 위험`, danger: 평가.낙상위험_등급 === '높음' },
                    { label: '욕창 위험', value: `Braden ${평가.욕창위험_점수}점`, sub: `${평가.욕창위험_등급} 위험`, danger: 평가.욕창위험_등급 === '높음' },
                    { label: '통증', value: `NRS ${평가.통증_NRS}/10`, sub: 평가.통증_NRS >= 7 ? '중증' : '중등도', danger: 평가.통증_NRS >= 7 },
                    { label: '영양', value: `MNA ${평가.영양위험_MNA}/14`, sub: 평가.영양상태, danger: 평가.영양상태 !== '정상' },
                    { label: '우울', value: `GDS ${평가.우울_GDS}/15`, sub: 평가.우울_의심 ? '우울 의심' : '정상', danger: 평가.우울_의심 },
                  ].map((item, i) => (
                    <div key={i} className={`rounded-xl p-2.5 border ${item.danger ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800/40' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800'}`}>
                      <p className="text-[9px] font-semibold text-slate-400 uppercase">{item.label}</p>
                      <p className={`text-sm font-black mt-0.5 ${item.danger ? 'text-red-600 dark:text-red-400' : 'text-slate-700 dark:text-slate-300'}`}>{item.value}</p>
                      <p className={`text-[10px] font-semibold ${item.danger ? 'text-red-500' : 'text-slate-400'}`}>{item.sub}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/40 rounded-xl">
                  <p className="text-[10px] font-semibold text-blue-700 dark:text-blue-300 mb-0.5">종합소견</p>
                  <p className="text-[11px] text-blue-900 dark:text-blue-200 leading-relaxed">{평가.종합소견}</p>
                </div>
              </section>

              {/* 연계 기관 및 서비스 */}
              <section>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">3. 연계 기관 및 요청 서비스</h4>
                <div className="space-y-2">
                  {resources.map((res, i) => (
                    <div key={res.자원ID} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                      <div className="w-5 h-5 rounded-full bg-[#0071e3] text-white flex items-center justify-center text-[10px] font-black flex-shrink-0 mt-0.5">{i + 1}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{res.자원명}</p>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${res.연계상태 === '접수완료' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400' : res.연계상태 === '의뢰중' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400' : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400'}`}>{res.연계상태}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">{res.기관명}</p>
                        <p className="text-[10px] text-slate-600 dark:text-slate-300 mt-0.5">{res.지원내용}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* 서명란 */}
              <section className="border-t border-slate-200 dark:border-slate-800 pt-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  {['의뢰기관 (지방의료원)', '담당 코디네이터', '수신기관 확인'].map((label, i) => (
                    <div key={i}>
                      <p className="text-[10px] font-semibold text-slate-400 mb-3">{label}</p>
                      <div className="border-b border-slate-300 dark:border-slate-700 h-8" />
                      <p className="text-[10px] text-slate-400 mt-1">(서명)</p>
                    </div>
                  ))}
                </div>
                <p className="text-center text-[10px] text-slate-400 mt-3">작성일: {오늘} · 본 의뢰서는 보건복지부 공공병원 퇴원환자 지역사회 연계사업 표준서식에 따라 자동 생성되었습니다.</p>
              </section>
            </div>
          </div>

          {/* 액션 버튼 */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <button
              onClick={() => set전송알림(true)}
              className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-bold transition shadow-apple-sm active:scale-[0.99] cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />전자 전송 (행복e음 연동)
              <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-md">연동 준비중</span>
            </button>
            <button
              className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition active:scale-[0.99] cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />인쇄
            </button>
            <button
              className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition active:scale-[0.99] cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />PDF 저장
            </button>
          </div>

          {전송알림 && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 rounded-2xl flex items-center justify-between text-xs animate-in fade-in">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
                <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                <span>보건복지부 차세대 사회보장정보시스템(행복e음) 정식 연동 후 전자 전송이 제공될 예정입니다.</span>
              </div>
              <button onClick={() => set전송알림(false)} className="text-amber-600 hover:text-amber-800 p-1 cursor-pointer"><X className="w-3.5 h-3.5" /></button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════
// 메인 컴포넌트
// ═══════════════════════════════════════════════════

const STEPS = [
  { id: 1, label: '스크리닝', icon: Stethoscope, color: 'from-sky-500 to-blue-600' },
  { id: 2, label: '심층평가', icon: ClipboardList, color: 'from-indigo-500 to-violet-600' },
  { id: 3, label: '돌봄계획', icon: ClipboardCheck, color: 'from-violet-500 to-purple-600' },
  { id: 4, label: '연계 의뢰서 자동생성', icon: Handshake, color: 'from-purple-500 to-pink-600' },
];

export const 퇴원환자_돌봄자원_AI매칭: React.FC = () => {
  const [selected_patient, set_selected_patient] = useState<퇴원환자_정보>(SAMPLE_PATIENTS[0]);
  const [current_step, set_current_step] = useState(1);
  const [is_assessment_loading, set_is_assessment_loading] = useState(false);
  const [loaded_assessment, set_loaded_assessment] = useState<심층평가_항목 | null>(SAMPLE_PATIENTS[0].심층평가 ?? null);
  const [resources, set_resources] = useState<돌봄_자원_추천항목[]>(RESOURCES_MAP[SAMPLE_PATIENTS[0].환자번호] ?? []);

  // 환자 변경 시 심층평가 자동 로딩
  useEffect(() => {
    set_is_assessment_loading(true);
    set_loaded_assessment(null);
    set_current_step(1);
    set_resources(RESOURCES_MAP[selected_patient.환자번호] ?? []);
    const t = setTimeout(() => {
      set_loaded_assessment(selected_patient.심층평가 ?? null);
      set_is_assessment_loading(false);
    }, 600);
    return () => clearTimeout(t);
  }, [selected_patient]);

  const handle_patient_change = (번호: string) => {
    const p = SAMPLE_PATIENTS.find(item => item.환자번호 === 번호);
    if (p) set_selected_patient(p);
  };

  const handle_resource_change = (id: string, 상태: '미의뢰' | '의뢰중' | '접수완료') => {
    set_resources(prev => prev.map(r => r.자원ID === id ? { ...r, 연계상태: 상태 } : r));
  };

  const goToStep = (step: number) => {
    if (step <= current_step || step === current_step + 1) set_current_step(step);
  };

  return (
    <div className="bg-white dark:bg-[#15161b] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">

      {/* ── 컴포넌트 헤더 ── */}
      <div className="px-6 pt-6 pb-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#af52de] to-[#0071e3] flex items-center justify-center shadow-apple-sm">
            <HeartHandshake className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">공공보건의료 협력·연계 및 퇴원환자 케어체계</span>
              <span className="px-2 py-0.5 rounded-full bg-[#af52de]/10 text-[#af52de] dark:text-[#d48cf6] text-[10px] font-bold">지방의료원 코디네이터 전용</span>
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
              퇴원환자 지역사회 돌봄자원 AI 매칭 &amp; 원클릭 연계
            </h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
              보건복지부 공공병원 퇴원환자 지역사회 연계사업 표준 4단계
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">대상 환자:</span>
          <select
            value={selected_patient.환자번호}
            onChange={e => handle_patient_change(e.target.value)}
            className="text-xs font-semibold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full px-3 py-1.5 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30"
          >
            {SAMPLE_PATIENTS.map(p => (
              <option key={p.환자번호} value={p.환자번호} className="bg-white dark:bg-slate-900">
                {p.이름} ({p.연령}세/{p.성별}) - {p.진단명.split(' ')[0]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── 4단계 스텝 인디케이터 ── */}
      <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            const done = current_step > step.id;
            const active = current_step === step.id;
            const clickable = step.id <= current_step;
            return (
              <React.Fragment key={step.id}>
                <button
                  onClick={() => clickable && goToStep(step.id)}
                  disabled={!clickable}
                  className={`flex flex-col items-center gap-1 transition-all ${clickable ? 'cursor-pointer' : 'cursor-default'}`}
                >
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm ${
                    done ? 'bg-emerald-500 text-white' :
                    active ? `bg-gradient-to-br ${step.color} text-white shadow-md scale-110` :
                    'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500'
                  }`}>
                    {done ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                  </div>
                  <span className={`text-[10px] font-bold whitespace-nowrap hidden sm:block ${
                    active ? 'text-slate-900 dark:text-white' :
                    done ? 'text-emerald-600 dark:text-emerald-400' :
                    'text-slate-400 dark:text-slate-600'
                  }`}>{step.label}</span>
                </button>
                {idx < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 rounded-full transition-all duration-500 ${current_step > step.id ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* ── 단계별 콘텐츠 ── */}
      <div className="p-6">
        {/* 예시 안내 */}
        <div className="mb-4 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-[10px] text-amber-700 dark:text-amber-300">
          <strong>예시 화면:</strong> 가상 환자·기관·평가 데이터를 이용한 시뮬레이터입니다. 실제 연계 기능은 시스템 연동 후 제공됩니다.
        </div>

        {current_step === 1 && (
          <Step스크리닝 환자={selected_patient} onNext={() => set_current_step(2)} />
        )}
        {current_step === 2 && loaded_assessment && (
          <Step심층평가 평가={loaded_assessment} 로딩={is_assessment_loading} onNext={() => set_current_step(3)} />
        )}
        {current_step === 2 && !loaded_assessment && !is_assessment_loading && (
          <div className="py-12 text-center text-slate-400 dark:text-slate-600 text-sm">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p>이 환자의 심층 평가 데이터가 등록되지 않았습니다.</p>
            <button onClick={() => set_current_step(3)} className="mt-3 text-xs text-[#0071e3] underline cursor-pointer">평가 없이 돌봄계획 수립으로 진행</button>
          </div>
        )}
        {current_step === 2 && is_assessment_loading && (
          <Step심층평가 평가={{} as 심층평가_항목} 로딩={true} onNext={() => set_current_step(3)} />
        )}
        {current_step === 3 && loaded_assessment && (
          <Step돌봄계획 환자={selected_patient} 평가={loaded_assessment} resources={resources} onResourceChange={handle_resource_change} onNext={() => set_current_step(4)} />
        )}
        {current_step === 4 && loaded_assessment && (
          <Step의뢰서 환자={selected_patient} 평가={loaded_assessment} resources={resources} />
        )}
      </div>
    </div>
  );
};
