import { Request, Response } from "express";
import * as WalletService from "../services/wallet.service";
import * as PromotionService from "../services/promotion.service";
import * as EventService from "../services/event.service";
import * as UserService from "../services/user.service";

// =========================================
// REPORTE 1: FLUJO DE BILLETERAS
// =========================================
export async function getWalletFlowReport(req: Request, res: Response) {
    try {
        const report = await WalletService.get_wallet_flow_report();
        if (!report) {
            return res.status(404).json({
                success: false,
                message: 'No se encontraron datos del flujo de billeteras.',
                data: []
            });
        }
        return res.status(200).json({
            success: true,
            message: 'Reporte de flujo de billeteras obtenido exitosamente.',
            data: report
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: 'Error al obtener el reporte de flujo de billeteras.',
            error: (err as Error).message
        });
    }
}

// =========================================
// REPORTE 2: RENDIMIENTO DE PROMOCIONES
// =========================================
export async function getPromotionPerformanceReport(req: Request, res: Response) {
    try {
        const { fecha_inicio, fecha_fin } = req.query;
        if (!fecha_inicio || !fecha_fin) {
            return res.status(400).json({
                success: false,
                message: 'Fechas de inicio y fin son requeridas.'
            });
        }
        const report = await PromotionService.get_promotion_performance_report(
            fecha_inicio as string,
            fecha_fin as string
        );
        return res.status(200).json({
            success: true,
            message: 'Reporte de rendimiento de promociones obtenido exitosamente.',
            data: report
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: 'Error al obtener el reporte de promociones.',
            error: (err as Error).message
        });
    }
}

// =========================================
// REPORTE 3: EVENTOS POR ORGANIZACIÓN
// =========================================
export async function getEventsOrganizationReport(req: Request, res: Response) {
    try {
        const { mes, anio } = req.query;
        if (!mes || !anio) {
            return res.status(400).json({
                success: false,
                message: 'Mes y año son requeridos.'
            });
        }
        const report = await EventService.get_events_organization_report(
            mes as string,
            anio as string
        );
        return res.status(200).json({
            success: true,
            message: 'Reporte de eventos por organización obtenido exitosamente.',
            data: report
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: 'Error al obtener el reporte de eventos.',
            error: (err as Error).message
        });
    }
}

// =========================================
// REPORTE 4: PRODUCTOS Y SERVICIOS MÁS VENDIDOS
// =========================================
export async function getTopProductsServicesReport(req: Request, res: Response) {
    try {
        const { mes, anio, limite } = req.query;
        if (!mes || !anio) {
            return res.status(400).json({
                success: false,
                message: 'Mes y año son requeridos.'
            });
        }
        const report = await UserService.get_top_products_services_report(
            mes as string,
            anio as string,
            (limite as string) || '10'
        );
        return res.status(200).json({
            success: true,
            message: 'Reporte de productos y servicios más vendidos obtenido exitosamente.',
            data: report
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: 'Error al obtener el reporte de productos/servicios.',
            error: (err as Error).message
        });
    }
}

// =========================================
// REPORTE 5: IMPACTO AMBIENTAL COMPARATIVO
// =========================================
export async function getEnvironmentalImpactReport(req: Request, res: Response) {
    try {
        const { mes, anio } = req.query;
        if (!mes || !anio) {
            return res.status(400).json({
                success: false,
                message: 'Mes y año son requeridos.'
            });
        }
        const report = await UserService.get_environmental_impact_report(
            mes as string,
            anio as string
        );
        return res.status(200).json({
            success: true,
            message: 'Reporte de impacto ambiental comparativo obtenido exitosamente.',
            data: report
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: 'Error al obtener el reporte de impacto ambiental.',
            error: (err as Error).message
        });
    }
}

// =========================================
// REPORTE 6: COMPORTAMIENTO DE USUARIOS
// =========================================
export async function getUserBehaviorReport(req: Request, res: Response) {
    try {
        const { mes, anio } = req.query;
        if (!mes || !anio) {
            return res.status(400).json({
                success: false,
                message: 'Mes y año son requeridos.'
            });
        }
        const report = await UserService.get_user_behavior_report(
            mes as string,
            anio as string
        );
        return res.status(200).json({
            success: true,
            message: 'Reporte de comportamiento de usuarios obtenido exitosamente.',
            data: report
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: 'Error al obtener el reporte de comportamiento.',
            error: (err as Error).message
        });
    }
}

// =========================================
// REPORTE 7: INTERCAMBIOS VS COMPRAS
// =========================================
export async function getExchangesVsPurchasesReport(req: Request, res: Response) {
    try {
        const { mes, anio } = req.query;
        if (!mes || !anio) {
            return res.status(400).json({
                success: false,
                message: 'Mes y año son requeridos.'
            });
        }
        const report = await UserService.get_exchanges_vs_purchases_report(
            mes as string,
            anio as string
        );
        return res.status(200).json({
            success: true,
            message: 'Reporte de intercambios vs compras obtenido exitosamente.',
            data: report
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: 'Error al obtener el reporte de intercambios vs compras.',
            error: (err as Error).message
        });
    }
}

// =========================================
// REPORTE 8: LOGROS Y GAMIFICACIÓN
// =========================================
export async function getAchievementsGamificationReport(req: Request, res: Response) {
    try {
        const report = await UserService.get_achievements_gamification_report();
        return res.status(200).json({
            success: true,
            message: 'Reporte de logros y gamificación obtenido exitosamente.',
            data: report
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: 'Error al obtener el reporte de logros.',
            error: (err as Error).message
        });
    }
}

// =========================================
// REPORTE 9: CALIFICACIONES Y SATISFACCIÓN
// =========================================
export async function getRatingsSatisfactionReport(req: Request, res: Response) {
    try {
        const { mes, anio } = req.query;
        if (!mes || !anio) {
            return res.status(400).json({
                success: false,
                message: 'Mes y año son requeridos.'
            });
        }
        const report = await UserService.get_ratings_satisfaction_report(
            mes as string,
            anio as string
        );
        return res.status(200).json({
            success: true,
            message: 'Reporte de calificaciones y satisfacción obtenido exitosamente.',
            data: report
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: 'Error al obtener el reporte de calificaciones.',
            error: (err as Error).message
        });
    }
}

// =========================================
// REPORTE 10: POTENCIADORES Y MONETIZACIÓN
// =========================================
export async function getBoostersMonetizationReport(req: Request, res: Response) {
    try {
        const { mes, anio } = req.query;
        if (!mes || !anio) {
            return res.status(400).json({
                success: false,
                message: 'Mes y año son requeridos.'
            });
        }
        const report = await UserService.get_boosters_monetization_report(
            mes as string,
            anio as string
        );
        return res.status(200).json({
            success: true,
            message: 'Reporte de potenciadores y monetización obtenido exitosamente.',
            data: report
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: 'Error al obtener el reporte de potenciadores.',
            error: (err as Error).message
        });
    }
}
