'use client';

// 공공보건의료 협력·연계 및 퇴원환자 케어체계: 퇴원환자 지역사회 돌봄자원 AI 매칭 & 원클릭 연계 시뮬레이터

import React, { useState } from 'react';
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
} from 'lucide-react';
import { 퇴원환자_정보, 돌봄_자원_추천항목 } from '@/lib/필수의료_타입';

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

export const 퇴원환자_돌봄자원_AI매칭: React.FC = () => {
  const [selected_patient, set_selected_patient] = useState<퇴원환자_정보>(SAMPLE_PATIENTS[0]);
  const [resources, set_resources] = useState<돌봄_자원_추천항목[]>(INITIAL_RECOMMENDED_RESOURCES);
  const [is_matching, set_is_matching] = useState(false);
  const [referral_notice, set_referral_notice] = useState<string | null>(null);

  // AI 매칭 재실행
  const handle_run_ai_match = () => {
    set_is_matching(true);
    setTimeout(() => {
      set_is_matching(false);
      set_resources(INITIAL_RECOMMENDED_RESOURCES.map((r) => ({ ...r, 연계상태: '미의뢰' })));
    }, 600);
  };

  // 원클릭 일괄 연계의뢰서 전송 안내
  const handle_send_all_referrals = () => {
    set_referral_notice('퇴원환자 연계의뢰서 전자 전송 기능은 보건복지부 차세대 사회보장정보시스템(행복e음) 및 지자체 돌봄망 정식 연동 후 제공될 예정입니다.');
  };

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

        {/* 환자 선택 셀렉터 (가상 환자) */}
        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">대상 환자:</span>
          <select
            value={selected_patient.환자번호}
            onChange={(e) => {
              const p = SAMPLE_PATIENTS.find((item) => item.환자번호 === e.target.value);
              if (p) {
                set_selected_patient(p);
                handle_run_ai_match();
              }
            }}
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

      {/* 환자 프로필 요약 카드 (다크모드 완벽 지원) */}
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

      {/* 예시 데이터 안내 (실제 기관·환자 현황 아님) */}
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
                {/* 상단 뱃지 & 적합도 */}
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

              {/* 하단 연계 상태 */}
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

      {/* 하단 액션 바: 연계의뢰서 전송 (준비 중 안내) */}
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
