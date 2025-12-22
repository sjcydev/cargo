<script lang="ts">
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
</script>

<svelte:head>
  <title>Invoices - Portal de Carga</title>
</svelte:head>

<div class="space-y-6">
  <div class="bg-white rounded-lg shadow-sm p-6">
    <h2 class="text-xl font-bold text-gray-900 mb-4">My Invoices</h2>
    <p class="text-gray-600">
      Your invoice history will appear here. This feature will be implemented in a future task.
    </p>
  </div>

  <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
    <p class="text-sm text-blue-800">
      <strong>Coming soon:</strong> View and download your invoices, payment history, and outstanding balances.
    </p>
  </div>
</div>
