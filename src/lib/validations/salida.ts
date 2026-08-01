import { z } from "zod";

const optionalId = z.preprocess(
  (v) => (v === "" || v === undefined || v === null ? undefined : v),
  z.coerce.number().int().positive().optional()
);

export const salidaSchema = z.object({
  lotId: z.coerce.number().int().positive({ message: "Selecciona un lote." }),
  exitType: z.enum([
    "VENTA",
    "TRASLADO_INTERNO",
    "EMBARQUE",
    "DEVOLUCION",
    "MERMA",
    "AJUSTE_AUTORIZADO",
    "MUESTRA",
    "CONSUMO_INTERNO",
  ]),
  exitMode: z.enum(["CAJAS", "MOSTRADOR"]),
  scaleId: z.coerce.number().int().positive({ message: "Báscula inválida." }),
  grossWeight: z.coerce.number({ message: "Captura el peso con la báscula." }),
  pesoEstable: z.preprocess((v) => v === "true" || v === true, z.boolean()),
  basculaConectada: z.preprocess((v) => v === "true" || v === true, z.boolean()),
  cajaTipoId: optionalId,
  boxCount: z.coerce.number().int().min(0).default(0),
  tareManual: z.coerce.number().min(0).default(0),
  customer: z.string().optional(),
  reason: z.string().optional(),
  notas: z.string().optional(),
});

export type SalidaInput = z.infer<typeof salidaSchema>;
