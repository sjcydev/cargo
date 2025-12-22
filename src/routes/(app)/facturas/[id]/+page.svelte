<script lang="ts">
  import { goto } from '$app/navigation';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  function getStatusBadge(paid: boolean) {
    return paid
      ? { bg: 'bg-green-50', text: 'text-green-700', label: 'Pagado' }
      : { bg: 'bg-red-50', text: 'text-red-700', label: 'Pago Pendiente' };
  }

  // Format date
  function formatDate(dateStr: string | Date): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-PA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Format short date
  function formatShortDate(dateStr: string | Date): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-PA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
</script>

<svelte:head>
  <title>Factura #{data.invoice.id} - Portal de Carga</title>
</svelte:head>

<!-- Header with Back Button -->
<div class="mb-6">
  <button
    onclick={() => goto('/invoices')}
    class="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
  >
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
    </svg>
    Volver a Facturas
  </button>

  <div class="flex items-start justify-between mb-2">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">
        Factura #{data.invoice.id}
      </h1>
      <p class="text-gray-500 mt-1">
        {formatDate(data.invoice.date)}
      </p>
    </div>
    <span class="text-sm font-medium px-3 py-1.5 rounded-full
                 {getStatusBadge(data.invoice.paid).bg} {getStatusBadge(data.invoice.paid).text}">
      {getStatusBadge(data.invoice.paid).label}
    </span>
  </div>
</div>

<!-- Invoice Summary -->
<div class="bg-white border border-gray-100 rounded-2xl p-6 mb-6 shadow-sm">
  <div class="flex items-center justify-between pb-4 mb-4 border-b border-gray-100">
    <span class="text-gray-600">Monto Total</span>
    <span class="text-3xl font-bold text-gray-900">${data.invoice.total.toFixed(2)}</span>
  </div>

  <div class="space-y-2 text-sm">
    <div class="flex justify-between">
      <span class="text-gray-600">ID de Factura</span>
      <span class="font-medium text-gray-900">#{data.invoice.id}</span>
    </div>
    <div class="flex justify-between">
      <span class="text-gray-600">Fecha de Emisión</span>
      <span class="font-medium text-gray-900">{formatShortDate(data.invoice.date)}</span>
    </div>
    <div class="flex justify-between">
      <span class="text-gray-600">Número de Paquetes</span>
      <span class="font-medium text-gray-900">{data.invoice.packages.length}</span>
    </div>
    <div class="flex justify-between">
      <span class="text-gray-600">Estado de Pago</span>
      <span class="font-medium {data.invoice.paid ? 'text-green-600' : 'text-red-600'}">
        {data.invoice.paid ? 'Pagado' : 'Pendiente'}
      </span>
    </div>
    {#if data.invoice.paid && data.invoice.paidAt}
      <div class="flex justify-between">
        <span class="text-gray-600">Fecha de Pago</span>
        <span class="font-medium text-gray-900">{formatShortDate(data.invoice.paidAt)}</span>
      </div>
    {/if}
    {#if data.invoice.paymentMethod && data.invoice.paymentMethod !== 'no_pagado'}
      <div class="flex justify-between">
        <span class="text-gray-600">Método de Pago</span>
        <span class="font-medium text-gray-900 capitalize">
          {#if data.invoice.paymentMethod === 'transferencia'}
            Transferencia Bancaria
          {:else if data.invoice.paymentMethod === 'efectivo'}
            Efectivo
          {:else if data.invoice.paymentMethod === 'yappy'}
            Yappy
          {:else if data.invoice.paymentMethod === 'tarjeta'}
            Tarjeta
          {:else}
            {data.invoice.paymentMethod}
          {/if}
        </span>
      </div>
    {/if}
  </div>
</div>

<!-- Package Line Items -->
<div class="mb-6">
  <h2 class="text-lg font-semibold text-gray-900 mb-4">Detalles de Paquetes</h2>
  <div class="space-y-3">
    {#each data.invoice.packages as pkg}
      <a
        href="/paquetes/{pkg.id}"
        class="block bg-white border border-gray-100 rounded-xl p-4 hover:shadow-md transition-shadow"
      >
        <div class="flex items-start justify-between mb-2">
          <div class="flex-1">
            <div class="font-medium text-gray-900 text-sm mb-1">
              {pkg.tracking}
            </div>
          </div>
          <div class="text-right ml-4">
            <div class="font-semibold text-gray-900">
              ${pkg.price.toFixed(2)}
            </div>
          </div>
        </div>

        <div class="flex items-center gap-4 text-xs text-gray-500 pt-2 border-t border-gray-100">
          {#if pkg.weight}
            <div class="flex items-center gap-1">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
              </svg>
              {pkg.weight} lb
            </div>
          {/if}
          {#if pkg.basePrice}
            <div class="flex items-center gap-1">
              <span class="text-gray-400">Base:</span>
              ${pkg.basePrice.toFixed(2)}
            </div>
          {/if}
          {#if pkg.pickedUp}
            <div class="flex items-center gap-1 text-green-600">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              Retirado
            </div>
          {/if}
        </div>
      </a>
    {/each}
  </div>
</div>

<!-- Payment Instructions (if not paid) -->
{#if !data.invoice.paid}
  <div class="bg-blue-50 border border-blue-200 rounded-2xl p-6">
    <div class="flex items-start gap-3 mb-4">
      <svg class="w-6 h-6 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <div>
        <h3 class="font-semibold text-blue-900 mb-1">Instrucciones de Pago</h3>
        <p class="text-sm text-blue-800">
          Para completar el pago de esta factura, puede usar uno de los siguientes métodos:
        </p>
      </div>
    </div>

    <div class="bg-white rounded-lg p-4 space-y-3 text-sm">
      <div>
        <div class="font-medium text-gray-900 mb-1">Transferencia Bancaria</div>
        <div class="text-gray-600 space-y-1">
          <div>Banco: [Nombre del Banco]</div>
          <div>Cuenta: [Número de Cuenta]</div>
          <div>Referencia: Factura #{data.invoice.id}</div>
        </div>
      </div>

      <div class="pt-3 border-t border-gray-100">
        <div class="font-medium text-gray-900 mb-1">Yappy</div>
        <div class="text-gray-600">
          Enviar pago a [Número de Yappy] con referencia "Factura #{data.invoice.id}"
        </div>
      </div>

      <div class="pt-3 border-t border-gray-100">
        <div class="font-medium text-gray-900 mb-1">Pago en Persona</div>
        <div class="text-gray-600">
          Visite nuestra oficina para pagar con efectivo, tarjeta o Yappy.
        </div>
      </div>
    </div>

    <div class="mt-4 text-xs text-blue-700">
      <strong>Nota:</strong> Por favor incluya el número de factura como referencia de pago.
      Sus paquetes estarán disponibles para retiro una vez confirmado el pago.
    </div>
  </div>
{:else}
  <!-- Payment Confirmed Message -->
  <div class="bg-green-50 border border-green-200 rounded-2xl p-6">
    <div class="flex items-start gap-3">
      <svg class="w-6 h-6 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <div>
        <h3 class="font-semibold text-green-900 mb-1">Pago Recibido</h3>
        <p class="text-sm text-green-800">
          Esta factura ha sido pagada. Sus paquetes están listos para retiro.
        </p>
      </div>
    </div>
  </div>
{/if}
