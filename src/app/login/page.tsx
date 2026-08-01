import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { LoginForm } from "@/components/forms/login-form";

export default async function LoginPage() {
  const session = await getSession();
  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 bg-latte-50 px-4 dark:bg-latte-950">
      <div className="flex flex-col items-center gap-1 text-center">
        <h1 className="text-2xl font-bold text-emerald-800 dark:text-emerald-400">+Cosecha</h1>
        <p className="text-sm text-latte-600 dark:text-latte-400">Demo de inventario y trazabilidad</p>
      </div>
      <LoginForm />
    </div>
  );
}
