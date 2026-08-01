"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { optionalId } from "@/lib/validations/common";
import type { ActionResult } from "@/components/catalog/crud-table";

const schema = z.object({
  id: optionalId,
  name: z.string().trim().min(1, "El nombre es obligatorio."),
});

export async function upsertTamano(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  await requireSession();
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  const { id, ...data } = parsed.data;
  if (id) {
    await prisma.size.update({ where: { id }, data });
  } else {
    await prisma.size.create({ data: { ...data, status: "ACTIVO" } });
  }
  revalidatePath("/tamanos");
  return { ok: true };
}

export async function toggleTamanoStatus(id: number): Promise<ActionResult> {
  await requireSession();
  const size = await prisma.size.findUniqueOrThrow({ where: { id } });
  await prisma.size.update({ where: { id }, data: { status: size.status === "ACTIVO" ? "INACTIVO" : "ACTIVO" } });
  revalidatePath("/tamanos");
  return { ok: true };
}
