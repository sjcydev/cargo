<script lang="ts">
  import type { Snippet } from "svelte";
  import SidebarHeader from "./sidebar-header.svelte";
  let {
    title,
    actions,
    children,
    back = false,
  }: {
    title: string;
    actions?: Snippet;
    children?: Snippet;
    back?: boolean;
  } = $props();
</script>

<SidebarHeader {title} {actions} {back} />

<div class="m-4">
  {@render children?.()}
</div>
