import * as EquivalenceService from '../services/equivalence.service';
import { Request, Response } from 'express';

export async function registerEquivalence(req: Request, res: Response){
    try{
      const { cod_mat, unidad_origen, factor_conversion, descripcion_equiv, fuente_datos } = req.body;
      if (!cod_mat || !unidad_origen || !factor_conversion || !descripcion_equiv || !fuente_datos) {
        return res.status(400).json({
          success: false,
          error: "Faltan campos"
        });
      }
      const result = await EquivalenceService.registrarEquivalencia(cod_mat, unidad_origen, factor_conversion, descripcion_equiv, fuente_datos);
      res.status(201).json({result});
      return 
     
    } catch (error) {
      console.log("Error al registar equivalencia");
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error en el servidor al registrar equivalencia'
      });
    }
}