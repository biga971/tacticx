#!/usr/bin/env bash
#
# Tacticx — PostgreSQL backup.
# Dumps the database from the running postgres container, gzips it,
# and rotates old backups. Safe to run from cron.
#
# Usage:
#   ./scripts/backup_db.sh                      # uses repo-root .env + prod compose
#   COMPOSE_FILE=docker-compose.dev.yml \
#   COMPOSE_PROJECT=tacticx-dev \
#   ./scripts/backup_db.sh                      # dev stack
#
# Cron (daily 03:00):
#   0 3 * * * cd /home/debian/tacticx && ./server/scripts/backup_db.sh >> /home/debian/tacticx/backups/backup.log 2>&1

set -euo pipefail

# ── Resolve repo root (script lives in server/scripts/) ──────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$REPO_ROOT"

# ── Config (overridable via env) ─────────────────────────────────────
ENV_FILE="${ENV_FILE:-$REPO_ROOT/.env}"
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.yml}"
COMPOSE_PROJECT="${COMPOSE_PROJECT:-tacticx}"
SERVICE="${SERVICE:-postgres}"
BACKUP_DIR="${BACKUP_DIR:-$REPO_ROOT/backups}"
RETENTION_DAYS="${RETENTION_DAYS:-14}"

# ── Load DB credentials from .env ────────────────────────────────────
if [ ! -f "$ENV_FILE" ]; then
  echo "❌ .env introuvable: $ENV_FILE" >&2
  exit 1
fi
# shellcheck disable=SC1090
set -a; source "$ENV_FILE"; set +a

DB_USER="${DB_USER:?DB_USER manquant dans .env}"
DB_DATABASE="${DB_DATABASE:?DB_DATABASE manquant dans .env}"

mkdir -p "$BACKUP_DIR"

TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
OUTFILE="$BACKUP_DIR/tacticx_${DB_DATABASE}_${TIMESTAMP}.sql.gz"

COMPOSE="docker compose -f $COMPOSE_FILE -p $COMPOSE_PROJECT"

echo "📦 Dump de '$DB_DATABASE' (service $SERVICE)…"
$COMPOSE exec -T "$SERVICE" \
  pg_dump --clean --if-exists --no-owner --no-privileges -U "$DB_USER" "$DB_DATABASE" \
  | gzip -9 > "$OUTFILE"

SIZE="$(du -h "$OUTFILE" | cut -f1)"
echo "✅ Backup créé: $OUTFILE ($SIZE)"

# ── Rotation ─────────────────────────────────────────────────────────
echo "🧹 Suppression des backups > ${RETENTION_DAYS} jours…"
find "$BACKUP_DIR" -name 'tacticx_*.sql.gz' -type f -mtime +"$RETENTION_DAYS" -print -delete || true

echo "✔ Terminé."
