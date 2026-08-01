import { prisma } from "@/lib/prisma";
import { CrudTable, type CrudColumn } from "@/components/catalog/crud-table";
import { upsertTarima, toggleTarimaStatus } from "@/server/actions/catalogos/tarimas";

type TarimaRow = {
  id: number;
  code: string;
  type: string;
  tareWeight: number;
  maxCapacity: number | null;
  status: string;
};

const columns: CrudColumn<TarimaRow>[] = [
  { key: "code", label: "Código", type: "text", required: true },
  {
    key: "type",
    label: "Tipo",
    type: "select",
    required: true,
    options: [
      { value: "MADERA", label: "Madera" },
      { value: "PLASTICO", label: "Plástico" },
      { value: "METALICA", label: "Metálica" },
    ],
  },
  { key: "tareWeight", label: "Peso de tara (kg)", type: "number", step: "0.01", required: true },
  { key: "maxCapacity", label: "Capacidad máxima (kg)", type: "number", step: "0.01" },
];

export default async function TarimasPage() {
  const rows = await prisma.tarimaType.findMany({ orderBy: { code: "asc" } });
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Tarimas</h1>
      <CrudTable
        title="tarima"
        columns={columns}
        rows={rows}
        createAction={upsertTarima}
        updateAction={upsertTarima}
        toggleStatusAction={toggleTarimaStatus}
      />
    </div>
  );
}
