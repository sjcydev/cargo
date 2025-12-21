<svelte:options runes={true} />

<script lang="ts">
  // Client portal route group layout
  // This layout wraps all client-facing routes at the root level
  // Will be enhanced with client auth guards and mobile-first UI in later tasks

  let { children } = $props();
</script>

{@render children()}
