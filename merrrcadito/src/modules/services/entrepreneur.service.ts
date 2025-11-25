import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface UserInfo {
    cod_rol: number,
    cod_disp: number | null,
    ci: string
    nom_us: string
    handle_name: string
    ap_pat_us: string
    ap_mat_us: string | null
    contra_us: string
    fecha_nacimiento: Date,
    sexo: 'M' | 'F',
    estado_us: 'activo' | 'suspendido' | 'inactivo',
    correo_us: string,
    telefono_us: string,
}

interface AvailabilitySlot {
    day_of_week: number;
    start_time: string;
    end_time: string;
}

/**
 * Registra un emprendedor con su disponibilidad
 */
export async function register_entrepreneur(
    current_user: Partial<UserInfo>,
    foto_us: Buffer,
    availability_slots?: AvailabilitySlot[]
) {
    try {
        const handle_name = current_user.handle_name;

        // Verificar si el handle_name ya existe
        const exists = await prisma.$queryRaw`
            SELECT * FROM sp_verificarexistenciahandlename(${handle_name}::VARCHAR) AS result
        `;
        const [ans] = exists as any[];
        const { result } = ans;
        if (result) {
            return { success: false, message: 'El handle name ya existe.' };
        }

        // Para emprendedores, el cod_rol debe ser 3
        current_user.cod_rol = 3;

        if (current_user.estado_us === null || current_user.estado_us === undefined) {
            current_user.estado_us = 'activo';
        }

        // PASO 1: Registrar al usuario SIN cod_disp primero
        await prisma.$queryRaw`
            SELECT sp_registrarusuario(
                ${current_user.cod_rol}::INTEGER,
                NULL::INTEGER,
                ${current_user.ci}::VARCHAR,
                ${current_user.nom_us}::VARCHAR,
                ${current_user.handle_name}::VARCHAR,
                ${current_user.ap_pat_us}::VARCHAR,
                ${current_user.ap_mat_us ?? null}::VARCHAR,
                ${current_user.contra_us}::VARCHAR,
                ${current_user.fecha_nacimiento}::DATE,
                ${current_user.sexo}::"Sex",
                ${current_user.estado_us}::"UserState",
                ${current_user.correo_us}::VARCHAR,
                ${current_user.telefono_us}::VARCHAR,
                ${foto_us}::BYTEA
            )
        `;

        // PASO 2: Obtener el cod_us del usuario recién creado
        const userResult = await prisma.$queryRaw`
            SELECT cod_us FROM usuario WHERE handle_name = ${handle_name}::VARCHAR
        ` as any[];

        const cod_us = userResult[0]?.cod_us;

        if (!cod_us) {
            throw new Error("No se pudo obtener el cod_us del usuario creado");
        }

        console.log(`Usuario creado: cod_us=${cod_us}`);

        // PASO 3: Crear TODOS los slots de disponibilidad
        let firstCodDisp: number | null = null;

        if (availability_slots && availability_slots.length > 0) {
            console.log(`Creando ${availability_slots.length} slots de disponibilidad...`);

            for (const slot of availability_slots) {
                // Crear fecha basada en el día de la semana
                // day_of_week: 0=Domingo, 1=Lunes, ..., 6=Sábado
                const baseDate = new Date(2024, 0, 1); // 1 de enero de 2024 (lunes)
                const dayOffset = slot.day_of_week === 0 ? 6 : slot.day_of_week - 1;
                const fecha_dia = new Date(2024, 0, 1 + dayOffset);

                const dispResult = await prisma.$queryRaw`
                    INSERT INTO disponibilidad (hora_ini, hora_fin, fecha_dia)
                    VALUES (
                        ${slot.start_time}::VARCHAR,
                        ${slot.end_time}::VARCHAR,
                        ${fecha_dia}::DATE
                    )
                    RETURNING cod_disp
                ` as any[];

                // Guardar el primer cod_disp para vincularlo al usuario
                if (firstCodDisp === null) {
                    firstCodDisp = dispResult[0].cod_disp;
                    console.log(`Primer cod_disp creado: ${firstCodDisp}`);
                }
            }

            // PASO 4: Actualizar el usuario con el primer cod_disp
            if (firstCodDisp !== null) {
                await prisma.$queryRaw`
                    UPDATE usuario 
                    SET cod_disp = ${firstCodDisp}::INTEGER 
                    WHERE cod_us = ${cod_us}::INTEGER
                `;
                console.log(`Usuario ${cod_us} actualizado con cod_disp=${firstCodDisp}`);
            }
        }

        // PASO 5: Verificar que se actualizó correctamente
        const verifyResult = await prisma.$queryRaw`
            SELECT cod_us, cod_disp, handle_name FROM usuario WHERE cod_us = ${cod_us}::INTEGER
        ` as any[];

        const finalUser = verifyResult[0];
        console.log(`Verificación final:`, finalUser);

        return {
            success: true,
            message: "Emprendedor registrado correctamente",
            data: {
                cod_us: finalUser.cod_us,
                handle_name: finalUser.handle_name,
                cod_disp: finalUser.cod_disp,
                slots_created: availability_slots?.length || 0
            }
        };
    } catch (err) {
        console.error("Error en register_entrepreneur:", err);
        throw new Error((err as Error).message);
    }
}
