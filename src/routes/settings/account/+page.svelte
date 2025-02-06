<script lang="ts">
  import type { PageData } from "./$types";
  import { Separator } from "$lib/components/ui/separator";
  import ProfileForm from "./profile-form.svelte";

  let { data }: { data: PageData } = $props();
</script>

<div class="space-y-6">
  <div>
    <h3 class="text-xl font-medium">Detalles Personales</h3>
    <p class="text-muted-foreground text-sm">
      Aqui puedes modificar tus detalles personales.
    </p>
  </div>
  <Separator />
  <ProfileForm data={data.form} user={data.user!} />
</div>
