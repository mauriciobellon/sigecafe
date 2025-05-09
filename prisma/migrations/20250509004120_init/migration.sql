/*
  Warnings:

  - The primary key for the `Notificacao` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Notificacao` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `PasswordResetToken` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `PasswordResetToken` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Transacao` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Transacao` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Notificacao" DROP CONSTRAINT "Notificacao_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Notificacao_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "PasswordResetToken" DROP CONSTRAINT "PasswordResetToken_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Transacao" DROP CONSTRAINT "Transacao_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Transacao_pkey" PRIMARY KEY ("id");
