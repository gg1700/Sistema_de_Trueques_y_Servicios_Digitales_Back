import { Request, Response } from 'express';
import { PrismaClient, Category } from '@prisma/client';
import { ImageService } from '../services/image.service';

const prisma = new PrismaClient();

export class CategoryController {
  /**
   * Crear una nueva categoría
   * POST /api/categories
   */
  static async createCategory(req: Request, res: Response) {
    try {
      const { nom_cat, descr_cat, tipo_cat } = req.body;
      
      // Validar que se haya subido una imagen
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'La imagen es requerida',
        });
      }

      // Validar campos requeridos
      if (!nom_cat || !descr_cat || !tipo_cat) {
        return res.status(400).json({
          success: false,
          message: 'Todos los campos son requeridos',
        });
      }

      // Validar tipo de categoría
      if (!['Producto', 'Servicio'].includes(tipo_cat)) {
        return res.status(400).json({
          success: false,
          message: 'El tipo de categoría debe ser "Producto" o "Servicio"',
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

      // Crear la categoría en la base de datos
      const newCategory = await prisma.categoria.create({
        data: {
          nom_cat,
          descr_cat,
          tipo_cat: tipo_cat as Category,
          imagen_repr: Buffer.from(processedImage) as any,
        },
      });

      return res.status(201).json({
        success: true,
        message: 'Categoría creada exitosamente',
        data: {
          cod_cat: newCategory.cod_cat,
          nom_cat: newCategory.nom_cat,
          descr_cat: newCategory.descr_cat,
          tipo_cat: newCategory.tipo_cat,
          hasImage: !!newCategory.imagen_repr,
        },
      });
    } catch (error: any) {
      console.error('Error creando categoría:', error);
      
      // Manejar error de nombre duplicado
      if (error.code === 'P2002') {
        return res.status(409).json({
          success: false,
          message: 'Ya existe una categoría con ese nombre',
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
   * Obtener todas las categorías
   * GET /api/categories
   */
  static async getAllCategories(req: Request, res: Response) {
    try {
      const { tipo_cat } = req.query;

      const whereClause = tipo_cat
        ? { tipo_cat: tipo_cat as Category }
        : {};

      const categories = await prisma.categoria.findMany({
        where: whereClause,
        select: {
          cod_cat: true,
          nom_cat: true,
          descr_cat: true,
          tipo_cat: true,
          // No incluimos imagen_repr por defecto para mejorar rendimiento
        },
        orderBy: {
          cod_cat: 'desc',
        },
      });

      return res.status(200).json({
        success: true,
        data: categories,
      });
    } catch (error: any) {
      console.error('Error obteniendo categorías:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message,
      });
    }
  }

  /**
   * Obtener una categoría por ID
   * GET /api/categories/:id
   */
  static async getCategoryById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const category = await prisma.categoria.findUnique({
        where: {
          cod_cat: parseInt(id),
        },
      });

      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Categoría no encontrada',
        });
      }

      return res.status(200).json({
        success: true,
        data: category,
      });
    } catch (error: any) {
      console.error('Error obteniendo categoría:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message,
      });
    }
  }

  /**
   * Obtener la imagen de una categoría
   * GET /api/categories/:id/image
   */
  static async getCategoryImage(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const category = await prisma.categoria.findUnique({
        where: {
          cod_cat: parseInt(id),
        },
        select: {
          imagen_repr: true,
        },
      });

      if (!category || !category.imagen_repr) {
        return res.status(404).json({
          success: false,
          message: 'Imagen no encontrada',
        });
      }

      // Configurar headers para servir la imagen
      res.set('Content-Type', 'image/jpeg');
      res.set('Cache-Control', 'public, max-age=31536000');
      
      return res.send(category.imagen_repr);
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
   * Actualizar una categoría
   * PUT /api/categories/:id
   */
  static async updateCategory(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { nom_cat, descr_cat, tipo_cat } = req.body;

      // Verificar que la categoría existe
      const existingCategory = await prisma.categoria.findUnique({
        where: { cod_cat: parseInt(id) },
      });

      if (!existingCategory) {
        return res.status(404).json({
          success: false,
          message: 'Categoría no encontrada',
        });
      }

      // Preparar datos para actualizar
      const updateData: any = {};
      
      if (nom_cat) updateData.nom_cat = nom_cat;
      if (descr_cat) updateData.descr_cat = descr_cat;
      if (tipo_cat) {
        if (!['Producto', 'Servicio'].includes(tipo_cat)) {
          return res.status(400).json({
            success: false,
            message: 'El tipo de categoría debe ser "Producto" o "Servicio"',
          });
        }
        updateData.tipo_cat = tipo_cat as Category;
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

        updateData.imagen_repr = Buffer.from(processedImage) as any;
      }

      // Actualizar la categoría
      const updatedCategory = await prisma.categoria.update({
        where: { cod_cat: parseInt(id) },
        data: updateData,
      });

      return res.status(200).json({
        success: true,
        message: 'Categoría actualizada exitosamente',
        data: {
          cod_cat: updatedCategory.cod_cat,
          nom_cat: updatedCategory.nom_cat,
          descr_cat: updatedCategory.descr_cat,
          tipo_cat: updatedCategory.tipo_cat,
          hasImage: !!updatedCategory.imagen_repr,
        },
      });
    } catch (error: any) {
      console.error('Error actualizando categoría:', error);
      
      if (error.code === 'P2002') {
        return res.status(409).json({
          success: false,
          message: 'Ya existe una categoría con ese nombre',
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
   * Eliminar una categoría
   * DELETE /api/categories/:id
   */
  static async deleteCategory(req: Request, res: Response) {
    try {
      const { id } = req.params;

      // Verificar que la categoría existe
      const category = await prisma.categoria.findUnique({
        where: { cod_cat: parseInt(id) },
      });

      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Categoría no encontrada',
        });
      }

      // Eliminar la categoría (las subcategorías se eliminarán en cascada)
      await prisma.categoria.delete({
        where: { cod_cat: parseInt(id) },
      });

      return res.status(200).json({
        success: true,
        message: 'Categoría eliminada exitosamente',
      });
    } catch (error: any) {
      console.error('Error eliminando categoría:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message,
      });
    }
  }
}