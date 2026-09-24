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
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_CSV = os.path.join(ROOT, 'data', 'hira', '분만가능_의료기관_목록_20260430.csv')
OUT_TS = os.path.join(ROOT, 'src', 'lib', '분만가능_의료기관_데이터셋.ts')


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

    items = [
        {
            '시도': r['시도'].strip(),
            '시군구': r['시군구'].strip(),
            '종별': r['종별'].strip(),
            '기관명': r['기관명'].strip(),
            '주소': r['주소'].strip(),
            '전화번호': r['전화번호'].strip(),
            '야간': r['야간여부'].strip() == '야간',
        }
        for r in rows
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
}}

export const 분만가능_의료기관_출처 = {{
  기관: '건강보험심사평가원',
  자료명: '분만가능 의료기관 목록',
  기준일: '2026-04-30',
  산출기간: '2025년 1월 ~ 2026년 4월 청구 실적',
  이용허락: '공공누리 제1유형(출처표시)',
  URL: 'https://www.data.go.kr/data/15160285/fileData.do',
}} as const;

export const 분만가능_의료기관_목록: 분만가능_의료기관[] = {json.dumps(items, ensure_ascii=False, indent=2)};
"""
    with open(OUT_TS, 'w', encoding='utf-8') as f:
        f.write(ts)
    print(f'{len(items)}개 기관 → {os.path.relpath(OUT_TS, ROOT)}')


if __name__ == '__main__':
    main()
