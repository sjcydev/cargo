<script lang="ts">
    import type { PageData } from "./$types";
    import SidebarHeader from "$lib/components/sidebar-header.svelte";
    import Button from "$lib/components/ui/button/button.svelte";
    import DataTable from "./data-table.svelte";
    import { columns } from "./columns";
    import * as Tabs from "$lib/components/ui/tabs/index";
    import { Content } from "$lib/components/ui/card";

    import InnerLayout from "$lib/components/inner-layout.svelte";

    let { data }: { data: PageData } = $props();

    let tab = $state("todos");
</script>

<svelte:head>
    <title>Clientes</title>
</svelte:head>

{#snippet actions()}
    <Button href="/clientes/registrar" variant="outline">Crear cliente</Button>
{/snippet}

<InnerLayout title={"Clientes"} {actions}>
    <Tabs.Root value="todos" class="space-y-5">
        {#if data.bySucursal.length > 1}
            <Tabs.List class="border-b border-gray-200">
                <Tabs.Trigger value="todos">Todos</Tabs.Trigger>
                {#each data.bySucursal as sucursal}
                    <Tabs.Trigger value={`${sucursal.nombre}`}
                        >{sucursal.nombre}</Tabs.Trigger
                    >
                {/each}
            </Tabs.List>
        {/if}
        <Tabs.Content value="todos">
            <DataTable {columns} data={data.todos} />
        </Tabs.Content>
        {#each data.bySucursal as bySucursal}
            <Tabs.Content value={`${bySucursal.nombre}`}>
                <DataTable {columns} data={bySucursal.usuarios} />
            </Tabs.Content>
        {/each}
    </Tabs.Root>
</InnerLayout>
