<script lang="ts" generics="TData , TValue">
  import type {
    PaginationState,
    SortingState,
    ColumnFiltersState,
    ColumnDef,
    VisibilityState,
    RowSelectionState,
  } from "@tanstack/table-core";
  import {
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    getFilteredRowModel,
  } from "@tanstack/table-core";
  import {
    createSvelteTable,
    FlexRender,
  } from "$lib/components/ui/data-table/index.js";
  import * as Table from "$lib/components/ui/table/index.js";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import { page } from "$app/state";
  import { goto } from "$app/navigation";
  import type { Snippet } from "svelte";

  type TDataFactura = Partial<TData> & {
    facturaId: number;
  };

  type DataTableProps<TData, TValue> = {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    actions?: Snippet;
    enableSelection?: boolean;
    selectionChange?: (selected: number[]) => void;
    showTotal?: boolean;
    onRowClick?: (row: TData) => void;
    headerless?: boolean;
    showPagination?: boolean;
  };

  let {
    data,
    columns,
    actions,
    enableSelection = false,
    selectionChange,
    showTotal = false,
    onRowClick,
    headerless = false,
    showPagination = true,
  }: DataTableProps<TData, TValue> = $props();
  let pagination = $state<PaginationState>({ pageIndex: 0, pageSize: 10 });
  let sorting = $state<SortingState>([]);
  let columnFilters = $state<ColumnFiltersState>([]);
  let globalFilter = $state<any>(page.url.searchParams.get("search") ?? "");
  let columnVisibility = $state<VisibilityState>({});
  let rowSelection = $state<RowSelectionState>({});
  let currentTotal = $state(0);

  $effect(() => {
    if (enableSelection && selectionChange) {
      const selectedIds = Object.entries(rowSelection)
        .filter(([_, selected]) => selected)
        .map(([index]) => (data as TDataFactura[])[parseInt(index)].facturaId!);
      selectionChange(selectedIds);
    }
  });

  $effect(() => {
    if (showTotal) {
      const currentPageRows = table.getRowModel().rows;
      currentTotal = currentPageRows.reduce((sum, row) => {
        const total = (row.original as any).total;
        return sum + (typeof total === "number" ? total : 0);
      }, 0);
    }
  });

  const table = createSvelteTable({
    get data() {
      return data;
    },
    columns,
    state: {
      get pagination() {
        return pagination;
      },
      get sorting() {
        return sorting;
      },
      get columnFilters() {
        return columnFilters;
      },
      get globalFilter() {
        return globalFilter;
      },
      get columnVisibility() {
        return columnVisibility;
      },
      get rowSelection() {
        return rowSelection;
      },
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    manualPagination: !showPagination,
    globalFilterFn: "includesString",
    onPaginationChange: (updater) => {
      if (typeof updater === "function") {
        pagination = updater(pagination);
      } else {
        pagination = updater;
      }
    },

    onSortingChange: (updater) => {
      if (typeof updater === "function") {
        sorting = updater(sorting);
      } else {
        sorting = updater;
      }
    },
    onColumnFiltersChange: (updater) => {
      if (typeof updater === "function") {
        columnFilters = updater(columnFilters);
      } else {
        columnFilters = updater;
      }
    },
    onGlobalFilterChange: (updater) => {
      if (typeof updater === "function") {
        globalFilter = updater(globalFilter);
      } else {
        globalFilter = updater;
      }
    },
    onColumnVisibilityChange: (updater) => {
      if (typeof updater === "function") {
        columnVisibility = updater(columnVisibility);
      } else {
        columnVisibility = updater;
      }
    },
    onRowSelectionChange: (updater) => {
      if (typeof updater === "function") {
        rowSelection = updater(rowSelection);
      } else {
        rowSelection = updater;
      }
    },
    enableRowSelection: enableSelection,
  });
  $effect(() => {
    const search = page.url.searchParams.get("search");
    table.setGlobalFilter(search);
  });

  const handleRowClick = (row: any, event: MouseEvent) => {
    // Check if the click was on a checkbox or action button
    const target = event.target as HTMLElement;
    const isCheckbox = target.closest('[role="checkbox"]');
    const isActionButton = target.closest("button") || target.closest("a");

    // Only trigger row click if not clicking checkbox or action button
    if (!isCheckbox && !isActionButton && onRowClick) {
      onRowClick(row.original);
    }
  };
</script>

{#if !headerless}
  <div class="flex items-center justify-between pb-4">
    <Input
      placeholder="Buscador"
      value={globalFilter}
      onchange={(e) => {
        table.setGlobalFilter(String(e.currentTarget.value));
        goto(`?search=${e.currentTarget.value}`);
      }}
      oninput={(e) => {
        table.setGlobalFilter(String(e.currentTarget.value));
      }}
      class="max-w-sm"
    />
    <div>
      {@render actions?.()}
      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          {#snippet child({ props })}
            <Button {...props} variant="outline" class="ml-auto"
              >Columnas</Button
            >
          {/snippet}
        </DropdownMenu.Trigger>
        <DropdownMenu.Content align="end">
          {#each table
            .getAllColumns()
            .filter((col) => col.getCanHide()) as column (column.id)}
            <DropdownMenu.CheckboxItem
              class="capitalize"
              checked={column.getIsVisible()}
              onCheckedChange={(value) => column.toggleVisibility(!!value)}
            >
              {column.id}
            </DropdownMenu.CheckboxItem>
          {/each}
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </div>
  </div>
{/if}
<div class="rounded-md border">
  <Table.Root>
    <Table.Header>
      {#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
        <Table.Row>
          {#each headerGroup.headers as header (header.id)}
            <Table.Head>
              {#if !header.isPlaceholder}
                <FlexRender
                  content={header.column.columnDef.header}
                  context={header.getContext()}
                />
              {/if}
            </Table.Head>
          {/each}
        </Table.Row>
      {/each}
    </Table.Header>
    <Table.Body>
      {#each table.getRowModel().rows as row (row.id)}
        <Table.Row
          data-state={row.getIsSelected() && "selected"}
          onclick={(e) => handleRowClick(row, e)}
          role="button"
          class="cursor-pointer"
        >
          {#each row.getVisibleCells() as cell (cell.id)}
            <Table.Cell>
              <FlexRender
                content={cell.column.columnDef.cell}
                context={cell.getContext()}
              />
            </Table.Cell>
          {/each}
        </Table.Row>
      {:else}
        <Table.Row>
          <Table.Cell colspan={columns.length} class="h-24 text-center">
            0 resultados
          </Table.Cell>
        </Table.Row>
      {/each}
    </Table.Body>
  </Table.Root>
</div>
{#if showTotal && currentTotal > 0}
  <div class="flex justify-end mt-2 text-md font-medium">
    Total: ${currentTotal.toFixed(2)}
  </div>
{/if}

{#if showPagination}
<div class="flex items-center justify-end space-x-2 py-4">
  <Button
    variant="outline"
    size="sm"
    onclick={() => table.previousPage()}
    disabled={!table.getCanPreviousPage()}
  >
    Previous
  </Button>
  <Button
    variant="outline"
    size="sm"
    onclick={() => table.nextPage()}
    disabled={!table.getCanNextPage()}
  >
    Next
  </Button>
</div>
{/if}
