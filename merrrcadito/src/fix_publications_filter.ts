import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    try {
        console.log("Modificando sp_obtenerpublicacionesproducto para incluir publicaciones inactivas...\n");

        // Primero eliminar la función existente
        await prisma.$executeRaw`
      DROP FUNCTION IF EXISTS sp_obtenerpublicacionesproducto();
    `;

        // Modificar el stored procedure para NO filtrar por estado
        await prisma.$executeRaw`
      CREATE OR REPLACE FUNCTION sp_obtenerpublicacionesproducto()
      RETURNS TABLE(
          cod_pub INT,
          cod_prod INT,
          nom_prod VARCHAR,
          nom_cat VARCHAR,
          cod_us INT,
          handle_name VARCHAR,
          correo_us VARCHAR,
          telefono_us VARCHAR,
          nom_subcat_prod VARCHAR,
          precio_pub NUMERIC,
          foto_pub BYTEA,
          calif_pond_pub DECIMAL,
          calidad_prod VARCHAR,
          estado_pub VARCHAR,
          cantidad DECIMAL,
          marca_prod VARCHAR,
          unidad_medida VARCHAR,
          contenido VARCHAR,
          desc_prod VARCHAR,
          impacto_amb_pub NUMERIC
      ) LANGUAGE plpgsql AS $$
      BEGIN
          RETURN QUERY
          SELECT 
              p.cod_pub,
              pr.cod_prod,
              pr.nom_prod,
              c.nom_cat,
              u.cod_us,
              u.handle_name,
              u.correo_us,
              u.telefono_us,
              s.nom_subcat AS nom_subcat_prod,
              p.precio_pub,
              p.foto_pub,
              p.calif_pond_pub,
              pr.calidad_prod::VARCHAR,
              p.estado_pub::VARCHAR,
              pp.cant_prod AS cantidad,
              pr.marca_prod,
              pp.unidad_medida,
              p.contenido,
              pr.desc_prod,
              p.impacto_amb_pub
          FROM publicacion p
          INNER JOIN usuario u ON p.cod_us = u.cod_us
          INNER JOIN publicacion_producto pp ON p.cod_pub = pp.cod_pub
          INNER JOIN producto pr ON pp.cod_prod = pr.cod_prod
          INNER JOIN subcategoria s ON pr.cod_subcat = s.cod_subcat
          INNER JOIN categoria c ON s.cod_cat = c.cod_cat
          -- REMOVIDO: WHERE p.estado_pub = 'activo'
          ORDER BY p.fecha_registro_pub DESC;
      END;
      $$;
    `;

        console.log("✅ Stored procedure actualizado exitosamente!");
        console.log("Ahora mostrará TODAS las publicaciones (activas e inactivas)\n");

        // Verificar
        const testResult = await prisma.$queryRaw`
      SELECT cod_pub, estado_pub FROM sp_obtenerpublicacionesproducto()
      WHERE cod_us = 7
      ORDER BY cod_pub;
    `;

        console.log("Verificación - Publicaciones del usuario 7:");
        console.log(testResult);
        console.log(`\nTotal: ${(testResult as any[]).length} publicaciones`);

    } catch (e) {
        console.error("❌ Error:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
