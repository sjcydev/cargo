<script lang="ts">
  import { browser } from '$app/environment';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  function handleBack() {
    if (browser) {
      window.history.back();
    }
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
<button
  onclick={handleBack}
  class="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors mb-4"
>
  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
  </svg>
  Volver
</button>

<!-- Invoice Header Card -->
<div class="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 mb-6 shadow-lg border border-gray-700">
  <div class="flex items-start justify-between mb-4">
    <div class="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center">
      <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    </div>

    <!-- Status Badge -->
    <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold
                {data.invoice.paid
                  ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                  : 'bg-red-500/20 text-red-300 border border-red-500/30'}">
      <div class="w-1.5 h-1.5 rounded-full bg-current"></div>
      {data.invoice.paid ? 'Pagado' : 'Pago Pendiente'}
    </div>
  </div>

  <div class="mb-3">
    <div class="text-sm text-gray-400 mb-1">Número de Factura</div>
    <div class="text-xl font-bold text-white">
      #{data.invoice.id}
    </div>
  </div>

  <!-- Invoice Details Grid -->
  <div class="grid grid-cols-3 gap-3 pt-4 border-t border-gray-700">
    <div>
      <div class="text-xs text-gray-400 mb-1">Fecha</div>
      <div class="text-sm text-white font-medium">
        {new Date(data.invoice.date).toLocaleDateString('es-PA', { day: 'numeric', month: 'short' })}
      </div>
    </div>
    <div>
      <div class="text-xs text-gray-400 mb-1">Paquetes</div>
      <div class="text-sm text-white font-medium">
        {data.invoice.packages.length}
      </div>
    </div>
    <div>
      <div class="text-xs text-gray-400 mb-1">Total</div>
      <div class="text-sm text-white font-medium">
        ${data.invoice.total.toFixed(2)}
      </div>
    </div>
  </div>
</div>

<!-- Invoice Details Card -->
<div class="bg-white rounded-3xl p-6 mb-6 shadow-sm">
  <h2 class="text-lg font-bold text-gray-900 mb-4">Detalles de Factura</h2>
  <div class="space-y-3">
    <div class="flex justify-between items-center py-2">
      <span class="text-gray-600">Fecha de Emisión</span>
      <span class="font-semibold text-gray-900">{formatShortDate(data.invoice.date)}</span>
    </div>
    <div class="flex justify-between items-center py-2">
      <span class="text-gray-600">Estado de Pago</span>
      <span class="font-semibold {data.invoice.paid ? 'text-green-600' : 'text-red-600'}">
        {data.invoice.paid ? 'Pagado' : 'Pendiente'}
      </span>
    </div>
    {#if data.invoice.paid && data.invoice.paidAt}
      <div class="flex justify-between items-center py-2">
        <span class="text-gray-600">Fecha de Pago</span>
        <span class="font-semibold text-gray-900">{formatShortDate(data.invoice.paidAt)}</span>
      </div>
    {/if}
    {#if data.invoice.paymentMethod && data.invoice.paymentMethod !== 'no_pagado'}
      <div class="flex justify-between items-center py-2 pt-3 border-t border-gray-100">
        <span class="text-gray-600">Método de Pago</span>
        <span class="font-semibold text-gray-900">
          {#if data.invoice.paymentMethod === 'transferencia'}
            Transferencia
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
    <div class="flex justify-between items-center py-2 pt-3 border-t border-gray-100">
      <span class="text-gray-900 font-medium">Total a Pagar</span>
      <span class="text-xl font-bold text-gray-900">${data.invoice.total.toFixed(2)}</span>
    </div>
  </div>
</div>

<!-- Package List -->
<div class="mb-6">
  <h2 class="text-lg font-bold text-gray-900 mb-4">Paquetes Incluidos</h2>
  <div class="space-y-3">
    {#each data.invoice.packages as pkg}
      <a
        href="/paquetes/{pkg.id}"
        class="block bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all"
      >
        <div class="flex items-center justify-between mb-3">
          <div class="flex-1">
            <div class="font-semibold text-gray-900 mb-1">
              {pkg.tracking}
            </div>
            <div class="flex items-center gap-3 text-sm text-gray-500">
              {#if pkg.weight}
                <div class="flex items-center gap-1">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                  </svg>
                  {pkg.weight} lb
                </div>
              {/if}
              {#if pkg.pickedUp}
                <div class="flex items-center gap-1 text-green-600 font-medium">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Retirado
                </div>
              {/if}
            </div>
          </div>
          <div class="text-right ml-4">
            <div class="text-lg font-bold text-gray-900">
              ${pkg.price.toFixed(2)}
            </div>
          </div>
        </div>
      </a>
    {/each}
  </div>
</div>

<!-- Payment Instructions or Confirmation -->
{#if !data.invoice.paid}
  <div class="bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl p-6 shadow-lg">
    <div class="flex items-start gap-3 mb-4">
      <div class="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
        <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <div>
        <h3 class="font-bold text-white text-lg mb-1">Pago Pendiente</h3>
        <p class="text-sm text-orange-100 mb-4">
          Complete el pago de esta factura para retirar sus paquetes.
        </p>
      </div>
    </div>

    <div class="bg-white/10 backdrop-blur-sm rounded-2xl p-4 space-y-3 text-sm">
      <div class="text-white">
        <div class="font-semibold mb-2 flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          Transferencia Bancaria
        </div>
        <div class="text-orange-100 text-xs space-y-1 ml-6">
          <div>Banco: [Nombre del Banco]</div>
          <div>Cuenta: [Número de Cuenta]</div>
          <div>Referencia: Factura #{data.invoice.id}</div>
        </div>
      </div>

      <div class="border-t border-white/20 pt-3 text-white">
        <div class="font-semibold mb-2 flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          Yappy
        </div>
        <div class="text-orange-100 text-xs ml-6">
          Enviar pago a [Número de Yappy] con referencia "Factura #{data.invoice.id}". Envíanos el comprobante por WhatsApp.
        </div>
      </div>

      <div class="border-t border-white/20 pt-3 text-white">
        <div class="font-semibold mb-2 flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          Pago en Persona
        </div>
        <div class="text-orange-100 text-xs ml-6">
          Visite nuestra oficina para pagar con efectivo, tarjeta o Yappy.
        </div>
      </div>
    </div>

    <div class="mt-4 text-xs text-orange-100 bg-white/10 rounded-xl p-3">
      <strong>Nota:</strong> Incluya el número de factura como referencia. Sus paquetes estarán disponibles una vez confirmado el pago.
    </div>
  </div>
{:else}
  <!-- Payment Confirmed Message -->
  <div class="bg-gradient-to-br from-green-500 to-green-600 rounded-3xl p-6 shadow-lg">
    <div class="flex items-start gap-3">
      <div class="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <div>
        <h3 class="font-bold text-white text-lg mb-1">Pago Confirmado</h3>
        <p class="text-sm text-green-100">
          Esta factura ha sido pagada. Sus paquetes están listos para retiro.
        </p>
      </div>
    </div>
  </div>
{/if}
