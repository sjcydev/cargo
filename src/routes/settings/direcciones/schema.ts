import { z } from "zod";

export const addressesSchema = z.object({
  addressId: z.number().optional().nullish(),
  name: z.string({ required_error: "Nombre de la dirección es requerido" }),
  address1: z.string({ required_error: "Dirección principal es requerida" }),
  address2: z.string().optional().nullish(),
  zipcode: z.string({ required_error: "Código postal es requerido" }),
  city: z.string({ required_error: "Ciudad es requerida" }),
  country: z.string({ required_error: "País es requerido" }),
  tel: z.string({ required_error: "Teléfono es requerido" }),
  state: z.string({ required_error: "Estado es requerido"}),
  suffix: z.string().optional().nullable()
});

export type addressesType = typeof addressesSchema;
