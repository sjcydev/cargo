import type { PageServerLoad } from "./$types";
import {
  emailList,
  createEmail,
  sendEmail,
} from "svelte-email-tailwind/preview";
import { PRIVATE_RESEND_API_KEY } from "$env/static/private";

export const load = (async () => {
  return emailList({ path: "/src/lib/components/emails" });
}) satisfies PageServerLoad;

export const actions = {
  // Pass in the two actions. Provide your Resend API key.
  ...createEmail,
  ...sendEmail({ resendApiKey: PRIVATE_RESEND_API_KEY }),
};
