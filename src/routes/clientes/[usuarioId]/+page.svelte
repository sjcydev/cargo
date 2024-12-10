<script lang="ts">
  import InnerLayout from "$lib/components/inner-layout.svelte";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();
  let { cliente } = data;
</script>

<InnerLayout title={`${cliente?.nombre} ${cliente?.apellido}`}>
  <div></div>
</InnerLayout>
