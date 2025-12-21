import { z } from "zod";

export const companiesSettingsSchema = z.object({
  company: z.string({
    required_error: "Nombre de la Organización es requerida",
  }),
  logo: z
    .instanceof(File, { message: "Debes subir un logo." })
    .refine((f) => f.size < 20_000_000, "Logo debe ser menor a 20MB.")
    .optional(),
  dominio: z.string({ required_error: "Dominio es requerido" }),
  companyId: z.string(),
});

export type companiesSettingsType = typeof companiesSettingsSchema;
