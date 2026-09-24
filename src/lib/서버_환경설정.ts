// 서버 전용 환경설정 (API 라우트에서만 import)

// 로컬 sLLM(Python 8000 / Ollama 11434) 호출 및 프로세스 실행 허용 여부
// - LOCAL_LLM_ENABLED=true/false 로 명시 제어
// - 미지정 시 개발 환경(next dev)에서만 허용, 배포(production)에서는 차단
export function 로컬_LLM_허용(): boolean {
  const flag = process.env.LOCAL_LLM_ENABLED;
  if (flag !== undefined) return flag === 'true';
  return process.env.NODE_ENV !== 'production';
}

// 사용자가 키를 입력하지 않았을 때 서버 환경변수의 Gemini 키 사용 허용 여부
// - 인증 없는 공개 API이므로 기본 차단 (ALLOW_SERVER_GEMINI_KEY=true 일 때만 허용)
export function 서버_Gemini_키_허용(): boolean {
  return process.env.ALLOW_SERVER_GEMINI_KEY === 'true';
}
