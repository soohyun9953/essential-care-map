# -*- coding: utf-8 -*-
"""
심평원 분만가능 의료기관 목록(data/hira/분만가능_의료기관_목록_20260430.csv)의 주소를 좌표로 변환

- 지오코더: OpenStreetMap Nominatim (https://nominatim.org) — 이용 정책에 따라 초당 1건 이하, 식별 가능한 User-Agent 사용
- 1차: 도로명 주소(건물번호까지)로 검색 → 결과의 행정구역이 CSV의 시도·시군구와 일치할 때만 채택 (정밀도 '주소')
- 2차: '시도 시군구' 행정구역으로 검색 → 시군구 대표 좌표 (정밀도 '시군구')
- 결과는 data/hira/분만가능_의료기관_좌표.json 에 캐시하며, 재실행 시 이미 변환된 기관은 건너뜀
- 좌표 데이터 출처 표기: © OpenStreetMap contributors (ODbL)

사용법: python scripts/geocode_delivery_institutions.py [--limit N]
"""
import csv
import json
import os
import re
import sys
import time
import urllib.parse
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CSV_PATH = os.path.join(ROOT, 'data', 'hira', '분만가능_의료기관_목록_20260430.csv')
CACHE_PATH = os.path.join(ROOT, 'data', 'hira', '분만가능_의료기관_좌표.json')
UA = 'health-map-essential-care/1.0 (+https://github.com/soohyun9953/essential-care-map)'

# CSV 시도 약칭 → Nominatim 결과(display_name)에 나타나는 명칭 후보
시도_명칭 = {
    '서울': ['서울'], '부산': ['부산'], '대구': ['대구'], '인천': ['인천'], '광주': ['광주광역시'],
    '대전': ['대전'], '울산': ['울산'], '세종': ['세종'], '경기': ['경기'], '강원': ['강원'],
    '충북': ['충청북도'], '충남': ['충청남도'], '전북': ['전북', '전라북도'], '전남': ['전라남도'],
    '경북': ['경상북도'], '경남': ['경상남도'], '제주': ['제주'],
    '광주전남': ['전남광주통합특별시', '광주광역시', '전라남도'],  # 2026년 광주·전남 통합 (CSV도 '광주전남'으로 표기)
}

# 2026년 행정구역 개편으로 OSM에서 새 이름을 쓰는 구 (CSV는 개편 전 명칭)
구_별칭 = {
    '인천서구': ['서구', '서해구', '검단구'],
    '인천중구': ['중구', '영종구', '제물포구'],
    '인천동구': ['동구', '제물포구'],
}

# CSV 시군구에 붙은 도시 접두어 ('인천서구' → '서구', '성남분당구' → '분당구')
도시_접두어 = sorted(
    ['부산', '대구', '인천', '광주', '대전', '울산', '고양', '부천', '성남', '수원', '안산', '안양',
     '용인', '전주', '창원', '천안', '청주', '포항', '화성'],
    key=len, reverse=True,
)


def 구_이름(sgg):
    if sgg == '부산진구':  # 실제 구 이름이 도시명으로 시작하는 예외
        return sgg
    for pre in 도시_접두어:
        if sgg.startswith(pre) and len(sgg) > len(pre) + 1:
            return sgg[len(pre):]
    return sgg


def 시도_표기(r):
    return 시도_명칭.get(r['시도'], [r['시도']])[0]


def 기관_키(r):
    return f"{r['시도']}|{r['시군구']}|{r['기관명']}"


def 도로명_주소(addr):
    """'서울특별시 강남구 언주로 211 강남세브란스병원 (도곡동)' → '서울특별시 강남구 언주로 211'"""
    addr = re.sub(r'\(.*?\)', ' ', addr)
    m = re.match(r'^(.*?(?:로|길)\s*\d+(?:-\d+)?)', addr.strip())
    return (m.group(1) if m else addr).strip()


def 시군구_토큰(sgg):
    """CSV 시군구('성남분당구', '대구중구', '부산서구', '세종시') → 결과 검증용 토큰"""
    if sgg == '세종시':
        return ['세종']
    if sgg in 구_별칭:
        return 구_별칭[sgg]
    return [구_이름(sgg)]


def 검색(q):
    url = 'https://nominatim.openstreetmap.org/search?' + urllib.parse.urlencode(
        {'q': q, 'format': 'jsonv2', 'countrycodes': 'kr', 'limit': 3, 'accept-language': 'ko'}
    )
    req = urllib.request.Request(url, headers={'User-Agent': UA})
    with urllib.request.urlopen(req, timeout=30) as res:
        data = json.loads(res.read().decode('utf-8'))
    time.sleep(1.1)  # 이용 정책: 초당 1건 이하
    return data


def 행정구역_일치(result, r):
    name = result.get('display_name', '')
    시도_ok = any(k in name for k in 시도_명칭.get(r['시도'], [r['시도']]))
    시군구_ok = any(t in name for t in 시군구_토큰(r['시군구']))
    return 시도_ok and 시군구_ok


def 변환(r):
    for q in (도로명_주소(r['주소']),):
        for res in 검색(q):
            if 행정구역_일치(res, r):
                return {'위도': round(float(res['lat']), 6), '경도': round(float(res['lon']), 6), '정밀도': '주소'}
    # 2차: 시군구 행정구역 대표 좌표
    sgg = r['시군구']
    q = f"{시도_표기(r)} {시군구_토큰(sgg)[0]}"
    for res in 검색(q):
        if 행정구역_일치(res, r):
            return {'위도': round(float(res['lat']), 6), '경도': round(float(res['lon']), 6), '정밀도': '시군구'}
    return None


def main():
    limit = int(sys.argv[sys.argv.index('--limit') + 1]) if '--limit' in sys.argv else None
    rows = list(csv.DictReader(open(CSV_PATH, encoding='utf-8')))
    cache = json.load(open(CACHE_PATH, encoding='utf-8')) if os.path.exists(CACHE_PATH) else {}
    # 미변환 기관과 이전 실행에서 실패(None)한 기관을 다시 시도
    todo = [r for r in rows if not cache.get(기관_키(r))]
    if limit:
        todo = todo[:limit]
    print(f'전체 {len(rows)} / 캐시 {len(cache)} / 이번 변환 {len(todo)}', flush=True)
    for i, r in enumerate(todo, 1):
        try:
            cache[기관_키(r)] = 변환(r)
        except Exception as e:  # 네트워크 오류는 다음 실행에서 재시도
            print(f'  오류 {r["기관명"]}: {e}', flush=True)
            continue
        c = cache[기관_키(r)]
        print(f'  [{i}/{len(todo)}] {r["기관명"]} → {c["정밀도"] if c else "실패"}', flush=True)
        if i % 20 == 0:
            json.dump(cache, open(CACHE_PATH, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    json.dump(cache, open(CACHE_PATH, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    결과 = [v for v in cache.values()]
    print('정밀도 집계:', {k: sum(1 for v in 결과 if (v and v['정밀도']) == k) for k in ('주소', '시군구')},
          '실패:', sum(1 for v in 결과 if not v))


if __name__ == '__main__':
    main()
