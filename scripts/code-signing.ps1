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
    $certificate = Get-ChildItem -LiteralPath 'Cert:\CurrentUser\My' |
        Where-Object {
            $_.Subject -eq 'CN=Y-TEC' -and
            $_.Issuer -eq $_.Subject -and
            $_.HasPrivateKey -and
            $_.NotBefore -le $now -and
            $_.NotAfter -gt $now -and
            $codeSigningOid -in @($_.EnhancedKeyUsageList | ForEach-Object {
                if ($_.ObjectId -is [System.Security.Cryptography.Oid]) { $_.ObjectId.Value } else { [string]$_.ObjectId }
            }) -and
            (Test-LetterierPrivateKeyNonExportable -Certificate $_)
        } |
        Sort-Object NotAfter -Descending |
        Select-Object -First 1
    if (-not $certificate) { throw 'No eligible Y-TEC self-signed code-signing certificate was found.' }
    return $certificate
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
    if ($signature.Status -ne 'Valid') {
        $allowed = $signature.Status -in @('UnknownError', 'NotTrusted')
        $selfSigned = $signature.SignerCertificate.Subject -eq $signature.SignerCertificate.Issuer
        if (-not ($allowed -and $selfSigned)) { throw "Authenticode verification failed: $resolved ($($signature.Status))" }
    }
    return $signature
}
