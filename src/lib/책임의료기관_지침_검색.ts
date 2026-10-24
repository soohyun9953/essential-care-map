// 「2026년 책임의료기관 통합 사업 안내」 원문 쪽 검색 (② 2-5 질의응답의 근거)
// - 원문: data/책임의료기관/사업안내_2026_쪽별.json (scripts/generate_rmi_guide_corpus.py로 PDF에서 생성, 331쪽)
// - 서버(API)에서만 쓴다. 화면 번들에는 원문을 싣지 않는다
// - 검색: 질문 낱말(조사·의문 표현 제거)의 쪽별 출현을 IDF로 가중합. 2글자 조각 일치를 보조 점수로 더한다
// - 관련 낱말이 하나도 없거나 점수가 기준보다 낮으면 근거 없음 (날씨·맛집 같은 질문 거르기)

import 원문 from '../../data/책임의료기관/사업안내_2026_쪽별.json';

export interface 지침_쪽 {
  pdf_쪽: number;
  본문_쪽: number | null;
  구분: string;
  본문: string;
}

export interface 지침_근거 {
  번호: number;
  쪽_표시: string; // 예: '본문 16쪽' / '2026년 주요 변경사항 (PDF 3쪽)'
  구분: string;
  발췌: string; // 화면 표시용 (약 320자)
  본문: string; // Gemini 근거용 (약 1,600자)
  점수: number;
}

export const 지침_문서명 = 원문.문서명;
const 쪽들: 지침_쪽[] = 원문.쪽 as 지침_쪽[];

export const 최소_점수 = 2.5;

// 질문에서 빼는 표현 (의문·요청·조사)
const 불용어 = new Set([
  '알려줘', '알려주세요', '설명해줘', '설명해', '설명', '뭐야', '뭐예요', '무엇', '무엇인가요', '무엇이야', '어떻게', '어떤', '어디', '언제',
  '해야', '해야해', '하나요', '하는', '해줘', '있어', '있나요', '있는', '되나요', '돼', '대해', '대한', '관련', '관해', '내용', '정리',
  '책임의료기관', '사업', '통합', '2026년', '안내', '지침', '점은', '바뀐', '변경', '변경된', '달라진', '개정',
]);
const 조사 = /(으로서|으로|에서|에게|까지|부터|이란|란|이나|나|은|는|이|가|을|를|에|의|로|와|과|도|만|요)$/;

