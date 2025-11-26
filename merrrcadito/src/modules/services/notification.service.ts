import { prisma } from '../../database';

export interface NotificationData {
    cod_us: number;
    tipo_notif: string;
    cod_ref?: number;
    mensaje: string;
}

// Crear una nueva notificación
export const createNotification = async (data: NotificationData) => {
    try {
        const result: any[] = await prisma.$queryRaw`
            INSERT INTO "notificacion" (cod_us, tipo_notif, cod_ref, mensaje)
            VALUES (${data.cod_us}, ${data.tipo_notif}, ${data.cod_ref || null}, ${data.mensaje})
            RETURNING cod_notif
        `;
        return result[0];
    } catch (error) {
        console.error('Error creating notification:', error);
        throw error;
    }
};

// Obtener notificaciones de un usuario
export const getUserNotifications = async (userId: number, unreadOnly: boolean = false) => {
    try {
        if (unreadOnly) {
            return await prisma.$queryRaw`
                SELECT * FROM "notificacion"
                WHERE cod_us = ${userId} AND leida = FALSE
                ORDER BY fecha_creacion DESC
            `;
        } else {
            return await prisma.$queryRaw`
                SELECT * FROM "notificacion"
                WHERE cod_us = ${userId}
                ORDER BY fecha_creacion DESC
                LIMIT 50
            `;
        }
    } catch (error) {
        console.error('Error fetching notifications:', error);
        throw error;
    }
};

// Contar notificaciones no leídas
export const getUnreadCount = async (userId: number) => {
    try {
        const result: any[] = await prisma.$queryRaw`
            SELECT COUNT(*)::int as count
            FROM "notificacion"
            WHERE cod_us = ${userId} AND leida = FALSE
        `;
        return result[0].count;
    } catch (error) {
        console.error('Error counting unread notifications:', error);
        throw error;
    }
};

// Marcar notificación como leída
export const markAsRead = async (notificationId: number) => {
    try {
        await prisma.$executeRaw`
            UPDATE "notificacion"
            SET leida = TRUE
            WHERE cod_notif = ${notificationId}
        `;
        return true;
    } catch (error) {
        console.error('Error marking notification as read:', error);
        throw error;
    }
};

// Marcar todas las notificaciones de un usuario como leídas
export const markAllAsRead = async (userId: number) => {
    try {
        await prisma.$executeRaw`
            UPDATE "notificacion"
            SET leida = TRUE
            WHERE cod_us = ${userId} AND leida = FALSE
        `;
        return true;
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        throw error;
    }
};

// Eliminar una notificación
export const deleteNotification = async (notificationId: number) => {
    try {
        await prisma.$executeRaw`
            DELETE FROM "notificacion"
            WHERE cod_notif = ${notificationId}
        `;
        return true;
    } catch (error) {
        console.error('Error deleting notification:', error);
        throw error;
    }
};
