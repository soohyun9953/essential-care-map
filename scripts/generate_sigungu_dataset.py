# -*- coding: utf-8 -*-
"""
헬스맵 주제도 지표(src/lib/헬스맵_주제도_지표_데이터셋.ts) → 필수의료 진단용 시군구 데이터셋 생성

기존 '전국_시군구_샘플_데이터'(144개, 출처 불명·실데이터와 불일치)를 대체한다. (2026-09-25)
- 헬스맵 지표는 원천 엑셀 기반 환자 유출입 데이터와 응급·분만 RI가 중앙값 0.01~0.02%p 차이로 일치함을 확인
- 사용 지표 (2024년):
    ABA01 인구수, BBB01 권역응급(60분) 취약인구율, CBB04 응급의료기관 관내이용률(RI),
    BBD01 분만기관(60분) 취약인구율, CBD01 분만 관내이용률(RI)
- 소아 병상 공급비율·야간휴일 접근성: 실데이터가 없어 null (진단에서 제외)
- 시군구코드: 공공의료기관 데이터셋 → 환자 유출입 데이터(동명 시군구 제외) 순으로 채택,
  나머지 동명 자치구 등은 행정표준코드를 아래에 직접 기재

사용법: python scripts/generate_sigungu_dataset.py
"""
import json
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_TS = os.path.join(ROOT, 'src', 'lib', '시군구_데이터셋.ts')

# 헬스맵의 옛 시도명 → 앱 표기 (강원·전북 특별자치도 전환 반영, 광주·전남 통합은 앱 전체 결정 후 반영)
시도_앱표기 = {'강원도': '강원특별자치도', '전라북도': '전북특별자치도'}
시도_약칭 = {'강원도': '강원', '강원특별자치도': '강원', '전라북도': '전북', '전북특별자치도': '전북', '전라남도': '전남',
         '경상북도': '경북', '경상남도': '경남', '충청북도': '충북', '충청남도': '충남'}

# 다른 데이터에서 코드를 확정할 수 없는 시군구 (행정표준코드, 동명 자치구 등)
수기_코드 = {
    ('부산', '중구'): '26110', ('부산', '강서구'): '26440',
    ('대구', '동구'): '27140', ('대구', '남구'): '27200',
    ('인천', '중구'): '28110', ('광주', '서구'): '29140',
    ('울산', '중구'): '31110', ('울산', '남구'): '31140', ('울산', '동구'): '31170', ('울산', '북구'): '31200',
    ('강원', '고성군'): '51820',
}


def load(path, var, ch):
    s = open(os.path.join(ROOT, path), encoding='utf-8-sig').read()
    a = s.index('= ' + ch, s.index(var)) + 2
    return json.loads(s[a: s.index('\n];' if ch == '[' else '\n};', a) + 2])


def sk(sido):
    return 시도_약칭.get(sido, sido[:2])


def 이름(sgg):
    return re.sub(r'\(\d{4}(-\d{4})?\)$', '', sgg).replace(' ', '')


def main():
    hm = load('src/lib/헬스맵_주제도_지표_데이터셋.ts', '시군구_지표_시계열', '{')
    pub = load('src/lib/공공의료기관_데이터셋.ts', '전국_공공의료기관_목록', '[')
    flow = load('src/lib/환자_유출입_데이터셋.ts', '환자_유출입_2024_데이터', '{')

    codes = {}
    for p in pub:
        codes.setdefault((sk(p['시도명']), 이름(p['시군구명'])), str(p['시군구코드']))
    동명 = {}
    for v in flow.values():
        동명.setdefault(이름(v['sgg']), []).append(v)
    for g, vs in 동명.items():
        if len(vs) == 1:
            codes.setdefault((sk(vs[0]['sido']), g), str(vs[0]['code']))
    for k, c in 수기_코드.items():
        codes.setdefault(k, c)

    rows = []
    for key, v in hm.items():
        if re.search(r'\(\d{4}-\d{4}\)$', v['sigungu']):
            continue  # 2024년 이전에만 존재한 행정구역 (예: 경상북도 군위군 2019-2023)
        ind = v['indicators']
        val = lambda c: ind[c]['values']['2024']
        sido = 시도_앱표기.get(v['sido'], v['sido'])
        sgg = re.sub(r'\(\d{4}\)$', '', v['sigungu'])
        code = codes.get((sk(v['sido']), 이름(v['sigungu'])))
        assert code, f'시군구코드 없음: {key}'
        rows.append({
            '시도코드': code[:2],
            '시도명': sido,
            '시군구코드': code,
            '시군구명': sgg,
            '인구수': int(round(val('ABA01'))),
            '응급_60분_미도달_인구비율': round(val('BBB01'), 2),
            '관내_응급_의료이용률': round(val('CBB04'), 2),
            '분만_60분_미도달_인구비율': round(val('BBD01'), 2),
            '관내_분만율': round(val('CBD01'), 2),
            '소아_병상_공급비율': None,
            '소아_야간휴일_접근성지수': None,
        })
    assert len({r['시군구코드'] for r in rows}) == len(rows), '시군구코드 중복'
    rows.sort(key=lambda r: r['시군구코드'])

    ts = f"""// 자동 생성 파일: scripts/generate_sigungu_dataset.py 로 생성 (직접 수정 금지)
// 필수의료 진단용 전국 시군구 데이터 ({len(rows)}개, 2024년)
// 출처: 헬스맵 주제도 지표 (src/lib/헬스맵_주제도_지표_데이터셋.ts)
//   ABA01 인구수 · BBB01 권역응급(60분) 취약인구율 · CBB04 응급의료기관 관내이용률(RI)
//   BBD01 분만기관(60분) 취약인구율 · CBD01 분만 관내이용률(RI)
// 소아 병상 공급비율·야간휴일 접근성은 실데이터가 없어 null (진단에서 제외)

import {{ 시군구_원천_데이터 }} from './필수의료_타입';

export const 시군구_진단_데이터_출처 = {{
  자료: '헬스맵 주제도 지표 (2024년)',
  지표: 'ABA01·BBB01·CBB04·BBD01·CBD01',
  소아: '실데이터 미확보 — 진단 제외',
}} as const;

export const 전국_시군구_진단_데이터: 시군구_원천_데이터[] = {json.dumps(rows, ensure_ascii=False, indent=2)};
"""
    open(OUT_TS, 'w', encoding='utf-8').write(ts)
    print(f'{len(rows)}개 시군구 → {os.path.relpath(OUT_TS, ROOT)}')


if __name__ == '__main__':
    main()
