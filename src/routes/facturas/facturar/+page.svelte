<script lang="ts">
  import type { PageData } from "./$types";
  import InnerLayout from "$lib/components/inner-layout.svelte";
  import * as Card from "$lib/components/ui/card";
  import { Label } from "$lib/components/ui/label";
  import { Input } from "$lib/components/ui/input";
  import { Button } from "$lib/components/ui/button";
  import * as RadioGroup from "$lib/components/ui/radio-group";
  import * as Dialog from "$lib/components/ui/dialog";
  import { Separator } from "$lib/components/ui/separator";
  import { PlusIcon, PencilIcon, TrashIcon } from "lucide-svelte";
  import { Rainbow as Loader } from "svelte-loading-spinners";
  import type {
    NewUsuarios,
    NewFacturas,
    NewTrackings,
    Users,
    UsuariosWithSucursal,
    Sucursales,
  } from "$lib/server/db/schema";
  import debounce from "debounce";
  import { toast } from "$lib/utils";
  import * as Table from "$lib/components/ui/table";
  import { fetchClienteData } from "$lib/facturacion/facturar/utils";
  import type { Tracking } from "$lib/facturacion/facturar/types";
  import { enhance } from "$app/forms";
  import { page } from "$app/state";
  import { today } from "@internationalized/date";

  let { data }: { data: PageData } = $props();

  let { user, sucursales } = data;
  let { precio: precioBase } = sucursales!;

  let open = $state(false);
  let editMode = $state(false);
  let currentTracking = $state<number | null>(null);
  let especial = $state(false);
  let searching = $state(false);

  const defaultClienteState = {
    id: 0,
    nombre: "",
    apellido: "",
    correo: "",
    precio: precioBase,
    telefono: "",
    casillero: null,
    cedula: "",
    sucursalId: sucursales!.sucursalId,
    nacimiento: today("America/Panama").toDate("America/Panama"),
    sexo: null,
    createdAt: null,
    updatedAt: null,
    sucursal: {} as Sucursales,
    tipo: "REGULAR",
    archivado: false,
    archivadoAt: null,
  } as const;

  let cliente = $state<UsuariosWithSucursal>(
    structuredClone(defaultClienteState)
  );

  const defaultTrackingsState = {
    numeroTracking: "",
    peso: 1,
    // svelte-ignore state_referenced_locally
    precio: cliente.precio,
    // svelte-ignore state_referenced_locally
    base: cliente.precio,
  } as const;

  let infoTracking = $state<Tracking | NewTrackings>(
    structuredClone(defaultTrackingsState)
  );

  function resetTrackingInfo() {
    infoTracking = structuredClone(defaultTrackingsState);
    infoTracking.base = cliente.precio;
    infoTracking.precio = infoTracking.base;
  }

  let currPrecio = $derived(
    Number(Number(infoTracking.base) * Number(infoTracking.peso)).toFixed(2)
  );

  let facturaInfo = $state<NewFacturas & { trackings: NewTrackings[] }>({
    casillero: null,
    trackings: [] as NewTrackings[],
    total: 0,
    empleadoId: user!.id,
    sucursalId: sucursales!.sucursalId,
    clienteId: 0,
    fecha: "",
  });

  $effect(() => {
    facturaInfo.total = facturaInfo.trackings.reduce(
      (sum, tracking) => sum + Number(tracking.precio),
      0
    );
  });

  function resetAll() {
    cliente = structuredClone(defaultClienteState);
    facturaInfo = structuredClone({
      casillero: null,
      trackings: [],
      total: 0,
      empleadoId: user!.id,
      sucursalId: sucursales!.sucursalId,
      clienteId: 0,
      fecha: "",
    });
    resetTrackingInfo();
  }

  function resetEditMode() {
    open = false;
    editMode = false;
    currentTracking = null;
  }

  function addTracking() {
    const newTracking = {
      ...infoTracking,
      precio: Number(currPrecio),
    } as NewTrackings;

    if (editMode && currentTracking !== null) {
      const updatedTrackings = [...facturaInfo.trackings];
      updatedTrackings[currentTracking] = newTracking;
      facturaInfo.trackings = updatedTrackings;
      resetEditMode();
    } else {
      facturaInfo.trackings = [...facturaInfo.trackings, newTracking];
    }

    resetTrackingInfo();
  }

  function deleteTracking(index: number) {
    facturaInfo.trackings = facturaInfo.trackings.filter((_, i) => i !== index);
  }

  function processClienteData(
    data: { cliente?: UsuariosWithSucursal },
    casillero: string
  ) {
    if (data.cliente) {
      cliente = data.cliente;
      especial = cliente.precio !== precioBase;
      infoTracking.base = cliente.precio;
      infoTracking.precio = infoTracking.base;
    } else {
      toast({
        message: `No existe el casillero ${casillero}`,
        type: "warning",
      });
      resetAll();
    }
  }

  const handleCasilleroChange = debounce(async () => {
    const casillero = String(facturaInfo.casillero);
    if (!casillero.length) {
      resetAll();
      searching = false;
      return;
    }

    try {
      const endpoint = /\d/.test(casillero) ? "clientes" : "corporativo";
      const data = await fetchClienteData(endpoint, casillero, user as Users);
      processClienteData(data, String(casillero));
    } catch (error) {
      console.error("Error fetching client data:", error);
      resetAll();
    } finally {
      searching = false;
    }
  }, 1500);

  $effect(() => {
    if (page.url.searchParams.get("search")) {
      searching = true;
      facturaInfo.casillero =
        Number(page.url.searchParams.get("search")) || null;
      handleCasilleroChange();
    }
  });
