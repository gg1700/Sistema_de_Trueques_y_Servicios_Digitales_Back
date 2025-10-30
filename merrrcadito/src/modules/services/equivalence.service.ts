import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function registrarEquivalencia(
    cod_mat: number,
    unidad_origen: string,
    factor_conversion: number,
    descripcion_equiv: string,
    fuente_datos: string,
) {
    try {
        await prisma.$queryRaw`
        SELECT sp_registrarEquivalencia(
            ${cod_mat}::INTEGER,
            ${unidad_origen}::VARCHAR,
            ${factor_conversion}::DECIMAL,
            ${descripcion_equiv}::VARCHAR,
            ${fuente_datos}::VARCHAR
        )
      `;
        return { success: true, message: "Equivalencia registrada correctamente" };
    } catch (err) {
        throw err;
    }
}