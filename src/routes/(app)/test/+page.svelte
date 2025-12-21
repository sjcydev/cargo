<svelte:options runes={true} />

<script lang="ts">
  // Temporary test page to verify app (client portal) route group works
  // This file will be deleted after testing
  // Should be accessible at /test
</script>

<div class="p-8">
  <h1 class="text-2xl font-bold mb-4">Client Portal Route Group Test</h1>
  <p class="text-gray-600">
    If you can see this page at <code class="bg-gray-100 px-2 py-1 rounded">/test</code>,
    the client portal route group is working correctly.
  </p>
  <div class="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
    <p class="text-blue-800 font-semibold">✓ Client portal route group is configured correctly</p>
  </div>
</div>
