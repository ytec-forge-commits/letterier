param(
 [Parameter(Mandatory=$true)][string]$ZipPath,
 [ValidatePattern('^\d+\.\d+\.\d+$')][string]$ExpectedVersion
)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression.FileSystem
if (-not $ExpectedVersion) {
 $ExpectedVersion = (Get-Content -LiteralPath (Join-Path (Split-Path $PSScriptRoot -Parent) 'package.json') -Raw -Encoding utf8 | ConvertFrom-Json).version
}
$productName = (Get-Content -LiteralPath (Join-Path (Split-Path $PSScriptRoot -Parent) 'src-tauri/tauri.conf.json') -Raw -Encoding utf8 | ConvertFrom-Json).productName
$archive = [IO.Compression.ZipFile]::OpenRead((Resolve-Path -LiteralPath $ZipPath).Path)
try {
 $names = @($archive.Entries | ForEach-Object { $_.FullName.Replace('\','/') })
 $root = 'LetterAtelier-' + $ExpectedVersion + '-windows-x64-review/'
 $seen = [Collections.Generic.HashSet[string]]::new([StringComparer]::OrdinalIgnoreCase)
 foreach ($name in $names) {
  if (-not $name.StartsWith($root,[StringComparison]::Ordinal) -or $name -match '[:\x00-\x1f\x7f]' -or @($name.TrimEnd('/').Split('/') | Where-Object { $_ -eq '' -or $_ -eq '.' -or $_ -eq '..' }).Count) { throw 'Invalid review entry path.' }
  if (-not $seen.Add($name)) { throw 'Duplicate review entry path.' }
 }
 $required = @(($productName + '.exe'),'REVIEW-STATUS.txt','README.md','README.en.md','LICENSE','NOTICE','THIRD_PARTY_NOTICES.md','ASSETS_LICENSE.md','ASSET_PROVENANCE.md','CODE_SIGNING_POLICY.md','IMAGE-FORMATS.md','BRAND_POLICY.md','LICENSE_EXCEPTIONS.md','PRIVACY.md','distribution/README-VECTOR.txt','docs/manual/ja/README.md','docs/manual/en/README.md','docs/SAVE-RECOVERY-VALIDATION.md','docs/NATIVE-OUTPUT-VALIDATION.md','docs/PERFORMANCE-VALIDATION.md','docs/PALETTE-VALIDATION.md','docs/SECURITY-REVIEW.md','legal/MPL-Corresponding-Source.zip')
 $missing = @($required | Where-Object { $names -notcontains ($root + $_) })
 if ($missing.Count) { throw ('Missing review files: ' + ($missing -join ', ')) }
 $screenSuffix = if ($ExpectedVersion -eq '1.0.4') { 'all20' } else { $ExpectedVersion }
 $screenPattern = '^' + [regex]::Escape($root) + 'docs/manual/images/(ja|en)-[^/]+-' + [regex]::Escape($screenSuffix) + '\.png$'
 $screens = @($names | Where-Object { $_ -match $screenPattern })
 $screenKinds = @{ja=@('horizontal','vertical','stationery','textbox');en=@('horizontal','settings','stationery','textbox')}
 $expectedScreens = @(foreach ($language in @('ja','en')) { foreach ($screen in $screenKinds[$language]) {
  $screenName = if ($ExpectedVersion -eq '1.0.4' -and $screen -in @('horizontal','vertical')) { $screen + '-writing' } elseif ($ExpectedVersion -eq '1.0.4' -and $screen -eq 'textbox') { 'text-box' } else { $screen }
  $root + 'docs/manual/images/' + $language + '-' + $screenName + '-' + $screenSuffix + '.png'
 } })
 if ($screens.Count -ne 8 -or @($expectedScreens | Where-Object { $names -cnotcontains $_ }).Count) { throw 'Expected eight latest manual screenshots under docs/manual/images.' }
 foreach ($screenName in $expectedScreens) {
  $screenEntry = $archive.Entries | Where-Object { $_.FullName.Replace('\','/') -ceq $screenName }
  $screenStream = $screenEntry.Open()
  try {
   $signature = [byte[]]::new(8)
   if ($screenEntry.Length -lt 8 -or $screenStream.Read($signature,0,8) -ne 8 -or [Convert]::ToHexString($signature) -ne '89504E470D0A1A0A') { throw 'Invalid manual PNG signature.' }
  } finally { $screenStream.Dispose() }
 }
 # Filename guard only, not a proof that all payload contents are secret-free.
 # Public .cer/.crt certificates are not private keys and are not blacklisted solely by extension.
 if (@($names | Where-Object { $_ -match '(?i)(^|/)(\.env[^/]*|[^/]+\.(pfx|p12|key|pem|jks|binsen|binsenbak)|Cookies(?:[.-][^/]*)?|id_(rsa|dsa|ecdsa|ed25519)|draft-[^/]+)$' }).Count) { throw 'Unexpected sensitive or synthetic-save filename in package.' }
 # Bounded contract: four READMEs, Markdown inline links only. Other Markdown,
 # reference-style links and HTML links still require separate documentation QA.
 foreach ($relative in @('README.md','README.en.md','docs/manual/ja/README.md','docs/manual/en/README.md')) {
  $entry = $archive.GetEntry($root + $relative)
  if (-not $entry) { $entry = $archive.Entries | Where-Object { $_.FullName.Replace('\','/') -eq ($root + $relative) } }
  $reader = New-Object IO.StreamReader($entry.Open(),[Text.Encoding]::UTF8)
  try { $content = $reader.ReadToEnd() } finally { $reader.Dispose() }
  foreach ($match in [regex]::Matches($content,'\]\(([^)]+)\)')) {
   $target = $match.Groups[1].Value
   if ($target -match '^[a-z]+:|^#') { continue }
   $base = [Uri]('https://review.invalid/' + $root + $relative)
   $resolved = New-Object Uri($base,$target)
   $wanted = [Uri]::UnescapeDataString($resolved.AbsolutePath.TrimStart('/'))
   if ($names -notcontains $wanted) { throw ('Broken packaged manual/README link: ' + $relative + ' -> ' + $target) }
  }
 }
 [pscustomobject]@{Result='PASS';Entries=$names.Count;LatestScreenshots=$screens.Count;ReadOnly=$true;LinkScope='Four READMEs / inline Markdown';PngCheck='Signature only'}
} finally { $archive.Dispose() }
