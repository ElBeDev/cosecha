import { z } from "zod";

const optionalId = z.preprocess(
  (v) => (v === "" || v === undefined || v === null ? undefined : v),
  z.coerce.number().int().positive().optional()
);

export const entradaSchema = z.object({
  proveedorId: z.coerce.number().int().positive({ message: "Selecciona un proveedor." }),
  productoId: z.coerce.number().int().positive({ message: "Selecciona un producto." }),
  tamanoId: z.coerce.number().int().positive({ message: "Selecciona un tamaño." }),
  calidadId: z.coerce.number().int().positive({ message: "Selecciona una calidad." }),
  fechaCosecha: z.string().optional(),
  almacenId: z.coerce.number().int().positive({ message: "Selecciona un almacén." }),
  ubicacionId: optionalId,
  tarimaTipoId: optionalId,
  cajaTipoId: optionalId,
  numCajas: z.coerce.number().int().min(0).default(0),
  taraAdicional: z.coerce.number().min(0).default(0),
  basculaId: z.coerce.number().int().positive({ message: "Báscula inválida." }),
  pesoBruto: z.coerce.number({ message: "Captura el peso con la báscula." }),
  pesoEstable: z.preprocess((v) => v === "true" || v === true, z.boolean()),
  basculaConectada: z.preprocess((v) => v === "true" || v === true, z.boolean()),
  notas: z.string().optional(),
});

export type EntradaInput = z.infer<typeof entradaSchema>;
