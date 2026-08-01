import { prisma } from "@/lib/prisma";
import { MermaForm } from "@/components/forms/merma-form";

export default async function NuevaMermaPage() {
  const [lots, supervisors] = await Promise.all([
    prisma.lot.findMany({
      where: { availableWeight: { gt: 0 }, status: { in: ["DISPONIBLE", "PARCIALMENTE_UTILIZADO"] } },
      include: { product: true },
      orderBy: { entryDatetime: "desc" },
    }),
    prisma.user.findMany({
      where: { role: { in: ["SUPERVISOR", "ADMINISTRADOR"] }, active: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold">Nueva merma / ajuste</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Registra deshidratación, daño u otra pérdida de peso en un lote. El peso disponible se actualiza al instante.
        </p>
      </div>
      <MermaForm
        lots={lots.map((l) => ({ id: l.id, code: l.code, productName: l.product.name, availableWeight: l.availableWeight }))}
        supervisors={supervisors.map((s) => ({ id: s.id, name: s.name }))}
      />
    </div>
  );
}
