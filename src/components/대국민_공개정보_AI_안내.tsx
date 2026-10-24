'use client';

import React, { useEffect, useRef, useState } from 'react';
import { AI_질의_입력창 } from '@/components/ai/AI_질의_입력창';
import { BookOpenCheck, ExternalLink, Sparkles } from 'lucide-react';
import { 공개정보_안내, 추천_질문, 안내_공통_고지, type 안내_답변 } from '@/lib/대국민_공개정보_안내_엔진';
import { 실시간_병상_조회 } from '@/lib/실시간_병상_조회';
import type { 대국민_AI_요약_응답 } from '@/app/api/citizen/ask/route';

// ① 대국민 › 1-4 대국민 공공의료 AI 안내 도우미 (AIS-02-02)
// ① 사이트 공개 자료(E-Gen·심평원·알리미 데이터, 원문 확인된 지침)를 찾고 ② 그 자료만 근거로 Gemini가 요약한다
// 근거 자료·출처는 요약 아래에 그대로 보여준다. Gemini가 미연결·실패하면 자료만 보여준다

interface 대화 {
  id: number;
  질문: string;
  답변: 안내_답변;
  실시간?: string[]; // E-Gen 실시간 신생아중환자실 확인 결과 (NICU 질문)
  요약?: 대국민_AI_요약_응답 | { 상태: '작성중' };
}

async function AI_요약_요청(질문: string, 실시간: string[]): Promise<대국민_AI_요약_응답> {
  try {
    const r = await fetch('/api/citizen/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 질문, 실시간 }),
    });
    return (await r.json()) as 대국민_AI_요약_응답;
  } catch {
    return { 상태: '실패', 사유: '네트워크 오류' };
  }
}

/** NICU 질문: 후보 병원 소재 시군구를 E-Gen 실시간으로 조회해 신생아중환자실 가용 병상을 붙인다 */
async function 실시간_NICU_확인(대상: NonNullable<안내_답변['실시간_확인']>): Promise<string[]> {
  const { 연동됨, 기관별 } = await 실시간_병상_조회(대상);
  if (!연동됨) return ['E-Gen 실시간 병상이 연동되지 않아 신생아중환자실 가용 여부를 확인하지 못했습니다. 병원에 전화로 확인하세요.'];
  return 대상.map((x) => {
    const h = 기관별.get(x.기관명);
    if (!h) return `· ${x.기관명}: 실시간 목록에 없음 (전화 확인)`;
    const n = h.신생아중환자실_가용병상;
    return `· ${x.기관명}: 신생아중환자실 가용 ${n ?? '정보 없음'}${n === 0 ? ' (만실이거나 미운영 — 전화 확인)' : ''}`;
  });
}

