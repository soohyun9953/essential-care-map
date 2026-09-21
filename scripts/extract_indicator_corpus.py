# -*- coding: utf-8 -*-
"""
헬스맵 345쪽 지표정의서 PDF에서 331개 지표 전수 파싱 및 TypeScript 코퍼스 생성기
참고자료: 헬스맵+주제도+분석+지표정의서_260527.pdf
"""
import pypdf
import json
import re
import os
import sys
import time

pdf_path = r"C:\Users\KITC\Desktop\프로토타입\참고자료\헬스맵+주제도+분석+지표정의서_260527.pdf"
output_ts_path = r"c:\Users\KITC\Desktop\헬스맵2\src\lib\헬스맵_지표정의_코퍼스.ts"

print("PDF 파일 로딩 중:", pdf_path)
start_time = time.time()
reader = pypdf.PdfReader(pdf_path)
print(f"전체 페이지 수: {len(reader.pages)}")

indicators = []

for idx in range(12, len(reader.pages)):
    text = reader.pages[idx].extract_text()
    if not text:
        continue

    # 지표코드 검색
    m_code = re.search(r'지표코드\s*([A-Z0-9]+)', text)
    if not m_code:
        continue
    code = m_code.group(1).strip()

    # 지표명
    m_name = re.search(r'지표명\s*(.*?)\s*지표코드', text, re.DOTALL)
    name = m_name.group(1).strip().replace('\n', ' ') if m_name else ''

    # 영역 (의료수요, 의료자원, 의료이용, 건강수준)
    m_area = re.search(r'분류\s*영역\s*(.*?)\s*구분1', text, re.DOTALL)
    area = m_area.group(1).strip().replace('\n', ' ') if m_area else ''

    # 구분1
    m_cat1 = re.search(r'구분1\s*(.*?)\s*구분2', text, re.DOTALL)
    cat1 = m_cat1.group(1).strip().replace('\n', ' ') if m_cat1 else ''

    # 구분2
    m_cat2 = re.search(r'구분2\s*(.*?)\s*지표정의', text, re.DOTALL)
    cat2 = m_cat2.group(1).strip().replace('\n', ' ') if m_cat2 else ''

    # 지표정의
    m_def = re.search(r'지표정의\s*(.*?)\s*단위', text, re.DOTALL)
    definition = m_def.group(1).strip().replace('\n', ' ') if m_def else ''

    # 단위
    m_unit = re.search(r'단위\s*(.*?)\s*산출지역', text, re.DOTALL)
    unit = m_unit.group(1).strip().replace('\n', ' ') if m_unit else ''

    # 산출식 분자
    m_num = re.search(r'산\s*출\s*식\s*분자\s*(.*?)\s*분모', text, re.DOTALL)
    if not m_num:
        m_num = re.search(r'산출식\s*분자\s*(.*?)\s*분모', text, re.DOTALL)
    num = m_num.group(1).strip().replace('\n', ' ') if m_num else ''

    # 산출식 분모
    m_den = re.search(r'분모\s*(.*?)\s*출처', text, re.DOTALL)
    den = m_den.group(1).strip().replace('\n', ' ') if m_den else ''

    # 출처
    m_src = re.search(r'출처\s*(.*?)\s*(?:산출방법|세부분석|산출기준|비고)', text, re.DOTALL)
    source = m_src.group(1).strip().replace('\n', ' ') if m_src else ''

    # 수가코드 (EDI)
    m_edi = re.search(r'수가(?:코드)?\s*\(MCARE_DIV_CD\)\s*:(.*?)(?:\[|※|비고|상병|$)', text, re.DOTALL)
    procedure_codes = m_edi.group(1).strip().replace('\n', ' ')[:300] if m_edi else ''

    # 상병코드 (ICD-10)
    m_sick = re.search(r'상병(?:코드)?\s*\(SICK_SYM\)\s*:(.*?)(?:\[|※|비고|수가|$)', text, re.DOTALL)
    disease_codes = m_sick.group(1).strip().replace('\n', ' ')[:300] if m_sick else ''

    indicators.append({
        'code': code,
        'name': name,
        'area': area,
        'category1': cat1,
        'category2': cat2,
        'definition': definition,
        'unit': unit,
        'formula_numerator': num,
        'formula_denominator': den,
        'source': source,
        'procedure_codes': procedure_codes,
        'disease_codes': disease_codes,
        'page': idx + 1
    })

