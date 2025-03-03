<script>
  import { ScrollArea } from "$lib/components/ui/scroll-area";

  let { children } = $props();
</script>

<ScrollArea class="h-full w-full">
  {@render children?.()}
</ScrollArea>
