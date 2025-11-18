import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function register_access(cod_us: string, contra_acc: string) {
    try {
        const password_us = await prisma.$queryRaw`
            SELECT contra_us FROM "usuario" 
            WHERE cod_us = ${cod_us}::INTEGER
        `;
        const [password] = password_us as any[];
        const { contra_us } = password;
        let estado_acc = null;
        if (contra_us !== contra_acc) {
            estado_acc = 'no_exitoso';    
        }else{
            estado_acc = 'exitoso';
        }
        await prisma.$queryRaw`
            SELECT sp_registrarAcceso(
                ${cod_us}::INTEGER,
                ${estado_acc}::"AccessState",
                ${contra_acc}::VARCHAR
            )
        `;
        return { success: true, message: "Acceso registrado correctamente" };
    }catch (err) {
        throw new Error((err as Error).message);
    }
}

export async function register_logout(cod_us: string) {
    try {
        const estado_acc = 'logout';
        await prisma.$queryRaw`
            SELECT sp_registrarcierresesion(
                ${cod_us}::INTEGER,
                ${estado_acc}::"AccessState"
            )
        `;
        return { success: true, message: "Cierre de sesión registrado correctamente" };
    }catch (err) {
        throw new Error((err as Error).message);
    }
}