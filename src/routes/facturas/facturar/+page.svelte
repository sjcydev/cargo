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
  let manifiesto = $state(false);
  let casillero = $state("");

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
    codificacion: null,
    sexo: null,
    createdAt: null,
    updatedAt: null,
    sucursal: {} as Sucursales,
    tipo: "REGULAR",
    archivado: false,
    archivadoAt: null,
  } as const;

  let cliente = $state<UsuariosWithSucursal>(
    structuredClone(defaultClienteState),
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
    structuredClone(defaultTrackingsState),
  );

  function resetTrackingInfo() {
    infoTracking = structuredClone(defaultTrackingsState);
    infoTracking.base = cliente.precio;
    infoTracking.precio = infoTracking.base;
  }

  let currPrecio = $derived(
    Number(Number(infoTracking.base) * Number(infoTracking.peso)).toFixed(2),
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
      0,
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
    fileContent = [];
    uploadingFile = false;
  }

  let fileContent = $state<string[]>([]);
  let uploadingFile = $state(false);

  function handleFileUpload(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];

    if (!file) return;

    // Validate file type
    const validTypes = ['text/plain', 'text/csv', 'application/vnd.ms-excel'];
    const validExtensions = ['.txt', '.csv'];
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

    if (!validTypes.includes(file.type) && !validExtensions.includes(fileExtension)) {
      toast({
        message: 'Tipo de archivo inválido. Solo se permiten archivos .txt o .csv',
        type: 'error',
      });
      target.value = ''; // Reset input
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast({
        message: 'El archivo es demasiado grande. Tamaño máximo: 5MB',
        type: 'error',
      });
      target.value = '';
      return;
    }

    uploadingFile = true;
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;

        if (!text || text.trim().length === 0) {
          throw new Error('El archivo está vacío');
        }

        // Parse content - handle both CSV and plain text
        let trackingNumbers: string[];

        if (fileExtension === '.csv') {
          // Parse CSV - handle comma or semicolon separated values
          trackingNumbers = text
            .split(/\r?\n/)
            .flatMap(line => line.split(/[,;]/))
            .map(item => item.trim())
            .filter(item => item.length > 0);
        } else {
          // Parse plain text - one tracking per line
          trackingNumbers = text
            .split(/\r?\n/)
            .map(line => line.trim())
            .filter(line => line.length > 0);
        }

        // Remove duplicates
        trackingNumbers = [...new Set(trackingNumbers)];

        if (trackingNumbers.length === 0) {
          throw new Error('No se encontraron números de tracking válidos en el archivo');
        }

        // Validate we have weight to distribute
        const peso = Number(infoTracking.peso);
        if (!peso || peso <= 0) {
          throw new Error('Debe ingresar un peso válido antes de cargar el archivo');
        }

        fileContent = trackingNumbers;

        toast({
          message: `${trackingNumbers.length} números de tracking cargados exitosamente`,
          type: 'success',
        });

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error al procesar el archivo';
        toast({
          message: errorMessage,
          type: 'error',
        });
        fileContent = [];
        target.value = '';
      } finally {
        uploadingFile = false;
      }
    };

    reader.onerror = () => {
      toast({
        message: 'Error al leer el archivo. Por favor intente de nuevo.',
        type: 'error',
      });
      uploadingFile = false;
      target.value = '';
    };

    reader.readAsText(file);
  }

  function addTracking() {
    if (fileContent.length !== 0) {
      const n = fileContent.length;
      const peso = (Number(infoTracking?.peso) / n).toFixed(4);
      const precio = (Number(currPrecio) / n).toFixed(4);

      fileContent.forEach((f: string) => {
        const newTracking = {
          ...infoTracking,
          numeroTracking: f,
          peso: Number(peso),
          precio: Number(precio),
        };

        facturaInfo.trackings.push(newTracking as NewTrackings);
      });

      fileContent = [];
      resetTrackingInfo();
      open = false; // Close dialog after bulk add
      return;
    }

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
      open = false; // Close dialog after single add
    }

    resetTrackingInfo();
  }

  function deleteTracking(index: number) {
    facturaInfo.trackings = facturaInfo.trackings.filter((_, i) => i !== index);
  }

  function processClienteData(
    data: { cliente?: UsuariosWithSucursal },
    casillero: string,
  ) {
    if (data.cliente) {
      cliente = data.cliente;
      facturaInfo.casillero = cliente.casillero;
      especial = cliente.precio !== precioBase;
      facturaInfo.casillero = cliente.casillero;
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
    if (!casillero.length) {
      resetAll();
      searching = false;
      return;
    }

    try {
      // Check if casillero is ONLY digits (numeric casillero) vs alphanumeric (codificacion)
      const endpoint = /^\d+$/.test(casillero) ? "clientes" : "corporativo";
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
      casillero = page.url.searchParams.get("search") || "";
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
            bind:value={casillero}
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
              value={especial
                ? manifiesto
                  ? "manifiesto"
                  : "especial"
                : "regular"}
              onValueChange={(val) => {
                if (val === "manifiesto") {
                  especial = true;
                  manifiesto = true;
                } else if (val === "especial") {
                  especial = true;
                  manifiesto = false;
                  infoTracking.base = cliente.precio;
                } else {
                  especial = false;
                  infoTracking.base = precioBase;
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
              {#if cliente.tipo == "CORPORATIVO"}
                <div class="flex items-center space-x-2">
                  <RadioGroup.Item value="manifiesto" id="r3" />
                  <Label for="r3">Corporativo por Saco</Label>
                </div>
              {/if}
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
                        {#if !manifiesto}
                          <div class="space-y-2">
                            <Label for="tracking-number"
                              >Numero de Tracking</Label
                            >
                            <Input
                              id="tracking-number"
                              placeholder="1Z999AA1"
                              bind:value={infoTracking.numeroTracking}
                              required
                            />
                          </div>
                        {/if}
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
                        {#if manifiesto}
                          <div class="space-y-2">
                            <Label for="trackings-file" class="flex gap-2 items-center">
                              Trackings
                              {#if uploadingFile}
                                <Loader color="#2563eb" size="16" unit="px" />
                              {/if}
                            </Label>
                            <Input
                              id="trackings-file"
                              type="file"
                              accept=".txt,.csv"
                              onchange={handleFileUpload}
                              disabled={uploadingFile}
                            />
                            {#if fileContent.length > 0}
                              <p class="text-sm text-muted-foreground">
                                {fileContent.length} tracking{fileContent.length !== 1 ? 's' : ''} cargado{fileContent.length !== 1 ? 's' : ''}
                              </p>
                            {/if}
                          </div>
                        {/if}
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
