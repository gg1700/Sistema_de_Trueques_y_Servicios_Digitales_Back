import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET /materials - Obtener todos los materiales disponibles para cálculo CO2
router.get('/', async (req, res) => {
    try {
        const materials = await prisma.$queryRaw`
      SELECT 
        cod_mat,
        nom_mat,
        descr_mat,
        factor_co2,
        unidad_medida_co2
      FROM material
      ORDER BY nom_mat ASC
    `;

        res.json({
            success: true,
            materials: materials
        });
    } catch (error) {
        console.error('Error fetching materials:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener materiales',
            error: (error as Error).message
        });
    }
});

export default router;
