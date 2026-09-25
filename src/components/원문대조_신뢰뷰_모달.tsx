'use client';

// 사업계획서 예시 문장과 근거 자료 요약을 나란히 보여 주는 대조 모달 (근거는 공개 자료 요약, 원문 전문 아님)

import React, { useState } from 'react';
import {
  ShieldCheck,
  X,
  FileText,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  BookOpen,
  Eye,
} from 'lucide-react';

interface 원문대조_신뢰뷰_모달_속성 {
  is_open: boolean;
  on_close: () => void;
}

interface 대조_문장_매핑 {
  id: number;
  ai_text: string;
  source_title: string;
  source_page: string;
  matched_law_text: string;
  검증상태: '원문 확인' | '일부 확인' | '원문 미확인';
  검증_근거: string;
}

// 사업계획서 예시 문장과 근거 자료 요약 (2026-09-24 공개 자료 대조).
// 우측 근거는 공개 자료를 요약한 것이며 법령·지침 원문 전문을 인용한 것이 아님.
const CITATION_PAIRS: 대조_문장_매핑[] = [
  {
    id: 1,
    ai_text:
      '영월군의 권역응급의료센터 60분 내 미도달 인구 비율(헬스맵 2024년 지표 99.2%)은 응급의료취약지 선정 기준(30% 이상)에 해당하는 수준임.',
    source_title: '보건복지부 고시 「응급의료분야 의료취약지 지정」 (제2024-261호) 및 선정 기준',
    source_page: '고시 제2조(지정 지역 목록) / 선정 기준: 보건복지부 2017년 발표',
    matched_law_text:
      '응급의료분야 의료취약지는 「공공보건의료에 관한 법률」 제12조에 따라 고시로 지정되며, 고시에는 지정 지역 목록이 수록된다.\n\n선정 기준: 응급의료기관에 30분 이내 도달이 불가능하거나, 응급의료센터에 1시간 이내 도달이 불가능한 인구가 30% 이상인 지역.\n\n※ 실제 지정 여부는 고시 첨부 지역 목록으로 확인해야 함.',
    검증상태: '원문 확인',
    검증_근거: '국가법령정보센터 보건복지부고시 제2024-261호; 대한의사협회지 2023;66(7):450',
  },
  {
    id: 2,
    ai_text:
      '관내 분만율(헬스맵 2024년 분만 관내이용률 6.4%)이 낮아 분만 의료 접근성 개선이 필요함. 다만 분만취약지 선정 기준은 60분 내 분만의료 이용률과 접근 불가 인구비율로 별도 판단해야 함.',
    source_title: '보건복지부 「분만취약지 지원사업」 선정 기준',
    source_page: '사업 공모 안내 및 제도 개선 보도자료',
    matched_law_text:
      '분만취약지 선정 기준\n① 60분 내 분만의료 이용률 30% 미만\n② 60분 내 분만 가능한 의료기관에 접근 불가능한 인구비율 30% 이상\n→ 2개 모두 해당 시 A등급, 1개 해당 시 B등급\n\n지원: 분만산부인과 설치 시 시설·장비비 10억원(첫해), 운영비 연 5억원\n\n※ 플랫폼의 「관내 분만율」은 선정 기준의 「분만의료 이용률」과 다른 지표임.',
    검증상태: '원문 확인',
    검증_근거: '대한민국 정책브리핑 분만취약지 지원사업 제도 개선 보도자료; 보건복지부 2024년 분만취약지 지원사업 공모 안내',
  },
  {
    id: 3,
    ai_text:
      '소아 병상 공급비율은 실데이터를 확보하지 못해 현재 진단에서 제외됨 (자료 없음). 자료 확보 시 플랫폼 진단 기준(60%)으로 판정.',
    source_title: '소아 병상 공급비율 기반 소아의료 취약 기준',
    source_page: '출처 문서·조항 미확인',
    matched_law_text:
      '플랫폼은 소아청소년과 병상 공급 비율이 필요 병상 수 대비 60% 미만인 지역을 소아의료 취약으로 진단한다.\n\n※ 이 기준의 법령·지침상 근거 조항은 공개 자료에서 확인되지 않았음. 사업계획서에 인용하기 전에 근거 문서를 확인해야 함.\n※ 현재 내장 시군구 데이터에는 소아 지표 값이 없어 이 기준은 적용되지 않음.',
    검증상태: '원문 미확인',
    검증_근거: '근거 자료 미확인',
  },
];

