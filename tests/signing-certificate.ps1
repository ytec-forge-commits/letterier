$ErrorActionPreference='Stop'
$project=Split-Path $PSScriptRoot -Parent
. (Join-Path $project 'scripts/code-signing.ps1')
$pin=[Security.Cryptography.X509Certificates.X509Certificate2]::new((Join-Path $project 'output/release-1.0.4/Y-TEC-CodeSigning-Public.cer'))
try {
    $selected=Get-LetterierSigningCertificate
    if ($selected.Thumbprint -ne $pin.Thumbprint) { throw 'FAIL: selection did not retain the prior published signer.' }
    if (-not (Test-LetterierPrivateKeyNonExportable -Certificate $selected)) { throw 'FAIL: selected private key is exportable.' }
    Write-Output 'PASS: existing non-exportable signer matches prior public certificate; no key was exported.'
    # Dependency-boundary duplicate inventory: never mutate the certificate store.
    $script:duplicateSigner=$selected
    function Get-ChildItem { param([string]$LiteralPath); return @($script:duplicateSigner,$script:duplicateSigner) }
    $rejected=$false
    try { $null=Get-LetterierSigningCertificate } catch { $rejected=$true }
    if (-not $rejected) { throw 'FAIL: ambiguous pinned signer inventory was accepted.' }
    Write-Output 'PASS: ambiguous pinned signer inventory rejected.'
} finally { $pin.Dispose() }
