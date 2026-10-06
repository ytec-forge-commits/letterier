$ErrorActionPreference='Stop'
$project=Split-Path $PSScriptRoot -Parent
$helper=Join-Path $project 'scripts/signing-host.ps1'
if (-not (Test-Path -LiteralPath $helper)) { throw 'FAIL: policy-respecting signing host adapter is missing.' }
. $helper
$artifact='Synthetic 日本語 artifact with spaces;not-a-command.exe'
$invocation=Get-LetterierSigningInvocation -ScriptPath (Join-Path $PSScriptRoot 'fixtures/signing-host-probe.ps1') -ArtifactPath $artifact
$arguments=$invocation.Args
$output=& $invocation.Cmd @arguments
if ($LASTEXITCODE -ne 0) { throw 'FAIL: normal signing child host could not run the probe.' }
$observed=$output | ConvertFrom-Json
if ($observed.Artifact -cne $artifact -or $observed.Major -lt 7 -or $observed.Policy -notin @('RemoteSigned','AllSigned')) {
    throw 'FAIL: child altered its artifact argument, runtime or normal execution policy.'
}
Write-Output 'PASS: signing child preserves literal artifact path and respects normal PowerShell7 policy.'
