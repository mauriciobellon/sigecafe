/*
  Warnings:

  - You are about to drop the column `userType` on the `Permission` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Permission" DROP COLUMN "userType",
ADD COLUMN     "usuarioType" "UsuarioType"[];
