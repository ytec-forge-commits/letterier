function Copy-LetterierDirectDocuments {
    param([Parameter(Mandatory)][string]$ProjectRoot,[Parameter(Mandatory)][string]$Stage)
    foreach ($folder in @('docs','distribution')) { New-Item -ItemType Directory -Path (Join-Path $Stage $folder) -ErrorAction Stop | Out-Null }
    Copy-Item -LiteralPath (Join-Path $ProjectRoot 'docs/manual') -Destination (Join-Path $Stage 'docs/manual') -Recurse -ErrorAction Stop
    Copy-Item -LiteralPath (Join-Path $ProjectRoot 'public/legal') -Destination (Join-Path $Stage 'legal') -Recurse -ErrorAction Stop
    foreach ($name in @('SAVE-RECOVERY-VALIDATION.md','NATIVE-OUTPUT-VALIDATION.md','PERFORMANCE-VALIDATION.md','PALETTE-VALIDATION.md','SECURITY-REVIEW.md')) {
        Copy-Item -LiteralPath (Join-Path $ProjectRoot ('docs/'+$name)) -Destination (Join-Path $Stage 'docs') -ErrorAction Stop
    }
    foreach ($name in @('README.md','README-VECTOR.txt')) {
        Copy-Item -LiteralPath (Join-Path $ProjectRoot ('distribution/'+$name)) -Destination (Join-Path $Stage 'distribution') -ErrorAction Stop
    }
    Copy-Item -LiteralPath (Join-Path $ProjectRoot 'distribution/README-VECTOR.txt') -Destination $Stage -ErrorAction Stop
    foreach ($name in @('README.md','README.en.md','LICENSE','NOTICE','THIRD_PARTY_NOTICES.md','ASSETS_LICENSE.md','ASSET_PROVENANCE.md','BRAND_POLICY.md','LICENSE_EXCEPTIONS.md','PRIVACY.md','IMAGE-FORMATS.md','CODE_SIGNING_POLICY.md','CHANGELOG.md')) {
        Copy-Item -LiteralPath (Join-Path $ProjectRoot $name) -Destination $Stage -ErrorAction Stop
    }
    # Source-tree font links are not present outside the embedded EXE. Use
    # the bundled notice and retain links to the actual legal payload instead.
    $assetNotice=Get-Content -LiteralPath (Join-Path $Stage 'legal/ASSETS_LICENSE.md') -Raw -Encoding utf8
    $assetNotice=[regex]::Replace($assetNotice,'\]\(([^)]+)\)', {
        param($match)
        $url=$match.Groups[1].Value
        if ($url -match '^[a-z]+:|^#') { return $match.Value }
        return '](legal/'+$url+')'
    })
    [IO.File]::WriteAllText((Join-Path $Stage 'ASSETS_LICENSE.md'),$assetNotice,[Text.UTF8Encoding]::new($false))
}

function Assert-LetterierDirectDocuments {
    param([Parameter(Mandatory)][string]$Stage)
    $root=(Resolve-Path -LiteralPath $Stage -ErrorAction Stop).Path
    $files=@(Get-ChildItem -LiteralPath $root -Recurse -File -ErrorAction Stop)
    $names=@($files | ForEach-Object { [IO.Path]::GetRelativePath($root,$_.FullName).Replace('\','/') })
    foreach ($required in @('LICENSE','NOTICE','THIRD_PARTY_NOTICES.md','ASSETS_LICENSE.md','ASSET_PROVENANCE.md','BRAND_POLICY.md','LICENSE_EXCEPTIONS.md','PRIVACY.md','CODE_SIGNING_POLICY.md','README-VECTOR.txt','distribution/README-VECTOR.txt','distribution/README.md','legal/MPL-Corresponding-Source.zip')) {
        if ($names -notcontains $required) { throw ('Missing release document: '+$required) }
    }
    # Bounded filename guard, not a complete payload secret-content audit.
    if (@($names | Where-Object { $_ -match '(?i)(^|/)(\.env[^/]*|[^/]+\.(pfx|p12|key|pem|jks|binsen|binsenbak)|Cookies(?:[.-][^/]*)?|id_(rsa|dsa|ecdsa|ed25519)|draft-[^/]+)$' }).Count) {
        throw 'Unexpected sensitive or saved-document filename in direct package.'
    }
    foreach ($relative in @(
        'README.md',
        'README.en.md',
        'docs/manual/ja/README.md',
        'docs/manual/en/README.md',
        'legal/README.md',
        'legal/README.en.md',
        'distribution/README.md'
    )) {
        $content=Get-Content -LiteralPath (Join-Path $root $relative) -Raw -Encoding utf8 -ErrorAction Stop
        foreach ($match in [regex]::Matches($content,'\]\(([^)]+)\)')) {
            $target=$match.Groups[1].Value
            if ($target -match '^[a-z]+:|^#') { continue }
            $resolved=[Uri]::new([Uri]('https://release.invalid/'+$relative),$target)
            $wanted=[Uri]::UnescapeDataString($resolved.AbsolutePath.TrimStart('/'))
            if ($names -notcontains $wanted) { throw ('Broken direct README link: '+$relative+' -> '+$target) }
        }
    }
}
