import { z } from "zod";

export const clientesRegisterSchema = z.object({
  nombre: z
    .string({ required_error: "Nombre es requerido" })
    .trim()
    .min(1, { message: "Nombre debe tener 1 o más caracteres" }),
  apellido: z
    .string({ required_error: "Apellido es requerido" })
    .trim()
    .min(1, { message: "Apellido debe tener 1 o más caracteres" }),
  correo: z
    .string({ required_error: "Correo es requerido" })
    .email({ message: "Correo invalido" })
    .trim()
    .min(1, { message: "" }),
  telefono: z
    .string({ required_error: "Telefono es requerido" })
    .trim()
    .min(1, { message: "Telefono debe tener 1 o más caracteres" }),
  cedula: z
    .string({ required_error: "Cedula es requerido" })
    .trim()
    .min(1, { message: "Cedula debe tener 1 o más caracteres" }),
  sexo: z.enum(["Masculino", "Femenino", "Otros"]).default("Otros").optional(),
  sucursalId: z
    .string({ required_error: "Sucursal es requerido" })
    .min(1, { message: "Sucursal es requerido" }),
});

export type clientesRegsiterType = typeof clientesRegisterSchema;
