$ErrorActionPreference='Stop'
$project=Split-Path $PSScriptRoot -Parent
$producer=Join-Path $project 'scripts/package-self-signed-direct.ps1'
# A wrong byte pin must refuse BEFORE signing/build/output-directory creation.
$existing=@(Get-ChildItem -LiteralPath (Join-Path $project 'output') -Directory -Filter 'release-2.0.0-completed-*' | ForEach-Object FullName)
$normalHost=(Get-Process -Id $PID).Path
$output=& $normalHost -NoProfile -File $producer -CompleteExistingBuild -ExpectedBinarySHA256 ('0'*64) -ExpectedInstallerSHA256 ('0'*64) 2>&1
if($LASTEXITCODE -eq 0 -or ($output -join "`n") -notmatch 'Existing build byte pin mismatch'){
    throw 'FAIL: existing-build continuation did not reject mismatching artifact pins at preflight.'
}
$after=@(Get-ChildItem -LiteralPath (Join-Path $project 'output') -Directory -Filter 'release-2.0.0-completed-*' | ForEach-Object FullName)
if(Compare-Object $existing $after){throw 'FAIL: mismatch created a new release output.'}
Write-Output 'PASS: wrong existing-build byte pins reject before creating release output or signing.'
