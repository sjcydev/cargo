<svelte:options runes={true} />

<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { enhance } from '$app/forms';
  import type { LayoutData } from './$types';

  let { data, children }: { data: LayoutData; children: any } = $props();

  // Dropdown state
  let isDropdownOpen = $state(false);
  let isMobileMenuOpen = $state(false);

  // Get client initials for avatar
  function getInitials(name: string, apellido: string): string {
    return `${name.charAt(0)}${apellido.charAt(0)}`.toUpperCase();
  }

  // Toggle dropdown
  function toggleDropdown() {
    isDropdownOpen = !isDropdownOpen;
  }

  // Close dropdown when clicking outside
  function handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown-container')) {
      isDropdownOpen = false;
    }
  }

  // Navigation items
  const navItems = [
    { label: 'Inicio', path: '/', icon: 'home' },
    { label: 'Paquetes', path: '/paquetes', icon: 'package' },
    { label: 'Facturas', path: '/facturas', icon: 'receipt' },
    { label: 'Perfil', path: '/perfil', icon: 'user' },
  ];

  // Reactive state
  let isActive = $derived((path: string) => $page.url.pathname === path);
  let isAuthenticated = $derived(!!data.client);
  let pageTitle = $derived.by(() => {
    if ($page.url.pathname === '/') return 'Inicio';
    if ($page.url.pathname === '/paquetes') return 'Mis Paquetes';
    if ($page.url.pathname === '/facturas') return 'Mis Facturas';
    if ($page.url.pathname === '/perfil') return 'Mi Perfil';
    return data.companyName || 'Cargo Portal';
  });
</script>

<svelte:window onclick={handleClickOutside} />

{#if isAuthenticated}
  <!-- Authenticated Layout -->
  <div class="min-h-screen bg-gray-50">
    <!-- Desktop Sidebar -->
    <aside class="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
      <div class="flex grow flex-col gap-y-5 overflow-y-auto bg-white border-r border-gray-200 px-6 pb-4">
        <!-- Logo -->
        <div class="flex h-20 shrink-0 items-center">
          {#if data.logo}
            <img src={data.logo} alt={data.companyName} class="h-12 w-auto" />
          {:else}
            <span class="text-xl font-bold text-gray-900">{data.companyName}</span>
          {/if}
        </div>

        <!-- Navigation -->
        <nav class="flex flex-1 flex-col">
          <ul role="list" class="flex flex-1 flex-col gap-y-2">
            {#each navItems as item}
              <li>
                <a
                  href={item.path}
                  class="group flex gap-x-3 rounded-lg p-3 text-sm font-medium leading-6 transition-colors
                         {isActive(item.path)
                           ? 'bg-orange-50 text-orange-600'
                           : 'text-gray-700 hover:bg-gray-50 hover:text-orange-600'}"
                >
                  {#if item.icon === 'home'}
                    <svg class="h-6 w-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  {:else if item.icon === 'package'}
                    <svg class="h-6 w-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  {:else if item.icon === 'receipt'}
                    <svg class="h-6 w-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  {:else if item.icon === 'user'}
                    <svg class="h-6 w-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  {/if}
                  {item.label}
                </a>
              </li>
            {/each}

            <!-- Logout at bottom -->
            <li class="mt-auto">
              <form method="POST" action="/logout" use:enhance>
                <button
                  type="submit"
                  class="group flex w-full gap-x-3 rounded-lg p-3 text-sm font-medium leading-6 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                >
                  <svg class="h-6 w-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Cerrar Sesión
                </button>
              </form>
            </li>
          </ul>
        </nav>
      </div>
    </aside>

    <!-- Mobile Top Bar -->
    <div class="sticky top-0 z-40 lg:hidden">
      <div class="flex h-16 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6">
        <!-- Logo -->
        {#if data.logo}
          <img src={data.logo} alt={data.companyName} class="h-8 w-auto" />
        {:else}
          <span class="text-lg font-bold text-gray-900">{data.companyName}</span>
        {/if}

        <div class="flex-1"></div>

        <!-- Profile Avatar -->
        <div class="relative dropdown-container">
          <button
            onclick={toggleDropdown}
            class="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500 text-white font-medium hover:bg-orange-600 transition-colors"
          >
            {getInitials(data.client!.nombre, data.client!.apellido)}
          </button>

          {#if isDropdownOpen}
            <div class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
              <a
                href="/perfil"
                onclick={() => isDropdownOpen = false}
                class="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Perfil
              </a>

              <div class="border-t border-gray-100 my-1"></div>

              <form method="POST" action="/logout" use:enhance>
                <button
                  type="submit"
                  class="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Cerrar Sesión
                </button>
              </form>
            </div>
          {/if}
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <main class="lg:pl-64">
      <div class="px-4 py-6 sm:px-6 lg:px-8 pb-24 lg:pb-8">
        <!-- Page Title (Mobile) -->
        <div class="mb-6 lg:hidden">
          <h1 class="text-2xl font-bold text-gray-900">{pageTitle}</h1>
        </div>

        <!-- Desktop Page Title -->
        <div class="mb-6 hidden lg:block">
          <h1 class="text-3xl font-bold text-gray-900">{pageTitle}</h1>
        </div>

        {@render children()}
      </div>
    </main>

    <!-- Bottom Navigation (Mobile Only) - Redesigned -->
    <nav class="fixed bottom-0 left-0 right-0 lg:hidden z-50 px-4 pb-4 safe-bottom">
      <div class="bg-gray-900 rounded-[28px] shadow-2xl border border-gray-800">
        <div class="grid grid-cols-4 gap-1 p-2">
          {#each navItems as item}
            <a
              href={item.path}
              class="flex flex-col items-center justify-center gap-1 py-3 px-2 rounded-2xl transition-all touch-target
                     {isActive(item.path)
                       ? 'bg-orange-500 text-white'
                       : 'text-gray-400 hover:text-white hover:bg-gray-800'}"
            >
              {#if item.icon === 'home'}
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              {:else if item.icon === 'package'}
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              {:else if item.icon === 'receipt'}
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              {:else if item.icon === 'user'}
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              {/if}
              <span class="text-xs font-medium">{item.label}</span>
            </a>
          {/each}
        </div>
      </div>
    </nav>
  </div>
{:else}
  <!-- Public Layout (Login, Verify) -->
  {@render children()}
{/if}
