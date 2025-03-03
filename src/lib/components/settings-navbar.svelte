<script lang="ts">
  import { cubicInOut } from "svelte/easing";
  import { crossfade } from "svelte/transition";
  import { cn } from "$lib/utils.js";
  import { Button } from "$lib/components/ui/button";
  import { page } from "$app/state";
  import type { ComponentType } from "svelte";

  let {
    rol,
    items,
    class: className,
  }: {
    rol: string;
    items: { href: string; title: string; icon: any }[];
    class?: string;
  } = $props();

  const [send, receive] = crossfade({
    duration: 250,
    easing: cubicInOut,
  });
</script>

{#snippet sidebarButton(
  item: { href: string; title: string; icon: any },
  isActive: boolean
)}
  <Button
    href={item.href}
    variant="ghost"
    class={cn(
      !isActive && "hover:underline",
      "relative justify-start hover:bg-transparent"
    )}
    data-sveltekit-noscroll
  >
    {#if isActive}
      <div
        class="bg-muted absolute inset-0 rounded-md"
        in:send={{ key: "active-sidebar-tab" }}
        out:receive={{ key: "active-sidebar-tab" }}
      ></div>
    {/if}
    <div class="relative">
      <div class="flex items-center gap-2">
        <item.icon />
        {item.title}
      </div>
    </div>
  </Button>
{/snippet}

<nav
  class={cn("flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1", className)}
>
  {#each items as item}
    {@const isActive = page.url.pathname === item.href}

    {#if rol === "ADMIN"}
      {@render sidebarButton(item, isActive)}
    {:else if item.title === "Perfil"}
      {@render sidebarButton(item, isActive)}
    {:else if rol === "EMPLEADO" && item.title === "Perfil"}
      {@render sidebarButton(item, isActive)}
    {/if}
  {/each}
</nav>
