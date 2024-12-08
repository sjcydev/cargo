<svelte:options runes={true} />

<script lang="ts">
  import "../app.css";
  import { Toaster } from "$lib/components/ui/sonner";
  import { page } from "$app/stores";
  import SidebarPage from "$lib/components/sidebar-page.svelte";

  let protectedRoutes = new Set([
    "/login",
    "/registrar",
    "/password_update",
    "/onboarding",
  ]);

  let { children } = $props();
  let { user } = $page.data;
</script>

<Toaster position="top-right" richColors />

{#if protectedRoutes.has($page.url.pathname)}
  {@render children()}
{:else}
  <SidebarPage {user}>
    {@render children()}
  </SidebarPage>
{/if}
