import { z } from "zod";

export const userUpdateSchema = z.object({
  id: z.string({ required_error: "Id es requerido" }),
  nombre: z
    .string({ required_error: "Nombre es requerido" })
    .trim()
    .min(1, { message: "Nombre debe tener 1 o más caracteres" }),
  apellido: z
    .string({ required_error: "Apellido es requerido" })
    .trim()
    .min(1, { message: "Apellido debe tener 1 o más caracteres" }),
  rol: z.enum(["ADMIN", "EMPLEADO", "SECRETARIA"]).optional(),
  sucursalId: z
    .string({ required_error: "Sucursal es requerido" })
    .min(1, { message: "Sucursal es requerido" }),
  password: z
    .string({ required_error: "Contraseña es requerido" })
    .min(6, { message: "Contraseña debe tener 6 o más caracteres" })
    .optional(),
  confirm: z
    .string({ required_error: "Confirmar contraseña es requerido" })
    .optional(),
});

export type userUpdateType = typeof userUpdateSchema;
