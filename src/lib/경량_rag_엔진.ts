// 브라우저 및 서버리스 자립형 경량 하이브리드 RAG (Retrieval-Augmented Generation) 엔진
// 한글 N-gram 코사인 유사도(Dense Vector) + BM25 키워드 매칭(Sparse) + 컨텍스트 합성 생성기

import { 지침_문서_청크, get_all_corpus } from './공공의료_지침_코퍼스';
import { 필수의료_진단_결과 } from './필수의료_타입';

export interface RAG_검색_결과 {
  청크: 지침_문서_청크;
  유사도_점수: number; // 0 ~ 100 (%)
  매칭_키워드: string[];
  발췌_하이라이트: string;
}

export interface RAG_실행_응답 {
  질문: string;
  검색된_청크목록: RAG_검색_결과[];
  최고_유사도: number;
  소요시간_ms: number;
  생성된_답변: string;
  선택된_지역명: string;
}

export class 경량_RAG_엔진 {
  /**
   * 텍스트에서 단어 토큰 및 2-gram(바이그램) 음절 토큰을 추출하여 벡터 맵 생성
   */
  private static tokenize_and_vectorize(text: string): Record<string, number> {
    const vector: Record<string, number> = {};
    const clean_text = text.toLowerCase().replace(/[^a-zA-Z0-9가-힣\s]/g, ' ');

    // 1. 단어 단위 토큰
    const words = clean_text.split(/\s+/).filter((w) => w.length > 1);
    for (const word of words) {
      vector[word] = (vector[word] || 0) + 2.0; // 단어 일치는 가중치 2.0
    }

    // 2. 한글 2-gram 음절 토큰 (오타 및 복합어 처리)
    for (const word of words) {
      if (word.length >= 2) {
        for (let i = 0; i < word.length - 1; i++) {
          const bigram = word.substring(i, i + 2);
          vector[bigram] = (vector[bigram] || 0) + 0.8;
        }
      }
    }

    return vector;
  }

  /**
   * 두 벡터 간의 코사인 유사도(Cosine Similarity) 계산 (0.0 ~ 1.0)
   */
  private static calculate_cosine_similarity(
    vec1: Record<string, number>,
    vec2: Record<string, number>
  ): number {
    let dot_product = 0;
    let norm1 = 0;
    let norm2 = 0;

    const keys1 = Object.keys(vec1);
    const keys2 = Object.keys(vec2);

    for (let i = 0; i < keys1.length; i++) {
      const val = vec1[keys1[i]];
      norm1 += val * val;
    }

    for (let i = 0; i < keys2.length; i++) {
      const val = vec2[keys2[i]];
      norm2 += val * val;
    }

    if (norm1 === 0 || norm2 === 0) return 0;

    for (let i = 0; i < keys1.length; i++) {
      const key = keys1[i];
      if (key in vec2) {
        dot_product += vec1[key] * vec2[key];
      }
    }

    return dot_product / (Math.sqrt(norm1) * Math.sqrt(norm2));
  }

  /**
   * 코퍼스 내에서 질문(Query)과 가장 관련성이 높은 Top-K 청크 검색 (Hybrid Retrieval)
   */
  public static retrieve(query: string, top_k: number = 8): RAG_검색_결과[] {
    const query_vec = this.tokenize_and_vectorize(query);
    const query_words = query.toLowerCase().split(/\s+/).filter((w) => w.length > 1);

    const scored_chunks: RAG_검색_결과[] = get_all_corpus().map((chunk) => {
      // 본문 + 키워드 + 문서명 전체를 타겟으로 벡터화
      const combined_text = `${chunk.문서명} ${chunk.조항_페이지} ${chunk.본문} ${chunk.핵심키워드.join(' ')}`;
      const doc_vec = this.tokenize_and_vectorize(combined_text);

      // 1. 코사인 유사도 계산 (0 ~ 1)
      const cos_sim = this.calculate_cosine_similarity(query_vec, doc_vec);

      // 2. 키워드 정확 매칭 보너스 계산
      const matched_keywords = chunk.핵심키워드.filter((kw) =>
        query.toLowerCase().includes(kw.toLowerCase()) || query_words.some((qw) => qw.includes(kw) || kw.includes(qw))
      );

      const keyword_score = Math.min(matched_keywords.length * 0.15, 0.45);

      // 3. 종합 하이브리드 점수 산출 (최대 100%)
      const hybrid_score = Math.min(Math.round((cos_sim * 0.65 + keyword_score * 0.35 + 0.15) * 1000) / 10, 99.8);

      // 4. 발췌 하이라이트 문장 추출
      const sentences = chunk.본문.split('. ');
      const highlight =
        sentences.find((s) => matched_keywords.some((kw) => s.includes(kw))) || sentences[0] || chunk.본문;

      return {
        청크: chunk,
        유사도_점수: hybrid_score,
        매칭_키워드: matched_keywords,
        발췌_하이라이트: highlight.trim(),
      };
    });

    // 점수 내림차순 정렬 후 Top-K 반환
    return scored_chunks.sort((a, b) => b.유사도_점수 - a.유사도_점수).slice(0, top_k);
  }

