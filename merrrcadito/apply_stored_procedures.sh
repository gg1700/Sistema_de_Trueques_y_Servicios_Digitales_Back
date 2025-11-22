#!/bin/bash

# Script para aplicar los Stored Procedures a PostgreSQL
# Este script extrae la configuración de la base de datos y aplica los procedimientos

echo "======================================"
echo "  Aplicando Stored Procedures"
echo "======================================"
echo ""

# Extraer DATABASE_URL del archivo .env
if [ -f .env ]; then
    DATABASE_URL=$(grep DATABASE_URL .env | cut -d '=' -f2-)
    echo "✓ Archivo .env encontrado"
else
    echo "✗ Archivo .env no encontrado"
    echo "Por favor crea un archivo .env con DATABASE_URL"
    exit 1
fi

# Verificar que DATABASE_URL no esté vacío
if [ -z "$DATABASE_URL" ]; then
    echo "✗ DATABASE_URL no está configurado en .env"
    exit 1
fi

echo "✓ DATABASE_URL encontrado"
echo ""

# Parsear la URL de PostgreSQL
# Formato: postgresql://usuario:password@host:puerto/database
if [[ $DATABASE_URL =~ postgresql://([^:]+):([^@]+)@([^:]+):([^/]+)/(.+) ]]; then
    DB_USER="${BASH_REMATCH[1]}"
    DB_PASS="${BASH_REMATCH[2]}"
    DB_HOST="${BASH_REMATCH[3]}"
    DB_PORT="${BASH_REMATCH[4]}"
    DB_NAME="${BASH_REMATCH[5]}"
    
    echo "Configuración detectada:"
    echo "  Usuario: $DB_USER"
    echo "  Host: $DB_HOST"
    echo "  Puerto: $DB_PORT"
    echo "  Base de datos: $DB_NAME"
    echo ""
else
    echo "✗ No se pudo parsear DATABASE_URL"
    echo "Formato esperado: postgresql://usuario:password@host:puerto/database"
    exit 1
fi

# Aplicar stored procedures
echo "Aplicando stored procedures..."
export PGPASSWORD="$DB_PASS"

psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f src/db/ProcedimientosMRR.sql

if [ $? -eq 0 ]; then
    echo ""
    echo "======================================"
    echo "  ✓ Stored Procedures Aplicados"
    echo "======================================"
    echo ""
    echo "Verificando que se crearon correctamente..."
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT routine_name FROM information_schema.routines WHERE routine_name LIKE 'sp_reporte%' ORDER BY routine_name;"
else
    echo ""
    echo "======================================"
    echo "  ✗ Error al Aplicar Stored Procedures"
    echo "======================================"
    exit 1
fi

unset PGPASSWORD
