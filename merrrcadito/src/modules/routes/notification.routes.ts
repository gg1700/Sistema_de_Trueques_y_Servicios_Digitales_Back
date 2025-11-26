import { Router } from 'express';
import * as notificationController from '../controllers/notification.controller';

const router = Router();

// IMPORTANT: More specific routes MUST come before generic :userId route
// Otherwise Express will match "unread-count" as a userId

// GET /api/notifications/:userId/unread-count - Obtener contador de no leídas
router.get('/:userId/unread-count', notificationController.getUnreadCount);

// PUT /api/notifications/:userId/read-all - Marcar todas como leídas
router.put('/:userId/read-all', notificationController.markAllAsRead);

// PUT /api/notifications/:notificationId/read - Marcar como leída
router.put('/:notificationId/read', notificationController.markAsRead);

// DELETE /api/notifications/:notificationId - Eliminar notificación
router.delete('/:notificationId', notificationController.deleteNotification);

// GET /api/notifications/:userId - Obtener notificaciones del usuario
// This MUST be last because it's the most generic
router.get('/:userId', notificationController.getNotifications);

export default router;
