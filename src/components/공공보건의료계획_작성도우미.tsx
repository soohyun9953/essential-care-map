'use client';

import React, { useMemo, useState } from 'react';
import { ClipboardCopy, FileDown, FileText, Hospital, X } from 'lucide-react';
import type { 워크스페이스_타입 } from './글로벌_공공_헤더';
import { 정책_의사결정_여정_스테퍼 } from './정책_의사결정_여정_스테퍼';
import {
  작성도우미_대상_병원,
  진료권_통계_조회,
  진료권_통계_출처,
  공공보건의료계획_초안,
  기능보강_사업계획서_초안,
  초안_마크다운,
  type 작성도우미_병원,
  type 진료권_통계,
  type 초안_섹션,
} from '@/lib/진료권_통계_연동';

// ② 의료기관 담당자 › 2-1 공공보건의료계획·사업계획 작성 도우미
// 병원 선택 → 진료권 통계(자체충족률·유출률·2030 수요) → 5단계 여정 → 계획서 초안 모달에 자동 연동

const 표시명: Record<작성도우미_병원, string> = {
  강원특별자치도영월의료원: '영월의료원',
  '근로복지공단 태백병원': '태백병원',
  정선군립병원: '정선군립병원',
};

const 퍼센트 = (v: number | null) => (v === null ? '자료 없음' : `${v.toFixed(1)}%`);

type 초안_종류 = '공공보건의료계획' | '기능보강';

