<script lang="ts">
  import { browser } from '$app/environment';
  import type { PageData } from './$types';
  import { toast } from 'svelte-sonner';

  let { data }: { data: PageData } = $props();

  function getInitials(nombre: string, apellido: string): string {
    return `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase();
  }

  async function copyToClipboard(text: string, label: string) {
    if (!browser) return;

    try {
      // Try modern clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        toast.success(`${label} copiado`);
        return;
      }

      // Fallback for older browsers/mobile
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);

      if (successful) {
        toast.success(`${label} copiado`);
      } else {
        toast.error('Error al copiar');
      }
    } catch (err) {
      console.error('Copy failed:', err);
      toast.error('Error al copiar');
    }
  }
</script>

<svelte:head>
  <title>Perfil - Portal de Carga</title>
</svelte:head>

<!-- Profile Header -->
<div class="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 lg:p-8 shadow-lg text-white mb-6 lg:mb-8">
  <div class="flex items-center gap-4 lg:gap-6">
    <div class="w-20 h-20 lg:w-24 lg:h-24 rounded-full bg-white/20 text-white text-2xl lg:text-3xl font-bold
                flex items-center justify-center shadow-lg border-2 border-white/30">
      {getInitials(data.client.nombre, data.client.apellido)}
    </div>
    <div class="flex-1">
      <h2 class="text-2xl lg:text-3xl font-bold mb-1 lg:mb-2">
        {data.client.nombre} {data.client.apellido}
      </h2>
      <p class="text-white/80 text-sm lg:text-base">
        {data.client.correo}
      </p>
    </div>
  </div>
</div>

<!-- Info Cards Grid: Desktop 2-col, Mobile 1-col -->
<div class="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-6 mb-6 lg:mb-8">
  <!-- Casillero Card -->
  <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl p-6 shadow-lg text-white">
    <div class="flex items-center justify-between">
      <div>
        <div class="text-sm lg:text-base opacity-90 mb-1">Tu Casillero</div>
        <div class="text-4xl lg:text-5xl font-bold font-mono tracking-tight">
          {data.sucursalCode}{data.client.casillero}
        </div>
      </div>
      <button
        onclick={() => copyToClipboard(`${data.sucursalCode}${data.client.casillero}`, 'Casillero')}
        aria-label="Copiar número de casillero"
        class="w-12 h-12 lg:w-14 lg:h-14 rounded-2xl bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors active:scale-95"
      >
        <svg class="w-6 h-6 lg:w-7 lg:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      </button>
    </div>
    <div class="text-xs lg:text-sm opacity-75 mt-3">
      Usa este número para todas tus compras en línea
    </div>
  </div>

  {#if data.client.codificacion}
    <!-- Corporate Code Card -->
    <div class="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
      <div class="flex items-center justify-between">
        <div>
          <div class="text-sm lg:text-base text-gray-500 mb-1">Código Corporativo</div>
          <div class="font-bold text-gray-900 text-2xl lg:text-3xl font-mono">
            {data.client.codificacion}
          </div>
        </div>
        <button
          onclick={() => copyToClipboard(data.client.codificacion || '', 'Código corporativo')}
          aria-label="Copiar código corporativo"
          class="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors active:scale-95"
        >
          <svg class="w-5 h-5 lg:w-6 lg:h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </button>
      </div>
    </div>
  {/if}
</div>

<!-- Shipping Addresses -->
{#if data.addresses && data.addresses.length > 0}
  <div class="mb-6 lg:mb-8">
    <h2 class="text-xl lg:text-2xl font-bold text-gray-900 mb-4 lg:mb-6">Direcciones de Envío</h2>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
    {#each data.addresses as dir}
      {@const nombre = `${data.sucursalCode} ${data.client.nombre} ${data.client.apellido}${dir.suffix ? ` ${dir.suffix}` : ""}`}
      {@const direccion = `${dir.address1} ${data.sucursalCode}`}
      {@const linea2 = `${dir.address2 ? `${dir.address2} ` : ""}${data.sucursalCode}${data.client.casillero}${dir.suffix ? ` ${dir.suffix}` : ""}`}
      {@const ciudad = dir.city}
      {@const estado = dir.state}
      {@const zipcode = dir.zipcode}
      {@const pais = dir.country}
      {@const tel = dir.tel}

      <div class="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
        <!-- Card Header -->
        <div class="bg-gradient-to-br from-green-500 to-green-600 text-white p-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div class="flex-1">
              <div class="font-semibold">{dir.name}</div>
            </div>
          </div>
        </div>

        <!-- Address Fields -->
        <div class="p-4 space-y-3">
          <!-- Nombre -->
          <div class="flex items-start gap-3 group">
            <div class="flex-1 min-w-0">
              <div class="text-xs text-gray-500 mb-1">Nombre</div>
              <div class="text-sm text-gray-900 font-medium font-mono break-words">{nombre}</div>
            </div>
            <button
              onclick={() => copyToClipboard(nombre, 'Nombre')}
              aria-label="Copiar nombre"
              class="flex-shrink-0 w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors active:scale-95 opacity-0 group-hover:opacity-100"
            >
              <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          </div>

          <div class="border-t border-gray-100"></div>

          <!-- Dirección -->
          <div class="flex items-start gap-3 group">
            <div class="flex-1 min-w-0">
              <div class="text-xs text-gray-500 mb-1">Dirección</div>
              <div class="text-sm text-gray-900 font-medium font-mono break-words">{direccion}</div>
            </div>
            <button
              onclick={() => copyToClipboard(direccion, 'Dirección')}
              aria-label="Copiar dirección"
              class="flex-shrink-0 w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors active:scale-95 opacity-0 group-hover:opacity-100"
            >
              <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          </div>

          <div class="border-t border-gray-100"></div>

          <!-- Línea 2 -->
          <div class="flex items-start gap-3 group">
            <div class="flex-1 min-w-0">
              <div class="text-xs text-gray-500 mb-1">Línea 2</div>
              <div class="text-sm text-gray-900 font-medium font-mono break-words">{linea2}</div>
            </div>
            <button
              onclick={() => copyToClipboard(linea2, 'Línea 2')}
              aria-label="Copiar línea 2"
              class="flex-shrink-0 w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors active:scale-95 opacity-0 group-hover:opacity-100"
            >
              <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          </div>

          <div class="border-t border-gray-100"></div>

          <!-- Ciudad, Estado, Código Postal in Grid -->
          <div class="grid grid-cols-2 gap-3">
            <div class="flex items-start gap-2 group">
              <div class="flex-1 min-w-0">
                <div class="text-xs text-gray-500 mb-1">Ciudad</div>
                <div class="text-sm text-gray-900 font-medium font-mono break-words">{ciudad}</div>
              </div>
              <button
                onclick={() => copyToClipboard(ciudad, 'Ciudad')}
                aria-label="Copiar ciudad"
                class="flex-shrink-0 w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors active:scale-95 opacity-0 group-hover:opacity-100"
              >
                <svg class="w-3.5 h-3.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>

            <div class="flex items-start gap-2 group">
              <div class="flex-1 min-w-0">
                <div class="text-xs text-gray-500 mb-1">Estado</div>
                <div class="text-sm text-gray-900 font-medium font-mono break-words">{estado}</div>
              </div>
              <button
                onclick={() => copyToClipboard(estado, 'Estado')}
                aria-label="Copiar estado"
                class="flex-shrink-0 w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors active:scale-95 opacity-0 group-hover:opacity-100"
              >
                <svg class="w-3.5 h-3.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
          </div>

          <div class="border-t border-gray-100"></div>

          <div class="grid grid-cols-2 gap-3">
            <div class="flex items-start gap-2 group">
              <div class="flex-1 min-w-0">
                <div class="text-xs text-gray-500 mb-1">Código Postal</div>
                <div class="text-sm text-gray-900 font-medium font-mono break-words">{zipcode}</div>
              </div>
              <button
                onclick={() => copyToClipboard(zipcode, 'Código postal')}
                aria-label="Copiar código postal"
                class="flex-shrink-0 w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors active:scale-95 opacity-0 group-hover:opacity-100"
              >
                <svg class="w-3.5 h-3.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>

            <div class="flex items-start gap-2 group">
              <div class="flex-1 min-w-0">
                <div class="text-xs text-gray-500 mb-1">País</div>
                <div class="text-sm text-gray-900 font-medium font-mono break-words">{pais}</div>
              </div>
              <button
                onclick={() => copyToClipboard(pais, 'País')}
                aria-label="Copiar país"
                class="flex-shrink-0 w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors active:scale-95 opacity-0 group-hover:opacity-100"
              >
                <svg class="w-3.5 h-3.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
          </div>

          <div class="border-t border-gray-100"></div>

          <!-- Teléfono -->
          <div class="flex items-start gap-3 group">
            <div class="flex-1 min-w-0">
              <div class="text-xs text-gray-500 mb-1">Teléfono</div>
              <div class="text-sm text-gray-900 font-medium font-mono break-words">{tel}</div>
            </div>
            <button
              onclick={() => copyToClipboard(tel, 'Teléfono')}
              aria-label="Copiar teléfono"
              class="flex-shrink-0 w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors active:scale-95 opacity-0 group-hover:opacity-100"
            >
              <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    {/each}
    </div>
  </div>
{/if}

<!-- App Version (Optional) -->
<div class="mt-8 text-center text-xs text-gray-400">
  Versión 1.0.0
</div>
