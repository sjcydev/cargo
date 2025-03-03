<script lang="ts">
  import * as Card from "$lib/components/ui/card";
  import { Input } from "$lib/components/ui/input";
  import * as Form from "$lib/components/ui/form";
  import type { Sucursales, Users } from "$lib/server/db/schema";
  import { userSignUpSchema, type userSignUpType } from "./schema";
  import {
    type SuperValidated,
    type Infer,
    superForm,
  } from "sveltekit-superforms";
  import { zodClient } from "sveltekit-superforms/adapters";
  import * as Select from "$lib/components/ui/select";
  import InnerLayout from "$lib/components/inner-layout.svelte";

  let {
    data,
  }: {
    data: SuperValidated<Infer<userSignUpType>> & {
      user: Users;
      sucursales: Sucursales[];
    };
  } = $props();

  const form = superForm(data, {
    validators: zodClient(userSignUpSchema),
    dataType: "json",
  });

  const { form: formData, enhance } = form;

  const roles = ["ADMIN", "EMPLEADO", "SECRETARIA"];

  $formData.sucursalId = "1";
  $formData.rol = "EMPLEADO";
</script>

<svelte:head>
  <title>Registrar</title>
</svelte:head>

{#snippet children()}
  <div class="grid place-items-center min-h-screen">
    <form class="w-full max-w-sm" method="POST" use:enhance>
      <Card.Root>
        <Card.Header>
          <Card.Title class="text-xl">Registrar</Card.Title>
          <Card.Description
            >Ingrese sus datos para crear una cuenta</Card.Description
          >
        </Card.Header>
        <Card.Content>
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

          {#if data.sucursales.length > 1}
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
                        ? data.sucursales.find(
                            (sucursal) =>
                              sucursal.sucursalId ===
                              Number($formData.sucursalId)
                          )?.sucursal
                        : "Elige la sucursal de la persona"}
                    </Select.Trigger>
                    <Select.Content>
                      {#each data.sucursales as sucursal}
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
                    {$formData.rol
                      ? $formData.rol
                      : "Elige el rol de la persona"}
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
          {#if !data.user}
            <div class="mt-4 text-center text-sm">
              Already have an account?
              <a href="/login" class="underline"> Sign in </a>
            </div>
          {/if}
        </Card.Content>
      </Card.Root>
    </form>
  </div>
{/snippet}

{#if data.user}
  <InnerLayout title={"Registrar Usuario del Sistema"} back={true}>
    {@render children()}
  </InnerLayout>
{:else}
  {@render children()}
{/if}
