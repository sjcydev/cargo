import { db } from "$lib/server/db";
import type { PageServerLoad, Actions } from "./$types";
import { superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { companiesSettingsSchema } from "./schema";
import { getFriendlyUrl, uploadFile } from "$lib/server/s3";
import { fail } from "@sveltejs/kit";
import { companies } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";
import { randomUUID as uuid } from "crypto";

export const load = (async () => {
  const companyResult = await db
    .select({
      companyId: companies.companyId,
      company: companies.company,
      logo: companies.logo,
      dominio: companies.dominio,
      sucursalesLimit: companies.sucursalesLimit,
      allowCorporativos: companies.allowCorporativos,
    })
    .from(companies)
    .limit(1);

  const companyData = companyResult[0];
  const logo = getFriendlyUrl(companyData.logo!);

  const form = await superValidate(zod(companiesSettingsSchema));

  form.data = {
    company: companyData.company,
    companyId: String(companyData.companyId),
    dominio: companyData.dominio,
  };

  return { form, company: companyData, logo };
}) satisfies PageServerLoad;

export const actions = {
  default: async ({ request }) => {
    const form = await superValidate(request, zod(companiesSettingsSchema));

    if (!form.valid) {
      return fail(400, { form });
    }

    let { company, companyId: id, dominio, logo: logoArchivo } = form.data;

    let companyId = Number(id);

    try {
      if (logoArchivo) {
        const fileExt = logoArchivo.name.split("/")[1] || "png";
        const keyName = `${company}/logo-${uuid()}.${fileExt}`;

        await uploadFile({ file: logoArchivo, keyName });

        await db
          .update(companies)
          .set({ logo: keyName })
          .where(eq(companies.companyId, companyId));
      }

      await db
        .update(companies)
        .set({ company, dominio })
        .where(eq(companies.companyId, companyId));

      const updatedForm = await superValidate(zod(companiesSettingsSchema));

      updatedForm.data = {
        company,
        companyId: id,
        dominio,
      };

      return {
        form: updatedForm,
      };
    } catch (e) {
      console.log(e);
    }
  },
} satisfies Actions;
