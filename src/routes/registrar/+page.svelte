<script lang="ts">
  import * as Card from "$lib/components/ui/card";
  import { Input } from "$lib/components/ui/input";
  import * as Form from "$lib/components/ui/form";

  import { userSignUpSchema, type userSignUpType } from "./schema";
  import {
    type SuperValidated,
    type Infer,
    superForm,
  } from "sveltekit-superforms";
  import { zodClient } from "sveltekit-superforms/adapters";

  let { data }: { data: SuperValidated<Infer<userSignUpType>> } = $props();

  const form = superForm(data, {
    validators: zodClient(userSignUpSchema),
    dataType: "json",
  });

  const { form: formData, enhance } = form;
</script>

<div class="grid place-items-center min-h-screen">
  <form class="w-full max-w-sm" method="POST" use:enhance>
    <Card.Root>
      <Card.Header>
        <Card.Title class="text-xl">Registro</Card.Title>
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

        <Form.Field {form} name="secret">
          <Form.Control>
            {#snippet children({ props })}
              <Form.Label>Codigo Secreto</Form.Label>
              <Input
                {...props}
                bind:value={$formData.secret}
                placeholder="••••••••••••"
                type="password"
              />
            {/snippet}
          </Form.Control>
          <Form.FieldErrors />
        </Form.Field>

        <Form.Button class="w-full">Crear cuenta</Form.Button>
        <div class="mt-4 text-center text-sm">
          Already have an account?
          <a href="/login" class="underline"> Sign in </a>
        </div>
      </Card.Content>
    </Card.Root>
  </form>
</div>
