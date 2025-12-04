<script lang="ts" generics="TData">
  import * as Tabs from "$lib/components/ui/tabs/index";
  import type { Snippet } from "svelte";
  import type { Sucursales } from "$lib/server/db/schema";

  type SucursalTabsProps<TData> = {
    sucursales: Sucursales[];
    data: TData[];
    currentSucursal?: string;
    userRole?: string;
    content: Snippet<[{ data: TData[]; sucursal?: Sucursales }]>;
    onSucursalChange?: (sucursal: string) => void;
  };

  let {
    sucursales,
    data,
    currentSucursal = $bindable(),
    userRole = "ADMIN",
    content,
    onSucursalChange,
  }: SucursalTabsProps<TData> = $props();

  // Initialize to "todos" if ADMIN, otherwise first sucursal
  if (!currentSucursal) {
    currentSucursal = userRole === "ADMIN" ? "todos" : sucursales[0]?.sucursal ?? "todos";
  }

  function handleValueChange(value: string) {
    currentSucursal = value;
    onSucursalChange?.(value);
  }

  // Filter data by sucursalId
  function getFilteredData(sucursal?: Sucursales): TData[] {
    if (!sucursal) return data;
    return data.filter(
      (item: any) => item.sucursalId === sucursal.sucursalId
    );
  }
</script>

<Tabs.Root bind:value={currentSucursal} onValueChange={handleValueChange}>
  {#if sucursales.length > 1}
    <Tabs.List class="border-b border-gray-200 mb-5">
      {#if userRole === "ADMIN"}
        <Tabs.Trigger value="todos">Todos</Tabs.Trigger>
      {/if}
      {#each sucursales as sucursal}
        <Tabs.Trigger value={sucursal.sucursal}>
          {sucursal.sucursal}
        </Tabs.Trigger>
      {/each}
    </Tabs.List>
  {/if}

  {#if userRole === "ADMIN"}
    <Tabs.Content value="todos">
      {@render content({ data, sucursal: undefined })}
    </Tabs.Content>
  {/if}

  {#each sucursales as sucursal}
    <Tabs.Content value={sucursal.sucursal}>
      {@render content({ data: getFilteredData(sucursal), sucursal })}
    </Tabs.Content>
  {/each}
</Tabs.Root>
