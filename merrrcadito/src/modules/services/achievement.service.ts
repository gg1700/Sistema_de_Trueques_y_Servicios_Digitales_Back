import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getAchievementsByUserId = async (userId: number) => {
  try {
    // Fetch all achievements and join with user progress
    const achievements = await prisma.$queryRaw`
      SELECT 
        l.cod_logro,
        l.titulo_logro,
        l.descr_logro,
        l.calidad_logro,
        COALESCE(ul.progreso, 0) as progreso,
        COALESCE(ul.estado_logro::text, 'no_iniciado') as estado_logro,
        ul.fecha_obtencion_logro
      FROM logro l
      LEFT JOIN usuario_logro ul ON l.cod_logro = ul.cod_logro AND ul.cod_us = ${userId}
      ORDER BY l.cod_logro ASC
    `;

    return achievements;
  } catch (error) {
    console.error("Error fetching achievements:", error);
    throw new Error("Error al obtener los logros del usuario");
  }
};
