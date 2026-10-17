# -*- coding: utf-8 -*-
"""
공공의료 의사결정 지원 플랫폼 (Essential Care Map) 시스템 구성도 PPTX 생성 스크립트
표준 템플릿(assets/isp_template.pptx) 및 B5 와이드(10.833in x 7.500in) 규격 적용
신규: 한 장으로 전체를 조망하는 [원페이지 통합 시스템 구성도] 포함 총 6개 슬라이드
작성일: 2026년 10월
"""

import os
import sys
import pptx
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE
from pptx.oxml import parse_xml

# 템플릿 경로
TEMPLATE_PATH = r"C:\Users\KITC\.gemini\config\skills\public-healthcare-isp-pptx\assets\isp_template.pptx"

# 컬러 팔레트 정의
COLOR_PRIMARY_BLUE = RGBColor(0, 114, 186)     # #0072BA (핵심 블루)
COLOR_NAVY_DARK = RGBColor(30, 58, 138)        # #1E3A8A (네이비 헤더)
COLOR_NAVY_ACCENT = RGBColor(34, 79, 119)      # #224F77 (마스터 네이비)
COLOR_EMERALD = RGBColor(5, 150, 105)          # #059669 (그린 뱃지/데이터)
COLOR_PURPLE = RGBColor(124, 58, 237)          # #7C3AED (보라색 AI)
COLOR_AMBER = RGBColor(217, 119, 6)            # #D97706 (주의/경보)
COLOR_SLATE_BG = RGBColor(248, 250, 252)       # #F8FAFC (연회색 배경)
COLOR_CARD_BORDER = RGBColor(203, 213, 225)    # #CBD5E1 (카드 외곽선)
COLOR_WHITE = RGBColor(255, 255, 255)          # #FFFFFF
COLOR_BLACK = RGBColor(15, 23, 42)             # #0F172A (다크 텍스트)
COLOR_MUTED = RGBColor(100, 116, 139)          # #64748B (보조 텍스트)

FONT_MAJOR = "KoPub돋움체 Bold"
FONT_MINOR = "KoPub돋움체 Medium"
FONT_BACKUP = "맑은 고딕"

def set_font(run, text, font_name=FONT_MINOR, size_pt=10.0, bold=False, color_rgb=COLOR_BLACK):
    """한글/영문 폰트 및 ea 속성 설정"""
    run.text = text
    run.font.name = font_name
    run.font.size = Pt(size_pt)
    run.font.bold = bold
    run.font.color.rgb = color_rgb
    
    rPr = run._r.get_or_add_rPr()
    ea = rPr.find('{http://schemas.openxmlformats.org/drawingml/2006/main}ea')
    if ea is None:
        ea = parse_xml(f'<a:ea xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" typeface="{font_name}"/>')
        rPr.append(ea)
    else:
        ea.set('typeface', font_name)

def add_header_placeholders(slide, title, governing, category="공공의료 의사결정 지원 플랫폼", chapter="시스템 구성도"):
    """상단 플레이스홀더 텍스트 입력"""
    for ph in slide.placeholders:
        ph_type = ph.placeholder_format.type
        ph_name = ph.name

        # 슬라이드 제목
        if ph_type == 1:
            ph.text = title
            for p in ph.text_frame.paragraphs:
                for r in p.runs:
                    set_font(r, r.text, font_name=FONT_MAJOR, size_pt=15.0, bold=True, color_rgb=COLOR_NAVY_DARK)

        # 거버닝 메시지
        elif ph_type == 7 or "내용 개체 틀" in ph_name:
            ph.text = governing
            for p in ph.text_frame.paragraphs:
                for r in p.runs:
                    set_font(r, r.text, font_name=FONT_MAJOR, size_pt=11.0, bold=True, color_rgb=COLOR_NAVY_ACCENT)

        # 상단 좌측 카테고리
        elif ph.left < Inches(2.5) and ph.top < Inches(0.4):
            ph.text = category
            for p in ph.text_frame.paragraphs:
                for r in p.runs:
                    set_font(r, r.text, font_name=FONT_MAJOR, size_pt=10.5, bold=True, color_rgb=COLOR_PRIMARY_BLUE)

        # 상단 우측 챕터
        elif ph.left > Inches(7.0) and ph.top < Inches(0.4):
            ph.text = chapter
            for p in ph.text_frame.paragraphs:
                for r in p.runs:
                    set_font(r, r.text, font_name=FONT_MAJOR, size_pt=9.0, bold=True, color_rgb=COLOR_MUTED)

