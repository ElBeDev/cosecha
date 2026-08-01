"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { salidaSchema } from "@/lib/validations/salida";
import { generateFolio } from "@/lib/folio";
import { DomainError } from "@/lib/domain-error";

export type SalidaState =
  | { ok: true; folio: string; netWeight: number; lotCode: string; lotId: number; lotStatus: string }
  | { ok: false; error: string }
  | null;

const DUPLICATE_WINDOW_MS = 10_000;
const EPS = 0.001;

const BLOCKED_LOT_STATUSES = new Set(["AGOTADO", "CANCELADO", "BLOQUEADO", "EN_REVISION"]);

export async function createSalidaAction(_prevState: SalidaState, formData: FormData): Promise<SalidaState> {
  const session = await requireSession();

  const parsed = salidaSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }
  const data = parsed.data;

  if (data.exitMode === "CAJAS" && (!data.cajaTipoId || data.boxCount <= 0)) {
    return { ok: false, error: "Selecciona el tipo de caja y el número de cajas." };
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const scale = await tx.scale.findUniqueOrThrow({ where: { id: data.scaleId } });

      if (!data.basculaConectada) {
        throw new DomainError("BASCULA_DESCONECTADA", "La báscula está desconectada.");
      }
      if (!data.pesoEstable) {
        throw new DomainError("PESO_INESTABLE", "El peso no está estable. Espera a que se estabilice.");
      }
      if (data.grossWeight <= 0) {
        throw new DomainError("PESO_CERO", "El peso debe ser mayor a cero.");
      }
      if (data.grossWeight > scale.maxCapacity || data.grossWeight < scale.minCapacity) {
        throw new DomainError(
          "CAPACIDAD_EXCEDIDA",
          `El peso está fuera del rango de la báscula (${scale.minCapacity}-${scale.maxCapacity} ${scale.unit}).`
        );
      }

      const recentDuplicate = await tx.exit.findFirst({
        where: {
          operatorId: session.userId,
          scaleId: data.scaleId,
          grossWeight: data.grossWeight,
          datetime: { gte: new Date(Date.now() - DUPLICATE_WINDOW_MS) },
        },
      });
      if (recentDuplicate) {
        throw new DomainError("LECTURA_DUPLICADA", "Ya se registró esta misma lectura hace unos segundos.");
      }

      const lot = await tx.lot.findUnique({ where: { id: data.lotId } });
      if (!lot) {
        throw new DomainError("LOTE_NO_DISPONIBLE", "El lote seleccionado no existe.");
      }
      if (BLOCKED_LOT_STATUSES.has(lot.status)) {
        throw new DomainError("LOTE_NO_DISPONIBLE", `El lote está en estatus ${lot.status} y no admite salidas.`);
      }

      let tareWeight = 0;
      let boxCount: number | null = null;
      if (data.exitMode === "CAJAS") {
        const caja = await tx.cajaType.findUniqueOrThrow({ where: { id: data.cajaTipoId! } });
        tareWeight = caja.tareWeight * data.boxCount;
        boxCount = data.boxCount;
      } else {
        tareWeight = data.tareManual;
      }

      if (tareWeight > data.grossWeight) {
        throw new DomainError("TARA_MAYOR_A_BRUTO", "La tara no puede ser mayor al peso capturado.");
      }

      const netWeight = data.grossWeight - tareWeight;
      if (netWeight <= 0) {
        throw new DomainError("PESO_NETO_INVALIDO", "El peso neto resultante debe ser mayor a cero.");
      }
      if (netWeight > lot.availableWeight + EPS) {
        throw new DomainError(
          "INVENTARIO_INSUFICIENTE",
          `El lote solo tiene ${lot.availableWeight.toFixed(2)} kg disponibles.`
        );
      }

      const newAvailable = lot.availableWeight - netWeight;
      const newStatus =
        newAvailable <= EPS ? "AGOTADO" : newAvailable < lot.initialWeight - EPS ? "PARCIALMENTE_UTILIZADO" : lot.status;

      await tx.lot.update({
        where: { id: lot.id },
        data: { availableWeight: Math.max(newAvailable, 0), status: newStatus },
      });

      const now = new Date();
      const folio = await generateFolio(tx, "SAL", now);

      const exit = await tx.exit.create({
        data: {
          folio,
          datetime: now,
          operatorId: session.userId,
          exitType: data.exitType,
          exitMode: data.exitMode,
          lotId: lot.id,
          productId: lot.productId,
          sizeId: lot.sizeId,
          qualityId: lot.qualityId,
          scaleId: data.scaleId,
          grossWeight: data.grossWeight,
          tareWeight,
          boxCount,
          netWeight,
          customer: data.customer || null,
          reason: data.reason || null,
          notes: data.notas || null,
        },
      });

      await tx.movementLog.create({
        data: {
          userId: session.userId,
          action: "SALIDA_CREADA",
          module: "SALIDAS",
          folio: exit.folio,
          lotId: lot.id,
          exitId: exit.id,
          newData: JSON.stringify({ netWeight, grossWeight: data.grossWeight, exitMode: data.exitMode }),
        },
      });

      return { folio, netWeight, lotCode: lot.code, lotId: lot.id, lotStatus: newStatus };
    });

    revalidatePath("/inventario");
    revalidatePath("/dashboard");
    revalidatePath("/movimientos");
    revalidatePath(`/lotes/${data.lotId}`);

    return { ok: true, ...result };
  } catch (err) {
    if (err instanceof DomainError) {
      return { ok: false, error: err.message };
    }
    console.error(err);
    return { ok: false, error: "Ocurrió un error al registrar la salida." };
  }
}
