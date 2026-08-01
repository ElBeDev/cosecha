import { prisma } from "@/lib/prisma";
import { TrasladoForm } from "@/components/forms/traslado-form";

export default async function NuevoTrasladoPage() {
  const [lots, warehouses, locations] = await Promise.all([
    prisma.lot.findMany({
      where: { availableWeight: { gt: 0 }, status: { in: ["DISPONIBLE", "PARCIALMENTE_UTILIZADO"] } },
      include: { product: true, warehouse: true, location: true },
      orderBy: { entryDatetime: "desc" },
    }),
    prisma.warehouse.findMany({ where: { status: "ACTIVO" }, orderBy: { name: "asc" } }),
    prisma.location.findMany({ orderBy: { label: "asc" } }),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold">Nuevo traslado interno</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Cambia la ubicación de un lote sin descontarlo del inventario, para que el sistema no lo confunda con una venta.
        </p>
      </div>
      <TrasladoForm
        lots={lots.map((l) => ({
          id: l.id,
          code: l.code,
          productName: l.product.name,
          warehouseName: l.warehouse.name,
          locationLabel: l.location?.label ?? null,
          availableWeight: l.availableWeight,
        }))}
        warehouses={warehouses.map((w) => ({ id: w.id, name: w.name }))}
        locations={locations.map((l) => ({ id: l.id, warehouseId: l.warehouseId, label: l.label }))}
      />
    </div>
  );
}
