import { Request, Response } from 'express';
import * as notificationService from '../services/notification.service';

// Obtener notificaciones de un usuario
export const getNotifications = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const unreadOnly = req.query.unreadOnly === 'true';

        const notifications = await notificationService.getUserNotifications(
            parseInt(userId),
            unreadOnly
        );

        res.json({
            success: true,
            data: notifications
        });
    } catch (error: any) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener notificaciones',
            error: error.message
        });
    }
};

// Obtener contador de notificaciones no leídas
export const getUnreadCount = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;

        const count = await notificationService.getUnreadCount(parseInt(userId));

        res.json({
            success: true,
            data: { count }
        });
    } catch (error: any) {
        console.error('Error fetching unread count:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener contador de notificaciones',
            error: error.message
        });
    }
};

// Marcar notificación como leída
export const markAsRead = async (req: Request, res: Response) => {
    try {
        const { notificationId } = req.params;

        await notificationService.markAsRead(parseInt(notificationId));

        res.json({
            success: true,
            message: 'Notificación marcada como leída'
        });
    } catch (error: any) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({
            success: false,
            message: 'Error al marcar notificación como leída',
            error: error.message
        });
    }
};

// Marcar todas las notificaciones como leídas
export const markAllAsRead = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;

        await notificationService.markAllAsRead(parseInt(userId));

        res.json({
            success: true,
            message: 'Todas las notificaciones marcadas como leídas'
        });
    } catch (error: any) {
        console.error('Error marking all notifications as read:', error);
        res.status(500).json({
            success: false,
            message: 'Error al marcar todas las notificaciones como leídas',
            error: error.message
        });
    }
};

// Eliminar una notificación
export const deleteNotification = async (req: Request, res: Response) => {
    try {
        const { notificationId } = req.params;

        await notificationService.deleteNotification(parseInt(notificationId));

        res.json({
            success: true,
            message: 'Notificación eliminada'
        });
    } catch (error: any) {
        console.error('Error deleting notification:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar notificación',
            error: error.message
        });
    }
};
