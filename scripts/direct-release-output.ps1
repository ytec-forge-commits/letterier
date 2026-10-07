function Get-LetterierDirectReleaseOutputPath {
    param(
        [Parameter(Mandatory)][string]$OutputRoot,
        [Parameter(Mandatory)][string]$Version,
        [string]$CandidateSuffix,
        [switch]$AllowExisting
    )

    if ($Version -notmatch '^\d+\.\d+\.\d+$') {
        throw 'Release version must be a plain three-part version.'
    }
    if (-not [string]::IsNullOrEmpty($CandidateSuffix) -and $CandidateSuffix -notmatch '^[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*$') {
        throw 'Candidate suffix must contain only letters, digits, and single hyphens.'
    }

    $name='release-'+$Version
    if (-not [string]::IsNullOrEmpty($CandidateSuffix)) { $name+='-'+$CandidateSuffix }
    $path=[IO.Path]::GetFullPath((Join-Path ([IO.Path]::GetFullPath($OutputRoot)) $name))
    if (-not $AllowExisting -and (Test-Path -LiteralPath $path)) {
        throw "Refusing to overwrite an existing release candidate: $path"
    }
    return $path
}
