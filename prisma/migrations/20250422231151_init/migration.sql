-- CreateTable
CREATE TABLE "UserPreference" (
    "id" SERIAL NOT NULL,
    "theme" TEXT NOT NULL DEFAULT 'system',
    "fontSize" TEXT NOT NULL DEFAULT 'medium',
    "usuarioId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserPreference_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserPreference_usuarioId_key" ON "UserPreference"("usuarioId");

-- AddForeignKey
ALTER TABLE "UserPreference" ADD CONSTRAINT "UserPreference_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
