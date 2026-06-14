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
generate use-case-diagram.puml
generate event-invitation-activity.puml
generate event-invitation-sequence.puml
generate event-invitation-send-sequence.puml
generate event-invitation-response-sequence.puml
generate review-activity.puml
generate review-sequence.puml
generate event-booking-activity.puml
generate event-booking-sequence.puml
generate partnership-activity.puml
generate partnership-sequence.puml
generate partnership-send-sequence.puml
generate partnership-response-sequence.puml
generate creator-account-activity.puml
generate creator-account-sequence.puml
generate places-in-view-activity.puml
generate places-in-view-sequence.puml
```

Sur macOS / Linux :

```bash
./generate.sh event-invitation-activity.puml
./generate.sh event-invitation-sequence.puml
./generate.sh event-invitation-send-sequence.puml
./generate.sh event-invitation-response-sequence.puml
./generate.sh review-activity.puml
./generate.sh review-sequence.puml
./generate.sh creator-account-activity.puml
./generate.sh creator-account-sequence.puml
./generate.sh partnership-send-sequence.puml
./generate.sh partnership-response-sequence.puml
./generate.sh places-in-view-activity.puml
./generate.sh places-in-view-sequence.puml
```

Tous les diagrammes :

```bash
./generate.sh *.puml
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
