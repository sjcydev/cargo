<script lang="ts">
  import { Button } from "$lib/components/ui/button/index";
  import { Input } from "$lib/components/ui/input/index";
  import { Package2 } from "lucide-svelte";
  import * as Form from "$lib/components/ui/form";

  import { userLoginSchema, type userLoginType } from "./schema";
  import {
    type SuperValidated,
    type Infer,
    superForm,
  } from "sveltekit-superforms";
  import { zodClient } from "sveltekit-superforms/adapters";

  let { data }: { data: SuperValidated<Infer<userLoginType>> } = $props();

  const form = superForm(data, {
    validators: zodClient(userLoginSchema),
    dataType: "json",
  });

  const { form: formData, enhance, message } = form;
</script>

<div class="w-full lg:grid lg:min-h-[600px] lg:grid-cols-2 xl:min-h-screen">
  <div class="flex items-center justify-center py-12">
    <div class="mx-auto grid w-[350px] gap-6">
      <div class="grid gap-2 text-center">
        <div
          class="text-xl flex place-self-center items-center gap-2 font-semibold"
        >
          <Package2 class="h-6 w-6" />
          <span class="">[[COMPANY NAME]]</span>
        </div>
        <h1 class="text-3xl font-bold">Inicio de Sesión</h1>
        <p class="text-balance text-muted-foreground">
          Introduzca tu nombre de usuario y contraseña para iniciar sesión
        </p>
      </div>
      <form class="grid" use:enhance method="POST">
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
              <Form.Label>Contraseña</Form.Label>
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

        {#if $message}
          <div class="text-xs text-red-600">{$message}</div>
        {/if}

        <Form.Button class="w-full mt-2">Iniciar sesión</Form.Button>
      </form>
    </div>
  </div>
  <div class="hidden bg-muted lg:block max-h-screen">
    <img
      src="https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?q=80&w=2865&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
      alt="placeholder"
      class="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
    />
  </div>
</div>
