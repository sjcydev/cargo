<script lang="ts">
  import InnerLayout from "$lib/components/inner-layout.svelte";
  import Input from "$lib/components/ui/input/input.svelte";
  import type { PageData } from "./$types";
  import * as Form from "$lib/components/ui/form";
  import * as Card from "$lib/components/ui/card";
  import {
    type clientesRegsiterType,
    clientesRegisterSchema,
  } from "$lib/clientes_registrar/schema";
  import type { SuperValidated, Infer } from "sveltekit-superforms";
  import { superForm } from "sveltekit-superforms";
  import { zodClient } from "sveltekit-superforms/adapters";
  import * as Select from "$lib/components/ui/select";
  import {
    Edit,
    Save,
    User,
    Mail,
    CreditCard,
    Building2,
    Package,
    ReceiptText,
  } from "lucide-svelte";
  import Button from "$lib/components/ui/button/button.svelte";
  import { goto, invalidateAll } from "$app/navigation";
  import VerFacturas from "$lib/facturacion/facturas/ver-facturas.svelte";
  import { columns } from "./columns";
  import { Badge } from "$lib/components/ui/badge";
  import { toast } from "svelte-sonner";

  let {
    data,
  }: { data: SuperValidated<Infer<clientesRegsiterType>> & PageData } =
    $props();
  let { sucursales } = data;

  let cliente = $state(data.cliente);

  const form = superForm(data, {
    validators: zodClient(clientesRegisterSchema),
    dataType: "json",
    invalidateAll: true,
    resetForm: false,
    onResult: async ({ result }) => {
      if (result.type === "success") {
        editMode = false;
        const sucursal = sucursales.find(
          (s) => String(s.sucursalId) === $formData.sucursalId,
        );
        const tipo =
          sucursal?.precio === Number($formData.precio)
            ? "REGULAR"
            : "ESPECIAL";

        cliente = {
          ...cliente,
          nombre: result.data?.nombre,
          apellido: result.data?.apellido,
          casillero: Number($formData.casillero),
          correo: $formData.correo,
          telefono: $formData.telefono,
          cedula: $formData.cedula,
          sucursalId: Number($formData.sucursalId),
          precio: Number($formData.precio),
          tipo,
        };
        previous = { ...$formData };

        // Ensure everything is refreshed
        await invalidateAll();

        // Navigate to the potentially new casillero URL
        if (cliente.casillero !== Number($formData.casillero)) {
          await goto(`/clientes/${$formData.casillero}`);
        }
      }
    },
  });

  const { form: formData, enhance, submit } = form;

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
    precio: cliente.precio,
    id: String(cliente.id),
  };
  let previous = $state({ ...$formData });
  let disableChange = $derived(
    JSON.stringify($formData) === JSON.stringify(previous),
  );

  const sucursalTrigger = $derived(
    sucursales.find((f) => $formData.sucursalId === String(f.sucursalId))
      ?.sucursal ?? "Elige la sucursal",
  );

  const currentTipo = $derived(() => {
    const sucursal = sucursales.find(
      (s) => String(s.sucursalId) === $formData.sucursalId,
    );
    return sucursal?.precio === Number($formData.precio)
      ? "REGULAR"
      : "ESPECIAL";
  });

  let editMode = $state(false);
  let selectedFacturas = $state<number[]>([]);

  function handleSelectionChange(selected: number[]) {
    selectedFacturas = selected;
  }

  function procesarMultiples() {
    if (selectedFacturas.length === 1) {
      goto(`/facturas/${selectedFacturas[0]}`);
    } else if (selectedFacturas.length > 1) {
      goto(`/facturas/multiples?facturas=${selectedFacturas.join(",")}`);
    }
  }

  async function sendEmail(
    e: SubmitEvent & { currentTarget: HTMLFormElement & EventTarget },
  ) {
    e.preventDefault();

    const response = await fetch(`/api/emails/bienvenida`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nombre: $formData.nombre,
        apellido: $formData.apellido,
        casillero: $formData.casillero,
        sucursalId: $formData.sucursalId,
        correo: $formData.correo,
      }),
    });

    if (response.ok) {
      toast.success("Correo de bienvenida enviado!");
    } else {
      toast.error("Hubo un error al enviar el correo. Contacte al tecnico!");
    }
  }

  function restorePreviousState() {
    $formData = { ...previous };
    editMode = false;
  }
