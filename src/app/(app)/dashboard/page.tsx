import Link from "next/link";
import { startOfDay, subDays, differenceInHours } from "date-fns";
import { prisma } from "@/lib/prisma";
import {
  InventarioPorProductoChart,
  EntradasVsSalidasChart,
  CategoryBarChart,
} from "@/components/dashboard-charts";

const ACTION_LABELS: Record<string, string> = {
  ENTRADA_CREADA: "Entrada registrada",
  SALIDA_CREADA: "Salida registrada",
  TRASLADO_CREADO: "Traslado registrado",
  MERMA_REGISTRADA: "Merma registrada",
};

function sumBy<T>(items: T[], key: (item: T) => string, value: (item: T) => number) {
  const map = new Map<string, number>();
  for (const item of items) {
    map.set(key(item), (map.get(key(item)) ?? 0) + value(item));
  }
  return [...map.entries()]
    .map(([label, value]) => ({ label, value }))
    .filter((d) => d.value > 0)
    .sort((a, b) => b.value - a.value);
}

export default async function DashboardPage() {
  const today = startOfDay(new Date());
  const sevenDaysAgo = subDays(today, 6);

  const [lots, entradasHoy, salidasHoy, mermasHoy, lotesActivos, movimientos, movimientosSemana, adjustments] =
    await Promise.all([
      prisma.lot.findMany({ include: { product: true, quality: true, size: true, warehouse: true } }),
      prisma.entry.findMany({ where: { datetime: { gte: today } } }),
      prisma.exit.findMany({ where: { datetime: { gte: today } } }),
      prisma.adjustment.findMany({ where: { datetime: { gte: today } } }),
      prisma.lot.count({ where: { status: { notIn: ["AGOTADO", "CANCELADO"] } } }),
      prisma.movementLog.findMany({ include: { user: true }, orderBy: { occurredAt: "desc" }, take: 5 }),
      prisma.movementLog.findMany({ where: { occurredAt: { gte: sevenDaysAgo } }, select: { occurredAt: true } }),
      prisma.adjustment.findMany({ include: { lot: { include: { product: true } } } }),
    ]);

  const inventarioTotalKg = lots.reduce((sum, l) => sum + l.availableWeight, 0);

  const inventarioPorProducto = sumBy(
    lots,
    (l) => l.product.name,
    (l) => l.availableWeight
  ).map((d) => ({ producto: d.label, kg: d.value }));

  const inventarioPorCalidad = sumBy(
    lots,
    (l) => l.quality.name,
    (l) => l.availableWeight
  );
  const inventarioPorTamano = sumBy(
    lots,
    (l) => l.size.name,
    (l) => l.availableWeight
  );
  const inventarioPorAlmacen = sumBy(
    lots,
    (l) => l.warehouse.name,
    (l) => l.availableWeight
  );
  const mermasPorProducto = sumBy(
    adjustments,
    (a) => a.lot.product.name,
    (a) => a.difference
  );

  const entradasKg = entradasHoy.reduce((s, e) => s + e.netWeight, 0);
  const salidasKg = salidasHoy.reduce((s, e) => s + e.netWeight, 0);
  const mermasKg = mermasHoy.reduce((s, a) => s + a.difference, 0);

  const activeLots = lots.filter((l) => l.availableWeight > 0);
  const antiguedadPromedioHoras = activeLots.length
    ? activeLots.reduce((s, l) => s + differenceInHours(new Date(), l.entryDatetime), 0) / activeLots.length
    : 0;

  const productosBajoInventario = inventarioPorProducto.filter((d) => {
    const product = lots.find((l) => l.product.name === d.producto)?.product;
    return product?.minWeight != null && d.kg < product.minWeight + 1 && product.minWeight > 0;
  });

  const movPorDiaMap = new Map<string, number>();
  for (let i = 0; i < 7; i++) {
    const day = subDays(today, 6 - i);
    movPorDiaMap.set(day.toLocaleDateString("es-MX", { day: "2-digit", month: "2-digit" }), 0);
  }
  for (const m of movimientosSemana) {
    const key = startOfDay(m.occurredAt).toLocaleDateString("es-MX", { day: "2-digit", month: "2-digit" });
    if (movPorDiaMap.has(key)) movPorDiaMap.set(key, (movPorDiaMap.get(key) ?? 0) + 1);
  }
  const movimientosPorDia = [...movPorDiaMap.entries()].map(([label, value]) => ({ label, value }));

  const movLotIds = [...new Set(movimientos.map((m) => m.lotId).filter((id): id is number => id !== null))];
  const movLots = movLotIds.length ? await prisma.lot.findMany({ where: { id: { in: movLotIds } } }) : [];
  const lotById = new Map(movLots.map((l) => [l.id, l]));

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Dashboard</h1>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <StatTile label="Inventario total" value={`${inventarioTotalKg.toFixed(1)} kg`} />
        <StatTile label="Entradas del día" value={`${entradasHoy.length}`} sub={`${entradasKg.toFixed(1)} kg`} />
        <StatTile label="Salidas del día" value={`${salidasHoy.length}`} sub={`${salidasKg.toFixed(1)} kg`} />
        <StatTile label="Mermas del día" value={`${mermasHoy.length}`} sub={`${mermasKg.toFixed(1)} kg`} />
        <StatTile label="Lotes activos" value={`${lotesActivos}`} />
        <StatTile label="Antigüedad promedio" value={`${(antiguedadPromedioHoras / 24).toFixed(1)} d`} sub={`${antiguedadPromedioHoras.toFixed(0)} h`} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Inventario disponible por producto">
          <InventarioPorProductoChart data={inventarioPorProducto} />
        </ChartCard>
        <ChartCard title="Entradas vs. salidas del día (kg)">
          <EntradasVsSalidasChart data={{ entradasKg, salidasKg }} />
        </ChartCard>
        <ChartCard title="Inventario por calidad">
          <CategoryBarChart data={inventarioPorCalidad} />
        </ChartCard>
        <ChartCard title="Inventario por tamaño">
          <CategoryBarChart data={inventarioPorTamano} />
        </ChartCard>
        <ChartCard title="Inventario por almacén">
          <CategoryBarChart data={inventarioPorAlmacen} />
        </ChartCard>
        <ChartCard title="Movimientos por día (últimos 7 días)">
          <CategoryBarChart data={movimientosPorDia} unit="mov." />
        </ChartCard>
        <ChartCard title="Mermas por producto (kg)">
          <CategoryBarChart data={mermasPorProducto} />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <ListCard title="Mayor inventario" items={inventarioPorProducto.slice(0, 3).map((d) => `${d.producto} — ${d.kg.toFixed(1)} kg`)} />
        <ListCard
          title="Menor inventario"
          items={[...inventarioPorProducto].slice(-3).reverse().map((d) => `${d.producto} — ${d.kg.toFixed(1)} kg`)}
        />
        <ListCard
          title="Inventario bajo"
          items={productosBajoInventario.length ? productosBajoInventario.map((d) => `${d.producto} — ${d.kg.toFixed(1)} kg`) : ["Ninguno"]}
        />
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

function ListCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
      <h3 className="mb-2 text-sm font-semibold text-zinc-700 dark:text-zinc-200">{title}</h3>
      <ul className="flex flex-col gap-1 text-sm text-zinc-600 dark:text-zinc-300">
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
