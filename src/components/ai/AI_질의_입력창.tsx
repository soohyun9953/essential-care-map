'use client';

import React, { useRef } from 'react';
import { Send } from 'lucide-react';

// AI 질의 공통 입력창 (2026-10-24 통일)
// - 빈 입력창에는 회색 예시 질문이 보이고, Tab 키(또는 「Tab ⇥ 입력」 배지)를 누르면 그 질문이 입력창에 채워진다
// - 질의는 오른쪽 실행 버튼(또는 Enter)으로만 보낸다. Tab은 채우기만 하고 바로 질의하지 않는다
// - 실행 버튼은 사이트 공통 입력 실행 색(.input-action). 입력이 비어 있을 때 누르면 회색 예시 질문으로 질의한다

interface AI_질의_입력창_속성 {
  value: string;
  onChange: (v: string) => void;
  onSubmit: (v: string) => void;
  예시: string; // 회색으로 보이고 Tab으로 채워질 질문
  실행_라벨?: string;
  실행중?: boolean;
  aria_label?: string;
  크기?: 'sm' | 'md';
  아이콘?: React.ReactNode;
}

export function AI_질의_입력창({
  value,
  onChange,
  onSubmit,
  예시,
  실행_라벨 = '실행',
  실행중 = false,
  aria_label = 'AI 질의 입력',
  크기 = 'md',
  아이콘,
}: AI_질의_입력창_속성) {
  const ref = useRef<HTMLInputElement>(null);
  const 비었음 = !value.trim();
  const 채우기 = () => {
    onChange(예시);
    ref.current?.focus();
  };
  const sm = 크기 === 'sm';

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (실행중) return;
        if (비었음) {
          onChange(예시);
          onSubmit(예시);
        } else onSubmit(value.trim());
      }}
      className="flex gap-2 w-full"
    >
      <div className="relative flex-1 flex items-center">
        <input
          ref={ref}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Tab' && !e.shiftKey && 비었음) {
              e.preventDefault();
              채우기();
            }
          }}
          placeholder={`예: ${예시}`}
          aria-label={aria_label}
          disabled={실행중}
          className={`w-full ${sm ? 'pl-2.5 py-1.5 text-xs pr-24' : 'pl-3.5 py-2.5 text-sm pr-28'} rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60`}
        />
        {비었음 && (
          <button
            type="button"
            tabIndex={-1}
            onClick={채우기}
            title="Tab 키를 누르거나 클릭하면 회색 예시 질문이 입력창에 채워집니다"
            className="absolute right-2 px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/60 text-slate-500 hover:text-blue-700 dark:text-slate-300 text-[10px] font-bold border border-slate-200 dark:border-slate-700 cursor-pointer"
          >
            Tab ⇥ 입력
          </button>
        )}
      </div>
      <button
        type="submit"
        disabled={실행중}
        title={비었음 ? `예시 질문으로 실행: ${예시}` : undefined}
        className={`${sm ? 'px-3 py-1.5 text-xs' : 'px-4 py-2.5 text-sm'} rounded-xl input-action shadow-sm disabled:opacity-60 font-bold cursor-pointer disabled:cursor-not-allowed flex items-center gap-1 shrink-0`}
      >
        {아이콘 ?? <Send className={sm ? 'w-3.5 h-3.5' : 'w-4 h-4'} />}
        {실행중 ? '실행 중…' : 실행_라벨}
      </button>
    </form>
  );
}
