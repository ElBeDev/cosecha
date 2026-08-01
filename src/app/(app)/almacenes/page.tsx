import { prisma } from "@/lib/prisma";
import { CrudTable, type CrudColumn } from "@/components/catalog/crud-table";
import { upsertAlmacen, toggleAlmacenStatus, upsertUbicacion } from "@/server/actions/catalogos/almacenes";

type WarehouseRow = { id: number; name: string; type: string; capacity: number | null; status: string };
type LocationRow = { id: number; warehouseId: number; label: string; aisle: string | null; zone: string | null };

const warehouseColumns: CrudColumn<WarehouseRow>[] = [
  { key: "name", label: "Nombre", type: "text", required: true },
  {
    key: "type",
    label: "Tipo",
    type: "select",
    required: true,
    options: [
      { value: "BODEGA", label: "Bodega" },
      { value: "CAMARA_FRIA", label: "Cámara fría" },
      { value: "RECEPCION", label: "Área de recepción" },
      { value: "EMBARQUE", label: "Área de embarque" },
      { value: "MOSTRADOR", label: "Mostrador" },
    ],
  },
  { key: "capacity", label: "Capacidad aprox.", type: "number", step: "0.01" },
];

export default async function AlmacenesPage() {
  const [warehouses, locations] = await Promise.all([
    prisma.warehouse.findMany({ orderBy: { name: "asc" } }),
    prisma.location.findMany({ orderBy: { label: "asc" } }),
  ]);

  const locationColumns: CrudColumn<LocationRow>[] = [
    {
      key: "warehouseId",
      label: "Almacén",
      type: "select",
      required: true,
      options: warehouses.map((w) => ({ value: String(w.id), label: w.name })),
    },
    { key: "label", label: "Etiqueta", type: "text", required: true },
    { key: "aisle", label: "Pasillo", type: "text" },
    { key: "zone", label: "Zona", type: "text" },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-xl font-semibold">Almacenes</h1>
        <div className="mt-4">
          <CrudTable
            title="almacén"
            columns={warehouseColumns}
            rows={warehouses}
            createAction={upsertAlmacen}
            updateAction={upsertAlmacen}
            toggleStatusAction={toggleAlmacenStatus}
          />
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold">Ubicaciones</h2>
        <div className="mt-4">
          <CrudTable
            title="ubicación"
            columns={locationColumns}
            rows={locations}
            createAction={upsertUbicacion}
            updateAction={upsertUbicacion}
          />
        </div>
      </div>
    </div>
  );
}