export function 대국민_공개정보_AI_안내() {
  const [입력, set_입력] = useState('');
  const [대화들, set_대화들] = useState<대화[]>([]);
  const 끝 = useRef<HTMLDivElement>(null);

  useEffect(() => {
    끝.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [대화들]);

  const 묻기 = (q: string) => {
    const 질문 = q.trim();
    if (!질문) return;
    const 답변 = 공개정보_안내(질문);
    const id = Date.now();
    const 근거있음 = 답변.유형 !== '찾지못함';
    set_대화들((prev) => [
      ...prev,
      {
        id,
        질문,
        답변,
        실시간: 답변.실시간_확인?.length ? ['E-Gen 실시간 신생아중환자실 병상 조회 중…'] : undefined,
        요약: 근거있음 ? { 상태: '작성중' } : undefined,
      },
    ]);
    set_입력('');
    const 갱신 = (patch: Partial<대화>) => set_대화들((prev) => prev.map((d) => (d.id === id ? { ...d, ...patch } : d)));
    (async () => {
      let 줄: string[] = [];
      if (답변.실시간_확인?.length) {
        줄 = await 실시간_NICU_확인(답변.실시간_확인);
        갱신({ 실시간: 줄 });
      }
      // 실시간 확인 결과까지 근거에 넣어 Gemini 요약 요청
      if (근거있음) 갱신({ 요약: await AI_요약_요청(질문, 줄) });
    })();
  };

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8 space-y-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpenCheck className="w-5 h-5 text-rose-600" />
            대국민 공공의료 AI 안내 도우미
          </h2>
          <span className="px-2 py-0.5 rounded-lg text-[11px] font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300">AIS-02-02</span>
        </div>
        <p className="text-xs text-slate-500">
          응급실·분만 병원·달빛어린이병원·신생아중환자실(NICU) 위치(역·공항 이름으로도 검색), 공공병원 공개 정보, 공공의료 제도를 사이트의 공개 자료에서 먼저 찾고,
          <strong> Gemini가 찾은 자료만 근거로 요약</strong>합니다. 요약 아래에 근거 자료와 <strong>출처 자료</strong>를 함께 보여드리니 원문으로 확인하세요.
        </p>
        <p className="text-xs font-bold text-rose-700 dark:text-rose-300">{안내_공통_고지}</p>
      </div>

      <div className="space-y-3 min-h-[200px]">
        {대화들.length === 0 && (
          <div className="flex flex-wrap gap-2">
            {추천_질문.map((q) => (
              <button key={q} type="button" onClick={() => set_입력(q)} className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer">
                {q}
              </button>
            ))}
          </div>
        )}
        {대화들.map((d) => (
          <div key={d.id} className="space-y-2">
            <div className="flex justify-end">
              <div className="max-w-[80%] px-4 py-2 rounded-2xl rounded-br-sm bg-rose-600 text-white text-sm">{d.질문}</div>
            </div>
            <div className="max-w-[90%] p-4 rounded-2xl rounded-bl-sm bg-white dark:bg-slate-900 result-panel space-y-2">
              {d.요약 && <AI_요약_상자 요약={d.요약} />}
              <div className="text-sm font-bold text-slate-900 dark:text-white">
                {d.요약 && d.요약.상태 !== '근거없음' && <span className="text-[11px] font-black text-slate-400 mr-1">근거 자료 ·</span>}
                {d.답변.제목}
              </div>
              <div className="text-xs text-slate-700 dark:text-slate-300 space-y-1 whitespace-pre-line">
                {d.답변.내용.map((c, j) => (
                  <p key={j}>{c}</p>
                ))}
              </div>
              {d.실시간 && (
                <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900 text-xs text-slate-700 dark:text-slate-300 space-y-0.5">
                  <div className="text-[11px] font-black text-rose-700 dark:text-rose-300">실시간 확인 (국립중앙의료원 E-Gen)</div>
                  {d.실시간.map((c, j) => (
                    <p key={j}>{c}</p>
                  ))}
                </div>
              )}
              {d.답변.출처.length > 0 && (
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1">
                  <div className="text-[11px] font-black text-slate-500">출처 자료</div>
                  {d.답변.출처.map((s, j) => (
                    <div key={j} className="text-[11px] text-slate-500">
                      [{j + 1}] <span className="font-bold text-slate-700 dark:text-slate-300">{s.자료}</span> — {s.상세}
                      {s.URL && (
                        <a href={s.URL} target="_blank" rel="noopener noreferrer" className="ml-1 inline-flex items-center gap-0.5 text-blue-600 hover:underline">
                          원문 <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={끝} />
      </div>

      <div className="sticky bottom-0 bg-slate-50/90 dark:bg-[#0c0d10]/90 backdrop-blur py-2">
        <AI_질의_입력창 value={입력} onChange={set_입력} onSubmit={묻기} 예시={추천_질문[0]} 실행_라벨="질문" aria_label="질문 입력" />
      </div>
    </div>
  );
}

function AI_요약_상자({ 요약 }: { 요약: NonNullable<대화['요약']> }) {
  if (요약.상태 === '근거없음') return null;
  if (요약.상태 === '작성중') {
    return (
      <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900 text-xs text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
        <Sparkles className="w-3.5 h-3.5 animate-pulse" /> 찾은 자료로 Gemini 요약을 작성하는 중…
      </div>
    );
  }
  if (요약.상태 !== '성공' || !요약.요약) {
    return (
      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-500">
        AI 요약 미연결{요약.사유 ? ` (${요약.사유})` : ''} — 아래 공개 자료를 확인하세요.
      </div>
    );
  }
  return (
    <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900 space-y-1.5">
      <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-black text-indigo-700 dark:text-indigo-300">
        <Sparkles className="w-3.5 h-3.5" /> AI 요약
        <span className="px-1.5 py-0.5 rounded bg-white/80 dark:bg-indigo-900/60 font-bold">
          Gemini · 근거 {요약.근거_수 ?? 0}건만 사용
        </span>
      </div>
      <p className="text-sm text-slate-800 dark:text-slate-100 whitespace-pre-line leading-relaxed">{요약.요약}</p>
      <p className="text-[10px] text-slate-400">생성형 AI 요약이라 틀릴 수 있습니다. [번호]는 아래 출처 자료 번호이며, 중요한 내용은 근거 자료와 원문으로 확인하세요.</p>
    </div>
  );
}
