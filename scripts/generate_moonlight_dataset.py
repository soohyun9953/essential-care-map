# -*- coding: utf-8 -*-
"""
달빛어린이병원 스냅샷(data/nmc/달빛어린이병원_목록.json) → src/lib/달빛어린이병원_데이터셋.ts 생성

사용법: python scripts/generate_moonlight_dataset.py
(스냅샷 갱신은 scripts/collect_moonlight_hospitals.py)
"""
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'data', 'nmc', '달빛어린이병원_목록.json')
OUT_TS = os.path.join(ROOT, 'src', 'lib', '달빛어린이병원_데이터셋.ts')


def main():
    snap = json.load(open(SRC, encoding='utf-8'))
    items = []
    for h in snap['기관']:
        # 같은 이름의 분원이 있으므로 기관명 + 주소로 식별
        items.append({'id': f"nmc|{h['기관명']}|{h['주소']}", **h})
    assert len({i['id'] for i in items}) == len(items), '기관 식별자 중복'
    ts = f"""// 자동 생성 파일: scripts/generate_moonlight_dataset.py 로 생성 (직접 수정 금지)
// 출처: {snap['출처']}
// 수집일시: {snap['수집일시']} (전체 {len(items)}곳, 누리집에 기준일 표기 없음)

export interface 달빛어린이병원 {{
  id: string;
  시도: string;
  기관명: string;
  기관구분: string; // 의원 / 병원 / 종합병원
  대표전화: string;
  주소: string;
  위도: number;
  경도: number;
}}

export const 달빛어린이병원_출처 = {{
  기관: '국립중앙의료원',
  자료명: '달빛어린이병원(소아 야간·휴일 진료기관) 목록',
  수집일: '{snap['수집일시'][:10]}',
  URL: 'https://www.nmc.or.kr/nmc/babyList',
}} as const;

export const 달빛어린이병원_목록: 달빛어린이병원[] = {json.dumps(items, ensure_ascii=False, indent=2)};
"""
    open(OUT_TS, 'w', encoding='utf-8').write(ts)
    print(f'{len(items)}곳 → {os.path.relpath(OUT_TS, ROOT)}')


if __name__ == '__main__':
    main()
