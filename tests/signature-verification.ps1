# Branch-level regression only. No signing, key creation, store access or writes.
param([string]$PublicCertificatePath)
$ErrorActionPreference = 'Stop'
$project = Split-Path $PSScriptRoot -Parent
if (-not $PublicCertificatePath) {
    $PublicCertificatePath = Join-Path $project 'output/release-1.0.4/Y-TEC-CodeSigning-Public.cer'
}
. (Join-Path $project 'scripts/code-signing.ps1')
$publicCertificate = [Security.Cryptography.X509Certificates.X509Certificate2]::new($PublicCertificatePath)
if ($publicCertificate.HasPrivateKey -or $publicCertificate.Subject -ne $publicCertificate.Issuer) {
    throw 'This test requires an existing public-only self-signed certificate.'
}
# Windows verification is the dependency boundary: produce otherwise hard-to-
# reproduce status results while executing the real release acceptance function.
function Get-AuthenticodeSignature {
    param([string]$LiteralPath)
    return $script:syntheticSignature
}
function Test-LetterierEmbeddedSignature {
    param([string]$Path, [object]$Certificate, [switch]$RequireTimestamp)
    if (-not $script:syntheticProofValid) { throw 'Synthetic cryptographic verification failure.' }
    return [pscustomobject]@{DigestValid=$true; CmsValid=$true; TimestampValid=$script:syntheticTimestampValid}
}
$failures = [Collections.Generic.List[string]]::new()
try {
    foreach ($case in @(
        @{Status='UnknownError'; Proof=$false; Accept=$false},
        @{Status='NotTrusted'; Proof=$false; Accept=$false},
        @{Status='HashMismatch'; Proof=$true; Accept=$false},
        @{Status='NotSigned'; Proof=$true; Accept=$false},
        @{Status='Valid'; Proof=$true; Accept=$true},
        @{Status='Valid'; Proof=$false; Accept=$false},
        @{Status='UnknownError'; Proof=$true; Accept=$true},
        @{Status='NotTrusted'; Proof=$true; Accept=$true},
        @{Status='Valid'; Proof=$true; Required=$true; Present=$false; Timestamp=$false; Accept=$false},
        @{Status='Valid'; Proof=$false; Required=$true; Present=$true; Timestamp=$true; Accept=$false},
        @{Status='UnknownError'; Proof=$true; Required=$true; Present=$true; Timestamp=$true; Accept=$true},
        @{Status='NotTrusted'; Proof=$true; Required=$true; Present=$true; Timestamp=$true; Accept=$true},
        @{Status='UnknownError'; Proof=$true; Required=$true; Present=$true; Timestamp=$false; Accept=$false},
        @{Status='NotTrusted'; Proof=$true; Required=$true; Present=$true; Timestamp=$false; Accept=$false}
    )) {
        $script:syntheticProofValid = $case.Proof
        $script:syntheticTimestampValid = [bool]$case.Timestamp
        $script:syntheticSignature = [pscustomobject]@{
            Status=$case.Status; StatusMessage='Synthetic verification result'
            SignerCertificate=$(if ($case.Status -ne 'NotSigned') {$publicCertificate} else {$null})
            TimeStamperCertificate=$(if($case.Present){$publicCertificate}else{$null}); SignatureType='Authenticode'; IsOSBinary=$false
        }
        $accepted = $false
        try {
            $null = Assert-LetterierSignature -Path (Join-Path $project 'scripts/code-signing.ps1') -Certificate $publicCertificate -RequireTimestamp:([bool]$case.Required)
            $accepted = $true
        } catch { }
        if ($accepted -ne $case.Accept) {
            $failures.Add("$($case.Status) proof=$($case.Proof): expected acceptance=$($case.Accept), actual=$accepted")
        } else { Write-Output "PASS: $($case.Status) proof=$($case.Proof) acceptance=$accepted" }
    }
} finally { $publicCertificate.Dispose() }
if ($failures.Count) { throw ($failures -join '; ') }
Write-Output 'PASS: signature status acceptance (synthetic boundary; not PE/CMS/timestamp proof).'
