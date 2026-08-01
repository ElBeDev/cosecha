"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { optionalId, optionalNumber, optionalString } from "@/lib/validations/common";
import type { ActionResult } from "@/components/catalog/crud-table";

const schema = z.object({
  id: optionalId,
  code: z.string().trim().min(1, "El código es obligatorio.").transform((v) => v.toUpperCase()),
  name: z.string().trim().min(1, "El nombre es obligatorio."),
  category: optionalString,
  unit: z.enum(["KG", "CAJA", "PIEZA", "TARIMA"]),
  minWeight: optionalNumber,
  maxWeight: optionalNumber,
  notes: optionalString,
});

export async function upsertProducto(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  await requireSession();
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  const { id, ...data } = parsed.data;
  try {
    if (id) {
      await prisma.product.update({ where: { id }, data });
    } else {
      await prisma.product.create({ data: { ...data, status: "ACTIVO" } });
    }
  } catch {
    return { ok: false, error: "No se pudo guardar (¿código duplicado?)." };
  }
  revalidatePath("/productos");
  return { ok: true };
}

export async function toggleProductoStatus(id: number): Promise<ActionResult> {
  await requireSession();
  const product = await prisma.product.findUniqueOrThrow({ where: { id } });
  await prisma.product.update({
    where: { id },
    data: { status: product.status === "ACTIVO" ? "INACTIVO" : "ACTIVO" },
  });
  revalidatePath("/productos");
  return { ok: true };
}
