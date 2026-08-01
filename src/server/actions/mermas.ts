"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { generateFolio } from "@/lib/folio";
import { DomainError } from "@/lib/domain-error";
import { optionalId } from "@/lib/validations/common";

const REASONS = [
  "DESHIDRATACION",
  "DANO",
  "GOLPE",
  "DESCOMPOSICION",
  "PRODUCTO_RECHAZADO",
  "DERRAME",
  "DIFERENCIA_DE_PESO",
  "ERROR_DE_CAPTURA",
  "OTRO",
] as const;

const schema = z.object({
  lotId: z.coerce.number().int().positive({ message: "Selecciona un lote." }),
  weightAfter: z.coerce.number({ message: "Captura el peso nuevo." }).min(0, "El peso no puede ser negativo."),
  reason: z.enum(REASONS),
  supervisorId: optionalId,
  notes: z.string().trim().optional(),
});

export type MermaState =
  | { ok: true; folio: string; lotCode: string; lotId: number; difference: number; percentage: number }
  | { ok: false; error: string }
  | null;

const BLOCKED_LOT_STATUSES = new Set(["AGOTADO", "CANCELADO", "BLOQUEADO", "EN_REVISION"]);
const EPS = 0.001;

export async function createMermaAction(_prevState: MermaState, formData: FormData): Promise<MermaState> {
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
        throw new DomainError("LOTE_NO_DISPONIBLE", `El lote está en estatus ${lot.status} y no admite ajustes.`);
      }

      const weightBefore = lot.availableWeight;
      if (data.weightAfter > weightBefore + EPS) {
        throw new DomainError(
          "PESO_NETO_INVALIDO",
          `El peso nuevo no puede ser mayor al disponible (${weightBefore.toFixed(2)} kg).`
        );
      }

      const difference = weightBefore - data.weightAfter;
      const percentage = weightBefore > 0 ? (difference / weightBefore) * 100 : 0;

      const newAvailable = Math.max(data.weightAfter, 0);
      const newStatus =
        newAvailable <= EPS ? "AGOTADO" : newAvailable < lot.initialWeight - EPS ? "PARCIALMENTE_UTILIZADO" : lot.status;

      await tx.lot.update({
        where: { id: lot.id },
        data: { availableWeight: newAvailable, status: newStatus },
      });

      const now = new Date();
      const folio = await generateFolio(tx, "MER", now);

      const adjustment = await tx.adjustment.create({
        data: {
          folio,
          datetime: now,
          lotId: lot.id,
          operatorId: session.userId,
          supervisorId: data.supervisorId ?? null,
          weightBefore,
          weightAfter: newAvailable,
          difference,
          percentage,
          reason: data.reason,
          notes: data.notes || null,
        },
      });

      await tx.movementLog.create({
        data: {
          userId: session.userId,
          action: "MERMA_REGISTRADA",
          module: "MERMAS",
          folio: adjustment.folio,
          lotId: lot.id,
          authorizedBy: data.supervisorId ?? null,
          reason: data.reason,
          newData: JSON.stringify({ weightBefore, weightAfter: newAvailable, difference, percentage }),
        },
      });

      return { folio, lotCode: lot.code, lotId: lot.id, difference, percentage };
    });

    revalidatePath("/inventario");
    revalidatePath("/dashboard");
    revalidatePath("/movimientos");
    revalidatePath("/mermas");
    revalidatePath(`/lotes/${data.lotId}`);

    return { ok: true, ...result };
  } catch (err) {
    if (err instanceof DomainError) {
      return { ok: false, error: err.message };
    }
    console.error(err);
    return { ok: false, error: "Ocurrió un error al registrar la merma." };
  }
}
