import type { RequestHandler } from "./$types";
import Bienvenida from "$lib/components/emails/welcome-email.svelte";
import { db } from "$lib/server/db";
import { resend } from "$lib/server/resend";
import { eq } from "drizzle-orm";
import { sucursales } from "$lib/server/db/schema";
import { json } from "@sveltejs/kit";
import { getFriendlyUrl } from "$lib/server/s3";
import { randomUUID as uuid } from "crypto";
import { renderAsPlainText } from "svelte-email-tailwind";

import { render } from "svelte/server";

export const POST: RequestHandler = async ({ request }) => {
  console.log("hit");
  const body = await request.json();

  let { nombre, apellido, casillero, sucursalId, correo } = body;

  try {
    const company = await db.query.companies.findFirst()!;

    const sucursal = await db.query.sucursales.findFirst({
      where: eq(sucursales.sucursalId, Number(sucursalId)),
    });

    if (company) {
      const logo = getFriendlyUrl(company.logo!);

      const compProps = {
        nombre,
        apellido,
        casillero,
        sucursal: sucursal?.sucursal,
        codigo_de_compania: sucursal?.codificacion,
        nombre_de_compania: company.company,
        logo,
      };

      const { body: emailHtml } = render(Bienvenida, { props: compProps });

      const emailText = await renderAsPlainText(emailHtml);

      const data = await resend.emails.send({
        from: `${company.company} <no-reply-info@resend.dev>`,
        to: [correo],
        subject: `¡Bienvenido a ${company.company}!`,
        html: emailHtml,
        text: emailText,
        headers: {
          "X-Entity-Ref-ID": uuid(),
        },
      });

      return json({ data, message: "Email sent successfully" });
    }
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Failed to send email" }), {
      status: 500,
    });
  }

  return new Response(JSON.stringify({ error: "Company not found" }), {
    status: 404,
  });
};
