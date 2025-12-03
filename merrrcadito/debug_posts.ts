import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

(async () => {
    try {
        const posts = await prisma.$queryRaw`
            SELECT 
                p.cod_prod, 
                p.nom_prod, 
                mp.cod_mat,
                m.nom_mat
            FROM producto p
            LEFT JOIN material_producto mp ON p.cod_prod = mp.cod_prod
            LEFT JOIN material m ON mp.cod_mat = m.cod_mat
            WHERE p.nom_prod ILIKE '%Carton Reciclable%'
            ORDER BY p.cod_prod DESC
            LIMIT 5
        `;
        console.log('Carton Reciclable check:', posts);
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
})();
