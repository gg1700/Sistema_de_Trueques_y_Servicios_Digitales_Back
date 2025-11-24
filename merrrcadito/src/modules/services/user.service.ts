import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function get_users_activity_report_by_week() {
    try {
        const report = await prisma.$queryRaw`
            SELECT * FROM sp_reporteactividadusuarios() AS active_userst
        `;
        return report;
    } catch (err) {
        throw new Error((err as Error).message);
    }
}

export async function get_user_activity_report_by_month() {
    try {
        const report = await prisma.$queryRaw`
            SELECT * FROM sp_reporteactividadusuariospormes()
        `;
        return report;
    } catch (err) {
        throw new Error((err as Error).message);
    }
}

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

export async function register_user(current_user: Partial<UserInfo>, foto_us: Buffer) {
    try {
        const handle_name = current_user.handle_name;
        const exists = await prisma.$queryRaw`
            SELECT * FROM sp_verificarexistenciahandlename(${handle_name}::VARCHAR) AS result
        `;
        const [ans] = exists as any[];
        const { result } = ans;
        if (result) {
            return { success: false, message: 'El handle name ya existe.' };
        }
        if (current_user.cod_rol === null || current_user.cod_rol === undefined) {
            current_user.cod_rol = 1;
        }
        if (current_user.estado_us === null || current_user.estado_us === undefined) {
            current_user.estado_us = 'activo';
        }
        await prisma.$queryRaw`
            SELECT sp_registrarusuario(
                ${current_user.cod_rol}::INTEGER,
                ${current_user.cod_disp ?? null}::INTEGER,
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
        return { success: true, message: "Usuario registrado correctamente" };
    } catch (err) {
        throw new Error((err as Error).message);
    }
}

export async function get_user_data(handle_name: string) {
    try {
        // Usar consulta directa por ahora en lugar de SP
        const user_data = await prisma.$queryRaw`
            SELECT 
                u.cod_us,
                u.cod_rol,
                u.handle_name,
                u.nom_us,
                u.ap_pat_us,
                u.ap_mat_us,
                u.correo_us,
                u.telefono_us,
                u.ci AS ci_us,
                u.fecha_nacimiento AS fecha_nac_us,
                u.sexo::TEXT AS genero_us,
                u.estado_us::TEXT AS estado_us,
                du.fecha_registro
            FROM usuario u
            LEFT JOIN detalle_usuario du ON u.cod_us = du.cod_us
            WHERE u.handle_name = ${handle_name}
        `;
        return user_data;
    } catch (err) {
        throw new Error((err as Error).message);
    }
}

export async function get_user_posts(cod_us: string) {
    try {
        const exixts = await prisma.$queryRaw`
            SELECT * FROM sp_verificarexistenciacodusuario(${cod_us}::INTEGER) AS result
        `;
        const [ans] = exixts as any[];
        const { result } = ans;
        if (!result) {
            throw new Error('El código de usuario no existe.');
        }
        const user_posts = await prisma.$queryRaw`
            SELECT * FROM sp_obtenerpublicacionesusuario(
                ${cod_us}::INTEGER
            )
        `;
        return user_posts;
    } catch (err) {
        throw new Error((err as Error).message);
    }
}

export async function get_ranking_users_by_co2() {
    try {
        const ranking_users_co2: any[] = await prisma.$queryRaw`
            SELECT * FROM sp_rankingusuariosporco2()
        `;
        const final_ranking_users_co2: any[] = [];
        let i = 0;
        while (i < Math.min(ranking_users_co2.length, 10)) {
            final_ranking_users_co2.push(
                ranking_users_co2[i],
            );
            i++;
        }
        return final_ranking_users_co2;
    } catch (err) {
        throw new Error((err as Error).message);
    }
}

export async function get_ranking_users_by_sells() {
    try {
        const ranking_sells: any[] = await prisma.$queryRaw`
            SELECT * FROM sp_rankingusuariosventas()
        `;
        const final_ranking_sells: any[] = [];
        let i = 0;
        while (i < Math.min(ranking_sells.length, 10)) {
            final_ranking_sells.push(
                ranking_sells[i],
            );
            i++;
        }
        return final_ranking_sells;
    } catch (err) {
        throw new Error((err as Error).message);
    }
}

export async function update_co2_impact_post(cod_us: string, cod_pub: string) {
    try {
        const exixts = await prisma.$queryRaw`
            SELECT * FROM sp_verificarexistenciacodusuario(${cod_us}::INTEGER) AS result
        `;
        const [ans] = exixts as any[];
        const { result } = ans;
        if (!result) {
            return { success: false, message: 'El código de usuario no existe.' };
        }
        const exists_pub = await prisma.$queryRaw`
            SELECT * FROM sp_verificarexistenciacodpublicacion(${cod_pub}::INTEGER) AS result_pub
        `;
        const [ans2] = exists_pub as any[];
        const { result_pub } = ans2;
        if (!result_pub) {
            return { success: false, message: 'El código de publicación no existe.' };
        }
        const exists_transaction = await prisma.$queryRaw`
            SELECT * FROM sp_verificarexistenciausuarioorigenpublicacionentransaccion(
                ${cod_us}::INTEGER,
                ${cod_pub}::INTEGER
            ) AS result_trans
        `;
        const [ans3] = exists_transaction as any[];
        const { result_trans } = ans3;
        console.log(result_trans);
        if (!result_trans) {
            return { success: false, message: 'No existe transaccion alguna con este usuario origen y publicacion.' }
        }
        await prisma.$queryRaw`
            SELECT FROM sp_recalcularimpactoambiantalpublicacion(
                ${cod_us}::INTEGER,
                ${cod_pub}::INTEGER
            )
        `;
        return { success: true, message: 'Nivel de impacto ambiental actualizado.' };
    } catch (err) {
        throw new Error((err as Error).message);
    }
}

export async function get_users_actions_by_month(month: string) {
    try {
        const report = prisma.$queryRaw`
            SELECT * FROM sp_reporteaccionesusuariospormes(
                ${month}::INTEGER
            )
        `;
        return report;
    } catch (err) {
        throw new Error((err as Error).message)
    }
}

// Helper function to convert BigInt to Number
function convertBigIntToNumber(obj: any): any {
    if (obj === null || obj === undefined) return obj;
    if (typeof obj === 'bigint') return Number(obj);
    if (Array.isArray(obj)) return obj.map(convertBigIntToNumber);
    if (typeof obj === 'object') {
        const converted: any = {};
        for (const key in obj) {
            converted[key] = convertBigIntToNumber(obj[key]);
        }
        return converted;
    }
    return obj;
}

// REPORTE: Productos y Servicios Más Vendidos
export async function get_top_products_services_report(mes: string, anio: string, limite: string = '10') {
    try {
        const report = await prisma.$queryRaw`
            SELECT * FROM sp_reporteTopProductosServicios(
                ${mes}::INTEGER,
                ${anio}::INTEGER,
                ${limite}::INTEGER
            )
        `;
        return convertBigIntToNumber(report);
    } catch (err) {
        throw new Error((err as Error).message);
    }
}

// REPORTE: Impacto Ambiental Comparativo
export async function get_environmental_impact_report(mes: string, anio: string) {
    try {
        const report = await prisma.$queryRaw`
            SELECT * FROM sp_reporteImpactoAmbientalComparativo(
                ${mes}::INTEGER,
                ${anio}::INTEGER
            )
        `;
        return convertBigIntToNumber(report);
    } catch (err) {
        throw new Error((err as Error).message);
    }
}

// REPORTE: Comportamiento de Usuarios
export async function get_user_behavior_report(mes: string, anio: string) {
    try {
        const report = await prisma.$queryRaw`
            SELECT * FROM sp_reporteComportamientoUsuarios(
                ${mes}::INTEGER,
                ${anio}::INTEGER
            )
        `;
        return convertBigIntToNumber(report);
    } catch (err) {
        throw new Error((err as Error).message);
    }
}

// REPORTE: Intercambios vs Compras
export async function get_exchanges_vs_purchases_report(mes: string, anio: string) {
    try {
        const report = await prisma.$queryRaw`
            SELECT * FROM sp_reporteIntercambiosVsCompras(
                ${mes}::INTEGER,
                ${anio}::INTEGER
            )
        `;
        return convertBigIntToNumber(report);
    } catch (err) {
        throw new Error((err as Error).message);
    }
}

// REPORTE: Logros y Gamificación
export async function get_achievements_gamification_report() {
    try {
        const report = await prisma.$queryRaw`
            SELECT * FROM sp_reporteLogrosGamificacion()
        `;
        return convertBigIntToNumber(report);
    } catch (err) {
        throw new Error((err as Error).message);
    }
}

// REPORTE: Calificaciones y Satisfacción
export async function get_ratings_satisfaction_report(mes: string, anio: string) {
    try {
        const report = await prisma.$queryRaw`
            SELECT * FROM sp_reporteCalificacionesSatisfaccion(
                ${mes}::INTEGER,
                ${anio}::INTEGER
            )
        `;
        return convertBigIntToNumber(report);
    } catch (err) {
        throw new Error((err as Error).message);
    }
}

// REPORTE: Potenciadores y Monetización
export async function get_boosters_monetization_report(mes: string, anio: string) {
    try {
        const report = await prisma.$queryRaw`
            SELECT * FROM sp_reportePotenciadoresMonetizacion(
                ${mes}::INTEGER,
                ${anio}::INTEGER
            )
        `;
        return convertBigIntToNumber(report);
    } catch (err) {
        throw new Error((err as Error).message);
    }
}

// IMPACTO AMBIENTAL DE USUARIO
export async function get_user_environmental_impact(cod_us: number) {
    try {
        console.log(`Obteniendo impacto ambiental para usuario: ${cod_us}`);

        // 1. Obtener huella CO2 total del usuario
        const huellaCO2Result: any[] = await prisma.$queryRaw`
            SELECT COALESCE(huella_co2, 0) as huella_co2
            FROM detalle_usuario
            WHERE cod_us = ${cod_us}
        `;
        const huella_co2_total = Number(huellaCO2Result[0]?.huella_co2 || 0);
        console.log(`Huella CO2: ${huella_co2_total}`);

        // 2. Calcular promedio de impacto por intercambios
        const intercambiosResult: any[] = await prisma.$queryRaw`
            SELECT COALESCE(AVG(CAST(impacto_amb_inter AS DECIMAL)), 0) as promedio
            FROM intercambio
            WHERE cod_us_1 = ${cod_us} OR cod_us_2 = ${cod_us}
        `;
        const impacto_promedio_intercambios = Number(intercambiosResult[0]?.promedio || 0);
        console.log(`Promedio intercambios: ${impacto_promedio_intercambios}`);

        // 3. Calcular promedio de impacto por productos comprados
        const productosResult: any[] = await prisma.$queryRaw`
            SELECT COALESCE(AVG(CAST(p.impacto_amb_pub AS DECIMAL)), 0) as promedio
            FROM transaccion t
            INNER JOIN publicacion p ON t.cod_pub = p.cod_pub
            INNER JOIN publicacion_producto pp ON p.cod_pub = pp.cod_pub
            WHERE t.cod_us_destino = ${cod_us}
            AND t.estado_trans = 'satisfactorio'
        `;
        const impacto_promedio_productos = Number(productosResult[0]?.promedio || 0);
        console.log(`Promedio productos: ${impacto_promedio_productos}`);

        // 4. Calcular promedio de impacto por servicios comprados
        const serviciosResult: any[] = await prisma.$queryRaw`
            SELECT COALESCE(AVG(CAST(p.impacto_amb_pub AS DECIMAL)), 0) as promedio
            FROM transaccion t
            INNER JOIN publicacion p ON t.cod_pub = p.cod_pub
            INNER JOIN publicacion_servicio ps ON p.cod_pub = ps.cod_pub
            WHERE t.cod_us_destino = ${cod_us}
            AND t.estado_trans = 'satisfactorio'
        `;
        const impacto_promedio_servicios = Number(serviciosResult[0]?.promedio || 0);
        console.log(`Promedio servicios: ${impacto_promedio_servicios}`);

        // 5. Calcular aporte ambiental por participación en eventos
        // Nota: La tabla evento no tiene campo impacto_ambiental, así que contamos la participación
        const eventosResult: any[] = await prisma.$queryRaw`
            SELECT COUNT(*) as total_eventos
            FROM usuario_evento ue
            WHERE ue.cod_us = ${cod_us}
        `;
        const total_eventos = Number(eventosResult[0]?.total_eventos || 0);
        // Asumimos un impacto positivo base de 5 puntos por evento participado
        const impacto_promedio_eventos = total_eventos > 0 ? total_eventos * 5 : 0;
        console.log(`Total eventos participados: ${total_eventos}, Impacto: ${impacto_promedio_eventos}`);

        // 6. Calcular tendencia
        // Promediar todos los valores numéricos disponibles (excluyendo valores 0)
        const valores = [
            impacto_promedio_intercambios,
            impacto_promedio_productos,
            impacto_promedio_servicios
        ].filter(v => v > 0);

        let promedio_general = 0;
        if (valores.length > 0) {
            promedio_general = valores.reduce((a, b) => a + b, 0) / valores.length;
        }

        // Determinar tendencia según el promedio normalizado (0-100)
        let tendencia = 'bueno';
        if (promedio_general > 65) {
            tendencia = 'malo';
        } else if (promedio_general > 51) {
            tendencia = 'medio';
        }

        const result = {
            huella_co2_total,
            tendencia,
            impacto_promedio_intercambios,
            impacto_promedio_productos,
            impacto_promedio_servicios,
            impacto_promedio_eventos
        };

        console.log('Resultado final:', result);
        return result;
    } catch (err) {
        console.error('Error en get_user_environmental_impact:', err);
        throw new Error((err as Error).message);
    }
}