export function 질문_낱말(질문: string): string[] {
  return Array.from(
    new Set(
      질문
        .toLowerCase()
        .replace(/[?!.,·()「」『』"'~]/g, ' ')
        .split(/\s+/)
        .map((w) => (w.length > 2 ? w.replace(조사, '') : w))
        .filter((w) => w.length >= 2 && !불용어.has(w))
    )
  );
}

const 문서_수 = 쪽들.length;
const 출현_쪽_수 = (낱말: string) => 쪽들.reduce((n, p) => n + (p.본문.includes(낱말) ? 1 : 0), 0);
const idf_캐시 = new Map<string, number>();
const idf = (낱말: string) => {
  if (!idf_캐시.has(낱말)) idf_캐시.set(낱말, Math.log(1 + 문서_수 / (1 + 출현_쪽_수(낱말))));
  return idf_캐시.get(낱말)!;
};

const 바이그램 = (s: string) => {
  const out: string[] = [];
  for (let i = 0; i < s.length - 1; i++) out.push(s.slice(i, i + 2));
  return out;
};

function 쪽_점수(p: 지침_쪽, 낱말들: string[], 변경_질문: boolean): number {
  let 점수 = 0;
  for (const w of 낱말들) {
    const 횟수 = p.본문.split(w).length - 1;
    if (횟수 > 0) {
      점수 += idf(w) * (1 + Math.log(횟수));
    } else if (w.length >= 3) {
      // 낱말 전체가 없으면 2글자 조각 일치율로 보조 점수 (활용형·띄어쓰기 차이 대응)
      const 조각 = 바이그램(w);
      const 일치 = 조각.filter((g) => p.본문.includes(g)).length / 조각.length;
      if (일치 >= 0.67) 점수 += idf(w) * 0.4 * 일치;
    }
  }
  // 지침 설명(PART Ⅰ~Ⅳ)을 서식·부록보다 앞에. 목차·서식 목차(점선 뒤 쪽수 0)는 낮춘다
  if (p.구분 === '목차' || (p.본문.match(/…\s*0/g)?.length ?? 0) >= 3) 점수 *= 0.3;
  else if (/^PART Ⅴ/.test(p.구분)) 점수 *= 0.7;
  else if (/^PART Ⅵ/.test(p.구분)) 점수 *= 0.85;
  else if (/^PART [ⅠⅡⅢⅣ]/.test(p.구분)) 점수 *= 1.25;
  if (p.구분 === '2026년 주요 변경사항') 점수 = 변경_질문 ? 점수 * 2 + 최소_점수 : 점수 * 0.7;
  return 점수;
}

/** 질문에 가장 가까운 원문 위치를 보여줄 발췌 (첫 일치 낱말 주변) */
function 발췌(본문: string, 낱말들: string[], 길이: number): string {
  const 위치 = 낱말들.map((w) => 본문.indexOf(w)).filter((i) => i >= 0).sort((a, b) => a - b)[0] ?? 0;
  const 시작 = Math.max(0, 위치 - Math.floor(길이 / 4));
  return `${시작 > 0 ? '…' : ''}${본문.slice(시작, 시작 + 길이)}${시작 + 길이 < 본문.length ? '…' : ''}`;
}


/** 질문 → 근거 쪽 (최대 n쪽). 관련 낱말이 없거나 점수가 낮으면 빈 배열 */
export function 지침_검색(질문: string, n = 4): 지침_근거[] {
  const 낱말들 = 질문_낱말(질문);
  const 변경_질문 = /변경|바뀐|바뀌|달라|개정|신설|추가된/.test(질문);
  if (낱말들.length === 0 && !변경_질문) return [];
  const 순위 = 쪽들
    .map((p) => ({ p, 점수: 쪽_점수(p, 낱말들, 변경_질문) }))
    .filter((x) => x.점수 > 0)
    .sort((a, b) => b.점수 - a.점수);
  if (!순위.length || 순위[0].점수 < 최소_점수) return [];
  return 순위
    .filter((x) => x.점수 >= 순위[0].점수 * 0.45)
    .slice(0, n)
    .map((x, i) => ({
      번호: i + 1,
      쪽_표시: x.p.본문_쪽 ? `본문 ${x.p.본문_쪽}쪽` : `${x.p.구분} (PDF ${x.p.pdf_쪽}쪽)`,
      구분: x.p.구분,
      발췌: 발췌(x.p.본문, 낱말들, 320),
      본문: 발췌(x.p.본문, 낱말들, 1600),
      점수: Math.round(x.점수 * 100) / 100,
    }));
}

/** Gemini 프롬프트: 찾은 원문 쪽만 근거, [번호] = 화면의 근거 번호 */
export function 지침_요약_프롬프트(질문: string, 근거: 지침_근거[]): string {
  return [
    `당신은 「${지침_문서명}」 지침을 설명하는 도우미입니다. 아래 [원문 발췌]에 있는 내용만 사용해 [질문]에 답하세요.`,
    '',
    '규칙:',
    '1. 원문 발췌에 없는 기준·숫자·금액·기한·서식을 만들지 마세요. 발췌로 답할 수 없는 부분은 "지침 발췌에서 확인되지 않습니다"라고 쓰세요.',
    '2. 원문에서 가져온 문장 끝에 그 내용이 나온 발췌 번호를 [1]처럼 붙이세요.',
    '3. 의무·권고·선택을 원문 표현대로 구분해 쓰세요 (예: "의무", "권고", "선택").',
    '4. 쉬운 말로 6문장 이내, 필요하면 최대 6개 항목 목록으로 답하세요. 마크다운 표·제목(#)은 쓰지 마세요.',
    '5. 세부 서식·제출 기한 등은 해당 쪽 원문을 확인하라고 안내하세요.',
    '',
    `[질문] ${질문}`,
    '',
    '[원문 발췌]',
    ...근거.map((g) => `[${g.번호}] ${g.쪽_표시} · ${g.구분}\n${g.본문}`),
  ].join('\n');
}