print(f"파싱 완료: 총 {len(indicators)}개 지표 추출 성공 ({time.time() - start_time:.2f}초)")

ts_content = f"""/**
 * 국립중앙의료원 / 보건복지부 「헬스맵 주제도 분석」 공식 지표정의서 데이터베이스
 * 데이터 출처: 헬스맵+주제도+분석+지표정의서_260527.pdf (345쪽)
 * 총 {len(indicators)}개 지표 전수 수록 (산출식 분자/분모, 출처, 수가코드, 상병코드)
 */

import {{ 지침_문서_청크 }} from './공공의료_지침_코퍼스';

export interface 헬스맵_지표_정의 {{
  code: string;
  name: string;
  area: string; // 의료수요, 의료자원, 의료이용, 건강수준
  category1: string;
  category2: string;
  definition: string;
  unit: string;
  formula_numerator: string;
  formula_denominator: string;
  source: string;
  procedure_codes?: string;
  disease_codes?: string;
  page: number;
}}

export const 헬스맵_지표정의_목록: 헬스맵_지표_정의[] = {json.dumps(indicators, ensure_ascii=False, indent=2)};

/**
 * 지표 코드로 검색
 */
export function get_indicator_by_code(code: string): 헬스맵_지표_정의 | undefined {{
  return 헬스맵_지표정의_목록.find(
    (item) => item.code.toUpperCase() === code.toUpperCase()
  );
}}

/**
 * 키워드로 지표 정의 검색 (지표명, 정의, 분류 등)
 */
export function search_indicators(keyword: string): 헬스맵_지표_정의[] {{
  if (!keyword.trim()) return 헬스맵_지표정의_목록.slice(0, 30);
  const q = keyword.toLowerCase();
  return 헬스맵_지표정의_목록.filter(
    (item) =>
      item.name.toLowerCase().includes(q) ||
      item.code.toLowerCase().includes(q) ||
      item.definition.toLowerCase().includes(q) ||
      item.category1.toLowerCase().includes(q) ||
      item.category2.toLowerCase().includes(q) ||
      (item.procedure_codes && item.procedure_codes.toLowerCase().includes(q))
  );
}}

/**
 * 지표정의서를 RAG 청크 형식으로 변환하여 지침 코퍼스에 통합
 */
export function get_indicator_rag_chunks(): 지침_문서_청크[] {{
  return 헬스맵_지표정의_목록.map((ind) => ({{
    id: `CHUNK-IND-${{ind.code}}`,
    문서명: `보건복지부·국립중앙의료원 헬스맵 지표정의서 (코드: ${{ind.code}})`,
    조항_페이지: `p.${{ind.page}} [${{ind.area}} > ${{ind.category1}} > ${{ind.category2}}]`,
    분류: ind.area || '지표정의',
    본문: `[지표명: ${{ind.name}} (${{ind.code}})]\\n- 지표정의: ${{ind.definition}}\\n- 산출단위: ${{ind.unit}}\\n- 산출식 분자: ${{ind.formula_numerator}}\\n- 산출식 분모: ${{ind.formula_denominator || '-'}}\\n- 데이터 출처: ${{ind.source}}${{ind.procedure_codes ? '\\n- 관련 수가코드: ' + ind.procedure_codes : ''}}${{ind.disease_codes ? '\\n- 관련 상병코드: ' + ind.disease_codes : ''}}`,
    핵심키워드: [
      ind.name,
      ind.code,
      ind.area,
      ind.category1,
      ind.category2,
      ind.unit,
      '산출식',
      '지표정의'
    ].filter(Boolean),
    기준수치: `산출식: ${{ind.formula_numerator}} / ${{ind.formula_denominator || '전체'}} (${{ind.unit}})`,
    사용자추가여부: false
  }}));
}}
"""

with open(output_ts_path, 'w', encoding='utf-8') as f:
    f.write(ts_content)

print(f"생성 완료: {output_ts_path} ({os.path.getsize(output_ts_path)/1024:.1f} KB)")
