import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export interface AvailabilitySlot {
    day_of_week: number; // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
    start_time: string; // formato "HH:MM"
    end_time: string; // formato "HH:MM"
}

export interface EntrepreneurAvailability {
    cod_us: number;
    slots: AvailabilitySlot[];
}

/**
 * Valida que los slots de tiempo no se solapen
 */
export function validateTimeSlots(slots: AvailabilitySlot[]): { valid: boolean; error?: string } {
    // Agrupar por día
    const slotsByDay = new Map<number, AvailabilitySlot[]>();

    for (const slot of slots) {
        if (!slotsByDay.has(slot.day_of_week)) {
            slotsByDay.set(slot.day_of_week, []);
        }
        slotsByDay.get(slot.day_of_week)!.push(slot);
    }

    // Validar cada día
    for (const [day, daySlots] of slotsByDay.entries()) {
        // Ordenar por hora de inicio
        const sorted = daySlots.sort((a, b) => a.start_time.localeCompare(b.start_time));

        // Verificar solapamientos
        for (let i = 0; i < sorted.length - 1; i++) {
            const current = sorted[i];
            const next = sorted[i + 1];

            if (current.end_time > next.start_time) {
                return {
                    valid: false,
                    error: `Solapamiento detectado el día ${getDayName(day)}: ${current.start_time}-${current.end_time} y ${next.start_time}-${next.end_time}`
                };
            }
        }
    }

    return { valid: true };
}

function getDayName(day: number): string {
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return days[day] || 'Desconocido';
}

/**
 * Crea múltiples slots de disponibilidad para un emprendedor
 */
export async function create_entrepreneur_availability(cod_us: number, slots: AvailabilitySlot[]) {
    try {
        // Validar slots
        const validation = validateTimeSlots(slots);
        if (!validation.valid) {
            return { success: false, message: validation.error };
        }

        // Eliminar disponibilidad anterior del usuario
        await prisma.$executeRaw`
      DELETE FROM disponibilidad 
      WHERE cod_disp IN (
        SELECT cod_disp FROM usuario WHERE cod_us = ${cod_us}
      )
    `;

        // Crear nuevos slots
        const createdSlots = [];
        for (const slot of slots) {
            const result = await prisma.$queryRaw`
        INSERT INTO disponibilidad (hora_ini, hora_fin, fecha_dia)
        VALUES (
          ${slot.start_time}::VARCHAR,
          ${slot.end_time}::VARCHAR,
          ${new Date(2024, 0, slot.day_of_week + 1)}::DATE
        )
        RETURNING cod_disp
      ` as any[];

            createdSlots.push(result[0]);
        }

        return {
            success: true,
            message: 'Disponibilidad creada exitosamente',
            data: createdSlots
        };
    } catch (err) {
        throw new Error((err as Error).message);
    }
}

/**
 * Obtiene la disponibilidad de un emprendedor
 */
export async function get_entrepreneur_availability(handle_name: string) {
    try {
        // Primero obtener el cod_us
        const user = await prisma.$queryRaw`
      SELECT cod_us, cod_disp FROM usuario WHERE handle_name = ${handle_name}::VARCHAR
    ` as any[];

        if (!user || user.length === 0) {
            return { success: false, message: 'Usuario no encontrado' };
        }

        const cod_us = user[0].cod_us;

        // Obtener todos los slots de disponibilidad
        const availability = await prisma.$queryRaw`
      SELECT d.cod_disp, d.hora_ini, d.hora_fin, d.fecha_dia
      FROM disponibilidad d
      INNER JOIN usuario u ON u.cod_disp = d.cod_disp
      WHERE u.cod_us = ${cod_us}
    ` as any[];

        // Transformar a formato más amigable
        const slots = availability.map((slot: any) => {
            const date = new Date(slot.fecha_dia);
            return {
                cod_disp: slot.cod_disp,
                day_of_week: date.getDay(),
                day_name: getDayName(date.getDay()),
                start_time: slot.hora_ini,
                end_time: slot.hora_fin
            };
        });

        return {
            success: true,
            data: {
                cod_us,
                handle_name,
                availability: slots
            }
        };
    } catch (err) {
        throw new Error((err as Error).message);
    }
}

/**
 * Actualiza la disponibilidad de un emprendedor
 */
export async function update_entrepreneur_availability(cod_us: number, slots: AvailabilitySlot[]) {
    try {
        // Validar slots
        const validation = validateTimeSlots(slots);
        if (!validation.valid) {
            return { success: false, message: validation.error };
        }

        // Eliminar disponibilidad anterior
        await prisma.$executeRaw`
      DELETE FROM disponibilidad 
      WHERE cod_disp IN (
        SELECT cod_disp FROM usuario WHERE cod_us = ${cod_us}
      )
    `;

        // Crear nuevos slots
        return await create_entrepreneur_availability(cod_us, slots);
    } catch (err) {
        throw new Error((err as Error).message);
    }
}

/**
 * Elimina un slot específico de disponibilidad
 */
export async function delete_availability_slot(cod_disp: number) {
    try {
        await prisma.$executeRaw`
      DELETE FROM disponibilidad WHERE cod_disp = ${cod_disp}
    `;

        return { success: true, message: 'Slot eliminado exitosamente' };
    } catch (err) {
        throw new Error((err as Error).message);
    }
}
