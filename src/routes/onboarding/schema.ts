import { z } from "zod";

export const sucursalesSchema = z.object({
  sucursal: z.string({ required_error: "Sucursal es requerida" }),
  precio: z
    .number()
    .min(0, { message: "Precio debe ser mayor a 0" })
    .optional(),
  direccion: z.string({
    required_error: "Direccion de la Sucursal es requerida",
  }),
  telefono: z.string({
    required_error: "Telefono de la Sucursal es requerida",
  }),
});

export const userSignUpSchema = z.intersection(
  sucursalesSchema,
  z
    .object({
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
      username: z
        .string({ required_error: "Username es requerido" })
        .trim()
        .min(3, { message: "Username debe tener 3 o más caracteres" }),
      password: z
        .string({ required_error: "Contraseña es requerido" })
        .min(6, { message: "Contraseña debe tener 6 o más caracteres" }),
      confirm: z.string({
        required_error: "Confirmar contraseña es requerido",
      }),
      rol: z.enum(["ADMIN", "EMPLEADO", "SECRETARIA"]).optional(),
    })
    .refine((data) => data.password === data.confirm, {
      message: "Contraseñas no coinciden",
      path: ["confirm"], // path of error
    })
);

export type userSignUpType = typeof userSignUpSchema;
