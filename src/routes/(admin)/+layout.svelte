<svelte:options runes={true} />

<script lang="ts">
  // Admin route group layout
  // This layout wraps all /admin/* routes
  // Will be enhanced with admin-specific auth guards and UI in later tasks

  let { children } = $props();
</script>

{@render children()}
