<script lang="ts">
  import { browser } from '$app/environment';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  function handleBack() {
    if (browser) {
      window.history.back();
    }
  }

  function getInitials(nombre: string, apellido: string): string {
    return `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase();
  }
</script>

<svelte:head>
  <title>Perfil - Portal de Carga</title>
</svelte:head>

<!-- Header -->
<div class="mb-6">
  <button
    onclick={handleBack}
    class="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
  >
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
    </svg>
    Volver
  </button>

  <h1 class="text-2xl font-bold text-gray-900">Perfil</h1>
</div>

<!-- Profile Avatar -->
<div class="flex justify-center mb-6">
  <div class="w-24 h-24 rounded-full bg-gray-900 text-white text-3xl font-medium
              flex items-center justify-center shadow-lg">
    {getInitials(data.client.nombre, data.client.apellido)}
  </div>
</div>

<!-- Client Information -->
<div class="bg-white border border-gray-100 rounded-2xl p-6 mb-6 shadow-sm">
  <h2 class="text-lg font-semibold text-gray-900 mb-4">Información de Cuenta</h2>

  <div class="space-y-4">
    <div>
      <div class="text-sm text-gray-500 mb-1">Nombre Completo</div>
      <div class="font-medium text-gray-900">
        {data.client.nombre} {data.client.apellido}
      </div>
    </div>

    <div>
      <div class="text-sm text-gray-500 mb-1">Correo Electrónico</div>
      <div class="font-medium text-gray-900">
        {data.client.correo}
      </div>
    </div>

    <div>
      <div class="text-sm text-gray-500 mb-1">Número de Casillero</div>
      <div class="font-medium text-gray-900 text-2xl font-mono">
        #{data.client.casillero}
      </div>
    </div>

    {#if data.client.codificacion}
      <div>
        <div class="text-sm text-gray-500 mb-1">Código Corporativo</div>
        <div class="font-medium text-gray-900 font-mono">
          {data.client.codificacion}
        </div>
      </div>
    {/if}
  </div>
</div>

<!-- Shipping Address (Future Enhancement) -->
<!-- <div class="bg-white border border-gray-100 rounded-2xl p-6 mb-6 shadow-sm">
  <h2 class="text-lg font-semibold text-gray-900 mb-4">Dirección de Envío en Miami</h2>
  <div class="text-sm text-gray-600">
    [Your Miami Address]<br>
    Casillero #{data.client.casillero}<br>
    Miami, FL 33XXX
  </div>
</div> -->

<!-- Help/Support Section (Future) -->
<!-- <div class="bg-blue-50 border border-blue-200 rounded-2xl p-4">
  <p class="text-sm text-blue-800">
    <strong>¿Necesitas ayuda?</strong> Contáctanos para soporte y asistencia.
  </p>
</div> -->

<!-- App Version (Optional) -->
<div class="mt-8 text-center text-xs text-gray-400">
  Versión 1.0.0
</div>
