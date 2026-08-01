import Link from "next/link";
import { prisma } from "@/lib/prisma";

const ACTION_LABELS: Record<string, string> = {
  ENTRADA_CREADA: "Entrada registrada",
  SALIDA_CREADA: "Salida registrada",
};

function formatDetail(newData: string | null): string {
  if (!newData) return "-";
  try {
    const data = JSON.parse(newData) as Record<string, unknown>;
    return Object.entries(data)
      .map(([k, v]) => `${k}: ${v}`)
      .join(" · ");
  } catch {
    return newData;
  }
}

export default async function MovimientosPage({
  searchParams,
}: {
  searchParams: Promise<{ modulo?: string }>;
}) {
  const params = await searchParams;
  const modulo = params.modulo;

  const movements = await prisma.movementLog.findMany({
    where: modulo ? { module: modulo } : undefined,
    include: { user: true },
    orderBy: { occurredAt: "desc" },
    take: 200,
  });

  const lotIds = [...new Set(movements.map((m) => m.lotId).filter((id): id is number => id !== null))];
  const lots = lotIds.length ? await prisma.lot.findMany({ where: { id: { in: lotIds } } }) : [];
  const lotById = new Map(lots.map((l) => [l.id, l]));

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold">Movimientos</h1>
        <p className="mt-1 text-sm text-zinc-500">Bitácora de entradas y salidas. No se pueden borrar, solo cancelar o revertir.</p>
      </div>

      <form method="get" className="flex items-end gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Módulo</label>
          <select name="modulo" defaultValue={modulo ?? ""} className={selectClass}>
            <option value="">Todos</option>
            <option value="ENTRADAS">Entradas</option>
            <option value="SALIDAS">Salidas</option>
          </select>
        </div>
        <button
          type="submit"
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
        >
          Filtrar
        </button>
        {modulo ? (
          <Link href="/movimientos" className="text-sm text-zinc-500 underline">
            Limpiar
          </Link>
        ) : null}
      </form>

      <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
        <table className="min-w-full divide-y divide-zinc-200 text-sm dark:divide-zinc-800">
          <thead className="bg-zinc-50 dark:bg-zinc-900">
            <tr className="text-left text-xs font-semibold uppercase text-zinc-500">
              <th className="px-3 py-2">Fecha</th>
              <th className="px-3 py-2">Usuario</th>
              <th className="px-3 py-2">Acción</th>
              <th className="px-3 py-2">Folio</th>
              <th className="px-3 py-2">Lote</th>
              <th className="px-3 py-2">Detalle</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {movements.map((m) => {
              const lot = m.lotId ? lotById.get(m.lotId) : undefined;
              return (
              <tr key={m.id}>
                <td className="px-3 py-2 whitespace-nowrap">{m.occurredAt.toLocaleString("es-MX")}</td>
                <td className="px-3 py-2">{m.user.name}</td>
                <td className="px-3 py-2">{ACTION_LABELS[m.action] ?? m.action}</td>
                <td className="px-3 py-2">{m.folio}</td>
                <td className="px-3 py-2">
                  {lot ? (
                    <Link href={`/lotes/${lot.id}`} className="text-emerald-700 hover:underline dark:text-emerald-400">
                      {lot.code}
                    </Link>
                  ) : (
                    "-"
                  )}
                </td>
                <td className="px-3 py-2 text-zinc-500">{formatDetail(m.newData)}</td>
              </tr>
              );
            })}
            {movements.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center text-zinc-500">
                  Sin movimientos registrados todavía.
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
