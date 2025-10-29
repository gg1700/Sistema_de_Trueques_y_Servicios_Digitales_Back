import * as CategoryService from '../services/category.service';
import { Request, Response } from 'express';

export async function registerCategory(req: Request, res: Response) {
  try {
    const { nom_cat, descr_cat, imagen_repr, tipo_cat } = req.body;
    if (!nom_cat || !descr_cat || !imagen_repr || !tipo_cat) {
      return res.status(400).json({
        success: false,
        error: "Faltan campos"
      });
    }
    const result = await CategoryService.registerCategory(nom_cat, descr_cat, imagen_repr, tipo_cat);
    res.status(201).json({result});
    return 
  } catch (error) {
    console.log("Error al registar categoría");
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}
