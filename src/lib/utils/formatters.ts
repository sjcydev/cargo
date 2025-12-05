/**
 * Formatting Utilities
 * Common formatting functions used across the application
 */

/**
 * Format a number as currency (USD)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-PA", {
    style: "currency",
    currency: "USD",
    currencyDisplay: "narrowSymbol",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format a date to a localized string
 */
export function formatDate(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("es-PA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(dateObj);
}

/**
 * Format a date to short format (MM/DD/YYYY)
 */
export function formatDateShort(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("es-PA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(dateObj);
}

/**
 * Calculate growth percentage
 */
export function calculateGrowthPercentage(
  current: number,
  previous: number
): string {
  if (previous === 0) return current > 0 ? "100" : "0";
  const growth = ((current - previous) / previous) * 100;
  return growth.toFixed(1);
}

/**
 * Format number with commas
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat("es-PA").format(num);
}

/**
 * Parse tracking numbers from file content
 */
export function parseTrackingNumbers(
  content: string,
  fileExtension: string
): string[] {
  let trackingNumbers: string[];

  if (fileExtension === ".csv") {
    // Parse CSV - handle comma or semicolon separated values
    trackingNumbers = content
      .split(/\r?\n/)
      .flatMap((line) => line.split(/[,;]/))
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  } else {
    // Parse plain text - one tracking per line
    trackingNumbers = content
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
  }

  // Remove duplicates
  return [...new Set(trackingNumbers)];
}
