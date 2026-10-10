# -*- coding: utf-8 -*-
"""
건강보험심사평가원 「분만가능 의료기관 목록」(공공데이터포털 15160285) CSV → TypeScript 데이터셋 변환

사용법:
  python scripts/generate_delivery_dataset.py [원본 CSV 경로]

- 원본 CSV(cp949)를 UTF-8로 data/hira/분만가능_의료기관_목록_20260430.csv 에 보관하고
- src/lib/분만가능_의료기관_데이터셋.ts 를 생성한다.
- 출처: 건강보험심사평가원, 공공누리 제1유형(출처표시)
"""
import csv
import io
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_CSV = os.path.join(ROOT, 'data', 'hira', '분만가능_의료기관_목록_20260430.csv')
OUT_TS = os.path.join(ROOT, 'src', 'lib', '분만가능_의료기관_데이터셋.ts')
# scripts/geocode_delivery_institutions.py 가 생성하는 좌표 캐시 (없으면 좌표 없이 생성)
COORD_JSON = os.path.join(ROOT, 'data', 'hira', '분만가능_의료기관_좌표.json')
# 국립중앙의료원 E-Gen 응급의료기관 스냅샷: 같은 기관이면 기관 공식 좌표(WGS84)를 우선 사용
EGEN_JSON = os.path.join(ROOT, 'data', 'egen', '응급의료기관_목록.json')


def 도로명_키(addr):
    """'경기도 포천시 포천로 1648 (신읍동)' → '경기도|포천시|포천로|1648' (건물번호 '-0' 제거)"""
    t = addr.split()
    m = re.search(r'(\S+(?:로|길))\s*(\d+)(?:-(\d+))?', addr)
    if len(t) < 2 or not m:
        return None
    부번 = m.group(3)
    번호 = m.group(2) + (f'-{부번}' if 부번 and 부번 != '0' else '')
    return f'{t[0]}|{t[1]}|{m.group(1)}|{번호}'


def 기관명_키(sido_sgg, name):
    n = re.sub(r'\(.*?\)|의료법인|재단법인|사회복지법인|학교법인|\s', '', name)
    return f'{sido_sgg}|{n}'


def egen_좌표_색인():
    if not os.path.exists(EGEN_JSON):
        return {}, {}
    by_road, by_name = {}, {}
    for h in json.load(open(EGEN_JSON, encoding='utf-8'))['기관']:
        try:
            c = (float(h['wgs84Lat']), float(h['wgs84Lon']))
        except (KeyError, TypeError, ValueError):
            continue
        addr = h.get('dutyAddr', '')
        k = 도로명_키(addr)
        if k:
            by_road[k] = c
        t = addr.split()
        if len(t) >= 2:
            by_name[기관명_키(f'{t[0]}|{t[1]}', h.get('dutyName', ''))] = c
    return by_road, by_name


def read_rows(path):
    raw = open(path, 'rb').read()
    for enc in ('utf-8-sig', 'cp949'):
        try:
            text = raw.decode(enc)
            break
        except UnicodeDecodeError:
            continue
    return list(csv.DictReader(io.StringIO(text)))


def main():
    src = sys.argv[1] if len(sys.argv) > 1 else DATA_CSV
    rows = read_rows(src)
    expected = ['시도', '시군구', '종별', '기관명', '주소', '전화번호', '야간여부']
    assert list(rows[0].keys()) == expected, f'컬럼 구성이 다릅니다: {list(rows[0].keys())}'

    # 원본 보관 (UTF-8)
    os.makedirs(os.path.dirname(DATA_CSV), exist_ok=True)
    if os.path.abspath(src) != os.path.abspath(DATA_CSV):
        with open(DATA_CSV, 'w', encoding='utf-8', newline='') as f:
            w = csv.DictWriter(f, fieldnames=expected)
            w.writeheader()
            w.writerows(rows)

    coords = json.load(open(COORD_JSON, encoding='utf-8')) if os.path.exists(COORD_JSON) else {}

    egen_road, egen_name = egen_좌표_색인()
    보정_수 = 0

    def 좌표(r):
        # 1순위: E-Gen 기관 좌표 (도로명 주소 또는 기관명이 같은 응급의료기관)
        t = r['주소'].split()
        e = egen_road.get(도로명_키(r['주소']) or '') or (
            egen_name.get(기관명_키(f'{t[0]}|{t[1]}', r['기관명'])) if len(t) >= 2 else None
        )
        if e:
            return (round(e[0], 6), round(e[1], 6), '주소', True)
        # 2순위: 주소 변환(Nominatim) 좌표 캐시
        c = coords.get(f"{r['시도']}|{r['시군구']}|{r['기관명']}")
        return (c['위도'], c['경도'], c['정밀도'], False) if c else (None, None, None, False)

    좌표_목록 = [좌표(r) for r in rows]
    보정_수 = sum(1 for c in 좌표_목록 if c[3])

    items = [
        {
            '시도': r['시도'].strip(),
            '시군구': r['시군구'].strip(),
            '종별': r['종별'].strip(),
            '기관명': r['기관명'].strip(),
            '주소': r['주소'].strip(),
            '전화번호': r['전화번호'].strip(),
            '야간': r['야간여부'].strip() == '야간',
            '위도': c[0],
            '경도': c[1],
            '좌표_정밀도': c[2],
        }
        for r, c in zip(rows, 좌표_목록)
    ]

    ts = f"""// 자동 생성 파일: scripts/generate_delivery_dataset.py 로 생성 (직접 수정 금지)
// 출처: 건강보험심사평가원 「분만가능 의료기관 목록」(공공데이터포털 15160285, 2026-04-30 기준)
// 이용허락: 공공누리 제1유형(출처표시)
// 산출 기준: 진료년월 2025년 1월 ~ 2026년 4월 분만 관련 수가(정상·유도·제왕절개 등) 청구 실적, 건강보험·의료급여·DRG 포함
// 유의: 청구 실적 기반 목록이므로 실제 분만 가능 여부는 방문 전 해당 기관에 확인해야 함

export interface 분만가능_의료기관 {{
  시도: string;
  시군구: string;
  종별: string;
  기관명: string;
  주소: string;
  전화번호: string;
  야간: boolean; // 야간(심야 포함) 분만 청구 실적 여부
  위도: number | null;
  경도: number | null;
  // '주소': 도로명 주소 기반 좌표 / '시군구': 주소 변환 실패로 시군구 대표 좌표 근사 / null: 좌표 없음
  좌표_정밀도: '주소' | '시군구' | null;
}}

export const 분만가능_의료기관_출처 = {{
  기관: '건강보험심사평가원',
  자료명: '분만가능 의료기관 목록',
  기준일: '2026-04-30',
  산출기간: '2025년 1월 ~ 2026년 4월 청구 실적',
  이용허락: '공공누리 제1유형(출처표시)',
  URL: 'https://www.data.go.kr/data/15160285/fileData.do',
  좌표_출처: '응급의료기관과 같은 기관: 국립중앙의료원 E-Gen 기관 좌표 / 그 외 주소 기반 좌표: OpenStreetMap Nominatim (© OpenStreetMap contributors, ODbL)',
}} as const;

export const 분만가능_의료기관_목록: 분만가능_의료기관[] = {json.dumps(items, ensure_ascii=False, indent=2)};
"""
    with open(OUT_TS, 'w', encoding='utf-8') as f:
        f.write(ts)
    print(f'{len(items)}개 기관 → {os.path.relpath(OUT_TS, ROOT)} (E-Gen 좌표 적용 {보정_수}곳)')


if __name__ == '__main__':
    main()
