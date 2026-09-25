'use client';

// Essential Care Map - AI 분석 통합 워크스페이스
// Section 13 Dual AI UI 개선 표준 구현 (분석방식 선택, 구조화된 분석결과, 근거데이터/생성시점/분석방식 메타데이터 명시)

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Bot,
  Database,
  Clock,
  Copy,
  Check,
} from 'lucide-react';
import { 필수의료_진단_결과 } from '@/lib/필수의료_타입';
import { 공공의료_sLLM_업무비서 } from './공공의료_sLLM_업무비서';

interface AI분석_통합_워크스페이스_속성 {
  selected_region: 필수의료_진단_결과 | null;
  google_api_key?: string;
  on_open_key_modal?: () => void;
}

export const AI분석_통합_워크스페이스: React.FC<AI분석_통합_워크스페이스_속성> = ({
  selected_region,
  google_api_key,
  on_open_key_modal,
}) => {
  // 메인 모드: 'policy_result' (Section 13 표준 분석결과) vs 'studio' (하이브리드 RAG 스튜디오)
  const [view_mode, set_view_mode] = useState<'policy_result' | 'studio'>('policy_result');

  const [copied, setCopied] = useState(false);

  // 화면 표시 시점 (서버 렌더링과 어긋나지 않도록 마운트 후 설정)
  const [shown_at, set_shown_at] = useState('');
  useEffect(() => {
    set_shown_at(new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }));
  }, [selected_region]);

  const region_name = selected_region
    ? `${selected_region.시도명} ${selected_region.시군구명}`
    : '지역 미선택';

  const 분야별_판정 = selected_region
    ? [
        { 분야: '응급', 취약: selected_region.응급취약지역_여부, 근거: selected_region.응급_판정근거, 판정가능: true },
        { 분야: '분만', 취약: selected_region.분만취약지역_여부, 근거: selected_region.분만_판정근거, 판정가능: true },
        { 분야: '소아', 취약: selected_region.소아취약지역_여부, 근거: selected_region.소아_판정근거, 판정가능: selected_region.소아_판정_가능 },
      ]
    : [];
  const 근거_지표 = selected_region
    ? [
        { 이름: '권역응급 60분 미도달', 값: `${selected_region.응급_60분_미도달_인구비율}%` },
        { 이름: '응급 관내이용률 (RI)', 값: `${selected_region.관내_응급_의료이용률}%` },
        { 이름: '분만기관 60분 미도달', 값: `${selected_region.분만_60분_미도달_인구비율}%` },
        { 이름: '분만 관내이용률 (RI)', 값: `${selected_region.관내_분만율}%` },
      ]
    : [];

  // 요약 내용을 텍스트로 클립보드에 복사
  const handle_copy_result = async () => {
    if (!selected_region) return;
    const text = [
      `[${region_name} 지역 진단 요약] (헬스맵 2024, 규칙 기반 요약)`,
      `종합: ${selected_region.종합_취약도_등급} (${selected_region.종합_취약도_점수}점)`,
      ...분야별_판정.map((p) => `- ${p.분야}: ${!p.판정가능 ? '자료 없음' : p.취약 ? '취약' : '기준 충족'} — ${p.근거}`),
      ...근거_지표.map((g) => `- ${g.이름}: ${g.값}`),
    ].join('\n');
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // 클립보드 권한이 없으면 복사하지 않음
    }
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* ============================================================== */}
      {/* 1. 상단 워크스페이스 모드 스위처 */}
      {/* ============================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#15161b] p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => set_view_mode('policy_result')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              view_mode === 'policy_result'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>지역 진단 요약</span>
          </button>

          <button
            onClick={() => set_view_mode('studio')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              view_mode === 'studio'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>하이브리드 RAG 지침 질의 스튜디오</span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 px-2">
          <span>분석 대상:</span>
          <span className="font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg">
            {region_name}
          </span>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. Section 13 표준 AI 정책분석 뷰 */}
      {/* ============================================================== */}
      {view_mode === 'policy_result' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#15161b] rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
            {/* 상단: 제목 및 성격 안내 */}
            <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-xl font-black text-slate-900 dark:text-white">지역 진단 요약</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                진단 데이터를 규칙에 따라 정리한 요약이며 AI가 생성한 결과가 아닙니다. AI 분석(Cloud AI / Local sLLM)은
                상단의 <strong>하이브리드 RAG 지침 질의 스튜디오</strong>에서 실행하세요.
              </p>
            </div>

            {/* 메타데이터 배지: 근거 데이터 / 표시 시점 */}
            <div className="flex flex-wrap items-center gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                <Database className="w-3.5 h-3.5 text-blue-600" />
                <span>근거 데이터:</span>
              </span>
              <span className="bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                250개 시군구 진단 DB (헬스맵 2024)
              </span>

              <span className="text-slate-300">|</span>

              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>표시 시점:</span>
              </span>
              <span className="bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 font-mono">
                {shown_at ? `${shown_at} KST` : '-'}
              </span>
            </div>

            {!selected_region ? (
              <p className="text-sm text-slate-500 py-6 text-center">지역진단 화면에서 지역을 선택하면 요약이 표시됩니다.</p>
            ) : (
            <div className="space-y-5 pt-2">
              {/* 1. 분야별 판정 */}
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-rose-500 rounded-full" />
                  <span>1. 분야별 판정 (종합 {selected_region.종합_취약도_등급}, {selected_region.종합_취약도_점수}점)</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  {분야별_판정.map((p, i) => (
                    <div key={p.분야} className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                      <strong className={`block ${!p.판정가능 ? 'text-slate-400' : p.취약 ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {['①', '②', '③'][i]} {p.분야}: {!p.판정가능 ? '자료 없음' : p.취약 ? '취약' : '기준 충족'}
                      </strong>
                      <p className="text-slate-600 dark:text-slate-400">{p.근거}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. 정책대안 유형 */}
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-blue-600 rounded-full" />
                  <span>2. 검토 가능한 정책대안 유형 (일반 예시)</span>
                </h4>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs space-y-2 leading-relaxed">
                  {selected_region.응급취약지역_여부 && (
                    <p>
                      <strong>• 응급:</strong> 지역응급의료기관 기능 보강, 권역응급의료센터와의 원격협진·이송 연계 강화.
                    </p>
                  )}
                  {selected_region.분만취약지역_여부 && (
                    <p>
                      <strong>• 분만:</strong> 분만취약지 지원사업(산부인과 설치·운영 지원) 검토, 고위험 산모 이송체계 연계.
                    </p>
                  )}
                  {!selected_region.응급취약지역_여부 && !selected_region.분만취약지역_여부 && (
                    <p>응급·분만 모두 판정 기준을 충족해 우선 검토할 취약 분야가 없습니다.</p>
                  )}
                  <p className="text-slate-400">
                    지역 여건을 반영한 구체적 대안과 예산·효과는 이 요약에서 산출하지 않습니다.
                  </p>
                </div>
              </div>

              {/* 3. 근거 데이터 */}
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-emerald-600 rounded-full" />
                  <span>3. 근거 데이터 (헬스맵 2024)</span>
                </h4>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {근거_지표.map((g) => (
                    <div key={g.이름}>
                      <span className="text-slate-400 block text-[11px]">{g.이름}</span>
                      <strong className="text-slate-900 dark:text-white text-sm">{g.값}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            )}

            {/* 하단 클립보드 복사 버튼 */}
            <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={handle_copy_result}
                disabled={!selected_region}
                className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs hover:opacity-90 transition flex items-center gap-1.5 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? '요약 복사 완료' : '요약 클립보드 복사'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. 하이브리드 RAG 스튜디오 뷰 (기존 sLLM 업무비서 임베드) */}
      {/* ============================================================== */}
      {view_mode === 'studio' && (
        <공공의료_sLLM_업무비서
          selected_region={selected_region}
        />
      )}
    </div>
  );
};
