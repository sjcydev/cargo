<script lang="ts">
  import { Label } from "$lib/components/ui/label";
  import { Input } from "$lib/components/ui/input";
  import type { UsuariosWithSucursal } from "$lib/server/db/schema";

  let { cliente }: { cliente: UsuariosWithSucursal } = $props();
</script>

<div>
  <h3 class="text-lg font-medium mb-4">Información del Cliente</h3>
  <div class="grid grid-cols-2 gap-4">
    <div>
      <Label>Cliente</Label>
      <Input value={`${cliente.nombre} ${cliente.apellido}`} readonly />
    </div>
    <div>
      <Label>Casillero</Label>
      <Input value={cliente.casillero} readonly />
    </div>
    <div>
      <Label>Cédula</Label>
      <Input value={cliente.cedula} readonly />
    </div>
    <div>
      <Label>Correo</Label>
      <Input value={cliente.correo} readonly />
    </div>
    <div>
      <Label>Sucursal</Label>
      <Input value={cliente.sucursal.sucursal} readonly />
    </div>
    <div>
      <Label>Tipo de Cliente</Label>
      <Input value={cliente.tipo} readonly />
    </div>
  </div>
</div>
