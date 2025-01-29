<!-- Date Range Picker using shadcn-svelte components -->
<script lang="ts">
  import { RangeCalendar } from "./range-calendar";
  import { Popover, PopoverContent, PopoverTrigger } from "./popover";
  import { getLocalTimeZone, type DateValue } from "@internationalized/date";
  import { cn } from "$lib/utils";
  import { CalendarIcon } from "lucide-svelte";
  import type { DateRange } from "bits-ui";
  import { buttonVariants } from "./button";

  let {
    value = $bindable(),
    className = "",
  }: {
    value: DateRange;
    className?: string;
  } = $props();

  let isOpen = $state(false);

  function formatDate(date: DateValue) {
    return date.toDate(getLocalTimeZone()).toLocaleDateString("en-GB");
  }
</script>

<div class={cn("grid gap-2", className)}>
  <Popover bind:open={isOpen}>
    <PopoverTrigger
      id="date"
      class={cn(
        buttonVariants({
          variant: "outline",
          class: "w-[300px] justify-start text-left font-normal",
        }),
        !value && "text-muted-foreground"
      )}
    >
      <CalendarIcon class="mr-2 h-4 w-4" />
      {#if value?.start}
        <span>
          {formatDate(value.start)}
          {value.end ? ` - ${formatDate(value.end)}` : ""}
        </span>
      {:else}
        <span>Pick a date range</span>
      {/if}
    </PopoverTrigger>
    <PopoverContent class="w-auto p-0" align="start">
      <RangeCalendar
        bind:value
        numberOfMonths={2}
        onValueChange={(date) => {
          if (date.start && date.end) {
            isOpen = false;
          }
        }}
      />
    </PopoverContent>
  </Popover>
</div>
