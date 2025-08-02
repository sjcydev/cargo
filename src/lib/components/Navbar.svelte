<script lang="ts" module>
  import {
    Home,
    Users,
    Package,
    ReceiptText,
    FileSearch,
    BookText,
    Settings,
    UserPlus,
    Handshake,
    FileText,
  } from "lucide-svelte";
  import { page } from "$app/state";

  const data = {
    navMain: [
      {
        icon: Home,
        url: "/",
        title: "Dashboard",
        admin: true,
      },
      {
        icon: Users,
        url: "/clientes",
        title: "Clientes",
        admin: false,
      },
      {
        title: "Facturación",
        url: "/facturas",
        icon: Package,
        isActive: true,
        admin: false,
        items: [
          {
            icon: Package,
            url: "/facturas",
            title: "Facturas",
            admin: false,
          },
          {
            icon: ReceiptText,
            url: "/facturas/facturar",
            title: "Facturar Cliente",
            admin: false,
          },
          {
            url: "/facturas/no_enviadas",
            title: "No Enviadas",
            admin: false,
          },
        ],
      },
      {
        icon: FileSearch,
        url: "/trackings",
        title: "Trackings",
        admin: false,
      },
      {
        icon: BookText,
        url: "/reportes",
        title: "Reportes",
        admin: true,
      },
    ],
    corporativos: [
      {
        icon: Handshake,
        url: "/corporativos",
        title: "Corporativos",
        admin: true,
      },
      {
        title: "Facturación",
        url: "/corporativos/manifiestos",
        icon: FileText,
        isActive: true,
        admin: true,
        items: [
          {
            icon: FileText,
            url: "/corporativos/manifiestos",
            title: "Manifiestos",
            admin: true,
          },
          {
            icon: ReceiptText,
            url: "/corporativos/manifiestos/generar",
            title: "Generar",
            admin: true,
          },
        ],
      },
      {
        icon: FileSearch,
        url: "/trackings",
        title: "Extraviados/Perdidos",
        admin: true,
      },
    ],
  };

  const navSecondary = [
    {
      title: "Crear Usuario",
      url: "/registrar",
      icon: UserPlus,
      admin: true,
    },
    {
      title: "Configuración",
      url: "/settings",
      icon: Settings,
      admin: false,
    },
  ];

  let protectedRoutes = new Set(["/registrar"]);
</script>

<script lang="ts">
  import NavMain from "$lib/components/nav-main.svelte";
  import NavSecondary from "$lib/components/nav-secondary.svelte";
  import NavUser from "$lib/components/nav-user.svelte";
  import NavCorporativo from "./nav-corporativo.svelte";
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  import Command from "lucide-svelte/icons/command";
  import type { ComponentProps } from "svelte";

  type User = {
    nombre: string;
    apellido: string;
    correo: string;
    avatar: any;
    rol: string;
  };

  let {
    ref = $bindable(null),
    user,
    logo,
    companyName,
    ...restProps
  }: ComponentProps<typeof Sidebar.Root> & {
    user: User;
    logo?: string;
    companyName: string;
  } = $props();
</script>

<Sidebar.Root bind:ref variant="inset" {...restProps}>
  <Sidebar.Header>
    <Sidebar.Menu>
      <Sidebar.MenuItem>
        <Sidebar.MenuButton size="lg">
          {#snippet child({ props })}
            <a href="/" {...props}>
              {#if !logo}
                <div
                  class={`bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg`}
                >
                  <Command class="size-4" />
                </div>
              {/if}
              <div class="grid flex-1 text-left text-sm leading-tight">
                {#if logo}
                  <img src={logo} alt="logo" class="max-h-10 mb-2" />
                {:else}
                  <span class="truncate font-semibold">{companyName}</span>
                {/if}
              </div>
            </a>
          {/snippet}
        </Sidebar.MenuButton>
      </Sidebar.MenuItem>
    </Sidebar.Menu>
  </Sidebar.Header>
  <Sidebar.Content>
    <NavMain
      items={data.navMain}
      {protectedRoutes}
      currentRoute={page.url.pathname}
      rol={user.rol as "ADMIN" | "EMPLEADO" | "SECRETARIA" | undefined}
    />
    {#if user.rol === "ADMIN"}
      <NavCorporativo
        items={data.corporativos}
        rol={user.rol}
        {protectedRoutes}
        currentRoute={page.url.pathname}
      />
    {/if}
    <NavSecondary items={navSecondary} rol={user.rol} class="mt-auto" />
  </Sidebar.Content>
  <Sidebar.Footer>
    <NavUser {user} />
  </Sidebar.Footer>
</Sidebar.Root>
