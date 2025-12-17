import { z } from "zod";

export const companiesSchema = z.object({
  company: z.string({
    required_error: "Nombre de la Organización es requerida",
  }),
  logo: z
    .instanceof(File, { message: "Debes subir un logo." })
    .refine((f) => f.size < 20_000_000, "Logo debe ser menor a 20MB."),
  dominio: z.string({ required_error: "Dominio es requerido" }),
});

export const sucursalesSchema = z.intersection(
  companiesSchema,
  z.object({
    sucursal: z.string({ required_error: "Sucursal es requerida" }),
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
  })
);

export const addressesSchema = z.intersection(
  sucursalesSchema,
  z.object({
    addressName: z.string({ required_error: "Nombre de la dirección es requerido" }),
    address1: z.string({ required_error: "Dirección principal es requerida" }),
    address2: z.string().optional().nullish(),
    zipcode: z.string({ required_error: "Código postal es requerido" }),
    city: z.string({ required_error: "Ciudad es requerida" }),
    country: z.string({ required_error: "País es requerido" }),
    tel: z.string({ required_error: "Teléfono es requerido" }),
  })
);

export const userSignUpSchema = z.intersection(
  addressesSchema,
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
