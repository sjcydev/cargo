import type { RequestHandler } from "./$types";
import { db } from "$lib/server/db";
import { resend } from "$lib/server/resend";
import { eq } from "drizzle-orm";
import { facturas } from "$lib/server/db/schema";
import { json } from "@sveltejs/kit";
import { render } from "svelte/server";
import FacturaEmail from "$lib/components/emails/factura-email.svelte";
import { renderAsPlainText } from "svelte-email-tailwind";
import { getFriendlyUrl } from "$lib/server/s3";
import { randomUUID as uuid } from "crypto";
import { generateInvoice } from "$lib/facturacion/facturar/generatePDF";
import type { Companies } from "$lib/server/db/schema";

export const POST: RequestHandler = async ({ request }) => {
  const body = await request.json();
  const { facturaId, reenviando = false } = body;

  try {
    const factura = await db.query.facturas.findFirst({
      where: eq(facturas.facturaId, facturaId),
      with: {
        trackings: true,
        cliente: {
          with: {
            sucursal: true,
          },
        },
      },
    });

    if (!factura) {
      return json(
        { error: "Factura no encontrada" },
        {
          status: 404,
        }
      );
    }

    const company = await db.query.companies.findFirst()!;
    const logo = getFriendlyUrl(company!.logo!);

    const pdf = await generateInvoice({
      info: factura,
      cliente: factura.cliente!,
      company: company as Companies,
      logo,
    });

    const { body: emailHtml } = render(FacturaEmail, {
      props: {
        nombre: factura.cliente!.nombre,
        casillero: String(factura.cliente!.casillero),
        trackings: factura.trackings,
        sucursal: factura.cliente!.sucursal.sucursal,
        ubicacion: factura.cliente!.sucursal.direccion,
        maps: factura.cliente!.sucursal.maps!,
        logo,
        nombre_de_compania: company?.company!,
      },
    });

    const emailText = await renderAsPlainText(emailHtml);

    const data = await resend.emails.send({
      from: `${company?.company} <no-reply-info@resend.dev>`,
      to: [factura.cliente!.correo],
      subject: `¡Tienes paquetes listos para retirar!`,
      html: emailHtml,
      text: emailText,
      attachments: [
        {
          filename: `Factura-${factura.facturaId}.pdf`,
          content: pdf as Buffer,
        },
      ],
      headers: {
        "X-Entity-Ref-ID": uuid(),
      },
    });

    if (!reenviando) {
      await db
        .update(facturas)
        .set({
          enviado: true,
        })
        .where(eq(facturas.facturaId, facturaId));
    }
    return json({ data, message: "Email sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    return json(
      { error: "Failed to send email" },
      {
        status: 500,
      }
    );
  }
};
