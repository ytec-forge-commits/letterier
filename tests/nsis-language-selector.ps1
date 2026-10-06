$ErrorActionPreference='Stop'
$project=Split-Path $PSScriptRoot -Parent
. (Join-Path $project 'scripts/signing-host.ps1')
$fixture=Join-Path $project ('.local/nsis-language-test-'+[guid]::NewGuid().ToString('N'))
$plugins=Join-Path $fixture '.local/cargo-target/release/nsis/x64/Plugins/x86-unicode'
[IO.Directory]::CreateDirectory($plugins) | Out-Null
$language=Join-Path $plugins 'LangDLL.dll'
[IO.File]::WriteAllBytes($language,[byte[]]@(1,2,3))
$selected=Get-LetterierBundledLanguageSelector -ProjectRoot $fixture -ArtifactPath (Join-Path $plugins 'System.dll')
if ($selected -ne $language) { throw 'LangDLL omitted from the owned standard-plugin signing callback.' }
foreach ($artifact in @($language,(Join-Path $fixture 'System.dll'),(Join-Path ($plugins+'-other') 'System.dll'),(Join-Path $plugins 'additional/nsis_tauri_utils.dll'))) {
    if ($null -ne (Get-LetterierBundledLanguageSelector -ProjectRoot $fixture -ArtifactPath $artifact)) { throw 'Cross-directory or recursive LangDLL selection.' }
}
'PASS: owned plugin callback selects LangDLL exactly; recursion/outside paths refused.'
