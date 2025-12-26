<svelte:options runes={true} />

<script lang="ts">
  // Temporary test page to verify admin route group works
  // This file will be deleted after testing
  // Should be accessible at /admin/test
</script>

<div class="p-8">
  <h1 class="text-2xl font-bold mb-4">Admin Route Group Test</h1>
  <p class="text-gray-600">
    If you can see this page at <code class="bg-gray-100 px-2 py-1 rounded">/admin/test</code>,
    the admin route group is working correctly.
  </p>
  <div class="mt-4 p-4 bg-green-50 border border-green-200 rounded">
    <p class="text-green-800 font-semibold">✓ Admin route group is configured correctly</p>
  </div>
</div>
