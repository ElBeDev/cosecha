import { prisma } from "@/lib/prisma";
import { CrudTable, type CrudColumn } from "@/components/catalog/crud-table";
import { upsertUsuario, toggleUsuarioStatus } from "@/server/actions/catalogos/usuarios";

type UserRow = { id: number; name: string; email: string; role: string; active: boolean };

const columns: CrudColumn<UserRow>[] = [
  { key: "name", label: "Nombre", type: "text", required: true },
  { key: "email", label: "Correo", type: "text", required: true },
  {
    key: "role",
    label: "Rol",
    type: "select",
    required: true,
    options: [
      { value: "ADMINISTRADOR", label: "Administrador" },
      { value: "SUPERVISOR", label: "Supervisor" },
      { value: "OPERADOR", label: "Operador" },
      { value: "CONSULTA", label: "Consulta" },
    ],
  },
];

export default async function UsuariosPage() {
  const rows = await prisma.user.findMany({ orderBy: { name: "asc" } });
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold">Usuarios</h1>
        <p className="mt-1 text-sm text-latte-500">
          Los usuarios nuevos se crean con la contraseña temporal <code>cosecha2026</code>.
        </p>
      </div>
      <CrudTable
        title="usuario"
        columns={columns}
        rows={rows}
        createAction={upsertUsuario}
        updateAction={upsertUsuario}
        toggleStatusAction={toggleUsuarioStatus}
      />
    </div>
  );
}
