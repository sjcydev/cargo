<script lang="ts">
  /**
   * Chart Card Component
   * Wrapper for charts with consistent styling
   */
  import { Card, CardContent, CardHeader, CardTitle } from "$lib/components/ui/card";

  type ChartCardProps = {
    title: string;
    chartId: string;
    height?: string;
  };

  let { title, chartId, height = "auto" }: ChartCardProps = $props();
</script>

<Card>
  <CardHeader>
    <CardTitle>{title}</CardTitle>
  </CardHeader>
  <CardContent class={height !== "auto" ? height : ""}>
    <div id={chartId} class="w-full h-full"></div>
  </CardContent>
</Card>
