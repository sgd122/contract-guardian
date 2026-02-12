#!/bin/bash
set -e

echo "=== Running application migrations ==="

for f in /app-migrations/*.sql; do
  if [ -f "$f" ]; then
    echo "Applying: $(basename $f)"
    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" -f "$f"
  fi
done

echo "=== All migrations applied ==="
