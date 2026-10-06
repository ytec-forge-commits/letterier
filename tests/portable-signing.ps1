# Exercise our signing decision and real acceptance wrapper at synthetic OS/CMS
# boundaries. No private keys, signing service or certificate store mutations.
$ErrorActionPreference='Stop'
$project=Split-Path $PSScriptRoot -Parent
. (Join-Path $project 'scripts/code-signing.ps1')
. (Join-Path $project 'scripts/signing-host.ps1')
$cert=[Security.Cryptography.X509Certificates.X509Certificate2]::new((Join-Path $project 'output/release-1.0.4/Y-TEC-CodeSigning-Public.cer'))
$fixture=Join-Path $project ('.local/portable-signing-test-'+[guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $fixture | Out-Null
$artifact=[IO.Path]::GetFullPath((Join-Path $fixture 'synthetic-not-for-execution.exe'))
function Get-AuthenticodeSignature {
    param([string]$LiteralPath)
    if($LiteralPath -ne $artifact){throw 'Unexpected artifact.'}
    [pscustomobject]@{Status=$script:status;SignerCertificate=$(if($script:status -ne 'NotSigned'){$cert}else{$null});TimeStamperCertificate=$cert}
}
function Test-LetterierEmbeddedSignature {
    param([string]$Path,[object]$Certificate,[switch]$RequireTimestamp)
    if(-not $script:cryptoValid){throw 'Synthetic crypto rejection.'}
    [pscustomobject]@{DigestValid=$true;CmsValid=$true;TimestampValid=$true}
}
function Get-LetterierSigningInvocation {
    param([string]$ScriptPath,[string]$ArtifactPath)
    if($ScriptPath -ne 'synthetic-signing-boundary' -or $ArtifactPath -ne $artifact){throw 'Wrong signing arguments.'}
    @{cmd='Invoke-SyntheticSigner';args=@('-Path',$ArtifactPath)}
}
function Invoke-SyntheticSigner {
    param([string]$PathSwitch,[string]$Path)
    # Exact OS-signing boundary: produces a test marker, not an Authenticode signature.
    if($PathSwitch -ne '-Path' -or $Path -ne $artifact -or $script:status -ne 'NotSigned'){throw 'Attempt to sign an already-signed fixture or wrong argv.'}
    [IO.File]::WriteAllText($Path,'signed-once-synthetic')
    $script:status='Valid';$global:LASTEXITCODE=0
}
try {
    foreach($case in @(
        @{Status='NotSigned';Crypto=$true;Accept=$true;Changed=$true},
        @{Status='Valid';Crypto=$true;Accept=$true;Changed=$false},
        @{Status='UnknownError';Crypto=$true;Accept=$true;Changed=$false},
        @{Status='HashMismatch';Crypto=$true;Accept=$false;Changed=$false},
        @{Status='UnknownError';Crypto=$false;Accept=$false;Changed=$false}
    )) {
        [IO.File]::WriteAllText($artifact,'original-synthetic')
        $script:status=$case.Status;$script:cryptoValid=$case.Crypto
        $accepted=$false
        $failure=''
        try { Invoke-LetterierUnsignedArtifactSigning -Path $artifact -Certificate $cert -ScriptPath 'synthetic-signing-boundary';$accepted=$true } catch { $failure=$_.Exception.Message }
        if($accepted -ne $case.Accept){throw ('FAIL: signing decision acceptance '+$case.Status+'; '+$failure)}
        $expected=if($case.Changed){'signed-once-synthetic'}else{'original-synthetic'}
        if([IO.File]::ReadAllText($artifact) -ne $expected){throw ('FAIL: signed state was overwritten or unsigned state not signed: '+$case.Status)}
        Write-Output ('PASS: '+$case.Status+' acceptance='+$accepted+' mutation='+$case.Changed)
    }
}finally{$cert.Dispose()}
