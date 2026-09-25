# -*- coding: utf-8 -*-
"""
E-Gen 응급의료기관 스냅샷(data/egen/응급의료기관_목록.json) → src/lib/응급의료기관_데이터셋.ts 생성

사용법: python scripts/generate_emergency_dataset.py
(스냅샷 갱신은 scripts/collect_emergency_institutions.py)
"""
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'data', 'egen', '응급의료기관_목록.json')
OUT_TS = os.path.join(ROOT, 'src', 'lib', '응급의료기관_데이터셋.ts')


def main():
    snap = json.load(open(SRC, encoding='utf-8'))
    items = [
        {
            'hpid': h['hpid'],
            '기관명': h['dutyName'],
            '분류': h['dutyEmclsName'],
            '분류코드': h.get('dutyEmcls', ''),
            '주소': ' '.join(h['dutyAddr'].split()),
            '대표전화': h.get('dutyTel1', ''),
            '응급실전화': h.get('dutyTel3', ''),
            '위도': round(float(h['wgs84Lat']), 6) if h.get('wgs84Lat') else None,
            '경도': round(float(h['wgs84Lon']), 6) if h.get('wgs84Lon') else None,
        }
        for h in snap['기관']
    ]
    ts = f"""// 자동 생성 파일: scripts/generate_emergency_dataset.py 로 생성 (직접 수정 금지)
// 출처: {snap['출처']}
// 수집일시: {snap['수집일시']} (전체 {len(items)}개 기관)

export interface 응급의료기관 {{
  hpid: string;
  기관명: string;
  분류: string; // 권역응급의료센터 / 지역응급의료센터 / 지역응급의료기관 / 응급실운영신고기관 등
  분류코드: string;
  주소: string;
  대표전화: string;
  응급실전화: string;
  위도: number | null;
  경도: number | null;
}}

export const 응급의료기관_출처 = {{
  기관: '국립중앙의료원',
  자료명: '전국 응급의료기관 정보 조회 서비스 (E-Gen)',
  수집일: '{snap['수집일시'][:10]}',
  URL: 'https://www.data.go.kr/data/15000563/openapi.do',
}} as const;

export const 응급의료기관_목록: 응급의료기관[] = {json.dumps(items, ensure_ascii=False, indent=2)};
"""
    open(OUT_TS, 'w', encoding='utf-8').write(ts)
    print(f'{len(items)}개 기관 → {os.path.relpath(OUT_TS, ROOT)}')


if __name__ == '__main__':
    main()
