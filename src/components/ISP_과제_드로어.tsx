'use client';

import React, { useEffect } from 'react';
import { useIsp } from '@/context/ISP_컨텍스트';
import {
  X,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  Server,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building2,
  Layers,
} from 'lucide-react';

export const ISP_과제_드로어: React.FC = () => {
  const { selectedTaskId, selectedTask, closeTaskDrawer } = useIsp();

  // ESC 키로 드로어 닫기
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedTaskId) {
        closeTaskDrawer();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedTaskId, closeTaskDrawer]);

  if (!selectedTaskId || !selectedTask) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex justify-end animate-in fade-in duration-200">
      {/* 배경 오버레이 */}
      <div
        className="fixed inset-0 bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs transition-opacity"
        onClick={closeTaskDrawer}
      />

      {/* 우측 슬라이딩 드로어 본체 (420px 너비) */}
      <div className="relative w-full max-w-[420px] h-full bg-white dark:bg-[#12141a] text-slate-900 dark:text-slate-100 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col z-10 animate-in slide-in-from-right duration-300 overflow-hidden font-sans">
        {/* ============================================================== */}
        {/* 드로어 헤더 */}
        {/* ============================================================== */}
        <div className="px-6 py-5 bg-gradient-to-b from-blue-50/80 to-white dark:from-blue-950/30 dark:to-[#12141a] border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-blue-600 text-white shadow-xs">
                {selectedTask.number}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {selectedTask.category}
              </span>
            </div>

            <button
              onClick={closeTaskDrawer}
              className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="닫기 (ESC)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug">
            {selectedTask.title}
          </h3>

          <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1 font-medium">
              <Building2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              주관: 보건복지부 · 국립중앙의료원(NMC)
            </span>
            <span>•</span>
            <span className="text-blue-600 dark:text-blue-400 font-bold">
              AI ISP 핵심과제
            </span>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 드로어 스크롤 본문 */}
        {/* ============================================================== */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* 섹션 1: 🔴 현행 문제점 (As-Is Pain Point) */}
          <div className="p-4 rounded-2xl bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 space-y-2.5">
            <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-extrabold text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>현행 문제점 (As-Is Pain Point)</span>
            </div>
            <ul className="space-y-2 text-xs text-rose-900 dark:text-rose-200/90 leading-relaxed">
              {selectedTask.asIs.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold shrink-0 mt-0.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 섹션 2: 🟢 목표 모델 (To-Be AI Innovation) */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 space-y-2.5">
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-extrabold text-xs">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>목표 모델 (To-Be AI Innovation)</span>
            </div>
            <ul className="space-y-2 text-xs text-emerald-950 dark:text-emerald-200/90 leading-relaxed">
              {selectedTask.toBe.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold shrink-0 mt-0.5">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 섹션 3: 📊 핵심 정량 기대효과 */}
          <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 space-y-2">
            <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 font-extrabold text-xs">
              <TrendingUp className="w-4 h-4 shrink-0" />
              <span>핵심 정량 기대효과 (Impact)</span>
            </div>
            <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-blue-200/60 dark:border-blue-800/60 text-xs font-bold text-blue-950 dark:text-blue-200 leading-snug">
              🚀 {selectedTask.impact}
            </div>
          </div>

          {/* 섹션 4: 🏛️ 목표 아키텍처 매핑 */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-extrabold text-xs">
              <Server className="w-4 h-4 shrink-0 text-slate-500" />
              <span>목표 아키텍처 매핑 (MSA Layer)</span>
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-mono p-2.5 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
              {selectedTask.architectureLayer}
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 드로어 푸터 바 */}
        {/* ============================================================== */}
        <div className="px-6 py-4 bg-slate-50/80 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-400 dark:text-slate-500">
            공공의료 AI ISP 전략기획 산출물
          </span>
          <button
            onClick={closeTaskDrawer}
            className="px-4 py-1.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 transition shadow-xs"
          >
            확인 및 닫기
          </button>
        </div>
      </div>
    </div>
  );
};
