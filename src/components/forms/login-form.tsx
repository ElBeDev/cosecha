"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "@/server/actions/auth";

const DEMO_USERS = [
  { email: "operador1@cosecha.local", label: "Operador 1" },
  { email: "operador2@cosecha.local", label: "Operador 2" },
  { email: "supervisor@cosecha.local", label: "Supervisor" },
  { email: "admin@cosecha.local", label: "Administrador" },
  { email: "consulta@cosecha.local", label: "Consulta" },
];

export function LoginForm() {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(loginAction, null);

  return (
    <form action={formAction} className="flex w-full max-w-sm flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-sm font-medium text-latte-700 dark:text-latte-300">
          Correo
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="username"
          list="demo-users"
          defaultValue={state?.email ?? ""}
          className="rounded-md border border-latte-300 px-3 py-2 text-sm outline-none focus:border-latte-500 dark:border-latte-700 dark:bg-latte-900"
          placeholder="operador1@cosecha.local"
        />
        <datalist id="demo-users">
          {DEMO_USERS.map((u) => (
            <option key={u.email} value={u.email}>
              {u.label}
            </option>
          ))}
        </datalist>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="text-sm font-medium text-latte-700 dark:text-latte-300">
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="rounded-md border border-latte-300 px-3 py-2 text-sm outline-none focus:border-latte-500 dark:border-latte-700 dark:bg-latte-900"
          placeholder="cosecha2026"
        />
      </div>

      {state?.error ? (
        <p className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60"
      >
        {pending ? "Ingresando..." : "Ingresar"}
      </button>

      <p className="text-xs text-latte-500 dark:text-latte-400">
        Demo: cualquier usuario de la lista, contraseña <code>cosecha2026</code>.
      </p>
    </form>
  );
}
