import { z } from "zod";

const isFileLike = (value: unknown): value is File =>
  typeof value === "object" &&
  value !== null &&
  "arrayBuffer" in value &&
  typeof value.arrayBuffer === "function" &&
  "size" in value &&
  typeof value.size === "number" &&
  "type" in value &&
  typeof value.type === "string";

export const companiesSettingsSchema = z.object({
  company: z.string({
    required_error: "Nombre de la Organización es requerida",
  }),
  logo: z
    .custom<File>((value) => isFileLike(value), {
      message: "Debes subir un logo.",
    })
    .refine((f) => f.size < 20_000_000, "Logo debe ser menor a 20MB.")
    .optional(),
  dominio: z.string({ required_error: "Dominio es requerido" }),
  companyId: z.string(),
});

export type companiesSettingsType = typeof companiesSettingsSchema;
