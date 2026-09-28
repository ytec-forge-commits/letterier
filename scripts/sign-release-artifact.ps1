param([Parameter(Mandatory = $true)][string]$Path)
$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'code-signing.ps1')
$resolved = (Resolve-Path -LiteralPath $Path).Path
$certificate = Get-LetterierSigningCertificate
$signTool = Get-LetterierWindowsSdkTool -Name 'signtool.exe'
# The language selector is embedded by makensis, outside Tauri's usual DLL callbacks.
$ownedPlugins = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\.local\cargo-target\release\nsis\x64\Plugins\x86-unicode')).TrimEnd('\')
if ([System.IO.Path]::GetDirectoryName($resolved) -eq $ownedPlugins -and [System.IO.Path]::GetFileName($resolved) -ne 'LangDLL.dll') {
    $languageDll = Join-Path $ownedPlugins 'LangDLL.dll'
    if ((Test-Path -LiteralPath $languageDll) -and (Get-AuthenticodeSignature -LiteralPath $languageDll).Status -eq 'NotSigned') {
        & $signTool sign /fd SHA256 /sha1 $certificate.Thumbprint /s My /tr 'http://timestamp.digicert.com' /td SHA256 $languageDll
        if ($LASTEXITCODE -ne 0) { throw 'Signing the bundled NSIS language selector failed.' }
        $null = Assert-LetterierSignature -Path $languageDll -Certificate $certificate -RequireTimestamp
    }
}
& $signTool sign /fd SHA256 /sha1 $certificate.Thumbprint /s My /tr 'http://timestamp.digicert.com' /td SHA256 $resolved
if ($LASTEXITCODE -ne 0) { throw "SignTool failed: $resolved" }
$null = Assert-LetterierSignature -Path $resolved -Certificate $certificate -RequireTimestamp
Write-Output "Verified Y-TEC self-signed Authenticode signature and timestamp: $resolved"
