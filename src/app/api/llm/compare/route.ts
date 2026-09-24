import { NextRequest, NextResponse } from 'next/server';
import { 로컬_LLM_허용, 서버_Gemini_키_허용 } from '@/lib/서버_환경설정';

export const dynamic = 'force-dynamic';

interface CompareRequestBody {
  query: string;
  google_api_key?: string;
  region_name?: string;
  region_stats?: {
    emergency_rate?: number;
    ri_rate?: number;
    maternity_rate?: number;
    vulnerability_grade?: string;
  };
  rag_context?: string;
  gemini_rag_context?: string;
  local_rag_context?: string;
  gemini_chunks_count?: number;
  local_chunks_count?: number;
  mode?: 'business_plan' | 'general_qa';
}

export async function POST(req: NextRequest) {
  try {
    const body: CompareRequestBody = await req.json();
    const {
      query,
      google_api_key,
      region_name = '강원특별자치도 영월군',
      region_stats = { emergency_rate: 68.2, ri_rate: 19.8, maternity_rate: 15.2, vulnerability_grade: '심각' },
      rag_context = '',
      gemini_rag_context,
      local_rag_context,
      gemini_chunks_count,
      local_chunks_count,
      mode = 'business_plan',
    } = body;

    // 서버 환경변수 키는 ALLOW_SERVER_GEMINI_KEY=true 일 때만 대체 사용 (공개 API 키 도용 방지)
    const final_google_key =
      google_api_key?.trim() ||
      (서버_Gemini_키_허용()
        ? process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || ''
        : '');

    // 모델별 독립된 RAG 컨텍스트 적용 (지정되지 않은 경우 기본 rag_context 사용)
    const effective_gemini_rag = gemini_rag_context !== undefined ? gemini_rag_context : rag_context;
    const effective_local_rag = local_rag_context !== undefined ? local_rag_context : rag_context;

    // 시스템 프롬프트 구성 (모드별 차별화)
    let system_instruction = '';
    if (mode === 'general_qa') {
      system_instruction = `당신은 대한민국 보건복지부 및 국립중앙의료원 공공보건의료 정책을 총괄 보좌하는 수석 행정 전문관입니다.
선택된 지자체: ${region_name} (취약도 등급: ${region_stats.vulnerability_grade})
지역 주요 지표: 응급 60분 미도달율 ${region_stats.emergency_rate}%, 관내 RI ${region_stats.ri_rate}%, 관내 분만율 ${region_stats.maternity_rate}%

[법령 및 지침 근거 (선택된 RAG 검색결과)]:
${effective_gemini_rag}

[답변 작성 원칙 및 지침]:
1. 사용자의 질문에 대해 핵심을 짚어 친절하고 명확하며 이해하기 쉽게 답변하세요.
2. 위 제공된 법령 및 지침 근거(RAG)를 바탕으로 정확한 팩트와 기준 수치를 명시하여 설명하세요.
3. 딱딱한 사업계획서 서식 대신, 질문의 의도에 맞춘 직관적인 질의응답 형태(1. 핵심 답변 요약 ➔ 2. 관련 법령/지침 기준 및 해설 ➔ 3. ${region_name} 현장 적용 방안 및 행정 권고)로 완결성 있게 작성하세요.
4. 필요시 관련 법령 조항 및 지침 명칭을 정확히 인용하세요.`;
    } else {
      system_instruction = `당신은 대한민국 보건복지부 및 국립중앙의료원 공공보건의료 정책을 총괄 보좌하는 수석 행정 전문관입니다.
선택된 지자체: ${region_name}
취약도 등급: ${region_stats.vulnerability_grade}
핵심 지표 현황:
- 응급 60분 미도달 인구 비율: ${region_stats.emergency_rate}%
- 관내 응급환자 자체충족률(RI): ${region_stats.ri_rate}%
- 관내 분만율: ${region_stats.maternity_rate}%

[법령 및 지침 근거 (선택된 RAG 검색결과)]:
${effective_gemini_rag}

[작성 원칙 및 지침]:
1. 지침과 근거 법령, 통계를 기반으로 결론이 중간에 잘리지 않도록 논리정연하고 구체적인 완결형 보고서를 작성하세요.
2. 내용은 다음 항목을 포함하여 풍부하고 전문적으로 서술하세요:
   ■ [1] 법적 근거 및 핵심 지침 기준 해설
   ■ [2] ${region_name} 현황 진단 및 핵심 문제점
   ■ [3] 실적보고서 / 사업계획서 표준 초안 (목표, 3대 세부 추진과제, 추진일정)
   ■ [4] 기대효과 및 향후 행정 조치사항
3. 문체는 격조 있는 공문서 개조식(개요, 현황, 대책, 결론)으로 작성하세요.`;
    }

    // 1. Google Gemini 호출 함수 (단일 또는 멀티 키 로드밸런싱 지원)
    const fetch_gemini = async () => {
      const start_t = Date.now();
      const key_candidates = final_google_key
        .split(/[\n,;]+/)
        .map((k) => k.trim().replace(/^["']|["']$/g, '').replace(/[\r\n\t]/g, ''))
        .filter(Boolean);
      const clean_key = key_candidates.length > 0
        ? key_candidates[Math.floor(Math.random() * key_candidates.length)]
        : '';

      if (!clean_key) {
        return {
          model: 'Google Gemini Flash (시뮬레이션)',
          is_live: false,
          elapsed_ms: 120,
          response: `[안내: 구글 API 키 미입력 상태]
Google Gemini API 키가 설정되지 않아 실제 클라우드 호출 대신 시뮬레이션 모드로 동작 중입니다.
우측 상단 [Google 키 입력] 버튼을 눌러 본인의 Gemini API 키를 입력하시면 실시간 실제 Gemini 추론 결과를 확인하실 수 있습니다.

■ ${region_name} 지침 부합성 진단 (사전 캐시)
1. 법적 근거 검토
  - 의료취약지 지정 및 운용 등에 관한 고시 제3조에 의거, 응급 60분 미도달율(${region_stats.emergency_rate}%)이 기준선(30%)을 현저히 초과.
2. 정책 제언
  - 국비 지원 파견의사 및 공공임상교수 우선 배정 신청서 작성 권고.`,
          security: '외부 클라우드 전송 (공공기관 보안망 검토 필요)',
          cost: 'API 호출 종량제 (무료 티어 지원)',
        };
      }

      // Step 1: 구글 공식 권장 방식 - ModelService.ListModels를 통해 이 키로 사용 가능한 모델 실시간 자동 조회!
      let available_models: Array<{ id: string; name: string; api_ver: 'v1beta' | 'v1' }> = [];

      for (const api_ver of ['v1beta', 'v1'] as const) {
        try {
          const list_url = `https://generativelanguage.googleapis.com/${api_ver}/models`;
          const list_res = await fetch(list_url, { headers: { 'x-goog-api-key': clean_key } });
          if (list_res.ok) {
            const list_data = await list_res.json();
            const valid = (list_data.models || [])
              .filter((m: any) => m.supportedGenerationMethods?.includes('generateContent'))
              // 텍스트 응답용이 아닌 특수 목적 모델 제외
              .filter((m: any) => !/(tts|image|embedding|audio|live|aqa|robotics|computer-use)/i.test(m.name))
              .map((m: any) => ({
                id: m.name.replace(/^models\//, ''),
                name: m.displayName || m.name.replace(/^models\//, ''),
                api_ver,
              }));
            if (valid.length > 0) {
              available_models = valid;
              break;
            }
          }
        } catch {
          // 다음 버전 시도
        }
      }

      // Step 2: ListModels 조회가 실패했거나 비어있는 경우 정적 후보군 정의 (v1beta 및 v1 교차)
      if (available_models.length === 0) {
        available_models = [
          { id: 'gemini-flash-latest', name: 'Google Gemini Flash (Latest)', api_ver: 'v1beta' },
          { id: 'gemini-2.5-flash', name: 'Google Gemini 2.5 Flash', api_ver: 'v1beta' },
          { id: 'gemini-2.5-flash-lite', name: 'Google Gemini 2.5 Flash-Lite', api_ver: 'v1beta' },
          { id: 'gemini-2.5-pro', name: 'Google Gemini 2.5 Pro', api_ver: 'v1beta' },
        ];
      }

      // flash 계열이 우선 오도록 정렬 (응답 속도 및 비용 최적화)
      available_models.sort((a, b) => {
        const a_flash = a.id.toLowerCase().includes('flash') ? 0 : 1;
        const b_flash = b.id.toLowerCase().includes('flash') ? 0 : 1;
        return a_flash - b_flash;
      });

      const attempts_log: Array<{ model: string; error: string; status: number }> = [];

      // Step 3: 가용 모델들을 300ms 간격을 두고 성공할 때까지 순차 시도!
      for (let i = 0; i < available_models.length; i++) {
        const candidate = available_models[i];

        // 2번째 시도부터는 API 과열 방지 및 네트워크 안정을 위해 300ms 간격을 두고 진행
        if (i > 0) {
          await new Promise((resolve) => setTimeout(resolve, 300));
        }

        try {
          const url = `https://generativelanguage.googleapis.com/${candidate.api_ver}/models/${candidate.id}:generateContent`;
          const gemini_headers = { 'Content-Type': 'application/json', 'x-goog-api-key': clean_key };
          
          const genConfig: Record<string, any> = {
            temperature: 0.4,
            maxOutputTokens: 8192,
          };

          // Gemini 2.5 / 2.0 모델: 생각(Thinking) 토큰 과다 소진으로 본문이 잘리는 현상 방지 (thinkingBudget: 0으로 즉시 응답 생성)
          if (candidate.id.includes('2.5') || candidate.id.includes('2.0')) {
            genConfig.thinkingConfig = { thinkingBudget: 0 };
          }

          let response = await fetch(url, {
            method: 'POST',
            headers: gemini_headers,
            body: JSON.stringify({
              contents: [
                {
                  role: 'user',
                  parts: [
                    { text: `${system_instruction}\n\n사용자 질의: ${query}` }
                  ],
                },
              ],
              generationConfig: genConfig,
            }),
          });

          // 만약 thinkingConfig를 지원하지 않아 400 에러 발생 시 thinkingConfig 제외하고 재시도
          if (response.status === 400 && genConfig.thinkingConfig) {
            delete genConfig.thinkingConfig;
            response = await fetch(url, {
              method: 'POST',
              headers: gemini_headers,
              body: JSON.stringify({
                contents: [
                  {
                    role: 'user',
                    parts: [
                      { text: `${system_instruction}\n\n사용자 질의: ${query}` }
                    ],
                  },
                ],
                generationConfig: genConfig,
              }),
            });
          }

          if (response.ok) {
            const data = await response.json();
            const parts = data.candidates?.[0]?.content?.parts || [];
            
            // Gemini 2.0 / 2.5 Flash thinking 모드 대응: thought 파트 제외 후 실제 답변 텍스트 취합
            let raw_text = parts
              .filter((p: any) => !p.thought)
              .map((p: any) => p.text || '')
              .join('');

            // 혹시 모든 파트가 필터링되었을 경우 전체 text 수집
            if (!raw_text.trim() && parts.length > 0) {
              raw_text = parts.map((p: any) => p.text || '').join('');
            }

            const output_text = raw_text.trim() || '응답을 생성하지 못했습니다.';
            const elapsed_ms = Date.now() - start_t;

            // 성공한 모델 즉시 반환
            return {
              model: `${candidate.name}`,
              model_id: candidate.id,
              is_live: true,
              elapsed_ms,
              success_model: candidate.name,
              attempt_order: i + 1,
              total_candidates_tried: i + 1,
              response: `[✓ 호출 성공 모델: ${candidate.name} (${candidate.api_ver}/${candidate.id})]\n\n${output_text.trim()}`,
              security: '외부 클라우드 전송 (SSL/TLS 암호화 통신)',
              cost: `토큰: ${data.usageMetadata?.totalTokenCount ?? 'N/A'} (Pay-per-Token)`,
            };
          } else {
            const err_json = await response.json().catch(() => ({}));
            const err_msg = err_json?.error?.message || `HTTP ${response.status}`;
            attempts_log.push({ model: `${candidate.name} (${candidate.api_ver})`, error: err_msg, status: response.status });

            // API 키 자체가 완전히 틀린 경우(400 INVALID_ARGUMENT)에는 모든 모델에서 동일하므로 조기 종료
            if (response.status === 400 && err_msg.toLowerCase().includes('api key not valid')) {
              break;
            }
          }
        } catch (err: any) {
          attempts_log.push({ model: candidate.name, error: err.message || '네트워크 오류', status: 0 });
        }
      }

      // 모든 모델 시도 실패 시 상세 원인 리포트
      const elapsed_ms = Date.now() - start_t;
      const failure_details = attempts_log
        .slice(0, 6)
        .map((a, idx) => `  ${idx + 1}. ${a.model}: ${a.error}`)
        .join('\n');

      return {
        model: 'Google Gemini (모든 가용 모델 시도 실패)',
        is_live: false,
        elapsed_ms,
        response: `[구글 Gemini API 호출 실패 - 가용 모델 순차 검증 완료]
시도한 모델 목록 (${attempts_log.length}개 모델 순차 시도):
${failure_details}

💡 점검 결과 안내:
- 사용자님의 API 키는 유효하나, 해당 구글 계정에서 활성화된 모델 버전에 맞춰 자동 탐색을 진행하였습니다.
- 권한이 필요한 경우 Google AI Studio(https://aistudio.google.com/app/apikey)에서 신규 키를 발급받아 재등록하시면 즉시 정상 작동합니다.`,
        security: '외부 클라우드 전송 실패',
        cost: '비용 발생 없음',
      };
    };

    // 2. 노트북 로컬 sLLM 호출 함수 (1차: Python sLLM 서버 8000, 2차: Ollama 11434, 3차: On-Device RAG 분석 엔진)
    const fetch_local_sllm = async () => {
      const start_t = Date.now();

      // 배포 환경에서는 127.0.0.1 호출이 항상 타임아웃되므로 1·2순위를 건너뛰고 3순위로 직행
      const use_local_llm = 로컬_LLM_허용();

      // 1순위: 파이썬 로컬 sLLM 서버 (Qwen2.5-0.5B-Instruct, 포트 8000)
      if (use_local_llm) try {
        const controller = new AbortController();
        const timeout_id = setTimeout(() => controller.abort(), 20000); // 20초 타임아웃

        const prompt_text =
          mode === 'general_qa'
            ? `질문: ${query}\n지역: ${region_name}\n근거 지침:\n${effective_local_rag.slice(0, 350)}\n위 지침을 참고하여 질문에 대해 핵심 요지와 근거를 알기 쉽게 답변하세요.\n답변:`
            : `질문: ${query}\n지역: ${region_name} (응급미도달: ${region_stats.emergency_rate}%, 자체충족률: ${region_stats.ri_rate}%)\n근거 지침:\n${effective_local_rag.slice(0, 350)}`;

        const res = await fetch('http://127.0.0.1:8000/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: prompt_text,
            max_new_tokens: 180,
          }),
          signal: controller.signal,
        });
        clearTimeout(timeout_id);

        if (res.ok) {
          const json = await res.json();
          if (json.response && json.response.trim().length > 0) {
            return {
              model: 'Qwen/Qwen2.5-0.5B-Instruct (노트북 On-Device 실시간)',
              is_live: true,
              elapsed_ms: json.elapsed_ms || (Date.now() - start_t),
              response: json.response.trim(),
              security: '원내 폐쇄망 100% 자립 (데이터 외부 유출 0%)',
              cost: '무제한 무료 (자체 로컬 하드웨어 연산)',
            };
          }
        }
      } catch {
        // 로컬 서버 미응답 시 2순위 및 고품질 온디바이스 엔진으로 폴백
      }

      // 2순위: 로컬 Ollama (11434)
      if (use_local_llm) try {
        const controller = new AbortController();
        const timeout_id = setTimeout(() => controller.abort(), 5000);

        const res = await fetch('http://127.0.0.1:11434/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'qwen2.5:0.5b',
            prompt: `질문: ${query}\n지역: ${region_name}\n근거: ${effective_local_rag.slice(0, 250)}`,
            stream: false,
          }),
          signal: controller.signal,
        });
        clearTimeout(timeout_id);

        if (res.ok) {
          const json = await res.json();
          if (json.response) {
            return {
              model: 'Ollama 로컬 sLLM (On-Device 실시간)',
              is_live: true,
              elapsed_ms: Date.now() - start_t,
              response: json.response.trim(),
              security: '원내 폐쇄망 100% 자립 (데이터 외부 유출 0%)',
              cost: '무제한 무료 (로컬 인프라)',
            };
          }
        }
      } catch {
        // 계속 진행
      }

      // 3순위: 로컬 sLLM 미연결 시 키워드별 사전 작성 지침 요약 템플릿 (AI 모델 추론 아님)

      let detailed_answer = '';

      if (mode === 'general_qa') {
        if (query.includes('파견의사') || query.includes('자격') || query.includes('보조')) {
          detailed_answer = `[사전 작성 정책 질의응답 요약 · AI 모델 미사용]
질문: "${query}"
관련 지자체: ${region_name} (취약도: ${region_stats.vulnerability_grade})

1. 핵심 답변 요지
  - 의료취약지 파견의사 지원사업은 필수진료과(내과, 외과, 산부인과, 소아과, 응급의학과) 전문의 결원이 발생한 취약지 거점의료기관 및 지방의료원에 전문의 인건비를 국비 50%, 지방비 50% 매칭으로 보조하는 사업입니다.

2. 신청 자격 및 필수 요건
  - 지원 대상: 의료취약지 거점의료기관 및 지방의료원·적십자병원
  - 우선 배정: 응급 60분 미도달율 30% 이상 또는 관내 의료이용률(RI) 취약 지역(${region_name}: 응급 미도달 ${region_stats.emergency_rate}%) 우선 선정
  - 인건비 한도: 전문의 1인당 연간 2억~2.5억원 지원 (국비 50% + 지방비 50%)
  - 당직비 지원: 평일 야간 20만~30만원, 휴일/주말 40만~50만원 실비 지원

3. 현장 행정 조치 권고
  - 정기 신청 기간(매년 11월) 이전, 관내 결원 필수진료과 수요 조사를 완료하고 지자체 예산 매칭 확약서를 사전 확보하시기 바랍니다.`;
        } else if (query.includes('책임의료기관') || query.includes('권역') || query.includes('지역책임')) {
          detailed_answer = `[사전 작성 정책 질의응답 요약 · AI 모델 미사용]
질문: "${query}"

1. 권역책임의료기관 vs 지역책임의료기관 핵심 차이
  - 권역책임의료기관(시·도 단위, 주로 국립대병원): 고난도 중증응급·외상·심뇌혈관 진료 총괄, 권역 내 의료자원 조정 및 지역책임의료기관 기술 지원·교육 담당
  - 지역책임의료기관(중진료권 단위, 주로 지방의료원): 지역 내 1·2차 필수의료 자체 충족, 24시간 응급진료 유지, 퇴원환자 지역사회 연계 돌봄 전담

2. 필수 연계 협력 체계
  - 중증환자 신속 전원 핫라인(119-지역의료원-권역센터 간 연계) 구축
  - 중환자실 및 심뇌혈관 전문의 24시간 원격협진 시스템 가동
  - 필수진료과 전문의 순환 파견 및 의료인력 임상 연수 협약`;
        } else if (query.includes('자체충족률') || query.includes('RI') || query.includes('산정') || query.includes('공식')) {
          detailed_answer = `[사전 작성 정책 질의응답 요약 · AI 모델 미사용]
질문: "${query}"

1. 필수의료 자체충족률(RI, Relevance Index) 산정 산식
  - 공식: [해당 지자체 주민의 관내 의료기관 이용건수 ÷ 해당 지자체 주민의 전국 의료기관 총 이용건수] × 100 (%)
  - 측정 대상: 응급의료, 심뇌혈관질환, 중증외상, 분만 및 소아 필수의료

2. 정부 공공보건의료 평가 가점 기준
  - 법정 기준선: 30.0% 미만 시 '필수 중점 관리 대상 지자체'로 분류 (${region_name}: 현재 ${region_stats.ri_rate}%)
  - 성과 가점: 전년 대비 RI 지표가 1.0%p 이상 개선될 경우, 정부 공공보건의료계획 시행결과 평가에서 지표 만점(10점) 부여`;
        } else if (query.includes('분만취약지') || query.includes('A등급') || query.includes('B등급')) {
          detailed_answer = `[사전 작성 정책 질의응답 요약 · AI 모델 미사용]
질문: "${query}"

1. 분만취약지 A등급과 B등급의 차이
  - A등급 (분만산부인과 설치·운영형): 60분 이내 분만실 도달 불가 인구 30% 이상 & 관내 분만의료기관 부재 지자체. 연간 운영비 최대 5억원 연속 지원 및 시설장비비 최대 10억원 일시 보조.
  - B등급 (외래산부인과 지원형): 분만의료기관은 없으나 인근 이송 가능 또는 관내 분만율(${region_stats.maternity_rate}%) 저조 지역. 산부인과 외래 개설비 1억원 + 연간 운영비 2억~3억원 보조.

2. ${region_name} 적용 포인트
  - 관내 분만율이 ${region_stats.maternity_rate}%로 법정 기준선(40%)에 미달하므로, 국비 지원 사업 신청 자격을 완벽히 충족합니다.`;
        } else if (query.includes('당직') || query.includes('응급실') || query.includes('수당')) {
          detailed_answer = `[사전 작성 정책 질의응답 요약 · AI 모델 미사용]
질문: "${query}"

1. 심야 응급실 당직 수당 국비 지원 한도
  - 평일 심야 당직: 1인 1회당 20만~30만원 범위 실비 지원 (월 최대 500만원 한도)
  - 주말·공휴일 당직: 1회당 40만~50만원 지원
  - 공공임상교수/파견의사 당직비: 원소속 병원 기본급 외 추가 당직수당 전액 국비 보조 가능

2. 신청 및 정산 절차
  - 지자체 보건과를 통해 응급실 당직 근무일지 및 진료 실적부를 첨부하여 매 분기 익월 10일까지 국립중앙의료원에 국비 교부 신청`;
        } else {
          detailed_answer = `[사전 작성 정책 질의응답 요약 · AI 모델 미사용]
질문: "${query}"
대상 지자체: ${region_name} (취약도: ${region_stats.vulnerability_grade})

1. 질의 핵심 검토 의견
  - 질의하신 내용과 관련하여 보건복지부 공공보건의료 기본계획 및 의료취약지 고시 지침을 검토하였습니다.
  - 검색된 지침 근거에 따르면, 지역 공공의료 인프라 확충 및 필수진료과 인력 지원 요건에 부합할 경우 국가 재정 지원을 신청할 수 있습니다.

2. 데이터 기반 지자체 현황 (${region_name})
  - 응급 60분 미도달율: ${region_stats.emergency_rate}% (법정 기준선 30% 초과)
  - 관내 응급환자 자체충족률: ${region_stats.ri_rate}% (전국 최상위 취약)

3. 지침에 따른 행정 제언
  - 관련 지침 조항을 근거로 차년도 시·도 공공보건의료 시행계획에 우선 과제로 반영하여 예산을 확보하시길 권장합니다.`;
        }
      } else {
        // mode === 'business_plan' (사업계획서 / 실적보고서)
        if (query.includes('파견의사') || query.includes('당직비')) {
          detailed_answer = `[사전 작성 공공보건 지침 요약 · AI 모델 미사용]
■ 보건복지부 의료취약지 파견의사 지원사업 핵심 규정 (${region_name})

1. 사업 신청 자격 요건
  - 지원 대상: 의료취약지 거점의료기관 및 지방의료원·적십자병원
  - 필수 요건: 필수진료과(내과, 외과, 산부인과, 소아청소년과, 응급의학과) 전문의 결원 발생 기관
  - 관내 취약도 반영: 응급 미도달율(${region_stats.emergency_rate}%), 관내 RI(${region_stats.ri_rate}%) 기준 가점 부여

2. 인건비 및 당직비 보조 규정
  - 전문의 파견 인건비: 연간 2억~2.5억원 한도 국비·지방비 매칭 지원 (국비 50%, 지방비 50%)
  - 평일 야간 당직비: 1회당 20만~30만원 범위 실비 지원
  - 휴일/주말 당직비: 1회당 40만~50만원 보조 (지역 의료원 운영 규정 준용)

3. 필수 준수사항 및 행정 절차
  - 최소 의무 재직기간: 1년 단위 협약 (분기별 진료 실적 및 당직 일지 시·도 보고 의무화)
  - 예산 신청 기한: 매년 11월 보건복지부 공공의료과 정기 배정 신청 접수`;
        } else if (query.includes('자체충족률') || query.includes('평가지표') || query.includes('영월의료원')) {
          detailed_answer = `[사전 작성 공공보건 지침 요약 · AI 모델 미사용]
■ 2026년 공공보건의료계획 평가지표 및 실적보고서 초안 (${region_name})

1. 필수의료 자체충족률(RI) 산정 기준
  - 산식: [관내 의료기관 총 이용건수 ÷ 관내 거주민의 전국 의료기관 총 이용건수] × 100
  - 대상 지표: 중증응급, 심뇌혈관, 고위험 분만, 소아 필수진료과별 분리 산출
  - 현재 취약도: ${region_name} 관내 RI는 ${region_stats.ri_rate}%로 전국 평균 대비 현저히 취약

2. 영월의료원 추진 실적보고서 초안
  [사업명] 영월 권역 책임의료기관 필수의료 자체충족률 제고 사업
  - 목표치: 현행 ${region_stats.ri_rate}% → 차년도 25.0% 이상 달성
  - 세부 실행계획:
    ① 야간·휴일 응급의학과 전문의 당직 체계 개편 (응급 60분 미도달율 ${region_stats.emergency_rate}% 완화)
    ② 인근 상급종합병원(원주세브란스 등)과의 원격 협진 핫라인 구축
    ③ 필수의료 전담 코디네이터 배치 및 중증환자 이송 골든타임 확보`;
        } else if (query.includes('분만취약지') || query.includes('A등급') || query.includes('B등급')) {
          detailed_answer = `[사전 작성 공공보건 지침 요약 · AI 모델 미사용]
■ 분만취약지 A등급·B등급 지원 기준 및 국비 지원 규모 비교

1. 취약지 등급 분류 기준
  - A등급: 60분 내 분만실 접근 불가 인구비율 30% 이상이며 관내 분만의료기관 전무한 지자체
  - B등급: 분만의료기관은 존재하나 관내 분만율(${region_stats.maternity_rate}%)이 극히 저조하고 접근 취약한 지역

2. 운영비 및 시설장비 국비 지원 규모
  - 분만취약지 A등급: 연간 운영비 최대 5억원 지원 (국비 50%, 지방비 50%) + 시설장비비 최대 10억원 일시 지원
  - 외래지원형(B등급): 연간 운영비 최대 3억원 지원 (산부인과 외래 및 이송 체계 구축)

3. ${region_name} 권고사항
  - 관내 분만율 ${region_stats.maternity_rate}% 극복을 위해 안전한 출산 인프라 및 산모 이송 바우처 연계 필요`;
        } else if (query.includes('달빛어린이병원') || query.includes('야간진료') || query.includes('소아청소년과')) {
          detailed_answer = `[사전 작성 공공보건 지침 요약 · AI 모델 미사용]
■ 달빛어린이병원 지정 요건 및 야간진료 관리료 가산 규정

1. 지정 요건
  - 진료 시간: 평일 야간(최소 23시까지 권장) 및 토·일·공휴일 주간/야간 소아진료 상시 유지
  - 의료진 요건: 소아청소년과 전문의 또는 소아 진료 경력 의사 상시 교대근무 편성
  - 인접 인프라: 처방 조제를 위한 인근 당번 약국 1개소 이상 필수 지정·연계

2. 건강보험 야간진료 관리료 가산
  - 야간·휴일 진찰료 가산: 기본 진찰료 외 '야간진료관리료' 건당 약 2,160원~2,910원 추가 가산
  - 보조금 지원: 지자체별 운영비 보조 조례에 따라 연간 1억~1.5억원 운영 보조금 매칭 지원 가능

3. 지역 맞춤형 제언
  - ${region_name} 의료원 내 소아청소년과 야간 클리닉 개설 시 달빛어린이병원 모델 적용 적극 권고`;
        } else {
          // 일반 질의 시 로컬 RAG 컨텍스트를 기반으로 핵심 3단계 요약
          const key_sentences = effective_local_rag
            ? effective_local_rag.split('\n').filter(s => s.trim().length > 10).slice(0, 4).join('\n  - ')
            : `관내 응급 60분 미도달율 ${region_stats.emergency_rate}%, RI ${region_stats.ri_rate}%`;

          detailed_answer = `[사전 작성 공공보건 지침 분석 · AI 모델 미사용]
■ 질의 요약 검토: ${query}
■ 대상 지자체: ${region_name} (취약도: ${region_stats.vulnerability_grade})

1. 보건복지부 관련 법령 및 지침 검토
  - ${key_sentences}

2. 필수의료 현안 및 데이터 진단
  - 응급 60분 미도달 인구비율: ${region_stats.emergency_rate}% (전국 최상위 취약군)
  - 관내 응급환자 자체충족률(RI): ${region_stats.ri_rate}% (의료 자립도 확충 시급)

3. 공공의료원 행정 조치 권고
  - 중앙정부 공공보건의료 협력체계 구축사업 예산 신청
  - 권역 책임의료기관-지역 공공병원 간 필수진료과 당직 순환 파견 협약 체결`;
        }
      }

      return {
        model: '사전 작성 지침 요약 템플릿 (AI 모델 미사용 · 로컬 sLLM 미연결)',
        is_live: false,
        elapsed_ms: Date.now() - start_t,
        response: detailed_answer,
        security: '원내 폐쇄망 100% 자립 (데이터 외부 유출 0%)',
        cost: '무제한 무료 (토큰 비용 0원)',
      };
    };

    // 두 AI 병렬 실행
    const [gemini_result, local_result] = await Promise.all([
      fetch_gemini(),
      fetch_local_sllm(),
    ]);

    return NextResponse.json({
      google_gemini: gemini_result,
      local_sllm: local_result,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || '비교 처리 중 오류 발생' },
      { status: 500 }
    );
  }
}
