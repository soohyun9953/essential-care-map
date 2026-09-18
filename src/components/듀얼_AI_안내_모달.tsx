'use client';

import React from 'react';
import {
  X,
  Sparkles,
  Cloud,
  Laptop,
  ShieldCheck,
  ShieldAlert,
  Coins,
  Zap,
  CheckCircle2,
  ArrowRight,
  Lock,
  FileText,
} from 'lucide-react';

interface 듀얼_AI_안내_모달_속성 {
  is_open: boolean;
  on_close: () => void;
}

export const 듀얼_AI_안내_모달: React.FC<듀얼_AI_안내_모달_속성> = ({ is_open, on_close }) => {
  if (!is_open) return null;

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-black/[0.08] w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* 헤더 */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-between border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#0071e3] to-[#34c759] text-white flex items-center justify-center shadow-apple-sm">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded-full bg-white/10 text-emerald-300 text-[10px] font-bold">
                  초간단 가이드
                </span>
                <span className="text-white/60 text-xs font-medium">| 한눈에 이해하기</span>
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                💡 공공의료 ‘듀얼 AI’란 무엇인가요?
              </h3>
            </div>
          </div>

          <button
            onClick={on_close}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition"
            title="닫기"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 본문 스크롤 영역 */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto">
          {/* 핵심 한 줄 요약 박스 */}
          <div className="bg-blue-50/80 border border-blue-200/80 rounded-2xl p-4 text-[#1d1d1f]">
            <p className="text-xs sm:text-sm font-semibold leading-relaxed text-blue-950">
              📌 <strong>한마디로:</strong> 업무 성격에 따라 <strong>‘똑똑한 외부 AI’</strong>와{' '}
              <strong>‘안전한 내 컴퓨터 AI’</strong> 중 나에게 맞는 것을 쏙 골라 쓸 수 있는 맞춤형 듀얼 기능입니다!
            </p>
          </div>

          {/* 1:1 쉬운 비교 카드 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 좌측: 외부 클라우드 AI */}
            <div className="bg-[#f5f8ff] p-5 rounded-2xl border border-blue-200 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center space-x-2.5 pb-2.5 border-b border-blue-100">
                  <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
                    <Cloud className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-blue-600">외부 클라우드 AI</span>
                    <h4 className="text-sm font-bold text-slate-900">Google Gemini</h4>
                  </div>
                </div>

                <div className="mt-3 space-y-2 text-xs text-slate-700">
                  <p className="font-semibold text-blue-900 flex items-center gap-1">
                    <span>🧠</span>
                    <span>&quot;병원 밖의 슈퍼 브레인&quot;</span>
                  </p>
                  <ul className="space-y-1.5 text-slate-600 leading-snug">
                    <li className="flex items-start gap-1.5">
                      <span className="text-blue-500 font-bold">✔</span>
                      <span><strong>종합 기획서 작성:</strong> 방대한 법령을 엮어서 장문의 완벽한 공문서 초안을 척척 작성</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-blue-500 font-bold">✔</span>
                      <span><strong>최신 지식 활용:</strong> 구글의 거대 모델이 폭넓고 매끄러운 문장력 제공</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="pt-2 border-t border-blue-100 text-[11px] space-y-1 text-slate-500">
                <div className="flex items-center gap-1.5 text-amber-700 font-medium">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>인터넷망 통신 (환자 개인정보 전송 금지)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Coins className="w-3.5 h-3.5 text-slate-400" />
                  <span>호출 시 토큰 요금 발생 (무료 한도 지원)</span>
                </div>
              </div>
            </div>

            {/* 우측: 노트북 로컬 sLLM */}
            <div className="bg-[#f4fbf6] p-5 rounded-2xl border border-emerald-200 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center space-x-2.5 pb-2.5 border-b border-emerald-100">
                  <div className="w-8 h-8 rounded-xl bg-[#34c759] text-white flex items-center justify-center shadow-sm">
                    <Laptop className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-emerald-700">노트북 On-Device AI</span>
                    <h4 className="text-sm font-bold text-slate-900">Qwen2.5 (로컬 sLLM)</h4>
                  </div>
                </div>

                <div className="mt-3 space-y-2 text-xs text-slate-700">
                  <p className="font-semibold text-emerald-900 flex items-center gap-1">
                    <span>🛡️</span>
                    <span>&quot;병원 안의 완벽한 안전 금고&quot;</span>
                  </p>
                  <ul className="space-y-1.5 text-slate-600 leading-snug">
                    <li className="flex items-start gap-1.5">
                      <span className="text-emerald-600 font-bold">✔</span>
                      <span><strong>100% 정보 유출 차단:</strong> 인터넷 선을 뽑아도 내 노트북 안에서만 연산되어 데이터 유출 0%</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-emerald-600 font-bold">✔</span>
                      <span><strong>비용 0원 무제한:</strong> 외부 서버를 거치지 않아 평생 공짜로 무제한 사용</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="pt-2 border-t border-emerald-100 text-[11px] space-y-1 text-slate-500">
                <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>원내 폐쇄망 보안 특화 (환자 EMR 안심 분석)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-emerald-600" />
                  <span>내 컴퓨터 하드웨어 연산 (비용 평생 0원)</span>
                </div>
              </div>
            </div>
          </div>

          {/* 🎯 어떨 때 무엇을 쓰면 좋을까요? 꿀팁 가이드 */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-2.5">
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <span>🎯</span>
              <span>어떤 AI를 선택하면 좋을까요? (추천 가이드)</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-3 bg-white rounded-xl border border-slate-200/60 flex items-start gap-2">
                <FileText className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-blue-900 block mb-0.5">외부 클라우드 AI 추천</strong>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    복지부 국고보조금 제안서, 중장기 발전계획서처럼 <strong>문장이 매끄럽고 길게 잘 써야 할 때</strong>
                  </p>
                </div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200/60 flex items-start gap-2">
                <Lock className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-emerald-900 block mb-0.5">노트북 로컬 AI 추천</strong>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    환자 진료기록(EMR) 요약, 관내 비식별 통계처럼 <strong>환자 정보가 단 1바이트도 나가면 안 될 때</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 푸터 */}
        <div className="p-4 bg-slate-50 border-t border-black/[0.05] flex items-center justify-between">
          <div className="text-[11px] text-slate-500 hidden sm:flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>상단 [1:1 비교 스튜디오]에서 두 AI의 답변을 동시에 확인해 보세요!</span>
          </div>

          <button
            onClick={on_close}
            className="w-full sm:w-auto px-6 py-2.5 rounded-2xl text-xs font-bold bg-[#0071e3] hover:bg-[#0077ed] text-white shadow-apple-sm transition flex items-center justify-center gap-1.5 ml-auto"
          >
            <span>이해했어요! 직접 비교해보기</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
