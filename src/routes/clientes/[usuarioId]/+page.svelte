<script lang="ts">
  import InnerLayout from "$lib/components/inner-layout.svelte";
  import Input from "$lib/components/ui/input/input.svelte";
  import Separator from "$lib/components/ui/separator/separator.svelte";
  import type { PageData } from "./$types";
  import * as Form from "$lib/components/ui/form";
  import {
    type clientesRegsiterType,
    clientesRegisterSchema,
  } from "$lib/clientes_registrar/schema";
  import type { SuperValidated, Infer } from "sveltekit-superforms";
  import { superForm } from "sveltekit-superforms";
  import { zodClient } from "sveltekit-superforms/adapters";
  import * as Select from "$lib/components/ui/select";
  import { skirt, trousers } from "@lucide/lab";
  import { Icon, User } from "lucide-svelte";
  import Button from "$lib/components/ui/button/button.svelte";
  import { goto, invalidateAll } from "$app/navigation";
  import VerFacturas from "$lib/facturacion/facturas/ver-facturas.svelte";
  import { columns } from "./columns";

  let {
    data,
  }: { data: SuperValidated<Infer<clientesRegsiterType>> & PageData } =
    $props();
  let { sucursales } = data;

  let cliente = $state(data.cliente);

  const form = superForm(data, {
    validators: zodClient(clientesRegisterSchema),
    dataType: "json",
    invalidateAll: "force",
    onResult: async ({ result }) => {
      if (result.type === "success") {
        editMode = false;
        cliente = {
          ...cliente,
          nombre: result.data?.nombre,
          apellido: result.data?.apellido,
        };
        previous = { ...$formData };
        await invalidateAll();
        await goto(`/clientes/${$formData.casillero}`);
      }
    },
  });

  const { form: formData, enhance, message, submit } = form;

  // svelte-ignore state_referenced_locally
  $formData = {
    sucursalId: String(cliente.sucursalId),
    casillero: String(cliente.casillero),
    nombre: cliente.nombre,
    apellido: cliente.apellido,
    correo: cliente.correo,
    telefono: cliente.telefono,
    cedula: cliente.cedula,
    sexo: cliente.sexo,
    id: String(cliente.id),
  };
  let previous = $state({ ...$formData });
  let disableChange = $derived(
    JSON.stringify($formData) === JSON.stringify(previous)
  );

  const sucursalTrigger = $derived(
    sucursales.find((f) => $formData.sucursalId === String(f.sucursalId))
      ?.sucursal ?? "Elige la sucursal"
  );

  let editMode = $state(false);
</script>

<svelte:head>
  <title>{cliente?.nombre} {cliente?.apellido}</title>
</svelte:head>

{#snippet actions()}
  {#if editMode}
    <Button
      variant="outline"
      onclick={() => {
        editMode = false;
      }}>Cancelar</Button
    >
    <Button
      variant="success"
      onclick={() => {
        submit();
      }}
      disabled={disableChange}>Guardar</Button
    >
  {:else}
    <Button variant="outline" onclick={() => (editMode = true)}>Editar</Button>
  {/if}
{/snippet}

<InnerLayout
  title={`${cliente?.nombre} ${cliente?.apellido}`}
  {actions}
  back={true}
>
  <form class="grid" use:enhance method="POST">
    <Form.Field {form} name="casillero">
      <Form.Control>
        {#snippet children({ props })}
          <Form.Label>Casillero</Form.Label>
          <Input
            {...props}
            bind:value={$formData.casillero}
            placeholder="1000"
            disabled={!editMode}
          />
        {/snippet}
      </Form.Control>
      <Form.FieldErrors />
    </Form.Field>

    <Form.Field {form} name="sucursalId">
      <Form.Control>
        {#snippet children({ props })}
          <Form.Label>Sucursal</Form.Label>
          <Select.Root
            type="single"
            bind:value={$formData.sucursalId}
            name={props.name}
            disabled={!editMode}
          >
            <Select.Trigger {...props}>
              {sucursalTrigger}
            </Select.Trigger>
            <Select.Content>
              {#each sucursales as sucursal}
                <Select.Item value={String(sucursal.sucursalId)}>
                  {sucursal.sucursal}
                </Select.Item>
              {/each}
            </Select.Content>
          </Select.Root>
        {/snippet}
      </Form.Control>
      <Form.FieldErrors />
    </Form.Field>

    <div class="grid grid-cols-2 gap-4">
      <Form.Field {form} name="nombre">
        <Form.Control>
          {#snippet children({ props })}
            <Form.Label>Nombre</Form.Label>
            <Input
              {...props}
              bind:value={$formData.nombre}
              placeholder="Max"
              disabled={!editMode}
            />
          {/snippet}
        </Form.Control>
        <Form.FieldErrors />
      </Form.Field>

      <Form.Field {form} name="apellido">
        <Form.Control>
          {#snippet children({ props })}
            <Form.Label>Apellido</Form.Label>
            <Input
              {...props}
              bind:value={$formData.apellido}
              placeholder="Robinson"
              disabled={!editMode}
            />
          {/snippet}
        </Form.Control>
        <Form.FieldErrors />
      </Form.Field>
    </div>

    <Form.Field {form} name="correo">
      <Form.Control>
        {#snippet children({ props })}
          <Form.Label>Correo</Form.Label>
          <Input
            {...props}
            bind:value={$formData.correo}
            placeholder="correo@ejemplo.com"
            disabled={!editMode}
          />
        {/snippet}
      </Form.Control>
      <Form.FieldErrors />
    </Form.Field>

    <Form.Field {form} name="telefono">
      <Form.Control>
        {#snippet children({ props })}
          <Form.Label>Telefono</Form.Label>
          <Input
            {...props}
            bind:value={$formData.telefono}
            placeholder="66606060"
            disabled={!editMode}
          />
        {/snippet}
      </Form.Control>
      <Form.FieldErrors />
    </Form.Field>

    <Form.Field {form} name="cedula">
      <Form.Control>
        {#snippet children({ props })}
          <Form.Label>Cedula</Form.Label>
          <Input
            {...props}
            bind:value={$formData.cedula}
            placeholder="8-888-8888"
            disabled={!editMode}
          />
        {/snippet}
      </Form.Control>
      <Form.FieldErrors />
    </Form.Field>

    <Form.Field {form} name="sexo">
      <Form.Control>
        {#snippet children({ props })}
          <Form.Label>Sexo</Form.Label>
          <Select.Root
            type="single"
            bind:value={$formData.sexo!}
            name={props.name}
            disabled={!editMode}
          >
            <Select.Trigger {...props}>
              {$formData.sexo ? $formData.sexo : "Elige el sexo de la persona"}
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="Masculino" class="flex gap-2">
                <Icon iconNode={trousers} size={20} /> Masculino
              </Select.Item>
              <Select.Item value="Femenino" class="flex gap-2">
                <Icon iconNode={skirt} size={20} /> Femenino
              </Select.Item>
              <Select.Item value="Otros" class="flex gap-2">
                <User size={20} /> Otros
              </Select.Item>
            </Select.Content>
          </Select.Root>
        {/snippet}
      </Form.Control>
      <Form.FieldErrors />
    </Form.Field>
  </form>
  <Separator />
  <div class="flex items-center justify-between my-3">
    <h1 class="text-xl font-bold">Facturas</h1>
    <Button href="/facturas/facturar?search={data.cliente?.casillero}"
      >Facturar</Button
    >
  </div>
  <Separator class="mb-3" />
  <VerFacturas data={cliente.facturas} {columns} />
</InnerLayout>
