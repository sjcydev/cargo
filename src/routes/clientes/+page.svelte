<script lang="ts">
    import type { PageData } from "./$types";
    import SidebarHeader from "$lib/components/sidebar-header.svelte";
    import Button from "$lib/components/ui/button/button.svelte";
    import DataTable from "./data-table.svelte";
    import { columns } from "./columns";

    let { data }: { data: PageData } = $props();
</script>

<svelte:head>
    <title>Clientes</title>
</svelte:head>

{#snippet actions()}
    <Button href="/clientes/registrar" variant="outline">Crear cliente</Button>
{/snippet}

<SidebarHeader title={"Clientes"} {actions} />

<DataTable {columns} data={data.clientes} />
