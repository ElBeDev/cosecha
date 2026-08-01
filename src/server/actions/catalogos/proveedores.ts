"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { optionalId, optionalString } from "@/lib/validations/common";
import type { ActionResult } from "@/components/catalog/crud-table";

const schema = z.object({
  id: optionalId,
  name: z.string().trim().min(1, "El nombre es obligatorio."),
  contact: optionalString,
  phone: optionalString,
  email: optionalString,
  type: z.enum(["PRODUCCION_PROPIA", "PRODUCTOR_EXTERNO", "DISTRIBUIDOR"]),
});

export async function upsertProveedor(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  await requireSession();
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  const { id, ...data } = parsed.data;
  if (id) {
    await prisma.supplier.update({ where: { id }, data });
  } else {
    await prisma.supplier.create({ data: { ...data, status: "ACTIVO" } });
  }
  revalidatePath("/proveedores");
  return { ok: true };
}

export async function toggleProveedorStatus(id: number): Promise<ActionResult> {
  await requireSession();
  const supplier = await prisma.supplier.findUniqueOrThrow({ where: { id } });
  await prisma.supplier.update({
    where: { id },
    data: { status: supplier.status === "ACTIVO" ? "INACTIVO" : "ACTIVO" },
  });
  revalidatePath("/proveedores");
  return { ok: true };
}
