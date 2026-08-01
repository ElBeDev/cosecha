import { prisma } from "@/lib/prisma";
import { CrudTable, type CrudColumn } from "@/components/catalog/crud-table";
import { upsertProveedor, toggleProveedorStatus } from "@/server/actions/catalogos/proveedores";

type SupplierRow = {
  id: number;
  name: string;
  contact: string | null;
  phone: string | null;
  email: string | null;
  type: string;
  status: string;
};

const columns: CrudColumn<SupplierRow>[] = [
  { key: "name", label: "Nombre", type: "text", required: true },
  { key: "contact", label: "Contacto", type: "text" },
  { key: "phone", label: "Teléfono", type: "text" },
  { key: "email", label: "Correo", type: "text" },
  {
    key: "type",
    label: "Tipo",
    type: "select",
    required: true,
    options: [
      { value: "PRODUCCION_PROPIA", label: "Producción propia" },
      { value: "PRODUCTOR_EXTERNO", label: "Productor externo" },
      { value: "DISTRIBUIDOR", label: "Distribuidor" },
    ],
  },
];

export default async function ProveedoresPage() {
  const rows = await prisma.supplier.findMany({ orderBy: { name: "asc" } });
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Proveedores</h1>
      <CrudTable
        title="proveedor"
        columns={columns}
        rows={rows}
        createAction={upsertProveedor}
        updateAction={upsertProveedor}
        toggleStatusAction={toggleProveedorStatus}
      />
    </div>
  );
}
