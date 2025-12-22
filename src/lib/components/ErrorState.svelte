<script lang="ts">
  import { Button } from '$lib/components/ui/button';

  let {
    message = 'Algo salió mal',
    onRetry
  }: {
    message?: string;
    onRetry?: () => void;
  } = $props();
</script>

<div class="text-center py-12 px-4">
  <svg
    class="w-16 h-16 text-red-500 mx-auto mb-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
    />
  </svg>
  <h3 class="text-lg font-medium text-gray-900 mb-2">¡Oops!</h3>
  <p class="text-gray-600 mb-6">{message}</p>
  {#if onRetry}
    <Button
      onclick={onRetry}
      class="rounded-xl"
    >
      Intentar de Nuevo
    </Button>
  {/if}
</div>
