'use client';

// Essential Care Map - AI 작동 원리 및 기술구조 상세 모달
// 사용자 요구사항 9번: 「AI가 어떻게 작동하나요?」 버튼을 통해 요청 시에만 기술구조 표출
// 사용자 ↓ AI Assistant ↓ AI Orchestrator ↓ Multi-Agents ↓ DW/CDW, AI Model, RAG ↓ LLM ↓ AI 정책대안 ↓ 사업계획서

import React from 'react';
import {
  X,
  Cpu,
  User,
  Bot,
  Workflow,
  Network,
  Database,
  Brain,
  Sparkles,
  FileText,
  ArrowDown,
  Info,
  ShieldCheck,
} from 'lucide-react';

interface AI_기술구조_모달_속성 {
  is_open: boolean;
  on_close: () => void;
}

export const AI_기술구조_모달: React.FC<AI_기술구조_모달_속성> = ({
  is_open,
  on_close,
}) => {
  if (!is_open) return null;

  const 파이프라인_노드들 = [
    {
      id: 'user',
      단계명: '사용자 (User)',
      부제목: '지자체 보건소장, 공공보건의료 기획관, 병원 행정가',
      설명: '지역 현황 질문 입력, 취약지 진단 요청 및 사업계획 수립 지시',
      아이콘: User,
      색상: 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700',
      태그: 'Domain Expert',
    },
    {
      id: 'assistant',
      단계명: 'AI Assistant',
      부제목: '대화형 자연어 인터페이스 & 프롬프트 엔진',
      설명: '사용자의 비구조화된 요구사항 해석 및 의도(Intent) 파악, 분석 파라미터 추출',
      아이콘: Bot,
      색상: 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900',
      태그: 'NLU / Dialogue Agent',
    },
    {
      id: 'orchestrator',
      단계명: 'AI Orchestrator',
      부제목: '작업 워크플로우 제어 및 파이프라인 총괄',
      설명: '진단 → 비교 → 수요 → 정책 → 보고서 생성 태스크를 분기하고 멀티 에이전트에 분배',
      아이콘: Workflow,
      색상: 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-900',
      태그: 'Workflow Engine',
    },
    {
      id: 'agents',
      단계명: 'Multi-Agent 협업 계층',
      부제목: 'Data Agent / Analysis Agent / Policy Agent',
      설명: '• Data Agent: 원천 데이터 쿼리 및 전처리\n• Analysis Agent: 1:1 비교 및 수요 예측 분석\n• Policy Agent: 법령 부합성 및 사업 타당성 검토',
      아이콘: Network,
      색상: 'bg-cyan-50 dark:bg-cyan-950/50 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-900',
      태그: 'Specialized Agents',
    },
    {
      id: 'data_foundation',
      단계명: 'DW / CDW · AI Model · RAG',
      부제목: '국가 보건의료 데이터웨어하우스 & 시계열 AI & 정책 RAG',
      설명: '• DW/CDW: 심평원/건보공단/헬스맵 7대 통합 데이터마트\n• AI Model: 2030 장래인구 및 질환별 입원수요 추계 ML 모델\n• RAG: 보건복지부 취약지 고시 및 우수 공모계획 벡터 코퍼스',
      아이콘: Database,
      색상: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900',
      태그: 'Enterprise Foundation',
    },
    {
      id: 'llm',
      단계명: 'LLM (대형 언어 모델)',
      부제목: '의료 도메인 맞춤형 추론 및 인과 관계 종합',
      설명: '데이터 증거와 정책 지침을 종합하여 정책 대안의 기대효과 및 논리적 타당성 추론',
      아이콘: Brain,
      색상: 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-900',
      태그: 'Reasoning Engine',
    },
    {
      id: 'alternatives',
      단계명: 'AI 정책대안 (Option A · B · C)',
      부제목: '3대 맞춤형 정책 시나리오 생성',
      설명: '자체 시설 보강형, 광역 연계형, 특화 진료형 등 지역 실정에 최적화된 복수 대안 제시',
      아이콘: Sparkles,
      색상: 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900',
      태그: 'Decision Support',
    },
    {
      id: 'proposal',
      단계명: '사업계획서 (Draft)',
      부제목: '12대 필수 항목 법정 표준 공문서 자동 생성',
      설명: '선택한 정책대안과 지역 통계를 조합하여 공모 신청 가능한 표준 사업계획서 초안 완성',
      아이콘: FileText,
      색상: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900',
      태그: 'Government Document',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#15161b] rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        {/* 헤더 */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                AI 시스템 아키텍처
              </span>
              <span className="text-xs text-slate-400">To-Be 모델 기술 구조</span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Cpu className="w-5 h-5 text-blue-600" />
              <span>AI가 어떻게 작동하나요?</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              단순한 텍스트 생성이 아닌, 다중 에이전트와 공공의료 데이터 인프라가 유기적으로 연계된 종합 분석 파이프라인입니다.
            </p>
          </div>
          <button
            type="button"
            onClick={on_close}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 아키텍처 플로우 다이어그램 (스크롤) */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-3">
          <div className="p-3.5 rounded-2xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 flex items-start gap-2.5 mb-2 text-xs text-blue-900 dark:text-blue-200 leading-relaxed">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <span>
              기본 작업 화면에서는 담당자가 복잡한 기술 용어 없이 직관적으로 결과를 볼 수 있도록 단순화되어 있으며, 본 창에서 전체 처리 기술 스택을 확인할 수 있습니다.
            </span>
          </div>

          <div className="space-y-2">
            {파이프라인_노드들.map((node, index) => {
              const NodeIcon = node.아이콘;
              return (
                <React.Fragment key={node.id}>
                  <div
                    className={`p-3.5 rounded-2xl border transition-all ${node.색상}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-xl bg-white/80 dark:bg-slate-900/80 shadow-xs shrink-0 mt-0.5">
                          <NodeIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black">
                              {node.단계명}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/5 dark:bg-white/10 font-bold">
                              {node.태그}
                            </span>
                          </div>
                          <div className="text-[11px] font-semibold opacity-80 mt-0.5">
                            {node.부제목}
                          </div>
                          <p className="text-xs opacity-90 mt-1 whitespace-pre-line leading-relaxed">
                            {node.설명}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-black opacity-60 shrink-0">
                        STEP 0{index + 1}
                      </span>
                    </div>
                  </div>

                  {/* 연결 화살표 */}
                  {index < 파이프라인_노드들.length - 1 && (
                    <div className="flex justify-center py-0.5">
                      <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
                        <ArrowDown className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* 푸터 */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-[#121318] flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>국가 공공의료 AI 윤리 기준 및 설명가능성(XAI) 설계 준수</span>
          </div>
          <button
            type="button"
            onClick={on_close}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition cursor-pointer"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};