function 초안_모달({ 종류, 통계, on_close }: { 종류: 초안_종류; 통계: 진료권_통계; on_close: () => void }) {
  const 제목 = 종류 === '공공보건의료계획' ? '공공보건의료계획 초안' : '기능보강 12대 항목 사업계획서 초안';
  const [섹션, set_섹션] = useState<초안_섹션[]>(() =>
    종류 === '공공보건의료계획' ? 공공보건의료계획_초안(통계) : 기능보강_사업계획서_초안(통계)
  );
  const [안내, set_안내] = useState('');
  const 마크다운 = () => 초안_마크다운(제목, 통계, 섹션);

  const 복사 = async () => {
    try {
      await navigator.clipboard.writeText(마크다운());
      set_안내('클립보드에 복사했습니다.');
    } catch {
      set_안내('복사하지 못했습니다. 내용을 직접 선택해 복사해주세요.');
    }
  };

  const HWP_저장 = async () => {
    set_안내('HWP 파일을 만드는 중입니다…');
    const res = await fetch('/api/report/hwpx', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 제목, fileName: `${통계.병원명}_${제목}.hwpx`, markdownContent: 마크다운() }),
    }).catch(() => null);
    if (!res) return set_안내('서버에 연결할 수 없습니다.');
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      return set_안내(d.message || 'HWP 파일을 만들지 못했습니다.');
    }
    const url = URL.createObjectURL(await res.blob());
    const a = document.createElement('a');
    a.href = url;
    a.download = `${통계.병원명}_${제목}.hwpx`;
    a.click();
    URL.revokeObjectURL(url);
    set_안내('HWP 파일을 내려받았습니다.');
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="w-full max-w-3xl max-h-[90vh] flex flex-col bg-white dark:bg-[#15161b] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white">{제목}</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {통계.병원명} · {통계.시도명} {통계.시군구명} — 「진료권 통계 연동」 항목은 아래 자료로 자동 작성, 나머지는 직접 입력
            </p>
          </div>
          <button type="button" onClick={on_close} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer" aria-label="닫기">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {섹션.map((s, i) => (
            <div key={s.제목} className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900 dark:text-white">{s.제목}</span>
                {s.자동연동 && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                    진료권 통계 연동
                  </span>
                )}
              </div>
              <textarea
                value={s.내용}
                onChange={(e) => set_섹션((prev) => prev.map((x, j) => (j === i ? { ...x, 내용: e.target.value } : x)))}
                rows={Math.min(8, Math.max(2, s.내용.split('\n').length + 1))}
                className="w-full text-xs leading-relaxed p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
              />
            </div>
          ))}
          <div className="text-[11px] text-slate-500 space-y-0.5">
            <div className="font-bold">자료 출처</div>
            {진료권_통계_출처.map((x) => (
              <div key={x}>· {x}</div>
            ))}
          </div>
        </div>
        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs text-slate-500">{안내 || '초안입니다. 제출 전 담당자가 검토·수정해야 합니다.'}</span>
          <div className="flex gap-2">
            <button type="button" onClick={복사} className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 cursor-pointer flex items-center gap-1">
              <ClipboardCopy className="w-3.5 h-3.5" /> 복사
            </button>
            <button type="button" onClick={HWP_저장} className="px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer flex items-center gap-1" title="로그인 후 사용 가능">
              <FileDown className="w-3.5 h-3.5" /> HWP 저장
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function 공공보건의료계획_작성도우미({ on_navigate }: { on_navigate: (workspace: 워크스페이스_타입, sub?: string) => void }) {
  const [병원, set_병원] = useState<작성도우미_병원>('강원특별자치도영월의료원');
  const [모달, set_모달] = useState<초안_종류 | null>(null);
  const 통계 = useMemo(() => 진료권_통계_조회(병원), [병원]);

  const 카드 = (라벨: string, 값: string, 보조?: string) => (
    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
      <div className="text-[11px] font-bold text-slate-500">{라벨}</div>
      <div className="text-lg font-black text-slate-900 dark:text-white mt-0.5">{값}</div>
      {보조 && <div className="text-[11px] text-slate-500 mt-0.5">{보조}</div>}
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto w-full p-4 sm:p-6 space-y-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Hospital className="w-5 h-5 text-blue-600" />
              공공보건의료계획·사업계획 작성 도우미
            </h2>
            <p className="text-xs text-slate-500 mt-1">병원을 고르면 진료권 통계가 계획서 초안에 자동으로 들어갑니다.</p>
          </div>
          <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="병원 선택">
            {작성도우미_대상_병원.map((h) => (
              <button
                key={h}
                type="button"
                role="tab"
                aria-selected={h === 병원}
                onClick={() => set_병원(h)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border cursor-pointer ${
                  h === 병원 ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                {표시명[h]}
              </button>
            ))}
          </div>
        </div>

        {통계 ? (
          <>
            <div className="text-xs text-slate-600 dark:text-slate-300">
              <strong>{통계.병원명}</strong> ({통계.병상수}병상) · 진료권 {통계.시도명} {통계.시군구명} · 인구 {통계.인구수.toLocaleString()}명
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {카드('입원 자체충족률', 퍼센트(통계.자체충족률_pct), '2024 입원 재원일수 기준')}
              {카드('관외 유출률', 퍼센트(통계.유출률_pct), 통계.주요_유출지.map((o) => `${o.지역} ${o.pct}%`).join(' · ') || '자료 없음')}
              {카드(
                '응급·분만 취약 판정',
                통계.진단 ? `${통계.진단.응급취약지역_여부 ? '응급 해당' : '응급 미해당'} · ${통계.진단.분만취약지_등급 ? `분만 ${통계.진단.분만취약지_등급}등급` : '분만 미해당'}` : '자료 없음',
                '보건복지부 선정 기준 (헬스맵 2024)'
              )}
              {카드(
                '2030 입원 수요 (참고)',
                통계.입원일수_증감률_2030_pct === null ? '자료 없음' : `${통계.입원일수_증감률_2030_pct > 0 ? '+' : ''}${통계.입원일수_증감률_2030_pct}%`,
                `노인비율 ${통계.수요_2023?.노인비율 ?? '-'}% → ${통계.수요_2030?.노인비율 ?? '-'}% · 플랫폼 추정`
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => set_모달('공공보건의료계획')} className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer flex items-center gap-1.5">
                <FileText className="w-4 h-4" /> 공공보건의료계획 초안
              </button>
              <button type="button" onClick={() => set_모달('기능보강')} className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold cursor-pointer flex items-center gap-1.5">
                <FileText className="w-4 h-4" /> 기능보강 12대 항목 사업계획서 초안
              </button>
            </div>
            <p className="text-[11px] text-slate-400">출처: {진료권_통계_출처.join(' / ')}</p>
          </>
        ) : (
          <p className="text-xs text-slate-500">선택한 병원을 공공의료기관 데이터셋에서 찾지 못했습니다.</p>
        )}
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
        <정책_의사결정_여정_스테퍼 on_navigate={on_navigate} />
      </div>

      {모달 && 통계 && <초안_모달 key={`${병원}-${모달}`} 종류={모달} 통계={통계} on_close={() => set_모달(null)} />}
    </div>
  );
}
