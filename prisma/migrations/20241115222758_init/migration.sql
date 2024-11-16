-- DropForeignKey
ALTER TABLE "Aluno" DROP CONSTRAINT "Aluno_escolaId_fkey";

-- AlterTable
ALTER TABLE "Aluno" ALTER COLUMN "escolaId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Aluno" ADD CONSTRAINT "Aluno_escolaId_fkey" FOREIGN KEY ("escolaId") REFERENCES "Escola"("id") ON DELETE SET NULL ON UPDATE CASCADE;
