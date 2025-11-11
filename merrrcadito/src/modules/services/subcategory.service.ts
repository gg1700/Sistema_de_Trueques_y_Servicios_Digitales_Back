import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

export async function registerSubcategory(
  cod_cat: number,
  nom_subcat_prod: string,
  descr_subcat_prod: string,
  imagen_representativa: Buffer
) {
  try {
    await prisma.$queryRaw`
        CALL sp_registrarSubcategoriaProducto(
            ${cod_cat}::INTEGER,
            ${nom_subcat_prod}::VARCHAR,
            ${descr_subcat_prod}::VARCHAR,
            ${imagen_representativa}::BYTEA
        )
      `;
    return { success: true, message: "Subategoria registrada correctamente" }
  } catch (error) {
    throw error;
  }
}

export async function getSubcategory() {
  try {
    const subcategories = await prisma.$queryRaw`
      SELECT * FROM sp_getSubcategorias()
    `;
    return subcategories;
  } catch (error) {
    throw error;
  }
}

interface SubcategoryInfo {
  cod_cat: number | null,
  nom_subcat_prod: string | null,
  imagen_representativa: Uint8Array | null,
  descr_subcat_prod: string | null
}

export async function updateSubcategory(cod_subcat_prod: number, attributes: Partial<SubcategoryInfo>) {
  try {
    const { cod_cat, nom_subcat_prod, imagen_representativa, descr_subcat_prod } = attributes;
    const subcategory_updated = await prisma.$queryRaw`
      SELECT * FROM sp_actualizarsubcategoria(
        ${cod_subcat_prod}::INTEGER,
        ${cod_cat ?? null}::INTEGER,
        ${nom_subcat_prod ?? null}::VARCHAR,
        ${imagen_representativa ?? null}::BYTEA,
        ${descr_subcat_prod ?? null}::VARCHAR
      )
    `;
    return subcategory_updated;
  } catch (err) {
    throw new Error((err as Error).message);
  }
}
