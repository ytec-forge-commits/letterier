from __future__ import annotations

import html
import re
import sys
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import Image, KeepTogether, PageBreak, Paragraph, SimpleDocTemplate, Spacer

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "output" / "pdf"
FONT = ROOT / "public" / "fonts" / "kleeone" / "KleeOne-Regular.ttf"
FONT_BOLD = ROOT / "public" / "fonts" / "kleeone" / "KleeOne-SemiBold.ttf"


def inline(text: str) -> str:
    text = text.replace("\u2011", "-").replace("\u2013", "-").replace("\u2014", "-")
    escaped = html.escape(text)
    escaped = re.sub(r"\[([^]]+)]\(([^)]+)\)", r'<link href="\2" color="#2b614d">\1</link>', escaped)
    escaped = re.sub(r"\*\*([^*]+)\*\*", r"<b>\1</b>", escaped)
    escaped = re.sub(r"`([^`]+)`", r'<font name="Courier">\1</font>', escaped)
    return escaped


def add_page_number(canvas, doc):
    canvas.saveState()
    canvas.setFont("Klee", 8)
    canvas.setFillColor(colors.HexColor("#5c6f66"))
    canvas.drawString(18 * mm, 10 * mm, "Letterier 1.0.4")
    canvas.drawRightString(A4[0] - 18 * mm, 10 * mm, str(doc.page))
    canvas.restoreState()


def build(language: str):
    source = ROOT / "docs" / "manual" / language / "README.md"
    destination = OUTPUT / ("Letterier-Manual-ja-1.0.4.pdf" if language == "ja" else "Letterier-Manual-en-1.0.4.pdf")
    lines = source.read_text(encoding="utf-8").splitlines()
    styles = getSampleStyleSheet()
    body = ParagraphStyle("Body", parent=styles["BodyText"], fontName="Klee", fontSize=10.2, leading=17, textColor=colors.HexColor("#263a31"), spaceAfter=7)
    title = ParagraphStyle("Title", parent=body, fontName="KleeBold", fontSize=23, leading=30, alignment=TA_CENTER, textColor=colors.HexColor("#174c38"), spaceAfter=12)
    h2 = ParagraphStyle("H2", parent=body, fontName="KleeBold", fontSize=16, leading=22, textColor=colors.HexColor("#1f5d45"), spaceBefore=12, spaceAfter=7, borderPadding=(0, 0, 3, 0), borderWidth=0, borderColor=colors.HexColor("#bfd4c8"))
    bullet = ParagraphStyle("Bullet", parent=body, leftIndent=14, firstLineIndent=-9, bulletIndent=4, spaceAfter=4)
    meta = ParagraphStyle("Meta", parent=body, alignment=TA_CENTER, fontSize=9, textColor=colors.HexColor("#60746a"), spaceAfter=15)

    story = []
    paragraph = []
    page_break_before = {
        "最初の手紙を作る",
        "画面の見方",
        "縦書きで書く",
        "ページを扱う",
        "写真・画像を入れる",
        "保存と回復",
        "Create your first letter",
        "Screen overview",
        "Write in English",
        "Pages",
        "Photos and images",
        "Save and recover work",
        "PDF保存と印刷",
        "Save a PDF or print",
    }

    def flush():
        if paragraph:
            story.append(Paragraph(inline(" ".join(paragraph)), body))
            paragraph.clear()

    for line in lines:
        stripped = line.strip()
        if not stripped:
            flush()
            continue
        image_match = re.fullmatch(r"!\[([^]]*)]\(([^)]+)\)", stripped)
        if image_match:
            flush()
            image_path = (source.parent / image_match.group(2)).resolve()
            image_flow = Image(str(image_path), width=174 * mm, height=108.75 * mm)
            image_flow.hAlign = "CENTER"
            story.extend([Spacer(1, 3 * mm), image_flow, Paragraph(inline(image_match.group(1)), ParagraphStyle("Caption", parent=meta, fontSize=8.5, spaceBefore=3, spaceAfter=8))])
            continue
        if stripped.startswith("# "):
            flush()
            story.append(Paragraph(inline(stripped[2:]), title))
            continue
        if stripped.startswith("## "):
            flush()
            heading = stripped[3:]
            if heading in page_break_before and story:
                story.append(PageBreak())
            story.append(Paragraph(inline(heading), h2))
            continue
        if stripped.startswith("- "):
            flush()
            story.append(Paragraph(inline(stripped[2:]), bullet, bulletText="•"))
            continue
        numbered = re.match(r"^(\d+)\.\s+(.*)$", stripped)
        if numbered:
            flush()
            story.append(Paragraph(inline(numbered.group(2)), bullet, bulletText=numbered.group(1) + "."))
            continue
        if stripped.startswith("対象バージョン:") or stripped.startswith("For version "):
            flush()
            story.append(Paragraph(inline(stripped), meta))
            continue
        paragraph.append(stripped)
    flush()

    story.append(PageBreak())
    closing = "© 2026 Y-TEC / Documentation: CC BY 4.0" if language == "en" else "© 2026 Y-TEC / 文書: CC BY 4.0"
    story.append(Spacer(1, 90 * mm))
    story.append(Paragraph("Letterier", title))
    story.append(Paragraph(closing, meta))

    OUTPUT.mkdir(parents=True, exist_ok=True)
    document = SimpleDocTemplate(str(destination), pagesize=A4, rightMargin=18 * mm, leftMargin=18 * mm, topMargin=16 * mm, bottomMargin=17 * mm, title="Letterier User Manual" if language == "en" else "レタリエ 操作マニュアル", author="Y-TEC")
    document.build(story, onFirstPage=add_page_number, onLaterPages=add_page_number)
    return destination


def main():
    pdfmetrics.registerFont(TTFont("Klee", str(FONT)))
    pdfmetrics.registerFont(TTFont("KleeBold", str(FONT_BOLD)))
    outputs = [build("ja"), build("en")]
    for output in outputs:
        print(output)


if __name__ == "__main__":
    try:
        main()
    except Exception as error:
        print(error, file=sys.stderr)
        raise
