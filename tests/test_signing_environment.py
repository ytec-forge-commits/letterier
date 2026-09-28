import subprocess
import unittest
import os
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


class SigningEnvironmentTests(unittest.TestCase):
    @unittest.skipUnless(os.name == "nt", "Windows certificate provider test")
    def test_node_child_can_use_windows_certificate_provider(self):
        # Tauri launches PowerShell through Node, not PowerShell's version-aware launcher.
        source = ROOT / "scripts" / "code-signing.ps1"
        command = "$ErrorActionPreference='Stop'; . '" + str(source).replace("'", "''") + "'; $drive=Get-PSDrive -Name Cert; if(-not $drive){exit 2}"
        result = subprocess.run([
            "node", "--input-type=module", "-e",
            "import {spawnSync} from 'node:child_process'; const r=spawnSync('powershell.exe',['-NoProfile','-ExecutionPolicy','Bypass','-Command',process.argv[1]],{stdio:'inherit',env:{...process.env}});process.exit(r.status??1);",
            command,
        ], capture_output=True, encoding="utf-8", errors="replace")
        self.assertEqual(0, result.returncode, result.stderr)


if __name__ == "__main__":
    unittest.main()
