-- CreateEnum
CREATE TYPE "UsuarioType" AS ENUM ('ADMINISTRADOR', 'COOPERATIVA', 'PRODUTOR', 'COMPRADOR', 'AUTENTICADO');

-- CreateEnum
CREATE TYPE "MenuType" AS ENUM ('ROOT', 'PERFIL', 'DROPDOWN');

-- CreateTable
CREATE TABLE "Usuario" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "celular" TEXT,
    "type" "UsuarioType" NOT NULL DEFAULT 'AUTENTICADO',
    "cooperativaId" INTEGER,
    "produtorId" INTEGER,
    "compradorId" INTEGER,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" SERIAL NOT NULL,
    "path" TEXT NOT NULL,
    "title" TEXT,
    "icon" TEXT,
    "description" TEXT,
    "menuType" "MenuType"[],
    "usuarioType" "UsuarioType"[],

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cooperativa" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "celular" TEXT,

    CONSTRAINT "Cooperativa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Produtor" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "celular" TEXT,

    CONSTRAINT "Produtor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comprador" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "celular" TEXT,

    CONSTRAINT "Comprador_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transacao" (
    "id" SERIAL NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "quantidade" INTEGER NOT NULL,
    "precoUnitario" DOUBLE PRECISION NOT NULL,
    "compradorId" INTEGER,
    "produtorId" INTEGER,

    CONSTRAINT "Transacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrecoCafe" (
    "id" SERIAL NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "precoRobusta" DOUBLE PRECISION,
    "precoArabica" DOUBLE PRECISION,

    CONSTRAINT "PrecoCafe_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_path_key" ON "Permission"("path");

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_cooperativaId_fkey" FOREIGN KEY ("cooperativaId") REFERENCES "Cooperativa"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_produtorId_fkey" FOREIGN KEY ("produtorId") REFERENCES "Produtor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_compradorId_fkey" FOREIGN KEY ("compradorId") REFERENCES "Comprador"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transacao" ADD CONSTRAINT "Transacao_compradorId_fkey" FOREIGN KEY ("compradorId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transacao" ADD CONSTRAINT "Transacao_produtorId_fkey" FOREIGN KEY ("produtorId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
