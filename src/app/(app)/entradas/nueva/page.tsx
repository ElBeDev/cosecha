import { prisma } from "@/lib/prisma";
import { EntradaForm } from "@/components/forms/entrada-form";

export default async function NuevaEntradaPage() {
  const [proveedores, productos, tamanos, calidades, almacenes, ubicaciones, tarimas, cajas, bascula] =
    await Promise.all([
      prisma.supplier.findMany({ where: { status: "ACTIVO" }, orderBy: { name: "asc" } }),
      prisma.product.findMany({ where: { status: "ACTIVO" }, orderBy: { name: "asc" } }),
      prisma.size.findMany({ where: { status: "ACTIVO" }, orderBy: { id: "asc" } }),
      prisma.quality.findMany({ where: { status: "ACTIVO" }, orderBy: { id: "asc" } }),
      prisma.warehouse.findMany({ where: { status: "ACTIVO" }, orderBy: { name: "asc" } }),
      prisma.location.findMany({ orderBy: { label: "asc" } }),
      prisma.tarimaType.findMany({ where: { status: "ACTIVO" }, orderBy: { code: "asc" } }),
      prisma.cajaType.findMany({ where: { status: "ACTIVO" }, orderBy: { name: "asc" } }),
      prisma.scale.findFirstOrThrow({ where: { type: "PLATAFORMA", status: "ACTIVO" } }),
    ]);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold">Nueva entrada</h1>
        <p className="mt-1 text-sm text-latte-500">
          Registra la recepción de mercancía, pesa con la báscula de plataforma y genera el lote automáticamente.
        </p>
      </div>
      <EntradaForm
        proveedores={proveedores}
        productos={productos}
        tamanos={tamanos}
        calidades={calidades}
        almacenes={almacenes}
        ubicaciones={ubicaciones.map((u) => ({ id: u.id, warehouseId: u.warehouseId, label: u.label }))}
        tarimas={tarimas.map((t) => ({ id: t.id, code: t.code, tareWeight: t.tareWeight }))}
        cajas={cajas.map((c) => ({ id: c.id, name: c.name, tareWeight: c.tareWeight }))}
        bascula={{
          id: bascula.id,
          name: bascula.name,
          minCapacity: bascula.minCapacity,
          maxCapacity: bascula.maxCapacity,
          unit: bascula.unit,
        }}
      />
    </div>
  );
}
