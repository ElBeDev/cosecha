-- CreateEnum
CREATE TYPE "AdjustmentReason" AS ENUM ('DESHIDRATACION', 'DANO', 'GOLPE', 'DESCOMPOSICION', 'PRODUCTO_RECHAZADO', 'DERRAME', 'DIFERENCIA_DE_PESO', 'ERROR_DE_CAPTURA', 'OTRO');

-- CreateTable
CREATE TABLE "Adjustment" (
    "id" SERIAL NOT NULL,
    "folio" TEXT NOT NULL,
    "datetime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lotId" INTEGER NOT NULL,
    "operatorId" INTEGER NOT NULL,
    "supervisorId" INTEGER,
    "weightBefore" DOUBLE PRECISION NOT NULL,
    "weightAfter" DOUBLE PRECISION NOT NULL,
    "difference" DOUBLE PRECISION NOT NULL,
    "percentage" DOUBLE PRECISION NOT NULL,
    "reason" "AdjustmentReason" NOT NULL,
    "notes" TEXT,

    CONSTRAINT "Adjustment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Adjustment_folio_key" ON "Adjustment"("folio");

-- AddForeignKey
ALTER TABLE "Adjustment" ADD CONSTRAINT "Adjustment_lotId_fkey" FOREIGN KEY ("lotId") REFERENCES "Lot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Adjustment" ADD CONSTRAINT "Adjustment_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Adjustment" ADD CONSTRAINT "Adjustment_supervisorId_fkey" FOREIGN KEY ("supervisorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
