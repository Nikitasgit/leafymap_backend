# Configuration locale (une fois par machine)
# Usage: .\setup.ps1
#        .\setup.ps1 -PlantUmlHome "C:\chemin\vers\plantuml"

param(
	[string]$PlantUmlHome = $env:PLANTUML_HOME
)

$diagramsDir = $PSScriptRoot
$markerStart = "# >>> leafymap-diagrams >>>"
$markerEnd = "# <<< leafymap-diagrams <<<"

if ([string]::IsNullOrWhiteSpace($PlantUmlHome)) {
	$PlantUmlHome = Read-Host "Chemin vers le clone PlantUML (ex: C:\dev\plantuml)"
}

if (!(Test-Path $PlantUmlHome)) {
	Write-Error "Dossier introuvable: $PlantUmlHome"
	exit 1
}

[Environment]::SetEnvironmentVariable("PLANTUML_HOME", $PlantUmlHome, "User")
[Environment]::SetEnvironmentVariable("LEAFYMAP_DIAGRAMS", $diagramsDir, "User")
$env:PLANTUML_HOME = $PlantUmlHome
$env:LEAFYMAP_DIAGRAMS = $diagramsDir

$profileBlock = @"
$markerStart
function global:generate {
	param([Parameter(ValueFromRemainingArguments = `$true)][string[]]`$RemainingArgs)
	if (-not `$env:LEAFYMAP_DIAGRAMS) {
		Write-Error "LEAFYMAP_DIAGRAMS non defini. Relancez diagrams\setup.ps1"
		return
	}
	& (Join-Path `$env:LEAFYMAP_DIAGRAMS "generate.bat") @RemainingArgs
}
$markerEnd
"@

if (!(Test-Path $PROFILE)) {
	New-Item -Path $PROFILE -ItemType File -Force | Out-Null
}

$profileContent = Get-Content $PROFILE -Raw -ErrorAction SilentlyContinue
if ($null -eq $profileContent) {
	$profileContent = ""
}

if ($profileContent -match [regex]::Escape($markerStart)) {
	$pattern = [regex]::Escape($markerStart) + "[\s\S]*?" + [regex]::Escape($markerEnd)
	$profileContent = [regex]::Replace($profileContent, $pattern, $profileBlock.TrimEnd())
} else {
	if ($profileContent.Length -gt 0 -and -not $profileContent.EndsWith("`n")) {
		$profileContent += "`n"
	}
	$profileContent += "`n$profileBlock"
}

Set-Content -Path $PROFILE -Value $profileContent.TrimEnd() -Encoding UTF8
. $PROFILE

Write-Host "OK"
Write-Host "  PLANTUML_HOME = $PlantUmlHome"
Write-Host "  LEAFYMAP_DIAGRAMS = $diagramsDir"
Write-Host "  Profil PowerShell = $PROFILE"
Write-Host ""
Write-Host "Commande disponible:"
Write-Host "  generate class-diagram.puml"
