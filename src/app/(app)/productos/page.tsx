import { prisma } from "@/lib/prisma";
import { CrudTable, type CrudColumn } from "@/components/catalog/crud-table";
import { upsertProducto, toggleProductoStatus } from "@/server/actions/catalogos/productos";

type ProductRow = {
  id: number;
  code: string;
  name: string;
  category: string | null;
  unit: string;
  minWeight: number | null;
  maxWeight: number | null;
  notes: string | null;
  status: string;
};

const columns: CrudColumn<ProductRow>[] = [
  { key: "code", label: "Código", type: "text", required: true },
  { key: "name", label: "Nombre", type: "text", required: true },
  { key: "category", label: "Categoría", type: "text" },
  {
    key: "unit",
    label: "Unidad",
    type: "select",
    required: true,
    options: [
      { value: "KG", label: "Kilogramos" },
      { value: "CAJA", label: "Caja" },
      { value: "PIEZA", label: "Pieza" },
      { value: "TARIMA", label: "Tarima" },
    ],
  },
  { key: "minWeight", label: "Peso mínimo", type: "number", step: "0.01" },
  { key: "maxWeight", label: "Peso máximo", type: "number", step: "0.01" },
  { key: "notes", label: "Observaciones", type: "text" },
];

export default async function ProductosPage() {
  const rows = await prisma.product.findMany({ orderBy: { name: "asc" } });
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Productos</h1>
      <CrudTable
        title="producto"
        columns={columns}
        rows={rows}
        createAction={upsertProducto}
        updateAction={upsertProducto}
        toggleStatusAction={toggleProductoStatus}
      />
    </div>
  );
}
