import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { logoutAction } from "@/server/actions/auth";
import { CatalogNavDropdown } from "@/components/catalog-nav-dropdown";

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/entradas/nueva", label: "Nueva entrada" },
  { href: "/salidas/nueva", label: "Nueva salida" },
  { href: "/traslados/nuevo", label: "Traslados" },
  { href: "/mermas", label: "Mermas" },
  { href: "/inventario", label: "Inventario" },
  { href: "/movimientos", label: "Movimientos" },
  { href: "/reportes", label: "Reportes" },
];

const CATALOG_LINKS = [
  { href: "/productos", label: "Productos" },
  { href: "/tamanos", label: "Tamaños" },
  { href: "/calidades", label: "Calidades" },
  { href: "/proveedores", label: "Proveedores" },
  { href: "/almacenes", label: "Almacenes y ubicaciones" },
  { href: "/tarimas", label: "Tarimas" },
  { href: "/cajas", label: "Cajas" },
  { href: "/usuarios", label: "Usuarios" },
];

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-latte-200 bg-latte-50 dark:border-latte-800 dark:bg-latte-950">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-6">
            <span className="text-lg font-bold text-emerald-800 dark:text-emerald-400">+Cosecha</span>
            <nav className="flex flex-wrap items-center gap-4 text-sm">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-latte-600 hover:text-emerald-800 dark:text-latte-300 dark:hover:text-emerald-400"
                >
                  {link.label}
                </Link>
              ))}
              <CatalogNavDropdown links={CATALOG_LINKS} />
            </nav>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Link href="/perfil" className="text-latte-500 hover:text-emerald-800 dark:text-latte-400 dark:hover:text-emerald-400">
              {session.name} · {session.role}
            </Link>
            <form action={logoutAction}>
              <button
                type="submit"
                className="rounded-md border border-latte-300 px-3 py-1 text-latte-700 hover:bg-latte-100 dark:border-latte-700 dark:text-latte-200 dark:hover:bg-latte-900"
              >
                Salir
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">{children}</main>
    </div>
  );
}
