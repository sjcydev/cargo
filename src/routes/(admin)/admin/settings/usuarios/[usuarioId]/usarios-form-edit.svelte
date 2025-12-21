<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import * as Select from "$lib/components/ui/select";
  import { userUpdateSchema, type userUpdateType } from "./schema";
  import {
    superForm,
    type SuperValidated,
    type Infer,
  } from "sveltekit-superforms/client";
  import { zodClient } from "sveltekit-superforms/adapters";
  import * as Form from "$lib/components/ui/form";
  import { toast } from "svelte-sonner";
  import { invalidateAll } from "$app/navigation";
  import { Loader2 } from "lucide-svelte";
  import type { Sucursales } from "$lib/server/db/schema";
  import Separator from "$lib/components/ui/separator/separator.svelte";

  let {
    data,
    sucursales,
  }: { data: SuperValidated<Infer<userUpdateType>>; sucursales: Sucursales[] } =
    $props();

  const form = superForm(data, {
    validators: zodClient(userUpdateSchema),
    onResult: ({ result }) => {
      if (result.type === "success") {
        toast.success("Cambios guardados exitosamente");
        invalidateAll();
      }
    },
  });

  const roles = ["ADMIN", "EMPLEADO", "SECRETARIA"];

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
            <Input
              {...props}
              bind:value={$formData.nombre}
              placeholder="Nombre"
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
              placeholder="Apellido"
            />
          {/snippet}
        </Form.Control>
        <Form.FieldErrors />
      </Form.Field>
    </div>

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
  </div>

  <div class="space-y-6">
    <div>
      <h2 class="text-lg font-medium">Cambiar Contraseña</h2>
      <p class="mb-4 text-sm text-muted-foreground">
        Cambia la contraseña del usuario para garantizar la seguridad de la
        cuenta.
      </p>
    </div>
    <Separator />

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

  <Button type="submit" class="w-full" disabled={$submitting}>
    {#if $submitting}
      <Loader2 class="mr-2 h-4 w-4 animate-spin" />
      <span>Guardando cambios...</span>
    {:else}
      Guardar Cambios
    {/if}
  </Button>
</form>
