$ErrorActionPreference='Stop'
$project=Split-Path $PSScriptRoot -Parent
. (Join-Path $project 'scripts/direct-release-documents.ps1')
$stage=Join-Path $project ('.local/direct-documents-test-'+[guid]::NewGuid().ToString('N'))
$sourceFixture=Join-Path $stage 'source-fixture'
New-Item -ItemType Directory -Path $sourceFixture | Out-Null
Copy-Item -LiteralPath (Join-Path $project 'docs/manual') -Destination (Join-Path $sourceFixture 'docs/manual') -Recurse
Copy-Item -LiteralPath (Join-Path $project 'public/legal') -Destination (Join-Path $sourceFixture 'public/legal') -Recurse
foreach ($name in @('SAVE-RECOVERY-VALIDATION.md','NATIVE-OUTPUT-VALIDATION.md','PERFORMANCE-VALIDATION.md','PALETTE-VALIDATION.md','SECURITY-REVIEW.md')) {
    New-Item -ItemType Directory -Path (Join-Path $sourceFixture 'docs') -Force | Out-Null
    Copy-Item -LiteralPath (Join-Path $project ('docs/'+$name)) -Destination (Join-Path $sourceFixture 'docs')
}
New-Item -ItemType Directory -Path (Join-Path $sourceFixture 'distribution') -Force | Out-Null
foreach ($name in @('README.md','README-VECTOR.txt')) {
    Copy-Item -LiteralPath (Join-Path $project ('distribution/'+$name)) -Destination (Join-Path $sourceFixture 'distribution')
}
foreach ($name in @('README.md','README.en.md','LICENSE','NOTICE','THIRD_PARTY_NOTICES.md','ASSETS_LICENSE.md','ASSET_PROVENANCE.md','BRAND_POLICY.md','LICENSE_EXCEPTIONS.md','PRIVACY.md','IMAGE-FORMATS.md','CODE_SIGNING_POLICY.md','CHANGELOG.md')) {
    Copy-Item -LiteralPath (Join-Path $project $name) -Destination $sourceFixture
}
New-Item -ItemType Directory -Path $stage -Force | Out-Null
Copy-LetterierDirectDocuments -ProjectRoot $sourceFixture -Stage $stage
Assert-LetterierDirectDocuments -Stage $stage
$stageRoot=(Resolve-Path -LiteralPath $stage).Path
$stageNames=@(Get-ChildItem -LiteralPath $stageRoot -Recurse -File | ForEach-Object {
    [IO.Path]::GetRelativePath($stageRoot,$_.FullName).Replace('\','/')
})
if ($stageNames -contains 'distribution/release-2.0.0-checklist.md') {
    throw 'FAIL: private release checklist was copied into the public document stage.'
}
foreach ($relative in @(
    'legal/README.md',
    'legal/README.en.md',
    'distribution/README.md'
)) {
    $content=Get-Content -LiteralPath (Join-Path $stageRoot $relative) -Raw -Encoding utf8
    foreach ($match in [regex]::Matches($content,'\]\(([^)]+)\)')) {
        $target=$match.Groups[1].Value
        if ($target -match '^[a-z]+:|^#') { continue }
        $resolved=[Uri]::new([Uri]('https://release.invalid/'+$relative),$target)
        $wanted=[Uri]::UnescapeDataString($resolved.AbsolutePath.TrimStart('/'))
        if ($stageNames -notcontains $wanted) {
            throw ('FAIL: required staged document link is missing: '+$relative+' -> '+$target)
        }
    }
}
foreach ($relative in @('ASSETS_LICENSE.md','legal/ASSETS_LICENSE.md')) {
    $content=Get-Content -LiteralPath (Join-Path $stage $relative) -Raw -Encoding utf8
    foreach ($link in [regex]::Matches($content,'\]\(([^)]+)\)')) {
        $url=$link.Groups[1].Value
        if ($url -match '^[a-z]+:|^#') { continue }
        $local=[IO.Path]::GetFullPath((Join-Path (Split-Path (Join-Path $stage $relative) -Parent) $url))
        if (-not (Test-Path -LiteralPath $local -PathType Leaf)) { throw 'Packaged asset notice points at absent font/source files.' }
    }
}
Write-Output 'PASS: public source fixture without the private checklist copies and resolves public README links.'
# Mutate only our newly-created test copy; preserve the original project docs.
Move-Item -LiteralPath (Join-Path $stage 'ASSET_PROVENANCE.md') -Destination (Join-Path $stage 'missing-provenance.fixture')
$rejected=$false; $failure=''
try { Assert-LetterierDirectDocuments -Stage $stage } catch { $rejected=$true; $failure=$_.Exception.Message }
if (-not $rejected -or $failure -notmatch 'Missing release document: ASSET_PROVENANCE\.md') { throw 'FAIL: missing provenance document was not rejected for its own reason.' }
Move-Item -LiteralPath (Join-Path $stage 'missing-provenance.fixture') -Destination (Join-Path $stage 'ASSET_PROVENANCE.md')
Write-Output 'PASS: missing linked release document rejected.'
$baseline=$true
try { Assert-LetterierDirectDocuments -Stage $stage } catch { $baseline=$false }
if (-not $baseline) { throw 'FAIL: legal README mutation did not start from a passing baseline.' }
$missingLegal=Join-Path $stage 'legal/README.en.md.missing-fixture'
Move-Item -LiteralPath (Join-Path $stage 'legal/README.en.md') -Destination $missingLegal
try {
    $rejected=$false; $failure=''
    try { Assert-LetterierDirectDocuments -Stage $stage } catch { $rejected=$true; $failure=$_.Exception.Message }
    if (-not $rejected -or $failure -notmatch 'Broken direct README link: legal/README\.md -> README\.en\.md') { throw 'FAIL: missing legal README link was not rejected for its own reason.' }
} finally {
    Move-Item -LiteralPath $missingLegal -Destination (Join-Path $stage 'legal/README.en.md')
}
Write-Output 'PASS: missing legal README link rejected.'
$baseline=$true
try { Assert-LetterierDirectDocuments -Stage $stage } catch { $baseline=$false }
if (-not $baseline) { throw 'FAIL: distribution README mutation did not start from a passing baseline.' }
$missingDistributionReadme=Join-Path $stage 'distribution/README.md.missing-fixture'
Move-Item -LiteralPath (Join-Path $stage 'distribution/README.md') -Destination $missingDistributionReadme
try {
    $rejected=$false; $failure=''
    try { Assert-LetterierDirectDocuments -Stage $stage } catch { $rejected=$true; $failure=$_.Exception.Message }
    if (-not $rejected -or $failure -notmatch 'Missing release document: distribution/README\.md') { throw 'FAIL: missing distribution README was not rejected for its own reason.' }
} finally {
    Move-Item -LiteralPath $missingDistributionReadme -Destination (Join-Path $stage 'distribution/README.md')
}
Write-Output 'PASS: missing public distribution README rejected.'
Write-Output ('Evidence retained: '+$stage)
