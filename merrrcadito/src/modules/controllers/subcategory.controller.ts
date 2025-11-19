import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { ImageService } from '../services/image.service';
import * as SubcategoryServiceModule from '../services/subcategory.service';

const prisma = new PrismaClient();

export class SubcategoryController {
  /**
   * Crear una nueva subcategoría
   * POST /api/subcategories
   */
  static async createSubcategory(req: Request, res: Response) {
    try {
      const { nom_subcat_prod, descr_subcat_prod, cod_cat } = req.body;
      
      // Validar que se haya subido una imagen
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'La imagen es requerida',
        });
      }

      // Validar campos requeridos
      if (!nom_subcat_prod || !descr_subcat_prod || !cod_cat) {
        return res.status(400).json({
          success: false,
          message: 'Todos los campos son requeridos',
        });
      }

      // Verificar que la categoría existe
      const categoryExists = await prisma.categoria.findUnique({
        where: { cod_cat: parseInt(cod_cat) },
      });

      if (!categoryExists) {
        return res.status(404).json({
          success: false,
          message: 'La categoría especificada no existe',
        });
      }

      // Validar que la imagen sea válida
      const isValidImage = await ImageService.validateImage(req.file.buffer);
      if (!isValidImage) {
        return res.status(400).json({
          success: false,
          message: 'El archivo no es una imagen válida',
        });
      }

      // Procesar y optimizar la imagen
      const processedImage = await ImageService.processImage(req.file.buffer, {
        width: 800,
        height: 800,
        quality: 85,
        format: 'jpeg',
      });

      // Crear la subcategoría en la base de datos
      const newSubcategory = await prisma.subcategoria_producto.create({
        data: {
          nom_subcat_prod,
          descr_subcat_prod,
          cod_cat: parseInt(cod_cat),
          imagen_representativa: Buffer.from(processedImage) as any,
        },
        include: {
          categoria: {
            select: {
              cod_cat: true,
              nom_cat: true,
              tipo_cat: true,
            },
          },
        },
      });

      return res.status(201).json({
        success: true,
        message: 'Subcategoría creada exitosamente',
        data: {
          cod_subcat_prod: newSubcategory.cod_subcat_prod,
          nom_subcat_prod: newSubcategory.nom_subcat_prod,
          descr_subcat_prod: newSubcategory.descr_subcat_prod,
          categoria: newSubcategory.categoria,
          hasImage: !!newSubcategory.imagen_representativa,
        },
      });
    } catch (error: any) {
      console.error('Error creando subcategoría:', error);
      
      // Manejar error de nombre duplicado
      if (error.code === 'P2002') {
        return res.status(409).json({
          success: false,
          message: 'Ya existe una subcategoría con ese nombre',
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message,
      });
    }
  }

  /**
   * Obtener todas las subcategorías
   * GET /api/subcategories
   */
  static async getAllSubcategories(req: Request, res: Response) {
    try {
      const { cod_cat } = req.query;

      const whereClause = cod_cat
        ? { cod_cat: parseInt(cod_cat as string) }
        : {};

      const subcategories = await prisma.subcategoria_producto.findMany({
        where: whereClause,
        select: {
          cod_subcat_prod: true,
          nom_subcat_prod: true,
          descr_subcat_prod: true,
          cod_cat: true,
          categoria: {
            select: {
              cod_cat: true,
              nom_cat: true,
              tipo_cat: true,
            },
          },
        },
        orderBy: {
          cod_subcat_prod: 'desc',
        },
      });

      return res.status(200).json({
        success: true,
        data: subcategories,
      });
    } catch (error: any) {
      console.error('Error obteniendo subcategorías:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message,
      });
    }
  }

  /**
   * Obtener una subcategoría por ID
   * GET /api/subcategories/:id
   */
  static async getSubcategoryById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const subcategory = await prisma.subcategoria_producto.findUnique({
        where: {
          cod_subcat_prod: parseInt(id),
        },
        include: {
          categoria: true,
        },
      });

      if (!subcategory) {
        return res.status(404).json({
          success: false,
          message: 'Subcategoría no encontrada',
        });
      }

      return res.status(200).json({
        success: true,
        data: subcategory,
      });
    } catch (error: any) {
      console.error('Error obteniendo subcategoría:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message,
      });
    }
  }

  /**
   * Obtener la imagen de una subcategoría
   * GET /api/subcategories/:id/image
   */
  static async getSubcategoryImage(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const subcategory = await prisma.subcategoria_producto.findUnique({
        where: {
          cod_subcat_prod: parseInt(id),
        },
        select: {
          imagen_representativa: true,
        },
      });

      if (!subcategory || !subcategory.imagen_representativa) {
        return res.status(404).json({
          success: false,
          message: 'Imagen no encontrada',
        });
      }

      // Configurar headers para servir la imagen
      res.set('Content-Type', 'image/jpeg');
      res.set('Cache-Control', 'public, max-age=31536000');
      
      return res.send(subcategory.imagen_representativa);
    } catch (error: any) {
      console.error('Error obteniendo imagen:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message,
      });
    }
  }

  /**
   * Actualizar una subcategoría
   * PUT /api/subcategories/:id
   */
  static async updateSubcategory(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { nom_subcat_prod, descr_subcat_prod, cod_cat } = req.body;

      // Verificar que la subcategoría existe
      const existingSubcategory = await prisma.subcategoria_producto.findUnique({
        where: { cod_subcat_prod: parseInt(id) },
      });

      if (!existingSubcategory) {
        return res.status(404).json({
          success: false,
          message: 'Subcategoría no encontrada',
        });
      }

      // Preparar datos para actualizar
      const updateData: any = {};
      
      if (nom_subcat_prod) updateData.nom_subcat_prod = nom_subcat_prod;
      if (descr_subcat_prod) updateData.descr_subcat_prod = descr_subcat_prod;
      
      if (cod_cat) {
        // Verificar que la nueva categoría existe
        const categoryExists = await prisma.categoria.findUnique({
          where: { cod_cat: parseInt(cod_cat) },
        });

        if (!categoryExists) {
          return res.status(404).json({
            success: false,
            message: 'La categoría especificada no existe',
          });
        }
        
        updateData.cod_cat = parseInt(cod_cat);
      }

      // Si se subió una nueva imagen
      if (req.file) {
        const isValidImage = await ImageService.validateImage(req.file.buffer);
        if (!isValidImage) {
          return res.status(400).json({
            success: false,
            message: 'El archivo no es una imagen válida',
          });
        }

        const processedImage = await ImageService.processImage(req.file.buffer, {
          width: 800,
          height: 800,
          quality: 85,
          format: 'jpeg',
        });

        updateData.imagen_representativa = Buffer.from(processedImage) as any;
      }

      // Actualizar la subcategoría
      const updatedSubcategory = await prisma.subcategoria_producto.update({
        where: { cod_subcat_prod: parseInt(id) },
        data: updateData,
        include: {
          categoria: true,
        },
      });

      return res.status(200).json({
        success: true,
        message: 'Subcategoría actualizada exitosamente',
        data: {
          cod_subcat_prod: updatedSubcategory.cod_subcat_prod,
          nom_subcat_prod: updatedSubcategory.nom_subcat_prod,
          descr_subcat_prod: updatedSubcategory.descr_subcat_prod,
          categoria: updatedSubcategory.categoria,
          hasImage: !!updatedSubcategory.imagen_representativa,
        },
      });
    } catch (error: any) {
      console.error('Error actualizando subcategoría:', error);
      
      if (error.code === 'P2002') {
        return res.status(409).json({
          success: false,
          message: 'Ya existe una subcategoría con ese nombre',
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message,
      });
    }
  }

  /**
   * Eliminar una subcategoría
   * DELETE /api/subcategories/:id
   */
  static async deleteSubcategory(req: Request, res: Response) {
    try {
      const { id } = req.params;

      // Verificar que la subcategoría existe
      const subcategory = await prisma.subcategoria_producto.findUnique({
        where: { cod_subcat_prod: parseInt(id) },
      });

      if (!subcategory) {
        return res.status(404).json({
          success: false,
          message: 'Subcategoría no encontrada',
        });
      }

      // Eliminar la subcategoría (los productos se eliminarán en cascada)
      await prisma.subcategoria_producto.delete({
        where: { cod_subcat_prod: parseInt(id) },
      });

      return res.status(200).json({
        success: true,
        message: 'Subcategoría eliminada exitosamente',
      });
    } catch (error: any) {
      console.error('Error eliminando subcategoría:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message,
      });
    }
  }
}