param([Parameter(Mandatory=$true)][string]$Path)
[pscustomobject]@{Artifact=$Path;Major=$PSVersionTable.PSVersion.Major;Policy=[string](Get-ExecutionPolicy)} | ConvertTo-Json -Compress
