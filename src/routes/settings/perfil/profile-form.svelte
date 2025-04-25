<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import * as Select from "$lib/components/ui/select";
  import { accountSchema, type accountType } from "./schema";
  import {
    superForm,
    type SuperValidated,
    type Infer,
  } from "sveltekit-superforms/client";
  import { zodClient } from "sveltekit-superforms/adapters";
  import * as Form from "$lib/components/ui/form";
  import type { Users } from "$lib/server/db/schema";
  import Separator from "$lib/components/ui/separator/separator.svelte";
  import { Loader2 } from "lucide-svelte";
  import { toast } from "svelte-sonner";
  import { invalidateAll } from "$app/navigation";

  let {
    data,
    user,
  }: { data: SuperValidated<Infer<accountType>>; user: Users } = $props();

  const form = superForm(data, {
    validators: zodClient(accountSchema),
    onResult: ({ result }) => {
      if (result.type === "success") {
        toast.success("Cambios guardados exitosamente");
        invalidateAll();
      }
    },
  });

  const { form: formData, enhance, errors, submitting } = form;
</script>

<form method="POST" use:enhance class="space-y-6">
  <input type="hidden" name="id" value={$formData.id} />
  <div class="mb-11">
    <div class="grid grid-cols-2 gap-4">
      <Form.Field {form} name="nombre">
        <Form.Control>
          {#snippet children({ props })}
            <Form.Label>Nombre</Form.Label>
            <Input {...props} bind:value={$formData.nombre} placeholder="Max" />
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
  </div>

  {#if user.rol === "ADMIN"}
    <div class="space-y-6">
      <div>
        <h2 class="text-lg font-medium">Cambiar Contraseña</h2>
        <p class="mb-4 text-sm text-muted-foreground">
          Cambia tu contraseña para garantizar la seguridad de tu cuenta.
        </p>
      </div>
      <Separator />
      <Form.Field {form} name="oldPassword">
        <Form.Control>
          {#snippet children({ props })}
            <Form.Label>Contraseña Actual</Form.Label>
            <Input
              {...props}
              bind:value={$formData.oldPassword}
              placeholder="••••••••••••"
              type="password"
            />
          {/snippet}
        </Form.Control>
        <Form.FieldErrors />
      </Form.Field>

      <Form.Field {form} name="password">
        <Form.Control>
          {#snippet children({ props })}
            <Form.Label>Contraseña Nueva</Form.Label>
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
            <Form.Label>Confirmar Contraseña Nueva</Form.Label>
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
    </div>
  {/if}

  <Button type="submit" class="w-full" disabled={$submitting}>
    {#if $submitting}
      <Loader2 class="mr-2 h-4 w-4 animate-spin" />
      <span>Guardando cambios...</span>
    {:else}
      Guardar Cambios
    {/if}
  </Button>
</form>
