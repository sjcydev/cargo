import type { RequestHandler } from "./$types";
import { db } from "$lib/server/db";
import { resend } from "$lib/server/resend";
import { eq, inArray } from "drizzle-orm";
import {
  facturas,
  trackings,
  sucursales,
  usuarios,
  companies,
} from "$lib/server/db/schema";
import { json } from "@sveltejs/kit";
import { render } from "svelte/server";
import FacturaEmail from "$lib/components/emails/factura-email.svelte";
import { renderAsPlainText } from "svelte-email-tailwind";
import { getFriendlyUrl } from "$lib/server/s3";
import { randomUUID as uuid } from "crypto";
import { generateInvoice } from "$lib/facturacion/facturar/generatePDF";
import type { Companies, UsuariosWithSucursal } from "$lib/server/db/schema";

// Cache company data with expiration
let companyCache: { data: Companies; timestamp: number } | null = null;
const CACHE_EXPIRATION = 1000 * 60 * 60; // 1 hour

async function getCompanyData() {
  const now = Date.now();
  if (companyCache && now - companyCache.timestamp < CACHE_EXPIRATION) {
    return companyCache.data;
  }

  const companyFromDb = await db.query.companies.findFirst();
  if (!companyFromDb) throw new Error("Company not found");

  companyCache = {
    data: companyFromDb,
    timestamp: now,
  };

  return companyFromDb;
}

async function sendFacturaEmail({
  factura,
  company,
  logo,
  reenviando,
}: {
  factura: any;
  company: Companies;
  logo: string;
  reenviando: boolean;
}) {
  try {
    const [pdf, { body: emailHtml }] = await Promise.all([
      generateInvoice({
        info: factura,
        cliente: factura.cliente!,
        company,
        logo,
      }),
      render(FacturaEmail, {
        props: {
          nombre: factura.cliente!.nombre,
          casillero: String(factura.cliente!.casillero),
          trackings: factura.trackings,
          sucursal: factura.cliente!.sucursal.sucursal,
          ubicacion: factura.cliente!.sucursal.direccion,
          maps: factura.cliente!.sucursal.maps!,
          logo,
          nombre_de_compania: company.company!,
        },
      }),
    ]);

    const emailText = await renderAsPlainText(emailHtml);

    const data = await resend.emails.send({
      from: `${company.company} <no-reply-facturas@${company.dominio}>`,
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

    if (data.error?.message) {
      throw new Error(data.error.message);
    }

    if (!reenviando) {
      await db
        .update(facturas)
        .set({
          enviado: true,
        })
        .where(eq(facturas.facturaId, factura.facturaId));
    }
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}

export const POST: RequestHandler = async ({ request }) => {
  const body = await request.json();
  const { facturaIds, reenviando = false } = body;

  if (!Array.isArray(facturaIds) || facturaIds.length === 0) {
    return json({ error: "No factura IDs provided" }, { status: 400 });
  }

  try {
    // Get all required data in a single query with joins for all facturas
    const dbResults = await db
      .select({
        factura: facturas,
        cliente: usuarios,
        sucursal: sucursales,
        trackings: trackings,
      })
      .from(facturas)
      .where(inArray(facturas.facturaId, facturaIds.map(Number)))
      .leftJoin(usuarios, eq(facturas.clienteId, usuarios.id))
      .leftJoin(sucursales, eq(usuarios.sucursalId, sucursales.sucursalId))
      .leftJoin(trackings, eq(trackings.facturaId, facturas.facturaId));

    if (!dbResults.length) {
      return json({ error: "No facturas found" }, { status: 404 });
    }

    // Group results by factura ID
    const facturaMap = new Map<number, any>();
    dbResults.forEach((row: any) => {
      const facturaId = row.factura.facturaId;
      if (!facturaMap.has(facturaId)) {
        facturaMap.set(facturaId, {
          ...row.factura,
          cliente: {
            ...row.cliente,
            sucursal: row.sucursal,
          } as UsuariosWithSucursal,
          trackings: [],
        });
      }
      if (row.trackings) {
        facturaMap.get(facturaId).trackings.push(row.trackings);
      }
    });

    // Get company data from cache or database
    const company = await getCompanyData();
    const logo = getFriendlyUrl(company.logo!);

    // Process facturas in parallel with concurrency limit
    const BATCH_SIZE = 3; // Process 3 facturas at a time
    const facturasToProcess = Array.from(facturaMap.values());
    const emailResults: Array<{
      facturaId: number;
      success: boolean;
      error?: string;
    }> = [];

    for (let i = 0; i < facturasToProcess.length; i += BATCH_SIZE) {
      const batch = facturasToProcess.slice(i, i + BATCH_SIZE);
      const batchPromises = batch.map((factura) =>
        sendFacturaEmail({ factura, company, logo, reenviando })
          .then(() => ({ facturaId: factura.facturaId, success: true }))
          .catch((error) => ({
            facturaId: factura.facturaId,
            success: false,
            error: error.message,
          }))
      );

      const batchResults = await Promise.all(batchPromises);
      emailResults.push(...batchResults);
    }

    const successful = emailResults.filter((r) => r.success);
    const failed = emailResults.filter((r) => !r.success);

    return json({
      message: `Processed ${emailResults.length} facturas`,
      successful: successful.length,
      failed: failed.length,
      details: failed,
    });
  } catch (error) {
    console.error("Error processing request:", error);
    return json({ error: "Failed to process facturas" }, { status: 500 });
  }
};
