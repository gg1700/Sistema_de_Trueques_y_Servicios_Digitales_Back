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

export async function updateCategory(req: Request, res: Response) {
  try{
    const cod_cat = req.query.cod_cat;
    const attributes = req.body;
    if(!cod_cat || !attributes){
      return res.status(400).json({ message: 'Faltan parametros para la consulta: cod_cat u otros atributos.' });
    }
    if(typeof cod_cat !== 'string'){
      return res.status(400).json({ message: 'Error de tipo en el atributo cod_cat.' });
    }
    const codCat = parseInt(cod_cat, 10);
    const formatedAttributes = Object.fromEntries(
      Object.entries(attributes).filter((v) => v !== undefined && v !== null)
    );
    const category_updated = await CategoryService.updateCategory(codCat, formatedAttributes);
    return res.status(200).json({
      message: 'Categoria actualizada con exito.',
      category_updated
    });
  }catch(err){
    console.error(err);
    return res.status(500).json({ message: 'Error de servidor al intentar actualizar la subcategoria.' });
  }
}

export async function getAllSubcategories(req: Request, res: Response){
  try{
    const all_categories = await CategoryService.get_all_categories();
    if(!all_categories){
      return res.status(400).json({ message: 'No se encontraron categorias.' });
    }
    return res.status(200).json({
      message: 'Todas las categorias fueron accesadas correctamente.',
      all_categories
    });
  }catch(err){
    console.error(err);
    return res.status(500).json({ message: 'Error de servidor al intentar obtener toda la informacion de categorias.' });
  }
}