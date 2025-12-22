<svelte:options runes={true} />

<script lang="ts">
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  let email = $state('');
  let isLoading = $state(false);
  let success = $state(false);
  let error = $state('');

  async function handleSubmit() {
    if (!email || isLoading) return;

    isLoading = true;
    error = '';

    try {
      const response = await fetch('/api/auth/request-magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.ok) {
        success = true;
      } else {
        error = data.error || 'Algo salió mal. Por favor, inténtalo de nuevo.';
      }
    } catch (err) {
      error = 'Error de red. Por favor, verifica tu conexión e inténtalo de nuevo.';
    } finally {
      isLoading = false;
    }
  }

  function resetForm() {
    success = false;
    email = '';
    error = '';
  }
</script>

<svelte:head>
  <title>Iniciar Sesión - Portal de Carga</title>
</svelte:head>

<div class="min-h-screen bg-white flex items-center justify-center p-4">
  <div class="w-full max-w-md">
    {#if !success}
      <!-- Login Form -->
      <div class="text-center mb-8">
        <!-- Company Logo -->
        <div class="mb-6">
          <div class="h-12 flex items-center justify-center">
            {#if data.logoUrl}
              <img
                src={data.logoUrl}
                alt={data.companyName}
                class="h-12 max-w-[200px] object-contain"
              />
            {:else}
              <svg class="h-10 w-10 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            {/if}
          </div>
        </div>

        <h1 class="text-2xl font-bold text-gray-900 mb-2">
          Bienvenido de vuelta
        </h1>
        <p class="text-gray-500">
          Ingresa tu correo para acceder a tu carga.
        </p>
      </div>

      <form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }} class="space-y-4">
        <div>
          <label for="email" class="sr-only">Correo Electrónico</label>
          <input
            id="email"
            type="email"
            bind:value={email}
            placeholder="Correo Electrónico"
            required
            disabled={isLoading}
            class="w-full p-4 rounded-xl bg-gray-50 border border-gray-200
                   text-gray-900 placeholder-gray-400
                   focus:ring-2 focus:ring-blue-500 focus:border-transparent
                   transition-all outline-none
                   text-base
                   disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        {#if error}
          <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        {/if}

        <button
          type="submit"
          disabled={isLoading || !email}
          class="w-full p-4 rounded-xl bg-black text-white font-medium
                 hover:opacity-90 active:opacity-80
                 transition-all outline-none
                 disabled:opacity-50 disabled:cursor-not-allowed
                 flex items-center justify-center gap-2"
        >
          {#if isLoading}
            <svg class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Enviando...
          {:else}
            Enviar Enlace de Acceso
          {/if}
        </button>
      </form>

      <p class="text-center text-sm text-gray-500 mt-6">
        No necesitas contraseña. Te enviaremos un enlace seguro por correo.
      </p>
    {:else}
      <!-- Success State -->
      <div class="text-center">
        <div class="mb-6">
          <svg class="w-16 h-16 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
          </svg>
        </div>

        <h2 class="text-2xl font-bold text-gray-900 mb-2">
          ¡Revisa tu bandeja de entrada!
        </h2>
        <p class="text-gray-600 mb-2">
          Enviamos un enlace de acceso a:
        </p>
        <p class="text-gray-900 font-medium mb-6">
          {email}
        </p>
        <p class="text-sm text-gray-500 mb-6">
          El enlace expirará en 15 minutos por seguridad.
        </p>

        <button
          onclick={resetForm}
          class="text-blue-600 hover:text-blue-700 font-medium"
        >
          Usar un correo diferente
        </button>
      </div>
    {/if}
  </div>
</div>

<style>
  /* Prevent iOS zoom on input focus */
  @supports (-webkit-touch-callout: none) {
    input {
      font-size: 16px;
    }
  }
</style>
