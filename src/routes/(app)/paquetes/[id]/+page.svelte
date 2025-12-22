<script lang="ts">
  import { browser } from '$app/environment';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  function handleBack() {
    if (browser) {
      window.history.back();
    }
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

  // Format date and time
  function formatDateTime(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleDateString('es-PA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Timeline steps based on package status
  // If linked to an invoice (facturaId exists), show full 5-step timeline:
  // 1. En Miami (always completed if has facturaId)
  // 2. En Tránsito (always completed if has facturaId)
  // 3. Paquete Recibido (always completed - createdAt)
  // 4. En Bodega Panamá (always completed)
  // 5. Listo para Retirar / Retirado (based on pickedUp status)
  let timeline = $derived.by(() => {
    const pkg = data.package;
    const hasInvoice = !!pkg.facturaId;

    if (hasInvoice) {
      // Full 5-step timeline for packages with invoice
      return [
        {
          label: 'En Miami',
          date: null,
          completed: true,
          icon: 'check'
        },
        {
          label: 'En Tránsito',
          date: null,
          completed: true,
          icon: 'check'
        },
        {
          label: 'Paquete Recibido',
          date: pkg.createdAt,
          completed: true,
          icon: 'check'
        },
        {
          label: 'En Bodega Panamá',
          date: pkg.updatedAt,
          completed: true,
          active: !pkg.pickedUp,
          icon: 'warehouse'
        },
        {
          label: pkg.pickedUp ? 'Retirado' : 'Listo para Retirar',
          date: pkg.pickedUp ? pkg.pickedUpAt : null,
          completed: pkg.pickedUp,
          active: !pkg.pickedUp,
          icon: 'check-circle'
        }
      ];
    } else {
      // Simplified 3-step timeline for packages without invoice
      return [
        {
          label: 'Paquete Recibido',
          date: pkg.createdAt,
          completed: true,
          icon: 'check'
        },
        {
          label: 'En Bodega Panamá',
          date: !pkg.pickedUp ? pkg.updatedAt : pkg.createdAt,
          completed: true,
          active: !pkg.pickedUp,
          icon: 'warehouse'
        },
        {
          label: pkg.pickedUp ? 'Retirado' : 'Listo para Retirar',
          date: pkg.pickedUp ? pkg.pickedUpAt : null,
          completed: pkg.pickedUp,
          active: !pkg.pickedUp,
          icon: 'check-circle'
        }
      ];
    }
  });
</script>

<svelte:head>
  <title>{data.package.tracking} - Portal de Carga</title>
</svelte:head>

<!-- Header with Back Button -->
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

  <h1 class="text-2xl font-bold text-gray-900 mb-2">
    {data.package.tracking}
  </h1>
</div>

<!-- Current Status Badge -->
<div class="mb-8">
  <div class="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-medium
              {data.package.pickedUp
                ? 'bg-blue-50 text-blue-700'
                : 'bg-green-50 text-green-700'}">
    <div class="w-2 h-2 rounded-full bg-current"></div>
    {data.package.pickedUp ? 'Retirado' : 'Disponible para Retiro'}
  </div>
</div>

<!-- Tracking Timeline -->
<div class="mb-8">
  <h2 class="text-lg font-semibold text-gray-900 mb-4">Estado del Paquete</h2>
  <div class="space-y-4">
    {#each timeline as step, index}
      <div class="flex gap-4">
        <!-- Timeline Icon -->
        <div class="flex flex-col items-center">
          <div class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
                      {step.completed
                        ? 'bg-green-500 text-white'
                        : step.active
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-400'}">
            {#if step.completed}
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            {:else if step.active}
              <div class="w-3 h-3 rounded-full bg-white animate-pulse"></div>
            {:else}
              <div class="w-3 h-3 rounded-full bg-gray-400"></div>
            {/if}
          </div>
          {#if index < timeline.length - 1}
            <div class="w-0.5 h-16 {step.completed ? 'bg-green-500' : 'bg-gray-200'}"></div>
          {/if}
        </div>

        <!-- Timeline Content -->
        <div class="flex-1 pb-8">
          <div class="font-medium text-gray-900 {step.completed || step.active ? '' : 'text-gray-400'}">
            {step.label}
          </div>
          {#if step.date}
            <div class="text-sm text-gray-500 mt-1">
              {formatDateTime(step.date)}
            </div>
            <div class="text-xs text-gray-400">
              {formatRelativeTime(step.date)}
            </div>
          {/if}
        </div>
      </div>
    {/each}
  </div>
</div>

<!-- Package Details -->
<div class="bg-white border border-gray-100 rounded-2xl p-6 mb-6 shadow-sm">
  <h2 class="text-lg font-semibold text-gray-900 mb-4">Detalles del Paquete</h2>
  <div class="space-y-3">
    <div class="flex justify-between">
      <span class="text-gray-500">Número de Tracking</span>
      <span class="font-medium text-gray-900 break-all text-right ml-4">{data.package.tracking}</span>
    </div>
    {#if data.package.weight}
      <div class="flex justify-between">
        <span class="text-gray-500">Peso</span>
        <span class="font-medium text-gray-900">{data.package.weight} lb</span>
      </div>
    {/if}
    {#if data.package.basePrice}
      <div class="flex justify-between">
        <span class="text-gray-500">Precio Base</span>
        <span class="font-medium text-gray-900">${Number(data.package.basePrice).toFixed(2)}</span>
      </div>
    {/if}
    {#if data.package.price}
      <div class="flex justify-between">
        <span class="text-gray-500">Costo Total</span>
        <span class="font-medium text-gray-900">${Number(data.package.price).toFixed(2)}</span>
      </div>
    {/if}
    {#if data.package.invoiceDate}
      <div class="flex justify-between pt-3 border-t border-gray-100">
        <span class="text-gray-500">Fecha de Factura</span>
        <span class="font-medium text-gray-900">{data.package.invoiceDate}</span>
      </div>
    {/if}
  </div>
</div>

<!-- Invoice Link -->
{#if data.package.facturaId}
  <a
    href="/facturas/{data.package.facturaId}"
    class="block bg-white border border-gray-100 rounded-2xl p-4 shadow-sm
           hover:shadow-md transition-all"
  >
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center">
          <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div>
          <div class="font-medium text-gray-900">Ver Factura</div>
          <div class="text-sm text-gray-500">Factura #{data.package.facturaId}</div>
        </div>
      </div>
      <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
    </div>
  </a>
{/if}
