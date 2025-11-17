import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function get_users_activity_report_by_week() {
    try{
        const report = await prisma.$queryRaw`
            SELECT * FROM sp_reporteactividadusuarios() AS active_users
        `;
        return report;
    }catch(err){
        throw new Error((err as Error).message);
    }
}

export async function get_user_activity_report_by_month(){
    try{
        const report = await prisma.$queryRaw`
            SELECT * FROM sp_reporteactividadusuariospormes()
        `;
        return report;
    }catch(err){
        throw new Error((err as Error).message);
    }
}