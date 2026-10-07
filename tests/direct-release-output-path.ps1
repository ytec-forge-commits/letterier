$ErrorActionPreference='Stop'
$project=Split-Path $PSScriptRoot -Parent
$helper=Join-Path $project 'scripts/direct-release-output.ps1'
if (Test-Path -LiteralPath $helper) { . $helper }

function Assert-PathEqual([string]$actual,[string]$expected,[string]$message) {
    if ([IO.Path]::GetFullPath($actual) -ne [IO.Path]::GetFullPath($expected)) { throw "FAIL: $message`nExpected: $expected`nActual: $actual" }
}

if (-not (Get-Command Get-LetterierDirectReleaseOutputPath -ErrorAction SilentlyContinue)) {
    throw 'FAIL: output path selector is not available.'
}

$testRoot=Join-Path $project ('.local/direct-release-output-path-'+[guid]::NewGuid().ToString('N'))
$localRoot=[IO.Path]::GetFullPath((Join-Path $project '.local')).TrimEnd('\')+'\'
$expectedTestRoot=[IO.Path]::GetFullPath($testRoot)
if (-not $expectedTestRoot.StartsWith($localRoot,[StringComparison]::OrdinalIgnoreCase)) { throw 'FAIL: output fixture escaped project .local.' }
New-Item -ItemType Directory -Path $testRoot | Out-Null
try {
    Assert-PathEqual (Get-LetterierDirectReleaseOutputPath -OutputRoot $testRoot -Version '2.0.1') (Join-Path $testRoot 'release-2.0.1') 'default output name changed.'
    Assert-PathEqual (Get-LetterierDirectReleaseOutputPath -OutputRoot $testRoot -Version '2.0.1' -CandidateSuffix 'docfix-20261007') (Join-Path $testRoot 'release-2.0.1-docfix-20261007') 'candidate output name changed.'

    foreach ($bad in @('..','../escape','..\escape','docfix/20261007','docfix\20261007','docfix..20261007')) {
        $rejected=$false
        try { $null=Get-LetterierDirectReleaseOutputPath -OutputRoot $testRoot -Version '2.0.1' -CandidateSuffix $bad } catch { $rejected=$true }
        if (-not $rejected) { throw "FAIL: invalid candidate suffix accepted: $bad" }
    }

    $existing=Join-Path $testRoot 'release-2.0.1-docfix-existing-fixture'
    $expectedExisting=[IO.Path]::GetFullPath($existing)
    New-Item -ItemType Directory -Path $existing | Out-Null
    try {
        $rejected=$false
        try { $null=Get-LetterierDirectReleaseOutputPath -OutputRoot $testRoot -Version '2.0.1' -CandidateSuffix 'docfix-existing-fixture' } catch { $rejected=$true }
        if (-not $rejected) { throw 'FAIL: existing candidate output directory was accepted.' }
    } finally {
        $resolvedExisting=[IO.Path]::GetFullPath((Resolve-Path -LiteralPath $existing -ErrorAction Stop).Path)
        if ($resolvedExisting -ne $expectedExisting -or -not $resolvedExisting.StartsWith($expectedTestRoot+'\',[StringComparison]::OrdinalIgnoreCase)) { throw 'FAIL: existing fixture cleanup target changed.' }
        Remove-Item -LiteralPath $resolvedExisting -Recurse -Force
    }
} finally {
    $resolvedTestRoot=[IO.Path]::GetFullPath((Resolve-Path -LiteralPath $testRoot -ErrorAction Stop).Path)
    if ($resolvedTestRoot -ne $expectedTestRoot -or -not $resolvedTestRoot.StartsWith($localRoot,[StringComparison]::OrdinalIgnoreCase)) { throw 'FAIL: output fixture cleanup target changed.' }
    Remove-Item -LiteralPath $resolvedTestRoot -Recurse -Force
}
Write-Output 'PASS: default, candidate, invalid-suffix, and existing-directory output selection contracts.'

$outputRoot=Join-Path $project 'output'
$producer=Join-Path $project 'scripts/package-self-signed-direct.ps1'
$suffix='docfix-resume-pin-fixture'
$candidate=Join-Path $outputRoot ('release-2.0.1-'+$suffix)
if (Test-Path -LiteralPath $candidate) { throw "Fixture path unexpectedly exists: $candidate" }
$powershellHost=(Get-Process -Id $PID -ErrorAction Stop).Path
if ([string]::IsNullOrWhiteSpace($powershellHost)) { throw 'FAIL: current PowerShell host path is unavailable; refusing a different host.' }
$output=& $powershellHost -NoProfile -File $producer -CandidateSuffix $suffix -CompleteExistingBuild -ExpectedBinarySHA256 ('0'*64) -ExpectedInstallerSHA256 ('0'*64) 2>&1
if ($LASTEXITCODE -eq 0 -or ($output -join "`n") -notmatch 'Existing build byte pin mismatch') {
    throw 'FAIL: candidate resume with invalid byte pins was not rejected before build/sign/output.'
}
if (Test-Path -LiteralPath $candidate) { throw 'FAIL: invalid candidate resume created an output directory.' }
Write-Output 'PASS: invalid candidate resume pins reject before build, signing, or output creation.'
