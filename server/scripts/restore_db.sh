#!/usr/bin/env bash
#
# Tacticx — PostgreSQL restore from a gzipped pg_dump backup.
#
# Usage:
#   ./scripts/restore_db.sh backups/tacticx_tacticx_prod_20260530_030000.sql.gz
#
#   COMPOSE_FILE=docker-compose.dev.yml COMPOSE_PROJECT=tacticx-dev \
#   ./scripts/restore_db.sh <file>      # dev stack

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$REPO_ROOT"

BACKUP_FILE="${1:-}"
if [ -z "$BACKUP_FILE" ] || [ ! -f "$BACKUP_FILE" ]; then
  echo "Usage: $0 <backup.sql.gz>" >&2
  exit 1
fi

ENV_FILE="${ENV_FILE:-$REPO_ROOT/.env}"
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.yml}"
COMPOSE_PROJECT="${COMPOSE_PROJECT:-tacticx}"
SERVICE="${SERVICE:-postgres}"

# shellcheck disable=SC1090
set -a; source "$ENV_FILE"; set +a
DB_USER="${DB_USER:?DB_USER manquant}"
DB_DATABASE="${DB_DATABASE:?DB_DATABASE manquant}"

COMPOSE="docker compose -f $COMPOSE_FILE -p $COMPOSE_PROJECT"

echo "⚠️  Restauration de '$DB_DATABASE' depuis $BACKUP_FILE"
echo "    Les données actuelles seront ÉCRASÉES (DROP + recreate via --clean)."
read -r -p "Continuer ? [y/N] " confirm
[ "$confirm" = "y" ] || [ "$confirm" = "Y" ] || { echo "Annulé."; exit 1; }

echo "🔄 Restauration en cours…"
gunzip -c "$BACKUP_FILE" | $COMPOSE exec -T "$SERVICE" psql -U "$DB_USER" -d "$DB_DATABASE"

echo "✅ Restauration terminée."
