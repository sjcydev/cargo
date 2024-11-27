import { z } from "zod";

export const userSignUpSchema = z
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
        confirm: z.string({ required_error: "Confirmar contraseña es requerido" }),
        rol: z.enum(["ADMIN", "EMPLEADO", "SECRETARIA"]).optional(),
        secret: z
            .string({ required_error: "Codigo secreto es requerido" })
            .trim()
            .optional(),
    })
    .refine((data) => data.password === data.confirm, {
        message: "Contraseñas no coinciden",
        path: ["confirm"], // path of error
    });

export type userSignUpType = typeof userSignUpSchema;