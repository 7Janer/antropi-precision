from pathlib import Path

from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph


OUTPUT = Path(__file__).with_name("Antropi_Design_Rationale.pdf")

INK = HexColor("#0B0B0D")
PANEL = HexColor("#17171B")
WHITE = HexColor("#F8F8FA")
MUTED = HexColor("#A5A5AF")
LINE = HexColor("#39393F")
VIOLET = HexColor("#8447FF")
VIOLET_SOFT = HexColor("#BDA5FF")
GREEN = HexColor("#86FFB4")


def register_fonts():
    inter_regular = Path("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf")
    inter_bold = Path("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf")
    mono = Path("/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf")
    if inter_regular.exists():
        pdfmetrics.registerFont(TTFont("RationaleSans", str(inter_regular)))
        pdfmetrics.registerFont(TTFont("RationaleSansBold", str(inter_bold)))
        pdfmetrics.registerFont(TTFont("RationaleMono", str(mono)))
        return "RationaleSans", "RationaleSansBold", "RationaleMono"
    return "Helvetica", "Helvetica-Bold", "Courier"


SANS, BOLD, MONO = register_fonts()


def paragraph(c, text, x, y_top, width, font_size=8.4, leading=12, color=MUTED, bold=False):
    style = ParagraphStyle(
        name="body",
        fontName=BOLD if bold else SANS,
        fontSize=font_size,
        leading=leading,
        textColor=color,
        alignment=TA_LEFT,
        spaceAfter=0,
    )
    p = Paragraph(text, style)
    _, height = p.wrap(width, 200 * mm)
    p.drawOn(c, x, y_top - height)
    return height


def label(c, text, x, y, color=VIOLET_SOFT):
    c.setFillColor(color)
    c.setFont(MONO, 6.5)
    c.drawString(x, y, text.upper())


def draw_mark(c, x, y, scale=1):
    c.setFillColor(WHITE)
    c.rect(x, y, 4 * scale, 16 * scale, stroke=0, fill=1)
    c.rect(x + 4 * scale, y + 12 * scale, 12 * scale, 4 * scale, stroke=0, fill=1)
    c.rect(x + 4 * scale, y, 12 * scale, 4 * scale, stroke=0, fill=1)
    c.setFillColor(VIOLET)
    c.rect(x + 12 * scale, y + 4 * scale, 4 * scale, 8 * scale, stroke=0, fill=1)
    c.rect(x + 16 * scale, y + 12 * scale, 4 * scale, 4 * scale, stroke=0, fill=1)


def divider(c, x1, y, x2):
    c.setStrokeColor(LINE)
    c.setLineWidth(0.6)
    c.line(x1, y, x2, y)


def section(c, number, title, body, x, y_top, width):
    c.setFillColor(VIOLET)
    c.rect(x, y_top - 10, 17, 17, stroke=0, fill=1)
    c.setFillColor(WHITE)
    c.setFont(MONO, 6.8)
    c.drawCentredString(x + 8.5, y_top - 4.4, number)
    c.setFillColor(WHITE)
    c.setFont(BOLD, 10.8)
    c.drawString(x + 26, y_top - 5, title)
    height = paragraph(c, body, x + 26, y_top - 18, width - 26, font_size=8.1, leading=11.3)
    return height + 34


