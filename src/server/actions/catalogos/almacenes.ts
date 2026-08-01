"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { optionalId, optionalNumber, optionalString } from "@/lib/validations/common";
import type { ActionResult } from "@/components/catalog/crud-table";

const warehouseSchema = z.object({
  id: optionalId,
  name: z.string().trim().min(1, "El nombre es obligatorio."),
  type: z.enum(["BODEGA", "CAMARA_FRIA", "RECEPCION", "EMBARQUE", "MOSTRADOR"]),
  capacity: optionalNumber,
});

export async function upsertAlmacen(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  await requireSession();
  const parsed = warehouseSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  const { id, ...data } = parsed.data;
  if (id) {
    await prisma.warehouse.update({ where: { id }, data });
  } else {
    await prisma.warehouse.create({ data: { ...data, status: "ACTIVO" } });
  }
  revalidatePath("/almacenes");
  return { ok: true };
}

export async function toggleAlmacenStatus(id: number): Promise<ActionResult> {
  await requireSession();
  const warehouse = await prisma.warehouse.findUniqueOrThrow({ where: { id } });
  await prisma.warehouse.update({
    where: { id },
    data: { status: warehouse.status === "ACTIVO" ? "INACTIVO" : "ACTIVO" },
  });
  revalidatePath("/almacenes");
  return { ok: true };
}

const locationSchema = z.object({
  id: optionalId,
  warehouseId: z.coerce.number().int().positive({ message: "Selecciona un almacén." }),
  label: z.string().trim().min(1, "La etiqueta es obligatoria."),
  aisle: optionalString,
  zone: optionalString,
});

export async function upsertUbicacion(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  await requireSession();
  const parsed = locationSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  const { id, ...data } = parsed.data;
  if (id) {
    await prisma.location.update({ where: { id }, data });
  } else {
    await prisma.location.create({ data });
  }
  revalidatePath("/almacenes");
  return { ok: true };
}
