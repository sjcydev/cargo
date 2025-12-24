<script lang="ts">
  import type { PageData } from "./$types";
  import { Separator } from "$lib/components/ui/separator";
  import DataTable from "$lib/components/data-table.svelte";
  import Button from "$lib/components/ui/button/button.svelte";
  import { columns } from "./columns";
  import { HousePlus } from "lucide-svelte";
  import * as Dialog from "$lib/components/ui/dialog";
  import * as Form from "$lib/components/ui/form";
  import { Input } from "$lib/components/ui/input";
  import type { Infer, SuperValidated } from "sveltekit-superforms";
  import { type sucursalesType, sucursalesSchema } from "./schema";
  import { toast } from "svelte-sonner";
  import { goto, invalidateAll } from "$app/navigation";
  import { superForm } from "sveltekit-superforms/client";
  import { zodClient } from "sveltekit-superforms/adapters";
  import type { Sucursales } from "$lib/server/db/schema";

  let {
    data,
  }: {
    data: SuperValidated<Infer<sucursalesType>> & {
      sucursales: Sucursales[];
      limite: number;
    };
  } = $props();

  const form = superForm(data, {
    validators: zodClient(sucursalesSchema),
    dataType: "json",
    onResult: ({ result }) => {
      if (result.type === "success") {
        toast.success("Sucursal creada exitosamente");
        open = false;
        invalidateAll();
      }
    },
  });

  const { form: formData, enhance, errors, submitting } = form;

  let open = $state(false);

  function handleRowClick(row: Sucursales) {
    goto(`/admin/settings/sucursales/${row.sucursalId}`);
  }
</script>

<svelte:head>
  <title>Detalles de las Sucursales</title>
</svelte:head>

<Dialog.Root bind:open>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Añadir Sucursal</Dialog.Title>
    </Dialog.Header>

    <Dialog.Description
      >Introduzca los datos de la nueva sucursal.</Dialog.Description
    >

    <form method="POST" use:enhance>
      <Form.Field {form} name="sucursal">
        <Form.Control>
          {#snippet children({ props })}
            <Form.Label>Sucursal</Form.Label>
            <Input
              {...props}
              bind:value={$formData.sucursal}
              placeholder="Sucursal Principal"
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

      <Form.Field {form} name="telefono">
        <Form.Control>
          {#snippet children({ props })}
            <Form.Label>Teléfono</Form.Label>
            <Input
              {...props}
              bind:value={$formData.telefono}
              placeholder="+1234567890"
            />
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

      <Dialog.Footer class="mt-4">
        <Button type="submit" class="w-full">Crear Sucursal</Button>
      </Dialog.Footer>
    </form>
  </Dialog.Content>
</Dialog.Root>

<div class="space-y-6">
  <div class="flex justify-between">
    <div>
      <h3 class="text-xl font-medium">Detalles de las Sucursales</h3>
      <p class="text-muted-foreground text-sm">
        Aqui puedes modificar los detalles de las sucursales.
      </p>
    </div>

    {#if data.sucursales.length < data.limite}
      <div>
        <Button onclick={() => (open = true)}
          >Añadir Sucursal <HousePlus /></Button
        >
      </div>
    {/if}
  </div>

  <Separator />

  <DataTable
    {columns}
    data={data.sucursales}
    headerless={true}
    onRowClick={handleRowClick}
  />
  <!-- <SucursalForm data={data.form} sucursal={data.sucursal!} logo={data.logo} /> -->
</div>
