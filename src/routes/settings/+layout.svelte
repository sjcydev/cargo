<script lang="ts">
  import type { Snippet } from "svelte";
  import type { LayoutData } from "./$types";
  import SidebarNav from "$lib/components/settings-navbar.svelte";
  import { Separator } from "$lib/components/ui/separator";
  import InnerLayout from "$lib/components/inner-layout.svelte";
  import { Hotel, House, ScrollText, User, Users, MapPinHouse } from "lucide-svelte";

  let { data, children }: { data: LayoutData; children: Snippet } = $props();

  const navbarItems = [
    { href: "/settings/perfil", title: "Perfil", icon: User },
    { href: "/settings/empresa", title: "Empresa", icon: Hotel },
    { href: "/settings/sucursales", title: "Sucursales", icon: House },
    { href: "/settings/direcciones", title: "Direcciones", icon: MapPinHouse },
    { href: "/settings/usuarios", title: "Usuarios", icon: Users },
    { href: "/settings/facturas", title: "Factura", icon: ScrollText },
  ];
</script>

<InnerLayout title="Configuración">
  <div class="hidden space-y-6 p-4 pb-16 md:block">
    <div class="space-y-0.5">
      <p class="text-muted-foreground">
        {#if data.user!.rol === "ADMIN"}
          Ajusta detalles de la empresa y de los usuarios
        {:else}
          Ajusta los detalles de tu perfil
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
