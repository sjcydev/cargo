<script lang="ts">
  import * as Popover from "$lib/components/ui/popover";
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { ScrollArea } from "$lib/components/ui/scroll-area";
  import { Check, ChevronsUpDown } from "lucide-svelte";
  import { cn } from "$lib/utils";
  import countries from "world-countries";

  // Transform countries data to get calling codes
  const countryOptions = countries
    .map((country) => {
      const callingCode =
        country.idd.suffixes && country.idd.suffixes.length === 1
          ? country.idd.root + country.idd.suffixes[0]
          : country.idd.root || "";

      return {
        name: country.name.common,
        flag: country.flag,
        callingCode,
        cca2: country.cca2,
      };
    })
    .filter((c) => c.callingCode) // Only countries with calling codes
    .sort((a, b) => a.name.localeCompare(b.name));

  let {
    value = $bindable(),
    onCodeChange,
  }: {
    value: string;
    onCodeChange?: (callingCode: string) => void;
  } = $props();

  let open = $state(false);
  let searchQuery = $state("");

  // Get selected country object based on calling code
  const selectedCountry = $derived(
    countryOptions.find((c) => c.callingCode === value) ||
    countryOptions.find((c) => c.cca2 === "PA") // Default to Panama
  );

  // Filter countries based on search query
  const filteredCountries = $derived(
    countryOptions.filter(
      (country) =>
        country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        country.callingCode.includes(searchQuery)
    )
  );

  function handleSelect(country: typeof countryOptions[0]) {
    value = country.callingCode;
    if (onCodeChange) {
      onCodeChange(country.callingCode);
    }
    open = false;
    searchQuery = "";
  }
</script>

<Popover.Root bind:open>
  <Popover.Trigger>
    {#snippet child({ props })}
      <Button
        {...props}
        variant="outline"
        role="combobox"
        aria-expanded={open}
        class="w-[140px] justify-between"
      >
        {#if selectedCountry}
          <span class="flex items-center gap-2">
            <span class="text-lg">{selectedCountry.flag}</span>
            <span class="font-mono">{selectedCountry.callingCode}</span>
          </span>
        {:else}
          <span class="text-muted-foreground">Código</span>
        {/if}
        <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
    {/snippet}
  </Popover.Trigger>
  <Popover.Content class="w-[300px] p-0" align="start">
    <div class="flex flex-col">
      <div class="border-b p-2">
        <Input
          type="text"
          placeholder="Buscar país..."
          bind:value={searchQuery}
          class="h-9"
        />
      </div>
      <ScrollArea class="h-[300px]">
        <div class="p-1">
          {#if filteredCountries.length === 0}
            <div class="py-6 text-center text-sm text-muted-foreground">
              No se encontró el país.
            </div>
          {:else}
            {#each filteredCountries as country}
              <button
                type="button"
                class="relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                onclick={() => handleSelect(country)}
              >
                <Check
                  class={cn(
                    "mr-2 h-4 w-4",
                    value === country.callingCode ? "opacity-100" : "opacity-0"
                  )}
                />
                <span class="flex items-center gap-2 flex-1">
                  <span class="text-lg">{country.flag}</span>
                  <span class="flex-1 text-left">{country.name}</span>
                  <span class="text-muted-foreground text-xs font-mono"
                    >{country.callingCode}</span
                  >
                </span>
              </button>
            {/each}
          {/if}
        </div>
      </ScrollArea>
    </div>
  </Popover.Content>
</Popover.Root>
