import * as SubcategoryService from '../services/subcategory.service';
import { Request, Response } from 'express';

export async function registerSubcategory(req: Request, res: Response){
    try{
      const { cod_cat, nom_subcat_prod, descr_subcat_prod, imagen_representativa } = req.body;
      if (!cod_cat || !nom_subcat_prod || !descr_subcat_prod || !imagen_representativa) {
        return res.status(400).json({
          success: false,
          error: "Faltan campos"
        });
      }

      const result = await SubcategoryService.registerSubcategory(cod_cat, nom_subcat_prod, descr_subcat_prod, imagen_representativa);
      res.status(201).json({result});
      return 
     
    } catch (error) {
      console.log("Error al registar subcategoría");
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
}