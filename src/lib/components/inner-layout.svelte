<script>
  import SidebarHeader from "./sidebar-header.svelte";
  let { title, actions, children } = $props();
</script>

<SidebarHeader {title} {actions} />

<div class="m-4">
  {@render children()}
</div>
