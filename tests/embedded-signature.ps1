# Integration against an existing PUBLIC release binary. Never execute it.
param([string]$SourcePath,[string]$PublicCertificatePath)
$ErrorActionPreference = 'Stop'
$project = Split-Path $PSScriptRoot -Parent
. (Join-Path $project 'scripts/code-signing.ps1')
if (-not (Get-Command Test-LetterierEmbeddedSignature -ErrorAction SilentlyContinue)) {
    throw 'FAIL: embedded PE/CMS/timestamp verifier is not implemented.'
}
$source = if ($SourcePath) { (Resolve-Path -LiteralPath $SourcePath).Path } else { Join-Path $project 'output/release-1.0.4/Letterier-1.0.4-windows-x64-self-signed-setup.exe' }
$publicPath = if ($PublicCertificatePath) { (Resolve-Path -LiteralPath $PublicCertificatePath).Path } else { Join-Path $project 'output/release-1.0.4/Y-TEC-CodeSigning-Public.cer' }
$cert = [Security.Cryptography.X509Certificates.X509Certificate2]::new($publicPath)
if ($cert.HasPrivateKey) { throw 'Public-only certificate required.' }
$sourceBefore = (Get-FileHash -LiteralPath $source -Algorithm SHA256).Hash
try {
    $proof = Test-LetterierEmbeddedSignature -Path $source -Certificate $cert -RequireTimestamp
    if (-not ($proof.DigestValid -and $proof.CmsValid -and $proof.TimestampValid)) {
        throw 'FAIL: intact published binary did not pass every cryptographic gate.'
    }
    Write-Output 'PASS: intact public release PE/CMS/RFC3161 verification.'
    $fixture = Join-Path $project ('.local/signature-test-' + [guid]::NewGuid().ToString('N'))
    New-Item -ItemType Directory -Path $fixture | Out-Null
    $copy = Join-Path $fixture 'altered-not-for-execution.exe'
    Copy-Item -LiteralPath $source -Destination $copy
    $stream = [IO.File]::Open($copy,[IO.FileMode]::Open,[IO.FileAccess]::ReadWrite,[IO.FileShare]::None)
    try {
        # Inside an existing PE section, not excluded checksum/certificate data.
        $stream.Position = 4096; $original = $stream.ReadByte()
        $stream.Position = 4096; $stream.WriteByte([byte]($original -bxor 1)); $stream.Flush($true)
    } finally { $stream.Dispose() }
    $rejected = $false
    try { $null = Test-LetterierEmbeddedSignature -Path $copy -Certificate $cert -RequireTimestamp }
    catch { $rejected = $_.Exception.Message -match 'PE digest mismatch' }
    if (-not $rejected) { throw 'FAIL: modified PE was not rejected at the digest gate.' }
    Write-Output 'PASS: modified copy rejected at PE digest gate.'
    # Always create a PUBLIC binary test copy without its certificate directory;
    # do not conditionally skip this case when the real release becomes signed.
    $unsigned = Join-Path $fixture 'unsigned-not-for-execution.exe'
    Copy-Item -LiteralPath $source -Destination $unsigned
    $stream = [IO.File]::Open($unsigned,[IO.FileMode]::Open,[IO.FileAccess]::ReadWrite,[IO.FileShare]::None)
    $reader = [IO.BinaryReader]::new($stream,[Text.Encoding]::UTF8,$true)
    try {
        $stream.Position=0x3c; $pe=$reader.ReadUInt32()
        $stream.Position=$pe
        if ($reader.ReadUInt32() -ne 0x4550) { throw 'FAIL: fixture PE header missing.' }
        $optional=$pe+24; $stream.Position=$optional; $magic=$reader.ReadUInt16()
        $directory=if($magic -eq 0x20b){$optional+112}elseif($magic -eq 0x10b){$optional+96}else{throw 'FAIL: unsupported fixture PE header.'}
        $stream.Position=$directory+32
        $stream.Write([byte[]]::new(8),0,8); $stream.Flush($true)
    } finally { $reader.Dispose(); $stream.Dispose() }
    if (-not (Test-Path -LiteralPath $unsigned) -or (Get-AuthenticodeSignature -LiteralPath $unsigned).Status -ne 'NotSigned') {
        throw 'FAIL: the mandatory unsigned fixture is missing or is still signed.'
    }
    $rejected = $false
    try { $null = Test-LetterierEmbeddedSignature -Path $unsigned -Certificate $cert -RequireTimestamp }
    catch { $rejected = $true }
    if (-not $rejected) { throw 'FAIL: unsigned fixture accepted.' }
    Write-Output 'PASS: mandatory unsigned fixture rejected.'
    if ((Get-FileHash -LiteralPath $source -Algorithm SHA256).Hash -ne $sourceBefore) {
        throw 'FAIL: public source binary changed.'
    }
    Write-Output "Evidence retained: $fixture"
} finally { $cert.Dispose() }
