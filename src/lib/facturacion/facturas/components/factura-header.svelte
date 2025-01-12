<script lang="ts">
  import { Label } from "$lib/components/ui/label";
  import { Input } from "$lib/components/ui/input";
  import Estado from "../estado.svelte";
  import type { Facturas } from "$lib/server/db/schema";

  let { factura }: { factura: Facturas } = $props();
</script>

<div>
  <div class="grid grid-cols-2 gap-4">
    <div>
      <Label>Factura N°</Label>
      <Input value={factura.facturaId} readonly />
    </div>
    <div>
      <Label>Fecha</Label>
      <Input value={factura.fecha} readonly />
    </div>
    <div>
      <Label>Total</Label>
      <Input value={`$${factura.total!.toFixed(2)}`} readonly />
    </div>

    <div>
      <Label>Estado</Label>
      <div class="flex gap-4 mt-2">
        <div class="flex items-center gap-2">
          <span>Enviado:</span>
          <Estado variant={factura.enviado ? "success" : "destructive"} />
        </div>
        <div class="flex items-center gap-2">
          <span>Pagado:</span>
          <Estado variant={factura.pagado ? "success" : "destructive"} />
        </div>
        <div class="flex items-center gap-2">
          <span>Retirado:</span>
          <Estado variant={factura.retirados! ? "success" : "destructive"} />
        </div>
      </div>
    </div>
  </div>
</div>
