import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function registerCategory(
  nom_cat: string,
  descr_cat: string,
  imagen_repr: Buffer,
  tipo_cat: string
) {
  try {
    await prisma.$queryRaw`
      CALL sp_registrarCategoria(
        ${nom_cat}::VARCHAR,
        ${descr_cat}::VARCHAR,
        ${imagen_repr}::BYTEA,
        ${tipo_cat}::VARCHAR
      )
    `;
    return { success: true, message: "Categoría registrada correctamente" }
  } catch (error) {
    throw error;
  }
}
