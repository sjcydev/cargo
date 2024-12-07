<script lang="ts">
  import type { PageData } from "./$types";
  import SidebarHeader from "$lib/components/sidebar-header.svelte";
  import InnerLayout from "$lib/components/inner-layout.svelte";

  let { data }: { data: PageData } = $props();
</script>

<InnerLayout title="Facturar"></InnerLayout>
