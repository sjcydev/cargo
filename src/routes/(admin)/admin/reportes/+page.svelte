<script lang="ts">
  import type { PageData } from "./$types";
  import InnerLayout from "$lib/components/inner-layout.svelte";
  import DataTable from "$lib/components/data-table.svelte";
  import * as Tabs from "$lib/components/ui/tabs";
  import { columns } from "./columns";
  import { Button } from "$lib/components/ui/button";
  import RangeCalendar from "$lib/components/ui/range-calendar/range-calendar.svelte";
  import * as Dialog from "$lib/components/ui/dialog";
  import * as Select from "$lib/components/ui/select";
  import { enhance } from "$app/forms";
  import { today, getLocalTimeZone } from "@internationalized/date";
  import { goto, invalidateAll } from "$app/navigation";
  import { toast } from "$lib/utils";
  import { CalendarDays } from "lucide-svelte";
  import Label from "$lib/components/ui/label/label.svelte";

  let { data }: { data: PageData } = $props();

  let selectedSucursal = $state(
    data.user.sucursalId?.toString() ??
      data.sucursales[0]?.sucursalId.toString()
  );

  const end = today(getLocalTimeZone());
  const start = end.subtract({ days: 7 });

  let value = $state({
    start,
    end,
  });
  let dialogOpen = $state(false);

  function formatDate(date: Date | null) {
    if (!date) return "";
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  function getDateString(date: any) {
    try {
      return date?.toDate(getLocalTimeZone()) ?? null;
    } catch (error) {
      return null;
    }
  }

  function getDateRangeText() {
    const startDate = getDateString(value?.start);
    const endDate = getDateString(value?.end);

    if (startDate && endDate) {
      const start = formatDate(startDate);
      const end = formatDate(endDate);
      return start === end ? start : `${start} - ${end}`;
    }

    return "Selecciona el rango de fechas";
  }

  function handleRowClick(row: any) {
    if (row.reporteId) {
      goto(`/admin/reportes/${row.reporteId}`);
    }
  }

  function selectToday() {
    const todayDate = today(getLocalTimeZone());
    value = {
      start: todayDate,
      end: todayDate,
    };
  }
</script>

<svelte:head>
  <title>Reportes</title>
</svelte:head>

{#snippet actions()}
  <Button onclick={() => (dialogOpen = true)}>Crear reporte</Button>
{/snippet}

<Dialog.Root bind:open={dialogOpen}>
  <Dialog.Content class="sm:max-w-[425px]">
    <Dialog.Header>
      <Dialog.Title>Generar Reporte</Dialog.Title>
      <Dialog.Description>
        Selecciona el rango de fechas y la sucursal para generar el reporte.
      </Dialog.Description>
    </Dialog.Header>

    <form
      action="?/generate"
      method="POST"
      use:enhance={() => {
        return async ({ result }) => {
          if (result.type === "success") {
            if (result.data!.success) {
              dialogOpen = false;
              await invalidateAll();
            }
          } else if (result.type === "failure") {
            toast({ message: result.data!.message as string, type: "error" });
          }
        };
      }}
    >
      <div class="grid gap-4">
        <div class="flex items-center gap-2 p-3 bg-muted rounded-lg">
          <CalendarDays class="size-4 text-muted-foreground" />
          <div
            class="text-sm font-medium text-muted-foreground flex justify-between w-full place-items-center"
          >
            {getDateRangeText()}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onclick={selectToday}
            >
              Hoy
            </Button>
          </div>
        </div>

        <div class="space-y-2">
          <RangeCalendar
            bind:value
            class="rounded-md border grid place-items-center"
          />
          <input
            type="hidden"
            name="fechaInicial"
            value={value?.start?.toString() ?? ""}
          />
          <input
            type="hidden"
            name="fechaFinal"
            value={value?.end?.toString() ?? ""}
          />
        </div>
        {#if data.user.rol === "ADMIN"}
          <div class="grid gap-2">
            <div class="grid gap-1.5">
              <Label for="sucursal" class="text-sm font-medium">Sucursal</Label>
              <Select.Root type="single" bind:value={selectedSucursal}>
                <Select.Trigger id="sucursal"
                  >{selectedSucursal
                    ? (data.sucursales.find(
                        (sucursal) =>
                          sucursal!.sucursalId.toString() === selectedSucursal
                      )?.sucursal ?? "Todas las sucursales")
                    : "Elige una sucursal"}</Select.Trigger
                >
                <Select.Content>
                  <Select.Item value="0">Todas las sucursales</Select.Item>
                  {#each data.sucursales as sucursal}
                    <Select.Item value={String(sucursal!.sucursalId)}>
                      {sucursal!.sucursal}
                    </Select.Item>
                  {/each}
                </Select.Content>
              </Select.Root>
              <input type="hidden" name="sucursalId" value={selectedSucursal} />
            </div>
          </div>
        {/if}
        <Dialog.Footer>
          <Button type="submit" class="w-full">Generar</Button>
        </Dialog.Footer>
      </div>
    </form>
  </Dialog.Content>
</Dialog.Root>

<InnerLayout title="Reportes" {actions}>
  <Tabs.Root
    value={data.user.rol === "ADMIN" ? "todos" : data.sucursales[0]?.sucursal}
    class="space-y-5"
  >
    {#if data.sucursales.length > 1}
      <Tabs.List class="border-b border-gray-200">
        <Tabs.Trigger value="todos">Todos</Tabs.Trigger>
        {#each data.sucursales as sucursal}
          <Tabs.Trigger value={sucursal!.sucursal}>
            {sucursal!.sucursal}
          </Tabs.Trigger>
        {/each}
      </Tabs.List>
    {/if}
    {#if data.user.rol === "ADMIN"}
      <Tabs.Content value="todos">
        <DataTable
          columns={columns(data.user)}
          data={data.reportes}
          onRowClick={handleRowClick}
        />
      </Tabs.Content>
    {/if}
    {#each data.sucursales as sucursal}
      <Tabs.Content value={sucursal!.sucursal}>
        <DataTable
          columns={columns(data.user)}
          data={data.reportes.filter(
            (r) => r.sucursalId === sucursal!.sucursalId
          )}
          onRowClick={handleRowClick}
        />
      </Tabs.Content>
    {/each}
  </Tabs.Root>
</InnerLayout>
