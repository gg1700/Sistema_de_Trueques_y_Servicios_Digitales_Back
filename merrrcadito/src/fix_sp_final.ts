import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    try {
        console.log("Verificando columnas de tabla publicacion...\n");

        // Ver columnas de publicacion
        const columns = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'publicacion'
      ORDER BY ordinal_position;
    `;

        console.log("Columnas de la tabla PUBLICACION:");
        console.log(columns);

        // Ver columnas de producto
        const prodCols = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'producto'
      ORDER BY ordinal_position;
    `;

        console.log("\n\nColumnas de la tabla PRODUCTO:");
        console.log(prodCols);

        console.log("\n\nRecreando stored procedure con columnas correctas...");

        // Eliminar SP roto
        await prisma.$executeRaw`DROP FUNCTION IF EXISTS sp_obtenerpublicacionesproducto();`;

        //Crear SP correcto basado en columnas reales
        await prisma.$executeRaw`
      CREATE OR REPLACE FUNCTION sp_obtenerpublicacionesproducto()
      RETURNS TABLE(
          cod_pub INT,
          cod_prod INT,
          nom_prod VARCHAR,
          cod_us INT,
          precio_prod NUMERIC,
          foto_pub BYTEA,
          calif_pond_pub DECIMAL,
          estado_pub VARCHAR,
          desc_prod VARCHAR,
          impacto_amb_pub NUMERIC,
          marca_prod VARCHAR,
          calidad_prod VARCHAR,
          cant_prod INT,
          unidad_medida VARCHAR
      ) LANGUAGE plpgsql AS $$
      BEGIN
          RETURN QUERY
          SELECT 
              p.cod_pub,
              pr.cod_prod,
              pr.nom_prod,
              p.cod_us,
              pr.precio_prod,
              p.foto_pub,
              p.calif_pond_pub,
              p.estado_pub::VARCHAR,
              pr.desc_prod,
              p.impacto_amb_pub,
              pr.marca_prod,
              pr.calidad_prod::VARCHAR,
              pp.cant_prod,
              pp.unidad_medida
          FROM publicacion p
          INNER JOIN publicacion_producto pp ON p.cod_pub = pp.cod_pub
          INNER JOIN producto pr ON pp.cod_prod = pr.cod_prod
          WHERE p.estado_pub = 'activo'
          ORDER BY p.fecha_ini_pub DESC;
      END;
      $$;
    `;

        console.log("✅ Stored procedure recreado con columnas correctas\n");

        // Verificar
        const test = await prisma.$queryRaw`
      SELECT cod_pub, nom_prod, estado_pub FROM sp_obtenerpublicacionesproducto() LIMIT 3;
    `;

        console.log("Test del SP:");
        console.log(test);

    } catch (e) {
        console.error("❌ Error:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
