<script lang="ts">
  import type { Facturas } from "$lib/server/db/schema";
  import Estado from "../estado.svelte";
  import { Progress } from "$lib/components/ui/progress";
  import { Calendar, DollarSign, Package } from "lucide-svelte";

  let { factura }: { factura: Facturas } = $props();

  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });

  function getProgressValue(): number {
    if (!factura) return 0;
    let steps = 0;
    if (factura.enviado) steps++;
    if (factura.pagado) steps++;
    if (factura.retirados) steps++;
    return (steps / 3) * 100;
  }

  function getStatusText(): string {
    if (!factura) return "Pendiente";
    if (factura.enviado && factura.pagado && factura.retirados)
      return "Completado";
    if (factura.enviado || factura.pagado || factura.retirados)
      return "En Proceso";
    return "Pendiente";
  }

  function getProgressColor(): string {
    const progress = getProgressValue();
    return progress === 100 ? "[&>div]:bg-green-500" : "[&>div]:bg-blue-500";
  }
</script>

<div class="bg-gradient-to-br from-card to-muted p-6 rounded-xl border">
  <!-- Header Section -->
  <div class="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
    <div class="space-y-2">
      <div class="flex items-center gap-2">
        <Package class="w-5 h-5 text-primary" />
        <div class="flex items-baseline gap-2">
          <h2 class="text-2xl font-bold">Factura N° {factura?.facturaId}</h2>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <Calendar class="w-5 h-5 text-primary" />
        <span class="text-lg font-medium">{factura?.fecha}</span>
      </div>
    </div>

    <div class="flex items-center gap-2">
      <span class="text-4xl font-bold tracking-tight text-primary"
        >{formatter.format(factura?.total ?? 0)}</span
      >
    </div>
  </div>

  <!-- Progress Section -->
  <div class="space-y-4">
    <div class="flex justify-between items-center">
      <span class="text-sm font-medium">Estado de la Factura</span>
      <span class="text-sm font-medium">{getStatusText()}</span>
    </div>

    <Progress
      value={getProgressValue()}
      class={`[&>div]:transition-colors ${getProgressColor()}`}
    />

    <div class="grid grid-cols-3 gap-4 pt-2">
      <div
        class="flex flex-col items-center p-3 bg-background rounded-lg border transition-colors hover:bg-muted/50"
      >
        <Estado variant={factura?.enviado ? "success" : "destructive"} />
        <span class="text-xs font-medium mt-2">Enviado</span>
      </div>

      <div
        class="flex flex-col items-center p-3 bg-background rounded-lg border transition-colors hover:bg-muted/50"
      >
        <Estado variant={factura?.pagado ? "success" : "destructive"} />
        <span class="text-xs font-medium mt-2">Pagado</span>
      </div>

      <div
        class="flex flex-col items-center p-3 bg-background rounded-lg border transition-colors hover:bg-muted/50"
      >
        <Estado variant={factura?.retirados ? "success" : "destructive"} />
        <span class="text-xs font-medium mt-2">Retirado</span>
      </div>
    </div>
  </div>
</div>
