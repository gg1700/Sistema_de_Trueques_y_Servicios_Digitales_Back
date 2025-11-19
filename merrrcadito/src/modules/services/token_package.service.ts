import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function register_token_package(nombre: string, tokens: string, precio_real: string, imagen_paquete: Buffer) {
    try {
        await prisma.$queryRaw`
            SELECT sp_registrarPaquetetoken(
                ${nombre}::VARCHAR,
                ${tokens}::INTEGER,
                ${precio_real}::DECIMAL,
                ${imagen_paquete ?? null}::BYTEA
            )
        `;
        return { success: true, message: "Paquete de tokens registrado correctamente" };
    } catch (err) {
        throw new Error((err as Error).message);
    }
}

export async function get_all_packages() {
    try {
        const packages_data = await prisma.$queryRaw`
            SELECT * FROM sp_obtenerpacketestoken()
        `;
        return packages_data;
    } catch (err) {
        throw new Error((err as Error).message)
    }
}

export async function get_package_image(id: number) {
    try {
        const result: any[] = await prisma.$queryRaw`
            SELECT imagen_paquete FROM public.paquete_token WHERE id = ${id}
        `;

        if (result.length > 0) {
            return result[0].imagen_paquete;
        }
        return null;
    } catch (err) {
        console.error("Error obteniendo imagen:", err);
        return null;
    }
}