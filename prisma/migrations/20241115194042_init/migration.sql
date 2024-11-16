/*
  Warnings:

  - You are about to drop the `_AlunoToEscola` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `escolaId` to the `Aluno` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_AlunoToEscola" DROP CONSTRAINT "_AlunoToEscola_A_fkey";

-- DropForeignKey
ALTER TABLE "_AlunoToEscola" DROP CONSTRAINT "_AlunoToEscola_B_fkey";

-- AlterTable
ALTER TABLE "Aluno" ADD COLUMN     "escolaId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "_AlunoToEscola";

-- AddForeignKey
ALTER TABLE "Aluno" ADD CONSTRAINT "Aluno_escolaId_fkey" FOREIGN KEY ("escolaId") REFERENCES "Escola"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
