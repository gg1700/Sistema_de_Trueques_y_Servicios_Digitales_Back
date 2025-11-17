import { Router } from 'express';
import { CategoryController } from '../controllers/category.controller';
import { upload, handleMulterError } from '../../config/multer.config';

const router = Router();

/**
 * @route   POST /api/categories
 * @desc    Crear una nueva categoría
 * @access  Private (Admin/Emprendedor)
 */
router.post(
  '/',
|  upload.single('imagen_repr'),
  handleMulterError,
  CategoryController.createCategory
);

/**
 * @route   GET /api/categories
 * @desc    Obtener todas las categorías
 * @query   tipo_cat - Filtrar por tipo (Producto/Servicio)
 * @access  Public
 */
router.get('/', CategoryController.getAllCategories);

/**
 * @route   GET /api/categories/:id
 * @desc    Obtener una categoría por ID
 * @access  Public
 */
router.get('/:id', CategoryController.getCategoryById);

/**
 * @route   GET /api/categories/:id/image
 * @desc    Obtener la imagen de una categoría
 * @access  Public
 */
router.get('/:id/image', CategoryController.getCategoryImage);

/**
 * @route   PUT /api/categories/:id
 * @desc    Actualizar una categoría
 * @access  Private (Admin/Emprendedor)
 */
router.put(
  '/:id',
  upload.single('imagen_repr'),
  handleMulterError,
  CategoryController.updateCategory
);

/**
 * @route   DELETE /api/categories/:id
 * @desc    Eliminar una categoría
 * @access  Private (Admin)
 */
router.delete('/:id', CategoryController.deleteCategory);

export default router;
