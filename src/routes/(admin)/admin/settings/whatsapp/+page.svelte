<script lang="ts">
  import type { PageData } from "./$types";
  import { Separator } from "$lib/components/ui/separator";
  import WhatsappForm from "./whatsapp-form.svelte";

  let { data }: { data: PageData } = $props();
</script>

<svelte:head>
  <title>WhatsApp</title>
</svelte:head>

<div class="space-y-6">
  <div>
    <h3 class="text-xl font-medium">WhatsApp</h3>
    <p class="text-muted-foreground text-sm">
      Conecta tu número de WhatsApp Business para enviar facturas por WhatsApp,
      además del correo.
    </p>
  </div>
  <Separator />
  <WhatsappForm data={data.form} accessTokenSet={data.accessTokenSet} />
</div>
