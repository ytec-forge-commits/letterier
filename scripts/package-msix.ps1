param(
 [Parameter(Mandatory=$true)][ValidatePattern('^[A-Za-z0-9.-]{3,50}$')][string]$IdentityName,
 [Parameter(Mandatory=$true)][ValidateNotNullOrEmpty()][string]$Publisher
)
$ErrorActionPreference = 'Stop'
if (-not $Publisher.StartsWith('CN=')) { throw 'Use the exact Publisher distinguished name from Partner Center.' }
$projectRoot = Split-Path $PSScriptRoot -Parent
$version = (Get-Content -LiteralPath (Join-Path $projectRoot 'package.json') -Raw | ConvertFrom-Json).version + '.0'
$binary = Join-Path $projectRoot '.local/cargo-target/release/レタリエ.exe'
if (-not (Test-Path -LiteralPath $binary)) { throw 'Build the release executable first.' }
$sdk = Get-ChildItem -LiteralPath 'C:/Program Files (x86)/Windows Kits/10/bin' -Directory | Sort-Object Name -Descending | Where-Object { Test-Path -LiteralPath (Join-Path $_.FullName 'x64/makeappx.exe') } | Select-Object -First 1
if (-not $sdk) { throw 'Windows SDK MakeAppx is required.' }
$outRoot = Join-Path $projectRoot ('output/msix-' + (Get-Date -Format 'yyyyMMdd-HHmmss'))
$stage = Join-Path $outRoot 'package'
New-Item -ItemType Directory -Path $stage | Out-Null
Copy-Item -LiteralPath $binary -Destination $stage
Copy-Item -LiteralPath (Join-Path $projectRoot 'public/legal') -Destination (Join-Path $stage 'legal') -Recurse
Copy-Item -LiteralPath (Join-Path $projectRoot 'distribution/msix/Assets') -Destination (Join-Path $stage 'Assets') -Recurse
$identityXml = [System.Security.SecurityElement]::Escape($IdentityName)
$publisherXml = [System.Security.SecurityElement]::Escape($Publisher)
$manifest = @"
<?xml version="1.0" encoding="utf-8"?>
<Package xmlns="http://schemas.microsoft.com/appx/manifest/foundation/windows10" xmlns:uap="http://schemas.microsoft.com/appx/manifest/uap/windows10" xmlns:uap10="http://schemas.microsoft.com/appx/manifest/uap/windows10/10" xmlns:rescap="http://schemas.microsoft.com/appx/manifest/foundation/windows10/restrictedcapabilities" IgnorableNamespaces="uap uap10 rescap">
 <Identity Name="$identityXml" Publisher="$publisherXml" Version="$version" ProcessorArchitecture="x64" />
 <Properties><DisplayName>レタリエ</DisplayName><PublisherDisplayName>Y-TEC</PublisherDisplayName><Logo>Assets\StoreLogo.png</Logo></Properties>
 <Resources><Resource Language="ja-jp" /></Resources>
 <Dependencies><TargetDeviceFamily Name="Windows.Desktop" MinVersion="10.0.19041.0" MaxVersionTested="10.0.26100.0" /></Dependencies>
 <Applications><Application Id="LetterAtelier" Executable="レタリエ.exe" uap10:RuntimeBehavior="packagedClassicApp" uap10:TrustLevel="mediumIL">
  <uap:VisualElements DisplayName="レタリエ" Description="手紙・便箋作成アプリ" BackgroundColor="transparent" Square150x150Logo="Assets\Square150x150Logo.png" Square44x44Logo="Assets\Square44x44Logo.png" />
  <Extensions><uap:Extension Category="windows.fileTypeAssociation"><uap:FileTypeAssociation Name="binsen"><uap:DisplayName>レタリエの手紙</uap:DisplayName><uap:SupportedFileTypes><uap:FileType>.binsen</uap:FileType></uap:SupportedFileTypes></uap:FileTypeAssociation></uap:Extension></Extensions>
 </Application></Applications>
 <Capabilities><rescap:Capability Name="runFullTrust" /></Capabilities>
</Package>
"@
$manifest | Set-Content -LiteralPath (Join-Path $stage 'AppxManifest.xml') -Encoding utf8
$package = Join-Path $outRoot ('LetterAtelier-' + $version + '-x64-unsigned.msix')
& (Join-Path $sdk.FullName 'x64/makeappx.exe') pack /d $stage /p $package
if ($LASTEXITCODE -ne 0) { throw 'MakeAppx failed.' }
Get-FileHash -LiteralPath $package -Algorithm SHA256 | Format-List
Write-Output $package
