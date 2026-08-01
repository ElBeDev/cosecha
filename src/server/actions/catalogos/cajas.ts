"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { optionalId, optionalNumber } from "@/lib/validations/common";
import type { ActionResult } from "@/components/catalog/crud-table";

const schema = z.object({
  id: optionalId,
  code: z.string().trim().min(1, "El código es obligatorio.").transform((v) => v.toUpperCase()),
  name: z.string().trim().min(1, "El nombre es obligatorio."),
  tareWeight: z.coerce.number().min(0, "La tara debe ser mayor o igual a cero."),
  maxCapacity: optionalNumber,
});

export async function upsertCaja(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  await requireSession();
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  const { id, ...data } = parsed.data;
  try {
    if (id) {
      await prisma.cajaType.update({ where: { id }, data });
    } else {
      await prisma.cajaType.create({ data: { ...data, status: "ACTIVO" } });
    }
  } catch {
    return { ok: false, error: "No se pudo guardar (¿código duplicado?)." };
  }
  revalidatePath("/cajas");
  return { ok: true };
}

export async function toggleCajaStatus(id: number): Promise<ActionResult> {
  await requireSession();
  const caja = await prisma.cajaType.findUniqueOrThrow({ where: { id } });
  await prisma.cajaType.update({
    where: { id },
    data: { status: caja.status === "ACTIVO" ? "INACTIVO" : "ACTIVO" },
  });
  revalidatePath("/cajas");
  return { ok: true };
}
