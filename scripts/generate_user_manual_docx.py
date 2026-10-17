# -*- coding: utf-8 -*-
"""
공공의료 의사결정 지원 플랫폼 (Essential Care Map) 사용자 매뉴얼 DOCX 생성 스크립트
버전: v1.29.15
작성일: 2026년 10월
"""

import os
import sys
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def set_cell_background(cell, fill_hex):
    """표 셀의 배경색을 설정합니다."""
    tcPr = cell._element.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    """표 셀의 안쪽 여백(패딩)을 설정합니다. (DXA 단위: 1pt = 20 dxa)"""
    tcPr = cell._element.get_or_add_tcPr()
    tcMar = parse_xml(
        f'<w:tcMar {nsdecls("w")}>'
        f'<w:top w:w="{top}" w:type="dxa"/>'
        f'<w:bottom w:w="{bottom}" w:type="dxa"/>'
        f'<w:left w:w="{left}" w:type="dxa"/>'
        f'<w:right w:w="{right}" w:type="dxa"/>'
        f'</w:tcMar>'
    )
    tcPr.append(tcMar)

def set_table_borders(table, color="CCCCCC", sz="4", val="single"):
    """표 전체의 테두리를 깔끔하게 설정합니다."""
    tblPr = table._element.xpath('w:tblPr')
    if tblPr:
        borders = parse_xml(
            f'<w:tblBorders {nsdecls("w")}>'
            f'<w:top w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
            f'<w:bottom w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
            f'<w:left w:val="none"/>'
            f'<w:right w:val="none"/>'
            f'<w:insideH w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
            f'<w:insideV w:val="none"/>'
            f'</w:tblBorders>'
        )
        tblPr[0].append(borders)

def add_callout_box(doc, title, text_lines, box_type="info"):
    """전문적인 안내/팁 콜아웃 박스를 생성합니다."""
    color_map = {
        "info": {"bg": "EFF6FF", "border": "2563EB", "title_color": RGBColor(30, 64, 175), "icon": "ℹ️ [안내] "},
        "tip": {"bg": "F0FDF4", "border": "16A34A", "title_color": RGBColor(22, 101, 52), "icon": "💡 [실무 팁] "},
        "warning": {"bg": "FFFBEB", "border": "D97706", "title_color": RGBColor(146, 64, 14), "icon": "⚠️ [주의 사항] "},
        "law": {"bg": "F8FAFC", "border": "475569", "title_color": RGBColor(30, 41, 59), "icon": "⚖️ [관련 법령 및 지침] "},
    }
    cfg = color_map.get(box_type, color_map["info"])
    
    table = doc.add_table(rows=1, cols=1)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    
    cell = table.cell(0, 0)
    cell.width = Inches(6.5)
    set_cell_background(cell, cfg["bg"])
    set_cell_margins(cell, top=140, bottom=140, left=200, right=200)
    
    # 좌측에만 두꺼운 강조 테두리 적용
    tcPr = cell._element.get_or_add_tcPr()
    borders = parse_xml(
        f'<w:tcBorders {nsdecls("w")}>'
        f'<w:left w:val="single" w:sz="24" w:space="0" w:color="{cfg["border"]}"/>'
        f'<w:top w:val="none"/>'
        f'<w:right w:val="none"/>'
        f'<w:bottom w:val="none"/>'
        f'</w:tcBorders>'
    )
    tcPr.append(borders)
    
    p = cell.paragraphs[0]
    p.paragraph_format.space_before = Pt(2)
    p.paragraph_format.space_after = Pt(4)
    run_title = p.add_run(cfg["icon"] + title)
    run_title.font.name = "맑은 고딕"
    run_title.font.size = Pt(10.5)
    run_title.font.bold = True
    run_title.font.color.rgb = cfg["title_color"]
    
    for line in text_lines:
        p_line = cell.add_paragraph()
        p_line.paragraph_format.space_before = Pt(1)
        p_line.paragraph_format.space_after = Pt(2)
        p_line.paragraph_format.line_spacing = 1.25
        run = p_line.add_run(line)
        run.font.name = "맑은 고딕"
        run.font.size = Pt(9.5)
        run.font.color.rgb = RGBColor(51, 65, 85)
        
    doc.add_paragraph().paragraph_format.space_after = Pt(4)

