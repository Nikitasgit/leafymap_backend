# Diagrammes PlantUML

## Configuration (une fois par machine)

```powershell
cd diagrams
.\setup.ps1 -PlantUmlHome "C:\chemin\vers\plantuml"
```

Puis fermer et rouvrir le terminal.

## Generer une image

```powershell
generate class-diagram.puml
```

Alternative sans setup :

```powershell
.\generate class-diagram.puml
```

> PowerShell refuse `generate` sans `.\` tant que le setup n'est pas fait.

## SVG

```powershell
generate -tsvg class-diagram.puml
```

## Tous les fichiers .puml du dossier

Depuis le dossier `diagrams` :

```powershell
.\generate *.puml
```

## Sans le script

```powershell
java -jar "$env:PLANTUML_HOME\plantuml.jar" class-diagram.puml
```
