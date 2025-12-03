import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function updateServiceImpacts() {
    try {
        console.log("Iniciando actualización de impactos ambientales para servicios...");

        // 1. Obtener todos los servicios  con sus publicaciones que tengan impacto 0
        const services: any[] = await prisma.$queryRaw`
      SELECT 
        s.cod_serv,
        s.nom_serv,
        s.duracion_serv,
        s.dif_dist_serv,
        p.cod_pub,
        p.impacto_amb_pub
      FROM publicacion p
      INNER JOIN publicacion_servicio ps ON p.cod_pub = ps.cod_pub
      INNER JOIN servicio s ON ps.cod_serv = s.cod_serv
      WHERE p.impacto_amb_pub = 0.0
    `;

        console.log(`Encontrados ${services.length} servicioscon impacto 0.0`);

        let updated = 0;
        for (const service of services) {
            // Calcular impacto
            const duracion = Number(service.duracion_serv) || 60;
            const distancia = Number(service.dif_dist_serv) || 1;
            const duracionHoras = duracion / 60;
            const impactoBase = (duracionHoras * 0.3) + (distancia * 0.5);
            const impactoAmbiental = Number((5 + impactoBase).toFixed(2));

            // Actualizar publicación
            await prisma.$queryRaw`
        UPDATE publicacion
        SET impacto_amb_pub = ${impactoAmbiental}::DECIMAL
        WHERE cod_pub = ${service.cod_pub}::INTEGER
      `;

            console.log(`✓ Actualizado servicio "${service.nom_serv}" (cod_pub: ${service.cod_pub}) -> ${impactoAmbiental} pts`);
            updated++;
        }

        console.log(`\n✅ Actualización completada: ${updated} servicios actualizados`);
    } catch (error) {
        console.error("Error actualizando impactos:", error);
    } finally {
        await prisma.$disconnect();
    }
}

updateServiceImpacts();
