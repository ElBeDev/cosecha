import { prisma } from "@/lib/prisma";
import { CrudTable, type CrudColumn } from "@/components/catalog/crud-table";
import { upsertTamano, toggleTamanoStatus } from "@/server/actions/catalogos/tamanos";

type SizeRow = { id: number; name: string; status: string };

const columns: CrudColumn<SizeRow>[] = [{ key: "name", label: "Nombre", type: "text", required: true }];

export default async function TamanosPage() {
  const rows = await prisma.size.findMany({ orderBy: { id: "asc" } });
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Tamaños</h1>
      <CrudTable
        title="tamaño"
        columns={columns}
        rows={rows}
        createAction={upsertTamano}
        updateAction={upsertTamano}
        toggleStatusAction={toggleTamanoStatus}
      />
    </div>
  );
}
