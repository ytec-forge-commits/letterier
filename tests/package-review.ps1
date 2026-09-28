$ErrorActionPreference = 'Stop'
$project = Split-Path $PSScriptRoot -Parent
$fixture = Join-Path $project ('.local/package-review-test-' + [guid]::NewGuid().ToString('N'))
foreach ($part in @('scripts','public/legal','distribution','docs/manual/ja','docs/manual/en','.local/cargo-target/release/bundle/nsis','src-tauri')) {
 New-Item -ItemType Directory -Path (Join-Path $fixture $part) -Force | Out-Null
}
'{"version":"1.0.1"}' | Set-Content -LiteralPath (Join-Path $fixture 'package.json') -Encoding utf8
'{"productName":"レタリエ"}' | Set-Content -LiteralPath (Join-Path $fixture 'src-tauri/tauri.conf.json') -Encoding utf8
foreach ($name in @('README.md','README.en.md','LICENSE','NOTICE','THIRD_PARTY_NOTICES.md','ASSETS_LICENSE.md','BRAND_POLICY.md','LICENSE_EXCEPTIONS.md','PRIVACY.md','IMAGE-FORMATS.md','public/legal/LICENSE','distribution/README.md','docs/manual/ja/README.md','docs/manual/en/README.md','.local/cargo-target/release/レタリエ.exe','.local/cargo-target/release/bundle/nsis/レタリエ_1.0.0_x64-setup.exe','.local/cargo-target/release/bundle/nsis/レタリエ_1.0.1_x64-setup.exe')) {
 'Synthetic packaging fixture' | Set-Content -LiteralPath (Join-Path $fixture $name) -Encoding utf8
}
Copy-Item -LiteralPath (Join-Path $project 'scripts/package-review.ps1') -Destination (Join-Path $fixture 'scripts/package-review.ps1')
$result = & (Join-Path $fixture 'scripts/package-review.ps1')
$installers = @(Get-ChildItem -LiteralPath $result -Filter '*-setup.exe' -File)
if ($installers.Count -ne 1 -or $installers[0].Name -ne 'レタリエ_1.0.1_x64-setup.exe') {
 throw ('Previous installers leaked into the new review package: ' + ($installers.Name -join ', '))
}
$stage = Get-ChildItem -LiteralPath $result -Directory | Select-Object -First 1
if (-not (Test-Path -LiteralPath (Join-Path $stage.FullName 'manual/ja/README.md')) -or -not (Test-Path -LiteralPath (Join-Path $stage.FullName 'manual/en/README.md'))) {
 throw 'Japanese or English manual was not included in the review package.'
}
Write-Output 'PASS: only the requested version installer and both manuals are included.'
