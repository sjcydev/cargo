<script lang="ts">
  import BadgeCheck from "lucide-svelte/icons/badge-check";
  import Bell from "lucide-svelte/icons/bell";
  import ChevronsUpDown from "lucide-svelte/icons/chevrons-up-down";
  import CreditCard from "lucide-svelte/icons/credit-card";
  import LogOut from "lucide-svelte/icons/log-out";
  import Sparkles from "lucide-svelte/icons/sparkles";
  import { Settings } from "lucide-svelte";

  import * as Avatar from "$lib/components/ui/avatar/index.js";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  import { useSidebar } from "$lib/components/ui/sidebar/index.js";
  import { enhance } from "$app/forms";

  let {
    user,
  }: {
    user: {
      nombre: string;
      apellido: string;
      correo: string;
    };
  } = $props();

  const sidebar = useSidebar();
</script>

<Sidebar.Menu>
  <Sidebar.MenuItem>
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        {#snippet child({ props })}
          <Sidebar.MenuButton
            {...props}
            size="lg"
            class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          >
            <Avatar.Root class="h-8 w-8 rounded-lg">
              <Avatar.Fallback class="rounded-lg">CN</Avatar.Fallback>
            </Avatar.Root>
            <div class="grid flex-1 text-left text-sm leading-tight">
              <span class="truncate font-semibold"
                >{user.nombre} {user.apellido}</span
              >
              <span class="truncate text-xs">{user.correo}</span>
            </div>
            <ChevronsUpDown class="ml-auto size-4" />
          </Sidebar.MenuButton>
        {/snippet}
      </DropdownMenu.Trigger>
      <DropdownMenu.Content
        class="w-[--bits-dropdown-menu-anchor-width] min-w-56 rounded-lg"
        side={sidebar.isMobile ? "bottom" : "right"}
        align="end"
        sideOffset={4}
      >
        <DropdownMenu.Label class="p-0 font-normal">
          <div class="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            <Avatar.Root class="h-8 w-8 rounded-lg">
              <Avatar.Fallback class="rounded-lg">CN</Avatar.Fallback>
            </Avatar.Root>
            <div class="grid flex-1 text-left text-sm leading-tight">
              <span class="truncate font-semibold"
                >{user.nombre} {user.apellido}</span
              >
              <span class="truncate text-xs">{user.correo}</span>
            </div>
          </div>
        </DropdownMenu.Label>
        <DropdownMenu.Separator />
        <DropdownMenu.Group>
          <DropdownMenu.Item>
            <Sparkles />
            Upgrade to Pro
          </DropdownMenu.Item>
        </DropdownMenu.Group>
        <DropdownMenu.Separator />
        <DropdownMenu.Group>
          <DropdownMenu.Item>
            <BadgeCheck />
            Account
          </DropdownMenu.Item>
          <DropdownMenu.Item>
            <CreditCard />
            Billing
          </DropdownMenu.Item>

          <a href="/settings">
            <DropdownMenu.Item>
              <Settings />
              Configuración
            </DropdownMenu.Item>
          </a>
        </DropdownMenu.Group>
        <DropdownMenu.Separator />
        <form method="post" action="/logout" class="w-full" use:enhance>
          <button class="w-full">
            <DropdownMenu.Item>
              <LogOut />
              Log out
            </DropdownMenu.Item>
          </button>
        </form>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  </Sidebar.MenuItem>
</Sidebar.Menu>
