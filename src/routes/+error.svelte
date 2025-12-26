<svelte:options runes={true} />

<script lang="ts">
  import { page } from "$app/state";
  import { Button } from "$lib/components/ui/button";
  import { Card, CardContent } from "$lib/components/ui/card";
  import { Home, ArrowLeft } from "lucide-svelte";

  const errorMessages: Record<number, { title: string; description: string }> = {
    404: {
      title: "Página no encontrada",
      description: "Lo sentimos, la página que buscas no existe o ha sido movida."
    },
    403: {
      title: "Acceso denegado",
      description: "No tienes permisos para acceder a esta página."
    },
    500: {
      title: "Error del servidor",
      description: "Algo salió mal en nuestro servidor. Por favor intenta de nuevo más tarde."
    }
  };

  const status = $derived(page.status);
  const errorInfo = $derived(errorMessages[status] || {
    title: `Error ${status}`,
    description: "Ha ocurrido un error inesperado."
  });

  // Determine home path based on current route
  const isAdminRoute = $derived(page.url.pathname.startsWith('/admin'));
  const homePath = $derived(isAdminRoute ? '/admin' : '/');
</script>

<svelte:head>
  <title>{errorInfo.title} - Error {status}</title>
</svelte:head>

<div class="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
  <Card class="w-full max-w-md">
    <CardContent class="pt-6">
      <div class="flex flex-col items-center text-center space-y-4">
        <!-- Error Status -->
        <div class="relative">
          <div class="text-8xl font-bold text-slate-200">
            {status}
          </div>
          <div class="absolute inset-0 flex items-center justify-center">
            <div class="text-6xl">😕</div>
          </div>
        </div>

        <!-- Error Message -->
        <div class="space-y-2">
          <h1 class="text-2xl font-semibold text-slate-900">
            {errorInfo.title}
          </h1>
          <p class="text-slate-600">
            {errorInfo.description}
          </p>
        </div>

        <!-- Actions -->
        <div class="flex flex-col sm:flex-row gap-3 w-full pt-4">
          <Button
            variant="outline"
            class="flex-1"
            onclick={() => window.history.back()}
          >
            <ArrowLeft class="mr-2 h-4 w-4" />
            Volver
          </Button>
          <Button
            class="flex-1"
            onclick={() => window.location.href = homePath}
          >
            <Home class="mr-2 h-4 w-4" />
            Ir al inicio
          </Button>
        </div>

        <!-- Additional Info for 404 -->
        {#if status === 404}
          <div class="pt-4 text-xs text-slate-500">
            Si crees que esto es un error, por favor contacta al soporte.
          </div>
        {/if}
      </div>
    </CardContent>
  </Card>
</div>
