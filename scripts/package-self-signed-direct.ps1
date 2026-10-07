param(
    [switch]$CompleteExistingBuild,
    [string]$CandidateSuffix,
    [string]$ExpectedBinarySHA256,
    [string]$ExpectedInstallerSHA256
)
$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'code-signing.ps1')
. (Join-Path $PSScriptRoot 'direct-release-output.ps1')
. (Join-Path $PSScriptRoot 'signing-host.ps1')
. (Join-Path $PSScriptRoot 'direct-release-documents.ps1')
$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$package = Get-Content -Raw -LiteralPath (Join-Path $projectRoot 'package.json') | ConvertFrom-Json
$version = [string]$package.version
$tauriConfig = Get-Content -Raw -Encoding utf8 -LiteralPath (Join-Path $projectRoot 'src-tauri\tauri.conf.json') | ConvertFrom-Json
$productName = [string]$tauriConfig.productName
$outputRoot = Get-LetterierDirectReleaseOutputPath -OutputRoot (Join-Path $projectRoot 'output') -Version $version -CandidateSuffix $CandidateSuffix -AllowExisting:$CompleteExistingBuild
if ($CompleteExistingBuild) {
    # A failed attempt is retained; complete the exact observed build into a
    # fresh output rather than rebuilding, overwriting or deleting evidence.
    $outputRoot = $outputRoot + '-completed-' + [Guid]::NewGuid().ToString('N')
}
$temporaryRoot = Join-Path $projectRoot ('.local\direct-release-' + [Guid]::NewGuid().ToString('N'))
$configPath = Join-Path $temporaryRoot 'tauri-signing.json'
$stage = Join-Path $temporaryRoot "Letterier-$version-windows-x64-self-signed"
$extract = Join-Path $temporaryRoot 'verify-extract'
$signingScript = (Join-Path $PSScriptRoot 'sign-release-artifact.ps1').Replace('\','/')
$signingInvocation = Get-LetterierSigningInvocation -ScriptPath $signingScript -ArtifactPath '%1'
$binary = Join-Path $projectRoot ('.local\cargo-target\release\' + $productName + '.exe')
$installer = Join-Path $projectRoot ('.local\cargo-target\release\bundle\nsis\' + $productName + '_' + $version + '_x64-setup.exe')
if ($CompleteExistingBuild) {
    if ($ExpectedBinarySHA256 -notmatch '^[0-9a-fA-F]{64}$' -or $ExpectedInstallerSHA256 -notmatch '^[0-9a-fA-F]{64}$' -or
        (Get-FileHash -LiteralPath $binary -Algorithm SHA256).Hash -ne $ExpectedBinarySHA256 -or
        (Get-FileHash -LiteralPath $installer -Algorithm SHA256).Hash -ne $ExpectedInstallerSHA256) {
        throw 'Existing build byte pin mismatch; no build, signing or output creation attempted.'
    }
}
$certificate = Get-LetterierSigningCertificate
if ($CompleteExistingBuild) { $null=Assert-LetterierSignature -Path $installer -Certificate $certificate -RequireTimestamp }
try {
    New-Item -ItemType Directory -Path $temporaryRoot,$stage,$outputRoot | Out-Null
    $prebuild = Join-Path $temporaryRoot 'prebuild'
    New-Item -ItemType Directory -Path $prebuild | Out-Null
    $prebuildHashes = foreach ($source in @($binary,$installer)) {
        if (Test-Path -LiteralPath $source -PathType Leaf) {
            $before = (Get-FileHash -LiteralPath $source -Algorithm SHA256).Hash
            $copy = Join-Path $prebuild (Split-Path -Leaf $source)
            Copy-Item -LiteralPath $source -Destination $copy -ErrorAction Stop
            if ((Get-FileHash -LiteralPath $copy -Algorithm SHA256).Hash -ne $before) { throw 'Prebuild preservation hash mismatch.' }
            '{0}  {1}' -f $before.ToLowerInvariant(), (Split-Path -Leaf $copy)
        }
    }
    [IO.File]::WriteAllLines((Join-Path $prebuild 'PREBUILD-SHA256SUMS.txt'),[string[]]@($prebuildHashes),[Text.UTF8Encoding]::new($false))
    $signingConfig = @{
        bundle = @{ windows = @{ signCommand = $signingInvocation } }
    } | ConvertTo-Json -Depth 8
    [System.IO.File]::WriteAllText($configPath, $signingConfig, [System.Text.UTF8Encoding]::new($false))

    if (-not $CompleteExistingBuild) {
        Push-Location $projectRoot
        try {
            & node scripts/native.mjs tauri build --config $configPath
            if ($LASTEXITCODE -ne 0) { throw 'The signed Tauri build failed.' }
        }
        finally { Pop-Location }
    }

    # Tauri restores the unsigned/unpatched main EXE after embedding the signed
    # NSIS variant. Sign that portable variant once, only if truly unsigned.
    Invoke-LetterierUnsignedArtifactSigning -Path $binary -Certificate $certificate -ScriptPath $signingScript
    $null = Assert-LetterierSignature -Path $installer -Certificate $certificate -RequireTimestamp

    Copy-Item -LiteralPath $binary -Destination (Join-Path $stage 'Letterier.exe')
    Copy-LetterierDirectDocuments -ProjectRoot $projectRoot -Stage $stage
    Copy-Item -LiteralPath (Join-Path $projectRoot ("output\pdf\Letterier-Manual-ja-$version.pdf")) -Destination $stage
    Copy-Item -LiteralPath (Join-Path $projectRoot ("output\pdf\Letterier-Manual-en-$version.pdf")) -Destination $stage
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
    $null = Assert-LetterierSignature -Path $publishedInstaller -Certificate $certificate -RequireTimestamp
    Assert-LetterierDirectDocuments -Stage $extractedBinary.Directory.FullName

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
        Write-Output "SIGNING_EVIDENCE_RETAINED=$temporaryRoot"
    }
}
