-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMINISTRADOR', 'SUPERVISOR', 'OPERADOR', 'CONSULTA');

-- CreateEnum
CREATE TYPE "ProductUnit" AS ENUM ('KG', 'CAJA', 'PIEZA', 'TARIMA');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('ACTIVO', 'INACTIVO');

-- CreateEnum
CREATE TYPE "PalletType" AS ENUM ('MADERA', 'PLASTICO', 'METALICA');

-- CreateEnum
CREATE TYPE "WarehouseType" AS ENUM ('BODEGA', 'CAMARA_FRIA', 'RECEPCION', 'EMBARQUE', 'MOSTRADOR');

-- CreateEnum
CREATE TYPE "ScaleType" AS ENUM ('PLATAFORMA', 'CAJAS', 'MOSTRADOR');

-- CreateEnum
CREATE TYPE "LotStatus" AS ENUM ('DISPONIBLE', 'RESERVADO', 'PARCIALMENTE_UTILIZADO', 'AGOTADO', 'BLOQUEADO', 'EN_REVISION', 'MERMA', 'CANCELADO');

-- CreateEnum
CREATE TYPE "ExitType" AS ENUM ('VENTA', 'TRASLADO_INTERNO', 'EMBARQUE', 'DEVOLUCION', 'MERMA', 'AJUSTE_AUTORIZADO', 'MUESTRA', 'CONSUMO_INTERNO');

-- CreateEnum
CREATE TYPE "ExitMode" AS ENUM ('TARIMA', 'SIN_TARIMA', 'CAJAS', 'MOSTRADOR');

