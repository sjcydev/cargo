<script lang="ts">
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
</script>

<svelte:head>
  <title>Packages - Portal de Carga</title>
</svelte:head>

<div class="space-y-6">
  <div class="bg-white rounded-lg shadow-sm p-6">
    <h2 class="text-xl font-bold text-gray-900 mb-4">My Packages</h2>
    <p class="text-gray-600">
      Your package list will appear here. This feature will be implemented in a future task.
    </p>
  </div>

  <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
    <p class="text-sm text-blue-800">
      <strong>Coming soon:</strong> Track your packages, view delivery status, and manage your shipments.
    </p>
  </div>
</div>
