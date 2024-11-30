<script lang="ts">
  import * as Breadcrumb from "$lib/components/ui/breadcrumb/index";
  import { Separator } from "$lib/components/ui/separator/index";
  import * as Sidebar from "$lib/components/ui/sidebar/index";
  import type { Snippet } from "svelte";

  // title is a string and actions is a svelte component
  let { title, actions }: { title: string; actions?: Snippet } = $props();
</script>

<header class="flex h-16 shrink-0 items-center gap-2 border-b px-4">
  <Sidebar.Trigger class="-ml-1" />
  <Separator orientation="vertical" class="mr-2 h-4" />
  <div class="flex justify-between w-full items-center">
    <h1>{title}</h1>

    {@render actions?.()}
  </div>
</header>
