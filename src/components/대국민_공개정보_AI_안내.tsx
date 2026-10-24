'use client';

import React, { useEffect, useRef, useState } from 'react';
import { AI_질의_입력창 } from '@/components/ai/AI_질의_입력창';
import { BookOpenCheck, ExternalLink } from 'lucide-react';
import { 공개정보_안내, 추천_질문, 안내_공통_고지, type 안내_답변 } from '@/lib/대국민_공개정보_안내_엔진';
import { 실시간_병상_조회 } from '@/lib/실시간_병상_조회';

// ① 대국민 › 1-4 대국민 공공의료 AI 안내 도우미 (AIS-02-02)
// 공개 자료를 찾아 출처와 함께 보여주는 검색형 안내 (생성형 AI 답변 아님, 로그인 불필요)

interface 대화 {
  질문: string;
  답변: 안내_답변;
  실시간?: string[]; // E-Gen 실시간 신생아중환자실 확인 결과 (NICU 질문)
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
    set_대화들((prev) => [...prev, { 질문, 답변, 실시간: 답변.실시간_확인?.length ? ['E-Gen 실시간 신생아중환자실 병상 조회 중…'] : undefined }]);
    set_입력('');
    if (답변.실시간_확인?.length) {
      실시간_NICU_확인(답변.실시간_확인).then((줄) =>
        set_대화들((prev) => prev.map((d) => (d.답변 === 답변 ? { ...d, 실시간: 줄 } : d)))
      );
    }
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
          응급실·분만 병원·달빛어린이병원·신생아중환자실(NICU) 위치(역·공항 이름으로도 검색), 공공병원 공개 정보, 공공의료 제도를 공개 자료에서 찾아 <strong>출처 문서와 함께</strong> 알려드립니다. 생성형 AI가 지어낸 답변이 아니라 공개 자료를 그대로 보여줍니다.
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
        {대화들.map((d, i) => (
          <div key={i} className="space-y-2">
            <div className="flex justify-end">
              <div className="max-w-[80%] px-4 py-2 rounded-2xl rounded-br-sm bg-rose-600 text-white text-sm">{d.질문}</div>
            </div>
            <div className="max-w-[90%] p-4 rounded-2xl rounded-bl-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="text-sm font-bold text-slate-900 dark:text-white">{d.답변.제목}</div>
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
                  <div className="text-[11px] font-black text-slate-500">출처 문서</div>
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
        <AI_질의_입력창 value={입력} onChange={set_입력} onSubmit={묻기} 예시={추천_질문[0]} 실행_라벨="질문" 버튼_색="bg-rose-600 hover:bg-rose-700" aria_label="질문 입력" />
      </div>
    </div>
  );
}
