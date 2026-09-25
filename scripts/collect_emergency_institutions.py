# -*- coding: utf-8 -*-
"""
국립중앙의료원 E-Gen 「전국 응급의료기관 정보 조회 서비스」(공공데이터포털 15000563)에서
전국 응급의료기관 목록(getEgytListInfoInqire)을 수집해 스냅샷으로 저장

사용법:
  python scripts/collect_emergency_institutions.py [--probe]
  - 인증키: 환경변수 DATA_GO_KR_API_KEY 또는 .env.local 의 DATA_GO_KR_API_KEY (Decoding 키)
  - --probe: 첫 페이지 3건만 조회해 응답 형식을 출력 (저장하지 않음)

출력: data/egen/응급의료기관_목록.json
  { "수집일시": ..., "출처": ..., "전체건수": N, "기관": [ {API 원본 항목...}, ... ] }

응답 형식이 예상과 다르면(필수 항목 누락) 저장하지 않고 종료한다.
"""
import datetime
import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'data', 'egen', '응급의료기관_목록.json')
ENDPOINT = 'https://apis.data.go.kr/B552657/ErmctInfoInqireService/getEgytListInfoInqire'
필수_항목 = ['hpid', 'dutyName', 'dutyEmclsName', 'dutyAddr']


def 인증키():
    key = os.environ.get('DATA_GO_KR_API_KEY', '').strip()
    env_local = os.path.join(ROOT, '.env.local')
    if not key and os.path.exists(env_local):
        for line in open(env_local, encoding='utf-8'):
            if line.startswith('DATA_GO_KR_API_KEY='):
                key = line.split('=', 1)[1].strip()
    if not key:
        sys.exit('DATA_GO_KR_API_KEY 가 없습니다 (.env.local 또는 환경변수)')
    return key


def 조회(key, page, rows):
    url = f"{ENDPOINT}?serviceKey={urllib.parse.quote(key, safe='')}&pageNo={page}&numOfRows={rows}"
    try:
        body = urllib.request.urlopen(url, timeout=60).read().decode('utf-8')
    except urllib.error.HTTPError as e:
        sys.exit(f'HTTP {e.code}: {e.read().decode("utf-8", "replace")[:300]}')
    root = ET.fromstring(body)
    code = root.findtext('.//resultCode')
    if code not in (None, '00'):
        sys.exit(f'API 오류 {code}: {root.findtext(".//resultMsg")}')
    items = [{c.tag: (c.text or '').strip() for c in item} for item in root.iter('item')]
    total = int(root.findtext('.//totalCount') or 0)
    return items, total


def main():
    key = 인증키()
    if '--probe' in sys.argv:
        items, total = 조회(key, 1, 3)
        print('전체건수', total)
        print(json.dumps(items, ensure_ascii=False, indent=1))
        return

    rows, page, 기관 = 1000, 1, []
    while True:
        items, total = 조회(key, page, rows)
        기관.extend(items)
        print(f'  {page}쪽: {len(items)}건 (누적 {len(기관)}/{total})', flush=True)
        if not items or len(기관) >= total:
            break
        page += 1
        time.sleep(0.5)

    누락 = [k for k in 필수_항목 if not all(k in h for h in 기관)]
    if not 기관 or 누락:
        sys.exit(f'응답 형식이 예상과 다릅니다. 누락 항목: {누락}, 예시: {기관[:1]}')

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    json.dump(
        {
            '수집일시': datetime.datetime.now().strftime('%Y-%m-%d %H:%M'),
            '출처': '국립중앙의료원 전국 응급의료기관 정보 조회 서비스 (공공데이터포털 15000563, getEgytListInfoInqire)',
            '전체건수': total,
            '기관': 기관,
        },
        open(OUT, 'w', encoding='utf-8'),
        ensure_ascii=False,
        indent=1,
    )
    print(f'{len(기관)}건 저장 → {os.path.relpath(OUT, ROOT)}')


if __name__ == '__main__':
    main()
