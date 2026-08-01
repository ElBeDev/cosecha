"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { entradaSchema } from "@/lib/validations/entrada";
import { calcNetWeight } from "@/lib/weight";
import { generateLotCode } from "@/lib/lot";
import { generateFolio } from "@/lib/folio";
import { DomainError } from "@/lib/domain-error";

export type EntradaState =
  | { ok: true; lotCode: string; folio: string; netWeight: number }
  | { ok: false; error: string }
  | null;

const DUPLICATE_WINDOW_MS = 10_000;

export async function createEntradaAction(
  _prevState: EntradaState,
  formData: FormData
): Promise<EntradaState> {
  const session = await requireSession();

  const parsed = entradaSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }
  const data = parsed.data;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const scale = await tx.scale.findUniqueOrThrow({ where: { id: data.basculaId } });

      if (!data.basculaConectada) {
        throw new DomainError("BASCULA_DESCONECTADA", "La báscula está desconectada.");
      }
      if (!data.pesoEstable) {
        throw new DomainError("PESO_INESTABLE", "El peso no está estable. Espera a que se estabilice.");
      }
      if (data.pesoBruto <= 0) {
        throw new DomainError("PESO_CERO", "El peso bruto debe ser mayor a cero.");
      }
      if (data.pesoBruto > scale.maxCapacity || data.pesoBruto < scale.minCapacity) {
        throw new DomainError(
          "CAPACIDAD_EXCEDIDA",
          `El peso está fuera del rango de la báscula (${scale.minCapacity}-${scale.maxCapacity} ${scale.unit}).`
        );
      }

      const recentDuplicate = await tx.entry.findFirst({
        where: {
          operatorId: session.userId,
          scaleId: data.basculaId,
          grossWeight: data.pesoBruto,
          datetime: { gte: new Date(Date.now() - DUPLICATE_WINDOW_MS) },
        },
      });
      if (recentDuplicate) {
        throw new DomainError("LECTURA_DUPLICADA", "Ya se registró esta misma lectura hace unos segundos.");
      }

      let palletTare = 0;
      if (data.tarimaTipoId) {
        const tarima = await tx.tarimaType.findUniqueOrThrow({ where: { id: data.tarimaTipoId } });
        palletTare = tarima.tareWeight;
      }

      let boxesTare = 0;
      if (data.cajaTipoId && data.numCajas > 0) {
        const caja = await tx.cajaType.findUniqueOrThrow({ where: { id: data.cajaTipoId } });
        boxesTare = caja.tareWeight * data.numCajas;
      }

      const totalTare = palletTare + boxesTare + data.taraAdicional;
      if (totalTare > data.pesoBruto) {
        throw new DomainError("TARA_MAYOR_A_BRUTO", "La tara total no puede ser mayor al peso bruto.");
      }

      const netWeight = calcNetWeight(data.pesoBruto, palletTare, boxesTare, data.taraAdicional);
      if (netWeight <= 0) {
        throw new DomainError("PESO_NETO_INVALIDO", "El peso neto resultante debe ser mayor a cero.");
      }

      const product = await tx.product.findUniqueOrThrow({ where: { id: data.productoId } });
      const now = new Date();
      const lotCode = await generateLotCode(tx, product.code, now);
      const folio = await generateFolio(tx, "ENT", now);
      const harvestDate = data.fechaCosecha ? new Date(data.fechaCosecha) : null;

      const lot = await tx.lot.create({
        data: {
          code: lotCode,
          productId: data.productoId,
          sizeId: data.tamanoId,
          qualityId: data.calidadId,
          supplierId: data.proveedorId,
          harvestDate,
          entryDatetime: now,
          initialWeight: netWeight,
          availableWeight: netWeight,
          warehouseId: data.almacenId,
          locationId: data.ubicacionId ?? null,
          status: "DISPONIBLE",
          operatorId: session.userId,
        },
      });

      const entry = await tx.entry.create({
        data: {
          folio,
          datetime: now,
          operatorId: session.userId,
          supplierId: data.proveedorId,
          productId: data.productoId,
          sizeId: data.tamanoId,
          qualityId: data.calidadId,
          harvestDate,
          scaleId: data.basculaId,
          grossWeight: data.pesoBruto,
          tarimaTypeId: data.tarimaTipoId ?? null,
          palletTare,
          cajaTypeId: data.cajaTipoId ?? null,
          boxCount: data.numCajas,
          boxesTare,
          additionalTare: data.taraAdicional,
          netWeight,
          warehouseId: data.almacenId,
          locationId: data.ubicacionId ?? null,
          notes: data.notas || null,
          lotId: lot.id,
        },
      });

      await tx.movementLog.create({
        data: {
          userId: session.userId,
          action: "ENTRADA_CREADA",
          module: "ENTRADAS",
          folio: entry.folio,
          lotId: lot.id,
          entryId: entry.id,
          newData: JSON.stringify({ lotCode, netWeight, grossWeight: data.pesoBruto }),
        },
      });

      return { lotCode, folio, netWeight };
    });

    revalidatePath("/inventario");
    revalidatePath("/dashboard");
    revalidatePath("/movimientos");

    return { ok: true, ...result };
  } catch (err) {
    if (err instanceof DomainError) {
      return { ok: false, error: err.message };
    }
    console.error(err);
    return { ok: false, error: "Ocurrió un error al registrar la entrada." };
  }
}
