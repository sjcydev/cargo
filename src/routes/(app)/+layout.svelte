<svelte:options runes={true} />

<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { enhance } from '$app/forms';
  import type { LayoutData } from './$types';

  let { data, children }: { data: LayoutData; children: any } = $props();

  // Dropdown state
  let isDropdownOpen = $state(false);

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
  ];

  // Reactive state
  let isActive = $derived((path: string) => $page.url.pathname === path);
  let isAuthenticated = $derived(!!data.client);
  let pageTitle = $derived.by(() => {
    if ($page.url.pathname === '/') return 'My Cargo';
    if ($page.url.pathname === '/paquetes') return 'Paquetes';
    if ($page.url.pathname === '/facturas') return 'Facturas';
    if ($page.url.pathname === '/perfil') return 'Perfil';
    return 'Cargo Portal';
  });
</script>

<svelte:window onclick={handleClickOutside} />

{#if isAuthenticated}
  <!-- Authenticated Layout -->
  <div class="min-h-screen bg-gray-50 pb-24 md:pb-0">
    <!-- Top Bar (Mobile & Desktop) -->
    <header class="sticky top-0 bg-white border-b border-gray-100 z-10">
      <div class="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <h1 class="text-lg font-semibold text-gray-900">
          {pageTitle}
        </h1>

        <!-- Profile Avatar Dropdown -->
        <div class="relative dropdown-container">
          <button
            onclick={toggleDropdown}
            class="w-10 h-10 rounded-full bg-gray-900 text-white font-medium
                   flex items-center justify-center touch-target
                   hover:opacity-90 transition-opacity"
          >
            {getInitials(data.client!.nombre, data.client!.apellido)}
          </button>

          {#if isDropdownOpen}
            <div class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
              <!-- Profile Link -->
              <a
                href="/perfil"
                onclick={() => isDropdownOpen = false}
                class="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Perfil
              </a>

              <!-- Divider -->
              <div class="border-t border-gray-100 my-1"></div>

              <!-- Logout Form -->
              <form method="POST" action="/logout" use:enhance>
                <button
                  type="submit"
                  class="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Cerrar Sesión
                </button>
              </form>
            </div>
          {/if}
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 py-6">
      {@render children()}
    </main>

    <!-- Bottom Navigation (Mobile Only) -->
    <nav class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-20 safe-bottom">
      <div class="grid grid-cols-3 gap-1 p-2">
        {#each navItems as item}
          <a
            href={item.path}
            class="flex flex-col items-center gap-1 py-3 px-3 rounded-lg transition-colors touch-target
                   {isActive(item.path)
                     ? 'bg-gray-900 text-white'
                     : 'text-gray-600 hover:bg-gray-50'}"
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
            {/if}
            <span class="text-xs font-medium">{item.label}</span>
          </a>
        {/each}
      </div>
    </nav>

    <!-- Desktop Sidebar (Optional - Future Enhancement) -->
    <!-- For MVP, mobile bottom nav is sufficient -->
  </div>
{:else}
  <!-- Public Layout (Login, Verify) -->
  {@render children()}
{/if}
