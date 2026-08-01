import { prisma } from "@/lib/prisma";
import { CrudTable, type CrudColumn } from "@/components/catalog/crud-table";
import { upsertCalidad, toggleCalidadStatus } from "@/server/actions/catalogos/calidades";

type QualityRow = { id: number; name: string; status: string };

const columns: CrudColumn<QualityRow>[] = [{ key: "name", label: "Nombre", type: "text", required: true }];

export default async function CalidadesPage() {
  const rows = await prisma.quality.findMany({ orderBy: { id: "asc" } });
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Calidades</h1>
      <CrudTable
        title="calidad"
        columns={columns}
        rows={rows}
        createAction={upsertCalidad}
        updateAction={upsertCalidad}
        toggleStatusAction={toggleCalidadStatus}
      />
    </div>
  );
}
