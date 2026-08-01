"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession, destroySession } from "@/lib/session";

export type LoginState = { error: string; email: string } | null;

export async function loginAction(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Ingresa correo y contraseña.", email };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.active) {
    return { error: "Credenciales inválidas.", email };
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return { error: "Credenciales inválidas.", email };
  }

  await createSession({ userId: user.id, role: user.role, name: user.name });
  redirect("/dashboard");
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}
