<script lang="ts">
  import type { PageData } from "./$types";
  import { Separator } from "$lib/components/ui/separator";
  import CompanyForm from "./company-form.svelte";

  let { data }: { data: PageData } = $props();
</script>

<svelte:head>
  <title>Detalles de la Empresa</title>
</svelte:head>

<div class="space-y-6">
  <div>
    <h3 class="text-xl font-medium">Detalles de la Empresa</h3>
    <p class="text-muted-foreground text-sm">
      Aqui puedes modificar los detalles de la empresa.
    </p>
  </div>
  <Separator />
  <CompanyForm data={data.form} company={data.company!} logo={data.logo} />
</div>
