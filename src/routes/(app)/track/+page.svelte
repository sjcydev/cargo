<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  let trackingNumber = $state('');
  let isTracking = $state(false);
  let scriptLoaded = $state(false);
  let widgetLoading = $state(false);

  onMount(() => {
    if (browser) {
      // Check if script already exists
      if ((window as any).YQV5) {
        scriptLoaded = true;
        return;
      }

      // Load 17track script
      const script = document.createElement('script');
      script.src = 'https://www.17track.net/externalcall.js';
      script.onload = () => {
        scriptLoaded = true;
      };
      document.head.appendChild(script);
    }
  });

  function handleTrack() {
    if (!trackingNumber.trim()) return;

    isTracking = true;
    widgetLoading = true;

    // Wait for script to load, then initialize widget
    const initWidget = () => {
      if (browser && (window as any).YQV5) {
        // Clear container first
        const container = document.getElementById('YQContainer');
        if (container) {
          container.innerHTML = '';
        }

        // Initialize 17track widget
        setTimeout(() => {
          (window as any).YQV5.trackSingle({
            YQ_ContainerId: 'YQContainer',
            YQ_Height: 560,
            YQ_Fc: '0',
            YQ_Lang: 'es',
            YQ_Num: trackingNumber.trim(),
          });
          // Widget takes a moment to render
          setTimeout(() => {
            widgetLoading = false;
          }, 1500);
        }, 100);
      } else {
        // Retry if script not loaded yet
        setTimeout(initWidget, 100);
      }
    };

    initWidget();
  }

  function handleReset() {
    trackingNumber = '';
    isTracking = false;
    widgetLoading = false;
    const container = document.getElementById('YQContainer');
    if (container) {
      container.innerHTML = '';
    }
  }
</script>

<svelte:head>
  <title>Rastrear Paquete - Portal de Carga</title>
</svelte:head>

<div class="min-h-screen pb-20">
  <!-- Header -->
  <div class="mb-6">
    <h1 class="text-2xl font-bold text-gray-900 mb-2">
      Rastrear Paquete
    </h1>
    <p class="text-gray-500">
      Ingresa tu número de tracking para ver el estado de tu paquete
    </p>
  </div>

  <!-- Search Section -->
  <div class="bg-white border border-gray-100 rounded-3xl p-4 sm:p-6 shadow-sm mb-6">
    <div class="space-y-4">
      <div>
        <label for="tracking" class="block text-sm font-medium text-gray-700 mb-2">
          Número de Tracking
        </label>
        <div class="flex flex-col sm:flex-row gap-3">
          <input
            id="tracking"
            type="text"
            bind:value={trackingNumber}
            placeholder="Ej: 1234567890"
            class="flex-1 px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white placeholder:text-gray-400"
            onkeydown={(e) => {
              if (e.key === 'Enter') {
                handleTrack();
              }
            }}
            disabled={isTracking}
          />
          {#if !isTracking}
            <button
              onclick={handleTrack}
              disabled={!trackingNumber.trim()}
              class="w-full sm:w-auto px-6 py-3 bg-gradient-to-br from-blue-500 to-blue-600 text-white font-medium rounded-2xl shadow-lg hover:shadow-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
            >
              Rastrear
            </button>
          {:else}
            <button
              onclick={handleReset}
              class="w-full sm:w-auto px-6 py-3 bg-gradient-to-br from-gray-700 to-gray-800 text-white font-medium rounded-2xl shadow-lg hover:shadow-xl transition-all active:scale-95"
            >
              Limpiar
            </button>
          {/if}
        </div>
      </div>
    </div>
  </div>

  <!-- Tracking Results Container -->
  {#if isTracking}
    <div class="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
      <!-- Custom Header -->
      <div class="bg-gradient-to-br from-gray-900 to-gray-800 text-white p-6">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <div>
            <div class="text-sm opacity-90">Rastreando</div>
            <div class="font-semibold font-mono">{trackingNumber}</div>
          </div>
        </div>
      </div>

      <!-- 17track Widget Container -->
      <div class="p-6">
        {#if widgetLoading}
          <div class="flex flex-col items-center justify-center py-16">
            <div class="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
            <p class="text-gray-600 font-medium">Cargando información del paquete...</p>
            <p class="text-sm text-gray-400 mt-2">Esto puede tomar unos segundos</p>
          </div>
        {/if}
        <div id="YQContainer" class="tracking-widget-container" class:hidden={widgetLoading}></div>
      </div>
    </div>
  {:else}
    <!-- Empty State -->
    <div class="text-center py-16 bg-white border border-gray-100 rounded-3xl">
      <div class="w-20 h-20 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
        <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <h3 class="text-lg font-semibold text-gray-900 mb-2">
        Listo para Rastrear
      </h3>
      <p class="text-gray-500 max-w-sm mx-auto">
        Ingresa un número de tracking arriba para ver el estado y ubicación de tu paquete
      </p>
    </div>
  {/if}
</div>

<style>
  /* Custom styling for 17track widget */
  :global(#YQContainer) {
    font-family: inherit !important;
  }

  :global(#YQContainer *) {
    font-family: inherit !important;
  }

  /* Override 17track default styles to match our aesthetic */
  :global(.tracking-widget-container iframe) {
    border: none !important;
    border-radius: 1rem !important;
  }

  /* Style the tracking timeline */
  :global(#YQContainer .track-item) {
    border-radius: 1rem !important;
    margin-bottom: 1rem !important;
  }

  /* Custom scrollbar for widget */
  :global(#YQContainer::-webkit-scrollbar) {
    width: 8px;
  }

  :global(#YQContainer::-webkit-scrollbar-track) {
    background: #f1f1f1;
    border-radius: 10px;
  }

  :global(#YQContainer::-webkit-scrollbar-thumb) {
    background: #cbd5e1;
    border-radius: 10px;
  }

  :global(#YQContainer::-webkit-scrollbar-thumb:hover) {
    background: #94a3b8;
  }
</style>
