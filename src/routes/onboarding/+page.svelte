<script lang="ts">
  import * as Card from "$lib/components/ui/card";
  import { Input } from "$lib/components/ui/input";
  import * as Form from "$lib/components/ui/form";
  import { Button } from "$lib/components/ui/button";

  import {
    userSignUpSchema,
    sucursalesSchema,
    type userSignUpType,
  } from "./schema";
  import {
    type SuperValidated,
    type Infer,
    superForm,
  } from "sveltekit-superforms";

  import { zod } from "sveltekit-superforms/adapters";

  let {
    data,
  }: {
    data: SuperValidated<Infer<userSignUpType>>;
  } = $props();

  let currentStep = $state(0);

  const steps = [
    { schema: sucursalesSchema, title: "Información de la Sucursal" },
    { schema: userSignUpSchema, title: "Información del Usuario" },
  ];

  const form = superForm(data, {
    dataType: "json",
    async onSubmit({ cancel }) {
      if (currentStep === steps.length - 1) return;
      cancel();

      const result = await validateForm({ update: true });
      if (result.valid) {
        currentStep = currentStep + 1;
      }
    },
    async onUpdated({ form }) {
      if (form.valid) currentStep = 0;
    },
  });

  const { form: formData, enhance, validateForm, options } = form;

  $effect(() => {
    options.validators = zod(steps[currentStep].schema);
  });
</script>

<svelte:head>
  <title>Onboarding</title>
</svelte:head>

<div class="grid place-items-center min-h-screen">
  <form class="w-full max-w-sm" method="POST" use:enhance>
    <Card.Root>
      <Card.Header>
        <Card.Title class="text-xl"
          >Onboarding – Paso {currentStep + 1} de {steps.length}</Card.Title
        >
        <Card.Description>
          {steps[currentStep].title}
        </Card.Description>
      </Card.Header>
      <Card.Content>
        {#if currentStep === 0}
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

          <Form.Field {form} name="precio">
            <Form.Control>
              {#snippet children({ props })}
                <Form.Label>Precio Predeterminado</Form.Label>
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
        {:else if currentStep === 1}
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
        {/if}
      </Card.Content>
      <Card.Footer class="flex justify-between">
        {#if currentStep < steps.length - 1}
          <Button
            type="button"
            variant="outline"
            onclick={() => {
              currentStep -= 1;
            }}>Previous</Button
          >
        {:else}
          <div></div>
        {/if}

        {#if currentStep === steps.length - 1}
          <Button type="submit" class="w-full">Crear Cuenta</Button>
        {:else}
          <Button type="submit">Next</Button>
        {/if}
      </Card.Footer>
    </Card.Root>
  </form>
  <div class="mt-4 text-center text-sm">
    Already have an account?
    <a href="/login" class="underline"> Sign in </a>
  </div>
</div>
