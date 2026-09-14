param([Parameter(Mandatory = $true)][string]$Path)
$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'code-signing.ps1')
$resolved = (Resolve-Path -LiteralPath $Path).Path
$certificate = Get-LetterierSigningCertificate
$signTool = Get-LetterierWindowsSdkTool -Name 'signtool.exe'
& $signTool sign /fd SHA256 /sha1 $certificate.Thumbprint /s My /tr 'http://timestamp.digicert.com' /td SHA256 $resolved
if ($LASTEXITCODE -ne 0) { throw "SignTool failed: $resolved" }
$null = Assert-LetterierSignature -Path $resolved -Certificate $certificate -RequireTimestamp
Write-Output "Verified Y-TEC self-signed Authenticode signature and timestamp: $resolved"
