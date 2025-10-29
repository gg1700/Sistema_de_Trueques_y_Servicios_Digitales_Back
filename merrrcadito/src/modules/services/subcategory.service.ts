import { PrismaClient } from "@prisma/client";

const prisma= new PrismaClient();

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
      return { success: true, message: "Subategoria registrada correctamente"}     
    } catch (error){
        throw error;
    }
}

export async function getSubcategory(){
  try {
    await prisma.$queryRaw`
      CALL sp_getSubcategorias()
    `;
    return { success: true , message: "Lista de subcategorias"}
  } catch (error){
    throw error;
  }
}