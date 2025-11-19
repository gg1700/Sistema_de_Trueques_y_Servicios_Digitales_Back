import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface OrgInfo {
    nom_com_org: string,       
    nom_leg_org: string,
    tipo_org: 'con_fines_lucro' | 'sin_fines_lucro',
    rubro_org: string,
    cif: string,
    correo_org: string,
    telf_org: string,
    dir_org: string,
    sitio_web: string | null,
}

export async function register_organization(current_org: Partial<OrgInfo>, logo_org: Buffer) {
    try {
        const nom_leg_org = current_org.nom_leg_org;
        const exists = await prisma.$queryRaw`
            SELECT * FROM sp_verificarexistenciaorg(${nom_leg_org}::VARCHAR) AS result
        `;
        const [ans] = exists as any[];
        const { result } = ans;
        if (result) {
            return { success: false, message: 'La organizacion que se intenta registrar, ya existe.' };
        }
        if (current_org.tipo_org === null || current_org.tipo_org === undefined) {
            current_org.tipo_org = 'sin_fines_lucro';
        }
        await prisma.$queryRaw`
            SELECT sp_registrarorganizacion(
                ${current_org.nom_com_org}::VARCHAR,
                ${current_org.nom_leg_org}::VARCHAR,
                ${current_org.tipo_org}::"OrgType",
                ${current_org.rubro_org}::VARCHAR,
                ${current_org.cif}::VARCHAR,
                ${current_org.correo_org}::VARCHAR,
                ${current_org.telf_org}::VARCHAR,
                ${current_org.dir_org}::VARCHAR,
                ${current_org.sitio_web ?? null}::VARCHAR,
                ${logo_org}::BYTEA
            )
        `;
        return { success: true, message: "Organizacion registrada correctamente" };
    } catch (err) {
        throw new Error((err as Error).message);
    }
}

export async function get_organization_data(nom_leg_org: string, cif: string) {
    try {
        const organization_data = await prisma.$queryRaw`
            SELECT * FROM sp_obtenerdatosorganizacion(
                ${nom_leg_org}::VARCHAR,
                ${cif}::VARCHAR
            )
        `;
        return organization_data;
    }catch (err) {
        throw new Error((err as Error).message);
    }
}