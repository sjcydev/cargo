<script lang="ts">
  import { Skeleton } from '$lib/components/ui/skeleton';
</script>

<!-- Search Bar Skeleton -->
<div class="mb-4">
  <Skeleton class="h-12 w-full rounded-xl" />
</div>

<!-- Tabs Skeleton -->
<div class="flex gap-2 mb-6 border-b border-gray-200">
  <Skeleton class="h-10 w-24 rounded-t-lg" />
  <Skeleton class="h-10 w-24 rounded-t-lg" />
  <Skeleton class="h-10 w-32 rounded-t-lg" />
</div>

<!-- Package Cards Skeleton -->
<div class="space-y-3">
  {#each Array(5) as _}
    <div class="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
      <div class="flex items-start gap-3">
        <Skeleton class="h-12 w-12 rounded-xl flex-shrink-0" />
        <div class="flex-1 space-y-2">
          <div class="flex items-start justify-between">
            <Skeleton class="h-5 w-40" />
            <Skeleton class="h-6 w-20 rounded-full" />
          </div>
          <Skeleton class="h-4 w-56" />
          <div class="flex gap-4 mt-2">
            <Skeleton class="h-4 w-20" />
            <Skeleton class="h-4 w-24" />
          </div>
        </div>
      </div>
    </div>
  {/each}
</div>
