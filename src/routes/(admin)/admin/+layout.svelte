<svelte:options runes={true} />

<script lang="ts">
  import "../../../app.css";
  import { Toaster } from "$lib/components/ui/sonner";
  import { page } from "$app/state";
  import SidebarPage from "$lib/components/sidebar-page.svelte";
  import { SyncLoader as Loader } from "svelte-loading-spinners";
  import { beforeNavigate, afterNavigate } from "$app/navigation";
  import type { LayoutData } from './$types';

  let { data, children }: { data: LayoutData; children: any } = $props();

  // Routes that don't need the sidebar (login, onboarding)
  let protectedRoutes = new Set(["/admin/login", "/admin/onboarding"]);

  let loading = $state(false);
  beforeNavigate(() => {
    loading = true;
  });
  afterNavigate(() => {
    loading = false;
  });
</script>

<Toaster position="top-right" richColors />

{#if protectedRoutes.has(page.url.pathname)}
  <!-- Login/Onboarding pages - no sidebar -->
  {@render children()}
{:else if data.user}
  <!-- Authenticated admin pages - with sidebar -->
  <SidebarPage user={data.user} logo={data.logo} companyName={data.company}>
    {#if loading}
      <div class="flex items-center justify-center h-full">
        <Loader color="#2563EB" />
      </div>
    {:else}
      {@render children()}
    {/if}
  </SidebarPage>
{:else}
  <!-- Fallback (should not reach here due to layout.server.ts guard) -->
  {@render children()}
{/if}
