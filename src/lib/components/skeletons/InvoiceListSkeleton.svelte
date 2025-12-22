<script lang="ts">
  import { Skeleton } from '$lib/components/ui/skeleton';
</script>

<!-- Search Bar Skeleton -->
<div class="mb-4">
  <Skeleton class="h-12 w-full rounded-xl" />
</div>

<!-- Filter Tabs Skeleton -->
<div class="flex gap-2 mb-6">
  <Skeleton class="h-10 w-20 rounded-lg" />
  <Skeleton class="h-10 w-28 rounded-lg" />
  <Skeleton class="h-10 w-24 rounded-lg" />
</div>

<!-- Invoice Cards Skeleton -->
<div class="space-y-3">
  {#each Array(4) as _}
    <div class="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
      <div class="flex items-start justify-between mb-3">
        <div class="space-y-2 flex-1">
          <Skeleton class="h-6 w-32" />
          <Skeleton class="h-4 w-40" />
        </div>
        <Skeleton class="h-6 w-20 rounded-full" />
      </div>
      <div class="flex items-center justify-between pt-3 border-t border-gray-100">
        <Skeleton class="h-5 w-24" />
        <Skeleton class="h-4 w-16" />
      </div>
    </div>
  {/each}
</div>
