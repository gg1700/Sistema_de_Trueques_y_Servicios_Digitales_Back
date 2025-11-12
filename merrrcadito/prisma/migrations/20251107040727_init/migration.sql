-- CreateEnum
CREATE TYPE "PublicationState" AS ENUM ('activo', 'inactivo');

-- AlterTable
ALTER TABLE "publicacion" ADD COLUMN     "estado_pub" "PublicationState" NOT NULL DEFAULT 'activo';
