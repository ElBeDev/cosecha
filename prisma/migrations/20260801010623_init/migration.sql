-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Product" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "unit" TEXT NOT NULL DEFAULT 'KG',
    "minWeight" REAL,
    "maxWeight" REAL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVO',
    "notes" TEXT
);

-- CreateTable
CREATE TABLE "Size" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVO'
);

-- CreateTable
CREATE TABLE "Quality" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVO'
);

-- CreateTable
CREATE TABLE "Supplier" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "contact" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "type" TEXT NOT NULL DEFAULT 'PRODUCTOR_EXTERNO',
    "status" TEXT NOT NULL DEFAULT 'ACTIVO'
);

-- CreateTable
CREATE TABLE "Warehouse" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "capacity" REAL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVO'
);

-- CreateTable
CREATE TABLE "Location" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "warehouseId" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "aisle" TEXT,
    "zone" TEXT,
    CONSTRAINT "Location_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TarimaType" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "code" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "tareWeight" REAL NOT NULL,
    "maxCapacity" REAL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVO'
);

-- CreateTable
CREATE TABLE "CajaType" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tareWeight" REAL NOT NULL,
    "maxCapacity" REAL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVO'
);

-- CreateTable
CREATE TABLE "Scale" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "minCapacity" REAL NOT NULL,
    "maxCapacity" REAL NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'kg',
    "status" TEXT NOT NULL DEFAULT 'ACTIVO'
);

-- CreateTable
CREATE TABLE "Lot" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "code" TEXT NOT NULL,
    "productId" INTEGER NOT NULL,
    "sizeId" INTEGER NOT NULL,
    "qualityId" INTEGER NOT NULL,
    "supplierId" INTEGER NOT NULL,
    "origin" TEXT,
    "harvestDate" DATETIME,
    "entryDatetime" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "initialWeight" REAL NOT NULL,
    "availableWeight" REAL NOT NULL,
    "warehouseId" INTEGER NOT NULL,
    "locationId" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'DISPONIBLE',
    "operatorId" INTEGER NOT NULL,
    "notes" TEXT,
    CONSTRAINT "Lot_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Lot_sizeId_fkey" FOREIGN KEY ("sizeId") REFERENCES "Size" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Lot_qualityId_fkey" FOREIGN KEY ("qualityId") REFERENCES "Quality" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Lot_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Lot_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Lot_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Lot_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Entry" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "folio" TEXT NOT NULL,
    "datetime" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "operatorId" INTEGER NOT NULL,
    "supplierId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "sizeId" INTEGER NOT NULL,
    "qualityId" INTEGER NOT NULL,
    "harvestDate" DATETIME,
    "scaleId" INTEGER NOT NULL,
    "grossWeight" REAL NOT NULL,
    "tarimaTypeId" INTEGER,
    "palletTare" REAL NOT NULL DEFAULT 0,
    "cajaTypeId" INTEGER,
    "boxCount" INTEGER NOT NULL DEFAULT 0,
    "boxesTare" REAL NOT NULL DEFAULT 0,
    "additionalTare" REAL NOT NULL DEFAULT 0,
    "netWeight" REAL NOT NULL,
    "warehouseId" INTEGER NOT NULL,
    "locationId" INTEGER,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'REGISTRADA',
    "lotId" INTEGER NOT NULL,
    CONSTRAINT "Entry_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Entry_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Entry_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Entry_sizeId_fkey" FOREIGN KEY ("sizeId") REFERENCES "Size" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Entry_qualityId_fkey" FOREIGN KEY ("qualityId") REFERENCES "Quality" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Entry_scaleId_fkey" FOREIGN KEY ("scaleId") REFERENCES "Scale" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Entry_tarimaTypeId_fkey" FOREIGN KEY ("tarimaTypeId") REFERENCES "TarimaType" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Entry_cajaTypeId_fkey" FOREIGN KEY ("cajaTypeId") REFERENCES "CajaType" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Entry_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Entry_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Entry_lotId_fkey" FOREIGN KEY ("lotId") REFERENCES "Lot" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Exit" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "folio" TEXT NOT NULL,
    "datetime" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "operatorId" INTEGER NOT NULL,
    "exitType" TEXT NOT NULL,
    "exitMode" TEXT NOT NULL,
    "lotId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "sizeId" INTEGER NOT NULL,
    "qualityId" INTEGER NOT NULL,
    "scaleId" INTEGER NOT NULL,
    "grossWeight" REAL,
    "tareWeight" REAL NOT NULL DEFAULT 0,
    "boxCount" INTEGER,
    "netWeight" REAL NOT NULL,
    "sourceLocationId" INTEGER,
    "destinationLocationId" INTEGER,
    "customer" TEXT,
    "reason" TEXT,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'REGISTRADA',
    CONSTRAINT "Exit_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Exit_lotId_fkey" FOREIGN KEY ("lotId") REFERENCES "Lot" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Exit_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Exit_sizeId_fkey" FOREIGN KEY ("sizeId") REFERENCES "Size" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Exit_qualityId_fkey" FOREIGN KEY ("qualityId") REFERENCES "Quality" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Exit_scaleId_fkey" FOREIGN KEY ("scaleId") REFERENCES "Scale" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Exit_sourceLocationId_fkey" FOREIGN KEY ("sourceLocationId") REFERENCES "Location" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Exit_destinationLocationId_fkey" FOREIGN KEY ("destinationLocationId") REFERENCES "Location" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MovementLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "occurredAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
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
    CONSTRAINT "MovementLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
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
