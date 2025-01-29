<script lang="ts">
  import { Popover, PopoverContent, PopoverTrigger } from "./popover";
  import {
    getLocalTimeZone,
    type DateValue,
    today,
  } from "@internationalized/date";
  import { cn } from "$lib/utils";
  import { CalendarIcon } from "lucide-svelte";
  import DateWithYear from "./date-with-year.svelte";
  import { buttonVariants } from "./button";

  let {
    value = $bindable(),
    className = "",
  }: {
    value: DateValue;
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
          class: "w-full justify-start text-left font-normal",
        }),
        !value && "text-muted-foreground"
      )}
    >
      <CalendarIcon class="mr-2 h-4 w-4" />
      {#if value}
        <span>
          {formatDate(value)}
        </span>
      {:else}
        <span>Selecciona una fecha</span>
      {/if}
    </PopoverTrigger>
    <PopoverContent class="w-full p-0 " align="start">
      <DateWithYear
        type="single"
        bind:value
        maxValue={today(getLocalTimeZone())}
        onValueChange={(date) => {
          if (date) {
            isOpen = false;
          }
        }}
      />
    </PopoverContent>
  </Popover>
</div>
