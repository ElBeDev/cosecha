import { config } from "dotenv";
config({ path: ".env.local" });
config();
import { PrismaClient } from "../src/generated/prisma/client.ts";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const DEMO_PASSWORD = "cosecha2026";

async function main() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  await Promise.all(
    [
      { email: "admin@cosecha.local", name: "Administrador", role: "ADMINISTRADOR" as const },
      { email: "supervisor@cosecha.local", name: "Supervisor", role: "SUPERVISOR" as const },
      { email: "operador1@cosecha.local", name: "Operador 1", role: "OPERADOR" as const },
      { email: "operador2@cosecha.local", name: "Operador 2", role: "OPERADOR" as const },
      { email: "consulta@cosecha.local", name: "Consulta", role: "CONSULTA" as const },
    ].map((u) =>
      prisma.user.upsert({
        where: { email: u.email },
        update: {},
        create: { ...u, passwordHash },
      })
    )
  );

  const warehouse =
    (await prisma.warehouse.findFirst({ where: { name: "Bodega principal" } })) ??
    (await prisma.warehouse.create({
      data: { name: "Bodega principal", type: "BODEGA", capacity: 5000, status: "ACTIVO" },
    }));

  const existingLocation = await prisma.location.findFirst({ where: { label: "Pasillo A / Zona 01" } });
  if (!existingLocation) {
    await prisma.location.create({
      data: { warehouseId: warehouse.id, label: "Pasillo A / Zona 01", aisle: "A", zone: "01" },
    });
  }

  await prisma.supplier.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: "Rancho La Cosecha",
      contact: "Juan Pérez",
      phone: "555-100-2000",
      email: "contacto@ranocolacosecha.mx",
      type: "PRODUCCION_PROPIA",
      status: "ACTIVO",
    },
  });

  await Promise.all(
    [
      { code: "JIT", name: "Jitomate saladette", category: "Hortaliza" },
      { code: "CEB", name: "Cebolla blanca", category: "Hortaliza" },
      { code: "CIL", name: "Cilantro", category: "Hierba" },
      { code: "LEC", name: "Lechuga romana", category: "Hortaliza" },
      { code: "CHI", name: "Chile serrano", category: "Hortaliza" },
    ].map((p) =>
      prisma.product.upsert({
        where: { code: p.code },
        update: {},
        create: { ...p, unit: "KG", minWeight: 0, maxWeight: 1000, status: "ACTIVO" },
      })
    )
  );

  for (const name of ["Chico", "Mediano", "Grande"]) {
    const existing = await prisma.size.findFirst({ where: { name } });
    if (!existing) await prisma.size.create({ data: { name } });
  }

  for (const name of ["Primera", "Segunda", "Descarte"]) {
    const existing = await prisma.quality.findFirst({ where: { name } });
    if (!existing) await prisma.quality.create({ data: { name } });
  }

  await Promise.all([
    prisma.tarimaType.upsert({
      where: { code: "TAR-MAD" },
      update: {},
      create: { code: "TAR-MAD", type: "MADERA", tareWeight: 25, maxCapacity: 1000, status: "ACTIVO" },
    }),
    prisma.tarimaType.upsert({
      where: { code: "TAR-PLA" },
      update: {},
      create: { code: "TAR-PLA", type: "PLASTICO", tareWeight: 18, maxCapacity: 1000, status: "ACTIVO" },
    }),
  ]);

  await Promise.all([
    prisma.cajaType.upsert({
      where: { code: "CAJ-PLA" },
      update: {},
      create: { code: "CAJ-PLA", name: "Caja plástica", tareWeight: 2.3, maxCapacity: 25, status: "ACTIVO" },
    }),
    prisma.cajaType.upsert({
      where: { code: "CAJ-CAR" },
      update: {},
      create: { code: "CAJ-CAR", name: "Caja de cartón", tareWeight: 0.8, maxCapacity: 20, status: "ACTIVO" },
    }),
    prisma.cajaType.upsert({
      where: { code: "CAJ-CAN" },
      update: {},
      create: { code: "CAJ-CAN", name: "Canastilla", tareWeight: 1.5, maxCapacity: 20, status: "ACTIVO" },
    }),
  ]);

  const scales = [
    { name: "Báscula 1 - Plataforma industrial", type: "PLATAFORMA" as const, minCapacity: 200, maxCapacity: 1000 },
    { name: "Báscula 2 - Cajas", type: "CAJAS" as const, minCapacity: 5, maxCapacity: 200 },
    { name: "Báscula 3 - Mostrador", type: "MOSTRADOR" as const, minCapacity: 0.01, maxCapacity: 5 },
  ];
  for (const scale of scales) {
    const existing = await prisma.scale.findFirst({ where: { name: scale.name } });
    if (!existing) {
      await prisma.scale.create({ data: { ...scale, unit: "kg", status: "ACTIVO" } });
    }
  }

  console.log("Seed completo.");
  console.log(`Usuarios de demo (todos con password: "${DEMO_PASSWORD}"):`);
  console.log(
    "  admin@cosecha.local / supervisor@cosecha.local / operador1@cosecha.local / operador2@cosecha.local / consulta@cosecha.local"
  );
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
