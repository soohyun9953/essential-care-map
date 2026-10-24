// 공공데이터포털(data.go.kr) OpenAPI 공통: 서비스키 정규화와 실패 사유 추출 (서비스키 값은 어디에도 남기지 않는다)

/**
 * 공공데이터포털 '인코딩' 키(%2B·%3D 등 포함)를 넣어도 이중 인코딩되지 않도록 디코딩 키로 맞춘다
 */
export function 서비스키_정규화(key: string): string {
  const k = key.trim().replace(/^["']|["']$/g, '');
  if (!/%[0-9A-Fa-f]{2}/.test(k)) return k;
  try {
    return decodeURIComponent(k);
  } catch {
    return k;
  }
}

/** 실패 응답에서 사유만 뽑는다 (HTTP 상태, 포털 오류 코드·메시지, 결과 0건) */
export function 실패_사유(status: number, body: string): string {
  const tag = (t: string) => new RegExp(`<${t}>([\\s\\S]*?)</${t}>`).exec(body)?.[1]?.trim() ?? '';
  const 인증오류 = tag('returnAuthMsg') || tag('errMsg');
  if (인증오류) return `포털 오류 ${인증오류}`;
  const code = tag('resultCode');
  if (code && code !== '00') return `포털 오류 ${code} ${tag('resultMsg')}`.trim();
  if (status !== 200) return `HTTP ${status}`;
  if (tag('totalCount') === '0') return '해당 지역 실시간 결과 없음';
  return '응답 형식 해석 불가';
}
