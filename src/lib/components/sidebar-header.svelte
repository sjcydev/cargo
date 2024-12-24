<script lang="ts">
  import * as Breadcrumb from "$lib/components/ui/breadcrumb/index";
  import { Separator } from "$lib/components/ui/separator/index";
  import * as Sidebar from "$lib/components/ui/sidebar/index";
  import { ChevronLeft } from "lucide-svelte";
  import type { Snippet } from "svelte";

  // title is a string and actions is a svelte component
  let {
    title,
    actions,
    back = false,
  }: { title: string; actions?: Snippet; back?: boolean } = $props();
</script>

<header class="flex h-16 shrink-0 items-center gap-2 border-b px-4">
  <Sidebar.Trigger class="-ml-1" />
  <Separator orientation="vertical" class="mr-2 h-4" />
  <div class="flex justify-between w-full items-center">
    <div class="flex gap-2 items-center">
      {#if back}
        <ChevronLeft
          size={20}
          onclick={() => window.history.back()}
          class="cursor-pointer"
        />
      {/if}
      <h1>{title}</h1>
    </div>

    <div>
      {@render actions?.()}
    </div>
  </div>
</header>
