#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CHATBOT_DIR="${CHATBOT_DIR:-${SCRIPT_DIR}}"
DATA_DIR="${DATA_DIR:-${CHATBOT_DIR}/.postgres-chatbot}"
CONTAINER_NAME="${CONTAINER_NAME:-chatbot_postgres}"
IMAGE="${IMAGE:-postgres:16-alpine}"
POSTGRES_USER="${POSTGRES_USER:-postgres}"
POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-postgres}"
POSTGRES_DB="${POSTGRES_DB:-chatbot}"
HOST_PORT="${HOST_PORT:-5432}"
CONTAINER_PORT="${CONTAINER_PORT:-5432}"
POSTGRES_URL="${POSTGRES_URL:-postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@localhost:${HOST_PORT}/${POSTGRES_DB}}"
RUN_MIGRATIONS="${RUN_MIGRATIONS:-1}"
RESET_DB="${RESET_DB:-0}"

mkdir -p "${DATA_DIR}"

if [[ "${RESET_DB}" == "1" ]]; then
  if docker ps -a --format '{{.Names}}' | grep -Fxq "${CONTAINER_NAME}"; then
    echo "Removing existing container: ${CONTAINER_NAME}"
    docker rm -f "${CONTAINER_NAME}" >/dev/null
  fi

  echo "Resetting data dir: ${DATA_DIR}"
  find "${DATA_DIR}" -mindepth 1 -maxdepth 1 -exec rm -rf {} +
fi

if docker ps --format '{{.Names}}' | grep -Fxq "${CONTAINER_NAME}"; then
  echo "Postgres container is already running: ${CONTAINER_NAME}"
elif docker ps -a --format '{{.Names}}' | grep -Fxq "${CONTAINER_NAME}"; then
  echo "Starting existing container: ${CONTAINER_NAME}"
  docker start "${CONTAINER_NAME}" >/dev/null
else
  echo "Creating Postgres container: ${CONTAINER_NAME}"
  docker run -d \
    --name "${CONTAINER_NAME}" \
    --restart unless-stopped \
    -e POSTGRES_USER="${POSTGRES_USER}" \
    -e POSTGRES_PASSWORD="${POSTGRES_PASSWORD}" \
    -e POSTGRES_DB="${POSTGRES_DB}" \
    -v "${DATA_DIR}:/var/lib/postgresql/data" \
    -p "${HOST_PORT}:${CONTAINER_PORT}" \
    "${IMAGE}" >/dev/null
fi

echo "Waiting for Postgres to accept connections..."
for attempt in {1..60}; do
  if docker exec "${CONTAINER_NAME}" pg_isready -U "${POSTGRES_USER}" -d postgres >/dev/null 2>&1; then
    break
  fi

  if [[ "${attempt}" == "60" ]]; then
    echo "Postgres did not become ready in time."
    docker logs --tail 80 "${CONTAINER_NAME}" || true
    exit 1
  fi

  sleep 1
done

if ! docker exec "${CONTAINER_NAME}" psql -U "${POSTGRES_USER}" -d postgres -v dbname="${POSTGRES_DB}" -tAc "SELECT 1 FROM pg_database WHERE datname = :'dbname'" | grep -Fxq "1"; then
  echo "Creating database: ${POSTGRES_DB}"
  docker exec "${CONTAINER_NAME}" createdb -U "${POSTGRES_USER}" "${POSTGRES_DB}"
fi

if [[ "${RUN_MIGRATIONS}" == "1" ]]; then
  if [[ -d "${CHATBOT_DIR}/node_modules" ]] && command -v pnpm >/dev/null 2>&1; then
    echo "Running chatbot database migrations..."
    (
      cd "${CHATBOT_DIR}"
      POSTGRES_URL="${POSTGRES_URL}" pnpm db:migrate
    )
  else
    echo "Skipping migrations: pnpm or ${CHATBOT_DIR}/node_modules is missing."
    echo "Run them later with: cd ${CHATBOT_DIR} && POSTGRES_URL='${POSTGRES_URL}' pnpm db:migrate"
  fi
fi

echo "Postgres is ready."
echo "Container: ${CONTAINER_NAME}"
echo "Data dir: ${DATA_DIR} -> /var/lib/postgresql/data"
echo "URL: ${POSTGRES_URL}"
