<script lang="ts">
  import * as Collapsible from "$lib/components/ui/collapsible/index.js";
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  import ChevronRight from "lucide-svelte/icons/chevron-right";
  import { cn } from "$lib/utils";
  import { type ClassValue } from "clsx";

  let {
    items,
    protectedRoutes,
    currentRoute,
    rol,
  }: {
    items: {
      title: string;
      url: string;
      // This should be `Component` after lucide-svelte updates types
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      icon: any;
      isActive?: boolean;
      admin: boolean;
      items?: {
        title: string;
        url: string;
        admin: boolean;
      }[];
    }[];
    currentRoute: string;
    protectedRoutes: Set<string>;
    rol: "ADMIN" | "EMPLEADO" | "SECRETARIA" | undefined;
  } = $props();
</script>

<Sidebar.Group>
  <Sidebar.GroupLabel>Sistema</Sidebar.GroupLabel>
  <Sidebar.Menu>
    {#each items as mainItem (mainItem.title)}
      {#if (!protectedRoutes.has(mainItem.url) && (rol === "ADMIN" || !mainItem.admin)) || (mainItem.url === "/reportes" && rol === "SECRETARIA")}
        <Collapsible.Root open={mainItem.isActive}>
          {#snippet child({ props })}
            <Sidebar.MenuItem {...props}>
              <Sidebar.MenuButton>
                {#snippet tooltipContent()}
                  {mainItem.title}
                {/snippet}
                {#snippet child({ props })}
                  <a
                    href={mainItem.url}
                    {...props}
                    class={cn(
                      props.class as ClassValue,
                      "hover:text-primary",
                      `${(currentRoute.startsWith(mainItem.url) && mainItem.url !== "/") || currentRoute === mainItem.url ? "bg-muted text-primary" : ""}`
                    )}
                  >
                    <mainItem.icon />
                    <span>{mainItem.title}</span>
                  </a>
                {/snippet}
              </Sidebar.MenuButton>
              {#if mainItem.items?.length}
                <Collapsible.Trigger>
                  {#snippet child({ props })}
                    <Sidebar.MenuAction
                      {...props}
                      class="data-[state=open]:rotate-90"
                    >
                      <ChevronRight />
                      <span class="sr-only">Toggle</span>
                    </Sidebar.MenuAction>
                  {/snippet}
                </Collapsible.Trigger>
                <Collapsible.Content>
                  <Sidebar.MenuSub>
                    {#each mainItem.items as subItem (subItem.title)}
                      {#if (!subItem.admin && rol !== "ADMIN") || rol === "ADMIN"}
                        <Sidebar.MenuSubItem>
                          <Sidebar.MenuSubButton
                            href={subItem.url}
                            class={cn(
                              "hover:text-primary",
                              `${(currentRoute.startsWith(subItem.url) && subItem.url !== "/facturas") || currentRoute === subItem.url || (subItem.url === "/facturas" && /^\/facturas\/\d+/.test(currentRoute)) ? "bg-muted text-primary" : ""}`
                            )}
                          >
                            <span>{subItem.title}</span>
                          </Sidebar.MenuSubButton>
                        </Sidebar.MenuSubItem>
                      {/if}
                    {/each}
                  </Sidebar.MenuSub>
                </Collapsible.Content>
              {/if}
            </Sidebar.MenuItem>
          {/snippet}
        </Collapsible.Root>
      {/if}
    {/each}
  </Sidebar.Menu>
</Sidebar.Group>
