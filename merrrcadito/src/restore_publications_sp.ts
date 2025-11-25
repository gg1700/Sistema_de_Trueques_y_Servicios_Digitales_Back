import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    try {
        console.log("Restaurando sp_obtenerpublicacionesproducto (versión simplificada)...\n");

        // Eliminar la función rota
        await prisma.$executeRaw`
      DROP FUNCTION IF EXISTS sp_obtenerpublicacionesproducto();
    `;

        // Crear versión simplificada sin joins que fallen
        await prisma.$executeRaw`
      CREATE OR REPLACE FUNCTION sp_obtenerpublicacionesproducto()
      RETURNS TABLE(
          cod_pub INT,
          cod_prod INT,
          nom_prod VARCHAR,
          cod_us INT,
          precio_pub NUMERIC,
          foto_pub BYTEA,
          calif_pond_pub DECIMAL,
          estado_pub VARCHAR,
          contenido VARCHAR,
          desc_prod VARCHAR,
          impacto_amb_pub NUMERIC,
          descr_pub VARCHAR
      ) LANGUAGE plpgsql AS $$
      BEGIN
          RETURN QUERY
          SELECT 
              p.cod_pub,
              pr.cod_prod,
              pr.nom_prod,
              p.cod_us,
              p.precio_pub,
              p.foto_pub,
              p.calif_pond_pub,
              p.estado_pub::VARCHAR,
              p.contenido,
              pr.desc_prod,
              p.impacto_amb_pub,
              p.descr_pub
          FROM publicacion p
          INNER JOIN publicacion_producto pp ON p.cod_pub = pp.cod_pub
          INNER JOIN producto pr ON pp.cod_prod = pr.cod_prod
          WHERE p.estado_pub = 'activo'
          ORDER BY p.fecha_registro_pub DESC;
      END;
      $$;
    `;

        console.log("✅ Stored procedure restaurado (versión simplificada)!");
        console.log("Mostrará SOLO publicaciones activas\n");

        // Verificar
        const testResult = await prisma.$queryRaw`
      SELECT cod_pub, estado_pub, nom_prod FROM sp_obtenerpublicacionesproducto()
      WHERE cod_us = 7
      ORDER BY cod_pub;
    `;

        console.log("Verificación - Publicaciones activas del usuario 7:");
        console.log(testResult);
        console.log(`\nTotal: ${(testResult as any[]).length} publicaciones activas`);

    } catch (e) {
        console.error("❌ Error:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
