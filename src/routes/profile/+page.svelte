<script lang="ts">
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  }
</script>

<svelte:head>
  <title>Profile - Portal de Carga</title>
</svelte:head>

<div class="space-y-6">
  <div class="bg-white rounded-lg shadow-sm p-6">
    <h2 class="text-xl font-bold text-gray-900 mb-6">My Profile</h2>

    {#if data.client}
      <div class="space-y-4 mb-6">
        <div>
          <label class="text-sm font-medium text-gray-500">Full Name</label>
          <p class="text-lg text-gray-900">{data.client.nombre} {data.client.apellido}</p>
        </div>

        <div>
          <label class="text-sm font-medium text-gray-500">Email</label>
          <p class="text-lg text-gray-900">{data.client.correo}</p>
        </div>

        <div>
          <label class="text-sm font-medium text-gray-500">Mailbox Number</label>
          <p class="text-lg text-gray-900 font-mono">{data.client.casillero}</p>
        </div>

        {#if data.client.codificacion}
          <div>
            <label class="text-sm font-medium text-gray-500">Corporate Code</label>
            <p class="text-lg text-gray-900 font-mono">{data.client.codificacion}</p>
          </div>
        {/if}

        <div>
          <label class="text-sm font-medium text-gray-500">Account Type</label>
          <p class="text-lg text-gray-900">{data.client.tipo}</p>
        </div>
      </div>
    {/if}

    <div class="pt-6 border-t border-gray-200">
      <button
        onclick={handleLogout}
        class="w-full py-3 px-4 bg-red-600 text-white font-medium rounded-lg
               hover:bg-red-700 transition-colors"
      >
        Sign Out
      </button>
    </div>
  </div>

  <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
    <p class="text-sm text-blue-800">
      <strong>Coming soon:</strong> Update your contact information, notification preferences, and more.
    </p>
  </div>
</div>
