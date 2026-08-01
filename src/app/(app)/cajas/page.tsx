import { prisma } from "@/lib/prisma";
import { CrudTable, type CrudColumn } from "@/components/catalog/crud-table";
import { upsertCaja, toggleCajaStatus } from "@/server/actions/catalogos/cajas";

type CajaRow = {
  id: number;
  code: string;
  name: string;
  tareWeight: number;
  maxCapacity: number | null;
  status: string;
};

const columns: CrudColumn<CajaRow>[] = [
  { key: "code", label: "Código", type: "text", required: true },
  { key: "name", label: "Nombre", type: "text", required: true },
  { key: "tareWeight", label: "Peso de tara (kg)", type: "number", step: "0.01", required: true },
  { key: "maxCapacity", label: "Capacidad máxima (kg)", type: "number", step: "0.01" },
];

export default async function CajasPage() {
  const rows = await prisma.cajaType.findMany({ orderBy: { code: "asc" } });
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Cajas</h1>
      <CrudTable
        title="caja"
        columns={columns}
        rows={rows}
        createAction={upsertCaja}
        updateAction={upsertCaja}
        toggleStatusAction={toggleCajaStatus}
      />
    </div>
  );
}
