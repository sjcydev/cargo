<script lang="ts" module>
  import BookOpen from "lucide-svelte/icons/book-open";
  import Bot from "lucide-svelte/icons/bot";
  import ChartPie from "lucide-svelte/icons/chart-pie";
  import Frame from "lucide-svelte/icons/frame";
  import LifeBuoy from "lucide-svelte/icons/life-buoy";
  import Map from "lucide-svelte/icons/map";
  import Send from "lucide-svelte/icons/send";
  import Settings2 from "lucide-svelte/icons/settings-2";
  import SquareTerminal from "lucide-svelte/icons/square-terminal";
  import {
    Home,
    User,
    Users,
    Package,
    ReceiptText,
    FileSearch,
    BookText,
  } from "lucide-svelte";

  const data = {
    navMain: [
      {
        icon: Home,
        url: "/",
        title: "Dashboard",
      },
      {
        icon: Users,
        url: "/clientes",
        title: "Clientes",
      },
      {
        title: "Facturación",
        url: "/facturas",
        icon: Package,
        items: [
          {
            icon: Package,
            url: "/facturas",
            title: "Facturas",
          },
          {
            icon: ReceiptText,
            url: "/facturas/facturar",
            title: "Facturar cliente",
          },
        ],
      },
      {
        icon: FileSearch,
        url: "/trackings",
        title: "Trackings",
      },
      {
        icon: BookText,
        url: "/reportes",
        title: "Reportes",
      },
    ],
  };

  let protectedRoutes = new Set(["/reportes", "/registrar"]);
</script>

<script lang="ts">
  import NavMain from "$lib/components/nav-main.svelte";
  import NavSecondary from "$lib/components/nav-secondary.svelte";
  import NavUser from "$lib/components/nav-user.svelte";
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  import Command from "lucide-svelte/icons/command";
  import type { ComponentProps } from "svelte";

  type User = {
    nombre: string;
    apellido: string;
    correo: string;
    avatar: any;
  };

  let {
    ref = $bindable(null),
    user,
    ...restProps
  }: ComponentProps<typeof Sidebar.Root> & {
    user: User;
  } = $props();
</script>

<Sidebar.Root bind:ref variant="inset" {...restProps}>
  <Sidebar.Header>
    <Sidebar.Menu>
      <Sidebar.MenuItem>
        <Sidebar.MenuButton size="lg">
          {#snippet child({ props })}
            <a href="/" {...props}>
              <div
                class="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg"
              >
                <Command class="size-4" />
              </div>
              <div class="grid flex-1 text-left text-sm leading-tight">
                <span class="truncate font-semibold">Acme Inc</span>
              </div>
            </a>
          {/snippet}
        </Sidebar.MenuButton>
      </Sidebar.MenuItem>
    </Sidebar.Menu>
  </Sidebar.Header>
  <Sidebar.Content>
    <NavMain items={data.navMain} {protectedRoutes} />
  </Sidebar.Content>
  <Sidebar.Footer>
    <NavUser {user} />
  </Sidebar.Footer>
</Sidebar.Root>
