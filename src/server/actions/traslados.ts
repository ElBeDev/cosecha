"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { generateFolio } from "@/lib/folio";
import { DomainError } from "@/lib/domain-error";
import { optionalId } from "@/lib/validations/common";

const schema = z.object({
  lotId: z.coerce.number().int().positive({ message: "Selecciona un lote." }),
  toWarehouseId: z.coerce.number().int().positive({ message: "Selecciona el almacén destino." }),
  toLocationId: optionalId,
  reason: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

export type TrasladoState =
  | { ok: true; folio: string; lotCode: string; lotId: number }
  | { ok: false; error: string }
  | null;

const BLOCKED_LOT_STATUSES = new Set(["AGOTADO", "CANCELADO", "BLOQUEADO", "EN_REVISION"]);

export async function createTrasladoAction(_prevState: TrasladoState, formData: FormData): Promise<TrasladoState> {
  const session = await requireSession();

  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }
  const data = parsed.data;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const lot = await tx.lot.findUnique({ where: { id: data.lotId } });
      if (!lot) throw new DomainError("LOTE_NO_DISPONIBLE", "El lote seleccionado no existe.");
      if (BLOCKED_LOT_STATUSES.has(lot.status)) {
        throw new DomainError("LOTE_NO_DISPONIBLE", `El lote está en estatus ${lot.status} y no admite traslados.`);
      }

      const now = new Date();
      const folio = await generateFolio(tx, "TRA", now);

      await tx.lot.update({
        where: { id: lot.id },
        data: { warehouseId: data.toWarehouseId, locationId: data.toLocationId ?? null },
      });

      const transfer = await tx.transfer.create({
        data: {
          folio,
          datetime: now,
          operatorId: session.userId,
          lotId: lot.id,
          fromWarehouseId: lot.warehouseId,
          fromLocationId: lot.locationId,
          toWarehouseId: data.toWarehouseId,
          toLocationId: data.toLocationId ?? null,
          reason: data.reason || null,
          notes: data.notes || null,
        },
      });

      await tx.movementLog.create({
        data: {
          userId: session.userId,
          action: "TRASLADO_CREADO",
          module: "TRASLADOS",
          folio: transfer.folio,
          lotId: lot.id,
          newData: JSON.stringify({ fromWarehouseId: lot.warehouseId, toWarehouseId: data.toWarehouseId }),
        },
      });

      return { folio, lotCode: lot.code, lotId: lot.id };
    });

    revalidatePath("/inventario");
    revalidatePath("/movimientos");
    revalidatePath(`/lotes/${data.lotId}`);

    return { ok: true, ...result };
  } catch (err) {
    if (err instanceof DomainError) {
      return { ok: false, error: err.message };
    }
    console.error(err);
    return { ok: false, error: "Ocurrió un error al registrar el traslado." };
  }
}
