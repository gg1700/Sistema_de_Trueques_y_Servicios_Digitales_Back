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

interface AccessInfo {
    cod_us: string,
    estado_acc: 'exitoso' | 'no_exitoso' | 'logout',
    fecha_acc: Date,
    contra_acc: string
}

export async function get_complete_access_history_by_month (month: string) {
    try {
        const access_history : AccessInfo[] = await prisma.$queryRaw`
            SELECT * FROM sp_obtenerhistorialaccesoscompletomes(
                ${month}::INTEGER
            )
        `;
        const filtered_access_history : AccessInfo[] = []
        for (const access of access_history) {
            const filtered_transaction = Object.fromEntries(
                Object.entries(access).filter(([_, v]) => v !== null)
            ) as AccessInfo;
            filtered_access_history.push(filtered_transaction);
        }
        return filtered_access_history;
    } catch (err) {
        throw new Error((err as Error).message);
    }
}