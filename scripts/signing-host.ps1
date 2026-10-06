function Get-LetterierSigningInvocation {
    param(
        [Parameter(Mandatory=$true)][string]$ScriptPath,
        [Parameter(Mandatory=$true)][string]$ArtifactPath
    )
    if (-not $IsWindows -or $PSVersionTable.PSVersion.Major -lt 7) {
        throw 'Use the existing Windows PowerShell7 release host; no automatic host fallback is allowed.'
    }
    if ((Get-ExecutionPolicy) -notin @('RemoteSigned','AllSigned')) {
        throw 'Signing requires the existing RemoteSigned/AllSigned policy. No policy change is attempted.'
    }
    $hostCommand=(Get-Process -Id $PID -ErrorAction Stop).Path
    if (-not $hostCommand -or -not (Test-Path -LiteralPath $hostCommand -PathType Leaf)) {
        throw 'The current PowerShell7 executable could not be resolved.'
    }
    $script=(Resolve-Path -LiteralPath $ScriptPath -ErrorAction Stop).Path
    return @{cmd=$hostCommand;args=@('-NoProfile','-File',$script,'-Path',$ArtifactPath)}
}

function Invoke-LetterierUnsignedArtifactSigning {
    param(
        [Parameter(Mandatory)][string]$Path,
        [Parameter(Mandatory)][System.Security.Cryptography.X509Certificates.X509Certificate2]$Certificate,
        [Parameter(Mandatory)][string]$ScriptPath
    )
    $resolved=(Resolve-Path -LiteralPath $Path -ErrorAction Stop).Path
    $existing=Get-AuthenticodeSignature -LiteralPath $resolved
    if ($existing.Status -eq 'NotSigned' -and -not $existing.SignerCertificate) {
        $invocation=Get-LetterierSigningInvocation -ScriptPath $ScriptPath -ArtifactPath $resolved
        $arguments=$invocation.args
        & $invocation.cmd @arguments
        if ($LASTEXITCODE -ne 0) { throw 'Signing the unsigned portable artifact failed.' }
    }
    # Existing signatures are never overwritten to repair a failed verification.
    $null=Assert-LetterierSignature -Path $resolved -Certificate $Certificate -RequireTimestamp
}
function Get-LetterierBundledLanguageSelector {
    param([Parameter(Mandatory)][string]$ProjectRoot,[Parameter(Mandatory)][string]$ArtifactPath)
    $plugins=[IO.Path]::GetFullPath((Join-Path $ProjectRoot '.local/cargo-target/release/nsis/x64/Plugins/x86-unicode')).TrimEnd('\')
    $artifact=[IO.Path]::GetFullPath($ArtifactPath)
    if ([IO.Path]::GetDirectoryName($artifact) -ne $plugins -or [IO.Path]::GetFileName($artifact) -eq 'LangDLL.dll') { return $null }
    $language=Join-Path $plugins 'LangDLL.dll'
    if (Test-Path -LiteralPath $language -PathType Leaf) { return $language }
    return $null
}

