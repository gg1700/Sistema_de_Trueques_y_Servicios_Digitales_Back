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

export async function getSubcategory(req: Request, res: Response){
  try{
    const data = await SubcategoryService.getSubcategory();
    if(!data){
      return res.status(404).json({
        success: false,
        error: "No se encontraron subcategorias"
      });
    }
    return res.status(200).json(data);
  } catch (error) {
    console.log("Error al obtener subcategorias");
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}

export async function updateSubcategory(req: Request, res: Response) {
  try{
    const cod_subcat_prod = req.query.cod_subcat_prod;
    const attributes = req.body;
    if(!cod_subcat_prod || !attributes){
      return res.status(400).json({ message: 'Faltan parametros para la consulta: cod_subcat_prod u otros atributos.' });
    }
    if(typeof cod_subcat_prod !== 'string'){
      return res.status(400).json({ message: 'Error de tipo en el atributo cod_subcat_prod.' });
    }
    const codSubcatProd = parseInt(cod_subcat_prod, 10);
    const formatedAttributes = Object.fromEntries(
      Object.entries(attributes).filter((v) => v !== undefined && v !== null)
    );
    const subcategory_updated = await SubcategoryService.updateSubcategory(codSubcatProd, formatedAttributes);
    return res.status(200).json({
      message: 'Subcategoria actualizada con exito.',
      subcategory_updated
    });
  }catch(err){
    console.error(err);
    return res.status(500).json({ message: 'Error de servidor al intentar actualizar la subcategoria.' });
  }
}