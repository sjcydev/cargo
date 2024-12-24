<script lang="ts">
  import type { PageData } from "./$types";
  import RegisterForm from "$lib/clientes_registrar/register-form.svelte";
  import type { SuperValidated } from "sveltekit-superforms";
  import type { Infer } from "sveltekit-superforms";
  import type { clientesRegsiterType } from "$lib/clientes_registrar/schema";
  import type { Sucursales } from "$lib/server/db/schema";
  import InnerLayout from "$lib/components/inner-layout.svelte";

  let {
    data,
  }: {
    data: SuperValidated<Infer<clientesRegsiterType>> & {
      sucursales: Sucursales[];
    };
  } = $props();
</script>

<InnerLayout title={"Registrar"} back={true}>
  <RegisterForm {data} sucursales={data.sucursales} />
</InnerLayout>
