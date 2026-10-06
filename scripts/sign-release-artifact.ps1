param([Parameter(Mandatory = $true)][string]$Path)
$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'code-signing.ps1')
. (Join-Path $PSScriptRoot 'signing-host.ps1')
$resolved = (Resolve-Path -LiteralPath $Path).Path
$certificate = Get-LetterierSigningCertificate
$signTool = Get-LetterierWindowsSdkTool -Name 'signtool.exe'
# Makensis embeds LangDLL without a Tauri DLL callback. Keep the scope to
# the owned standard-plugin directory and do not re-sign an invalid signature.
$language=Get-LetterierBundledLanguageSelector -ProjectRoot (Split-Path $PSScriptRoot -Parent) -ArtifactPath $resolved
if ($null -ne $language) {
    Invoke-LetterierUnsignedArtifactSigning -Path $language -Certificate $certificate -ScriptPath $PSCommandPath
}
& $signTool sign /fd SHA256 /sha1 $certificate.Thumbprint /s My /tr 'http://timestamp.digicert.com' /td SHA256 $resolved
if ($LASTEXITCODE -ne 0) { throw "SignTool failed: $resolved" }
$null = Assert-LetterierSignature -Path $resolved -Certificate $certificate -RequireTimestamp
Write-Output "Verified Y-TEC self-signed Authenticode signature and timestamp: $resolved"
