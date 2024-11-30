<script lang="ts">
    import type { PageData } from "./$types";
    import SidebarHeader from "$lib/components/sidebar-header.svelte";
    import Button from "$lib/components/ui/button/button.svelte";
    import type { Usuarios } from "$lib/server/db/schema";
    import DataTable from "./data-table.svelte";
    import { columns } from "./columns";

    let { data }: { data: PageData } = $props();

    const dataClientes: Usuarios[] = [
        {
            id: 10,
            casillero: 1,
            nombre: "Pedro",
            apellido: "Perez",
            cedula: "123456789",
            precio: 2.75,
            telefono: "123456789",
            correo: "p@p.com",
            nacimiento: new Date("01/01/2000"),
            sexo: "Masculino",
            sucursalId: 1,
            createdAt: new Date("01/01/2000"),
            updatedAt: new Date("01/01/2000"),
        },
        {
            id: 2,
            casillero: 2,
            nombre: "Pedro",
            apellido: "Perez",
            cedula: "123456789",
            precio: 2.75,
            telefono: "123456789",
            correo: "p@p.com",
            nacimiento: new Date("01/01/2000"),
            sexo: "Masculino",
            sucursalId: 1,
            createdAt: new Date("01/01/2000"),
            updatedAt: new Date("01/01/2000"),
        },
    ];
</script>

<svelte:head>
    <title>Clientes</title>
</svelte:head>

{#snippet actions()}
    <Button href="/clientes/registrar" variant="outline">Crear cliente</Button>
{/snippet}

<SidebarHeader title={"Clientes"} {actions} />

<DataTable {columns} data={dataClientes} />
