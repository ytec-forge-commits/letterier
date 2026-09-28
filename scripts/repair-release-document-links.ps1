param([Parameter(Mandatory = $true)][string]$StagePath)
$ErrorActionPreference = 'Stop'
$stage = (Resolve-Path -LiteralPath $StagePath).Path
$utf8 = [System.Text.UTF8Encoding]::new($false)
foreach ($name in @('README.md','README.en.md','NOTICE','THIRD_PARTY_NOTICES.md','ASSETS_LICENSE.md')) {
    $file = Join-Path $stage $name
    if ($name -eq 'ASSETS_LICENSE.md') {
        # Use the bundled asset notice, whose font source/binary distinction is explicit.
        $content = [System.IO.File]::ReadAllText((Join-Path $stage 'legal\ASSETS_LICENSE.md'), $utf8)
        $content = [regex]::Replace($content, '(?<!\!)\[([^\]]+)\]\(([^)]+)\)', {
            param($match)
            $target = $match.Groups[2].Value
            if ([System.Uri]::IsWellFormedUriString($target, [System.UriKind]::Absolute)) { return $match.Value }
            return '[' + $match.Groups[1].Value + '](legal/' + $target + ')'
        })
        $content = $content.Replace('`font-manifest.json`', '`legal/font-manifest.json`')
    }
    else {
        $content = [System.IO.File]::ReadAllText($file, $utf8)
        $content = $content.Replace('public/legal/', 'legal/')
        $content = $content.Replace('docs/manual/', 'manual/')
        $content = $content.Replace('distribution/README-VECTOR.txt', 'README-VECTOR.txt')
        $content = $content.Replace('distribution/README.md', 'https://github.com/ytec-forge-commits/letterier/blob/main/distribution/README.md')
    }
    [System.IO.File]::WriteAllText($file, $content, $utf8)
}
