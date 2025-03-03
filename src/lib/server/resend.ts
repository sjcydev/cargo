import { Resend } from "resend";
import { PRIVATE_RESEND_API_KEY } from "$env/static/private";

export const resend = new Resend(PRIVATE_RESEND_API_KEY);
