<script lang="ts">
  import AppSidebar from "$lib/components/Navbar.svelte";
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";

  let { children, user, logo, companyName } = $props();
</script>

<Sidebar.Provider>
  <AppSidebar {user} logo={logo} companyName={companyName} />
  <Sidebar.Inset>
    {@render children()}
  </Sidebar.Inset>
</Sidebar.Provider>
