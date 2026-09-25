# -*- coding: utf-8 -*-
"""
국립중앙의료원 누리집 「달빛어린이병원」 목록(https://www.nmc.or.kr/nmc/babyList) 수집

- 시도별 탭(?region=...) 17개 페이지를 1.5초 간격으로 읽어 기관명·기관구분·대표전화·주소·좌표를 추출
- robots.txt 상 /nmc/babyList 는 수집 제한 경로가 아님 (2026-09-25 확인)
- 페이지에 기준일 표기가 없으므로 '수집일시'를 기준으로 기록

사용법: python scripts/collect_moonlight_hospitals.py
출력: data/nmc/달빛어린이병원_목록.json
"""
import datetime
import html
import json
import os
import re
import sys
import time
import urllib.parse
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'data', 'nmc', '달빛어린이병원_목록.json')
BASE = 'https://www.nmc.or.kr/nmc/babyList'
UA = 'health-map-essential-care/1.0 (+https://github.com/soohyun9953/essential-care-map)'
# 2026년 광주·전남 통합으로 해당 기관은 '전남광주통합특별시'로 조회됨
# (누리집 탭은 아직 '광주'/'전남'으로 표시되지만 두 탭은 결과 없이 응답이 끊김, 2026-09-25 확인)
시도_목록 = [
    '서울특별시', '부산광역시', '대구광역시', '인천광역시', '대전광역시', '울산광역시', '세종특별자치시',
    '경기도', '강원특별자치도', '충청북도', '충청남도', '전북특별자치도', '전남광주통합특별시', '경상북도', '경상남도', '제주특별자치도',
]

카드_패턴 = re.compile(
    r'find_card_cell_top_type02">\s*<div>(?P<name>[^<]+)</div>.*?'
    r'기관구분</div>\s*<div class="td_type02">(?P<kind>[^<]*)</div>.*?'
    r'대표전화</div>\s*<div class="td_type02">(?P<tel>[^<]*)</div>.*?'
    r'주소</div>\s*<div class="td_type02[^"]*">(?P<addr>[^<]*)</div>.*?'
    r"openMapModal\('[^']*',\s*(?P<lat>[\d.]+),\s*(?P<lon>[\d.]+)",
    re.S,
)


def 수집(시도):
    url = f'{BASE}?region={urllib.parse.quote(시도)}'
    req = urllib.request.Request(url, headers={'User-Agent': UA})
    for 시도_횟수 in range(3):  # 일시적 네트워크 오류(응답 끊김) 재시도
        try:
            body = urllib.request.urlopen(req, timeout=30).read().decode('utf-8', 'replace')
            break
        except Exception as e:
            if 시도_횟수 == 2:
                raise
            print(f'  {시도} 재시도 ({e.__class__.__name__})', flush=True)
            time.sleep(3)
    return [
        {
            '시도': 시도,
            '기관명': html.unescape(m['name']).strip(),
            '기관구분': html.unescape(m['kind']).strip(),
            '대표전화': m['tel'].strip(),
            '주소': ' '.join(html.unescape(m['addr']).split()),
            '위도': round(float(m['lat']), 6),
            '경도': round(float(m['lon']), 6),
        }
        for m in 카드_패턴.finditer(body)
    ], body.count('openMapModal(')


def main():
    기관 = []
    for 시도 in 시도_목록:
        items, 지도버튼수 = 수집(시도)
        if len(items) != 지도버튼수:
            sys.exit(f'{시도}: 카드 {지도버튼수}개 중 {len(items)}개만 해석됨 — 페이지 구조가 달라졌을 수 있어 저장하지 않음')
        기관.extend(items)
        print(f'  {시도}: {len(items)}곳', flush=True)
        time.sleep(1.5)
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    json.dump(
        {
            '수집일시': datetime.datetime.now().strftime('%Y-%m-%d %H:%M'),
            '출처': '국립중앙의료원 누리집 달빛어린이병원 목록 (https://www.nmc.or.kr/nmc/babyList)',
            '기관': 기관,
        },
        open(OUT, 'w', encoding='utf-8'),
        ensure_ascii=False,
        indent=1,
    )
    print(f'{len(기관)}곳 저장 → {os.path.relpath(OUT, ROOT)}')


if __name__ == '__main__':
    main()
