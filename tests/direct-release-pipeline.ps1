# Static integration contracts; not evidence of signing/build/runtime success.
$ErrorActionPreference='Stop'
$project=Split-Path $PSScriptRoot -Parent
$text=Get-Content -LiteralPath (Join-Path $project 'scripts/package-self-signed-direct.ps1') -Raw
if ($text -match 'ExecutionPolicy|powershell\.exe') { throw 'FAIL: direct producer still overrides policy or uses the old host.' }
foreach ($required in @('Get-LetterierSigningInvocation','Copy-LetterierDirectDocuments','Assert-LetterierDirectDocuments -Stage $extractedBinary.Directory.FullName','Assert-LetterierSignature -Path $publishedInstaller','PREBUILD-SHA256SUMS.txt')) {
    if (-not $text.Contains($required)) { throw ('FAIL: missing producer integration: '+$required) }
}
if ($text -match 'Remove-Item') { throw 'FAIL: producer deletes retained signing evidence.' }
if ($text -match 'portableInvocation|portableArgs') { throw 'FAIL: portable binary must be copied from the verified Tauri hook result, not signed again.' }
$parseErrors=$null
$null=[Management.Automation.Language.Parser]::ParseInput($text,[ref]$null,[ref]$parseErrors)
if ($parseErrors.Count) { throw 'FAIL: producer PowerShell syntax errors.' }
Write-Output 'PASS: static direct producer integration contracts (not actual signing/build proof).'
