import { z } from "zod";

function emptyToUndefined(v: unknown) {
  return v === "" || v === undefined || v === null ? undefined : v;
}

export const optionalNumber = z.preprocess(emptyToUndefined, z.coerce.number().optional());
export const optionalString = z.preprocess(emptyToUndefined, z.string().trim().optional());
export const optionalId = z.preprocess(emptyToUndefined, z.coerce.number().int().positive().optional());
