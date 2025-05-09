/*
  Warnings:

  - The primary key for the `Notificacao` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `PasswordResetToken` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Transacao` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "Notificacao" DROP CONSTRAINT "Notificacao_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Notificacao_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Notificacao_id_seq";

-- AlterTable
ALTER TABLE "PasswordResetToken" DROP CONSTRAINT "PasswordResetToken_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "PasswordResetToken_id_seq";

-- AlterTable
ALTER TABLE "Transacao" DROP CONSTRAINT "Transacao_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Transacao_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Transacao_id_seq";
