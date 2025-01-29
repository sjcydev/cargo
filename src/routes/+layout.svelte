<svelte:options runes={true} />

<script lang="ts">
  import "../app.css";
  import { Toaster } from "$lib/components/ui/sonner";
  import { page } from "$app/state";
  import SidebarPage from "$lib/components/sidebar-page.svelte";

  let protectedRoutes = new Set([
    "/login",
    "/registrar",
    "/password_update",
    "/onboarding",
  ]);

  let { data, children } = $props();
</script>

<Toaster position="top-right" richColors />

{#if protectedRoutes.has(page.url.pathname)}
  {@render children()}
{:else}
  {#await data.user}
    <h1>Loading...</h1>
  {:then user}
    <SidebarPage {user} logo={data.logo} companyName={data.company}>
      {@render children()}
    </SidebarPage>
  {/await}
{/if}
