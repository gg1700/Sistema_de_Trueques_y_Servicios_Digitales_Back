import * as dotenv from 'dotenv';
import connectToDatabase from '../../database';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const prisma = new PrismaClient();

let connected: boolean = false;

export async function setDatabaseConnection() {
    if (!connected) {
        await connectToDatabase();
        connected = true;
    }
}

export async function registrar_promocion(current_promotion: {
    titulo_prom: string;
    fecha_ini_prom: Date;
    fecha_fin_prom: Date;
    descr_prom: string;
    banner_prom: Uint8Array;
    descuento_prom: number}) {
    try{
        await setDatabaseConnection();     
        const exists = await prisma.$queryRaw`
            SELECT * FROM "Promocion"
            WHERE titulo_prom = ${current_promotion.titulo_prom}
            AND fecha_ini_prom = ${current_promotion.fecha_ini_prom}::timestamp`;
        let created = false;
        if(!exists || (Array.isArray(exists) && exists.length === 0)){
            await prisma.$executeRaw`
                SELECT crear_promocion(
                    ${current_promotion.titulo_prom},
                    ${current_promotion.fecha_ini_prom}::timestamp,
                    ${current_promotion.fecha_fin_prom}::timestamp,
                    ${current_promotion.descr_prom},
                    ${current_promotion.banner_prom},
                    ${current_promotion.descuento_prom}
                )`;
            created = true;
            return created;
        }else{
            return created;
        }
    }catch(err){
        throw new Error('Error creating promotion: ' + (err as Error).message);
    }
}