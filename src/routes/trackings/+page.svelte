<script lang="ts">
    import type { PageData } from "./$types";
    import SidebarHeader from "$lib/components/sidebar-header.svelte";

    let { data }: { data: PageData } = $props();
</script>

<SidebarHeader title={"Trackings"} />
