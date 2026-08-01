import { format } from "date-fns";
import type { Prisma } from "@/generated/prisma/client";

export async function generateLotCode(
  tx: Prisma.TransactionClient,
  productCode: string,
  at: Date
): Promise<string> {
  const datePart = format(at, "yyyyMMdd");
  const prefix = `LOT-${datePart}-${productCode}-`;
  const count = await tx.lot.count({ where: { code: { startsWith: prefix } } });
  return `${prefix}${String(count + 1).padStart(3, "0")}`;
}
