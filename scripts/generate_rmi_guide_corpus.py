"""「2026년 책임의료기관 통합 사업 안내」 원문 PDF → 쪽별 텍스트 JSON (질의응답 근거용)

사용: python scripts/generate_rmi_guide_corpus.py "<원문 PDF 경로>"
출력: data/책임의료기관/사업안내_2026_쪽별.json

- 본문 쪽수 = PDF 쪽 - 14 (PDF 20쪽 = 본문 6쪽). PDF 3~11쪽은 '2025→2026 주요 변경사항' 표
- PART 제목은 홀수 쪽 머리말('PART Ⅱ 공공보건의료 협력체계 구축 사업❙17 l')에서 읽어 다음 쪽까지 이어 붙인다
- 머리말·쪽 번호 줄은 본문에서 뺀다. 표 칸 줄바꿈은 공백 하나로 합친다
"""
import json
import os
import re
import sys

import fitz  # PyMuPDF

쪽_보정 = 14
변경사항_쪽 = range(3, 12)


def main(pdf_path: str) -> None:
    doc = fitz.open(pdf_path)
    part = ''
    rows = []
    for i, page in enumerate(doc):
        pdf_쪽 = i + 1
        lines = [l.strip() for l in page.get_text().split('\n') if l.strip()]
        if not lines:
            continue
        head = lines[0]
        m = re.match(r'^(PART\s*[ⅠⅡⅢⅣⅤⅥ]+\s*.+?)❙\s*\d+\s*l$', head)
        if m:
            part = re.sub(r'\s+', ' ', m.group(1)).strip()
            lines = lines[1:]
        elif re.match(r'^l\s*\d+\s*❙', head):
            lines = lines[1:]
        text = re.sub(r'\s+', ' ', ' '.join(lines)).strip()
        text = re.sub(r'·{4,}', '…', text)  # 목차 점선
        if len(text) < 30:
            continue
        if pdf_쪽 in 변경사항_쪽:
            구분, 본문_쪽 = '2026년 주요 변경사항', None
        elif pdf_쪽 <= 쪽_보정:
            구분, 본문_쪽 = '목차', None
        else:
            구분, 본문_쪽 = part or 'PART Ⅰ 책임의료기관 개요', pdf_쪽 - 쪽_보정
        rows.append({'pdf_쪽': pdf_쪽, '본문_쪽': 본문_쪽, '구분': 구분, '본문': text})

    out_dir = os.path.join(os.path.dirname(__file__), '..', 'data', '책임의료기관')
    os.makedirs(out_dir, exist_ok=True)
    out = os.path.join(out_dir, '사업안내_2026_쪽별.json')
    payload = {
        '문서명': '2026년 책임의료기관 통합 사업 안내',
        '발행': '보건복지부·국립중앙의료원 (사업 지침)',
        '쪽_보정': 쪽_보정,
        '쪽': rows,
    }
    with open(out, 'w', encoding='utf-8') as f:
        json.dump(payload, f, ensure_ascii=False, indent=1)
    print(f'{len(rows)}쪽 → {os.path.normpath(out)}')


if __name__ == '__main__':
    main(sys.argv[1])
