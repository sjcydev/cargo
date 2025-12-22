<script lang="ts">
  import { Skeleton } from '$lib/components/ui/skeleton';
</script>

<!-- Greeting Skeleton -->
<div class="mb-6">
  <Skeleton class="h-8 w-64 rounded-lg mb-2" />
  <Skeleton class="h-4 w-32" />
</div>

<!-- Summary Cards Skeleton -->
<div class="grid grid-cols-2 gap-3 mb-8">
  {#each Array(4) as _}
    <div class="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
      <Skeleton class="h-12 w-12 rounded-xl mb-3" />
      <Skeleton class="h-8 w-16 mb-2" />
      <Skeleton class="h-4 w-24" />
    </div>
  {/each}
</div>

<!-- Recent Activity Skeleton -->
<div class="mb-4">
  <Skeleton class="h-6 w-40 rounded-lg" />
</div>

<div class="space-y-3">
  {#each Array(3) as _}
    <div class="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
      <div class="flex items-start gap-3">
        <Skeleton class="h-12 w-12 rounded-xl flex-shrink-0" />
        <div class="flex-1 space-y-2">
          <Skeleton class="h-5 w-32" />
          <Skeleton class="h-4 w-48" />
          <div class="flex gap-4 mt-2">
            <Skeleton class="h-4 w-16" />
            <Skeleton class="h-4 w-20" />
          </div>
        </div>
      </div>
    </div>
  {/each}
</div>
