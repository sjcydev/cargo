<script lang="ts">
  import * as Form from "$lib/components/ui/form";
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { Checkbox } from "$lib/components/ui/checkbox";
  import { whatsappSettingsSchema, type WhatsappSettingsType } from "./schema";
  import {
    superForm,
    type SuperValidated,
    type Infer,
  } from "sveltekit-superforms/client";
  import { zodClient } from "sveltekit-superforms/adapters";
  import { Loader2 } from "lucide-svelte";
  import { toast } from "svelte-sonner";
  import { invalidateAll } from "$app/navigation";

  let {
    data,
    accessTokenSet,
  }: {
    data: SuperValidated<Infer<WhatsappSettingsType>>;
    accessTokenSet: boolean;
  } = $props();

  const form = superForm(data, {
    dataType: "json",
    validators: zodClient(whatsappSettingsSchema),
    onUpdated: ({ form }) => {
      const msg = form.message as { type: string; text: string } | undefined;
      if (!msg) return;
      if (msg.type === "success") {
        toast.success(msg.text);
        invalidateAll();
      } else {
        toast.error(msg.text);
      }
    },
  });

  const { form: formData, enhance, submitting } = form;
</script>

<form method="POST" use:enhance class="space-y-6">
  <Form.Field {form} name="enabled">
    <Form.Control>
      {#snippet children({ props })}
        <div class="flex items-center gap-3">
          <Checkbox {...props} bind:checked={$formData.enabled} />
          <Form.Label class="!mt-0">Activar entrega por WhatsApp</Form.Label>
        </div>
      {/snippet}
    </Form.Control>
    <Form.Description>
      Cuando está activo, las facturas también se envían por WhatsApp desde tu
      número de WhatsApp Business. El correo siempre se envía.
    </Form.Description>
    <Form.FieldErrors />
  </Form.Field>

  <Form.Field {form} name="phoneNumberId">
    <Form.Control>
      {#snippet children({ props })}
        <Form.Label>Phone Number ID</Form.Label>
        <Input
          {...props}
          bind:value={$formData.phoneNumberId}
          placeholder="123456789012345"
        />
      {/snippet}
    </Form.Control>
    <Form.Description>
      El identificador de Meta para tu número de WhatsApp Business.
    </Form.Description>
    <Form.FieldErrors />
  </Form.Field>

  <Form.Field {form} name="wabaId">
    <Form.Control>
      {#snippet children({ props })}
        <Form.Label>WABA ID</Form.Label>
        <Input
          {...props}
          bind:value={$formData.wabaId}
          placeholder="098765432109876"
        />
      {/snippet}
    </Form.Control>
    <Form.Description>
      El identificador de tu WhatsApp Business Account.
    </Form.Description>
    <Form.FieldErrors />
  </Form.Field>

  <Form.Field {form} name="accessToken">
    <Form.Control>
      {#snippet children({ props })}
        <Form.Label>Access Token de Meta</Form.Label>
        <Input
          {...props}
          type="password"
          autocomplete="off"
          bind:value={$formData.accessToken}
          placeholder={accessTokenSet
            ? "•••••••• (guardado — déjalo vacío para conservarlo)"
            : "Pega tu token de acceso de Meta"}
        />
      {/snippet}
    </Form.Control>
    <Form.Description>
      El token se guarda cifrado. {accessTokenSet
        ? "Ya hay un token guardado; déjalo vacío para conservarlo."
        : "Aún no hay ningún token guardado."}
    </Form.Description>
    <Form.FieldErrors />
  </Form.Field>

  <Button type="submit" class="w-full" disabled={$submitting}>
    {#if $submitting}
      <Loader2 class="mr-2 h-4 w-4 animate-spin" />
      <span>Guardando cambios...</span>
    {:else}
      Guardar Cambios
    {/if}
  </Button>
</form>
