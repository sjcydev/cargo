<script lang="ts">
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
</script>

<svelte:head>
  <title>Dashboard - Portal de Carga</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 p-8">
  <div class="max-w-4xl mx-auto">
    <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div class="flex justify-between items-center mb-4">
        <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>
        <a
          href="/api/auth/logout"
          class="text-sm text-red-600 hover:text-red-700 font-medium"
        >
          Cerrar Sesión
        </a>
      </div>

      {#if data.client}
        <div class="space-y-3">
          <div>
            <span class="text-sm text-gray-500">Nombre:</span>
            <p class="text-lg font-medium text-gray-900">
              {data.client.nombre} {data.client.apellido}
            </p>
          </div>
          <div>
            <span class="text-sm text-gray-500">Email:</span>
            <p class="text-gray-900">{data.client.correo}</p>
          </div>
          <div>
            <span class="text-sm text-gray-500">Casillero:</span>
            <p class="text-gray-900">{data.client.casillero}</p>
          </div>
          {#if data.client.codificacion}
            <div>
              <span class="text-sm text-gray-500">Código:</span>
              <p class="text-gray-900">{data.client.codificacion}</p>
            </div>
          {/if}
          <div>
            <span class="text-sm text-gray-500">Tipo:</span>
            <p class="text-gray-900">{data.client.tipo}</p>
          </div>
        </div>
      {/if}
    </div>

    <div class="bg-white rounded-lg shadow-sm p-6">
      <h2 class="text-xl font-bold text-gray-900 mb-4">Bienvenido</h2>
      <p class="text-gray-600">
        Este es tu dashboard del portal de carga. Aquí podrás ver tus paquetes, facturas y más información.
      </p>
    </div>
  </div>
</div>
