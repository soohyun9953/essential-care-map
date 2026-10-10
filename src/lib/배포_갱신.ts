// 새 버전 배포 후 이전 화면이 열려 있을 때의 처리
// - 이전 빌드의 JS/CSS 조각(chunk)을 불러오지 못하는 오류를 알아보고 한 번만 자동 새로고침
// - 같은 오류가 반복되면 무한 새로고침을 막기 위해 일정 시간 안에는 다시 새로고침하지 않음

const 새로고침_기록_키 = 'deploy_reload_at';
const 재시도_간격_ms = 30_000;

/** 배포 교체로 이전 조각 파일을 못 불러온 오류인지 */
export function 조각_로드_오류인가(err: unknown): boolean {
  const e = err as { name?: string; message?: string } | null | undefined;
  const text = `${e?.name ?? ''} ${e?.message ?? (typeof err === 'string' ? err : '')}`;
  return /ChunkLoadError|Loading chunk [\w-]+ failed|Loading CSS chunk|Failed to fetch dynamically imported module|Importing a module script failed/i.test(
    text
  );
}

/** 최근 재시도 간격 안에 새로고침한 적이 없으면 새로고침하고 true, 아니면 false */
export function 한번만_새로고침(now: number = Date.now()): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const 이전 = Number(window.sessionStorage.getItem(새로고침_기록_키) || 0);
    if (now - 이전 < 재시도_간격_ms) return false;
    window.sessionStorage.setItem(새로고침_기록_키, String(now));
  } catch {
    // 저장소를 쓸 수 없으면 반복 새로고침 위험이 있어 자동 새로고침하지 않음
    return false;
  }
  window.location.reload();
  return true;
}
