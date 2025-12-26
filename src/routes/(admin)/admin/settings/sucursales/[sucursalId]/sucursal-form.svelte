<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import * as Select from "$lib/components/ui/select";
  import { sucursalesSchema, type sucursalesType } from "../schema";
  import {
    superForm,
    type SuperValidated,
    type Infer,
  } from "sveltekit-superforms/client";
  import { zodClient } from "sveltekit-superforms/adapters";
  import * as Form from "$lib/components/ui/form";
  import type { Sucursales } from "$lib/server/db/schema";
  import Separator from "$lib/components/ui/separator/separator.svelte";
  import { Loader2 } from "lucide-svelte";
  import { toast } from "svelte-sonner";
  import { invalidateAll } from "$app/navigation";
  import CountryCodeSelector from "$lib/components/country-code-selector.svelte";

  let {
    data,
    sucursal,
  }: { data: SuperValidated<Infer<sucursalesType>>; sucursal: Sucursales } =
    $props();

  const form = superForm(data, {
    validators: zodClient(sucursalesSchema),
    onResult: ({ result }) => {
      if (result.type === "success") {
        toast.success("Cambios guardados exitosamente");
        invalidateAll();
      }
    },
  });

  const { form: formData, enhance, errors, submitting } = form;

  // Parse existing phone number to extract country code and phone number
  function parsePhoneNumber(phone: string | null) {
    if (!phone) return { code: "+507", number: "" };

    // Split by space if present (e.g., "+507 61234567")
    const parts = phone.split(" ");
    if (parts.length >= 2 && parts[0].startsWith("+")) {
      return { code: parts[0], number: parts.slice(1).join(" ") };
    }

    // Fallback: try to match country code pattern (+ followed by 1-3 digits, then space or more digits)
    const match = phone.match(/^(\+\d{1,3})\s*(.*)$/);
    if (match) {
      return { code: match[1], number: match[2].trim() };
    }

    return { code: "+507", number: phone };
  }

  const parsed = parsePhoneNumber(sucursal.telefono);
  let countryCode = $state(parsed.code);
  let phoneNumber = $state(parsed.number);

  // Update formData.telefono when country code or phone number changes
  // Add space between country code and phone number
  $effect(() => {
    $formData.telefono = countryCode + " " + phoneNumber;
  });

</script>

<form method="POST" action="?/updateSucursal" use:enhance class="space-y-6">
  <input type="hidden" name="sucursalId" value={$formData.sucursalId} />
  <input type="hidden" name="telefono" value={$formData.telefono} />
  <div class="mb-11">
    <div class="grid grid-cols-2 gap-4">
      <Form.Field {form} name="sucursal">
        <Form.Control>
          {#snippet children({ props })}
            <Form.Label>Nombre de la Sucursal</Form.Label>
            <Input
              {...props}
              bind:value={$formData.sucursal}
              placeholder="Sucursal Principal"
            />
          {/snippet}
        </Form.Control>
        <Form.FieldErrors />
      </Form.Field>

      <Form.Field {form} name="codificacion">
        <Form.Control>
          {#snippet children({ props })}
            <Form.Label>Codificación</Form.Label>
            <Input
              {...props}
              bind:value={$formData.codificacion}
              placeholder="XXXX"
            />
          {/snippet}
        </Form.Control>
        <Form.FieldErrors />
      </Form.Field>
    </div>

    <Form.Field {form} name="telefono">
      <Form.Control>
        {#snippet children({ props })}
          <Form.Label>Teléfono</Form.Label>
          <div class="flex gap-2">
            <CountryCodeSelector bind:value={countryCode} />
            <Input
              bind:value={phoneNumber}
              placeholder="6123-4567"
              class="flex-1"
            />
          </div>
        {/snippet}
      </Form.Control>
      <Form.FieldErrors />
    </Form.Field>

    <Form.Field {form} name="correoSucursal">
      <Form.Control>
        {#snippet children({ props })}
          <Form.Label>Correo</Form.Label>
          <Input
            {...props}
            bind:value={$formData.correoSucursal}
            placeholder="correo@ejemplo.com"
          />
        {/snippet}
      </Form.Control>
      <Form.FieldErrors />
    </Form.Field>

    <Form.Field {form} name="direccion">
      <Form.Control>
        {#snippet children({ props })}
          <Form.Label>Dirección</Form.Label>
          <Input
            {...props}
            bind:value={$formData.direccion}
            placeholder="Calle Principal #123"
          />
        {/snippet}
      </Form.Control>
      <Form.FieldErrors />
    </Form.Field>

    <Form.Field {form} name="maps">
      <Form.Control>
        {#snippet children({ props })}
          <Form.Label>Ubicación en el Mapa</Form.Label>
          <Input
            {...props}
            bind:value={$formData.maps}
            placeholder="https://maps.google.com"
          />
        {/snippet}
      </Form.Control>
      <Form.FieldErrors />
    </Form.Field>

    <Form.Field {form} name="precio">
      <Form.Control>
        {#snippet children({ props })}
          <Form.Label>Precio Predeterminado</Form.Label>
          <Input
            {...props}
            type="number"
            bind:value={$formData.precio}
            placeholder="2.75"
            min="0"
            step="0.01"
          />
        {/snippet}
      </Form.Control>
      <Form.FieldErrors />
    </Form.Field>
  </div>

  <Button type="submit" class="w-full" disabled={$submitting}>
    {#if $submitting}
      <Loader2 class="mr-2 h-4 w-4 animate-spin" />
      <span>Guardando cambios...</span>
    {:else}
      Guardar Cambios
    {/if}
  </Button>
</form>
