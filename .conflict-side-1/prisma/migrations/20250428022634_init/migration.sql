-- CreateEnum
CREATE TYPE "OfferSide" AS ENUM ('BUY', 'SELL');

-- CreateEnum
CREATE TYPE "OfferStatus" AS ENUM ('OPEN', 'FILLED', 'CANCELLED');

-- AlterEnum
ALTER TYPE "UsuarioType" ADD VALUE 'PUBLICO';

-- CreateTable
CREATE TABLE "Oferta" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "side" "OfferSide" NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "status" "OfferStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Oferta_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Oferta" ADD CONSTRAINT "Oferta_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
