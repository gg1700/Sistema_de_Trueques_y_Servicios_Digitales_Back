import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface ExchangeInfo {
    cod_inter: number;
    fecha_inter: Date;
    cod_us_2: number;
    nombre_usuario_2: string;
    handle_name_2: string;
    cod_prod_origen: number;
    nombre_prod_origen: string;
    cod_prod_destino: number;
    nombre_prod_destino: string;
    cant_prod_origen: number;
    cant_prod_destino: number;
    unidad_medida_origen: string;
    unidad_medida_destino: string;
    impacto_amb_inter: number;
    estado_inter: string;
}

export async function get_user_exchange_history(cod_us: string) {
    try {
        const exchange_history: ExchangeInfo[] = await prisma.$queryRaw`
            SELECT * FROM sp_obtenerhistorialintercambiosusuario(
                ${cod_us}::INTEGER
            )
        `;

        const filtered_exchange_history: ExchangeInfo[] = [];
        for (const exchange of exchange_history) {
            const filtered_exchange = Object.fromEntries(
                Object.entries(exchange).filter(([_, v]) => v !== null)
            ) as ExchangeInfo;
            filtered_exchange_history.push(filtered_exchange);
        }

        return filtered_exchange_history;
    } catch (err) {
        throw new Error((err as Error).message);
    }
}
