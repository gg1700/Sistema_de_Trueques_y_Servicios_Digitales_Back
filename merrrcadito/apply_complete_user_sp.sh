#!/bin/bash

# Script para aplicar el stored procedure de datos completos de usuario en Supabase

echo "==================================="
echo "Aplicando SP: sp_obtenerdatousuarioscompletos"
echo "==================================="

# Verificar que DATABASE_URL esté configurado
if [ -z "$DATABASE_URL" ]; then
    echo "Error: DATABASE_URL no está configurado"
    echo "Por favor, configura la variable de entorno DATABASE_URL con la conexión a Supabase"
    exit 1
fi

# Ejecutar el stored procedure
echo "Ejecutando get_complete_user_data.sql..."
psql "$DATABASE_URL" -f get_complete_user_data.sql

if [ $? -eq 0 ]; then
    echo "✅ Stored procedure aplicado exitosamente"
    echo ""
    echo "Probando el stored procedure..."
    psql "$DATABASE_URL" -c "SELECT * FROM sp_obtenerdatousuarioscompletos('gg1700');"
    echo ""
    echo "✅ Todo listo! El backend ahora retornará datos completos del usuario"
else
    echo "❌ Error al aplicar el stored procedure"
    exit 1
fi
