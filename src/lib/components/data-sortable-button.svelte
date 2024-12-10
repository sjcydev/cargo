<script lang="ts">
  import type { ComponentProps } from "svelte";
  import ArrowUpDown from "lucide-svelte/icons/arrow-up-down";
  import { Button } from "$lib/components/ui/button/index.js";

  let {
    label,
    variant = "ghost",
    ...restProps
  }: { label: string } & ComponentProps<typeof Button> = $props();
</script>

<Button class="m-0 p-0 hover:bg-transparent" {variant} {...restProps}>
  {label}
  <ArrowUpDown />
</Button>
