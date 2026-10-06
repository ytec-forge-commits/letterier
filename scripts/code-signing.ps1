function Test-LetterierEmbeddedSignature {
    param(
        [Parameter(Mandatory = $true)][string]$Path,
        [Parameter(Mandatory = $true)][System.Security.Cryptography.X509Certificates.X509Certificate2]$Certificate,
        [switch]$RequireTimestamp
    )
    if ($PSVersionTable.PSVersion.Major -lt 7) { throw 'Embedded verification requires PowerShell 7 with its existing policy.' }
    if (-not ('Letterier.Release.EmbeddedSignature' -as [type])) {
        Add-Type -AssemblyName System.Security.Cryptography.Pkcs
        $references = @(Get-ChildItem -LiteralPath (Join-Path $PSHOME 'ref') -Filter '*.dll' | ForEach-Object FullName)
        $references += [System.Security.Cryptography.Pkcs.SignedCms].Assembly.Location
        Add-Type -Path (Join-Path $PSScriptRoot 'EmbeddedSignature.cs') -ReferencedAssemblies $references
    }
    $resolved = (Resolve-Path -LiteralPath $Path).Path
    return [Letterier.Release.EmbeddedSignature]::Verify($resolved, $Certificate.RawData, [bool]$RequireTimestamp)
}

function Get-LetterierWindowsSdkTool {
    param([Parameter(Mandatory = $true)][ValidateSet('signtool.exe')][string]$Name)
    $roots = @(
        (Join-Path ${env:ProgramFiles(x86)} 'Windows Kits\10\bin'),
        (Join-Path $env:ProgramFiles 'Windows Kits\10\bin')
    ) | Where-Object { $_ -and (Test-Path -LiteralPath $_ -PathType Container) }
    $candidates = foreach ($root in $roots) {
        Get-ChildItem -LiteralPath $root -Directory -ErrorAction SilentlyContinue | ForEach-Object {
            $candidate = Join-Path $_.FullName "x64\$Name"
            if (Test-Path -LiteralPath $candidate -PathType Leaf) {
                try { $version = [version]$_.Name } catch { $version = [version]'0.0' }
                [pscustomobject]@{ Version = $version; Path = $candidate }
            }
        }
    }
    $tool = $candidates | Sort-Object Version -Descending | Select-Object -First 1
    if (-not $tool) { throw "$Name was not found. Install or repair the Windows SDK." }
    return $tool.Path
}

function Test-LetterierPrivateKeyNonExportable {
    param([Parameter(Mandatory = $true)][System.Security.Cryptography.X509Certificates.X509Certificate2]$Certificate)
    $rsa = [System.Security.Cryptography.X509Certificates.RSACertificateExtensions]::GetRSAPrivateKey($Certificate)
    if (-not $rsa) { return $false }
    try {
        if ($rsa -is [System.Security.Cryptography.RSACng]) {
            $flags = [System.Security.Cryptography.CngExportPolicies]::AllowExport -bor
                [System.Security.Cryptography.CngExportPolicies]::AllowPlaintextExport -bor
                [System.Security.Cryptography.CngExportPolicies]::AllowArchiving -bor
                [System.Security.Cryptography.CngExportPolicies]::AllowPlaintextArchiving
            return ($rsa.Key.ExportPolicy -band $flags) -eq 0
        }
        if ($rsa -is [System.Security.Cryptography.RSACryptoServiceProvider]) {
            return -not $rsa.CspKeyContainerInfo.Exportable
        }
        return $false
    }
    finally { $rsa.Dispose() }
}

function Get-LetterierSigningCertificate {
    $now = Get-Date
    $codeSigningOid = '1.3.6.1.5.5.7.3.3'
    # Continue the existing published identity, rather than selecting the newest
    # of several historical Y-TEC certificates. This reads public DER only.
    $pinPath = Join-Path $PSScriptRoot '../output/release-1.0.4/Y-TEC-CodeSigning-Public.cer'
    $pin = [System.Security.Cryptography.X509Certificates.X509Certificate2]::new((Resolve-Path -LiteralPath $pinPath).Path)
    try {
    $certificate = @(Get-ChildItem -LiteralPath 'Cert:\CurrentUser\My' |
        Where-Object {
            $_.Thumbprint -eq $pin.Thumbprint -and
            $_.Subject -eq 'CN=Y-TEC' -and
            $_.Issuer -eq $_.Subject -and
            $_.HasPrivateKey -and
            $_.NotBefore -le $now -and
            $_.NotAfter -gt $now -and
            $codeSigningOid -in @($_.EnhancedKeyUsageList | ForEach-Object {
                if ($_.ObjectId -is [System.Security.Cryptography.Oid]) { $_.ObjectId.Value } else { [string]$_.ObjectId }
            }) -and
            (Test-LetterierPrivateKeyNonExportable -Certificate $_)
        })
    if ($certificate.Count -ne 1) { throw 'Exactly one eligible signer matching the prior published public certificate is required.' }
    return $certificate[0]
    } finally { $pin.Dispose() }
}

function Assert-LetterierSignature {
    param(
        [Parameter(Mandatory = $true)][string]$Path,
        [Parameter(Mandatory = $true)][System.Security.Cryptography.X509Certificates.X509Certificate2]$Certificate,
        [switch]$RequireTimestamp
    )
    $resolved = (Resolve-Path -LiteralPath $Path).Path
    $signature = Get-AuthenticodeSignature -LiteralPath $resolved
    if (-not $signature.SignerCertificate) { throw "Authenticode signature is missing: $resolved" }
    if ($signature.SignerCertificate.Thumbprint -ne $Certificate.Thumbprint) { throw "The signer does not match the exported Y-TEC certificate: $resolved" }
    if ($RequireTimestamp -and -not $signature.TimeStamperCertificate) { throw "RFC 3161 timestamp is missing: $resolved" }
    $selfSigned = $Certificate.Subject -eq $Certificate.Issuer
    $possiblePinnedRootWarning = $selfSigned -and $signature.Status -in @('UnknownError', 'NotTrusted')
    if ($signature.Status -ne 'Valid' -and -not $possiblePinnedRootWarning) {
        throw "Authenticode verification failed: $resolved ($($signature.Status))"
    }
    # Even a Windows Valid status does not replace our pinned signer/digest/
    # RFC3161 checks. Root warnings pass only with independent crypto proof.
    $proof = Test-LetterierEmbeddedSignature -Path $resolved -Certificate $Certificate -RequireTimestamp:$RequireTimestamp
    if (-not $proof.DigestValid -or -not $proof.CmsValid -or ($RequireTimestamp -and -not $proof.TimestampValid)) {
        throw "Independent Authenticode verification failed: $resolved"
    }
    return $signature
}
