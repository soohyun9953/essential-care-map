'use client';

import React from 'react';
import { Link2, Smartphone } from 'lucide-react';
import { 퇴원환자_돌봄자원_AI매칭 } from './퇴원환자_돌봄자원_AI매칭';

// ② 의료기관 담당자 › 2-4 퇴원환자 케어플랜·돌봄자원 매칭 AI(AP-01)
// 기존 [의료기관 › 퇴원환자 돌봄자원 매칭] 탭(김공공/박돌봄 프리셋, ADL 10개 영역, 다학제 소견, 의뢰서 모달)을 전폭으로 렌더링한다.

export function 퇴원환자_연계_업무화면() {
  return (
    <div className="w-full p-4 sm:p-6 lg:p-8 space-y-4">
      {/* 상단 배지 */}
      <div className="flex flex-wrap items-center gap-2">
        <span
          className="px-3 py-1.5 rounded-xl text-xs font-black bg-blue-600 text-white flex items-center gap-1.5 shadow-xs"
          title="본 사업 구현 대상: 병원 EMR과 HL7 FHIR로 연동해 퇴원환자 정보를 다시 입력하지 않게 하는 기능 (이 프로토타입은 화면 입력)"
        >
          <Link2 className="w-3.5 h-3.5" /> 차세대 공공의료 연계망 (EMR HL7 FHIR 연동 · 이중입력 방지)
        </span>
        <span
          className="px-3 py-1.5 rounded-xl text-xs font-black bg-emerald-600 text-white flex items-center gap-1.5 shadow-xs"
          title="본 사업 구현 대상: 환자·보호자가 휴대폰으로 개인정보 제공에 동의하는 기능 (이 프로토타입에는 없음)"
        >
          <Smartphone className="w-3.5 h-3.5" /> 모바일 전자동의
        </span>
        <span className="text-[11px] text-slate-500">두 기능은 본 사업 구현 대상이며, 이 프로토타입에서는 화면에 직접 입력합니다.</span>
      </div>

      {/* 퇴원환자 돌봄자원 매칭 (전폭 렌더링) */}
      <div className="w-full min-w-0">
        <퇴원환자_돌봄자원_AI매칭 />
      </div>
    </div>
  );
}
