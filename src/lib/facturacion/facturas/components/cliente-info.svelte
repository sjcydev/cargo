<script lang="ts">
  import type { UsuariosWithSucursal } from "$lib/server/db/schema";

  let { cliente }: { cliente: UsuariosWithSucursal } = $props();
</script>

<div class="grid gap-4 p-4 bg-muted rounded-lg">
  <!-- Basic Info -->
  <div class="grid grid-cols-2 gap-4">
    <div>
      <p class="text-sm font-medium text-muted-foreground">Cliente</p>
      <p class="text-base font-semibold">{cliente.nombre} {cliente.apellido}</p>
    </div>
    <div>
      <p class="text-sm font-medium text-muted-foreground">Casillero</p>
      <p class="text-base font-semibold">{cliente.casillero}</p>
    </div>
  </div>

  <!-- Contact Info -->
  <div class="grid grid-cols-2 gap-4">
    <div>
      <p class="text-sm font-medium text-muted-foreground">Cédula</p>
      <p class="text-base font-semibold">{cliente.cedula}</p>
    </div>
    <div>
      <p class="text-sm font-medium text-muted-foreground">Correo</p>
      <p class="text-base font-semibold">{cliente.correo}</p>
    </div>
  </div>

  <!-- Additional Info -->
  <div class="grid grid-cols-2 gap-4">
    <div>
      <p class="text-sm font-medium text-muted-foreground">Sucursal</p>
      <p class="text-base font-semibold">{cliente.sucursal.sucursal}</p>
    </div>
    <div>
      <p class="text-sm font-medium text-muted-foreground">Tipo de Cliente</p>
      <p class="text-base font-semibold">{cliente.tipo}</p>
    </div>
  </div>
</div>
