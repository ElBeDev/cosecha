import Link from "next/link";
import { prisma } from "@/lib/prisma";

const REASON_LABELS: Record<string, string> = {
  DESHIDRATACION: "Deshidratación",
  DANO: "Daño",
  GOLPE: "Golpe",
  DESCOMPOSICION: "Descomposición",
  PRODUCTO_RECHAZADO: "Producto rechazado",
  DERRAME: "Derrame",
  DIFERENCIA_DE_PESO: "Diferencia de peso",
  ERROR_DE_CAPTURA: "Error de captura",
  OTRO: "Otro",
};

export default async function MermasPage() {
  const adjustments = await prisma.adjustment.findMany({
    include: { lot: { include: { product: true } }, operator: true, supervisor: true },
    orderBy: { datetime: "desc" },
    take: 200,
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Mermas y ajustes</h1>
          <p className="mt-1 text-sm text-latte-500">{adjustments.length} registro(s)</p>
        </div>
        <Link
          href="/mermas/nueva"
          className="rounded-md bg-amber-700 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-800"
        >
          Nueva merma
        </Link>
      </div>

      <div className="overflow-x-auto rounded-lg border border-latte-200 dark:border-latte-800">
        <table className="min-w-full divide-y divide-latte-200 text-sm dark:divide-latte-800">
          <thead className="bg-latte-50 dark:bg-latte-900">
            <tr className="text-left text-xs font-semibold uppercase text-latte-500">
              <th className="px-3 py-2">Folio</th>
              <th className="px-3 py-2">Fecha</th>
              <th className="px-3 py-2">Lote</th>
              <th className="px-3 py-2">Motivo</th>
              <th className="px-3 py-2 text-right">Antes</th>
              <th className="px-3 py-2 text-right">Después</th>
              <th className="px-3 py-2 text-right">Diferencia</th>
              <th className="px-3 py-2">Operador</th>
              <th className="px-3 py-2">Supervisor</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-latte-100 dark:divide-latte-800">
            {adjustments.map((a) => (
              <tr key={a.id}>
                <td className="px-3 py-2 font-medium">{a.folio}</td>
                <td className="px-3 py-2 whitespace-nowrap">{a.datetime.toLocaleString("es-MX")}</td>
                <td className="px-3 py-2">
                  <Link href={`/lotes/${a.lot.id}`} className="text-emerald-700 hover:underline dark:text-emerald-400">
                    {a.lot.code}
                  </Link>
                  <span className="text-latte-500"> · {a.lot.product.name}</span>
                </td>
                <td className="px-3 py-2">{REASON_LABELS[a.reason] ?? a.reason}</td>
                <td className="px-3 py-2 text-right">{a.weightBefore.toFixed(2)} kg</td>
                <td className="px-3 py-2 text-right">{a.weightAfter.toFixed(2)} kg</td>
                <td className="px-3 py-2 text-right text-amber-700 dark:text-amber-400">
                  −{a.difference.toFixed(2)} kg ({a.percentage.toFixed(1)}%)
                </td>
                <td className="px-3 py-2">{a.operator.name}</td>
                <td className="px-3 py-2">{a.supervisor?.name ?? "-"}</td>
              </tr>
            ))}
            {adjustments.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-3 py-6 text-center text-latte-500">
                  Sin mermas registradas todavía.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
