<script lang="ts">
  import { Badge, type BadgeVariant } from "$lib/components/ui/badge/index.js";
  import { CircleCheckBig, CircleX } from "lucide-svelte";

  let { variant = "destructive" }: { variant?: BadgeVariant } = $props();
  const success = "#16a34a";
  const destructive = "#dc2626";
</script>

<div class="flex justify-center">
  {#if variant === "success"}
    <CircleCheckBig size={18} strokeWidth={3} color={success} />
  {:else}
    <CircleX size={18} strokeWidth={3} color={destructive} />
  {/if}
</div>
