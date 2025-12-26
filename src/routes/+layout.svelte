<svelte:options runes={true} />

<script lang="ts">
  import "../app.css";
  import { Toaster } from "$lib/components/ui/sonner";
  import { page } from "$app/state";
  import SidebarPage from "$lib/components/sidebar-page.svelte";
  import { SyncLoader as Loader } from "svelte-loading-spinners";
  import { beforeNavigate, afterNavigate } from "$app/navigation";
  import { onMount } from "svelte";
  import { trackWebVitals } from "$lib/utils/performance";

  let protectedRoutes = new Set(["/admin/login", "/password_update", "/admin/onboarding"]);

  let { data, children } = $props();

  let loading = $state(false);
  beforeNavigate(() => {
    loading = true;
  });
  afterNavigate(() => {
    loading = false;
  });

  // Track Core Web Vitals in development
  onMount(() => {
    if (import.meta.env.DEV) {
      trackWebVitals();
    }
  });
</script>

<Toaster position="top-right" richColors />

{#if protectedRoutes.has(page.url.pathname)}
  {@render children()}
{:else}
  {#await data.user}
    <h1>Loading...</h1>
  {:then user}
    {#if !user}
      {@render children()}
    {:else}
      <SidebarPage {user} logo={data.logo} companyName={data.company}>
        {#if loading}
          <div class="flex items-center justify-center h-full">
            <Loader color="#2563EB" />
          </div>
        {:else}
          {@render children()}
        {/if}
      </SidebarPage>
    {/if}
  {/await}
{/if}
