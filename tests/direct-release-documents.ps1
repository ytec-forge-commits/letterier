$ErrorActionPreference='Stop'
$project=Split-Path $PSScriptRoot -Parent
. (Join-Path $project 'scripts/direct-release-documents.ps1')
$stage=Join-Path $project ('.local/direct-documents-test-'+[guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $stage | Out-Null
Copy-LetterierDirectDocuments -ProjectRoot $project -Stage $stage
Assert-LetterierDirectDocuments -Stage $stage
foreach ($relative in @('ASSETS_LICENSE.md','legal/ASSETS_LICENSE.md')) {
    $content=Get-Content -LiteralPath (Join-Path $stage $relative) -Raw -Encoding utf8
    foreach ($link in [regex]::Matches($content,'\]\(([^)]+)\)')) {
        $url=$link.Groups[1].Value
        if ($url -match '^[a-z]+:|^#') { continue }
        $local=[IO.Path]::GetFullPath((Join-Path (Split-Path (Join-Path $stage $relative) -Parent) $url))
        if (-not (Test-Path -LiteralPath $local -PathType Leaf)) { throw 'Packaged asset notice points at absent font/source files.' }
    }
}
Write-Output 'PASS: actual release documents include legal source and resolve four README inline links.'
# Mutate only our newly-created test copy; preserve the original project docs.
Move-Item -LiteralPath (Join-Path $stage 'ASSET_PROVENANCE.md') -Destination (Join-Path $stage 'missing-provenance.fixture')
$rejected=$false
try { Assert-LetterierDirectDocuments -Stage $stage } catch { $rejected=$true }
if (-not $rejected) { throw 'FAIL: missing linked release document accepted.' }
Write-Output 'PASS: missing linked release document rejected.'
Write-Output ('Evidence retained: '+$stage)
