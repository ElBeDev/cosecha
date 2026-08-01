import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { logoutAction } from "@/server/actions/auth";

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/entradas/nueva", label: "Nueva entrada" },
  { href: "/salidas/nueva", label: "Nueva salida" },
  { href: "/inventario", label: "Inventario" },
  { href: "/movimientos", label: "Movimientos" },
];

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-6">
            <span className="text-lg font-bold text-emerald-800 dark:text-emerald-400">+Cosecha</span>
            <nav className="flex flex-wrap gap-4 text-sm">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-zinc-600 hover:text-emerald-800 dark:text-zinc-300 dark:hover:text-emerald-400"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-zinc-500 dark:text-zinc-400">
              {session.name} · {session.role}
            </span>
            <form action={logoutAction}>
              <button
                type="submit"
                className="rounded-md border border-zinc-300 px-3 py-1 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
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
