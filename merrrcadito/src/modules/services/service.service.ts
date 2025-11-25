import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface ServiceData {
    cod_cat: number;
    nom_serv: string;
    desc_serv: string;
    precio_serv: number;
    duracion_serv: number; // en minutos
    dif_dist_serv: number; // dificultad/distancia
    cod_us: number; // Usuario dueño del servicio (emprendedor)
    hrs_ini_dia_serv: string; // HH:MM
    hrs_fin_dia_serv: string; // HH:MM
}

/**
 * Registrar un nuevo servicio
 */
export async function createService(data: ServiceData) {
    try {
        // 1. Crear el servicio en la tabla SERVICIO
        // Nota: estado_serv por defecto 'disponible'
        const newService = await prisma.$queryRaw`
      INSERT INTO servicio (
        cod_cat, nom_serv, desc_serv, estado_serv, 
        precio_serv, duracion_serv, dif_dist_serv
      )
      VALUES (
        ${data.cod_cat}::INTEGER,
        ${data.nom_serv},
        ${data.desc_serv},
        'disponible',
        ${data.precio_serv}::DECIMAL,
        ${data.duracion_serv}::INTEGER,
        ${data.dif_dist_serv}::DECIMAL
      )
      RETURNING cod_serv
    ` as any[];

        const cod_serv = newService[0].cod_serv;

        // 2. Crear la publicación asociada en PUBLICACION
        // Se asume fecha actual como inicio y fin (o indefinido)
        const newPub = await prisma.$queryRaw`
      INSERT INTO publicacion (
        cod_us, fecha_ini_pub, fecha_fin_pub, 
        calif_pond_pub, impacto_amb_pub
      )
      VALUES (
        ${data.cod_us}::INTEGER,
        NOW(),
        NOW() + INTERVAL '1 year', -- Por defecto 1 año de vigencia
        0.0,
        0.0
      )
      RETURNING cod_pub
    ` as any[];

        const cod_pub = newPub[0].cod_pub;

        // 3. Vincular Publicación con Servicio en PUBLICACION_SERVICIO
        await prisma.$queryRaw`
      INSERT INTO publicacion_servicio (
        cod_pub, cod_serv, hrs_ini_dia_serv, hrs_fin_dia_serv
      )
      VALUES (
        ${cod_pub}::INTEGER,
        ${cod_serv}::INTEGER,
        ${data.hrs_ini_dia_serv}::TIME,
        ${data.hrs_fin_dia_serv}::TIME
      )
    `;

        return { success: true, message: "Servicio registrado correctamente", cod_serv, cod_pub };
    } catch (err) {
        console.error("Error en createService:", err);
        throw new Error((err as Error).message);
    }
}

/**
 * Obtener servicios de un usuario
 */
export async function getUserServices(cod_us: number) {
    try {
        const services = await prisma.$queryRaw`
      SELECT 
        s.cod_serv,
        s.nom_serv,
        s.desc_serv,
        s.precio_serv,
        s.duracion_serv,
        s.estado_serv,
        p.cod_pub,
        ps.hrs_ini_dia_serv,
        ps.hrs_fin_dia_serv,
        c.nom_cat
      FROM publicacion p
      INNER JOIN publicacion_servicio ps ON p.cod_pub = ps.cod_pub
      INNER JOIN servicio s ON ps.cod_serv = s.cod_serv
      LEFT JOIN categoria c ON s.cod_cat = c.cod_cat
      WHERE p.cod_us = ${cod_us}::INTEGER
    ` as any[];

        return { success: true, data: services };
    } catch (err) {
        console.error("Error en getUserServices:", err);
        throw new Error((err as Error).message);
    }
}
