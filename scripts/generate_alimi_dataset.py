# -*- coding: utf-8 -*-
"""
지역거점공공병원 알리미 공시 스냅샷(data/alimi/지역거점공공병원_공시.json) → src/lib/알리미_경영공시_데이터셋.ts 생성

- 결산서(재무상태표·손익계산서), 수입·지출 현황(정부·지자체 지원, 인건비), 직원 현황(정원·현원·직종별)에서
  경영지표 산출에 필요한 항목만 연도별로 옮긴다 (금액 천원, 인원 명)
- 공시값을 그대로 옮기며 보정하지 않는다. 공시가 비어 있으면 null

사용법: python scripts/generate_alimi_dataset.py
"""
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'data', 'alimi', '지역거점공공병원_공시.json')
OUT_TS = os.path.join(ROOT, 'src', 'lib', '알리미_경영공시_데이터셋.ts')

# 출력 필드 → (페이지, 표 제목에 포함된 말, 항목 키 후보)
항목_정의 = {
    '자산총계': ('결산서', '결산서', ['재무상태표 > Ⅲ. 자산총계']),
    '부채총계': ('결산서', '결산서', ['재무상태표 > Ⅳ. 부채총계']),
    '자본총계': ('결산서', '결산서', ['재무상태표 > Ⅴ. 자본총계']),
    '의료수익': ('결산서', '결산서', ['손익계산서 > Ⅰ. 의료수익']),
    '의료비용': ('결산서', '결산서', ['손익계산서 > Ⅱ. 의료비용']),
    '의료이익': ('결산서', '결산서', ['손익계산서 > Ⅲ. 의료이익(손실)']),
    '의료외수익': ('결산서', '결산서', ['손익계산서 > Ⅳ. 의료외수익']),
    '의료외비용': ('결산서', '결산서', ['손익계산서 > Ⅴ. 의료외비용']),
    '당기순이익': ('결산서', '결산서', ['손익계산서 > XII. 당기순이익(손실)']),
    '정부지원금': ('수입지출', '수입', ['수입 > 정부지원 > 정부지원금소계']),
    '지자체지원금': ('수입지출', '수입', ['수입 > 지자체지원 > 지자체지원금소계']),
    '순수자체수입': ('수입지출', '수입', ['수입 > 자체수입 > 순수자체수입']),
    '인건비': ('수입지출', '수입', ['지출 > 인건비']),
    '지출합계': ('수입지출', '수입', ['지출 > 소계']),
    '직원_정원': ('직원현황', '임원, 직원', ['직원 > 정원']),
    '직원_현원': ('직원현황', '임원, 직원', ['직원 > 현원']),
    '비정규직_기간제': ('직원현황', '임원, 직원', ['비정규직 > 기간제']),
    '직원수_총계': ('직원현황', '직종별', ['직원수총계']),
    '의사직_현원': ('직원현황', '직종별', ['직종별현원 > 의사직 > 현원']),
    '간호직_현원': ('직원현황', '직종별', ['직종별현원 > 간호직 > 현원']),
    '약무직_현원': ('직원현황', '직종별', ['직종별현원 > 약무직 > 현원']),
    '보건직_현원': ('직원현황', '직종별', ['직종별현원 > 보건직 > 현원']),
    '행정직_현원': ('직원현황', '직종별', ['직종별현원 > 행정직 > 현원']),
}


def 유형(name):
    if '적십자' in name:
        return '적십자병원'
    if '백령' in name:
        return '분원'
    return '지방의료원'


def 표_찾기(rec, page, cap_word):
    for cap, rows in rec['표'].get(page, {}).items():
        if cap_word in cap:
            return rows
    return {}


def main():
    snap = json.load(open(SRC, encoding='utf-8'))
    years = set()
    for h in snap['기관']:
        for page in h['표'].values():
            for rows in page.values():
                for v in rows.values():
                    years.update(int(y) for y in v)
    years = sorted(years)

    items, 누락 = [], []
    for h in snap['기관']:
        연도별 = {y: {'연도': y} for y in years}
        for field, (page, cap_word, keys) in 항목_정의.items():
            rows = 표_찾기(h, page, cap_word)
            key = next((k for k in keys if k in rows), None)
            if key is None:
                누락.append(f"{h['기관명']}:{field}")
            for y in years:
                v = rows.get(key, {}).get(str(y)) if key else None
                연도별[y][field] = v
        # 결산 기준일·제출일 (첫 번째 기준일 표)
        결산_기준 = next(iter(h['기준일'].get('결산서', {}).values()), [])
        items.append({
            '기관명': h['기관명'],
            '기관번호': h['기관번호'],
            '유형': 유형(h['기관명']),
            '결산_기준일': 결산_기준[0] if len(결산_기준) > 0 else None,
            '결산_제출일': 결산_기준[1] if len(결산_기준) > 1 else None,
            '연도별': [연도별[y] for y in years],
        })

    fields = '\n'.join(f'  {k}: number | null;' for k in 항목_정의)
    ts = f"""// 자동 생성 파일: scripts/generate_alimi_dataset.py 로 생성 (직접 수정 금지)
// 출처: {snap['출처']}
// 수집일시: {snap['수집일시']} (scripts/collect_alimi_disclosure.py), 단위: {snap['단위']}
// 공시값을 그대로 옮김 (보정·추정 없음). 공시가 비어 있으면 null

export interface 알리미_연도별_공시 {{
  연도: number;
{fields}
}}

export interface 알리미_기관_공시 {{
  기관명: string; // 알리미 표기
  기관번호: string;
  유형: '지방의료원' | '적십자병원' | '분원';
  결산_기준일: string | null;
  결산_제출일: string | null;
  연도별: 알리미_연도별_공시[];
}}

export const 알리미_공시_출처 = {{
  기관: '보건복지부 (시스템관리: 국립중앙의료원)',
  자료명: '지역거점공공병원 알리미 기관별 통합공시',
  URL: 'https://rhs.mohw.go.kr',
  수집일시: '{snap['수집일시']}',
  공시연도: '{years[0]}~{years[-1]}년',
  단위: '금액 천원, 인원 명',
}} as const;

export const 알리미_기관_공시_목록: 알리미_기관_공시[] = {json.dumps(items, ensure_ascii=False, indent=2)};
"""
    with open(OUT_TS, 'w', encoding='utf-8') as f:
        f.write(ts)
    print(f'{len(items)}개 기관, {years[0]}~{years[-1]}년 → {os.path.relpath(OUT_TS, ROOT)}')
    if 누락:
        print('항목 없음:', ', '.join(누락))


if __name__ == '__main__':
    main()
