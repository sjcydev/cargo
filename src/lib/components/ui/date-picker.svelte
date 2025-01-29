<script lang="ts">
  import { Calendar } from "./calendar";
  import { Button } from "./button";
  import { Popover, PopoverContent, PopoverTrigger } from "./popover";
  import {
    getLocalTimeZone,
    type DateValue,
    today,
  } from "@internationalized/date";
  import { cn } from "$lib/utils";
  import { CalendarIcon } from "lucide-svelte";
  import DateWithYear from "./date-with-year.svelte";

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
    <PopoverTrigger>
      <Button
        id="date"
        variant={"outline"}
        class={cn(
          "w-full justify-start text-left font-normal",
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
      </Button>
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