</script>

<svelte:head>
  <title>Facturar Cliente</title>
</svelte:head>

<InnerLayout title={"Facturar"}>
  <div class="space-y-2">
    <Card.Root>
      <Card.Content class="px-6 py-5">
        <Label for="casillero" class="flex gap-1 items-center">
          Casillero
          {#if searching}
            <Loader color="#2563eb" size="20" unit="px" />
          {/if}
        </Label>
        <div class="flex gap-3 mt-1">
          <Input
            id="casillero"
            placeholder="Introduzca el Casillero del Cliente"
            bind:value={facturaInfo.casillero}
            oninput={() => {
              searching = true;
              handleCasilleroChange();
            }}
          />
          <Button>
            {#if searching}
              <div class="px-1">
                <Loader color="white" size="30" unit="px" />
              </div>
            {:else}
              <span class="px-[0.08rem]">Buscar</span>
            {/if}
          </Button>
        </div>
      </Card.Content>
    </Card.Root>

    <Card.Root>
      <Card.Content class="pt-6">
        <Card.Title><h2 class="text-xl mb-2">Detalles</h2></Card.Title>
        <div class="grid gap-4">
          <div>
            <Label for="customer-name">Nombre del Cliente</Label>
            <div class="flex gap-4">
              <Input
                id="customer-name"
                readonly
                class="focus-visible:ring-0"
                bind:value={cliente.nombre}
                placeholder="NOMBRE"
              />
              <Input
                readonly
                class="focus-visible:ring-0"
                bind:value={cliente.apellido}
                placeholder="APELLIDO"
              />
            </div>
          </div>
          <div>
            <Label for="correo">Correo</Label>
            <Input
              id="correo"
              readonly
              class="focus-visible:ring-0"
              bind:value={cliente.correo}
              placeholder="CORREO"
            />
          </div>
          {#if cliente.casillero}
            <div class="flex gap-4">
              <div class="w-full">
                <Label for="sucursal">Sucursal</Label>
                <Input
                  id="sucursal"
                  readonly
                  class="focus-visible:ring-0"
                  bind:value={cliente.sucursal.sucursal}
                  placeholder="SUCURSAL"
                />
              </div>
              <div class="w-full">
                <Label for="tipo">Tipo de Cliente</Label>
                <Input
                  id="tipo"
                  readonly
                  class="focus-visible:ring-0"
                  bind:value={cliente.tipo}
                  placeholder="TIPO"
                />
              </div>
            </div>
          {/if}
          {#if cliente.id}
            <Card.Title class="text-lg">Tipo de Casillero</Card.Title>
            <RadioGroup.Root
              value={especial ? "especial" : "regular"}
              onValueChange={(val) => {
                especial = val === "especial";

                if (val !== "especial") {
                  infoTracking.base = precioBase;
                } else {
                  infoTracking.base = cliente.precio;
                }
              }}
            >
              <div class="flex items-center space-x-2">
                <RadioGroup.Item value="regular" id="r1" />
                <Label for="r1">Cliente Casillero</Label>
              </div>
              <div class="flex items-center space-x-2">
                <RadioGroup.Item value="especial" id="r2" />
                <Label for="r2">Cliente Precio Especial</Label>
              </div>
            </RadioGroup.Root>

            <Separator />

            <Card.Title>
              <div class="flex justify-between items-center">
                <p class="text-xl">Paquetes</p>
                <Dialog.Root
                  bind:open
                  onOpenChange={(val) => {
                    if (!val) {
                      resetEditMode();
                      resetTrackingInfo();
                    }
                  }}
                >
                  <Dialog.Trigger>
                    <Button
                      size="icon"
                      variant="default"
                      class="w-full px-3 space-x-2"
                    >
                      <PlusIcon class="h-4 w-4" />
                      <span class="font-semibold">Añadir Tracking</span>
                    </Button>
                  </Dialog.Trigger>
                  <Dialog.Content class="sm:max-w-[425px]">
                    <form
                      method="POST"
                      onsubmit={(e) => {
                        e.preventDefault();
                        addTracking();
                      }}
                    >
                      <Dialog.Header>
                        <Dialog.Title
                          >{editMode ? "Editar" : "Añadir"} Tracking</Dialog.Title
                        >
                      </Dialog.Header>
                      <div class="grid gap-2 mb-1">
                        <div class="space-y-2">
                          <Label for="item-quantity">Peso (lbs)</Label>
                          <Input
                            id="item-quantity"
                            type="number"
                            bind:value={infoTracking.peso}
                            required
                          />
                        </div>
                        <div class="space-y-2">
                          <Label for="tracking-number">Numero de Tracking</Label
                          >
                          <Input
                            id="tracking-number"
                            placeholder="1Z999AA1"
                            bind:value={infoTracking.numeroTracking}
                            required
                          />
                        </div>
                        <div class="space-y-2">
                          <Label for="precio">Precio</Label>
                          <Input
                            id="precio"
                            type="number"
                            bind:value={infoTracking.base}
                            step={0.01}
                            required
                            readonly={!especial && !editMode}
                          />
                        </div>
                        <div class="space-y-2">
                          <Label for="total">Total</Label>
                          <Input
                            id="total"
                            type="number"
                            value={currPrecio}
                            readonly
                          />
                        </div>
                      </div>
                      <Dialog.Footer class="mt-3">
                        <Button class="w-full" type="submit"
                          >{editMode ? "Editar" : "Añadir"}</Button
                        >
                      </Dialog.Footer>
                    </form>
                  </Dialog.Content>
                </Dialog.Root>
              </div>
            </Card.Title>
            <div class="border rounded-lg overflow-hidden">
              <Table.Root>
                <Table.Header>
                  <Table.Row>
                    <Table.Head class="sm:px-3 w-full">Tracking #</Table.Head>
                    <Table.Head class="sm:px-3 whitespace-nowrap"
                      >Peso (lbs)</Table.Head
                    >
                    <Table.Head class="sm:px-3 whitespace-nowrap text-right"
                      >Total</Table.Head
                    >
                    <Table.Head class="w-[100px]"></Table.Head>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {#if facturaInfo.trackings.length < 1}
                    <Table.Row>
                      <Table.Cell class="sm:px-3 py-5 text-center" colspan={7}>
                        <div
                          class="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm"
                        >
                          <div
                            class="flex flex-col items-center gap-1 text-center"
                          >
                            <p
                              class="italic font-medium text-muted-foreground p-6"
                            >
                              No hay trackings
                            </p>
                          </div>
                        </div></Table.Cell
                      >
                    </Table.Row>
                  {/if}
                  {#each facturaInfo.trackings as tracking, index}
                    <Table.Row>
                      <Table.Cell class="sm:px-3 py-3 w-full"
                        >{tracking.numeroTracking}</Table.Cell
                      >
                      <Table.Cell class="sm:px-3 py-3 whitespace-nowrap"
                        >{tracking.peso}</Table.Cell
                      >
                      <Table.Cell
                        class="sm:px-3 py-3 whitespace-nowrap text-right"
                        >${Number(tracking.precio).toFixed(2)}</Table.Cell
                      >
                      <Table.Cell class="sm:px-3 py-3">
                        <div class="flex items-center gap-2">
                          <Button
                            size="icon"
                            variant="outline"
                            onclick={() => {
                              open = true;
                              editMode = true;
                              currentTracking = index;
                              infoTracking = tracking;
                            }}
                          >
                            <PencilIcon class="h-4 w-4" />
                            <span class="sr-only">Edit Parcel</span>
                          </Button>
                          <Button
                            size="icon"
                            variant="outline"
                            onclick={() => deleteTracking(index)}
                          >
                            <TrashIcon class="h-4 w-4" />
                            <span class="sr-only">Delete Parcel</span>
                          </Button>
                        </div>
                      </Table.Cell>
                    </Table.Row>
                  {/each}
                </Table.Body>
              </Table.Root>
            </div>
            <div class="grid gap-4">
              <Separator />
              <div class="flex items-center justify-between">
                <div class="font-medium">Total</div>
                <div class="text-2xl font-bold">
                  ${facturaInfo.total?.toFixed(2)}
                </div>
              </div>
              <div class="flex justify-end gap-2">
                <form
                  method="POST"
                  use:enhance={() => {
                    return async ({ result }) => {
                      if (result.type === "success") {
                        toast({
                          message: "Factura creada exitosamente",
                          type: "success",
                        });
                        resetAll();
                      }
                    };
                  }}
                >
                  <input
                    type="hidden"
                    name="facturaInfo"
                    value={JSON.stringify(facturaInfo)}
                  />
                  <input
                    type="hidden"
                    name="cliente"
                    value={JSON.stringify(cliente)}
                  />
                  <Button type="submit">Crear Factura</Button>
                </form>
              </div>
            </div>
          {/if}
        </div>
      </Card.Content>
    </Card.Root>
  </div>
</InnerLayout>
