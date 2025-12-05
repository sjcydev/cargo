<script lang="ts">
  /**
   * Cliente Details Component
   * Displays readonly cliente information fields
   */
  import * as Card from "$lib/components/ui/card";
  import { Label } from "$lib/components/ui/label";
  import { Input } from "$lib/components/ui/input";
  import { Separator } from "$lib/components/ui/separator";
  import * as RadioGroup from "$lib/components/ui/radio-group";
  import type { UsuariosWithSucursal } from "$lib/server/db/schema";

  type ClienteDetailsProps = {
    cliente: UsuariosWithSucursal;
    especial: boolean;
    manifiesto: boolean;
    precioBase: number;
    onTipoChange: (tipo: "regular" | "especial" | "manifiesto") => void;
  };

  let {
    cliente,
    especial = $bindable(),
    manifiesto = $bindable(),
    precioBase,
    onTipoChange,
  }: ClienteDetailsProps = $props();

  const currentTipoValue = $derived(
    especial ? (manifiesto ? "manifiesto" : "especial") : "regular"
  );
</script>

<Card.Root>
  <Card.Content class="pt-6">
    <Card.Title><h2 class="text-xl mb-2">Detalles</h2></Card.Title>
    <div class="grid gap-4">
      <div>
        <Label for="customer-name">Nombre del Cliente</Label>
        <div class="flex gap-4">
          <Input
            id="customer-name"
            readonly
            class="focus-visible:ring-0"
            value={cliente.nombre}
            placeholder="NOMBRE"
          />
          <Input
            readonly
            class="focus-visible:ring-0"
            value={cliente.apellido}
            placeholder="APELLIDO"
          />
        </div>
      </div>

      <div>
        <Label for="correo">Correo</Label>
        <Input
          id="correo"
          readonly
          class="focus-visible:ring-0"
          value={cliente.correo}
          placeholder="CORREO"
        />
      </div>

      {#if cliente.casillero}
        <div class="flex gap-4">
          <div class="w-full">
            <Label for="sucursal">Sucursal</Label>
            <Input
              id="sucursal"
              readonly
              class="focus-visible:ring-0"
              value={cliente.sucursal.sucursal}
              placeholder="SUCURSAL"
            />
          </div>
          <div class="w-full">
            <Label for="tipo">Tipo de Cliente</Label>
            <Input
              id="tipo"
              readonly
              class="focus-visible:ring-0"
              value={cliente.tipo}
              placeholder="TIPO"
            />
          </div>
        </div>
      {/if}

      {#if cliente.id}
        <Card.Title class="text-lg">Tipo de Casillero</Card.Title>
        <RadioGroup.Root
          value={currentTipoValue}
          onValueChange={(val) => {
            onTipoChange(val as "regular" | "especial" | "manifiesto");
          }}
        >
          <div class="flex items-center space-x-2">
            <RadioGroup.Item value="regular" id="r1" />
            <Label for="r1">Cliente Casillero</Label>
          </div>
          <div class="flex items-center space-x-2">
            <RadioGroup.Item value="especial" id="r2" />
            <Label for="r2">Cliente Precio Especial</Label>
          </div>
          {#if cliente.tipo == "CORPORATIVO"}
            <div class="flex items-center space-x-2">
              <RadioGroup.Item value="manifiesto" id="r3" />
              <Label for="r3">Corporativo por Saco</Label>
            </div>
          {/if}
        </RadioGroup.Root>

        <Separator />
      {/if}
    </div>
  </Card.Content>
</Card.Root>
