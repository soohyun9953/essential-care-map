# -*- coding: utf-8 -*-
"""
보건복지부 「지역거점공공병원 알리미」(https://rhs.mohw.go.kr) 기관별 통합공시 수집

- 공시기관 42곳(지방의료원 35·분원 1·적십자병원 6)의 기관별 공시 중 수치 표 3종을 읽는다
  · 세입·세출 결산서 > 결산서 (재무상태표·손익계산서·기본금변동계산서·현금흐름표, 최근 5개년)
  · 세입·세출 결산서 > 수입·지출 현황 (정부·지자체 지원, 자체수입, 인건비 등 지출)
  · 임원 및 운영인력 현황 > 직원 현황 (정원·현원·비정규직, 직종별 현원)
- 담당자 성명·연락처, 임원 성명·경력 등 개인정보 표는 수집하지 않는다
- robots.txt 없음(404, 2026-10-10 확인). 결산서 페이지가 약 8MB(압축 미지원)여서 요청 간격을 3초로 둔다

사용법: python scripts/collect_alimi_disclosure.py [기관번호 ...]
출력: data/alimi/지역거점공공병원_공시.json
"""
import datetime
import json
import os
import re
import sys
import time
import urllib.request

from bs4 import BeautifulSoup

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'data', 'alimi', '지역거점공공병원_공시.json')
BASE = 'https://rhs.mohw.go.kr/Disclosure'
UA = 'health-map-essential-care/1.0 (+https://github.com/soohyun9953/essential-care-map)'
간격_초 = 3

# 알리미 '기관별 공시' 목록의 기관명·기관번호 (2026-10-10 기준)
기관_목록 = [
    ('서울의료원', '10000001'), ('부산의료원', '10000026'), ('대구의료원', '10000027'), ('인천의료원', '10000002'),
    ('인천의료원 백령병원', '10000043'), ('경기도의료원 이천병원', '10000007'), ('경기도의료원 수원병원', '10000004'),
    ('경기도의료원 포천병원', '10000009'), ('경기도의료원 안성병원', '10000006'), ('경기도의료원 의정부병원', '10000005'),
    ('경기도의료원 파주병원', '10000008'), ('성남시의료원', '10000045'), ('원주의료원', '10000010'), ('강릉의료원', '10000011'),
    ('속초의료원', '10000012'), ('영월의료원', '10000013'), ('삼척의료원', '10000014'), ('청주의료원', '10000015'),
    ('충주의료원', '10000016'), ('천안의료원', '10000017'), ('공주의료원', '10000018'), ('홍성의료원', '10000019'),
    ('서산의료원', '10000020'), ('군산의료원', '10000021'), ('남원의료원', '10000022'), ('진안군의료원', '10000041'),
    ('순천의료원', '10000023'), ('강진의료원', '10000024'), ('목포시의료원', '10000025'), ('포항의료원', '10000028'),
    ('안동의료원', '10000031'), ('김천의료원', '10000029'), ('울진군의료원', '10000030'), ('마산의료원', '10000032'),
    ('제주의료원', '10000034'), ('서귀포의료원', '10000035'), ('서울적십자병원', '10000036'), ('상주적십자병원', '10000038'),
    ('인천적십자병원', '10000037'), ('통영적십자병원', '10000040'), ('거창적십자병원', '10000039'), ('영주적십자병원', '10000044'),
]

페이지 = {
    '결산서': 'View02.do?hospitalNumber={no}&searchYearMonth=&pageNum=02&subNum=05',
    '수입지출': 'View03.do?hospitalNumber={no}&searchYearMonth=&pageNum=02&subNum=06',
    '직원현황': 'View06.do?hospitalNumber={no}&searchYearMonth=&pageNum=02&subNum=10',
}
# 개인정보가 들어 있는 표는 건너뜀
제외_표 = ('담당자', '변경이력')


def fetch(url):
    req = urllib.request.Request(url, headers={'User-Agent': UA})
    with urllib.request.urlopen(req, timeout=90) as r:
        return r.read().decode('utf-8', errors='replace')


def 표_격자(table):
    """rowspan·colspan을 펼친 2차원 문자열 격자"""
    grid, pending = [], {}
    for tr in table.find_all('tr'):
        row, col = [], 0
        cells = tr.find_all(['th', 'td'])
        ci = 0
        while ci < len(cells) or col in pending:
            if col in pending:
                text, left = pending[col]
                row.append(text)
                if left > 1:
                    pending[col] = (text, left - 1)
                else:
                    del pending[col]
                col += 1
                continue
            c = cells[ci]
            ci += 1
            text = re.sub(r'\s+', ' ', c.get_text(' ', strip=True))
            rs, cs = int(c.get('rowspan', 1) or 1), int(c.get('colspan', 1) or 1)
            for _ in range(cs):
                row.append(text)
                if rs > 1:
                    pending[col] = (text, rs - 1)
                col += 1
        grid.append(row)
    return grid


