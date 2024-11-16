-- CreateEnum
CREATE TYPE "MenuType" AS ENUM ('ROOT', 'PERFIL', 'DROPDOWN');

-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('ADMINISTRADOR', 'COORDENADOR', 'PROFESSOR', 'RESPONSAVEL', 'AUTENTICADO');

-- CreateTable
CREATE TABLE "Aluno" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,

    CONSTRAINT "Aluno_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Escola" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,

    CONSTRAINT "Escola_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" SERIAL NOT NULL,
    "path" TEXT NOT NULL,
    "title" TEXT,
    "icon" TEXT,
    "description" TEXT,
    "menuType" "MenuType"[],
    "userType" "UserType"[],

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "type" "UserType" NOT NULL DEFAULT 'AUTENTICADO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_AlunoToEscola" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_AlunoToUser" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Permission_path_key" ON "Permission"("path");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "_AlunoToEscola_AB_unique" ON "_AlunoToEscola"("A", "B");

-- CreateIndex
CREATE INDEX "_AlunoToEscola_B_index" ON "_AlunoToEscola"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_AlunoToUser_AB_unique" ON "_AlunoToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_AlunoToUser_B_index" ON "_AlunoToUser"("B");

-- AddForeignKey
ALTER TABLE "_AlunoToEscola" ADD CONSTRAINT "_AlunoToEscola_A_fkey" FOREIGN KEY ("A") REFERENCES "Aluno"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AlunoToEscola" ADD CONSTRAINT "_AlunoToEscola_B_fkey" FOREIGN KEY ("B") REFERENCES "Escola"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AlunoToUser" ADD CONSTRAINT "_AlunoToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Aluno"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AlunoToUser" ADD CONSTRAINT "_AlunoToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
