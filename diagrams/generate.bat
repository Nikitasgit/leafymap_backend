@echo off
setlocal

if "%~1"=="" (
	echo Usage: generate fichier.puml
	exit /b 1
)

if defined PLANTUML_JAR (
	set "JAR=%PLANTUML_JAR%"
) else if defined PLANTUML_HOME (
	if exist "%PLANTUML_HOME%\plantuml.jar" (
		set "JAR=%PLANTUML_HOME%\plantuml.jar"
	) else (
		for %%F in ("%PLANTUML_HOME%\build\libs\plantuml-*.jar") do set "JAR=%%~fF"
	)
) else (
	echo Erreur: definissez PLANTUML_HOME ou PLANTUML_JAR
	echo Exemple: setx PLANTUML_HOME "C:\chemin\vers\plantuml"
	exit /b 1
)

if not exist "%JAR%" (
	echo Erreur: JAR introuvable: %JAR%
	exit /b 1
)

java -jar "%JAR%" %*
if errorlevel 1 exit /b 1

echo OK: image generee pour %~1
