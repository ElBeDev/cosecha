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

export async function upsertCalidad(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  await requireSession();
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  const { id, ...data } = parsed.data;
  if (id) {
    await prisma.quality.update({ where: { id }, data });
  } else {
    await prisma.quality.create({ data: { ...data, status: "ACTIVO" } });
  }
  revalidatePath("/calidades");
  return { ok: true };
}

export async function toggleCalidadStatus(id: number): Promise<ActionResult> {
  await requireSession();
  const quality = await prisma.quality.findUniqueOrThrow({ where: { id } });
  await prisma.quality.update({
    where: { id },
    data: { status: quality.status === "ACTIVO" ? "INACTIVO" : "ACTIVO" },
  });
  revalidatePath("/calidades");
  return { ok: true };
}
