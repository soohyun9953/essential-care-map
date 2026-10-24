'use client';

import React, { useEffect, useRef, useState } from 'react';
import { BookOpen, FileSearch, Sparkles } from 'lucide-react';
import { AI_질의_입력창 } from '@/components/ai/AI_질의_입력창';
import type { 지침_질의_응답 } from '@/app/api/guide/rmi-ask/route';

// ② 의료기관 담당자 › 2-5 책임의료기관 통합 사업 지침 AI 질의응답
// 「2026년 책임의료기관 통합 사업 안내」 원문(331쪽)에서 근거 쪽을 찾고, Gemini가 그 발췌만 근거로 요약한다.
// 원문 검색·요약은 서버(/api/guide/rmi-ask)에서 하고, 화면은 질문과 답(근거 발췌·쪽수)만 주고받는다.

const 추천_질문 = [
  '전담조직은 어떻게 구성해야 하나요?',
  '퇴원환자 지역사회 연계 사업의 목적과 내용은?',
  '2026년에 바뀐 점은?',
  '필수의료 협력 분야는 몇 개를 수행해야 하나요?',
  '사업비로 자산을 취득할 수 있나요?',
  '협의체는 몇 번 열어야 해?',
];

interface 대화 {
  id: number;
  질문: string;
  응답: 지침_질의_응답 | null; // null = 조회 중
}

export function 책임의료기관_지침_질의응답_화면() {
  const [입력, set_입력] = useState('');
  const [대화들, set_대화들] = useState<대화[]>([]);
  const 끝 = useRef<HTMLDivElement>(null);

  useEffect(() => {
    끝.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [대화들]);

  const 묻기 = async (q: string) => {
    const 질문 = q.trim();
    if (!질문) return;
    const id = Date.now();
    set_대화들((prev) => [...prev, { id, 질문, 응답: null }]);
    set_입력('');
    let 응답: 지침_질의_응답;
    try {
      응답 = await (
        await fetch('/api/guide/rmi-ask', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 질문 }),
        })
      ).json();
    } catch {
      응답 = { 상태: '실패', 문서명: '2026년 책임의료기관 통합 사업 안내', 근거: [], 사유: '네트워크 오류' };
    }
    set_대화들((prev) => prev.map((d) => (d.id === id ? { ...d, 응답 } : d)));
  };

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8 space-y-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-2">
        <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-600" />
          책임의료기관 통합 사업 지침 AI 질의응답
        </h2>
        <p className="text-xs text-slate-500">
          보건복지부·국립중앙의료원 「2026년 책임의료기관 통합 사업 안내」 원문(331쪽)에서 질문과 관련된 쪽을 먼저 찾고,
          <strong> Gemini가 찾은 쪽의 내용만 근거로 요약</strong>합니다. 답변 아래에 근거 쪽수와 원문 발췌를 함께 보여드립니다.
        </p>
        <p className="text-[11px] text-slate-400">지침 설명용입니다. 서식·제출 기한·예산 기준은 반드시 해당 쪽 원문과 보건복지부 최신 공문을 확인하세요.</p>
      </div>

      <div className="space-y-3 min-h-[200px]">
        {대화들.length === 0 && (
          <div className="flex flex-wrap gap-2">
            {추천_질문.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => set_입력(q)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {대화들.map((d) => (
          <div key={d.id} className="space-y-2">
            <div className="flex justify-end">
              <div className="max-w-[80%] px-4 py-2 rounded-2xl rounded-br-sm bg-blue-600 text-white text-sm">{d.질문}</div>
            </div>
            <div className="max-w-[92%] p-4 rounded-2xl rounded-bl-sm bg-white dark:bg-slate-900 result-panel space-y-3">
              {d.응답 === null ? (
                <div className="text-xs text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 animate-pulse" /> 지침 원문에서 근거를 찾고 요약하는 중…
                </div>
              ) : (
                <답변 응답={d.응답} />
              )}
            </div>
          </div>
        ))}
        <div ref={끝} />
      </div>

      <div className="sticky bottom-0 bg-slate-50/90 dark:bg-[#0c0d10]/90 backdrop-blur py-2">
        <AI_질의_입력창 value={입력} onChange={set_입력} onSubmit={묻기} 예시={추천_질문[0]} 실행_라벨="질문" aria_label="지침 질문 입력" />
      </div>
    </div>
  );
}

function 답변({ 응답 }: { 응답: 지침_질의_응답 }) {
  if (응답.상태 === '근거없음') {
    return (
      <p className="text-sm text-slate-600 dark:text-slate-300">
        「{응답.문서명}」에서 관련 내용을 찾지 못했습니다. 지침에 나오는 용어(예: 전담조직, 협의체, 퇴원환자 연계, 사업비, 평가 기준)로 다시 질문해 주세요.
      </p>
    );
  }
  return (
    <>
      {응답.상태 === '성공' && 응답.요약 ? (
        <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900 space-y-1.5">
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-black text-indigo-700 dark:text-indigo-300">
            <Sparkles className="w-3.5 h-3.5" /> AI 요약
            <span className="px-1.5 py-0.5 rounded bg-white/80 dark:bg-indigo-900/60 font-bold">Gemini · 지침 {응답.근거.length}쪽만 사용</span>
          </div>
          <p className="text-sm text-slate-800 dark:text-slate-100 whitespace-pre-line leading-relaxed">{응답.요약}</p>
          <p className="text-[10px] text-slate-400">생성형 AI 요약이라 틀릴 수 있습니다. [번호]는 아래 근거 번호이며, 중요한 기준은 해당 쪽 원문으로 확인하세요.</p>
        </div>
      ) : (
        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-500">
          AI 요약 미연결{응답.사유 ? ` (${응답.사유})` : ''} — 아래 지침 원문 발췌를 확인하세요.
        </div>
      )}

      <div className="space-y-2">
        <div className="text-[11px] font-black text-slate-500 flex items-center gap-1">
          <FileSearch className="w-3.5 h-3.5" /> 근거 원문 · 「{응답.문서명}」
        </div>
        {응답.근거.map((g) => (
          <div key={g.번호} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs space-y-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="font-black text-blue-700 dark:text-blue-300">[{g.번호}] {g.쪽_표시}</span>
              <span className="text-[10px] text-slate-400">{g.구분}</span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{g.발췌}</p>
          </div>
        ))}
      </div>
    </>
  );
}
