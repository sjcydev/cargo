<script lang="ts">
	import "../app.css";
	import { Toaster } from "$lib/components/ui/sonner";
	import { page } from "$app/stores";

	let protectedRoutes = new Set(["/login", "/registrar", "/password_update"]);

	let { children } = $props();
</script>

<Toaster position="top-right" richColors />

{#if protectedRoutes.has($page.url.pathname)}
	{@render children()}
{:else}
{/if}
