<script lang="ts">
  import * as Form from "$lib/components/ui/form";
  import * as Card from "$lib/components/ui/card";
  import { Input } from "$lib/components/ui/input";
  import * as Select from "$lib/components/ui/select";
  import { Icon, Shirt, User } from "lucide-svelte";
  import { skirt, trousers } from "@lucide/lab";

  import { clientesRegisterSchema, type clientesRegsiterType } from "./schema";
  import {
    type SuperValidated,
    type Infer,
    superForm,
  } from "sveltekit-superforms";
  import { zodClient } from "sveltekit-superforms/adapters";
  import type { Sucursales } from "$lib/server/db/schema";
  import { toast } from "svelte-sonner";
  import { goto } from "$app/navigation";

  let {
    data,
    editMode = false,
    sucursales,
  }: {
    data: SuperValidated<Infer<clientesRegsiterType>>;
    editMode?: boolean;
    sucursales: Sucursales[];
  } = $props();

  const form = superForm(data, {
    validators: zodClient(clientesRegisterSchema),
    dataType: "json",
    onResult: async ({ result }) => {
      if (result.type === "success") {
        toast.success("Cliente registrado con éxito");
        await goto("/clientes");
      }
    },
  });

  const { form: formData, enhance, message } = form;

  const sucursalTrigger = $derived(
    sucursales.find((f) => $formData.sucursalId === String(f.sucursalId))
      ?.sucursal ?? "Elige la sucursal"
  );
</script>

<div class="grid place-items-center h-full">
  <form class="w-full max-w-sm" method="POST" action="?/registrar" use:enhance>
    <Card.Root>
      <Card.Header>
        <Card.Title class="text-xl">Registrar Cliente</Card.Title>
        <Card.Description
          >Ingrese los datos para crear un cliente</Card.Description
        >
      </Card.Header>
      <Card.Content>
        <Form.Field {form} name="sucursalId">
          <Form.Control>
            {#snippet children({ props })}
              <Form.Label>Sucursal</Form.Label>
              <Select.Root
                type="single"
                bind:value={$formData.sucursalId}
                name={props.name}
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
              />
            {/snippet}
          </Form.Control>
          <Form.FieldErrors />
        </Form.Field>

        <Form.Field {form} name="precio">
          <Form.Control>
            {#snippet children({ props })}
              <Form.Label>Precio</Form.Label>
              <Input
                {...props}
                type="number"
                bind:value={$formData.precio}
                placeholder="2.75"
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
                bind:value={$formData.sexo}
                name={props.name}
              >
                <Select.Trigger {...props}>
                  {$formData.sexo
                    ? $formData.sexo
                    : "Elige el sexo de la persona"}
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

        <Form.Button class="w-full">Registrar</Form.Button>
      </Card.Content>
    </Card.Root>
  </form>
</div>