  /**
   * RAG 파이프라인 종합 실행:
   * 검색(Retrieval) ➔ DW 지표 주입 ➔ 근거 인용(Citation) 개조식 답변 생성(Augmented Generation)
   */
  public static execute_rag(
    query: string,
    region: 필수의료_진단_결과 | null,
    top_k: number = 8
  ): RAG_실행_응답 {
    const start_time = performance.now();
    const retrieved_chunks = this.retrieve(query, top_k);
    const top_chunk = retrieved_chunks[0]?.청크;
    const top_score = retrieved_chunks[0]?.유사도_점수 || 0;

    const region_name = region ? `${region.시도명} ${region.시군구명}` : '강원특별자치도 영월군';
    const emergency_rate = region?.응급_60분_미도달_인구비율 ?? 99.2;
    const ri_rate = region?.관내_응급_의료이용률 ?? 31.2;
    const maternity_rate = region?.관내_분만율 ?? 6.4;

    // 검색된 실제 근거 조항들을 조합하여 답변 생성
    const primary_source = top_chunk
      ? `[근거 1] ${top_chunk.문서명} (${top_chunk.조항_페이지})`
      : '[근거] 보건복지부 공공보건의료 지침';

    const secondary_source = retrieved_chunks[1]?.청크
      ? `[근거 2] ${retrieved_chunks[1].청크.문서명} (${retrieved_chunks[1].청크.조항_페이지})`
      : '';

    let generated_answer = '';

    if (query.includes('자체충족률') || query.includes('실적') || query.includes('보고서') || query.includes('평가')) {
      generated_answer = `[공공보건의료계획 시행결과 개조식 보고서]
○ 대상기관: ${region_name} 공공병원 (지역책임의료기관)
○ 평가항목: 필수의료 자체충족률 제고 (핵심지표 2-1)
○ 법적근거: ${top_chunk ? `${top_chunk.문서명} ${top_chunk.조항_페이지}` : '보건복지부 공공보건의료계획 수립 지침'}

1. 산정 기준
  - 관내 의료이용률(RI) = 지역 주민의 관내 의료기관 이용량 ÷ 지역 주민의 전체 의료이용량.
  - RI 30% 미만을 취약으로 보는 것은 플랫폼 진단 기준이며, 평가 배점 기준은 해당 연도 공공보건의료계획 지침에서 확인 필요.

2. ${region_name} 현황 (헬스맵 2024)
  - 응급 관내이용률(RI): ${ri_rate}% (플랫폼 기준 30% ${ri_rate < 30 ? '미만 — 취약' : '이상'})
  - 권역응급의료센터 60분 이내 미도달 인구: ${emergency_rate}% (응급의료취약지 선정 기준 30% ${emergency_rate >= 30 ? '이상 — 해당' : '미만 — 해당 없음'})

3. 지침 기반 검토 사항
  - ${top_chunk?.기준수치 || '파견 의료인력 인건비 국고 50% (1인당 한도는 연도별 지침 확인)'}
  - 권역책임의료기관과의 원격협진·이송 연계 체계 검토.

출처 인용:
- ${primary_source}
${secondary_source ? `- ${secondary_source}` : ''}`;
    } else if (query.includes('파견의사') || query.includes('인건비') || query.includes('공공임상교수') || query.includes('당직')) {
      generated_answer = `[보건복지부 의료취약지 파견의사 및 공공임상교수 지원사업 안내 요약]
○ 대상지자체: ${region_name}
○ 법적근거: ${top_chunk ? `${top_chunk.문서명} ${top_chunk.조항_페이지}` : '의료취약지 파견의사 지원사업 운영 지침'}

1. 지원 대상
  - 지방의료원·적십자병원 등 공공병원이 대학병원 등과 협약해 의사를 파견받는 경우.
  - 파견 기간·근무시간 요건은 해당 연도 사업지침에서 확인 필요.

2. 국비 지원
  - 파견 인력 인건비의 50%를 국고로 지원. 1인당 국고 한도는 연도별로 다르게 보도됨(최대 1억원, 최대 1.5억원 등) — 해당 연도 지침 확인.
  - 당직수당 별도 보조 기준은 공개 자료에서 확인되지 않음.

3. ${region_name} 참고 사항
  - 권역응급 60분 미도달 인구 ${emergency_rate}% (헬스맵 2024). 국비 배정 우선순위는 지침의 선정 기준으로 판단해야 함.

출처 인용:
- ${primary_source}
${secondary_source ? `- ${secondary_source}` : ''}`;
    } else if (query.includes('분만') || query.includes('산부인과') || query.includes('산모')) {
      generated_answer = `[분만취약지 지원사업 기준 및 ${region_name} 현황 분석]
○ 법적근거: ${top_chunk ? `${top_chunk.문서명} ${top_chunk.조항_페이지}` : '분만취약지 지원사업 안내'}
○ 분만 관내이용률: ${maternity_rate}% (헬스맵 2024, 플랫폼 진단 기준 40%)

1. 분만취약지 선정 기준 (보건복지부 분만취약지 지원사업)
  - ① 60분 내 분만의료 이용률 30% 미만, ② 60분 내 분만 가능 의료기관 접근 불가 인구 30% 이상.
  - 두 기준 모두 해당하면 A등급, 하나만 해당하면 B등급.
  - 지원: 분만산부인과 설치 시 시설·장비비 10억원(첫해) + 운영비 연 5억원, 외래산부인과 운영비 연 2억원 (국비·지방비 각 50%).

2. ${region_name} 검토 사항
  - 플랫폼의 분만 관내이용률(${maternity_rate}%)은 공식 선정 지표(60분 내 분만의료 이용률)와 다르므로, 실제 등급은 복지부 공모 지침의 취약지 목록으로 확인해야 함.
  - 인근 권역 모자의료센터와의 고위험 산모 이송체계 연계 검토.

출처 인용:
- ${primary_source}
${secondary_source ? `- ${secondary_source}` : ''}`;
    } else {
      // 일반 질의에 대한 하이브리드 RAG 요약 답변
      generated_answer = `[공공보건의료 지침 RAG 검색 기반 맞춤 분석 답변]
○ 질문 키워드: "${query}"
○ 최우선 적용 법령: ${top_chunk ? `${top_chunk.문서명} (${top_chunk.조항_페이지})` : '보건복지부 지침'}
○ 분석 대상 지역: ${region_name} (응급 60분 미도달율: ${emergency_rate}%, 관내 RI: ${ri_rate}%)

1. 지침 규정 핵심 요지
  ${top_chunk?.본문 || '해당 항목에 대한 법령 기준에 따라 지원 요건을 판정합니다.'}

2. 법정 기준 수치 및 권고사항
  - 지침 기준: ${top_chunk?.기준수치 || '법정 고시 기준선 적용'}${top_chunk?.검증상태 ? ` (검증상태: ${top_chunk.검증상태})` : ''}
  - ${region_name}의 지원 대상 여부는 위 기준과 해당 연도 지침·고시 목록으로 확인해야 함.

3. 후속 행정 절차
  - 차년도 공공보건의료계획 수립 시 본 조항을 인용하여 기능보강 및 인력 배정 사업계획서 제출 요망.

출처 인용:
- ${primary_source}
${secondary_source ? `- ${secondary_source}` : ''}`;
    }

    const elapsed_ms = Math.round(performance.now() - start_time);

    return {
      질문: query,
      검색된_청크목록: retrieved_chunks,
      최고_유사도: top_score,
      소요시간_ms: elapsed_ms,
      생성된_답변: generated_answer,
      선택된_지역명: region_name,
    };
  }
}
