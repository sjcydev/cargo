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
<div class="mb-4 lg:mb-6">
  <div class="relative max-w-2xl">
    <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
         fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
    <input
      type="text"
      bind:value={searchQuery}
      placeholder="Buscar por número de tracking"
      class="w-full pl-12 pr-4 py-3 lg:py-3.5 rounded-xl bg-white border border-gray-200
             text-gray-900 placeholder-gray-400 text-base lg:text-lg
             focus:ring-2 focus:ring-blue-500 focus:border-transparent
             transition-all outline-none shadow-sm"
    />
  </div>
</div>

<!-- Filter Tabs -->
<div class="flex gap-2 mb-6 lg:mb-8 border-b border-gray-200">
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
  <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-5">
    {#each filteredPackages as pkg}
      <a
        href="/paquetes/{pkg.id}"
        class="block bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-5 shadow-lg hover:shadow-xl transition-all border border-gray-700 relative overflow-hidden"
      >
        <!-- Status Badge -->
        <div class="absolute top-4 right-4">
          {#if pkg.pickedUp}
            <span class="text-xs font-semibold px-3 py-1.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
              Retirado
            </span>
          {:else}
            <span class="text-xs font-semibold px-3 py-1.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30">
              En Bodega
            </span>
          {/if}
        </div>

        <!-- Package Icon -->
        <div class="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-4">
          <svg class="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>

        <!-- Tracking Number -->
        <div class="mb-4">
          <div class="text-xs text-gray-400 mb-1">Tracking Number</div>
          <div class="text-lg font-bold text-white break-all">
            {pkg.tracking}
          </div>
        </div>

        <!-- Details Grid - 3 Columns -->
        <div class="grid grid-cols-3 gap-2 pt-3 border-t border-gray-700">
          <div>
            <div class="text-xs text-gray-400 mb-1">Fecha Recibido</div>
            <div class="text-sm text-white font-medium">
              {#if pkg.createdAt}
                {new Date(pkg.createdAt).toLocaleDateString('es-PA', { day: 'numeric', month: 'short' })}
              {:else}
                -
              {/if}
            </div>
          </div>
          <div>
            <div class="text-xs text-gray-400 mb-1">Peso</div>
            <div class="text-sm text-white font-medium">
              {pkg.weight ? `${pkg.weight} lb` : '-'}
            </div>
          </div>
          <div>
            <div class="text-xs text-gray-400 mb-1">Total</div>
            <div class="text-sm text-white font-medium">
              {pkg.price ? `$${Number(pkg.price).toFixed(2)}` : '-'}
            </div>
          </div>
        </div>

        <!-- View Details Button -->
        <div class="mt-4 flex items-center justify-between">
          <div class="flex items-center gap-2 text-orange-400 text-sm font-medium">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            Ver Detalles
          </div>
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
