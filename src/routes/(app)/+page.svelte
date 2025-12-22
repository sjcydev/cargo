<script lang="ts">
  import { navigating } from '$app/stores';
  import DashboardSkeleton from '$lib/components/skeletons/DashboardSkeleton.svelte';
  import { fade } from 'svelte/transition';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  // Greeting based on time of day
  function getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  }

  // Format relative time
  function formatRelativeTime(date: Date | string): string {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Ahora mismo';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours} hora${diffHours !== 1 ? 's' : ''}`;
    if (diffDays < 7) return `Hace ${diffDays} día${diffDays !== 1 ? 's' : ''}`;
    return past.toLocaleDateString('es-PA');
  }
</script>

<svelte:head>
  <title>Dashboard - Portal de Carga</title>
</svelte:head>

{#if $navigating}
  <DashboardSkeleton />
{:else}
<div in:fade={{ duration: 200 }}>
<!-- Greeting Section -->
<div class="mb-6">
  <h2 class="text-2xl font-bold text-gray-900 mb-1">
    {getGreeting()}, {data.client.nombre}
  </h2>
  <p class="text-gray-500">
    Casillero #{data.client.casillero}
  </p>
</div>

<!-- Summary Cards -->
{#if data.summary}
  <div class="grid grid-cols-2 gap-4 mb-8">
    <!-- Total Packages -->
    <div class="bg-gradient-to-br from-slate-700 to-slate-800 rounded-3xl p-5 shadow-lg text-white">
      <div class="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center mb-3">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      </div>
      <div class="text-4xl font-bold mb-1">
        {data.summary.totalPackages}
      </div>
      <div class="text-sm opacity-90">
        Total Paquetes
      </div>
    </div>

    <!-- Picked Up -->
    <div class="bg-gradient-to-br from-slate-600 to-slate-700 rounded-3xl p-5 shadow-lg text-white">
      <div class="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center mb-3">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <div class="text-4xl font-bold mb-1">
        {data.summary.pickedUpPackages}
      </div>
      <div class="text-sm opacity-90">
        Retirados
      </div>
    </div>

    <!-- Available for Pickup -->
    <div class="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 shadow-lg text-white col-span-2 border border-gray-700">
      <div class="flex items-center justify-between mb-3">
        <div class="text-base font-semibold">Listos para Retirar</div>
        <div class="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
      </div>
      <div class="text-5xl font-bold mb-1">
        {data.summary.availablePackages}
      </div>
      <div class="text-sm opacity-90">
        {data.summary.availablePackages === 1 ? 'Paquete Disponible' : 'Paquetes Disponibles'}
      </div>
    </div>

    <!-- Outstanding Balance (if any) -->
    {#if data.summary.totalDue > 0}
      <div class="bg-white border border-red-100 rounded-2xl p-4 shadow-sm col-span-2">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-sm text-gray-500 mb-1">Saldo Pendiente</div>
            <div class="text-2xl font-bold text-red-600">
              ${data.summary.totalDue.toFixed(2)}
            </div>
          </div>
          <a
            href="/facturas"
            class="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg
                   hover:bg-red-700 transition-colors"
          >
            Ver Facturas
          </a>
        </div>
      </div>
    {/if}
  </div>
{/if}

<!-- Recent Activity -->
{#if data.recentActivity && data.recentActivity.length > 0}
  <div class="mb-6">
    <h3 class="text-lg font-semibold text-gray-900 mb-4">Actividad Reciente</h3>
    <div class="space-y-3">
      {#each data.recentActivity as activity}
        <div
          class="block bg-white border border-gray-100 rounded-2xl p-4 shadow-sm
                 hover:shadow-md transition-shadow"
        >
          <div class="flex items-start gap-3">
            <!-- Status Icon -->
            <div class="w-10 h-10 rounded-full bg-blue-50 text-blue-600
                        flex items-center justify-center flex-shrink-0">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>

            <!-- Content -->
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between gap-2">
                <div>
                  <div class="font-medium text-gray-900 truncate">
                    {activity.tracking}
                  </div>
                  <div class="text-sm text-gray-500">
                    {#if activity.weight}
                      {activity.weight} lbs
                    {/if}
                    {#if activity.price && activity.weight}
                      •
                    {/if}
                    {#if activity.price}
                      ${Number(activity.price).toFixed(2)}
                    {/if}
                  </div>
                </div>
                {#if activity.pickedUp}
                  <span class="text-xs font-medium px-2 py-1 rounded-full bg-blue-100 text-blue-800
                               whitespace-nowrap flex-shrink-0">
                    Retirado
                  </span>
                {:else}
                  <span class="text-xs font-medium px-2 py-1 rounded-full bg-green-100 text-green-800
                               whitespace-nowrap flex-shrink-0">
                    Disponible
                  </span>
                {/if}
              </div>
              {#if activity.updatedAt}
                <div class="text-xs text-gray-400 mt-1">
                  {formatRelativeTime(activity.updatedAt)}
                </div>
              {/if}
            </div>
          </div>
        </div>
      {/each}
    </div>

    <a
      href="/paquetes"
      class="block mt-4 text-center text-blue-600 font-medium hover:text-blue-700"
    >
      Ver Todos los Paquetes →
    </a>
  </div>
{:else}
  <div class="text-center py-12">
    <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
    <p class="text-gray-500 mb-2">No tienes paquetes todavía</p>
    <p class="text-sm text-gray-400">Tus paquetes aparecerán aquí cuando lleguen</p>
  </div>
{/if}
</div>
{/if}
