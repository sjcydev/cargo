import type { PageServerLoad, Actions } from "./$types";
import { API_BASE_URL, API_KEY } from "$env/static/private";
import { superValidate, message } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { fail } from "@sveltejs/kit";
import { whatsappSettingsSchema } from "./schema";
import { logger } from "$lib/server/logger";

type MaskedWhatsappSettings = {
  enabled: boolean;
  phoneNumberId: string | null;
  wabaId: string | null;
  accessTokenSet: boolean;
};

export const load = (async () => {
  const form = await superValidate(zod(whatsappSettingsSchema));
  let accessTokenSet = false;

  try {
    const res = await fetch(`${API_BASE_URL}/whatsapp`, {
      headers: { Authorization: `Bearer ${API_KEY}` },
    });

    if (res.ok) {
      const settings = (await res.json()) as MaskedWhatsappSettings;
      form.data.enabled = settings.enabled;
      form.data.phoneNumberId = settings.phoneNumberId ?? "";
      form.data.wabaId = settings.wabaId ?? "";
      accessTokenSet = settings.accessTokenSet;
    } else {
      logger.error("Failed to load WhatsApp settings", {
        status: res.status,
      });
    }
  } catch (error) {
    logger.error("Failed to reach WhatsApp settings API", { error });
  }

  return { form, accessTokenSet };
}) satisfies PageServerLoad;

export const actions = {
  default: async ({ request }) => {
    const form = await superValidate(request, zod(whatsappSettingsSchema));

    if (!form.valid) {
      return fail(400, { form });
    }

    // Only send fields the admin actually filled in. Leaving the access token
    // blank keeps the one already stored on cargo-server (it is never echoed
    // back to the portal).
    const payload: Record<string, unknown> = { enabled: form.data.enabled };
    if (form.data.phoneNumberId) payload.phoneNumberId = form.data.phoneNumberId;
    if (form.data.wabaId) payload.wabaId = form.data.wabaId;
    if (form.data.accessToken) payload.accessToken = form.data.accessToken;

    try {
      const res = await fetch(`${API_BASE_URL}/whatsapp`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as {
          error?: string;
          message?: string;
        };
        const text =
          body.error ??
          body.message ??
          "No se pudieron guardar los ajustes de WhatsApp.";
        return message(form, { type: "error", text }, { status: 400 });
      }

      // Never keep the plaintext token in the returned form state.
      form.data.accessToken = "";
      return message(form, {
        type: "success",
        text: "Ajustes de WhatsApp guardados.",
      });
    } catch (error) {
      logger.error("Failed to save WhatsApp settings", { error });
      return message(
        form,
        { type: "error", text: "No se pudo conectar con el servidor." },
        { status: 500 }
      );
    }
  },
} satisfies Actions;
