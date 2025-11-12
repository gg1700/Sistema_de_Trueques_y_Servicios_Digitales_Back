import Router from 'express';
import * as ReportsController from '@/modules/controllers/reports.controller';

const router = Router();

router.get('/usuarios-por-accion', ReportsController.getUsuariosPorAccion);
router.get('/impacto-ambiental', ReportsController.getImpactoAmbiental);
router.get('/compras-tienda', ReportsController.getComprasTienda);
router.get('/eventos', ReportsController.getReporteEventos);

export default router;