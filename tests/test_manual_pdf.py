import importlib.util
import io
import unittest
import uuid
from pathlib import Path
import re
from urllib.parse import urlsplit

from pypdf import PdfReader
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import Paragraph, SimpleDocTemplate

ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location("manual_pdf", ROOT / "scripts" / "build-manual-pdf.py")
MANUAL = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MANUAL)
pdfmetrics.registerFont(TTFont("Klee", str(MANUAL.FONT)))
pdfmetrics.registerFont(TTFont("KleeBold", str(MANUAL.FONT_BOLD)))


def inline_pdf(source):
    stream = io.BytesIO()
    document = SimpleDocTemplate(stream)
    document.build([Paragraph(MANUAL.inline(source), ParagraphStyle("Test", fontName="Klee", fontSize=10))])
    return PdfReader(io.BytesIO(stream.getvalue()))


class ManualPdfTests(unittest.TestCase):
    def test_japanese_inline_code_remains_readable(self):
        reader = inline_pdf("`名前を付けて保存`")
        self.assertIn("名前を付けて保存", reader.pages[0].extract_text())

    def test_relative_source_document_link_does_not_escape_pdf_bundle(self):
        reader = inline_pdf("[Image formats](../../../IMAGE-FORMATS.md)")
        self.assertIn("Image formats", reader.pages[0].extract_text())
        self.assertEqual([], list(reader.pages[0].get("/Annots", [])))

    def test_public_contact_remains_clickable(self):
        reader = inline_pdf("[Contact](https://ytec.cloudfree.jp/forge/contact/)")
        annotations = [value.get_object() for value in reader.pages[0].get("/Annots", [])]
        self.assertEqual(["https://ytec.cloudfree.jp/forge/contact/"], [value["/A"]["/URI"] for value in annotations])

    def test_generated_manual_does_not_grant_an_unapproved_document_license(self):
        MANUAL.OUTPUT = ROOT / ".local" / ("manual-generator-test-" + uuid.uuid4().hex)
        for language in ("ja", "en"):
            output = MANUAL.build(language)
            reader = PdfReader(output)
            text = "\n".join(page.extract_text() or "" for page in reader.pages)
            self.assertNotIn("CC BY 4.0", text)
            self.assertIn("Y-TEC", text)
            self.assertIn("本体コードのライセンス" if language == "ja" else "Application code license", text)

    def test_distribution_legal_links_resolve_within_legal_folder(self):
        legal = ROOT / "public" / "legal"
        for name in ("README.md", "README.en.md", "ASSETS_LICENSE.md"):
            markdown = (legal / name).read_text(encoding="utf-8")
            for target in re.findall(r"(?<!!)\[[^]]*\]\(([^)]+)\)", markdown):
                parsed = urlsplit(target)
                if parsed.scheme in {"https", "http"}:
                    continue
                resolved = (legal / parsed.path).resolve()
                with self.subTest(document=name, target=target):
                    self.assertTrue(resolved.is_relative_to(legal.resolve()))
                    self.assertTrue(resolved.is_file())
        for name in ("NOTICE", "THIRD_PARTY_NOTICES.md", "README.en.md"):
            content = (legal / name).read_text(encoding="utf-8")
            self.assertFalse("public/legal/" in content, msg=name)

    def test_manual_image_format_reference_survives_packaging(self):
        stage = ROOT / ".local" / "manual-staging-contract"
        for language in ("ja", "en"):
            markdown = (ROOT / "docs" / "manual" / language / "README.md").read_text(encoding="utf-8")
            self.assertTrue("IMAGE-FORMATS.md" in markdown)
            for target in re.findall(r"(?<!!)\[[^]]*\]\(([^)]+)\)", markdown):
                parsed = urlsplit(target)
                if parsed.scheme in {"https", "http"}:
                    continue
                resolved = (stage / "manual" / language / parsed.path).resolve()
                self.assertTrue(resolved.is_relative_to(stage.resolve()), msg=f"{language}: {target}")


if __name__ == "__main__":
    unittest.main()
