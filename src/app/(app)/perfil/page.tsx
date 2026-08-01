import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

const ROLE_LABELS: Record<string, string> = {
  ADMINISTRADOR: "Administrador",
  SUPERVISOR: "Supervisor",
  OPERADOR: "Operador",
  CONSULTA: "Usuario de consulta",
};

export default async function PerfilPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Perfil</h1>
      <dl className="max-w-sm rounded-lg border border-zinc-200 p-4 text-sm dark:border-zinc-800">
        <div className="flex justify-between py-1.5">
          <dt className="text-zinc-500">Nombre</dt>
          <dd className="font-medium">{session.name}</dd>
        </div>
        <div className="flex justify-between py-1.5">
          <dt className="text-zinc-500">Rol</dt>
          <dd className="font-medium">{ROLE_LABELS[session.role] ?? session.role}</dd>
        </div>
      </dl>
    </div>
  );
}
