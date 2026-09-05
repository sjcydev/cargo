import { z } from "zod";

// WhatsApp (WABA) settings entered by a Client admin. The access token is
// write-only from the portal's side: cargo-server never returns it, so it is
// optional here and only sent when the admin (re)enters it.
export const whatsappSettingsSchema = z.object({
  enabled: z.boolean().default(false),
  phoneNumberId: z.string().trim().default(""),
  wabaId: z.string().trim().default(""),
  accessToken: z.string().trim().default(""),
});

export type WhatsappSettingsType = typeof whatsappSettingsSchema;
