import Link from "next/link";
import { getReporteDiario, getReporteSemanal, getReporteMensual } from "@/lib/reports";

const PERIODOS = [
  { value: "diario", label: "Diario" },
  { value: "semanal", label: "Semanal" },
  { value: "mensual", label: "Mensual" },
] as const;

export default async function ReportesPage({
  searchParams,
}: {
  searchParams: Promise<{ periodo?: string }>;
}) {
  const params = await searchParams;
  const periodo = (params.periodo as "diario" | "semanal" | "mensual") ?? "diario";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Reportes</h1>
          <p className="mt-1 text-sm text-zinc-500">Diario, semanal y mensual, con exportación a Excel e impresión.</p>
        </div>
        <div className="flex gap-2">
          <a
            href={`/api/reportes/excel?periodo=${periodo}`}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
          >
            Descargar Excel
          </a>
          <Link
            href={`/reportes/imprimir?periodo=${periodo}`}
            target="_blank"
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
          >
            Imprimir / PDF
          </Link>
        </div>
      </div>

      <div className="flex gap-2">
        {PERIODOS.map((p) => (
          <Link
            key={p.value}
            href={`/reportes?periodo=${p.value}`}
            className={`rounded-md px-4 py-2 text-sm font-medium ${
              periodo === p.value
                ? "bg-emerald-700 text-white"
                : "border border-zinc-300 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
            }`}
          >
            {p.label}
          </Link>
        ))}
      </div>

      {periodo === "diario" ? <ReporteDiarioView /> : null}
      {periodo === "semanal" ? <ReporteSemanalView /> : null}
      {periodo === "mensual" ? <ReporteMensualView /> : null}
    </div>
  );
}

async function ReporteDiarioView() {
  const r = await getReporteDiario();
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-zinc-500">Fecha: {r.fecha.toLocaleDateString("es-MX")}</p>
      <KeyValueTable
        rows={[
          ["Entradas", `${r.entradas.count} (${r.entradas.kg.toFixed(2)} kg)`],
          ["Salidas", `${r.salidas.count} (${r.salidas.kg.toFixed(2)} kg)`],
          ["Mermas", `${r.mermas.count} (${r.mermas.kg.toFixed(2)} kg)`],
          ["Inventario inicial", `${r.inventarioInicial.toFixed(2)} kg`],
          ["Inventario final", `${r.inventarioFinal.toFixed(2)} kg`],
        ]}
      />
      <SimpleTable
        title="Movimientos por operador"
        headers={["Operador", "Movimientos"]}
        rows={r.movimientosPorOperador.map((d) => [d.label, String(d.value)])}
      />
    </div>
  );
}

async function ReporteSemanalView() {
  const r = await getReporteSemanal();
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-zinc-500">Desde: {r.desde.toLocaleDateString("es-MX")}</p>
      <KeyValueTable
        rows={[
          ["Entradas acumuladas", `${r.entradasAcumuladas.count} (${r.entradasAcumuladas.kg.toFixed(2)} kg)`],
          ["Salidas acumuladas", `${r.salidasAcumuladas.count} (${r.salidasAcumuladas.kg.toFixed(2)} kg)`],
          ["Diferencia de inventario", `${r.diferenciaInventario.toFixed(2)} kg`],
          ["Lotes activos", String(r.lotesActivos)],
        ]}
      />
      <SimpleTable
        title="Productos con mayor movimiento"
        headers={["Producto", "kg movidos"]}
        rows={r.productosConMayorMovimiento.map((d) => [d.label, d.value.toFixed(2)])}
      />
    </div>
  );
}

async function ReporteMensualView() {
  const r = await getReporteMensual();
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-zinc-500">Desde: {r.desde.toLocaleDateString("es-MX")}</p>
      <KeyValueTable
        rows={[
          ["Inventario promedio por lote", `${r.inventarioPromedioPorLote.toFixed(2)} kg`],
          ["Mermas", `${r.mermas.count} (${r.mermas.kg.toFixed(2)} kg)`],
        ]}
      />
      <SimpleTable
        title="Movimientos por producto"
        headers={["Producto", "Movimientos"]}
        rows={r.movimientosPorProducto.map((d) => [d.label, String(d.value)])}
      />
      <SimpleTable
        title="Proveedores con mayor volumen"
        headers={["Proveedor", "kg recibidos"]}
        rows={r.proveedoresConMayorVolumen.map((d) => [d.label, d.value.toFixed(2)])}
      />
      <SimpleTable
        title="Operadores con mayor actividad"
        headers={["Operador", "Movimientos"]}
        rows={r.operadoresConMayorActividad.map((d) => [d.label, String(d.value)])}
      />
    </div>
  );
}

function KeyValueTable({ rows }: { rows: [string, string][] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
      <table className="min-w-full divide-y divide-zinc-200 text-sm dark:divide-zinc-800">
        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {rows.map(([label, value]) => (
            <tr key={label}>
              <td className="w-64 px-3 py-2 text-zinc-500">{label}</td>
              <td className="px-3 py-2 font-medium">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SimpleTable({ title, headers, rows }: { title: string; headers: string[]; rows: string[][] }) {
  return (
    <div>
      <h2 className="mb-2 text-base font-semibold">{title}</h2>
      <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
        <table className="min-w-full divide-y divide-zinc-200 text-sm dark:divide-zinc-800">
          <thead className="bg-zinc-50 dark:bg-zinc-900">
            <tr className="text-left text-xs font-semibold uppercase text-zinc-500">
              {headers.map((h) => (
                <th key={h} className="px-3 py-2">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {rows.map((row, i) => (
              <tr key={i}>
                {row.map((cell, j) => (
                  <td key={j} className="px-3 py-2">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
            {rows.length === 0 ? (
              <tr>
                <td colSpan={headers.length} className="px-3 py-4 text-center text-zinc-500">
                  Sin datos en este periodo.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
