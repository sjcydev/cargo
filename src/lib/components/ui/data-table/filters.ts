import type { FilterFn } from "@tanstack/table-core";
import { normalizeString } from "$lib/utils";

/**
 * Accent-insensitive and case-insensitive filter function for TanStack Table
 * Normalizes both the cell value and filter value before comparison
 * Handles null/undefined values gracefully
 */
export const accentInsensitiveFilter: FilterFn<any> = (
  row,
  columnId,
  filterValue,
) => {
  const value = row.getValue(columnId);
  if (value == null) return false;

  const valueNormalized = normalizeString(String(value));
  const filterNormalized = normalizeString(String(filterValue));

  return valueNormalized.includes(filterNormalized);
};
