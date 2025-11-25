import { Router } from 'express';
import * as AvailabilityController from '../controllers/availability.controller';

const router = Router();

// Crear disponibilidad para un emprendedor
router.post('/', AvailabilityController.createAvailability);

// Obtener disponibilidad de un emprendedor por handle_name
router.get('/:handle_name', AvailabilityController.getAvailability);

// Actualizar disponibilidad de un emprendedor
router.put('/', AvailabilityController.updateAvailability);

// Eliminar un slot específico de disponibilidad
router.delete('/:cod_disp', AvailabilityController.deleteAvailabilitySlot);

export default router;
