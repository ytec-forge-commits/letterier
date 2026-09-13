param()
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path $PSScriptRoot -Parent
$version = (Get-Content -LiteralPath (Join-Path $projectRoot 'package.json') -Raw | ConvertFrom-Json).version
$productName = (Get-Content -LiteralPath (Join-Path $projectRoot 'src-tauri/tauri.conf.json') -Raw -Encoding utf8 | ConvertFrom-Json).productName
$binary = Join-Path $projectRoot ('.local/cargo-target/release/' + $productName + '.exe')
if (-not (Test-Path -LiteralPath $binary)) { throw 'Build the release executable first.' }
$outRoot = Join-Path $projectRoot ('output/review-' + (Get-Date -Format 'yyyyMMdd-HHmmss'))
$stage = Join-Path $outRoot ('LetterAtelier-' + $version + '-windows-x64-review')
New-Item -ItemType Directory -Path $stage | Out-Null
Copy-Item -LiteralPath $binary -Destination $stage
Copy-Item -LiteralPath (Join-Path $projectRoot 'public/legal') -Destination (Join-Path $stage 'legal') -Recurse
foreach ($name in @('README.md','README.en.md','LICENSE','NOTICE','THIRD_PARTY_NOTICES.md','ASSETS_LICENSE.md','BRAND_POLICY.md','LICENSE_EXCEPTIONS.md','PRIVACY.md','IMAGE-FORMATS.md')) {
 Copy-Item -LiteralPath (Join-Path $projectRoot $name) -Destination $stage
}
Copy-Item -LiteralPath (Join-Path $projectRoot 'distribution') -Destination (Join-Path $stage 'distribution') -Recurse
'Local owner review. Unsigned. Do not publish this artifact. WebView2 Runtime is required.' | Set-Content -LiteralPath (Join-Path $stage 'REVIEW-STATUS.txt') -Encoding utf8
$zip = Join-Path $outRoot ('LetterAtelier-' + $version + '-windows-x64-review.zip')
Compress-Archive -LiteralPath $stage -DestinationPath $zip -CompressionLevel Optimal
$installer = Join-Path $projectRoot ('.local/cargo-target/release/bundle/nsis/' + $productName + '_' + $version + '_x64-setup.exe')
Copy-Item -LiteralPath $installer -Destination $outRoot
$hashes = Get-ChildItem -LiteralPath $outRoot -File | Get-FileHash -Algorithm SHA256 | ForEach-Object { $_.Hash.ToLowerInvariant() + '  ' + (Split-Path $_.Path -Leaf) }
$hashes | Set-Content -LiteralPath (Join-Path $outRoot 'SHA256SUMS-review.txt') -Encoding utf8
Write-Output $outRoot
