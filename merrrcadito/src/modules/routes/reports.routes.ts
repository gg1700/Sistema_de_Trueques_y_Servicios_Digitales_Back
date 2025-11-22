import { Router } from 'express';
import * as ReportsController from '../controllers/reports.controller';

const router = Router();

// REPORTE 1: Flujo de Billeteras
router.get('/wallet_flow', ReportsController.getWalletFlowReport);

// REPORTE 2: Rendimiento de Promociones
router.get('/promotion_performance', ReportsController.getPromotionPerformanceReport);

// REPORTE 3: Eventos por Organización
router.get('/events_organization', ReportsController.getEventsOrganizationReport);

// REPORTE 4: Productos y Servicios Más Vendidos
router.get('/top_products_services', ReportsController.getTopProductsServicesReport);

// REPORTE 5: Impacto Ambiental Comparativo
router.get('/environmental_impact', ReportsController.getEnvironmentalImpactReport);

// REPORTE 6: Comportamiento de Usuarios
router.get('/user_behavior', ReportsController.getUserBehaviorReport);

// REPORTE 7: Intercambios vs Compras
router.get('/exchanges_vs_purchases', ReportsController.getExchangesVsPurchasesReport);

// REPORTE 8: Logros y Gamificación
router.get('/achievements_gamification', ReportsController.getAchievementsGamificationReport);

// REPORTE 9: Calificaciones y Satisfacción
router.get('/ratings_satisfaction', ReportsController.getRatingsSatisfactionReport);

// REPORTE 10: Potenciadores y Monetización
router.get('/boosters_monetization', ReportsController.getBoostersMonetizationReport);

export default router;