def 숫자(text):
    t = text.replace(',', '').strip()
    if t in ('', '-', '데이터없음'):
        return None
    try:
        return float(t) if '.' in t else int(t)
    except ValueError:
        return None


def 연도표_파싱(table):
    """머리행의 'YYYY년' 열을 찾아 {항목: {연도: 값}} 으로 변환. 항목명은 앞쪽 비연도 열을 '>'로 연결"""
    grid = 표_격자(table)
    head_i = next((i for i, r in enumerate(grid) if sum(bool(re.fullmatch(r'\d{4}년', c)) for c in r) >= 2), None)
    if head_i is None:
        return None
    head = grid[head_i]
    year_cols = [(i, c[:4]) for i, c in enumerate(head) if re.fullmatch(r'\d{4}년', c)]
    first_year_col = year_cols[0][0]
    out = {}
    for r in grid[head_i + 1:]:
        if len(r) <= first_year_col:
            continue
        labels = []
        for c in r[:first_year_col]:
            c = re.sub(r'(\s+[-\d,]+)+$', '', c)  # 일부 셀에 값이 함께 들어간 경우 제거
            c = re.sub(r'(?<=[가-힣]) (?=[가-힣])', '', c) if len(c.replace(' ', '')) <= 8 and re.fullmatch(r'[가-힣 ]+', c) else c
            if c and (not labels or labels[-1] != c):
                labels.append(c)
        key = ' > '.join(labels)
        if not key:
            continue
        out[key] = {y: 숫자(r[i]) if i < len(r) else None for i, y in year_cols}
    return out


def 기준일_파싱(table):
    text = re.sub(r'\s+', ' ', table.get_text(' ', strip=True))
    기준 = re.findall(r'(\d{4})년 (\d{2})월 (\d{2})일', text)
    return [f'{y}-{m}-{d}' for y, m, d in 기준]


def 페이지_파싱(html):
    soup = BeautifulSoup(html, 'html.parser')
    표들, 기준일 = {}, {}
    for t in soup.find_all('table'):
        cap = re.sub(r'\s+', ' ', t.caption.get_text(' ', strip=True)) if t.caption else ''
        if any(k in cap for k in 제외_표):
            continue
        if '기준일' in cap:
            기준일[cap] = 기준일_파싱(t)
            continue
        parsed = 연도표_파싱(t)
        if parsed:
            표들[cap] = parsed
    return 표들, 기준일


def main():
    only = set(sys.argv[1:])
    targets = [(n, no) for n, no in 기관_목록 if not only or no in only]
    old = {}
    if os.path.exists(OUT):
        for h in json.load(open(OUT, encoding='utf-8'))['기관']:
            old[h['기관번호']] = h
    results = dict(old)
    for idx, (name, no) in enumerate(targets, 1):
        rec = {'기관명': name, '기관번호': no, '표': {}, '기준일': {}}
        for kind, path in 페이지.items():
            url = f'{BASE}/{path.format(no=no)}'
            for attempt in range(3):
                try:
                    html = fetch(url)
                    break
                except Exception as e:  # noqa: BLE001
                    print(f'  재시도 {attempt + 1}: {name} {kind} {e}')
                    time.sleep(10)
            else:
                raise SystemExit(f'수집 실패: {name} {kind}')
            표들, 기준일 = 페이지_파싱(html)
            rec['표'][kind] = 표들
            rec['기준일'][kind] = 기준일
            time.sleep(간격_초)
        results[no] = rec
        print(f'[{idx}/{len(targets)}] {name}: ' + ', '.join(f'{k} {len(v)}표' for k, v in rec['표'].items()))

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    order = [no for _, no in 기관_목록]
    snap = {
        '수집일시': datetime.datetime.now().strftime('%Y-%m-%d %H:%M'),
        '출처': '보건복지부 지역거점공공병원 알리미 기관별 통합공시 (https://rhs.mohw.go.kr), 시스템관리: 국립중앙의료원',
        '단위': '금액 천원, 인원 명',
        '기관': [results[no] for no in order if no in results],
    }
    with open(OUT, 'w', encoding='utf-8') as f:
        json.dump(snap, f, ensure_ascii=False, indent=1)
    print(f'{len(snap["기관"])}개 기관 → {os.path.relpath(OUT, ROOT)}')


if __name__ == '__main__':
    main()
