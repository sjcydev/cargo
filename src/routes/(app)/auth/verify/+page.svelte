<svelte:options runes={true} />

<script lang="ts">
  import { onMount } from 'svelte';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  // Auto-retry on load if no error (handles edge cases)
  onMount(() => {
    if (!data.error) {
      // If we're still here, something went wrong with redirect
      window.location.href = '/';
    }
  });
</script>

<div class="min-h-screen bg-white flex items-center justify-center p-4">
  <div class="max-w-md w-full text-center">
    {#if data.error}
      <!-- Error State -->
      <div class="mb-6">
        <svg class="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h1 class="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h1>
        <p class="text-gray-600 mb-6">{data.error}</p>
        <a
          href="/login"
          class="inline-block bg-black text-white px-6 py-3 rounded-xl font-medium hover:opacity-90 transition-opacity"
        >
          Request New Link
        </a>
      </div>
    {:else}
      <!-- Loading State -->
      <div class="mb-6">
        <svg class="animate-spin w-16 h-16 text-blue-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <h1 class="text-2xl font-bold text-gray-900 mb-2">Verifying...</h1>
        <p class="text-gray-600">Please wait while we log you in.</p>
      </div>
    {/if}
  </div>
</div>
