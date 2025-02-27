<script lang="ts">
  import * as Form from "$lib/components/ui/form";
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import * as Select from "$lib/components/ui/select";
  import {
    companiesSettingsSchema,
    type companiesSettingsType,
  } from "./schema";
  import {
    superForm,
    type SuperValidated,
    type Infer,
    fileProxy,
  } from "sveltekit-superforms/client";
  import { zodClient } from "sveltekit-superforms/adapters";
  import type { Companies } from "$lib/server/db/schema";
  import Separator from "$lib/components/ui/separator/separator.svelte";
  import { Loader2 } from "lucide-svelte";
  import { toast } from "svelte-sonner";
  import { invalidateAll } from "$app/navigation";
  import { FileDrop as Dropzone } from "svelte-droplet";
  import { Upload } from "lucide-svelte";

  let {
    data,
    company,
    logo,
  }: {
    data: SuperValidated<Infer<companiesSettingsType>>;
    company: Companies;
    logo: string;
  } = $props();

  const form = superForm(data, {
    validators: zodClient(companiesSettingsSchema),
    onResult: ({ result }) => {
      if (result.type === "success") {
        toast.success("Cambios guardados exitosamente");
        invalidateAll();
      }
    },
  });

  const { form: formData, enhance, errors, submitting } = form;

  let imgRef = $state<HTMLImageElement | undefined>();

  const file = fileProxy(formData, "logo");
  function handleFiles(files: File[]) {
    if (files.length === 0) {
      if (imgRef) {
        imgRef.src = "";
      }
      return;
    }

    file.set(files[0]);

    const oFReader = new FileReader();
    oFReader.readAsDataURL(files[0]);

    oFReader.onload = function (oFREvent) {
      if (imgRef) {
        imgRef.src = oFREvent.target!.result as string;
      }
    };
  }
</script>

<form method="POST" use:enhance enctype="multipart/form-data" class="space-y-6">
  <input type="hidden" name="companyId" value={$formData.companyId} />
  <Form.Field {form} name="company">
    <Form.Control>
      {#snippet children({ props })}
        <Form.Label>Nombre de la Organización</Form.Label>
        <Input
          {...props}
          bind:value={$formData.company}
          placeholder="ACME Inc"
        />
      {/snippet}
    </Form.Control>
    <Form.FieldErrors />
  </Form.Field>

  <Form.Field {form} name="dominio">
    <Form.Control>
      {#snippet children({ props })}
        <Form.Label>Dominio</Form.Label>
        <Input
          {...props}
          bind:value={$formData.dominio}
          placeholder="compania.com"
        />
      {/snippet}
    </Form.Control>
    <Form.FieldErrors />
  </Form.Field>

  <Form.Field {form} name="logo">
    <Form.Control>
      {#snippet children({ props })}
        <Form.Label>Upload Image</Form.Label>
        <div class="grid place-items-center p-10">
          <img bind:this={imgRef} src={logo} class="max-h-20" alt="logo" />
        </div>
        <Dropzone
          {...props}
          {handleFiles}
          let:droppable
          acceptedMimes={["image/*"]}
          max={1}
          name="logo"
        >
          <div
            class="border-2 border-dashed rounded-lg p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer"
            class:border-blue-500={droppable}
          >
            <div class="flex flex-col items-center justify-center gap-2">
              <Upload size={24} class="text-gray-500" />
              <p class="text-sm text-gray-600">
                Suelta tu imagen aquí o haz clic para subir
              </p>
            </div>
          </div>
        </Dropzone>
        {#if $formData.logo}
          <p class="mt-2 text-sm text-gray-600">
            Archivo seleccionado: {$formData.logo.name}
          </p>
        {/if}
      {/snippet}
    </Form.Control>
    <Form.Description
      >Sube un archivo de imagen (PNG, JPG, GIF)</Form.Description
    >
    <Form.FieldErrors />
  </Form.Field>

  <Button type="submit" class="w-full" disabled={$submitting}>
    {#if $submitting}
      <Loader2 class="mr-2 h-4 w-4 animate-spin" />
      <span>Guardando cambios...</span>
    {:else}
      Guardar Cambios
    {/if}
  </Button>
</form>
