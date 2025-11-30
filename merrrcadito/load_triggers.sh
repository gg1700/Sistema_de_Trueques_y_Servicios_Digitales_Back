#!/bin/bash

# Get database URLs from .env file
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
fi

echo "=== Ejecutando Triggers.sql usando DIRECT_URL ==="
echo ""

# Use DIRECT_URL for DDL operations (required for triggers)
if [ -z "$DIRECT_URL" ]; then
  echo "❌ DIRECT_URL no encontrado en .env"
  echo "Intentando con DATABASE_URL..."
  DB_URL="$DATABASE_URL"
else
  DB_URL="$DIRECT_URL"
fi

# Execute Triggers.sql using psql
psql "$DB_URL" -f src/db/Triggers.sql

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Triggers ejecutados exitosamente"
  echo ""
  echo "=== Verificando triggers creados ===" 
  echo ""
  psql "$DB_URL" -c "SELECT trigger_name, event_manipulation, action_timing FROM information_schema.triggers WHERE event_object_table = 'transaccion' ORDER BY action_timing, event_manipulation, trigger_name;"
else
  echo ""
  echo "❌ Error ejecutando Triggers.sql"
fi
