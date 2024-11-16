/*
  Warnings:

  - You are about to drop the column `escolaId` on the `Aluno` table. All the data in the column will be lost.
  - The `userType` column on the `Permission` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_AlunoToUser` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "UsuarioType" AS ENUM ('ADMINISTRADOR', 'COORDENADOR', 'PROFESSOR', 'RESPONSAVEL', 'AUTENTICADO');

-- DropForeignKey
ALTER TABLE "Aluno" DROP CONSTRAINT "Aluno_escolaId_fkey";

-- DropForeignKey
ALTER TABLE "_AlunoToUser" DROP CONSTRAINT "_AlunoToUser_A_fkey";

-- DropForeignKey
ALTER TABLE "_AlunoToUser" DROP CONSTRAINT "_AlunoToUser_B_fkey";

-- AlterTable
ALTER TABLE "Aluno" DROP COLUMN "escolaId";

-- AlterTable
ALTER TABLE "Permission" DROP COLUMN "userType",
ADD COLUMN     "userType" "UsuarioType"[];

-- DropTable
DROP TABLE "User";

-- DropTable
DROP TABLE "_AlunoToUser";

-- DropEnum
DROP TYPE "UserType";

-- CreateTable
CREATE TABLE "Usuario" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "type" "UsuarioType" NOT NULL DEFAULT 'AUTENTICADO',

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_AlunoToEscola" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_AlunoToUsuario" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "_AlunoToEscola_AB_unique" ON "_AlunoToEscola"("A", "B");

-- CreateIndex
CREATE INDEX "_AlunoToEscola_B_index" ON "_AlunoToEscola"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_AlunoToUsuario_AB_unique" ON "_AlunoToUsuario"("A", "B");

-- CreateIndex
CREATE INDEX "_AlunoToUsuario_B_index" ON "_AlunoToUsuario"("B");

-- AddForeignKey
ALTER TABLE "_AlunoToEscola" ADD CONSTRAINT "_AlunoToEscola_A_fkey" FOREIGN KEY ("A") REFERENCES "Aluno"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AlunoToEscola" ADD CONSTRAINT "_AlunoToEscola_B_fkey" FOREIGN KEY ("B") REFERENCES "Escola"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AlunoToUsuario" ADD CONSTRAINT "_AlunoToUsuario_A_fkey" FOREIGN KEY ("A") REFERENCES "Aluno"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AlunoToUsuario" ADD CONSTRAINT "_AlunoToUsuario_B_fkey" FOREIGN KEY ("B") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;