-- CreateEnum
CREATE TYPE "RecordStatus" AS ENUM ('REGISTRADA', 'CANCELADA');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "unit" "ProductUnit" NOT NULL DEFAULT 'KG',
    "minWeight" DOUBLE PRECISION,
    "maxWeight" DOUBLE PRECISION,
    "status" "Status" NOT NULL DEFAULT 'ACTIVO',
    "notes" TEXT,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Size" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'ACTIVO',

    CONSTRAINT "Size_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quality" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'ACTIVO',

    CONSTRAINT "Quality_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Supplier" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "contact" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "type" TEXT NOT NULL DEFAULT 'PRODUCTOR_EXTERNO',
    "status" "Status" NOT NULL DEFAULT 'ACTIVO',

    CONSTRAINT "Supplier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Warehouse" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" "WarehouseType" NOT NULL,
    "capacity" DOUBLE PRECISION,
    "status" "Status" NOT NULL DEFAULT 'ACTIVO',

    CONSTRAINT "Warehouse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Location" (
    "id" SERIAL NOT NULL,
    "warehouseId" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "aisle" TEXT,
    "zone" TEXT,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TarimaType" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "type" "PalletType" NOT NULL,
    "tareWeight" DOUBLE PRECISION NOT NULL,
    "maxCapacity" DOUBLE PRECISION,
    "status" "Status" NOT NULL DEFAULT 'ACTIVO',

    CONSTRAINT "TarimaType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CajaType" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tareWeight" DOUBLE PRECISION NOT NULL,
    "maxCapacity" DOUBLE PRECISION,
    "status" "Status" NOT NULL DEFAULT 'ACTIVO',

    CONSTRAINT "CajaType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Scale" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" "ScaleType" NOT NULL,
    "minCapacity" DOUBLE PRECISION NOT NULL,
    "maxCapacity" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'kg',
    "status" "Status" NOT NULL DEFAULT 'ACTIVO',

    CONSTRAINT "Scale_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lot" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "productId" INTEGER NOT NULL,
    "sizeId" INTEGER NOT NULL,
    "qualityId" INTEGER NOT NULL,
    "supplierId" INTEGER NOT NULL,
    "origin" TEXT,
    "harvestDate" TIMESTAMP(3),
    "entryDatetime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "initialWeight" DOUBLE PRECISION NOT NULL,
    "availableWeight" DOUBLE PRECISION NOT NULL,
    "warehouseId" INTEGER NOT NULL,
    "locationId" INTEGER,
    "status" "LotStatus" NOT NULL DEFAULT 'DISPONIBLE',
    "operatorId" INTEGER NOT NULL,
    "notes" TEXT,

    CONSTRAINT "Lot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Entry" (
    "id" SERIAL NOT NULL,
    "folio" TEXT NOT NULL,
    "datetime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "operatorId" INTEGER NOT NULL,
    "supplierId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "sizeId" INTEGER NOT NULL,
    "qualityId" INTEGER NOT NULL,
    "harvestDate" TIMESTAMP(3),
    "scaleId" INTEGER NOT NULL,
    "grossWeight" DOUBLE PRECISION NOT NULL,
    "tarimaTypeId" INTEGER,
    "palletTare" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "cajaTypeId" INTEGER,
    "boxCount" INTEGER NOT NULL DEFAULT 0,
    "boxesTare" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "additionalTare" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "netWeight" DOUBLE PRECISION NOT NULL,
    "warehouseId" INTEGER NOT NULL,
    "locationId" INTEGER,
    "notes" TEXT,
    "status" "RecordStatus" NOT NULL DEFAULT 'REGISTRADA',
    "lotId" INTEGER NOT NULL,

    CONSTRAINT "Entry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Exit" (
    "id" SERIAL NOT NULL,
    "folio" TEXT NOT NULL,
    "datetime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "operatorId" INTEGER NOT NULL,
    "exitType" "ExitType" NOT NULL,
    "exitMode" "ExitMode" NOT NULL,
    "lotId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "sizeId" INTEGER NOT NULL,
    "qualityId" INTEGER NOT NULL,
    "scaleId" INTEGER NOT NULL,
    "grossWeight" DOUBLE PRECISION,
    "tareWeight" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "boxCount" INTEGER,
    "netWeight" DOUBLE PRECISION NOT NULL,
    "sourceLocationId" INTEGER,
    "destinationLocationId" INTEGER,
    "customer" TEXT,
    "reason" TEXT,
    "notes" TEXT,
    "status" "RecordStatus" NOT NULL DEFAULT 'REGISTRADA',

    CONSTRAINT "Exit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MovementLog" (
    "id" SERIAL NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "folio" TEXT NOT NULL,
    "lotId" INTEGER,
    "entryId" INTEGER,
    "exitId" INTEGER,
    "newData" TEXT,
    "device" TEXT NOT NULL DEFAULT 'web',
    "reason" TEXT,
    "authorizedBy" INTEGER,

    CONSTRAINT "MovementLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Product_code_key" ON "Product"("code");

-- CreateIndex
CREATE UNIQUE INDEX "TarimaType_code_key" ON "TarimaType"("code");

-- CreateIndex
CREATE UNIQUE INDEX "CajaType_code_key" ON "CajaType"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Lot_code_key" ON "Lot"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Entry_folio_key" ON "Entry"("folio");

-- CreateIndex
CREATE UNIQUE INDEX "Entry_lotId_key" ON "Entry"("lotId");

-- CreateIndex
CREATE UNIQUE INDEX "Exit_folio_key" ON "Exit"("folio");

-- AddForeignKey
ALTER TABLE "Location" ADD CONSTRAINT "Location_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lot" ADD CONSTRAINT "Lot_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lot" ADD CONSTRAINT "Lot_sizeId_fkey" FOREIGN KEY ("sizeId") REFERENCES "Size"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lot" ADD CONSTRAINT "Lot_qualityId_fkey" FOREIGN KEY ("qualityId") REFERENCES "Quality"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lot" ADD CONSTRAINT "Lot_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lot" ADD CONSTRAINT "Lot_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lot" ADD CONSTRAINT "Lot_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lot" ADD CONSTRAINT "Lot_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Entry" ADD CONSTRAINT "Entry_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Entry" ADD CONSTRAINT "Entry_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Entry" ADD CONSTRAINT "Entry_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Entry" ADD CONSTRAINT "Entry_sizeId_fkey" FOREIGN KEY ("sizeId") REFERENCES "Size"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Entry" ADD CONSTRAINT "Entry_qualityId_fkey" FOREIGN KEY ("qualityId") REFERENCES "Quality"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Entry" ADD CONSTRAINT "Entry_scaleId_fkey" FOREIGN KEY ("scaleId") REFERENCES "Scale"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Entry" ADD CONSTRAINT "Entry_tarimaTypeId_fkey" FOREIGN KEY ("tarimaTypeId") REFERENCES "TarimaType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Entry" ADD CONSTRAINT "Entry_cajaTypeId_fkey" FOREIGN KEY ("cajaTypeId") REFERENCES "CajaType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Entry" ADD CONSTRAINT "Entry_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Entry" ADD CONSTRAINT "Entry_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Entry" ADD CONSTRAINT "Entry_lotId_fkey" FOREIGN KEY ("lotId") REFERENCES "Lot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exit" ADD CONSTRAINT "Exit_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exit" ADD CONSTRAINT "Exit_lotId_fkey" FOREIGN KEY ("lotId") REFERENCES "Lot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exit" ADD CONSTRAINT "Exit_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exit" ADD CONSTRAINT "Exit_sizeId_fkey" FOREIGN KEY ("sizeId") REFERENCES "Size"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exit" ADD CONSTRAINT "Exit_qualityId_fkey" FOREIGN KEY ("qualityId") REFERENCES "Quality"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exit" ADD CONSTRAINT "Exit_scaleId_fkey" FOREIGN KEY ("scaleId") REFERENCES "Scale"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exit" ADD CONSTRAINT "Exit_sourceLocationId_fkey" FOREIGN KEY ("sourceLocationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exit" ADD CONSTRAINT "Exit_destinationLocationId_fkey" FOREIGN KEY ("destinationLocationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovementLog" ADD CONSTRAINT "MovementLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
