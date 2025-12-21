<script lang="ts">
  import * as Dialog from "$lib/components/ui/dialog";
  import * as Form from "$lib/components/ui/form";
  import { Input } from "$lib/components/ui/input";
  import type { Infer, SuperValidated } from "sveltekit-superforms";
  import { type userSignUpType, userSignUpSchema } from "./schema";
  import type { Users, Sucursales } from "$lib/server/db/schema";
  import { superForm } from "sveltekit-superforms/client";
  import { zodClient } from "sveltekit-superforms/adapters";
  import { toast } from "svelte-sonner";
  import { invalidateAll } from "$app/navigation";
  import * as Select from "$lib/components/ui/select";

  let {
    data,
    sucursales,
    open = $bindable(false),
  }: {
    data: SuperValidated<Infer<userSignUpType>>;
    sucursales: Sucursales[];
    open: boolean;
  } = $props();

  const form = superForm(data, {
    validators: zodClient(userSignUpSchema),
    dataType: "json",
    onResult: ({ result }) => {
      if (result.type === "success") {
        toast.success("Usuario creado exitosamente");
        open = false;
        invalidateAll();
      }
    },
  });

  const roles = ["ADMIN", "EMPLEADO", "SECRETARIA"];

  const { form: formData, enhance, errors, submitting } = form;

  $formData.sucursalId = "1";
  $formData.rol = "EMPLEADO";
</script>

<Dialog.Root bind:open>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Añadir Usuario</Dialog.Title>
    </Dialog.Header>

    <Dialog.Description
      >Introduzca los datos del nuevo usuario.</Dialog.Description
    >

    <form method="POST" use:enhance action="?/registrar">
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

      <Form.Field {form} name="username">
        <Form.Control>
          {#snippet children({ props })}
            <Form.Label>Username</Form.Label>
            <Input
              {...props}
              bind:value={$formData.username}
              placeholder="maxrobinson"
            />
          {/snippet}
        </Form.Control>
        <Form.FieldErrors />
      </Form.Field>

      {#if sucursales.length > 1}
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
                  {$formData.sucursalId
                    ? sucursales.find(
                        (sucursal) =>
                          sucursal.sucursalId === Number($formData.sucursalId)
                      )?.sucursal
                    : "Elige la sucursal de la persona"}
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
      {/if}

      <Form.Field {form} name="rol">
        <Form.Control>
          {#snippet children({ props })}
            <Form.Label>Rol</Form.Label>
            <Select.Root
              type="single"
              bind:value={$formData.rol}
              name={props.name}
            >
              <Select.Trigger {...props}>
                {$formData.rol ? $formData.rol : "Elige el rol de la persona"}
              </Select.Trigger>
              <Select.Content>
                {#each roles as rol}
                  <Select.Item value={String(rol)}>
                    {rol}
                  </Select.Item>
                {/each}
              </Select.Content>
            </Select.Root>
          {/snippet}
        </Form.Control>
        <Form.FieldErrors />
      </Form.Field>

      <Form.Field {form} name="password">
        <Form.Control>
          {#snippet children({ props })}
            <Form.Label>Password</Form.Label>
            <Input
              {...props}
              bind:value={$formData.password}
              placeholder="••••••••••••"
              type="password"
            />
          {/snippet}
        </Form.Control>
        <Form.FieldErrors />
      </Form.Field>

      <Form.Field {form} name="confirm">
        <Form.Control>
          {#snippet children({ props })}
            <Form.Label>Confirm Password</Form.Label>
            <Input
              {...props}
              bind:value={$formData.confirm}
              placeholder="••••••••••••"
              type="password"
            />
          {/snippet}
        </Form.Control>
        <Form.FieldErrors />
      </Form.Field>

      <Form.Button class="w-full">Crear cuenta</Form.Button>
    </form>
  </Dialog.Content>
</Dialog.Root>
