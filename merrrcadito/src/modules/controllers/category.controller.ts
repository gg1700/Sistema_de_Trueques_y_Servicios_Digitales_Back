import { Request, Response } from 'express';
import { PrismaClient, Category } from '@prisma/client';
import { ImageService } from '../services/image.service';
import * as CategoryService from '../services/category.service';

const prisma = new PrismaClient();

export class CategoryController {
  /**
   * Crear una nueva categoría
   * POST /api/categories
   * (Ahora llama a sp_registrarCategoria)
   */
  static async createCategory(req: Request, res: Response) {
    try {
      const { nom_cat, descr_cat, tipo_cat } = req.body;

      // --- (TODA TU LÓGICA DE VALIDACIÓN SIGUE IGUAL) ---
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'La imagen es requerida' });
      }
      if (!nom_cat || !descr_cat || !tipo_cat) {
        return res.status(400).json({ success: false, message: 'Todos los campos son requeridos' });
      }
      if (!['Producto', 'Servicio'].includes(tipo_cat)) {
        return res.status(400).json({ success: false, message: 'Tipo no válido' });
      }
      const isValidImage = await ImageService.validateImage(req.file.buffer);
      if (!isValidImage) {
        return res.status(400).json({ success: false, message: 'No es una imagen válida' });
      }
      // --- (FIN DE LA VALIDACIÓN) ---

      // Procesar y optimizar la imagen (igual que antes)
      const processedImage = await ImageService.processImage(req.file.buffer, {
        width: 800,
        height: 800,
        quality: 85,
        format: 'jpeg',
      });

      // Convertir a Buffer
      const imageBuffer = Buffer.from(processedImage);

      // --- CAMBIO PRINCIPAL: LLAMADA AL PROCEDIMIENTO ---
      // Usamos $executeRaw para llamar a un PROCEDIMIENTO (o una función que devuelve void)
      await prisma.$executeRaw`
        CALL sp_registrarCategoria(
          ${nom_cat}, 
          ${descr_cat}, 
          ${imageBuffer}, 
          ${tipo_cat}
        )
      `;
      // Nota: El '::"Category"' es para castear el string al tipo ENUM de tu DB.

      // Como el SP no devuelve el ID, no podemos retornarlo fácilmente.
      // Puedes modificar el SP para que sea una FUNCIÓN y devuelva el ID,
      // pero por ahora, solo confirmamos la creación.
      return res.status(201).json({
        success: true,
        message: 'Categoría creada exitosamente',
        data: {
          nom_cat: nom_cat,
          descr_cat: descr_cat,
          tipo_cat: tipo_cat,
          hasImage: true,
        },
      });

    } catch (error: any) {
      console.error('Error creando categoría:', error);
      // P2002 es el código de error de Prisma para 'Unique constraint failed'
      if (error.code === 'P2002' || (error.message && error.message.includes('unique constraint'))) {
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
   * (Ahora llama a sp_getAllCategories)
   */
  static async getAllCategories(req: Request, res: Response) {
    try {
      const { tipo_cat } = req.query;

      // --- CAMBIO PRINCIPAL: LLAMADA A LA FUNCIÓN ---
      // Usamos $queryRaw para llamar a una FUNCIÓN que devuelve una TABLA
      const categories = await prisma.$queryRaw`
        SELECT * FROM sp_getAllCategories(${tipo_cat as string || null})
      `;
      // El '|| null' es para pasar NULL al SP si tipo_cat no está definido.

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

export async function getCategoryProductReportByMonth(req: Request, res: Response) {
  try {
    const { month } = req.query;
    if (!month || typeof month !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Mes inválido.'
      });
    }
    const report = await CategoryService.get_category_product_report_by_month(month);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'No se encontró el reporte para el mes especificado.',
        data: []
      });
    }

    // Convertir BigInt a Number para evitar error de serialización
    const serializedReport = JSON.parse(JSON.stringify(report, (key, value) =>
      typeof value === 'bigint' ? Number(value) : value
    ));

    return res.status(200).json({
      success: true,
      message: 'Reporte de categorías de productos por mes obtenido correctamente.',
      data: serializedReport
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Error al obtener el reporte de categorías de productos por mes: ',
      error: (err as Error).message
    });
  }
}