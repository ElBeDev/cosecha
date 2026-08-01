import Link from "next/link";
import { prisma } from "@/lib/prisma";
import type { LotStatus } from "@/generated/prisma/enums";

const STATUS_LABELS: Record<LotStatus, string> = {
  DISPONIBLE: "Disponible",
  RESERVADO: "Reservado",
  PARCIALMENTE_UTILIZADO: "Parcialmente utilizado",
  AGOTADO: "Agotado",
  BLOQUEADO: "Bloqueado",
  EN_REVISION: "En revisión",
  MERMA: "Merma",
  CANCELADO: "Cancelado",
};

export default async function InventarioPage({
  searchParams,
}: {
  searchParams: Promise<{ productoId?: string; estatus?: string }>;
}) {
  const params = await searchParams;
  const productoId = params.productoId ? Number(params.productoId) : undefined;
  const estatus = params.estatus as LotStatus | undefined;

  const [lots, productos] = await Promise.all([
    prisma.lot.findMany({
      where: {
        ...(productoId ? { productId: productoId } : {}),
        ...(estatus ? { status: estatus } : {}),
      },
      include: { product: true, size: true, quality: true, supplier: true, warehouse: true, location: true },
      orderBy: { entryDatetime: "desc" },
    }),
    prisma.product.findMany({ orderBy: { name: "asc" } }),
  ]);

  const totals = lots.reduce(
    (acc, l) => {
      acc.available += l.availableWeight;
      acc.initial += l.initialWeight;
      return acc;
    },
    { available: 0, initial: 0 }
  );

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold">Inventario</h1>
        <p className="mt-1 text-sm text-zinc-500">
          {lots.length} lote(s) · {totals.available.toFixed(2)} kg disponibles de {totals.initial.toFixed(2)} kg recibidos
        </p>
      </div>

      <form method="get" className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Producto</label>
          <select name="productoId" defaultValue={params.productoId ?? ""} className={selectClass}>
            <option value="">Todos</option>
            {productos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Estatus</label>
          <select name="estatus" defaultValue={params.estatus ?? ""} className={selectClass}>
            <option value="">Todos</option>
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
        >
          Filtrar
        </button>
        {params.productoId || params.estatus ? (
          <Link href="/inventario" className="text-sm text-zinc-500 underline">
            Limpiar
          </Link>
        ) : null}
      </form>

      <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
        <table className="min-w-full divide-y divide-zinc-200 text-sm dark:divide-zinc-800">
          <thead className="bg-zinc-50 dark:bg-zinc-900">
            <tr className="text-left text-xs font-semibold uppercase text-zinc-500">
              <th className="px-3 py-2">Lote</th>
              <th className="px-3 py-2">Producto</th>
              <th className="px-3 py-2">Tamaño / Calidad</th>
              <th className="px-3 py-2">Proveedor</th>
              <th className="px-3 py-2">Ubicación</th>
              <th className="px-3 py-2 text-right">Disponible</th>
              <th className="px-3 py-2 text-right">Inicial</th>
              <th className="px-3 py-2">Estatus</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {lots.map((lot) => (
              <tr key={lot.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900">
                <td className="px-3 py-2 font-medium">
                  <Link href={`/lotes/${lot.id}`} className="text-emerald-700 hover:underline dark:text-emerald-400">
                    {lot.code}
                  </Link>
                </td>
                <td className="px-3 py-2">{lot.product.name}</td>
                <td className="px-3 py-2">
                  {lot.size.name} / {lot.quality.name}
                </td>
                <td className="px-3 py-2">{lot.supplier.name}</td>
                <td className="px-3 py-2">
                  {lot.warehouse.name}
                  {lot.location ? ` · ${lot.location.label}` : ""}
                </td>
                <td className="px-3 py-2 text-right">{lot.availableWeight.toFixed(2)} kg</td>
                <td className="px-3 py-2 text-right">{lot.initialWeight.toFixed(2)} kg</td>
                <td className="px-3 py-2">
                  <StatusBadge status={lot.status} />
                </td>
              </tr>
            ))}
            {lots.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-3 py-6 text-center text-zinc-500">
                  No hay lotes que coincidan con el filtro.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const selectClass =
  "rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900";

function StatusBadge({ status }: { status: LotStatus }) {
  const styles: Partial<Record<LotStatus, string>> = {
    DISPONIBLE: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300",
    PARCIALMENTE_UTILIZADO: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
    AGOTADO: "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${styles[status] ?? "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}
