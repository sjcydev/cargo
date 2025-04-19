import { z } from "zod";

export const sucursalesSchema = z.object({
  sucursalId: z.number(),
  sucursal: z.string({ required_error: "Nombre de la Sucursal es requerida" }),
  precio: z
    .number()
    .min(0, { message: "Precio debe ser mayor a 0" })
    .optional()
    .nullish(),

  direccion: z.string({
    required_error: "Direccion de la Sucursal es requerida",
  }),
  telefono: z.string({
    required_error: "Telefono de la Sucursal es requerida",
  }),
  codificacion: z
    .string({ required_error: "Codificacion de la Sucursal es requerida" })
    .max(4, { message: "Codificación debe tener 4 o menos caracteres" }),
  correoSucursal: z
    .string({ required_error: "Correo es requerido" })
    .email({ message: "Correo invalido" })
    .trim(),
  maps: z.string().optional().nullish(),
});

export type sucursalesType = typeof sucursalesSchema;
