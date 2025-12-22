<script lang="ts">
  import { goto } from '$app/navigation';
  import { navigating } from '$app/stores';
  import PackageListSkeleton from '$lib/components/skeletons/PackageListSkeleton.svelte';
  import { fade } from 'svelte/transition';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  let searchQuery = $state('');

  // Filter packages by search query
  let filteredPackages = $derived.by(() => {
    if (!searchQuery) return data.packages;
    const query = searchQuery.toLowerCase();
    return data.packages.filter(pkg =>
      pkg.tracking.toLowerCase().includes(query)
    );
  });

  // Tab navigation
  function setFilter(filter: 'active' | 'history') {
    goto(`/paquetes?filter=${filter}`);
  }

  // Truncate tracking number for mobile
  function truncateTracking(tracking: string): string {
    if (tracking.length <= 20) return tracking;
    return tracking.substring(0, 17) + '...';
  }
</script>

<svelte:head>
  <title>Mis Paquetes - Portal de Carga</title>
</svelte:head>

{#if $navigating}
  <PackageListSkeleton />
{:else}
<div in:fade={{ duration: 200 }}>
<!-- Search Bar -->
<div class="mb-4">
  <div class="relative">
    <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
         fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
    <input
      type="text"
      bind:value={searchQuery}
      placeholder="Buscar por número de tracking"
      class="w-full pl-12 pr-4 py-3 rounded-xl bg-white border border-gray-200
             text-gray-900 placeholder-gray-400 text-base
             focus:ring-2 focus:ring-blue-500 focus:border-transparent
             transition-all outline-none"
    />
  </div>
</div>

<!-- Filter Tabs -->
<div class="flex gap-2 mb-6 border-b border-gray-200">
  <button
    onclick={() => setFilter('active')}
    class="px-4 py-2 font-medium transition-colors relative
           {data.currentFilter === 'active'
             ? 'text-gray-900'
             : 'text-gray-500 hover:text-gray-700'}"
  >
    Activos
    {#if data.currentFilter === 'active'}
      <div class="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900"></div>
    {/if}
  </button>
  <button
    onclick={() => setFilter('history')}
    class="px-4 py-2 font-medium transition-colors relative
           {data.currentFilter === 'history'
             ? 'text-gray-900'
             : 'text-gray-500 hover:text-gray-700'}"
  >
    Historial
    {#if data.currentFilter === 'history'}
      <div class="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900"></div>
    {/if}
  </button>
</div>

<!-- Packages List -->
{#if filteredPackages.length > 0}
  <div class="space-y-3">
    {#each filteredPackages as pkg}
      <a
        href="/paquetes/{pkg.id}"
        class="block bg-white border border-gray-100 rounded-2xl p-4 shadow-sm
               hover:shadow-md transition-all"
      >
        <div class="flex items-start gap-3">
          <!-- Icon -->
          <div class="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0">
            <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>

          <!-- Content -->
          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between gap-2 mb-1">
              <div class="font-semibold text-gray-900 text-sm">
                {truncateTracking(pkg.tracking)}
              </div>
              {#if pkg.pickedUp}
                <span class="text-xs font-medium px-2 py-1 rounded-full flex-shrink-0
                             bg-blue-50 text-blue-700">
                  Retirado
                </span>
              {:else}
                <span class="text-xs font-medium px-2 py-1 rounded-full flex-shrink-0
                             bg-green-50 text-green-700">
                  Disponible
                </span>
              {/if}
            </div>

            <div class="flex items-center gap-4 text-xs text-gray-400 mt-2">
              {#if pkg.weight}
                <div class="flex items-center gap-1">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                  </svg>
                  {pkg.weight} lb
                </div>
              {/if}
              {#if pkg.price}
                <div class="flex items-center gap-1">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  ${Number(pkg.price).toFixed(2)}
                </div>
              {/if}
              {#if pkg.createdAt}
                <div class="flex items-center gap-1">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {new Date(pkg.createdAt).toLocaleDateString('es-PA')}
                </div>
              {/if}
            </div>
          </div>

          <!-- Chevron -->
          <svg class="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </a>
    {/each}
  </div>
{:else}
  <!-- Empty State -->
  <div class="text-center py-12">
    <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
    <h3 class="text-lg font-medium text-gray-900 mb-1">
      {searchQuery ? 'No se encontraron paquetes' : 'No tienes paquetes todavía'}
    </h3>
    <p class="text-gray-500">
      {searchQuery
        ? 'Intenta ajustar tu búsqueda'
        : data.currentFilter === 'active'
          ? 'Tus paquetes activos aparecerán aquí'
          : 'Tu historial de paquetes aparecerá aquí'}
    </p>
  </div>
{/if}
</div>
{/if}