def build_document():
    doc = docx.Document()
    
    # 1. 페이지 여백 설정 (A4 기준 상하좌우 25mm)
    sections = doc.sections
    for section in sections:
        section.top_margin = Inches(0.98)     # 25mm
        section.bottom_margin = Inches(0.98)  # 25mm
        section.left_margin = Inches(0.98)    # 25mm
        section.right_margin = Inches(0.98)   # 25mm
        section.different_first_page_header_footer = True
        
        # 헤더 & 푸터
        header = section.header
        p_head = header.paragraphs[0]
        p_head.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        r_head = p_head.add_run("공공의료 의사결정 지원 플랫폼 (Essential Care Map) 사용자 매뉴얼 | v1.29.15")
        r_head.font.name = "맑은 고딕"
        r_head.font.size = Pt(8.5)
        r_head.font.color.rgb = RGBColor(148, 163, 184)
        
        footer = section.footer
        p_foot = footer.paragraphs[0]
        p_foot.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r_foot = p_foot.add_run("국립중앙의료원(NMC) 중앙응급의료센터 · 공공보건의료지원센터")
        r_foot.font.name = "맑은 고딕"
        r_foot.font.size = Pt(8.5)
        r_foot.font.color.rgb = RGBColor(148, 163, 184)

    # 기본 스타일 설정
    style_normal = doc.styles['Normal']
    font_normal = style_normal.font
    font_normal.name = '맑은 고딕'
    font_normal.size = Pt(10.5)
    font_normal.color.rgb = RGBColor(30, 41, 59)
    style_normal.paragraph_format.line_spacing = 1.3
    style_normal.paragraph_format.space_after = Pt(4)

    # ==============================================================
    # [표지 (Cover Page)]
    # ==============================================================
    for _ in range(3):
        doc.add_paragraph()

    p_badge = doc.add_paragraph()
    p_badge.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_badge = p_badge.add_run("보건복지부 · 국립중앙의료원(NMC) 공공보건의료 디지털 전환(DX) 플랫폼")
    r_badge.font.name = "맑은 고딕"
    r_badge.font.size = Pt(11)
    r_badge.font.bold = True
    r_badge.font.color.rgb = RGBColor(37, 99, 235)

    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_title.paragraph_format.space_before = Pt(12)
    p_title.paragraph_format.space_after = Pt(10)
    r_title = p_title.add_run("공공의료 의사결정 지원 플랫폼\n사용자 공식 매뉴얼")
    r_title.font.name = "맑은 고딕"
    r_title.font.size = Pt(28)
    r_title.font.bold = True
    r_title.font.color.rgb = RGBColor(15, 23, 42)

    p_subtitle = doc.add_paragraph()
    p_subtitle.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_subtitle.paragraph_format.space_after = Pt(36)
    r_sub = p_subtitle.add_run("Essential Care Map & AI Decision Support Platform User Guide")
    r_sub.font.name = "Arial"
    r_sub.font.size = Pt(13)
    r_sub.font.color.rgb = RGBColor(100, 116, 139)

    # 표지 정보 박스
    tbl_cover = doc.add_table(rows=6, cols=2)
    tbl_cover.alignment = WD_TABLE_ALIGNMENT.CENTER
    col_widths = [Inches(1.8), Inches(4.5)]
    cover_data = [
        ("플랫폼 명칭", "공공의료 의사결정 지원 플랫폼 (Essential Care Map)"),
        ("시스템 버전", "v1.29.15 (최신 프로덕션 정식 빌드)"),
        ("문서 분류", "정부·공공기관 및 대국민 통합 업무 운영 매뉴얼"),
        ("주요 대상", "일반국민, 전국 41개 거점공공병원 담당자, NMC 중앙·지원단 정책관"),
        ("배포 일자", "2026년 10월"),
        ("발행 기관", "국립중앙의료원(NMC) 중앙응급의료센터 · 공공보건의료지원센터"),
    ]
    for row_idx, (label, val) in enumerate(cover_data):
        row = tbl_cover.rows[row_idx]
        cell_lbl, cell_val = row.cells[0], row.cells[1]
        cell_lbl.width, cell_val.width = col_widths[0], col_widths[1]
        
        set_cell_background(cell_lbl, "F1F5F9")
        set_cell_background(cell_val, "FFFFFF")
        set_cell_margins(cell_lbl, 80, 80, 120, 120)
        set_cell_margins(cell_val, 80, 80, 120, 120)
        
        p_l = cell_lbl.paragraphs[0]
        p_l.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        r_l = p_l.add_run(label)
        r_l.font.name = "맑은 고딕"
        r_l.font.size = Pt(9.5)
        r_l.font.bold = True
        r_l.font.color.rgb = RGBColor(51, 65, 85)
        
        p_v = cell_val.paragraphs[0]
        r_v = p_v.add_run(val)
        r_v.font.name = "맑은 고딕"
        r_v.font.size = Pt(9.5)
        r_v.font.color.rgb = RGBColor(15, 23, 42)

    set_table_borders(tbl_cover, color="CBD5E1", sz="4")

    # 표지 하단 구분선 및 여백
    for _ in range(5):
        doc.add_paragraph()

    p_bottom = doc.add_paragraph()
    p_bottom.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_bot = p_bottom.add_run("본 매뉴얼은 공공의료 데이터 분석 및 병원 진단, 국민안심 서비스의 효율적 운영을 위해 작성되었습니다.\n무단 전재 및 상업적 목적의 배포를 금합니다.")
    r_bot.font.name = "맑은 고딕"
    r_bot.font.size = Pt(8.5)
    r_bot.font.color.rgb = RGBColor(148, 163, 184)

    doc.add_page_break()

    # ==============================================================
    # [목차 (Table of Contents)]
    # ==============================================================
    p_toc_title = doc.add_paragraph()
    p_toc_title.paragraph_format.space_before = Pt(12)
    p_toc_title.paragraph_format.space_after = Pt(16)
    r_tt = p_toc_title.add_run("목  차 (Table of Contents)")
    r_tt.font.name = "맑은 고딕"
    r_tt.font.size = Pt(18)
    r_tt.font.bold = True
    r_tt.font.color.rgb = RGBColor(30, 58, 138)

    toc_items = [
        ("제1장. 시스템 개요 및 권한 아키텍처", [
            ("1.1 플랫폼 구축 배경 및 목적", "3"),
            ("1.2 시스템 핵심 차별점 및 5대 혁신 가치", "3"),
            ("1.3 3대 맞춤 사용자 역할(Role) 체계", "4"),
            ("1.4 권장 운영 환경 및 통합 화면 레이아웃 안내", "5"),
        ]),
        ("제2장. [국민] 안심의료 서비스 이용 안내", [
            ("2.1 내 위치 기반 가장 가까운 공공의료기관 검색", "6"),
            ("2.2 국립중앙의료원 E-Gen 실시간 병상 현황 연계 안내", "7"),
            ("2.3 5대 특화 진료기관(응급·소아·분만·야간약국·입원) 찾기", "8"),
            ("2.4 국민안심 AI 의료 동행상담 비서(챗봇) 활용", "9"),
            ("2.5 모바일 3단계 바텀시트 목록 확인 및 즉시 길찾기·전화연결", "10"),
        ]),
        ("제3장. [의료기관 담당자] 공공병원 AI 종합진단 및 자원관리", [
            ("3.1 41개 지역거점공공병원 AI 종합점수 진단 및 원인분석", "11"),
            ("3.2 NMC 공식 의료기관 프로파일 5종 진단보고서(HWP) 자동 작성", "13"),
            ("3.3 시군구 및 중진료권 환자 이용 유출입(OD) 분석", "15"),
            ("3.4 AI 정책기획 & 2030 미래의료수요 추계 시뮬레이션", "16"),
            ("3.5 보건복지부 12대 항목 법정 사업계획서(HWPX) 원클릭 발급", "18"),
            ("3.6 신포괄 정책가산 계산기 (CP 운영 가산율 1.0% 및 재정효과)", "20"),
            ("3.7 71개 NMC 공인 표준진료지침(CP) 라이브러리 및 변이분석(ROI)", "21"),
            ("3.8 퇴원환자 지역사회 돌봄 매칭 및 보건복지 연계의뢰서", "23"),
        ]),
        ("제4장. [NMC 업무 담당자] 전국 헬스맵 관제 및 경영·공시 검증", [
            ("4.1 전국 250개 시군구 35:65 GIS 거시 취약도 맵 관제", "24"),
            ("4.2 35개 지방의료원 경영위기 조기경보 4단계 관제", "26"),
            ("4.3 지역거점공공병원 알리미 공시 14대 회계산출식 사전검증", "28"),
            ("4.4 시도·부처 공공보건의료 시행계획 및 추진실적 AI 100점 평가", "30"),
            ("4.5 전국 214개 공공병원 통합 데이터센터 실시간 관제", "32"),
            ("4.6 듀얼 AI 스튜디오 (Cloud Gemini vs 온프레미스 sLLM & RAG 지침)", "33"),
        ]),
        ("제5장. 공통 편의 기능 및 관리자 전용 도구", [
            ("5.1 글로벌 상단 툴바(다크모드, 역할 스위처, 전역 검색)", "34"),
            ("5.2 NMC 표준 3종 엑셀 다운로드 및 원천 CSV 업로더", "35"),
            ("5.3 환각 제로 법령·원문 대조 신뢰 뷰 (Grounding Verifier)", "36"),
            ("5.4 API 키 설정 및 시스템 보안 관리", "37"),
        ]),
        ("제6장. 자주 묻는 질문(FAQ) 및 장애 해결", [
            ("6.1 계정 및 접속 관련 FAQ", "38"),
            ("6.2 데이터 연계 및 수치 정합성 관련 FAQ", "39"),
            ("6.3 보고서 다운로드 및 출력 관련 FAQ", "40"),
        ]),
    ]

    for chap_title, sections_list in toc_items:
        p_c = doc.add_paragraph()
        p_c.paragraph_format.space_before = Pt(8)
        p_c.paragraph_format.space_after = Pt(2)
        r_c = p_c.add_run(chap_title)
        r_c.font.name = "맑은 고딕"
        r_c.font.size = Pt(11)
        r_c.font.bold = True
        r_c.font.color.rgb = RGBColor(15, 23, 42)
        
        for sec_name, page_no in sections_list:
            p_s = doc.add_paragraph()
            p_s.paragraph_format.left_indent = Inches(0.25)
            p_s.paragraph_format.space_before = Pt(1)
            p_s.paragraph_format.space_after = Pt(1)
            r_sn = p_s.add_run(sec_name)
            r_sn.font.name = "맑은 고딕"
            r_sn.font.size = Pt(9.5)
            r_sn.font.color.rgb = RGBColor(71, 85, 105)
            
            # 탭 리더 도트 시뮬레이션
            dots = " . " * int((70 - len(sec_name) * 1.5))
            r_dots = p_s.add_run(dots)
            r_dots.font.name = "Arial"
            r_dots.font.size = Pt(8)
            r_dots.font.color.rgb = RGBColor(203, 213, 225)
            
            r_p = p_s.add_run(f" {page_no}")
            r_p.font.name = "맑은 고딕"
            r_p.font.size = Pt(9.5)
            r_p.font.bold = True
            r_p.font.color.rgb = RGBColor(37, 99, 235)

    doc.add_page_break()

    # ==============================================================
    # [제1장. 시스템 개요 및 권한 아키텍처]
    # ==============================================================
    def add_chapter_heading(title):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(16)
        p.paragraph_format.space_after = Pt(10)
        run = p.add_run(title)
        run.font.name = "맑은 고딕"
        run.font.size = Pt(16)
        run.font.bold = True
        run.font.color.rgb = RGBColor(30, 58, 138)
        return p

    def add_section_heading(title):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(12)
        p.paragraph_format.space_after = Pt(6)
        run = p.add_run(title)
        run.font.name = "맑은 고딕"
        run.font.size = Pt(13)
        run.font.bold = True
        run.font.color.rgb = RGBColor(37, 99, 235)
        return p

    def add_sub_heading(title):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(8)
        p.paragraph_format.space_after = Pt(4)
        run = p.add_run(title)
        run.font.name = "맑은 고딕"
        run.font.size = Pt(11)
        run.font.bold = True
        run.font.color.rgb = RGBColor(51, 65, 85)
        return p

    add_chapter_heading("제1장. 시스템 개요 및 권한 아키텍처")

    add_section_heading("1.1 플랫폼 구축 배경 및 목적")
    p = doc.add_paragraph()
    p.add_run(
        "최근 대한민국은 수도권-비수도권 간 극심한 필수의료 인프라 불균형과 응급실 미수용('응급실 뺑뺑이'), "
        "분만 산부인과 소멸, 소아청소년과 야간 진료 공백 등 국가적 보건의료 위기에 직면해 있습니다. "
        "이를 극복하기 위해 보건복지부와 국립중앙의료원(NMC)은 전국 250개 시군구의 의료 이용 및 자원 취약도를 실시간으로 모니터링하고, "
        "41개 지역거점공공병원(지방의료원 35개소, 적십자병원 6개소)의 경영·진료 역량을 인공지능(AI)으로 정밀 진단하며, "
        "일반 국민에게는 내 주변 24시간 필수의료 잔여 병상을 즉각 연결하는 「공공의료 의사결정 지원 플랫폼 (Essential Care Map)」을 구축하였습니다."
    )

    add_callout_box(
        doc,
        "플랫폼 핵심 추진 미션",
        [
            "1. [국민 안심] 내 주변 실시간 응급실·소아과·분만병원 잔여 병상 및 AI 증상 안내 즉시 제공",
            "2. [병원 혁신] 41개 거점공공병원 AI 종합진단, 원인분석, 신포괄 정책가산(1.0%) 및 12대 항목 법정 사업계획서 HWPX 자동 수립",
            "3. [중앙 총괄] 전국 250개 시군구 35:65 GIS 취약도 관제, 35개 지방의료원 경영위기 조기경보 및 알리미 공시 14대 산출식 사전검증",
        ],
        box_type="tip"
    )

    add_section_heading("1.2 시스템 핵심 차별점 및 5대 혁신 가치")
    p = doc.add_paragraph()
    p.add_run("본 플랫폼은 과거 분산되어 수작업으로 관리되던 보건의료 통계와 서식 작성 방식을 완전히 혁신하여 다음과 같은 5대 핵심 가치를 실현합니다.")

    # 표: 5대 혁신 가치 비교
    tbl_diff = doc.add_table(rows=6, cols=3)
    tbl_diff.alignment = WD_TABLE_ALIGNMENT.CENTER
    diff_widths = [Inches(1.5), Inches(2.5), Inches(2.5)]
    headers = ["구분", "기존 과거 방식 (As-Is)", "본 플랫폼 혁신 (To-Be)"]
    
    # 헤더 행
    for i, h in enumerate(headers):
        c = tbl_diff.cell(0, i)
        c.width = diff_widths[i]
        set_cell_background(c, "1E3A8A")
        set_cell_margins(c, 100, 100, 120, 120)
        p = c.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r = p.add_run(h)
        r.font.name = "맑은 고딕"
        r.font.size = Pt(9.5)
        r.font.bold = True
        r.font.color.rgb = RGBColor(255, 255, 255)

    diff_data = [
        ("취약지 분석", "연 1회 정적 통계 책자 발행 (수개월 시차 발생)", "전국 250개 시군구 35:65 양방향 GIS 실시간 동적 관제"),
        ("병원 진단", "경영·의료지표 수작업 엑셀 취합 및 사후 분석", "41개 거점공공병원 6대 영역 AI 실시간 종합점수 및 원인분석"),
        ("법정 계획서", "345쪽 지침서 대조, 3주 이상 수기 HWP 작성", "복지부 공인 12대 항목 법정 사업계획서(HWPX) 10초 원클릭 자동 생성"),
        ("공시 사전검증", "알리미 공시 후 오류 지적 시 소명서 수기 작성", "14대 회계산출식 즉시 검증, PII 비식별화, 소명서 자동 작성"),
        ("대국민 서비스", "단순 병원 주소 목록 검색 (실시간 잔여 병상 부재)", "E-Gen 실시간 병상 연계, 최단거리 정렬, AI 의료동행 비서 탑재"),
    ]

    for row_idx, (cat, as_is, to_be) in enumerate(diff_data, start=1):
        row = tbl_diff.rows[row_idx]
        bg_col = "F8FAFC" if row_idx % 2 == 1 else "FFFFFF"
        for col_idx, text in enumerate([cat, as_is, to_be]):
            c = row.cells[col_idx]
            c.width = diff_widths[col_idx]
            set_cell_background(c, bg_col)
            set_cell_margins(c, 80, 80, 100, 100)
            p = c.paragraphs[0]
            if col_idx == 0:
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            r = p.add_run(text)
            r.font.name = "맑은 고딕"
            r.font.size = Pt(9)
            if col_idx == 2:
                r.font.bold = True
                r.font.color.rgb = RGBColor(30, 64, 175)
            else:
                r.font.color.rgb = RGBColor(51, 65, 85)

    set_table_borders(tbl_diff, color="CBD5E1", sz="4")
    doc.add_paragraph().paragraph_format.space_after = Pt(6)

    add_section_heading("1.3 3대 맞춤 사용자 역할(Role) 체계")
    p = doc.add_paragraph()
    p.add_run("본 플랫폼은 시스템 접속 시 사용자의 직무와 관심사에 따라 화면이 최적화되는 「3대 대상자별 맞춤 권한 체계」를 지원합니다.")

    # 3대 역할 카드 표
    tbl_roles = doc.add_table(rows=4, cols=3)
    tbl_roles.alignment = WD_TABLE_ALIGNMENT.CENTER
    role_widths = [Inches(1.8), Inches(2.2), Inches(2.5)]
    r_headers = ["사용자 역할", "접근 권한 및 특성", "제공 핵심 메뉴 및 기능"]
    for i, h in enumerate(r_headers):
        c = tbl_roles.cell(0, i)
        c.width = role_widths[i]
        set_cell_background(c, "1E3A8A")
        set_cell_margins(c, 100, 100, 120, 120)
        p = c.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r = p.add_run(h)
        r.font.name = "맑은 고딕"
        r.font.size = Pt(9.5)
        r.font.bold = True
        r.font.color.rgb = RGBColor(255, 255, 255)

    roles_info = [
        ("👨‍👩‍👧 국민 (일반시민·환자)", "• 별도 로그인 불필요\n• 모바일/PC 반응형 최적화\n• 위치정보(GPS) 동의 시 자동 최근접", "• 내 주변 응급실/소아과/분만병원 찾기\n• E-Gen 실시간 잔여 병상 확인\n• 국민안심 AI 증상 동행상담 비서"),
        ("🏥 의료기관 담당자\n(전국 41개 공공병원)", "• 공공병원 실무자 권한\n• 원내 자원 및 진료실적 분석\n• 법정 보고서 작성 권한", "• AI 병원 종합진단 & 5종 진단보고서\n• 시군구 환자 이용 유출입(OD) 분석\n• 12대 항목 법정 사업계획서(HWPX)\n• 신포괄 정책가산 계산기 (1.0%)\n• 71개 CP 라이브러리 및 ROI 분석"),
        ("🏛️ NMC 업무 담당자\n(중앙·시도 지원단)", "• 중앙 총괄 및 감독관 권한\n• 250개 시군구 거시 관제\n• 경영평가 및 공시 사전검증", "• 전국 250개 시군구 35:65 GIS 취약도\n• 35개 지방의료원 경영위기 조기경보\n• 알리미 공시 14대 산출식 사전검증\n• 시도·부처 시행계획 AI 100점 평가\n• Cloud vs On-Premise 듀얼 AI 스튜디오"),
    ]

    for row_idx, (r_name, r_desc, r_feat) in enumerate(roles_info, start=1):
        row = tbl_roles.rows[row_idx]
        bg = "F8FAFC" if row_idx % 2 == 1 else "FFFFFF"
        for col_idx, text in enumerate([r_name, r_desc, r_feat]):
            c = row.cells[col_idx]
            c.width = role_widths[col_idx]
            set_cell_background(c, bg)
            set_cell_margins(c, 80, 80, 100, 100)
            p = c.paragraphs[0]
            r = p.add_run(text)
            r.font.name = "맑은 고딕"
            r.font.size = Pt(9)
            if col_idx == 0:
                r.font.bold = True
            r.font.color.rgb = RGBColor(30, 41, 59)

    set_table_borders(tbl_roles, color="CBD5E1", sz="4")
    doc.add_paragraph().paragraph_format.space_after = Pt(6)

    add_section_heading("1.4 권장 운영 환경 및 통합 화면 레이아웃 안내")
    p = doc.add_paragraph()
    p.add_run(
        "플랫폼은 크로스 브라우징 및 반응형 웹 기술을 적용하여 PC 데스크톱, 태블릿, 모바일 스마트폰에서 모두 원활하게 구동됩니다.\n"
        "• 권장 브라우저: Google Chrome, Microsoft Edge, Safari, Whale 최신 버전 (Internet Explorer 미지원)\n"
        "• 권장 해상도: 데스크톱 1920×1080 (FHD) 이상 최적화, 모바일 375px 이상 완벽 지원\n"
        "• 전체 화면 구성: 최상단 [글로벌 공공 헤더] + 좌측 [3대 대상자별 접이식 사이드바] + 중앙 [메인 대시보드 워크스페이스]로 구성되어 "
        "사용자가 어떤 메뉴로 이동하더라도 직관적으로 상호 연계됩니다."
    )

    doc.add_page_break()

    # ==============================================================
    # [제2장. [국민] 안심의료 서비스 이용 안내]
    # ==============================================================
    add_chapter_heading("제2장. [국민] 안심의료 서비스 이용 안내")

    add_section_heading("2.1 내 위치 기반 가장 가까운 공공의료기관 검색")
    p = doc.add_paragraph()
    p.add_run(
        "국민안심 서비스는 응급환자, 야간 소아환자, 임산부 등 긴급한 치료가 필요한 시민들이 현재 위치에서 가장 신속하게 "
        "진료받을 수 있는 공공 및 민간 지정 필수의료기관을 안내합니다.\n\n"
        "1. 접속 방법: 상단 글로벌 헤더의 [👨‍👩‍👧 국민] 버튼 또는 좌측 사이드바의 [국민안심 서비스 홈]을 클릭합니다.\n"
        "2. 위치 자동 감지: 브라우저의 '위치 정보 접근'을 허용하면 GPS 기반으로 현재 계신 시군구 좌표를 자동 인식하여 직선거리순으로 의료기관이 정렬됩니다.\n"
        "3. 위치 수동 재검색: 우측 상단의 [내 위치 재검색] 버튼을 누르거나, 검색창에 찾고자 하는 지역명(예: '종로구', '영월군') 또는 병원명을 직접 입력하여 조회할 수 있습니다."
    )

    add_section_heading("2.2 국립중앙의료원 E-Gen 실시간 병상 현황 연계 안내")
    p = doc.add_paragraph()
    p.add_run(
        "본 서비스의 가장 큰 특징은 중앙응급의료센터 E-Gen OpenAPI와 직접 연동되어 병상 현황을 실시간(5분 단위 자동 갱신)으로 제공한다는 점입니다."
    )

    tbl_egen = doc.add_table(rows=5, cols=3)
    tbl_egen.alignment = WD_TABLE_ALIGNMENT.CENTER
    egen_widths = [Inches(1.5), Inches(2.2), Inches(2.8)]
    for i, h in enumerate(["병상 구분", "연계 항목 및 표시 내용", "환자 및 보호자 행동 요령"]):
        c = tbl_egen.cell(0, i)
        c.width = egen_widths[i]
        set_cell_background(c, "1E3A8A")
        set_cell_margins(c, 100, 100, 120, 120)
        p = c.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r = p.add_run(h)
        r.font.name = "맑은 고딕"
        r.font.size = Pt(9.5)
        r.font.bold = True
        r.font.color.rgb = RGBColor(255, 255, 255)

    egen_rows = [
        ("🚨 일반 응급실", "실시간 가용병상수 / 총 응급병상수\n포화도: 여유(5+), 보통(2~4), 혼잡(1), 포화(0)", "잔여 병상이 1개 이상인 경우 즉시 방문 가능\n포화 상태 시 인근 타 공공병원 우선 검토"),
        ("👶 소아 응급실", "소아전용 응급실 잔여 병상 및 소아과 전문의 진료 여부", "소아 경증 환자는 '달빛어린이병원' 우선 이용 권장"),
        ("🛏️ 성인·소아 중환자실 (ICU)", "성인 중환자실(ICU), 신생아 중환자실(NICU) 가용석", "중증·응급 전원 시 119 구급대 및 원내 전원상황실 공유"),
        ("⚙️ 특수 의료장비 가동", "CT, MRI, 인공호흡기, 인큐베이터 가동 여부(ON/OFF)", "뇌출혈, 다발성 외상 등 정밀검사 필요 시 장비 정상가동 확인 필수"),
    ]
    for row_idx, (b_type, b_info, b_act) in enumerate(egen_rows, start=1):
        row = tbl_egen.rows[row_idx]
        bg = "F8FAFC" if row_idx % 2 == 1 else "FFFFFF"
        for col_idx, text in enumerate([b_type, b_info, b_act]):
            c = row.cells[col_idx]
            c.width = egen_widths[col_idx]
            set_cell_background(c, bg)
            set_cell_margins(c, 80, 80, 100, 100)
            p = c.paragraphs[0]
            r = p.add_run(text)
            r.font.name = "맑은 고딕"
            r.font.size = Pt(9)
            if col_idx == 0:
                r.font.bold = True
            r.font.color.rgb = RGBColor(30, 41, 59)

    set_table_borders(tbl_egen, color="CBD5E1", sz="4")
    doc.add_paragraph().paragraph_format.space_after = Pt(6)

    add_section_heading("2.3 5대 특화 진료기관(응급·소아·분만·야간약국·입원) 찾기")
    p = doc.add_paragraph()
    p.add_run(
        "상단 필터 버튼을 한 번만 클릭하면 진료 분야별 전용 의료기관을 즉시 필터링하여 지도와 목록에 표시합니다.\n"
        "• [전체]: 관내 모든 공공병원 및 지정 민간의료기관 214개소 전체 표출\n"
        "• [🚨 응급실]: 권역응급의료센터, 지역응급의료센터, 지역응급의료기관 등 24시간 응급의료시설을 갖춘 기관만 선별\n"
        "• [👶 소아청소년과]: 주간 외래 및 야간·휴일 소아 진료를 수행하는 전국 114개소 달빛어린이병원 및 소아전문병원 선별\n"
        "• [🤰 분만산부인과]: 심평원 청구 실적이 검증된 상시 분만실 및 고위험 산모 집중치료실(MFICU) 운영 병원 선별\n"
        "• [🌙 야간/휴일]: 평일 야간 및 주말·공휴일에 진료하는 당번 의료기관 및 공공심야약국 연계 안내\n"
        "• [🛏️ 일반/격리입원]: 감염병 안심 격리음압병상 및 일반 입원실 잔여 현황 확인"
    )

    add_section_heading("2.4 국민안심 AI 의료 동행상담 비서(챗봇) 활용")
    p = doc.add_paragraph()
    p.add_run(
        "화면 우측에 상시 배치된 [국민안심 AI 질의응답 패널]은 일반 시민이 자연어로 질문하더라도, "
        "사용자의 현재 위치와 증상의 위급도를 판단하여 가장 적절한 병원과 진료과를 맞춤형으로 추천합니다."
    )

    add_callout_box(
        doc,
        "국민안심 AI 비서 추천 질문 예시",
        [
            "Q: \"지금 아이가 열이 39도까지 나는데 근처에 갈 수 있는 야간 소아과가 어디야?\"",
            " ➔ AI 답변: 현재 위치 기준 가장 가까운 '달빛어린이병원' 2곳과 진료 마감시간, 진료 중인 의사 현황 안내",
            "Q: \"가장 가까운 24시간 응급실과 지금 남은 병상 알려줘\"",
            " ➔ AI 답변: 반경 10km 이내 E-Gen 응급실 가용병상(성인/소아/음압) 실시간 수치 및 CT/MRI 가동 상태 직접 브리핑",
            "Q: \"임산부인데 갑자기 배가 뭉치고 아파. 분만실 바로 갈 수 있는 곳 있어?\"",
            " ➔ AI 답변: 고위험 임산부 분만 인프라를 갖춘 인근 공공병원 분만실 직통 전화 및 즉시 길찾기 링크 제공",
        ],
        box_type="info"
    )

    add_section_heading("2.5 모바일 3단계 바텀시트 목록 확인 및 즉시 길찾기·전화연결")
    p = doc.add_paragraph()
    p.add_run(
        "모바일 기기 및 좁은 화면에서도 지도와 병원 목록을 한눈에 확인할 수 있도록 '3단계 인터랙티브 바텀시트(Bottom Sheet)'가 적용되어 있습니다.\n\n"
        "1. [최소화 상태 (min)]: 하단에 컴팩트한 요약 띠(높이 48px)로 고정되어 지도를 넓게 볼 수 있습니다.\n"
        "2. [하프 뷰 상태 (half)]: 목록 핸들을 위로 끌어올리거나 '목록 펼치기'를 클릭하면 화면의 36% 높이로 병원 카드가 올라옵니다.\n"
        "3. [전체 화면 상태 (full)]: 목록을 더 넓게 보고 싶을 때 '전체 보기'를 누르면 화면 85%로 확장되어 최대 90개소의 병원 상세 스펙을 한 줄에 3개씩(3열 그리드) 시원하게 탐색할 수 있습니다.\n\n"
        "• [전화 걸기]: 터치 한 번으로 병원 대표번호 또는 응급실 직통 전화(tel:)로 즉시 연결됩니다.\n"
        "• [길찾기]: 카카오맵 내비게이션(Web/App)과 자동 연동되어 현재 위치에서 병원 응급실 입구까지의 실시간 최단 경로를 안내받을 수 있습니다."
    )

    doc.add_page_break()

    # ==============================================================
    # [제3장. [의료기관 담당자] 공공병원 AI 종합진단 및 자원관리]
    # ==============================================================
    add_chapter_heading("제3장. [의료기관 담당자] 공공병원 AI 종합진단 및 자원관리")

    add_section_heading("3.1 41개 지역거점공공병원 AI 종합점수 진단 및 원인분석")
    p = doc.add_paragraph()
    p.add_run(
        "전국 35개 지방의료원 및 6개 적십자병원의 실무 담당자는 본 워크스페이스를 통해 "
        "자 기관의 경영 건전성, 필수의료 제공 역량, 의료 질 관리 수준을 AI로 정밀 진단받을 수 있습니다.\n\n"
        "1. 대상 기관 선택: 화면 상단 드롭다운에서 41개 거점공공병원 중 자 기관(예: 원주의료원, 군산의료원, 서산의료원 등)을 선택합니다.\n"
        "2. 6대 핵심 진단 영역: "
    )

    diag_areas = [
        ("① 필수의료 제공도", "응급의료기관 평가등급, 분만실·인공신장실 운영, 소아 야간진료 실적"),
        ("② 경영 및 재무 건전성", "의업수지비율, 부채비율, 인건비 비율, 병상당 의업수익"),
        ("③ 의료 질 및 환자안전", "적정성 평가 1등급 비율, 의료관련감염 발생률, 환자안전 전담인력 확보"),
        ("④ 공공보건의료 협력체계", "책임의료기관 전담조직 운영, 퇴원환자 지역사회 연계율, 필수보건의료 협의체 운영"),
        ("⑤ 의료인력 충원율", "전문의 정원 대비 현원율, 간호간병통합서비스 병상 비율, 의사 1인당 일평균 입원환자수"),
        ("⑥ 지자체 및 정부 지원 연계", "기능보강사업 집행률, 경상운영비 지원액, 신포괄수가제 정책가산 달성율"),
    ]
    for d_title, d_desc in diag_areas:
        p_d = doc.add_paragraph()
        p_d.paragraph_format.left_indent = Inches(0.2)
        p_d.paragraph_format.space_before = Pt(1)
        p_d.paragraph_format.space_after = Pt(2)
        r_dt = p_d.add_run(f"• {d_title}: ")
        r_dt.font.name = "맑은 고딕"
        r_dt.font.bold = True
        r_dt.font.color.rgb = RGBColor(30, 64, 175)
        r_dd = p_d.add_run(d_desc)
        r_dd.font.name = "맑은 고딕"
        r_dd.font.size = Pt(9.5)

    p_reason = doc.add_paragraph()
    p_reason.paragraph_format.space_before = Pt(4)
    p_reason.add_run(
        "3. AI 원인분석 리포트: 총점뿐만 아니라, 취약 지표가 발생한 근본 원인(예: '간호사 구인난으로 인한 병상 가동률 12%p 저하', "
        "'코로나19 전담병원 해제 후 일반환자 회복 지연')을 AI가 정량 데이터와 결합하여 3줄 요약 진단으로 제시합니다."
    )

    add_section_heading("3.2 NMC 공식 의료기관 프로파일 5종 진단보고서(HWP) 자동 작성")
    p = doc.add_paragraph()
    p.add_run(
        "국립중앙의료원(NMC)에 정기적으로 제출하거나 지자체 예산 협의 시 활용되는 「공식 5종 진단보고서」를 "
        "클릭 한 번으로 표준 서식에 맞춰 자동 생성하고 한글(.hwp/.hwpx) 파일로 즉시 다운로드할 수 있습니다."
    )

    # 5종 보고서 표
    tbl_rep5 = doc.add_table(rows=6, cols=3)
    tbl_rep5.alignment = WD_TABLE_ALIGNMENT.CENTER
    rep_widths = [Inches(1.8), Inches(2.2), Inches(2.5)]
    for i, h in enumerate(["보고서 명칭", "핵심 수록 내용", "주요 활용처"]):
        c = tbl_rep5.cell(0, i)
        c.width = rep_widths[i]
        set_cell_background(c, "1E3A8A")
        set_cell_margins(c, 100, 100, 120, 120)
        p = c.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r = p.add_run(h)
        r.font.name = "맑은 고딕"
        r.font.size = Pt(9.5)
        r.font.bold = True
        r.font.color.rgb = RGBColor(255, 255, 255)

    rep5_data = [
        ("1. 의료기관 개요 보고서", "설립근거, 연혁, 병상 허가현황, 진료과목, 의료인력 총괄", "지자체 지도점검 및 기관 현황 파악"),
        ("2. 재무 및 경영진단서", "손익계산서 3개년 추이, 부채상환능력, 의업수지비율 분석", "기재부·의회 예산심의 및 차입금 승인 신청"),
        ("3. 필수의료 제공실적 보고서", "응급·중증·소아·분만 진료건수, 지역 환자 점유율", "책임의료기관 사업실적 평가 제출"),
        ("4. 의료인력 수급 분석서", "직종별 정·현원 대조, 이직률 추이, 구인난 지수", "지자체 인건비 특별지원 건의서 첨부"),
        ("5. 경영개선 종합로드맵", "단기·중장기 수지개선 목표, 병상가동률 정상화 방안", "NMC 공공병원 경영혁신 컨설팅 제출"),
    ]
    for row_idx, (r_name, r_cont, r_use) in enumerate(rep5_data, start=1):
        row = tbl_rep5.rows[row_idx]
        bg = "F8FAFC" if row_idx % 2 == 1 else "FFFFFF"
        for col_idx, text in enumerate([r_name, r_cont, r_use]):
            c = row.cells[col_idx]
            c.width = rep_widths[col_idx]
            set_cell_background(c, bg)
            set_cell_margins(c, 80, 80, 100, 100)
            p = c.paragraphs[0]
            r = p.add_run(text)
            r.font.name = "맑은 고딕"
            r.font.size = Pt(9)
            if col_idx == 0:
                r.font.bold = True
            r.font.color.rgb = RGBColor(30, 41, 59)

    set_table_borders(tbl_rep5, color="CBD5E1", sz="4")
    doc.add_paragraph().paragraph_format.space_after = Pt(6)

    add_section_heading("3.3 시군구 및 중진료권 환자 이용 유출입(OD) 분석")
    p = doc.add_paragraph()
    p.add_run(
        "우리 병원이 위치한 시군구와 중진료권 환자들이 어느 지역, 어느 상급병원으로 유출되고 있는지 "
        "환자 유출입(Origin-Destination) 빅데이터를 통해 정밀하게 파악할 수 있습니다.\n\n"
        "• 관내 이용률(RI, Relevance Index): 해당 지역 거주 환자가 관내 공공병원을 이용한 비율\n"
        "• 자체 충족률(CI, Commitment Index): 해당 공공병원을 방문한 전체 환자 중 관내 거주민 비율\n"
        "• 유출 순위 Top 5 분석: 암, 심뇌혈관질환, 고난도 수술 등 질환별로 서울·수도권 및 인근 3차 대형병원으로 유출되는 건수 및 점유율 확인\n"
        "• 실무 활용: 유출 환자 비중이 높은 다빈도 질환(예: 인공관절 수술, 백내장, 척추질환)을 파악하여 신규 진료과목 개설 및 우수 의료진 영입 근거자료로 활용"
    )

    add_section_heading("3.4 AI 정책기획 & 2030 미래의료수요 추계 시뮬레이션")
    p = doc.add_paragraph()
    p.add_run(
        "통계청 장래인구추계 및 국민건강보험공단 진료비 빅데이터를 학습한 AI 엔진을 통해, "
        "2030년까지 해당 진료권의 고령화율 변화와 그에 따른 필수의료 수요 변화를 과학적으로 예측합니다.\n\n"
        "1. 유사 지자체 자동 벤치마킹: 인구 규모, 재정자립도, 노인인구 비율이 유사한 타 지자체 공공병원의 성공 사례를 자동 매칭하여 벤치마킹 지표를 도출합니다.\n"
        "2. 2030 미래 의료수요 추계: 급성기 병상 과잉 여부와 반대로 만성질환·재활·호스피스·혈액투석 등 향후 폭증할 진료 기능을 수치로 제시합니다.\n"
        "3. AI 정책 대안 3대 Option 비교: \n"
        "   - [Option A. 심뇌혈관·응급 중증진료 기능 강화형]\n"
        "   - [Option B. 아동·모자보건 및 분만 특화 안심의료형]\n"
        "   - [Option C. 고령자 복합만성질환 및 재활·돌봄 통합형]\n"
        "   각 대안별 예상 투자비용(CAPEX), 연간 운영수지 개선효과, 지자체 부담금을 표로 비교 검토할 수 있습니다."
    )

    add_section_heading("3.5 보건복지부 12대 항목 법정 사업계획서(HWPX) 원클릭 발급")
    p = doc.add_paragraph()
    p.add_run(
        "매년 거점공공병원 기능보강사업 및 국고보조금 공모에 신청하기 위해 작성하던 「복지부 공인 12대 법정 사업계획서」를 "
        "시스템 내 입력된 진단 데이터와 AI 추론을 결합하여 표준 HWPX 문서로 즉시 생성합니다."
    )

    add_callout_box(
        doc,
        "복지부 법정 12대 표준 목차 자동 완결",
        [
            "1. 사업 개요 (사업명, 추진배경, 목표, 소요예산 총괄)",
            "2. 의료기관 현황 및 역량 분석 (병상, 인력, 장비, 진료실적)",
            "3. 지역 의료환경 및 필수의료 취약도 분석 (환자 유출입 수지, 골든타임 취약지)",
            "4. 세부 사업추진 목표 및 단계별 추진전략 (1차년도~3차년도 로드맵)",
            "5. 시설 확충 및 리모델링 세부 계획 (도면 기준 면적, 공간 배치안)",
            "6. 첨단 의료장비 도입 및 운용 계획 (도입 타당성, 가동률 목표)",
            "7. 필수 의료인력 확보 및 교육훈련 계획 (의사·간호사 정원 확보 방안)",
            "8. 지역사회 공공보건의료 협력 및 연계망 구축 계획 (퇴원돌봄, 전원체계)",
            "9. 총사업비 산출 내역 및 연차별 재원조달 방안 (국비:지방비:자부담 매칭)",
            "10. 사업추진 관리체계 및 리스크 관리 방안 (공정률 관리, 민원 대응)",
            "11. 기대효과 및 수혜 대상자 편익 분석 (환자 사망률 감소, 원정진료비 절감)",
            "12. 성과관리 지표 및 사후 모니터링 계획 (핵심성과지표 KPI 5종)",
        ],
        box_type="law"
    )

    add_section_heading("3.6 신포괄 정책가산 계산기 (CP 운영 가산율 1.0% 및 재정효과)")
    p = doc.add_paragraph()
    p.add_run(
        "신포괄수가제에 참여 중인 공공병원의 실질 수익 증대를 위해 마련된 정책가산 시뮬레이터입니다.\n\n"
        "• 표준진료지침(CP) 적용 환자 비율, 중증도 보정률, 의무기록 완성도를 실시간 대입하여 예상 가산율(최대 1.0%~1.5%)을 산출합니다.\n"
        "• 재정 기여도 산출식: [연간 신포괄 진료비 총액] × [CP 가산율(예: 1.0%)] = [순수 추가 수익 (연간 수억 원 규모)]\n"
        "• 원내 경영진 보고용 시뮬레이션 브리프가 자동 생성되어 진료과별 CP 확대 목표 수립에 직접 활용할 수 있습니다."
    )

    add_section_heading("3.7 71개 NMC 공인 표준진료지침(CP) 라이브러리 및 변이분석(ROI)")
    p = doc.add_paragraph()
    p.add_run(
        "국립중앙의료원이 검증한 71개 다빈도 질환별 표준임상진료지침(Clinical Pathway) 원문을 검색하고 "
        "원내 처방전산(EMR/OCS) 적용 가이드를 제공합니다.\n\n"
        "• 5대 주요 진료분야 71개 CP 탑재: 슬관절치환술, 탈장수술, 맹장염(충수절제술), 정상분만, 뇌졸중 초기대응 등\n"
        "• CP 변이(Variance) 분석: 계획된 표준재원일수(LOS)를 초과하여 발생한 진료비 변이와 합병증 요인을 추적 분석\n"
        "• ROI(투자대비효과) 분석기: CP 도입 시 단축되는 평균 재원일수와 그로 인해 발생하는 병상 회전율 향상 수익을 자동 계산"
    )

    add_section_heading("3.8 퇴원환자 지역사회 돌봄 매칭 및 보건복지 연계의뢰서")
    p = doc.add_paragraph()
    p.add_run(
        "공공보건의료 협력체계 구축사업(책임의료기관 전담사업)의 핵심인 '퇴원환자 지역사회 연계'를 지원합니다.\n\n"
        "1. 4단계 퇴원지원 평가도구: 입원 시점부터 환자의 ADL(일상생활수행능력), 인지기능, 주거환경을 4단계로 평가합니다.\n"
        "2. 지역 복지자원 자동 매칭: 퇴원 후 환자의 거주지 보건소, 방문건강관리센터, 노인맞춤돌봄센터를 1:1 매칭합니다.\n"
        "3. 표준 보건복지 연계의뢰서 발급: 환자 동의서 및 복지부 표준 서식의 연계의뢰서를 HWP 공문서로 원클릭 출력합니다."
    )

    doc.add_page_break()

    # ==============================================================
    # [제4장. [NMC 업무 담당자] 전국 헬스맵 관제 및 경영·공시 검증]
    # ==============================================================
    add_chapter_heading("제4장. [NMC 업무 담당자] 전국 헬스맵 관제 및 경영·공시 검증")

    add_section_heading("4.1 전국 250개 시군구 35:65 GIS 거시 취약도 맵 관제")
    p = doc.add_paragraph()
    p.add_run(
        "국립중앙의료원(NMC) 중앙응급의료센터 및 공공보건의료지원단 정책관은 전국 250개 시군구의 "
        "필수의료 인프라 수준을 한눈에 조망할 수 있는 혁신적인 35:65 양방향 진단지도를 활용합니다.\n\n"
        "• 좌측 35% 패널: 전국 시군구별 취약도 랭킹, 중점지표 필터, 위험 등급(관심-주의-경계-심각) 목록\n"
        "• 우측 65% GIS 맵: 7대 필수의료 레이어(응급, 분만, 소아, 중증외상, 심뇌혈관, 감염병, 공공병원 분포) 시각화\n"
        "• 골든타임 사각지대 판정: 30분 이내 지역응급의료센터 도달 불가 인구 비율 및 60분 이내 분만실 도달 불가 면적을 정밀 계산하여 '특별 취약 시군구'를 자동으로 적색 경고합니다."
    )

    add_section_heading("4.2 35개 지방의료원 경영위기 4단계 조기경보 시스템")
    p = doc.add_paragraph()
    p.add_run(
        "지방의료원의 재정 건전성을 선제적으로 관리하기 위해 4단계(정상 ➔ 주의 ➔ 경계 ➔ 심각) 경영위기 조기경보 체계를 가동합니다."
    )

    tbl_crisis = doc.add_table(rows=5, cols=4)
    tbl_crisis.alignment = WD_TABLE_ALIGNMENT.CENTER
    cr_widths = [Inches(1.2), Inches(1.5), Inches(1.8), Inches(2.0)]
    for i, h in enumerate(["위기 등급", "부채비율 기준", "의업수지비율", "NMC 중앙지원단 대응 조치"]):
        c = tbl_crisis.cell(0, i)
        c.width = cr_widths[i]
        set_cell_background(c, "1E3A8A")
        set_cell_margins(c, 100, 100, 120, 120)
        p = c.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r = p.add_run(h)
        r.font.name = "맑은 고딕"
        r.font.size = Pt(9.5)
        r.font.bold = True
        r.font.color.rgb = RGBColor(255, 255, 255)

    crisis_data = [
        ("🟢 정상 (Normal)", "100% 미만", "100% 이상 (흑자)", "정기 모니터링 및 우수사례 타 병원 전파"),
        ("🟡 주의 (Caution)", "100% ~ 200%", "90% ~ 99% (경미한 적자)", "자체 개선권고 및 분기별 수지 추이 집중 점검"),
        ("🟠 경계 (Warning)", "200% ~ 400%", "80% ~ 89% (지속 적자)", "NMC 경영혁신 현장 컨설팅단 파견 및 지자체 지원 요청"),
        ("🔴 심각 (Critical)", "400% 초과 또는 자본잠식", "80% 미만 (심각한 수지악화)", "보건복지부 경영정상화 특별재정지원 및 긴급 경영진단 실시"),
    ]
    for row_idx, (c_lv, c_debt, c_op, c_act) in enumerate(crisis_data, start=1):
        row = tbl_crisis.rows[row_idx]
        bg = "F8FAFC" if row_idx % 2 == 1 else "FFFFFF"
        for col_idx, text in enumerate([c_lv, c_debt, c_op, c_act]):
            c = row.cells[col_idx]
            c.width = cr_widths[col_idx]
            set_cell_background(c, bg)
            set_cell_margins(c, 80, 80, 100, 100)
            p = c.paragraphs[0]
            r = p.add_run(text)
            r.font.name = "맑은 고딕"
            r.font.size = Pt(9)
            if col_idx == 0:
                r.font.bold = True
            r.font.color.rgb = RGBColor(30, 41, 59)

    set_table_borders(tbl_crisis, color="CBD5E1", sz="4")
    doc.add_paragraph().paragraph_format.space_after = Pt(6)

    add_section_heading("4.3 지역거점공공병원 알리미 공시 14대 회계산출식 사전검증")
    p = doc.add_paragraph()
    p.add_run(
        "매년 거점공공병원 알리미 시스템(공시 사이트)에 공시되는 데이터의 대외적 신뢰도를 확보하기 위해, "
        "공시 등록 전 14대 법정 회계산출식을 자동 검증하고 개인정보(PII) 유출을 차단하는 시스템입니다.\n\n"
        "1. 14대 회계·재무 산출식 완전 일치 검증: 부채비율, 유동비율, 인건비율, 병상당 의료수익 등 법정 공식을 1원 단위까지 정밀 교차 검증합니다.\n"
        "2. PII(개인식별정보) 자동 비식별화: 업로드된 엑셀이나 첨부문서 내 주민등록번호, 환자 등록번호, 휴대전화번호를 정규식 엔진으로 전수 탐지하여 마스킹(***) 처리합니다.\n"
        "3. 공시 불일치 소명서 자동 작성: 수치 오차가 발생한 경우, 담당자가 소명할 수 있는 정식 공문 양식의 '공시 검증 소명서'를 HWP로 즉시 생성합니다."
    )

    add_section_heading("4.4 시도·부처 공공보건의료 시행계획 및 추진실적 AI 100점 평가")
    p = doc.add_paragraph()
    p.add_run(
        "17개 광역시도 및 8개 중앙부처가 매년 수립하는 '공공보건의료 시행계획 및 추진실적' 보고서를 "
        "정부 공식 심사 지침에 따라 100점 만점으로 자동 채점하고 심사의견서를 작성합니다.\n\n"
        "• 6단계 정량·정성 평가 프레임워크: 목표 수립 타당성(20점) + 세부사업 충실성(30점) + 예산 집행률(20점) + 지역거버넌스 연계(15점) + 성과목표 달성도(15점)\n"
        "• 환각 없는 법령 RAG 기반 심사의견: 단순 AI 작성이 아닌, 법령 및 지침서 조항을 근거로 제시하는 '공식 심사의견서' 완결"
    )

    add_section_heading("4.5 전국 214개 공공병원 통합 데이터센터 실시간 관제")
    p = doc.add_paragraph()
    p.add_run(
        "국립병원, 특수법인병원, 지방의료원, 적십자병원, 보건의료원 등 전국 214개 모든 공공보건의료기관의 "
        "인력·병상·장비·재정 통계를 통합 조회하고 엑셀로 일괄 추출할 수 있습니다."
    )

    add_section_heading("4.6 듀얼 AI 스튜디오 (Cloud Gemini vs 온프레미스 sLLM & RAG 지침)")
    p = doc.add_paragraph()
    p.add_run(
        "의료 데이터의 보안 등급에 따라 클라우드 AI와 내부 폐쇄망 AI를 선택하여 분석할 수 있는 듀얼 AI 스튜디오를 지원합니다.\n\n"
        "• Cloud AI (Google Gemini Pro): 대규모 공공 통계, 지역 비교 및 복합 정책대안 도출 시 초고성능 추론 수행\n"
        "• Local sLLM (원내 온프레미스 폐쇄망 모델): 환자 민감정보가 포함된 비식별 데이터 및 원내 내부 지침 질의 시 외부 유출 0% 보장\n"
        "• 공공의료 지침 RAG: 1,000쪽 분량의 공공보건의료 법령, 신포괄수가제 지침, 책임의료기관 사업안내서를 임베딩하여 질문 시 정확한 조항과 쪽수를 함께 제시"
    )

    doc.add_page_break()

    # ==============================================================
    # [제5장. 공통 편의 기능 및 관리자 전용 도구]
    # ==============================================================
    add_chapter_heading("제5장. 공통 편의 기능 및 관리자 전용 도구")

    add_section_heading("5.1 글로벌 상단 툴바(다크모드, 역할 스위처, 전역 검색)")
    p = doc.add_paragraph()
    p.add_run(
        "화면 상단 글로벌 헤더에는 업무 편의성을 극대화하는 다양한 공통 도구가 탑재되어 있습니다.\n\n"
        "• 3대 역할 스위처: [👨‍👩‍👧 국민] [🏥 의료기관 담당자] [🏛️ NMC 업무 담당자]를 원클릭으로 전환하여 각 역할의 메인 화면으로 즉시 이동합니다.\n"
        "• 테마 토글 (다크모드/라이트모드): 주간 근무 시 선명한 라이트 모드, 야간 상황실 및 관제 모니터링 시 눈의 피로를 최소화하는 프리미엄 다크 모드를 지원합니다.\n"
        "• 전역 시군구 검색창: 전국 250개 시군구 명칭을 입력하면 지도와 분석 대상 지역이 실시간으로 해당 지자체로 즉각 이동합니다."
    )

    add_section_heading("5.2 NMC 표준 3종 엑셀 다운로드 및 원천 CSV 업로더")
    p = doc.add_paragraph()
    p.add_run(
        "헤더 우측 관리자 메뉴(⚙️)를 통해 통계청 및 정부 보고용 표준 데이터를 일괄 다운로드하거나 신규 데이터를 플랫폼에 반영할 수 있습니다.\n\n"
        "• [NMC 표준 3종 엑셀 다운로드]:\n"
        "   1) 전국 250개 시군구 필수의료 취약도 집계표 (GIS 좌표 및 취약지수 수록)\n"
        "   2) 전국 214개 공공병원 자원 총람 (병상, 의료인력, 특수장비 가동 현황)\n"
        "   3) 41개 거점공공병원 3개년 경영·의료질 알리미 공시 지표 마스터\n"
        "• [원천 CSV 데이터 업로더]: 최신 연도 결산서나 신규 병원 정보가 포함된 CSV/Excel 파일을 드래그 앤 드롭으로 업로드하면, 플랫폼 전체 지표가 즉시 자동 갱신됩니다."
    )

    add_section_heading("5.3 환각 제로 법령·원문 대조 신뢰 뷰 (Grounding Verifier)")
    p = doc.add_paragraph()
    p.add_run(
        "AI가 생성한 모든 진단보고서와 사업계획서 문장은 생성 즉시 원천 근거(보건의료기본법, 공공보건의료에 관한 법률, "
        "국립중앙의료원 지침서)와 1:1 대조 검증을 거칩니다.\n\n"
        "• '원문대조 신뢰뷰' 팝업을 열면 좌측에는 AI가 작성한 문장이, 우측에는 해당 문장의 근거가 된 정부 지침 원문 조항이 나란히 표시되어 환각(Hallucination) 위험을 원천 차단합니다."
    )

    add_section_heading("5.4 API 키 설정 및 시스템 보안 관리")
    p = doc.add_paragraph()
    p.add_run(
        "• Google Gemini API 키 설정: 고급 추론 및 장문 사업계획서 생성을 위한 Gemini API Key를 등록 및 암호화 보관합니다.\n"
        "• 공공데이터포털(data.go.kr) 인증키: E-Gen 실시간 병상 및 심평원 공공데이터 조회를 위한 OpenAPI 인증키를 관리합니다.\n"
        "• 관리자 인가 비밀번호: 감사 및 데이터 갱신 권한이 있는 사용자만 관리자 메뉴에 접근할 수 있도록 보안 로그인 모달이 보호합니다."
    )

    doc.add_page_break()

    # ==============================================================
    # [제6장. 자주 묻는 질문(FAQ) 및 장애 해결]
    # ==============================================================
    add_chapter_heading("제6장. 자주 묻는 질문(FAQ) 및 장애 해결")

    add_section_heading("6.1 계정 및 접속 관련 FAQ")
    faqs_1 = [
        ("Q1. 일반 국민은 회원가입이나 로그인이 필요한가요?",
         "A: 아닙니다. 국민안심 서비스(내 주변 병상 찾기, 달빛어린이병원 검색, AI 동행상담 비서)는 전 국민 누구나 로그인 없이 100% 무료로 즉시 이용하실 수 있습니다."),
        ("Q2. 병원 담당자인데 우리 병원 데이터를 수정하고 싶습니다.",
         "A: 헤더 우측의 관리자 메뉴(⚙️)에서 [원천 CSV 데이터 업로드] 기능을 통해 자 기관의 최신 지표를 반영하시거나, NMC 중앙응급의료센터 전산담당 부서로 데이터 갱신을 요청하시면 됩니다."),
    ]
    for q, a in faqs_1:
        p_q = doc.add_paragraph()
        p_q.paragraph_format.space_before = Pt(4)
        p_q.paragraph_format.space_after = Pt(2)
        r_q = p_q.add_run(q)
        r_q.font.name = "맑은 고딕"
        r_q.font.bold = True
        r_q.font.color.rgb = RGBColor(30, 58, 138)
        
        p_a = doc.add_paragraph()
        p_a.paragraph_format.space_before = Pt(1)
        p_a.paragraph_format.space_after = Pt(4)
        p_a.paragraph_format.left_indent = Inches(0.2)
        r_a = p_a.add_run(a)
        r_a.font.name = "맑은 고딕"
        r_a.font.size = Pt(9.5)
        r_a.font.color.rgb = RGBColor(51, 65, 85)

    add_section_heading("6.2 데이터 연계 및 수치 정합성 관련 FAQ")
    faqs_2 = [
        ("Q3. E-Gen 실시간 잔여 병상 수가 실제 병원 상황과 다를 수 있나요?",
         "A: E-Gen 데이터는 국립중앙의료원 중앙응급의료센터 OpenAPI를 통해 5분 단위로 수신됩니다. 긴급 수술이나 응급환자 집중으로 현장 상황이 급변할 수 있으므로, 방문 직전 화면의 [전화 걸기] 버튼을 통해 병원 응급실에 유선 확인하시는 것을 강력히 권장합니다."),
        ("Q4. 사업계획서에 들어가는 수치가 공문서로서 공신력을 갖나요?",
         "A: 네. 본 플랫폼에서 생성되는 모든 수치는 통계청 국가통계포털(KOSIS), 건강보험심사평가원(HIRA), 공공병원 알리미 공시 결산서 원본 데이터를 기반으로 연산되므로 정부 부처 공모 시 공식 제출자료로 신뢰할 수 있습니다."),
    ]
    for q, a in faqs_2:
        p_q = doc.add_paragraph()
        p_q.paragraph_format.space_before = Pt(4)
        p_q.paragraph_format.space_after = Pt(2)
        r_q = p_q.add_run(q)
        r_q.font.name = "맑은 고딕"
        r_q.font.bold = True
        r_q.font.color.rgb = RGBColor(30, 58, 138)
        
        p_a = doc.add_paragraph()
        p_a.paragraph_format.space_before = Pt(1)
        p_a.paragraph_format.space_after = Pt(4)
        p_a.paragraph_format.left_indent = Inches(0.2)
        r_a = p_a.add_run(a)
        r_a.font.name = "맑은 고딕"
        r_a.font.size = Pt(9.5)
        r_a.font.color.rgb = RGBColor(51, 65, 85)

    add_section_heading("6.3 보고서 다운로드 및 출력 관련 FAQ")
    faqs_3 = [
        ("Q5. 한글(HWP/HWPX) 파일이 열리지 않거나 깨지는 경우 어떻게 하나요?",
         "A: 본 플랫폼의 보고서 생성기는 한글과컴퓨터 공식 OWPML 표준 규격을 준수합니다. 한글 2014 이상 또는 한컴오피스 2020/2022/Web 한글에서 완벽히 호환되며, 뷰어가 없는 경우 화면 내 [리포트 이미지(PNG) 저장]을 활용하시면 고화질 캡처로 열람하실 수 있습니다."),
        ("Q6. 플랫폼 화면이 찌그러지거나 지도가 회색으로 보일 때 조치 방법은?",
         "A: 브라우저 캐시로 인해 구버전 스크립트가 남아있을 수 있습니다. 키보드의 Ctrl + F5 (강력 새로고침)을 누르시면 최신 v1.29.15 컴포넌트가 로드되면서 지도가 정상 표시됩니다."),
    ]
    for q, a in faqs_3:
        p_q = doc.add_paragraph()
        p_q.paragraph_format.space_before = Pt(4)
        p_q.paragraph_format.space_after = Pt(2)
        r_q = p_q.add_run(q)
        r_q.font.name = "맑은 고딕"
        r_q.font.bold = True
        r_q.font.color.rgb = RGBColor(30, 58, 138)
        
        p_a = doc.add_paragraph()
        p_a.paragraph_format.space_before = Pt(1)
        p_a.paragraph_format.space_after = Pt(4)
        p_a.paragraph_format.left_indent = Inches(0.2)
        r_a = p_a.add_run(a)
        r_a.font.name = "맑은 고딕"
        r_a.font.size = Pt(9.5)
        r_a.font.color.rgb = RGBColor(51, 65, 85)

    # 매뉴얼 끝 마무리 안내 박스
    doc.add_paragraph()
    add_callout_box(
        doc,
        "시스템 기술지원 및 유지보수 문의처",
        [
            "• 국립중앙의료원(NMC) 공공보건의료지원센터 / 중앙응급의료센터 정보관리팀",
            "• 공식 웹사이트: https://essential-care-map.vercel.app",
            "• 시스템 헬프데스크: 02-2260-7114 / nmc_support@nmc.or.kr",
            "• 운영 시간: 평일 09:00 ~ 18:00 (응급상황실 연계 장애 관제는 365일 24시간 가동)",
        ],
        box_type="tip"
    )

    # 파일 저장
    docs_dir = os.path.join(os.path.dirname(__file__), "..", "docs")
    os.makedirs(docs_dir, exist_ok=True)
    out_path_ko = os.path.join(docs_dir, "공공의료_의사결정_지원_플랫폼_사용자_매뉴얼_v1.29.docx")
    doc.save(out_path_ko)
    out_path_en = os.path.join(docs_dir, "Essential_Care_Map_User_Manual_v1.29.docx")
    doc.save(out_path_en)
    print(f"[Success] KO: {out_path_ko}")
    print(f"[Success] EN: {out_path_en}")
    return out_path_ko

if __name__ == "__main__":
    build_document()
