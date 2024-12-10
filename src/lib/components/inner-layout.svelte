<script lang="ts">
  import type { Snippet } from "svelte";
  import SidebarHeader from "./sidebar-header.svelte";
  let {
    title,
    actions,
    children,
  }: { title: string; actions?: Snippet; children?: Snippet } = $props();
</script>

<SidebarHeader {title} {actions} />

<div class="m-4">
  {@render children?.()}
</div>