export const 원문대조_신뢰뷰_모달: React.FC<원문대조_신뢰뷰_모달_속성> = ({ is_open, on_close }) => {
  const [active_id, set_active_id] = useState<number>(1);

  if (!is_open) return null;

  const active_citation = CITATION_PAIRS.find((item) => item.id === active_id) || CITATION_PAIRS[0];

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-black/[0.08] w-full max-w-5xl h-[85vh] max-h-[850px] flex flex-col overflow-hidden">
        {/* 모달 상단 툴바 */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-[#34c759]/20 text-[#34c759] flex items-center justify-center border border-[#34c759]/30">
              <ShieldCheck className="w-5 h-5 text-[#34c759]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-white">
                  사업계획서 문장 근거 대조 (예시)
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/15 text-white">
                  공개 자료 대조 2026-09-24
                </span>
              </div>
              <p className="text-[11px] text-white/70 mt-0.5">
                예시 문장과 근거 자료를 나란히 비교합니다. 근거는 공개 자료 요약이며 법령·지침 원문 전문이 아닙니다.
              </p>
            </div>
          </div>

          <button
            onClick={on_close}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 2분할(Split-View) 작업 영역 */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-black/[0.08] overflow-hidden">
          {/* ================= 좌측 패널: AI 생성 진단 문장 ================= */}
          <div className="p-5 sm:p-6 overflow-y-auto space-y-4 bg-slate-50/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs font-bold text-[#1d1d1f]">
                <Sparkles className="w-4 h-4 text-[#0071e3]" />
                <span>사업계획서 예시 문장 (클릭 시 근거 보기)</span>
              </div>
              <span className="text-[10px] text-[#86868b]">예시 {CITATION_PAIRS.length}건</span>
            </div>

            <div className="space-y-3">
              {CITATION_PAIRS.map((item) => {
                const is_selected = active_id === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => set_active_id(item.id)}
                    className={`p-4 rounded-2xl cursor-pointer transition-all border ${
                      is_selected
                        ? 'bg-white border-[#0071e3] shadow-apple-card scale-[1.01]'
                        : 'bg-white/70 hover:bg-white border-black/[0.04]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          is_selected ? 'bg-[#0071e3] text-white' : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        문장 #{item.id}
                      </span>
                      <span
                        className={`text-[10px] font-bold flex items-center gap-1 ${
                          item.검증상태 === '원문 확인' ? 'text-[#34c759]' : 'text-amber-600'
                        }`}
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{item.검증상태}</span>
                      </span>
                    </div>

                    <p className={`text-xs leading-relaxed ${is_selected ? 'text-[#1d1d1f] font-semibold' : 'text-slate-700'}`}>
                      {item.ai_text}
                    </p>

                    <div className="mt-2.5 pt-2 border-t border-black/[0.04] text-[11px] text-[#86868b] flex items-center justify-between">
                      <span className="line-clamp-1">{item.source_title}</span>
                      <span className="text-[#0071e3] font-medium flex items-center gap-0.5 flex-shrink-0">
                        <Eye className="w-3 h-3" />
                        <span>근거 보기</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ================= 우측 패널: 보건복지부 고시 실제 원문 (형광펜 하이라이트) ================= */}
          <div className="p-5 sm:p-6 overflow-y-auto space-y-4 bg-white">
            {/* 상단 문서 메타정보 */}
            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/60 flex items-start justify-between gap-3">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-amber-700" />
                  <span>근거 자료 요약</span>
                </span>
                <h4 className="text-xs font-bold text-[#1d1d1f]">{active_citation.source_title}</h4>
                <p className="text-[11px] text-amber-900 font-medium">{active_citation.source_page}</p>
              </div>
              <span className="text-[10px] px-2 py-1 rounded-full bg-white border border-amber-200 text-amber-800 font-mono font-semibold">
                {active_citation.검증상태}
              </span>
            </div>

            {/* 실제 법조항 원문 문서 렌더링 (노란색 형광펜 하이라이트) */}
            <div className="p-5 rounded-2xl bg-[#fdfcf7] border border-amber-200/80 shadow-inner font-serif text-slate-800 text-xs leading-relaxed space-y-3">
              <div className="text-center font-bold text-sm text-slate-900 pb-2 border-b border-amber-200/40">
                근거 자료 요약 (원문 전문 아님)
              </div>

              <div className="text-[11px] text-slate-500 italic">
                ... [생략] ...
              </div>

              {/* 형광펜 하이라이트 영역 */}
              <div className="p-3.5 rounded-xl bg-yellow-200/80 border-l-4 border-yellow-500 text-slate-900 font-medium shadow-sm transition-all">
                <span className="inline-block px-1.5 py-0.2 mb-1.5 text-[9px] font-bold bg-yellow-400 text-yellow-900 rounded">
                  문장 #{active_citation.id} 관련 근거
                </span>
                <pre className="font-serif whitespace-pre-wrap leading-relaxed text-xs">
                  {active_citation.matched_law_text}
                </pre>
              </div>

              <div className="text-[11px] text-slate-500 italic">
                ... [이하 부칙 생략] ...
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-[#86868b] pt-2 border-t border-black/[0.05]">
              <span>출처: {active_citation.검증_근거}</span>
              <span className="text-amber-600 font-bold flex items-center gap-1 shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>인용 전 원문 확인 필요</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
