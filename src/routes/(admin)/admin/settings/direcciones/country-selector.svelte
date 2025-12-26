<script lang="ts">
  import * as Popover from "$lib/components/ui/popover";
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { ScrollArea } from "$lib/components/ui/scroll-area";
  import { Check, ChevronsUpDown } from "lucide-svelte";
  import { cn } from "$lib/utils";
  import countries from "world-countries";

  // Transform countries data
  const countryOptions = countries
    .map((country) => {
      // If there's exactly 1 suffix, it's part of the country code (e.g., Panama: +5 + 07 = +507)
      // If there are multiple suffixes, they're area codes, so just use the root (e.g., USA: +1)
      const callingCode =
        country.idd.suffixes && country.idd.suffixes.length === 1
          ? country.idd.root + country.idd.suffixes[0]
          : country.idd.root || "";

      return {
        value: country.name.common,
        label: country.name.common,
        flag: country.flag,
        callingCode,
        cca2: country.cca2,
      };
    })
    .sort((a, b) => a.label.localeCompare(b.label));

  let {
    value = $bindable(),
    onCountryChange,
  }: {
    value: string;
    onCountryChange?: (callingCode: string) => void;
  } = $props();

  let open = $state(false);
  let searchQuery = $state("");

  // Get selected country object - use case-insensitive matching
  const selectedCountry = $derived(
    countryOptions.find((c) => c.value.toLowerCase() === value?.toLowerCase())
  );

  // Filter countries based on search query
  const filteredCountries = $derived(
    countryOptions.filter((country) =>
      country.label.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  function handleSelect(country: typeof countryOptions[0]) {
    value = country.value;
    if (onCountryChange) {
      onCountryChange(country.callingCode);
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
        class="w-full justify-between"
      >
        {#if selectedCountry}
          <span class="flex items-center gap-2">
            <span class="text-lg">{selectedCountry.flag}</span>
            {selectedCountry.label}
          </span>
        {:else}
          Seleccionar país...
        {/if}
        <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
    {/snippet}
  </Popover.Trigger>
  <Popover.Content class="w-[400px] p-0" align="start">
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
                    value?.toLowerCase() === country.value.toLowerCase() ? "opacity-100" : "opacity-0"
                  )}
                />
                <span class="flex items-center gap-2">
                  <span class="text-lg">{country.flag}</span>
                  <span class="flex-1 text-left">{country.label}</span>
                  <span class="text-muted-foreground text-xs"
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
