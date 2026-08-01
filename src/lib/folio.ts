import { format } from "date-fns";
import type { Prisma } from "@/generated/prisma/client";

export async function generateFolio(
  tx: Prisma.TransactionClient,
  kind: "ENT" | "SAL" | "TRA",
  at: Date
): Promise<string> {
  const datePart = format(at, "yyyyMMdd");
  const prefix = `${kind}-${datePart}-`;
  const count = await countForKind(tx, kind, prefix);
  return `${prefix}${String(count + 1).padStart(3, "0")}`;
}

function countForKind(tx: Prisma.TransactionClient, kind: "ENT" | "SAL" | "TRA", prefix: string): Promise<number> {
  switch (kind) {
    case "ENT":
      return tx.entry.count({ where: { folio: { startsWith: prefix } } });
    case "SAL":
      return tx.exit.count({ where: { folio: { startsWith: prefix } } });
    case "TRA":
      return tx.transfer.count({ where: { folio: { startsWith: prefix } } });
  }
}
