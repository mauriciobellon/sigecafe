/*
  Warnings:

  - You are about to drop the column `celular` on the `Colaborador` table. All the data in the column will be lost.
  - You are about to drop the column `nome` on the `Colaborador` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Usuario_celular_key";

-- AlterTable
ALTER TABLE "Colaborador" DROP COLUMN "celular",
DROP COLUMN "nome",
ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "deletedAt" TIMESTAMP(3);
