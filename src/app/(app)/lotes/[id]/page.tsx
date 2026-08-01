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
    },
  });

  if (!lot) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Lote {lot.code}</h1>
          <p className="mt-1 text-sm text-zinc-500">
            {lot.product.name} · {lot.size.name} / {lot.quality.name}
          </p>
        </div>
        <Link href="/inventario" className="text-sm text-emerald-700 hover:underline dark:text-emerald-400">
          Volver a inventario
        </Link>
      </div>

      <section className="grid grid-cols-2 gap-x-6 gap-y-2 rounded-lg border border-zinc-200 p-4 text-sm dark:border-zinc-800 sm:grid-cols-3">
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
          <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
            <table className="min-w-full divide-y divide-zinc-200 text-sm dark:divide-zinc-800">
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
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
          <p className="text-sm text-zinc-500">Este lote todavía no tiene salidas registradas.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
            <table className="min-w-full divide-y divide-zinc-200 text-sm dark:divide-zinc-800">
              <thead className="bg-zinc-50 dark:bg-zinc-900">
                <tr className="text-left text-xs font-semibold uppercase text-zinc-500">
                  <th className="px-3 py-2">Folio</th>
                  <th className="px-3 py-2">Fecha</th>
                  <th className="px-3 py-2">Tipo</th>
                  <th className="px-3 py-2">Modalidad</th>
                  <th className="px-3 py-2">Operador</th>
                  <th className="px-3 py-2 text-right">Peso neto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
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
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-xs text-zinc-500">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <tr>
      <td className="w-48 px-3 py-2 text-zinc-500">{label}</td>
      <td className="px-3 py-2 font-medium">{value}</td>
    </tr>
  );
}
