<script lang="ts">
  /**
   * Stats Card Component
   * Reusable card for displaying statistics with optional growth indicator
   */
  import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from "$lib/components/ui/card";

  type StatsCardProps = {
    title: string;
    value: string | number;
    description?: string;
    growth?: {
      value: number | string;
      isPositive: boolean;
    };
    variant?: "default" | "success" | "warning";
  };

  let {
    title,
    value,
    description,
    growth,
    variant = "default",
  }: StatsCardProps = $props();

  const descriptionClass = $derived(() => {
    if (growth) {
      return growth.isPositive ? "text-green-600" : "text-red-600";
    }
    return "";
  });
</script>

<Card>
  <CardHeader>
    <CardTitle>{title}</CardTitle>
    {#if description || growth}
      <CardDescription class={descriptionClass()}>
        {#if growth}
          <span class="inline-block">
            {growth.isPositive ? "+" : ""}{growth.value} del periodo anterior
          </span>
          <span class="ml-1">
            {growth.isPositive ? "↑" : "↓"}
          </span>
        {:else}
          {description}
        {/if}
      </CardDescription>
    {/if}
  </CardHeader>
  <CardContent>
    <div class="text-2xl font-bold">{value}</div>
  </CardContent>
</Card>
