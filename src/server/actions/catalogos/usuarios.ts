"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { optionalId } from "@/lib/validations/common";
import type { ActionResult } from "@/components/catalog/crud-table";

const schema = z.object({
  id: optionalId,
  name: z.string().trim().min(1, "El nombre es obligatorio."),
  email: z.string().trim().toLowerCase().email("Correo inválido."),
  role: z.enum(["ADMINISTRADOR", "SUPERVISOR", "OPERADOR", "CONSULTA"]),
});

const TEMP_PASSWORD = "cosecha2026";

export async function upsertUsuario(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  await requireSession();
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  const { id, ...data } = parsed.data;
  try {
    if (id) {
      await prisma.user.update({ where: { id }, data });
    } else {
      const passwordHash = await bcrypt.hash(TEMP_PASSWORD, 10);
      await prisma.user.create({ data: { ...data, passwordHash, active: true } });
    }
  } catch {
    return { ok: false, error: "No se pudo guardar (¿correo duplicado?)." };
  }
  revalidatePath("/usuarios");
  return { ok: true };
}

export async function toggleUsuarioStatus(id: number): Promise<ActionResult> {
  await requireSession();
  const user = await prisma.user.findUniqueOrThrow({ where: { id } });
  await prisma.user.update({ where: { id }, data: { active: !user.active } });
  revalidatePath("/usuarios");
  return { ok: true };
}
