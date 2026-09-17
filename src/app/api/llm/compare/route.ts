import { NextRequest, NextResponse } from 'next/server';

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
    } = body;

    const final_google_key =
      google_api_key?.trim() ||
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY ||
      '';

    // 시스템 프롬프트 구성
    const system_instruction = `당신은 대한민국 보건복지부 및 국립중앙의료원 공공보건의료 정책을 보좌하는 최고 수준의 AI 전문관입니다.
선택된 지자체: ${region_name}
취약도 등급: ${region_stats.vulnerability_grade}
주요 지표:
- 응급 60분 미도달 인구 비율: ${region_stats.emergency_rate}%
- 관내 응급환자 자체충족률(RI): ${region_stats.ri_rate}%
- 관내 분만율: ${region_stats.maternity_rate}%

[법령 및 지침 근거 (RAG 검색결과)]:
${rag_context}

지침과 통계를 근거로 전문적이고 논리정연한 공문서 개조식 보고서 형태로 답변하세요.`;

    // 1. Google Gemini 호출 함수
    // 1. Google Gemini 다중 모델 순차 호출 함수 (가용 모델을 성공할 때까지 간격을 두고 시도)
    const fetch_gemini = async () => {
      const start_t = Date.now();
      const clean_key = final_google_key.trim().replace(/^["']|["']$/g, '').replace(/[\r\n\t]/g, '');

      if (!clean_key) {
        return {
          model: 'Google Gemini 1.5 Flash (시뮬레이션)',
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

      // 지원 모델 후보군 (우선순위 순서대로 순차 시도)
      const CANDIDATE_MODELS = [
        { id: 'gemini-1.5-flash', name: 'Google Gemini 1.5 Flash', desc: '초고속 표준 모델' },
        { id: 'gemini-2.0-flash', name: 'Google Gemini 2.0 Flash', desc: '차세대 2.0 플래그십' },
        { id: 'gemini-1.5-flash-8b', name: 'Google Gemini 1.5 Flash-8B', desc: '초경량 고효율 모델' },
        { id: 'gemini-2.0-flash-exp', name: 'Google Gemini 2.0 Flash Exp', desc: '2.0 익스페리멘탈' },
        { id: 'gemini-1.5-pro', name: 'Google Gemini 1.5 Pro', desc: '고성능 심층 분석 모델' },
        { id: 'gemini-pro', name: 'Google Gemini 1.0 Pro', desc: '안정형 레거시 모델' },
      ];

      const attempts_log: Array<{ model: string; error: string; status: number }> = [];

      for (let i = 0; i < CANDIDATE_MODELS.length; i++) {
        const candidate = CANDIDATE_MODELS[i];

        // 2번째 시도부터는 API 과열 방지 및 네트워크 안정을 위해 400ms 간격을 두고 진행
        if (i > 0) {
          await new Promise((resolve) => setTimeout(resolve, 400));
        }

        try {
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${candidate.id}:generateContent?key=${clean_key}`;
          const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  role: 'user',
                  parts: [
                    { text: `${system_instruction}\n\n사용자 질의: ${query}` }
                  ],
                },
              ],
              generationConfig: {
                temperature: 0.4,
                maxOutputTokens: 800,
              },
            }),
          });

          if (response.ok) {
            const data = await response.json();
            const output_text =
              data.candidates?.[0]?.content?.parts?.[0]?.text || '응답을 생성하지 못했습니다.';
            const elapsed_ms = Date.now() - start_t;

            // 성공한 모델 즉시 반환
            return {
              model: `${candidate.name} (성공)`,
              model_id: candidate.id,
              is_live: true,
              elapsed_ms,
              success_model: candidate.name,
              attempt_order: i + 1,
              total_candidates_tried: i + 1,
              response: `[✓ 호출 성공 모델: ${candidate.name} (${candidate.id})]\n\n${output_text.trim()}`,
              security: '외부 클라우드 전송 (SSL/TLS 암호화 통신)',
              cost: `토큰: ${data.usageMetadata?.totalTokenCount ?? 'N/A'} (Pay-per-Token)`,
            };
          } else {
            const err_json = await response.json().catch(() => ({}));
            const err_msg = err_json?.error?.message || `HTTP ${response.status}`;
            attempts_log.push({ model: candidate.name, error: err_msg, status: response.status });

            // API 키 자체가 완전히 틀린 경우(400 INVALID_ARGUMENT)에는 모든 모델에서 동일하므로 빠르게 종료하거나 다음 시도
            if (response.status === 400 && err_msg.toLowerCase().includes('api key not valid')) {
              break;
            }
          }
        } catch (err: any) {
          attempts_log.push({ model: candidate.name, error: err.message || '네트워크 오류', status: 0 });
        }
      }

      // 모든 모델 시도 실패 시
      const elapsed_ms = Date.now() - start_t;
      const failure_details = attempts_log
        .map((a, idx) => `  ${idx + 1}. ${a.model}: ${a.error}`)
        .join('\n');

      return {
        model: 'Google Gemini (모든 가용 모델 시도 실패)',
        is_live: false,
        elapsed_ms,
        response: `[구글 Gemini API 호출 실패 - 가용 모델 순차 시도 완료]
시도한 모델 목록 (${attempts_log.length}개 모델 순차 시도):
${failure_details}

💡 해결 안내:
1. 입력하신 Google API 키("${clean_key.slice(0, 6)}...")가 올바른지 확인해 주세요.
2. Google AI Studio (https://aistudio.google.com/app/apikey)에서 무료 API 키를 새로 생성하여 상단 [Google 키 입력] 메뉴에 등록하시면 즉시 실시간 연동됩니다.`,
        security: '외부 클라우드 전송 실패',
        cost: '비용 발생 없음',
      };
    };

    // 2. 노트북 로컬 sLLM 호출 함수 (1차: Python sLLM 서버 8000, 2차: Ollama 11434)
    const fetch_local_sllm = async () => {
      const start_t = Date.now();

      // 1순위: 파이썬 로컬 sLLM 서버 (Qwen2.5-0.5B-Instruct)
      try {
        const controller = new AbortController();
        const timeout_id = setTimeout(() => controller.abort(), 8000);

        const res = await fetch('http://127.0.0.1:8000/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: `질문: ${query}\n대상지역: ${region_name} (응급 미도달율: ${region_stats.emergency_rate}%, RI: ${region_stats.ri_rate}%)\n핵심 조항: ${rag_context.slice(0, 300)}`,
            max_new_tokens: 300,
          }),
          signal: controller.signal,
        });
        clearTimeout(timeout_id);

        if (res.ok) {
          const json = await res.json();
          return {
            model: 'Qwen/Qwen2.5-0.5B-Instruct (노트북 On-Device)',
            is_live: true,
            elapsed_ms: json.elapsed_ms || (Date.now() - start_t),
            response: json.response || '응답 없음',
            security: '원내 폐쇄망 100% 자립 (데이터 외부 유출 0%)',
            cost: '무제한 무료 (자체 로컬 하드웨어 연산)',
          };
        }
      } catch {
        // 로컬 파이썬 서버 미응답 시 Ollama 확인
      }

      // 2순위: 로컬 Ollama (11434)
      try {
        const controller = new AbortController();
        const timeout_id = setTimeout(() => controller.abort(), 3000);

        const res = await fetch('http://127.0.0.1:11434/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'qwen2.5:0.5b',
            prompt: `${query}\n지역: ${region_name}\n근거: ${rag_context.slice(0, 200)}`,
            stream: false,
          }),
          signal: controller.signal,
        });
        clearTimeout(timeout_id);

        if (res.ok) {
          const json = await res.json();
          return {
            model: 'Ollama 로컬 sLLM (On-Device)',
            is_live: true,
            elapsed_ms: Date.now() - start_t,
            response: json.response || '응답 없음',
            security: '원내 폐쇄망 100% 자립 (데이터 외부 유출 0%)',
            cost: '무제한 무료 (로컬 인프라)',
          };
        }
      } catch {
        // 로컬 서버 모두 미가동 시
      }

      // 로컬 서버 미가동 시: 온디바이스 에뮬레이션 및 구동 명령어 안내
      const elapsed_ms = 45;
      return {
        model: 'Qwen/Qwen2.5-0.5B-Instruct (로컬 대기모드)',
        is_live: false,
        elapsed_ms,
        response: `[노트북 로컬 sLLM 가동 안내]
현재 노트북의 로컬 sLLM 서버가 대기 중입니다.
터미널에서 다음 명령어를 실행하시면 실제 온디바이스 모델로 실시간 추론이 활성화됩니다:
$ python scripts/local_sllm_server.py

■ ${region_name} 온디바이스 폐쇄망 분석 요약:
1. 보안 보증: 환자 주민번호 및 비식별 진료기록이 외부 인터넷망으로 단 1바이트도 유출되지 않음.
2. 즉시 조치: 관내 RI(${region_stats.ri_rate}%) 극복을 위한 필수 진료과 거점화 필요.`,
        security: '원내 폐쇄망 100% 자립 (인터넷 차단망 사용 가능)',
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
