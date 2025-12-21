import { z } from "zod";

export const userLoginSchema = z.object({
    username: z.string({ required_error: "Username es requerido" }),
    password: z.string({ required_error: "Contraseña es requerido" }),
});

export type userLoginType = typeof userLoginSchema;