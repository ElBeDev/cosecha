import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function LoteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lotId = Number(id);
  if (Number.isNaN(lotId)) notFound();

  const lot = await prisma.lot.findUnique({
    where: { id: lotId },
    include: {
      product: true,
      size: true,
      quality: true,
      supplier: true,
      warehouse: true,
      location: true,
      operator: true,
      entry: { include: { scale: true, tarimaType: true, cajaType: true } },
      exits: { include: { operator: true, scale: true }, orderBy: { datetime: "desc" } },
      transfers: {
        include: { operator: true, fromWarehouse: true, toWarehouse: true, fromLocation: true, toLocation: true },
        orderBy: { datetime: "desc" },
      },
      adjustments: { include: { operator: true, supervisor: true }, orderBy: { datetime: "desc" } },
    },
  });

  if (!lot) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Lote {lot.code}</h1>
          <p className="mt-1 text-sm text-latte-500">
            {lot.product.name} · {lot.size.name} / {lot.quality.name}
          </p>
        </div>
        <Link href="/inventario" className="text-sm text-emerald-700 hover:underline dark:text-emerald-400">
          Volver a inventario
        </Link>
      </div>

      <section className="grid grid-cols-2 gap-x-6 gap-y-2 rounded-lg border border-latte-200 p-4 text-sm dark:border-latte-800 sm:grid-cols-3">
        <Info label="Estatus" value={lot.status} />
        <Info label="Proveedor" value={lot.supplier.name} />
        <Info label="Origen" value={lot.origin ?? "-"} />
        <Info label="Fecha de cosecha" value={lot.harvestDate ? lot.harvestDate.toLocaleDateString("es-MX") : "-"} />
        <Info label="Fecha de entrada" value={lot.entryDatetime.toLocaleString("es-MX")} />
        <Info label="Operador" value={lot.operator.name} />
        <Info label="Almacén" value={lot.warehouse.name} />
        <Info label="Ubicación" value={lot.location?.label ?? "-"} />
        <Info label="Peso inicial" value={`${lot.initialWeight.toFixed(2)} kg`} />
        <Info label="Peso disponible" value={`${lot.availableWeight.toFixed(2)} kg`} />
        <Info
          label="Peso retirado"
          value={`${(lot.initialWeight - lot.availableWeight).toFixed(2)} kg`}
        />
      </section>

      {lot.entry ? (
        <section>
          <h2 className="mb-2 text-base font-semibold">Entrada de origen</h2>
          <div className="overflow-x-auto rounded-lg border border-latte-200 dark:border-latte-800">
            <table className="min-w-full divide-y divide-latte-200 text-sm dark:divide-latte-800">
              <tbody className="divide-y divide-latte-100 dark:divide-latte-800">
                <Row label="Folio" value={lot.entry.folio} />
                <Row label="Báscula" value={lot.entry.scale.name} />
                <Row label="Peso bruto" value={`${lot.entry.grossWeight.toFixed(2)} kg`} />
                <Row label="Tarima" value={lot.entry.tarimaType ? `${lot.entry.tarimaType.code} (${lot.entry.palletTare} kg)` : "-"} />
                <Row
                  label="Cajas"
                  value={
                    lot.entry.cajaType
                      ? `${lot.entry.boxCount} × ${lot.entry.cajaType.name} (${lot.entry.boxesTare} kg)`
                      : "-"
                  }
                />
                <Row label="Tara adicional" value={`${lot.entry.additionalTare} kg`} />
                <Row label="Peso neto" value={`${lot.entry.netWeight.toFixed(2)} kg`} />
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <section>
        <h2 className="mb-2 text-base font-semibold">Salidas ({lot.exits.length})</h2>
        {lot.exits.length === 0 ? (
          <p className="text-sm text-latte-500">Este lote todavía no tiene salidas registradas.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-latte-200 dark:border-latte-800">
            <table className="min-w-full divide-y divide-latte-200 text-sm dark:divide-latte-800">
              <thead className="bg-latte-50 dark:bg-latte-900">
                <tr className="text-left text-xs font-semibold uppercase text-latte-500">
                  <th className="px-3 py-2">Folio</th>
                  <th className="px-3 py-2">Fecha</th>
                  <th className="px-3 py-2">Tipo</th>
                  <th className="px-3 py-2">Modalidad</th>
                  <th className="px-3 py-2">Operador</th>
                  <th className="px-3 py-2 text-right">Peso neto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-latte-100 dark:divide-latte-800">
                {lot.exits.map((exit) => (
                  <tr key={exit.id}>
                    <td className="px-3 py-2 font-medium">{exit.folio}</td>
                    <td className="px-3 py-2">{exit.datetime.toLocaleString("es-MX")}</td>
                    <td className="px-3 py-2">{exit.exitType}</td>
                    <td className="px-3 py-2">{exit.exitMode}</td>
                    <td className="px-3 py-2">{exit.operator.name}</td>
                    <td className="px-3 py-2 text-right">{exit.netWeight.toFixed(2)} kg</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-2 text-base font-semibold">Traslados ({lot.transfers.length})</h2>
        {lot.transfers.length === 0 ? (
          <p className="text-sm text-latte-500">Este lote todavía no tiene traslados registrados.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-latte-200 dark:border-latte-800">
            <table className="min-w-full divide-y divide-latte-200 text-sm dark:divide-latte-800">
              <thead className="bg-latte-50 dark:bg-latte-900">
                <tr className="text-left text-xs font-semibold uppercase text-latte-500">
                  <th className="px-3 py-2">Folio</th>
                  <th className="px-3 py-2">Fecha</th>
                  <th className="px-3 py-2">De</th>
                  <th className="px-3 py-2">A</th>
                  <th className="px-3 py-2">Operador</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-latte-100 dark:divide-latte-800">
                {lot.transfers.map((t) => (
                  <tr key={t.id}>
                    <td className="px-3 py-2 font-medium">{t.folio}</td>
                    <td className="px-3 py-2">{t.datetime.toLocaleString("es-MX")}</td>
                    <td className="px-3 py-2">
                      {t.fromWarehouse.name}
                      {t.fromLocation ? ` · ${t.fromLocation.label}` : ""}
                    </td>
                    <td className="px-3 py-2">
                      {t.toWarehouse.name}
                      {t.toLocation ? ` · ${t.toLocation.label}` : ""}
                    </td>
                    <td className="px-3 py-2">{t.operator.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-2 text-base font-semibold">Mermas y ajustes ({lot.adjustments.length})</h2>
        {lot.adjustments.length === 0 ? (
          <p className="text-sm text-latte-500">Este lote todavía no tiene mermas registradas.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-latte-200 dark:border-latte-800">
            <table className="min-w-full divide-y divide-latte-200 text-sm dark:divide-latte-800">
              <thead className="bg-latte-50 dark:bg-latte-900">
                <tr className="text-left text-xs font-semibold uppercase text-latte-500">
                  <th className="px-3 py-2">Folio</th>
                  <th className="px-3 py-2">Fecha</th>
                  <th className="px-3 py-2">Motivo</th>
                  <th className="px-3 py-2 text-right">Diferencia</th>
                  <th className="px-3 py-2">Operador</th>
                  <th className="px-3 py-2">Supervisor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-latte-100 dark:divide-latte-800">
                {lot.adjustments.map((a) => (
                  <tr key={a.id}>
                    <td className="px-3 py-2 font-medium">{a.folio}</td>
                    <td className="px-3 py-2">{a.datetime.toLocaleString("es-MX")}</td>
                    <td className="px-3 py-2">{a.reason}</td>
                    <td className="px-3 py-2 text-right">
                      −{a.difference.toFixed(2)} kg ({a.percentage.toFixed(1)}%)
                    </td>
                    <td className="px-3 py-2">{a.operator.name}</td>
                    <td className="px-3 py-2">{a.supervisor?.name ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-xs text-latte-500">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <tr>
      <td className="w-48 px-3 py-2 text-latte-500">{label}</td>
      <td className="px-3 py-2 font-medium">{value}</td>
    </tr>
  );
}
