import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { getReporteDiario, getReporteSemanal, getReporteMensual } from "@/lib/reports";
import { PrintButton } from "@/components/print-button";

const PERIODO_LABELS: Record<string, string> = { diario: "Diario", semanal: "Semanal", mensual: "Mensual" };

export default async function ImprimirReportePage({
  searchParams,
}: {
  searchParams: Promise<{ periodo?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const params = await searchParams;
  const periodo = (params.periodo as "diario" | "semanal" | "mensual") ?? "diario";

  return (
    <div className="mx-auto max-w-3xl px-6 py-8 text-black">
      <div className="mb-6 flex items-center justify-between print:hidden">
        <span className="text-sm text-zinc-500">Vista de impresión</span>
        <PrintButton />
      </div>

      <h1 className="text-2xl font-bold">+Cosecha — Reporte {PERIODO_LABELS[periodo] ?? periodo}</h1>
      <p className="mt-1 text-sm text-zinc-600">Generado: {new Date().toLocaleString("es-MX")}</p>

      <div className="mt-6">
        {periodo === "diario" ? <Diario /> : null}
        {periodo === "semanal" ? <Semanal /> : null}
        {periodo === "mensual" ? <Mensual /> : null}
      </div>
    </div>
  );
}

async function Diario() {
  const r = await getReporteDiario();
  return (
    <div className="flex flex-col gap-4">
      <p>Fecha: {r.fecha.toLocaleDateString("es-MX")}</p>
      <Table
        rows={[
          ["Entradas", `${r.entradas.count} (${r.entradas.kg.toFixed(2)} kg)`],
          ["Salidas", `${r.salidas.count} (${r.salidas.kg.toFixed(2)} kg)`],
          ["Mermas", `${r.mermas.count} (${r.mermas.kg.toFixed(2)} kg)`],
          ["Inventario inicial", `${r.inventarioInicial.toFixed(2)} kg`],
          ["Inventario final", `${r.inventarioFinal.toFixed(2)} kg`],
        ]}
      />
      <h2 className="mt-2 font-semibold">Movimientos por operador</h2>
      <List items={r.movimientosPorOperador.map((d) => `${d.label}: ${d.value}`)} />
    </div>
  );
}

async function Semanal() {
  const r = await getReporteSemanal();
  return (
    <div className="flex flex-col gap-4">
      <p>Desde: {r.desde.toLocaleDateString("es-MX")}</p>
      <Table
        rows={[
          ["Entradas acumuladas", `${r.entradasAcumuladas.count} (${r.entradasAcumuladas.kg.toFixed(2)} kg)`],
          ["Salidas acumuladas", `${r.salidasAcumuladas.count} (${r.salidasAcumuladas.kg.toFixed(2)} kg)`],
          ["Diferencia de inventario", `${r.diferenciaInventario.toFixed(2)} kg`],
          ["Lotes activos", String(r.lotesActivos)],
        ]}
      />
      <h2 className="mt-2 font-semibold">Productos con mayor movimiento</h2>
      <List items={r.productosConMayorMovimiento.map((d) => `${d.label}: ${d.value.toFixed(2)} kg`)} />
    </div>
  );
}

async function Mensual() {
  const r = await getReporteMensual();
  return (
    <div className="flex flex-col gap-4">
      <p>Desde: {r.desde.toLocaleDateString("es-MX")}</p>
      <Table
        rows={[
          ["Inventario promedio por lote", `${r.inventarioPromedioPorLote.toFixed(2)} kg`],
          ["Mermas", `${r.mermas.count} (${r.mermas.kg.toFixed(2)} kg)`],
        ]}
      />
      <h2 className="mt-2 font-semibold">Movimientos por producto</h2>
      <List items={r.movimientosPorProducto.map((d) => `${d.label}: ${d.value}`)} />
      <h2 className="mt-2 font-semibold">Proveedores con mayor volumen</h2>
      <List items={r.proveedoresConMayorVolumen.map((d) => `${d.label}: ${d.value.toFixed(2)} kg`)} />
      <h2 className="mt-2 font-semibold">Operadores con mayor actividad</h2>
      <List items={r.operadoresConMayorActividad.map((d) => `${d.label}: ${d.value}`)} />
    </div>
  );
}

function Table({ rows }: { rows: [string, string][] }) {
  return (
    <table className="w-full border-collapse text-sm">
      <tbody>
        {rows.map(([label, value]) => (
          <tr key={label} className="border-b border-zinc-300">
            <td className="py-1.5 pr-4 text-zinc-600">{label}</td>
            <td className="py-1.5 font-medium">{value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function List({ items }: { items: string[] }) {
  if (items.length === 0) return <p className="text-sm text-zinc-500">Sin datos en este periodo.</p>;
  return (
    <ul className="list-disc pl-5 text-sm">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}
