<script lang="ts">
  import type { PageData } from "./$types";
  import { Separator } from "$lib/components/ui/separator";
  import DataTable from "$lib/components/data-table.svelte";
  import Button from "$lib/components/ui/button/button.svelte";
  import { columns } from "./columns";
  import { MapPin, Info } from "lucide-svelte";
  import * as Dialog from "$lib/components/ui/dialog";
  import * as Tooltip from "$lib/components/ui/tooltip";
  import * as Form from "$lib/components/ui/form";
  import { Input } from "$lib/components/ui/input";
  import { type addressesType, addressesSchema } from "./schema";
  import { toast } from "svelte-sonner";
  import { goto, invalidateAll } from "$app/navigation";
  import { superForm } from "sveltekit-superforms/client";
  import { zodClient } from "sveltekit-superforms/adapters";
  import type { Addresses } from "$lib/server/db/schema";
  import CountrySelector from "./country-selector.svelte";

  let { data }: { data: PageData } = $props();

  const form = superForm(data.form, {
    validators: zodClient(addressesSchema),
    dataType: "json",
    onResult: ({ result }) => {
      if (result.type === "success") {
        toast.success("Dirección creada exitosamente");
        open = false;
        invalidateAll();
      }
    },
  });

  const { form: formData, enhance, errors, submitting } = form;

  let open = $state(false);

  function handleRowClick(row: Addresses) {
    goto(`/settings/direcciones/${row.addressId}`);
  }

  function handleCountryChange(callingCode: string) {
    // Update the telephone field with the country calling code
    $formData.tel = callingCode + " ";
  }
</script>

<svelte:head>
  <title>Gestión de Direcciones</title>
</svelte:head>

<Dialog.Root bind:open>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Añadir Dirección</Dialog.Title>
    </Dialog.Header>

    <Dialog.Description
      >Introduzca los datos de la nueva dirección.</Dialog.Description
    >

    <form method="POST" use:enhance class="space-y-4">
      <Form.Field {form} name="name">
        <Form.Control>
          {#snippet children({ props })}
            <Form.Label>Nombre de la Dirección</Form.Label>
            <Input
              {...props}
              bind:value={$formData.name}
              placeholder="Oficina Principal, Almacén, etc."
            />
          {/snippet}
        </Form.Control>
        <Form.FieldErrors />
      </Form.Field>

      <div class="space-y-2">
        <label
          for="country"
          class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >País</label
        >
        <CountrySelector
          bind:value={$formData.country}
          onCountryChange={handleCountryChange}
        />
        {#if $errors.country}
          <p class="text-destructive text-sm font-medium">{$errors.country}</p>
        {/if}
      </div>

      <Form.Field {form} name="address1">
        <Form.Control>
          {#snippet children({ props })}
            <Form.Label>Dirección Principal</Form.Label>
            <Input
              {...props}
              bind:value={$formData.address1}
              placeholder="Calle Principal #123"
            />
          {/snippet}
        </Form.Control>
        <Form.FieldErrors />
      </Form.Field>

      <Form.Field {form} name="address2">
        <Form.Control>
          {#snippet children({ props })}
            <Form.Label>Dirección Secundaria (Opcional)</Form.Label>
            <Input
              {...props}
              bind:value={$formData.address2}
              placeholder="Apartamento, Suite, etc."
            />
          {/snippet}
        </Form.Control>
        <Form.FieldErrors />
      </Form.Field>

      <div class="grid grid-cols-2 gap-4">
        <Form.Field {form} name="city">
          <Form.Control>
            {#snippet children({ props })}
              <Form.Label>Ciudad</Form.Label>
              <Input
                {...props}
                bind:value={$formData.city}
                placeholder="Panamá"
              />
            {/snippet}
          </Form.Control>
          <Form.FieldErrors />
        </Form.Field>

        <Form.Field {form} name="state">
          <Form.Control>
            {#snippet children({ props })}
              <Form.Label>Estado</Form.Label>
              <Input
                {...props}
                bind:value={$formData.state}
                placeholder="Florida"
              />
            {/snippet}
          </Form.Control>
          <Form.FieldErrors />
        </Form.Field>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <Form.Field {form} name="zipcode">
          <Form.Control>
            {#snippet children({ props })}
              <Form.Label>Código Postal</Form.Label>
              <Input
                {...props}
                bind:value={$formData.zipcode}
                placeholder="00000"
              />
            {/snippet}
          </Form.Control>
          <Form.FieldErrors />
        </Form.Field>

        <Form.Field {form} name="tel">
          <Form.Control>
            {#snippet children({ props })}
              <Form.Label>Teléfono</Form.Label>
              <Input
                {...props}
                bind:value={$formData.tel}
                placeholder="+507 1234-5678"
              />
            {/snippet}
          </Form.Control>
          <Form.FieldErrors />
        </Form.Field>
      </div>

      <Form.Field {form} name="suffix">
        <Form.Control>
          {#snippet children({ props })}
            <div class="flex items-center gap-2">
              <Form.Label>Sufijo (Opcional)</Form.Label>
              <Tooltip.Root>
                <Tooltip.Trigger>
                  <Info class="h-4 w-4 text-muted-foreground" />
                </Tooltip.Trigger>
                <Tooltip.Content>
                  <p class="max-w-xs">
                    El sufijo aparecerá después del nombre y en la dirección
                    secundaria.
                  </p>
                </Tooltip.Content>
              </Tooltip.Root>
            </div>
            <Input
              {...props}
              bind:value={$formData.suffix}
              placeholder="ej. OCEAN"
            />
          {/snippet}
        </Form.Control>
        <Form.FieldErrors />
      </Form.Field>

      <Dialog.Footer class="mt-4">
        <Button type="submit" disabled={$submitting} class="w-full"
          >Crear Dirección</Button
        >
      </Dialog.Footer>
    </form>
  </Dialog.Content>
</Dialog.Root>

<div class="space-y-6">
  <div class="flex justify-between">
    <div>
      <h3 class="text-xl font-medium">Gestión de Direcciones</h3>
      <p class="text-muted-foreground text-sm">
        Aquí puedes gestionar las direcciones disponibles.
      </p>
    </div>

    <div>
      <Button onclick={() => (open = true)}>Añadir Dirección <MapPin /></Button>
    </div>
  </div>

  <Separator />

  <DataTable
    {columns}
    data={data.addresses}
    headerless={true}
    onRowClick={handleRowClick}
  />
</div>
