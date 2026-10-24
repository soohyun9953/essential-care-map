'use client';

import React, { useState } from 'react';
import { ChevronDown, Link2, ShieldCheck, Smartphone } from 'lucide-react';
import { 퇴원환자_돌봄자원_AI매칭 } from './퇴원환자_돌봄자원_AI매칭';

// ② 의료기관 담당자 › 2-2 퇴원환자 케어플랜·돌봄자원 매칭 AI(AP-01)
// 기존 [의료기관 › 퇴원환자 돌봄자원 매칭] 탭(김공공/박돌봄 프리셋, ADL 10개 영역, 다학제 소견, 의뢰서 모달)을 그대로 사용하고
// 상단에 목표 연계 기능 배지, 우측 하단에 개인정보보호 준수 가이드 & 돌봄제도 FAQ(AIS-01-06) 카드를 둔다.

const 개인정보_가이드: { 항목: string; 근거: string }[] = [
  { 항목: '건강정보는 민감정보입니다. 진료 목적 외에 지역 돌봄기관과 공유하려면 환자의 별도 동의를 받아야 합니다.', 근거: '「개인정보 보호법」 제23조' },
  { 항목: '보건소·복지관 등 다른 기관에 넘기는 것은 제3자 제공입니다. 받는 기관·목적·항목·보유기간·거부권을 알리고 동의를 받으세요.', 근거: '「개인정보 보호법」 제17조' },
  { 항목: '의뢰서에는 연계에 꼭 필요한 정보만 담고(최소 수집), 주민등록번호는 법령 근거가 없으면 넣지 마세요.', 근거: '「개인정보 보호법」 제16조·제24조의2' },
  { 항목: '진료기록 자체를 외부에 열람·사본 제공하는 것은 환자 동의 등 법에서 정한 경우에만 가능합니다.', 근거: '「의료법」 제21조' },
];

const 돌봄_FAQ: { 질문: string; 답변: string; 근거: string }[] = [
  {
    질문: '장기요양 등급은 어디서 신청하나요?',
    답변: '65세 이상 또는 노인성 질병이 있는 분은 국민건강보험공단에 신청하면 방문조사 후 등급판정위원회가 등급을 정합니다. 등급을 받으면 방문요양·방문간호 등 재가급여를 이용할 수 있습니다.',
    근거: '「노인장기요양보험법」, 국민건강보험공단 노인장기요양보험',
  },
  {
    질문: '퇴원 후 지역 통합돌봄은 어떻게 연결하나요?',
    답변: '「의료·요양 등 지역 돌봄의 통합지원에 관한 법률」(2026년 3월 시행)에 따라 시군구가 의료·요양·돌봄 서비스를 연계합니다. 시군구 통합돌봄 창구로 의뢰하고, 세부 절차는 해당 지자체 지침을 확인하세요.',
    근거: '「의료·요양 등 지역 돌봄의 통합지원에 관한 법률」',
  },
  {
    질문: '병원의 퇴원지원 활동에 수가가 있나요?',
    답변: '급성기 환자 퇴원지원 및 지역사회 연계활동 시범사업 참여기관은 통합퇴원계획관리료·지역사회연계관리료 등을 산정합니다. 세부 기준은 심평원 시범사업 지침 원문을 확인하세요.',
    근거: '보건복지부·심평원 「급성기 환자 퇴원지원 및 지역사회 연계활동 시범사업」 지침',
  },
];

export function 퇴원환자_연계_업무화면() {
  const [열린_FAQ, set_열린_FAQ] = useState<number | null>(0);
  return (
    <div className="w-full p-4 sm:p-6 lg:p-8 space-y-4">
      {/* 상단 배지 */}
      <div className="flex flex-wrap items-center gap-2">
        <span
          className="px-3 py-1.5 rounded-xl text-xs font-black bg-blue-600 text-white flex items-center gap-1.5 shadow-xs"
          title="본 사업 구현 대상: 병원 EMR과 HL7 FHIR로 연동해 퇴원환자 정보를 다시 입력하지 않게 하는 기능 (이 프로토타입은 화면 입력)"
        >
          <Link2 className="w-3.5 h-3.5" /> [AP-01] 차세대 공공의료 연계망 (EMR HL7 FHIR 연동 · 이중입력 방지)
        </span>
        <span
          className="px-3 py-1.5 rounded-xl text-xs font-black bg-emerald-600 text-white flex items-center gap-1.5 shadow-xs"
          title="본 사업 구현 대상: 환자·보호자가 휴대폰으로 개인정보 제공에 동의하는 기능 (이 프로토타입에는 없음)"
        >
          <Smartphone className="w-3.5 h-3.5" /> 모바일 전자동의(APP-222)
        </span>
        <span className="text-[11px] text-slate-500">두 기능은 본 사업 구현 대상이며, 이 프로토타입에서는 화면에 직접 입력합니다.</span>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_340px] gap-4 items-end">
        {/* 기존 퇴원환자 돌봄자원 매칭 (데이터·기능 그대로) */}
        <div className="min-w-0">
          <퇴원환자_돌봄자원_AI매칭 />
        </div>

        {/* 우측 하단: 개인정보보호 준수 가이드 & 돌봄제도 FAQ */}
        <aside className="xl:sticky xl:bottom-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3 shadow-sm">
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              공공보건의료 협력체계 개인정보보호 준수 가이드 & 돌봄제도 AI FAQ
            </h3>
            <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">AIS-01-06 · 프로토타입은 고정 답변</span>
          </div>
          <ul className="space-y-1.5">
            {개인정보_가이드.map((g) => (
              <li key={g.근거} className="text-[11px] text-slate-700 dark:text-slate-300 leading-snug">
                ✔ {g.항목} <span className="text-slate-400">({g.근거})</span>
              </li>
            ))}
          </ul>
          <div className="border-t border-slate-100 dark:border-slate-800 pt-2 space-y-1">
            {돌봄_FAQ.map((f, i) => (
              <div key={f.질문}>
                <button
                  type="button"
                  onClick={() => set_열린_FAQ(열린_FAQ === i ? null : i)}
                  className="w-full flex items-center justify-between gap-2 text-left text-xs font-bold text-slate-800 dark:text-slate-200 py-1 cursor-pointer"
                  aria-expanded={열린_FAQ === i}
                >
                  Q. {f.질문}
                  <ChevronDown className={`w-3.5 h-3.5 shrink-0 transition ${열린_FAQ === i ? 'rotate-180' : ''}`} />
                </button>
                {열린_FAQ === i && (
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug pb-1">
                    {f.답변} <span className="text-slate-400">({f.근거})</span>
                  </p>
                )}
              </div>
            ))}
          </div>
          <p className="text-[10px] text-slate-400">일반 안내입니다. 세부 기준은 법령·지침 원문과 기관 내부 규정을 확인하세요.</p>
        </aside>
      </div>
    </div>
  );
}
