#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Usage: generate fichier.puml [options plantuml...]"
  exit 1
fi

if [[ -n "${PLANTUML_JAR:-}" ]]; then
  JAR="$PLANTUML_JAR"
elif [[ -n "${PLANTUML_HOME:-}" ]]; then
  if [[ -f "$PLANTUML_HOME/plantuml.jar" ]]; then
    JAR="$PLANTUML_HOME/plantuml.jar"
  else
    JAR="$(find "$PLANTUML_HOME/build/libs" -maxdepth 1 -name 'plantuml-*.jar' -print -quit 2>/dev/null || true)"
  fi
elif command -v plantuml >/dev/null 2>&1; then
  plantuml "$@"
  echo "OK: image generee pour $1"
  exit 0
else
  echo "Erreur: definissez PLANTUML_HOME ou PLANTUML_JAR, ou installez plantuml (brew install plantuml)"
  exit 1
fi

if [[ -z "${JAR:-}" || ! -f "$JAR" ]]; then
  echo "Erreur: JAR introuvable"
  exit 1
fi

java -jar "$JAR" "$@"
echo "OK: image generee pour $1"
