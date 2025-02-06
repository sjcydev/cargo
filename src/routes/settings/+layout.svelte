<script lang="ts">
  import type { Snippet } from "svelte";
  import type { LayoutData } from "./$types";
  import SidebarNav from "$lib/components/settings-navbar.svelte";
  import { Separator } from "$lib/components/ui/separator";
  import InnerLayout from "$lib/components/inner-layout.svelte";

  let { data, children }: { data: LayoutData; children: Snippet } = $props();

  const navbarItems = [
    { href: "/settings/account", title: "Perfil" },
    { href: "/settings/company", title: "Empresa" },
    { href: "/settings/sucursales", title: "Sucursales" },
    { href: "/settings/users", title: "Usuarios" },
    { href: "/settings/facturas", title: "Factura" },
  ];
</script>

<InnerLayout title="Configuración">
  <div class="hidden space-y-6 p-4 pb-16 md:block">
    <div class="space-y-0.5">
      <p class="text-muted-foreground">
        {#if data.user!.rol === "ADMIN"}
          Ajusta detalles de la empresa y de los usuarios
        {:else}
          Ajuste de perfil
        {/if}
      </p>
    </div>
    <Separator class="my-6" />
    <div class="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
      <aside class="-mx-4 lg:w-1/5">
        <SidebarNav items={navbarItems} rol={data.user!.rol} />
      </aside>
      <div class="flex-1 lg:max-w-2xl">
        {@render children()}
      </div>
    </div>
  </div>
</InnerLayout>
