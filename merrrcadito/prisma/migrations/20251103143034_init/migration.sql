/*
  Warnings:

  - The primary key for the `publicacion_producto` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "publicacion_producto" DROP CONSTRAINT "publicacion_producto_pkey",
ADD CONSTRAINT "publicacion_producto_pkey" PRIMARY KEY ("cod_pub", "cod_prod");
