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
  <div class="space-y-4 mb-8">
    <!-- Available for Pickup - Primary Card -->
    <div class="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 shadow-lg text-white border border-gray-700">
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

    <!-- Quick Actions Grid -->
    <div class="grid grid-cols-2 gap-4">
      <!-- WhatsApp Contact -->
      <a href="https://wa.me/{data.whatsappNumber}" target="_blank" rel="noopener noreferrer" class="bg-gradient-to-br from-green-500 to-green-600 rounded-3xl p-5 shadow-lg text-white block hover:shadow-xl transition-all active:scale-95">
        <div class="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center mb-3">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
        </div>
        <div class="text-sm font-semibold mb-1">
          Contáctanos
        </div>
        <div class="text-xs opacity-90">
          Chatea por WhatsApp
        </div>
      </a>

      <!-- Track Package -->
      <a href="/track" class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl p-5 shadow-lg text-white block hover:shadow-xl transition-all active:scale-95">
        <div class="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center mb-3">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <div class="text-sm font-semibold mb-1">
          Rastrear Paquete
        </div>
        <div class="text-xs opacity-90">
          Buscar por tracking
        </div>
      </a>
    </div>

    <!-- Outstanding Balance (if any) -->
    {#if data.summary.totalDue > 0}
      <div class="bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl p-6 shadow-lg text-white">
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <div class="text-sm opacity-90">Saldo Pendiente</div>
                <div class="text-3xl font-bold">
                  ${data.summary.totalDue.toFixed(2)}
                </div>
              </div>
            </div>
            <a
              href="/facturas"
              class="inline-flex items-center gap-2 px-4 py-2.5 bg-white/20 hover:bg-white/30 text-white text-sm font-medium rounded-xl transition-colors backdrop-blur-sm"
            >
              Ver Facturas Pendientes
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
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
