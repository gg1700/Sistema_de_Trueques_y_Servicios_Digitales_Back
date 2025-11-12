import { Request, Response } from 'express';
import * as ReportsService from '@/modules/services/reports.service';

export async function getUsuariosPorAccion(req: Request, res: Response) {
  try {
    const { fecha_inicio, fecha_fin } = req.query;

    const result = await ReportsService.getUsuariosPorAccion(
      fecha_inicio as string,
      fecha_fin as string
    );

    return res.status(200).json(result);
  } catch (error) {
    console.error('Error en getUsuariosPorAccion:', error);
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Error interno del servidor'
    });
  }
}

export async function getImpactoAmbiental(req: Request, res: Response) {
  try {
    const { anio } = req.query;
    const anioNum = anio ? parseInt(anio as string) : undefined;

    const result = await ReportsService.getImpactoAmbientalPlataforma(anioNum);

    return res.status(200).json(result);
  } catch (error) {
    console.error('Error en getImpactoAmbiental:', error);
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Error interno del servidor'
    });
  }
}

export async function getComprasTienda(req: Request, res: Response) {
  try {
    const { anio } = req.query;
    const anioNum = anio ? parseInt(anio as string) : undefined;

    const result = await ReportsService.getComprasTienda(anioNum);

    return res.status(200).json(result);
  } catch (error) {
    console.error('Error en getComprasTienda:', error);
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Error interno del servidor'
    });
  }
}

export async function getReporteEventos(req: Request, res: Response) {
  try {
    const { fecha_inicio, fecha_fin } = req.query;

    const result = await ReportsService.getReporteEventos(
      fecha_inicio as string,
      fecha_fin as string
    );

    return res.status(200).json(result);
  } catch (error) {
    console.error('Error en getReporteEventos:', error);
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Error interno del servidor'
    });
  }
}