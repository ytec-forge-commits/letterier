param()
$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'code-signing.ps1')
$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$package = Get-Content -Raw -LiteralPath (Join-Path $projectRoot 'package.json') | ConvertFrom-Json
$version = [string]$package.version
$tauriConfig = Get-Content -Raw -Encoding utf8 -LiteralPath (Join-Path $projectRoot 'src-tauri\tauri.conf.json') | ConvertFrom-Json
$productName = [string]$tauriConfig.productName
$outputRoot = Join-Path $projectRoot "output\release-$version"
if (Test-Path -LiteralPath $outputRoot) { throw "Refusing to overwrite an existing release candidate: $outputRoot" }
$temporaryRoot = Join-Path $projectRoot ('.local\direct-release-' + [Guid]::NewGuid().ToString('N'))
$configPath = Join-Path $temporaryRoot 'tauri-signing.json'
$stage = Join-Path $temporaryRoot "Letterier-$version-windows-x64-self-signed"
$extract = Join-Path $temporaryRoot 'verify-extract'
$signingScript = (Join-Path $PSScriptRoot 'sign-release-artifact.ps1').Replace('\','/')
try {
    New-Item -ItemType Directory -Path $temporaryRoot,$stage,$outputRoot | Out-Null
    $signingConfig = @{
        bundle = @{ windows = @{ signCommand = @{ cmd = 'powershell.exe'; args = @('-NoProfile','-ExecutionPolicy','Bypass','-File',$signingScript,'-Path','%1') } } }
    } | ConvertTo-Json -Depth 8
    [System.IO.File]::WriteAllText($configPath, $signingConfig, [System.Text.UTF8Encoding]::new($false))

    Push-Location $projectRoot
    try {
        & node scripts/native.mjs tauri build --config $configPath
        if ($LASTEXITCODE -ne 0) { throw 'The signed Tauri build failed.' }
    }
    finally { Pop-Location }

    $binary = Join-Path $projectRoot ('.local\cargo-target\release\' + $productName + '.exe')
    $installer = Join-Path $projectRoot ('.local\cargo-target\release\bundle\nsis\' + $productName + '_' + $version + '_x64-setup.exe')
    & powershell.exe -NoProfile -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot 'sign-release-artifact.ps1') -Path $binary
    if ($LASTEXITCODE -ne 0) { throw 'Signing the portable application executable failed.' }
    $certificate = Get-LetterierSigningCertificate
    $null = Assert-LetterierSignature -Path $binary -Certificate $certificate -RequireTimestamp
    $null = Assert-LetterierSignature -Path $installer -Certificate $certificate -RequireTimestamp

    Copy-Item -LiteralPath $binary -Destination (Join-Path $stage 'Letterier.exe')
    Copy-Item -LiteralPath (Join-Path $projectRoot 'docs\manual') -Destination (Join-Path $stage 'manual') -Recurse
    Copy-Item -LiteralPath (Join-Path $projectRoot 'public\legal') -Destination (Join-Path $stage 'legal') -Recurse
    Copy-Item -LiteralPath (Join-Path $projectRoot ("output\pdf\Letterier-Manual-ja-$version.pdf")) -Destination $stage
    Copy-Item -LiteralPath (Join-Path $projectRoot ("output\pdf\Letterier-Manual-en-$version.pdf")) -Destination $stage
    Copy-Item -LiteralPath (Join-Path $projectRoot 'distribution\README-VECTOR.txt') -Destination $stage
    foreach ($name in @('README.md','README.en.md','LICENSE','NOTICE','THIRD_PARTY_NOTICES.md','ASSETS_LICENSE.md','BRAND_POLICY.md','LICENSE_EXCEPTIONS.md','PRIVACY.md','IMAGE-FORMATS.md','CODE_SIGNING_POLICY.md','CHANGELOG.md')) {
        Copy-Item -LiteralPath (Join-Path $projectRoot $name) -Destination $stage
    }
    $notice = @"
Letterier $version - Windows x64 direct distribution

Letterier.exe is Authenticode-signed with a Y-TEC self-signed certificate and an RFC 3161 timestamp.
The certificate is not installed into Windows trust stores. Windows or SmartScreen may still show a warning.
Letters and images remain on this PC during ordinary use. Microsoft WebView2 Runtime is required.
Read README-VECTOR.txt first for system requirements, installation, removal, license, and author contact details.
"@
    [System.IO.File]::WriteAllText((Join-Path $stage 'DIRECT-DISTRIBUTION.txt'), $notice, [System.Text.UTF8Encoding]::new($false))

    $archive = Join-Path $outputRoot "Letterier-$version-windows-x64-self-signed.zip"
    Compress-Archive -LiteralPath $stage -DestinationPath $archive -CompressionLevel Optimal
    $publishedInstaller = Join-Path $outputRoot "Letterier-$version-windows-x64-self-signed-setup.exe"
    Copy-Item -LiteralPath $installer -Destination $publishedInstaller
    $jaManual = Join-Path $outputRoot "Letterier-Manual-ja-$version.pdf"
    $enManual = Join-Path $outputRoot "Letterier-Manual-en-$version.pdf"
    Copy-Item -LiteralPath (Join-Path $projectRoot ("output\pdf\Letterier-Manual-ja-$version.pdf")) -Destination $jaManual
    Copy-Item -LiteralPath (Join-Path $projectRoot ("output\pdf\Letterier-Manual-en-$version.pdf")) -Destination $enManual
    $certificatePath = Join-Path $outputRoot 'Y-TEC-CodeSigning-Public.cer'
    Export-Certificate -Cert $certificate -FilePath $certificatePath -Type CERT -Force | Out-Null

    Expand-Archive -LiteralPath $archive -DestinationPath $extract
    $extractedBinary = Get-ChildItem -LiteralPath $extract -Recurse -File -Filter 'Letterier.exe' | Select-Object -First 1
    if (-not $extractedBinary) { throw 'The portable ZIP is missing Letterier.exe.' }
    $null = Assert-LetterierSignature -Path $extractedBinary.FullName -Certificate $certificate -RequireTimestamp
    $privateFiles = Get-ChildItem -LiteralPath $extract -Recurse -File | Where-Object { $_.Extension -in @('.pfx','.p12','.key') }
    if ($privateFiles) { throw 'A private-key file format was found in the portable ZIP.' }

    $published = @($archive,$publishedInstaller,$jaManual,$enManual,$certificatePath)
    $hashLines = foreach ($file in $published) {
        '{0}  {1}' -f (Get-FileHash -Algorithm SHA256 -LiteralPath $file).Hash.ToLowerInvariant(), (Split-Path -Leaf $file)
    }
    $hashPath = Join-Path $outputRoot 'SHA256SUMS.txt'
    [System.IO.File]::WriteAllLines($hashPath, [string[]]$hashLines, [System.Text.UTF8Encoding]::new($false))
    foreach ($line in Get-Content -LiteralPath $hashPath) {
        $parts = $line -split '  ',2
        $actual = (Get-FileHash -Algorithm SHA256 -LiteralPath (Join-Path $outputRoot $parts[1])).Hash.ToLowerInvariant()
        if ($actual -ne $parts[0]) { throw "SHA-256 verification failed: $($parts[1])" }
    }
    Write-Output "SELF_SIGNED_RELEASE=$outputRoot"
}
finally {
    if (Test-Path -LiteralPath $temporaryRoot) {
        $resolvedTemporary = [System.IO.Path]::GetFullPath($temporaryRoot)
        $resolvedLocal = [System.IO.Path]::GetFullPath((Join-Path $projectRoot '.local')).TrimEnd('\') + '\'
        if (-not $resolvedTemporary.StartsWith($resolvedLocal, [System.StringComparison]::OrdinalIgnoreCase)) { throw 'Temporary directory safety check failed.' }
        Remove-Item -LiteralPath $resolvedTemporary -Recurse -Force
    }
}
