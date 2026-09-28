import re
import shutil
import subprocess
import unittest
import uuid
import hashlib
import zipfile
from pathlib import Path
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[1]


class ReleaseDocumentTests(unittest.TestCase):
    def test_nsis_installer_licenses_and_source_are_bundled(self):
        legal = ROOT / "public" / "legal"
        for name in ("NSIS-LICENSE.txt", "NSIS-TAURI-UTILS-MIT.txt", "NSIS-Corresponding-Source.zip"):
            self.assertTrue((legal / name).is_file(), name)
        self.assertIn("SPECIAL EXCEPTION FOR LZMA COMPRESSION MODULE", (legal / "NSIS-LICENSE.txt").read_text())
        self.assertIn("nsis-tauri-utils", (legal / "THIRD_PARTY_NOTICES.md").read_text(encoding="utf-8"))
        sha = hashlib.sha256((legal / "NSIS-Corresponding-Source.zip").read_bytes()).hexdigest()
        for name in ("THIRD_PARTY_NOTICES.md", "THIRD_PARTY_NOTICES.txt"):
            self.assertIn(sha, (legal / name).read_text(encoding="utf-8"))
        with zipfile.ZipFile(legal / "NSIS-Corresponding-Source.zip") as source:
            self.assertIsNone(source.testzip())
            self.assertIn("nsis-311/COPYING", source.namelist())

    def test_packager_rejects_pem_private_key_format(self):
        script = (ROOT / "scripts" / "package-self-signed-direct.ps1").read_text(encoding="utf-8")
        self.assertIn("'.pem'", script)

    def test_packaged_root_documents_resolve_to_bundled_files(self):
        # Source-layout paths must not survive the distribution-layout boundary.
        stage = ROOT / ".local" / ("release-documents-test-" + uuid.uuid4().hex)
        stage.mkdir(parents=True)
        names = ("README.md", "README.en.md", "LICENSE", "NOTICE", "THIRD_PARTY_NOTICES.md",
                 "ASSETS_LICENSE.md", "BRAND_POLICY.md", "LICENSE_EXCEPTIONS.md", "PRIVACY.md",
                 "IMAGE-FORMATS.md", "CODE_SIGNING_POLICY.md", "CHANGELOG.md")
        for name in names:
            shutil.copyfile(ROOT / name, stage / name)
        shutil.copytree(ROOT / "public" / "legal", stage / "legal")
        shutil.copytree(ROOT / "docs" / "manual", stage / "manual")
        shutil.copyfile(ROOT / "distribution" / "README-VECTOR.txt", stage / "README-VECTOR.txt")
        before = {name: (ROOT / name).read_bytes() for name in names}
        result = subprocess.run([
            "powershell.exe", "-NoProfile", "-ExecutionPolicy", "Bypass", "-File",
            str(ROOT / "scripts" / "repair-release-document-links.ps1"), "-StagePath", str(stage)
        ], capture_output=True, text=True, encoding="utf-8", errors="replace")
        self.assertEqual(0, result.returncode, result.stderr)
        for name in ("README.md", "README.en.md", "ASSETS_LICENSE.md"):
            content = (stage / name).read_text(encoding="utf-8-sig")
            for target in re.findall(r"(?<!!)\[[^]]*\]\(([^)]+)\)", content):
                parsed = urlsplit(target)
                if parsed.scheme in {"http", "https"}:
                    continue
                resolved = (stage / parsed.path).resolve()
                with self.subTest(document=name, target=target):
                    self.assertTrue(resolved.is_relative_to(stage.resolve()))
                    self.assertTrue(resolved.is_file())
        for name in ("NOTICE", "THIRD_PARTY_NOTICES.md", "ASSETS_LICENSE.md"):
            content = (stage / name).read_text(encoding="utf-8-sig")
            self.assertNotIn("public/legal/", content)
            self.assertNotIn("public/fonts/manifest.json", content)
        self.assertIn("legal/MPL-Corresponding-Source.zip", (stage / "NOTICE").read_text(encoding="utf-8-sig"))
        self.assertIn("legal/font-manifest.json", (stage / "ASSETS_LICENSE.md").read_text(encoding="utf-8-sig"))
        for name in names:
            self.assertEqual(before[name], (ROOT / name).read_bytes(), name)


if __name__ == "__main__":
    unittest.main()
