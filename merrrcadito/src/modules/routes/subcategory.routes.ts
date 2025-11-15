// src/routes/subcategory.routes.ts
import { Router } from 'express';
import { SubcategoryController } from '../controllers/subcategory.controller';
import { upload, handleMulterError } from '../../config/multer.config';

const router = Router();

/**
 * @route   POST /api/subcategories
 * @desc    Crear una nueva subcategoría
 * @access  Private (Admin/Emprendedor)
 */
router.post(
  '/',
  upload.single('imagen_representativa'),
  handleMulterError,
  SubcategoryController.createSubcategory
);

/**
 * @route   GET /api/subcategories
 * @desc    Obtener todas las subcategorías
 * @query   cod_cat - Filtrar por categoría
 * @access  Public
 */
router.get('/', SubcategoryController.getAllSubcategories);

/**
 * @route   GET /api/subcategories/:id
 * @desc    Obtener una subcategoría por ID
 * @access  Public
 */
router.get('/:id', SubcategoryController.getSubcategoryById);

/**
 * @route   GET /api/subcategories/:id/image
 * @desc    Obtener la imagen de una subcategoría
 * @access  Public
 */
router.get('/:id/image', SubcategoryController.getSubcategoryImage);

/**
 * @route   PUT /api/subcategories/:id
 * @desc    Actualizar una subcategoría
 * @access  Private (Admin/Emprendedor)
 */
router.put(
  '/:id',
  upload.single('imagen_representativa'),
  handleMulterError,
  SubcategoryController.updateSubcategory
);

/**
 * @route   DELETE /api/subcategories/:id
 * @desc    Eliminar una subcategoría
 * @access  Private (Admin)
 */
router.delete('/:id', SubcategoryController.deleteSubcategory);

export default router;