</script>

<svelte:head>
  <title>{cliente?.nombre} {cliente?.apellido}</title>
</svelte:head>

{#snippet actions()}
  <div class="flex gap-2">
    <form method="POST" onsubmit={sendEmail}>
      <Button variant="outline" type="submit" class="gap-2">
        <Mail class="w-4 h-4" />
        Reenviar Correo
      </Button>
    </form>
    {#if editMode}
      <Button variant="outline" onclick={restorePreviousState}>Cancelar</Button>
      <Button
        variant="success"
        onclick={() => {
          submit();
        }}
        disabled={disableChange}
        class="gap-2"
      >
        <Save class="w-4 h-4" />
        Guardar
      </Button>
    {:else}
      <Button variant="outline" onclick={() => (editMode = true)} class="gap-2">
        <Edit class="w-4 h-4" />
        Editar
      </Button>
    {/if}
  </div>
{/snippet}


<InnerLayout
  title={`${cliente?.nombre} ${cliente?.apellido}`}
  {actions}
  back={true}
>
  <div class="space-y-6">
    <!-- Client Information Card -->
    <Card.Root>
      <Card.Header>
        <Card.Title class="flex items-center gap-2">
          <User class="w-5 h-5" />
          Información del Cliente
        </Card.Title>
      </Card.Header>
      <Card.Content>
        <form class="space-y-6" use:enhance method="POST">
          <div class="grid md:grid-cols-2 gap-6">
            <!-- Basic Information -->
            <div class="space-y-4">
              <div class="flex items-center gap-2">
                <Package class="w-5 h-5 text-primary" />
                <h3 class="font-semibold">Información Básica</h3>
              </div>

              <Form.Field {form} name="casillero">
                <Form.Control>
                  {#snippet children({ props })}
                    <div class="grid gap-2">
                      <Form.Label>Casillero</Form.Label>
                      <Input
                        {...props}
                        bind:value={$formData.casillero}
                        placeholder="1000"
                        disabled={!editMode}
                      />
                    </div>
                  {/snippet}
                </Form.Control>
                <Form.FieldErrors />
              </Form.Field>

              <Form.Field {form} name="nombre">
                <Form.Control>
                  {#snippet children({ props })}
                    <div class="grid gap-2">
                      <Form.Label>Nombre</Form.Label>
                      <Input
                        {...props}
                        bind:value={$formData.nombre}
                        placeholder="Max"
                        disabled={!editMode}
                      />
                    </div>
                  {/snippet}
                </Form.Control>
                <Form.FieldErrors />
              </Form.Field>

              <Form.Field {form} name="apellido">
                <Form.Control>
                  {#snippet children({ props })}
                    <div class="grid gap-2">
                      <Form.Label>Apellido</Form.Label>
                      <Input
                        {...props}
                        bind:value={$formData.apellido}
                        placeholder="Smith"
                        disabled={!editMode}
                      />
                    </div>
                  {/snippet}
                </Form.Control>
                <Form.FieldErrors />
              </Form.Field>
            </div>

            <!-- Contact Information -->
            <div class="space-y-4">
              <div class="flex items-center gap-2">
                <Mail class="w-5 h-5 text-primary" />
                <h3 class="font-semibold">Información de Contacto</h3>
              </div>

              <Form.Field {form} name="correo">
                <Form.Control>
                  {#snippet children({ props })}
                    <div class="grid gap-2">
                      <Form.Label>Correo</Form.Label>
                      <Input
                        {...props}
                        bind:value={$formData.correo}
                        placeholder="max@example.com"
                        disabled={!editMode}
                        type="email"
                      />
                    </div>
                  {/snippet}
                </Form.Control>
                <Form.FieldErrors />
              </Form.Field>

              <Form.Field {form} name="telefono">
                <Form.Control>
                  {#snippet children({ props })}
                    <div class="grid gap-2">
                      <Form.Label>Teléfono</Form.Label>
                      <Input
                        {...props}
                        bind:value={$formData.telefono}
                        placeholder="+507 6XXX-XXXX"
                        disabled={!editMode}
                      />
                    </div>
                  {/snippet}
                </Form.Control>
                <Form.FieldErrors />
              </Form.Field>

              <Form.Field {form} name="cedula">
                <Form.Control>
                  {#snippet children({ props })}
                    <div class="grid gap-2">
                      <Form.Label>Cédula</Form.Label>
                      <Input
                        {...props}
                        bind:value={$formData.cedula}
                        placeholder="X-XXX-XXXX"
                        disabled={!editMode}
                      />
                    </div>
                  {/snippet}
                </Form.Control>
                <Form.FieldErrors />
              </Form.Field>
            </div>
          </div>

          <!-- Branch and Price Information -->
          <div class="space-y-4 pt-2">
            <div class="flex items-center gap-2">
              <Building2 class="w-5 h-5 text-primary" />
              <h3 class="font-semibold">Sucursal y Precio</h3>
            </div>

            <div class="grid md:grid-cols-2 gap-6">
              <Form.Field {form} name="sucursalId">
                <Form.Control>
                  {#snippet children({ props })}
                    <div class="grid gap-2">
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
                    </div>
                  {/snippet}
                </Form.Control>
                <Form.FieldErrors />
              </Form.Field>

              <Form.Field {form} name="precio">
                <Form.Control>
                  {#snippet children({ props })}
                    <div class="grid gap-2">
                      <Form.Label>Precio</Form.Label>
                      <div class="flex items-center gap-2">
                        <Input
                          {...props}
                          bind:value={$formData.precio}
                          placeholder="2.50"
                          disabled={!editMode}
                          type="number"
                          step="0.01"
                        />
                        <Badge
                          variant={editMode
                            ? currentTipo() === "REGULAR"
                              ? "outline"
                              : "secondary"
                            : cliente.tipo === "REGULAR"
                              ? "outline"
                              : "secondary"}
                          class="py-1.5"
                        >
                          {editMode ? currentTipo() : cliente.tipo}
                        </Badge>
                      </div>
                    </div>
                  {/snippet}
                </Form.Control>
                <Form.FieldErrors />
              </Form.Field>
            </div>
          </div>
        </form>
      </Card.Content>
    </Card.Root>

    <!-- Invoices Section -->
    <Card.Root>
      <Card.Header>
        <div class="flex items-center justify-between">
          <Card.Title class="flex items-center gap-2">
            <CreditCard class="w-5 h-5" />
            Facturas
          </Card.Title>
          <div class="flex items-center gap-2">
            <Button
              variant="outline"
              onclick={procesarMultiples}
              class="gap-2"
              disabled={selectedFacturas.length < 1}
            >
              <Package class="w-4 h-4" />
              Procesar {selectedFacturas.length} factura{selectedFacturas.length ===
              1
                ? ""
                : "s"}
            </Button>
            <Button href="/facturas/facturar/?search={cliente.casillero}"
              ><ReceiptText class="w-4 h-4" /> Facturar Cliente</Button
            >
          </div>
        </div>
      </Card.Header>
      <Card.Content>
        <VerFacturas
          data={cliente.facturas}
          {columns}
          selectionChange={handleSelectionChange}
        />
      </Card.Content>
    </Card.Root>
  </div>
</InnerLayout>
