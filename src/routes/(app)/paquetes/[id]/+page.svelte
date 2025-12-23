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
          label: 'En Bodega Panamá',
          date: pkg.createdAt,
          completed: true,
          icon: 'check'
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
<button
  onclick={handleBack}
  class="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors mb-4"
>
  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
  </svg>
  Volver
</button>

<!-- Package Header Card -->
<div class="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 mb-6 shadow-lg border border-gray-700">
  <div class="flex items-start justify-between mb-4">
    <div class="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center">
      <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    </div>

    <!-- Status Badge -->
    <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold
                {data.package.pickedUp
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  : 'bg-orange-500/20 text-orange-300 border border-orange-500/30'}">
      <div class="w-1.5 h-1.5 rounded-full bg-current"></div>
      {data.package.pickedUp ? 'Retirado' : 'En Bodega'}
    </div>
  </div>

  <div class="mb-3">
    <div class="text-sm text-gray-400 mb-1">Tracking Number</div>
    <div class="text-xl font-bold text-white break-all">
      {data.package.tracking}
    </div>
  </div>

  <!-- Package Details Grid -->
  <div class="grid grid-cols-3 gap-3 pt-4 border-t border-gray-700">
    <div>
      <div class="text-xs text-gray-400 mb-1">Fecha Recibido</div>
      <div class="text-sm text-white font-medium">
        {#if data.package.createdAt}
          {new Date(data.package.createdAt).toLocaleDateString('es-PA', { day: 'numeric', month: 'short' })}
        {:else}
          -
        {/if}
      </div>
    </div>
    <div>
      <div class="text-xs text-gray-400 mb-1">Peso</div>
      <div class="text-sm text-white font-medium">
        {data.package.weight ? `${data.package.weight} lb` : '-'}
      </div>
    </div>
    <div>
      <div class="text-xs text-gray-400 mb-1">Total</div>
      <div class="text-sm text-white font-medium">
        {data.package.price ? `$${Number(data.package.price).toFixed(2)}` : '-'}
      </div>
    </div>
  </div>
</div>

<!-- Tracking Timeline -->
<div class="bg-white rounded-3xl p-6 mb-6 shadow-sm">
  <h2 class="text-lg font-bold text-gray-900 mb-6">Estado del Paquete</h2>
  <div class="space-y-0">
    {#each timeline as step, index}
      <div class="flex gap-4">
        <!-- Timeline Icon -->
        <div class="flex flex-col items-center">
          <div class="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all
                      {step.completed
                        ? 'bg-green-500 text-white shadow-md'
                        : step.active
                          ? 'bg-orange-500 text-white shadow-md'
                          : 'bg-gray-100 text-gray-400'}">
            {#if step.completed}
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            {:else if step.active}
              <div class="w-3 h-3 rounded-full bg-white animate-pulse"></div>
            {:else}
              <div class="w-3 h-3 rounded-full bg-gray-300"></div>
            {/if}
          </div>
          {#if index < timeline.length - 1}
            <div class="w-0.5 flex-1 my-1 {step.completed ? 'bg-green-500' : 'bg-gray-200'}" style="min-height: 48px;"></div>
          {/if}
        </div>

        <!-- Timeline Content -->
        <div class="flex-1 pb-6">
          <div class="font-semibold text-gray-900 mb-1 {step.completed || step.active ? '' : 'text-gray-400'}">
            {step.label}
          </div>
          {#if step.date}
            <div class="text-sm text-gray-600">
              {formatDateTime(step.date)}
            </div>
            <div class="text-xs text-gray-400 mt-0.5">
              {formatRelativeTime(step.date)}
            </div>
          {:else if !step.completed && !step.active}
            <div class="text-sm text-gray-400">Pendiente</div>
          {/if}
        </div>
      </div>
    {/each}
  </div>
</div>


<!-- Invoice Link -->
{#if data.package.facturaId}
  <a
    href="/facturas/{data.package.facturaId}"
    class="block bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all"
  >
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
          <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div>
          <div class="text-white font-semibold text-lg">Ver Factura</div>
          <div class="text-blue-100 text-sm">Factura #{data.package.facturaId}</div>
        </div>
      </div>
      <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
    </div>
  </a>
{/if}
