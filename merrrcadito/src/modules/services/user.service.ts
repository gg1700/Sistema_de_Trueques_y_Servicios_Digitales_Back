import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function get_users_activity_report_by_week() {
    try {
        const report = await prisma.$queryRaw`
            SELECT * FROM sp_reporteactividadusuarios() AS active_users
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
        const user_data = await prisma.$queryRaw`
            SELECT * FROM sp_obtenerdatousuarios(
                ${handle_name}::VARCHAR
            )
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