def build_pdf():
    width, height = A4
    c = canvas.Canvas(str(OUTPUT), pagesize=A4)
    c.setTitle("Antropi Robotics Landing Page - Design Rationale")
    c.setAuthor("Kumar Rishav")

    c.setFillColor(INK)
    c.rect(0, 0, width, height, stroke=0, fill=1)

    # Calibrated background grid.
    c.saveState()
    c.setStrokeColor(HexColor("#17171B"))
    c.setLineWidth(0.35)
    step = 24
    for x in range(0, int(width) + step, step):
        c.line(x, 0, x, height)
    for y in range(0, int(height) + step, step):
        c.line(0, y, width, y)
    c.restoreState()

    margin = 34
    inner_w = width - 2 * margin

    # Brand row.
    draw_mark(c, margin, height - 57, 1.1)
    c.setFillColor(WHITE)
    c.setFont(BOLD, 9.2)
    c.drawString(margin + 31, height - 43, "ANTROPI")
    c.drawString(margin + 31, height - 54, "ROBOTICS")
    label(c, "Design intern assignment / landing page / 1440 px", width - 253, height - 49)
    divider(c, margin, height - 72, width - margin)

    # Hero statement.
    label(c, "Design rationale", margin, height - 96)
    c.setFillColor(WHITE)
    c.setFont(BOLD, 25)
    c.drawString(margin, height - 128, "Precision made visible.")
    paragraph(
        c,
        "The redesign turns Antropi's operational strengths into a clear buying story: "
        "<b>choose the precision, see the proof, then start the order.</b> It is aimed at "
        "engineering and procurement teams who need confidence in repeatability, quality "
        "and delivery - not broad manufacturing claims.",
        margin,
        height - 145,
        353,
        font_size=9.2,
        leading=13.6,
        color=MUTED,
    )

    # Precision badge.
    badge_x = width - margin - 133
    badge_y = height - 172
    c.setFillColor(PANEL)
    c.setStrokeColor(HexColor("#51476B"))
    c.rect(badge_x, badge_y, 133, 75, stroke=1, fill=1)
    label(c, "Core product signal", badge_x + 13, badge_y + 56)
    c.setFillColor(WHITE)
    c.setFont(BOLD, 18)
    c.drawString(badge_x + 13, badge_y + 31, "100 / 10 / 5")
    c.setFillColor(VIOLET_SOFT)
    c.setFont(MONO, 7)
    c.drawString(badge_x + 14, badge_y + 15, "MICRON PRECISION TIERS")

    divider(c, margin, height - 207, width - margin)

    # Two-column reasoning.
    left_x = margin
    left_w = 322
    right_x = 386
    right_w = width - margin - right_x
    y = height - 231

    y -= section(
        c,
        "01",
        "Hierarchy follows the buyer's decision",
        "The opening answers what Antropi offers in one sentence: repeatable precision CNC "
        "parts. The next sections progress from 100 / 10 / 5 micron capability to inspection "
        "evidence, order visibility, repeat ordering and finally the CAD-upload action.",
        left_x,
        y,
        left_w,
    )
    y -= 10
    y -= section(
        c,
        "02",
        "Trust is shown as operational evidence",
        "A live production-record card, an explicitly labelled sample inspection report and a "
        "direct job-shop comparison make the promise concrete. Claims remain within the brief: "
        "in-house inspection, traceability, clearer delivery expectations and repeat-order continuity.",
        left_x,
        y,
        left_w,
    )
    y -= 10
    y -= section(
        c,
        "03",
        "The visual system feels manufactured",
        "Graphite surfaces, square geometry, calibrated grid lines and monospaced labels reference "
        "metrology equipment and production records. Antropi violet behaves like an optical scan "
        "line: used only to signal precision, progress and action. The machined-metal hero adds "
        "material reality without competing with the message.",
        left_x,
        y,
        left_w,
    )
    y -= 10
    section(
        c,
        "04",
        "AI reduces technical uncertainty",
        "The CNC part guide explains bearing housings, motor mounts and fluid manifolds in plain "
        "English. Gemini runs behind the server boundary; an eight-second timeout and curated "
        "knowledge fallback keep the interaction useful when the provider is unavailable. Final "
        "manufacturing decisions are explicitly deferred to the engineering drawing.",
        left_x,
        y,
        left_w,
    )

    # Right sidebar.
    c.setFillColor(PANEL)
    c.setStrokeColor(LINE)
    c.rect(right_x, height - 539, right_w, 315, stroke=1, fill=1)
    sx = right_x + 20
    sy = height - 251
    label(c, "Experience principles", sx, sy)
    principles = [
        ("OUTCOME FIRST", "Repeatability leads; autonomous-factory technology supports it."),
        ("SPECIFIC PROOF", "Exact tiers and inspection artifacts replace generic quality language."),
        ("ONE PRIMARY ACTION", "Every path resolves to uploading the customer's existing package."),
        ("DESKTOP-LED, RESPONSIVE", "The 1440 px composition compresses cleanly for tablet and mobile."),
        ("ACCESSIBLE BY DEFAULT", "Readable type, keyboard focus, semantic tabs and reduced-motion support."),
    ]
    py = sy - 23
    for index, (head, copy) in enumerate(principles):
        c.setFillColor(VIOLET if index < 3 else GREEN)
        c.circle(sx + 3, py + 2, 2.4, stroke=0, fill=1)
        c.setFillColor(WHITE)
        c.setFont(BOLD, 7.3)
        c.drawString(sx + 13, py, head)
        py -= 10
        used = paragraph(c, copy, sx + 13, py, right_w - 46, font_size=7.3, leading=10.3)
        py -= used + 14

    # Tools and architecture strip.
    strip_y = 104
    c.setFillColor(HexColor("#111115"))
    c.setStrokeColor(LINE)
    c.rect(margin, strip_y, inner_w, 102, stroke=1, fill=1)
    label(c, "Tools used", margin + 18, strip_y + 79)
    paragraph(
        c,
        "<b>Design & build</b><br/>React 19 + Vinext / TypeScript / CSS / Lucide<br/><br/>"
        "<b>AI & visual</b><br/>Gemini Interactions API / OpenAI image generation",
        margin + 18,
        strip_y + 67,
        215,
        font_size=7.3,
        leading=10.2,
    )
    c.setStrokeColor(LINE)
    c.line(margin + 246, strip_y + 16, margin + 246, strip_y + 86)
    label(c, "Functional architecture", margin + 265, strip_y + 79)
    paragraph(
        c,
        "<b>React landing page</b> -> API gateway -> component, quote-intake and AI services. "
        "Docker Compose runs the independent Node.js services locally; the published demo includes "
        "the same Gemini endpoint and fallback at the edge.",
        margin + 265,
        strip_y + 65,
        inner_w - 284,
        font_size=7.5,
        leading=11,
    )

    divider(c, margin, 82, width - margin)
    c.setFillColor(MUTED)
    c.setFont(MONO, 6.4)
    c.drawString(margin, 60, "FINAL DESIGN")
    c.setFillColor(VIOLET_SOFT)
    c.drawString(margin + 72, 60, "antropi-precision.rishavptn.chatgpt.site")
    c.setFillColor(MUTED)
    c.drawRightString(width - margin, 60, "KUMAR RISHAV / 2026")

    c.showPage()
    c.save()


if __name__ == "__main__":
    build_pdf()
    print(OUTPUT)
