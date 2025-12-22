<script lang="ts">
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  function getStatusBadge(paid: boolean) {
    return paid
      ? { bg: 'bg-green-50', text: 'text-green-700', label: 'Pagado' }
      : { bg: 'bg-red-50', text: 'text-red-700', label: 'Pendiente' };
  }

  // Format date
  function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-PA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
</script>

<svelte:head>
  <title>Facturas - Portal de Carga</title>
</svelte:head>

<!-- Outstanding Balance Banner -->
{#if data.totalOutstanding > 0}
  <div class="bg-gradient-to-r from-red-500 to-rose-600 rounded-2xl p-6 mb-6 text-white shadow-lg">
    <div class="flex items-center justify-between">
      <div>
        <div class="text-sm opacity-90 mb-1">Saldo Pendiente Total</div>
        <div class="text-3xl font-bold">${data.totalOutstanding.toFixed(2)}</div>
      </div>
      <svg class="w-12 h-12 opacity-75" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    </div>
  </div>
{:else}
  <div class="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 mb-6 text-white shadow-lg">
    <div class="flex items-center gap-3">
      <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <div>
        <div class="text-2xl font-bold">¡Todo al Día!</div>
        <div class="text-sm opacity-90">No tienes facturas pendientes</div>
      </div>
    </div>
  </div>
{/if}

<!-- Invoices List -->
{#if data.invoices.length > 0}
  <div class="mb-4">
    <h2 class="text-lg font-semibold text-gray-900">Todas las Facturas</h2>
  </div>

  <div class="space-y-3">
    {#each data.invoices as invoice}
      <a
        href="/facturas/{invoice.id}"
        class="block bg-white border border-gray-100 rounded-2xl p-4 shadow-sm
               hover:shadow-md transition-all"
      >
        <div class="flex items-start justify-between mb-3">
          <div>
            <div class="font-semibold text-gray-900 mb-1">
              Factura #{invoice.id}
            </div>
            <div class="text-sm text-gray-500">
              {formatDate(invoice.date)}
            </div>
          </div>
          <span class="text-xs font-medium px-3 py-1 rounded-full
                       {getStatusBadge(invoice.paid).bg} {getStatusBadge(invoice.paid).text}">
            {getStatusBadge(invoice.paid).label}
          </span>
        </div>

        <div class="flex items-center justify-between pt-3 border-t border-gray-100">
          <div class="flex items-center gap-4 text-sm text-gray-500">
            <div class="flex items-center gap-1">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              {invoice.packageCount} {invoice.packageCount === 1 ? 'paquete' : 'paquetes'}
            </div>
            {#if invoice.pickedUp}
              <div class="flex items-center gap-1 text-green-600">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                Retirado
              </div>
            {/if}
          </div>
          <div class="text-xl font-bold text-gray-900">
            ${invoice.total.toFixed(2)}
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
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
    <h3 class="text-lg font-medium text-gray-900 mb-1">No tienes facturas todavía</h3>
    <p class="text-gray-500">Tus facturas aparecerán aquí</p>
  </div>
{/if}
