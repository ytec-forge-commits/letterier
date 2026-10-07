$ErrorActionPreference='Stop'
$project=Split-Path $PSScriptRoot -Parent
$clone=Join-Path (Split-Path $project -Parent) 'binsen-kobo/.local/public-source-2.0.1-20261007'
if (-not (Test-Path -LiteralPath (Join-Path $clone 'AGENTS.md') -PathType Leaf)) {
    $clone=$project
}
if (Test-Path -LiteralPath (Join-Path $clone 'distribution/release-2.0.0-checklist.md') -PathType Leaf) {
    throw 'FAIL: canonical public clone fixture unexpectedly contains the private release checklist.'
}
. (Join-Path $project 'scripts/direct-release-documents.ps1')
$stage=Join-Path $project ('.local/direct-public-clone-test-'+[guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $stage | Out-Null
try {
    Copy-LetterierDirectDocuments -ProjectRoot $clone -Stage $stage
    Assert-LetterierDirectDocuments -Stage $stage
    $stageRoot=(Resolve-Path -LiteralPath $stage).Path
    if (Test-Path -LiteralPath (Join-Path $stageRoot 'distribution/release-2.0.0-checklist.md') -PathType Leaf) {
        throw 'FAIL: private release checklist was copied from the canonical public clone.'
    }
    Write-Output 'PASS: canonical public clone without private checklist copies and validates.'
} finally {
    Remove-Item -LiteralPath $stage -Recurse -Force -ErrorAction SilentlyContinue
}
