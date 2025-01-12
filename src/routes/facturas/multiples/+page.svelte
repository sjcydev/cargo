<script lang="ts">
  import type { PageData } from "./$types";
  import * as Card from "$lib/components/ui/card";
  import { Button } from "$lib/components/ui/button";
  import { goto } from "$app/navigation";
  import { Separator } from "$lib/components/ui/separator";
  import { enhance } from "$app/forms";
  import { Rainbow as Loader } from "svelte-loading-spinners";
  import ClienteInfo from "$lib/facturacion/facturas/components/cliente-info.svelte";
  import MetodoPago from "$lib/facturacion/facturas/components/metodo-pago.svelte";
  import TrackingList from "$lib/facturacion/facturas/components/tracking-list.svelte";
  import FacturaHeader from "$lib/facturacion/facturas/components/factura-header.svelte";
  import InnerLayout from "$lib/components/inner-layout.svelte";

  let { data }: { data: PageData } = $props();

  let isProcessing = $state<boolean>(false);

  function getFacturaIds(): number[] {
    return data.facturas.map((f) => f.facturaId);
  }

  function getTotalAmount(): number {
    return data.facturas.reduce((total, f) => total + f.total!, 0);
  }

  function getAllTrackings() {
    return data.facturas.flatMap((f) => f.trackings);
  }

  function getMetodoDePago() {
    const uniqueMethods = new Set(data.facturas.map((f) => f.metodoDePago));
    return uniqueMethods.size === 1 ? data.facturas[0].metodoDePago : "nulo";
  }

  $effect(() => {
    if (data.facturas.length === 0) {
      goto("/facturas");
    }
  });
</script>

<svelte:head>
  <title>Procesar Facturas</title>
</svelte:head>

<InnerLayout title="Procesar Multiples Facturas" back={true}>
  <div class="space-y-4">
    {#if data.facturas.length === 0}
      <Card.Root>
        <Card.Content class="flex flex-col items-center justify-center py-8">
          <p class="text-lg text-muted-foreground mb-4">
            No hay facturas seleccionadas
          </p>
          <Button variant="outline" onclick={() => goto("/facturas")}>
            Volver a Facturas
          </Button>
        </Card.Content>
      </Card.Root>
    {:else}
      <Card.Root>
        <Card.Header>
          <Card.Title
            >Multiples Facturas
            <div class="text-lg font-medium mt-1">
              Total: ${getTotalAmount().toFixed(2)}
            </div>
          </Card.Title>
          <Card.Description>
            {data.facturas.length} factura{data.facturas.length !== 1
              ? "s"
              : ""} seleccionada{data.facturas.length !== 1 ? "s" : ""}
          </Card.Description>
        </Card.Header>
        <Card.Content class="space-y-6">
          <ClienteInfo cliente={data.cliente!} />
          <Separator />

          <div>
            <h3 class="text-lg font-medium mb-4">
              Información de las Facturas
            </h3>
            <div class="space-y-4">
              {#each data.facturas as factura (factura.facturaId)}
                <FacturaHeader {factura} />
                <Separator />
              {/each}
            </div>
          </div>

          <MetodoPago
            facturaIds={getFacturaIds()}
            metodoDePago={getMetodoDePago()}
          />
          <Separator />

          <div>
            <TrackingList
              facturaIds={getFacturaIds()}
              trackings={getAllTrackings()}
            />
          </div>
        </Card.Content>
      </Card.Root>
    {/if}
  </div>
</InnerLayout>