def draw_block(slide, left, top, width, height, title, items, fill_color=COLOR_WHITE, border_color=COLOR_CARD_BORDER, header_bg=COLOR_PRIMARY_BLUE, header_h=0.32, title_color=COLOR_WHITE, font_size=8.5):
    """표준 다이어그램 블록(헤더+본문) 생성"""
    # 1. 헤더 박스
    hdr = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, left, top, width, Inches(header_h))
    hdr.fill.solid()
    hdr.fill.fore_color.rgb = header_bg
    hdr.line.color.rgb = border_color
    hdr.line.width = Pt(0.5)
    
    tf_h = hdr.text_frame
    tf_h.vertical_anchor = MSO_ANCHOR.MIDDLE
    tf_h.word_wrap = True
    p_h = tf_h.paragraphs[0]
    p_h.alignment = PP_ALIGN.CENTER
    r_h = p_h.add_run()
    set_font(r_h, title, font_name=FONT_MAJOR, size_pt=9.5, bold=True, color_rgb=title_color)

    # 2. 본문 박스
    body_top = top + Inches(header_h)
    body_h = height - Inches(header_h)
    body = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, left, body_top, width, body_h)
    body.fill.solid()
    body.fill.fore_color.rgb = fill_color
    body.line.color.rgb = border_color
    body.line.width = Pt(0.5)

    tf_b = body.text_frame
    tf_b.word_wrap = True
    tf_b.margin_top = Inches(0.06)
    tf_b.margin_bottom = Inches(0.06)
    tf_b.margin_left = Inches(0.10)
    tf_b.margin_right = Inches(0.10)

    for idx, item in enumerate(items):
        p = tf_b.paragraphs[0] if idx == 0 else tf_b.add_paragraph()
        p.alignment = PP_ALIGN.LEFT
        p.space_after = Pt(1.5)
        r = p.add_run()
        set_font(r, item, font_name=FONT_MINOR, size_pt=font_size, bold=False, color_rgb=COLOR_BLACK)

    return hdr, body

def draw_simple_card(slide, left, top, width, height, title, subtitle="", fill_color=COLOR_WHITE, border_color=COLOR_CARD_BORDER, title_color=COLOR_NAVY_DARK, header_bg=None):
    """심플 카드 블록 생성"""
    card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
    card.fill.solid()
    card.fill.fore_color.rgb = fill_color
    card.line.color.rgb = border_color
    card.line.width = Pt(0.5)

    tf = card.text_frame
    tf.word_wrap = True
    tf.vertical_anchor = MSO_ANCHOR.MIDDLE
    tf.margin_top = Inches(0.04)
    tf.margin_bottom = Inches(0.04)
    tf.margin_left = Inches(0.08)
    tf.margin_right = Inches(0.08)

    p1 = tf.paragraphs[0]
    p1.alignment = PP_ALIGN.CENTER
    r1 = p1.add_run()
    set_font(r1, title, font_name=FONT_MAJOR, size_pt=9.0, bold=True, color_rgb=title_color)

    if subtitle:
        p2 = tf.add_paragraph()
        p2.alignment = PP_ALIGN.CENTER
        p2.space_before = Pt(2)
        r2 = p2.add_run()
        set_font(r2, subtitle, font_name=FONT_MINOR, size_pt=7.5, bold=False, color_rgb=COLOR_BLACK)

    return card

