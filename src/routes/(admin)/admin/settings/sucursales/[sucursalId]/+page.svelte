<script lang="ts">
  import type { PageData } from "./$types";
  import { Separator } from "$lib/components/ui/separator";
  import SucursalForm from "./sucursal-form.svelte";
  import Button from "$lib/components/ui/button/button.svelte";
  import { MapPin, Trash2 } from "lucide-svelte";
  import * as Dialog from "$lib/components/ui/dialog";
  import * as Table from "$lib/components/ui/table";
  import { invalidateAll } from "$app/navigation";
  import { toast } from "svelte-sonner";

  let { data }: { data: PageData } = $props();

  let assignDialogOpen = $state(false);
  let selectedAddressIds = $state<Set<number>>(new Set());

  // Get unassigned addresses (all addresses minus assigned ones)
  const assignedIds = $derived(new Set(data.assignedAddresses.map(a => a.addressId)));
  const unassignedAddresses = $derived(
    data.allAddresses.filter(addr => !assignedIds.has(addr.addressId))
  );

  function toggleAddressSelection(addressId: number) {
    const newSet = new Set(selectedAddressIds);
    if (newSet.has(addressId)) {
      newSet.delete(addressId);
    } else {
      newSet.add(addressId);
    }
    selectedAddressIds = newSet;
  }

  async function handleAssignAddresses() {
    if (selectedAddressIds.size === 0) return;

    const promises = Array.from(selectedAddressIds).map(async (addressId) => {
      const formData = new FormData();
      formData.append("sucursalId", String(data.sucursal.sucursalId));
      formData.append("addressId", String(addressId));

      return fetch("?/assignAddress", {
        method: "POST",
        body: formData,
      });
    });

    const results = await Promise.all(promises);
    const allSuccessful = results.every(r => r.ok);

    if (allSuccessful) {
      const count = selectedAddressIds.size;
      toast.success(`${count} ${count === 1 ? 'dirección asignada' : 'direcciones asignadas'} exitosamente`);
      assignDialogOpen = false;
      selectedAddressIds = new Set();
      invalidateAll();
    } else {
      toast.error("Error al asignar algunas direcciones");
    }
  }

  async function handleUnassignAddress(addressId: number) {
    const formData = new FormData();
    formData.append("sucursalId", String(data.sucursal.sucursalId));
    formData.append("addressId", String(addressId));

    const response = await fetch("?/unassignAddress", {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      toast.success("Dirección desasignada exitosamente");
      invalidateAll();
    } else {
      toast.error("Error al desasignar dirección");
    }
  }
</script>

<svelte:head>
  <title>Detalles de la Sucursal | {data.sucursal.sucursal}</title>
</svelte:head>

<div class="space-y-6">
  <div>
    <h3 class="text-xl font-medium">
      Detalles de la Sucursal | {data.sucursal.sucursal}
    </h3>
    <p class="text-muted-foreground text-sm">
      Aquí puedes modificar los detalles de la sucursal seleccionada.
    </p>
  </div>
  <Separator />
  <SucursalForm data={data.form} sucursal={data.sucursal} />

  <Separator />

  <div class="space-y-4">
    <div class="flex justify-between items-center">
      <div>
        <h3 class="text-lg font-medium">Direcciones Asignadas</h3>
        <p class="text-muted-foreground text-sm">
          Gestiona las direcciones físicas de esta sucursal.
        </p>
      </div>
      <Button onclick={() => (assignDialogOpen = true)}>
        <MapPin class="mr-2 h-4 w-4" />
        Asignar Dirección
      </Button>
    </div>

    {#if data.assignedAddresses.length === 0}
      <div class="border rounded-lg p-8 text-center">
        <MapPin class="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
        <h3 class="mt-4 text-lg font-semibold">No hay direcciones asignadas</h3>
        <p class="text-muted-foreground text-sm mt-2">
          Asigna una dirección para comenzar.
        </p>
      </div>
    {:else}
      <div class="border rounded-lg">
        <Table.Root>
          <Table.Header>
            <Table.Row>
              <Table.Head>Nombre</Table.Head>
              <Table.Head>Dirección</Table.Head>
              <Table.Head>Ciudad</Table.Head>
              <Table.Head>País</Table.Head>
              <Table.Head>Teléfono</Table.Head>
              <Table.Head class="w-[100px]">Acciones</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {#each data.assignedAddresses as address}
              <Table.Row>
                <Table.Cell class="font-medium">{address.name}</Table.Cell>
                <Table.Cell>
                  {address.address1}
                  {#if address.address2}
                    <br />
                    <span class="text-muted-foreground text-sm">{address.address2}</span>
                  {/if}
                </Table.Cell>
                <Table.Cell>{address.city}</Table.Cell>
                <Table.Cell>{address.country}</Table.Cell>
                <Table.Cell>{address.tel}</Table.Cell>
                <Table.Cell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onclick={() => handleUnassignAddress(address.addressId)}
                  >
                    <Trash2 class="h-4 w-4" />
                  </Button>
                </Table.Cell>
              </Table.Row>
            {/each}
          </Table.Body>
        </Table.Root>
      </div>
    {/if}
  </div>
</div>

<Dialog.Root bind:open={assignDialogOpen}>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Asignar Direcciones</Dialog.Title>
      <Dialog.Description>
        Selecciona una o más direcciones para asignar a esta sucursal.
      </Dialog.Description>
    </Dialog.Header>

    <div class="space-y-4">
      {#if unassignedAddresses.length === 0}
        <p class="text-muted-foreground text-sm text-center py-4">
          No hay direcciones disponibles para asignar.
        </p>
      {:else}
        <div>
          {#if selectedAddressIds.size > 0}
            <p class="text-sm text-muted-foreground mb-2">
              {selectedAddressIds.size} {selectedAddressIds.size === 1 ? 'dirección seleccionada' : 'direcciones seleccionadas'}
            </p>
          {/if}
          <!-- Scrollable container showing 3.5 cards (each card ~80px = 280px total height) -->
          <div class="space-y-2 overflow-y-auto" style="max-height: 280px;">
            {#each unassignedAddresses as address}
              <button
                type="button"
                class="w-full text-left p-3 border rounded-lg hover:bg-accent transition-colors"
                class:bg-accent={selectedAddressIds.has(address.addressId)}
                class:border-primary={selectedAddressIds.has(address.addressId)}
                onclick={() => toggleAddressSelection(address.addressId)}
              >
                <div class="flex items-start justify-between gap-2">
                  <div class="flex-1">
                    <div class="font-medium">{address.name}</div>
                    <div class="text-sm text-muted-foreground">
                      {address.address1} - {address.city}, {address.country}
                    </div>
                  </div>
                  {#if selectedAddressIds.has(address.addressId)}
                    <div class="flex-shrink-0 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="3"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        class="h-3 w-3 text-primary-foreground"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                  {/if}
                </div>
              </button>
            {/each}
          </div>
        </div>
      {/if}
    </div>

    <Dialog.Footer>
      <Button variant="outline" onclick={() => {
        assignDialogOpen = false;
        selectedAddressIds = new Set();
      }}>
        Cancelar
      </Button>
      <Button
        onclick={handleAssignAddresses}
        disabled={selectedAddressIds.size === 0 || unassignedAddresses.length === 0}
      >
        Asignar {selectedAddressIds.size > 0 ? `(${selectedAddressIds.size})` : ''}
      </Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
