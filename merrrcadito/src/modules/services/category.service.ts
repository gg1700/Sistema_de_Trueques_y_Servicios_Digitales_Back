import { Category, PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export async function registerCategory(
  nom_cat: string,
  descr_cat: string,
  imagen_repr: Buffer,
  tipo_cat: string
) {
  try {
    await prisma.$queryRaw`
      CALL sp_registrarCategoria(
        ${nom_cat}::VARCHAR,
        ${descr_cat}::VARCHAR,
        ${imagen_repr}::BYTEA,
        ${tipo_cat}::VARCHAR
      )
    `;
    return { success: true, message: "Categoría registrada correctamente" }
  } catch (error) {
    throw error;
  }
}

interface CategoryInfo {
  nom_cat: string | null,
  descr_cat: string | null,
  imagen_repr: Uint8Array | null,
  tipo_cat: Category | null
}

export async function updateCategory(cod_cat: number, attributes: Partial<CategoryInfo>) {
  try{
    const { nom_cat, descr_cat, imagen_repr, tipo_cat } = attributes;
    const category_updated = await prisma.$queryRaw`
      SELECT * FROM sp_actualizarcategoria(
        ${cod_cat}::INTEGER,
        ${nom_cat ?? null}::VARCHAR,
        ${descr_cat ?? null}::VARCHAR,
        ${imagen_repr ?? null}::BYTEA,
        ${tipo_cat ?? null}::VARCHAR
      )
    `;
    return category_updated;
  }catch(err){
    throw new Error((err as Error).message);
  } 
}

export async function get_all_categories(){
  try{
    const all_categories = await prisma.$queryRaw`
      SELECT * FROM sp_get_categories()
    `;
    return all_categories;
  }catch(err){
    throw new Error((err as Error).message);
  }
}
