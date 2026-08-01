import Link from "next/link";
import { startOfDay } from "date-fns";
import { prisma } from "@/lib/prisma";
import { InventarioPorProductoChart, EntradasVsSalidasChart } from "@/components/dashboard-charts";

const ACTION_LABELS: Record<string, string> = {
  ENTRADA_CREADA: "Entrada registrada",
  SALIDA_CREADA: "Salida registrada",
};

export default async function DashboardPage() {
  const today = startOfDay(new Date());

  const [lots, entradasHoy, salidasHoy, lotesActivos, movimientos] = await Promise.all([
    prisma.lot.findMany({ include: { product: true } }),
    prisma.entry.findMany({ where: { datetime: { gte: today } } }),
    prisma.exit.findMany({ where: { datetime: { gte: today } } }),
    prisma.lot.count({ where: { status: { notIn: ["AGOTADO", "CANCELADO"] } } }),
    prisma.movementLog.findMany({ include: { user: true }, orderBy: { occurredAt: "desc" }, take: 5 }),
  ]);

  const inventarioTotalKg = lots.reduce((sum, l) => sum + l.availableWeight, 0);

  const porProducto = new Map<string, number>();
  for (const lot of lots) {
    porProducto.set(lot.product.name, (porProducto.get(lot.product.name) ?? 0) + lot.availableWeight);
  }
  const inventarioPorProducto = [...porProducto.entries()]
    .map(([producto, kg]) => ({ producto, kg }))
    .filter((d) => d.kg > 0)
    .sort((a, b) => b.kg - a.kg);

  const entradasKg = entradasHoy.reduce((s, e) => s + e.netWeight, 0);
  const salidasKg = salidasHoy.reduce((s, e) => s + e.netWeight, 0);

  const movLotIds = [...new Set(movimientos.map((m) => m.lotId).filter((id): id is number => id !== null))];
  const movLots = movLotIds.length ? await prisma.lot.findMany({ where: { id: { in: movLotIds } } }) : [];
  const lotById = new Map(movLots.map((l) => [l.id, l]));

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Dashboard</h1>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatTile label="Inventario total" value={`${inventarioTotalKg.toFixed(1)} kg`} />
        <StatTile label="Entradas del día" value={`${entradasHoy.length}`} sub={`${entradasKg.toFixed(1)} kg`} />
        <StatTile label="Salidas del día" value={`${salidasHoy.length}`} sub={`${salidasKg.toFixed(1)} kg`} />
        <StatTile label="Lotes activos" value={`${lotesActivos}`} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Inventario disponible por producto">
          <InventarioPorProductoChart data={inventarioPorProducto} />
        </ChartCard>
        <ChartCard title="Entradas vs. salidas del día (kg)">
          <EntradasVsSalidasChart data={{ entradasKg, salidasKg }} />
        </ChartCard>
      </div>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-base font-semibold">Últimos movimientos</h2>
          <Link href="/movimientos" className="text-sm text-emerald-700 hover:underline dark:text-emerald-400">
            Ver todos
          </Link>
        </div>
        <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
          <table className="min-w-full divide-y divide-zinc-200 text-sm dark:divide-zinc-800">
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {movimientos.map((m) => {
                const lot = m.lotId ? lotById.get(m.lotId) : undefined;
                return (
                  <tr key={m.id}>
                    <td className="px-3 py-2 whitespace-nowrap text-zinc-500">{m.occurredAt.toLocaleString("es-MX")}</td>
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
                  </tr>
                );
              })}
              {movimientos.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-zinc-500">
                    Sin movimientos todavía.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function StatTile({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold" style={{ fontVariantNumeric: "proportional-nums" }}>
        {value}
      </p>
      {sub ? <p className="text-xs text-zinc-500">{sub}</p> : null}
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
      <h3 className="mb-2 text-sm font-semibold text-zinc-700 dark:text-zinc-200">{title}</h3>
      {children}
    </div>
  );
}
