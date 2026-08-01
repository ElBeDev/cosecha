import { format } from "date-fns";
import type { Prisma } from "@/generated/prisma/client";

export async function generateFolio(
  tx: Prisma.TransactionClient,
  kind: "ENT" | "SAL",
  at: Date
): Promise<string> {
  const datePart = format(at, "yyyyMMdd");
  const prefix = `${kind}-${datePart}-`;
  const count =
    kind === "ENT"
      ? await tx.entry.count({ where: { folio: { startsWith: prefix } } })
      : await tx.exit.count({ where: { folio: { startsWith: prefix } } });
  return `${prefix}${String(count + 1).padStart(3, "0")}`;
}