def main():
    prs = Presentation(TEMPLATE_PATH)
    
    # 기존 슬라이드 삭제
    for i in range(len(prs.slides) - 1, -1, -1):
        rId = prs.slides._sldIdLst[i].rId
        prs.part.drop_rel(rId)
        del prs.slides._sldIdLst[i]

    master = prs.slide_masters[0]
    layout_content = master.slide_layouts[1] # 거버닝 O, 타이틀 X
    layout_blank = master.slide_layouts[2]   # 거버닝 X, 타이틀 X

    # ==============================================================
    # [Slide 1. 표지 (Title Slide)]
    # ==============================================================
    slide1 = prs.slides.add_slide(layout_blank)
    
    # 다크 네이비 배경 박스
    bg = slide1.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.4), Inches(0.4), Inches(10.033), Inches(6.7))
    bg.fill.solid()
    bg.fill.fore_color.rgb = RGBColor(15, 23, 42) # #0F172A
    bg.line.color.rgb = COLOR_PRIMARY_BLUE
    bg.line.width = Pt(1.5)

    # 표지 뱃지
    badge = slide1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.0), Inches(4.5), Inches(0.4))
    badge.fill.solid()
    badge.fill.fore_color.rgb = RGBColor(30, 41, 59)
    badge.line.color.rgb = COLOR_PRIMARY_BLUE
    badge.line.width = Pt(1.0)
    tf_badge = badge.text_frame
    tf_badge.vertical_anchor = MSO_ANCHOR.MIDDLE
    p_b = tf_badge.paragraphs[0]
    p_b.alignment = PP_ALIGN.CENTER
    r_b = p_b.add_run()
    set_font(r_b, "국립중앙의료원(NMC) · 보건복지부 공공보건의료 DX 플랫폼", font_name=FONT_MAJOR, size_pt=9.5, bold=True, color_rgb=COLOR_PRIMARY_BLUE)

    # 메인 타이틀
    txBox = slide1.shapes.add_textbox(Inches(0.8), Inches(1.8), Inches(9.2), Inches(2.2))
    tf_title = txBox.text_frame
    tf_title.word_wrap = True
    
    p1 = tf_title.paragraphs[0]
    r1 = p1.add_run()
    set_font(r1, "공공의료 의사결정 지원 플랫폼\n시스템 구성도 (System Architecture)", font_name=FONT_MAJOR, size_pt=26.0, bold=True, color_rgb=COLOR_WHITE)

    p2 = tf_title.add_paragraph()
    p2.space_before = Pt(14)
    r2 = p2.add_run()
    set_font(r2, "Essential Care Map: 전국 250개 시군구 필수의료 모니터링 & 거점공공병원 AI 종합진단 플랫폼", font_name=FONT_MINOR, size_pt=12.0, bold=False, color_rgb=RGBColor(203, 213, 225))

    # 하단 정보 카드
    info_box = slide1.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(4.6), Inches(9.2), Inches(1.8))
    info_box.fill.solid()
    info_box.fill.fore_color.rgb = RGBColor(30, 41, 59)
    info_box.line.color.rgb = RGBColor(51, 65, 85)
    info_box.line.width = Pt(0.5)

    tf_info = info_box.text_frame
    tf_info.word_wrap = True
    tf_info.margin_left = Inches(0.3)
    tf_info.margin_top = Inches(0.2)

    specs = [
        "• 시스템 버전: v1.29.15 (최신 프로덕션 정식 빌드)",
        "• 주요 서비스: 대국민 안심의료 실시간 병상 연계 / 거점공공병원 AI 종합진단 / 법정 사업계획서(HWPX) 자동화",
        "• 핵심 아키텍처: 5-Tier Hybrid Cloud & On-Premise Dual AI Architecture (Next.js 16 + E-Gen OpenAPI + Gemini)",
        "• 주관 부처/기관: 보건복지부 공공보건의료정책과 · 국립중앙의료원(NMC) 중앙응급의료센터 / 공공보건의료지원센터"
    ]
    for idx, sp in enumerate(specs):
        p = tf_info.paragraphs[0] if idx == 0 else tf_info.add_paragraph()
        p.space_before = Pt(4)
        r = p.add_run()
        set_font(r, sp, font_name=FONT_MINOR, size_pt=9.5, bold=(idx==0), color_rgb=RGBColor(241, 245, 249))

    # ==============================================================
    # [Slide 2. ⭐ 한 장으로 전체를 조망하는 원페이지 통합 시스템 구성도]
    # ==============================================================
    slide2 = prs.slides.add_slide(layout_content)
    add_header_placeholders(
        slide2,
        title="[총괄] 원페이지 통합 시스템 구성도 (One-Page Total Architecture Map)",
        governing="사용자 채널(3대 역할) ➔ 5대 핵심 워크스페이스 ➔ Dual AI & RAG 엔진 ➔ 국가 데이터 파이프라인 ➔ 보안·인프라 및 공문서 출력을 유기적으로 연결한 종합 구성도",
        category="총괄 아키텍처",
        chapter="원페이지 통합 구성도"
    )

    # 1. 상단: 3대 사용자 인터페이스 채널 (top=1.46in, h=0.72in, total width=10.033in)
    draw_simple_card(slide2, Inches(0.4), Inches(1.46), Inches(3.18), Inches(0.72),
                     "👨‍👩‍👧 국민 (일반시민·환자)",
                     "내 주변 실시간 안심의료 검색 · 114개 달빛소아/약국\nE-Gen 병상 연동 · 3단계 바텀시트 · AI 비서 (로그인 불필요)",
                     fill_color=RGBColor(254, 242, 242), border_color=RGBColor(244, 63, 94), title_color=RGBColor(225, 29, 72))

    draw_simple_card(slide2, Inches(3.68), Inches(1.46), Inches(3.38), Inches(0.72),
                     "🏥 의료기관 담당자 (41개 거점공공병원)",
                     "AI 종합진단 · 6대 영역 원인분석 · NMC 5종 프로파일(HWP)\n복지부 12대 계획서(HWPX) · 신포괄 1.0% 정책가산 · 71개 CP",
                     fill_color=RGBColor(239, 246, 255), border_color=COLOR_PRIMARY_BLUE, title_color=COLOR_NAVY_DARK)

    draw_simple_card(slide2, Inches(7.16), Inches(1.46), Inches(3.27), Inches(0.72),
                     "🏛️ NMC 정책관 (중앙응급센터·지원단)",
                     "250개 시군구 35:65 GIS 거시 관제 · 골든타임 사각지대\n35개소 경영위기 조기경보 · 14대 공시 사전검증 · 시도 100점 심사",
                     fill_color=RGBColor(245, 243, 255), border_color=COLOR_PURPLE, title_color=COLOR_PURPLE)

    # 2. 중앙 좌측: 5대 핵심 워크스페이스 & 기능 (left=0.4in, top=2.24in, w=6.85in, h=3.28in)
    # 외곽 래퍼
    draw_block(slide2, Inches(0.4), Inches(2.24), Inches(6.85), Inches(3.28),
               "Application & Service Tier: 5대 핵심 워크스페이스 & 18대 세부 모듈",
               [], header_bg=COLOR_PRIMARY_BLUE, header_h=0.28, title_color=COLOR_WHITE)

    # 상단 3개 모듈 (top=2.56in, h=1.45in)
    draw_simple_card(slide2, Inches(0.48), Inches(2.56), Inches(2.15), Inches(1.45),
                     "① 대국민 안심의료",
                     "• E-Gen 5분 실시간 병상 연계\n• 5대 특화(응급/소아/분만/약국/입원)\n• 카카오맵 실시간 길찾기 & 119\n• 모바일 3단계 바텀시트 UI\n• 자연어 대화형 AI 증상 비서",
                     fill_color=COLOR_SLATE_BG, border_color=COLOR_CARD_BORDER, title_color=RGBColor(225, 29, 72))

    draw_simple_card(slide2, Inches(2.72), Inches(2.56), Inches(2.15), Inches(1.45),
                     "② AI 병원 종합진단",
                     "• 41개 공공병원 6대 지표 점수화\n• 3줄 요약 핵심 원인분석 리포트\n• NMC 공식 5종 진단보고서(HWP)\n• 시군구 환자 유출입(Top5) 분석\n• 진료실적 및 의료질 평가 연계",
                     fill_color=COLOR_SLATE_BG, border_color=COLOR_CARD_BORDER, title_color=COLOR_PRIMARY_BLUE)

    draw_simple_card(slide2, Inches(4.96), Inches(2.56), Inches(2.20), Inches(1.45),
                     "③ 의료기관 자원관리",
                     "• 신포괄 정책가산 계산기 (1.0%)\n• 연간 추가수익 경영 시뮬레이션\n• 71개 공인 표준진료지침(CP)\n• 표준재원일수 초과 변이(ROI)\n• 4단계 퇴원환자 연계의뢰서",
                     fill_color=COLOR_SLATE_BG, border_color=COLOR_CARD_BORDER, title_color=COLOR_EMERALD)

    # 하단 2개 모듈 (top=4.08in, h=1.36in)
    draw_simple_card(slide2, Inches(0.48), Inches(4.08), Inches(3.30), Inches(1.36),
                     "④ 전국 헬스맵 35:65 GIS 관제",
                     "• 전국 250개 시군구 거시 취약도 맵 & 7대 필수의료 레이어\n• 응급 30분 / 분만 60분 골든타임 사각지대 정밀 자동 판정\n• 전국 214개 공공병원 통합 데이터센터 자원 총람 모니터링",
                     fill_color=COLOR_SLATE_BG, border_color=COLOR_CARD_BORDER, title_color=COLOR_NAVY_DARK)

    draw_simple_card(slide2, Inches(3.86), Inches(4.08), Inches(3.30), Inches(1.36),
                     "⑤ 정책기획 & 공시 사전검증",
                     "• 복지부 12대 항목 법정 사업계획서(HWPX) 10초 원클릭 자동완결\n• 17개 시도·8개 부처 시행계획 AI 100점 심사의견서 산출\n• 35개 지방의료원 경영위기 4단계 조기경보 & 14대 공시검증",
                     fill_color=COLOR_SLATE_BG, border_color=COLOR_CARD_BORDER, title_color=COLOR_PURPLE)

    # 3. 중앙 우측: Dual AI 엔진 & 지능형 추론 (left=7.35in, top=2.24in, w=3.08in, h=3.28in)
    draw_block(slide2, Inches(7.35), Inches(2.24), Inches(3.08), Inches(3.28),
               "Dual AI & Knowledge Tier: 지능형 추론",
               [
                   "[Cloud Multi-LLM: Gemini Pro / Flash]",
                   "• 대규모 거시 정책대안(Option A/B/C) 추론",
                   "• 2030 미래의료수요 추계 시뮬레이션",
                   "• 12대 장문 법정 사업계획서 초안 생성",
                   "• 비식별 통계 기반 다차원 벤치마킹",
                   "",
                   "[On-Premise Local sLLM: 원내 폐쇄망]",
                   "• 민감 환자 데이터 질의 및 내부 회계 분석",
                   "• 외부 네트워크 차단 독립 구동 (유출 0%)",
                   "",
                   "[환각 제로 Grounding RAG & 보안]",
                   "• 1,000쪽 법령·지침 원문 1:1 근거 대조",
                   "• PII 개인식별정보(주민/연락처) 자동 마스킹"
               ],
               header_bg=COLOR_PURPLE, header_h=0.28, title_color=COLOR_WHITE, font_size=8.0)

    # 4. 하단 좌측: 국가 공공보건의료 데이터 파이프라인 (left=0.4in, top=5.58in, w=5.90in, h=1.22in)
    draw_block(slide2, Inches(0.4), Inches(5.58), Inches(5.90), Inches(1.22),
               "Data Hub: 국가 공공보건의료 원천 데이터 파이프라인",
               [], header_bg=COLOR_EMERALD, header_h=0.24, title_color=COLOR_WHITE)

    # 4대 데이터 소스 가로 카드 (top=5.86in, h=0.88in)
    draw_simple_card(slide2, Inches(0.46), Inches(5.86), Inches(1.38), Inches(0.88),
                     "1. E-Gen 실시간",
                     "5분 주기 OpenAPI\n응급·소아·ICU 병상\nCT/MRI 가동 상태",
                     fill_color=COLOR_SLATE_BG, border_color=COLOR_CARD_BORDER, title_color=COLOR_EMERALD)

    draw_simple_card(slide2, Inches(1.88), Inches(5.86), Inches(1.38), Inches(0.88),
                     "2. HIRA 심평원",
                     "분만 청구 실적 통계\n적정성 1등급 지표\n의료인력/장비 마스터",
                     fill_color=COLOR_SLATE_BG, border_color=COLOR_CARD_BORDER, title_color=COLOR_EMERALD)

    draw_simple_card(slide2, Inches(3.30), Inches(5.86), Inches(1.40), Inches(0.88),
                     "3. KOSIS 통계청",
                     "250개 시군구 인구\n고령화율/인구밀도\n장래인구추계 DB",
                     fill_color=COLOR_SLATE_BG, border_color=COLOR_CARD_BORDER, title_color=COLOR_EMERALD)

    draw_simple_card(slide2, Inches(4.74), Inches(5.86), Inches(1.48), Inches(0.88),
                     "4. 공공병원 알리미",
                     "41개 거점공공병원\n3개년 결산서/재무제표\n원천 CSV 업로더",
                     fill_color=COLOR_SLATE_BG, border_color=COLOR_CARD_BORDER, title_color=COLOR_EMERALD)

    # 5. 하단 우측: 인프라, 보안 & 법정 산출물 출력 (left=6.40in, top=5.58in, w=4.03in, h=1.22in)
    draw_block(slide2, Inches(6.40), Inches(5.58), Inches(4.03), Inches(1.22),
               "Infrastructure & Official Output: 보안 및 산출물",
               [
                   "• [웹/보안]: Next.js 16 (Turbopack), Vercel Serverless / Edge CDN, HttpOnly 세션 쿠키, 5회 로그인 연속 실패 시 계정 잠금",
                   "• [공식 법정 산출물]: 복지부 12대 사업계획서(HWPX) · NMC 5종 진단보고서(HWP) · NMC 표준 3종 엑셀 마스터 원클릭 자동 발급"
               ],
               header_bg=RGBColor(71, 85, 105), header_h=0.24, title_color=COLOR_WHITE, font_size=8.0)

    # ==============================================================
    # [Slide 3. 1. 전체 시스템 아키텍처 총괄도 (5-Tier)]
    # ==============================================================
    slide3 = prs.slides.add_slide(layout_content)
    add_header_placeholders(
        slide3,
        title="1. 계층별 시스템 아키텍처 총괄도 (5-Tier Layered Architecture)",
        governing="대국민 24시간 안심의료와 41개 거점공공병원 AI 종합진단, 전국 250개 시군구 거시 관제를 유기적으로 연계하는 5-Tier 하이브리드 아키텍처",
        category="1. 계층별 아키텍처",
        chapter="5-Tier 구성도"
    )

    # 1. User Tier
    draw_block(slide3, Inches(0.4), Inches(1.50), Inches(10.0), Inches(0.92),
               "1. User Presentation Tier (3대 대상자별 맞춤 인터페이스)",
               [
                   "• [👨‍👩‍👧 국민]: 모바일/웹 안심의료 지도, E-Gen 실시간 병상 연계, 국민안심 AI 증상 질의응답, 3단계 바텀시트 UI (로그인 불필요)",
                   "• [🏥 의료기관 담당자]: 41개 거점공공병원 AI 종합진단, 5종 프로파일 보고서(HWP), 12대 항목 법정 사업계획서(HWPX), 신포괄 정책가산(1.0%)",
                   "• [🏛️ NMC 업무 담당자]: 전국 250개 시군구 35:65 양방향 GIS 취약도 관제, 35개 지방의료원 경영위기 조기경보, 14대 알리미 공시 사전검증"
               ],
               header_bg=COLOR_NAVY_DARK)

    # 2. Application Tier
    draw_block(slide3, Inches(0.4), Inches(2.52), Inches(10.0), Inches(1.02),
               "2. Application & Business Logic Tier (5대 핵심 워크스페이스 & 전문 엔진)",
               [
                   "• [국민안심 서비스]: 5대 안심의료 필터(응급·소아·분만·야간약국·입원), E-Gen 실시간 병상 연동, Leaflet 동적 지오로케이션 맵",
                   "• [AI 병원진단·개선]: 6대 지표 종합점수 엔진, 3줄 요약 원인분석, 환자 유출입(OD) 분석, 2030 미래수요 추계, 71개 CP 라이브러리/ROI",
                   "• [정책기획 & 공시검증]: 12대 법정 사업계획서 자동완결, 시도 시행계획 AI 100점 심사, 14대 회계산출식 검증, PII 비식별화"
               ],
               header_bg=COLOR_PRIMARY_BLUE)

    # 3. AI & Inference Tier
    draw_block(slide3, Inches(0.4), Inches(3.64), Inches(10.0), Inches(0.98),
               "3. Dual AI Inference & RAG Knowledge Tier (하이브리드 지능형 추론 엔진)",
               [
                   "• [Cloud Multi-LLM]: Google Gemini 2.5 Pro / Flash 기반 거시 정책대안(Option A/B/C) 추론, 다차원 벤치마킹, 장문 기획서 자동 생성",
                   "• [On-Premise Local sLLM]: 원내 폐쇄망 경량 모델 연계(환자 진료 데이터 및 내부 회계자료 보안 처리, 외부 유출 0% 보장)",
                   "• [Grounding & RAG]: 1,000쪽 분량의 공공보건의료 법령, 신포괄 지침서 임베딩 벡터 코퍼스 기반 환각 제로(Zero Hallucination) 원문 대조"
               ],
               header_bg=COLOR_PURPLE)

    # 4. Data Hub Tier
    draw_block(slide3, Inches(0.4), Inches(4.72), Inches(10.0), Inches(0.95),
               "4. Data Hub & Integration Tier (국가 공공보건의료 원천 데이터 파이프라인)",
               [
                   "• [중앙응급의료센터 E-Gen OpenAPI]: 전국 응급실/중환자실/소아과 실시간 가용병상 및 CT/MRI/인공호흡기 가동 5분 주기 실시간 수신",
                   "• [건강보험심사평가원(HIRA)]: 전국 분만실 청구 실적, 적정성 평가 1등급 통계, 의료인력/장비 데이터 연계",
                   "• [통계청(KOSIS) & 알리미 공시]: 250개 시군구 장래인구추계, 고령화율 통계 / 41개 거점공공병원 3개년 결산서 및 재무상태표 마스터"
               ],
               header_bg=COLOR_EMERALD)

    # 5. Infrastructure & Security Tier
    draw_block(slide3, Inches(0.4), Inches(5.77), Inches(10.0), Inches(0.92),
               "5. Infrastructure & Security Governance Tier (클라우드 인프라 및 보안 체계)",
               [
                   "• [웹 프레임워크]: Next.js 16.3 (Turbopack 빌드), React 19, Tailwind CSS, Vercel Serverless / Edge 글로벌 분산 CDN 배포",
                   "• [보안 및 거버넌스]: HttpOnly 세션 쿠키, 로그인 시도 5회 잠금, 주민번호/전화번호 PII 정규식 마스킹, API Key 암호화 저장소",
                   "• [문서 생성 표준]: HWP/HWPX(OWPML) 표준 바이너리 변환기, SheetJS 엑셀 파서, Leaflet Canvas 렌더러 탑재"
               ],
               header_bg=RGBColor(71, 85, 105))

    # ==============================================================
    # [Slide 4. 2. 기능 구성도 (Functional Architecture)]
    # ==============================================================
    slide4 = prs.slides.add_slide(layout_content)
    add_header_placeholders(
        slide4,
        title="2. 기능 구성도 (Functional Architecture Map)",
        governing="대국민 실시간 서비스부터 공공병원 경영진단, 정부 법정 서식 자동 발급까지 5대 영역 18대 핵심 모듈 완비",
        category="2. 기능 아키텍처",
        chapter="시스템 기능 구성도"
    )

    col_w = Inches(1.92)
    col_gap = Inches(0.10)
    start_left = Inches(0.4)
    card_top = Inches(1.50)
    card_h = Inches(5.20)

    modules = [
        {
            "title": "① 대국민 안심의료",
            "bg": COLOR_PRIMARY_BLUE,
            "items": [
                "[실시간 병상 연계]",
                "• E-Gen 5분 단위 연계",
                "• 응급·소아·ICU 병상",
                "• CT/MRI 장비 가동",
                "",
                "[5대 특화 의료 검색]",
                "• 🚨 24시간 응급실",
                "• 👶 달빛소아(114곳)",
                "• 🤰 분만산부인과",
                "• 🌙 야간/휴일 당번약국",
                "• 🛏️ 안심 격리음압병상",
                "",
                "[모바일 특화 UX]",
                "• 3단계 바텀시트 UI",
                "• 원클릭 119/전화걸기",
                "• 카카오맵 실시간 길찾기",
                "• AI 증상 동행상담 비서"
            ]
        },
        {
            "title": "② AI 병원 종합진단",
            "bg": COLOR_NAVY_ACCENT,
            "items": [
                "[41개 거점공공병원]",
                "• 35개 지방의료원",
                "• 6개 적십자병원",
                "",
                "[6대 핵심 영역 진단]",
                "• 필수의료 제공 역량",
                "• 재무·경영 건전성",
                "• 의료 질 및 환자안전",
                "• 책임의료 협력체계",
                "• 의료인력 충원율",
                "• 지자체 지원 연계도",
                "",
                "[AI 심층 원인분석]",
                "• 3줄 요약 핵심 브리프",
                "• NMC 공식 5종 진단서",
                "• HWP 공문서 자동 생성"
            ]
        },
        {
            "title": "③ 의료기관 자원관리",
            "bg": COLOR_EMERALD,
            "items": [
                "[신포괄 정책가산]",
                "• CP 가산율 1.0% 계산",
                "• 연간 추가수익 시뮬레이션",
                "• 경영진 보고 브리프",
                "",
                "[71개 CP 라이브러리]",
                "• NMC 공인 표준진료지침",
                "• 다빈도 질환 표준경로",
                "• EMR/OCS 서식 매핑",
                "",
                "[변이(ROI) & 퇴원돌봄]",
                "• 표준재원일수 초과 분석",
                "• 병상회전율 재정효과",
                "• 4단계 퇴원지원 평가",
                "• 보건복지 연계의뢰서"
            ]
        },
        {
            "title": "④ 전국 헬스맵 관제",
            "bg": COLOR_NAVY_DARK,
            "items": [
                "[전국 250개 시군구]",
                "• 35:65 양방향 GIS 맵",
                "• 7대 필수의료 레이어",
                "• 거시 취약지수 랭킹",
                "",
                "[골든타임 사각지대]",
                "• 응급 30분 미도달율",
                "• 분만 60분 미도달율",
                "• 4단계 취약등급 판정",
                "",
                "[214개 공공병원]",
                "• 데이터센터 통합 관제",
                "• 전국 의료자원 총람",
                "• NMC 표준 3종 엑셀",
                "• 원천 CSV 업로더"
            ]
        },
        {
            "title": "⑤ 정책기획 & 평가",
            "bg": COLOR_PURPLE,
            "items": [
                "[법정 사업계획서]",
                "• 복지부 12대 법정 목차",
                "• 국고보조 공모 신청용",
                "• HWPX 공문서 자동화",
                "",
                "[미래의료수요 추계]",
                "• 2030 인구고령화 반영",
                "• 유사 지자체 벤치마크",
                "• AI 정책대안 A/B/C",
                "",
                "[경영위기 & 공시검증]",
                "• 35개소 조기경보 4단계",
                "• 14대 회계산출식 검증",
                "• 시도 시행계획 100점 심사",
                "• PII 비식별화 소명서"
            ]
        }
    ]

    for idx, mod in enumerate(modules):
        cur_left = start_left + idx * (col_w + col_gap)
        draw_block(slide4, cur_left, card_top, col_w, card_h,
                   mod["title"], mod["items"],
                   header_bg=mod["bg"],
                   header_h=0.35)

    # ==============================================================
    # [Slide 5. 3. 데이터 흐름 및 연계 구성도]
    # ==============================================================
    slide5 = prs.slides.add_slide(layout_content)
    add_header_placeholders(
        slide5,
        title="3. 데이터 흐름 및 연계 구성도 (Data Flow & Interface Architecture)",
        governing="중앙응급의료센터 E-Gen 및 심평원·통계청 데이터를 실시간·배치 수집하여 AI 검증을 거친 후 표준 HWPX/엑셀 공문서로 출력",
        category="3. 데이터 연계 아키텍처",
        chapter="데이터 흐름도"
    )

    p_w = Inches(2.25)
    gap = Inches(0.25)
    p_top = Inches(1.50)
    p_h = Inches(5.15)

    pipe_steps = [
        {
            "step": "STEP 1. 데이터 수집/연계",
            "bg": COLOR_PRIMARY_BLUE,
            "items": [
                "1. 국립중앙의료원 E-Gen",
                "• 실시간 OpenAPI (5분)",
                "• 응급·소아·중환자실 병상",
                "• CT/MRI 장비 가동 상태",
                "",
                "2. 건강보험심사평가원(HIRA)",
                "• 분만 청구 실적 데이터",
                "• 적정성 평가 1등급 통계",
                "• 의료인력/장비 현황",
                "",
                "3. 통계청(KOSIS)",
                "• 250개 시군구 장래인구",
                "• 고령화율 및 인구밀도",
                "",
                "4. 공공병원 알리미",
                "• 41개 거점병원 3개년 결산서",
                "• 원천 CSV/Excel 업로드"
            ]
        },
        {
            "step": "STEP 2. 전처리 & 사전검증",
            "bg": COLOR_NAVY_ACCENT,
            "items": [
                "1. 14대 회계산출식 정밀검증",
                "• 부채비율, 의업수지비율",
                "• 인건비율, 병상당 의료수익",
                "• 1원 단위 교차 검증",
                "",
                "2. PII 개인정보 비식별화",
                "• 주민번호, 환자 등록번호",
                "• 휴대전화 정규식 전수 탐지",
                "• 실시간 마스킹(***) 처리",
                "",
                "3. 데이터 정규화 & 지오코딩",
                "• 214개 공공병원 WGS84 좌표",
                "• 시군구 행정경계 GeoJSON",
                "• E-Gen 기관코드 매핑"
            ]
        },
        {
            "step": "STEP 3. AI 분석 & 엔진 추론",
            "bg": COLOR_PURPLE,
            "items": [
                "1. 거시 공간 분석 (GIS)",
                "• 35:65 양방향 GIS 맵 연산",
                "• 30분/60분 골든타임 사각지대",
                "• 거시 취약등급 4단계 판정",
                "",
                "2. 미시 병원진단 & 시뮬레이션",
                "• 6대 영역 종합점수 산출",
                "• 신포괄 정책가산 1.0% 산출",
                "• 71개 CP 변이(ROI) 계산",
                "",
                "3. Dual AI 추론 & RAG 대조",
                "• Cloud Gemini Pro 기획서 추론",
                "• On-Premise 폐쇄망 sLLM",
                "• 1,000쪽 법령 1:1 Grounding"
            ]
        },
        {
            "step": "STEP 4. 출력 & 대국민 서비스",
            "bg": COLOR_EMERALD,
            "items": [
                "1. 대국민 안심의료 서비스",
                "• 모바일 3단계 바텀시트 UI",
                "• 실시간 병상 안내 & 지도",
                "• 카카오맵 길찾기 & 119 직통",
                "• AI 증상 동행상담 비서",
                "",
                "2. 공식 법정 문서 자동 발급",
                "• 복지부 12대 사업계획서(HWPX)",
                "• NMC 5종 진단보고서(HWP)",
                "• 알리미 공시 소명서(HWP)",
                "• 퇴원환자 보건복지 연계의뢰서",
                "",
                "3. 정책 통계 데이터 마스터",
                "• NMC 표준 3종 엑셀 일괄추출",
                "• 시도 시행계획 AI 심사의견서"
            ]
        }
    ]

    for idx, st in enumerate(pipe_steps):
        s_left = Inches(0.4) + idx * (p_w + gap)
        draw_block(slide5, s_left, p_top, p_w, p_h,
                   st["step"], st["items"],
                   header_bg=st["bg"],
                   header_h=0.35)

    # ==============================================================
    # [Slide 6. 4. AI & 보안 아키텍처 (Dual AI & Security)]
    # ==============================================================
    slide6 = prs.slides.add_slide(layout_content)
    add_header_placeholders(
        slide6,
        title="4. AI & 보안 아키텍처 (Dual AI & Security Architecture)",
        governing="클라우드 초고성능 추론과 원내 폐쇄망 보안을 양립시키는 듀얼 AI 및 3단계 환각 제로 검증 체계",
        category="4. AI 및 보안 아키텍처",
        chapter="AI & 보안 구성도"
    )

    card_w2 = Inches(4.88)
    card_h2 = Inches(5.15)

    left_items = [
        "1. [Cloud Multi-LLM: Google Gemini 2.5 Pro / Flash]",
        "• 담당 업무: 전국 단위 거시 통계 분석, 2030 미래수요 추계, 복합 정책대안 도출",
        "• 강점: 초고성능 다차원 벤치마킹, 방대한 장문 서식 및 12대 사업계획서 초안 생성",
        "• 전송 데이터: 비식별화된 집계 통계(Summary Data)만 전송하여 외부 유출 원천 방지",
        "",
        "2. [On-Premise Local sLLM: 원내 폐쇄망 경량 모델]",
        "• 담당 업무: 민감 환자 데이터 질의, 내부 인사/재무 데이터 분석, 원내 비공개 지침 해석",
        "• 강점: 병원 폐쇄망 내 자체 서빙으로 네트워크 단절 환경에서도 100% 독립 가동",
        "• 보안성: 환자 진료기록 및 거점공공병원 내부 기밀자료 외부 전송 0% 완벽 보장",
        "",
        "3. [하이브리드 라우팅 게이트웨이 (Hybrid Router)]",
        "• 민감도 자동 분류기(PII Detector)가 입력 프롬프트를 실시간 사전 스캔",
        "• 민감정보 감지 시 즉시 온프레미스 sLLM으로 라우팅, 일반 통계는 Cloud Gemini로 분기"
    ]

    right_items = [
        "1. [환각 제로(Zero Hallucination) 3중 신뢰 검증망]",
        "• 1차: Grounding Verifier (1,000쪽 분량 보건의료 법령·지침 원문 1:1 근거 대조)",
        "• 2차: 14대 회계산출식 룰베이스 수학적 검증 엔진 (수치 변조 및 환각 원천 차단)",
        "• 3차: KOSIS·HIRA 공인 공공데이터베이스 검증 쿼리 교차 확인",
        "",
        "2. [개인식별정보(PII) 실시간 비식별화 파이프라인]",
        "• 주민등록번호(RRN), 외국인등록번호 13자리 정규식 탐지 및 즉시 마스킹",
        "• 환자 고유 등록번호, 휴대전화번호, 상세 거주지 주소 비식별화 처리",
        "• 공시 보고서 업로드 및 사업계획서 생성 시 자동 마스킹 필터 상시 가동",
        "",
        "3. [시스템 접근제어 및 인프라 보안]",
        "• 관리자 인가 보안 로그인 및 HttpOnly 세션 쿠키 보호",
        "• 무차별 대입 공격(Brute-force) 방지를 위한 5회 연속 로그인 실패 시 계정 잠금",
        "• 모든 공공데이터 OpenAPI 인증키의 서버단 환경변수(Env) 암호화 격리"
    ]

    draw_block(slide6, Inches(0.4), Inches(1.50), card_w2, card_h2,
               "A. Dual AI 하이브리드 엔진 (Cloud vs On-Premise)",
               left_items,
               header_bg=COLOR_PURPLE,
               header_h=0.35)

    draw_block(slide6, Inches(5.52), Inches(1.50), card_w2, card_h2,
               "B. 환각 제로 검증 및 보안 거버넌스 파이프라인",
               right_items,
               header_bg=COLOR_NAVY_DARK,
               header_h=0.35)

    # 출력 저장
    docs_dir = os.path.join(os.path.dirname(__file__), "..", "docs")
    os.makedirs(docs_dir, exist_ok=True)
    out_path = os.path.join(docs_dir, "공공의료_의사결정_지원_플랫폼_시스템_구성도.pptx")
    prs.save(out_path)
    print(f"[Success] PPTX 시스템 구성도 생성 완료 (총 6개 슬라이드): {out_path}")
    return out_path

if __name__ == "__main__":
    main()
