import { prisma } from "@/lib/prisma";
import { SalidaForm } from "@/components/forms/salida-form";

export default async function NuevaSalidaPage() {
  const [lots, cajas, scaleCajas, scaleMostrador] = await Promise.all([
    prisma.lot.findMany({
      where: { availableWeight: { gt: 0 }, status: { in: ["DISPONIBLE", "PARCIALMENTE_UTILIZADO"] } },
      include: { product: true, size: true, quality: true },
      orderBy: { entryDatetime: "desc" },
    }),
    prisma.cajaType.findMany({ where: { status: "ACTIVO" }, orderBy: { name: "asc" } }),
    prisma.scale.findFirstOrThrow({ where: { type: "CAJAS", status: "ACTIVO" } }),
    prisma.scale.findFirstOrThrow({ where: { type: "MOSTRADOR", status: "ACTIVO" } }),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold">Nueva salida</h1>
        <p className="mt-1 text-sm text-latte-500">
          Registra una salida por cajas o de mostrador, pesando con la báscula correspondiente.
        </p>
      </div>
      <SalidaForm
        lots={lots.map((l) => ({
          id: l.id,
          code: l.code,
          productName: l.product.name,
          sizeName: l.size.name,
          qualityName: l.quality.name,
          availableWeight: l.availableWeight,
        }))}
        cajas={cajas.map((c) => ({ id: c.id, name: c.name, tareWeight: c.tareWeight }))}
        scaleCajas={{
          id: scaleCajas.id,
          name: scaleCajas.name,
          minCapacity: scaleCajas.minCapacity,
          maxCapacity: scaleCajas.maxCapacity,
          unit: scaleCajas.unit,
        }}
        scaleMostrador={{
          id: scaleMostrador.id,
          name: scaleMostrador.name,
          minCapacity: scaleMostrador.minCapacity,
          maxCapacity: scaleMostrador.maxCapacity,
          unit: scaleMostrador.unit,
        }}
      />
    </div>
  );
}
